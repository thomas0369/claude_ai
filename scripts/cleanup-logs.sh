#!/bin/bash
# Auto-cleanup old Claude Code logs (cron job)

LOG_DIR="$HOME/.claude/logs"
DAYS_TO_KEEP=7

# Ensure log directory exists
mkdir -p "$LOG_DIR"

# Cleanup logs older than retention period
find "$LOG_DIR" -type f -name "*.jsonl" -mtime +$DAYS_TO_KEEP -delete
find "$LOG_DIR" -type f -name "*.log" -mtime +$DAYS_TO_KEEP -delete

# Cleanup temp files from /thomas-fix
find /tmp -type f -name "thomas-fix-*.png" -mtime +2 -delete 2>/dev/null
find /tmp -type f -name "thomas-fix-*.json" -mtime +2 -delete 2>/dev/null
find /tmp -type f -name "thomas-fix-*.log" -mtime +2 -delete 2>/dev/null

# Log cleanup action
echo "$(date -Iseconds): Cleaned logs older than $DAYS_TO_KEEP days" >> "$LOG_DIR/cleanup.log"
