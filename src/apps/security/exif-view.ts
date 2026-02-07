/**
 * EXIF View Tool
 * Display image metadata
 */


export default function render(container: HTMLElement) {
  container.innerHTML = `
    <div class="tool-page animate-fade-in">
      <header class="tool-header">
        <a href="#/" class="tool-back-btn">←</a>
        <div>
          <h1 class="tool-title">View EXIF</h1>
          <p style="color: var(--color-text-muted); font-size: var(--text-sm);">View image metadata</p>
        </div>
      </header>

      <div class="exif-workspace">
        <div class="exif-upload glass-card">
          <div class="dropzone" id="dropzone">
            <span style="font-size: 3rem;">📋</span>
            <p>Drop an image to view its EXIF data</p>
          </div>
          <input type="file" id="file-input" accept="image/*" style="display: none;"/>
        </div>

        <div class="exif-data glass-card" id="exif-container" style="display: none;">
          <h3>Image Metadata</h3>
          <div id="exif-content"></div>
        </div>
      </div>
    </div>
  `;

  addExifStyles();
  setupEventListeners(container);
}

function setupEventListeners(container: HTMLElement) {
  const dropzone = container.querySelector('#dropzone') as HTMLElement;
  const fileInput = container.querySelector('#file-input') as HTMLInputElement;

  dropzone.addEventListener('click', () => fileInput.click());
  dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
  dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    if (e.dataTransfer?.files[0]) handleFile(e.dataTransfer.files[0], container);
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files?.[0]) handleFile(fileInput.files[0], container);
  });
}

async function handleFile(file: File, container: HTMLElement) {
  const exifContainer = container.querySelector('#exif-container') as HTMLElement;
  const exifContent = container.querySelector('#exif-content') as HTMLElement;

  exifContainer.style.display = 'block';
  exifContent.innerHTML = '<p>Loading metadata...</p>';

  try {
    // Basic file info (always available)
    const basicInfo: Record<string, string> = {
      'File Name': file.name,
      'File Size': formatSize(file.size),
      'File Type': file.type,
      'Last Modified': new Date(file.lastModified).toLocaleString()
    };

    // Get image dimensions
    const img = new Image();
    const imageURL = URL.createObjectURL(file);
    await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; img.src = imageURL; });

    basicInfo['Dimensions'] = `${img.width} × ${img.height} pixels`;
    basicInfo['Aspect Ratio'] = getAspectRatio(img.width, img.height);
    basicInfo['Megapixels'] = ((img.width * img.height) / 1000000).toFixed(2) + ' MP';

    URL.revokeObjectURL(imageURL);

    // Try to read EXIF with exif-js (if available)
    let exifInfo: Record<string, string> = {};

    try {
      const arrayBuffer = await file.arrayBuffer();
      exifInfo = extractBasicExif(arrayBuffer);
    } catch (e) {
      console.log('EXIF extraction not available');
    }

    // Render metadata
    const allInfo = { ...basicInfo, ...exifInfo };
    exifContent.innerHTML = Object.entries(allInfo).map(([key, value]) =>
      `<div class="exif-row"><span class="exif-key">${key}</span><span class="exif-value">${value}</span></div>`
    ).join('');

  } catch (error) {
    exifContent.innerHTML = '<p style="color: var(--accent-orange);">Could not read image metadata.</p>';
  }
}

function extractBasicExif(buffer: ArrayBuffer): Record<string, string> {
  // Basic EXIF parsing for JPEG
  const data = new DataView(buffer);
  const result: Record<string, string> = {};

  // Check for JPEG
  if (data.getUint16(0) !== 0xFFD8) {
    return result; // Not a JPEG
  }

  // Look for EXIF marker
  let offset = 2;
  while (offset < data.byteLength) {
    const marker = data.getUint16(offset);
    if (marker === 0xFFE1) {
      // Found EXIF
      result['EXIF Data'] = 'Present (full parsing requires exif-js library)';
      break;
    }
    if ((marker & 0xFF00) !== 0xFF00) break;
    offset += 2 + data.getUint16(offset + 2);
  }

  return result;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function getAspectRatio(w: number, h: number): string {
  const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
  const divisor = gcd(w, h);
  return `${w / divisor}:${h / divisor}`;
}

function addExifStyles() {
  if (document.querySelector('#exif-styles')) return;
  const styles = document.createElement('style');
  styles.id = 'exif-styles';
  styles.textContent = `
    .exif-workspace { display: flex; flex-direction: column; gap: var(--spacing-lg); }
    .exif-upload, .exif-data { padding: var(--spacing-lg); }
    .exif-data h3 { margin: 0 0 var(--spacing-lg); font-size: var(--text-lg); }
    .exif-row { display: flex; justify-content: space-between; padding: var(--spacing-sm) 0;
      border-bottom: 1px solid rgba(255,255,255,0.1); }
    .exif-key { font-weight: 500; color: var(--color-text-secondary); }
    .exif-value { color: var(--color-text-primary); text-align: right; }
    .dropzone { width: 100%; min-height: 150px; display: flex; flex-direction: column;
      align-items: center; justify-content: center; border: 2px dashed rgba(255,255,255,0.2);
      border-radius: var(--radius-lg); cursor: pointer; text-align: center; }
    .dropzone:hover, .dropzone.dragover { border-color: var(--accent-blue); }
    @media (min-width: 1024px) { .exif-workspace { flex-direction: row; } .exif-upload, .exif-data { flex: 1; } }
  `;
  document.head.appendChild(styles);
}
