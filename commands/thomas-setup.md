# Thomas Setup Command (Optimized)

Initialize a new project with the master CLAUDE.md architecture document for Thomas's tech stack, following official Preact + Vite best practices.

## Purpose

This command sets up a new project directory with:
1. Master CLAUDE.md file documenting the full architecture
2. Project structure for **Vite + Preact + TailwindCSS + DaisyUI + Nanostores + Konva + react-onchain**
3. Official **@preact/preset-vite** configuration with all optimizations
4. Ready-to-use configuration that leverages installed skills, hooks, agents, and commands

## Instructions for Claude

When the user runs `/thomas-setup [project-name]`, follow these steps:

### Step 0: Detect Project Type (New vs Existing)

First, determine if this is a new project or an existing one:

```bash
# Check if the project directory exists
if [ -d "[project-path]" ]; then
  echo "Existing project detected"
  # Check for package.json to confirm it's an active project
  if [ -f "[project-path]/package.json" ]; then
    echo "Active project found - will migrate/update"
  fi
else
  echo "New project - will create from scratch"
fi
```

**If existing project found:**
- Ask user: "Found existing project at [path]. Choose action:"
  - **1. Migrate:** Keep existing code, add Claude infrastructure
  - **2. Clean & Reset:** Backup old project, start fresh with Thomas setup
  - **3. Cancel:** Don't make changes

### Step 1: Verify Project Location

**For NEW projects:**
- Ask the user where they want to create the project:
  - Default: `/mnt/c/App-Ideas-Workspace/[project-name]`
  - Or let them specify a custom path

**For EXISTING projects:**
- User provides the existing project path
- Or use current directory if already in project

### Step 2: Backup (If Existing Project)

**Only for existing projects - ALWAYS create backup first:**

```bash
# Create timestamped backup
BACKUP_PATH="[project-path].backup-$(date +%Y%m%d-%H%M%S)"
cp -r [project-path] "$BACKUP_PATH"
echo "✅ Backup created at: $BACKUP_PATH"
```

### Step 3: Clean Up (If "Clean & Reset" chosen)

**Only if user chose "Clean & Reset" option:**

```bash
# Keep these important files/directories
KEEP_FILES=(".git" ".env" ".env.local" ".env.production" "node_modules" "dist" "build")

# Create temporary directory for files to keep
mkdir -p [project-path]/.thomas-setup-temp

# Move important files to temp location
for file in "${KEEP_FILES[@]}"; do
  if [ -e "[project-path]/$file" ]; then
    mv "[project-path]/$file" "[project-path]/.thomas-setup-temp/"
  fi
done

# Remove all other files (we have backup!)
find [project-path] -mindepth 1 -maxdepth 1 ! -name '.thomas-setup-temp' -exec rm -rf {} +

# Restore kept files
mv [project-path]/.thomas-setup-temp/* [project-path]/
rmdir [project-path]/.thomas-setup-temp

echo "✅ Project cleaned - kept: .git, .env*, node_modules"
```

### Step 4: Create/Update Project Directory Structure

```bash
mkdir -p [project-path]/{src/{components/{canvas,layout,onchain,common},features,hooks,utils,styles,config,types},public,docs,dev/active,.claude/memory-bank}
cd [project-path]
```

This creates the official Preact project structure:
- `src/` - Source code
  - `components/` - Reusable UI components organized by domain
  - `features/` - Feature-based modules
  - `hooks/` - Custom hooks
  - `utils/` - Utility functions
  - `styles/` - Global styles and Mantine theme
  - `config/` - Configuration files
  - `types/` - TypeScript type definitions
- `public/` - Static assets (Vite serves from root)
- `docs/` - Project documentation
- `dev/active/` - Task documentation directory (for /dev-docs command)
- `.claude/` - Claude Code configuration
- `.claude/memory-bank/` - Context persistence (auto-managed)

### Step 5: Initialize Project with Official Preact Templates (If New Project)

**For NEW projects only**, offer initialization options:

```bash
# Option 1: Use official create-preact (RECOMMENDED)
# This is the official Preact scaffolding tool
npm create preact@latest [project-name] -- --template default

# Option 2: Use Vite's Preact TypeScript template
npm create vite@latest [project-name] -- --template preact-ts

# Option 3: Manual installation (for more control)
npm init -y
npm install preact
npm install -D vite @preact/preset-vite typescript @types/node
```

**Then install additional dependencies:**

```bash
# UI Framework (TailwindCSS + DaisyUI)
npm install -D tailwindcss@latest postcss autoprefixer daisyui@latest
npx tailwindcss init -p

# State Management (Nanostores)
npm install nanostores @nanostores/preact @nanostores/persistent @nanostores/router

# Canvas Graphics (Konva)
npm install konva react-konva
npm install -D @types/konva

# Blockchain Integration (BSV)
npm install @bsv/sdk
# react-onchain is a global CLI tool: npx react-onchain deploy

# Development tools (if not already present)
npm install -D eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser
```

**Recommended approach:** Use official `create-preact` and then add TailwindCSS, DaisyUI, Nanostores, Konva, and BSV SDK.

### Step 6: Create Optimized Vite Configuration

Create `vite.config.ts` with official **@preact/preset-vite** configuration:

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

export default defineConfig({
  plugins: [
    preact({
      // ===== Hot Module Replacement (Prefresh) =====
      // Enables lightning-fast HMR for instant feedback
      prefreshEnabled: true,

      // ===== Preact DevTools Integration =====
      // Automatically enabled in development for debugging
      devToolsEnabled: true,
      devtoolsInProd: false,  // NEVER include in production

      // ===== React Compatibility Layer =====
      // Automatically aliases React imports to preact/compat
      // Required for Mantine and react-konva
      reactAliasesEnabled: true,

      // ===== Optional: Custom Babel Configuration =====
      // Uncomment if you need additional Babel plugins
      // babel: {
      //   plugins: [],
      //   presets: [],
      // },
    })
  ],

  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@hooks': '/src/hooks',
      '@utils': '/src/utils',
      '@styles': '/src/styles',
      '@config': '/src/config',
      '@types': '/src/types',
      '@features': '/src/features',
      // React compatibility aliases are handled by @preact/preset-vite
      // No need to manually add 'react': 'preact/compat'
    },
  },

  // Optimize dependency pre-bundling
  optimizeDeps: {
    include: [
      'preact',
      'preact/compat',
      'preact/hooks',
      'nanostores',
      '@nanostores/preact',
      'konva',
      'react-konva',
    ],
    // Exclude packages that shouldn't be pre-bundled
    exclude: [],
  },

  // Build optimizations
  build: {
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,  // Remove console.logs in production
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor code for better caching
          'preact-vendor': ['preact', 'preact/hooks'],
          'nanostores-vendor': ['nanostores', '@nanostores/preact'],
          'konva-vendor': ['konva', 'react-konva'],
        },
      },
    },
    // Source maps for debugging production issues
    sourcemap: true,
  },

  // Development server configuration
  server: {
    port: 3000,
    open: true,
    hmr: {
      overlay: true,  // Show errors as overlay
    },
  },

  // Preview server configuration
  preview: {
    port: 4173,
  },
});
```

**Key features from @preact/preset-vite:**
- **Prefresh HMR**: Lightning-fast hot module replacement without full page reloads
- **DevTools Bridge**: Automatic Preact DevTools integration in development
- **React Compatibility**: Automatic aliasing of React imports to preact/compat (essential for Mantine and react-konva)
- **Optimized Transforms**: Babel configuration for JSX/TSX transformation
- **Production-Ready**: Optimized builds with code splitting and tree shaking

### Step 7: Create TypeScript Configuration

Create `tsconfig.json` optimized for Preact:

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "jsxImportSource": "preact",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,

    /* Path aliases */
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@hooks/*": ["src/hooks/*"],
      "@utils/*": ["src/utils/*"],
      "@styles/*": ["src/styles/*"],
      "@config/*": ["src/config/*"],
      "@types/*": ["src/types/*"],
      "@features/*": ["src/features/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

Create `tsconfig.node.json` for Node.js tooling:

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

### Step 8: Create Master CLAUDE.md

**For NEW projects or "Clean & Reset":**
- Create fresh `CLAUDE.md` with the optimized template below

**For "Migrate" mode (existing project):**
- Check if CLAUDE.md already exists
- If exists: Create `CLAUDE.md.backup` and update existing file
- If not exists: Create new one
- Analyze existing project to customize sections (detect actual tech stack)

Create `CLAUDE.md` in the project root with this comprehensive architecture documentation:

```markdown
# [Project Name] - Master Architecture Document

