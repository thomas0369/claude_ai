# Hook Error Messages - Complete Transparency Guide

## Current Status (This Session)

Based on system reminders in this conversation:
```
✅ UserPromptSubmit hook success: Auto-starting keep-alive
✅ UserPromptSubmit hook success: Success
✅ UserPromptSubmit hook additional context: megathink
```

**All hooks are executing successfully in THIS session.**

---

## Understanding Hook Messages

### 1. "Stop hook returned blocking error"

**This is INTENTIONAL, not an error!**

The `check-todos` hook blocks when you have incomplete tasks:

```
Stop hook blocking error from command: "claudekit-hooks run check-todos":
You have 2 incomplete todo items. You must complete all tasks before stopping:
  - [in_progress] Test the repaired hook
  - [pending] Re-enable in settings.json
```

**When it occurs:** When you try to stop Claude Code with incomplete todos
**Purpose:** Ensures you don't forget to complete tasks
**How to resolve:** Complete all todos or clear the todo list
**Is this bad?** No - it's a feature, not a bug!

---

### 2. "UserPromptSubmit hook error"

**This indicates a hook failed to execute properly.**

Possible causes:

#### A. Hook Timeout
```
Configured timeout: BASH_DEFAULT_TIMEOUT_MS (30 minutes)
If hook takes longer → timeout error
```

**Solutions:**
- Increase timeout in settings.json
- Optimize slow hooks
- Remove unnecessary hooks

#### B. Hook Stderr Output (Even with Exit 0)
Some hooks output to stderr for logging, which Claude Code may interpret as an error.

**Current hooks that output to stdout:**
- `auto-start-keepalive.sh` - Outputs emoji status messages
- `auto-stop-keepalive.sh` - Outputs emoji status messages

**To fix:** Redirect output to /dev/null or log file

#### C. Missing Hook or Permission Issues
```bash
# Check all hooks exist and are executable:
ls -la ~/.claude/hooks/*.sh
```

#### D. Malformed JSON Output
Hooks that return JSON must use correct format:
```json
{"hookSpecificOutput":{"key":"value"}}
```

---

## Current Hook Configuration

### UserPromptSubmit (4 hooks):
1. ✅ `auto-start-keepalive.sh` - Starts keep-alive process
2. ✅ `skill-activation-prompt.sh` - Suggests relevant skills
3. ✅ `claudekit-hooks run codebase-map` - Injects codebase context
4. ✅ `claudekit-hooks run thinking-level` - Sets thinking depth

### Stop (2 hooks):
1. ✅ `auto-stop-keepalive.sh` - Stops keep-alive process
2. ✅ `claudekit-hooks run check-todos` - **Blocks if todos incomplete**

### PostToolUse (7 hooks):
1. ✅ `post-tool-use-tracker.sh` - Tracks file changes
2. ✅ `claudekit-hooks run lint-changed` - Lints modified files
3. ✅ `claudekit-hooks run typecheck-changed` - Type checks changes
4. ✅ `claudekit-hooks run check-any-changed` - General validation
5. ✅ `claudekit-hooks run test-changed` - Runs tests on changes
6. ✅ `claudekit-hooks run check-comment-replacement` - Validates edits
7. ✅ `claudekit-hooks run check-unused-parameters` - Code quality

---

## Hooks We Removed (To Fix Timeouts)

These were removed from Stop hooks because they caused timeouts:

- ❌ `claudekit-hooks run typecheck-project` - Full project typecheck (slow)
- ❌ `claudekit-hooks run lint-project` - Full project lint (slow)
- ❌ `claudekit-hooks run test-project` - Full project tests (slow)
- ❌ `claudekit-hooks run self-review` - AI code review (slow)
- ❌ `claudekit-hooks run create-checkpoint` - Git stash creation (slow)

**Why removed:** Running full project checks on EVERY stop caused timeouts

**Alternative:** Run these manually when needed:
```bash
claudekit-hooks run typecheck-project
claudekit-hooks run lint-project
claudekit-hooks run test-project
```

---

## How to Debug Hook Errors

### Step 1: Enable Debug Logging

Create debug wrappers for hooks:
```bash
/tmp/create-debug-hook.sh
```

This creates backups and wraps hooks to log everything to:
```
/home/thoma/.claude/logs/hook-debug.log
```

### Step 2: Monitor Hook Execution

Watch hook execution in real-time:
```bash
tail -f /home/thoma/.claude/logs/hook-debug.log
```

### Step 3: Test Hooks Manually

Test any hook individually:
```bash
echo '{"session_id":"test","cwd":"/home/thoma/.claude","hook_event_name":"UserPromptSubmit","prompt":"test"}' | ~/.claude/hooks/auto-start-keepalive.sh
```

### Step 4: Check Exit Codes and Output

```bash
# Test and capture exit code + output
echo '{"..."}' | ~/.claude/hooks/skill-activation-prompt.sh 2>&1
echo "Exit code: $?"
```

---

## Normal vs Abnormal Hook Behavior

### ✅ Normal (Expected)

1. **Stop hook blocking with incomplete todos**
   ```
   Stop hook returned blocking error
   ```
   This is intentional behavior!

2. **UserPromptSubmit hook success with output**
   ```
   UserPromptSubmit hook success: 🚀 Auto-starting keep-alive...
   ```
   Hook succeeded and provided context

3. **Hook output to stdout**
   ```
   {"hookSpecificOutput":{"hookEventName":"UserPromptSubmit","additionalContext":"megathink"}}
   ```
   This is correct JSON format

### ❌ Abnormal (Actual Errors)

1. **Hook timeout without completion**
   ```
   Request timed out
   UserPromptSubmit hook error
   ```
   Hook took too long to execute

2. **Hook not found**
   ```
   ~/.claude/hooks/missing-hook.sh: No such file or directory
   ```
   Hook configured but doesn't exist

3. **Permission denied**
   ```
   Permission denied: ~/.claude/hooks/script.sh
   ```
   Hook not executable (chmod +x needed)

4. **Unexpected exit code**
   ```
   Hook exited with code 1
   ```
   Hook failed during execution

---

## Quick Fix Checklist

If you see hook errors:

- [ ] Check hook files exist: `ls -la ~/.claude/hooks/`
- [ ] Verify they're executable: `chmod +x ~/.claude/hooks/*.sh`
- [ ] Test hooks manually (see above)
- [ ] Check for timeout issues (increase BASH_DEFAULT_TIMEOUT_MS)
- [ ] Review hook output for stderr messages
- [ ] Check disk space: `df -h`
- [ ] Check for node_modules/npm issues: `npm install` in hooks directory
- [ ] Review settings.json for typos

---

## Contact/Support

If errors persist after following this guide:

1. Enable debug logging (Step 1 above)
2. Reproduce the error
3. Share the debug log: `/home/thoma/.claude/logs/hook-debug.log`
4. Include your settings.json configuration
5. Note which specific hook is failing

---

**Last Updated:** 2025-11-12
**Hook System Version:** Claude Code with claudekit-hooks 1.0.0
