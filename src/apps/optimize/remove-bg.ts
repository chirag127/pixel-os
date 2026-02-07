/**
 * Remove Background Tool
 * AI-powered background removal using @imgly/background-removal (WASM)
 */

import { createToolLayout, ToolLayout } from '../../components/ToolLayout';

let toolLayout: ToolLayout | null = null;
let currentFile: File | null = null;
let removeBackgroundModule: any = null;

export default function render(container: HTMLElement) {
  toolLayout = createToolLayout(container, {
    id: 'remove-bg',
    title: 'Remove Background',
    description: 'AI-powered background removal - 100% client-side',
    onFileSelect: handleFileSelect,
    renderControls: renderControls,
    seoContent: `
      <h2>AI Background Removal - Privacy-First</h2>
      <p>Remove backgrounds from images using advanced AI technology that runs entirely in your browser. Unlike cloud-based services, your images never leave your device, ensuring complete privacy.</p>
      <h3>How It Works</h3>
      <p>Our tool uses WebAssembly (WASM) and ONNX neural networks to perform real-time background removal. The first time you use it, the AI model (~40MB) will be downloaded and cached in your browser for instant future use.</p>
      <h3>Perfect For:</h3>
      <ul>
        <li>Product photography for e-commerce</li>
        <li>Profile pictures and headshots</li>
        <li>Social media content creation</li>
        <li>Graphic design projects</li>
        <li>Creating transparent PNGs</li>
      </ul>
      <h3>Privacy & Security</h3>
      <p>All processing happens locally using WebAssembly. Your images are never uploaded to any server, ensuring your sensitive photos remain completely private.</p>
    `
  });
}

function handleFileSelect(file: File) {
  currentFile = file;
}

function renderControls(container: HTMLElement) {
  container.innerHTML = `
    <div class="info-box glass-card" style="padding: var(--spacing-md); margin-bottom: var(--spacing-md); background: rgba(168, 85, 247, 0.1); border-color: var(--accent-purple);">
      <h4 style="margin: 0 0 var(--spacing-xs); font-size: var(--text-sm);">🤖 AI-Powered</h4>
      <p style="margin: 0; font-size: var(--text-xs); color: var(--color-text-secondary);">
        First use will download ~40MB AI model (cached for future use). Processing takes 5-15 seconds depending on image size.
      </p>
    </div>

    <div class="control-group">
      <label class="control-label">
        Output Format
      </label>
      <select class="input" id="output-format">
        <option value="image/png">PNG (Transparent)</option>
        <option value="image/jpeg">JPEG (White BG)</option>
      </select>
    </div>

    <div id="progress-container" style="display: none; margin-top: var(--spacing-md);">
      <p style="margin-bottom: var(--spacing-sm); font-size: var(--text-sm);">
        <span id="progress-text">Downloading AI model...</span>
      </p>
      <div class="progress">
        <div class="progress-bar" id="progress-bar" style="width: 0%"></div>
      </div>
    </div>
  `;

  const processBtn = toolLayout?.getProcessButton();
  processBtn?.addEventListener('click', processImage);
}

async function processImage() {
  if (!currentFile || !toolLayout) return;

  const outputFormat = (document.querySelector('#output-format') as HTMLSelectElement).value;
  const progressContainer = document.querySelector('#progress-container') as HTMLElement;
  const progressBar = document.querySelector('#progress-bar') as HTMLElement;
  const progressText = document.querySelector('#progress-text') as HTMLElement;

  toolLayout.showLoading(true);
  progressContainer.style.display = 'block';

  try {
    // Lazy load the background removal library
    if (!removeBackgroundModule) {
      progressText.textContent = 'Loading AI module...';
      progressBar.style.width = '10%';

      removeBackgroundModule = await import('@imgly/background-removal');
      progressBar.style.width = '30%';
    }

    // Create image blob URL
    const imageURL = URL.createObjectURL(currentFile);

    progressText.textContent = 'Processing image...';
    progressBar.style.width = '50%';

    // Remove background
    const blob = await removeBackgroundModule.removeBackground(imageURL, {
      progress: (key: string, current: number, total: number) => {
        const percent = Math.round((current / total) * 40) + 50; // 50-90%
        progressBar.style.width = `${percent}%`;
        progressText.textContent = `Processing: ${key}...`;
      },
      output: {
        format: outputFormat,
        quality: 0.9
      }
    });

    progressBar.style.width = '100%';
    progressText.textContent = 'Complete!';

    URL.revokeObjectURL(imageURL);

    toolLayout.showResult(blob);
    toolLayout.showLoading(false);

    setTimeout(() => {
      progressContainer.style.display = 'none';
      progressBar.style.width = '0%';
    }, 1000);

  } catch (error) {
    console.error('Background removal failed:', error);
    toolLayout.showError('Background removal failed. Please try with a different image.');
    toolLayout.showLoading(false);
    progressContainer.style.display = 'none';
  }
}
