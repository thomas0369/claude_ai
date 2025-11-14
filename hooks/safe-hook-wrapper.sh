#!/bin/bash
# Safe hook wrapper that prevents blocking errors and logs everything
# Usage: safe-hook-wrapper.sh <hook-command>

set +e  # Don't exit on error - we want to log it

# Load error logger
ERROR_LOGGER="/home/thoma/.claude/hooks/error-logger.sh"

# Get hook command from arguments
HOOK_COMMAND="$*"
HOOK_NAME=$(echo "$HOOK_COMMAND" | awk '{print $NF}')

# Timeout configuration (prevent hanging hooks)
HOOK_TIMEOUT=5  # 5 seconds max per hook

# Execute hook with timeout and error handling
execute_hook_safely() {
    local start_time=$(date +%s%3N)
    local exit_code=0
    local output=""
    local error_msg=""

    # Run hook with timeout
    if output=$(timeout "$HOOK_TIMEOUT" bash -c "$HOOK_COMMAND" 2>&1); then
        exit_code=0
    else
        exit_code=$?

        # Check if it was a timeout
        if [ $exit_code -eq 124 ]; then
            error_msg="Hook timed out after ${HOOK_TIMEOUT}s"
            "$ERROR_LOGGER" log-error "hook_timeout" "$error_msg" "$HOOK_NAME" "WARNING"
        else
            error_msg="Hook failed with exit code $exit_code: $output"
            "$ERROR_LOGGER" log-error "hook_failure" "$error_msg" "$HOOK_NAME" "ERROR"
        fi
    fi

    local end_time=$(date +%s%3N)
    local duration=$((end_time - start_time))

    # Log performance
    echo "{\"timestamp\":\"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\",\"hook\":\"$HOOK_NAME\",\"type\":\"wrapped\",\"duration_ms\":$duration,\"status\":\"$([ $exit_code -eq 0 ] && echo "success" || echo "failed")\",\"exit_code\":$exit_code,\"error\":\"$error_msg\"}" >> /home/thoma/.claude/logs/performance.jsonl

    # Always return 0 to prevent blocking (hooks should never block the user)
    # But output the error message for visibility
    if [ $exit_code -ne 0 ]; then
        echo "⚠️  Hook warning: $HOOK_NAME failed (non-blocking)" >&2
        # Log to simple text log for easy debugging
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: $HOOK_NAME failed - $error_msg" >> /home/thoma/.claude/logs/hooks.log
    fi

    return 0  # Always succeed to prevent blocking
}

# Create logs directory
mkdir -p /home/thoma/.claude/logs

# Execute the hook
execute_hook_safely

# Always exit 0 (non-blocking)
exit 0
