/**
 * Meme Maker Tool
 * Add top/bottom text to images
 */

import { createToolLayout, ToolLayout } from '../../components/ToolLayout';

let toolLayout: ToolLayout | null = null;
let currentFile: File | null = null;
let topText = 'TOP TEXT';
let bottomText = 'BOTTOM TEXT';
let fontSize = 48;

export default function render(container: HTMLElement) {
  toolLayout = createToolLayout(container, {
    id: 'meme',
    title: 'Meme Maker',
    description: 'Add top and bottom text to images',
    onFileSelect: handleFileSelect,
    renderControls: renderControls,
    seoContent: `<h2>Create Memes</h2><p>Add classic meme-style text to any image. Impact font, white text with black outline.</p>`
  });
}

function handleFileSelect(file: File) { currentFile = file; }

function renderControls(container: HTMLElement) {
  container.innerHTML = `
    <div class="control-group">
      <label class="control-label">Top Text</label>
      <input type="text" class="input" id="top-text" value="${topText}" placeholder="TOP TEXT"/>
    </div>
    <div class="control-group">
      <label class="control-label">Bottom Text</label>
      <input type="text" class="input" id="bottom-text" value="${bottomText}" placeholder="BOTTOM TEXT"/>
    </div>
    <div class="control-group">
      <label class="control-label">Font Size: <span id="font-value">${fontSize}px</span></label>
      <input type="range" class="slider" id="font-slider" min="24" max="96" value="${fontSize}" step="4"/>
    </div>
  `;

  const topInput = container.querySelector('#top-text') as HTMLInputElement;
  const bottomInput = container.querySelector('#bottom-text') as HTMLInputElement;
  const fontSlider = container.querySelector('#font-slider') as HTMLInputElement;
  const fontValue = container.querySelector('#font-value') as HTMLSpanElement;

  topInput.addEventListener('input', () => { topText = topInput.value; });
  bottomInput.addEventListener('input', () => { bottomText = bottomInput.value; });
  fontSlider.addEventListener('input', () => { fontSize = parseInt(fontSlider.value); fontValue.textContent = `${fontSize}px`; });

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

    // Meme text style
    ctx.font = `bold ${fontSize}px Impact, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = fontSize / 12;

    // Top text
    if (topText) {
      ctx.strokeText(topText.toUpperCase(), canvas.width / 2, fontSize + 20);
      ctx.fillText(topText.toUpperCase(), canvas.width / 2, fontSize + 20);
    }

    // Bottom text
    if (bottomText) {
      ctx.strokeText(bottomText.toUpperCase(), canvas.width / 2, canvas.height - 20);
      ctx.fillText(bottomText.toUpperCase(), canvas.width / 2, canvas.height - 20);
    }

    const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), 'image/png', 1.0));
    URL.revokeObjectURL(imageURL);
    toolLayout.showResult(blob);
    toolLayout.showLoading(false);
  } catch (error) {
    toolLayout.showError('Meme creation failed.');
    toolLayout.showLoading(false);
  }
}
