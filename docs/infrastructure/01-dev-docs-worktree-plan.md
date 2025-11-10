# Dev-Docs + Worktree Integration Plan

**Created:** 2025-01-09
**Status:** Ready for Implementation
**Author:** Claude Code

---

## Executive Summary

This document outlines the complete integration of dev-docs with git worktrees, combining the best of both workflows into a unified, automated system.

## Key Changes

### 1. `/dev-docs` Command Enhancement
- **Auto-detects** protected branches (main/master/develop)
- **Auto-creates** worktree when on protected branch
- **Creates** `.dev/` directory in worktree (not `dev/active/`)
- **Generates** plan/context/tasks as before
- **Returns** control in worktree, ready to code

### 2. `/thomas-setup` Command Enhancement
- **Creates** new projects in worktree by default
- **Main branch** stays pristine for production deployments
- **Feature branch** (`feature/initial-setup`) for all setup work
- **Auto-creates** `.dev/` with initial setup plan
- **Professional** workflow from day one

### 3. Hooks Integration
- **Enhance** existing hooks to create `.dev/` skeleton
- **No breaking changes** to existing hook behavior
- **Seamless** integration with current automation

### 4. Directory Structure Change
**Before:**
```
my-project/dev/active/feature-name/  # Dev-docs here
../my-project-worktrees/feature/...  # Code there
```

**After:**
```
../my-project-worktrees/feature/.../
  └── .dev/  # Dev-docs WITH code (unified!)
```

---

## Implementation Checklist

### Phase 1: Core Command Updates
- [ ] Update `commands/dev-docs.md` with worktree logic
- [ ] Update `commands/thomas-setup.md` with worktree-first setup
- [ ] Update `commands/dev-docs-update.md` with `.dev/` support

### Phase 2: Hook Enhancements
- [ ] Enhance `hooks/00-enforce-worktree.js` to create `.dev/` skeleton
- [ ] Enhance `hooks/pre-task-auto-worktree.js` to create `.dev/` skeleton
- [ ] Update `hooks/post-task-worktree-cleanup.js` to update `.dev/tasks.md`

### Phase 3: Documentation
- [ ] Update README.md with new workflow
- [ ] Add `.dev/` to `.gitignore` recommendation
- [ ] Create migration guide for existing `dev/active/` users

### Phase 4: Testing
- [ ] Test `/dev-docs` on new feature
- [ ] Test `/thomas-setup` for new project
- [ ] Test hooks with worktree creation
- [ ] Verify `.dev/` excluded from git

---

## Benefits

✅ **Context travels with code** - No separation of docs and implementation
✅ **Auto-cleanup** - Worktree deletion removes dev-docs automatically
✅ **Simpler structure** - One task = One worktree = One `.dev/`
✅ **Professional from day 1** - thomas-setup teaches best practices
✅ **Clean main branch** - Perfect for BSV on-chain deployment
✅ **No manual steps** - Hooks automate `.dev/` creation

---

## Migration Path

Existing projects using `dev/active/` can continue working. New projects and features will use `.dev/` in worktrees.

**Optional migration script** (for those who want to consolidate):
```bash
# For each existing dev-doc
for task in dev/active/*; do
  task_name="${task##*/}"
  worktree_path="../${PWD##*/}-worktrees/feature/${task_name}"

  # If corresponding worktree exists
  if [ -d "$worktree_path" ]; then
    echo "Migrating $task_name to worktree..."
    mv "$task" "$worktree_path/.dev"
    echo "✅ Moved to $worktree_path/.dev"
  fi
done
```

---

## Example Workflows

### Workflow 1: New Feature
```
/dev-docs "implement user authentication"

→ Detects main branch
→ Creates worktree: feature/20250109-user-authentication
→ Creates .dev/plan.md, .dev/context.md, .dev/tasks.md
→ Ready to code!
```

### Workflow 2: New Project
```
/thomas-setup my-bsv-game

→ Creates main repo (empty)
→ Creates worktree: feature/initial-setup
→ Runs setup in worktree
→ Creates .dev/ with setup plan
→ Ready to build!
```

### Workflow 3: Resume After Context Reset
```
"What was I working on?"

→ Reads .dev/context.md
→ Shows progress (5/12 tasks done)
→ Shows next steps
→ Ready to continue!
```

---

## Next Steps

**Ready to implement?**

Say "yes" and I'll:
1. Update all command files
2. Enhance all hook files
3. Update .gitignore
4. Update README.md
5. Create this as your new unified workflow

**OR**

Review this plan first and suggest changes.

---

**This plan preserves backward compatibility while introducing a superior unified workflow.**
