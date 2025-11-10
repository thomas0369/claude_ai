# PWA Integration Guide for Thomas's Stack

**Stack:** Vite + Preact + TailwindCSS + DaisyUI + Nanostores + vite-plugin-pwa
**PWA Solution:** vite-plugin-pwa (officially recommended)
**Date:** 2025-01-09

---

## Quick Start

```bash
# Install PWA plugin
npm install -D vite-plugin-pwa @vite-pwa/assets-generator

# Update vite.config.ts (already integrated in thomas-setup)
# Add ReloadPrompt component to your app
# Generate PWA assets from your logo
npx pwa-assets-generator
```

---

## Why vite-plugin-pwa?

### Perfect Fit for Your Stack

| Feature | vite-plugin-pwa | next-pwa | Blitz.js |
|---------|----------------|----------|----------|
| **Vite Compatible** | ✅ Yes | ❌ No (Next.js only) | ❌ No (Next.js only) |
| **Preact Compatible** | ✅ Native support | ❌ No | ❌ No |
| **Bundle Impact** | ~0.13 KB | ~1-2 KB | N/A |
| **BSV On-Chain** | ✅ Perfect | ⚠️ Complex | ❌ No |
| **Zero-Config** | ✅ Yes | ✅ Yes | ❌ No |

### Bundle Size Impact

**Your optimized stack:**
```
Preact:          3 KB
Nanostores:      0.286 KB
DaisyUI:         2 KB
vite-plugin-pwa: 0.13 KB (registration only)
Service Worker:  ~10-15 KB (runs separately, not in main bundle)
----------------
Total:           ~5.4 KB main bundle
```

**BSV Deployment Cost:**
- Stack without PWA: ~5.3 KB = ~$0.00002
- Stack with PWA: ~5.4 KB = ~$0.000021
- **Cost increase: < 5% ($0.000001 per deployment)**

**Verdict:** ✅ Negligible cost increase for complete PWA functionality!

---

## Configuration (Already in thomas-setup)

### vite.config.ts

```typescript
import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    preact({
      prefreshEnabled: true,
      devToolsEnabled: true,
      reactAliasesEnabled: true,
    }),

    VitePWA({
      registerType: 'prompt',  // User-controlled updates
      includeAssets: ['favicon.svg', 'robots.txt', 'apple-touch-icon.png'],

      manifest: {
        name: 'My PWA App',
        short_name: 'MyApp',
        description: 'A Progressive Web Application',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },

      workbox: {
        // Minimal precaching - only app shell
        globPatterns: ['**/*.{js,css,html}'],

        // Runtime caching strategies
        runtimeCaching: [
          {
            // Images
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
              }
            }
          },
          {
            // BSV on-chain assets (immutable)
            urlPattern: /^https:\/\/bico\.media\/tx\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'bsv-onchain-assets',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 365 * 24 * 60 * 60 // 1 year
              }
            }
          }
        ]
      },

      // PWA Assets Generator integration
      pwaAssets: {
        config: true
      },

      // Development mode (optional)
      devOptions: {
        enabled: false,  // Set true to test PWA in dev
        type: 'module'
      }
    })
  ]
});
```

### tsconfig.json

Add PWA types:

```json
{
  "compilerOptions": {
    "types": ["vite/client", "vite-plugin-pwa/preact", "vite-plugin-pwa/client"]
  }
}
```

---

## Preact Integration

### ReloadPrompt Component

```tsx
// src/components/pwa/ReloadPrompt.tsx
import { useRegisterSW } from 'virtual:pwa-register/preact';

export function ReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker
  } = useRegisterSW();

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  return (
    <div>
      {(offlineReady || needRefresh) && (
        <div className="toast toast-top toast-end">
          <div className="alert alert-info">
            <div>
              {offlineReady ? (
                <span>App ready to work offline</span>
              ) : (
                <span>New content available, click reload to update.</span>
              )}
            </div>
            <div className="flex gap-2">
              {needRefresh && (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => updateServiceWorker(true)}
                >
                  Reload
                </button>
              )}
              <button className="btn btn-ghost btn-sm" onClick={close}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

### Add to Your App

```tsx
// src/App.tsx
import { ReloadPrompt } from './components/pwa/ReloadPrompt';

export default function App() {
  return (
    <div data-theme="dark" className="min-h-screen">
      {/* Your app content */}

      {/* PWA reload prompt */}
      <ReloadPrompt />
    </div>
  );
}
```

---

## PWA Assets Generation

### Step 1: Create PWA Assets Config

```typescript
// pwa-assets.config.ts
import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config';

