/**
 * Crop Tool
 * Crop images with canvas-based cropping (mobile-friendly)
 */

import { createToolLayout, ToolLayout } from '../../components/ToolLayout';

let toolLayout: ToolLayout | null = null;
let currentFile: File | null = null;
let cropX = 10; // Percentage from left
let cropY = 10; // Percentage from top
let cropW = 80; // Percentage width
let cropH = 80; // Percentage height

const aspectPresets: Record<string, number | null> = {
  'free': null,
  '1:1': 1,
  '16:9': 16/9,
  '4:3': 4/3,
  '4:5': 4/5,
  '9:16': 9/16
};

let selectedAspect: number | null = null;

export default function render(container: HTMLElement) {
  toolLayout = createToolLayout(container, {
    id: 'crop',
    title: 'Crop Image',
    description: 'Crop images with aspect ratio presets',
    onFileSelect: handleFileSelect,
    renderControls: renderControls,
    seoContent: `<h2>Easy Image Cropping</h2><p>Crop your images with precision. Choose from preset aspect ratios or create custom crops.</p>`
  });
}

function handleFileSelect(file: File) { currentFile = file; }

function renderControls(container: HTMLElement) {
  container.innerHTML = `
    <div class="control-group">
      <label class="control-label">Aspect Ratio</label>
      <div class="aspect-buttons">
        ${Object.keys(aspectPresets).map(key =>
          `<button class="btn btn-secondary ${key === 'free' ? 'active' : ''}" data-aspect="${key}">${key}</button>`
        ).join('')}
      </div>
    </div>
    <div class="control-group">
      <label class="control-label">Left: <span id="x-value">${cropX}%</span></label>
      <input type="range" class="slider" id="x-slider" min="0" max="50" value="${cropX}" step="1"/>
    </div>
    <div class="control-group">
      <label class="control-label">Top: <span id="y-value">${cropY}%</span></label>
      <input type="range" class="slider" id="y-slider" min="0" max="50" value="${cropY}" step="1"/>
    </div>
    <div class="control-group">
      <label class="control-label">Width: <span id="w-value">${cropW}%</span></label>
      <input type="range" class="slider" id="w-slider" min="10" max="100" value="${cropW}" step="1"/>
    </div>
    <div class="control-group">
      <label class="control-label">Height: <span id="h-value">${cropH}%</span></label>
      <input type="range" class="slider" id="h-slider" min="10" max="100" value="${cropH}" step="1"/>
    </div>
  `;

  addCropStyles();

  const xSlider = container.querySelector('#x-slider') as HTMLInputElement;
  const ySlider = container.querySelector('#y-slider') as HTMLInputElement;
  const wSlider = container.querySelector('#w-slider') as HTMLInputElement;
  const hSlider = container.querySelector('#h-slider') as HTMLInputElement;

  xSlider.addEventListener('input', () => {
    cropX = parseInt(xSlider.value);
    (container.querySelector('#x-value') as HTMLElement).textContent = `${cropX}%`;
  });

  ySlider.addEventListener('input', () => {
    cropY = parseInt(ySlider.value);
    (container.querySelector('#y-value') as HTMLElement).textContent = `${cropY}%`;
  });

  wSlider.addEventListener('input', () => {
    cropW = parseInt(wSlider.value);
    (container.querySelector('#w-value') as HTMLElement).textContent = `${cropW}%`;
    if (selectedAspect) adjustHeightForAspect();
  });

  hSlider.addEventListener('input', () => {
    cropH = parseInt(hSlider.value);
    (container.querySelector('#h-value') as HTMLElement).textContent = `${cropH}%`;
  });

  container.querySelectorAll('[data-aspect]').forEach(btn => {
    btn.addEventListener('click', () => {
      const aspectKey = (btn as HTMLElement).dataset.aspect!;
      selectedAspect = aspectPresets[aspectKey];
      container.querySelectorAll('[data-aspect]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (selectedAspect) adjustHeightForAspect();
    });
  });

  toolLayout?.getProcessButton()?.addEventListener('click', processImage);
}

function adjustHeightForAspect() {
  if (!selectedAspect || !currentFile) return;
  // Height based on width and aspect ratio
  const newH = Math.round(cropW / selectedAspect);
  cropH = Math.min(100, newH);
  const hSlider = document.querySelector('#h-slider') as HTMLInputElement;
  const hValue = document.querySelector('#h-value') as HTMLElement;
  if (hSlider) hSlider.value = String(cropH);
  if (hValue) hValue.textContent = `${cropH}%`;
}

async function processImage() {
  if (!currentFile || !toolLayout) return;
  toolLayout.showLoading(true);

  try {
    const img = new Image();
    const imageURL = URL.createObjectURL(currentFile);
    await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; img.src = imageURL; });

    // Calculate crop coordinates
    const sx = (cropX / 100) * img.width;
    const sy = (cropY / 100) * img.height;
    const sw = (cropW / 100) * img.width;
    const sh = (cropH / 100) * img.height;

    const canvas = document.createElement('canvas');
    canvas.width = sw;
    canvas.height = sh;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

    const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), 'image/png', 1.0));
    URL.revokeObjectURL(imageURL);
    toolLayout.showResult(blob);
    toolLayout.showLoading(false);
  } catch (error) {
    toolLayout.showError('Crop failed.');
    toolLayout.showLoading(false);
  }
}

function addCropStyles() {
  if (document.querySelector('#crop-styles')) return;
  const styles = document.createElement('style');
  styles.id = 'crop-styles';
  styles.textContent = `
    .aspect-buttons { display: flex; flex-wrap: wrap; gap: var(--spacing-xs); margin-top: var(--spacing-xs); }
    .aspect-buttons .btn { padding: var(--spacing-xs) var(--spacing-sm); font-size: var(--text-xs); }
    .aspect-buttons .btn.active { background: var(--accent-gradient); color: white; }
  `;
  document.head.appendChild(styles);
}
