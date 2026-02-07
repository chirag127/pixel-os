/**
 * EXIF Remove Tool
 * Strip metadata from images
 */

import { createToolLayout, ToolLayout } from '../../components/ToolLayout';

let toolLayout: ToolLayout | null = null;
let currentFile: File | null = null;

export default function render(container: HTMLElement) {
  toolLayout = createToolLayout(container, {
    id: 'exif-remove',
    title: 'Remove EXIF',
    description: 'Strip metadata from images for privacy',
    onFileSelect: handleFileSelect,
    renderControls: renderControls,
    seoContent: `<h2>Remove Image Metadata</h2><p>Strip EXIF data including GPS location, camera info, and timestamps. Protect your privacy before sharing photos.</p>`
  });
}

function handleFileSelect(file: File) { currentFile = file; }

function renderControls(container: HTMLElement) {
  container.innerHTML = `
    <div class="info-box glass-card" style="padding: var(--spacing-lg);">
      <h4 style="margin: 0 0 var(--spacing-md); color: var(--accent-blue);">🔒 What Gets Removed</h4>
      <ul style="margin: 0; padding-left: var(--spacing-lg); font-size: var(--text-sm); color: var(--color-text-secondary);">
        <li>GPS location data</li>
        <li>Camera make/model</li>
        <li>Date and time taken</li>
        <li>Software information</li>
        <li>Thumbnail images</li>
        <li>All other EXIF metadata</li>
      </ul>
    </div>
    <div class="info-box glass-card" style="padding: var(--spacing-md); margin-top: var(--spacing-md); background: rgba(34, 197, 94, 0.1);">
      <p style="margin: 0; font-size: var(--text-sm); color: var(--accent-green);">
        ✓ Image quality is preserved. Only metadata is removed.
      </p>
    </div>
  `;

  toolLayout?.getProcessButton()?.addEventListener('click', processImage);
}

async function processImage() {
  if (!currentFile || !toolLayout) return;
  toolLayout.showLoading(true);

  try {
    const img = new Image();
    const imageURL = URL.createObjectURL(currentFile);
    await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; img.src = imageURL; });

    // Re-drawing the image to canvas strips all EXIF data
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);

    // Determine output format based on original
    const mimeType = currentFile.type === 'image/png' ? 'image/png' : 'image/jpeg';
    const quality = mimeType === 'image/jpeg' ? 0.95 : 1.0;

    const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), mimeType, quality));
    URL.revokeObjectURL(imageURL);
    toolLayout.showResult(blob);
    toolLayout.showLoading(false);
  } catch (error) {
    toolLayout.showError('EXIF removal failed.');
    toolLayout.showLoading(false);
  }
}
