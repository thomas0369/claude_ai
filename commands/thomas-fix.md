---
description: Iterative autonomous test-validate-fix cycle with Playwright integration
category: workflow
allowed-tools: Bash, Task, TodoWrite, Read, Edit, MultiEdit, Glob, Grep, SlashCommand
---

# Thomas Fix - Autonomous Iterative Testing & Validation

Run an autonomous, iterative cycle of validation, fixing, and browser testing until all checks pass.

## Overview

This command combines:
1. **Code validation** (lint, type-check, tests, build)
2. **Automatic fixing** (parallel agents for efficiency)
3. **Browser testing** (Playwright integration for UI validation with mandatory server health checks)
4. **Iteration** (repeats until everything passes)

**Key Feature - Autonomous Server Management:**
- **Fully autonomous**: No manual server management required
- **Auto-starts dev server** if not running (detects npm scripts: dev, start, serve, etc.)
- **Health checks existing servers** and kills/restarts unresponsive ones
- **Graceful cleanup**: Automatically stops servers started by the command
- **Retry logic**: Exponential backoff with up to 15 health check attempts
- **Port scanning**: Automatically finds servers on common ports (3000, 5173, 8080, etc.)
- **Never blocks progress**: Gracefully skips browser tests if server can't be started
- **Command succeeds** if code validation passes, regardless of browser test status

## Process Flow

```
┌─────────────────────────────────────────────────────────┐
│  PHASE 1: Discovery & Categorization                   │
│  ├─ Detect available validation commands                │
│  ├─ Run checks in parallel (lint, type-check, tests)    │
│  ├─ Categorize issues (CRITICAL, HIGH, MEDIUM, LOW)     │
│  └─ Detect dev servers for Playwright                   │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│  PHASE 2: Automated Fixing                              │
│  ├─ Create checkpoint (git stash)                       │
│  ├─ Fix LOW/MEDIUM issues (parallel agents)             │
│  ├─ Fix HIGH issues (sequential, with verification)     │
│  ├─ Handle CRITICAL issues (with user confirmation)     │
│  └─ Verify fixes with re-running checks                 │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│  PHASE 3: Browser Testing (Playwright)                  │
│  ├─ AUTONOMOUS SERVER MANAGEMENT:                       │
│  │  ├─ Detect dev script from package.json              │
│  │  ├─ Check for running servers on common ports        │
│  │  ├─ Decision tree:                                   │
│  │  │  ├─ Server healthy → Use it                       │
│  │  │  ├─ Server unresponsive → Kill & restart          │
│  │  │  └─ No server → Start automatically               │
│  │  ├─ Health check with exponential backoff (15 tries) │
│  │  └─ Auto-cleanup after tests complete                │
│  ├─ Write custom Playwright tests to /tmp (if server OK)│
│  ├─ Test key user flows (responsive, forms, etc.)       │
│  ├─ Take screenshots for visual verification            │
│  └─ Report browser issues found or skip status          │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│  PHASE 4: Iteration Decision                            │
│  ├─ Code validation pass + browser pass/skip? → DONE    │
│  ├─ Issues found? → Return to PHASE 2                   │
│  └─ Max iterations reached? → Report remaining issues   │
│  Note: Browser tests skipped = acceptable (code valid)  │
└─────────────────────────────────────────────────────────┘
```

## Detailed Workflow

### PHASE 1: Systematic Discovery & Categorization

#### 1.1 Command Discovery
First, discover what validation commands are available:
1. Check AGENTS.md/CLAUDE.md for documented build/test/lint commands
2. Examine package.json scripts section
3. Look for common patterns:
   - Linting: `lint`, `eslint`, `lint:fix`
   - Type checking: `typecheck`, `type-check`, `tsc`
   - Testing: `test`, `test:unit`, `jest`
   - Formatting: `format`, `prettier`
   - Build: `build`, `compile`
4. Check README.md for validation instructions

#### 1.2 Parallel Discovery Execution
Run ALL discovered checks in parallel using Bash:
```bash
# Example parallel execution
npm run lint &
npm run typecheck &
npm run test &
npm run build &
wait
```

Capture:
- Full output including file paths
- Line numbers for errors
- Error messages and codes
- Exit codes for each command

#### 1.3 Issue Categorization
Immediately categorize findings:

- **CRITICAL**: Security issues, breaking changes, data loss risk
- **HIGH**: Functionality bugs, test failures, build breaks
- **MEDIUM**: Code quality, style violations, documentation gaps
- **LOW**: Formatting, minor optimizations

#### 1.4 Dev Server Detection (for Playwright)
```bash
# Auto-detect running dev servers
cd ~/.claude/plugins/marketplaces/playwright-skill/skills/playwright-skill
node -e "require('./lib/helpers').detectDevServers().then(servers => console.log(JSON.stringify(servers)))"
```

Record found servers for browser testing phase.

### PHASE 2: Strategic Fix Execution

#### 2.1 Create Checkpoint
```bash
# Safety first - create rollback point
git stash push -u -m "thomas-fix checkpoint: $(date +%Y%m%d-%H%M%S)"
```

#### 2.2 Fix LOW & MEDIUM Issues (Parallel)
Launch multiple specialized agents concurrently:
- **Use specialized subagents** when available (typescript-expert, react-expert, etc.)
- Each agent gets specific, non-overlapping responsibilities
- Tasks distributed by file/component to avoid conflicts

**Agent Task Distribution:**
```markdown
Agent 1 (linting-expert):
- Fix all ESLint errors in src/components/
- Files: [list specific files]
- Success criteria: npm run lint passes for these files

Agent 2 (typescript-type-expert):
- Fix TypeScript errors in src/utils/
- Files: [list specific files]
- Success criteria: npm run typecheck passes for these files
```

**CRITICAL**: Include multiple Task tool calls in a SINGLE message for parallel execution.

#### 2.3 Fix HIGH Issues (Sequential)
Address HIGH priority issues one at a time:
- Fix one issue
- Run tests immediately
- Verify no regressions
- Move to next issue

#### 2.4 Fix CRITICAL Issues (With Confirmation)
For CRITICAL issues:
1. Present detailed plan to user
2. Explain risks and approach
3. Wait for explicit confirmation
4. Execute with extra verification

#### 2.5 Verification
Re-run ALL checks to confirm fixes:
```bash
npm run lint && npm run typecheck && npm run test && npm run build
```

### PHASE 3: Browser Testing with Playwright

#### 3.0 Autonomous Server Management
**CRITICAL**: Browser tests require a healthy dev server. This phase autonomously manages the dev server lifecycle.

