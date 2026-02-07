/**
 * ToolLayout Component
 * Base layout for all tool pages with consistent structure
 */

import { DropZone, createDropZone } from './DropZone';

export interface ToolLayoutOptions {
  id: string;
  title: string;
  description: string;
  icon?: string;
  acceptTypes?: string[];
  onFileSelect?: (file: File) => void;
  renderControls?: (container: HTMLElement) => void;
  seoContent?: string;
}

export class ToolLayout {
  private container: HTMLElement;
  private options: ToolLayoutOptions;
  private dropZone: DropZone | null = null;
  private currentFile: File | null = null;
  private resultBlob: Blob | null = null;

  constructor(container: HTMLElement, options: ToolLayoutOptions) {
    this.container = container;
    this.options = options;
    this.render();
  }

  private render() {
    this.container.innerHTML = `
      <div class="tool-page animate-fade-in">
        <header class="tool-header">
          <a href="#/" class="tool-back-btn" aria-label="Back to home">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </a>
          <div>
            <h1 class="tool-title">${this.options.title}</h1>
            <p class="tool-description" style="color: var(--color-text-muted); font-size: var(--text-sm);">
              ${this.options.description}
            </p>
          </div>
        </header>

        <div class="tool-workspace">
          <div class="tool-preview glass-card" id="tool-preview">
            <div class="dropzone-container" id="dropzone-container"></div>
            <canvas id="result-canvas" style="display: none; max-width: 100%; max-height: 100%;"></canvas>
            <img id="result-image" style="display: none; max-width: 100%; max-height: 100%; object-fit: contain;" alt="Result"/>
          </div>

          <div class="tool-controls glass-card" id="tool-controls">
            <h3 style="margin-bottom: var(--spacing-md);">Settings</h3>
            <div id="controls-container">
              <!-- Tool-specific controls render here -->
            </div>
            <div class="tool-actions" style="margin-top: var(--spacing-lg);">
              <button class="btn btn-primary" id="process-btn" disabled>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M10 8l6 4-6 4V8z" fill="currentColor"/>
                </svg>
                Process
              </button>
              <button class="btn btn-secondary" id="download-btn" disabled>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 5v14M12 19l-7-7M12 19l7-7"/>
                  <path d="M5 21h14"/>
                </svg>
                Download
              </button>
            </div>
          </div>
        </div>

        ${this.options.seoContent ? `
          <article class="seo-content">
            ${this.options.seoContent}
          </article>
        ` : ''}
      </div>
    `;

    // Initialize dropzone
    const dropzoneContainer = this.container.querySelector('#dropzone-container') as HTMLElement;
    this.dropZone = createDropZone(dropzoneContainer, {
      accept: this.options.acceptTypes || ['image/*'],
      onFiles: (files) => this.handleFileSelect(files[0]),
      onError: (error) => this.showError(error)
    });

    // Render tool-specific controls
    const controlsContainer = this.container.querySelector('#controls-container') as HTMLElement;
    this.options.renderControls?.(controlsContainer);

    // Setup event listeners
    this.setupEventListeners();
  }

  private setupEventListeners() {
    const downloadBtn = this.container.querySelector('#download-btn') as HTMLButtonElement;

    downloadBtn.addEventListener('click', () => {
      if (this.resultBlob) {
        this.downloadResult();
      }
    });
  }

  private handleFileSelect(file: File) {
    this.currentFile = file;

    // Enable process button
    const processBtn = this.container.querySelector('#process-btn') as HTMLButtonElement;
    processBtn.disabled = false;

    // Call external handler
    this.options.onFileSelect?.(file);
  }

  showLoading(show: boolean) {
    this.dropZone?.showLoading(show);
  }

  showResult(blob: Blob) {
    this.resultBlob = blob;

    const dropzoneContainer = this.container.querySelector('#dropzone-container') as HTMLElement;
    const resultImage = this.container.querySelector('#result-image') as HTMLImageElement;
    const downloadBtn = this.container.querySelector('#download-btn') as HTMLButtonElement;

    dropzoneContainer.style.display = 'none';
    resultImage.style.display = 'block';
    resultImage.src = URL.createObjectURL(blob);
    downloadBtn.disabled = false;
  }

  showError(message: string) {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = 'toast toast-error';
    toast.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M15 9l-6 6M9 9l6 6"/>
      </svg>
      <span>${message}</span>
    `;

    // Add toast styles if not present
    if (!document.querySelector('#toast-styles')) {
      const styles = document.createElement('style');
      styles.id = 'toast-styles';
      styles.textContent = `
        .toast {
          position: fixed;
          bottom: 100px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-sm) var(--spacing-lg);
          background: rgba(239, 68, 68, 0.9);
          color: white;
          border-radius: var(--radius-full);
          font-size: var(--text-sm);
          z-index: var(--z-toast);
          animation: slideUp var(--transition-normal) ease;
        }

        .toast-error {
          background: rgba(239, 68, 68, 0.9);
        }

        .toast-success {
          background: rgba(34, 197, 94, 0.9);
        }
      `;
      document.head.appendChild(styles);
    }

    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  showSuccess(message: string) {
    const toast = document.createElement('div');
    toast.className = 'toast toast-success';
    toast.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20 6L9 17l-5-5"/>
      </svg>
      <span>${message}</span>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  private downloadResult() {
    if (!this.resultBlob) return;

    const extension = this.resultBlob.type.split('/')[1] || 'png';
    const filename = `${this.options.id}-${Date.now()}.${extension}`;

    const link = document.createElement('a');
    link.href = URL.createObjectURL(this.resultBlob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);

    this.showSuccess('Downloaded successfully!');
  }

  getCurrentFile(): File | null {
    return this.currentFile;
  }

  getProcessButton(): HTMLButtonElement {
    return this.container.querySelector('#process-btn') as HTMLButtonElement;
  }

  getCanvas(): HTMLCanvasElement {
    return this.container.querySelector('#result-canvas') as HTMLCanvasElement;
  }

  reset() {
    this.currentFile = null;
    this.resultBlob = null;
    this.dropZone?.clear();

    const dropzoneContainer = this.container.querySelector('#dropzone-container') as HTMLElement;
    const resultImage = this.container.querySelector('#result-image') as HTMLImageElement;
    const processBtn = this.container.querySelector('#process-btn') as HTMLButtonElement;
    const downloadBtn = this.container.querySelector('#download-btn') as HTMLButtonElement;

    dropzoneContainer.style.display = 'block';
    resultImage.style.display = 'none';
    processBtn.disabled = true;
    downloadBtn.disabled = true;
  }

  destroy() {
    this.dropZone?.destroy();
  }
}

export function createToolLayout(container: HTMLElement, options: ToolLayoutOptions): ToolLayout {
  return new ToolLayout(container, options);
}
