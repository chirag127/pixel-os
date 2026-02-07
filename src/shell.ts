/**
 * Pixel OS Shell
 * Main application shell with header, sidebar, and bottom navigation
 */

import { router } from './router';

// Drive categories with their tools
export const drives = [
  {
    id: 'optimize',
    name: 'Optimize',
    icon: '⚡',
    color: 'var(--accent-blue)',
    description: 'Speed and efficiency tools',
    tools: [
      { id: 'compress-jpg', name: 'Compress JPEG', desc: 'Lossy compression for JPG images' },
      { id: 'compress-png', name: 'Compress PNG', desc: 'Lossless PNG optimization' },
      { id: 'compress-webp', name: 'Compress WebP', desc: 'Modern web format compression' },
      { id: 'upscale', name: 'AI Upscale', desc: 'AI-powered 2x/4x upscaling' },
      { id: 'remove-bg', name: 'Remove Background', desc: 'AI background removal' },
      { id: 'vectorize', name: 'Vectorize', desc: 'Convert raster to SVG' },
    ]
  },
  {
    id: 'modify',
    name: 'Modify',
    icon: '✂️',
    color: 'var(--accent-purple)',
    description: 'Essential editing tools',
    tools: [
      { id: 'resize', name: 'Resize', desc: 'Change image dimensions' },
      { id: 'crop', name: 'Crop', desc: 'Aspect ratio cropping' },
      { id: 'rotate', name: 'Rotate', desc: '90° steps + fine rotation' },
      { id: 'flip', name: 'Flip', desc: 'Mirror horizontal/vertical' },
      { id: 'circle-crop', name: 'Circle Crop', desc: 'Round profile pictures' },
      { id: 'skew', name: 'Skew', desc: 'Perspective correction' },
    ]
  },
  {
    id: 'convert',
    name: 'Convert',
    icon: '🔄',
    color: 'var(--accent-green)',
    description: 'Format conversion tools',
    tools: [
      { id: 'jpg-to-png', name: 'JPG → PNG', desc: 'Convert JPEG to PNG' },
      { id: 'png-to-jpg', name: 'PNG → JPG', desc: 'Convert PNG to JPEG' },
      { id: 'webp-to-jpg', name: 'WebP → JPG', desc: 'Convert WebP to JPEG' },
      { id: 'heic-to-jpg', name: 'HEIC → JPG', desc: 'Convert iPhone photos' },
      { id: 'svg-to-png', name: 'SVG → PNG', desc: 'Render vectors to bitmap' },
      { id: 'html-to-image', name: 'HTML → Image', desc: 'Screenshot HTML/CSS' },
      { id: 'image-to-base64', name: 'Image → Base64', desc: 'Encode for developers' },
      { id: 'json-to-image', name: 'JSON → Image', desc: 'Render data to card' },
    ]
  },
  {
    id: 'create',
    name: 'Create',
    icon: '🎨',
    color: 'var(--accent-pink)',
    description: 'Fun and creative tools',
    tools: [
      { id: 'meme', name: 'Meme Maker', desc: 'Top/bottom text memes' },
      { id: 'collage', name: 'Collage', desc: 'Grid layout maker' },
      { id: 'markup', name: 'Markup', desc: 'Annotate screenshots' },
      { id: 'quote', name: 'Quote', desc: 'Text over backgrounds' },
      { id: 'gradient', name: 'Gradient', desc: 'CSS gradient wallpapers' },
      { id: 'social-card', name: 'Social Card', desc: 'OG image maker' },
      { id: 'qr-art', name: 'QR Art', desc: 'Artistic QR codes' },
    ]
  },
  {
    id: 'security',
    name: 'Security',
    icon: '🔒',
    color: 'var(--accent-orange)',
    description: 'Privacy-focused tools',
    tools: [
      { id: 'watermark', name: 'Watermark', desc: 'Add logo/text overlay' },
      { id: 'blur-face', name: 'Blur Faces', desc: 'Auto-detect & blur faces' },
      { id: 'blur-area', name: 'Blur Area', desc: 'Manual privacy blur' },
      { id: 'exif-remove', name: 'Remove EXIF', desc: 'Strip metadata' },
      { id: 'exif-view', name: 'View EXIF', desc: 'Inspect metadata' },
      { id: 'pixelate', name: 'Pixelate', desc: 'Censor sensitive info' },
    ]
  },
  {
    id: 'ai',
    name: 'AI Tools',
    icon: '🤖',
    color: 'var(--accent-purple)',
    description: 'AI-powered features',
    tools: [
      { id: 'caption', name: 'AI Caption', desc: 'Generate image captions' },
      { id: 'tags', name: 'AI Tags', desc: 'Auto-generate hashtags' },
      { id: 'vision', name: 'AI Vision', desc: 'Visual Q&A' },
    ]
  }
];

class Shell {
  private bottomSheetExpanded = false;

