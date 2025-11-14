# /thomas-setup Command - Gap Analysis

**Date**: 2025-01-14
**Context**: Comparing `/thomas-setup` command with Reddit post recommendations and recent optimizations

---

## Executive Summary

The `/thomas-setup` command is **comprehensive but has several gaps** based on our Reddit post alignment work. It needs updating to reflect:
1. **New dev docs workflow** (templates + script)
2. **Companion documentation** (PROJECT_KNOWLEDGE.md, TROUBLESHOOTING.md)
3. **Correct tech stack** (Preact/DaisyUI/Nanostores, not Mantine)
4. **Updated project template** (PROJECT-CLAUDE-TEMPLATE.md)
5. **Skills auto-activation** (already working, but should be mentioned)
6. **Error auto-triage** (new feature to mention)

**Score**: 6/10 - Good foundation, but outdated compared to current optimization

---

## What's Missing or Outdated

### 1. ❌ Wrong UI Framework (Critical)

**Issue**: Command references Mantine throughout
```markdown
**UI Library**: shadcui (Radix UI primitives)   # WRONG - Line 9
**Styling**: Tailwind CSS                       # Incomplete
**State**: Zustand for global state             # WRONG
**Forms**: React Hook Form + Zod validation     # WRONG
```

**Should be**:
```markdown
**UI Library**: DaisyUI (CSS-only components, 2KB)
**Styling**: TailwindCSS + DaisyUI
**State**: Nanostores (286 bytes)
**Forms**: Preact Signals (1KB) + Zod (8KB)
```

**Files with wrong references**:
- Line 9: "shadcui (Radix UI primitives)"
- Line 1507-1525: Mantine dependencies
- Line 1530-1563: Mantine configuration section
- Lines 1199-1243: Styling strategy mentions Mantine
- Lines 2009-2015: Mantine troubleshooting
- Lines 2117-2120, 2131-2145: Mantine in starter files

**Impact**: High - Creates projects with wrong tech stack

---

### 2. ❌ Missing Dev Docs Workflow Integration

**Issue**: Command has worktree setup (Step 0.5) but doesn't use our new `dev-task-init.sh` script

**Current approach** (lines 59-223):
- Manually creates `.dev/` directory
- Manually writes plan.md, context.md, tasks.md content inline
- Hardcoded templates in command file

**Should use**:
```bash
# After creating worktree, use our new script
~/.claude/scripts/dev-task-init.sh initial-setup [worktree-path]

# This auto-creates:
#   .dev/initial-setup-plan.md
#   .dev/initial-setup-context.md
#   .dev/initial-setup-tasks.md
```

**Benefits**:
- ✅ DRY - Single source of truth for templates
- ✅ Consistent - Same structure as /dev-docs command
- ✅ Maintainable - Update templates in one place
- ✅ Aligned - Uses same system as Reddit recommendations

**Location**: Step 0.5 (lines 59-223)

---

### 3. ❌ Missing Companion Documentation Setup

**Issue**: Command doesn't create PROJECT_KNOWLEDGE.md or TROUBLESHOOTING.md

**What's created currently**:
- ✅ CLAUDE.md (huge template, lines 604-2058)
- ❌ PROJECT_KNOWLEDGE.md (missing)
- ❌ TROUBLESHOOTING.md (missing)

**Should add** (new step after Step 8):
```bash
# Step 8.5: Create Companion Documentation
cp ~/.claude/templates/PROJECT_KNOWLEDGE.md [project-path]/
cp ~/.claude/templates/TROUBLESHOOTING.md [project-path]/

# Pre-fill with project name and date
sed -i "s/\[Project Name\]/[actual-project-name]/g" PROJECT_KNOWLEDGE.md
sed -i "s/\[Date\]/$(date +%Y-%m-%d)/g" PROJECT_KNOWLEDGE.md
# Same for TROUBLESHOOTING.md
```

**Benefit**: Aligns with Reddit recommendation for companion docs

---

### 4. ❌ CLAUDE.md Template is Outdated

**Issue**: Inline CLAUDE.md template (lines 604-2058, **1455 lines!**) is:
- ❌ Too large (should use PROJECT-CLAUDE-TEMPLATE.md)
- ❌ References Mantine/Zustand/React Hook Form
- ❌ Missing auto-activation systems documentation
- ❌ Missing error auto-triage documentation
- ❌ Doesn't reference dev docs workflow

