/**
 * JSON to Image Converter
 * Render JSON data as a styled card
 */

import * as htmlToImage from 'html-to-image';

let currentJson = '{\n  "title": "Hello World",\n  "description": "This is a sample JSON card",\n  "stats": {\n    "views": 1234,\n    "likes": 567\n  }\n}';

export default function render(container: HTMLElement) {
  container.innerHTML = `
    <div class="tool-page animate-fade-in">
      <header class="tool-header">
        <a href="#/" class="tool-back-btn">←</a>
        <div>
          <h1 class="tool-title">JSON → Image</h1>
          <p style="color: var(--color-text-muted); font-size: var(--text-sm);">Render JSON data as a visual card</p>
        </div>
      </header>

      <div class="json-workspace">
        <div class="json-editor glass-card">
          <h3>JSON Input</h3>
          <textarea id="json-input" class="code-input">${currentJson}</textarea>
        </div>

        <div class="json-preview-container glass-card">
          <h3>Preview</h3>
          <div id="json-preview" class="json-preview"></div>
          <div class="json-actions">
            <button class="btn btn-primary" id="render-btn">Render to PNG</button>
            <button class="btn btn-secondary" id="download-btn" disabled>Download</button>
          </div>
        </div>
      </div>
    </div>
  `;

  addJsonStyles();
  updatePreview();
  setupEventListeners(container);
}

function updatePreview() {
  const preview = document.querySelector('#json-preview') as HTMLElement;
  if (!preview) return;

  try {
    const data = JSON.parse(currentJson);
    preview.innerHTML = renderJsonCard(data);
  } catch (e) {
    preview.innerHTML = '<p style="color: #f97316;">Invalid JSON</p>';
  }
}

function renderJsonCard(data: any, depth = 0): string {
  if (data === null) return '<span class="json-null">null</span>';
  if (typeof data === 'boolean') return `<span class="json-bool">${data}</span>`;
  if (typeof data === 'number') return `<span class="json-num">${data}</span>`;
  if (typeof data === 'string') return `<span class="json-str">"${data}"</span>`;

  if (Array.isArray(data)) {
    return `<div class="json-array">[${data.map(item => renderJsonCard(item, depth + 1)).join(', ')}]</div>`;
  }

  if (typeof data === 'object') {
    const entries = Object.entries(data).map(([key, value]) =>
      `<div class="json-entry"><span class="json-key">${key}:</span> ${renderJsonCard(value, depth + 1)}</div>`
    ).join('');
    return `<div class="json-object" style="padding-left: ${depth * 16}px;">${entries}</div>`;
  }

  return String(data);
}

function setupEventListeners(container: HTMLElement) {
  const jsonInput = container.querySelector('#json-input') as HTMLTextAreaElement;
  const preview = container.querySelector('#json-preview') as HTMLElement;
  const renderBtn = container.querySelector('#render-btn') as HTMLButtonElement;
  const downloadBtn = container.querySelector('#download-btn') as HTMLButtonElement;
  let resultBlob: Blob | null = null;

  jsonInput.addEventListener('input', () => {
    currentJson = jsonInput.value;
    updatePreview();
  });

  renderBtn.addEventListener('click', async () => {
    renderBtn.disabled = true;
    renderBtn.textContent = 'Rendering...';

    try {
      const dataUrl = await htmlToImage.toPng(preview, { quality: 1, pixelRatio: 2, backgroundColor: '#1a1a24' });
      const response = await fetch(dataUrl);
      resultBlob = await response.blob();
      downloadBtn.disabled = false;
    } catch (error) {
      console.error('Render failed:', error);
    }

    renderBtn.disabled = false;
    renderBtn.textContent = 'Render to PNG';
  });

  downloadBtn.addEventListener('click', () => {
    if (!resultBlob) return;
    const url = URL.createObjectURL(resultBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `json-card-${Date.now()}.png`;
    a.click();
    URL.revokeObjectURL(url);
  });
}

function addJsonStyles() {
  if (document.querySelector('#json-to-image-styles')) return;
  const styles = document.createElement('style');
  styles.id = 'json-to-image-styles';
  styles.textContent = `
    .json-workspace { display: flex; flex-direction: column; gap: var(--spacing-lg); }
    .json-editor, .json-preview-container { padding: var(--spacing-lg); }
    .json-editor h3, .json-preview-container h3 { margin: 0 0 var(--spacing-md); font-size: var(--text-base); }
    .code-input { width: 100%; min-height: 200px; padding: var(--spacing-md); background: var(--color-bg-secondary);
      border: var(--glass-border); border-radius: var(--radius-md); color: var(--color-text-primary);
      font-family: var(--font-mono); font-size: var(--text-sm); resize: vertical; }
    .json-preview { min-height: 200px; padding: var(--spacing-lg); background: var(--color-bg-secondary);
      border-radius: var(--radius-md); font-family: var(--font-mono); font-size: var(--text-sm); }
    .json-actions { display: flex; gap: var(--spacing-md); margin-top: var(--spacing-lg); }
    .json-actions .btn { flex: 1; }
    .json-key { color: var(--accent-purple); }
    .json-str { color: var(--accent-green); }
    .json-num { color: var(--accent-blue); }
    .json-bool { color: var(--accent-orange); }
    .json-null { color: var(--color-text-muted); }
    .json-entry { margin: var(--spacing-xs) 0; }
    @media (min-width: 1024px) { .json-workspace { flex-direction: row; } .json-editor, .json-preview-container { flex: 1; } }
  `;
  document.head.appendChild(styles);
}
