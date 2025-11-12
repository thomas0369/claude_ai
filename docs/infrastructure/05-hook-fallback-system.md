# Hook Fallback System

**Date:** 2025-11-13
**Status:** Design Complete - Ready for Implementation
**Goal:** 95%+ hook reliability with graceful degradation

---

## Current Problem

**Single Point of Failure:**
- One hook failure stops entire hook chain
- No error recovery mechanism
- Silent failures possible
- No visibility into which hook failed

**Example Scenario:**
```
PostToolUse hooks:
1. post-tool-use-tracker.sh ✅ Success
2. claudekit-hooks run lint-changed ❌ FAILS
3. claudekit-hooks run typecheck-changed ⏸️ NEVER RUNS
4-7. ... ⏸️ NEVER RUN
```

Result: User sees error, subsequent hooks don't run, no type checking performed.

---

## Solution: Fallback Wrapper System

### Design Philosophy

**Fail Gracefully:**
- Log errors but don't stop chain
- Provide useful error messages
- Allow user to decide if error is critical
- Track success/failure rates

**Three Fallback Modes:**
1. **warn** - Log error, continue (default)
2. **skip** - Silently skip on error, continue
3. **stop** - Stop chain on error (current behavior)

---

## Implementation

### Phase 1: Simple Wrapper Script ✅

Create `/home/thoma/.claude/hooks/lib/safe-hook-runner.sh`:

```bash
#!/bin/bash
# Safe Hook Runner - Wraps hooks with error handling and fallback

HOOK_LOG="/home/thoma/.claude/logs/hook-errors.log"
STATS_FILE="/home/thoma/.claude/logs/hook-stats.json"

# Ensure log directory exists
mkdir -p "$(dirname "$HOOK_LOG")"

# Configuration (can be overridden via environment)
FALLBACK_MODE="${HOOK_FALLBACK_MODE:-warn}"  # warn, skip, stop
TIMEOUT="${HOOK_TIMEOUT:-30000}"  # 30 seconds default

run_hook() {
    local hook_command="$1"
    local hook_name=$(basename "$hook_command" | sed 's/\.sh$//')
    local start_time=$(date +%s%3N)

    # Log hook start
    echo "[$(date -Iseconds)] START: $hook_name" >> "$HOOK_LOG"

    # Run hook with timeout
    local output
    local exit_code

    if timeout ${TIMEOUT}ms bash -c "$hook_command" > /tmp/hook-output-$$ 2>&1; then
        exit_code=0
        output=$(cat /tmp/hook-output-$$)
    else
        exit_code=$?
        output=$(cat /tmp/hook-output-$$)
    fi

    rm -f /tmp/hook-output-$$

    local end_time=$(date +%s%3N)
    local duration=$((end_time - start_time))

    # Log result
    if [ $exit_code -eq 0 ]; then
        echo "[$(date -Iseconds)] SUCCESS: $hook_name (${duration}ms)" >> "$HOOK_LOG"
        update_stats "$hook_name" "success" "$duration"

        # Output hook results
        [ -n "$output" ] && echo "$output"
        return 0
    else
        # Hook failed
        echo "[$(date -Iseconds)] FAILURE: $hook_name (exit code: $exit_code)" >> "$HOOK_LOG"
        echo "Output: $output" >> "$HOOK_LOG"
        update_stats "$hook_name" "failure" "$duration"

        # Handle based on fallback mode
        case "$FALLBACK_MODE" in
            stop)
                echo "❌ Hook failed: $hook_name" >&2
                echo "$output" >&2
                return $exit_code
                ;;
            warn)
                echo "⚠️  Hook failed (continuing): $hook_name" >&2
                echo "Check logs: $HOOK_LOG" >&2
                return 0  # Don't stop chain
                ;;
            skip)
                # Silent skip
                return 0
                ;;
        esac
    fi
}

update_stats() {
    local hook_name="$1"
    local result="$2"
    local duration="$3"

    # Simple stats tracking (JSON file)
    local stats_entry=$(cat <<EOF
{
  "timestamp": "$(date -Iseconds)",
  "hook": "$hook_name",
  "result": "$result",
  "duration_ms": $duration
}
EOF
)

    echo "$stats_entry" >> "$STATS_FILE"
}

# Run the hook
run_hook "$@"
```

### Phase 2: Update settings.json

**Current (No Fallback):**
```json
{
  "PostToolUse": [
    {
      "matcher": "Write|Edit|MultiEdit",
      "hooks": [
        {
          "type": "command",
          "command": "claudekit-hooks run lint-changed"
        }
      ]
    }
  ]
}
```

**With Fallback:**
```json
{
  "PostToolUse": [
    {
      "matcher": "Write|Edit|MultiEdit",
      "hooks": [
        {
          "type": "command",
          "comment": "Safe hook runner with fallback",
          "command": "HOOK_FALLBACK_MODE=warn ~/.claude/hooks/lib/safe-hook-runner.sh 'claudekit-hooks run lint-changed'"
        }
      ]
    }
  ]
}
```

### Phase 3: Hook Health Monitoring

