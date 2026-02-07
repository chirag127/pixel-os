/**
 * Pixel OS Router
 * Client-side SPA routing with hash-based navigation
 */

export interface Route {
  path: string;
  title: string;
  component: () => Promise<{ default: (container: HTMLElement) => void }>;
}

export interface RouteMatch {
  route: Route;
  params: Record<string, string>;
}

// All app routes
export const routes: Route[] = [
  // Home
  { path: '/', title: 'Pixel OS - Image Manipulation Suite', component: () => import('./pages/home') },

  // Drive A: Optimize
  { path: '/apps/optimize/compress-jpg', title: 'Compress JPEG - Pixel OS', component: () => import('./apps/optimize/compress-jpg') },
  { path: '/apps/optimize/compress-png', title: 'Compress PNG - Pixel OS', component: () => import('./apps/optimize/compress-png') },
  { path: '/apps/optimize/compress-webp', title: 'Compress WebP - Pixel OS', component: () => import('./apps/optimize/compress-webp') },
  { path: '/apps/optimize/upscale', title: 'AI Upscale - Pixel OS', component: () => import('./apps/optimize/upscale') },
  { path: '/apps/optimize/remove-bg', title: 'Remove Background - Pixel OS', component: () => import('./apps/optimize/remove-bg') },
  { path: '/apps/optimize/vectorize', title: 'Vectorize - Pixel OS', component: () => import('./apps/optimize/vectorize') },

  // Drive B: Modify
  { path: '/apps/modify/resize', title: 'Resize Image - Pixel OS', component: () => import('./apps/modify/resize') },
  { path: '/apps/modify/crop', title: 'Crop Image - Pixel OS', component: () => import('./apps/modify/crop') },
  { path: '/apps/modify/rotate', title: 'Rotate Image - Pixel OS', component: () => import('./apps/modify/rotate') },
  { path: '/apps/modify/flip', title: 'Flip Image - Pixel OS', component: () => import('./apps/modify/flip') },
  { path: '/apps/modify/circle-crop', title: 'Circle Crop - Pixel OS', component: () => import('./apps/modify/circle-crop') },
  { path: '/apps/modify/skew', title: 'Skew Image - Pixel OS', component: () => import('./apps/modify/skew') },

  // Drive C: Convert
  { path: '/apps/convert/jpg-to-png', title: 'JPG to PNG - Pixel OS', component: () => import('./apps/convert/jpg-to-png') },
  { path: '/apps/convert/png-to-jpg', title: 'PNG to JPG - Pixel OS', component: () => import('./apps/convert/png-to-jpg') },
  { path: '/apps/convert/webp-to-jpg', title: 'WebP to JPG - Pixel OS', component: () => import('./apps/convert/webp-to-jpg') },
  { path: '/apps/convert/heic-to-jpg', title: 'HEIC to JPG - Pixel OS', component: () => import('./apps/convert/heic-to-jpg') },
  { path: '/apps/convert/svg-to-png', title: 'SVG to PNG - Pixel OS', component: () => import('./apps/convert/svg-to-png') },
  { path: '/apps/convert/html-to-image', title: 'HTML to Image - Pixel OS', component: () => import('./apps/convert/html-to-image') },
  { path: '/apps/convert/image-to-base64', title: 'Image to Base64 - Pixel OS', component: () => import('./apps/convert/image-to-base64') },
  { path: '/apps/convert/json-to-image', title: 'JSON to Image - Pixel OS', component: () => import('./apps/convert/json-to-image') },

  // Drive D: Create
  { path: '/apps/create/meme', title: 'Meme Maker - Pixel OS', component: () => import('./apps/create/meme') },
  { path: '/apps/create/collage', title: 'Collage Maker - Pixel OS', component: () => import('./apps/create/collage') },
  { path: '/apps/create/markup', title: 'Screenshot Markup - Pixel OS', component: () => import('./apps/create/markup') },
  { path: '/apps/create/quote', title: 'Quote Generator - Pixel OS', component: () => import('./apps/create/quote') },
  { path: '/apps/create/gradient', title: 'Gradient Generator - Pixel OS', component: () => import('./apps/create/gradient') },
  { path: '/apps/create/social-card', title: 'Social Card Maker - Pixel OS', component: () => import('./apps/create/social-card') },
  { path: '/apps/create/qr-art', title: 'QR Art Generator - Pixel OS', component: () => import('./apps/create/qr-art') },

  // Drive E: Security
  { path: '/apps/security/watermark', title: 'Add Watermark - Pixel OS', component: () => import('./apps/security/watermark') },
  { path: '/apps/security/blur-face', title: 'Blur Faces - Pixel OS', component: () => import('./apps/security/blur-face') },
  { path: '/apps/security/blur-area', title: 'Blur Area - Pixel OS', component: () => import('./apps/security/blur-area') },
  { path: '/apps/security/exif-remove', title: 'Remove EXIF - Pixel OS', component: () => import('./apps/security/exif-remove') },
  { path: '/apps/security/exif-view', title: 'View EXIF - Pixel OS', component: () => import('./apps/security/exif-view') },
  { path: '/apps/security/pixelate', title: 'Pixelate - Pixel OS', component: () => import('./apps/security/pixelate') },

  // Drive F: AI (Placeholder - requires Puter.js auth)
  { path: '/apps/ai/caption', title: 'AI Caption - Pixel OS', component: () => import('./apps/ai/caption') },
  { path: '/apps/ai/tags', title: 'AI Tags - Pixel OS', component: () => import('./apps/ai/tags') },
  { path: '/apps/ai/vision', title: 'AI Vision - Pixel OS', component: () => import('./apps/ai/vision') },
];

