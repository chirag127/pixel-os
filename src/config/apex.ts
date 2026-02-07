/**
 * APEX MASTER CONFIGURATION
 * ==========================================================
 * Strategy: "Zero-Server" Architecture
 * Hosting: Static (Cloudflare Pages / GitHub Pages / Vercel)
 * Backend: Firebase + Client-Side APIs
 * Monetization: AdSense (Primary) + Non-Intrusive Backups
 * Analytics: 8-Layer Redundancy
 * ==========================================================
 */

export const APEX_CONFIG = {
  // ========================================================================
  // 1. MONETIZATION (Non-Intrusive Only)
  // ========================================================================
  monetization: {
    adsense: {
      publisherId: 'ca-pub-XXXXXXXXXXXXXXXX',
      autoAds: true,
      lazyLoad: true,
      enabled: true,
    },
    aads: {
      unitId: '2425642',
      size: 'Adaptive',
      enabled: true,
    },
    kofi: {
      username: 'chirag127',
      label: 'Support Me',
      enabled: true,
    },
    amazon: {
      trackingId: 'chirag127-20',
      marketplace: 'US',
      enabled: true,
    },
  },

  // ========================================================================
  // 2. ANALYTICS STACK (8-Layer Redundancy)
  // ========================================================================
  tracking: {
    ga4: {
      measurementId: 'G-BPSZ007KGR',
      enabled: true,
    },
    clarity: {
      projectId: 'v9yyfdb222',
      enabled: true,
    },
    yandex: {
      tagId: 106547626,
      webvisor: true,
      clickmap: true,
      enabled: true,
    },
    mixpanel: {
      token: '54c23accec03549caca40b0a7efab7d6',
      enabled: true,
    },
    cloudflare: {
      token: '333c0705152b4949b3eb0538cd4c2296',
      enabled: true,
    },
    goatcounter: {
      code: 'chirag127',
      enabled: true,
    },
    amplitude: {
      apiKey: 'd1733215e7a8236a73912adf86ac450b',
      enabled: true,
    },
    heap: {
      appId: '3491046690',
      enabled: true,
    },
  },

  // ========================================================================
  // 3. RELIABILITY STACK (Error Tracking)
  // ========================================================================
  reliability: {
    sentry: {
      dsn: 'https://45890ca96ce164182a3c74cca6018e3e@o4509333332164608.ingest.de.sentry.io/4509333334458448',
      enabled: true,
    },
    honeybadger: {
      apiKey: 'hbp_d5yADoevD4dyItN7Bu5bqNevwqgjaJ3ns2lE',
      enabled: true,
    },
    rollbar: {
      accessToken: 'f06dfc71b1c840e6a101d8dd317146f2',
      enabled: true,
    },
    bugsnag: {
      apiKey: '84afb61cb3bf458037f4f15eeab394c4',
      enabled: true,
    },
    cronitor: {
      rumKey: '205a4c0b70da8fb459aac415c1407b4d',
      enabled: true,
    },
  },

  // ========================================================================
  // 4. BAAS & ENGAGEMENT
  // ========================================================================
  baas: {
    firebase: {
      config: {
        apiKey: 'AIzaSyCx--SPWCNaIY5EJpuJ_Hk28VtrVhBo0Ng',
        authDomain: 'fifth-medley-408209.firebaseapp.com',
        projectId: 'fifth-medley-408209',
        storageBucket: 'fifth-medley-408209.firebasestorage.app',
        messagingSenderId: '1017538017299',
        appId: '1:1017538017299:web:bd8ccb096868a6f394e7e6',
      },
      enabled: true,
    },
    tawkto: {
      sourceUrl: 'https://embed.tawk.to/6968e3ea8783b31983eb190b/1jf0rkjhp',
      enabled: true,
    },
    giscus: {
      repo: 'chirag127/pixel-os',
      repoId: 'R_kgDOQ6Jz_Q',
      categoryId: 'DIC_kwDOQ6Jz_c4C1VQo',
      enabled: true,
    },
    growthbook: {
      clientKey: 'sdk-BamkgvyjaSFKa0m6',
      enabled: true,
    },
  },

  // ========================================================================
  // 5. UTILITY
  // ========================================================================
  utility: {
    fonts: {
      families: ['Inter:wght@400;600', 'JetBrains+Mono:wght@400;500'],
      display: 'swap',
      enabled: true,
    },
  },
};

// Helper to check if service is enabled
export function isEnabled(path: string): boolean {
  const parts = path.split('.');
  let current: unknown = APEX_CONFIG;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return false;
    }
  }
  return current === true;
}
