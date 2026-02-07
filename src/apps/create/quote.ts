/**
 * Quote Card Tool
 * Create beautiful quote images
 */

import * as htmlToImage from 'html-to-image';

let quote = 'The only way to do great work is to love what you do.';
let author = 'Steve Jobs';
let bgColor = '#667eea';

export default function render(container: HTMLElement) {
  container.innerHTML = `
    <div class="tool-page animate-fade-in">
      <header class="tool-header">
        <a href="#/" class="tool-back-btn">←</a>
        <div>
          <h1 class="tool-title">Quote Card</h1>
          <p style="color: var(--color-text-muted); font-size: var(--text-sm);">Create beautiful quote images</p>
        </div>
      </header>

      <div class="quote-workspace">
        <div class="quote-controls glass-card">
          <div class="control-group">
            <label class="control-label">Quote</label>
            <textarea id="quote-input" class="input" style="min-height: 100px;">${quote}</textarea>
          </div>
          <div class="control-group">
            <label class="control-label">Author</label>
            <input type="text" id="author-input" class="input" value="${author}"/>
          </div>
          <div class="control-group">
            <label class="control-label">Background</label>
            <div class="color-presets">
              <button class="color-btn" data-color="#667eea" style="background: #667eea;"></button>
              <button class="color-btn" data-color="#ec4899" style="background: #ec4899;"></button>
              <button class="color-btn" data-color="#22c55e" style="background: #22c55e;"></button>
              <button class="color-btn" data-color="#f97316" style="background: #f97316;"></button>
              <button class="color-btn" data-color="#1a1a24" style="background: #1a1a24;"></button>
            </div>
          </div>
          <div class="tool-actions">
            <button class="btn btn-primary" id="render-btn">Create Image</button>
            <button class="btn btn-secondary" id="download-btn" disabled>Download</button>
          </div>
        </div>

        <div class="quote-preview glass-card">
          <div id="quote-card" class="quote-card" style="background: ${bgColor};">
            <div class="quote-mark">"</div>
            <p class="quote-text">${quote}</p>
            <p class="quote-author">— ${author}</p>
          </div>
        </div>
      </div>
    </div>
  `;

  addQuoteStyles();
  setupEventListeners(container);
}

function updatePreview() {
  const card = document.querySelector('#quote-card') as HTMLElement;
  const text = card.querySelector('.quote-text') as HTMLElement;
  const authorEl = card.querySelector('.quote-author') as HTMLElement;

  card.style.background = bgColor;
  text.textContent = quote;
  authorEl.textContent = `— ${author}`;
}

function setupEventListeners(container: HTMLElement) {
  const quoteInput = container.querySelector('#quote-input') as HTMLTextAreaElement;
  const authorInput = container.querySelector('#author-input') as HTMLInputElement;
  const renderBtn = container.querySelector('#render-btn') as HTMLButtonElement;
  const downloadBtn = container.querySelector('#download-btn') as HTMLButtonElement;
  let resultBlob: Blob | null = null;

  quoteInput.addEventListener('input', () => { quote = quoteInput.value; updatePreview(); });
  authorInput.addEventListener('input', () => { author = authorInput.value; updatePreview(); });

  container.querySelectorAll('.color-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      bgColor = (btn as HTMLElement).dataset.color!;
      updatePreview();
    });
  });

  renderBtn.addEventListener('click', async () => {
    const card = container.querySelector('#quote-card') as HTMLElement;
    renderBtn.disabled = true;

    try {
      const dataUrl = await htmlToImage.toPng(card, { quality: 1, pixelRatio: 2 });
      const response = await fetch(dataUrl);
      resultBlob = await response.blob();
      downloadBtn.disabled = false;
    } catch (error) {
      console.error('Render failed:', error);
    }

    renderBtn.disabled = false;
  });

  downloadBtn.addEventListener('click', () => {
    if (!resultBlob) return;
    const url = URL.createObjectURL(resultBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quote-${Date.now()}.png`;
    a.click();
    URL.revokeObjectURL(url);
  });
}

function addQuoteStyles() {
  if (document.querySelector('#quote-styles')) return;
  const styles = document.createElement('style');
  styles.id = 'quote-styles';
  styles.textContent = `
    .quote-workspace { display: flex; flex-direction: column; gap: var(--spacing-lg); }
    .quote-controls, .quote-preview { padding: var(--spacing-lg); }
    .quote-card { padding: 60px; border-radius: 16px; color: white; text-align: center; min-height: 300px;
      display: flex; flex-direction: column; justify-content: center; position: relative; }
    .quote-mark { font-size: 100px; opacity: 0.2; position: absolute; top: 20px; left: 30px; font-family: Georgia, serif; }
    .quote-text { font-size: 28px; line-height: 1.6; margin: 0 0 24px; font-weight: 500; }
    .quote-author { font-size: 18px; opacity: 0.8; margin: 0; }
    .color-presets { display: flex; gap: var(--spacing-sm); }
    .color-btn { width: 40px; height: 40px; border-radius: var(--radius-md); border: 2px solid transparent; cursor: pointer; }
    .color-btn:hover { border-color: white; }
    .tool-actions { display: flex; gap: var(--spacing-md); margin-top: var(--spacing-md); }
    .tool-actions .btn { flex: 1; }
    @media (min-width: 1024px) { .quote-workspace { flex-direction: row; } .quote-controls { width: 320px; } .quote-preview { flex: 1; } }
  `;
  document.head.appendChild(styles);
}
