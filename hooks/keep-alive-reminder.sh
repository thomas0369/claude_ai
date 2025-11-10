#!/bin/bash

# Keep-Alive Reminder Hook
# Prevents Claude Code timeout by reminding about inactivity
# Runs on UserPromptSubmit to check time since last interaction

TIMESTAMP_FILE="$HOME/.claude/.last-interaction-timestamp"
TIMEOUT_MINUTES=10  # Warn after this many minutes of inactivity

# Get current timestamp
CURRENT_TIME=$(date +%s)

# Check if timestamp file exists
if [ -f "$TIMESTAMP_FILE" ]; then
    LAST_TIME=$(cat "$TIMESTAMP_FILE")
    TIME_DIFF=$((CURRENT_TIME - LAST_TIME))
    MINUTES_ELAPSED=$((TIME_DIFF / 60))

    if [ $MINUTES_ELAPSED -ge $TIMEOUT_MINUTES ]; then
        echo ""
        echo "⏰ INACTIVITY NOTICE: ${MINUTES_ELAPSED} minutes since last interaction"
        echo "💡 TIP: If Claude appears idle, send a simple prompt like 'continue' or 'status'"
        echo ""
    fi
fi

# Update timestamp for this interaction
echo "$CURRENT_TIME" > "$TIMESTAMP_FILE"

exit 0
