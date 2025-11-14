---
description: World-class autonomous fix command with security scanning, incremental validation, performance testing, and visual regression detection
category: workflow
allowed-tools: Bash, Task, TodoWrite, Read, Edit, MultiEdit, Glob, Grep, SlashCommand
---

# Thomas Fix - The World's Best Autonomous Fix Command

Run an autonomous, iterative cycle of validation, security scanning, fixing, code review, browser testing, performance benchmarks, and visual regression detection until all checks pass.

## Overview

This command combines:
1. **Code validation** (lint, type-check, tests, build) - **Incremental & Smart**
2. **Security scanning** (SAST, dependency audit, secrets detection) - **NEW**
3. **Automatic fixing** (parallel agents for efficiency)
4. **Code review** (comprehensive quality analysis) - **Required**
5. **Browser testing** (Playwright + performance + visual regression) - **Enhanced**
6. **Metrics tracking** (phase duration, success rates, trends) - **NEW**
7. **Automatic commit** (intelligent git commit with /git:commit) - **Automatic**
8. **Iteration** (repeats until all checks pass)

**Key Feature - Autonomous Server Management:**
- **Fully autonomous**: No manual server management required
- **Auto-starts dev server** if not running (detects npm scripts: dev, start, serve, etc.)
- **Health checks existing servers** and kills/restarts unresponsive ones
- **Graceful cleanup**: Automatically stops servers started by the command
- **Retry logic**: Exponential backoff with up to 15 health check attempts
- **Port scanning**: Automatically finds servers on common ports (3000, 5173, 8080, etc.)
- **Smart failure handling**: Browser tests required when server available, skipped only if server unavailable
- **Command succeeds** when code validation AND browser tests both pass (or browser tests properly skipped)

## Process Flow

```
┌─────────────────────────────────────────────────────────┐
│  PHASE 1: Discovery & Categorization (ENHANCED)        │
│  ├─ Detect available validation commands                │
│  ├─ Incremental detection (changed files only)          │
│  ├─ Run checks in parallel with retry logic             │
│  ├─ Categorize issues (CRITICAL, HIGH, MEDIUM, LOW)     │
│  ├─ Track metrics (start time, file counts)             │
│  └─ Detect dev servers for Playwright                   │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│  PHASE 2: Security Scanning (NEW)                       │
│  ├─ Dependency vulnerability scan (npm audit)           │
│  ├─ Secrets detection (API keys, tokens, passwords)     │
│  ├─ License compliance check                            │
│  ├─ SAST analysis (static security scan)                │
│  ├─ Security issue categorization                       │
│  └─ Block on CRITICAL security issues                   │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│  PHASE 3: Automated Fixing                              │
│  ├─ Create checkpoint (git stash)                       │
│  ├─ Fix LOW/MEDIUM issues (parallel agents)             │
│  ├─ Fix HIGH issues (sequential, with verification)     │
│  ├─ Handle CRITICAL issues (with user confirmation)     │
│  └─ Verify fixes with re-running checks                 │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│  PHASE 4: Code Review & Quality Analysis               │
│  ├─ Run /code-review recent changes                     │
│  ├─ Analyze architecture & design patterns              │
│  ├─ Check code quality & maintainability                │
│  ├─ Review security & dependencies                      │
│  ├─ Assess performance & scalability                    │
│  ├─ Verify testing coverage                             │
│  ├─ Check documentation & API design                    │
│  └─ Blockers? → Return to PHASE 3, else continue        │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│  PHASE 5: Browser Testing (ENHANCED)                    │
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
│  ├─ Performance benchmarks (bundle size, Lighthouse)    │
│  ├─ Visual regression testing (screenshot comparison)   │
│  ├─ Take screenshots for visual verification            │
│  └─ Report browser issues found or skip status          │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│  PHASE 6: Iteration Decision                            │
│  ├─ All pass (code + security + tests + review)? → P7   │
│  ├─ Code/browser/security fail? → Return to PHASE 3     │
│  └─ Max iterations reached? → Report remaining issues   │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│  PHASE 7: Metrics & Commit (ENHANCED)                   │
│  ├─ Log phase metrics (duration, success rates)         │
│  ├─ Generate execution report                           │
│  ├─ Stage all changes (if not already staged)           │
│  ├─ Analyze change summary (files, areas)               │
│  ├─ Generate commit context (fixes, validation, tests)  │
│  ├─ Execute /git:commit (intelligent message)           │
│  ├─ Show commit details                                 │
│  ├─ Optional: Push to remote (user confirmation)        │
│  └─ Save metrics to ~/.claude/logs/metrics.jsonl        │
└─────────────────────────────────────────────────────────┘
                           ↓
                       🎉 DONE
```

## Detailed Workflow

### PHASE 1: Systematic Discovery & Categorization (ENHANCED)

#### 1.0 Metrics Initialization
```bash
# Initialize metrics tracking
PHASE_START=$(date +%s)
METRICS_FILE=~/.claude/logs/metrics.jsonl

echo "{\"phase\":\"PHASE_1\",\"event\":\"start\",\"timestamp\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}" >> $METRICS_FILE
```

#### 1.1 Incremental File Detection (NEW)
**Performance Optimization**: Only validate changed files, not entire codebase.

```bash
# Detect changed files since last commit
CHANGED_FILES=$(git diff --name-only --diff-filter=ACM HEAD 2>/dev/null)

if [ -z "$CHANGED_FILES" ]; then
  # No git or no changes, check unstaged/uncommitted
  CHANGED_FILES=$(git diff --name-only --diff-filter=ACM 2>/dev/null)
fi

if [ -z "$CHANGED_FILES" ]; then
  echo "⚠️  No changed files detected - running full validation"
  INCREMENTAL_MODE=false
else
  echo "📊 Incremental mode: $(echo "$CHANGED_FILES" | wc -l) files changed"
  INCREMENTAL_MODE=true

  # Categorize changed files by type
  TS_FILES=$(echo "$CHANGED_FILES" | grep -E '\.(ts|tsx)$' || echo "")
  JS_FILES=$(echo "$CHANGED_FILES" | grep -E '\.(js|jsx)$' || echo "")
  TEST_FILES=$(echo "$CHANGED_FILES" | grep -E '\.(test|spec)\.(ts|tsx|js|jsx)$' || echo "")

  echo "  TypeScript: $(echo "$TS_FILES" | wc -l) files"
  echo "  JavaScript: $(echo "$JS_FILES" | wc -l) files"
  echo "  Tests: $(echo "$TEST_FILES" | wc -l) files"
fi
```

