# Check-Todos Hook: Root Cause Analysis & Fix

## Problem Statement

When trying to stop a Claude Code session with incomplete todos, users experienced:
- "You have X incomplete todo items" blocking message
- "Request timed out" errors
- **Nothing happens after the message** - stuck in a loop
- No way to see or complete the todos

## Root Cause

The `check-todos` hook has a **fundamental design flaw**:

### How It Works
1. On Stop → Hook runs
2. Reads `history.jsonl` to find most recent `TodoWrite` result
3. Checks for incomplete todos
4. If found → Returns JSON: `{"decision": "block", "reason": "..."}`
5. Claude Code reads the JSON and **blocks the stop**
6. User sees the blocking message but **no follow-up action occurs**

### The Flaw: Dead-End Blocking

```
User tries to stop
    ↓
Hook blocks: "You have 4 incomplete todos"
    ↓
User sees message... now what?
    ↓
❌ No TodoRead is triggered
❌ No list of todos shown
❌ No path forward except to magically know what the todos are
    ↓
User tries to stop again
    ↓
Same message, same block
    ↓
INFINITE LOOP
```

**The hook tells you there's a problem but provides zero path to resolution.**

## Why "Nothing Happens"

1. **Hook completes successfully** (~80-150ms, exit code 0)
2. **safe-hook-wrapper.sh** sees exit 0 → Returns 0 (non-blocking from wrapper's POV)
3. **But the JSON output** contains `decision: "block"`
4. **Claude Code** reads the JSON and blocks the UI
5. **User sees the message** but no further action is taken
6. **TodoRead doesn't help** because it only displays - doesn't update the state in history.jsonl

## Technical Details

### Hook Implementation
```typescript
// check-todos.ts line 44-60
if (incompleteTodos.length > 0) {
  const reason = `You have ${incompleteTodos.length} incomplete todo items...`;

  this.jsonOutput({
    decision: 'block',  // ← This blocks the stop
    reason,
  });

  return { exitCode: 0 }; // ← But this makes the wrapper think it succeeded
}
```

### The Timeout Issue
The "Request timed out" shown in history.jsonl was from:
- safe-hook-wrapper.sh has a 5s timeout
- If ANY hook takes >5s → timeout
- The wrapper still returns 0 (non-blocking)
- But the output shows "Request timed out"

In this case, check-todos completed in ~80ms (well under timeout), so the timeout was likely from another process or a different hook run.

## Solutions Implemented

### Phase 1: Disabled the Broken Hook

**Disabled the check-todos hook** by removing it from `settings.json`:

```json
// BEFORE (settings.json line 54-67)
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
        "command": "~/.claude/hooks/safe-hook-wrapper.sh claudekit-hooks run check-todos"  // ← REMOVED
      }
    ]
  }
]

// AFTER
"Stop": [
  {
    "matcher": "*",
    "hooks": [
      {
        "type": "command",
        "command": "~/.claude/hooks/safe-hook-wrapper.sh ~/.claude/hooks/auto-stop-keepalive.sh"
      }
    ]
  }
]
```

## Why This Hook Should Not Exist (In Its Current Form)

### Design Principles Violated

1. **No Dead-End Actions**: A hook should never block without providing a resolution path
2. **Inform, Don't Prevent**: Warnings are better than hard blocks
3. **User Agency**: Users should be able to override system suggestions
4. **Fail-Safe**: Systems should default to allowing the user to proceed

### Better Alternatives

#### Option A: Non-Blocking Warning
```typescript
if (incompleteTodos.length > 0) {
  console.log(`⚠️  Warning: ${incompleteTodos.length} incomplete todos`);
  incompleteTodos.forEach(todo => {
    console.log(`  - [${todo.status}] ${todo.content}`);
  });
  return { exitCode: 0 }; // Allow stop anyway
}
```

#### Option B: Show Todos + Allow Override
```typescript
if (incompleteTodos.length > 0) {
  this.jsonOutput({
    decision: 'warn',  // Warn instead of block
    todos: incompleteTodos,
    message: 'Incomplete todos detected. Review before stopping?',
    allowOverride: true
  });
}
```

#### Option C: Auto-Trigger TodoRead
The hook could inject a TodoRead command so the user sees current state before deciding.

## Recommendation

**Keep check-todos disabled permanently** or replace it with a non-blocking reminder that:
- Shows incomplete todos as a warning
- Suggests using TodoRead to review
- **Never blocks** the stop action
- Provides actionable next steps

The philosophy should be: **"Guide, don't gate-keep"**

## Performance Data

From `/home/thoma/.claude/logs/performance.jsonl`:
```json
{"timestamp":"2025-11-14T19:55:16Z","hook":"check-todos","type":"wrapped","duration_ms":73,"status":"success","exit_code":0,"error":""}
{"timestamp":"2025-11-14T19:57:07Z","hook":"check-todos","type":"wrapped","duration_ms":81,"status":"success","exit_code":0,"error":""}
{"timestamp":"2025-11-14T20:02:40Z","hook":"check-todos","type":"wrapped","duration_ms":79,"status":"success","exit_code":0,"error":""}
```

- Average duration: ~77ms
- Always succeeds (exit code 0)
- Never times out (5s limit)
- But still blocks via JSON output

### Phase 2: Created Better Replacement

**Created `todo-reminder.sh`** - a non-blocking alternative:

**Location:** `/home/thoma/.claude/hooks/todo-reminder.sh`

**Key Features:**
- ✅ **Never blocks** - Always exits 0
- ✅ **Shows the actual todos** - Not just a count
- ✅ **Friendly warnings** - Helpful suggestions instead of hard blocks
- ✅ **User agency** - Allows proceeding even with incomplete todos
- ✅ **Fast execution** - Simple bash script, no Node.js overhead
- ✅ **Safe** - Wrapped in safe-hook-wrapper.sh with timeout protection

**How It Works:**
```bash
# 1. Reads history.jsonl to find latest TodoWrite
# 2. Counts incomplete todos
# 3. If incomplete todos exist:
#    → Shows formatted warning with todo list
#    → Provides helpful suggestions
#    → Exits 0 (allows stop)
# 4. If no incomplete todos:
#    → Silent (no output)
#    → Exits 0 (allows stop)
```

**Example Output:**
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

**Settings Configuration:**
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

## Conclusion

The check-todos hook is a **well-intentioned but fundamentally flawed design** that creates user frustration instead of helping them.

**Actions Taken:**
1. ✅ **Disabled** the blocking check-todos hook
2. ✅ **Replaced** with non-blocking todo-reminder.sh
3. ✅ **Documented** the flaws and solution
4. ✅ **Implemented** "inform, don't prevent" philosophy

**Philosophy Applied:**
- **Guide, don't gate-keep**
- **Inform, don't prevent**
- **Empower, don't block**

The new system provides helpful reminders while respecting user agency and never creating dead-end situations.

---

*Analysis Date: 2025-11-14*
*Author: Claude Code (Sonnet 4.5)*
*Status: Issue resolved - Better replacement implemented*
*Next Session: New hook will be active*
