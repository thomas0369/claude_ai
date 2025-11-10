#!/bin/bash

# Keep-Alive Manager
# Easy start/stop/status for the keep-alive process

SCRIPT_DIR="$HOME/.claude/scripts"
PID_FILE="$HOME/.claude/.keep-alive.pid"
LOG_FILE="$HOME/.claude/logs/keep-alive.log"

show_usage() {
    echo "Keep-Alive Manager - Prevent Claude Code timeout"
    echo ""
    echo "Usage: $0 {start|stop|status|logs|restart}"
    echo ""
    echo "Commands:"
    echo "  start    - Start keep-alive process in background"
    echo "  stop     - Stop keep-alive process"
    echo "  status   - Show current status"
    echo "  logs     - Show recent log entries"
    echo "  restart  - Restart keep-alive process"
    echo ""
    echo "Configuration:"
    echo "  Interval: 5 minutes (edit keep-claude-active.sh to change)"
    echo "  Log: $LOG_FILE"
}

start_keepalive() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if kill -0 "$PID" 2>/dev/null; then
            echo "❌ Keep-alive already running (PID: $PID)"
            return 1
        fi
    fi

    echo "🚀 Starting keep-alive process..."
    nohup "$SCRIPT_DIR/keep-claude-active.sh" > /dev/null 2>&1 &
    sleep 1

    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        echo "✅ Keep-alive started (PID: $PID)"
        echo "   Stop with: $0 stop"
    else
        echo "❌ Failed to start keep-alive"
    fi
}

stop_keepalive() {
    if [ ! -f "$PID_FILE" ]; then
        echo "⚠️  Keep-alive not running"
        return 1
    fi

    PID=$(cat "$PID_FILE")
    if ! kill -0 "$PID" 2>/dev/null; then
        echo "⚠️  Keep-alive process not found (stale PID file)"
        rm "$PID_FILE"
        return 1
    fi

    echo "🛑 Stopping keep-alive process (PID: $PID)..."
    kill "$PID"
    rm "$PID_FILE"
    echo "✅ Keep-alive stopped"
}

show_status() {
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Keep-Alive Status"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""

    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if kill -0 "$PID" 2>/dev/null; then
            echo "Status: ✅ RUNNING"
            echo "PID: $PID"

            # Show process info
            if [ -f "/proc/$PID/stat" ]; then
                START_TIME=$(ps -p "$PID" -o lstart= 2>/dev/null)
                echo "Started: $START_TIME"
            fi

            # Show last heartbeat
            if [ -f "$LOG_FILE" ]; then
                LAST_BEAT=$(tail -1 "$LOG_FILE" 2>/dev/null)
                echo "Last heartbeat: $LAST_BEAT"
            fi
        else
            echo "Status: ❌ STOPPED (stale PID file)"
            rm "$PID_FILE"
        fi
    else
        echo "Status: ❌ NOT RUNNING"
    fi

    echo ""
    echo "Log file: $LOG_FILE"

    # Show log file size if it exists
    if [ -f "$LOG_FILE" ]; then
        LOG_SIZE=$(du -h "$LOG_FILE" | cut -f1)
        LOG_LINES=$(wc -l < "$LOG_FILE")
        echo "Log size: $LOG_SIZE ($LOG_LINES lines)"
    fi
}

show_logs() {
    if [ ! -f "$LOG_FILE" ]; then
        echo "⚠️  No log file found at $LOG_FILE"
        return 1
    fi

    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Recent Keep-Alive Log Entries"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    tail -20 "$LOG_FILE"
    echo ""
    echo "Full log: $LOG_FILE"
}

restart_keepalive() {
    echo "🔄 Restarting keep-alive..."
    stop_keepalive
    sleep 1
    start_keepalive
}

# Main command handling
case "${1:-}" in
    start)
        start_keepalive
        ;;
    stop)
        stop_keepalive
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs
        ;;
    restart)
        restart_keepalive
        ;;
    *)
        show_usage
        exit 1
        ;;
esac
