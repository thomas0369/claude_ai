#!/bin/bash

# Auto-Start Keep-Alive Hook
# Automatically starts keep-alive process on first user prompt if not running
# Runs on UserPromptSubmit event

PID_FILE="$HOME/.claude/.keep-alive.pid"
MANAGER_SCRIPT="$HOME/.claude/scripts/keep-alive-manager.sh"

# Check if keep-alive is already running
if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if kill -0 "$PID" 2>/dev/null; then
        # Already running, exit silently
        exit 0
    fi
fi

# Not running, start it automatically
if [ -x "$MANAGER_SCRIPT" ]; then
    echo ""
    echo "🚀 Auto-starting keep-alive system to prevent timeout..."
    "$MANAGER_SCRIPT" start
    echo ""
fi

exit 0
