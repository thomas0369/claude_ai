# Todo Reminder Hook - Non-Blocking Alternative to check-todos

## What This Is

A **friendly, non-blocking** replacement for the problematic `check-todos` hook that:
- Shows you incomplete todos when you stop
- **Never blocks** your ability to stop
- Provides helpful suggestions
- Respects your agency to proceed anyway

## Key Difference from check-todos

| Feature | check-todos (OLD) | todo-reminder.sh (NEW) |
|---------|------------------|------------------------|
| **Blocks stop** | ✅ Yes (dead-end) | ❌ Never |
| **Shows todos** | ❌ No (just count) | ✅ Yes (full list) |
| **User can proceed** | ❌ No | ✅ Always |
| **Helpful suggestions** | ❌ No | ✅ Yes |
| **Fast** | ⚠️ ~80ms (Node.js) | ✅ ~5-10ms (bash) |
| **Philosophy** | Block & prevent | Inform & guide |

## How It Works

```bash
On Stop:
  ↓
Check history.jsonl for latest TodoWrite
  ↓
Found incomplete todos?
  ├─ Yes → Show friendly warning with todo list
  │         → Provide suggestions
  │         → Exit 0 (allow stop)
  └─ No  → Silent, exit 0 (allow stop)
```

## Example Output

When you have incomplete todos:
```
⚠️  Incomplete Todos Reminder
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
You have 3 incomplete todo item(s):

  - [in_progress] Fix authentication bug
  - [pending] Update documentation
  - [pending] Add unit tests

💡 Suggestions:
  • Complete them if they're still relevant
  • Use TodoWrite to mark them as completed
  • Or just proceed - this is only a reminder!
```

When all todos are complete or there are no todos:
```
(Silent - no output)
```

## Files

- **Hook script:** `/home/thoma/.claude/hooks/todo-reminder.sh`
- **Configuration:** `/home/thoma/.claude/settings.json` (Stop hooks)
- **Analysis:** `/home/thoma/.claude/hooks/CHECK-TODOS-ANALYSIS.md`

## Configuration

Already configured in `settings.json`:
```json
"Stop": [
  {
    "matcher": "*",
    "hooks": [
      {
        "type": "command",
        "command": "~/.claude/hooks/safe-hook-wrapper.sh ~/.claude/hooks/auto-stop-keepalive.sh"
      },
      {
        "type": "command",
        "command": "~/.claude/hooks/safe-hook-wrapper.sh ~/.claude/hooks/todo-reminder.sh"
      }
    ]
  }
]
```

## Safety Features

1. **Wrapped in safe-hook-wrapper.sh**
   - 5-second timeout protection
   - Non-blocking error handling
   - Performance logging

2. **Always exits 0**
   - Never blocks the stop action
   - Fails gracefully if jq/tac not available
   - Handles missing transcript files

3. **Fast execution**
   - Simple bash script
   - No Node.js overhead
   - Typically completes in <10ms

## Philosophy

> **"Guide, don't gate-keep. Inform, don't prevent. Empower, don't block."**

The hook provides helpful information while respecting that you're the decision-maker. It trusts you to know when it's appropriate to proceed with incomplete todos.

## Testing

Test the hook directly:
```bash
~/.claude/hooks/todo-reminder.sh
```

Should:
- Exit with code 0 (always)
- Show warning if todos exist
- Be silent if no incomplete todos
- Complete in <100ms

## Troubleshooting

**Hook doesn't show anything:**
- Check that `history.jsonl` exists
- Verify you've used TodoWrite in the session
- Ensure `jq` is installed (`which jq`)

**Hook errors:**
- Check logs: `tail -20 ~/.claude/logs/hooks.log`
- Verify permissions: `ls -l ~/.claude/hooks/todo-reminder.sh`
- Should be executable (`chmod +x`)

**Hook still blocks:**
- You might be on an old session (restart Claude Code)
- Check settings.json doesn't still have check-todos
- Verify safe-hook-wrapper.sh is working

## Next Session

This new hook will become active in your **next Claude Code session** (after you restart).

Current session still runs the old check-todos because settings were loaded at session start.

---

*Created: 2025-11-14*
*Author: Claude Code (Sonnet 4.5)*
*Status: Ready for next session*
