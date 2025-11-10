#!/bin/bash

# Keep Claude Code Active - Background Process
# Prevents timeout by creating subtle activity

INTERVAL_SECONDS=300  # 5 minutes
LOG_FILE="$HOME/.claude/logs/keep-alive.log"
PID_FILE="$HOME/.claude/.keep-alive.pid"

# Create logs directory if it doesn't exist
mkdir -p "$HOME/.claude/logs"

# Function to log messages
log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

# Check if already running
if [ -f "$PID_FILE" ]; then
    OLD_PID=$(cat "$PID_FILE")
    if kill -0 "$OLD_PID" 2>/dev/null; then
        echo "❌ Keep-alive process already running (PID: $OLD_PID)"
        echo "   Stop it with: kill $OLD_PID"
        exit 1
    fi
fi

# Save current PID
echo $$ > "$PID_FILE"

log_message "Keep-alive process started (PID: $$)"
echo "✅ Keep-alive process started (PID: $$)"
echo "   Interval: ${INTERVAL_SECONDS}s ($(($INTERVAL_SECONDS / 60)) minutes)"
echo "   Log: $LOG_FILE"
echo "   Stop with: kill $$"
echo ""

# Main loop
while true; do
    # Update timestamp file (used by other hooks)
    echo "$(date +%s)" > "$HOME/.claude/.last-interaction-timestamp"

    # Create a subtle activity marker
    # This doesn't spam but shows the process is alive
    log_message "Heartbeat - Claude Code session active"

    # Sleep for the interval
    sleep $INTERVAL_SECONDS
done
