#!/bin/bash

# Auto-Stop Keep-Alive Hook
# Automatically stops keep-alive process when Claude Code session ends
# Runs on Stop event

PID_FILE="$HOME/.claude/.keep-alive.pid"
MANAGER_SCRIPT="$HOME/.claude/scripts/keep-alive-manager.sh"

# Check if keep-alive is running
if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if kill -0 "$PID" 2>/dev/null; then
        echo ""
        echo "🛑 Stopping keep-alive process (session ending)..."
        "$MANAGER_SCRIPT" stop 2>/dev/null
        echo ""
    fi
fi

exit 0
