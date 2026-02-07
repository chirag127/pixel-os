/**
 * Compress PNG Tool
 * Lossless PNG optimization using browser-image-compression
 */

import imageCompression from 'browser-image-compression';
import { createToolLayout, ToolLayout } from '../../components/ToolLayout';

let toolLayout: ToolLayout | null = null;
let currentFile: File | null = null;
let maxWidth = 2048;

export default function render(container: HTMLElement) {
  toolLayout = createToolLayout(container, {
    id: 'compress-png',
    title: 'Compress PNG',
    description: 'Reduce PNG file size with lossless optimization',
    acceptTypes: ['image/png'],
    onFileSelect: handleFileSelect,
    renderControls: renderControls,
    seoContent: `
      <h2>Lossless PNG Compression</h2>
      <p>PNG (Portable Network Graphics) is a lossless image format ideal for graphics, screenshots, and images requiring transparency. Our PNG compressor reduces file sizes through smart optimization techniques while preserving 100% of the original image quality.</p>
      <h3>How PNG Compression Works</h3>
      <p>Unlike JPEG, PNG compression is lossless, meaning no image data is lost. Our tool optimizes PNG files by:</p>
      <ul>
        <li>Removing unnecessary metadata (EXIF, color profiles)</li>
        <li>Optimizing DEFLATE compression parameters</li>
        <li>Reducing color palette for images with fewer colors</li>
        <li>Converting 24-bit to 8-bit when possible</li>
      </ul>
      <h3>When to Use PNG</h3>
      <p>PNG is the best choice for logos, icons, screenshots, diagrams, and any image requiring transparency. For photographs, consider JPEG or WebP for smaller file sizes.</p>
    `
  });
}

function handleFileSelect(file: File) {
  currentFile = file;
  updateSizeDisplay(file.size, null);
}

function renderControls(container: HTMLElement) {
  container.innerHTML = `
    <div class="control-group">
      <label class="control-label">
        Max Width: <span id="width-value">${maxWidth}px</span>
      </label>
      <input type="range" class="slider" id="width-slider"
        min="320" max="4096" value="${maxWidth}" step="64"/>
      <p class="control-hint">Resize if larger than this width</p>
    </div>

    <div class="info-box glass-card" style="padding: var(--spacing-md); margin-bottom: var(--spacing-md); background: rgba(79, 140, 255, 0.1); border-color: var(--accent-blue);">
      <p style="margin: 0; font-size: var(--text-sm);">
        ℹ️ PNG compression is lossless - your image quality will be preserved exactly!
      </p>
    </div>

    <div class="size-display glass-card" id="size-display" style="padding: var(--spacing-md);">
      <div class="size-row">
        <span>Original:</span>
        <span id="original-size">-</span>
      </div>
      <div class="size-row">
        <span>Compressed:</span>
        <span id="compressed-size">-</span>
      </div>
      <div class="size-row" style="color: var(--accent-green);">
        <span>Saved:</span>
        <span id="saved-size">-</span>
      </div>
    </div>
  `;

  const widthSlider = container.querySelector('#width-slider') as HTMLInputElement;
  const widthValue = container.querySelector('#width-value') as HTMLSpanElement;

  widthSlider.addEventListener('input', () => {
    maxWidth = parseInt(widthSlider.value);
    widthValue.textContent = `${maxWidth}px`;
  });

  const processBtn = toolLayout?.getProcessButton();
  processBtn?.addEventListener('click', processImage);
}

async function processImage() {
  if (!currentFile || !toolLayout) return;

  toolLayout.showLoading(true);

  try {
    const options = {
      maxSizeMB: 10,
      maxWidthOrHeight: maxWidth,
      useWebWorker: true,
      fileType: 'image/png' as const,
      alwaysKeepResolution: false
    };

    const compressedFile = await imageCompression(currentFile, options);
    const blob = new Blob([compressedFile], { type: 'image/png' });

    updateSizeDisplay(currentFile.size, compressedFile.size);
    toolLayout.showResult(blob);
    toolLayout.showLoading(false);
  } catch (error) {
    console.error('Compression failed:', error);
    toolLayout.showError('Compression failed. Please try again.');
    toolLayout.showLoading(false);
  }
}

function updateSizeDisplay(originalSize: number, compressedSize: number | null) {
  const originalEl = document.querySelector('#original-size');
  const compressedEl = document.querySelector('#compressed-size');
  const savedEl = document.querySelector('#saved-size');

  if (originalEl) {
    originalEl.textContent = formatSize(originalSize);
  }

  if (compressedSize !== null && compressedEl && savedEl) {
    compressedEl.textContent = formatSize(compressedSize);
    const saved = originalSize - compressedSize;
    const percentage = Math.round((saved / originalSize) * 100);
    savedEl.textContent = `${formatSize(saved)} (${percentage}%)`;
  }
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}
