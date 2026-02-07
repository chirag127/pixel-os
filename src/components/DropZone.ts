/**
 * DropZone Component
 * Glassmorphic drag-and-drop file upload zone with instant preview
 */

export interface DropZoneOptions {
  accept?: string[];
  multiple?: boolean;
  maxSize?: number; // in bytes
  onFiles?: (files: File[]) => void;
  onError?: (error: string) => void;
}

export class DropZone {
  private container: HTMLElement;
  private options: DropZoneOptions;
  private previewUrl: string | null = null;

  constructor(container: HTMLElement, options: DropZoneOptions = {}) {
    this.container = container;
    this.options = {
      accept: ['image/*'],
      multiple: false,
      maxSize: 50 * 1024 * 1024, // 50MB default
      ...options
    };
    this.render();
    this.setupEventListeners();
  }

  private render() {
    this.container.innerHTML = `
      <div class="dropzone glass-card" tabindex="0" role="button" aria-label="Upload image">
        <input type="file" class="dropzone-input"
          accept="${this.options.accept?.join(',')}"
          ${this.options.multiple ? 'multiple' : ''}
          aria-hidden="true"
        />
        <div class="dropzone-content">
          <div class="dropzone-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M12 16V8M12 8L9 11M12 8L15 11"/>
              <path d="M3 15C3 17.8284 3 19.2426 3.87868 20.1213C4.75736 21 6.17157 21 9 21H15C17.8284 21 19.2426 21 20.1213 20.1213C21 19.2426 21 17.8284 21 15"/>
              <path d="M3 10V9C3 6.17157 3 4.75736 3.87868 3.87868C4.75736 3 6.17157 3 9 3H15C17.8284 3 19.2426 3 20.1213 3.87868C21 4.75736 21 6.17157 21 9V10"/>
            </svg>
          </div>
          <p class="dropzone-text">
            <span class="dropzone-text-primary">Drop your image here</span>
            <span class="dropzone-text-secondary">or click to browse</span>
          </p>
          <p class="dropzone-hint">
            Supports: JPG, PNG, WebP, HEIC, GIF, BMP • Max ${Math.round((this.options.maxSize || 0) / 1024 / 1024)}MB
          </p>
        </div>
        <div class="dropzone-preview" style="display: none;">
          <img src="" alt="Preview" class="dropzone-preview-img"/>
          <button class="dropzone-clear btn btn-secondary" aria-label="Remove image">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div class="dropzone-loading" style="display: none;">
          <div class="loading-spinner animate-spin"></div>
          <p>Processing...</p>
        </div>
      </div>
    `;

    // Add component styles
    this.addStyles();
  }