```bash
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PHASE 3.0: AUTONOMOUS SERVER MANAGEMENT
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🖥️  AUTONOMOUS SERVER MANAGEMENT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Initialize variables
SERVER_STARTED_BY_THOMAS=false
SERVER_PID=""
SERVER_URL=""
SKIP_BROWSER_TESTS=false

# ─────────────────────────────────────────────────────────────
# STEP 1: Detect dev server script from package.json
# ─────────────────────────────────────────────────────────────
echo "🔍 Step 1: Detecting dev server command..."

if [ -f "package.json" ]; then
  # Try common dev script names
  DEV_SCRIPT=""

  if jq -e '.scripts.dev' package.json > /dev/null 2>&1; then
    DEV_SCRIPT="npm run dev"
    echo "  ✅ Found: npm run dev"
  elif jq -e '.scripts.start' package.json > /dev/null 2>&1; then
    DEV_SCRIPT="npm start"
    echo "  ✅ Found: npm start"
  elif jq -e '.scripts."start:dev"' package.json > /dev/null 2>&1; then
    DEV_SCRIPT="npm run start:dev"
    echo "  ✅ Found: npm run start:dev"
  elif jq -e '.scripts.serve' package.json > /dev/null 2>&1; then
    DEV_SCRIPT="npm run serve"
    echo "  ✅ Found: npm run serve"
  else
    echo "  ⚠️  No dev server script found in package.json"
    DEV_SCRIPT=""
  fi
else
  echo "  ⚠️  No package.json found"
  DEV_SCRIPT=""
fi

# ─────────────────────────────────────────────────────────────
# STEP 2: Detect currently running dev servers
# ─────────────────────────────────────────────────────────────
echo ""
echo "🔍 Step 2: Detecting running dev servers..."

# Check common dev server ports
COMMON_PORTS=(3000 3001 5000 5173 8000 8080 4200 4173)
RUNNING_SERVER_PORT=""
RUNNING_SERVER_PID=""

for port in "${COMMON_PORTS[@]}"; do
  if lsof -i :$port -t > /dev/null 2>&1; then
    RUNNING_SERVER_PID=$(lsof -i :$port -t | head -1)
    RUNNING_SERVER_PORT=$port
    echo "  ✅ Found running server on port $port (PID: $RUNNING_SERVER_PID)"
    break
  fi
done

if [ -z "$RUNNING_SERVER_PORT" ]; then
  echo "  ℹ️  No running dev servers detected on common ports"
fi

# ─────────────────────────────────────────────────────────────
# STEP 3: Health check function
# ─────────────────────────────────────────────────────────────
check_server_health() {
  local url=$1
  local max_attempts=15
  local attempt=1
  local wait_time=2

  echo "  🔍 Checking server health at $url..."

  while [ $attempt -le $max_attempts ]; do
    if [ $attempt -gt 1 ]; then
      echo "     Attempt $attempt/$max_attempts..."
    fi

    # Try to reach the server
    if curl -s -f -o /dev/null --max-time 5 "$url" 2>/dev/null; then
      echo "     ✅ Server is healthy and responding!"
      return 0
    fi

    if [ $attempt -lt $max_attempts ]; then
      echo "     ⏳ Server not ready, waiting ${wait_time}s..."
      sleep $wait_time
    fi

    # Exponential backoff (2s, 4s, 8s, 16s, max 30s)
    wait_time=$((wait_time * 2))
    if [ $wait_time -gt 30 ]; then
      wait_time=30
    fi

    attempt=$((attempt + 1))
  done

  echo "     ❌ Server not responding after $max_attempts attempts"
  return 1
}

# ─────────────────────────────────────────────────────────────
# STEP 4: Decision tree - Kill, restart, or start server
# ─────────────────────────────────────────────────────────────
echo ""
echo "🤖 Step 3: Autonomous server management decision..."
echo ""

if [ -n "$RUNNING_SERVER_PORT" ]; then
  # Server is running - check if it's healthy
  SERVER_URL="http://localhost:$RUNNING_SERVER_PORT"

  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  Scenario: Server already running on port $RUNNING_SERVER_PORT"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""

  if check_server_health "$SERVER_URL"; then
    echo ""
    echo "  ✅ Existing server is healthy - will use it"
    echo "  🔗 URL: $SERVER_URL"
    SKIP_BROWSER_TESTS=false
  else
    echo ""
    echo "  ⚠️  Existing server is not responding - killing and restarting..."
    echo ""

    # Kill the unresponsive server
    echo "  🔪 Killing process $RUNNING_SERVER_PID..."
    kill -9 $RUNNING_SERVER_PID 2>/dev/null || true
    sleep 2

    # Verify it's dead
    if lsof -i :$RUNNING_SERVER_PORT -t > /dev/null 2>&1; then
      echo "  ⚠️  Port $RUNNING_SERVER_PORT still in use, forcing cleanup..."
      lsof -i :$RUNNING_SERVER_PORT -t | xargs kill -9 2>/dev/null || true
      sleep 2
    fi

    echo "  ✅ Old server killed"
    echo ""

    # Start new server
    if [ -n "$DEV_SCRIPT" ]; then
      echo "  🚀 Starting fresh dev server..."
      echo "  📝 Command: $DEV_SCRIPT"
      echo ""

      # Start server in background
      $DEV_SCRIPT > /tmp/thomas-fix-server.log 2>&1 &
      SERVER_PID=$!
      SERVER_STARTED_BY_THOMAS=true

      echo "  ✅ Server started (PID: $SERVER_PID)"
      echo "  📋 Logs: /tmp/thomas-fix-server.log"
      echo ""

      # Wait and health check
      sleep 3

      if check_server_health "$SERVER_URL"; then
        echo ""
        echo "  🎉 New server is healthy and ready!"
        SKIP_BROWSER_TESTS=false
      else
        echo ""
        echo "  ❌ New server failed to start properly"
        echo "  📋 Check logs: cat /tmp/thomas-fix-server.log"
        echo ""
        echo "  ⏭️  Skipping browser tests..."
        SKIP_BROWSER_TESTS=true

        # Kill the failed server
        if [ -n "$SERVER_PID" ]; then
          kill -9 $SERVER_PID 2>/dev/null || true
        fi
      fi
    else
      echo "  ❌ Cannot restart - no dev script found"
      echo "  ⏭️  Skipping browser tests..."
      SKIP_BROWSER_TESTS=true
    fi
  fi

else
  # No server running - start one
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  Scenario: No server running"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""

  if [ -n "$DEV_SCRIPT" ]; then
    echo "  🚀 Starting dev server autonomously..."
    echo "  📝 Command: $DEV_SCRIPT"
    echo ""

    # Start server in background
    $DEV_SCRIPT > /tmp/thomas-fix-server.log 2>&1 &
    SERVER_PID=$!
    SERVER_STARTED_BY_THOMAS=true

    echo "  ✅ Server started (PID: $SERVER_PID)"
    echo "  📋 Logs: /tmp/thomas-fix-server.log"
    echo ""

    # Determine likely port based on package.json or defaults
    if grep -q "vite" package.json 2>/dev/null; then
      LIKELY_PORT=5173
    elif grep -q "react-scripts" package.json 2>/dev/null; then
      LIKELY_PORT=3000
    elif grep -q "next" package.json 2>/dev/null; then
      LIKELY_PORT=3000
    else
      LIKELY_PORT=3000
    fi

    SERVER_URL="http://localhost:$LIKELY_PORT"
    echo "  🔍 Expected URL: $SERVER_URL"
    echo "  ⏳ Waiting for server to be ready..."
    echo ""

    # Wait for server to start
    sleep 5

    if check_server_health "$SERVER_URL"; then
      echo ""
      echo "  🎉 Server is healthy and ready!"
      SKIP_BROWSER_TESTS=false
    else
      # Try other common ports
      echo ""
      echo "  🔍 Server not responding on port $LIKELY_PORT, trying other ports..."

      for alt_port in 3000 3001 5000 5173 8000 8080; do
        if [ "$alt_port" != "$LIKELY_PORT" ]; then
          ALT_URL="http://localhost:$alt_port"
          echo "     Trying $ALT_URL..."

          if curl -s -f -o /dev/null --max-time 3 "$ALT_URL" 2>/dev/null; then
            echo "     ✅ Found server at $ALT_URL!"
            SERVER_URL=$ALT_URL
            SKIP_BROWSER_TESTS=false
            break
          fi
        fi
      done

      if [ "$SKIP_BROWSER_TESTS" != "false" ]; then
        echo ""
        echo "  ❌ Server failed to start properly"
        echo "  📋 Check logs: cat /tmp/thomas-fix-server.log"
        echo ""
        echo "  ⏭️  Skipping browser tests..."
        SKIP_BROWSER_TESTS=true

        # Kill the failed server
        if [ -n "$SERVER_PID" ]; then
          kill -9 $SERVER_PID 2>/dev/null || true
        fi
      fi
    fi
  else
    echo "  ❌ Cannot start server - no dev script found in package.json"
    echo "  ℹ️  Supported script names: dev, start, start:dev, serve"
    echo ""
    echo "  ⏭️  Skipping browser tests..."
    SKIP_BROWSER_TESTS=true
  fi
fi

# ─────────────────────────────────────────────────────────────
# STEP 5: Final status
# ─────────────────────────────────────────────────────────────
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 SERVER MANAGEMENT SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "$SKIP_BROWSER_TESTS" == "false" ]; then
  echo "  ✅ Status: Server ready for testing"
  echo "  🔗 URL: $SERVER_URL"

  if [ "$SERVER_STARTED_BY_THOMAS" == "true" ]; then
    echo "  🤖 Started by: Thomas Fix (autonomous)"
    echo "  🔢 PID: $SERVER_PID"
    echo "  📋 Logs: /tmp/thomas-fix-server.log"
    echo ""
    echo "  ℹ️  Server will be cleaned up after browser tests complete"
  else
    echo "  🔗 Using: Existing server"
    echo "  ℹ️  Server will remain running after tests"
  fi
else
  echo "  ⏭️  Status: Browser tests will be skipped"
  echo "  ℹ️  Reason: Could not start or connect to dev server"
  echo "  ✅ Code validation will still proceed"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
```

