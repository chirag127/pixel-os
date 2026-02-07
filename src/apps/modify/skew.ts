/**
 * Skew Tool
 * Apply perspective skew transforms
 */

import { createToolLayout, ToolLayout } from '../../components/ToolLayout';

let toolLayout: ToolLayout | null = null;
let currentFile: File | null = null;
let skewX = 0;
let skewY = 0;

export default function render(container: HTMLElement) {
  toolLayout = createToolLayout(container, {
    id: 'skew',
    title: 'Skew Image',
    description: 'Apply perspective transforms',
    onFileSelect: handleFileSelect,
    renderControls: renderControls,
    seoContent: `<h2>Skew Images</h2><p>Apply horizontal and vertical skew effects for perspective correction or creative distortion.</p>`
  });
}

function handleFileSelect(file: File) { currentFile = file; skewX = 0; skewY = 0; }

function renderControls(container: HTMLElement) {
  container.innerHTML = `
    <div class="control-group">
      <label class="control-label">Horizontal Skew: <span id="skewx-value">${skewX}°</span></label>
      <input type="range" class="slider" id="skewx-slider" min="-45" max="45" value="${skewX}" step="1"/>
    </div>
    <div class="control-group">
      <label class="control-label">Vertical Skew: <span id="skewy-value">${skewY}°</span></label>
      <input type="range" class="slider" id="skewy-slider" min="-45" max="45" value="${skewY}" step="1"/>
    </div>
    <button class="btn btn-secondary" id="reset-btn" style="margin-top: var(--spacing-md);">Reset</button>
  `;

  const skewXSlider = container.querySelector('#skewx-slider') as HTMLInputElement;
  const skewYSlider = container.querySelector('#skewy-slider') as HTMLInputElement;
  const skewXValue = container.querySelector('#skewx-value') as HTMLSpanElement;
  const skewYValue = container.querySelector('#skewy-value') as HTMLSpanElement;

  skewXSlider.addEventListener('input', () => { skewX = parseInt(skewXSlider.value); skewXValue.textContent = `${skewX}°`; });
  skewYSlider.addEventListener('input', () => { skewY = parseInt(skewYSlider.value); skewYValue.textContent = `${skewY}°`; });

  container.querySelector('#reset-btn')?.addEventListener('click', () => {
    skewX = 0; skewY = 0;
    skewXSlider.value = '0'; skewYSlider.value = '0';
    skewXValue.textContent = '0°'; skewYValue.textContent = '0°';
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

    // Calculate canvas size to fit skewed image
    const radX = skewX * Math.PI / 180;
    const radY = skewY * Math.PI / 180;
    const extraWidth = Math.abs(img.height * Math.tan(radX));
    const extraHeight = Math.abs(img.width * Math.tan(radY));

    const canvas = document.createElement('canvas');
    canvas.width = img.width + extraWidth;
    canvas.height = img.height + extraHeight;
    const ctx = canvas.getContext('2d')!;

    ctx.translate(skewX < 0 ? extraWidth : 0, skewY < 0 ? extraHeight : 0);
    ctx.transform(1, Math.tan(radY), Math.tan(radX), 1, 0, 0);
    ctx.drawImage(img, 0, 0);

    const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), 'image/png', 1.0));
    URL.revokeObjectURL(imageURL);
    toolLayout.showResult(blob);
    toolLayout.showLoading(false);
  } catch (error) {
    toolLayout.showError('Skew failed.');
    toolLayout.showLoading(false);
  }
}
