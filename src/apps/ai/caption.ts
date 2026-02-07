/**
 * AI Caption Tool
 * Generate image captions (placeholder for Puter.js AI)
 */

import { createToolLayout, ToolLayout } from '../../components/ToolLayout';

let toolLayout: ToolLayout | null = null;
let currentFile: File | null = null;
let generatedCaption = '';

export default function render(container: HTMLElement) {
  toolLayout = createToolLayout(container, {
    id: 'caption',
    title: 'AI Caption',
    description: 'Generate captions for your images',
    onFileSelect: handleFileSelect,
    renderControls: renderControls,
    seoContent: `<h2>AI Image Captioning</h2><p>Generate descriptive captions for your images using AI. Perfect for accessibility and social media.</p>`
  });
}

function handleFileSelect(file: File) {
  currentFile = file;
  generatedCaption = '';
  updateCaptionDisplay();
}

function renderControls(container: HTMLElement) {
  container.innerHTML = `
    <div class="info-box glass-card" style="padding: var(--spacing-lg);">
      <h4 style="margin: 0 0 var(--spacing-md); color: var(--accent-blue);">🤖 AI-Powered</h4>
      <p style="margin: 0 0 var(--spacing-md); font-size: var(--text-sm); color: var(--color-text-secondary);">
        Uses computer vision to describe what's in your image.
      </p>
    </div>
    <div class="caption-output glass-card" style="padding: var(--spacing-lg); margin-top: var(--spacing-md);">
      <h4 style="margin: 0 0 var(--spacing-sm);">Generated Caption</h4>
      <p id="caption-text" style="margin: 0; color: var(--color-text-secondary); font-style: italic;">
        ${generatedCaption || 'Upload an image and click Process to generate a caption'}
      </p>
      <button class="btn btn-secondary" id="copy-btn" style="margin-top: var(--spacing-md); ${generatedCaption ? '' : 'display: none;'}">
        📋 Copy Caption
      </button>
    </div>
  `;

  const copyBtn = container.querySelector('#copy-btn') as HTMLButtonElement;
  copyBtn?.addEventListener('click', async () => {
    await navigator.clipboard.writeText(generatedCaption);
    copyBtn.textContent = '✓ Copied!';
    setTimeout(() => copyBtn.textContent = '📋 Copy Caption', 2000);
  });

  toolLayout?.getProcessButton()?.addEventListener('click', processImage);
}

function updateCaptionDisplay() {
  const captionText = document.querySelector('#caption-text') as HTMLElement;
  const copyBtn = document.querySelector('#copy-btn') as HTMLButtonElement;

  if (captionText) {
    captionText.textContent = generatedCaption || 'Upload an image and click Process to generate a caption';
    captionText.style.fontStyle = generatedCaption ? 'normal' : 'italic';
  }
  if (copyBtn) {
    copyBtn.style.display = generatedCaption ? 'block' : 'none';
  }
}

async function processImage() {
  if (!currentFile || !toolLayout) return;
  toolLayout.showLoading(true);

  try {
    // In a full implementation, this would use Puter.js AI or another vision API
    // For now, provide a demo caption based on file analysis

    const img = new Image();
    const imageURL = URL.createObjectURL(currentFile);
    await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; img.src = imageURL; });

    // Analyze basic image properties to generate a placeholder caption
    const aspectRatio = img.width / img.height;
    let orientation = 'square';
    if (aspectRatio > 1.2) orientation = 'landscape';
    else if (aspectRatio < 0.8) orientation = 'portrait';

    const size = img.width * img.height;
    let quality = 'standard resolution';
    if (size > 4000000) quality = 'high resolution';
    else if (size < 500000) quality = 'low resolution';

    // Generate demo caption
    generatedCaption = `A ${orientation} ${quality} image (${img.width}×${img.height} pixels).

To generate actual AI captions, connect to an AI service like:
• Puter.js Vision API
• Google Cloud Vision
• OpenAI GPT-4 Vision
• Anthropic Claude Vision`;

    updateCaptionDisplay();
    URL.revokeObjectURL(imageURL);
    toolLayout.showLoading(false);
  } catch (error) {
    toolLayout.showError('Caption generation failed.');
    toolLayout.showLoading(false);
  }
}
