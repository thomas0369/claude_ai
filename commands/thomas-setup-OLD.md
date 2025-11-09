# Thomas Setup Command

Initialize a new project with the master CLAUDE.md architecture document for Thomas's tech stack.

## Purpose

This command sets up a new project directory with:
1. Master CLAUDE.md file documenting the full architecture
2. Project structure for Vite + Preact + Mantine + Konva + react-onchain
3. Ready-to-use configuration that leverages installed skills, hooks, agents, and commands

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
KEEP_FILES=(".git" ".env" ".env.local" "node_modules" "dist" "build")

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
mkdir -p [project-path]/{src,public,docs,dev/active,.claude/memory-bank}
cd [project-path]
```

This creates:
- `src/` - Source code
- `public/` - Static assets
- `docs/` - Project documentation
- `dev/active/` - Task documentation directory (for /dev-docs command)
- `.claude/` - Claude Code configuration
- `.claude/memory-bank/` - Context persistence (auto-managed)

### Step 5: Create/Update Master CLAUDE.md

**For NEW projects or "Clean & Reset":**
- Create fresh `CLAUDE.md` with the template below

**For "Migrate" mode (existing project):**
- Check if CLAUDE.md already exists
- If exists: Create `CLAUDE.md.backup` and update existing file
- If not exists: Create new one
- Analyze existing project to customize sections (detect actual tech stack)

Create `CLAUDE.md` in the project root with the following architecture documentation:

```markdown
# [Project Name] - Master Architecture Document

**Tech Stack:** Vite + Preact + Mantine + Konva + react-onchain

Last Updated: [Current Date]

---

## Quick Commands

