# Error Auto-Triage System

**Status**: ✅ Installed and Active

## What It Does

Automatically detects errors in tool output (Bash, Read, Edit, Write) and suggests the appropriate specialized agent for analysis.

## How It Works

### 1. Error Detection (PostToolUse Hook)
After every tool execution, the system scans output for error patterns:
- Keywords: error, exception, failed, cannot, unable to
- Stack traces
- Build/test failures

### 2. Smart Routing
Classifies errors and recommends specialists:

| Error Type | Keywords | Recommended Expert |
|------------|----------|-------------------|
| TypeScript | type error, cannot find, property undefined | `typescript-type-expert` |
| Build | build failed, webpack, vite, esbuild | `vite-expert` |
| Test | test failed, jest, vitest, expect | `vitest-testing-expert` |
| Database | database, sql, query, postgres, mongo | `database-expert` |
| React | react, component, hook, render | `react-expert` |
| Unknown | (default) | `triage-expert` |

### 3. Logging
All detected errors are logged to `~/.claude/logs/errors.jsonl`:

```json
{
  "timestamp": "2025-11-14T21:04:57Z",
  "tool": "Bash",
  "error_type": "typescript",
  "recommended_expert": "typescript-type-expert",
  "preview": "Error: Cannot find module 'typescript'..."
}
```

## User Experience

### Before (Manual)
```
❌ Error occurs
❌ You manually identify error type
❌ You manually invoke correct agent
```

### After (Automatic)
```
⚠️  Error detected (typescript)
💡 Consider using Task tool with subagent_type=typescript-type-expert
```

Claude sees this hint and can proactively launch the appropriate agent.

## What It's NOT

- ❌ **NOT** true parallel execution (Claude Code doesn't support background agents yet)
- ❌ **NOT** automatic agent launching (hooks can only suggest, not launch)
- ❌ **NOT** blocking (wrapped with safe-hook-wrapper, 5s timeout)

## What It IS

- ✅ Smart error detection and classification
- ✅ Intelligent expert recommendations
- ✅ Pattern logging for analysis
- ✅ Non-blocking hints to Claude

## Files

**Hook Script**: `~/.claude/hooks/error-auto-triage.sh`
- Detects error patterns
- Classifies by type
- Logs to JSONL
- Suggests expert

**Configuration**: `~/.claude/settings.json`
- PostToolUse hook for Bash, Read, Edit, Write, MultiEdit
- Wrapped with safe-hook-wrapper (5s timeout)

**Log File**: `~/.claude/logs/errors.jsonl`
- Structured error logging
- Includes timestamp, type, tool, expert recommendation
- Auto-cleanup with daily cron (7 days retention)

## Error Analysis

View error patterns:
```bash
# Recent errors by type
jq -r '.error_type' ~/.claude/logs/errors.jsonl | sort | uniq -c | sort -rn

# Recent errors with recommendations
jq -r '[.timestamp, .error_type, .recommended_expert] | @tsv' ~/.claude/logs/errors.jsonl | tail -10

# Errors in last 24h
jq -r 'select(.timestamp > "'$(date -u -d '24 hours ago' +%Y-%m-%dT%H:%M:%SZ)'") | [.error_type, .preview] | @tsv' ~/.claude/logs/errors.jsonl
```

## Integration with Workflow

### Recommended Usage

When you see an error hint:
```
⚠️  Error detected (build). Consider using Task tool with subagent_type=vite-expert
```

Claude should proactively:
1. Acknowledge the error
2. Use Task tool with recommended agent
3. Provide specialized analysis

### Manual Override

If the suggested expert isn't right, you can:
- Use a different agent explicitly
- Ask Claude to use `triage-expert` for general diagnosis
- Handle the error inline if simple

## Performance Impact

- **Hook execution**: ~50-100ms (wrapped with safe-hook-wrapper)
- **Non-blocking**: Always returns within 5s (timeout)
- **Log size**: Minimal (~100 bytes per error)
- **Cleanup**: Daily cron removes logs >7 days old

## Future Enhancements

Potential improvements when Claude Code supports them:
- True parallel agent execution
- Automatic agent launching on error detection
- Background error monitoring
- Real-time error aggregation and alerting