export default defineConfig({
  preset: minimal2023Preset,
  images: ['public/logo.svg'] // Your app logo (SVG recommended)
});
```

### Step 2: Generate Assets

```bash
# Generate all PWA icons from your logo
npx pwa-assets-generator

# Output:
# ✓ pwa-64x64.png
# ✓ pwa-192x192.png
# ✓ pwa-512x512.png
# ✓ pwa-64x64.png
# ✓ apple-touch-icon-180x180.png
# ✓ maskable-icon-512x512.png
```

### Step 3: Auto-Integration

Vite-plugin-pwa automatically detects and uses generated assets (already configured in vite.config.ts).

---

## BSV On-Chain PWA Deployment

### Perfect Match!

PWA features work **seamlessly** with BSV on-chain deployment:

1. **Static Output**: Service workers work with static files
2. **Immutable Content**: On-chain content never changes - perfect for aggressive caching
3. **Offline-First**: Users can access on-chain app even when offline
4. **Version Management**: Each BSV deployment = new version, service worker handles updates

### BSV-Specific Caching Strategy

```typescript
workbox: {
  runtimeCaching: [
    {
      // BSV on-chain content (immutable)
      urlPattern: /^https:\/\/bico\.media\/tx\/.*/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'bsv-onchain-immutable',
        expiration: {
          maxAgeSeconds: 365 * 24 * 60 * 60 * 10 // 10 years!
        },
        cacheableResponse: {
          statuses: [0, 200]
        }
      }
    },
    {
      // BSV API calls (mutable)
      urlPattern: /^https:\/\/api\.whatsonchain\.com\/.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'bsv-api',
        networkTimeoutSeconds: 5,
        expiration: {
          maxAgeSeconds: 5 * 60 // 5 minutes
        }
      }
    }
  ]
}
```

### Deployment Workflow

```bash
# 1. Build with PWA features
npm run build

# 2. Test PWA locally
npm run preview

# 3. Deploy to BSV blockchain
npx react-onchain deploy --version-tag "1.0.0"

# Result: PWA app permanently on-chain!
# - Offline support ✓
# - Install prompt ✓
# - Auto-updates ✓
# - Immutable caching ✓
```

---

## PWA Features

### 1. Offline Support

**Automatic:**
- App shell cached on first visit
- Works offline immediately
- Background sync when online

**Perfect for BSV:**
- Users can access on-chain app without internet
- Wallet balance cached locally
- Transaction history available offline
- Game state persists offline

### 2. Install Prompt

**Desktop & Android:**
```tsx
// components/pwa/InstallPrompt.tsx
import { useState, useEffect } from 'preact/hooks';

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    console.log(`User response: ${outcome}`);
    setDeferredPrompt(null);
    setShowInstall(false);
  };

  if (!showInstall) return null;

  return (
    <div className="alert alert-info">
      <div>
        <span>Install this app for better experience</span>
      </div>
      <button className="btn btn-primary btn-sm" onClick={handleInstall}>
        Install
      </button>
    </div>
  );
}
```

**iOS (Manual Instructions):**
```tsx
// components/pwa/IOSInstallPrompt.tsx
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

if (isIOS && !isStandalone) {
  return (
    <div className="alert alert-info">
      <div>
        <h3 className="font-bold">Install this app:</h3>
        <ol className="list-decimal list-inside">
          <li>Tap the Share button</li>
          <li>Scroll down and tap "Add to Home Screen"</li>
        </ol>
      </div>
    </div>
  );
}
```

### 3. Auto-Updates

**Two Strategies:**

**A. Auto-Update (Content Apps)**
```typescript
VitePWA({
  registerType: 'autoUpdate'
})
```
- Automatically reloads when new version available
- Best for: News sites, blogs, content apps
- ⚠️ Can disrupt user mid-action

**B. Prompt (Apps with Forms)** - ✅ Recommended
```typescript
VitePWA({
  registerType: 'prompt'
})
```
- User controls when to update
- Best for: Apps with forms, games, wallets
- ✅ Better UX for BSV apps

### 4. Background Sync (Optional)

For BSV apps with pending transactions:

```typescript
// sw.ts (custom service worker with injectManifest)
import { precacheAndRoute } from 'workbox-precaching';

precacheAndRoute(self.__WB_MANIFEST);

// Background sync for pending BSV transactions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-pending-transactions') {
    event.waitUntil(syncPendingTransactions());
  }
});