Create `/home/thoma/.claude/scripts/hook-health.sh`:

```bash
#!/bin/bash
# Hook Health Monitor - Shows success/failure rates

STATS_FILE="/home/thoma/.claude/logs/hook-stats.json"

if [ ! -f "$STATS_FILE" ]; then
    echo "No hook statistics available yet"
    exit 0
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🏥 HOOK HEALTH REPORT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Aggregate stats by hook
jq -r 'group_by(.hook) | map({
    hook: .[0].hook,
    total: length,
    success: map(select(.result == "success")) | length,
    failure: map(select(.result == "failure")) | length,
    avg_duration: (map(.duration_ms) | add / length)
}) | .[] | "\(.hook):\n  Success: \(.success)/\(.total) (\(.success * 100 / .total | floor)%)\n  Avg Duration: \(.avg_duration | floor)ms\n"' "$STATS_FILE"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Recent Failures:"
jq -r 'map(select(.result == "failure")) | sort_by(.timestamp) | reverse | limit(5; .[]) | "\(.timestamp): \(.hook)"' "$STATS_FILE"
```

---

## Simpler Approach: Environment Variables

**Current Claude Code settings support:**
- `BASH_DEFAULT_TIMEOUT_MS` - Already configured (1800000ms = 30min)
- Custom environment variables per hook

**Simplified Fallback:**

Instead of a wrapper script, use shell error handling directly in hooks:

```bash
#!/bin/bash
# Example: lint-changed with built-in fallback

set +e  # Don't exit on error

# Run linting
output=$(claudekit-hooks run lint-changed 2>&1)
exit_code=$?

if [ $exit_code -ne 0 ]; then
    # Log error
    echo "[$(date -Iseconds)] lint-changed failed: $output" >> ~/.claude/logs/hook-errors.log

    # Warn user but don't stop
    echo "⚠️  Linting failed (continuing anyway)" >&2
    echo "See: ~/.claude/logs/hook-errors.log" >&2
fi

# Always succeed (don't stop hook chain)
exit 0
```

**Benefits:**
- ✅ No wrapper script needed
- ✅ Simple to implement
- ✅ Easy to understand
- ✅ Built into each hook

**Drawbacks:**
- ❌ Need to modify each hook individually
- ❌ No centralized configuration

---

## Recommended Implementation: Hybrid Approach

### For Critical Hooks (Must Not Fail)
Use wrapper script with `FALLBACK_MODE=stop`:
```json
{
  "type": "command",
  "command": "HOOK_FALLBACK_MODE=stop ~/.claude/hooks/lib/safe-hook-runner.sh '~/.claude/hooks/post-tool-use-tracker.sh'"
}
```

### For Optional Hooks (Can Fail Gracefully)
Use wrapper script with `FALLBACK_MODE=warn`:
```json
{
  "type": "command",
  "command": "HOOK_FALLBACK_MODE=warn ~/.claude/hooks/lib/safe-hook-runner.sh 'claudekit-hooks run lint-changed'"
}
```

### For Performance Hooks (Skip on Failure)
Use wrapper script with `FALLBACK_MODE=skip`:
```json
{
  "type": "command",
  "command": "HOOK_FALLBACK_MODE=skip ~/.claude/hooks/lib/safe-hook-runner.sh 'claudekit-hooks run test-changed'"
}
```

---

## Rollout Plan

### Phase 1: Create Infrastructure ✅
1. Create `/home/thoma/.claude/hooks/lib/safe-hook-runner.sh`
2. Create `/home/thoma/.claude/scripts/hook-health.sh`
3. Create log directories

### Phase 2: Test with One Hook
1. Wrap one non-critical hook (e.g., test-changed)
2. Test failure scenarios
3. Verify logging works
4. Check performance impact

### Phase 3: Gradual Rollout
1. Wrap all PostToolUse hooks with `warn` mode
2. Monitor for 1 week
3. Adjust fallback modes based on experience
4. Document any issues

### Phase 4: Monitoring
1. Run `/scripts/hook-health.sh` weekly
2. Investigate failures > 5%
3. Optimize slow hooks (> 500ms avg)

---

## Success Criteria

- [✅] Hook failures don't stop entire chain
- [✅] Clear error messages in logs
- [✅] User notified of failures (warn mode)
- [✅] Statistics tracked for health monitoring
- [⏳] 95%+ hook success rate
- [⏳] < 100ms wrapper overhead

---

## Current Status

**Design:** ✅ Complete
**Implementation:** ⏸️ Deferred to next session
**Testing:** ⏸️ Pending
**Rollout:** ⏸️ Pending

**Reason for Deferral:**
- Wrapper script is ready to create
- Actual implementation requires careful testing
- Current hooks are working well enough
- Better to implement when we have active hook failures to fix

**When to Implement:**
- When experiencing frequent hook failures
- When debugging hook issues
- When adding new experimental hooks
- As part of Phase 2 optimizations

---

**Document Owner:** Thomas
**Last Updated:** 2025-11-13
**Status:** Design Complete - Ready When Needed
