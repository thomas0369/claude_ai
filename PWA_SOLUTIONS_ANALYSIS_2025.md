# PWA Solutions for Vite + Preact + TypeScript Stack (2025)

## Executive Summary

For a Vite + Preact + TypeScript stack prioritizing minimal bundle sizes and BSV blockchain deployment, **vite-plugin-pwa** is the clear recommendation. It offers:
- Zero-config setup with sensible defaults
- Native Preact support through `virtual:pwa-register/preact`
- Minimal bundle overhead (~10-15 KB for Workbox runtime, separate from main bundle)
- Framework-agnostic design that works seamlessly with lightweight stacks
- Built-in PWA Assets Generator for icon generation from a single source
- Full TypeScript support out of the box

**Key Finding**: Service worker code is loaded separately and doesn't inflate your main JavaScript bundle, making it compatible with ultra-lightweight stacks (Preact 3KB + Nanostores 286 bytes + DaisyUI 2KB).

---

## 1. Vite PWA Plugins

### vite-plugin-pwa (Recommended)

**Repository**: https://github.com/vite-pwa/vite-plugin-pwa
**Documentation**: https://vite-pwa-org.netlify.app/
**NPM**: https://www.npmjs.com/package/vite-plugin-pwa

#### Features

- **Zero-config PWA** with sensible defaults for common use cases
- **Built-in framework support**: Vanilla JS, Vue 3, React, Svelte, SolidJS, and **Preact**
- **Workbox integration**: Uses Workbox v7+ under the hood
- **Auto-update support**: Configurable service worker update strategies
- **Stale-while-revalidate**: Automatic reload when new content is available
- **Static assets handling**: Offline support for static resources
- **Development support**: Debug custom service worker logic in dev mode
- **PWA Assets Generator**: Generate all PWA assets from a single source image
- **TypeScript support**: Full type definitions included
- **Periodic SW updates**: Configurable interval for checking service worker updates

#### Preact Compatibility

**Excellent** - First-class support through dedicated virtual module:

```typescript
// Virtual module for Preact
import { useRegisterSW } from 'virtual:pwa-register/preact'

// Returns useState stateful values
const {
  offlineReady,    // useState<boolean>
  needRefresh,     // useState<boolean>
  updateServiceWorker
} = useRegisterSW()
```

**TypeScript Configuration**:
```json
{
  "compilerOptions": {
    "types": ["vite-plugin-pwa/preact"]
  }
}
```

**Example Repository**: https://github.com/pheralb/preact-pwa

#### Bundle Size Impact

| Component | Size | Notes |
|-----------|------|-------|
| registerSW.js | ~0.13 KB | Injected into index.html |
| manifest.webmanifest | ~0.14 KB | PWA manifest file |
| workbox-*.js | ~10-15 KB | Loaded separately as service worker |
| Service Worker | Varies | Separate from main bundle |

**Key Insight**: Service worker code runs independently and doesn't directly inflate your main application bundle. The runtime overhead is negligible (~0.13 KB for registration script).

#### Installation & Setup

**Minimal Configuration**:

```bash
npm i vite-plugin-pwa -D
```

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'My App',
        short_name: 'App',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})
```

#### Service Worker Strategies

Two strategies available:

1. **generateSW** (Default - Recommended for most use cases)
   - Plugin generates complete service worker automatically
   - Handles precaching configuration
   - Simpler setup, less control

2. **injectManifest** (Advanced - For custom service worker logic)
   - Plugin compiles your custom service worker
   - Injects precache manifest into your code
   - Maximum flexibility, more complex

```typescript
// generateSW strategy
VitePWA({
  strategies: 'generateSW',
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/api\.example\.com\/.*/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-cache',
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 300
          }
        }
      }
    ]
  }
})

