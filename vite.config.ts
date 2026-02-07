import { defineConfig } from 'vite';

export default defineConfig({
  optimizeDeps: {
    // Exclude heavy WASM packages from pre-bundling
    exclude: ['@imgly/background-removal', '@tensorflow/tfjs']
  },
  build: {
    target: 'esnext',
    // Increase chunk size limit for large libraries
    chunkSizeWarningLimit: 2000
  },
  server: {
    headers: {
      // Required for SharedArrayBuffer (used by some WASM libs)
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp'
    }
  }
});