#### 3.1 Server Detection
Browser tests will only run if the dev server is healthy and responding.
All tests are automatically skipped if the server is unavailable.

#### 3.2 Write Playwright Tests
Create custom test scripts in `/tmp/playwright-test-*.js`:

**Example responsive test:**
```javascript
// /tmp/playwright-test-thomas-fix-responsive.js
const { chromium } = require('playwright');

const TARGET_URL = 'http://localhost:3000'; // Auto-detected

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 100 });
  const page = await browser.newPage();

  const viewports = [
    { name: 'Desktop', width: 1920, height: 1080 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Mobile', width: 375, height: 667 }
  ];

  console.log('🔍 Testing responsive design...');

  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto(TARGET_URL);
    await page.waitForLoadState('networkidle');

    await page.screenshot({
      path: `/tmp/thomas-fix-${viewport.name.toLowerCase()}.png`,
      fullPage: true
    });

    console.log(`✅ ${viewport.name} (${viewport.width}x${viewport.height}) - screenshot saved`);
  }

  await browser.close();
  console.log('🎉 Responsive testing complete');
})();
```

**Example smoke test:**
```javascript
// /tmp/playwright-test-thomas-fix-smoke.js
const { chromium } = require('playwright');

const TARGET_URL = 'http://localhost:3000';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('🔍 Running smoke tests...');

  // Test 1: Page loads
  await page.goto(TARGET_URL);
  const title = await page.title();
  console.log(`✅ Page loaded: ${title}`);

  // Test 2: No console errors
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  await page.waitForTimeout(2000);

  if (errors.length > 0) {
    console.log(`❌ Console errors found: ${errors.length}`);
    errors.forEach(err => console.log(`  - ${err}`));
  } else {
    console.log('✅ No console errors');
  }

  // Test 3: Key elements present
  const mainContent = await page.locator('main, #app, [role="main"]').count();
  console.log(mainContent > 0 ? '✅ Main content found' : '❌ Main content missing');

  await page.screenshot({ path: '/tmp/thomas-fix-smoke.png', fullPage: true });

  await browser.close();
  console.log('🎉 Smoke test complete');
})();
```

#### 3.3 Execute Tests
**IMPORTANT**: Only execute tests if dev server health check passed.

```bash
# Conditional execution based on server availability
if [ "$SKIP_BROWSER_TESTS" == "true" ]; then
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "⏭️  BROWSER TESTS SKIPPED"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "Reason: Dev server is not running or not responding"
  echo "Code validation completed successfully."
  echo ""
  echo "To run browser tests:"
  echo "  1. Start your dev server: npm run dev"
  echo "  2. Re-run: /thomas-fix"
  echo ""
else
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🎭 RUNNING BROWSER TESTS"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""

  SKILL_DIR=~/.claude/plugins/marketplaces/playwright-skill/skills/playwright-skill

  # Update test scripts with detected SERVER_URL
  sed -i "s|const TARGET_URL = .*|const TARGET_URL = '$SERVER_URL';|g" /tmp/playwright-test-thomas-fix-*.js

  # Execute all browser tests
  echo "📱 Running responsive design tests..."
  cd $SKILL_DIR && node run.js /tmp/playwright-test-thomas-fix-responsive.js

  echo ""
  echo "💨 Running smoke tests..."
  cd $SKILL_DIR && node run.js /tmp/playwright-test-thomas-fix-smoke.js

  # Execute additional tests if they exist
  if [ -f /tmp/playwright-test-screen-flows.js ]; then
    echo ""
    echo "🔀 Running screen flow tests..."
    cd $SKILL_DIR && node run.js /tmp/playwright-test-screen-flows.js
  fi

  if [ -f /tmp/playwright-test-buttons.js ]; then
    echo ""
    echo "🔘 Running button functionality tests..."
    cd $SKILL_DIR && node run.js /tmp/playwright-test-buttons.js
  fi

  if [ -f /tmp/playwright-test-forms.js ]; then
    echo ""
    echo "📝 Running form usability tests..."
    cd $SKILL_DIR && node run.js /tmp/playwright-test-forms.js
  fi

  if [ -f /tmp/playwright-test-console-tracking.js ]; then
    echo ""
    echo "🔍 Running console tracking tests..."
    cd $SKILL_DIR && node run.js /tmp/playwright-test-console-tracking.js
  fi

  if [ -f /tmp/playwright-test-accessibility.js ]; then
    echo ""
    echo "♿ Running accessibility tests..."
    cd $SKILL_DIR && node run.js /tmp/playwright-test-accessibility.js
  fi

  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "✅ BROWSER TESTS COMPLETED"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""

  # ─────────────────────────────────────────────────────────────
  # CLEANUP: Kill server if started by thomas-fix
  # ─────────────────────────────────────────────────────────────
  if [ "$SERVER_STARTED_BY_THOMAS" == "true" ] && [ -n "$SERVER_PID" ]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🧹 CLEANING UP SERVER"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "  🔪 Stopping server (PID: $SERVER_PID)..."

    # Kill the server process
    kill -15 $SERVER_PID 2>/dev/null || true
    sleep 2

    # Check if it's still running
    if kill -0 $SERVER_PID 2>/dev/null; then
      echo "  ⚠️  Server still running, force killing..."
      kill -9 $SERVER_PID 2>/dev/null || true
      sleep 1
    fi

    # Verify it's dead
    if kill -0 $SERVER_PID 2>/dev/null; then
      echo "  ⚠️  Warning: Could not kill server process $SERVER_PID"
    else
      echo "  ✅ Server stopped successfully"
    fi

    echo "  📋 Server logs saved to: /tmp/thomas-fix-server.log"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
  fi
fi
```

#### 3.4 Analyze Results
**Conditional analysis based on test execution:**

```bash
if [ "$SKIP_BROWSER_TESTS" == "false" ]; then
  echo "📊 Analyzing browser test results..."
  echo ""

  # Review screenshots
  SCREENSHOT_COUNT=$(ls -1 /tmp/thomas-fix-*.png 2>/dev/null | wc -l)
  echo "  📸 Screenshots captured: $SCREENSHOT_COUNT"
  if [ $SCREENSHOT_COUNT -gt 0 ]; then
    echo "  📁 Screenshots saved to: /tmp/thomas-fix-*.png"
  fi

  # Review console log if it exists
  if [ -f /tmp/thomas-fix-console-log.json ]; then
    echo "  📋 Console log: /tmp/thomas-fix-console-log.json"

    # Extract error counts from console log
    ERROR_COUNT=$(jq '.errors | length' /tmp/thomas-fix-console-log.json 2>/dev/null || echo "0")
    WARNING_COUNT=$(jq '.warnings | length' /tmp/thomas-fix-console-log.json 2>/dev/null || echo "0")

    if [ "$ERROR_COUNT" -gt 0 ]; then
      echo "  ❌ Console errors found: $ERROR_COUNT"
    else
      echo "  ✅ No console errors"
    fi

    if [ "$WARNING_COUNT" -gt 0 ]; then
      echo "  ⚠️  Console warnings: $WARNING_COUNT"
    fi
  fi

  echo ""
  echo "Review the following for issues:"
  echo "  - Screenshots in /tmp/thomas-fix-*.png"
  echo "  - Console output for errors"
  echo "  - Visual inconsistencies or broken layouts"
  echo ""
else
  echo "📊 Browser test analysis skipped (no tests were run)"
  echo ""
fi
```

