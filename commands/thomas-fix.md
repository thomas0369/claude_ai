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
3. **Browser testing** (Playwright integration for UI validation)
4. **Iteration** (repeats until everything passes)

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
│  ├─ Auto-detect running dev servers                     │
│  ├─ Write custom Playwright tests to /tmp               │
│  ├─ Test key user flows (responsive, forms, etc.)       │
│  ├─ Take screenshots for visual verification            │
│  └─ Report browser issues found                         │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│  PHASE 4: Iteration Decision                            │
│  ├─ All checks pass + browser tests pass? → DONE        │
│  ├─ Issues found? → Return to PHASE 2                   │
│  └─ Max iterations reached? → Report remaining issues   │
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

#### 3.1 Server Detection
If dev servers were detected in Phase 1, proceed with browser testing.
If no servers found, ask user if they want to start one or skip browser tests.

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
```bash
SKILL_DIR=~/.claude/plugins/marketplaces/playwright-skill/skills/playwright-skill
cd $SKILL_DIR && node run.js /tmp/playwright-test-thomas-fix-responsive.js
cd $SKILL_DIR && node run.js /tmp/playwright-test-thomas-fix-smoke.js
```

#### 3.4 Analyze Results
Review:
- Screenshots in `/tmp/thomas-fix-*.png`
- Console output for errors
- Any failures or visual issues

### PHASE 4: Iteration & Decision

#### 4.1 Evaluation Criteria
```
ALL PASS Criteria:
✅ Lint: no errors
✅ Type-check: no errors
✅ Tests: all passing
✅ Build: successful
✅ Browser: no console errors, responsive works, key flows functional
```

#### 4.2 Iteration Logic
```python
if all_checks_pass and browser_tests_pass:
    print("🎉 All checks passed!")
    create_checkpoint()
    show_summary()
    exit(0)
elif iteration < MAX_ITERATIONS:
    print(f"🔄 Issues found. Starting iteration {iteration + 1}...")
    goto PHASE_2
else:
    print("⚠️ Max iterations reached. Manual intervention needed.")
    show_remaining_issues()
    exit(1)
```

**MAX_ITERATIONS**: Default 3 (configurable)

#### 4.3 Final Summary
```markdown
## Thomas Fix Summary

**Duration:** 5m 32s
**Iterations:** 2

### Phase 1: Discovery
- Linting: 15 errors found
- Type-checking: 8 errors found
- Tests: 2 failing
- Build: 3 warnings
- Dev server: http://localhost:3000 (detected)

### Phase 2: Fixes Applied
✅ Fixed 15 linting errors (parallel agents)
✅ Fixed 8 TypeScript errors (typescript-type-expert)
✅ Fixed 2 failing tests (testing-expert)
✅ Resolved 3 build warnings

### Phase 3: Browser Testing
✅ Responsive design: Desktop, Tablet, Mobile
✅ Smoke test: Page loads, no console errors
✅ Screenshots saved to /tmp/thomas-fix-*.png

### Final Status
🎉 ALL CHECKS PASSED!

**Files Modified:** 12
**Agents Used:** 3 (linting-expert, typescript-type-expert, testing-expert)
**Checkpoints Created:** 2
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
# During active development
npm run dev  # Start dev server
/thomas-fix  # Autonomous validation + testing

# Before committing
/thomas-fix  # Ensure everything passes

# After refactoring
/thomas-fix  # Verify no regressions
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

### Issue: Dev server not detected
**Solution:**
```bash
# Manually start dev server first
npm run dev

# Then run thomas-fix
/thomas-fix
```

### Issue: Playwright tests fail
**Solution:**
```bash
# Check Playwright installation
cd ~/.claude/plugins/marketplaces/playwright-skill/skills/playwright-skill
npm run setup

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

## Comparison with /validate-and-fix

| Feature | /validate-and-fix | /thomas-fix |
|---------|-------------------|-------------|
| Code validation | ✅ | ✅ |
| Automatic fixing | ✅ | ✅ |
| Browser testing | ❌ | ✅ (Playwright) |
| Iteration | ❌ (manual) | ✅ (autonomous) |
| Checkpoints | ✅ | ✅ |
| Parallel agents | ✅ | ✅ |
| Dev server detection | ❌ | ✅ |
| Visual verification | ❌ | ✅ (screenshots) |

**Result:** /thomas-fix is a superset of /validate-and-fix with autonomous iteration and browser testing.