// injectManifest strategy
VitePWA({
  strategies: 'injectManifest',
  srcDir: 'src',
  filename: 'sw.ts',
  injectManifest: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg}']
  }
})
```

#### Requirements

- **Vite**: v5+ (from v0.17)
- **Node.js**: v16+ (from v0.16, due to Workbox v7 requirement)

### Other Vite PWA Solutions

#### Manual Service Worker Implementation

**Pros**:
- Complete control over service worker logic
- No dependency on plugin ecosystem
- Can minimize bundle size further

**Cons**:
- Manual manifest generation and injection
- No built-in development support
- More boilerplate code
- Must handle service worker registration manually

**Use Case**: Only recommended if you need highly specialized service worker logic not supported by vite-plugin-pwa's `injectManifest` strategy.

**Reference**: https://dev.to/reeshee/how-to-bundle-your-custom-service-worker-in-vite-without-using-pwa-4nk

#### Service Worker Without PWA Capabilities

vite-plugin-pwa can be configured to manage just your service worker without full PWA features:

```typescript
VitePWA({
  manifest: false,  // Disable manifest generation
  injectRegister: 'inline',
  strategies: 'injectManifest'
})
```

**Use Case**: When you need a custom service worker but not all PWA features.

---

## 2. next-pwa Compatibility

### Analysis: NOT Compatible with Vite + Preact

**Repository**: https://github.com/shadowwalker/next-pwa
**Framework**: Next.js ONLY

#### Key Findings

- **next-pwa is Next.js-specific**: Designed exclusively for Next.js applications
- **Not compatible with Vite**: Next.js uses its own build system (webpack/Turbopack), not Vite
- **Different architecture**: Relies on Next.js-specific APIs and build pipeline

#### Equivalent Features in Vite Ecosystem

| next-pwa Feature | vite-plugin-pwa Equivalent |
|------------------|---------------------------|
| Zero-config PWA | Zero-config via `VitePWA()` |
| Workbox integration | Built-in Workbox v7+ |
| Service worker generation | `generateSW` strategy |
| Custom service worker | `injectManifest` strategy |
| Auto-update | `registerType: 'autoUpdate'` |
| Offline support | Runtime caching strategies |
| Web manifest | Built-in manifest generation |

#### Framework-Specific PWA Solutions

- **Next.js**: next-pwa, @ducanh2912/next-pwa, Serwist
- **Vite-based frameworks**: vite-plugin-pwa
- **Nuxt 3**: @vite-pwa/nuxt
- **SvelteKit**: @vite-pwa/sveltekit
- **Astro**: @vite-pwa/astro
- **VitePress**: @vite-pwa/vitepress
- **Remix**: @vite-pwa/remix

**Conclusion**: Use vite-plugin-pwa for Vite + Preact stack. It provides all the features of next-pwa within the Vite ecosystem.

---

## 3. Blitz.js Compatibility

### Analysis: NOT Compatible with Vite + Preact

**Website**: https://blitzjs.com/
**Repository**: https://github.com/blitz-js/blitz

#### What is Blitz.js?

**Full-stack React framework** built on top of Next.js, not a PWA library.

**Primary Purpose**:
- "The Missing Fullstack Toolkit for Next.js"
- Zero-API data layer (inspired by Ruby on Rails)
- Built-in authentication
- Database integration (Prisma)
- Code scaffolding
- Recipe system for common features

#### Key Findings

- **Built on Next.js**: Blitz extends Next.js, inheriting its webpack/Turbopack build system
- **Not compatible with Vite**: Blitz requires Next.js, which doesn't use Vite
- **Not compatible with Preact**: Blitz is React-based (Next.js dependency)
- **Not a PWA framework**: Blitz is a full-stack framework, not a PWA solution

#### Community Interest in Vite

**GitHub Discussion**: https://github.com/blitz-js/blitz/issues/2022

- Community expressed interest in Vite integration for faster HMR and build times
- Discussion about potential Vite support for "blitz kit"
- **Current Status**: No official Vite support, remains Next.js-based

#### PWA Features

Blitz.js has **no built-in PWA features**. For PWA functionality in Blitz:
- Use next-pwa (since Blitz is built on Next.js)
- Follow Next.js PWA patterns

**Conclusion**: Blitz.js is incompatible with Vite + Preact stack. It's a full-stack framework choice, not a PWA solution.

---

## 4. PWA Best Practices for 2025

### Service Worker Strategies (Workbox)

#### Available Caching Strategies

**1. CacheFirst (Offline-First)**
```typescript
{
  urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
  handler: 'CacheFirst',
  options: {
    cacheName: 'images-cache',
    expiration: {
      maxEntries: 60,
      maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
    }
  }
}
```
- Retrieves from cache first, falls back to network
- Best for: Static assets, fonts, images that rarely change
- Performance: Fastest response time
- Tradeoff: May serve stale content

**2. NetworkFirst**
```typescript
{
  urlPattern: /^https:\/\/api\.example\.com\/.*/,
  handler: 'NetworkFirst',
  options: {
    cacheName: 'api-cache',
    networkTimeoutSeconds: 5,
    expiration: {
      maxEntries: 50,
      maxAgeSeconds: 5 * 60 // 5 minutes
    }
  }
}
```
- Tries network first, falls back to cache on failure
- Best for: API requests, dynamic content, frequently updated data
- Performance: Slower but ensures fresh content
- Tradeoff: Network dependency

**3. StaleWhileRevalidate**
```typescript
{
  urlPattern: /\.(?:js|css)$/,
  handler: 'StaleWhileRevalidate',
  options: {
    cacheName: 'static-resources',
    expiration: {
      maxEntries: 60,
      maxAgeSeconds: 24 * 60 * 60 // 24 hours
    }
  }
}
```
- Returns cached version immediately, updates cache in background
- Best for: JavaScript, CSS, semi-static content
- Performance: Fast response with eventual consistency
- Recommended: Good balance for most use cases

**4. NetworkOnly**
```typescript
{
  urlPattern: /\/admin\/.*/,
  handler: 'NetworkOnly'
}
```
- Always fetches from network, no caching
- Best for: Admin pages, sensitive data, real-time content
- Performance: Slowest, network-dependent
- Tradeoff: Won't work offline

**5. CacheOnly**
```typescript
{
  urlPattern: /\/offline\.html$/,
  handler: 'CacheOnly'
}
```
- Only serves from cache, never network
- Best for: Precached fallback pages
- Performance: Instant, but requires precaching
- Use case: Offline fallback pages

#### Strategy Selection Guide

| Content Type | Recommended Strategy | Rationale |
|--------------|---------------------|-----------|
| HTML pages | NetworkFirst | Ensures fresh content, offline fallback |
| JavaScript | StaleWhileRevalidate | Balance between speed and updates |
| CSS | StaleWhileRevalidate | Balance between speed and updates |
| Images | CacheFirst | Rarely change, optimize loading |
| Fonts | CacheFirst | Static assets, long cache lifetime |
| API calls | NetworkFirst | Fresh data priority, offline fallback |
| Offline page | CacheOnly | Must be precached |

### Offline Support Patterns

#### 1. Precaching vs Runtime Caching

**Precaching**:
```typescript
workbox: {
  globPatterns: ['**/*.{js,css,html,ico,png,svg}']
}
```
- Caches assets at service worker installation
- **Pros**: Immediate offline availability, version consistency
- **Cons**: Larger initial payload, bandwidth on first visit
- **Best for**: App shell, critical assets

**Runtime Caching**:
```typescript
workbox: {
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/cdn\.example\.com\/.*/,
      handler: 'CacheFirst'
    }
  ]
}
```
- Caches assets as they're requested
- **Pros**: Smaller initial payload, lazy loading
- **Cons**: First visit requires network, potential version mismatches
- **Best for**: Images, external resources, user-generated content

**Recommendation**: Precache app shell + critical assets, runtime cache everything else.

#### 2. Offline Fallback Page

```typescript
VitePWA({
  workbox: {
    navigateFallback: '/offline.html',
    navigateFallbackDenylist: [/^\/admin/]
  }
})
```

Create `/public/offline.html`:
```html
<!DOCTYPE html>
<html>
<head>
  <title>Offline</title>
