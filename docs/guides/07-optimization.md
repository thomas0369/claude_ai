# Claude Code Optimization Guide

**Complete guide to optimizing your Claude Code setup for maximum performance**

Last Updated: 2025-11-10

---

## Overview

This guide covers optimization of three key areas:
1. **settings.json** - Core Claude Code configuration
2. **.claude.json** - User data and project history
3. **File structure** - Organizing your .claude directory

---

## 1. Optimal settings.json Configuration

### Recommended Settings

Your `~/.claude/settings.json` should include these performance optimizations:

```json
{
  "alwaysThinkingEnabled": true,
  "spinnerTipsEnabled": false,
  "env": {
    "BASH_DEFAULT_TIMEOUT_MS": "1800000",
    "BASH_MAX_TIMEOUT_MS": "7200000"
  },
  "permissions": {
    "allow": [
      "Read",
      "Write(src/**)",
      "Bash(git:*)",
      "Bash(npm:*)",
      "Bash(npx:*)"
    ],
    "deny": [
      "Read(.env*)",
      "Read(secrets/**)",
      "Write(.env*)"
    ]
  }
}
```

### Key Settings Explained

**Performance:**
- `alwaysThinkingEnabled: true` - Enables extended reasoning mode by default for better results
- `spinnerTipsEnabled: false` - Disables tips for cleaner interface
- `BASH_DEFAULT_TIMEOUT_MS: 1800000` - 30-minute default timeout (vs 2-minute default)
- `BASH_MAX_TIMEOUT_MS: 7200000` - 2-hour maximum timeout

**Security:**
- Permission rules reduce interruptions while protecting sensitive files
- Deny patterns prevent accidental exposure of credentials

### Additional Recommended Settings

```json
{
  "cleanupPeriodDays": 30,
  "includeCoAuthoredBy": true,
  "model": "claude-sonnet-4-20250514",
  "maxTokens": 4096
}
```

---

## 2. .claude.json Optimization

### The Problem

The `.claude.json` file can grow to over 1MB due to:
- Command history (574+ entries across projects)
- Cached changelog data (~30 KB)
- Stale project references
- Empty MCP server configurations

**Impact:**
- Slower Claude Code startup
- Increased memory usage
- Delayed project switching

### The Solution: Optimization Script

We've created an automated script that safely optimizes your `.claude.json` file.

**Location:** `~/.claude/scripts/optimize-claude-json.sh`

### Using the Optimization Script

**Interactive Mode (Recommended):**
```bash
~/.claude/scripts/optimize-claude-json.sh
```

This will:
- Show current file statistics
- Ask for confirmation
- Display progress as optimizations run
- Show final statistics and savings
- Create automatic backup

**Non-Interactive Mode:**
```bash
~/.claude/scripts/optimize-claude-json.sh --yes
```

Skips confirmation prompt (useful for automation).

**List Backups:**
```bash
~/.claude/scripts/optimize-claude-json.sh --list-backups
```

### What Gets Optimized

1. **Project History** (95% of file size)
   - Clears command history from all projects
   - Preserves project settings and configurations
   - Typical savings: 975 KB

2. **Stale Projects** (varies)
   - Removes references to deleted/non-existent directories
   - Example: `/tmp/test`, `/tmp/bess`, old project paths

3. **Cached Data** (~30 KB)
   - Removes cached changelog (re-fetched as needed)
   - Clears temporary cache data

4. **Empty MCP Configs** (small)
   - Removes empty MCP server configuration objects
   - Cleans up orphaned configurations

### Expected Results

**Before Optimization:**
- File size: 1,000-1,020 KB
- Lines: 3,000+
- Projects: 15-20
- History entries: 500-600

**After Optimization:**
- File size: 12-50 KB
- Lines: 300-500
- Projects: 10-15 (active only)
- History entries: 0

**Space Saved:** 95-98% file size reduction

### Backups

All backups are stored in `~/.claude/backups/` with timestamp format:
```
claude.json.YYYYMMDD_HHMMSS.backup
```

