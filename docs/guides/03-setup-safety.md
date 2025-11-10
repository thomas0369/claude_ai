# Thomas-Setup Safety Features

This document explains how `/thomas-setup` safely handles existing projects.

---

## 🛡️ Safety Mechanisms

### 1. **Automatic Project Detection**

Before doing anything, the command:
- Checks if the project directory exists
- Looks for `package.json` to confirm it's an active project
- Analyzes the existing structure

### 2. **Interactive Mode Selection**

When an existing project is detected, you choose:

**Option 1: Migrate**
- Keep all existing code
- Add Claude infrastructure (.claude/, dev/, CLAUDE.md)
- Safest option for active projects

**Option 2: Clean & Reset**
- Complete backup created first
- Clean slate with Thomas setup
- Preserves critical files (.git, .env*, node_modules)

**Option 3: Cancel**
- No changes made
- Exit safely

### 3. **Automatic Backups**

**EVERY existing project gets backed up before ANY changes:**

```bash
# Backup location format:
[project-name].backup-YYYYMMDD-HHMMSS

# Example:
~/projects/my-app.backup-20251109-115500
```

**Backup includes:**
- Complete copy of entire project
- All files, all directories
- Git history preserved
- Can restore anytime

### 4. **Preserved Files (Clean & Reset)**

When cleaning a project, these are ALWAYS kept:

| File/Directory | Why Preserved |
|----------------|---------------|
| `.git/` | Version control history |
| `.env` | Environment variables |
| `.env.local` | Local environment config |
| `.env.production` | Production config |
| `node_modules/` | Installed dependencies |
| `dist/` | Build output |
| `build/` | Build artifacts |

Everything else is removed (but backed up!).

---

## 🔄 Migration Workflow

### What Happens During Migration

1. **Backup Created**
   ```bash
   cp -r /path/to/project /path/to/project.backup-[timestamp]
   ```

2. **Claude Infrastructure Added**
   ```
   project/
   ├── .claude/          # NEW - Links to global infrastructure
   │   ├── skills/       # Symlink to ~/.claude/skills
   │   ├── agents/       # Symlink to ~/.claude/agents
   │   ├── hooks/        # Symlink to ~/.claude/hooks
   │   ├── commands/     # Symlink to ~/.claude/commands
   │   └── memory-bank/  # NEW - Context persistence
   ├── dev/             # NEW - Task documentation
   │   └── active/
   └── CLAUDE.md         # NEW - Architecture doc
   ```

3. **Tech Stack Analysis**
   - Reads `package.json` dependencies
   - Detects framework (React, Vue, etc.)
   - Customizes CLAUDE.md template to match
   - Warns if different from Thomas standard (Preact)

4. **Existing Code Untouched**
   - All your `src/` files remain
   - All your configuration files remain
   - Only adds new directories/files

### Migration Safety Checklist

After migration:
- ✅ Original code preserved
- ✅ Backup available if needed
- ✅ Claude infrastructure added
- ✅ Can test existing app: `npm run dev`
- ✅ Can revert using backup if something breaks

---

## 🧹 Clean & Reset Workflow

### What Happens During Clean & Reset

1. **Warning Confirmation**
   ```
   ⚠️ WARNING: This will clean the project directory!
   A complete backup will be created first.
   Files that will be kept: .git, .env*, node_modules, dist/, build/
   Everything else will be removed.

   Proceed? (yes/no)
   ```

2. **Complete Backup**
   ```bash
   # Full copy before ANY deletion
   cp -r project/ project.backup-[timestamp]/
   ```

3. **Selective Cleanup**
   ```bash
   # Move preserved files to temp location
   mv .git .env* node_modules dist build .temp/

   # Remove everything else
   rm -rf *

   # Restore preserved files
   mv .temp/* ./
   ```

4. **Fresh Thomas Setup**
   - New directory structure
   - Fresh CLAUDE.md
   - Claude infrastructure configured
   - Ready for code restoration from backup

### Clean & Reset Safety Checklist

- ✅ Complete backup before deletion
- ✅ Critical files preserved (.git, .env, node_modules)
- ✅ Can restore entire original project from backup
- ✅ Git history maintained (kept .git/)
- ✅ Environment config maintained (kept .env*)

---

## 🔐 Backup Recovery

### How to Restore from Backup

If something goes wrong, restore is simple:

**Full Restore:**
```bash
# Remove current project
rm -rf ~/projects/my-app

# Restore from backup
cp -r ~/projects/my-app.backup-20251109-115500 ~/projects/my-app
```