</head>
<body>
  <h1>You are offline</h1>
  <p>Please check your internet connection.</p>
</body>
</html>
```

### App Manifest Generation

#### Minimal Requirements (2025)

```typescript
manifest: {
  name: 'My Progressive Web App',
  short_name: 'MyPWA',
  description: 'A progressive web application',
  theme_color: '#ffffff',
  background_color: '#ffffff',
  display: 'standalone',
  start_url: '/',
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
}
```

#### Required Icons (2025)

| Size | Platform | Purpose |
|------|----------|---------|
| 192x192 | Android | PWA manifest icon |
| 512x512 | Android | PWA manifest icon, splash screen |
| 180x180 | iOS/MacOS | Apple touch icon |

#### PWA Assets Generator

**Installation**:
```bash
npm i @vite-pwa/assets-generator -D
```

**Configuration** (`pwa-assets.config.ts`):
```typescript
import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

export default defineConfig({
  preset: minimal2023Preset,
  images: ['public/logo.svg']
})
```

**Generate Assets**:
```bash
npx pwa-assets-generator
```

**Auto-Integration** (vite-plugin-pwa v0.19.0+):
```typescript
VitePWA({
  pwaAssets: {
    config: true  // Reads pwa-assets.config.ts
  }
})
```

**Best Practice**: Use SVG as source image for quality retention across all sizes.

### Push Notifications

#### Setup Requirements

1. **HTTPS hosting** (required for service workers)
2. **Service worker** (provided by vite-plugin-pwa)
3. **Web app manifest** (provided by vite-plugin-pwa)
4. **Push service integration**: Firebase Cloud Messaging (FCM) or Apple Push Notification Service (APNS)

#### Implementation with Preact

```typescript
// Request notification permission
const requestNotificationPermission = async () => {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }
  return false
}

// Subscribe to push notifications
const subscribeToNotifications = async () => {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: 'YOUR_PUBLIC_VAPID_KEY'
    })

    // Send subscription to your server
    await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription)
    })
  }
}
```

#### Best Practices (2025)

**Permission Request Timing**:
- **DON'T**: Request permission immediately on page load
- **DO**: Wait until user has interacted with your app
- **DO**: Use custom pre-permission screen explaining benefits
- **DO**: Respect "not now" decisions, don't repeatedly ask

**Platform Considerations**:

**iOS**:
- Notifications only work if PWA is added to home screen
- Requires properly configured web app manifest
- Strict requirements compared to Android

**Android**:
- Supports rich media, action buttons, custom sounds
- Battery optimization may block notifications if no recent interaction

**Messaging Best Practices**:
- Personalize messages
- Time strategically (not late night)
- Keep concise
- Align with real customer value (rewards, reminders, offers)
- Avoid pure promotional spam

**Privacy & Compliance**:
- Obtain explicit consent (GDPR, CCPA)
- Be transparent about data collection
- State notification frequency upfront

### Install Prompts

#### Default Browser Prompt

Modern browsers automatically show installation prompt when criteria met:
- HTTPS
- Valid web app manifest
- Registered service worker
- User engagement threshold

#### Custom Install Prompt (Android/Desktop)

```typescript
import { useState, useEffect } from 'preact/hooks'

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showInstallButton, setShowInstallButton] = useState(false)

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallButton(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    console.log(`User response: ${outcome}`)
    setDeferredPrompt(null)
    setShowInstallButton(false)
  }

  if (!showInstallButton) return null

  return (
    <button onClick={handleInstallClick}>
      Install App
    </button>
  )
}
```

#### iOS Considerations

**iOS does NOT support `beforeinstallprompt` event**. Must provide manual instructions:

```typescript
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
const isStandalone = window.matchMedia('(display-mode: standalone)').matches

if (isIOS && !isStandalone) {
  // Show iOS-specific instructions
  return (
    <div>
      <p>Install this app:</p>
      <ol>
        <li>Tap the Share button</li>
        <li>Scroll down and tap "Add to Home Screen"</li>
      </ol>
    </div>
  )
}
```

**Best Practice**: Feature-detect, don't user-agent sniff where possible.

### Update Strategies

#### 1. Auto Update (Recommended for content apps)

```typescript
VitePWA({
  registerType: 'autoUpdate'
})
```

**Behavior**:
- Forces `workbox.clientsClaim` and `workbox.skipWaiting` to `true`
- Automatically reloads page when new service worker available
- User sees reload of current page
- No user interaction required

**Best for**: News sites, blogs, content-heavy apps

**Caution**: Can disrupt users mid-action. Avoid for apps with forms or unsaved data.

#### 2. Prompt for Update (Recommended for apps with forms)

```typescript
VitePWA({
  registerType: 'prompt'
})
```

**Implementation with Preact**:
```typescript
import { useRegisterSW } from 'virtual:pwa-register/preact'

export function ReloadPrompt() {
  const {
    offlineReady,
    needRefresh,
    updateServiceWorker
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW registered:', r)
    },
    onRegisterError(error) {
      console.error('SW registration error:', error)
    }
  })

  const close = () => {
    offlineReady[1](false)
    needRefresh[1](false)
  }

  return (
    <div>
      {(offlineReady[0] || needRefresh[0]) && (
        <div className="toast toast-top toast-end">
          <div className="alert alert-info">
            {offlineReady[0] ? (
              <span>App ready to work offline</span>
            ) : (
              <span>New content available, click reload to update.</span>
            )}
            {needRefresh[0] && (
              <button onClick={() => updateServiceWorker(true)}>
                Reload
              </button>
            )}
            <button onClick={close}>Close</button>
          </div>
        </div>
      )}
    </div>
  )
}
```

**Best for**: Apps with forms, e-commerce, data entry apps

#### 3. Periodic Updates

```typescript
import { useRegisterSW } from 'virtual:pwa-register/preact'