  render(container: HTMLElement) {
    container.innerHTML = `
      <div class="shell">
        <!-- Header -->
        <header class="header">
          <a href="#/" class="header-logo">
            <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="32" height="32" rx="8" fill="url(#logo-gradient)"/>
              <path d="M8 12L16 8L24 12V20L16 24L8 20V12Z" stroke="white" stroke-width="2" fill="none"/>
              <circle cx="16" cy="16" r="4" fill="white"/>
              <defs>
                <linearGradient id="logo-gradient" x1="0" y1="0" x2="32" y2="32">
                  <stop offset="0%" stop-color="#667eea"/>
                  <stop offset="100%" stop-color="#764ba2"/>
                </linearGradient>
              </defs>
            </svg>
            <span>Pixel<span class="text-gradient">OS</span></span>
          </a>
          <div class="header-actions">
            <button class="btn btn-secondary" id="theme-toggle" aria-label="Toggle theme">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="5"/>
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
              </svg>
            </button>
          </div>
        </header>

        <!-- Sidebar (Desktop) -->
        <aside class="sidebar">
          <nav class="sidebar-nav">
            ${this.renderSidebarDrives()}
          </nav>
        </aside>

        <!-- Main Content Area -->
        <main class="main-content" id="main-content">
          <!-- Router renders content here -->
        </main>

        <!-- Bottom Sheet (Mobile) -->
        <div class="bottom-sheet collapsed" id="bottom-sheet">
          <div class="bottom-sheet-handle" id="bottom-sheet-handle"></div>
          <nav class="bottom-nav" id="bottom-nav">
            ${this.renderBottomNav()}
          </nav>
          <div class="drive-grid" id="drive-grid" style="display: none;">
            ${this.renderDriveGrid()}
          </div>
        </div>
      </div>
    `;

    // Initialize router with main content container
    const mainContent = container.querySelector('#main-content') as HTMLElement;
    router.init(mainContent);

    // Setup event listeners
    this.setupEventListeners(container);
  }

  private renderSidebarDrives(): string {
    return drives.map(drive => `
      <div class="sidebar-section">
        <h3 class="sidebar-title">
          <span>${drive.icon}</span>
          ${drive.name}
        </h3>
        <ul class="sidebar-list">
          ${drive.tools.map(tool => `
            <li>
              <a href="#/apps/${drive.id}/${tool.id}" class="sidebar-link">
                ${tool.name}
              </a>
            </li>
          `).join('')}
        </ul>
      </div>
    `).join('');
  }

  private renderBottomNav(): string {
    const mainDrives = drives.slice(0, 4);
    return `
      ${mainDrives.map(drive => `
        <a href="#/apps/${drive.id}" class="bottom-nav-item" data-drive="${drive.id}">
          <span class="bottom-nav-icon">${drive.icon}</span>
          <span>${drive.name}</span>
        </a>
      `).join('')}
      <button class="bottom-nav-item" id="more-btn">
        <span class="bottom-nav-icon">☰</span>
        <span>More</span>
      </button>
    `;
  }

  private renderDriveGrid(): string {
    return drives.map(drive => `
      <a href="#/apps/${drive.id}" class="drive-card glass-card" data-drive="${drive.id}">
        <div class="drive-card-icon" style="background: ${drive.color}">
          ${drive.icon}
        </div>
        <div class="drive-card-title">${drive.name}</div>
        <div class="drive-card-count">${drive.tools.length} tools</div>
      </a>
    `).join('');
  }

  private setupEventListeners(container: HTMLElement) {
    const bottomSheet = container.querySelector('#bottom-sheet') as HTMLElement;
    const bottomSheetHandle = container.querySelector('#bottom-sheet-handle') as HTMLElement;
    const moreBtn = container.querySelector('#more-btn') as HTMLElement;
    const bottomNav = container.querySelector('#bottom-nav') as HTMLElement;
    const driveGrid = container.querySelector('#drive-grid') as HTMLElement;

    // Toggle bottom sheet
    const toggleBottomSheet = () => {
      this.bottomSheetExpanded = !this.bottomSheetExpanded;
      bottomSheet.classList.toggle('collapsed', !this.bottomSheetExpanded);
      bottomNav.style.display = this.bottomSheetExpanded ? 'none' : 'flex';
      driveGrid.style.display = this.bottomSheetExpanded ? 'grid' : 'none';
    };

    bottomSheetHandle?.addEventListener('click', toggleBottomSheet);
    moreBtn?.addEventListener('click', toggleBottomSheet);

    // Close bottom sheet when navigating
    window.addEventListener('hashchange', () => {
      if (this.bottomSheetExpanded) {
        this.bottomSheetExpanded = false;
        bottomSheet?.classList.add('collapsed');
        bottomNav.style.display = 'flex';
        driveGrid.style.display = 'none';
      }
    });
  }
}

export const shell = new Shell();
