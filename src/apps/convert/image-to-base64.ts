/**
 * Image to Base64 Converter
 */

import { createToolLayout, ToolLayout } from '../../components/ToolLayout';

let toolLayout: ToolLayout | null = null;
let currentFile: File | null = null;
let base64Result = '';

export default function render(container: HTMLElement) {
  toolLayout = createToolLayout(container, {
    id: 'image-to-base64',
    title: 'Image → Base64',
    description: 'Convert images to Base64 data URI',
    onFileSelect: handleFileSelect,
    renderControls: renderControls,
    seoContent: `<h2>Convert Image to Base64</h2><p>Encode images as Base64 data URIs for embedding directly in HTML, CSS, or JavaScript.</p>`
  });
}

function handleFileSelect(file: File) {
  currentFile = file;
  base64Result = '';
  const outputEl = document.querySelector('#base64-output') as HTMLTextAreaElement;
  if (outputEl) outputEl.value = '';
}

function renderControls(container: HTMLElement) {
  container.innerHTML = `
    <div class="control-group">
      <label class="control-label">Base64 Output</label>
      <textarea id="base64-output" class="input" readonly style="min-height: 150px; font-family: var(--font-mono); font-size: var(--text-xs);">${base64Result}</textarea>
    </div>
    <div class="base64-actions">
      <button class="btn btn-secondary" id="copy-btn" disabled>📋 Copy</button>
      <button class="btn btn-secondary" id="copy-data-uri" disabled>📋 Copy as Data URI</button>
    </div>
    <div id="size-info" style="margin-top: var(--spacing-md); font-size: var(--text-sm); color: var(--color-text-muted);"></div>
  `;

  addBase64Styles();

  const copyBtn = container.querySelector('#copy-btn') as HTMLButtonElement;
  const copyDataUriBtn = container.querySelector('#copy-data-uri') as HTMLButtonElement;

  copyBtn.addEventListener('click', async () => {
    await navigator.clipboard.writeText(base64Result);
    copyBtn.textContent = '✓ Copied!';
    setTimeout(() => copyBtn.textContent = '📋 Copy', 2000);
  });

  copyDataUriBtn.addEventListener('click', async () => {
    const dataUri = `data:${currentFile?.type};base64,${base64Result}`;
    await navigator.clipboard.writeText(dataUri);
    copyDataUriBtn.textContent = '✓ Copied!';
    setTimeout(() => copyDataUriBtn.textContent = '📋 Copy as Data URI', 2000);
  });

  toolLayout?.getProcessButton()?.addEventListener('click', processImage);
}

async function processImage() {
  if (!currentFile || !toolLayout) return;
  toolLayout.showLoading(true);

  try {
    const reader = new FileReader();
    const dataUri = await new Promise<string>((resolve, reject) => {
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(currentFile!);
    });

    base64Result = dataUri.split(',')[1];

    const outputEl = document.querySelector('#base64-output') as HTMLTextAreaElement;
    const sizeInfo = document.querySelector('#size-info') as HTMLElement;
    const copyBtn = document.querySelector('#copy-btn') as HTMLButtonElement;
    const copyDataUriBtn = document.querySelector('#copy-data-uri') as HTMLButtonElement;

    outputEl.value = base64Result;
    sizeInfo.textContent = `Original: ${formatSize(currentFile.size)} | Base64: ${formatSize(base64Result.length)} (~33% larger)`;
    copyBtn.disabled = false;
    copyDataUriBtn.disabled = false;

    toolLayout.showLoading(false);
  } catch (error) {
    toolLayout.showError('Conversion failed.');
    toolLayout.showLoading(false);
  }
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function addBase64Styles() {
  if (document.querySelector('#base64-styles')) return;
  const styles = document.createElement('style');
  styles.id = 'base64-styles';
  styles.textContent = `.base64-actions { display: flex; gap: var(--spacing-sm); flex-wrap: wrap; }`;
  document.head.appendChild(styles);
}
