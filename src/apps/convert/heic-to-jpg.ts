/**
 * HEIC to JPG Converter
 * Uses heic2any library for iPhone photo conversion
 */

import { createToolLayout, ToolLayout } from '../../components/ToolLayout';

let toolLayout: ToolLayout | null = null;
let currentFile: File | null = null;
let quality = 0.9;

export default function render(container: HTMLElement) {
  toolLayout = createToolLayout(container, {
    id: 'heic-to-jpg',
    title: 'HEIC → JPG',
    description: 'Convert iPhone HEIC photos to JPEG',
    acceptTypes: ['image/heic', 'image/heif', '.heic', '.heif'],
    onFileSelect: handleFileSelect,
    renderControls: renderControls,
    seoContent: `<h2>Convert HEIC to JPG</h2><p>Convert iPhone HEIC/HEIF photos to universally compatible JPEG format. All processing happens in your browser.</p>`
  });
}

function handleFileSelect(file: File) { currentFile = file; }

function renderControls(container: HTMLElement) {
  container.innerHTML = `
    <div class="control-group">
      <label class="control-label">Quality: <span id="quality-value">${Math.round(quality * 100)}%</span></label>
      <input type="range" class="slider" id="quality-slider" min="10" max="100" value="${quality * 100}" step="5"/>
    </div>
    <div class="info-box glass-card" style="padding: var(--spacing-md); margin-top: var(--spacing-md);">
      <p style="margin: 0; font-size: var(--text-sm);">📱 HEIC is Apple's default photo format. This tool converts to JPEG for universal compatibility.</p>
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
    // Dynamically import heic2any
    const heic2any = (await import('heic2any')).default;

    const blob = await heic2any({
      blob: currentFile,
      toType: 'image/jpeg',
      quality: quality
    }) as Blob;

    toolLayout.showResult(blob);
    toolLayout.showLoading(false);
  } catch (error) {
    console.error('HEIC conversion failed:', error);
    toolLayout.showError('HEIC conversion failed. Make sure you uploaded a valid HEIC file.');
    toolLayout.showLoading(false);
  }
}
