/**
 * AI Tags Tool
 * Generate image tags/keywords
 */

import { createToolLayout, ToolLayout } from '../../components/ToolLayout';

let toolLayout: ToolLayout | null = null;
let currentFile: File | null = null;
let generatedTags: string[] = [];

export default function render(container: HTMLElement) {
  toolLayout = createToolLayout(container, {
    id: 'tags',
    title: 'AI Tags',
    description: 'Auto-generate image tags and keywords',
    onFileSelect: handleFileSelect,
    renderControls: renderControls,
    seoContent: `<h2>AI Image Tagging</h2><p>Automatically generate relevant tags and keywords for your images. Great for organizing photo libraries and SEO.</p>`
  });
}

function handleFileSelect(file: File) {
  currentFile = file;
  generatedTags = [];
  updateTagsDisplay();
}

function renderControls(container: HTMLElement) {
  container.innerHTML = `
    <div class="info-box glass-card" style="padding: var(--spacing-lg);">
      <h4 style="margin: 0 0 var(--spacing-md); color: var(--accent-purple);">#️⃣ Smart Tagging</h4>
      <p style="margin: 0; font-size: var(--text-sm); color: var(--color-text-secondary);">
        AI analyzes your image to suggest relevant tags.
      </p>
    </div>
    <div class="tags-output glass-card" style="padding: var(--spacing-lg); margin-top: var(--spacing-md);">
      <h4 style="margin: 0 0 var(--spacing-sm);">Generated Tags</h4>
      <div id="tags-container" class="tags-container">
        <p style="color: var(--color-text-muted); font-style: italic;">Upload an image and click Process</p>
      </div>
      <div class="tags-actions" style="margin-top: var(--spacing-md); display: none;" id="tags-actions">
        <button class="btn btn-secondary" id="copy-tags">📋 Copy Tags</button>
        <button class="btn btn-secondary" id="copy-hashtags"># Copy as Hashtags</button>
      </div>
    </div>
  `;

  addTagStyles();

  const copyTagsBtn = container.querySelector('#copy-tags') as HTMLButtonElement;
  const copyHashtagsBtn = container.querySelector('#copy-hashtags') as HTMLButtonElement;

  copyTagsBtn?.addEventListener('click', async () => {
    await navigator.clipboard.writeText(generatedTags.join(', '));
    copyTagsBtn.textContent = '✓ Copied!';
    setTimeout(() => copyTagsBtn.textContent = '📋 Copy Tags', 2000);
  });

  copyHashtagsBtn?.addEventListener('click', async () => {
    await navigator.clipboard.writeText(generatedTags.map(t => '#' + t.replace(/\s+/g, '')).join(' '));
    copyHashtagsBtn.textContent = '✓ Copied!';
    setTimeout(() => copyHashtagsBtn.textContent = '# Copy as Hashtags', 2000);
  });

  toolLayout?.getProcessButton()?.addEventListener('click', processImage);
}

function updateTagsDisplay() {
  const tagsContainer = document.querySelector('#tags-container') as HTMLElement;
  const tagsActions = document.querySelector('#tags-actions') as HTMLElement;

  if (tagsContainer) {
    if (generatedTags.length > 0) {
      tagsContainer.innerHTML = generatedTags.map(tag =>
        `<span class="tag-badge">${tag}</span>`
      ).join('');
      if (tagsActions) tagsActions.style.display = 'flex';
    } else {
      tagsContainer.innerHTML = '<p style="color: var(--color-text-muted); font-style: italic;">Upload an image and click Process</p>';
      if (tagsActions) tagsActions.style.display = 'none';
    }
  }
}

async function processImage() {
  if (!currentFile || !toolLayout) return;
  toolLayout.showLoading(true);

  try {
    const img = new Image();
    const imageURL = URL.createObjectURL(currentFile);
    await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; img.src = imageURL; });

    // Demo tags based on file properties
    // In production, this would use a vision API
    const baseTags = ['image', 'photo', 'digital'];

    // Add orientation-based tags
    const aspectRatio = img.width / img.height;
    if (aspectRatio > 1.5) baseTags.push('landscape', 'wide', 'panoramic');
    else if (aspectRatio < 0.7) baseTags.push('portrait', 'vertical', 'tall');
    else baseTags.push('square', 'balanced');

    // Add resolution-based tags
    const megapixels = (img.width * img.height) / 1000000;
    if (megapixels > 8) baseTags.push('highres', '4K', 'professional');
    else if (megapixels > 2) baseTags.push('HD', 'quality');

    // Add file type tags
    if (currentFile.type.includes('png')) baseTags.push('PNG', 'transparent');
    else if (currentFile.type.includes('jpeg')) baseTags.push('JPEG', 'compressed');
    else if (currentFile.type.includes('webp')) baseTags.push('WebP', 'modern');

    generatedTags = baseTags;
    updateTagsDisplay();
    URL.revokeObjectURL(imageURL);
    toolLayout.showLoading(false);
  } catch (error) {
    toolLayout.showError('Tag generation failed.');
    toolLayout.showLoading(false);
  }
}

function addTagStyles() {
  if (document.querySelector('#tag-styles')) return;
  const styles = document.createElement('style');
  styles.id = 'tag-styles';
  styles.textContent = `
    .tags-container { display: flex; flex-wrap: wrap; gap: var(--spacing-sm); }
    .tag-badge { display: inline-block; padding: var(--spacing-xs) var(--spacing-sm);
      background: rgba(102, 126, 234, 0.2); color: var(--accent-blue);
      border-radius: var(--radius-full); font-size: var(--text-sm); }
    .tags-actions { display: flex; gap: var(--spacing-sm); flex-wrap: wrap; }
  `;
  document.head.appendChild(styles);
}
