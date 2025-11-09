# Claude.json Optimization Script

A safe and comprehensive script to optimize your `~/.claude.json` file by removing bloat while preserving essential configurations.

## What It Does

The script performs the following optimizations:

1. **Clears Project History** - Removes command history from all projects (typically saves 95% of file size)
2. **Removes Stale Projects** - Deletes references to non-existent project directories
3. **Clears Cached Data** - Removes cached changelog data (re-fetched as needed)
4. **Cleans Empty MCP Configs** - Removes empty MCP server configuration objects

## Features

- Automatic backup before any changes
- JSON validation at each step
- Detailed progress reporting with color-coded output
- File size comparison (before/after)
- Rollback capability via backups
- Safety checks and confirmations

## Installation

The script is located at:
```
~/.claude/scripts/optimize-claude-json.sh
```

It's already executable and ready to use.

## Usage

### Interactive Mode (Recommended)
```bash
~/.claude/scripts/optimize-claude-json.sh
```

This will:
- Show current file statistics
- Ask for confirmation before proceeding
- Display progress as optimizations run
- Show final statistics and savings

### Non-Interactive Mode
```bash
~/.claude/scripts/optimize-claude-json.sh --yes
# or
~/.claude/scripts/optimize-claude-json.sh -y
```

Skips the confirmation prompt. Useful for automation.

### List Backups
```bash
~/.claude/scripts/optimize-claude-json.sh --list-backups
# or
~/.claude/scripts/optimize-claude-json.sh -l
```

Shows all available backup files.

### Get Help
```bash
~/.claude/scripts/optimize-claude-json.sh --help
# or
~/.claude/scripts/optimize-claude-json.sh -h
```

## Expected Results

### Before Optimization
- File size: ~1,020 KB
- Lines: ~3,045
- Contains 574 history entries
- Contains cached changelog (~30 KB)

### After Optimization
- File size: ~40-50 KB
- Lines: ~200-300
- History cleared
- No cached data
- No stale project references

**Expected Savings**: 95-98% file size reduction

## Backups

### Backup Location
All backups are stored in:
```
~/.claude/backups/
```

### Backup Format
```
claude.json.YYYYMMDD_HHMMSS.backup
```

Example: `claude.json.20251109_143022.backup`

### Restore from Backup
If you need to restore from a backup:

```bash
# List available backups
ls -lh ~/.claude/backups/

# Restore specific backup
cp ~/.claude/backups/claude.json.20251109_143022.backup ~/.claude.json

# Or restore the most recent backup
cp $(ls -t ~/.claude/backups/claude.json.*.backup | head -1) ~/.claude.json
```

## Safety Features

1. **Automatic Backup** - Creates timestamped backup before any changes
2. **JSON Validation** - Validates JSON structure after each operation
3. **Rollback on Error** - Stops immediately if any operation fails
4. **Confirmation Prompt** - Asks for confirmation before proceeding (unless --yes flag used)
5. **Dependency Check** - Verifies `jq` is installed before running

## Requirements

- `jq` - JSON processor
- `bash` - Bourne Again Shell

### Installing jq

**Ubuntu/Debian:**
```bash
sudo apt-get install jq
```

**macOS:**
```bash
brew install jq
```

## Recommended Schedule

Run this script:
- **Monthly** - For regular maintenance
- **After large projects** - When you've finished working on major projects
- **When file exceeds 500KB** - Check size with: `du -h ~/.claude.json`
- **Before Claude Code updates** - Clean up before major version updates

## Troubleshooting

### Script won't run
```bash
# Make sure it's executable
chmod +x ~/.claude/scripts/optimize-claude-json.sh
```

### jq not found
```bash
# Install jq first
sudo apt-get install jq  # Ubuntu/Debian
brew install jq          # macOS
```

### Script fails mid-execution
The original file remains unchanged if any validation fails. Check the error message and ensure your `.claude.json` is valid JSON.

### Want to undo optimization
```bash
# Restore from the most recent backup
cp $(ls -t ~/.claude/backups/claude.json.*.backup | head -1) ~/.claude.json
```

## What's Preserved

The script preserves all essential configuration:
- Project allowedTools settings
- MCP server configurations
- User preferences (theme, editor mode, etc.)
- Tips history
- Statsig gates and dynamic configs
- OAuth account info
- Project-specific settings

## What's Removed

- Command history for all projects
- Cached changelog data
- References to deleted/non-existent projects
- Empty MCP server configuration objects

## Performance Impact

After optimization, you should notice:
- Faster Claude Code startup
- Quicker project switching
- Reduced memory usage
- Faster file reads/writes

## Example Output

```
================================================
  Claude.json Optimization Script
================================================

ℹ Current file statistics:
  File size: 1020KB
  Lines: 3045
  Projects: 17
  Total history entries: 574

This will optimize your .claude.json file.
The following operations will be performed:
  1. Clear all project history data
  2. Remove stale project references
  3. Clear cached changelog data
  4. Clean up empty MCP server configurations

Continue? (y/N): y

ℹ Creating backup...
✓ Backup created: /home/thoma/.claude/backups/claude.json.20251109_143022.backup

ℹ Starting optimization...

ℹ Clearing project history data...
✓ Project history cleared
ℹ Checking for stale project references...
⚠ Found stale project: /tmp/test
⚠ Found stale project: /tmp/bess
✓ Removed 2 stale project(s)
ℹ Clearing cached changelog data...
✓ Cached data cleared
ℹ Cleaning up empty MCP server configurations...
✓ Empty MCP configurations cleaned

ℹ Optimization complete! Final statistics:
  File size: 42KB
  Lines: 287
  Projects: 15

✓ Space saved: 978KB (95% reduction)

ℹ Backup file location: /home/thoma/.claude/backups/claude.json.20251109_143022.backup
ℹ To restore from backup, run:
  cp /home/thoma/.claude/backups/claude.json.20251109_143022.backup /home/thoma/.claude.json

✓ All optimizations completed successfully!
```

## Additional Notes

- This script is safe to run multiple times
- Subsequent runs will have minimal effect after the first optimization
- Your command history in active Claude Code sessions is not affected
- The script only modifies `~/.claude.json`, not project-specific `.claude/settings.json` files

## Support

If you encounter issues:
1. Check that `~/.claude.json` is valid JSON: `jq empty ~/.claude.json`
2. Review backup files in `~/.claude/backups/`
3. Restore from backup if needed
4. Ensure you have write permissions to `~/.claude/` directory

## Version

Script version: 1.0
Created: 2025-11-09