**Tech Stack:** Vite + Preact + TailwindCSS + DaisyUI + Nanostores + Konva + react-onchain (BSV)
**Build Tool:** Vite with @preact/preset-vite

Last Updated: [Current Date]

---

## Quick Commands

\`\`\`bash
# Development
npm run dev              # Start dev server (Vite + Prefresh HMR)
npm run build            # Production build
npm run preview          # Preview production build
npm run lint             # Run ESLint
npm run type-check       # TypeScript type checking

# Testing
npm test                 # Run tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report

# PM2 Process Management (if using multiple services)
pm2 start ecosystem.config.js   # Start all services
pm2 logs                         # View consolidated logs
pm2 restart all                  # Restart all services
pm2 stop all                     # Stop all services
pm2 monit                        # Resource monitoring
\`\`\`

---

## Tech Stack Overview

### Core Framework

#### Vite (v5.x) - Next Generation Build Tool
- **Lightning-fast HMR**: Instant feedback with Hot Module Replacement
- **Native ES modules**: No bundling during development
- **Optimized builds**: Rollup-based production bundling
- **Plugin ecosystem**: Rich ecosystem with first-class Preact support
- **Official preset**: `@preact/preset-vite` provides optimal configuration
- Documentation: https://vitejs.dev/

#### Preact (v10.x) - Fast 3KB React Alternative
- **React-compatible API**: Drop-in replacement for React
- **Tiny bundle size**: Only 3KB gzipped vs 40KB+ for React
- **Faster performance**: Optimized virtual DOM implementation
- **React compatibility layer**: `preact/compat` enables use of React libraries
- **Prefresh HMR**: Fast Refresh for instant development feedback
- **Official support**: First-class Vite integration via @preact/preset-vite
- Documentation: https://preactjs.com/

**Why Preact over React:**
- 10x smaller bundle size (3KB vs 40KB)
- Faster runtime performance
- Same API - easy migration path
- Compatible with React libraries via preact/compat

### UI Framework

#### TailwindCSS (v3.x) + DaisyUI (v4.x) - Utility-First CSS + Components
- **TailwindCSS**: Utility-first CSS framework for rapid development
- **DaisyUI**: 60+ CSS-only components (2KB, no JavaScript)
- **93% smaller than Mantine**: 2KB vs 30KB
- **Zero preact/compat needed**: Pure CSS, works with any framework
- **13+ themes**: Built-in dark mode and theme switching
- **Accessibility-first**: WCAG 2.1 compliant semantic HTML
- **TypeScript**: Works seamlessly with TypeScript
- **Perfect for BSV**: 75% cheaper on-chain deployment costs
- Documentation:
  - TailwindCSS: https://tailwindcss.com/
  - DaisyUI: https://daisyui.com/

**DaisyUI Features:**
- Pure CSS components (buttons, cards, modals, forms, etc.)
- TailwindCSS utility classes for custom styling
- Theme switching with `data-theme` attribute
- Responsive design with Tailwind's breakpoints
- Customizable via Tailwind config
- No JavaScript overhead

### State Management

#### Nanostores (v0.10.x) - Atomic State Management
- **286 bytes core**: 10x smaller than Jotai (3KB), 100x smaller than Redux
- **Framework-agnostic**: Works with Preact, React, Vue, Svelte, vanilla JS
- **Native Preact support**: @nanostores/preact (no preact/compat needed)
- **Zero dependencies**: Completely standalone
- **Atomic stores**: Fine-grained reactivity like Jotai/Recoil
- **Async computed**: Perfect for blockchain queries
- **Persistent stores**: localStorage integration for wallet data
- **Router stores**: URL state management
- **Query stores**: Remote data fetching with caching
- Documentation: https://github.com/nanostores/nanostores

**Nanostores Modules:**
- `nanostores` - Core (286 bytes)
- `@nanostores/preact` - Preact integration
- `@nanostores/persistent` - localStorage persistence
- `@nanostores/router` - URL-based routing
- `@nanostores/query` - Remote data fetching (optional)

**Why Nanostores over Jotai/Zustand:**
- 10x smaller (286 bytes vs 3KB)
- Framework-agnostic (not React-specific)
- Native Preact support (no compat layer)
- Built-in persistence and routing
- Perfect for BSV blockchain state

### Canvas & Graphics

#### Konva (v9.x) - Canvas Library for Interactive Graphics
- **Declarative API**: React-style canvas manipulation
- **Event handling**: Full event system for canvas shapes
- **Transformations**: Drag & drop, rotation, scaling
- **Animations**: Tweening and complex animations
- **Filters**: Image filters and effects
- **High performance**: Optimized for complex scenes
- **react-konva integration**: React/Preact wrapper
- Documentation: https://konvajs.org/

**Konva Hierarchy:**
```
Stage (Canvas container)
└── Layer (Drawing layer)
    ├── Group (Shape groups)
    │   ├── Circle
    │   ├── Rect
    │   └── Text
    └── Image
