# 🎨 Pixel OS

**Privacy-First Browser-Based Image Manipulation Suite**

![Status](https://img.shields.io/badge/status-in%20development-yellow)
![License](https://img.shields.io/badge/license-MIT-blue)
![TypeScript](https://img.shields.io/badge/typescript-5.9.3-blue)
![Vite](https://img.shields.io/badge/vite-7.2.5-646CFF)

> 35+ powerful image tools that run entirely in your browser. Your images never leave your device.

## 🚀 Live Demo

🌐 **Production:** [img.oriz.in](https://img.oriz.in) *(coming soon)*

## ✨ Features

- **🔒 100% Private** - All processing happens client-side using WebAssembly
- **⚡ Lightning Fast** - No upload/download delays, WASM-powered performance
- **🎨 Beautiful UI** - Glassmorphism design with "Liquid Retina" aesthetics
- **📱 Mobile-First** - Responsive design works on all devices
- **🤖 AI-Powered** - Background removal, upscaling, and more
- **💯 Completely Free** - No watermarks, signups, or limits

## 🛠️ Tools (6/35 Complete)

### 📦 Drive A: Optimize ✅
- [x] **Compress JPEG** - Lossy compression with quality control
- [x] **Compress PNG** - Lossless PNG optimization
- [x] **Compress WebP** - Modern format compression
- [x] **AI Upscale** - 2x/4x image enhancement
- [x] **Remove Background** ⭐ - AI-powered WASM background removal
- [x] **Vectorize** - Raster to SVG conversion

### ✂️ Drive B: Modify (Coming Soon)
- [ ] Resize, Crop, Rotate, Flip, Circle Crop, Skew

### 🔄 Drive C: Convert (Coming Soon)
- [ ] JPG↔PNG, WebP, HEIC, SVG, HTML-to-Image, Base64

### 🎨 Drive D: Create (Coming Soon)
- [ ] Meme Maker, Collage, Markup, Quote, Gradient, Social Card, QR Art

### 🔒 Drive E: Security (Coming Soon)
- [ ] Watermark, Blur Face, Blur Area, EXIF tools, Pixelate

### 🤖 Drive F: AI Tools (Coming Soon)
- [ ] AI Caption, Tags, Vision (powered by Puter.js)

## 🏗️ Tech Stack

- **Frontend:** Vite + TypeScript
- **Styling:** CSS (Glassmorphism Design System)
- **Image Processing:**
  - `@imgly/background-removal` - WASM AI background removal
  - `browser-image-compression` - Client-side compression
  - `@vladmandic/face-api` - Face detection
  - `cropperjs`, `html-to-image`, `heic2any`, `upscaler`

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
pixel-os/
├── src/
│   ├── apps/           # 35+ tool implementations
│   │   ├── optimize/   # ✅ 6 tools complete
│   │   ├── modify/     # 📝 Coming soon
│   │   ├── convert/    # 📝 Coming soon
│   │   ├── create/     # 📝 Coming soon
│   │   ├── security/   # 📝 Coming soon
│   │   └── ai/         # 📝 Coming soon
│   ├── components/     # Reusable UI components
│   ├── styles/         # Design system CSS
│   ├── router.ts       # SPA routing
│   └── shell.ts        # App chrome
├── public/
│   └── models/         # AI model files
└── vite.config.ts      # Build configuration
```

## 🎯 Development Progress

- [x] Project setup & dependencies
- [x] Core architecture (router, shell)
- [x] Design system (glassmorphism)
- [x] Reusable components (DropZone, ToolLayout)
- [x] Drive A: Optimize (6 tools)
- [ ] Drive B: Modify (6 tools)
- [ ] Drive C: Convert (8 tools)
- [ ] Drive D: Create (7 tools)
- [ ] Drive E: Security (6 tools)
- [ ] Drive F: AI Tools (3 tools)
- [ ] SEO content for all pages
- [ ] PWA manifest & service worker

**Progress:** 17% (6/35 tools)

## 🔧 Key Features

### Privacy-First Processing

All image manipulation happens in your browser using WebAssembly. Your photos never touch our servers.

```typescript
// Example: Background removal runs 100% client-side
import { removeBackground } from '@imgly/background-removal';

const blob = await removeBackground(image, {
  progress: (progress) => console.log(progress)
});
```

### Responsive Design

Mobile-first design with glassmorphism aesthetics:
- **Mobile:** Bottom sheet navigation
- **Desktop:** Sidebar with drive categories
- **Tablet:** Adaptive bento grid

### Component Architecture

Reusable components for consistent UX:

```typescript
// DropZone - Drag & drop with instant preview
const dropZone = createDropZone(container, {
  accept: ['image/*'],
  onFiles: (files) => handleFiles(files)
});

// ToolLayout - Base layout for all tools
const tool = createToolLayout(container, {
  title: 'Compress JPEG',
  onFileSelect: processFile
});
```

## 📝 Environment Variables

No environment variables required for core functionality!

AI tools (Drive F) will require:
```bash
VITE_PUTER_API_KEY=your_puter_key_here  # For AI caption/tags/vision
```

## 🤝 Contributing

Contributions welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📜 License

MIT License - feel free to use this project for your own purposes.

## 🙏 Acknowledgments

- [imgly/background-removal](https://github.com/imgly/background-removal-js) - Amazing WASM BG removal
- [browser-image-compression](https://github.com/Donaldcwl/browser-image-compression) - Client-side compression
- [vladmandic/face-api](https://github.com/vladmandic/face-api) - Face detection

## 📞 Contact

Built with ❤️ by [Chirag](https://github.com/chirag127)

---

**⚠️ Status:** Currently in active development. Drive A (Optimize) is complete and functional. Remaining drives coming soon!