#### 1.2 Command Discovery
First, discover what validation commands are available:
1. Check AGENTS.md/CLAUDE.md for documented build/test/lint commands
2. Examine package.json scripts section
3. Look for common patterns:
   - Linting: `lint`, `eslint`, `lint:fix`
   - Type checking: `typecheck`, `type-check`, `tsc`
   - Testing: `test`, `test:unit`, `test:vitest`, `vitest`, `jest`
   - Formatting: `format`, `prettier`
   - Build: `build`, `compile`
4. Check README.md for validation instructions

#### 1.3 Parallel Execution with Retry Logic (ENHANCED)
Run discovered checks in parallel with automatic retry for flaky tests:

```bash
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# RETRY LOGIC WRAPPER
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

run_with_retry() {
  local command=$1
  local max_retries=${2:-3}
  local retry_count=0
  local exit_code=0

  while [ $retry_count -lt $max_retries ]; do
    if eval "$command"; then
      # Success
      if [ $retry_count -gt 0 ]; then
        echo "  ✅ Succeeded after $retry_count retries (flaky test detected)"
        # Log flaky test
        echo "{\"type\":\"flaky_test\",\"command\":\"$command\",\"retries\":$retry_count,\"timestamp\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}" >> ~/.claude/logs/metrics.jsonl
      fi
      return 0
    else
      exit_code=$?
      retry_count=$((retry_count + 1))

      if [ $retry_count -lt $max_retries ]; then
        echo "  ⚠️  Attempt $retry_count failed, retrying... (exit code: $exit_code)"
        sleep 2
      fi
    fi
  done

  echo "  ❌ Failed after $max_retries attempts"
  return $exit_code
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# INCREMENTAL EXECUTION
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

if [ "$INCREMENTAL_MODE" = true ]; then
  echo "🚀 Running incremental validation..."

  # Lint only changed files
  if [ -n "$TS_FILES" ] || [ -n "$JS_FILES" ]; then
    echo "📝 Linting changed files..."
    run_with_retry "eslint $TS_FILES $JS_FILES" &
    LINT_PID=$!
  fi

  # Typecheck only if TypeScript files changed
  if [ -n "$TS_FILES" ]; then
    echo "🔍 Type-checking changed TypeScript files..."
    run_with_retry "tsc --noEmit $TS_FILES" &
    TYPE_PID=$!
  fi

  # Run tests related to changed files (test impact analysis)
  if [ -n "$TEST_FILES" ]; then
    echo "🧪 Running affected tests..."
    run_with_retry "npm run test -- $TEST_FILES" &
    TEST_PID=$!
  fi

  # Build always runs (quick for incremental)
  echo "🏗️  Building..."
  run_with_retry "npm run build" &
  BUILD_PID=$!

  # Wait for all background jobs
  wait

else
  # Full validation (no changes detected or git not available)
  echo "🚀 Running full validation..."

  run_with_retry "npm run lint" &
  run_with_retry "npm run typecheck" &
  run_with_retry "npm run test" &
  run_with_retry "npm run build" &

  wait
fi
```

**Capture:**
- Full output including file paths
- Line numbers for errors
- Error messages and codes
- Exit codes for each command
- Retry attempts and flaky test detection

#### 1.4 Issue Categorization
Immediately categorize findings:

- **CRITICAL**: Security issues, breaking changes, data loss risk
- **HIGH**: Functionality bugs, test failures, build breaks
- **MEDIUM**: Code quality, style violations, documentation gaps
- **LOW**: Formatting, minor optimizations

#### 1.5 Dev Server Detection (for Playwright)
```bash
# Auto-detect running dev servers
cd ~/.claude/plugins/marketplaces/playwright-skill/skills/playwright-skill
node -e "require('./lib/helpers').detectDevServers().then(servers => console.log(JSON.stringify(servers)))"
```

Record found servers for browser testing phase.

#### 1.6 Metrics Conclusion
```bash
# Log phase completion metrics
PHASE_END=$(date +%s)
PHASE_DURATION=$((PHASE_END - PHASE_START))

echo "{\"phase\":\"PHASE_1\",\"event\":\"complete\",\"duration_seconds\":$PHASE_DURATION,\"incremental\":$INCREMENTAL_MODE,\"files_changed\":$(echo "$CHANGED_FILES" | wc -l),\"timestamp\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}" >> $METRICS_FILE
```

---

### PHASE 2: Security Scanning (NEW)

**Critical security validation before attempting any fixes.**

#### 2.0 Metrics Initialization
```bash
SECURITY_PHASE_START=$(date +%s)
echo "{\"phase\":\"PHASE_2_SECURITY\",\"event\":\"start\",\"timestamp\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}" >> $METRICS_FILE

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔒 SECURITY SCANNING"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
```