**Partial Restore (specific files):**
```bash
# Copy specific file from backup
cp ~/projects/my-app.backup-20251109-115500/src/important.ts \\
   ~/projects/my-app/src/

# Copy entire directory from backup
cp -r ~/projects/my-app.backup-20251109-115500/src/components \\
      ~/projects/my-app/src/
```

**Check What's in Backup:**
```bash
# List backup contents
ls -la ~/projects/my-app.backup-20251109-115500/

# Compare backup with current
diff -r ~/projects/my-app.backup-20251109-115500/ \\
        ~/projects/my-app/
```

### Backup Location

Backups are created in the **same parent directory** as the project:

```
projects/
├── my-app/                    # Current project
└── my-app.backup-20251109-115500/  # Backup
```

**Finding your backups:**
```bash
# List all backups for a project
ls -d ~/projects/my-app.backup-*

# Find most recent backup
ls -dt ~/projects/my-app.backup-* | head -1
```

---

## 📊 Safety Comparison

| Action | Backup Created | Code Preserved | Git History | Env Files | Reversible |
|--------|----------------|----------------|-------------|-----------|------------|
| **New Project** | N/A | N/A | N/A | N/A | N/A |
| **Migrate** | ✅ Yes | ✅ 100% | ✅ Yes | ✅ Yes | ✅ Yes |
| **Clean & Reset** | ✅ Yes | ✅ Critical only | ✅ Yes | ✅ Yes | ✅ Yes |

---

## ⚠️ What Can't Be Undone

**The only permanent action is:**
- Deleting the backup directory manually
- Otherwise, everything is reversible

**Backups are NOT automatically deleted:**
- They remain until you manually delete them
- No expiration or cleanup
- Disk space consideration for large projects

**Managing old backups:**
```bash
# List all backups with sizes
du -sh ~/projects/*.backup-*

# Delete specific old backup
rm -rf ~/projects/my-app.backup-20251101-120000

# Keep only most recent 3 backups
ls -dt ~/projects/my-app.backup-* | tail -n +4 | xargs rm -rf
```

---

## 🎯 Best Practices

### Before Running thomas-setup on Existing Project

1. **Commit your changes:**
   ```bash
   git add .
   git commit -m "Before Thomas setup"
   ```

2. **Push to remote (if applicable):**
   ```bash
   git push origin main
   ```

3. **Make note of critical files:**
   - List any unusual file locations
   - Document custom configurations

### After Running thomas-setup

1. **Test immediately:**
   ```bash
   npm run dev  # or your start command
   ```

2. **Review CLAUDE.md:**
   - Check tech stack matches
   - Customize for your specific patterns
   - Update any incorrect information

3. **Keep backup for a while:**
   - Don't delete immediately
   - Wait until confident everything works
   - Can delete after thorough testing

### If Something Breaks

1. **Don't panic - you have a backup!**
2. **Check what changed:**
   ```bash
   git status
   git diff
   ```
3. **Restore from backup if needed:**
   ```bash
   cp -r project.backup-[timestamp]/* project/
   ```
4. **Report issue** so it can be fixed

---

## 🛠️ Troubleshooting

### "Backup taking too long"
- **Large `node_modules/`**: Exclude from backup if needed
- **Solution**: Delete `node_modules/` first, backup, then `npm install`

### "Not enough disk space for backup"
- **Clean build artifacts**: Delete `dist/`, `build/` folders first
- **Compress backup**: Use `tar czf backup.tar.gz project/`

### "Accidentally deleted backup"
- **Check Git**: If pushed to remote, can reclone
- **Check trash**: Some systems have recovery
- **Prevention**: Push to Git before running setup

### "Migration broke my project"
- **Restore from backup** immediately
- **Check what was added** (should only be .claude/, dev/, CLAUDE.md)
- **Report the issue** with project structure details

---

## 📋 Summary

**thomas-setup is designed to be SAFE:**

✅ Always detects existing projects
✅ Always asks for confirmation
✅ Always creates backups first
✅ Never deletes without warning
✅ Preserves critical files (.git, .env)
✅ Everything is reversible
✅ Git history maintained
✅ Existing code protected (Migrate mode)

**The worst case scenario:**
- You run Clean & Reset
- Something breaks
- **Solution**: Copy from backup (created automatically)

**You're protected!**

---

**Last Updated:** 2025-11-09
**Version:** 1.0