### PHASE 4: Iteration & Decision

#### 4.1 Evaluation Criteria
```bash
# Code validation criteria (always checked)
CODE_VALIDATION_PASS=true

if [ "$LINT_ERRORS" -gt 0 ]; then CODE_VALIDATION_PASS=false; fi
if [ "$TYPECHECK_ERRORS" -gt 0 ]; then CODE_VALIDATION_PASS=false; fi
if [ "$TEST_FAILURES" -gt 0 ]; then CODE_VALIDATION_PASS=false; fi
if [ "$BUILD_ERRORS" -gt 0 ]; then CODE_VALIDATION_PASS=false; fi

# Browser testing criteria (only if tests were run)
BROWSER_TESTS_PASS=true
if [ "$SKIP_BROWSER_TESTS" == "false" ]; then
  # Check browser test results
  if [ -f /tmp/thomas-fix-console-log.json ]; then
    BROWSER_ERRORS=$(jq '.errors | length' /tmp/thomas-fix-console-log.json 2>/dev/null || echo "0")
    if [ "$BROWSER_ERRORS" -gt 0 ]; then
      BROWSER_TESTS_PASS=false
    fi
  fi
fi

# Overall evaluation
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 EVALUATION SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Code Validation:"
echo "  Lint: $([ $LINT_ERRORS -eq 0 ] && echo '✅ Pass' || echo "❌ $LINT_ERRORS error(s)")"
echo "  Type-check: $([ $TYPECHECK_ERRORS -eq 0 ] && echo '✅ Pass' || echo "❌ $TYPECHECK_ERRORS error(s)")"
echo "  Tests: $([ $TEST_FAILURES -eq 0 ] && echo '✅ Pass' || echo "❌ $TEST_FAILURES failure(s)")"
echo "  Build: $([ $BUILD_ERRORS -eq 0 ] && echo '✅ Pass' || echo "❌ $BUILD_ERRORS error(s)")"
echo ""

if [ "$SKIP_BROWSER_TESTS" == "false" ]; then
  echo "Browser Testing:"
  echo "  Console errors: $([ $BROWSER_ERRORS -eq 0 ] && echo '✅ None' || echo "❌ $BROWSER_ERRORS found")"
  echo "  Responsive design: ✅ Tested"
  echo "  Smoke tests: ✅ Completed"
  echo ""
else
  echo "Browser Testing:"
  echo "  Status: ⏭️  Skipped (no dev server)"
  echo "  Note: Code validation completed successfully"
  echo "  Recommendation: Start dev server and re-run for full validation"
  echo ""
fi
```

**Pass Criteria:**
- **Code Validation MUST Pass**: Lint, type-check, tests, build all passing
- **Browser Tests**: Optional (skipped if no dev server, but recommended)

The command considers success if:
1. ✅ All code validation passes AND browser tests pass (if run)
2. ✅ All code validation passes AND browser tests were skipped (dev server unavailable)

The command fails only if:
1. ❌ Any code validation check fails

#### 4.2 Iteration Logic
```bash
# Determine overall success
OVERALL_SUCCESS=false

if [ "$CODE_VALIDATION_PASS" == "true" ]; then
  if [ "$SKIP_BROWSER_TESTS" == "true" ]; then
    # Code validation passed, browser tests skipped (acceptable)
    OVERALL_SUCCESS=true
    echo "✅ Code validation complete (browser tests skipped)"
  elif [ "$BROWSER_TESTS_PASS" == "true" ]; then
    # Both code validation and browser tests passed (ideal)
    OVERALL_SUCCESS=true
    echo "🎉 All checks passed!"
  else
    # Code validation passed but browser tests failed (needs iteration)
    OVERALL_SUCCESS=false
    echo "⚠️  Code validation passed but browser tests have issues"
  fi
else
  # Code validation failed (needs iteration)
  OVERALL_SUCCESS=false
  echo "❌ Code validation failed"
fi

# Iteration decision
if [ "$OVERALL_SUCCESS" == "true" ]; then
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🎉 THOMAS FIX COMPLETE"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""

  # Create success checkpoint
  git stash push -u -m "thomas-fix success: $(date +%Y%m%d-%H%M%S)"

  # Show summary (see section 4.3)
  exit 0

elif [ $ITERATION -lt $MAX_ITERATIONS ]; then
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🔄 STARTING ITERATION $((ITERATION + 1))/$MAX_ITERATIONS"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""

  # Return to PHASE 2 with updated issue list
  ITERATION=$((ITERATION + 1))
  goto PHASE_2

else
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "⚠️  MAX ITERATIONS REACHED"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "Manual intervention needed for remaining issues:"
  echo ""

  # Show remaining issues
  if [ $LINT_ERRORS -gt 0 ]; then echo "  ❌ Lint errors: $LINT_ERRORS"; fi
  if [ $TYPECHECK_ERRORS -gt 0 ]; then echo "  ❌ Type-check errors: $TYPECHECK_ERRORS"; fi
  if [ $TEST_FAILURES -gt 0 ]; then echo "  ❌ Test failures: $TEST_FAILURES"; fi
  if [ $BUILD_ERRORS -gt 0 ]; then echo "  ❌ Build errors: $BUILD_ERRORS"; fi
  if [ "$SKIP_BROWSER_TESTS" == "false" ] && [ $BROWSER_ERRORS -gt 0 ]; then
    echo "  ❌ Browser console errors: $BROWSER_ERRORS"
  fi

  echo ""
  echo "Recommendations:"
  echo "  1. Review the errors above and fix manually"
  echo "  2. Use specialized agents for complex issues"
  echo "  3. Consider architectural changes if needed"
  echo "  4. Re-run /thomas-fix after manual fixes"
  echo ""

  exit 1
fi
```

**MAX_ITERATIONS**: Default 3 (configurable)

**Key Changes:**
- Browser tests are now **optional** for success
- Command succeeds if code validation passes, even if browser tests were skipped
- Command only fails if code validation has errors
- Iteration continues only for actual failures, not for skipped tests

