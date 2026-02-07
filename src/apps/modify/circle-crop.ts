/**
 * Circle Crop Tool
 * Create circular profile pictures
 */

import { createToolLayout, ToolLayout } from '../../components/ToolLayout';

let toolLayout: ToolLayout | null = null;
let currentFile: File | null = null;
let size = 400;

export default function render(container: HTMLElement) {
  toolLayout = createToolLayout(container, {
    id: 'circle-crop',
    title: 'Circle Crop',
    description: 'Create round profile pictures',
    onFileSelect: handleFileSelect,
    renderControls: renderControls,
    seoContent: `<h2>Circle Crop for Profile Pictures</h2><p>Create perfectly round profile pictures for social media. Outputs a transparent PNG.</p>`
  });
}

function handleFileSelect(file: File) { currentFile = file; }

function renderControls(container: HTMLElement) {
  container.innerHTML = `
    <div class="control-group">
      <label class="control-label">Output Size: <span id="size-value">${size}px</span></label>
      <input type="range" class="slider" id="size-slider" min="100" max="1000" value="${size}" step="50"/>
    </div>
    <div class="size-presets">
      <button class="btn btn-secondary" data-size="200">200px</button>
      <button class="btn btn-secondary" data-size="400">400px</button>
      <button class="btn btn-secondary" data-size="600">600px</button>
      <button class="btn btn-secondary" data-size="800">800px</button>
    </div>
  `;

  const slider = container.querySelector('#size-slider') as HTMLInputElement;
  const valueEl = container.querySelector('#size-value') as HTMLSpanElement;

  slider.addEventListener('input', () => {
    size = parseInt(slider.value);
    valueEl.textContent = `${size}px`;
  });

  container.querySelectorAll('[data-size]').forEach(btn => {
    btn.addEventListener('click', () => {
      size = parseInt((btn as HTMLElement).dataset.size!);
      slider.value = String(size);
      valueEl.textContent = `${size}px`;
    });
  });

  addCircleStyles();
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
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Create circular mask
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    // Draw image centered and covering
    const minDim = Math.min(img.width, img.height);
    const sx = (img.width - minDim) / 2;
    const sy = (img.height - minDim) / 2;
    ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);

    const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), 'image/png', 1.0));
    URL.revokeObjectURL(imageURL);
    toolLayout.showResult(blob);
    toolLayout.showLoading(false);
  } catch (error) {
    toolLayout.showError('Circle crop failed.');
    toolLayout.showLoading(false);
  }
}

function addCircleStyles() {
  if (document.querySelector('#circle-styles')) return;
  const styles = document.createElement('style');
  styles.id = 'circle-styles';
  styles.textContent = `.size-presets { display: flex; flex-wrap: wrap; gap: var(--spacing-sm); margin-top: var(--spacing-md); }`;
  document.head.appendChild(styles);
}
