# Thomas-Setup Worktree Enhancement

**Created:** 2025-01-09
**Purpose:** Add worktree-first workflow to `/thomas-setup` command

---

## Summary

Enhance `/thomas-setup` to create new projects in git worktrees by default, establishing professional workflow from day one.

## Changes to Make

### Add New Step 0.5: Worktree Decision (Before Step 1)

Insert this section AFTER "Step 0: Detect Project Type" and BEFORE "Step 1: Verify Project Location":

```markdown
### Step 0.5: Worktree-First Setup (NEW!)

**For NEW projects, we use git worktrees from the start:**

**Why worktrees for new projects?**
- ✅ Main branch stays pristine for production deployments
- ✅ Initial setup is isolated in feature branch
- ✅ Professional workflow from day one
- ✅ Perfect for BSV on-chain deployment (main = production)
- ✅ Easy to reset setup if needed (just delete worktree)

**Workflow:**
```
../my-new-app/                    # Main repo (empty main branch)
../my-new-app-worktrees/
  └── feature/initial-setup/      # Actual project setup happens here
      ├── .dev/                   # Dev-docs for setup
      │   ├── plan.md
      │   ├── context.md
      │   └── tasks.md
      ├── src/
      ├── vite.config.ts
      └── package.json
```

**Steps:**

1. **Create main repository:**
   ```bash
   mkdir -p [project-path]
   cd [project-path]
   git init
   git commit --allow-empty -m "chore: initialize repository"
   ```

2. **Create worktree for initial setup:**
   ```bash
   mkdir -p ../[project-name]-worktrees
   git worktree add ../[project-name]-worktrees/feature/initial-setup -b feature/initial-setup
   cd ../[project-name]-worktrees/feature/initial-setup
   ```

3. **Create `.dev/` directory in worktree:**
   ```bash
   mkdir -p .dev
   ```

4. **Create setup plan in `.dev/plan.md`:**
   ```markdown
   # Initial Project Setup

   **Created:** YYYY-MM-DD
   **Branch:** feature/initial-setup
   **Status:** In Progress

   ## Overview
   Setting up new Vite + Preact + BSV project with Thomas stack.

   ## Setup Phases

   ### Phase 1: Repository Initialization
   - [x] Create main repository
   - [x] Create worktree for setup
   - [x] Initialize dev-docs

   ### Phase 2: Dependency Installation
   - [ ] Run create-preact or Vite template
   - [ ] Install TailwindCSS + DaisyUI
   - [ ] Install Nanostores
   - [ ] Install Konva
   - [ ] Install vite-plugin-pwa
   - [ ] Install BSV SDK

   ### Phase 3: Configuration
   - [ ] Configure vite.config.ts
   - [ ] Configure tsconfig.json
   - [ ] Configure TailwindCSS
   - [ ] Create CLAUDE.md

   ### Phase 4: Claude Infrastructure
   - [ ] Create .claude/ directory
   - [ ] Add .gitignore for .dev/
   - [ ] Symlink global infrastructure

   ### Phase 5: Finalization
   - [ ] Test dev server
   - [ ] Create initial commit
   - [ ] Ready to merge to main

   ## Last Updated
   YYYY-MM-DD
   ```

5. **Create context file in `.dev/context.md`:**
   ```markdown
   # Context: Initial Project Setup

   **Created:** YYYY-MM-DD
   **Branch:** feature/initial-setup

   ## Tech Stack Decisions

   ### Framework
   - Vite + Preact
   - Reason: 3KB bundle, fast HMR, React-compatible

   ### UI Framework
   - TailwindCSS + DaisyUI
   - Reason: 93% smaller than Mantine, pure CSS

   ### State Management
   - Nanostores
   - Reason: 286 bytes, framework-agnostic

   ### Canvas
   - Konva + react-konva
   - Reason: Best canvas library for React/Preact

   ### PWA
   - vite-plugin-pwa
   - Reason: Official Vite PWA integration

   ### Blockchain
   - @bsv/sdk + react-onchain
   - Reason: On-chain deployment support

   ## Initialization Method
   - Chosen: [create-preact | vite template | manual]
   - Reason: [Why this choice]

   ## Last Updated
   YYYY-MM-DD
   ```

6. **Create tasks file in `.dev/tasks.md`:**
   ```markdown
   # Tasks: Initial Project Setup

   **Branch:** feature/initial-setup
   **Progress:** 0/X tasks

   ## Setup Checklist

   - [ ] **1.1** Initialize with create-preact/Vite
   - [ ] **1.2** Install TailwindCSS + DaisyUI
   - [ ] **1.3** Install Nanostores
   - [ ] **1.4** Install Konva
   - [ ] **1.5** Install vite-plugin-pwa
   - [ ] **1.6** Install @bsv/sdk
   - [ ] **2.1** Configure vite.config.ts
   - [ ] **2.2** Configure tsconfig.json
   - [ ] **2.3** Configure tailwind.config.js
   - [ ] **3.1** Create CLAUDE.md
   - [ ] **3.2** Create .gitignore (add .dev/)
   - [ ] **3.3** Symlink Claude infrastructure
   - [ ] **4.1** Test `npm run dev`
   - [ ] **4.2** Commit all changes
   - [ ] **4.3** Ready to merge

   ## Last Updated
   YYYY-MM-DD
   ```

7. **Continue with normal setup steps in worktree**

**All remaining steps (1-12) run inside the worktree, NOT the main repo.**
```

---

### Update Step 1: Verify Project Location

Change this section to be worktree-aware:

```markdown
### Step 1: Verify Project Location

**For NEW projects with worktrees:**
- Main repo location: [user-specified path or default]
- Worktree location: [main-repo]/../[project-name]-worktrees/feature/initial-setup/
- Working directory: WORKTREE (all setup happens here)

**For EXISTING projects:**
- Same as before (no worktree needed for migration)
```

