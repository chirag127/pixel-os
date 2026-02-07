/**
 * Compress JPEG Tool
 * Lossy compression using browser-image-compression
 */

import imageCompression from 'browser-image-compression';
import { createToolLayout, ToolLayout } from '../../components/ToolLayout';
import { seoContent } from '../../content/compress-jpg-seo';

let toolLayout: ToolLayout | null = null;
let currentFile: File | null = null;
let quality = 0.8;
let maxWidth = 1920;

export default function render(container: HTMLElement) {
  toolLayout = createToolLayout(container, {
    id: 'compress-jpg',
    title: 'Compress JPEG',
    description: 'Reduce JPEG file size while maintaining visual quality',
    onFileSelect: handleFileSelect,
    renderControls: renderControls,
    seoContent: seoContent
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
      <p class="control-hint">Lower quality = smaller file size</p>
    </div>

    <div class="control-group">
      <label class="control-label">
        Max Width: <span id="width-value">${maxWidth}px</span>
      </label>
      <input type="range" class="slider" id="width-slider"
        min="320" max="4096" value="${maxWidth}" step="64"/>
      <p class="control-hint">Images wider than this will be resized</p>
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

  // Add control styles
  addControlStyles();

  // Event listeners
  const qualitySlider = container.querySelector('#quality-slider') as HTMLInputElement;
  const widthSlider = container.querySelector('#width-slider') as HTMLInputElement;
  const qualityValue = container.querySelector('#quality-value') as HTMLSpanElement;
  const widthValue = container.querySelector('#width-value') as HTMLSpanElement;

  qualitySlider.addEventListener('input', () => {
    quality = parseInt(qualitySlider.value) / 100;
    qualityValue.textContent = `${qualitySlider.value}%`;
  });

  widthSlider.addEventListener('input', () => {
    maxWidth = parseInt(widthSlider.value);
    widthValue.textContent = `${maxWidth}px`;
  });

  // Process button
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
      initialQuality: quality,
      fileType: 'image/jpeg' as const
    };

    const compressedFile = await imageCompression(currentFile, options);

    // Convert to blob
    const blob = new Blob([compressedFile], { type: 'image/jpeg' });

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

function addControlStyles() {
  if (document.querySelector('#control-styles')) return;

  const styles = document.createElement('style');
  styles.id = 'control-styles';
  styles.textContent = `
    .control-group {
      margin-bottom: var(--spacing-lg);
    }

    .control-label {
      display: flex;
      justify-content: space-between;
      margin-bottom: var(--spacing-sm);
      font-size: var(--text-sm);
      font-weight: 500;
    }

    .control-hint {
      margin-top: var(--spacing-xs);
      font-size: var(--text-xs);
      color: var(--color-text-muted);
    }

    .size-display {
      font-size: var(--text-sm);
    }

    .size-row {
      display: flex;
      justify-content: space-between;
      padding: var(--spacing-xs) 0;
    }

    .size-row:not(:last-child) {
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
  `;
  document.head.appendChild(styles);
}
