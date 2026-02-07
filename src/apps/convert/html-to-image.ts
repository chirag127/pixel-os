/**
 * HTML to Image Converter
 * Uses html-to-image library
 */

import * as htmlToImage from 'html-to-image';

let currentHtml = '<div style="padding: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-family: system-ui; border-radius: 16px;"><h1 style="margin: 0 0 16px;">Hello World</h1><p style="margin: 0; opacity: 0.9;">Edit this HTML to create your image</p></div>';

export default function render(container: HTMLElement) {
  container.innerHTML = `
    <div class="tool-page animate-fade-in">
      <header class="tool-header">
        <a href="#/" class="tool-back-btn">←</a>
        <div>
          <h1 class="tool-title">HTML → Image</h1>
          <p style="color: var(--color-text-muted); font-size: var(--text-sm);">Render HTML/CSS to PNG</p>
        </div>
      </header>

      <div class="html-workspace">
        <div class="html-editor glass-card">
          <h3>HTML Code</h3>
          <textarea id="html-input" class="code-input">${escapeHtml(currentHtml)}</textarea>
        </div>

        <div class="html-preview-container glass-card">
          <h3>Preview</h3>
          <div id="html-preview" class="html-preview">${currentHtml}</div>
          <div class="html-actions">
            <button class="btn btn-primary" id="render-btn">Render to PNG</button>
            <button class="btn btn-secondary" id="download-btn" disabled>Download</button>
          </div>
        </div>
      </div>
    </div>
  `;

  addHtmlStyles();
  setupEventListeners(container);
}

function setupEventListeners(container: HTMLElement) {
  const htmlInput = container.querySelector('#html-input') as HTMLTextAreaElement;
  const preview = container.querySelector('#html-preview') as HTMLElement;
  const renderBtn = container.querySelector('#render-btn') as HTMLButtonElement;
  const downloadBtn = container.querySelector('#download-btn') as HTMLButtonElement;
  let resultBlob: Blob | null = null;

  htmlInput.addEventListener('input', () => {
    currentHtml = htmlInput.value;
    preview.innerHTML = currentHtml;
  });

  renderBtn.addEventListener('click', async () => {
    renderBtn.disabled = true;
    renderBtn.textContent = 'Rendering...';

    try {
      const dataUrl = await htmlToImage.toPng(preview, { quality: 1, pixelRatio: 2 });
      const response = await fetch(dataUrl);
      resultBlob = await response.blob();

      // Show result
      const img = document.createElement('img');
      img.src = dataUrl;
      img.style.maxWidth = '100%';
      preview.innerHTML = '';
      preview.appendChild(img);

      downloadBtn.disabled = false;
    } catch (error) {
      console.error('Render failed:', error);
      alert('Render failed. Check your HTML for errors.');
    }

    renderBtn.disabled = false;
    renderBtn.textContent = 'Render to PNG';
  });

  downloadBtn.addEventListener('click', () => {
    if (!resultBlob) return;
    const url = URL.createObjectURL(resultBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `html-image-${Date.now()}.png`;
    a.click();
    URL.revokeObjectURL(url);
  });
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function addHtmlStyles() {
  if (document.querySelector('#html-to-image-styles')) return;
  const styles = document.createElement('style');
  styles.id = 'html-to-image-styles';
  styles.textContent = `
    .html-workspace { display: flex; flex-direction: column; gap: var(--spacing-lg); }
    .html-editor, .html-preview-container { padding: var(--spacing-lg); }
    .html-editor h3, .html-preview-container h3 { margin: 0 0 var(--spacing-md); font-size: var(--text-base); }
    .code-input { width: 100%; min-height: 200px; padding: var(--spacing-md); background: var(--color-bg-secondary);
      border: var(--glass-border); border-radius: var(--radius-md); color: var(--color-text-primary);
      font-family: var(--font-mono); font-size: var(--text-sm); resize: vertical; }
    .html-preview { min-height: 200px; padding: var(--spacing-lg); background: white; border-radius: var(--radius-md); overflow: auto; }
    .html-actions { display: flex; gap: var(--spacing-md); margin-top: var(--spacing-lg); }
    .html-actions .btn { flex: 1; }
    @media (min-width: 1024px) { .html-workspace { flex-direction: row; } .html-editor, .html-preview-container { flex: 1; } }
  `;
  document.head.appendChild(styles);
}
