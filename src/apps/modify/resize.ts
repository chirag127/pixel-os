/**
 * Resize Tool
 * Change image dimensions with various options
 */

import { createToolLayout, ToolLayout } from '../../components/ToolLayout';

let toolLayout: ToolLayout | null = null;
let currentFile: File | null = null;
let width = 800;
let height = 600;
let maintainAspect = true;
let originalAspect = 1;

export default function render(container: HTMLElement) {
  toolLayout = createToolLayout(container, {
    id: 'resize',
    title: 'Resize Image',
    description: 'Change image dimensions with precision',
    onFileSelect: handleFileSelect,
    renderControls: renderControls,
    seoContent: `
      <h2>Resize Images Online</h2>
      <p>Easily resize your images to exact dimensions. Perfect for social media, websites, or print.</p>
      <h3>Common Sizes</h3>
      <ul>
        <li>Instagram: 1080x1080, 1080x1350</li>
        <li>Facebook: 1200x630</li>
        <li>Twitter: 1600x900</li>
        <li>LinkedIn: 1200x627</li>
      </ul>
    `
  });
}

function handleFileSelect(file: File) {
  currentFile = file;
  const img = new Image();
  img.onload = () => {
    width = img.width;
    height = img.height;
    originalAspect = img.width / img.height;
    updateInputs();
  };
  img.src = URL.createObjectURL(file);
}

function updateInputs() {
  const widthInput = document.querySelector('#width-input') as HTMLInputElement;
  const heightInput = document.querySelector('#height-input') as HTMLInputElement;
  if (widthInput) widthInput.value = String(width);
  if (heightInput) heightInput.value = String(height);
}

function renderControls(container: HTMLElement) {
  container.innerHTML = `
    <div class="control-group">
      <label class="control-label">Width (px)</label>
      <input type="number" class="input" id="width-input" value="${width}" min="1" max="8000"/>
    </div>

    <div class="control-group">
      <label class="control-label">Height (px)</label>
      <input type="number" class="input" id="height-input" value="${height}" min="1" max="8000"/>
    </div>

    <div class="control-group">
      <label class="checkbox-label">
        <input type="checkbox" id="aspect-checkbox" ${maintainAspect ? 'checked' : ''}/>
        <span>Maintain aspect ratio</span>
      </label>
    </div>

    <div class="preset-buttons">
      <button class="btn btn-secondary btn-sm" data-size="1080x1080">1080×1080</button>
      <button class="btn btn-secondary btn-sm" data-size="1920x1080">1920×1080</button>
      <button class="btn btn-secondary btn-sm" data-size="800x600">800×600</button>
      <button class="btn btn-secondary btn-sm" data-size="640x480">640×480</button>
    </div>
  `;

  addResizeStyles();

  const widthInput = container.querySelector('#width-input') as HTMLInputElement;
  const heightInput = container.querySelector('#height-input') as HTMLInputElement;
  const aspectCheckbox = container.querySelector('#aspect-checkbox') as HTMLInputElement;

  widthInput.addEventListener('input', () => {
    width = parseInt(widthInput.value) || 1;
    if (maintainAspect) {
      height = Math.round(width / originalAspect);
      heightInput.value = String(height);
    }
  });

  heightInput.addEventListener('input', () => {
    height = parseInt(heightInput.value) || 1;
    if (maintainAspect) {
      width = Math.round(height * originalAspect);
      widthInput.value = String(width);
    }
  });

  aspectCheckbox.addEventListener('change', () => {
    maintainAspect = aspectCheckbox.checked;
  });

  container.querySelectorAll('[data-size]').forEach(btn => {
    btn.addEventListener('click', () => {
      const [w, h] = (btn as HTMLElement).dataset.size!.split('x').map(Number);
      width = w;
      height = h;
      widthInput.value = String(w);
      heightInput.value = String(h);
      maintainAspect = false;
      aspectCheckbox.checked = false;
    });
  });

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
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, width, height);

    const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), 'image/png', 1.0));
    URL.revokeObjectURL(imageURL);
    toolLayout.showResult(blob);
    toolLayout.showLoading(false);
  } catch (error) {
    toolLayout.showError('Resize failed. Please try again.');
    toolLayout.showLoading(false);
  }
}

function addResizeStyles() {
  if (document.querySelector('#resize-styles')) return;
  const styles = document.createElement('style');
  styles.id = 'resize-styles';
  styles.textContent = `
    .checkbox-label { display: flex; align-items: center; gap: var(--spacing-sm); cursor: pointer; }
    .checkbox-label input { width: 18px; height: 18px; }
    .preset-buttons { display: flex; flex-wrap: wrap; gap: var(--spacing-sm); margin-top: var(--spacing-md); }
    .btn-sm { padding: var(--spacing-xs) var(--spacing-sm); font-size: var(--text-xs); }
  `;
  document.head.appendChild(styles);
}