const intervalMS = 60 * 60 * 1000 // 1 hour

const updateSW = useRegisterSW({
  onRegistered(r) {
    r && setInterval(() => {
      r.update()
    }, intervalMS)
  }
})
```

**Best for**: Long-running apps, dashboard apps

#### Important Gotcha

**Switching from `autoUpdate` to `prompt`** in production can cause issues:
- Users with old service worker may get stuck in skip-waiting stage
- Requires careful migration strategy
- Test thoroughly before switching

---

## 5. Bundle Size Considerations

### Stack Priorities

**Current Stack Sizes**:
- Preact: 3 KB
- Nanostores: 286 bytes
- DaisyUI: 2 KB (CSS-only)
- **Total**: ~5.3 KB

**Goal**: Keep PWA overhead minimal to maintain ultra-lightweight stack.

### PWA Bundle Size Impact

#### vite-plugin-pwa Overhead

| Component | Size | Included In | Impact on Main Bundle |
|-----------|------|-------------|----------------------|
| registerSW.js | 0.13 KB | HTML inline/external | Minimal - registration only |
| manifest.webmanifest | 0.14 KB | Separate file | None - metadata only |
| workbox-window | ~4-6 KB | Service worker context | None - separate from app |
| workbox runtime | ~10-15 KB | Service worker context | None - separate from app |
| Service worker logic | Varies | Service worker context | None - separate from app |
| **Total main bundle impact** | **~0.13-0.27 KB** | - | **< 5% of stack size** |

**Key Insight**: Service worker code runs in separate context and does NOT inflate your main JavaScript bundle.

#### Code Splitting & Lazy Loading

**Service Worker Registration**:
```typescript
// Option 1: Inline (minimal overhead, faster)
VitePWA({
  injectRegister: 'inline'
})

// Option 2: External script (cleaner HTML, slightly larger)
VitePWA({
  injectRegister: 'script'
})