  private addStyles() {
    if (document.querySelector('#dropzone-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'dropzone-styles';
    styles.textContent = `
      .dropzone {
        position: relative;
        padding: var(--spacing-xl);
        text-align: center;
        cursor: pointer;
        transition: all var(--transition-normal);
        min-height: 200px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .dropzone:hover,
      .dropzone.dragover {
        background: var(--glass-bg-hover);
        border-color: var(--accent-blue);
      }

      .dropzone.dragover {
        transform: scale(1.02);
      }

      .dropzone-input {
        position: absolute;
        inset: 0;
        opacity: 0;
        cursor: pointer;
      }

      .dropzone-content {
        pointer-events: none;
      }

      .dropzone-icon {
        color: var(--color-text-muted);
        margin-bottom: var(--spacing-md);
      }

      .dropzone-text {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-xs);
      }

      .dropzone-text-primary {
        font-size: var(--text-lg);
        font-weight: 600;
      }

      .dropzone-text-secondary {
        font-size: var(--text-sm);
        color: var(--color-text-muted);
      }

      .dropzone-hint {
        margin-top: var(--spacing-md);
        font-size: var(--text-xs);
        color: var(--color-text-muted);
      }

      .dropzone-preview {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: var(--spacing-md);
      }

      .dropzone-preview-img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
        border-radius: var(--radius-sm);
      }

      .dropzone-clear {
        position: absolute;
        top: var(--spacing-md);
        right: var(--spacing-md);
        width: 36px;
        height: 36px;
        padding: 0;
        border-radius: var(--radius-full);
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(10px);
      }

      .dropzone-loading {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: var(--spacing-sm);
        background: rgba(10, 10, 15, 0.8);
        backdrop-filter: blur(10px);
      }

      .loading-spinner {
        width: 40px;
        height: 40px;
        border: 3px solid rgba(255, 255, 255, 0.1);
        border-top-color: var(--accent-blue);
        border-radius: 50%;
      }
    `;
    document.head.appendChild(styles);
  }

  private setupEventListeners() {
    const dropzone = this.container.querySelector('.dropzone') as HTMLElement;
    const input = this.container.querySelector('.dropzone-input') as HTMLInputElement;
    const clearBtn = this.container.querySelector('.dropzone-clear') as HTMLButtonElement;

    // Drag events
    ['dragenter', 'dragover'].forEach(event => {
      dropzone.addEventListener(event, (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(event => {
      dropzone.addEventListener(event, (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
      });
    });

    // Drop event
    dropzone.addEventListener('drop', (e) => {
      const files = Array.from(e.dataTransfer?.files || []);
      this.handleFiles(files);
    });

    // Click/input event
    input.addEventListener('change', () => {
      const files = Array.from(input.files || []);
      this.handleFiles(files);
    });

    // Clear button
    clearBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.clear();
    });

    // Keyboard accessibility
    dropzone.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        input.click();
      }
    });
  }

  private handleFiles(files: File[]) {
    if (files.length === 0) return;

    // Validate file type
    const validFiles = files.filter(file => {
      const isValidType = this.options.accept?.some(accept => {
        if (accept === 'image/*') return file.type.startsWith('image/');
        return file.type === accept || file.name.endsWith(accept.replace('*', ''));
      });

      if (!isValidType) {
        this.options.onError?.(`Invalid file type: ${file.type}`);
        return false;
      }

      if (file.size > (this.options.maxSize || Infinity)) {
        this.options.onError?.(`File too large: ${Math.round(file.size / 1024 / 1024)}MB`);
        return false;
      }

      return true;
    });

    if (validFiles.length === 0) return;

    const filesToProcess = this.options.multiple ? validFiles : [validFiles[0]];

    // Show preview for first image
    this.showPreview(filesToProcess[0]);

    // Call callback
    this.options.onFiles?.(filesToProcess);
  }

  private showPreview(file: File) {
    // Revoke previous URL
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
    }

    this.previewUrl = URL.createObjectURL(file);

    const content = this.container.querySelector('.dropzone-content') as HTMLElement;
    const preview = this.container.querySelector('.dropzone-preview') as HTMLElement;
    const previewImg = this.container.querySelector('.dropzone-preview-img') as HTMLImageElement;

    content.style.display = 'none';
    preview.style.display = 'flex';
    previewImg.src = this.previewUrl;
  }

  showLoading(show: boolean) {
    const loading = this.container.querySelector('.dropzone-loading') as HTMLElement;
    const preview = this.container.querySelector('.dropzone-preview') as HTMLElement;
    const content = this.container.querySelector('.dropzone-content') as HTMLElement;

    loading.style.display = show ? 'flex' : 'none';

    if (!show && this.previewUrl) {
      preview.style.display = 'flex';
      content.style.display = 'none';
    }
  }

  clear() {
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
      this.previewUrl = null;
    }

    const content = this.container.querySelector('.dropzone-content') as HTMLElement;
    const preview = this.container.querySelector('.dropzone-preview') as HTMLElement;
    const input = this.container.querySelector('.dropzone-input') as HTMLInputElement;

    content.style.display = 'block';
    preview.style.display = 'none';
    input.value = '';
  }

  destroy() {
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
    }
  }
}

export function createDropZone(container: HTMLElement, options?: DropZoneOptions): DropZone {
  return new DropZone(container, options);
}
