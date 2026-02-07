/**
 * Watermark Tool
 * Add text watermark to images
 */

import { createToolLayout, ToolLayout } from '../../components/ToolLayout';

let toolLayout: ToolLayout | null = null;
let currentFile: File | null = null;
let text = '© My Watermark';
let opacity = 0.5;
let position = 'bottom-right';
let fontSize = 24;

export default function render(container: HTMLElement) {
  toolLayout = createToolLayout(container, {
    id: 'watermark',
    title: 'Watermark',
    description: 'Add text watermark to protect your images',
    onFileSelect: handleFileSelect,
    renderControls: renderControls,
    seoContent: `<h2>Add Watermarks</h2><p>Protect your images with custom text watermarks. Control position, opacity, and size.</p>`
  });
}

function handleFileSelect(file: File) { currentFile = file; }

function renderControls(container: HTMLElement) {
  container.innerHTML = `
    <div class="control-group">
      <label class="control-label">Watermark Text</label>
      <input type="text" class="input" id="wm-text" value="${text}"/>
    </div>
    <div class="control-group">
      <label class="control-label">Opacity: <span id="opacity-value">${Math.round(opacity * 100)}%</span></label>
      <input type="range" class="slider" id="opacity-slider" min="10" max="100" value="${opacity * 100}" step="5"/>
    </div>
    <div class="control-group">
      <label class="control-label">Font Size: <span id="font-value">${fontSize}px</span></label>
      <input type="range" class="slider" id="font-slider" min="12" max="72" value="${fontSize}" step="2"/>
    </div>
    <div class="control-group">
      <label class="control-label">Position</label>
      <select class="input" id="position-select">
        <option value="top-left">Top Left</option>
        <option value="top-right">Top Right</option>
        <option value="center">Center</option>
        <option value="bottom-left">Bottom Left</option>
        <option value="bottom-right" selected>Bottom Right</option>
        <option value="tile">Tile (Repeat)</option>
      </select>
    </div>
  `;

  const textInput = container.querySelector('#wm-text') as HTMLInputElement;
  const opacitySlider = container.querySelector('#opacity-slider') as HTMLInputElement;
  const fontSlider = container.querySelector('#font-slider') as HTMLInputElement;
  const posSelect = container.querySelector('#position-select') as HTMLSelectElement;

  textInput.addEventListener('input', () => { text = textInput.value; });
  opacitySlider.addEventListener('input', () => {
    opacity = parseInt(opacitySlider.value) / 100;
    (container.querySelector('#opacity-value') as HTMLElement).textContent = `${opacitySlider.value}%`;
  });
  fontSlider.addEventListener('input', () => {
    fontSize = parseInt(fontSlider.value);
    (container.querySelector('#font-value') as HTMLElement).textContent = `${fontSize}px`;
  });
  posSelect.addEventListener('change', () => { position = posSelect.value; });

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

    ctx.font = `${fontSize}px Arial, sans-serif`;
    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
    ctx.strokeStyle = `rgba(0, 0, 0, ${opacity * 0.5})`;
    ctx.lineWidth = 2;

    const textMetrics = ctx.measureText(text);
    const padding = 20;
    let x: number, y: number;

    if (position === 'tile') {
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (let row = 0; row < canvas.height; row += fontSize * 4) {
        for (let col = 0; col < canvas.width; col += textMetrics.width + 100) {
          ctx.strokeText(text, col + textMetrics.width / 2, row + fontSize);
          ctx.fillText(text, col + textMetrics.width / 2, row + fontSize);
        }
      }
    } else {
      switch (position) {
        case 'top-left': x = padding; y = fontSize + padding; ctx.textAlign = 'left'; break;
        case 'top-right': x = canvas.width - padding; y = fontSize + padding; ctx.textAlign = 'right'; break;
        case 'center': x = canvas.width / 2; y = canvas.height / 2; ctx.textAlign = 'center'; break;
        case 'bottom-left': x = padding; y = canvas.height - padding; ctx.textAlign = 'left'; break;
        default: x = canvas.width - padding; y = canvas.height - padding; ctx.textAlign = 'right';
      }
      ctx.strokeText(text, x, y);
      ctx.fillText(text, x, y);
    }

    const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), 'image/png', 1.0));
    URL.revokeObjectURL(imageURL);
    toolLayout.showResult(blob);
    toolLayout.showLoading(false);
  } catch (error) {
    toolLayout.showError('Watermark failed.');
    toolLayout.showLoading(false);
  }
}