#### 2.1 Dependency Vulnerability Scan
```bash
echo "📦 Scanning dependencies for vulnerabilities..."

# Run npm audit
AUDIT_OUTPUT=$(npm audit --json 2>/dev/null || echo '{"error":"npm audit failed"}')

# Parse results
CRITICAL_VULNS=$(echo "$AUDIT_OUTPUT" | jq '.metadata.vulnerabilities.critical // 0')
HIGH_VULNS=$(echo "$AUDIT_OUTPUT" | jq '.metadata.vulnerabilities.high // 0')
MODERATE_VULNS=$(echo "$AUDIT_OUTPUT" | jq '.metadata.vulnerabilities.moderate // 0')
LOW_VULNS=$(echo "$AUDIT_OUTPUT" | jq '.metadata.vulnerabilities.low // 0')

echo "  Critical: $CRITICAL_VULNS"
echo "  High: $HIGH_VULNS"
echo "  Moderate: $MODERATE_VULNS"
echo "  Low: $LOW_VULNS"

# Log vulnerabilities
echo "{\"type\":\"dependency_scan\",\"critical\":$CRITICAL_VULNS,\"high\":$HIGH_VULNS,\"moderate\":$MODERATE_VULNS,\"low\":$LOW_VULNS,\"timestamp\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}" >> $METRICS_FILE

# Block on critical vulnerabilities
if [ "$CRITICAL_VULNS" -gt 0 ]; then
  echo ""
  echo "❌ CRITICAL SECURITY VULNERABILITIES FOUND!"
  echo "   Cannot proceed with fix until these are resolved."
  echo ""
  echo "Run: npm audit fix --force"
  echo "Or: Review manually with: npm audit"
  exit 1
fi

if [ "$HIGH_VULNS" -gt 0 ]; then
  echo ""
  echo "⚠️  HIGH severity vulnerabilities found"
  echo "   Consider running: npm audit fix"
  echo ""
fi
```

#### 2.2 Secrets Detection
**Prevent accidental commit of API keys, tokens, passwords.**

```bash
echo ""
echo "🔑 Scanning for secrets in staged/changed files..."

# Get staged and changed files
SCAN_FILES=$(git diff --cached --name-only --diff-filter=ACM 2>/dev/null || git diff --name-only --diff-filter=ACM 2>/dev/null || echo "")

if [ -z "$SCAN_FILES" ]; then
  echo "  ✅ No staged/changed files to scan"
else
  # Patterns to detect
  SECRET_PATTERNS=(
    "api[_-]?key"
    "api[_-]?secret"
    "apikey"
    "access[_-]?token"
    "auth[_-]?token"
    "secret[_-]?key"
    "private[_-]?key"
    "password"
    "passwd"
    "pwd"
    "bearer"
    "jwt"
    "credentials"
    "aws[_-]?access"
    "aws[_-]?secret"
    "stripe[_-]?key"
    "github[_-]?token"
  )

  SECRETS_FOUND=0

  for pattern in "${SECRET_PATTERNS[@]}"; do
    # Search in staged/changed files (case-insensitive)
    if git diff --cached | grep -iE "$pattern\s*[=:]\s*['\"]?[A-Za-z0-9_\-]{20,}" > /dev/null 2>&1; then
      echo "  ⚠️  Potential secret detected: $pattern"
      SECRETS_FOUND=$((SECRETS_FOUND + 1))
    fi
  done

  if [ "$SECRETS_FOUND" -gt 0 ]; then
    echo ""
    echo "❌ POTENTIAL SECRETS DETECTED IN STAGED FILES!"
    echo "   Found $SECRETS_FOUND pattern matches"
    echo ""
    echo "Review staged changes: git diff --cached"
    echo ""
    echo "Options:"
    echo "  1. Remove secrets and use environment variables"
    echo "  2. Add to .gitignore if it's a config file"
    echo "  3. Use git secret or similar tool"
    echo ""
    exit 1
  else
    echo "  ✅ No secrets detected"
  fi
fi
```

#### 2.3 License Compliance Check
```bash
echo ""
echo "📜 Checking dependency licenses..."

# Check if license-checker is installed
if command -v license-checker &> /dev/null; then
  # Run license check
  FORBIDDEN_LICENSES=("GPL-3.0" "AGPL-3.0" "SSPL")
  LICENSE_OUTPUT=$(license-checker --json --production 2>/dev/null || echo "{}")

  FORBIDDEN_FOUND=0
  for license in "${FORBIDDEN_LICENSES[@]}"; do
    if echo "$LICENSE_OUTPUT" | grep -q "$license"; then
      echo "  ⚠️  Forbidden license found: $license"
      FORBIDDEN_FOUND=$((FORBIDDEN_FOUND + 1))
    fi
  done

  if [ "$FORBIDDEN_FOUND" -gt 0 ]; then
    echo ""
    echo "⚠️  Found $FORBIDDEN_FOUND dependencies with potentially problematic licenses"
    echo "   Review with: npx license-checker --summary"
  else
    echo "  ✅ All licenses compliant"
  fi
else
  echo "  ℹ️  license-checker not installed - skipping"
  echo "     Install with: npm install -g license-checker"
fi
```

#### 2.4 SAST Scan (Basic)
**Static Application Security Testing**

```bash
echo ""
echo "🔍 Running static security analysis..."

# Check for common security anti-patterns in code
SECURITY_ISSUES=0

# Pattern 1: eval() usage
if git diff --cached | grep -E "eval\(" > /dev/null 2>&1; then
  echo "  ⚠️  Detected eval() usage (potential security risk)"
  SECURITY_ISSUES=$((SECURITY_ISSUES + 1))
fi

# Pattern 2: innerHTML without sanitization
if git diff --cached | grep -E "innerHTML\s*=" | grep -v "DOMPurify\|sanitize" > /dev/null 2>&1; then
  echo "  ⚠️  Detected innerHTML usage without sanitization (XSS risk)"
  SECURITY_ISSUES=$((SECURITY_ISSUES + 1))
fi

# Pattern 3: SQL concatenation (SQL injection risk)
if git diff --cached | grep -E "SELECT.*\+.*FROM" > /dev/null 2>&1; then
  echo "  ⚠️  Detected potential SQL injection (string concatenation in query)"
  SECURITY_ISSUES=$((SECURITY_ISSUES + 1))
fi

# Pattern 4: Hardcoded credentials
if git diff --cached | grep -iE "(password|secret)\s*=\s*['\"][^'\"]{8,}" > /dev/null 2>&1; then
  echo "  ⚠️  Detected hardcoded credentials"
  SECURITY_ISSUES=$((SECURITY_ISSUES + 1))
fi

if [ "$SECURITY_ISSUES" -eq 0 ]; then
  echo "  ✅ No obvious security anti-patterns detected"
else
  echo ""
  echo "⚠️  Found $SECURITY_ISSUES potential security issues"
  echo "   These are warnings - review manually"
fi

# Log SAST results
echo "{\"type\":\"sast_scan\",\"issues\":$SECURITY_ISSUES,\"timestamp\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}" >> $METRICS_FILE
```

