/**
 * AI Vision Tool
 * Comprehensive image analysis
 */

import { createToolLayout, ToolLayout } from '../../components/ToolLayout';

let toolLayout: ToolLayout | null = null;
let currentFile: File | null = null;

export default function render(container: HTMLElement) {
  toolLayout = createToolLayout(container, {
    id: 'vision',
    title: 'AI Vision',
    description: 'Comprehensive image analysis',
    onFileSelect: handleFileSelect,
    renderControls: renderControls,
    seoContent: `<h2>AI Image Analysis</h2><p>Get detailed insights about your images including colors, composition, and technical metadata.</p>`
  });
}

function handleFileSelect(file: File) { currentFile = file; }

function renderControls(container: HTMLElement) {
  container.innerHTML = `
    <div class="info-box glass-card" style="padding: var(--spacing-lg);">
      <h4 style="margin: 0 0 var(--spacing-md); color: var(--accent-green);">👁️ Vision Analysis</h4>
      <p style="margin: 0; font-size: var(--text-sm); color: var(--color-text-secondary);">
        Analyzes colors, dimensions, and image properties.
      </p>
    </div>
    <div id="analysis-output" class="analysis-output" style="margin-top: var(--spacing-md);"></div>
  `;

  addVisionStyles();
  toolLayout?.getProcessButton()?.addEventListener('click', processImage);
}

async function processImage() {
  if (!currentFile || !toolLayout) return;
  toolLayout.showLoading(true);

  try {
    const img = new Image();
    const imageURL = URL.createObjectURL(currentFile);
    await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; img.src = imageURL; });

    // Analyze image
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);

    // Extract dominant colors
    const dominantColors = extractDominantColors(ctx, img.width, img.height);

    // Calculate brightness
    const brightness = calculateBrightness(ctx, img.width, img.height);

    // Prepare analysis
    const analysis = {
      dimensions: `${img.width} × ${img.height} pixels`,
      megapixels: ((img.width * img.height) / 1000000).toFixed(2) + ' MP',
      aspectRatio: getAspectRatio(img.width, img.height),
      orientation: img.width > img.height ? 'Landscape' : img.width < img.height ? 'Portrait' : 'Square',
      fileSize: formatSize(currentFile.size),
      fileType: currentFile.type.split('/')[1].toUpperCase(),
      brightness: brightness > 180 ? 'Bright' : brightness > 100 ? 'Normal' : 'Dark',
      dominantColors
    };

    // Display analysis
    const output = document.querySelector('#analysis-output') as HTMLElement;
    output.innerHTML = `
      <div class="analysis-card glass-card">
        <h4>📐 Dimensions</h4>
        <p>${analysis.dimensions}</p>
        <p class="muted">${analysis.megapixels} • ${analysis.aspectRatio} • ${analysis.orientation}</p>
      </div>
      <div class="analysis-card glass-card">
        <h4>📁 File Info</h4>
        <p>${analysis.fileType} • ${analysis.fileSize}</p>
      </div>
      <div class="analysis-card glass-card">
        <h4>☀️ Brightness</h4>
        <p>${analysis.brightness} (avg: ${Math.round(brightness)})</p>
      </div>
      <div class="analysis-card glass-card">
        <h4>🎨 Dominant Colors</h4>
        <div class="color-swatches">
          ${analysis.dominantColors.map(c => `
            <div class="color-swatch" style="background: ${c.hex};">
              <span class="color-label">${c.hex}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    URL.revokeObjectURL(imageURL);
    toolLayout.showLoading(false);
  } catch (error) {
    toolLayout.showError('Analysis failed.');
    toolLayout.showLoading(false);
  }
}

function extractDominantColors(ctx: CanvasRenderingContext2D, width: number, height: number): { hex: string }[] {
  const imageData = ctx.getImageData(0, 0, width, height).data;
  const colorCounts: Record<string, number> = {};

  // Sample every 10th pixel for performance
  for (let i = 0; i < imageData.length; i += 40) {
    const r = Math.round(imageData[i] / 32) * 32;
    const g = Math.round(imageData[i + 1] / 32) * 32;
    const b = Math.round(imageData[i + 2] / 32) * 32;
    const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    colorCounts[hex] = (colorCounts[hex] || 0) + 1;
  }

  return Object.entries(colorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([hex]) => ({ hex }));
}

function calculateBrightness(ctx: CanvasRenderingContext2D, width: number, height: number): number {
  const imageData = ctx.getImageData(0, 0, width, height).data;
  let total = 0;
  let count = 0;

  for (let i = 0; i < imageData.length; i += 40) {
    const r = imageData[i];
    const g = imageData[i + 1];
    const b = imageData[i + 2];
    total += (r + g + b) / 3;
    count++;
  }

  return total / count;
}

function getAspectRatio(w: number, h: number): string {
  const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
  const divisor = gcd(w, h);
  return `${w / divisor}:${h / divisor}`;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function addVisionStyles() {
  if (document.querySelector('#vision-styles')) return;
  const styles = document.createElement('style');
  styles.id = 'vision-styles';
  styles.textContent = `
    .analysis-output { display: flex; flex-direction: column; gap: var(--spacing-md); }
    .analysis-card { padding: var(--spacing-md); }
    .analysis-card h4 { margin: 0 0 var(--spacing-xs); font-size: var(--text-sm); color: var(--color-text-muted); }
    .analysis-card p { margin: 0; }
    .analysis-card .muted { font-size: var(--text-sm); color: var(--color-text-muted); margin-top: var(--spacing-xs); }
    .color-swatches { display: flex; gap: var(--spacing-sm); flex-wrap: wrap; }
    .color-swatch { width: 60px; height: 60px; border-radius: var(--radius-md); display: flex; align-items: flex-end;
      justify-content: center; padding: var(--spacing-xs); }
    .color-label { font-size: 10px; background: rgba(0,0,0,0.5); padding: 2px 4px; border-radius: 4px; color: white; }
  `;
  document.head.appendChild(styles);
}
