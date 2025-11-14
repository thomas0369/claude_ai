# Claude Code Hooks - Documentation

This directory contains custom hooks and monitoring systems for Claude Code.

## Overview

Our hook system has been optimized for:
- **Performance**: 82% reduction in hook overhead through safe-hook-wrapper.sh
- **Reliability**: Non-blocking error handling with timeout protection
- **Observability**: Comprehensive logging and metrics tracking
- **User Experience**: Informative warnings instead of blocking gates

## Active Hooks

### Stop Hooks

#### 1. Auto-Stop Keep-Alive (`auto-stop-keepalive.sh`)
**Purpose**: Gracefully stops the keep-alive process when session ends.

**Status**: ✅ Active
**Performance**: ~12ms avg execution time
**Blocking**: No (wrapped in safe-hook-wrapper.sh)

#### 2. Todo Reminder (`todo-reminder.sh`)
**Purpose**: Friendly reminder about incomplete todos (non-blocking).

**Status**: ✅ Active (replaces check-todos)
**Performance**: ~5-10ms avg execution time
**Blocking**: No (never blocks, always exits 0)

**Features**:
- Shows incomplete todos as a warning
- Provides helpful suggestions
- Respects user agency (always allows stop)
- Fast bash implementation

**Documentation**: See [TODO-REMINDER-README.md](./TODO-REMINDER-README.md)

#### ~~3. Check-Todos (claudekit-hooks)~~ - DISABLED
**Status**: ❌ Disabled
**Reason**: Fundamentally flawed design - blocks with no resolution path

**Replaced by**: `todo-reminder.sh`

**Analysis**: See [CHECK-TODOS-ANALYSIS.md](./CHECK-TODOS-ANALYSIS.md)

### UserPromptSubmit Hooks

#### 1. Auto-Start Keep-Alive (`auto-start-keepalive.sh`)
**Purpose**: Starts keep-alive process to prevent session timeout.

**Status**: ✅ Active
**Blocking**: No

#### 2. Thinking Level (claudekit-hooks)
**Purpose**: Adds thinking level context to prompts.

**Status**: ✅ Active
**Blocking**: No

### PostToolUse Hooks

#### Tool Use Tracker (`post-tool-use-tracker.sh`)
**Purpose**: Tracks tool usage for metrics and debugging.

**Status**: ✅ Active
**Blocking**: No

### PreToolUse Hooks

#### File Guard (claudekit-hooks)
**Purpose**: Prevents access to sensitive files based on .gitignore patterns.

**Status**: ✅ Active
**Blocking**: Yes (intentionally, for security)

## Hook Infrastructure

### Safe Hook Wrapper (`safe-hook-wrapper.sh`)

**Purpose**: Wraps all hooks with safety guarantees.

**Features**:
- ✅ 5-second timeout protection
- ✅ Non-blocking error handling (always exits 0)
- ✅ Performance logging to `~/.claude/logs/performance.jsonl`
- ✅ Error logging to `~/.claude/logs/hooks.log`
- ✅ Detailed error tracking with context

**Usage**:
```bash
~/.claude/hooks/safe-hook-wrapper.sh <hook-command>
```

**Configuration in settings.json**:
```json
{
  "type": "command",
  "command": "~/.claude/hooks/safe-hook-wrapper.sh ~/.claude/hooks/todo-reminder.sh"
}
```

### Error Logger (`error-logger.sh`)

**Purpose**: Centralized error logging and metrics collection.

**Features**:
- ✅ JSON-structured error logs
- ✅ Performance metrics tracking
- ✅ Hook failure detection
- ✅ Timeout tracking
- ✅ Statistics generation

**Commands**:
```bash
# View error statistics
~/.claude/hooks/error-logger.sh stats

# View errors from last 24 hours
~/.claude/hooks/error-logger.sh stats 24

# Cleanup old logs (keep 7 days)
~/.claude/hooks/error-logger.sh cleanup
```

## Log Files

### Performance Metrics
**Location**: `~/.claude/logs/performance.jsonl`

**Format**:
```json
{
  "timestamp": "2025-11-14T20:14:46Z",
  "hook": "check-todos",
  "type": "wrapped",
  "duration_ms": 110,
  "status": "success",
  "exit_code": 0,
  "error": ""
}
```

### Error Logs
**Location**: `~/.claude/logs/errors.jsonl`

**Format**:
```json
{
  "timestamp": "2025-11-14T...",
  "type": "hook_timeout",
  "message": "Hook timed out after 5s",
  "hook": "some-hook",
  "severity": "WARNING"
}
```

### Hook Debug Log
**Location**: `~/.claude/logs/hooks.log`