**Should replace with**:
```bash
# Step 8: Create CLAUDE.md from template
cp ~/.claude/templates/PROJECT-CLAUDE-TEMPLATE.md [project-path]/.claude/CLAUDE.md

# Customize with project name
sed -i "s/\[Project Name\]/[actual-project-name]/g" .claude/CLAUDE.md
sed -i "s/\[Date\]/$(date +%Y-%m-%d)/g" .claude/CLAUDE.md
```

**Current template**: 119 lines (optimized)
**Command template**: 1455 lines (outdated, bloated)

**Benefit**:
- ✅ Uses optimized template (119 lines)
- ✅ Correct tech stack
- ✅ References companion docs
- ✅ Documents auto-activation systems
- ✅ Single source of truth

---

### 5. ❌ Missing Auto-Activation Documentation

**Issue**: Command doesn't mention that skills/errors auto-activate

**Should add** to completion message:
```markdown
**Smart Automation Enabled:**
- ✅ **Skills auto-activation**: Frontend files → frontend-dev-guidelines
- ✅ **Error auto-triage**: Errors route to specialist agents automatically
- ✅ **No manual loading needed**: Hooks detect file types and errors

See CLAUDE.md lines XX-XX for details.
```

**Location**: Step 12 completion message

---

### 6. ⚠️ Vite Config Has Wrong Stack References

**Issue**: Lines 355-533 have Vite config referencing Mantine

**Current** (line 535):
```typescript
// ===== React Compatibility Layer =====
// Automatically aliases React imports to preact/compat
// Required for Mantine and react-konva
reactAliasesEnabled: true,
```

**Should be**:
```typescript
// ===== React Compatibility Layer =====
// Automatically aliases React imports to preact/compat
// Required for react-konva (if using canvas)
reactAliasesEnabled: true,
```

**Also remove**:
- Mantine from dependencies (lines 1507-1525)
- Mantine theme imports (lines 1507-1525)
- All Mantine code examples

---

### 7. ⚠️ Missing Reference to Preact Patterns Resource

**Issue**: Command creates project but doesn't reference `preact-patterns.md` (440 lines)

**Should add to CLAUDE.md template**:
```markdown
## Tech Stack

**Frontend**: Preact (3KB) + Vite
**Styling**: TailwindCSS + DaisyUI (2KB CSS-only)
**State**: Nanostores (286 bytes)
**Forms**: Preact Signals (1KB) + Zod (8KB)

**→ Detailed patterns in `frontend-dev-guidelines` skill**
**→ Preact/DaisyUI examples: `~/.claude/skills/frontend-dev-guidelines/resources/preact-patterns.md`**
```

This is already in our optimized template, so using PROJECT-CLAUDE-TEMPLATE.md fixes it.

---

### 8. ❌ Dependencies Section is Wrong

**Current dependencies** (lines 1505-1526):
```json
"@mantine/core": "^7.5.0",        # WRONG
"@mantine/hooks": "^7.5.0",       # WRONG
"@emotion/react": "^11.11.0",     # WRONG (Mantine dependency)
"konva": "^9.3.0",                # OK
"react-konva": "^18.2.0",         # OK
"react-onchain": "latest"         # OK
```

**Should be**:
```json
"preact": "^10.19.0",                # Core
"nanostores": "^0.10.x",             # State
"@nanostores/preact": "^0.5.x",      # Preact integration
"@nanostores/persistent": "^0.10.x", # Persistence
"konva": "^9.3.0",                   # Canvas
"react-konva": "^18.2.0",            # Canvas wrapper
"@bsv/sdk": "latest"                 # BSV (not react-onchain for deps)

# DevDeps
"tailwindcss": "latest",
"daisyui": "latest",
"@preact/preset-vite": "^2.8.0",
"vite": "^5.0.0",
"typescript": "^5.3.0"
```

---

### 9. ❌ Missing PWA Configuration Customization

**Issue**: PWA config in vite.config.ts (lines 386-463) is generic

**Should ask user**:
```markdown
### PWA Configuration

Do you want Progressive Web App support?
- [Y/N] Enable PWA?
- If yes:
  - App name: [Project Name]
  - Short name: [abbreviation]
  - Theme color: [color]
  - Icons: Generate from logo? [Y/N]
```