// Option 3: Null (manual registration)
VitePWA({
  injectRegister: null
})
```

**Recommendation**: Use `inline` for minimal bundle size impact.

#### Workbox Module Selection

**generateSW**: Includes only necessary Workbox modules based on configuration
**injectManifest**: You control imports, can minimize further

```typescript
// Custom service worker with minimal imports
import { precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { CacheFirst } from 'workbox-strategies'

// Only import what you need
precacheAndRoute(self.__WB_MANIFEST)

registerRoute(
  ({request}) => request.destination === 'image',
  new CacheFirst()
)
```

### Comparison with Alternatives

| Solution | Main Bundle Impact | Service Worker Size | Setup Complexity | Maintenance |
|----------|-------------------|---------------------|------------------|-------------|
| vite-plugin-pwa | ~0.13 KB | ~10-15 KB | Minimal | Low |
| Manual SW | ~0.05 KB | Varies | High | High |
| No PWA | 0 KB | 0 KB | None | N/A |

**Recommendation**: vite-plugin-pwa overhead is negligible (~2-5% of stack) with significant PWA benefits.

### Bundle Size Optimization Tips

1. **Use `generateSW` strategy**: Automatic optimization of Workbox modules
2. **Limit precached assets**: Only precache critical app shell
3. **Use runtime caching**: Cache on-demand instead of precaching everything
4. **Minimize manifest.json**: Remove unnecessary metadata
5. **Optimize icons**: Use WebP format where supported, compress PNG
6. **Dynamic imports**: Split service worker logic if using `injectManifest`

```typescript
VitePWA({
  strategies: 'generateSW',
  workbox: {
    // Only precache critical files
    globPatterns: ['**/*.{js,css,html}'],
    // Exclude large assets from precache
    globIgnores: ['**/node_modules/**/*', '**/videos/**/*'],
    // Use runtime caching for images
    runtimeCaching: [
      {
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'images',
          expiration: {
            maxEntries: 60,
            maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
          }
        }
      }
    ]
  }
})
```

---

## 6. BSV Blockchain Compatibility

### BSV On-Chain Deployment Overview

**Transaction Size Limits**:
- **Maximum transaction size**: 1 GB (as of Genesis upgrade)
- **Script data capacity**: Up to 4.2 GB per script
- **OP_RETURN data**: 100 KB+ supported (no practical limit after Genesis)
- **Block size**: No default cap, determined by miners

**Deployment Cost**:
- Target: < 1 cent per app deployment
- Entire webpages can be stored in single transaction
- Websites stored on-chain via transaction IDs per page

### PWA Considerations for BSV Deployment

#### 1. Static Asset Strategy

**On-Chain Storage**:
- HTML, CSS, JavaScript stored via OP_RETURN
- Files referenced by transaction IDs
- Services like Bico.media provide infrastructure for accessing on-chain content

**Service Worker Compatibility**:
- Service workers work perfectly with on-chain static files
- Cache on-chain assets locally for offline access
- No modifications needed to vite-plugin-pwa configuration

```typescript
VitePWA({
  workbox: {
    // Cache on-chain assets by transaction ID pattern
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/bico\.media\/.*/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'bsv-onchain-assets',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 365 * 24 * 60 * 60 // 1 year - immutable on-chain
          }
        }
      }
    ]
  }
})
```

#### 2. Offline-First for Blockchain Apps

**Benefits**:
- Reduce on-chain reads (lower costs)
- Faster load times (cache vs blockchain query)
- Better UX in low-connectivity scenarios
- Immutable on-chain content is perfect for long cache lifetimes

**Recommended Strategy**:
```typescript
VitePWA({
  registerType: 'autoUpdate',
  workbox: {
    // Aggressive caching for immutable on-chain content
    runtimeCaching: [
      {
        // On-chain HTML
        urlPattern: /\.html$/,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'onchain-html',
          expiration: { maxAgeSeconds: 365 * 24 * 60 * 60 }
        }
      },
      {
        // On-chain JavaScript
        urlPattern: /\.js$/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'onchain-js',
          expiration: { maxAgeSeconds: 365 * 24 * 60 * 60 }
        }
      },
      {
        // On-chain CSS
        urlPattern: /\.css$/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'onchain-css',
          expiration: { maxAgeSeconds: 365 * 24 * 60 * 60 }
        }
      }
    ]
  }
})
```

#### 3. Bundle Size Critical for BSV

**Why Bundle Size Matters More**:
- Deployment cost based on data size
- Each byte costs satoshis
- Lighter bundles = cheaper deployment

**Optimization Checklist**:
- Use Preact (3 KB) instead of React (45 KB) ✓ Already done
- Use Nanostores (286 bytes) instead of Redux (12 KB) ✓ Already done
- Use DaisyUI (2 KB CSS) instead of heavy component libraries ✓ Already done
- Use vite-plugin-pwa (~0.13 KB impact) instead of manual SW ✓ Recommended
- Minify and compress all assets
- Tree-shake unused code
- Use dynamic imports for non-critical features

**Total Stack**:
- Preact: 3 KB
- Nanostores: 0.286 KB
- DaisyUI: 2 KB
- vite-plugin-pwa: 0.13 KB
- **Total**: ~5.4 KB

**BSV Deployment Cost** (estimated):
- At ~1 satoshi per byte
- At ~$60 per BSV
- 5.4 KB = 5,400 satoshis = $0.00324 USD

**Conclusion**: Stack remains well under 1 cent deployment target.

#### 4. react-onchain Compatibility

**Note**: No specific documentation found for "react-onchain" library. If this refers to a custom deployment tool:

**General Compatibility**:
- Service workers are standard browser API
- Work with any static file deployment
- No conflicts with blockchain deployment
- PWA features are client-side, don't affect on-chain storage

**Best Practice**:
1. Build your Preact + PWA app normally
2. Generate optimized production bundle
3. Deploy static files to BSV blockchain
4. Service worker will cache on-chain assets client-side
5. App works offline after first load

#### 5. Immutability Advantage

**BSV On-Chain Immutability**:
- Once deployed, content at transaction ID never changes
- Perfect for aggressive caching strategies
- Can use `CacheFirst` with long expiration for on-chain assets
- No cache invalidation concerns

**Service Worker Strategy**:
```typescript
// On-chain content is immutable - cache forever
{
  urlPattern: /^https:\/\/[on-chain-domain]\/tx\/.*/,
  handler: 'CacheFirst',
  options: {
    cacheName: 'immutable-onchain',
    expiration: {
      maxAgeSeconds: 365 * 24 * 60 * 60 * 10 // 10 years
    },
    cacheableResponse: {
      statuses: [0, 200]
    }
  }
}
```

### BSV-Specific Gotchas

1. **Transaction ID References**: Ensure service worker handles transaction ID routing correctly
2. **Cross-Origin**: On-chain content may require CORS configuration
3. **Version Management**: Since on-chain is immutable, use new transaction IDs for updates
4. **Manifest Updates**: New app versions = new on-chain deployment + updated manifest
5. **Cost Optimization**: Minimize precached assets, maximize runtime caching

---

## 7. Feature Comparison Table

| Feature | vite-plugin-pwa | next-pwa | Blitz.js | Manual SW |
|---------|----------------|----------|----------|-----------|
| **Framework Compatibility** |
| Vite | ✅ Yes | ❌ No | ❌ No | ✅ Yes |
| Preact | ✅ Native | ❌ No | ❌ No | ✅ Yes |
| React | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| Next.js | ❌ No | ✅ Yes | ✅ Yes | ⚠️ Complex |
| **Setup & Configuration** |
| Zero-config | ✅ Yes | ✅ Yes | ❌ No | ❌ No |
| TypeScript support | ✅ Built-in | ✅ Yes | ✅ Yes | ⚠️ Manual |
| Configuration complexity | ⭐ Low | ⭐ Low | ⭐⭐⭐ High | ⭐⭐⭐ High |
| **Service Worker Features** |
| Auto-generation | ✅ generateSW | ✅ Yes | ❌ N/A | ❌ No |
| Custom SW support | ✅ injectManifest | ✅ Yes | ❌ N/A | ✅ Yes |
| Workbox integration | ✅ v7+ | ✅ Yes | ❌ N/A | ⚠️ Manual |
| Dev mode support | ✅ Yes | ✅ Yes | ❌ N/A | ⚠️ Complex |
| **Caching Strategies** |
| Precaching | ✅ Yes | ✅ Yes | ❌ N/A | ⚠️ Manual |
| Runtime caching | ✅ Yes | ✅ Yes | ❌ N/A | ⚠️ Manual |
| Multiple strategies | ✅ Yes | ✅ Yes | ❌ N/A | ⚠️ Manual |
| Custom cache rules | ✅ Yes | ✅ Yes | ❌ N/A | ✅ Yes |
| **Update Strategies** |
| Auto-update | ✅ Yes | ✅ Yes | ❌ N/A | ⚠️ Manual |
| Prompt for update | ✅ Yes | ✅ Yes | ❌ N/A | ⚠️ Manual |
| Periodic updates | ✅ Yes | ⚠️ Manual | ❌ N/A | ⚠️ Manual |
| **Manifest & Assets** |
| Manifest generation | ✅ Yes | ✅ Yes | ❌ N/A | ⚠️ Manual |
| Icon generation | ✅ @vite-pwa/assets-generator | ❌ Manual | ❌ N/A | ❌ Manual |
| Asset optimization | ✅ Yes | ✅ Yes | ❌ N/A | ⚠️ Manual |
| **Bundle Size** |
| Main bundle impact | 0.13-0.27 KB | ~1-2 KB | N/A | ~0.05 KB |
| SW runtime size | ~10-15 KB | ~10-15 KB | N/A | Varies |
| Total overhead | ⭐ Minimal | ⭐ Minimal | N/A | ⭐ Smallest |
| **Developer Experience** |
| Documentation | ⭐⭐⭐ Excellent | ⭐⭐⭐ Good | ⭐⭐ Good | ⭐ Poor |
| Examples | ⭐⭐⭐ Many | ⭐⭐⭐ Many | ⭐⭐ Some | ⭐ Few |
| Community support | ⭐⭐⭐ Active | ⭐⭐⭐ Active | ⭐⭐ Moderate | ⭐ Limited |
| Maintenance burden | ⭐ Low | ⭐ Low | ⭐⭐ Medium | ⭐⭐⭐ High |
| **BSV Blockchain** |
| On-chain compatible | ✅ Yes | ✅ Yes | ❌ Backend | ✅ Yes |
| Minimal bundle size | ✅ Yes | ⚠️ Medium | ❌ Large | ✅ Yes |
| Static deployment | ✅ Yes | ⚠️ Complex | ❌ No | ✅ Yes |

**Legend**:
- ✅ Full support
- ⚠️ Partial support / Manual setup required
- ❌ Not supported
- ⭐⭐⭐ Excellent
- ⭐⭐ Good
- ⭐ Basic

---

## 8. Compatibility Matrix

### Framework Compatibility

|  | Vite | Preact | React | Vue | Svelte | Next.js | Vanilla JS |
|--|------|--------|-------|-----|--------|---------|------------|
| **vite-plugin-pwa** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| **next-pwa** | ❌ | ❌ | ✅* | ❌ | ❌ | ✅ | ❌ |
| **Blitz.js** | ❌ | ❌ | ✅* | ❌ | ❌ | ✅ | ❌ |
| **Manual SW** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

*Only through Next.js

### Stack Compatibility (Vite + Preact + TypeScript)

| Solution | Compatible | Native Support | Setup Complexity |
|----------|-----------|---------------|------------------|
| vite-plugin-pwa | ✅ Yes | ✅ Yes | ⭐ Low |
| next-pwa | ❌ No | N/A | N/A |
| Blitz.js | ❌ No | N/A | N/A |
| Manual SW | ✅ Yes | ⚠️ Requires setup | ⭐⭐⭐ High |

### Build Tool Compatibility

| PWA Solution | Webpack | Vite | Rollup | Parcel | esbuild |
|--------------|---------|------|--------|--------|---------|
| vite-plugin-pwa | ❌ | ✅ | ✅* | ❌ | ❌ |
| next-pwa | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manual SW | ✅ | ✅ | ✅ | ✅ | ✅ |

*Vite uses Rollup for production builds

### TypeScript Compatibility

| Solution | Built-in Types | Type Safety | Auto-completion |
|----------|----------------|-------------|----------------|
| vite-plugin-pwa | ✅ Yes | ✅ Full | ✅ Yes |
| next-pwa | ✅ Yes | ✅ Full | ✅ Yes |
| Blitz.js | ✅ Yes | ✅ Full | ✅ Yes |
| Manual SW | ⚠️ Manual | ⚠️ Partial | ⚠️ Limited |

### State Management Compatibility

| Solution | Redux | Zustand | Jotai | Nanostores | Valtio |
|----------|-------|---------|-------|------------|--------|
| vite-plugin-pwa | ✅ | ✅ | ✅ | ✅ | ✅ |
| next-pwa | ✅ | ✅ | ✅ | ✅ | ✅ |
| Manual SW | ✅ | ✅ | ✅ | ✅ | ✅ |

*All PWA solutions are state-management agnostic

### UI Library Compatibility

| Solution | Tailwind CSS | DaisyUI | Mantine | MUI | Chakra |
|----------|--------------|---------|---------|-----|--------|
| vite-plugin-pwa | ✅ | ✅ | ✅ | ✅ | ✅ |
| next-pwa | ✅ | ✅ | ✅ | ✅ | ✅ |
| Manual SW | ✅ | ✅ | ✅ | ✅ | ✅ |

*All PWA solutions are UI-library agnostic

### Deployment Platform Compatibility

|  | Vercel | Netlify | Cloudflare | BSV On-Chain | GitHub Pages | Static Host |
|--|--------|---------|------------|--------------|--------------|-------------|
| **vite-plugin-pwa** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **next-pwa** | ✅ | ✅ | ⚠️ | ❌* | ❌* | ❌* |
| **Manual SW** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

*next-pwa requires Next.js server-side features, not fully static

---

## 9. Final Recommendation for Vite + Preact + BSV Stack

### Recommended Solution: vite-plugin-pwa

**Rationale**:
1. **Native Preact Support**: First-class integration via `virtual:pwa-register/preact`
2. **Minimal Bundle Impact**: ~0.13 KB main bundle overhead (< 3% of stack)
3. **Zero-Config**: Sensible defaults, production-ready out of the box
4. **BSV Compatible**: Static output perfect for on-chain deployment
5. **Cost-Effective**: Minimal overhead fits BSV deployment budget (< 1 cent)
6. **Developer Experience**: Excellent docs, TypeScript support, active community
7. **Maintenance**: Low maintenance burden, auto-updates with Vite ecosystem

### Recommended Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    preact(),
    VitePWA({
      registerType: 'prompt', // Better for apps with forms
      includeAssets: ['favicon.svg', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'BSV App',
        short_name: 'BSVApp',
        description: 'Blockchain-deployed Progressive Web App',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        // Minimal precaching - only app shell
        globPatterns: ['**/*.{js,css,html}'],
        // Runtime cache for on-chain immutable assets
        runtimeCaching: [
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 365 * 24 * 60 * 60 // 1 year
              }
            }
          }
        ]
      }
    })
  ]
})
```

