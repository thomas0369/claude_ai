# Deployment Guide - Vercel → BSV On-Chain

Complete deployment workflow for Vite + Preact + BSV applications.

**Date:** 2025-11-09
**Stack:** Vite, Preact, TailwindCSS, DaisyUI, Nanostores, Konva, BSV

---

## Table of Contents

1. [Overview](#overview)
2. [Deployment Workflow](#deployment-workflow)
3. [Vercel Setup](#vercel-setup)
4. [Environment Variables](#environment-variables)
5. [Preview Deployments](#preview-deployments)
6. [Production Deployment](#production-deployment)
7. [BSV On-Chain Deployment](#bsv-on-chain-deployment)
8. [Cost Analysis](#cost-analysis)
9. [Troubleshooting](#troubleshooting)

---

## Overview

### Deployment Strategy

```
┌─────────────┐    ┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Local Dev  │ → │ Vercel Preview  │ → │ Vercel Production│ → │ BSV On-Chain    │
│  (npm run   │    │ (PR deployment) │    │ (main branch)    │    │ (permanent)     │
│   dev)      │    │                 │    │                  │    │                 │
└─────────────┘    └─────────────────┘    └──────────────────┘    └─────────────────┘
     FREE               FREE                    FREE                  ~$0.00002
```

### Why This Workflow?

1. **Local Development**: Fast HMR with Vite + Prefresh
2. **Vercel Preview**: Test every change with unique preview URLs
3. **Vercel Production**: Stable production environment, global CDN
4. **BSV On-Chain**: Permanent, censorship-resistant final deployment

### Platform Comparison

| Platform | Rating | Best For | Free Tier |
|----------|--------|----------|-----------|
| **Vercel** | 10/10 | Vite + Preact apps | Unlimited (hobby) |
| Cloudflare Pages | 9/10 | Global distribution | Unlimited builds |
| GitHub Pages | 7/10 | Static sites | 1 site per repo |
| Netlify | 8/10 | JAMstack apps | 100 GB/month |
| **BSV On-Chain** | 10/10 | Permanent storage | Pay per deployment (~$0.00002) |

**Recommendation:** Vercel for development/testing → BSV for final permanent deployment

---

## Deployment Workflow

### Complete Workflow Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                        Development Cycle                              │
└──────────────────────────────────────────────────────────────────────┘

1. Local Development
   ├─ npm run dev
   ├─ Edit code
   ├─ Test in browser (localhost:3000)
   └─ Commit changes
      │
      v
2. Preview Deployment (Automatic)
   ├─ Push to feature branch
   ├─ Open Pull Request
   ├─ Vercel builds and deploys
   ├─ Get preview URL: https://your-app-xyz123.vercel.app
   ├─ Test in preview
   └─ Merge PR
      │
      v
3. Production Deployment (Automatic)
   ├─ Merge to main branch
   ├─ Vercel builds and deploys
   ├─ Get production URL: https://your-app.vercel.app
   └─ Test in production
      │
      v
4. BSV On-Chain Deployment (Manual)
   ├─ npm run build
   ├─ npx react-onchain deploy
   ├─ Pay ~$0.00002 (20 sats)
   └─ Get on-chain URL: https://1satordinals.com/inscription/<txid>
```

---

## Vercel Setup

### Prerequisites

- GitHub account
- Vercel account (free: https://vercel.com/signup)
- Vite + Preact project created with `/thomas-setup`

### Step 1: Install Vercel CLI (Optional)

```bash
npm install -g vercel

# Login to Vercel
vercel login
```

**Note:** CLI is optional - Vercel can deploy automatically from GitHub without CLI.

### Step 2: Connect GitHub Repository

1. **Create GitHub repository:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   gh repo create your-app-name --public --source=. --push
   ```

2. **Import to Vercel:**
   - Go to https://vercel.com/new
   - Click "Import Git Repository"
   - Select your repository
   - Click "Import"

### Step 3: Configure Build Settings

Vercel auto-detects Vite projects, but verify:

```
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

**For Bun (faster):**
```
Install Command: bun install
Build Command: bun run build
```

### Step 4: Deploy

Click **"Deploy"** - Vercel will build and deploy your app.

**First deployment:**
- Production URL: `https://your-app.vercel.app`
- Auto-assigned domain (can customize later)

### Step 5: Configure vercel.json (Optional)

Create `vercel.json` in project root for advanced configuration:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

**Benefits:**
- SPA routing support (`rewrites`)
- Asset caching optimization (`headers`)
- Build configuration

---

## Environment Variables

### Local Development (.env)

Create `.env` file in project root:

```bash
# .env (NOT committed to git)
VITE_BSV_NETWORK=mainnet
VITE_API_URL=https://api.whatsonchain.com/v1/bsv/main
VITE_ENABLE_DEVTOOLS=true
```

**Important:** Add `.env` to `.gitignore`:
```bash
# .gitignore
.env
.env.local
.env.production
```

### Vercel Environment Variables

1. Go to Vercel dashboard → Project Settings → Environment Variables
2. Add variables:

| Key | Value | Environments |
|-----|-------|--------------|
| `VITE_BSV_NETWORK` | `mainnet` | Production |
| `VITE_BSV_NETWORK` | `testnet` | Preview |
| `VITE_API_URL` | `https://api.whatsonchain.com/v1/bsv/main` | Production, Preview |
| `VITE_ENABLE_DEVTOOLS` | `false` | Production |
| `VITE_ENABLE_DEVTOOLS` | `true` | Preview, Development |

**Access in code:**
```typescript
// src/config/env.ts
export const config = {
  bsvNetwork: import.meta.env.VITE_BSV_NETWORK || 'mainnet',
  apiUrl: import.meta.env.VITE_API_URL,
  enableDevTools: import.meta.env.VITE_ENABLE_DEVTOOLS === 'true',
};
```

### Environment-Specific Builds

Vercel automatically sets `NODE_ENV`:
- Preview: `NODE_ENV=development`
- Production: `NODE_ENV=production`

**Use in code:**
```typescript
const isDev = import.meta.env.DEV;
const isProd = import.meta.env.PROD;

// Conditional features
if (isDev) {
  console.log('Development mode - extra logging enabled');
}
```

---

## Preview Deployments

### Automatic Preview Deployments

Every pull request gets a unique preview URL:

```
┌─────────────────────────────────────────────────────────┐
│  Pull Request #42: "Add wallet connection"             │
├─────────────────────────────────────────────────────────┤
│  Preview URL: https://your-app-git-wallet-user.vercel.app │
│  Status: ✅ Deployment successful                       │
└─────────────────────────────────────────────────────────┘
```

### Preview Workflow

1. **Create feature branch:**
   ```bash
   git checkout -b feature/wallet-connection
   ```

2. **Make changes and commit:**
   ```bash
   git add .
   git commit -m "Add wallet connection feature"
   git push origin feature/wallet-connection
   ```

3. **Open Pull Request:**
   ```bash
   gh pr create --title "Add wallet connection" --body "Implements BSV wallet connection"
   ```

4. **Vercel builds automatically:**
   - Vercel bot comments on PR with preview URL
   - Every new commit updates the preview
   - Preview URL: `https://your-app-git-[branch]-[user].vercel.app`

5. **Test preview:**
   - Click preview URL in PR
   - Test new features
   - Share with team for review

6. **Merge when ready:**
   ```bash
   gh pr merge --squash
   ```

### Preview Features

✅ **Unique URL per branch**
✅ **Auto-updates on new commits**
✅ **Same environment as production**
✅ **Shareable for feedback**
✅ **Deleted after PR merge** (keeps things clean)

### Testing Checklist for Previews

- [ ] All features work as expected
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Canvas/Konva rendering correctly
- [ ] BSV wallet connections work (testnet)
- [ ] Performance is acceptable (Lighthouse)
- [ ] Nanostores state persists correctly

---

## Production Deployment

### Automatic Production Deployments

Every push to `main` branch triggers production deployment:

```bash
git checkout main
git pull origin main
git merge feature/wallet-connection
git push origin main
# Vercel deploys automatically
```

### Production URL

- Default: `https://your-app.vercel.app`
- Custom domain: `https://yourdomain.com` (configure in Vercel dashboard)

### Custom Domain Setup

1. Go to Vercel dashboard → Project Settings → Domains
2. Add domain: `yourdomain.com`
3. Configure DNS (Vercel provides instructions):
   ```
   Type: A
   Name: @
   Value: 76.76.21.21

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```
4. Wait for DNS propagation (~5-30 minutes)
5. Vercel auto-provisions SSL certificate

### Production Checklist

Before deploying to production:

- [ ] All tests passing
- [ ] No TypeScript errors: `npm run build`
- [ ] Lighthouse score > 90
- [ ] Bundle size < 200KB (check with `npm run build`)
- [ ] Environment variables configured
- [ ] Error tracking setup (optional: Sentry)
- [ ] Analytics setup (optional: Vercel Analytics)

### Rollback Strategy

If production deployment has issues:

1. **Instant Rollback (Vercel Dashboard):**
   - Go to Deployments
   - Find previous working deployment
   - Click "..." → "Promote to Production"

2. **Git Revert:**
   ```bash
   git revert HEAD
   git push origin main
   # Vercel deploys reverted version
   ```

---

## BSV On-Chain Deployment

### When to Deploy On-Chain

Deploy to BSV blockchain when:
- App is **stable** and **tested** (Vercel production proven)
- You want **permanent**, **censorship-resistant** storage
- You want **decentralized** hosting (no Vercel dependency)
- App is ready for **final release** to users

**NOT for:**
- Active development (use Vercel previews)
- Frequent updates (every BSV deploy costs money)
- Testing (use Vercel production)

### Prerequisites

1. **BSV Wallet with Funds:**
   - Install Yours Wallet: https://yours.org/wallet
   - Fund with ~$0.01 USD in BSV (enough for many deployments)
   - Testnet: https://faucet.bitcoinscaling.io/

2. **react-onchain CLI:**
   ```bash
   npm install -g react-onchain
   # Or use npx: npx react-onchain deploy
   ```

3. **Built Production Bundle:**
   ```bash
   npm run build
   # Creates dist/ folder
   ```

### Deployment Steps

#### Step 1: Build for Production

```bash
# Clean previous builds
rm -rf dist/

# Build with production optimizations
npm run build

# Verify build size
du -sh dist/
# Should be < 200KB for fast loading
```

#### Step 2: Test Build Locally

```bash
npm run preview
# Opens http://localhost:4173
# Test thoroughly before on-chain deployment
```

#### Step 3: Deploy to BSV

```bash
npx react-onchain deploy
```

**Interactive prompts:**
```
? Select network: mainnet (or testnet for testing)
? Enter your private key (WIF format): L1...
? Confirm deployment? (y/N) y

Uploading files...
Creating inscription transaction...
Broadcasting to BSV network...

✅ Deployment successful!

Inscription ID: 1234567890abcdef...
View at: https://1satordinals.com/inscription/1234567890abcdef...
```

#### Step 4: Verify Deployment

1. **Visit inscription URL:**
   ```
   https://1satordinals.com/inscription/<txid>
   ```

2. **Check functionality:**
   - All features work
   - Assets load correctly
   - Canvas/Konva renders
   - Wallet connections work

3. **Share with users:**
   - Permanent URL (never changes)
   - No hosting costs
   - Censorship-resistant

### BSV Deployment Configuration

Create `react-onchain.config.json` (optional):

```json
{
  "network": "mainnet",
  "contentType": "text/html;charset=utf-8",
  "metaData": {
    "app": "My BSV Game",
    "version": "1.0.0",
    "author": "Your Name"
  },
  "paymentStrategy": "optimize"
}
```

### Update Strategy

Since BSV deployments are **permanent**, updates require **new deployments**:

```
Version 1: https://1satordinals.com/inscription/<txid1>
Version 2: https://1satordinals.com/inscription/<txid2>
Version 3: https://1satordinals.com/inscription/<txid3>
```

**Best practice:**
- Keep Vercel production URL as "latest" (always updated)
- BSV on-chain as "stable releases" (v1.0.0, v2.0.0, etc.)
- Document version history in README

### Cost Optimization

**Minimize bundle size:**

1. **Remove console.logs:**
   ```typescript
   // vite.config.ts
   terserOptions: {
     compress: {
       drop_console: true,
       drop_debugger: true,
     },
   }
   ```

2. **Tree shake unused code:**
   ```bash
   # Analyze bundle
   npm run build -- --mode production

   # Check what's included
   npx vite-bundle-visualizer
   ```

3. **Lazy load routes:**
   ```typescript
   // Lazy load heavy components
   const GameCanvas = lazy(() => import('@components/GameCanvas'));
   ```

4. **Optimize assets:**
   ```bash
   # Compress images before deployment
   npm install -D vite-plugin-image-optimizer
   ```

**Bundle size targets:**
- Small app: < 50KB → ~$0.00002 deployment
- Medium app: < 100KB → ~$0.00004 deployment
- Large app: < 200KB → ~$0.00008 deployment

---

## Cost Analysis

### Complete Cost Breakdown

#### Local Development
```
Cost: $0
Tools: Vite dev server, Prefresh HMR
```

#### Vercel Preview + Production
```
Free Tier (Hobby):
- Unlimited deployments
- Unlimited bandwidth (100GB/month fair use)
- Unlimited preview URLs
- Automatic HTTPS
- Global CDN

Cost: $0/month
```

#### BSV On-Chain Deployment
```
Network fees only (no hosting costs):

Testnet:
- Free BSV from faucet
- Cost: $0

Mainnet:
- ~0.5 sats/byte inscription fee
- 50KB app = 25,000 bytes = 12,500 sats = ~$0.00005
- 100KB app = 50,000 bytes = 25,000 sats = ~$0.0001

Average cost per deployment: $0.00002 - $0.0001
```

#### Total Annual Cost (Estimated)
```
Vercel (production hosting):     $0/year
BSV deployments (10 versions):   $0.001/year
Domain (optional):               $12/year

Total: $12.001/year (domain only)
OR $0.001/year (using Vercel's free domain)
```

### Cost Comparison

| Platform | Monthly Cost | Annual Cost | Notes |
|----------|--------------|-------------|-------|
| **Vercel (Hobby)** | $0 | $0 | Unlimited for personal projects |
| Vercel Pro | $20 | $240 | Team features, analytics |
| Netlify Free | $0 | $0 | 100GB bandwidth |
| Cloudflare Pages | $0 | $0 | Unlimited bandwidth |
| AWS S3 + CloudFront | ~$1-5 | ~$12-60 | Pay per usage |
| **BSV On-Chain** | ~$0.001 | ~$0.01 | One-time per deployment |

**Winner:** Vercel (free) + BSV ($0.01/year) = **$0.01/year total hosting**

---

## Troubleshooting

### Vercel Build Failures

#### Problem: "Build failed: Cannot find module 'preact'"

**Solution:**
```bash
# Check package.json has preact
npm install preact

# Clear Vercel cache
vercel --force
```

#### Problem: "Build timeout (15 minutes exceeded)"

**Solution:**
```typescript
// vite.config.ts - optimize dependencies
optimizeDeps: {
  include: ['preact', 'preact/hooks', 'konva'],
}

// Use Bun for faster installs
// Vercel dashboard → Project Settings → Build Command
bun install && bun run build
```

#### Problem: "404 on refresh (SPA routing)"

**Solution:**
Add `vercel.json`:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Preview Deployment Issues

#### Problem: "Preview URL shows old version"

**Solution:**
```bash
# Force new deployment
git commit --allow-empty -m "Trigger rebuild"
git push
```

#### Problem: "Environment variables not working in preview"

**Solution:**
1. Go to Vercel dashboard → Environment Variables
2. Ensure variables are enabled for "Preview" environment
3. Redeploy preview

### BSV Deployment Issues

#### Problem: "Insufficient funds"

**Solution:**
```bash
# Check wallet balance
# Need ~$0.01 USD in BSV

# Fund wallet from exchange or faucet
# Testnet: https://faucet.bitcoinscaling.io/
```

#### Problem: "Transaction broadcast failed"

**Solution:**
```bash
# Try different API endpoint
# Edit react-onchain config to use different BSV API

# Or wait and retry (network congestion)
```

#### Problem: "Inscription not loading"

**Solution:**
1. Wait 10-20 seconds (blockchain confirmation)
2. Check transaction on https://whatsonchain.com
3. Verify all assets are in `dist/` folder
4. Check for CORS issues (assets must be relative paths)

### Performance Issues

#### Problem: "Large bundle size (> 500KB)"

**Solution:**
```bash
# Analyze bundle
npx vite-bundle-visualizer

# Common fixes:
# 1. Remove unused dependencies
# 2. Lazy load routes
# 3. Optimize images
# 4. Enable tree shaking
```

#### Problem: "Slow initial load"

**Solution:**
```typescript
// Code splitting
const routes = [
  {
    path: '/game',
    component: lazy(() => import('@features/game')),
  },
];

// Preload critical assets
<link rel="preload" href="/assets/logo.png" as="image" />
```

---

## Best Practices

### Development Workflow

1. **Always develop locally first**
   ```bash
   npm run dev
   # Test everything locally before pushing
   ```

2. **Use feature branches**
   ```bash
   git checkout -b feature/new-feature
   # Get preview URL for testing
   ```

3. **Test preview thoroughly**
   - Check preview URL before merging
   - Test on multiple devices
   - Verify functionality

4. **Merge to production only when stable**
   ```bash
   # Production = stable code only
   git checkout main
   git merge feature/new-feature
   ```

5. **Deploy to BSV only for releases**
   ```bash
   # BSV = major releases only
   npm run build
   npx react-onchain deploy
   ```

### Versioning Strategy

**Recommended approach:**

```
Vercel Production: https://your-app.vercel.app
- Always latest code
- Frequent updates
- Easy rollbacks

BSV On-Chain Stable Releases:
- v1.0.0: https://1satordinals.com/inscription/<txid1>
- v2.0.0: https://1satordinals.com/inscription/<txid2>
- v3.0.0: https://1satordinals.com/inscription/<txid3>
```

**Document in README:**
```markdown
## Live Versions

**Latest (Vercel):** https://your-app.vercel.app

**Stable Releases (BSV On-Chain):**
- v1.0.0 (2025-01-15): https://1satordinals.com/inscription/abc123...
- v2.0.0 (2025-03-01): https://1satordinals.com/inscription/def456...
```

### Security Best Practices

1. **Never commit private keys**
   ```bash
   # Add to .gitignore
   .env
   .env.local
   *.wif
   wallet.json
   ```

2. **Use environment variables for secrets**
   ```typescript
   // ❌ Bad
   const apiKey = 'abc123';

   // ✅ Good
   const apiKey = import.meta.env.VITE_API_KEY;
   ```

3. **Validate user input**
   ```typescript
   // Sanitize BSV addresses
   import { Address } from '@bsv/sdk';

   function isValidAddress(addr: string): boolean {
     try {
       Address.fromString(addr);
       return true;
     } catch {
       return false;
     }
   }
   ```

4. **Use HTTPS only (Vercel does this automatically)**

---

## Resources

### Vercel Documentation
- Official Docs: https://vercel.com/docs
- Vite on Vercel: https://vercel.com/docs/frameworks/vite
- Environment Variables: https://vercel.com/docs/concepts/projects/environment-variables
- Custom Domains: https://vercel.com/docs/concepts/projects/domains

### BSV On-Chain Deployment
- react-onchain: https://www.npmjs.com/package/react-onchain
- 1Sat Ordinals: https://docs.1satordinals.com/
- BSV SDK: https://docs.bsvblockchain.org/
- WhatsonChain: https://whatsonchain.com/

### Performance Optimization
- Vite Optimization: https://vitejs.dev/guide/build.html
- Bundle Analysis: https://github.com/btd/rollup-plugin-visualizer
- Lighthouse: https://developers.google.com/web/tools/lighthouse

### Community
- Vercel Discord: https://vercel.com/discord
- BSV Devs Slack: https://bitcoinsv.io/slack

---

## Summary

### Quick Reference

**Local Development:**
```bash
npm run dev
```

**Preview Deployment:**
```bash
git checkout -b feature/my-feature
git push origin feature/my-feature
gh pr create
# Vercel deploys automatically
```

**Production Deployment:**
```bash
git checkout main
git push origin main
# Vercel deploys automatically
```

**BSV On-Chain Deployment:**
```bash
npm run build
npx react-onchain deploy
```

### Key Takeaways

✅ **Vercel = Fast iteration** (free, automatic, global CDN)
✅ **BSV = Permanent storage** (pennies, censorship-resistant)
✅ **Use both** (Vercel for development, BSV for releases)
✅ **Total cost: ~$0.01/year** (BSV deployments only)
✅ **Zero hosting costs** (Vercel free tier)

---

**Questions?** Check `/home/thoma/.claude/THOMAS-QUICK-START.md` or open an issue on GitHub.