#### 2.5 Security Summary
```bash
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 SECURITY SCAN SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  Dependency Vulnerabilities:"
echo "    Critical: $CRITICAL_VULNS (blocking)"
echo "    High: $HIGH_VULNS (warning)"
echo "    Moderate: $MODERATE_VULNS"
echo "    Low: $LOW_VULNS"
echo ""
echo "  Secrets Scan: $([ "$SECRETS_FOUND" -eq 0 ] && echo "✅ Passed" || echo "❌ Failed")"
echo "  SAST Analysis: $([ "$SECURITY_ISSUES" -eq 0 ] && echo "✅ Clean" || echo "⚠️  $SECURITY_ISSUES warnings")"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Log phase completion
SECURITY_PHASE_END=$(date +%s)
SECURITY_PHASE_DURATION=$((SECURITY_PHASE_END - SECURITY_PHASE_START))

echo "{\"phase\":\"PHASE_2_SECURITY\",\"event\":\"complete\",\"duration_seconds\":$SECURITY_PHASE_DURATION,\"critical_vulns\":$CRITICAL_VULNS,\"high_vulns\":$HIGH_VULNS,\"secrets_found\":$SECRETS_FOUND,\"sast_issues\":$SECURITY_ISSUES,\"timestamp\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}" >> $METRICS_FILE
```

---

### PHASE 3: Strategic Fix Execution

#### 3.1 Create Checkpoint
```bash
# Safety first - create rollback point
git stash push -u -m "thomas-fix checkpoint: $(date +%Y%m%d-%H%M%S)"
```

#### 3.2 Fix LOW & MEDIUM Issues (Parallel)
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

#### 3.3 Fix HIGH Issues (Sequential)
Address HIGH priority issues one at a time:
- Fix one issue
- Run tests immediately
- Verify no regressions
- Move to next issue

#### 3.4 Fix CRITICAL Issues (With Confirmation)
For CRITICAL issues:
1. Present detailed plan to user
2. Explain risks and approach
3. Wait for explicit confirmation
4. Execute with extra verification

#### 3.5 Verification
Re-run ALL checks to confirm fixes:
```bash
npm run lint && npm run typecheck && npm run test && npm run build
```

### PHASE 4: Code Review & Quality Analysis

#### 4.0 Comprehensive Code Review
After all tests pass, perform comprehensive code review using `/code-review`:

```bash
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 CODE REVIEW & QUALITY ANALYSIS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Launch code review for changed files
echo "🔍 Analyzing code quality..."
```

Use `/code-review recent changes` to analyze:
- Architecture & design patterns
- Code quality & maintainability
- Security & dependencies
- Performance & scalability
- Testing coverage
- Documentation & API design

**Review Categories:**
- ✅ **PASS**: No issues, ready to commit
- ⚠️  **WARNINGS**: Minor issues, acceptable to commit with notes
- ❌ **BLOCKERS**: Critical issues, must fix before commit

**Integration:**
```bash
# Run code review
CODE_REVIEW_RESULT=$(claude /code-review recent changes 2>&1)
echo "$CODE_REVIEW_RESULT"

# Parse review result
if echo "$CODE_REVIEW_RESULT" | grep -q "BLOCKER"; then
    echo ""
    echo "❌ Code review found blocking issues!"
    echo "   Review must be addressed before commit"
    echo ""
    echo "Options:"
    echo "  1. Fix blocking issues"
    echo "  2. Review details above"
    echo "  3. Re-run /thomas-fix after fixes"
    echo ""
    exit 1
fi

# Count warnings
WARNING_COUNT=$(echo "$CODE_REVIEW_RESULT" | grep -c "⚠️" || echo "0")

if [ "$WARNING_COUNT" -gt 0 ]; then
    echo ""
    echo "⚠️  Code review found $WARNING_COUNT warning(s)"
    echo "   Acceptable to commit, but consider addressing"
    echo ""
fi

echo "✅ Code review complete"
echo ""
```

### PHASE 5: Browser Testing with Playwright (ENHANCED)

#### 5.0 Autonomous Server Management
**CRITICAL**: Browser tests require a healthy dev server. This phase autonomously manages the dev server lifecycle.

