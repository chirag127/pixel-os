/**
 * Social Card (OG Image) Generator
 */

import * as htmlToImage from 'html-to-image';

let title = 'My Amazing Article';
let description = 'A brief description of what this article is about';
let bgColor = '#667eea';
let emoji = '🚀';

export default function render(container: HTMLElement) {
  container.innerHTML = `
    <div class="tool-page animate-fade-in">
      <header class="tool-header">
        <a href="#/" class="tool-back-btn">←</a>
        <div>
          <h1 class="tool-title">Social Card</h1>
          <p style="color: var(--color-text-muted); font-size: var(--text-sm);">Create OG images for social sharing</p>
        </div>
      </header>

      <div class="social-workspace">
        <div class="social-preview glass-card">
          <div id="social-card" class="social-card" style="background: ${bgColor};">
            <div class="social-emoji">${emoji}</div>
            <h2 class="social-title">${title}</h2>
            <p class="social-desc">${description}</p>
          </div>
        </div>

        <div class="social-controls glass-card">
          <div class="control-group">
            <label class="control-label">Title</label>
            <input type="text" id="title-input" class="input" value="${title}"/>
          </div>
          <div class="control-group">
            <label class="control-label">Description</label>
            <textarea id="desc-input" class="input" style="min-height: 80px;">${description}</textarea>
          </div>
          <div class="control-group">
            <label class="control-label">Emoji</label>
            <input type="text" id="emoji-input" class="input" value="${emoji}" style="font-size: var(--text-xl);"/>
          </div>
          <div class="control-group">
            <label class="control-label">Background</label>
            <input type="color" id="bg-color" value="${bgColor}" style="width: 100%; height: 40px; cursor: pointer;"/>
          </div>
          <div class="tool-actions">
            <button class="btn btn-primary" id="download-btn">Download (1200×630)</button>
          </div>
        </div>
      </div>
    </div>
  `;

  addSocialStyles();
  setupEventListeners(container);
}

function updatePreview() {
  const card = document.querySelector('#social-card') as HTMLElement;
  card.style.background = bgColor;
  (card.querySelector('.social-emoji') as HTMLElement).textContent = emoji;
  (card.querySelector('.social-title') as HTMLElement).textContent = title;
  (card.querySelector('.social-desc') as HTMLElement).textContent = description;
}

function setupEventListeners(container: HTMLElement) {
  const titleInput = container.querySelector('#title-input') as HTMLInputElement;
  const descInput = container.querySelector('#desc-input') as HTMLTextAreaElement;
  const emojiInput = container.querySelector('#emoji-input') as HTMLInputElement;
  const bgInput = container.querySelector('#bg-color') as HTMLInputElement;
  const downloadBtn = container.querySelector('#download-btn') as HTMLButtonElement;

  titleInput.addEventListener('input', () => { title = titleInput.value; updatePreview(); });
  descInput.addEventListener('input', () => { description = descInput.value; updatePreview(); });
  emojiInput.addEventListener('input', () => { emoji = emojiInput.value; updatePreview(); });
  bgInput.addEventListener('input', () => { bgColor = bgInput.value; updatePreview(); });

  downloadBtn.addEventListener('click', async () => {
    downloadBtn.disabled = true;
    downloadBtn.textContent = 'Generating...';

    try {
      const card = container.querySelector('#social-card') as HTMLElement;
      const dataUrl = await htmlToImage.toPng(card, {
        quality: 1,
        pixelRatio: 2,
        width: 1200,
        height: 630,
        style: { width: '1200px', height: '630px' }
      });

      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `og-image-${Date.now()}.png`;
      a.click();
    } catch (error) {
      console.error('Generation failed:', error);
    }

    downloadBtn.disabled = false;
    downloadBtn.textContent = 'Download (1200×630)';
  });
}

function addSocialStyles() {
  if (document.querySelector('#social-styles')) return;
  const styles = document.createElement('style');
  styles.id = 'social-styles';
  styles.textContent = `
    .social-workspace { display: flex; flex-direction: column; gap: var(--spacing-lg); }
    .social-preview, .social-controls { padding: var(--spacing-lg); }
    .social-card { aspect-ratio: 1200/630; border-radius: var(--radius-lg); color: white; padding: 60px;
      display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; }
    .social-emoji { font-size: 64px; margin-bottom: 24px; }
    .social-title { font-size: 48px; font-weight: 700; margin: 0 0 16px; }
    .social-desc { font-size: 24px; opacity: 0.9; margin: 0; max-width: 80%; }
    .tool-actions { margin-top: var(--spacing-md); }
    .tool-actions .btn { width: 100%; }
    @media (min-width: 1024px) { .social-workspace { flex-direction: row; } .social-preview { flex: 2; } .social-controls { flex: 1; min-width: 300px; } }
  `;
  document.head.appendChild(styles);
}
