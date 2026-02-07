/**
 * Flip Tool
 * Mirror images horizontally or vertically
 */

import { createToolLayout, ToolLayout } from '../../components/ToolLayout';

let toolLayout: ToolLayout | null = null;
let currentFile: File | null = null;
let flipH = false;
let flipV = false;

export default function render(container: HTMLElement) {
  toolLayout = createToolLayout(container, {
    id: 'flip',
    title: 'Flip Image',
    description: 'Mirror images horizontally or vertically',
    onFileSelect: handleFileSelect,
    renderControls: renderControls,
    seoContent: `<h2>Flip Images</h2><p>Mirror your images horizontally or vertically. Useful for selfies and creative effects.</p>`
  });
}

function handleFileSelect(file: File) { currentFile = file; flipH = false; flipV = false; }

function renderControls(container: HTMLElement) {
  container.innerHTML = `
    <div class="flip-buttons">
      <button class="btn btn-secondary flip-btn ${flipH ? 'active' : ''}" id="flip-h">
        <span style="font-size: 1.5rem;">↔️</span>
        <span>Flip Horizontal</span>
      </button>
      <button class="btn btn-secondary flip-btn ${flipV ? 'active' : ''}" id="flip-v">
        <span style="font-size: 1.5rem;">↕️</span>
        <span>Flip Vertical</span>
      </button>
    </div>
  `;

  addFlipStyles();

  container.querySelector('#flip-h')?.addEventListener('click', () => {
    flipH = !flipH;
    container.querySelector('#flip-h')?.classList.toggle('active', flipH);
  });

  container.querySelector('#flip-v')?.addEventListener('click', () => {
    flipV = !flipV;
    container.querySelector('#flip-v')?.classList.toggle('active', flipV);
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

    ctx.translate(flipH ? img.width : 0, flipV ? img.height : 0);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
    ctx.drawImage(img, 0, 0);

    const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), 'image/png', 1.0));
    URL.revokeObjectURL(imageURL);
    toolLayout.showResult(blob);
    toolLayout.showLoading(false);
  } catch (error) {
    toolLayout.showError('Flip failed.');
    toolLayout.showLoading(false);
  }
}

function addFlipStyles() {
  if (document.querySelector('#flip-styles')) return;
  const styles = document.createElement('style');
  styles.id = 'flip-styles';
  styles.textContent = `
    .flip-buttons { display: flex; flex-direction: column; gap: var(--spacing-md); }
    .flip-btn { display: flex; align-items: center; gap: var(--spacing-md); padding: var(--spacing-lg); justify-content: center; }
    .flip-btn.active { background: var(--accent-gradient); color: white; }
  `;
  document.head.appendChild(styles);
}