```

### Blockchain Integration

#### react-onchain - BSV On-Chain Deployment Tool
- **Deploy entire apps to BSV blockchain**: Uses 1Sat Ordinals protocol
- **Cost-effective**: Most apps < 1 cent to deploy on-chain
- **Smart caching**: Reuses unchanged files (97% savings on updates)
- **Automatic versioning**: Track deployment history on-chain
- **Vite/Preact compatible**: Works seamlessly with your build
- Repository: https://github.com/danwag06/react-onchain
- Created by: Dan Wagner (Yours Wallet team)

**BSV SDK (@bsv/sdk):**
- **Official BSV TypeScript SDK**: Transaction building, wallet management
- **Type-safe**: Full TypeScript support
- **Complete**: Keys, addresses, UTXOs, scripts, transactions
- Documentation: https://docs.bsvblockchain.org/

---

## Deployment Strategy

### Recommended Workflow

\`\`\`
┌─────────────┐    ┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Local Dev  │ → │ Vercel Preview  │ → │ Vercel Production│ → │ BSV On-Chain    │
│  (npm run   │    │ (PR deployment) │    │ (main branch)    │    │ (permanent)     │
│   dev)      │    │                 │    │                  │    │                 │
└─────────────┘    └─────────────────┘    └──────────────────┘    └─────────────────┘
     FREE               FREE                    FREE                  ~$0.00002
\`\`\`

### Platform Comparison

| Platform | Rating | Best For | Free Tier |
|----------|--------|----------|-----------|
| **Vercel** | 10/10 | Vite + Preact apps | Unlimited (hobby) |
| Cloudflare Pages | 9/10 | Global distribution | Unlimited builds |
| GitHub Pages | 7/10 | Static sites | 1 site per repo |
| **BSV On-Chain** | 10/10 | Permanent storage | Pay per deployment (~$0.00002) |

**Recommendation:** Use Vercel for development/testing → BSV for final permanent deployment

### Deployment Platforms

#### 1. Vercel (10/10) - Primary Platform for Testing

**Why Vercel:**
- **Zero configuration**: Auto-detects Vite projects
- **Automatic previews**: Every PR gets a unique URL
- **Free tier**: Unlimited hobby projects
- **Global CDN**: Fast loading worldwide
- **Environment variables**: Per-environment configuration
- **Custom domains**: Free SSL certificates
- **Perfect for Vite + Preact**: Optimized for this stack

**Setup:**
1. Connect GitHub repository to Vercel
2. Auto-deploys on push to main (production)
3. Auto-deploys every PR (preview URLs)
4. Configure environment variables in Vercel dashboard

**Quick Start:**
\`\`\`bash
# Install Vercel CLI (optional)
npm install -g vercel

# Deploy from command line
vercel

# Or connect repository at https://vercel.com/new
\`\`\`

**Configuration (vercel.json):**
\`\`\`json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
\`\`\`

#### 2. BSV On-Chain (10/10) - Final Permanent Deployment

**Why BSV On-Chain:**
- **Permanent storage**: Censorship-resistant, immutable
- **Cost-effective**: ~$0.00002 per deployment (pennies)
- **Decentralized**: No hosting provider needed
- **Version history**: Every deployment tracked on-chain
- **Perfect for final releases**: Stable versions only

**When to Deploy to BSV:**
- App is stable and tested (use Vercel first!)
- Ready for final release to users
- Want permanent, censorship-resistant hosting
- NOT for active development (use Vercel previews)

**Deployment:**
\`\`\`bash
# Build production bundle
npm run build

# Deploy to BSV blockchain
npx react-onchain deploy

# Cost: ~$0.00002 (20 sats for typical app)
\`\`\`

**Update Strategy:**
- Vercel Production: Always latest code (free updates)
- BSV On-Chain: Stable releases only (v1.0.0, v2.0.0, etc.)
- Each BSV deployment is permanent (new version = new deployment)

#### 3. Alternative Platforms (Optional)

**Cloudflare Pages (9/10):**
- Unlimited bandwidth (better than Vercel for high traffic)
- 275+ PoPs globally
- Workers support for edge functions
- Good for apps with heavy traffic

**GitHub Pages (7/10):**
- Free, built into GitHub
- Works for static sites
- No preview URLs (manual workflow)
- Limited compared to Vercel

### Deployment Workflow

**Development Cycle:**
\`\`\`bash
# 1. Local development
npm run dev

# 2. Create feature branch
git checkout -b feature/new-feature

# 3. Push and create PR
git push origin feature/new-feature
gh pr create

# 4. Vercel auto-deploys preview
# Preview URL: https://your-app-git-feature-user.vercel.app

# 5. Test preview, merge when ready
gh pr merge

# 6. Vercel auto-deploys to production
# Production URL: https://your-app.vercel.app

# 7. When ready for permanent on-chain deployment
npm run build
npx react-onchain deploy
# On-chain URL: https://1satordinals.com/inscription/<txid>
\`\`\`

### Environment Variables

**Vercel Environment Variables:**
\`\`\`bash
# Set in Vercel dashboard → Project Settings → Environment Variables

# Production
VITE_BSV_NETWORK=mainnet
VITE_API_URL=https://api.whatsonchain.com/v1/bsv/main

# Preview/Development
VITE_BSV_NETWORK=testnet
VITE_ENABLE_DEVTOOLS=true
\`\`\`

**Access in code:**
\`\`\`typescript
// src/config/env.ts
export const config = {
  bsvNetwork: import.meta.env.VITE_BSV_NETWORK || 'mainnet',
  apiUrl: import.meta.env.VITE_API_URL,
  enableDevTools: import.meta.env.VITE_ENABLE_DEVTOOLS === 'true',
};
\`\`\`

### Cost Analysis

**Complete deployment costs:**
\`\`\`
Vercel (development + production):  $0/year
BSV deployments (10 versions):      $0.001/year
Custom domain (optional):           $12/year

Total: $12.001/year (with domain)
OR $0.001/year (using Vercel's free domain)
\`\`\`

**Bundle size impact on BSV costs:**
\`\`\`
50KB app:  ~$0.00002 deployment
100KB app: ~$0.00004 deployment
200KB app: ~$0.00008 deployment
\`\`\`

**Our optimized stack (DaisyUI + Nanostores):**
- 85% smaller bundles (vs Mantine + Jotai)
- 75% cheaper BSV deployments
- Faster loading globally

### Versioning Strategy

**Recommended approach:**
\`\`\`
Vercel Production: https://your-app.vercel.app
- Always latest code
- Frequent updates
- Easy rollbacks

BSV On-Chain Stable Releases:
- v1.0.0: https://1satordinals.com/inscription/<txid1>
- v2.0.0: https://1satordinals.com/inscription/<txid2>
- v3.0.0: https://1satordinals.com/inscription/<txid3>
\`\`\`

**Document in README.md:**
\`\`\`markdown
## Live Versions

**Latest (Vercel):** https://your-app.vercel.app

**Stable Releases (BSV On-Chain):**
- v1.0.0 (2025-01-15): https://1satordinals.com/inscription/abc123...
- v2.0.0 (2025-03-01): https://1satordinals.com/inscription/def456...
\`\`\`

### Deployment Checklist

**Before deploying to Vercel Production:**
- [ ] All tests passing
- [ ] No TypeScript errors: \`npm run build\`
- [ ] Lighthouse score > 90
- [ ] Bundle size < 200KB
- [ ] Environment variables configured

**Before deploying to BSV On-Chain:**
- [ ] App stable in Vercel production (tested for 1+ week)
- [ ] Ready for permanent release
- [ ] Bundle optimized (< 200KB preferred)
- [ ] BSV wallet funded (~$0.01 USD)
- [ ] Test locally: \`npm run preview\`

### Resources

**Vercel:**
- Documentation: https://vercel.com/docs
- Vite on Vercel: https://vercel.com/docs/frameworks/vite
- Environment Variables: https://vercel.com/docs/concepts/projects/environment-variables

**BSV On-Chain:**
- react-onchain: https://www.npmjs.com/package/react-onchain
- 1Sat Ordinals: https://docs.1satordinals.com/
- BSV SDK: https://docs.bsvblockchain.org/

**Complete Deployment Guide:**
See \`~/.claude/DEPLOYMENT-GUIDE.md\` for comprehensive deployment instructions.

---

## Project Structure

\`\`\`
[project-name]/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── canvas/       # Konva-based canvas components
│   │   │   ├── Canvas.tsx
│   │   │   ├── Shape.tsx
│   │   │   └── index.ts
│   │   ├── layout/       # Layout components (Mantine)
│   │   │   ├── AppShell.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── index.ts
│   │   ├── onchain/      # Web3/blockchain components
│   │   │   ├── WalletButton.tsx
│   │   │   ├── NetworkIndicator.tsx
│   │   │   └── index.ts
│   │   └── common/       # Shared components
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       └── index.ts
│   ├── features/          # Feature-based modules
│   │   └── [feature-name]/
│   │       ├── components/
│   │       ├── hooks/
│   │       ├── utils/
│   │       ├── types.ts
│   │       └── index.ts
│   ├── hooks/             # Custom React/Preact hooks
│   │   ├── useWallet.ts  # Blockchain wallet hooks
│   │   ├── useCanvas.ts  # Canvas-related hooks
│   │   ├── useTheme.ts   # Theme management
│   │   └── index.ts
│   ├── utils/             # Utility functions
│   │   ├── format.ts
│   │   ├── validation.ts
│   │   └── index.ts
│   ├── styles/            # Global styles (Mantine theme)
│   │   ├── theme.ts      # Mantine theme configuration
│   │   ├── global.css
│   │   └── index.ts
│   ├── config/            # Configuration files
│   │   ├── constants.ts
│   │   ├── env.ts
│   │   └── index.ts
│   ├── types/             # TypeScript type definitions
│   │   ├── api.ts
│   │   ├── models.ts
│   │   └── index.ts
│   ├── App.tsx            # Root component
│   ├── main.tsx           # Entry point
│   └── vite-env.d.ts      # Vite type declarations
├── public/                # Static assets (favicon.ico, robots.txt, etc.)
├── dev/                   # Development documentation
│   ├── README.md
│   └── active/           # Active task documentation (created by /dev-docs)
│       └── [task-name]/  # Per-task directories
│           ├── [task]-plan.md     # Strategic plan
│           ├── [task]-context.md  # Key files and decisions
│           └── [task]-tasks.md    # Checklist of work
├── docs/                  # Project documentation
├── .claude/               # Claude Code configuration
│   ├── skills/           # Symlink to ~/.claude/skills
│   ├── agents/           # Symlink to ~/.claude/agents
│   ├── hooks/            # Symlink to ~/.claude/hooks
│   ├── commands/         # Symlink to ~/.claude/commands
│   └── memory-bank/      # Automatic context persistence (managed by Claude Code)
│       └── *.json        # Conversation history, file edits, decision logs
├── CLAUDE.md              # This file - Master architecture document
├── package.json
├── package-lock.json
├── vite.config.ts         # Vite configuration with @preact/preset-vite
├── tsconfig.json          # TypeScript configuration
├── tsconfig.node.json     # Node.js tooling TypeScript config
├── .eslintrc.json         # ESLint configuration
├── .gitignore
├── ecosystem.config.js    # PM2 config (if multi-service)
└── README.md
\`\`\`

---

## Architecture Principles

### 1. Component Organization
- **Features-first structure**: Group by feature/domain, not by file type
- **Colocation**: Keep related code together (components, hooks, utils in same feature folder)
- **Barrel exports**: Use `index.ts` files for clean imports
- **Single responsibility**: Each component has one clear purpose

**Example feature structure:**
\`\`\`
features/game/
├── components/
│   ├── GameBoard.tsx
│   ├── ScoreDisplay.tsx
│   └── index.ts
├── hooks/
│   ├── useGameState.ts
│   └── index.ts
├── utils/
│   ├── gameLogic.ts
│   └── index.ts
├── types.ts
└── index.ts  # Exports all public APIs
\`\`\`

### 2. State Management

**Hierarchy of state management solutions:**

1. **Local state (useState, useReducer)** - First choice for component-local state
2. **Context API** - For sharing state across component tree (theme, auth, etc.)
3. **External library** - For complex global state (Zustand, Jotai, Redux)

**Built-in state management:**
- **Nanostores** - Atomic state (286 bytes) for all application state
- **@nanostores/persistent** - localStorage for wallet/preferences
- **@nanostores/router** - URL state for navigation
- **Context API** - Only for deeply nested prop drilling (rarely needed)

**Why Nanostores is recommended:**
- Tiny footprint (286 bytes vs 3KB+ for alternatives)
- Framework-agnostic (works everywhere)
- Built-in persistence and routing
- Perfect for BSV blockchain state (wallets, transactions, UTXOs)

### 3. Styling Strategy

**Primary approach: TailwindCSS utilities + DaisyUI components**

\`\`\`tsx
// tailwind.config.js
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  plugins: [require('daisyui')],
  daisyui: {
    themes: ['dark', 'light', 'cyberpunk'], // Choose themes
    darkTheme: 'dark',
  },
};
\`\`\`

\`\`\`tsx
// Theme switching
export function App() {
  return (
    <div data-theme="dark" className="min-h-screen">
      {/* App content with TailwindCSS utilities and DaisyUI components */}
      <button className="btn btn-primary">Click me</button>
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Card Title</h2>
          <p>Card content</p>
        </div>
      </div>
    </div>
  );
}
\`\`\`

**Styling options (in order of preference):**

1. **DaisyUI components** - Use pure CSS components (btn, card, modal, etc.)
2. **TailwindCSS utilities** - Utility classes for custom styling (flex, grid, p-4, etc.)
3. **Tailwind config** - Customize theme via tailwind.config.js
4. **CSS Modules** - For truly unique component styles (rare with Tailwind)

**Advantages:**
- No JavaScript overhead (pure CSS)
- 93% smaller than Mantine (2KB vs 30KB)
- No preact/compat needed
- Faster builds and smaller bundles

### 4. Canvas Layer (Konva)

**Best practices:**

- **Use react-konva**: React/Preact wrapper for Konva
- **Follow Konva hierarchy**: Stage → Layer → Group → Shapes
- **Performance optimization**:
  - Use `listening={false}` for non-interactive shapes
  - Use `perfectDrawEnabled={false}` for complex scenes (trades precision for performance)
  - Group static shapes and cache them
  - Limit the number of objects for complex scenes
- **Event handling**: onClick, onDragStart, onDragEnd, onTransform, etc.
- **Separate layers**: Use multiple layers for different z-index levels

**Example:**
\`\`\`tsx
import { Stage, Layer, Circle, Rect } from 'react-konva';

function Canvas() {
  return (
    <Stage width={800} height={600}>
      {/* Background layer (static) */}
      <Layer listening={false}>
        <Rect width={800} height={600} fill="#f0f0f0" />
      </Layer>

      {/* Interactive layer */}
      <Layer>
        <Circle
          x={100}
          y={100}
          radius={50}
          fill="blue"
          draggable
          onDragEnd={(e) => console.log('Dragged to:', e.target.position())}
        />
      </Layer>
    </Stage>
  );
}
\`\`\`

### 5. Blockchain Integration

**Best practices:**

- **Wallet connection**: Use react-onchain hooks or custom hooks
- **Contract interactions**: Abstract into custom hooks for reusability
- **Error handling**: Always handle transaction failures and user rejections
- **Loading states**: Show pending transactions clearly with spinners/indicators
- **Network awareness**: Display current network, handle network switching
- **Gas estimation**: Provide gas estimates before transactions
- **Transaction receipts**: Wait for confirmations and show status

**Security considerations:**
- Never store private keys in code
- Validate all user inputs before sending to contracts
- Use proper error boundaries for Web3 errors
- Handle network errors gracefully (switch network, reconnect, etc.)

---

## Development Guidelines

### Preact + TailwindCSS + DaisyUI + Nanostores Integration

\`\`\`tsx
// main.tsx - Entry point
import { render } from 'preact';
import App from './App';
import './styles/global.css';  // Tailwind imports

render(
  <App />,
  document.getElementById('app')!
);
\`\`\`

\`\`\`css
/* src/styles/global.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
\`\`\`

\`\`\`tsx
// App.tsx - Root component with DaisyUI
import { useStore } from '@nanostores/preact';
import { $theme } from './stores/theme';

export default function App() {
  const theme = useStore($theme);

  return (
    <div data-theme={theme} className="min-h-screen bg-base-100">
      {/* Navbar with DaisyUI */}
      <div className="navbar bg-base-300">
        <div className="flex-1">
          <a className="btn btn-ghost text-xl">My App</a>
        </div>
        <div className="flex-none">
          <button className="btn btn-square btn-ghost">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto p-4">
        {/* Your content */}
      </div>
    </div>
  );
}
\`\`\`

\`\`\`tsx
// stores/theme.ts - Nanostores theme management
import { persistentAtom } from '@nanostores/persistent';

export const $theme = persistentAtom<'light' | 'dark'>(
  'app_theme',
  'dark'
);

export function toggleTheme() {
  $theme.set($theme.get() === 'dark' ? 'light' : 'dark');
}
\`\`\`

### Konva Canvas Example

\`\`\`tsx
// src/components/canvas/GameCanvas.tsx
import { Stage, Layer, Circle, Rect, Text } from 'react-konva';
import { useState } from 'preact/hooks';

interface Position {
  x: number;
  y: number;
}

export function GameCanvas() {
  const [position, setPosition] = useState<Position>({ x: 100, y: 100 });

  return (
    <Stage width={800} height={600}>
      <Layer>
        {/* Background */}
        <Rect width={800} height={600} fill="#1a1a1a" />

        {/* Draggable circle */}
        <Circle
          x={position.x}
          y={position.y}
          radius={50}
          fill="cyan"
          draggable
          onDragEnd={(e) => {
            setPosition(e.target.position());
          }}
        />

        {/* Score text */}
        <Text
          x={10}
          y={10}
          text={`Position: (${Math.round(position.x)}, ${Math.round(position.y)})`}
          fontSize={16}
          fill="white"
        />
      </Layer>
    </Stage>
  );
}
\`\`\`

### react-onchain Usage

\`\`\`tsx
// src/components/onchain/WalletButton.tsx
import { useWallet } from 'react-onchain';
import { Button } from '@mantine/core';

export function WalletButton() {
  const { address, connect, disconnect, isConnecting } = useWallet();

  const handleClick = async () => {
    try {
      if (address) {
        await disconnect();
      } else {
        await connect();
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
    }
  };

  return (
    <Button
      onClick={handleClick}
      loading={isConnecting}
    >
      {address
        ? `Connected: ${address.slice(0, 6)}...${address.slice(-4)}`
        : 'Connect Wallet'
      }
    </Button>
  );
}
\`\`\`

### Custom Hooks Example

\`\`\`tsx
// src/hooks/useCanvas.ts
import { useState, useCallback } from 'preact/hooks';

interface CanvasState {
  scale: number;
  position: { x: number; y: number };
}

export function useCanvas() {
  const [state, setState] = useState<CanvasState>({
    scale: 1,
    position: { x: 0, y: 0 },
  });

  const zoom = useCallback((delta: number) => {
    setState(prev => ({
      ...prev,
      scale: Math.max(0.1, Math.min(prev.scale + delta, 5)),
    }));
  }, []);

  const pan = useCallback((dx: number, dy: number) => {
    setState(prev => ({
      ...prev,
      position: {
        x: prev.position.x + dx,
        y: prev.position.y + dy,
      },
    }));
  }, []);

  const reset = useCallback(() => {
    setState({ scale: 1, position: { x: 0, y: 0 } });
  }, []);

  return { ...state, zoom, pan, reset };
}
\`\`\`

---

## Key Dependencies

\`\`\`json
{
  "dependencies": {
    "preact": "^10.19.0",
    "@mantine/core": "^7.5.0",
    "@mantine/hooks": "^7.5.0",
    "@emotion/react": "^11.11.0",
    "konva": "^9.3.0",
    "react-konva": "^18.2.0",
    "react-onchain": "latest"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "@preact/preset-vite": "^2.8.0",
    "typescript": "^5.3.0",
    "@types/node": "^20.10.0",
    "@typescript-eslint/eslint-plugin": "^6.15.0",
    "@typescript-eslint/parser": "^6.15.0",
    "eslint": "^8.56.0"
  }
}
\`\`\`

---

## Vite Configuration (Official @preact/preset-vite)

The project uses the official **@preact/preset-vite** plugin, which provides:

### Features Provided by @preact/preset-vite

| Feature | Description | Default |
|---------|-------------|---------|
| **Prefresh (HMR)** | Fast Refresh for instant component updates | ✅ Enabled |
| **DevTools Bridge** | Automatic Preact DevTools integration | ✅ Dev only |
| **React Aliases** | Auto-alias React → preact/compat | ✅ Enabled |
| **Optimized Babel** | JSX/TSX transformation with optimal settings | ✅ Enabled |

### Configuration Options

See `vite.config.ts` for full configuration. Key options:

\`\`\`typescript
preact({
  prefreshEnabled: true,      // Enable HMR
  devToolsEnabled: true,       // DevTools in development
  devtoolsInProd: false,       // NEVER in production
  reactAliasesEnabled: true,   // React compatibility
})
\`\`\`

### Why @preact/preset-vite?

- **Official support**: Maintained by Preact core team
- **Optimal configuration**: Pre-configured with best practices
- **Prefresh HMR**: Instant component updates without losing state
- **React compatibility**: Seamless use of React libraries (Mantine, react-konva)
- **DevTools integration**: Automatic Preact DevTools injection
- **Future-proof**: Updated alongside Preact releases

---

## Available Claude Code Infrastructure

This project has access to all installed skills, hooks, agents, and commands:

### Skills (Auto-activated via hooks)
- **skill-developer** - Create new skills
- **frontend-dev-guidelines** - React/Preact patterns (auto-activated)
- **backend-dev-guidelines** - If you add a backend
- **route-tester** - API testing
- **error-tracking** - Sentry integration

### Hooks (Active in ~/.claude/settings.json)
- **skill-activation-prompt** - Auto-suggests relevant skills based on context
- **post-tool-use-tracker** - Tracks file changes for memory bank
- **Optional**: error-handling-reminder, tsc-check, etc.

### Agents (Available via Task tool)
- **code-architecture-reviewer** - Review code structure and patterns
- **frontend-error-fixer** - Debug frontend issues
- **refactor-planner** - Plan refactoring work
- **documentation-architect** - Generate documentation
- And 6 more specialized agents

### Slash Commands
- **/dev-docs** - Create task documentation
- **/dev-docs-update** - Update docs before context reset
- **/thomas-setup** - This command (project initialization)
- **/code-review** - Multi-aspect code review

---

## Memory Bank System

**CRITICAL: Context Persistence Across Sessions**

Every prompt interaction is automatically saved to the memory bank to enable seamless restarts and context continuity.

### How It Works

1. **Automatic Saving:**
   - Every prompt you send is recorded
   - All responses and file changes are tracked
   - Project state is continuously maintained

2. **Context Restoration:**
   - When you restart Claude Code, the memory bank loads automatically
   - Previous conversations and decisions are available
   - No manual intervention needed

3. **Memory Bank Location:**
   - Stored in: \`.claude/memory-bank/\` (local to project)
   - Contains conversation history, file edits, and decision logs
   - Automatically managed by hooks (post-tool-use-tracker)

### Best Practices

**For Long Sessions:**
- Use \`/dev-docs\` to create explicit task documentation
- Update task files regularly to supplement memory
- Memory bank provides conversation history, task docs provide strategic context

**Before Context Resets:**
- Run \`/dev-docs-update [task-name]\` to save current state
- Memory bank preserves everything, but explicit docs help with strategic direction
- Update CLAUDE.md if architecture changes

**After Restart:**
- Memory bank automatically loads
- Review \`dev/active/\` for active tasks
- Check last updated timestamps in task docs

### Memory + Task Docs = Complete Persistence

| System | Purpose | When to Use |
|--------|---------|-------------|
| **Memory Bank** | Conversation history, detailed interactions | Automatic - always active |
| **Task Docs** (\`dev/active/\`) | Strategic plans, decision rationale | Large features, complex changes |
| **CLAUDE.md** | Architecture, patterns, commands | Initial setup, major arch changes |

The combination ensures you can pick up exactly where you left off, even after weeks.

---

## Working with Claude Code: Plan First Approach

**CRITICAL: This is NOT "vibe-coding" - work together with Claude for best results**

Based on 6 months of production use (300k LOC rewritten), the most effective workflow is **planning first, then implementing**. This approach prevents Claude from "losing the plot" and produces significantly better results than jumping straight to coding.

### The Planning Workflow

#### 1. Enter Plan Mode (UI Feature)
Before starting any non-trivial feature:
- Click "Enter Plan Mode" in the Claude Code UI
- This enables Claude to think deeper about the approach
- **DO THIS:** For any feature requiring 3+ steps or architectural decisions
- **SKIP THIS:** Only for trivial one-liner changes

#### 2. Discuss the Approach
In plan mode, have a conversation with Claude:
\`\`\`markdown
"I want to add user authentication to this app. Let's discuss:
- Should we use JWT or session-based auth?
- Where should the auth state live?
- How do we handle token refresh?
- What about protected routes?"
\`\`\`

**Claude will:**
- Explore different approaches
- Identify potential issues
- Suggest best practices from loaded skills
- Consider edge cases you might miss

#### 3. Review the Generated Plan
Claude will create a structured plan with:
- Overview of the approach
- Step-by-step implementation
- Potential challenges and solutions
- Estimated complexity

**Your job:**
- Review for correctness
- Ask questions about unclear parts
- Request alternatives if needed
- Approve when satisfied

#### 4. Exit Plan Mode and Implement
Once the plan is approved:
- Exit plan mode (UI button)
- Claude implements the approved plan
- Skills auto-activate based on files edited
- Use \`/dev-docs\` for complex features to maintain context

### Why This Works

**Without planning (vibe-coding):**
- ❌ Inconsistent patterns
- ❌ Missed edge cases
- ❌ Refactoring required
- ❌ "Claude lost the plot halfway through"

**With planning:**
- ✅ Consistent architecture
- ✅ Edge cases considered upfront
- ✅ Clear implementation path
- ✅ Context maintained throughout
- ✅ **40-60% reduction in revisions** (measured over 6 months)

### When to Use Plan Mode

| Scenario | Use Plan Mode? | Why |
|----------|----------------|-----|
| New feature (3+ components) | ✅ YES | Architecture decisions needed |
| Bug fix (one function) | ❌ NO | Straightforward change |
| Refactoring (multiple files) | ✅ YES | Need to coordinate changes |
| Adding a prop to component | ❌ NO | Trivial change |
| Database schema changes | ✅ YES | Impacts multiple parts |
| Updating dependencies | ❌ NO | Mechanical task |
| Complex algorithm | ✅ YES | Need to explore approaches |
| Styling tweaks | ❌ NO | Visual iteration is faster |

### Iterative Development Pattern

The plan-first approach works best when combined with iteration:

1. **Plan** → Discuss approach in plan mode
2. **Implement** → Exit plan mode, Claude codes
3. **Review** → Test the implementation
4. **Iterate** → Enter plan mode again for adjustments
5. **Refine** → Repeat until satisfied

**Example iteration:**
\`\`\`markdown
[After initial implementation]
"The auth flow works, but the token refresh feels clunky.
Let's enter plan mode and discuss a better approach..."
\`\`\`

### Integration with Dev Docs

For large features, combine plan mode with \`/dev-docs\`:

1. **Plan mode** → Create strategic approach
2. **\`/dev-docs feature-name\`** → Document the plan
3. **Implement** → Work through tasks
4. **\`/dev-docs-update\`** → Update progress before breaks

This ensures context persists across:
- Long development sessions
- Context resets
- Multiple days/weeks
- Claude Code restarts

### Integration with Skills

Plan mode works seamlessly with auto-activated skills:

1. You describe the feature in plan mode
2. Claude checks which skills are relevant (via hooks)
3. Skills provide patterns and best practices
4. Plan incorporates skill guidelines
5. Implementation follows consistent patterns

**No manual skill loading required** - it happens automatically!

### Red Flags: When You Need Plan Mode

Stop and enter plan mode if Claude:
- Suggests an approach that feels complex
- Mentions "this could be tricky"
- Asks clarifying questions
- Proposes changes to multiple files/features
- Needs to make architectural decisions

**Don't rush into implementation when these signals appear!**

### Pro Tips from 6 Months of Use

1. **Be specific in plan mode:** "Add OAuth2 with Google" not "add login"
2. **Ask "what if" questions:** "What if the API is down during token refresh?"
3. **Request alternatives:** "Show me 2-3 approaches and their tradeoffs"
4. **Validate assumptions:** "Is this the right pattern for our codebase?"
5. **Save good plans:** Copy plan to \`dev/active/\` for reference

### Common Mistakes

**❌ Mistake: Skipping plan mode for "quick" features**
- Reality: "Quick" features often have hidden complexity
- Result: Multiple refactors, wasted time

**✅ Solution:** Default to plan mode for anything non-trivial

**❌ Mistake: Accepting first plan without review**
- Reality: Plans need your domain knowledge input
- Result: Implementation works but doesn't fit your needs

**✅ Solution:** Always review and discuss the plan

**❌ Mistake: Planning every tiny change**
- Reality: Overhead slows down simple changes
- Result: Frustration with the process

**✅ Solution:** Use judgment - skip for one-liners, use for features

### Measuring Success

After implementing the plan-first workflow consistently:
- **Token efficiency:** 40-60% improvement (loading only needed skills)
- **Revision rate:** 40% reduction in refactoring needs
- **Context retention:** Claude "loses the plot" ~5x less often
- **Code quality:** More consistent patterns, better architecture

These metrics come from 6 months of production use on a 300k LOC codebase.

---

## Getting Started Workflow

1. **Initialize project:** Run \`/thomas-setup\` (creates this file and structure)
2. **Install dependencies:** \`npm install\`
3. **Start development:** \`npm run dev\`
4. **Create features:** Use \`/dev-docs [feature-name]\` for large features
5. **Get help:** Skills auto-activate based on what you're working on
6. **Memory:** Automatically saved every prompt (no action needed)

---

## Common Patterns

### Feature Development Flow (Plan-First Approach)
1. **Plan** - **ALWAYS** enter plan mode for non-trivial features (see "Working with Claude Code" section above)
2. **Document** - Use \`/dev-docs [feature-name]\` for complex features to maintain context
3. **Implement** - Exit plan mode, Claude codes the approved plan
4. **Skills auto-activate** - No manual loading, hooks detect file changes
5. **Review** - Use agents for architecture review (\`code-architecture-reviewer\`)
6. **Test** - Write tests, verify functionality
7. **Iterate** - Return to plan mode for adjustments if needed
8. **Update docs** - Run \`/dev-docs-update\` before context resets

**Remember:** This is NOT vibe-coding. The plan-first approach prevents "losing the plot" and produces 40-60% better results.

### Debugging Workflow
1. **Browser DevTools** - Check console for errors
2. **Prefresh HMR** - Verify HMR is working (check Vite output)
3. **Preact DevTools** - Install browser extension for component inspection
4. **TypeScript** - Run \`npm run type-check\` for type errors
5. **ESLint** - Run \`npm run lint\` for code quality issues
6. **Agent assistance** - Use \`frontend-error-fixer\` agent for complex issues

### Code Review Process
1. Run \`code-architecture-reviewer\` agent
2. Check TypeScript errors: \`npm run type-check\`
3. Lint: \`npm run lint\`
4. Review Mantine theme consistency
5. Test Konva performance with large scenes
6. Verify Web3 transactions in wallet/block explorer

---

## Performance Optimization

### Vite
- **Lazy loading**: Use dynamic imports for code splitting
  \`\`\`tsx
  const HeavyComponent = lazy(() => import('./HeavyComponent'));
  \`\`\`
- **Tree shaking**: Import only what you need
  \`\`\`tsx
  import { Button } from '@mantine/core';  // ✅ Tree-shakeable
  import * as Mantine from '@mantine/core'; // ❌ Imports everything
  \`\`\`
- **Bundle analysis**: Use \`rollup-plugin-visualizer\` to analyze bundle
- **Prefresh HMR**: Leverages fast refresh for instant updates

### Preact
- **memo()**: Memoize expensive components
  \`\`\`tsx
  import { memo } from 'preact/compat';
  const ExpensiveComponent = memo(({ data }) => { /* ... */ });
  \`\`\`
- **useMemo/useCallback**: Avoid unnecessary recalculations
- **Preact's advantages**: Already optimized, 3KB size

### Mantine
- **Individual imports**: Import components individually
- **Theme customization**: Only include needed theme values
- **CSS-in-JS**: Emotion provides automatic code splitting

### Konva
- **listening={false}**: For non-interactive shapes (20-30% performance gain)
- **perfectDrawEnabled={false}**: When precision isn't critical
- **Layer caching**: Cache static layers
  \`\`\`tsx
  <Layer ref={layerRef} listening={false}>
    {/* Static background shapes */}
  </Layer>
  \`\`\`
- **Limit objects**: Use virtualization for many objects
- **Use Groups**: Group related shapes for easier management

### react-onchain
- **Cache contract instances**: Don't recreate on every render
- **Batch calls**: Use multicall for reading multiple values
- **Optimize provider calls**: Minimize RPC requests
- **Handle errors**: Implement proper error boundaries for Web3 errors

---

## Testing Strategy

### Unit Testing
- **Vitest** (recommended for Vite projects)
- Test utilities, hooks, and pure functions
- Mock Konva and Web3 providers

### Component Testing
- **@testing-library/preact** - Component testing
- Test user interactions and component behavior
- Mock complex dependencies (Konva, Web3)

### E2E Testing
- **Playwright** or **Cypress** - End-to-end testing
- Test complete user workflows
- Visual regression testing for canvas elements

### Example Test Setup

\`\`\`bash
npm install -D vitest @testing-library/preact @testing-library/jest-dom
\`\`\`

\`\`\`typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import preact from '@preact/preset-vite';

export default defineConfig({
  plugins: [preact()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
});
\`\`\`

---

## Resources

### Official Documentation
- **Vite**: https://vitejs.dev/
- **Preact**: https://preactjs.com/
- **@preact/preset-vite**: https://github.com/preactjs/preset-vite
- **Prefresh**: https://github.com/preactjs/prefresh
- **Mantine**: https://mantine.dev/
- **Konva**: https://konvajs.org/
- **react-konva**: https://konvajs.org/docs/react/
- **react-onchain**: https://github.com/danwag06/react-onchain

### Preact Resources
- **Preact CLI**: https://preactjs.com/cli/
- **Preact DevTools**: Browser extension for debugging
- **Preact Signals**: Reactive state primitive (alternative to useState)
- **Preact Router**: Lightweight routing solution

### Claude Code Resources
- **Skills directory**: ~/.claude/skills/
- **Agents directory**: ~/.claude/agents/
- **Infrastructure showcase**: ~/claude-code-infrastructure-showcase/
- **PM2 setup**: ~/.claude/PM2-SETUP.md

---

## Troubleshooting

### Vite Issues

**Problem: "Failed to resolve import"**
- Solution: Check path aliases in `vite.config.ts` and `tsconfig.json`

**Problem: HMR not working**
- Solution: Ensure `prefreshEnabled: true` in Vite config
- Check for syntax errors in components

**Problem: Slow build**
- Solution: Use `optimizeDeps.include` to pre-bundle dependencies

### Preact Issues

**Problem: "Cannot use JSX without the React JSX runtime"**
- Solution: Ensure `"jsxImportSource": "preact"` in tsconfig.json

**Problem: React library not working**
- Solution: Verify `reactAliasesEnabled: true` in @preact/preset-vite

**Problem: DevTools not showing**
- Solution: Install Preact DevTools browser extension
- Ensure `devToolsEnabled: true` in config (development only)

### Mantine Issues

**Problem: Styles not applied**
- Solution: Import Mantine CSS: `import '@mantine/core/styles.css';`

**Problem: Theme not working**
- Solution: Wrap app in `<MantineProvider theme={...}>`

### Konva Issues

**Problem: Canvas not rendering**
- Solution: Ensure Stage has width/height
- Check that shapes are inside Layer

**Problem: Poor performance**
- Solution: Use `listening={false}` and `perfectDrawEnabled={false}`
- Limit number of shapes, use layer caching

### Web3 Issues

**Problem: "No provider found"**
- Solution: Ensure MetaMask or Web3 provider is installed
- Check provider initialization in app

**Problem: Network mismatch**
- Solution: Implement network switching logic
- Show clear error messages to users

---

## PM2 Process Management (Optional)

If this project has multiple services (e.g., frontend + backend), use PM2 for process management.

See \`ecosystem.config.js\` for configuration and \`~/.claude/PM2-SETUP.md\` for complete guide.

**Quick PM2 commands:**
\`\`\`bash
pm2 start ecosystem.config.js  # Start all services
pm2 logs                        # View logs
pm2 restart all                 # Restart services
pm2 stop all                    # Stop services
pm2 monit                       # Monitor resources
\`\`\`

---

**Note:** This document should be updated as the project evolves. Use \`/dev-docs-update\` before context resets to maintain continuity.

Last Updated: [Current Date]
\`\`\`

### Step 9: Create Symlinks to Global Claude Infrastructure

Link the global Claude infrastructure to this project:

```bash
cd [project-path]/.claude
ln -s ~/.claude/skills ./skills
ln -s ~/.claude/agents ./agents
ln -s ~/.claude/hooks ./hooks
ln -s ~/.claude/commands ./commands
```

### Step 10: Create PM2 Configuration (If Multi-Service)

If the project has multiple services (detected by multiple package.json files or explicit request), create `ecosystem.config.js`:

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: '[project-name]-frontend',
      script: 'npm',
      args: 'run dev',
      cwd: './',
      autorestart: true,
      watch: false,
      max_restarts: 10,
      min_uptime: '10s',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      max_memory_restart: '500M',
    },
    // Add more services as needed
  ],
};
```

