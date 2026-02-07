/**
 * Coming Soon Page Template
 * Used for tools that are not yet implemented
 */

import { drives } from '../shell';

interface PageOptions {
  driveId?: string;
  toolId?: string;
}

export function renderComingSoon(container: HTMLElement, options: PageOptions = {}) {
  const drive = options.driveId ? drives.find(d => d.id === options.driveId) : null;
  const tool = drive?.tools.find(t => t.id === options.toolId);

  container.innerHTML = `
    <div class="coming-soon-page animate-fade-in">
      <div class="coming-soon-content glass-card">
        <div class="coming-soon-icon">🚧</div>
        <h1 class="coming-soon-title">${tool?.name || 'Coming Soon'}</h1>
        <p class="coming-soon-desc">
          ${tool?.desc || 'This tool is currently under development.'}
        </p>
        <div class="coming-soon-progress">
          <div class="progress">
            <div class="progress-bar" style="width: 30%"></div>
          </div>
          <span class="coming-soon-percent">30% Complete</span>
        </div>
        <div class="coming-soon-actions">
          <a href="#/" class="btn btn-primary">← Back to Home</a>
          ${drive ? `<a href="#/apps/${drive.id}" class="btn btn-secondary">View ${drive.name} Tools</a>` : ''}
        </div>
      </div>

      ${drive ? `
      <section class="related-tools">
        <h2>Other ${drive.name} Tools</h2>
        <div class="tool-grid">
          ${drive.tools.filter(t => t.id !== options.toolId).slice(0, 4).map(t => `
            <a href="#/apps/${drive.id}/${t.id}" class="tool-card glass-card">
              <div class="tool-card-icon" style="background: ${drive.color}20; color: ${drive.color}">
                ${getToolIcon(t.id)}
              </div>
              <h3 class="tool-card-title">${t.name}</h3>
              <p class="tool-card-desc">${t.desc}</p>
            </a>
          `).join('')}
        </div>
      </section>
      ` : ''}
    </div>
  `;

  addComingSoonStyles();
}

function getToolIcon(toolId: string): string {
  const icons: Record<string, string> = {
    'compress-jpg': '📦', 'compress-png': '📦', 'compress-webp': '📦',
    'upscale': '🔍', 'remove-bg': '✂️', 'vectorize': '📐',
    'resize': '↔️', 'crop': '✂️', 'rotate': '🔄', 'flip': '↕️',
    'circle-crop': '⭕', 'skew': '📐',
    'jpg-to-png': '🔄', 'png-to-jpg': '🔄', 'webp-to-jpg': '🔄',
    'heic-to-jpg': '📱', 'svg-to-png': '🖼️', 'html-to-image': '🌐',
    'image-to-base64': '🔗', 'json-to-image': '📊',
    'meme': '😂', 'collage': '🖼️', 'markup': '✏️', 'quote': '💬',
    'gradient': '🌈', 'social-card': '📱', 'qr-art': '📲',
    'watermark': '💧', 'blur-face': '🙈', 'blur-area': '🔲',
    'exif-remove': '🗑️', 'exif-view': '👁️', 'pixelate': '▦',
    'caption': '💬', 'tags': '#️⃣', 'vision': '👁️'
  };
  return icons[toolId] || '🔧';
}

function addComingSoonStyles() {
  if (document.querySelector('#coming-soon-styles')) return;

  const styles = document.createElement('style');
  styles.id = 'coming-soon-styles';
  styles.textContent = `
    .coming-soon-page {
      max-width: 800px;
      margin: 0 auto;
      padding: var(--spacing-lg);
    }

    .coming-soon-content {
      text-align: center;
      padding: var(--spacing-2xl);
    }

    .coming-soon-icon {
      font-size: 4rem;
      margin-bottom: var(--spacing-lg);
    }

    .coming-soon-title {
      font-size: var(--text-2xl);
      font-weight: 700;
      margin-bottom: var(--spacing-sm);
    }

    .coming-soon-desc {
      font-size: var(--text-base);
      color: var(--color-text-secondary);
      margin-bottom: var(--spacing-xl);
      max-width: 400px;
      margin-left: auto;
      margin-right: auto;
    }

    .coming-soon-progress {
      max-width: 300px;
      margin: 0 auto var(--spacing-xl);
    }

    .coming-soon-percent {
      display: block;
      font-size: var(--text-sm);
      color: var(--color-text-muted);
      margin-top: var(--spacing-sm);
    }

    .coming-soon-actions {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-md);
      justify-content: center;
    }

    .related-tools {
      margin-top: var(--spacing-2xl);
    }

    .related-tools h2 {
      font-size: var(--text-lg);
      margin-bottom: var(--spacing-lg);
    }
  `;
  document.head.appendChild(styles);
}

// Default export for dynamic routing
export default function render(container: HTMLElement) {
  // Try to extract drive/tool from URL
  const hash = window.location.hash.slice(1);
  const parts = hash.split('/').filter(Boolean);

  const options: PageOptions = {};
  if (parts[0] === 'apps' && parts[1]) {
    options.driveId = parts[1];
    if (parts[2]) {
      options.toolId = parts[2];
    }
  }

  renderComingSoon(container, options);
}