async function syncPendingTransactions() {
  const pending = await getPendingTransactions();
  for (const tx of pending) {
    await broadcastTransaction(tx);
  }
}
```

---

## Service Worker Strategies

### 1. generateSW (Recommended - Default)

**Automatic service worker generation:**
- Plugin handles everything
- Simpler setup
- Less control
- **Perfect for most apps**

```typescript
VitePWA({
  strategies: 'generateSW',
  workbox: {
    globPatterns: ['**/*.{js,css,html}'],
    runtimeCaching: [/* your cache rules */]
  }
})
```

### 2. injectManifest (Advanced)

**Custom service worker:**
- Maximum control
- More complex
- **Use for advanced features**

```typescript
VitePWA({
  strategies: 'injectManifest',
  srcDir: 'src',
  filename: 'sw.ts',
  injectManifest: {
    globPatterns: ['**/*.{js,css,html}']
  }
})
```

Then create `src/sw.ts`:
```typescript
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst } from 'workbox-strategies';

precacheAndRoute(self.__WB_MANIFEST);

// Custom caching for BSV on-chain assets
registerRoute(
  ({url}) => url.hostname === 'bico.media',
  new CacheFirst({
    cacheName: 'bsv-onchain',
    plugins: [
      {
        cacheWillUpdate: async ({response}) => {
          return response.status === 200 ? response : null;
        }
      }
    ]
  })
);
```

---

## Testing PWA

### Local Testing

```bash
# 1. Enable PWA in development (optional)
# In vite.config.ts:
devOptions: {
  enabled: true,
  type: 'module'
}

# 2. Or test production build locally
npm run build
npm run preview

# 3. Open in browser
# - Chrome DevTools → Application → Service Workers
# - Check "Offline" to test offline functionality
# - Check "Update on reload" for development
```

### Chrome DevTools Audit

```bash
# 1. Open your app in Chrome
# 2. DevTools → Lighthouse
# 3. Run PWA audit
# 4. Target: Score > 90
```

### PWA Checklist

- [ ] Manifest with 192x192 and 512x512 icons
- [ ] Service worker registered
- [ ] HTTPS (required in production)
- [ ] Offline fallback page
- [ ] Theme color in manifest
- [ ] App works offline
- [ ] Install prompt works (desktop/Android)
- [ ] Updates handled gracefully

---

## Production Deployment

### Vercel + PWA

**Works perfectly:**
```bash
# Vercel auto-detects Vite + PWA
# Just push to GitHub
git push origin main

# Vercel deploys with PWA features:
# ✓ Service worker
# ✓ Manifest
# ✓ HTTPS (required)
# ✓ Global CDN
```

### BSV On-Chain + PWA

**Perfect combination:**
```bash
# Build with PWA
npm run build

# Deploy to BSV
npx react-onchain deploy --version-tag "1.0.0"

# Result:
# - Permanent on-chain URL
# - Full PWA features
# - Offline support
# - Install prompt
# - Auto-updates (when you deploy new versions)
```

---

## Resources

### Official Documentation
- vite-plugin-pwa: https://vite-pwa-org.netlify.app/
- Workbox: https://developer.chrome.com/docs/workbox/
- PWA on MDN: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps

### Tools
- PWA Assets Generator: https://github.com/vite-pwa/assets-generator
- Lighthouse (PWA Audit): Chrome DevTools
- PWA Builder: https://www.pwabuilder.com/

### Your Stack
- PWA Solutions Analysis: `~/.claude/PWA_SOLUTIONS_ANALYSIS_2025.md`
- BSV Tech Stack: `~/.claude/BSV-TECH-STACK-ANALYSIS.md`
- Thomas Setup: `~/.claude/commands/thomas-setup.md`

---

## Summary

**PWA Integration for Your Stack: 10/10 ✅**

### What You Get

✅ **Offline Support** - App works without internet
✅ **Install Prompt** - Add to home screen (desktop/mobile)
✅ **Auto-Updates** - User-controlled or automatic
✅ **BSV Compatible** - Perfect for on-chain deployment
✅ **Minimal Overhead** - ~0.13 KB main bundle impact
✅ **Native Preact Support** - `virtual:pwa-register/preact`
✅ **Zero Config** - Works out of the box

### Total Stack Size

```
Preact:           3 KB
Nanostores:       0.286 KB
DaisyUI:          2 KB
vite-plugin-pwa:  0.13 KB
------------------
Total:            ~5.4 KB

BSV Deployment:   ~$0.000021 (< 1 cent)
```

**Verdict:** Perfect PWA solution for your BSV blockchain stack! 🎉

---

**Last Updated:** 2025-01-09
**For:** Thomas's Vite + Preact + BSV Stack
**PWA Solution:** vite-plugin-pwa (officially recommended)
