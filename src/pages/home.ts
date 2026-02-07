/**
 * Home Page
 * Displays tool grid organized by drive categories
 */

import { drives } from '../shell';

export default function render(container: HTMLElement) {
  container.innerHTML = `
    <div class="home-page animate-fade-in">
      <section class="hero">
        <h1 class="hero-title">
          Privacy-First <span class="text-gradient">Image Tools</span>
        </h1>
        <p class="hero-description">
          35+ powerful tools that run entirely in your browser.
          Your images never leave your device.
        </p>
        <div class="hero-badges">
          <span class="badge badge-green">🔒 100% Private</span>
          <span class="badge badge-blue">⚡ Lightning Fast</span>
          <span class="badge badge-purple">🤖 AI-Powered</span>
        </div>
      </section>

      ${drives.map(drive => `
        <section class="drive-section">
          <header class="drive-header">
            <span class="drive-icon" style="background: ${drive.color}">${drive.icon}</span>
            <div>
              <h2 class="drive-title">${drive.name}</h2>
              <p class="drive-description">${drive.description}</p>
            </div>
          </header>
          <div class="tool-grid">
            ${drive.tools.map(tool => `
              <a href="#/apps/${drive.id}/${tool.id}" class="tool-card glass-card">
                <div class="tool-card-icon" style="background: ${drive.color}20; color: ${drive.color}">
                  ${getToolIcon(tool.id)}
                </div>
                <h3 class="tool-card-title">${tool.name}</h3>
                <p class="tool-card-desc">${tool.desc}</p>
              </a>
            `).join('')}
          </div>
        </section>
      `).join('')}

      <section class="features-section glass-card">
        <h2>Why Pixel OS?</h2>
        <div class="features-grid">
          <div class="feature">
            <div class="feature-icon">🔒</div>
            <h3>100% Private</h3>
            <p>All processing happens in your browser using WebAssembly. Your images are never uploaded to any server.</p>
          </div>
          <div class="feature">
            <div class="feature-icon">⚡</div>
            <h3>Lightning Fast</h3>
            <p>No upload/download delays. WASM-powered processing delivers near-native performance.</p>
          </div>
          <div class="feature">
            <div class="feature-icon">💯</div>
            <h3>Completely Free</h3>
            <p>No watermarks, no signups, no limits. Just powerful image tools at your fingertips.</p>
          </div>
          <div class="feature">
            <div class="feature-icon">📱</div>
            <h3>Works Everywhere</h3>
            <p>Mobile-first design works perfectly on phones, tablets, and desktops.</p>
          </div>
        </div>
      </section>
    </div>
  `;

  // Add home page specific styles
  addHomeStyles();
}

function getToolIcon(toolId: string): string {
  const icons: Record<string, string> = {
    'compress-jpg': '📦',
    'compress-png': '📦',
    'compress-webp': '📦',
    'upscale': '🔍',
    'remove-bg': '✂️',
    'vectorize': '📐',
    'resize': '↔️',
    'crop': '✂️',
    'rotate': '🔄',
    'flip': '↕️',
    'circle-crop': '⭕',
    'skew': '📐',
    'jpg-to-png': '🔄',
    'png-to-jpg': '🔄',
    'webp-to-jpg': '🔄',
    'heic-to-jpg': '📱',
    'svg-to-png': '🖼️',
    'html-to-image': '🌐',
    'image-to-base64': '🔗',
    'json-to-image': '📊',
    'meme': '😂',
    'collage': '🖼️',
    'markup': '✏️',
    'quote': '💬',
    'gradient': '🌈',
    'social-card': '📱',
    'qr-art': '📲',
    'watermark': '💧',
    'blur-face': '🙈',
    'blur-area': '🔲',
    'exif-remove': '🗑️',
    'exif-view': '👁️',
    'pixelate': '▦',
    'caption': '💬',
    'tags': '#️⃣',
    'vision': '👁️'
  };
  return icons[toolId] || '🔧';
}

function addHomeStyles() {
  if (document.querySelector('#home-styles')) return;

  const styles = document.createElement('style');
  styles.id = 'home-styles';
  styles.textContent = `
    .home-page {
      padding-bottom: var(--spacing-2xl);
    }

    .hero {
      text-align: center;
      padding: var(--spacing-2xl) 0;
      margin-bottom: var(--spacing-xl);
    }

    .hero-title {
      font-size: var(--text-3xl);
      font-weight: 800;
      margin-bottom: var(--spacing-md);
      line-height: 1.2;
    }

    .hero-description {
      font-size: var(--text-lg);
      color: var(--color-text-secondary);
      max-width: 600px;
      margin: 0 auto var(--spacing-lg);
    }

    .hero-badges {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: var(--spacing-sm);
    }

    .drive-section {
      margin-bottom: var(--spacing-2xl);
    }

    .drive-header {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-lg);
    }

    .drive-icon {
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-md);
      font-size: var(--text-xl);
    }

    .drive-title {
      font-size: var(--text-xl);
      font-weight: 700;
      margin: 0;
    }

    .drive-description {
      font-size: var(--text-sm);
      color: var(--color-text-muted);
      margin: 0;
    }

    .features-section {
      padding: var(--spacing-xl);
      margin-top: var(--spacing-2xl);
    }

    .features-section h2 {
      text-align: center;
      margin-bottom: var(--spacing-xl);
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--spacing-lg);
    }

    .feature {
      text-align: center;
    }

    .feature-icon {
      font-size: var(--text-3xl);
      margin-bottom: var(--spacing-sm);
    }

    .feature h3 {
      font-size: var(--text-base);
      margin-bottom: var(--spacing-xs);
    }

    .feature p {
      font-size: var(--text-sm);
      color: var(--color-text-muted);
    }

    @media (min-width: 768px) {
      .hero-title {
        font-size: var(--text-4xl);
      }

      .features-grid {
        grid-template-columns: repeat(4, 1fr);
      }
    }
  `;
  document.head.appendChild(styles);
}