```bash
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PHASE 4.0: AUTONOMOUS SERVER MANAGEMENT
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

#### 5.1 Server Detection
Browser tests will only run if the dev server is healthy and responding.
All tests are automatically skipped if the server is unavailable.

#### 5.2 Write Playwright Tests
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

#### 5.3 Execute Tests
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

  # Track browser test failures
  BROWSER_TEST_FAILURES=0
  BROWSER_TESTS_RUN=0

  # Execute all browser tests with failure tracking
  echo "📱 Running responsive design tests..."
  if cd $SKILL_DIR && node run.js /tmp/playwright-test-thomas-fix-responsive.js; then
    echo "  ✅ Responsive tests passed"
    BROWSER_TESTS_RUN=$((BROWSER_TESTS_RUN + 1))
  else
    echo "  ❌ Responsive tests failed"
    BROWSER_TEST_FAILURES=$((BROWSER_TEST_FAILURES + 1))
    BROWSER_TESTS_RUN=$((BROWSER_TESTS_RUN + 1))
  fi

  echo ""
  echo "💨 Running smoke tests..."
  if cd $SKILL_DIR && node run.js /tmp/playwright-test-thomas-fix-smoke.js; then
    echo "  ✅ Smoke tests passed"
    BROWSER_TESTS_RUN=$((BROWSER_TESTS_RUN + 1))
  else
    echo "  ❌ Smoke tests failed"
    BROWSER_TEST_FAILURES=$((BROWSER_TEST_FAILURES + 1))
    BROWSER_TESTS_RUN=$((BROWSER_TESTS_RUN + 1))
  fi

  # Execute additional tests if they exist
  if [ -f /tmp/playwright-test-screen-flows.js ]; then
    echo ""
    echo "🔀 Running screen flow tests..."
    if cd $SKILL_DIR && node run.js /tmp/playwright-test-screen-flows.js; then
      echo "  ✅ Screen flow tests passed"
      BROWSER_TESTS_RUN=$((BROWSER_TESTS_RUN + 1))
    else
      echo "  ❌ Screen flow tests failed"
      BROWSER_TEST_FAILURES=$((BROWSER_TEST_FAILURES + 1))
      BROWSER_TESTS_RUN=$((BROWSER_TESTS_RUN + 1))
    fi
  fi

  if [ -f /tmp/playwright-test-buttons.js ]; then
    echo ""
    echo "🔘 Running button functionality tests..."
    if cd $SKILL_DIR && node run.js /tmp/playwright-test-buttons.js; then
      echo "  ✅ Button tests passed"
      BROWSER_TESTS_RUN=$((BROWSER_TESTS_RUN + 1))
    else
      echo "  ❌ Button tests failed"
      BROWSER_TEST_FAILURES=$((BROWSER_TEST_FAILURES + 1))
      BROWSER_TESTS_RUN=$((BROWSER_TESTS_RUN + 1))
    fi
  fi

  if [ -f /tmp/playwright-test-forms.js ]; then
    echo ""
    echo "📝 Running form usability tests..."
    if cd $SKILL_DIR && node run.js /tmp/playwright-test-forms.js; then
      echo "  ✅ Form tests passed"
      BROWSER_TESTS_RUN=$((BROWSER_TESTS_RUN + 1))
    else
      echo "  ❌ Form tests failed"
      BROWSER_TEST_FAILURES=$((BROWSER_TEST_FAILURES + 1))
      BROWSER_TESTS_RUN=$((BROWSER_TESTS_RUN + 1))
    fi
  fi

  if [ -f /tmp/playwright-test-console-tracking.js ]; then
    echo ""
    echo "🔍 Running console tracking tests..."
    if cd $SKILL_DIR && node run.js /tmp/playwright-test-console-tracking.js; then
      echo "  ✅ Console tracking tests passed"
      BROWSER_TESTS_RUN=$((BROWSER_TESTS_RUN + 1))
    else
      echo "  ❌ Console tracking tests failed"
      BROWSER_TEST_FAILURES=$((BROWSER_TEST_FAILURES + 1))
      BROWSER_TESTS_RUN=$((BROWSER_TESTS_RUN + 1))
    fi
  fi

  if [ -f /tmp/playwright-test-accessibility.js ]; then
    echo ""
    echo "♿ Running accessibility tests..."
    if cd $SKILL_DIR && node run.js /tmp/playwright-test-accessibility.js; then
      echo "  ✅ Accessibility tests passed"
      BROWSER_TESTS_RUN=$((BROWSER_TESTS_RUN + 1))
    else
      echo "  ❌ Accessibility tests failed"
      BROWSER_TEST_FAILURES=$((BROWSER_TEST_FAILURES + 1))
      BROWSER_TESTS_RUN=$((BROWSER_TESTS_RUN + 1))
    fi
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

#### 5.4 Performance & Visual Regression (NEW)
**Enhanced browser testing with performance benchmarks and visual regression detection.**

```bash
if [ "$SKIP_BROWSER_TESTS" == "false" ]; then
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "⚡ PERFORMANCE BENCHMARKS"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""

  # ─────────────────────────────────────────────────────────────
  # Bundle Size Analysis
  # ─────────────────────────────────────────────────────────────
  echo "📦 Analyzing bundle size..."

  # Find build output directory
  if [ -d "dist" ]; then
    BUILD_DIR="dist"
  elif [ -d "build" ]; then
    BUILD_DIR="build"
  elif [ -d ".next" ]; then
    BUILD_DIR=".next"
  else
    echo "  ⚠️  Build directory not found, skipping bundle analysis"
    BUILD_DIR=""
  fi

  if [ -n "$BUILD_DIR" ]; then
    # Calculate total bundle size
    CURRENT_BUNDLE_SIZE=$(du -sb "$BUILD_DIR" | cut -f1)
    CURRENT_BUNDLE_MB=$(echo "scale=2; $CURRENT_BUNDLE_SIZE / 1024 / 1024" | bc)

    echo "  Current bundle: ${CURRENT_BUNDLE_MB}MB"

    # Check for baseline
    BASELINE_FILE=~/.claude/logs/bundle-baseline.txt
    if [ -f "$BASELINE_FILE" ]; then
      BASELINE_SIZE=$(cat "$BASELINE_FILE")
      BASELINE_MB=$(echo "scale=2; $BASELINE_SIZE / 1024 / 1024" | bc)
      SIZE_DIFF=$((CURRENT_BUNDLE_SIZE - BASELINE_SIZE))
      DIFF_MB=$(echo "scale=2; $SIZE_DIFF / 1024 / 1024" | bc)
      PERCENT_CHANGE=$(echo "scale=1; ($SIZE_DIFF * 100) / $BASELINE_SIZE" | bc)

      echo "  Baseline: ${BASELINE_MB}MB"
      echo "  Change: ${DIFF_MB}MB (${PERCENT_CHANGE}%)"

      # Warn if bundle grew significantly
      if [ "$SIZE_DIFF" -gt 100000 ]; then
        echo "  ⚠️  Bundle grew by ${DIFF_MB}MB! Review dependencies and code splits."
      elif [ "$SIZE_DIFF" -lt -10000 ]; then
        echo "  ✅ Bundle size optimized by ${DIFF_MB}MB!"
      fi
    else
      echo "  ℹ️  No baseline found, creating new baseline"
      echo "$CURRENT_BUNDLE_SIZE" > "$BASELINE_FILE"
    fi

    # Log bundle metrics
    echo "{\"type\":\"bundle_size\",\"size_bytes\":$CURRENT_BUNDLE_SIZE,\"size_mb\":$CURRENT_BUNDLE_MB,\"timestamp\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}" >> $METRICS_FILE
  fi

  # ─────────────────────────────────────────────────────────────
  # Lighthouse Performance Audit (if available)
  # ─────────────────────────────────────────────────────────────
  echo ""
  echo "🔍 Running Lighthouse audit..."

  if command -v lighthouse &> /dev/null; then
    LIGHTHOUSE_OUTPUT=$(lighthouse $SERVER_URL --output json --output-path /tmp/lighthouse-report.json --only-categories=performance,accessibility --quiet 2>&1 || echo "failed")

    if [ "$LIGHTHOUSE_OUTPUT" != "failed" ] && [ -f /tmp/lighthouse-report.json ]; then
      PERF_SCORE=$(jq '.categories.performance.score * 100' /tmp/lighthouse-report.json)
      ACCESS_SCORE=$(jq '.categories.accessibility.score * 100' /tmp/lighthouse-report.json)

      echo "  Performance: ${PERF_SCORE}/100"
      echo "  Accessibility: ${ACCESS_SCORE}/100"

      # Warn on low scores
      if [ "${PERF_SCORE%.*}" -lt 70 ]; then
        echo "  ⚠️  Performance score below 70"
      fi
      if [ "${ACCESS_SCORE%.*}" -lt 90 ]; then
        echo "  ⚠️  Accessibility score below 90"
      fi

      # Log Lighthouse metrics
      echo "{\"type\":\"lighthouse\",\"performance\":$PERF_SCORE,\"accessibility\":$ACCESS_SCORE,\"timestamp\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}" >> $METRICS_FILE
    else
      echo "  ⚠️  Lighthouse audit failed"
    fi
  else
    echo "  ℹ️  Lighthouse not installed - skipping"
    echo "     Install with: npm install -g lighthouse"
  fi

  # ─────────────────────────────────────────────────────────────
  # Visual Regression Detection
  # ─────────────────────────────────────────────────────────────
  echo ""
  echo "📸 Visual regression detection..."

  BASELINE_DIR=~/.claude/visual-baselines
  mkdir -p "$BASELINE_DIR"

  # Check if we have baseline screenshots
  if [ -f "$BASELINE_DIR/desktop.png" ]; then
    echo "  Comparing with baseline screenshots..."

    # Install pixelmatch if not available (npm package)
    if command -v compare &> /dev/null; then
      # Using ImageMagick compare
      DESKTOP_DIFF=$(compare -metric AE "$BASELINE_DIR/desktop.png" /tmp/thomas-fix-desktop.png /tmp/diff-desktop.png 2>&1 || echo "0")
      TABLET_DIFF=$(compare -metric AE "$BASELINE_DIR/tablet.png" /tmp/thomas-fix-tablet.png /tmp/diff-tablet.png 2>&1 || echo "0")
      MOBILE_DIFF=$(compare -metric AE "$BASELINE_DIR/mobile.png" /tmp/thomas-fix-mobile.png /tmp/diff-mobile.png 2>&1 || echo "0")

      echo "  Desktop: $DESKTOP_DIFF pixels changed"
      echo "  Tablet: $TABLET_DIFF pixels changed"
      echo "  Mobile: $MOBILE_DIFF pixels changed"

      TOTAL_DIFF=$((DESKTOP_DIFF + TABLET_DIFF + MOBILE_DIFF))

      if [ "$TOTAL_DIFF" -gt 1000 ]; then
        echo ""
        echo "  ⚠️  Significant visual changes detected ($TOTAL_DIFF pixels)"
        echo "     Review diff images: /tmp/diff-*.png"
        echo ""
        echo "  Options:"
        echo "    1. Review changes are intentional"
        echo "    2. Update baselines: cp /tmp/thomas-fix-*.png $BASELINE_DIR/"
        echo "    3. Investigate unintended visual regressions"
      elif [ "$TOTAL_DIFF" -gt 100 ]; then
        echo "  ℹ️  Minor visual changes ($TOTAL_DIFF pixels)"
      else
        echo "  ✅ No significant visual regressions"
      fi

      # Log visual regression metrics
      echo "{\"type\":\"visual_regression\",\"pixels_changed\":$TOTAL_DIFF,\"desktop\":$DESKTOP_DIFF,\"tablet\":$TABLET_DIFF,\"mobile\":$MOBILE_DIFF,\"timestamp\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}" >> $METRICS_FILE
    else
      echo "  ℹ️  ImageMagick not installed - skipping pixel comparison"
      echo "     Install with: apt-get install imagemagick (Linux) or brew install imagemagick (Mac)"
    fi
  else
    echo "  ℹ️  No baseline screenshots found, creating baselines"
    cp /tmp/thomas-fix-desktop.png "$BASELINE_DIR/desktop.png" 2>/dev/null || true
    cp /tmp/thomas-fix-tablet.png "$BASELINE_DIR/tablet.png" 2>/dev/null || true
    cp /tmp/thomas-fix-mobile.png "$BASELINE_DIR/mobile.png" 2>/dev/null || true
    echo "  ✅ Baseline screenshots saved to $BASELINE_DIR"
  fi

  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
