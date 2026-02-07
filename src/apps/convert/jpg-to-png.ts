/**
 * JPG to PNG Converter
 */

import { createToolLayout, ToolLayout } from '../../components/ToolLayout';

let toolLayout: ToolLayout | null = null;
let currentFile: File | null = null;

export default function render(container: HTMLElement) {
  toolLayout = createToolLayout(container, {
    id: 'jpg-to-png',
    title: 'JPG → PNG',
    description: 'Convert JPEG to PNG format',
    acceptTypes: ['image/jpeg', 'image/jpg'],
    onFileSelect: handleFileSelect,
    renderControls: renderControls,
    seoContent: `<h2>Convert JPG to PNG</h2><p>Convert JPEG images to PNG format. PNG supports transparency and lossless compression, making it ideal for graphics and screenshots.</p>`
  });
}

function handleFileSelect(file: File) { currentFile = file; }

function renderControls(container: HTMLElement) {
  container.innerHTML = `
    <div class="info-box glass-card" style="padding: var(--spacing-md);">
      <h4 style="margin: 0 0 var(--spacing-xs);">JPG → PNG</h4>
      <p style="margin: 0; font-size: var(--text-sm); color: var(--color-text-secondary);">
        PNG is lossless and supports transparency. File size may increase.
      </p>
    </div>
  `;
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

    const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), 'image/png', 1.0));
    URL.revokeObjectURL(imageURL);
    toolLayout.showResult(blob);
    toolLayout.showLoading(false);
  } catch (error) {
    toolLayout.showError('Conversion failed.');
    toolLayout.showLoading(false);
  }
}
