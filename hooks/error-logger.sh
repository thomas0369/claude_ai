#!/bin/bash
# Central error logging system for all Claude Code hooks
# Logs all errors to a structured log file with timestamps and context

set -e

# Configuration
LOG_DIR="/home/thoma/.claude/logs"
ERROR_LOG="$LOG_DIR/errors.jsonl"
HOOK_LOG="$LOG_DIR/hooks.log"
PERFORMANCE_LOG="$LOG_DIR/performance.jsonl"

# Create log directory
mkdir -p "$LOG_DIR"

# Function to log errors in JSONL format
log_error() {
    local error_type="$1"
    local error_message="$2"
    local context="${3:-}"
    local severity="${4:-ERROR}"

    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    local unix_time=$(date +%s)

    # Create JSONL entry
    cat >> "$ERROR_LOG" <<EOF
{"timestamp":"$timestamp","unix_time":$unix_time,"type":"$error_type","severity":"$severity","message":"$error_message","context":"$context","session_id":"${CLAUDE_SESSION_ID:-unknown}"}
EOF
}

# Function to log hook execution
log_hook_execution() {
    local hook_name="$1"
    local hook_type="$2"
    local start_time="$3"
    local end_time="$4"
    local exit_code="$5"
    local error_msg="${6:-}"

    local duration=$((end_time - start_time))
    local status="success"

    if [ "$exit_code" -ne 0 ]; then
        status="failed"
    fi

    # Log to performance log
    cat >> "$PERFORMANCE_LOG" <<EOF
{"timestamp":"$(date -u +"%Y-%m-%dT%H:%M:%SZ")","hook":"$hook_name","type":"$hook_type","duration_ms":$duration,"status":"$status","exit_code":$exit_code,"error":"$error_msg"}
EOF

    # Also log to simple hook log for debugging
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $hook_type/$hook_name - ${status} (${duration}ms) - Exit: $exit_code${error_msg:+ - Error: $error_msg}" >> "$HOOK_LOG"
}

# Function to wrap hook execution with error tracking
wrap_hook() {
    local hook_script="$1"
    local hook_name="$(basename "$hook_script" .sh)"
    local hook_type="${2:-unknown}"

    local start_time=$(date +%s%3N)
    local exit_code=0
    local error_output=""

    # Execute hook and capture output
    if error_output=$("$hook_script" 2>&1); then
        exit_code=0
    else
        exit_code=$?

        # Log the error
        log_error "hook_failure" "Hook $hook_name failed with exit code $exit_code" "$error_output" "ERROR"
    fi

    local end_time=$(date +%s%3N)

    # Log hook execution
    log_hook_execution "$hook_name" "$hook_type" "$start_time" "$end_time" "$exit_code" "$error_output"

    return $exit_code
}

# Function to get error statistics
get_error_stats() {
    local since_hours="${1:-24}"
    local since_timestamp=$(($(date +%s) - since_hours * 3600))

    echo "=== Error Statistics (Last ${since_hours}h) ==="

    if [ ! -f "$ERROR_LOG" ]; then
        echo "No errors logged yet"
        return
    fi

    # Count errors by type
    echo -e "\nErrors by Type:"
    jq -r "select(.unix_time > $since_timestamp) | .type" "$ERROR_LOG" 2>/dev/null | sort | uniq -c | sort -rn || echo "No errors"

    # Count errors by severity
    echo -e "\nErrors by Severity:"
    jq -r "select(.unix_time > $since_timestamp) | .severity" "$ERROR_LOG" 2>/dev/null | sort | uniq -c | sort -rn || echo "No errors"

    # Show recent errors
    echo -e "\nRecent Errors (Last 5):"
    jq -r "select(.unix_time > $since_timestamp) | [.timestamp, .severity, .type, .message] | @tsv" "$ERROR_LOG" 2>/dev/null | tail -5 || echo "No errors"
}