```typescript
// src/ReloadPrompt.tsx
import { useRegisterSW } from 'virtual:pwa-register/preact'

export function ReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker
  } = useRegisterSW()

  const close = () => {
    setOfflineReady(false)
    setNeedRefresh(false)
  }

  return (
    <div className="pwa-toast" role="alert">
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
  )
}
```

```typescript
// src/main.tsx
import { render } from 'preact'
import { App } from './app'
import { ReloadPrompt } from './ReloadPrompt'

render(
  <>
    <App />
    <ReloadPrompt />
  </>,
  document.getElementById('app')!
)
```

```json
// tsconfig.json
{
  "compilerOptions": {
    "types": ["vite/client", "vite-plugin-pwa/preact"]
  }
}
```

### Icon Generation Setup

```bash
npm i @vite-pwa/assets-generator -D
```

```typescript
// pwa-assets.config.ts
import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

export default defineConfig({
  preset: minimal2023Preset,
  images: ['public/logo.svg']
})
```

```bash
npx pwa-assets-generator
```

Update vite.config.ts:
```typescript
VitePWA({
  pwaAssets: {
    config: true
  }
})
```

### Production Build & BSV Deployment

```bash
# Build optimized production bundle
npm run build

# Output: dist/ directory
# dist/
#   ├── index.html
#   ├── assets/
#   │   ├── index-[hash].js
#   │   └── index-[hash].css
#   ├── sw.js
#   ├── workbox-[hash].js
#   └── manifest.webmanifest

# Deploy to BSV blockchain
# Total size: ~5.4 KB
# Cost: ~$0.003 USD (< 1 cent)
```

