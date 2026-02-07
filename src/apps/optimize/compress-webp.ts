/**
 * Compress WebP Tool
 * Modern web format optimization
 */

import imageCompression from 'browser-image-compression';
import { createToolLayout, ToolLayout } from '../../components/ToolLayout';

let toolLayout: ToolLayout | null = null;
let currentFile: File | null = null;
let quality = 0.85;

export default function render(container: HTMLElement) {
  toolLayout = createToolLayout(container, {
    id: 'compress-webp',
    title: 'Compress WebP',
    description: 'Optimize WebP images for modern browsers',
    acceptTypes: ['image/webp'],
    onFileSelect: handleFileSelect,
    renderControls: renderControls,
    seoContent: `
      <h2>WebP Compression Guide</h2>
      <p>WebP is a modern image format developed by Google that provides superior compression compared to JPEG and PNG. It supports both lossy and lossless compression, as well as transparency.</p>
      <h3>Why Use WebP?</h3>
      <ul>
        <li>25-35% smaller file sizes than JPEG at similar quality</li>
        <li>26% smaller than PNG for lossless compression</li>
        <li>Supports transparency (alpha channel)</li>
        <li>Supported by all modern browsers</li>
      </ul>
      <p>Compress your WebP images to achieve even better performance while maintaining excellent visual quality.</p>
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
        Quality: <span id="quality-value">${Math.round(quality * 100)}%</span>
      </label>
      <input type="range" class="slider" id="quality-slider"
        min="10" max="100" value="${quality * 100}" step="5"/>
      <p class="control-hint">Higher quality = larger file size</p>
    </div>

    <div class="size-display glass-card" id="size-display" style="padding: var(--spacing-md); margin-top: var(--spacing-md);">
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

  const qualitySlider = container.querySelector('#quality-slider') as HTMLInputElement;
  const qualityValue = container.querySelector('#quality-value') as HTMLSpanElement;

  qualitySlider.addEventListener('input', () => {
    quality = parseInt(qualitySlider.value) / 100;
    qualityValue.textContent = `${qualitySlider.value}%`;
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
      useWebWorker: true,
      initialQuality: quality,
      fileType: 'image/webp' as const
    };

    const compressedFile = await imageCompression(currentFile, options);
    const blob = new Blob([compressedFile], { type: 'image/webp' });

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
