/**
 * Rotate Tool
 * Rotate images by degrees
 */

import { createToolLayout, ToolLayout } from '../../components/ToolLayout';

let toolLayout: ToolLayout | null = null;
let currentFile: File | null = null;
let rotation = 0;

export default function render(container: HTMLElement) {
  toolLayout = createToolLayout(container, {
    id: 'rotate',
    title: 'Rotate Image',
    description: 'Rotate images by any angle',
    onFileSelect: handleFileSelect,
    renderControls: renderControls,
    seoContent: `<h2>Rotate Images</h2><p>Rotate your images by 90° steps or any custom angle. Perfect for fixing orientation issues.</p>`
  });
}

function handleFileSelect(file: File) { currentFile = file; rotation = 0; updatePreview(); }

function renderControls(container: HTMLElement) {
  container.innerHTML = `
    <div class="control-group">
      <label class="control-label">Rotation: <span id="rotation-value">${rotation}°</span></label>
      <input type="range" class="slider" id="rotation-slider" min="-180" max="180" value="${rotation}" step="1"/>
    </div>
    <div class="quick-rotate">
      <button class="btn btn-secondary" data-rotate="-90">↺ 90° Left</button>
      <button class="btn btn-secondary" data-rotate="90">↻ 90° Right</button>
      <button class="btn btn-secondary" data-rotate="180">180°</button>
      <button class="btn btn-secondary" data-rotate="0">Reset</button>
    </div>
  `;

  const slider = container.querySelector('#rotation-slider') as HTMLInputElement;
  const valueEl = container.querySelector('#rotation-value') as HTMLSpanElement;

  slider.addEventListener('input', () => {
    rotation = parseInt(slider.value);
    valueEl.textContent = `${rotation}°`;
    updatePreview();
  });

  container.querySelectorAll('[data-rotate]').forEach(btn => {
    btn.addEventListener('click', () => {
      rotation = parseInt((btn as HTMLElement).dataset.rotate!);
      slider.value = String(rotation);
      valueEl.textContent = `${rotation}°`;
      updatePreview();
    });
  });

  addRotateStyles();
  toolLayout?.getProcessButton()?.addEventListener('click', processImage);
}

function updatePreview() {
  const previewImg = document.querySelector('#result-image') as HTMLImageElement;
  if (previewImg && previewImg.style.display !== 'none') {
    previewImg.style.transform = `rotate(${rotation}deg)`;
  }
}

async function processImage() {
  if (!currentFile || !toolLayout) return;
  toolLayout.showLoading(true);

  try {
    const img = new Image();
    const imageURL = URL.createObjectURL(currentFile);
    await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; img.src = imageURL; });

    const radians = rotation * Math.PI / 180;
    const sin = Math.abs(Math.sin(radians));
    const cos = Math.abs(Math.cos(radians));
    const newWidth = img.width * cos + img.height * sin;
    const newHeight = img.width * sin + img.height * cos;

    const canvas = document.createElement('canvas');
    canvas.width = newWidth;
    canvas.height = newHeight;
    const ctx = canvas.getContext('2d')!;
    ctx.translate(newWidth / 2, newHeight / 2);
    ctx.rotate(radians);
    ctx.drawImage(img, -img.width / 2, -img.height / 2);

    const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), 'image/png', 1.0));
    URL.revokeObjectURL(imageURL);
    toolLayout.showResult(blob);
    toolLayout.showLoading(false);
  } catch (error) {
    toolLayout.showError('Rotation failed.');
    toolLayout.showLoading(false);
  }
}

function addRotateStyles() {
  if (document.querySelector('#rotate-styles')) return;
  const styles = document.createElement('style');
  styles.id = 'rotate-styles';
  styles.textContent = `.quick-rotate { display: flex; flex-wrap: wrap; gap: var(--spacing-sm); margin-top: var(--spacing-md); }`;
  document.head.appendChild(styles);
}