\`\`\`bash
# Development
npm run dev              # Start dev server (Vite)
npm run build            # Production build
npm run preview          # Preview production build
npm run lint             # Run linter
npm run type-check       # TypeScript check

# Testing
npm test                 # Run tests
npm run test:watch       # Watch mode

# PM2 (if using multiple services)
pm2 start ecosystem.config.js
pm2 logs
pm2 stop all
\`\`\`

---

## Tech Stack Overview

### Core Framework
- **Vite** - Build tool and dev server
  - Lightning-fast HMR (Hot Module Replacement)
  - Native ES modules
  - Optimized production builds
  - Plugin ecosystem

- **Preact** - Lightweight React alternative (3KB)
  - React API compatibility
  - Faster performance
  - Smaller bundle size
  - Use `preact/compat` for React library compatibility

### UI & Styling
- **Mantine** - Component library
  - 100+ customizable components
  - Built-in dark mode
  - Emotion-based styling
  - Hooks for common patterns
  - Documentation: https://mantine.dev/

### Canvas & Graphics
- **Konva** - Canvas library for interactive graphics
  - Wrapper around HTML5 Canvas
  - Declarative API
  - Event handling for shapes
  - Drag & drop, transformations, animations
  - Integration: react-konva
  - Documentation: https://konvajs.org/

### Blockchain Integration
- **react-onchain** - Blockchain integration utilities
  - Repository: https://github.com/danwag06/react-onchain
  - Provides hooks and components for Web3 interactions
  - Wallet connection management
  - Smart contract interactions
  - Transaction handling

---

## Project Structure

\`\`\`
[project-name]/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── canvas/       # Konva-based canvas components
│   │   ├── layout/       # Layout components (Mantine)
│   │   ├── onchain/      # Web3/blockchain components
│   │   └── common/       # Shared components
│   ├── features/          # Feature-based modules
│   │   ├── [feature-1]/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── utils/
│   ├── hooks/             # Custom React hooks
│   │   ├── useWallet.ts  # Blockchain wallet hooks
│   │   ├── useCanvas.ts  # Canvas-related hooks
│   │   └── ...
│   ├── utils/             # Utility functions
│   ├── styles/            # Global styles (Mantine theme)
│   ├── config/            # Configuration files
│   ├── types/             # TypeScript type definitions
│   ├── App.tsx            # Root component
│   └── main.tsx           # Entry point
├── public/                # Static assets
├── dev/                   # Development documentation
│   └── active/           # Active task documentation (created by /dev-docs)
│       └── [task-name]/  # Per-task directories
│           ├── [task]-plan.md     # Strategic plan
│           ├── [task]-context.md  # Key files and decisions
│           └── [task]-tasks.md    # Checklist of work
├── docs/                  # Project documentation
├── .claude/               # Claude Code configuration
│   ├── skills/           # Project-specific skills (symlink to ~/.claude/skills)
│   ├── agents/           # Project-specific agents (symlink to ~/.claude/agents)
│   ├── hooks/            # Project-specific hooks (symlink to ~/.claude/hooks)
│   ├── commands/         # Project-specific commands (symlink to ~/.claude/commands)
│   └── memory-bank/      # Automatic context persistence (managed by Claude Code)
│       └── *.json        # Conversation history, file edits, decision logs
├── CLAUDE.md              # This file - Master architecture document
├── package.json
├── vite.config.ts
├── tsconfig.json
└── ecosystem.config.js    # PM2 config (if needed)
\`\`\`

---

## Architecture Principles

### 1. Component Organization
- **Features-first structure:** Group by feature, not by type
- **Colocation:** Keep related code together
- **Barrel exports:** Use index.ts for clean imports

### 2. State Management
- **Local state first:** Use Preact hooks (useState, useReducer)
- **Context for shared state:** MantineProvider, Web3Provider
- **Consider external library:** Zustand or Jotai for complex state

### 3. Styling Strategy
- **Mantine components:** Use built-in components when possible
- **Mantine theme:** Customize via MantineProvider
- **CSS Modules:** For component-specific styles
- **Emotion:** For dynamic styles (Mantine uses Emotion under the hood)

### 4. Canvas Layer (Konva)
- **react-konva:** React wrapper for Konva
- **Stage → Layer → Shapes:** Konva hierarchy
- **Performance:** Use `perfectDrawEnabled={false}` for complex scenes
- **Event handling:** onClick, onDragStart, onDragEnd, etc.

### 5. Blockchain Integration
- **Wallet connection:** Use react-onchain hooks
- **Contract interactions:** Abstract into custom hooks
- **Error handling:** Always handle transaction failures
- **Loading states:** Show pending transactions clearly
- **Network awareness:** Display current network, handle switching

---

## Development Guidelines

### Preact + Mantine Integration

\`\`\`tsx
import { MantineProvider } from '@mantine/core';
import { h } from 'preact';

export function App() {
  return (
    <MantineProvider theme={{ colorScheme: 'dark' }}>
      {/* Your app */}
    </MantineProvider>
  );
}
\`\`\`

### Konva Canvas Example

\`\`\`tsx
import { Stage, Layer, Circle, Rect } from 'react-konva';

export function Canvas() {
  return (
    <Stage width={800} height={600}>
      <Layer>
        <Circle x={100} y={100} radius={50} fill="blue" draggable />
        <Rect x={200} y={200} width={100} height={100} fill="red" />
      </Layer>
    </Stage>
  );
}
\`\`\`

### react-onchain Usage

\`\`\`tsx
import { useWallet, useContract } from 'react-onchain';

export function WalletButton() {
  const { address, connect, disconnect } = useWallet();

  return (
    <Button onClick={address ? disconnect : connect}>
      {address ? \`Connected: \${address.slice(0, 6)}...\` : 'Connect Wallet'}
    </Button>
  );
}
\`\`\`

---

## Key Dependencies

\`\`\`json
{
  "dependencies": {
    "preact": "^10.x",
    "@mantine/core": "^7.x",
    "@mantine/hooks": "^7.x",
    "konva": "^9.x",
    "react-konva": "^18.x",
    "react-onchain": "latest",
    "@emotion/react": "^11.x"
  },
  "devDependencies": {
    "vite": "^5.x",
    "@preact/preset-vite": "^2.x",
    "typescript": "^5.x",
    "@types/node": "^20.x"
  }
}
\`\`\`

---

## Vite Configuration

Key settings for Preact + Mantine + Konva:

\`\`\`typescript
// vite.config.ts
import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

export default defineConfig({
  plugins: [preact()],
  resolve: {
    alias: {
      '@': '/src',
      'react': 'preact/compat',
      'react-dom': 'preact/compat',
    },
  },
  optimizeDeps: {
    include: ['preact/compat', '@mantine/core', 'konva', 'react-konva'],
  },
});
\`\`\`

---

## Available Claude Code Infrastructure

This project has access to all installed skills, hooks, agents, and commands:

### Skills (Auto-activated via hooks)
- **skill-developer** - Create new skills
- **frontend-dev-guidelines** - React/Preact patterns (adapt as needed)
- **backend-dev-guidelines** - If you add a backend
- **route-tester** - API testing
- **error-tracking** - Sentry integration

### Hooks (Active in ~/.claude/settings.json)
- **skill-activation-prompt** - Auto-suggests relevant skills
- **post-tool-use-tracker** - Tracks file changes
- Optional: error-handling-reminder, tsc-check, etc.

### Agents (Available via Task tool)
- **code-architecture-reviewer** - Review code structure
- **frontend-error-fixer** - Debug frontend issues
- **refactor-planner** - Plan refactoring
- **documentation-architect** - Generate docs
- And 6 more specialized agents

### Slash Commands
- **/dev-docs** - Create task documentation
- **/dev-docs-update** - Update before context reset
- **/thomas-setup** - This command

---

## Memory Bank System

**CRITICAL: Context Persistence Across Sessions**

Every prompt interaction is automatically saved to the memory bank to enable seamless restarts and context continuity. This is handled by Claude Code's built-in memory system.

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
   - Stored in: \`~/.claude/memory-bank/[project-name]/\`
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

## Getting Started Workflow

1. **Initialize project:** Run \`/thomas-setup\` (creates this file)
2. **Install dependencies:** \`npm install\`
3. **Start development:** \`npm run dev\`
4. **Create features:** Use /dev-docs for large features
5. **Get help:** Skills auto-activate based on what you're working on
6. **Memory:** Automatically saved every prompt (no action needed)

---

## Common Patterns

### Feature Development Flow
1. Plan feature using planning mode
2. Create task docs: \`/dev-docs [feature-name]\`
3. Skills auto-activate based on files you edit
4. Use agents for complex tasks (architecture review, refactoring)
5. Update task docs as you progress

### Debugging Workflow
1. Check browser console for errors
2. Use frontend-error-fixer agent for complex issues
3. Review canvas issues with Konva debugger
4. Check Web3 transactions in wallet/block explorer

### Code Review Process
1. Run code-architecture-reviewer agent
2. Check TypeScript errors: \`npm run type-check\`
3. Lint: \`npm run lint\`
4. Review Mantine theme consistency
5. Test Konva performance with large scenes

---

## Performance Optimization

### Vite
- Use lazy loading: \`const Component = lazy(() => import('./Component'))\`
- Code splitting automatically via dynamic imports
- Optimize bundle size with tree shaking

### Preact
- Use memo() for expensive components
- Avoid unnecessary re-renders
- Leverage Preact's small size advantage

### Mantine
- Import components individually to reduce bundle size
- Use Mantine's built-in optimizations
- Customize theme to only include what you need

### Konva
- Use \`listening={false}\` for non-interactive shapes
- Group static shapes in cached layers
- Limit number of objects in complex scenes
- Use \`perfectDrawEnabled={false}\` when precision isn't critical

### react-onchain
- Cache contract instances
- Batch contract calls when possible
- Use multicall for reading multiple values
- Handle network errors gracefully

---

## Resources

### Documentation
- Vite: https://vitejs.dev/
- Preact: https://preactjs.com/
- Mantine: https://mantine.dev/
- Konva: https://konvajs.org/
- react-konva: https://konvajs.org/docs/react/
- react-onchain: https://github.com/danwag06/react-onchain

### Claude Code Resources
- Skills directory: ~/.claude/skills/
- Agents directory: ~/.claude/agents/
- Infrastructure showcase: ~/claude-code-infrastructure-showcase/

---

**Note:** This document should be updated as the project evolves. Use \`/dev-docs-update\` before context resets to maintain continuity.
\`\`\`

### Step 4: Create Symlinks to Global Claude Infrastructure

Link the global Claude infrastructure to this project:

\`\`\`bash
cd [project-path]/.claude
ln -s ~/.claude/skills ./skills
ln -s ~/.claude/agents ./agents
ln -s ~/.claude/hooks ./hooks
ln -s ~/.claude/commands ./commands
\`\`\`

### Step 5: Initialize Package.json (Optional)

Ask user if they want to initialize the project with npm:

\`\`\`bash
npm init -y
# Then install base dependencies
npm install preact @mantine/core @mantine/hooks konva react-konva react-onchain
npm install -D vite @preact/preset-vite typescript @types/node
\`\`\`

### Step 6: Create Basic Vite Config

Create \`vite.config.ts\` with Preact configuration.

### Step 7: Confirm Completion

Report back to the user with mode-specific summary:

**For NEW projects:**
- ✅ Project directory created at [project-path]
- ✅ CLAUDE.md master document created
- ✅ Claude infrastructure symlinked
- ✅ Dependencies installed (if requested)
- 📋 Next steps: `cd [project-path] && npm install && npm run dev`

**For MIGRATED existing projects:**
- ✅ Backup created at [backup-path]
- ✅ Claude infrastructure added to existing project
- ✅ CLAUDE.md master document created/updated
- ✅ dev/active/ directory structure added
- ✅ .claude/memory-bank/ initialized
- ⚠️ Review CLAUDE.md and update with your specific patterns
- 📋 Next steps: Verify existing code still works, customize CLAUDE.md

**For CLEAN & RESET projects:**
- ✅ Backup created at [backup-path] (complete original project saved)
- ✅ Project cleaned and reset with Thomas setup
- ✅ Preserved: .git, .env files, node_modules
- ✅ CLAUDE.md master document created
- ✅ Claude infrastructure configured
- ✅ Fresh structure with dev docs and memory bank
- 📋 Next steps: Restore any needed code from backup, then `npm install && npm run dev`

---

## Example Usage Scenarios

### Scenario 1: Brand New Project

\`\`\`
User: /thomas-setup my-canvas-app
Claude: I'll set up a new project with Vite + Preact + Mantine + Konva + react-onchain.
        Where would you like to create the project? (default: /mnt/c/App-Ideas-Workspace/my-canvas-app)
User: [Press Enter for default]
Claude: Checking for existing project... None found.
        Creating new project structure...
        ✅ Project created at /mnt/c/App-Ideas-Workspace/my-canvas-app
        ✅ CLAUDE.md architecture document created
        ✅ Claude infrastructure linked (skills, agents, hooks, commands)
        ✅ dev/active/ structure created
        ✅ .claude/memory-bank/ initialized

        Would you like me to initialize npm and install dependencies? (yes/no)
User: yes
Claude: Installing dependencies...
        ✅ Dependencies installed

        Next steps:
        1. cd /mnt/c/App-Ideas-Workspace/my-canvas-app
        2. npm run dev
        3. Start building your app!
\`\`\`

### Scenario 2: Existing Project - Migration

\`\`\`
User: I have an existing project at /mnt/c/App-Ideas-Workspace/my-old-app
      Can you run /thomas-setup on it?

Claude: Found existing project at /mnt/c/App-Ideas-Workspace/my-old-app
        Detected: React app with Vite (analyzing package.json...)

        Choose action:
        1. Migrate - Keep existing code, add Claude infrastructure
        2. Clean & Reset - Backup and start fresh with Thomas setup
        3. Cancel

User: 1 (Migrate)

Claude: Creating backup...
        ✅ Backup created at /mnt/c/App-Ideas-Workspace/my-old-app.backup-20251109-115500

        Adding Claude infrastructure to existing project...
        ✅ Created .claude/ directory with symlinks
        ✅ Created dev/active/ for task documentation
        ✅ Initialized .claude/memory-bank/
        ✅ Generated CLAUDE.md (detected your React + Vite stack)

        ⚠️ Note: I detected React, but the template is for Preact.
           I've customized CLAUDE.md to match your React setup.
           Please review and adjust as needed.

        Next steps:
        1. Review CLAUDE.md and customize for your specific patterns
        2. Test that existing app still works: npm run dev
        3. Start using /dev-docs for feature development
\`\`\`

### Scenario 3: Existing Project - Clean & Reset

\`\`\`
User: /thomas-setup /mnt/c/App-Ideas-Workspace/old-messy-project

Claude: Found existing project at /mnt/c/App-Ideas-Workspace/old-messy-project
        Package.json detected - active project.

        Choose action:
        1. Migrate - Keep existing code, add Claude infrastructure
        2. Clean & Reset - Backup and start fresh with Thomas setup
        3. Cancel

User: 2 (Clean & Reset)

Claude: ⚠️ WARNING: This will clean the project directory!
        A complete backup will be created first.
        Files that will be kept: .git, .env*, node_modules, dist/, build/
        Everything else will be removed.

        Proceed? (yes/no)
User: yes

Claude: Creating backup...
        ✅ Complete backup: /mnt/c/App-Ideas-Workspace/old-messy-project.backup-20251109-120000

        Cleaning project directory...
        ✅ Removed old files
        ✅ Preserved: .git, .env, .env.local, node_modules

        Creating fresh Thomas setup...
        ✅ New directory structure created
        ✅ CLAUDE.md architecture document created
        ✅ Claude infrastructure configured
        ✅ dev/active/ and memory-bank/ initialized

        Next steps:
        1. Restore any needed code from backup: /mnt/c/App-Ideas-Workspace/old-messy-project.backup-20251109-120000
        2. Reorganize code into new src/ structure
        3. Run: npm install (if dependencies changed)
        4. Test: npm run dev
\`\`\`

### Scenario 4: Current Directory Setup

\`\`\`
User: [Already in ~/dev/my-project]
      /thomas-setup

Claude: You're in ~/dev/my-project
        Use this directory for Thomas setup? (yes/no)
User: yes

Claude: Checking for existing project...
        Found package.json - existing project detected.

        Choose action:
        1. Migrate - Keep existing code, add Claude infrastructure
        2. Clean & Reset - Backup and start fresh
        3. Cancel

User: 1

Claude: [Proceeds with migration...]
\`\`\`