---

## 10. Gotchas & Considerations

### 1. Service Worker Scope

**Issue**: Service worker scope determines which URLs it can control.

**Default Behavior**:
```
Service Worker at: /sw.js
Scope: / (entire site)
```

**Custom Scope**:
```typescript
VitePWA({
  scope: '/app/'  // Only controls /app/* URLs
})
```

**Gotcha**: Service worker at `/app/sw.js` can only control `/app/*` URLs, not root `/`.

**Best Practice**: Place service worker at root for maximum coverage.

### 2. Development vs Production

**Issue**: Service worker behavior differs between dev and prod.

**Development**:
- Service worker updates on every reload (if `devOptions.enabled: true`)
- No aggressive caching
- Easier debugging

**Production**:
- Service worker caches aggressively
- Updates require new service worker version
- Harder to test locally

**Gotcha**: "Works in dev, broken in prod" often due to caching behavior.

**Best Practice**:
```typescript
VitePWA({
  devOptions: {
    enabled: true,  // Enable SW in dev for testing
    type: 'module'
  }
})
```

### 3. Cache Invalidation

**Issue**: Old cached content persists after deployment.

**Problem**:
```
Deploy v2 → Users still see v1 (cached)
```

**Solution**:
- Use `autoUpdate` for automatic updates
- Use `prompt` to let users choose when to update
- Use versioning in cache names

```typescript
workbox: {
  cleanupOutdatedCaches: true,  // Remove old caches
  runtimeCaching: [
    {
      urlPattern: /.*/,
      handler: 'NetworkFirst',  // Prioritize fresh content
      options: {
        cacheName: 'app-v2',  // Version cache names
        networkTimeoutSeconds: 5
      }
    }
  ]
}
```

### 4. iOS Safari Limitations

**Issue**: iOS Safari has stricter PWA requirements.

**Limitations**:
- No `beforeinstallprompt` event
- PWA must be added to home screen manually
- Service worker limited features when not installed
- Push notifications only work if installed to home screen

**Solution**:
```typescript
// Detect iOS
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
const isInstalled = window.matchMedia('(display-mode: standalone)').matches

if (isIOS && !isInstalled) {
  // Show iOS-specific install instructions
  showIOSInstructions()
}
```

**Best Practice**: Provide clear manual instructions for iOS users.

### 5. HTTPS Requirement

**Issue**: Service workers require HTTPS (except localhost).

**Problem**:
```
HTTP site → Service worker blocked
```

**Exceptions**:
- `localhost` (for development)
- `127.0.0.1` (for development)

**Solution**:
- Use HTTPS in production (required)
- Use localhost for development
- Free HTTPS: Let's Encrypt, Cloudflare, Vercel, Netlify

### 6. Workbox Version Conflicts

**Issue**: Multiple versions of Workbox can conflict.

**Problem**:
```
App uses Workbox 6
vite-plugin-pwa uses Workbox 7
→ Conflicts
```

**Solution**: Let vite-plugin-pwa manage Workbox, don't install separately.

**Best Practice**:
```json
// package.json - DON'T do this
{
  "dependencies": {
    "workbox-window": "7.0.0"  // ❌ Conflict risk
  }
}

// Let vite-plugin-pwa handle it
{
  "devDependencies": {
    "vite-plugin-pwa": "^0.20.0"  // ✅ Includes Workbox
  }
}
```

### 7. Switching Update Strategies

**Issue**: Changing from `autoUpdate` to `prompt` can cause issues.

**Problem**:
```
Production users have autoUpdate SW
Deploy new version with prompt
→ Users stuck in skip-waiting state
```

**Solution**: Carefully migrate with force-update logic.

**Best Practice**: Choose strategy early, avoid switching in production.

### 8. Large Precache Payloads

**Issue**: Precaching everything creates huge initial download.

**Problem**:
```
globPatterns: ['**/*']
→ Precaches entire site on first visit
→ Poor first-load performance
```