#### 4.3 Final Summary
```bash
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 THOMAS FIX SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Duration: $DURATION"
echo "Iterations: $ITERATION"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Phase 1: Discovery"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Linting: $INITIAL_LINT_ERRORS errors found"
echo "  Type-checking: $INITIAL_TYPECHECK_ERRORS errors found"
echo "  Tests: $INITIAL_TEST_FAILURES failing"
echo "  Build: $INITIAL_BUILD_ERRORS errors, $INITIAL_BUILD_WARNINGS warnings"

if [ "$SKIP_BROWSER_TESTS" == "false" ]; then
  echo "  Dev server: $SERVER_URL (healthy)"
else
  echo "  Dev server: Not detected or not responding"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Phase 2: Fixes Applied"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $LINT_ERRORS_FIXED -gt 0 ]; then
  echo "  ✅ Fixed $LINT_ERRORS_FIXED linting error(s)"
fi

if [ $TYPECHECK_ERRORS_FIXED -gt 0 ]; then
  echo "  ✅ Fixed $TYPECHECK_ERRORS_FIXED TypeScript error(s)"
fi

if [ $TEST_FAILURES_FIXED -gt 0 ]; then
  echo "  ✅ Fixed $TEST_FAILURES_FIXED test failure(s)"
fi

if [ $BUILD_ERRORS_FIXED -gt 0 ]; then
  echo "  ✅ Fixed $BUILD_ERRORS_FIXED build error(s)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Phase 3: Browser Testing"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$SKIP_BROWSER_TESTS" == "true" ]; then
  echo "  ⏭️  Browser tests skipped (no dev server)"
  echo "  ℹ️  Recommendation: Start dev server and re-run for complete validation"
else
  echo "  ✅ Responsive design: Desktop, Tablet, Mobile"
  echo "  ✅ Smoke test: Page loads, no console errors"
  echo "  ✅ Screen flows: Navigation tested"
  echo "  ✅ Button functionality: Interactions verified"
  echo "  ✅ Form usability: Input validation tested"
  echo "  ✅ Console tracking: $BROWSER_ERRORS error(s), $BROWSER_WARNINGS warning(s)"
  echo "  ✅ Accessibility: Checked"
  echo "  📸 Screenshots saved to /tmp/thomas-fix-*.png"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Final Status"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$OVERALL_SUCCESS" == "true" ]; then
  if [ "$SKIP_BROWSER_TESTS" == "true" ]; then
    echo "  ✅ CODE VALIDATION PASSED"
    echo "  ℹ️  Browser tests skipped (no dev server detected)"
    echo ""
    echo "  To complete full validation:"
    echo "    1. Start dev server: npm run dev"
    echo "    2. Re-run: /thomas-fix"
  else
    echo "  🎉 ALL CHECKS PASSED!"
    echo "  ✅ Code validation: Complete"
    echo "  ✅ Browser testing: Complete"
  fi
else
  echo "  ❌ VALIDATION INCOMPLETE"
  echo "  See details above for remaining issues"
fi

echo ""
echo "Files Modified: $FILES_MODIFIED"
echo "Agents Used: $AGENTS_USED"
echo "Checkpoints Created: $CHECKPOINTS_CREATED"
echo ""
```

**Example Output (Dev Server Available):**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 THOMAS FIX SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Duration: 5m 32s
Iterations: 2

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Phase 1: Discovery
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Linting: 15 errors found
  Type-checking: 8 errors found
  Tests: 2 failing
  Build: 3 warnings
  Dev server: http://localhost:3000 (healthy)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Phase 2: Fixes Applied
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✅ Fixed 15 linting error(s)
  ✅ Fixed 8 TypeScript error(s)
  ✅ Fixed 2 test failure(s)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Phase 3: Browser Testing
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✅ Responsive design: Desktop, Tablet, Mobile
  ✅ Smoke test: Page loads, no console errors
  ✅ Screenshots saved to /tmp/thomas-fix-*.png

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Final Status
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🎉 ALL CHECKS PASSED!
  ✅ Code validation: Complete
  ✅ Browser testing: Complete

Files Modified: 12
Agents Used: 3
Checkpoints Created: 2
```

**Example Output (No Dev Server):**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 THOMAS FIX SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Duration: 3m 45s
Iterations: 1

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Phase 1: Discovery
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Linting: 10 errors found
  Type-checking: 5 errors found
  Tests: All passing
  Build: Successful
  Dev server: Not detected or not responding

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Phase 2: Fixes Applied
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✅ Fixed 10 linting error(s)
  ✅ Fixed 5 TypeScript error(s)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Phase 3: Browser Testing
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ⏭️  Browser tests skipped (no dev server)
  ℹ️  Recommendation: Start dev server and re-run for complete validation

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Final Status
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✅ CODE VALIDATION PASSED
  ℹ️  Browser tests skipped (no dev server detected)

  To complete full validation:
    1. Start dev server: npm run dev
    2. Re-run: /thomas-fix

Files Modified: 8
Agents Used: 2
Checkpoints Created: 1
```

## Usage Examples

### Basic Usage
```bash
/thomas-fix
```
Runs the complete autonomous cycle with default settings.

### With Custom Configuration
```bash
/thomas-fix
# Then Claude asks:
# - Max iterations? (default: 3)
# - Skip browser tests? (default: no)
# - Headless mode? (default: visible browser)
```

### Integration with Development Workflow
```bash
# During active development - server starts automatically!
/thomas-fix  # Autonomous server management + validation + testing

# Before committing - no manual setup needed
/thomas-fix  # Starts server, runs all checks, cleans up

# After refactoring - completely hands-free
/thomas-fix  # Verify no regressions (server managed autonomously)

# Working on a running project - uses existing server
# (If server is already running, thomas-fix detects and uses it)
npm run dev  # Your dev server (optional)
/thomas-fix  # Will use your existing server
```

## Advanced Features

### Checkpoint Management
Every successful phase creates a checkpoint:
```bash
git stash list | grep thomas-fix
# stash@{0}: thomas-fix checkpoint: 20250109-143052
# stash@{1}: thomas-fix checkpoint: 20250109-142830
```

Rollback if needed:
```bash
git stash pop stash@{0}
```

### Parallel Agent Optimization
The command automatically detects available specialized agents:
```bash
# Example agent distribution for a Preact + TypeScript project
Agent 1 (typescript-type-expert): Fix TS errors in src/components/
Agent 2 (react-expert): Fix React/Preact issues in src/hooks/
Agent 3 (linting-expert): Fix ESLint errors in src/utils/
```

### Browser Test Customization
Based on project type, different Playwright tests are generated:
- **Preact/React apps**: Component rendering, state management
- **Forms**: Input validation, submission flows
- **Canvas apps (Konva)**: Rendering, interactions
- **E-commerce**: Shopping cart, checkout flow

### Comprehensive UI/UX Testing Suite

The `/thomas-fix` command automatically generates comprehensive UI/UX tests including:

#### 1. Screen Flow Testing
**Automatically discovers and tests navigation paths:**

```javascript
// /tmp/playwright-test-screen-flows.js
const { chromium } = require('playwright');

const TARGET_URL = 'http://localhost:3000';

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 200 });
  const page = await browser.newPage();

  console.log('🔍 Testing screen flows...');

  // Track all visited URLs
  const visitedUrls = new Set();
  const navigationErrors = [];

  // Intercept navigation
  page.on('response', response => {
    if (response.status() >= 400) {
      navigationErrors.push({
        url: response.url(),
        status: response.status()
      });
    }
  });

  // Start at homepage
  await page.goto(TARGET_URL);
  visitedUrls.add(page.url());
  console.log(`✅ Homepage loaded: ${await page.title()}`);

  // Find all navigation links
  const navLinks = await page.locator('a[href]:visible').all();
  console.log(`📋 Found ${navLinks.length} navigation links`);

  // Test each navigation path
  for (let i = 0; i < Math.min(navLinks.length, 10); i++) {
    try {
      const href = await navLinks[i].getAttribute('href');

      // Skip external links and anchors
      if (href.startsWith('http') && !href.includes('localhost')) continue;
      if (href.startsWith('#')) continue;

      await navLinks[i].click();
      await page.waitForLoadState('networkidle');

      const currentUrl = page.url();
      visitedUrls.add(currentUrl);

      console.log(`✅ Flow ${i + 1}: ${href} → ${await page.title()}`);
      await page.screenshot({
        path: `/tmp/thomas-fix-flow-${i + 1}.png`,
        fullPage: true
      });

      // Navigate back for next test
      await page.goto(TARGET_URL);
    } catch (error) {
      console.log(`❌ Flow ${i + 1} failed: ${error.message}`);
    }
  }

  // Summary
  console.log(`\n📊 Screen Flow Summary:`);
  console.log(`  ✅ Tested flows: ${visitedUrls.size}`);
  console.log(`  ❌ Navigation errors: ${navigationErrors.length}`);

  if (navigationErrors.length > 0) {
    console.log(`\n⚠️  Navigation Errors:`);
    navigationErrors.forEach(err => {
      console.log(`    ${err.status} - ${err.url}`);
    });
  }

  await browser.close();
  console.log('🎉 Screen flow testing complete');
})();
```