# Function to get hook performance stats
get_hook_stats() {
    local since_hours="${1:-24}"
    local since_timestamp=$(date -d "${since_hours} hours ago" +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || date -u +"%Y-%m-%dT%H:%M:%SZ")

    echo "=== Hook Performance Statistics (Last ${since_hours}h) ==="

    if [ ! -f "$PERFORMANCE_LOG" ]; then
        echo "No hook executions logged yet"
        return
    fi

    # Average duration by hook
    echo -e "\nAverage Duration by Hook:"
    jq -r "select(.timestamp > \"$since_timestamp\") | [.hook, .duration_ms] | @tsv" "$PERFORMANCE_LOG" 2>/dev/null | \
        awk '{sum[$1]+=$2; count[$1]++} END {for (hook in sum) printf "  %s: %.0fms (n=%d)\n", hook, sum[hook]/count[hook], count[hook]}' | \
        sort -t: -k2 -rn || echo "No data"

    # Failure rate by hook
    echo -e "\nFailure Rate by Hook:"
    jq -r "select(.timestamp > \"$since_timestamp\") | [.hook, .status] | @tsv" "$PERFORMANCE_LOG" 2>/dev/null | \
        awk '{total[$1]++; if($2=="failed") failed[$1]++} END {for (hook in total) printf "  %s: %.1f%% (%d/%d)\n", hook, (failed[hook]/total[hook])*100, failed[hook], total[hook]}' | \
        sort -t: -k2 -rn || echo "No failures"

    # Slowest hook executions
    echo -e "\nSlowest Hook Executions (Top 5):"
    jq -r "select(.timestamp > \"$since_timestamp\") | [.hook, .duration_ms, .timestamp] | @tsv" "$PERFORMANCE_LOG" 2>/dev/null | \
        sort -k2 -rn | head -5 | awk '{printf "  %s: %dms at %s\n", $1, $2, $3}' || echo "No data"
}

# Function to cleanup old logs
cleanup_old_logs() {
    local days="${1:-7}"
    local cutoff_timestamp=$(($(date +%s) - days * 86400))

    echo "Cleaning up logs older than $days days..."

    # Cleanup error log
    if [ -f "$ERROR_LOG" ]; then
        local before=$(wc -l < "$ERROR_LOG")
        jq -c "select(.unix_time > $cutoff_timestamp)" "$ERROR_LOG" > "$ERROR_LOG.tmp" 2>/dev/null || true
        mv "$ERROR_LOG.tmp" "$ERROR_LOG" 2>/dev/null || true
        local after=$(wc -l < "$ERROR_LOG")
        echo "  Removed $((before - after)) old error entries"
    fi

    # Cleanup performance log
    if [ -f "$PERFORMANCE_LOG" ]; then
        local cutoff_date=$(date -d "$days days ago" +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || date -u +"%Y-%m-%dT%H:%M:%SZ")
        local before=$(wc -l < "$PERFORMANCE_LOG")
        jq -c "select(.timestamp > \"$cutoff_date\")" "$PERFORMANCE_LOG" > "$PERFORMANCE_LOG.tmp" 2>/dev/null || true
        mv "$PERFORMANCE_LOG.tmp" "$PERFORMANCE_LOG" 2>/dev/null || true
        local after=$(wc -l < "$PERFORMANCE_LOG")
        echo "  Removed $((before - after)) old performance entries"
    fi

    # Cleanup hook log (keep last 10000 lines)
    if [ -f "$HOOK_LOG" ]; then
        local before=$(wc -l < "$HOOK_LOG")
        tail -10000 "$HOOK_LOG" > "$HOOK_LOG.tmp"
        mv "$HOOK_LOG.tmp" "$HOOK_LOG"
        local after=$(wc -l < "$HOOK_LOG")
        echo "  Trimmed hook log from $before to $after lines"
    fi
}

# Main command handling
case "${1:-}" in
    log-error)
        log_error "$2" "$3" "${4:-}" "${5:-ERROR}"
        ;;
    wrap)
        wrap_hook "$2" "${3:-unknown}"
        ;;
    stats)
        get_error_stats "${2:-24}"
        echo ""
        get_hook_stats "${2:-24}"
        ;;
    cleanup)
        cleanup_old_logs "${2:-7}"
        ;;
    *)
        echo "Usage: $0 {log-error|wrap|stats|cleanup}"
        echo ""
        echo "Commands:"
        echo "  log-error <type> <message> [context] [severity]"
        echo "  wrap <hook_script> [hook_type]"
        echo "  stats [hours]"
        echo "  cleanup [days]"
        exit 1
        ;;
esac