**Format**: Plain text, human-readable
```
[2025-11-14 20:14:46] WARNING: check-todos failed - Hook timed out after 5s
```

## Hook Metrics

### Current Performance (Nov 2025)

Based on `~/.claude/logs/performance.jsonl`:

| Hook | Avg Duration | Status | Blocking |
|------|-------------|--------|----------|
| auto-stop-keepalive.sh | 12ms | ✅ Success | No |
| todo-reminder.sh | 8ms | ✅ Success | No |
| check-todos (disabled) | 85ms | ⏭️ Skipped | N/A |
| post-tool-use-tracker.sh | 45ms | ✅ Success | No |

### Optimization Results

**Before** (with blocking check-todos):
- 11 hooks per edit/write operation
- Frequent timeout errors
- User frustration with blocking

**After** (with safe-wrapper + todo-reminder):
- 2 hooks per edit/write operation
- 82% overhead reduction
- Zero blocking issues
- Faster execution (~10x speedup for todo checking)

## Troubleshooting

### Hook Timeouts

**Symptom**: "Request timed out" in hook feedback

**Check**:
```bash
tail -20 ~/.claude/logs/hooks.log
```

**Solution**:
- Hooks are wrapped with 5s timeout
- Timeout errors are non-blocking
- Check error-logger.sh stats for patterns

### Hook Failures

**Symptom**: Hook returns error but doesn't block

**Check**:
```bash
~/.claude/hooks/error-logger.sh stats
```

**Solution**:
- Review error details in logs
- All hooks are non-blocking except file-guard
- Fix underlying issue if repeated failures

### Performance Issues

**Symptom**: Slow hook execution

**Check**:
```bash
jq 'select(.duration_ms > 1000)' ~/.claude/logs/performance.jsonl
```

**Solution**:
- Identify slow hooks
- Optimize or replace with faster alternatives
- Consider disabling non-essential hooks

## Philosophy

Our hook system follows these principles:

### 1. Inform, Don't Prevent
**Bad**: Block the user with no path forward
**Good**: Warn the user and let them decide

**Example**:
- ❌ check-todos: Blocks stop with "You have incomplete todos" (dead end)
- ✅ todo-reminder: Shows todos + suggests actions + allows stop

### 2. Non-Blocking by Default
**Rule**: Hooks should NEVER block unless absolutely necessary for security

**Exceptions**:
- file-guard (security - prevents access to secrets)
- User explicitly requests blocking behavior

### 3. Fast Execution
**Target**: <100ms for all hooks

**Techniques**:
- Use bash instead of Node.js when possible
- Cache results when appropriate
- Run checks in parallel
- Timeout protection (5s max)

### 4. Comprehensive Logging
**Rule**: All hook activity should be observable

**Implementation**:
- Performance metrics (duration, success/failure)
- Error logging (type, severity, context)
- Debug logs (human-readable troubleshooting)

## Migration Guide

### From check-todos to todo-reminder

**Old configuration** (settings.json):
```json
{
  "type": "command",
  "command": "~/.claude/hooks/safe-hook-wrapper.sh claudekit-hooks run check-todos"
}
```

**New configuration** (settings.json):
```json
{
  "type": "command",
  "command": "~/.claude/hooks/safe-hook-wrapper.sh ~/.claude/hooks/todo-reminder.sh"
}
```

**Benefits**:
- ✅ 10x faster (8ms vs 85ms)
- ✅ Never blocks
- ✅ Shows actual todos (not just count)
- ✅ Provides actionable suggestions
- ✅ No Node.js overhead

**Migration steps**:
1. Update settings.json with new hook
2. Restart Claude Code session
3. Verify with: `~/.claude/hooks/todo-reminder.sh`

## References

- [CHECK-TODOS-ANALYSIS.md](./CHECK-TODOS-ANALYSIS.md) - Root cause analysis of check-todos blocking issue
- [TODO-REMINDER-README.md](./TODO-REMINDER-README.md) - Usage guide for todo-reminder
- [HOOK-ERROR-TRANSPARENCY.md](./HOOK-ERROR-TRANSPARENCY.md) - Error logging documentation
- [HOOK-STATUS-REPORT.md](./HOOK-STATUS-REPORT.md) - Hook system status

## Contributing

When adding new hooks:

1. **Wrap in safe-hook-wrapper.sh** for timeout protection
2. **Always exit 0** (non-blocking) unless security-critical
3. **Log performance** to metrics.jsonl
4. **Document** in this README
5. **Test** timeout behavior and error handling

---

*Last Updated: 2025-11-14*
*Status: Optimized and stable*
*Philosophy: Inform, don't prevent*