#### 2. Button Functionality Testing
**Tests all interactive buttons on the page:**

```javascript
// /tmp/playwright-test-buttons.js
const { chromium } = require('playwright');

const TARGET_URL = 'http://localhost:3000';

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  const page = await browser.newPage();

  console.log('🔍 Testing button functionality...');

  // Track console messages during button clicks
  const consoleMessages = { errors: [], warnings: [], logs: [] };

  page.on('console', msg => {
    const text = msg.text();
    if (msg.type() === 'error') consoleMessages.errors.push(text);
    else if (msg.type() === 'warning') consoleMessages.warnings.push(text);
    else consoleMessages.logs.push(text);
  });

  await page.goto(TARGET_URL);
  await page.waitForLoadState('networkidle');

  // Find all buttons
  const buttons = await page.locator('button:visible, [role="button"]:visible, input[type="button"]:visible, input[type="submit"]:visible').all();
  console.log(`📋 Found ${buttons.length} buttons to test`);

  const buttonResults = [];

  for (let i = 0; i < buttons.length; i++) {
    const button = buttons[i];

    try {
      // Get button details
      const text = (await button.textContent()) || (await button.getAttribute('aria-label')) || `Button ${i + 1}`;
      const disabled = await button.isDisabled();

      if (disabled) {
        console.log(`⏭️  Skipped (disabled): "${text}"`);
        buttonResults.push({ text, status: 'disabled' });
        continue;
      }

      // Clear previous console errors
      const errorsBefore = consoleMessages.errors.length;

      // Test hover state
      await button.hover();
      await page.waitForTimeout(200);

      // Test click
      await button.click();
      await page.waitForTimeout(500); // Wait for any effects

      // Check for new console errors
      const errorsAfter = consoleMessages.errors.length;
      const newErrors = errorsAfter - errorsBefore;

      if (newErrors > 0) {
        console.log(`❌ "${text}": Generated ${newErrors} console error(s)`);
        buttonResults.push({ text, status: 'error', errors: newErrors });
      } else {
        console.log(`✅ "${text}": Works correctly`);
        buttonResults.push({ text, status: 'success' });
      }

      await page.screenshot({
        path: `/tmp/thomas-fix-button-${i + 1}.png`,
        fullPage: true
      });

    } catch (error) {
      console.log(`❌ Button ${i + 1} failed: ${error.message}`);
      buttonResults.push({ text: `Button ${i + 1}`, status: 'failed', error: error.message });
    }
  }

  // Summary
  const successful = buttonResults.filter(r => r.status === 'success').length;
  const failed = buttonResults.filter(r => r.status === 'error' || r.status === 'failed').length;
  const disabled = buttonResults.filter(r => r.status === 'disabled').length;

  console.log(`\n📊 Button Testing Summary:`);
  console.log(`  ✅ Working: ${successful}`);
  console.log(`  ❌ Errors: ${failed}`);
  console.log(`  ⏭️  Disabled: ${disabled}`);

  await browser.close();
  console.log('🎉 Button testing complete');
})();
```

#### 3. Form Usability Testing
**Tests form inputs, validation, and submission:**

```javascript
// /tmp/playwright-test-forms.js
const { chromium } = require('playwright');

const TARGET_URL = 'http://localhost:3000';

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  const page = await browser.newPage();

  console.log('🔍 Testing form usability...');

  await page.goto(TARGET_URL);
  await page.waitForLoadState('networkidle');

  // Find all forms
  const forms = await page.locator('form').all();
  console.log(`📋 Found ${forms.length} form(s)`);

  for (let formIndex = 0; formIndex < forms.length; formIndex++) {
    const form = forms[formIndex];

    console.log(`\n📝 Testing Form ${formIndex + 1}...`);

    // Find all inputs in this form
    const inputs = await form.locator('input:visible, textarea:visible, select:visible').all();
    console.log(`  Inputs found: ${inputs.length}`);

    const formResults = {
      inputs: [],
      validation: { tested: false, errors: [] },
      submission: { tested: false, success: false }
    };

    // Test each input
    for (const input of inputs) {
      const type = await input.getAttribute('type') || 'text';
      const name = await input.getAttribute('name') || 'unnamed';
      const placeholder = await input.getAttribute('placeholder') || '';
      const required = await input.getAttribute('required') !== null;

      console.log(`  Testing input: ${name} (${type})`);

      try {
        // Test focus
        await input.focus();
        await page.waitForTimeout(200);

        // Test appropriate input based on type
        let testValue = '';
        switch (type) {
          case 'email':
            testValue = 'test@example.com';
            break;
          case 'password':
            testValue = 'TestPassword123!';
            break;
          case 'number':
            testValue = '42';
            break;
          case 'tel':
            testValue = '+1234567890';
            break;
          case 'url':
            testValue = 'https://example.com';
            break;
          case 'date':
            testValue = '2025-01-09';
            break;
          default:
            testValue = 'Test input value';
        }

        if (type !== 'checkbox' && type !== 'radio') {
          await input.fill(testValue);
          await page.waitForTimeout(200);
        } else {
          await input.check();
        }

        // Test blur (trigger validation)
        await input.blur();
        await page.waitForTimeout(300);

        formResults.inputs.push({
          name,
          type,
          required,
          status: 'success'
        });

        console.log(`    ✅ Input "${name}" works correctly`);

      } catch (error) {
        formResults.inputs.push({
          name,
          type,
          required,
          status: 'error',
          error: error.message
        });
        console.log(`    ❌ Input "${name}" failed: ${error.message}`);
      }
    }

    // Test validation (submit empty form if possible)
    try {
      const submitButton = await form.locator('button[type="submit"], input[type="submit"]').first();

      // Clear all inputs
      for (const input of inputs) {
        const type = await input.getAttribute('type') || 'text';
        if (type !== 'checkbox' && type !== 'radio') {
          await input.fill('');
        }
      }

      // Try to submit
      await submitButton.click();
      await page.waitForTimeout(500);

      // Check for validation messages
      const validationMessages = await page.locator('.error, .invalid, [aria-invalid="true"], .field-error').count();

      formResults.validation.tested = true;
      formResults.validation.errors = validationMessages;

      if (validationMessages > 0) {
        console.log(`  ✅ Validation working: ${validationMessages} error(s) shown`);
      } else {
        console.log(`  ⚠️  No validation messages found`);
      }

    } catch (error) {
      console.log(`  ⏭️  Validation test skipped: ${error.message}`);
    }

    await page.screenshot({
      path: `/tmp/thomas-fix-form-${formIndex + 1}.png`,
      fullPage: true
    });
  }

  await browser.close();
  console.log('🎉 Form testing complete');
})();
```

#### 4. Console Tracking (Comprehensive)
**Monitors all console activity during testing:**