**Then customize** VitePWA manifest accordingly.

---

### 10. ⚠️ Worktree Workflow is Good but Could Reference /dev-docs

**Issue**: Worktree setup (Step 0.5) is well-designed but doesn't mention `/dev-docs` command

**Should add note**:
```markdown
**Note**: This worktree setup uses the same dev-docs structure as the `/dev-docs` command.
Once your project is set up, use `/dev-docs <task-name>` to create new feature worktrees.
```

**Location**: After Step 0.5 explanation

---

## What's Good (Keep These)

### ✅ 1. Worktree-First Approach (Lines 59-223)
- Excellent professional workflow
- Main branch stays pristine
- Perfect for BSV on-chain deployment
- Well-documented rationale

### ✅ 2. Official @preact/preset-vite (Lines 352-542)
- Uses official Preact Vite preset
- Comprehensive configuration
- Good comments explaining each option
- Production-ready optimizations

### ✅ 3. TypeScript Configuration (Lines 543-601)
- Proper Preact JSX setup
- Path aliases configured
- Strict mode enabled
- Node.js tooling separation

### ✅ 4. Three-Mode Setup (Lines 36-58)
- New project
- Migrate existing
- Clean & reset
- Good user flow with choices

### ✅ 5. Comprehensive Vite Config (Lines 352-533)
- PWA support
- Code splitting
- Build optimizations
- Development server config

### ✅ 6. Project Structure (Lines 279-304, 1069-1148)
- Feature-based organization
- Domain-organized components
- Clear separation of concerns

### ✅ 7. Deployment Guide (Lines 772-1015)
- Vercel setup
- BSV on-chain deployment
- Cost analysis
- Versioning strategy

---

## Recommendations

### Priority 1: Critical Fixes (Do Immediately)

1. **Replace Mantine with DaisyUI** throughout entire command
   - Update all code examples
   - Update dependencies
   - Update configuration sections
   - Update troubleshooting

2. **Use PROJECT-CLAUDE-TEMPLATE.md** instead of inline template
   - Replace lines 604-2058 with template copy
   - Reduces command from 2258 to ~900 lines
   - Single source of truth

3. **Fix tech stack references**
   - Nanostores instead of Zustand
   - Preact Signals + Zod instead of React Hook Form
   - DaisyUI instead of Mantine

4. **Update dependencies section** (lines 1505-1526)
   - Remove Mantine dependencies
   - Add TailwindCSS + DaisyUI
   - Add Nanostores packages
   - Update versions

### Priority 2: New Features (Add Soon)

5. **Integrate dev-task-init.sh script**
   - Replace manual .dev/ creation
   - Use `~/.claude/scripts/dev-task-init.sh initial-setup [worktree-path]`

6. **Add companion documentation creation** (new Step 8.5)
   - Copy PROJECT_KNOWLEDGE.md template
   - Copy TROUBLESHOOTING.md template
   - Pre-fill with project name/date

7. **Document auto-activation systems** in completion message
   - Skills auto-activation
   - Error auto-triage
   - No manual loading needed

8. **Add PWA customization prompts**
   - Ask if user wants PWA
   - Customize manifest with project details
   - Optional icon generation

### Priority 3: Improvements (Nice to Have)

9. **Add reference to preact-patterns.md**
   - Mention in completion message
   - Document in CLAUDE.md template (already in our optimized template)

10. **Cross-reference /dev-docs command**
    - Note worktree similarity
    - Guide users to /dev-docs for future features

11. **Add verification step**
    - Test `npm run dev` works
    - Verify all symlinks created
    - Check skills auto-activation

---

## Suggested Refactoring Plan

### Option A: Incremental Updates (Recommended)

**Phase 1**: Fix tech stack (1-2 hours)
- Replace all Mantine → DaisyUI
- Update dependencies
- Update code examples
- Update vite config comments

**Phase 2**: Use templates (30 mins)
- Replace inline CLAUDE.md with template copy
- Add companion docs creation
- Reduces command size significantly

**Phase 3**: Integrate new features (1 hour)
- Use dev-task-init.sh script
- Document auto-activation
- Add PWA customization

**Total effort**: ~3-4 hours

