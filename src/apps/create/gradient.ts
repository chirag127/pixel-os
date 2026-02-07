/**
 * Gradient Generator Tool
 * Create CSS gradient wallpapers
 */


let color1 = '#667eea';
let color2 = '#764ba2';
let angle = 135;
let width = 1920;
let height = 1080;

export default function render(container: HTMLElement) {
  container.innerHTML = `
    <div class="tool-page animate-fade-in">
      <header class="tool-header">
        <a href="#/" class="tool-back-btn">←</a>
        <div>
          <h1 class="tool-title">Gradient Generator</h1>
          <p style="color: var(--color-text-muted); font-size: var(--text-sm);">Create beautiful gradient wallpapers</p>
        </div>
      </header>

      <div class="gradient-workspace">
        <div class="gradient-preview glass-card">
          <div id="gradient-box" class="gradient-box"></div>
        </div>

        <div class="gradient-controls glass-card">
          <div class="control-group">
            <label class="control-label">Color 1</label>
            <input type="color" id="color1" value="${color1}" style="width: 100%; height: 40px; cursor: pointer;"/>
          </div>
          <div class="control-group">
            <label class="control-label">Color 2</label>
            <input type="color" id="color2" value="${color2}" style="width: 100%; height: 40px; cursor: pointer;"/>
          </div>
          <div class="control-group">
            <label class="control-label">Angle: <span id="angle-value">${angle}°</span></label>
            <input type="range" class="slider" id="angle-slider" min="0" max="360" value="${angle}"/>
          </div>
          <div class="control-group">
            <label class="control-label">Size</label>
            <select class="input" id="size-select">
              <option value="1920x1080">1920×1080 (HD)</option>
              <option value="2560x1440">2560×1440 (2K)</option>
              <option value="3840x2160">3840×2160 (4K)</option>
              <option value="1080x1920">1080×1920 (Phone)</option>
              <option value="1080x1080">1080×1080 (Square)</option>
            </select>
          </div>
          <div class="presets">
            <button class="btn btn-secondary" data-preset="sunset">🌅 Sunset</button>
            <button class="btn btn-secondary" data-preset="ocean">🌊 Ocean</button>
            <button class="btn btn-secondary" data-preset="forest">🌲 Forest</button>
            <button class="btn btn-secondary" data-preset="fire">🔥 Fire</button>
          </div>
          <div class="tool-actions">
            <button class="btn btn-primary" id="download-btn">Download PNG</button>
          </div>
          <div id="css-output" class="css-output"></div>
        </div>
      </div>
    </div>
  `;

  addGradientStyles();
  updatePreview();
  setupEventListeners(container);
}

function updatePreview() {
  const box = document.querySelector('#gradient-box') as HTMLElement;
  const cssOutput = document.querySelector('#css-output') as HTMLElement;
  const css = `linear-gradient(${angle}deg, ${color1}, ${color2})`;
  box.style.background = css;
  cssOutput.textContent = `background: ${css};`;
}

function setupEventListeners(container: HTMLElement) {
  const color1Input = container.querySelector('#color1') as HTMLInputElement;
  const color2Input = container.querySelector('#color2') as HTMLInputElement;
  const angleSlider = container.querySelector('#angle-slider') as HTMLInputElement;
  const angleValue = container.querySelector('#angle-value') as HTMLSpanElement;
  const sizeSelect = container.querySelector('#size-select') as HTMLSelectElement;
  const downloadBtn = container.querySelector('#download-btn') as HTMLButtonElement;

  color1Input.addEventListener('input', () => { color1 = color1Input.value; updatePreview(); });
  color2Input.addEventListener('input', () => { color2 = color2Input.value; updatePreview(); });
  angleSlider.addEventListener('input', () => { angle = parseInt(angleSlider.value); angleValue.textContent = `${angle}°`; updatePreview(); });
  sizeSelect.addEventListener('change', () => { [width, height] = sizeSelect.value.split('x').map(Number); });

  const presets: Record<string, [string, string]> = {
    sunset: ['#f97316', '#ec4899'],
    ocean: ['#06b6d4', '#3b82f6'],
    forest: ['#22c55e', '#14532d'],
    fire: ['#fbbf24', '#ef4444']
  };

  container.querySelectorAll('[data-preset]').forEach(btn => {
    btn.addEventListener('click', () => {
      const [c1, c2] = presets[(btn as HTMLElement).dataset.preset!];
      color1 = c1; color2 = c2;
      color1Input.value = c1; color2Input.value = c2;
      updatePreview();
    });
  });

  downloadBtn.addEventListener('click', async () => {
    downloadBtn.disabled = true;
    downloadBtn.textContent = 'Generating...';

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    const rad = angle * Math.PI / 180;
    const x1 = width / 2 - Math.cos(rad) * width;
    const y1 = height / 2 - Math.sin(rad) * height;
    const x2 = width / 2 + Math.cos(rad) * width;
    const y2 = height / 2 + Math.sin(rad) * height;

    const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gradient-${width}x${height}.png`;
      a.click();
      URL.revokeObjectURL(url);
      downloadBtn.disabled = false;
      downloadBtn.textContent = 'Download PNG';
    });
  });
}

function addGradientStyles() {
  if (document.querySelector('#gradient-styles')) return;
  const styles = document.createElement('style');
  styles.id = 'gradient-styles';
  styles.textContent = `
    .gradient-workspace { display: flex; flex-direction: column; gap: var(--spacing-lg); }
    .gradient-preview, .gradient-controls { padding: var(--spacing-lg); }
    .gradient-box { width: 100%; aspect-ratio: 16/9; border-radius: var(--radius-lg); }
    .presets { display: flex; flex-wrap: wrap; gap: var(--spacing-sm); margin-bottom: var(--spacing-md); }
    .tool-actions { margin-bottom: var(--spacing-md); }
    .css-output { padding: var(--spacing-md); background: var(--color-bg-secondary); border-radius: var(--radius-md);
      font-family: var(--font-mono); font-size: var(--text-sm); word-break: break-all; }
    @media (min-width: 1024px) { .gradient-workspace { flex-direction: row; } .gradient-preview { flex: 2; } .gradient-controls { flex: 1; min-width: 300px; } }
  `;
  document.head.appendChild(styles);
}
