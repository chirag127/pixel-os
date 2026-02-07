/**
 * Collage Maker Tool
 * Grid layout for multiple images
 */

let images: File[] = [];
let columns = 2;
let gap = 10;

export default function render(container: HTMLElement) {
  container.innerHTML = `
    <div class="tool-page animate-fade-in">
      <header class="tool-header">
        <a href="#/" class="tool-back-btn">←</a>
        <div>
          <h1 class="tool-title">Collage Maker</h1>
          <p style="color: var(--color-text-muted); font-size: var(--text-sm);">Create photo grids</p>
        </div>
      </header>

      <div class="collage-workspace">
        <div class="collage-upload glass-card">
          <div class="dropzone" id="dropzone">
            <span style="font-size: 3rem;">🖼️</span>
            <p>Drop images here (2-9 images)</p>
            <p style="font-size: var(--text-xs); color: var(--color-text-muted);">Selected: <span id="count">0</span> images</p>
          </div>
          <input type="file" id="file-input" accept="image/*" multiple style="display: none;"/>
        </div>

        <div class="collage-controls glass-card">
          <div class="control-group">
            <label class="control-label">Columns: <span id="cols-value">${columns}</span></label>
            <input type="range" class="slider" id="cols-slider" min="1" max="4" value="${columns}" step="1"/>
          </div>
          <div class="control-group">
            <label class="control-label">Gap: <span id="gap-value">${gap}px</span></label>
            <input type="range" class="slider" id="gap-slider" min="0" max="30" value="${gap}" step="2"/>
          </div>
          <button class="btn btn-primary" id="create-btn" disabled>Create Collage</button>
          <button class="btn btn-secondary" id="download-btn" disabled>Download</button>
        </div>

        <div class="collage-preview glass-card" id="preview"></div>
      </div>
    </div>
  `;

  addCollageStyles();
  setupEventListeners(container);
}

function setupEventListeners(container: HTMLElement) {
  const dropzone = container.querySelector('#dropzone') as HTMLElement;
  const fileInput = container.querySelector('#file-input') as HTMLInputElement;
  const colsSlider = container.querySelector('#cols-slider') as HTMLInputElement;
  const gapSlider = container.querySelector('#gap-slider') as HTMLInputElement;
  const createBtn = container.querySelector('#create-btn') as HTMLButtonElement;
  const downloadBtn = container.querySelector('#download-btn') as HTMLButtonElement;
  const countEl = container.querySelector('#count') as HTMLSpanElement;
  let resultBlob: Blob | null = null;

  dropzone.addEventListener('click', () => fileInput.click());
  dropzone.addEventListener('dragover', (e) => { e.preventDefault(); });
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    if (e.dataTransfer?.files) {
      images = Array.from(e.dataTransfer.files).slice(0, 9);
      countEl.textContent = String(images.length);
      createBtn.disabled = images.length < 2;
    }
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files) {
      images = Array.from(fileInput.files).slice(0, 9);
      countEl.textContent = String(images.length);
      createBtn.disabled = images.length < 2;
    }
  });

  colsSlider.addEventListener('input', () => {
    columns = parseInt(colsSlider.value);
    (container.querySelector('#cols-value') as HTMLSpanElement).textContent = String(columns);
  });

  gapSlider.addEventListener('input', () => {
    gap = parseInt(gapSlider.value);
    (container.querySelector('#gap-value') as HTMLSpanElement).textContent = `${gap}px`;
  });

  createBtn.addEventListener('click', async () => {
    createBtn.disabled = true;
    createBtn.textContent = 'Creating...';

    try {
      const loadedImages = await Promise.all(images.map(loadImage));
      const rows = Math.ceil(images.length / columns);
      const cellSize = 400;

      const canvas = document.createElement('canvas');
      canvas.width = columns * cellSize + (columns - 1) * gap;
      canvas.height = rows * cellSize + (rows - 1) * gap;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#1a1a24';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      loadedImages.forEach((img, i) => {
        const col = i % columns;
        const row = Math.floor(i / columns);
        const x = col * (cellSize + gap);
        const y = row * (cellSize + gap);

        // Cover fit
        const scale = Math.max(cellSize / img.width, cellSize / img.height);
        const sw = cellSize / scale;
        const sh = cellSize / scale;
        const sx = (img.width - sw) / 2;
        const sy = (img.height - sh) / 2;

        ctx.drawImage(img, sx, sy, sw, sh, x, y, cellSize, cellSize);
      });

      resultBlob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), 'image/png'));

      const preview = container.querySelector('#preview') as HTMLElement;
      const previewImg = document.createElement('img');
      previewImg.src = URL.createObjectURL(resultBlob);
      previewImg.style.maxWidth = '100%';
      preview.innerHTML = '';
      preview.appendChild(previewImg);

      downloadBtn.disabled = false;
    } catch (error) {
      console.error('Collage creation failed:', error);
    }

    createBtn.disabled = false;
    createBtn.textContent = 'Create Collage';
  });

  downloadBtn.addEventListener('click', () => {
    if (!resultBlob) return;
    const url = URL.createObjectURL(resultBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `collage-${Date.now()}.png`;
    a.click();
    URL.revokeObjectURL(url);
  });
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

function addCollageStyles() {
  if (document.querySelector('#collage-styles')) return;
  const styles = document.createElement('style');
  styles.id = 'collage-styles';
  styles.textContent = `
    .collage-workspace { display: flex; flex-direction: column; gap: var(--spacing-lg); }
    .collage-upload, .collage-controls, .collage-preview { padding: var(--spacing-lg); }
    .collage-controls { display: flex; flex-direction: column; gap: var(--spacing-md); }
    .collage-preview { min-height: 200px; display: flex; align-items: center; justify-content: center; }
    .dropzone { width: 100%; min-height: 150px; display: flex; flex-direction: column; align-items: center; justify-content: center;
      border: 2px dashed rgba(255,255,255,0.2); border-radius: var(--radius-lg); cursor: pointer; text-align: center; }
    .dropzone:hover { border-color: var(--accent-blue); }
    @media (min-width: 1024px) { .collage-workspace { flex-direction: row; flex-wrap: wrap; }
      .collage-upload { flex: 1; min-width: 300px; } .collage-controls { width: 280px; } .collage-preview { flex: 100%; } }
  `;
  document.head.appendChild(styles);
}
