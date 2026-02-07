/**
 * Markup Tool
 * Annotate screenshots with arrows, boxes, text
 */

import { createToolLayout, ToolLayout } from '../../components/ToolLayout';

let toolLayout: ToolLayout | null = null;
let currentFile: File | null = null;
let currentTool = 'arrow';
let color = '#ff0000';

export default function render(container: HTMLElement) {
  toolLayout = createToolLayout(container, {
    id: 'markup',
    title: 'Markup',
    description: 'Annotate screenshots with arrows and shapes',
    onFileSelect: handleFileSelect,
    renderControls: renderControls,
    seoContent: `<h2>Annotate Screenshots</h2><p>Add arrows, boxes, circles, and text to highlight important areas in your screenshots.</p>`
  });
}

function handleFileSelect(file: File) { currentFile = file; }

function renderControls(container: HTMLElement) {
  container.innerHTML = `
    <div class="control-group">
      <label class="control-label">Tool</label>
      <div class="tool-buttons">
        <button class="btn btn-secondary tool-btn active" data-tool="arrow">➡️ Arrow</button>
        <button class="btn btn-secondary tool-btn" data-tool="box">⬜ Box</button>
        <button class="btn btn-secondary tool-btn" data-tool="circle">⭕ Circle</button>
        <button class="btn btn-secondary tool-btn" data-tool="text">T Text</button>
      </div>
    </div>
    <div class="control-group">
      <label class="control-label">Color</label>
      <input type="color" id="color-input" value="${color}" style="width: 100%; height: 40px; border: none; cursor: pointer;"/>
    </div>
    <div class="info-box glass-card" style="padding: var(--spacing-md); margin-top: var(--spacing-md);">
      <p style="margin: 0; font-size: var(--text-sm);">Click "Process" to apply a sample annotation. Full drawing canvas coming soon!</p>
    </div>
  `;

  addMarkupStyles();

  container.querySelectorAll('.tool-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentTool = (btn as HTMLElement).dataset.tool!;
    });
  });

  const colorInput = container.querySelector('#color-input') as HTMLInputElement;
  colorInput.addEventListener('input', () => { color = colorInput.value; });

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

    // Draw sample annotation based on tool
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 4;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    switch (currentTool) {
      case 'arrow':
        drawArrow(ctx, centerX - 100, centerY, centerX + 100, centerY);
        break;
      case 'box':
        ctx.strokeRect(centerX - 100, centerY - 50, 200, 100);
        break;
      case 'circle':
        ctx.beginPath();
        ctx.arc(centerX, centerY, 80, 0, Math.PI * 2);
        ctx.stroke();
        break;
      case 'text':
        ctx.font = 'bold 36px sans-serif';
        ctx.fillText('Sample Text', centerX - 80, centerY);
        break;
    }

    const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), 'image/png', 1.0));
    URL.revokeObjectURL(imageURL);
    toolLayout.showResult(blob);
    toolLayout.showLoading(false);
  } catch (error) {
    toolLayout.showError('Markup failed.');
    toolLayout.showLoading(false);
  }
}

function drawArrow(ctx: CanvasRenderingContext2D, fromX: number, fromY: number, toX: number, toY: number) {
  const headLen = 20;
  const angle = Math.atan2(toY - fromY, toX - fromX);

  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.lineTo(toX - headLen * Math.cos(angle - Math.PI / 6), toY - headLen * Math.sin(angle - Math.PI / 6));
  ctx.moveTo(toX, toY);
  ctx.lineTo(toX - headLen * Math.cos(angle + Math.PI / 6), toY - headLen * Math.sin(angle + Math.PI / 6));
  ctx.stroke();
}

function addMarkupStyles() {
  if (document.querySelector('#markup-styles')) return;
  const styles = document.createElement('style');
  styles.id = 'markup-styles';
  styles.textContent = `
    .tool-buttons { display: flex; flex-wrap: wrap; gap: var(--spacing-sm); }
    .tool-btn.active { background: var(--accent-gradient); color: white; }
  `;
  document.head.appendChild(styles);
}
