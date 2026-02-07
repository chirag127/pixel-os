/**
 * Blur Area Tool
 * Manually blur rectangular areas
 */

import { createToolLayout, ToolLayout } from '../../components/ToolLayout';

let toolLayout: ToolLayout | null = null;
let currentFile: File | null = null;
let blurAmount = 20;
let startX = 25; // Percentage
let startY = 25;
let endX = 75;
let endY = 75;

export default function render(container: HTMLElement) {
  toolLayout = createToolLayout(container, {
    id: 'blur-area',
    title: 'Blur Area',
    description: 'Blur selected rectangular regions',
    onFileSelect: handleFileSelect,
    renderControls: renderControls,
    seoContent: `<h2>Blur Selected Areas</h2><p>Manually blur any rectangular area of your image for privacy protection.</p>`
  });
}

function handleFileSelect(file: File) { currentFile = file; }

function renderControls(container: HTMLElement) {
  container.innerHTML = `
    <div class="control-group">
      <label class="control-label">Blur Amount: <span id="blur-value">${blurAmount}px</span></label>
      <input type="range" class="slider" id="blur-slider" min="5" max="50" value="${blurAmount}" step="5"/>
    </div>
    <div class="control-group">
      <label class="control-label">Area X: <span id="x-value">${startX}% - ${endX}%</span></label>
      <div style="display: flex; gap: var(--spacing-sm);">
        <input type="range" class="slider" id="startx-slider" min="0" max="100" value="${startX}" style="flex: 1;"/>
        <input type="range" class="slider" id="endx-slider" min="0" max="100" value="${endX}" style="flex: 1;"/>
      </div>
    </div>
    <div class="control-group">
      <label class="control-label">Area Y: <span id="y-value">${startY}% - ${endY}%</span></label>
      <div style="display: flex; gap: var(--spacing-sm);">
        <input type="range" class="slider" id="starty-slider" min="0" max="100" value="${startY}" style="flex: 1;"/>
        <input type="range" class="slider" id="endy-slider" min="0" max="100" value="${endY}" style="flex: 1;"/>
      </div>
    </div>
    <div class="quick-presets">
      <button class="btn btn-secondary" data-preset="center">Center</button>
      <button class="btn btn-secondary" data-preset="top">Top</button>
      <button class="btn btn-secondary" data-preset="bottom">Bottom</button>
    </div>
  `;

  addBlurAreaStyles();

  const blurSlider = container.querySelector('#blur-slider') as HTMLInputElement;
  const startXSlider = container.querySelector('#startx-slider') as HTMLInputElement;
  const endXSlider = container.querySelector('#endx-slider') as HTMLInputElement;
  const startYSlider = container.querySelector('#starty-slider') as HTMLInputElement;
  const endYSlider = container.querySelector('#endy-slider') as HTMLInputElement;

  blurSlider.addEventListener('input', () => {
    blurAmount = parseInt(blurSlider.value);
    (container.querySelector('#blur-value') as HTMLElement).textContent = `${blurAmount}px`;
  });

  const updateXValue = () => {
    startX = parseInt(startXSlider.value);
    endX = parseInt(endXSlider.value);
    (container.querySelector('#x-value') as HTMLElement).textContent = `${startX}% - ${endX}%`;
  };

  const updateYValue = () => {
    startY = parseInt(startYSlider.value);
    endY = parseInt(endYSlider.value);
    (container.querySelector('#y-value') as HTMLElement).textContent = `${startY}% - ${endY}%`;
  };

  startXSlider.addEventListener('input', updateXValue);
  endXSlider.addEventListener('input', updateXValue);
  startYSlider.addEventListener('input', updateYValue);
  endYSlider.addEventListener('input', updateYValue);

  const presets: Record<string, [number, number, number, number]> = {
    center: [25, 25, 75, 75],
    top: [0, 0, 100, 40],
    bottom: [0, 60, 100, 100]
  };

  container.querySelectorAll('[data-preset]').forEach(btn => {
    btn.addEventListener('click', () => {
      const [sx, sy, ex, ey] = presets[(btn as HTMLElement).dataset.preset!];
      startX = sx; startY = sy; endX = ex; endY = ey;
      startXSlider.value = String(sx);
      startYSlider.value = String(sy);
      endXSlider.value = String(ex);
      endYSlider.value = String(ey);
      updateXValue();
      updateYValue();
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
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);

    // Calculate blur region
    const x = Math.min(startX, endX) / 100 * canvas.width;
    const y = Math.min(startY, endY) / 100 * canvas.height;
    const w = Math.abs(endX - startX) / 100 * canvas.width;
    const h = Math.abs(endY - startY) / 100 * canvas.height;

    // Create blurred version
    const blurCanvas = document.createElement('canvas');
    blurCanvas.width = w;
    blurCanvas.height = h;
    const blurCtx = blurCanvas.getContext('2d')!;

    // Pixelate effect (more reliable than filter blur)
    const pixelSize = blurAmount / 2;
    blurCtx.imageSmoothingEnabled = false;
    blurCtx.drawImage(img, x, y, w, h, 0, 0, w / pixelSize, h / pixelSize);
    blurCtx.drawImage(blurCanvas, 0, 0, w / pixelSize, h / pixelSize, 0, 0, w, h);

    ctx.drawImage(blurCanvas, x, y);

    const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), 'image/png', 1.0));
    URL.revokeObjectURL(imageURL);
    toolLayout.showResult(blob);
    toolLayout.showLoading(false);
  } catch (error) {
    toolLayout.showError('Blur failed.');
    toolLayout.showLoading(false);
  }
}

function addBlurAreaStyles() {
  if (document.querySelector('#blur-area-styles')) return;
  const styles = document.createElement('style');
  styles.id = 'blur-area-styles';
  styles.textContent = `.quick-presets { display: flex; flex-wrap: wrap; gap: var(--spacing-sm); margin-top: var(--spacing-md); }`;
  document.head.appendChild(styles);
}