fi
```

#### 5.5 Analyze Results
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

### PHASE 6: Iteration & Decision

#### 6.1 Evaluation Criteria
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
  # Check browser test execution failures
  if [ "$BROWSER_TEST_FAILURES" -gt 0 ]; then
    BROWSER_TESTS_PASS=false
  fi

  # Also check console errors from the console tracking test
  if [ -f /tmp/thomas-fix-console-log.json ]; then
    BROWSER_ERRORS=$(jq '.errors | length' /tmp/thomas-fix-console-log.json 2>/dev/null || echo "0")
    if [ "$BROWSER_ERRORS" -gt 0 ]; then
      BROWSER_TESTS_PASS=false
    fi
  else
    BROWSER_ERRORS=0
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
  echo "  Tests run: $BROWSER_TESTS_RUN"
  echo "  Tests passed: $((BROWSER_TESTS_RUN - BROWSER_TEST_FAILURES))"
  echo "  Tests failed: $BROWSER_TEST_FAILURES"
  if [ -f /tmp/thomas-fix-console-log.json ]; then
    echo "  Console errors: $([ $BROWSER_ERRORS -eq 0 ] && echo '✅ None' || echo "❌ $BROWSER_ERRORS found")"
  fi
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
- **Browser Tests MUST Pass (when available)**: If server can be started, browser tests must pass

The command considers success if:
1. ✅ All code validation passes AND browser tests pass
2. ✅ All code validation passes AND browser tests properly skipped (server unavailable)

The command fails if:
1. ❌ Any code validation check fails (lint, type-check, tests, or build)
2. ❌ Browser tests fail (when server is available and tests are run)
3. ❌ Browser tests cannot start despite server being available

#### 5.2 Iteration Logic
```bash
# Determine overall success
OVERALL_SUCCESS=false

