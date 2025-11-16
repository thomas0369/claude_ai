# Thomas App Debug Mode

Comprehensive debugging capabilities for identifying every small bug in your application testing.

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Debug Tiers](#debug-tiers)
- [CLI Usage](#cli-usage)
- [Console Output](#console-output)
- [Debug Artifacts](#debug-artifacts)
- [Analysis Tools](#analysis-tools)
- [Performance Impact](#performance-impact)
- [Configuration](#configuration)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)

## Overview

Thomas App debug mode provides three tiers of progressive debugging capabilities:

- **Basic** (~10-15% overhead) - Lightweight debugging for quick issue identification
- **Detailed** (~30-40% overhead) - Comprehensive debugging with element state tracking
- **Full** (~50%+ overhead) - Maximum visibility for impossible-to-debug issues

## Quick Start

```bash
# Basic debug mode
./orchestrator.mjs --debug

# Detailed debug mode
./orchestrator.mjs --debug-detailed

# Full debug mode (with custom output directory)
./orchestrator.mjs --debug-full --debug-dir /tmp/thomas-debug
```

## Debug Tiers

### Tier 1: Basic Debug (`--debug`)

**Best for:** Production CI, quick local debugging

**Features:**
- ✅ Action logging (click, fill, press, select, etc.)
- ✅ Console message capture (errors, warnings)
- ✅ Failed request logging
- ✅ Screenshots on failure
- ✅ Basic timing metrics

**Overhead:** ~10-15%

**Example use case:** Quick validation that all actions complete successfully

### Tier 2: Detailed Debug (`--debug-detailed`)

**Best for:** Complex bug investigation, flaky test debugging

**Features:**
- ✅ Everything from Basic
- ✅ Element state capture (before/after each action)
- ✅ Network request/response logging
- ✅ Trace recording (on-first-retry)
- ✅ Screenshots on every action
- ✅ Performance metrics via CDP

**Overhead:** ~30-40%

**Example use case:** Debugging why a button click sometimes fails

### Tier 3: Full Debug (`--debug-full`)

**Best for:** Critical production bugs, security issues

**Features:**
- ✅ Everything from Detailed
- ✅ Video recording of entire session
- ✅ HAR files for network replay
- ✅ Trace recording on all tests
- ✅ Accessibility snapshots
- ✅ Code coverage tracking
- ✅ Memory profiling

**Overhead:** ~50%+

**Warning:** Can generate 100MB+ of artifacts per test

**Example use case:** Reproducing a critical production bug that only happens occasionally

## CLI Usage

### Basic Flags

```bash
# Enable basic debug mode
--debug

# Enable detailed debug mode
--debug-detailed

# Enable full debug mode
--debug-full
```

### Advanced Options

```bash
# Custom output directory
--debug-dir /tmp/my-debug

# Custom retention period (3 days)
--debug-retention 3d

# Combine with test suites
--debug --suites=discovery,customerJourneys
```

### Complete Examples

```bash
# Basic debugging with custom directory
./orchestrator.mjs --debug --debug-dir /tmp/debug --debug-retention 7d

# Detailed debugging for specific test suite
./orchestrator.mjs --debug-detailed --suites=customerJourneys

# Full debugging for game testing
./orchestrator.mjs --debug-full --game
```

## Console Output

### Action Logging

Every Playwright action is logged to the console with timing and state information:

```
[DEBUG] GOTO: http://localhost:3000
  └─ Success (1234ms)

[DEBUG] CLICK: button[data-testid="login-button"]
  ├─ Before: value="", disabled=false, textContent="Login"
  ├─ Screenshot: .thomas-app/debug/screenshots/before-001-click-button.png
  ├─ After: value="", disabled=false, textContent="Login"
  └─ Screenshot: .thomas-app/debug/screenshots/after-001-click-button.png
  └─ Success (234ms)

[DEBUG] FILL: input[name="email"] = "test@example.com"
  ├─ Before: value="", disabled=false
  ├─ After: value="test@example.com", disabled=false
  └─ Success (123ms)
```

### Network Monitoring

```
[DEBUG] NETWORK REQUEST: POST /api/login
  ├─ Headers: 5 headers

[DEBUG] NETWORK RESPONSE: ✅ 200 /api/login
  └─ Body: {"success":true,"token":"..."}
```

### Error Logging

```
[CONSOLE ERROR] Uncaught TypeError: Cannot read property 'foo' of undefined
  ├─ Location: app.js:123
  ├─ Timestamp: 2025-11-16T12:34:56.789Z
  └─ URL: http://localhost:3000/dashboard

[DEBUG] CLICK: button.submit
  └─ FAILED: Timeout 5000ms exceeded
  └─ ERROR Screenshot: .thomas-app/debug/screenshots/error-003-click-button.png
```

### Performance Metrics

```
[DEBUG] PERFORMANCE:
  ├─ Load Time: 1234ms
  ├─ DOM Content Loaded: 567ms
  ├─ DOM Interactive: 456ms
  ├─ First Paint: 234ms
  ├─ First Contentful Paint: 345ms
  ├─ DNS: 12ms, TCP: 34ms
  ├─ Request: 56ms, Response: 78ms
  └─ Resources: 42

[DEBUG] ⚠️  Performance Budget Violations:
  ├─ loadTime: 1234ms (budget: 1000ms, over by 234ms)
```

## Debug Artifacts

All debug artifacts are saved to `.thomas-app/debug/` by default.

### File Structure

```
.thomas-app/debug/
├── actions.jsonl              # All actions logged (JSONL format)
├── console.json               # Browser console messages
├── summary.json               # Test summary with stats
├── screenshots/               # Screenshots directory
│   ├── before-001-click-button.png
│   ├── after-001-click-button.png
│   └── error-003-click-form.png
├── trace.zip                  # Playwright trace (detailed/full)
├── performance-metrics.json   # CDP performance data (detailed/full)
├── load-metrics.json          # Page load metrics (detailed/full)
├── network.har                # Network HAR file (full only)
└── videos/                    # Video recordings (full only)
    └── test-run-001.webm
```

### Actions Log (JSONL)

Each line is a complete JSON object representing one action:

```jsonl
{"id":1,"timestamp":1731758096789,"action":"goto","args":["http://localhost:3000"],"url":"about:blank","duration":1234,"success":true}
{"id":2,"timestamp":1731758098023,"action":"click","selector":"button[data-testid=\"login-button\"]","before":{"exists":true,"disabled":false,"textContent":"Login"},"after":{"exists":true,"disabled":false,"textContent":"Login"},"screenshotBefore":"...","screenshotAfter":"...","duration":234,"success":true}
{"id":3,"timestamp":1731758098257,"action":"fill","selector":"input[name=\"email\"]","args":["input[name=\"email\"]","test@example.com"],"before":{"exists":true,"value":"","disabled":false},"after":{"exists":true,"value":"test@example.com","disabled":false},"duration":123,"success":true}
```

### Debug Summary

```json
{
  "timestamp": "2025-11-16T12:34:56.789Z",
  "debugLevel": "detailed",
  "totalActions": 47,
  "consoleErrors": 3,
  "consoleWarnings": 12,
  "networkFailures": 1,
  "artifacts": {
    "screenshots": 94,
    "actionLog": ".thomas-app/debug/actions.jsonl",
    "consoleLog": "/tmp/thomas-app/console-log.json",
    "trace": ".thomas-app/debug/trace.zip"
  }
}
```

## Analysis Tools

### Command-Line Analysis

```bash
# View all actions
cat .thomas-app/debug/actions.jsonl | jq .

# Filter for errors only
jq 'select(.success == false)' .thomas-app/debug/actions.jsonl

# Count actions by type
jq -r '.action' .thomas-app/debug/actions.jsonl | sort | uniq -c

# Find slowest actions
jq 'select(.duration > 1000)' .thomas-app/debug/actions.jsonl

# View element state changes
jq 'select(.before.value != .after.value) | {action, selector, before: .before.value, after: .after.value}' .thomas-app/debug/actions.jsonl

# View debug summary
cat .thomas-app/debug/summary.json | jq .
```

### Playwright Trace Viewer

The trace file contains a complete timeline of all actions with DOM snapshots, network activity, and console logs:

```bash
# Open trace viewer
npx playwright show-trace .thomas-app/debug/trace.zip
```

Features:
- Timeline view of all actions
- DOM snapshots at each point
- Network waterfall
- Console logs
- Screenshots
- Source code

### Screenshot Analysis

```bash
# List all screenshots
ls -lh .thomas-app/debug/screenshots/

# View specific screenshot
open .thomas-app/debug/screenshots/error-003-click-button.png

# Find error screenshots
ls .thomas-app/debug/screenshots/error-*.png
```

### HAR File Analysis

HAR files can be imported into Chrome DevTools or online HAR viewers:

```bash
# View HAR file
cat .thomas-app/debug/network.har | jq .

# Import into Chrome DevTools:
# 1. Open Chrome DevTools
# 2. Go to Network tab
# 3. Right-click → Import HAR file
# 4. Select .thomas-app/debug/network.har
```

## Performance Impact

| Debug Tier | Overhead | Screenshot Frequency | Trace Recording | Video Recording |
|------------|----------|---------------------|-----------------|-----------------|
| Off        | 0%       | Never               | No              | No              |
| Basic      | 10-15%   | On failure          | No              | No              |
| Detailed   | 30-40%   | On every action     | On-first-retry  | No              |
| Full       | 50%+     | On every action     | Always          | Yes             |

### Disk Space Usage

| Debug Tier | Typical Size | Max Size (configured) |
|------------|--------------|----------------------|
| Basic      | 10-50MB      | 100MB                |
| Detailed   | 50-200MB     | 500MB                |
| Full       | 100-500MB    | 2GB                  |

### Retention Policy

By default, debug artifacts are retained for 7 days (14 days for full mode).

```bash
# Custom retention period
--debug-retention 3d   # 3 days
--debug-retention 24h  # 24 hours
--debug-retention 30d  # 30 days
```

Artifacts are automatically cleaned up when:
1. They exceed the retention period
2. Total size exceeds the configured limit (oldest files deleted first)

## Configuration

### Debug Levels

Debug levels are configured in `config/debug-config.js`:

```javascript
export const DEBUG_CONFIGS = {
  off: { enabled: false },
  basic: { /* basic config */ },
  detailed: { /* detailed config */ },
  full: { /* full config */ }
};
```

### Customization

You can create custom debug configurations by extending the base configs:

```javascript
// Custom config example
const customDebug = {
  ...DEBUG_CONFIGS.detailed,
  screenshots: {
    enabled: true,
    mode: 'only-on-failure',  // Override to capture less
  },
  networkLog: {
    enabled: false  // Disable network logging
  }
};
```

### Environment Variables

```bash
# Set default debug level
export DEBUG_LEVEL=basic

# Set custom debug directory
export DEBUG_DIR=/tmp/thomas-debug
```

## Examples

### Example 1: Debugging a Flaky Test

```bash
# Run with detailed debug to capture element state
./orchestrator.mjs --debug-detailed --suites=customerJourneys

# Check for state changes
jq 'select(.before.disabled != .after.disabled)' .thomas-app/debug/actions.jsonl

# View screenshots
ls .thomas-app/debug/screenshots/error-*.png
```

### Example 2: Performance Investigation

```bash
# Run with detailed debug to capture performance metrics
./orchestrator.mjs --debug-detailed

# Check performance budget violations
cat .thomas-app/debug/load-metrics.json | jq '.metrics'

# Find slow network requests
jq 'select(.type == "network-response" and .duration > 1000)' .thomas-app/debug/actions.jsonl
```

### Example 3: Security Audit

```bash
# Run with full debug to capture everything
./orchestrator.mjs --debug-full --debug-retention 30d

# Analyze network traffic
cat .thomas-app/debug/network.har | jq '.log.entries[] | select(.request.url | contains("password"))'

# Check for console errors
jq 'select(.type == "console" and .level == "error")' .thomas-app/debug/actions.jsonl
```

### Example 4: CI/CD Integration

```bash
#!/bin/bash
# ci-test.sh

# Run tests with basic debug mode
./orchestrator.mjs --debug --suites=discovery,customerJourneys

# Check for errors
ERRORS=$(jq 'select(.success == false)' .thomas-app/debug/actions.jsonl | wc -l)

if [ $ERRORS -gt 0 ]; then
  echo "Found $ERRORS failed actions"
  jq 'select(.success == false)' .thomas-app/debug/actions.jsonl
  exit 1
fi

echo "All tests passed!"
```

## Troubleshooting

### Debug Mode Not Activating

```bash
# Verify debug flag is recognized
./orchestrator.mjs --debug 2>&1 | grep "DEBUG MODE ENABLED"

# Check debug config
cat config/debug-config.js
```

### No Debug Artifacts

```bash
# Check output directory exists
ls -la .thomas-app/debug/

# Verify permissions
ls -ld .thomas-app/debug/

# Check summary
cat .thomas-app/debug/summary.json
```

### Screenshots Not Captured

```bash
# Check screenshot directory
ls -la .thomas-app/debug/screenshots/

# Verify screenshot config
cat .thomas-app/debug/summary.json | jq '.artifacts.screenshots'
```

### Trace File Too Large

```bash
# Check trace size
ls -lh .thomas-app/debug/trace.zip

# Use basic mode instead (no tracing)
./orchestrator.mjs --debug

# Or reduce retention
./orchestrator.mjs --debug-detailed --debug-retention 1d
```

### Disk Space Issues

```bash
# Check current usage
du -sh .thomas-app/debug/

# Manual cleanup
rm -rf .thomas-app/debug/

# Reduce retention period
./orchestrator.mjs --debug --debug-retention 3d

# Reduce max size
# Edit config/debug-config.js: maxSize: '50MB'
```

## Best Practices

1. **Use the right tier for the job**
   - Basic for CI/CD pipelines
   - Detailed for debugging specific issues
   - Full for critical production bugs

2. **Monitor disk space**
   - Full mode can generate 100MB+ per test
   - Use shorter retention periods on CI
   - Clean up artifacts regularly

3. **Analyze logs systematically**
   - Start with the summary
   - Filter actions by success/failure
   - Use trace viewer for timeline analysis
   - Check screenshots for visual issues

4. **Preserve debug artifacts**
   - Increase retention for critical bugs
   - Copy artifacts before re-running tests
   - Use custom debug directories for different test runs

5. **Automate analysis**
   - Create scripts to parse actions.jsonl
   - Set up alerts for specific error patterns
   - Generate reports from debug data

---

**Debug Mode Version:** 1.0.0
**Last Updated:** 2025-11-16
**Status:** ✅ Production Ready
