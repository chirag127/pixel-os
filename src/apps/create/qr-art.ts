/**
 * QR Art Tool
 * Generate stylish QR codes
 */

import QRCode from 'qrcode';

let url = 'https://img.oriz.in';
let fgColor = '#000000';
let bgColor = '#ffffff';
let size = 300;

export default function render(container: HTMLElement) {
  container.innerHTML = `
    <div class="tool-page animate-fade-in">
      <header class="tool-header">
        <a href="#/" class="tool-back-btn">←</a>
        <div>
          <h1 class="tool-title">QR Art</h1>
          <p style="color: var(--color-text-muted); font-size: var(--text-sm);">Generate artistic QR codes</p>
        </div>
      </header>

      <div class="qr-workspace">
        <div class="qr-preview glass-card">
          <canvas id="qr-canvas"></canvas>
        </div>

        <div class="qr-controls glass-card">
          <div class="control-group">
            <label class="control-label">URL or Text</label>
            <input type="text" id="url-input" class="input" value="${url}"/>
          </div>
          <div class="control-group">
            <label class="control-label">Foreground Color</label>
            <input type="color" id="fg-color" value="${fgColor}" style="width: 100%; height: 40px; cursor: pointer;"/>
          </div>
          <div class="control-group">
            <label class="control-label">Background Color</label>
            <input type="color" id="bg-color" value="${bgColor}" style="width: 100%; height: 40px; cursor: pointer;"/>
          </div>
          <div class="control-group">
            <label class="control-label">Size: <span id="size-value">${size}px</span></label>
            <input type="range" class="slider" id="size-slider" min="100" max="500" value="${size}" step="50"/>
          </div>
          <div class="tool-actions">
            <button class="btn btn-primary" id="generate-btn">Generate QR</button>
            <button class="btn btn-secondary" id="download-btn" disabled>Download</button>
          </div>
        </div>
      </div>
    </div>
  `;

  addQrStyles();
  generateQR();
  setupEventListeners(container);
}

async function generateQR() {
  const canvas = document.querySelector('#qr-canvas') as HTMLCanvasElement;
  const downloadBtn = document.querySelector('#download-btn') as HTMLButtonElement;

  try {
    await QRCode.toCanvas(canvas, url, {
      width: size,
      margin: 2,
      color: { dark: fgColor, light: bgColor }
    });
    downloadBtn.disabled = false;
  } catch (error) {
    console.error('QR generation failed:', error);
  }
}

function setupEventListeners(container: HTMLElement) {
  const urlInput = container.querySelector('#url-input') as HTMLInputElement;
  const fgInput = container.querySelector('#fg-color') as HTMLInputElement;
  const bgInput = container.querySelector('#bg-color') as HTMLInputElement;
  const sizeSlider = container.querySelector('#size-slider') as HTMLInputElement;
  const sizeValue = container.querySelector('#size-value') as HTMLSpanElement;
  const generateBtn = container.querySelector('#generate-btn') as HTMLButtonElement;
  const downloadBtn = container.querySelector('#download-btn') as HTMLButtonElement;

  urlInput.addEventListener('input', () => { url = urlInput.value; });
  fgInput.addEventListener('input', () => { fgColor = fgInput.value; });
  bgInput.addEventListener('input', () => { bgColor = bgInput.value; });
  sizeSlider.addEventListener('input', () => {
    size = parseInt(sizeSlider.value);
    sizeValue.textContent = `${size}px`;
  });

  generateBtn.addEventListener('click', generateQR);

  downloadBtn.addEventListener('click', () => {
    const canvas = container.querySelector('#qr-canvas') as HTMLCanvasElement;
    const link = document.createElement('a');
    link.download = `qr-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  });
}

function addQrStyles() {
  if (document.querySelector('#qr-styles')) return;
  const styles = document.createElement('style');
  styles.id = 'qr-styles';
  styles.textContent = `
    .qr-workspace { display: flex; flex-direction: column; gap: var(--spacing-lg); }
    .qr-preview, .qr-controls { padding: var(--spacing-lg); }
    .qr-preview { display: flex; align-items: center; justify-content: center; min-height: 350px; }
    .tool-actions { display: flex; gap: var(--spacing-md); margin-top: var(--spacing-md); }
    .tool-actions .btn { flex: 1; }
    @media (min-width: 1024px) { .qr-workspace { flex-direction: row; } .qr-preview { flex: 1; } .qr-controls { flex: 1; min-width: 300px; } }
  `;
  document.head.appendChild(styles);
}
