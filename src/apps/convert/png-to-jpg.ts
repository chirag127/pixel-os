/**
 * PNG to JPG Converter
 */

import { createToolLayout, ToolLayout } from '../../components/ToolLayout';

let toolLayout: ToolLayout | null = null;
let currentFile: File | null = null;
let quality = 0.9;
let bgColor = '#ffffff';

export default function render(container: HTMLElement) {
  toolLayout = createToolLayout(container, {
    id: 'png-to-jpg',
    title: 'PNG → JPG',
    description: 'Convert PNG to JPEG format',
    acceptTypes: ['image/png'],
    onFileSelect: handleFileSelect,
    renderControls: renderControls,
    seoContent: `<h2>Convert PNG to JPG</h2><p>Convert PNG images to JPEG. Set background color for transparent areas and adjust quality.</p>`
  });
}

function handleFileSelect(file: File) { currentFile = file; }

function renderControls(container: HTMLElement) {
  container.innerHTML = `
    <div class="control-group">
      <label class="control-label">Quality: <span id="quality-value">${Math.round(quality * 100)}%</span></label>
      <input type="range" class="slider" id="quality-slider" min="10" max="100" value="${quality * 100}" step="5"/>
    </div>
    <div class="control-group">
      <label class="control-label">Background Color</label>
      <div style="display: flex; gap: var(--spacing-sm);">
        <input type="color" id="bg-color" value="${bgColor}" style="width: 50px; height: 40px; border: none; cursor: pointer;"/>
        <input type="text" class="input" id="bg-hex" value="${bgColor}" style="flex: 1;"/>
      </div>
      <p class="control-hint">Used for transparent areas</p>
    </div>
  `;

  const qualitySlider = container.querySelector('#quality-slider') as HTMLInputElement;
  const qualityValue = container.querySelector('#quality-value') as HTMLSpanElement;
  const bgColorInput = container.querySelector('#bg-color') as HTMLInputElement;
  const bgHexInput = container.querySelector('#bg-hex') as HTMLInputElement;

  qualitySlider.addEventListener('input', () => { quality = parseInt(qualitySlider.value) / 100; qualityValue.textContent = `${qualitySlider.value}%`; });
  bgColorInput.addEventListener('input', () => { bgColor = bgColorInput.value; bgHexInput.value = bgColor; });
  bgHexInput.addEventListener('input', () => { bgColor = bgHexInput.value; bgColorInput.value = bgColor; });

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

    // Fill background color for transparency
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), 'image/jpeg', quality));
    URL.revokeObjectURL(imageURL);
    toolLayout.showResult(blob);
    toolLayout.showLoading(false);
  } catch (error) {
    toolLayout.showError('Conversion failed.');
    toolLayout.showLoading(false);
  }
}