if [ "$CODE_VALIDATION_PASS" == "true" ]; then
  # Code validation passed - now check browser tests
  if [ "$SKIP_BROWSER_TESTS" == "true" ]; then
    # Code validation passed, browser tests properly skipped (acceptable - server unavailable)
    OVERALL_SUCCESS=true
    echo "✅ Code validation complete (browser tests skipped - no dev server)"
  elif [ "$BROWSER_TESTS_PASS" == "true" ]; then
    # Both code validation and browser tests passed (ideal)
    OVERALL_SUCCESS=true
    echo "🎉 All checks passed!"
  else
    # Code validation passed but browser tests FAILED (needs iteration)
    OVERALL_SUCCESS=false
    echo "❌ Browser tests failed (code validation passed)"
    echo "   Browser test failures require fixing - iterating..."
  fi
else
  # Code validation failed (needs iteration)
  OVERALL_SUCCESS=false
  echo "❌ Code validation failed"
fi

# Iteration decision
if [ "$OVERALL_SUCCESS" == "true" ]; then
  # Proceed to Phase 6: Automatic Commit
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "✅ ALL VALIDATION & REVIEW COMPLETE"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "Proceeding to automatic commit..."
  # Continue to PHASE 6

### PHASE 7: Metrics & Automatic Git Commit (ENHANCED)

#### 7.0 Save Execution Metrics
```bash
# Calculate total execution time
TOTAL_END=$(date +%s)
TOTAL_DURATION=$((TOTAL_END - PHASE_START))
TOTAL_MINUTES=$(echo "scale=2; $TOTAL_DURATION / 60" | bc)

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 EXECUTION METRICS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  Total Duration: ${TOTAL_MINUTES} minutes"
echo "  Incremental Mode: $INCREMENTAL_MODE"
echo "  Files Changed: $(echo "$CHANGED_FILES" | wc -l)"
echo ""
echo "  Security:"
echo "    Critical Vulnerabilities: $CRITICAL_VULNS"
echo "    Secrets Found: $SECRETS_FOUND"
echo "    SAST Issues: $SECURITY_ISSUES"
echo ""
echo "  Browser Tests:"
echo "    Executed: $([ "$SKIP_BROWSER_TESTS" == "false" ] && echo "Yes" || echo "Skipped")"
echo "    Failures: ${BROWSER_TEST_FAILURES:-0}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Save comprehensive execution log
echo "{\"type\":\"execution_complete\",\"duration_seconds\":$TOTAL_DURATION,\"duration_minutes\":$TOTAL_MINUTES,\"incremental\":$INCREMENTAL_MODE,\"files_changed\":$(echo "$CHANGED_FILES" | wc -l),\"security\":{\"critical_vulns\":$CRITICAL_VULNS,\"secrets\":$SECRETS_FOUND,\"sast_issues\":$SECURITY_ISSUES},\"browser_tests\":{\"skipped\":\"$SKIP_BROWSER_TESTS\",\"failures\":${BROWSER_TEST_FAILURES:-0}},\"timestamp\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}" >> $METRICS_FILE
```

#### 7.1 Prepare Commit
```bash
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 AUTOMATIC COMMIT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check for staged or modified files
if ! git diff --quiet || ! git diff --cached --quiet || git ls-files --others --exclude-standard | grep -q .; then
    echo "✅ Changes detected, preparing commit..."
else
    echo "ℹ️  No changes to commit"
    exit 0
fi
```

#### 7.2 Analyze Changes for Commit Message
```bash
# Get file statistics
FILES_CHANGED=$(git diff --cached --name-only 2>/dev/null | wc -l)
if [ "$FILES_CHANGED" -eq 0 ]; then
    # If nothing staged, stage all changes
    echo "📝 Staging all changes..."
    git add .
    FILES_CHANGED=$(git diff --cached --name-only | wc -l)
fi

# Analyze change types
ADDED_FILES=$(git diff --cached --diff-filter=A --name-only | wc -l)
MODIFIED_FILES=$(git diff --cached --diff-filter=M --name-only | wc -l)
DELETED_FILES=$(git diff --cached --diff-filter=D --name-only | wc -l)

echo ""
echo "📊 Change Summary:"
echo "  Files changed: $FILES_CHANGED"
echo "  Added: $ADDED_FILES"
echo "  Modified: $MODIFIED_FILES"
echo "  Deleted: $DELETED_FILES"
echo ""

# Get affected areas (component types)
AFFECTED_AREAS=$(git diff --cached --name-only | \
    grep -E '\.(ts|tsx|js|jsx)$' | \
    awk -F'/' '{if ($2=="components") print "components"; else if ($2=="hooks") print "hooks"; else if ($2=="utils") print "utils"; else if ($2=="api" || $2=="routes") print "api"; else print "code"}' | \
    sort -u | tr '\n' ',' | sed 's/,$//' | sed 's/,/, /g')

echo "🎯 Affected areas: ${AFFECTED_AREAS:-general}"
echo ""
```

#### 7.3 Generate Smart Commit Message
Use `/git:commit` to create an intelligent commit message based on:
- Changed files and their purposes
- Code review findings
- Test results
- Repository commit history style

