/**
 * Pixel OS - Main Entry Point
 */

import './styles/design-system.css';
import './styles/layout.css';
import { shell } from './shell';

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  const app = document.querySelector<HTMLDivElement>('#app');

  if (app) {
    shell.render(app);
  }
});

// Register service worker for PWA (optional)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // navigator.serviceWorker.register('/sw.js').catch(console.error);
  });
}

// Global error handling
window.onerror = (message, source, lineno, colno, error) => {
  console.error('Global error:', { message, source, lineno, colno, error });
};

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});