class Router {
  private currentRoute: Route | null = null;
  private container: HTMLElement | null = null;

  constructor() {
    window.addEventListener('hashchange', () => this.handleRouteChange());
    window.addEventListener('load', () => this.handleRouteChange());
  }

  init(container: HTMLElement) {
    this.container = container;
    this.handleRouteChange();
  }

  private getPath(): string {
    const hash = window.location.hash.slice(1) || '/';
    return hash;
  }

  private matchRoute(path: string): RouteMatch | null {
    for (const route of routes) {
      if (route.path === path) {
        return { route, params: {} };
      }

      // Handle dynamic segments (e.g., /apps/:drive/:tool)
      const routeParts = route.path.split('/');
      const pathParts = path.split('/');

      if (routeParts.length === pathParts.length) {
        const params: Record<string, string> = {};
        let match = true;

        for (let i = 0; i < routeParts.length; i++) {
          if (routeParts[i].startsWith(':')) {
            params[routeParts[i].slice(1)] = pathParts[i];
          } else if (routeParts[i] !== pathParts[i]) {
            match = false;
            break;
          }
        }

        if (match) {
          return { route, params };
        }
      }
    }
    return null;
  }

  private async handleRouteChange() {
    if (!this.container) return;

    const path = this.getPath();
    const match = this.matchRoute(path);

    if (match) {
      this.currentRoute = match.route;
      document.title = match.route.title;

      // Show loading state
      this.container.innerHTML = `
        <div class="loading-state">
          <div class="loading-spinner animate-spin"></div>
          <p>Loading...</p>
        </div>
      `;

      try {
        const module = await match.route.component();
        this.container.innerHTML = '';
        module.default(this.container);
      } catch (error) {
        console.error('Failed to load route:', error);
        this.container.innerHTML = `
          <div class="error-state">
            <h2>Failed to load page</h2>
            <p>Please try again or go back to <a href="#/">home</a>.</p>
          </div>
        `;
      }
    } else {
      // 404
      this.container.innerHTML = `
        <div class="error-state">
          <h1>404</h1>
          <p>Page not found. <a href="#/">Go home</a></p>
        </div>
      `;
    }
  }

  navigate(path: string) {
    window.location.hash = path;
  }

  getCurrentRoute(): Route | null {
    return this.currentRoute;
  }
}

export const router = new Router();
