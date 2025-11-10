# Keep-Alive System Guide

Automatic timeout prevention system for Claude Code sessions.

## Overview

The keep-alive system prevents Claude Code from timing out during periods of inactivity by maintaining subtle background activity. It consists of three components working together:

1. **Auto-Start Hook** - Starts keep-alive on first user prompt
2. **Background Process** - Sends heartbeats every 5 minutes
3. **Auto-Stop Hook** - Cleans up when session ends

## How It Works

### Automatic Operation

The system runs automatically - no manual intervention needed:

```bash
# On your first message in a session:
You: "hello"
🚀 Auto-starting keep-alive system to prevent timeout...
✅ Keep-alive started (PID: 12345)

# Every 5 minutes (silently in background):
[2025-11-11 10:00:00] Heartbeat - Claude Code session active
[2025-11-11 10:05:00] Heartbeat - Claude Code session active
[2025-11-11 10:10:00] Heartbeat - Claude Code session active

# When you stop Claude Code:
🛑 Stopping keep-alive process (session ending)...
✅ Keep-alive stopped
```

### Components

#### 1. Background Process
**File:** `~/.claude/scripts/keep-claude-active.sh`

- Runs continuously in background
- Updates timestamp every 5 minutes (300 seconds)
- Logs heartbeats to `~/.claude/logs/keep-alive.log`
- Stores PID in `~/.claude/.keep-alive.pid`

#### 2. Auto-Start Hook
**File:** `~/.claude/hooks/auto-start-keepalive.sh`
**Event:** UserPromptSubmit

- Triggers on first user message
- Checks if already running (won't start duplicate)
- Starts background process automatically
- Shows startup confirmation

#### 3. Auto-Stop Hook
**File:** `~/.claude/hooks/auto-stop-keepalive.sh`
**Event:** Stop

- Triggers when Claude Code session ends
- Stops background process cleanly
- Removes PID file
- Shows shutdown confirmation

#### 4. Management Script
**File:** `~/.claude/scripts/keep-alive-manager.sh`

Control script for manual management (if needed).

## Manual Control

While the system runs automatically, you can manually control it:

### Check Status
```bash
~/.claude/scripts/keep-alive-manager.sh status
```

Output:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Keep-Alive Status
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Status: ✅ RUNNING
PID: 12345
Started: Mon Nov 11 10:00:00 2025
Last heartbeat: [2025-11-11 10:15:00] Heartbeat - Claude Code session active

Log file: /home/thoma/.claude/logs/keep-alive.log
Log size: 2.4K (48 lines)
```

### View Logs
```bash
~/.claude/scripts/keep-alive-manager.sh logs
```

### Manual Start (if needed)
```bash
~/.claude/scripts/keep-alive-manager.sh start
```

### Manual Stop (if needed)
```bash
~/.claude/scripts/keep-alive-manager.sh stop
```

### Restart
```bash
~/.claude/scripts/keep-alive-manager.sh restart
```

## Configuration

### Change Heartbeat Interval

Edit `~/.claude/scripts/keep-claude-active.sh`:

```bash
INTERVAL_SECONDS=300  # Default: 5 minutes

# Options:
INTERVAL_SECONDS=180   # 3 minutes (more frequent)
INTERVAL_SECONDS=600   # 10 minutes (less frequent)
```

### Change Inactivity Warning

The passive reminder hook warns after 10 minutes of inactivity.

Edit `~/.claude/hooks/keep-alive-reminder.sh`:

```bash
TIMEOUT_MINUTES=10  # Default: 10 minutes

# Options:
TIMEOUT_MINUTES=5   # Warn sooner
TIMEOUT_MINUTES=15  # Warn later
```

## Disable Auto-Start

If you want manual control only, remove the auto-start hook from settings:

1. Edit `~/.claude/settings.json`
2. Remove this entry from `UserPromptSubmit` hooks:
```json
{
  "type": "command",
  "command": "~/.claude/hooks/auto-start-keepalive.sh"
}
```

## Troubleshooting

### Keep-Alive Not Starting

Check if hook is registered:
```bash
grep "auto-start-keepalive" ~/.claude/settings.json
```

Check if script is executable:
```bash
ls -la ~/.claude/hooks/auto-start-keepalive.sh
```

### Process Dies Unexpectedly

Check logs for errors:
```bash
tail -50 ~/.claude/logs/keep-alive.log
```

Manually restart:
```bash
~/.claude/scripts/keep-alive-manager.sh restart
```

### Multiple Processes Running

Kill all and restart:
```bash
pkill -f keep-claude-active.sh
~/.claude/scripts/keep-alive-manager.sh start
```

### Stale PID File

If status shows "stale PID file":
```bash
rm ~/.claude/.keep-alive.pid
~/.claude/scripts/keep-alive-manager.sh start
```

## Log Management

Logs are stored in: `~/.claude/logs/keep-alive.log`

### View Log Size
```bash
du -h ~/.claude/logs/keep-alive.log
```

### Clear Old Logs
```bash
# Keep last 100 lines
tail -100 ~/.claude/logs/keep-alive.log > /tmp/keep-alive-temp.log
mv /tmp/keep-alive-temp.log ~/.claude/logs/keep-alive.log
```

### Archive Logs
```bash
# Archive and start fresh
mv ~/.claude/logs/keep-alive.log \
   ~/.claude/logs/keep-alive-$(date +%Y%m%d).log
```

## How It Prevents Timeout

The system prevents timeout through multiple mechanisms:

1. **Timestamp Updates** - Updates `.last-interaction-timestamp` every 5 minutes
2. **Log Activity** - Writes to log file (shows process is alive)
3. **PID Management** - Maintains process ID file for tracking
4. **Silent Operation** - Runs in background without spamming output

This subtle activity signals to the system that the session is active without creating annoying notifications or disrupting your work.

## Architecture

```
┌─────────────────────────────────────────┐
│         Claude Code Session              │
└─────────────────┬───────────────────────┘
                  │
                  ├─→ First Prompt
                  │   └─→ auto-start-keepalive.sh
                  │       └─→ keep-claude-active.sh (background)
                  │           │
                  │           ├─→ Every 5 min: Update timestamp
                  │           ├─→ Every 5 min: Log heartbeat
                  │           └─→ Loop forever
                  │
                  ├─→ Every Prompt
                  │   └─→ keep-alive-reminder.sh
                  │       └─→ Check inactivity, warn if >10 min
                  │
                  └─→ Session Stop
                      └─→ auto-stop-keepalive.sh
                          └─→ Kill background process
```

## Related Files

- `hooks/auto-start-keepalive.sh` - Auto-start hook
- `hooks/auto-stop-keepalive.sh` - Auto-stop hook
- `hooks/keep-alive-reminder.sh` - Inactivity warning (passive)
- `scripts/keep-claude-active.sh` - Background heartbeat process
- `scripts/keep-alive-manager.sh` - Management interface
- `.keep-alive.pid` - Process ID file
- `.last-interaction-timestamp` - Timestamp tracking
- `logs/keep-alive.log` - Heartbeat log

## Benefits

✅ **Automatic** - No manual intervention needed
✅ **Silent** - Runs in background without disruption
✅ **Clean** - Auto-starts and auto-stops with session
✅ **Visible** - Easy status checking and log viewing
✅ **Configurable** - Adjust intervals as needed
✅ **Safe** - No duplicate processes, clean PID management
✅ **Preventive** - Warns about inactivity before timeout

## Next Steps

The system is already running! No action needed.

To verify:
```bash
~/.claude/scripts/keep-alive-manager.sh status
```

To view activity:
```bash
~/.claude/scripts/keep-alive-manager.sh logs
```