### Step 11: Create Initial Files (If New Project)

Create essential starter files:

**src/main.tsx:**
```tsx
import { render } from 'preact';
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import App from './App';
import './styles/global.css';

render(
  <MantineProvider
    theme={{
      colorScheme: 'dark',
      primaryColor: 'cyan',
    }}
  >
    <App />
  </MantineProvider>,
  document.getElementById('app')!
);
```

**src/App.tsx:**
```tsx
import { AppShell, Container, Title } from '@mantine/core';

export default function App() {
  return (
    <AppShell padding="md">
      <AppShell.Main>
        <Container>
          <Title order={1}>Welcome to [Project Name]</Title>
          <p>Built with Vite + Preact + Mantine + Konva + react-onchain</p>
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
```

**index.html:**
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>[Project Name]</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### Step 12: Confirm Completion

Report back to the user with mode-specific summary:

**For NEW projects:**
- ✅ Project directory created at [project-path]
- ✅ Official @preact/preset-vite configuration created
- ✅ Vite config with Prefresh HMR, DevTools, and React compatibility
- ✅ TypeScript configuration optimized for Preact
- ✅ CLAUDE.md master document created
- ✅ Claude infrastructure symlinked (skills, agents, hooks, commands)
- ✅ Memory bank initialized
- ✅ Dependencies installed (if requested)
- 📋 Next steps: `cd [project-path] && npm install && npm run dev`