**Restore from backup:**
```bash
# Restore specific backup
cp ~/.claude/backups/claude.json.20251110_000859.backup ~/.claude.json

# Or restore most recent
cp $(ls -t ~/.claude/backups/claude.json.*.backup | head -1) ~/.claude.json
```

### Maintenance Schedule

Run the optimization script:
- **Monthly** - For regular maintenance
- **After major projects** - When finishing large features
- **When file exceeds 500 KB** - Check size: `du -h ~/.claude.json`
- **Before updates** - Clean up before major Claude Code versions

---

## 3. File Structure Optimization

### Clean Directory Structure

```
~/.claude/
├── agents/              # Specialized agents (45 files)
├── backups/             # .claude.json backups (keep 5 most recent)
├── commands/            # Slash commands (28 files)
├── hooks/               # Automation hooks (5 active)
├── memory-bank/         # Long-term project memory
├── plugins/             # Claude Code plugins
├── scripts/             # Utility scripts
│   ├── optimize-claude-json.sh
│   └── README-optimize.md
├── skills/              # Progressive disclosure skills (5 active)
├── settings.json        # Main settings (version controlled)
├── settings.local.json  # Local overrides (gitignored)
└── README.md            # This repository's documentation
```

### Cleanup Recommendations

**Regular Cleanup (Monthly):**
```bash
# Clean old backups (keep 10 most recent)
cd ~/.claude/backups
ls -t claude.json.*.backup | tail -n +11 | xargs rm -f

# Clean old todo files (if not using)
rm -rf ~/.claude/todos/*.json

# Clean shell snapshots (recreated as needed)
rm -f ~/.claude/shell-snapshots/*.sh
```

**Deep Cleanup (Quarterly):**
```bash
# Review and remove unused agents
ls -la ~/.claude/agents/

# Review and remove unused skills
ls -la ~/.claude/skills/

# Review and remove unused commands
ls -la ~/.claude/commands/
```

### Gitignore Optimization

Your `.gitignore` should include:

```gitignore
# User data
.claude.json
settings.local.json
.credentials.json

# Temporary files
shell-snapshots/
todos/
debug/
file-history/
statsig/

# Backups (optional - can commit for safety)
backups/*.backup

# Logs
logs/
*.log

# Projects data
projects/

# MCP plugins state
plugins/
```

---

## 4. Performance Tips

### Token Optimization

1. **Use /context command** - Monitor token usage
2. **Optimize CLAUDE.md** - Keep project docs concise
3. **Disable unused MCP servers** - Each adds to system prompt
4. **Use progressive disclosure** - Skills ≤500 lines, details in resources/

### Context Management

1. **Context editing** - Auto-clears stale tool results
2. **Compact when needed** - Use `/compact` before hitting limits
3. **Clean slate for new features** - Start fresh sessions for major work

### Model Selection

1. **Sonnet 4** - Main development work (balanced)
2. **Haiku 4** - Fast tasks, simple operations
3. **Opus 4** - Critical/complex tasks only

---

## 5. Monitoring & Metrics

### Check File Sizes

```bash
# Check .claude.json size
du -h ~/.claude.json

# Check total .claude directory size
du -sh ~/.claude

# List largest files
du -ah ~/.claude | sort -rh | head -20
```

### Performance Indicators

**Good Performance:**
- .claude.json < 100 KB
- Startup time < 2 seconds
- Project switching instant
- No lag during typing

**Needs Optimization:**
- .claude.json > 500 KB
- Startup time > 5 seconds
- Project switching delayed
- Lag during tool execution

---

## 6. Troubleshooting

### Issue: Claude Code Slow Startup

**Solution:**
1. Run optimization script
2. Check file sizes
3. Disable unused MCP servers
4. Review hook execution time

### Issue: High Memory Usage

**Solution:**
1. Optimize .claude.json
2. Clean up old backups
3. Remove unused agents/skills
4. Reduce context window usage

### Issue: Tool Execution Lag

**Solution:**
1. Increase bash timeouts in settings.json
2. Review hook configurations
3. Check network connectivity
4. Verify MCP server health

