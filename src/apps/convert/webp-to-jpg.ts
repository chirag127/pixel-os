/**
 * WebP to JPG Converter
 */

import { createToolLayout, ToolLayout } from '../../components/ToolLayout';

let toolLayout: ToolLayout | null = null;
let currentFile: File | null = null;
let quality = 0.9;

export default function render(container: HTMLElement) {
  toolLayout = createToolLayout(container, {
    id: 'webp-to-jpg',
    title: 'WebP → JPG',
    description: 'Convert WebP to JPEG format',
    acceptTypes: ['image/webp'],
    onFileSelect: handleFileSelect,
    renderControls: renderControls,
    seoContent: `<h2>Convert WebP to JPG</h2><p>Convert WebP images to widely-compatible JPEG format.</p>`
  });
}

function handleFileSelect(file: File) { currentFile = file; }

function renderControls(container: HTMLElement) {
  container.innerHTML = `
    <div class="control-group">
      <label class="control-label">Quality: <span id="quality-value">${Math.round(quality * 100)}%</span></label>
      <input type="range" class="slider" id="quality-slider" min="10" max="100" value="${quality * 100}" step="5"/>
    </div>
  `;

  const qualitySlider = container.querySelector('#quality-slider') as HTMLInputElement;
  const qualityValue = container.querySelector('#quality-value') as HTMLSpanElement;
  qualitySlider.addEventListener('input', () => { quality = parseInt(qualitySlider.value) / 100; qualityValue.textContent = `${qualitySlider.value}%`; });

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
    ctx.fillStyle = '#ffffff';
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
