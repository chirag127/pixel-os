/**
 * Pixelate Tool
 * Apply pixelation effect
 */

import { createToolLayout, ToolLayout } from '../../components/ToolLayout';

let toolLayout: ToolLayout | null = null;
let currentFile: File | null = null;
let pixelSize = 10;
let fullImage = true;
let regionX = 25;
let regionY = 25;
let regionW = 50;
let regionH = 50;

export default function render(container: HTMLElement) {
  toolLayout = createToolLayout(container, {
    id: 'pixelate',
    title: 'Pixelate',
    description: 'Apply mosaic/pixelation effect',
    onFileSelect: handleFileSelect,
    renderControls: renderControls,
    seoContent: `<h2>Pixelate Images</h2><p>Apply a mosaic pixelation effect to entire images or selected regions for privacy or artistic effect.</p>`
  });
}

function handleFileSelect(file: File) { currentFile = file; }

function renderControls(container: HTMLElement) {
  container.innerHTML = `
    <div class="control-group">
      <label class="control-label">Pixel Size: <span id="pixel-value">${pixelSize}px</span></label>
      <input type="range" class="slider" id="pixel-slider" min="2" max="50" value="${pixelSize}" step="2"/>
    </div>
    <div class="control-group">
      <label class="checkbox-label">
        <input type="checkbox" id="full-image" ${fullImage ? 'checked' : ''}/>
        <span>Pixelate entire image</span>
      </label>
    </div>
    <div id="region-controls" style="${fullImage ? 'display: none;' : ''}">
      <div class="control-group">
        <label class="control-label">Region X: <span id="rx-value">${regionX}%</span></label>
        <input type="range" class="slider" id="rx-slider" min="0" max="100" value="${regionX}"/>
      </div>
      <div class="control-group">
        <label class="control-label">Region Y: <span id="ry-value">${regionY}%</span></label>
        <input type="range" class="slider" id="ry-slider" min="0" max="100" value="${regionY}"/>
      </div>
      <div class="control-group">
        <label class="control-label">Width: <span id="rw-value">${regionW}%</span></label>
        <input type="range" class="slider" id="rw-slider" min="5" max="100" value="${regionW}"/>
      </div>
      <div class="control-group">
        <label class="control-label">Height: <span id="rh-value">${regionH}%</span></label>
        <input type="range" class="slider" id="rh-slider" min="5" max="100" value="${regionH}"/>
      </div>
    </div>
  `;

  addPixelateStyles();

  const pixelSlider = container.querySelector('#pixel-slider') as HTMLInputElement;
  const fullImageCheck = container.querySelector('#full-image') as HTMLInputElement;
  const regionControls = container.querySelector('#region-controls') as HTMLElement;

  pixelSlider.addEventListener('input', () => {
    pixelSize = parseInt(pixelSlider.value);
    (container.querySelector('#pixel-value') as HTMLElement).textContent = `${pixelSize}px`;
  });

  fullImageCheck.addEventListener('change', () => {
    fullImage = fullImageCheck.checked;
    regionControls.style.display = fullImage ? 'none' : 'block';
  });

  ['rx', 'ry', 'rw', 'rh'].forEach((id, idx) => {
    const slider = container.querySelector(`#${id}-slider`) as HTMLInputElement;
    slider.addEventListener('input', () => {
      const val = parseInt(slider.value);
      if (idx === 0) regionX = val;
      else if (idx === 1) regionY = val;
      else if (idx === 2) regionW = val;
      else regionH = val;
      (container.querySelector(`#${id}-value`) as HTMLElement).textContent = `${val}%`;
    });
  });

  toolLayout?.getProcessButton()?.addEventListener('click', processImage);
}

async function processImage() {
  if (!currentFile || !toolLayout) return;
  toolLayout.showLoading(true);

  try {
    const img = new Image();
    const imageURL = URL.createObjectURL(currentFile);
    await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; img.src = imageURL; });

    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);

    if (fullImage) {
      pixelate(ctx, 0, 0, canvas.width, canvas.height);
    } else {
      const x = (regionX / 100) * canvas.width;
      const y = (regionY / 100) * canvas.height;
      const w = (regionW / 100) * canvas.width;
      const h = (regionH / 100) * canvas.height;
      pixelate(ctx, x, y, w, h);
    }

    const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), 'image/png', 1.0));
    URL.revokeObjectURL(imageURL);
    toolLayout.showResult(blob);
    toolLayout.showLoading(false);
  } catch (error) {
    toolLayout.showError('Pixelation failed.');
    toolLayout.showLoading(false);
  }
}

function pixelate(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const imageData = ctx.getImageData(x, y, w, h);
  const data = imageData.data;

  for (let py = 0; py < h; py += pixelSize) {
    for (let px = 0; px < w; px += pixelSize) {
      // Sample center of pixel block
      const sampleIdx = ((py + Math.floor(pixelSize / 2)) * w + (px + Math.floor(pixelSize / 2))) * 4;
      const r = data[sampleIdx] || 0;
      const g = data[sampleIdx + 1] || 0;
      const b = data[sampleIdx + 2] || 0;

      // Fill pixel block with sampled color
      for (let by = 0; by < pixelSize && py + by < h; by++) {
        for (let bx = 0; bx < pixelSize && px + bx < w; bx++) {
          const idx = ((py + by) * w + (px + bx)) * 4;
          data[idx] = r;
          data[idx + 1] = g;
          data[idx + 2] = b;
        }
      }
    }
  }

  ctx.putImageData(imageData, x, y);
}

function addPixelateStyles() {
  if (document.querySelector('#pixelate-styles')) return;
  const styles = document.createElement('style');
  styles.id = 'pixelate-styles';
  styles.textContent = `
    .checkbox-label { display: flex; align-items: center; gap: var(--spacing-sm); cursor: pointer; }
    .checkbox-label input { width: 18px; height: 18px; }
  `;
  document.head.appendChild(styles);
}