---

## 7. Advanced Optimization

### Custom Optimization Script

You can customize the optimization script for your needs:

**Location:** `~/.claude/scripts/optimize-claude-json.sh`

**Modifications:**
- Adjust what gets cleaned
- Change backup retention
- Add project-specific rules
- Customize validation

### Automated Optimization

Add to cron for monthly cleanup:

```bash
# Edit crontab
crontab -e

# Add monthly optimization (1st of month, 2am)
0 2 1 * * ~/.claude/scripts/optimize-claude-json.sh --yes
```

### Pre-Commit Optimization

Add to git hooks for automatic cleanup:

```bash
# .git/hooks/pre-commit
#!/bin/bash
~/.claude/scripts/optimize-claude-json.sh --yes
```

---

## 8. Best Practices

### DO:
- ✅ Run optimization monthly
- ✅ Keep backups of .claude.json
- ✅ Monitor file sizes regularly
- ✅ Use settings.local.json for personal preferences
- ✅ Clean up old todos and snapshots
- ✅ Review and remove unused components

### DON'T:
- ❌ Commit settings.local.json
- ❌ Skip backups before manual edits
- ❌ Let .claude.json exceed 500 KB
- ❌ Keep all backups forever (10 most recent is enough)
- ❌ Disable safety features for speed

---

## 9. Migration Guide

### From Unoptimized Setup

If you have an old .claude directory without these optimizations:

1. **Backup everything:**
```bash
cp -r ~/.claude ~/.claude.backup-$(date +%Y%m%d)
```

2. **Run optimization:**
```bash
~/.claude/scripts/optimize-claude-json.sh
```

3. **Update settings.json:**
```bash
# Merge recommended settings from this guide
```

4. **Clean up structure:**
```bash
# Remove old todos, snapshots
rm -rf ~/.claude/todos/*.json
rm -f ~/.claude/shell-snapshots/*.sh
```

5. **Test:**
```bash
# Restart Claude Code
# Verify faster startup
# Check commands still work
```

### From settings.json v1 to v2

If you have old settings format:

1. Read current settings:
```bash
cat ~/.claude/settings.json
```

2. Merge with recommended:
```json
{
  "alwaysThinkingEnabled": true,
  "spinnerTipsEnabled": false,
  "env": {
    "BASH_DEFAULT_TIMEOUT_MS": "1800000",
    "BASH_MAX_TIMEOUT_MS": "7200000"
  },
  // ... your existing settings
}
```

3. Test changes work

---

## 10. Optimization Checklist

### Monthly Maintenance

- [ ] Run `optimize-claude-json.sh`
- [ ] Clean old backups (keep 10)
- [ ] Review file sizes
- [ ] Remove unused agents/skills/commands
- [ ] Check hook execution times
- [ ] Update documentation

### Quarterly Review

- [ ] Deep clean unused components
- [ ] Review MCP server configurations
- [ ] Update .gitignore patterns
- [ ] Verify all scripts executable
- [ ] Test restore from backup
- [ ] Update settings.json with new features

### Before Major Updates

- [ ] Full backup of .claude directory
- [ ] Run optimization
- [ ] Document current configuration
- [ ] Test in separate environment
- [ ] Have rollback plan ready

---

## Resources

**Scripts:**
- `~/.claude/scripts/optimize-claude-json.sh` - Main optimization script
- `~/.claude/scripts/README-optimize.md` - Script documentation

**Documentation:**
- README.md - Main repository documentation
- This file (OPTIMIZATION-GUIDE.md) - Optimization guide

**Official Docs:**
- [Claude Code Settings](https://code.claude.com/docs/en/settings)
- [Claude Code Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices)

---

## Support

If you encounter issues:
1. Check `.claude.json` is valid JSON: `jq empty ~/.claude.json`
2. Review backup files in `~/.claude/backups/`
3. Restore from backup if needed
4. Open an issue on GitHub

---

**Built with ❤️ for optimal Claude Code performance**

**Last Updated:** 2025-11-10