---

### Update Step 4: Create Directory Structure

Change line 94 from:
```bash
mkdir -p [project-path]/{src/...}
```

To:
```bash
# Inside worktree
mkdir -p {src/{components/{canvas,layout,onchain,common},features,hooks,utils,styles,config,types},public,docs,.claude/memory-bank}

# Note: .dev/ already exists from Step 0.5
# Note: dev/active/ is legacy, we use .dev/ now
```

---

### Update Step 8: Create Master CLAUDE.md

Add new section explaining worktree setup:

```markdown
### Worktree Setup (For New Projects)

This project was initialized using the worktree-first workflow:

**Structure:**
```
../my-new-app/                    # Main repo (pristine)
  └── .git/                       # Git data
  └── README.md                   # Project info

../my-new-app-worktrees/
  └── feature/initial-setup/      # Setup happens here
      ├── .dev/                   # Dev-docs (local to worktree)
      ├── src/                    # Source code
      ├── vite.config.ts
      ├── package.json
      └── CLAUDE.md               # This file
```

**Benefits:**
- Main branch = Production deployments only
- Setup refined before first "release"
- Clean git history (squash setup commits)
- Can rebuild from scratch if needed

**When Setup Complete:**
```bash
# From worktree
git add .
git commit -m "feat: initial project setup with Vite + Preact + BSV stack"
git push origin feature/initial-setup

# Create PR to merge to main
gh pr create --title "Initial project setup" --body "Complete Thomas stack setup"

# After merge, worktree can be removed
git worktree remove ../my-new-app-worktrees/feature/initial-setup
```

**Development Workflow:**
For new features, create more worktrees using `/dev-docs`:
```
/dev-docs "implement user authentication"
→ Auto-creates: feature/YYYYMMDD-user-authentication worktree
→ Auto-creates: .dev/ with plan/context/tasks
```
```

---

### Update Step 11: Create Initial Files

Add note at top:

```markdown
### Step 11: Create Initial Files (If New Project)

**IMPORTANT: These files are created in the WORKTREE, not main repo.**

Create essential starter files in: `../[project-name]-worktrees/feature/initial-setup/`
```

---

### Update Step 12: Confirm Completion

Update the "For NEW projects" section:

```markdown
**For NEW projects:**
- ✅ Main repository created at [project-path]
- ✅ **Worktree created for setup:** ../[project-name]-worktrees/feature/initial-setup/
- ✅ **Dev-docs initialized:** .dev/plan.md, .dev/context.md, .dev/tasks.md
- ✅ Official @preact/preset-vite configuration created
- ✅ Vite config with Prefresh HMR, DevTools, and React compatibility
- ✅ TypeScript configuration optimized for Preact
- ✅ CLAUDE.md master document created (in worktree)
- ✅ TailwindCSS + DaisyUI configured
- ✅ Claude infrastructure symlinked
- ✅ Dependencies installed (if requested)

**Working Directory:**
📍 You are in: ../[project-name]-worktrees/feature/initial-setup/

**Next steps:**
1. Review .dev/plan.md for setup overview
2. `npm install` (if not done)
3. `npm run dev` to test
4. Mark tasks complete in .dev/tasks.md as you verify each part
5. When ready: `git add . && git commit -m "feat: initial setup"`
6. Create PR to merge to main branch

**Professional Workflow Established:**
- ✅ Main branch stays clean (for BSV deployments)
- ✅ Setup isolated in feature branch
- ✅ Dev-docs track progress (.dev/)
- ✅ Can start new features with `/dev-docs` command
```

---

## Update to .gitignore

Add to the `.gitignore` creation step:

```bash
# Dev-docs (session-specific, local only)
.dev/

# Worktree meta (already gitignored by Git)
# No need to add, Git handles this
```

---

## Benefits Summary

**Before (old thomas-setup):**
```
my-project/
├── src/
├── dev/active/    # Dev-docs here
└── package.json
```

**After (worktree-first thomas-setup):**
```
my-project/                        # Main (pristine)
  └── README.md

my-project-worktrees/
  └── feature/initial-setup/       # Setup here
      ├── .dev/                    # Dev-docs WITH code
      ├── src/
      └── package.json
```

**Advantages:**
1. ✅ Main branch perfect for BSV on-chain deployment
2. ✅ Setup can be refined/reset easily
3. ✅ Professional workflow from day one
4. ✅ Dev-docs travel with code (`.dev/`)
5. ✅ Clean git history (squash setup commits before merge)
6. ✅ Sets pattern for future feature development

---

## Implementation Steps

1. Open `commands/thomas-setup.md`
2. Insert Step 0.5 after Step 0
3. Update Step 1 wording
4. Update Step 4 directory creation
5. Update Step 8 CLAUDE.md template
6. Update Step 11 file creation note
7. Update Step 12 completion message
8. Add .dev/ to .gitignore creation

---

## Testing

**Test new worktree-first setup:**
```
/thomas-setup test-worktree-app

Should create:
- Main repo: test-worktree-app/
- Worktree: test-worktree-app-worktrees/feature/initial-setup/
- Dev-docs: .dev/plan.md, .dev/context.md, .dev/tasks.md
- Full setup in worktree
```

**Test existing project migration (should still work):**
```
/thomas-setup existing-project --mode=migrate

Should:
- NOT create worktree (migration doesn't use worktrees)
- Add Claude infrastructure to existing code
- Create CLAUDE.md
```

---

This enhancement integrates perfectly with the updated `/dev-docs` command, creating a unified worktree + dev-docs workflow!
