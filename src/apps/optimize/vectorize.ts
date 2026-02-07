/**
 * Vectorize Tool
 * Simple raster to SVG conversion
 */

import { createToolLayout, ToolLayout } from '../../components/ToolLayout';

let toolLayout: ToolLayout | null = null;
let currentFile: File | null = null;

export default function render(container: HTMLElement) {
  toolLayout = createToolLayout(container, {
    id: 'vectorize',
    title: 'Vectorize Image',
    description: 'Convert raster images to SVG vectors',
    onFileSelect: handleFileSelect,
    renderControls: renderControls,
    seoContent: `
      <h2>Image Vectorization</h2>
      <p>Convert raster images (PNG, JPG) into scalable vector graphics (SVG). Vectorization is ideal for logos, icons, and simple graphics that need to scale to any size without quality loss.</p>
      <h3>Best Results</h3>
      <p>Vectorization works best with:</p>
      <ul>
        <li>High-contrast images</li>
        <li>Simple shapes and solid colors</li>
        <li>Logos and icons</li>
        <li>Line art and illustrations</li>
      </ul>
      <p>Note: Complex photographs don't vectorize well and will result in large SVG files.</p>
    `
  });
}

function handleFileSelect(file: File) {
  currentFile = file;
}

function renderControls(container: HTMLElement) {
  container.innerHTML = `
    <div class="control-group">
      <label class="control-label">
        Color Precision
      </label>
      <select class="input" id="precision-select">
        <option value="low">Low (Fewer colors)</option>
        <option value="medium" selected>Medium</option>
        <option value="high">High (More detail)</option>
      </select>
      <p class="control-hint">Higher precision = larger SVG file</p>
    </div>

    <div class="info-box glass-card" style="padding: var(--spacing-md); margin-bottom: var(--spacing-md); background: rgba(34, 197, 94, 0.1); border-color: var(--accent-green);">
      <p style="margin: 0; font-size: var(--text-sm);">
        💡 This tool creates a simple SVG trace. For best results, use high-contrast images with solid colors.
      </p>
    </div>
  `;

  const processBtn = toolLayout?.getProcessButton();
  processBtn?.addEventListener('click', processImage);
}

async function processImage() {
  if (!currentFile || !toolLayout) return;

  toolLayout.showLoading(true);

  try {
    // Load image onto canvas
    const img = new Image();
    const imageURL = URL.createObjectURL(currentFile);

    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = imageURL;
    });

    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);

    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Simple vectorization using posterization
    const svg = createSimpleSVG(imageData, canvas.width, canvas.height);

    // Convert SVG string to blob
    const blob = new Blob([svg], { type: 'image/svg+xml' });

    URL.revokeObjectURL(imageURL);

    toolLayout.showResult(blob);
    toolLayout.showLoading(false);

  } catch (error) {
    console.error('Vectorization failed:', error);
    toolLayout.showError('Vectorization failed. Please try again.');
    toolLayout.showLoading(false);
  }
}

function createSimpleSVG(imageData: ImageData, width: number, height: number): string {
  // This is a very simplified vectorization
  // A real implementation would use potrace or similar algorithms

  const colors = extractDominantColors(imageData, 8);
  let rects = '';

  // Sample pixels at reduced resolution for performance
  const step = 4;
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const i = (y * width + x) * 4;
      const r = imageData.data[i];
      const g = imageData.data[i + 1];
      const b = imageData.data[i + 2];
      const a = imageData.data[i + 3] / 255;

      if (a > 0.1) {
        const color = findClosestColor([r, g, b], colors);
        rects += `<rect x="${x}" y="${y}" width="${step}" height="${step}" fill="rgb(${color.join(',')})" opacity="${a.toFixed(2)}"/>`;
      }
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  ${rects}
</svg>`;
}

function extractDominantColors(imageData: ImageData, count: number): number[][] {
  // Simple color quantization
  const colorMap = new Map<string, number>();

  for (let i = 0; i < imageData.data.length; i += 16) { // Sample every 4th pixel
    const r = Math.round(imageData.data[i] / 32) * 32;
    const g = Math.round(imageData.data[i + 1] / 32) * 32;
    const b = Math.round(imageData.data[i + 2] / 32) * 32;
    const key = `${r},${g},${b}`;
    colorMap.set(key, (colorMap.get(key) || 0) + 1);
  }

  return Array.from(colorMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([key]) => key.split(',').map(Number));
}

function findClosestColor(rgb: number[], palette: number[][]): number[] {
  let closest = palette[0];
  let minDist = Infinity;

  for (const color of palette) {
    const dist = Math.sqrt(
      Math.pow(rgb[0] - color[0], 2) +
      Math.pow(rgb[1] - color[1], 2) +
      Math.pow(rgb[2] - color[2], 2)
    );
    if (dist < minDist) {
      minDist = dist;
      closest = color;
    }
  }

  return closest;
}