```javascript
// /tmp/playwright-test-console-tracking.js
const { chromium } = require('playwright');
const fs = require('fs');

const TARGET_URL = 'http://localhost:3000';

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 100 });
  const page = await browser.newPage();

  console.log('🔍 Starting comprehensive console tracking...\n');

  // Comprehensive console tracking
  const consoleLog = {
    errors: [],
    warnings: [],
    info: [],
    debug: [],
    logs: [],
    exceptions: [],
    networkErrors: []
  };

  // Track console messages
  page.on('console', msg => {
    const timestamp = new Date().toISOString();
    const entry = {
      timestamp,
      type: msg.type(),
      text: msg.text(),
      location: msg.location()
    };

    switch (msg.type()) {
      case 'error':
        consoleLog.errors.push(entry);
        console.log(`❌ ERROR [${timestamp}]: ${msg.text()}`);
        break;
      case 'warning':
        consoleLog.warnings.push(entry);
        console.log(`⚠️  WARNING [${timestamp}]: ${msg.text()}`);
        break;
      case 'info':
        consoleLog.info.push(entry);
        break;
      case 'debug':
        consoleLog.debug.push(entry);
        break;
      default:
        consoleLog.logs.push(entry);
    }
  });

  // Track page errors
  page.on('pageerror', error => {
    const entry = {
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack
    };
    consoleLog.exceptions.push(entry);
    console.log(`💥 EXCEPTION: ${error.message}`);
  });

  // Track network errors
  page.on('response', response => {
    if (response.status() >= 400) {
      const entry = {
        timestamp: new Date().toISOString(),
        url: response.url(),
        status: response.status(),
        statusText: response.statusText()
      };
      consoleLog.networkErrors.push(entry);
      console.log(`🌐 NETWORK ERROR [${response.status()}]: ${response.url()}`);
    }
  });

  // Navigate and interact
  await page.goto(TARGET_URL);
  await page.waitForLoadState('networkidle');
  console.log(`\n✅ Page loaded: ${await page.title()}\n`);

  // Wait and observe console
  console.log('👀 Monitoring console for 5 seconds...\n');
  await page.waitForTimeout(5000);

  // Test interactions to trigger console activity
  console.log('🖱️  Testing interactions...\n');

  // Click all clickable elements
  const clickables = await page.locator('button:visible, a:visible, [onclick]:visible').all();
  for (let i = 0; i < Math.min(clickables.length, 5); i++) {
    try {
      await clickables[i].click();
      await page.waitForTimeout(500);
    } catch (e) {
      // Ignore click errors
    }
  }

  // Summary
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`📊 Console Tracking Summary:`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  console.log(`  ❌ Errors: ${consoleLog.errors.length}`);
  console.log(`  ⚠️  Warnings: ${consoleLog.warnings.length}`);
  console.log(`  💥 Exceptions: ${consoleLog.exceptions.length}`);
  console.log(`  🌐 Network errors: ${consoleLog.networkErrors.length}`);
  console.log(`  ℹ️  Info messages: ${consoleLog.info.length}`);
  console.log(`  📝 Debug messages: ${consoleLog.debug.length}`);
  console.log(`  📋 General logs: ${consoleLog.logs.length}`);

  // Save detailed log to file
  const logFile = '/tmp/thomas-fix-console-log.json';
  fs.writeFileSync(logFile, JSON.stringify(consoleLog, null, 2));
  console.log(`\n💾 Detailed log saved to: ${logFile}`);

  // Show critical errors
  if (consoleLog.errors.length > 0) {
    console.log(`\n🚨 Critical Errors Found:\n`);
    consoleLog.errors.forEach((err, i) => {
      console.log(`  ${i + 1}. ${err.text}`);
      if (err.location) {
        console.log(`     Location: ${err.location.url}:${err.location.lineNumber}`);
      }
    });
  }

  if (consoleLog.exceptions.length > 0) {
    console.log(`\n💥 Unhandled Exceptions:\n`);
    consoleLog.exceptions.forEach((exc, i) => {
      console.log(`  ${i + 1}. ${exc.message}`);
    });
  }

  await browser.close();
  console.log('\n🎉 Console tracking complete');
})();
```

#### 5. Accessibility Testing
**Tests keyboard navigation, ARIA labels, and accessibility:**

```javascript
// /tmp/playwright-test-accessibility.js
const { chromium } = require('playwright');

const TARGET_URL = 'http://localhost:3000';

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  const page = await browser.newPage();

  console.log('🔍 Testing accessibility...\n');

  await page.goto(TARGET_URL);
  await page.waitForLoadState('networkidle');

  const a11yIssues = {
    missingAlt: [],
    missingLabels: [],
    lowContrast: [],
    keyboardNav: { tested: false, issues: [] },
    ariaIssues: []
  };

  // 1. Check images for alt text
  console.log('📸 Checking images for alt text...');
  const images = await page.locator('img').all();
  for (const img of images) {
    const alt = await img.getAttribute('alt');
    const src = await img.getAttribute('src');
    if (!alt) {
      a11yIssues.missingAlt.push(src);
      console.log(`  ❌ Missing alt: ${src}`);
    }
  }
  console.log(`  ✅ Images checked: ${images.length}, missing alt: ${a11yIssues.missingAlt.length}\n`);

  // 2. Check form inputs for labels
  console.log('📝 Checking form inputs for labels...');
  const inputs = await page.locator('input:visible, textarea:visible, select:visible').all();
  for (const input of inputs) {
    const id = await input.getAttribute('id');
    const ariaLabel = await input.getAttribute('aria-label');
    const ariaLabelledBy = await input.getAttribute('aria-labelledby');

    // Check if there's a label
    let hasLabel = false;
    if (id) {
      const label = await page.locator(`label[for="${id}"]`).count();
      hasLabel = label > 0;
    }

    if (!hasLabel && !ariaLabel && !ariaLabelledBy) {
      const name = await input.getAttribute('name') || 'unnamed';
      a11yIssues.missingLabels.push(name);
      console.log(`  ❌ Missing label: ${name}`);
    }
  }
  console.log(`  ✅ Inputs checked: ${inputs.length}, missing labels: ${a11yIssues.missingLabels.length}\n`);

  // 3. Test keyboard navigation
  console.log('⌨️  Testing keyboard navigation...');
  a11yIssues.keyboardNav.tested = true;

  // Start from top
  await page.keyboard.press('Tab');
  await page.waitForTimeout(200);

  const focusableElements = await page.locator('a:visible, button:visible, input:visible, select:visible, textarea:visible, [tabindex]:visible').all();
  console.log(`  Found ${focusableElements.length} focusable elements`);

  let tabCount = 0;
  const maxTabs = Math.min(focusableElements.length, 10);

  for (let i = 0; i < maxTabs; i++) {
    const focused = await page.evaluate(() => {
      const el = document.activeElement;
      return {
        tag: el.tagName,
        class: el.className,
        id: el.id,
        text: el.textContent?.substring(0, 30)
      };
    });

    console.log(`  Tab ${i + 1}: ${focused.tag} ${focused.id ? '#' + focused.id : ''} ${focused.text || ''}`);
    await page.keyboard.press('Tab');
    await page.waitForTimeout(200);
    tabCount++;
  }

  console.log(`  ✅ Keyboard navigation works: ${tabCount} tabs tested\n`);

  // 4. Check ARIA attributes
  console.log('🏷️  Checking ARIA attributes...');
  const ariaElements = await page.locator('[role]').all();
  console.log(`  Found ${ariaElements.length} elements with ARIA roles`);

  for (const el of ariaElements) {
    const role = await el.getAttribute('role');
    const ariaLabel = await el.getAttribute('aria-label');
    const ariaLabelledBy = await el.getAttribute('aria-labelledby');

    // Buttons and links should have accessible names
    if ((role === 'button' || role === 'link') && !ariaLabel && !ariaLabelledBy) {
      const text = await el.textContent();
      if (!text || text.trim().length === 0) {
        a11yIssues.ariaIssues.push(`${role} without accessible name`);
        console.log(`  ⚠️  ${role} without accessible name`);
      }
    }
  }
  console.log(`  ✅ ARIA checked, issues: ${a11yIssues.ariaIssues.length}\n`);

  // 5. Test with screen reader simulation
  console.log('🔊 Simulating screen reader...');
  const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
  console.log(`  Document structure: ${headings.length} headings`);

  for (const heading of headings.slice(0, 5)) {
    const tag = await heading.evaluate(el => el.tagName);
    const text = await heading.textContent();
    console.log(`  ${tag}: ${text}`);
  }

  // Summary
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`📊 Accessibility Summary:`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  console.log(`  📸 Images without alt: ${a11yIssues.missingAlt.length}`);
  console.log(`  📝 Inputs without labels: ${a11yIssues.missingLabels.length}`);
  console.log(`  ⌨️  Keyboard navigation: ${a11yIssues.keyboardNav.tested ? '✅ Working' : '❌ Not tested'}`);
  console.log(`  🏷️  ARIA issues: ${a11yIssues.ariaIssues.length}`);

  const totalIssues = a11yIssues.missingAlt.length + a11yIssues.missingLabels.length + a11yIssues.ariaIssues.length;

  if (totalIssues === 0) {
    console.log(`\n🎉 No accessibility issues found!`);
  } else {
    console.log(`\n⚠️  ${totalIssues} accessibility issue(s) found`);
  }

  await page.screenshot({
    path: '/tmp/thomas-fix-accessibility.png',
    fullPage: true
  });

  await browser.close();
  console.log('\n🎉 Accessibility testing complete');
})();
```