### Option B: Complete Rewrite (Alternative)

**Approach**: Start from scratch with learnings
- Use current structure as reference
- Build around templates (PROJECT-CLAUDE-TEMPLATE.md)
- Integrate all Reddit optimizations
- Cleaner, more maintainable

**Total effort**: ~6-8 hours
**Benefit**: Cleaner codebase, easier to maintain

---

## Impact Assessment

### Current State
- ❌ Creates projects with wrong tech stack (Mantine)
- ❌ Missing companion documentation
- ❌ Outdated CLAUDE.md (1455 lines vs optimized 119)
- ❌ Doesn't use dev-task-init.sh script
- ⚠️ Missing auto-activation documentation
- ✅ Good worktree workflow
- ✅ Good Vite configuration structure
- ✅ Good deployment guide

**Overall**: 5/10 - Functional but significantly outdated

### After Priority 1 Fixes
- ✅ Correct tech stack (DaisyUI + Nanostores)
- ✅ Uses optimized templates
- ✅ Reduced command size (~900 lines)
- ✅ Single source of truth for templates
- ⚠️ Still missing some new features

**Overall**: 8/10 - Production ready, aligned with stack

### After All Priorities
- ✅ Complete Reddit alignment
- ✅ All new features integrated
- ✅ Companion docs created
- ✅ Auto-activation documented
- ✅ PWA customization
- ✅ Fully optimized

**Overall**: 10/10 - World-class setup command

---

## Comparison: Current vs Optimized Config

| Feature | /thomas-setup | Current ~/.claude/ | Alignment |
|---------|---------------|-------------------|-----------|
| Tech Stack | Mantine + Zustand | DaisyUI + Nanostores | ❌ Mismatch |
| CLAUDE.md Size | 1455 lines | 110 lines | ❌ 13x larger |
| Dev Docs Workflow | Manual .dev/ | dev-task-init.sh | ⚠️ Manual |
| Companion Docs | Not created | Templates exist | ❌ Missing |
| Auto-Activation | Not mentioned | Documented | ❌ Missing |
| Error Auto-Triage | Not mentioned | Implemented | ❌ Missing |
| Template Usage | Inline | Separate files | ❌ Inline |
| Worktree Setup | ✅ Excellent | N/A | ✅ Good |
| Vite Config | ✅ Good structure | N/A | ✅ Good |
| Dependencies | Mantine packages | Tailwind + DaisyUI | ❌ Wrong |

**Alignment Score**: 3/10 - Major gaps

---

## Action Items

### Immediate (Do This Session)

1. [ ] **Create updated /thomas-setup command**
   - Fix tech stack references (Mantine → DaisyUI)
   - Use PROJECT-CLAUDE-TEMPLATE.md
   - Add companion docs creation
   - Integrate dev-task-init.sh

2. [ ] **Update dependencies**
   - Remove Mantine
   - Add TailwindCSS + DaisyUI
   - Add Nanostores packages

3. [ ] **Update code examples**
   - Replace Mantine components with DaisyUI
   - Update styling examples
   - Fix state management examples

### Near-term (Next Session)

4. [ ] **Add PWA customization**
   - Interactive prompts
   - Manifest customization

5. [ ] **Add verification step**
   - Test dev server
   - Verify symlinks
   - Check auto-activation

6. [ ] **Document in THOMAS-SETUP-CHANGELOG.md**
   - What changed
   - Why it changed
   - Migration guide for existing projects

---

## Conclusion

The `/thomas-setup` command has **excellent foundational structure** (worktree workflow, Vite config, deployment guide) but is **significantly outdated** compared to our recent optimizations.

**Key Issues**:
1. Wrong tech stack (Mantine instead of DaisyUI)
2. Bloated inline template (1455 lines vs 119)
3. Missing new features (companion docs, auto-activation)
4. Not using our new template system

**Recommendation**: **Priority 1 fixes are critical** - the command currently creates projects with the wrong tech stack. This should be fixed immediately to align with the optimized configuration.

**Estimated Effort**: 3-4 hours for complete alignment

**Expected Outcome**: World-class project initialization that matches our 10/10 configuration

---

**Status**: Ready for implementation
**Priority**: High (creates wrong tech stack)
**Complexity**: Medium (mostly find/replace + template usage)