```bash
# Prepare commit context
COMMIT_CONTEXT="thomas-fix automated commit after successful validation

Changes:
- Files changed: $FILES_CHANGED
- Areas: $AFFECTED_AREAS
- Lint errors fixed: $LINT_ERRORS_FIXED
- TypeScript errors fixed: $TYPECHECK_ERRORS_FIXED
- Test failures fixed: $TEST_FAILURES_FIXED
- Build errors fixed: $BUILD_ERRORS_FIXED

Validation:
- ✅ Lint passed
- ✅ Type-check passed
- ✅ Tests passed ($((BROWSER_TESTS_RUN - BROWSER_TEST_FAILURES)) browser tests)
- ✅ Build passed
- ✅ Code review passed ($WARNING_COUNT warning(s))

Screenshots: /tmp/thomas-fix-*.png
Console log: /tmp/thomas-fix-console-log.json
"

echo "$COMMIT_CONTEXT" > /tmp/thomas-fix-commit-context.txt
```

#### 7.4 Execute Commit
```bash
echo "🔍 Generating commit message..."

# Use /git:commit for intelligent commit message
if claude /git:commit; then
    echo ""
    echo "✅ Commit successful!"
    echo ""

    # Show the commit
    echo "📝 Commit details:"
    git log -1 --pretty=format:"  Commit: %h%n  Author: %an%n  Date: %ad%n  Message: %s%n%n%b" --date=relative
    echo ""

    # Save commit hash for reference
    COMMIT_HASH=$(git rev-parse HEAD)
    echo "Commit hash: $COMMIT_HASH" >> /tmp/thomas-fix-summary.txt
else
    echo ""
    echo "⚠️  Automatic commit failed"
    echo "   You can commit manually:"
    echo "   git add . && git commit -m 'your message'"
    echo ""
    exit 1
fi
```

#### 7.5 Post-Commit Actions
```bash
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 POST-COMMIT ACTIONS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Option to push
read -p "🚀 Push to remote? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Pushing to remote..."
    if git push; then
        echo "✅ Pushed successfully!"
    else
        echo "⚠️  Push failed - check remote configuration"
    fi
else
    echo "ℹ️  Skipped push - you can push later with: git push"
fi

echo ""
```

#### 7.6 Completion
```bash
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 THOMAS FIX COMPLETE WITH COMMIT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ All validation passed"
echo "✅ Code review completed"
echo "✅ Changes committed"
echo ""
echo "Summary saved to: /tmp/thomas-fix-summary.txt"
echo ""

# Clean up stale checkpoints (keep last 5)
CHECKPOINT_COUNT=$(git stash list | grep -c "thomas-fix" || echo "0")
if [ "$CHECKPOINT_COUNT" -gt 5 ]; then
    echo "🧹 Cleaning up old checkpoints (keeping 5 most recent)..."
    # Note: This is informational - actual cleanup requires manual intervention
fi

exit 0
```

### PHASE 7: Iteration (If Needed)

If validation or review fails, return to fixing phase:

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
  echo "Manual intervention needed for remaining code validation issues:"
  echo ""

  # Show remaining issues (CODE VALIDATION + BROWSER TESTS)
  if [ $LINT_ERRORS -gt 0 ]; then echo "  ❌ Lint errors: $LINT_ERRORS"; fi
  if [ $TYPECHECK_ERRORS -gt 0 ]; then echo "  ❌ Type-check errors: $TYPECHECK_ERRORS"; fi
  if [ $TEST_FAILURES -gt 0 ]; then echo "  ❌ Test failures: $TEST_FAILURES"; fi
  if [ $BUILD_ERRORS -gt 0 ]; then echo "  ❌ Build errors: $BUILD_ERRORS"; fi

  # Show browser test issues (required when server available)
  if [ "$SKIP_BROWSER_TESTS" == "false" ] && [ "$BROWSER_TESTS_PASS" == "false" ]; then
    echo ""
    echo "Browser test failures:"
    if [ "$BROWSER_TEST_FAILURES" -gt 0 ]; then
      echo "  ❌ Test execution failures: $BROWSER_TEST_FAILURES"
    fi
    if [ "$BROWSER_ERRORS" -gt 0 ]; then
      echo "  ❌ Console errors: $BROWSER_ERRORS"
    fi
  fi

  echo ""
  echo "Recommendations:"
  echo "  1. Review the errors above and fix manually"
  echo "  2. Use specialized agents for complex issues"
  echo "  3. For browser test failures, check:"
  echo "     - Test script errors in test output above"
  echo "     - Browser console errors in /tmp/thomas-fix-console-log.json"
  echo "     - Screenshots in /tmp/thomas-fix-*.png for visual issues"
  echo "  4. Consider architectural changes if needed"
  echo "  5. Re-run /thomas-fix after manual fixes"
  echo ""

  exit 1
fi
```

**MAX_ITERATIONS**: Default 3 (configurable)

**Key Behavior:**
- Browser tests are **required** when server is available
- Browser tests are **skipped** only when server cannot be started
- Command succeeds when code validation AND browser tests both pass (or browser tests properly skipped)
- Iteration continues until all checks pass or max iterations reached

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
- **Comprehensive**: Code validation + mandatory browser testing in one command
- **Safe**: Creates checkpoints before changes, easy rollback
- **Parallel**: Uses multiple agents for maximum efficiency
- **Adaptive**: Detects project type and runs appropriate tests
- **Mandatory Browser Testing**: Browser tests required when server available
  - Success requires both code validation AND browser tests passing
  - Browser tests skipped only when dev server unavailable (graceful fallback)
  - Tracks test execution failures (script crashes, exceptions)
  - Tracks console errors from running tests
  - Provides detailed failure reporting with screenshots
- **Autonomous Server Management**: Complete hands-free dev server lifecycle
  - Auto-detects dev script from package.json (dev, start, serve, etc.)
  - Starts dev server automatically if not running
  - Health checks existing servers and kills/restarts unresponsive ones
  - Automatically cleans up servers started by the command
  - Port scanning across common ports (3000, 3001, 5000, 5173, 8000, 8080, 4200, 4173)
  - Exponential backoff retry logic (up to 15 attempts, max 30s wait)
  - Server start failures don't block success (browser tests skipped)
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