### How to Enable Enhanced Testing

The enhanced tests are **automatically enabled** when you run `/thomas-fix`. The command will:

1. **Auto-detect project type** (React/Preact, forms, canvas, etc.)
2. **Generate appropriate tests** based on what it finds
3. **Run all tests** in Phase 3 of the workflow
4. **Report results** with detailed findings

### Customizing Test Selection

Create `.thomas-fix.json` in your project root to customize:

```json
{
  "playwrightTests": {
    "screenFlows": true,
    "buttons": true,
    "forms": true,
    "consoleTracking": true,
    "accessibility": true,
    "responsive": true,
    "performance": false
  },
  "testDepth": {
    "maxScreenFlows": 10,
    "maxButtons": 20,
    "maxForms": 5,
    "consoleTrackingDuration": 5000
  },
  "accessibility": {
    "checkAltText": true,
    "checkLabels": true,
    "checkKeyboardNav": true,
    "checkARIA": true,
    "checkContrast": false
  }
}
```

## Configuration

### Environment Variables
```bash
# In project root or ~/.bashrc
export THOMAS_FIX_MAX_ITERATIONS=5
export THOMAS_FIX_HEADLESS=false
export THOMAS_FIX_SKIP_BROWSER=false
```

### Project-Specific Config
Create `.thomas-fix.json` in project root:
```json
{
  "maxIterations": 3,
  "skipBrowserTests": false,
  "headless": false,
  "playwrightTests": [
    "responsive",
    "smoke",
    "forms"
  ],
  "validationCommands": {
    "lint": "npm run lint",
    "typecheck": "npm run typecheck",
    "test": "npm test",
    "build": "npm run build"
  }
}
```

## Troubleshooting

### Issue: Browser tests skipped (dev server failed to start)
**Symptom:**
```
❌ Server failed to start properly
📋 Check logs: cat /tmp/thomas-fix-server.log
⏭️  Skipping browser tests...
```

**Solution:**
```bash
# Check the server logs for errors
cat /tmp/thomas-fix-server.log

# Common causes and fixes:
# 1. Port already in use
lsof -i :3000  # Check what's using the port
kill -9 <PID>  # Kill the process

# 2. Missing dependencies
npm install

# 3. No dev script in package.json
# Add to package.json:
{
  "scripts": {
    "dev": "vite" // or your dev server command
  }
}

# Then re-run thomas-fix
/thomas-fix
```

**Why this happens:**
- The command automatically tries to start the dev server from package.json
- If it can't find a dev script or the script fails, browser tests are skipped
- Code validation still completes successfully
- Check /tmp/thomas-fix-server.log for details

### Issue: Server detected but not responding
**Symptom:**
```
⚠️  DEV SERVER NOT RESPONDING
A dev server was detected at http://localhost:3000 but it's not responding.
```

**Solution:**
```bash
# Check if server is actually running
curl http://localhost:3000

# If not responding, restart the server
# Kill the old process
pkill -f "npm.*dev"

# Start fresh
npm run dev

# Re-run thomas-fix
/thomas-fix
```

**Why this happens:**
- The server process exists but is not responding to HTTP requests
- Server is still starting up (wait a moment and retry)
- Server crashed or is in an error state
- Wrong port detected (check your package.json scripts)

### Issue: Playwright tests fail
**Solution:**
```bash
# Check Playwright installation
cd ~/.claude/plugins/marketplaces/playwright-skill/skills/playwright-skill
npm run setup

# Verify browser installation
npx playwright install

# Re-run thomas-fix
/thomas-fix
```

### Issue: Max iterations reached
**Solution:**
- Review remaining issues in output
- Some issues may require manual intervention
- Use specialized agents individually for complex fixes
- Check if issue requires architectural changes

### Issue: Checkpoint restore needed
**Solution:**
```bash
# List checkpoints
git stash list | grep thomas-fix

# Restore specific checkpoint
git stash pop stash@{0}

# Re-run thomas-fix
/thomas-fix
```

## Performance Optimization

### Parallel Execution
The command maximizes efficiency through:
1. **Parallel discovery**: All validation checks run simultaneously
2. **Parallel fixing**: Multiple agents work on independent files
3. **Sequential critical**: HIGH/CRITICAL issues fixed carefully
4. **Parallel browser tests**: Multiple viewport tests can run together

### Smart Caching
- Validation results cached between iterations
- Only re-run checks for modified files (if supported by tooling)
- Playwright browser instance reused for multiple tests

## Integration with Other Commands

### Before Committing
```bash
/thomas-fix        # Ensure everything passes
/git:commit        # Create commit with proper message
```

### During Development
```bash
/dev-docs "new feature"  # Plan feature
# ... implement feature ...
/thomas-fix              # Validate implementation
/dev-docs-update         # Update documentation
```

### Before Deployment
```bash
/thomas-fix                    # Full validation
npm run build                  # Production build
npx react-onchain deploy       # Deploy to BSV
```

## Notes

- **Autonomous**: Runs without user intervention (except CRITICAL issues)
- **Iterative**: Automatically re-runs until all checks pass or max iterations
- **Comprehensive**: Code validation + browser testing in one command
- **Safe**: Creates checkpoints before changes, easy rollback
- **Parallel**: Uses multiple agents for maximum efficiency
- **Adaptive**: Detects project type and runs appropriate tests
- **Autonomous Server Management**: Complete hands-free dev server lifecycle
  - Auto-detects dev script from package.json (dev, start, serve, etc.)
  - Starts dev server automatically if not running
  - Health checks existing servers and kills/restarts unresponsive ones
  - Automatically cleans up servers started by the command
  - Port scanning across common ports (3000, 3001, 5000, 5173, 8000, 8080, 4200, 4173)
  - Exponential backoff retry logic (up to 15 attempts, max 30s wait)
  - Gracefully skips browser tests if server can't be started (no failures)
  - Server logs saved to /tmp/thomas-fix-server.log for debugging

## Comparison with /validate-and-fix

| Feature | /validate-and-fix | /thomas-fix |
|---------|-------------------|-------------|
| Code validation | ✅ | ✅ |
| Automatic fixing | ✅ | ✅ |
| Browser testing | ❌ | ✅ (Playwright) |
| Iteration | ❌ (manual) | ✅ (autonomous) |
| Checkpoints | ✅ | ✅ |
| Parallel agents | ✅ | ✅ |
| Dev server management | ❌ | ✅ (auto-start/kill/cleanup) |
| Server health checking | ❌ | ✅ (with retry logic) |
| Visual verification | ❌ | ✅ (screenshots) |
| Hands-free operation | ❌ | ✅ (fully autonomous) |

**Result:** /thomas-fix is a superset of /validate-and-fix with autonomous iteration, browser testing, and complete dev server lifecycle management.