**Solution**: Precache only app shell, runtime cache the rest.

```typescript
workbox: {
  // ❌ DON'T precache everything
  globPatterns: ['**/*'],

  // ✅ DO precache only app shell
  globPatterns: ['**/*.{js,css,html}'],
  globIgnores: ['**/node_modules/**/*', '**/videos/**/*'],

  // ✅ DO runtime cache other assets
  runtimeCaching: [
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg)$/,
      handler: 'CacheFirst'
    }
  ]
}
```

### 9. Cross-Origin Assets

**Issue**: Service worker can't cache cross-origin assets without CORS.

**Problem**:
```
<img src="https://cdn.example.com/image.png">
→ Service worker can't cache (CORS error)
```

**Solution**:
```typescript
runtimeCaching: [
  {
    urlPattern: /^https:\/\/cdn\.example\.com\/.*/,
    handler: 'CacheFirst',
    options: {
      cacheableResponse: {
        statuses: [0, 200]  // Cache opaque responses
      }
    }
  }
]
```

**Note**: Opaque responses count toward storage quota but show size 0.

### 10. BSV On-Chain Specific

**Issue**: On-chain immutable content requires different strategy.

**Considerations**:
- Transaction IDs never change
- Content is immutable
- Can cache very aggressively
- Version management via new transaction IDs

**Best Practice**:
```typescript
runtimeCaching: [
  {
    // On-chain immutable assets
    urlPattern: /^https:\/\/bico\.media\/tx\/.*/,
    handler: 'CacheFirst',
    options: {
      cacheName: 'immutable-onchain',
      expiration: {
        maxAgeSeconds: 365 * 24 * 60 * 60 * 10  // 10 years
      }
    }
  },
  {
    // Mutable API endpoints
    urlPattern: /^https:\/\/api\.example\.com\/.*/,
    handler: 'NetworkFirst',
    options: {
      cacheName: 'api-cache',
      expiration: {
        maxAgeSeconds: 5 * 60  // 5 minutes
      }
    }
  }
]
```

### 11. Form Data Loss

**Issue**: Auto-update can reload page mid-form.

**Problem**:
```
User filling form
→ Auto-update triggers
→ Page reloads
→ Form data lost
```

**Solution**: Use `prompt` strategy for apps with forms.

```typescript
VitePWA({
  registerType: 'prompt'  // User controls when to update
})
```

### 12. Storage Quota

**Issue**: Browser storage quota can be exceeded.

**Limits**:
- Chrome: ~60% of available disk space
- Firefox: ~50% of available disk space
- Safari: 50 MB - 1 GB

**Solution**: Set expiration limits on caches.

```typescript
workbox: {
  runtimeCaching: [
    {
      urlPattern: /.*/,
      handler: 'CacheFirst',
      options: {
        expiration: {
          maxEntries: 100,        // Limit cache entries
          maxAgeSeconds: 7 * 24 * 60 * 60  // 7 days
        }
      }
    }
  ]
}
```

---

## 11. Additional Resources

### Official Documentation

- **vite-plugin-pwa**: https://vite-pwa-org.netlify.app/
- **Workbox**: https://developer.chrome.com/docs/workbox/
- **Preact**: https://preactjs.com/
- **Vite**: https://vitejs.dev/
- **PWA on MDN**: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps

### GitHub Repositories

- **vite-plugin-pwa**: https://github.com/vite-pwa/vite-plugin-pwa
- **PWA Assets Generator**: https://github.com/vite-pwa/assets-generator
- **Preact PWA Template**: https://github.com/pheralb/preact-pwa
- **Awesome Preact**: https://github.com/preactjs/awesome-preact

### Tools & Testing

- **Lighthouse**: PWA audit tool (Chrome DevTools)
- **PWA Builder**: https://www.pwabuilder.com/
- **Workbox Wizard**: https://web.dev/learn/pwa/workbox/
- **Can I Use**: https://caniuse.com/?search=service%20worker

### BSV Resources

- **BSV Blockchain Docs**: https://docs.bsvblockchain.org/
- **Bico.media**: https://bico.media/
- **BSV Skills Center**: https://docs.bsvblockchain.org/
- **WhatsOnChain Explorer**: https://whatsonchain.com/

### Community

- **Vite Discord**: https://chat.vitejs.dev/
- **Preact Discord**: https://preactjs.com/discord
- **Workbox GitHub Discussions**: https://github.com/GoogleChrome/workbox/discussions

---

## 12. Summary

### Quick Decision Matrix

**Choose vite-plugin-pwa if**:
- ✅ Using Vite
- ✅ Want zero-config setup
- ✅ Need production-ready PWA quickly
- ✅ Want minimal maintenance
- ✅ Deploying to BSV blockchain (static output)

**Choose manual service worker if**:
- ✅ Need absolute minimal bundle size
- ✅ Have highly specialized service worker requirements
- ✅ Want complete control over every aspect
- ❌ Don't mind higher maintenance burden

**Don't use next-pwa if**:
- ❌ Not using Next.js

**Don't use Blitz.js if**:
- ❌ Not building full-stack React app
- ❌ Not using Next.js

### Final Stack Recommendation

```
Framework:  Preact (3 KB)
Build Tool: Vite
State:      Nanostores (286 bytes)
UI:         DaisyUI (2 KB CSS)
PWA:        vite-plugin-pwa (~0.13 KB impact)
Language:   TypeScript
Deployment: BSV Blockchain (< 1 cent per app)

Total Core Bundle: ~5.4 KB
Deployment Cost: ~$0.003 USD
```

**Result**: Ultra-lightweight, blockchain-deployable PWA with excellent developer experience and minimal overhead.

---

*Last Updated: 2025-01-09*
*Research compiled from official documentation, GitHub repositories, community forums, and real-world production implementations.*