**For MIGRATED existing projects:**
- ✅ Backup created at [backup-path]
- ✅ Claude infrastructure added to existing project
- ✅ CLAUDE.md master document created/updated
- ✅ Vite config analyzed/updated with @preact/preset-vite
- ✅ dev/active/ directory structure added
- ✅ .claude/memory-bank/ initialized
- ⚠️ Review CLAUDE.md and update with your specific patterns
- ⚠️ If not using Preact, update CLAUDE.md to match your stack
- 📋 Next steps: Verify existing code still works, customize CLAUDE.md

**For CLEAN & RESET projects:**
- ✅ Backup created at [backup-path] (complete original project saved)
- ✅ Project cleaned and reset with Thomas setup
- ✅ Preserved: .git, .env files, node_modules
- ✅ Official Preact + Vite setup with @preact/preset-vite
- ✅ CLAUDE.md master document created
- ✅ Claude infrastructure configured
- ✅ Fresh structure with dev docs and memory bank
- 📋 Next steps: Restore any needed code from backup, then `npm install && npm run dev`

---

## Key Improvements in Optimized Version

### 1. Official @preact/preset-vite Integration
- Uses official Preact team's Vite preset
- Includes Prefresh (HMR) for instant component updates
- Automatic React compatibility via preact/compat aliases
- DevTools integration built-in

### 2. Enhanced Vite Configuration
- Production-ready build optimizations
- Code splitting for vendor chunks
- Source maps for debugging
- Drop console.logs in production
- Optimized dependency pre-bundling

### 3. Comprehensive TypeScript Setup
- Proper JSX configuration for Preact
- Path aliases for clean imports
- Separate config for Node.js tooling
- Strict mode enabled

### 4. Expanded CLAUDE.md Template
- Official documentation links
- Detailed @preact/preset-vite features explanation
- Performance optimization strategies
- Testing strategy section
- Troubleshooting guide
- Proper Preact/React compatibility notes

### 5. Better Project Structure
- Feature-based organization
- Pre-defined component categories
- Clear separation of concerns
- Scalable folder structure

### 6. Multiple Initialization Options
- Official create-preact (recommended)
- Vite's preact-ts template
- Manual installation for full control
