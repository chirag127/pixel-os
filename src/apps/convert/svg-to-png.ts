/**
 * SVG to PNG Converter
 */

import { createToolLayout, ToolLayout } from '../../components/ToolLayout';

let toolLayout: ToolLayout | null = null;
let currentFile: File | null = null;
let scale = 2;

export default function render(container: HTMLElement) {
  toolLayout = createToolLayout(container, {
    id: 'svg-to-png',
    title: 'SVG → PNG',
    description: 'Render vector SVG to bitmap PNG',
    acceptTypes: ['image/svg+xml', '.svg'],
    onFileSelect: handleFileSelect,
    renderControls: renderControls,
    seoContent: `<h2>Convert SVG to PNG</h2><p>Render scalable vector graphics to high-resolution PNG images. Choose your output scale for crisp results.</p>`
  });
}

function handleFileSelect(file: File) { currentFile = file; }

function renderControls(container: HTMLElement) {
  container.innerHTML = `
    <div class="control-group">
      <label class="control-label">Scale: <span id="scale-value">${scale}x</span></label>
      <input type="range" class="slider" id="scale-slider" min="1" max="8" value="${scale}" step="1"/>
      <p class="control-hint">Higher scale = larger output resolution</p>
    </div>
    <div class="scale-presets">
      <button class="btn btn-secondary" data-scale="1">1x</button>
      <button class="btn btn-secondary" data-scale="2">2x</button>
      <button class="btn btn-secondary" data-scale="4">4x</button>
      <button class="btn btn-secondary" data-scale="8">8x</button>
    </div>
  `;

  const scaleSlider = container.querySelector('#scale-slider') as HTMLInputElement;
  const scaleValue = container.querySelector('#scale-value') as HTMLSpanElement;
  scaleSlider.addEventListener('input', () => { scale = parseInt(scaleSlider.value); scaleValue.textContent = `${scale}x`; });

  container.querySelectorAll('[data-scale]').forEach(btn => {
    btn.addEventListener('click', () => {
      scale = parseInt((btn as HTMLElement).dataset.scale!);
      scaleSlider.value = String(scale);
      scaleValue.textContent = `${scale}x`;
    });
  });

  addSvgStyles();
  toolLayout?.getProcessButton()?.addEventListener('click', processImage);
}

async function processImage() {
  if (!currentFile || !toolLayout) return;
  toolLayout.showLoading(true);

  try {
    const svgText = await currentFile.text();
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
    const svgEl = svgDoc.documentElement;

    // Get SVG dimensions
    let width = parseFloat(svgEl.getAttribute('width') || '300');
    let height = parseFloat(svgEl.getAttribute('height') || '150');

    // Try viewBox if no explicit dimensions
    const viewBox = svgEl.getAttribute('viewBox');
    if (viewBox) {
      const parts = viewBox.split(/[\s,]+/).map(parseFloat);
      if (parts.length === 4) {
        width = parts[2];
        height = parts[3];
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext('2d')!;

    const img = new Image();
    const svgBlob = new Blob([svgText], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(svgBlob);

    await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; img.src = url; });

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(url);

    const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), 'image/png', 1.0));
    toolLayout.showResult(blob);
    toolLayout.showLoading(false);
  } catch (error) {
    toolLayout.showError('SVG conversion failed.');
    toolLayout.showLoading(false);
  }
}

function addSvgStyles() {
  if (document.querySelector('#svg-styles')) return;
  const styles = document.createElement('style');
  styles.id = 'svg-styles';
  styles.textContent = `.scale-presets { display: flex; flex-wrap: wrap; gap: var(--spacing-sm); margin-top: var(--spacing-md); }`;
  document.head.appendChild(styles);
}
