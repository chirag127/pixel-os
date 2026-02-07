/**
 * Blur Face Tool
 * Auto-detect and blur faces using face-api.js
 */

import { createToolLayout, ToolLayout } from '../../components/ToolLayout';

let toolLayout: ToolLayout | null = null;
let currentFile: File | null = null;
let blurAmount = 20;
let modelsLoaded = false;

export default function render(container: HTMLElement) {
  toolLayout = createToolLayout(container, {
    id: 'blur-face',
    title: 'Blur Faces',
    description: 'Auto-detect and blur faces for privacy',
    onFileSelect: handleFileSelect,
    renderControls: renderControls,
    seoContent: `<h2>AI Face Blur</h2><p>Automatically detect and blur faces in photos. Protect privacy before sharing images online.</p>`
  });
}

function handleFileSelect(file: File) { currentFile = file; }

function renderControls(container: HTMLElement) {
  container.innerHTML = `
    <div class="control-group">
      <label class="control-label">Blur Amount: <span id="blur-value">${blurAmount}px</span></label>
      <input type="range" class="slider" id="blur-slider" min="5" max="50" value="${blurAmount}" step="5"/>
    </div>
    <div class="info-box glass-card" style="padding: var(--spacing-md);">
      <p style="margin: 0; font-size: var(--text-sm);">🔒 Uses AI to detect faces. All processing happens in your browser.</p>
    </div>
  `;

  const blurSlider = container.querySelector('#blur-slider') as HTMLInputElement;
  blurSlider.addEventListener('input', () => {
    blurAmount = parseInt(blurSlider.value);
    (container.querySelector('#blur-value') as HTMLElement).textContent = `${blurAmount}px`;
  });

  toolLayout?.getProcessButton()?.addEventListener('click', processImage);
}

async function processImage() {
  if (!currentFile || !toolLayout) return;
  toolLayout.showLoading(true);

  try {
    // Dynamically import face-api
    const faceapi = await import('@vladmandic/face-api');

    // Load models if not already loaded
    if (!modelsLoaded) {
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      modelsLoaded = true;
    }

    const img = new Image();
    const imageURL = URL.createObjectURL(currentFile);
    await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; img.src = imageURL; });

    // Detect faces
    const detections = await faceapi.detectAllFaces(img, new faceapi.TinyFaceDetectorOptions());

    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);

    // Blur each detected face
    for (const detection of detections) {
      const { x, y, width, height } = detection.box;

      // Extract face region
      const faceCanvas = document.createElement('canvas');
      faceCanvas.width = width;
      faceCanvas.height = height;
      const faceCtx = faceCanvas.getContext('2d')!;
      faceCtx.drawImage(img, x, y, width, height, 0, 0, width, height);

      // Apply blur using CSS filter technique
      faceCtx.filter = `blur(${blurAmount}px)`;
      faceCtx.drawImage(faceCanvas, 0, 0);

      // Draw blurred face back
      ctx.drawImage(faceCanvas, x, y);
    }

    const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), 'image/png', 1.0));
    URL.revokeObjectURL(imageURL);
    toolLayout.showResult(blob);
    toolLayout.showLoading(false);
  } catch (error) {
    console.error('Face detection failed:', error);
    // Fallback: Simple pixelation style blur if face detection fails
    await fallbackBlur();
  }
}

async function fallbackBlur() {
  if (!currentFile || !toolLayout) return;

  try {
    const img = new Image();
    const imageURL = URL.createObjectURL(currentFile);
    await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; img.src = imageURL; });

    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);

    // Apply center blur as fallback (user can crop to face area)
    const centerX = canvas.width * 0.3;
    const centerY = canvas.height * 0.2;
    const faceWidth = canvas.width * 0.4;
    const faceHeight = canvas.height * 0.4;

    ctx.filter = `blur(${blurAmount}px)`;
    ctx.drawImage(canvas, centerX, centerY, faceWidth, faceHeight, centerX, centerY, faceWidth, faceHeight);

    const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), 'image/png', 1.0));
    URL.revokeObjectURL(imageURL);
    toolLayout.showResult(blob);
    toolLayout.showLoading(false);
  } catch {
    toolLayout.showError('Blur failed. Try the manual Blur Area tool instead.');
    toolLayout.showLoading(false);
  }
}
