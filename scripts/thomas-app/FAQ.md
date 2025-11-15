# Thomas-App FAQ

Frequently Asked Questions about Thomas-App automated testing.

---

## Table of Contents

1. [General Questions](#general-questions)
2. [Automatic Bug Fixing](#automatic-bug-fixing)
3. [Screen Flow Testing](#screen-flow-testing)
4. [Configuration](#configuration)
5. [WSL2 & Environment](#wsl2--environment)
6. [Performance](#performance)
7. [Troubleshooting](#troubleshooting)

---

## General Questions

### Q: What is Thomas-App?

**A:** Thomas-App is a comprehensive automated testing tool that:
- Detects your app type automatically (game, e-commerce, SaaS, etc.)
- Tests customer journeys end-to-end
- Validates accessibility (WCAG 2.1/2.2)
- Measures performance (Core Web Vitals)
- Scans for security issues
- Maps screen flows with 71+ interaction patterns
- **Automatically fixes bugs** it finds

### Q: How is Thomas-App different from Cypress/Playwright/Selenium?

**A:** Thomas-App is built ON TOP of Playwright, but adds:

| Feature | Thomas-App | Cypress | Playwright | Selenium |
|---------|-----------|---------|------------|----------|
| **Automatic app detection** | ✅ | ❌ | ❌ | ❌ |
| **Pre-built customer journeys** | ✅ | ❌ | ❌ | ❌ |
| **Automatic bug fixing** | ✅ | ❌ | ❌ | ❌ |
| **Flow mapping (3 formats)** | ✅ | ❌ | ❌ | ❌ |
| **71+ interaction patterns** | ✅ | ~15 | ~20 | ~10 |
| **WSL2 auto-detection** | ✅ | ❌ | ❌ | ❌ |
| **Selector suggestions** | ✅ | ❌ | ❌ | ❌ |
| **GitHub integration** | ✅ | ⚠️ | ⚠️ | ❌ |

### Q: Does Thomas-App use AI?

**A:** **NO** - Thomas-App is 100% deterministic:
- State discovery via CSS selectors
- Element detection via DOM APIs
- Transition detection via URL comparison
- Flow generation via template strings
- Zero AI/ML dependencies

This means:
- ✅ **100% reliable** (no AI hallucinations)
- ✅ **Fast** (no model inference)
- ✅ **Predictable** (same results every time)
- ✅ **Debuggable** (clear execution path)

However, thomas-app DOES integrate with `/thomas-fix` which uses Claude AI for bug fixing.

---

## Automatic Bug Fixing

### Q: Does thomas-app automatically fix bugs?

**A:** **YES!** Phase 7.9 (Autonomous Bug Fixing) runs automatically when `autofix: true` (default).

**Location in code:**
- `orchestrator.js:69` - `autofix: true` in default config
- `phases/autofix.js` - Full implementation (490 lines)

**What it fixes:**
- Console errors (critical)
- Failed customer journeys (critical)
- Accessibility violations (critical/serious)
- Security vulnerabilities (high)
- Performance issues (LCP > 4s, CLS > 0.25)
- Layout/responsive issues (high)

### Q: How does automatic bug fixing work?

**A:** Step-by-step process:

1. **Collect Issues** (after all test phases complete)
   - Scans results from Phases 1-7.5
   - Identifies fixable issues with severity
   - Sorts by priority (critical first)

2. **Iterative Fixing** (max 3 iterations)
   - Attempts to fix each issue using `/thomas-fix`
   - Verifies fix by re-running relevant tests
   - Moves to next issue if successful

3. **Verification**
   - Console errors: Reload page, check for error text
   - Accessibility: Re-run axe-core on specific rule
   - Journeys: Marked for manual verification (full re-run too expensive)
   - Performance/Security: Marked for manual verification

4. **Results**
   - Fixed issues logged with method used
   - Failed issues logged with reason
   - Remaining issues after max iterations logged

### Q: Why didn't thomas-app fix my bug?

**A:** Possible reasons:

1. **No fixable issues found**
   - Output shows: `✅ No bugs to fix!`

2. **Autofix disabled**
   - Check `.thomas-app.json` for `"autofix": false`
   - Default is `true`, so only disabled if you configured it

3. **/thomas-fix command not available**
   - Autofix uses `/thomas-fix` slash command
   - Verify it's installed: `/help` should list it

4. **Max iterations reached**
   - After 3 iterations, remaining bugs are skipped
   - Output shows: `⚠️ Max iterations reached. Some bugs remain.`

5. **Fix failed**
   - thomas-fix ran but couldn't resolve the issue
   - Check output for: `❌ Failed: <reason>`

### Q: Can I disable automatic bug fixing?

**A:** Yes, in `.thomas-app.json`:

```json
{
  "testSuites": {
    "autofix": false
  }
}
```

Or via command line:
```bash
/thomas-app --suites=discovery,customerJourneys,performance
```

### Q: How do I debug autofix issues?

**A:** Step-by-step debugging guide:

**1. Verify autofix is enabled**
```bash
cat .thomas-app.json | grep autofix
# Should show: "autofix": true (or not present, as true is default)
```

**2. Check /thomas-fix command exists**
```bash
which /thomas-fix
# Should return: /home/user/.claude/commands/thomas-fix (or similar path)

# If not found:
ls ~/.claude/commands/thomas-fix.md
# Should exist
```

**3. Test /thomas-fix manually**
```bash
# Navigate to a project with issues
cd /path/to/project

# Run thomas-fix
/thomas-fix

# Should run without "command not found" error
```

**4. Check autofix output in Phase 7.9**

Look for these lines in console output:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 7.9: Autonomous Bug Fixing
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔧 Starting autonomous bug fixing...

  Found X fixable issues
```

**If you see:**
- `⚠️ /thomas-fix command not found` → Install thomas-fix
- `✅ No bugs to fix!` → No fixable issues were found
- `❌ Failed: <reason>` → thomas-fix ran but couldn't fix the issue

**5. Review console output for errors**

Watch for:
- `/thomas-fix` execution errors
- Timeout messages (>5 minute timeout)
- Permission errors
- Network errors during fix attempts

**6. Check autofix results in report**
```bash
cat /tmp/thomas-app/report.json | jq '.phases.autofix'
# Shows: attempted, fixed, failed, skipped counts
```

**Example output:**
```json
{
  "attempted": 5,
  "fixed": [
    {
      "issue": {"title": "Console error: undefined", "severity": "critical"},
      "iteration": 1,
      "method": "/thomas-fix"
    }
  ],
  "failed": [
    {
      "issue": {"title": "Journey failed: Checkout", "severity": "critical"},
      "iteration": 2,
      "reason": "thomas-fix did not resolve the issue"
    }
  ],
  "skipped": [],
  "iterations": [...]
}
```

**7. Common issues and solutions**

| Issue | Cause | Solution |
|-------|-------|----------|
| Command not found | /thomas-fix not installed | Install from ~/.claude/commands/ |
| No bugs to fix | All tests passed | Nothing to fix! |
| Fix failed | Issue too complex | Fix manually |
| Timeout | thomas-fix taking >5min | Increase timeout in autofix.js |
| Max iterations | 3 attempts exhausted | Review failed fixes, fix manually |

### Q: What's the difference between thomas-app autofix and /thomas-fix?

**A:**

**thomas-app autofix (Phase 7.9)**:
- Runs AFTER all testing phases (1-7.5)
- Collects ALL identified issues
- Calls `/thomas-fix` for each issue
- Iterative with verification
- Part of the testing workflow

**/thomas-fix (slash command)**:
- Runs independently (manual invocation)
- General-purpose fix command
- Used BY autofix phase
- Can be used standalone for any bug

**Think of it as**: thomas-app autofix is the **orchestrator** that calls `/thomas-fix` as the **worker**.

---

## Screen Flow Testing

### Q: What is screen flow testing?

**A:** Phase 3.5 automatically:
1. Discovers all screens (states) in your app
2. Finds all transitions (clickable elements)
3. Tests 71+ interaction patterns on each screen
4. Generates flow maps in 3 formats (JSON, Mermaid, HTML)

**Coverage metrics:**
- **All-States**: 100% of discovered screens visited
- **All-Transitions**: 95%+ of clickable elements tested
- **All-Interactions**: 71+ distinct patterns tested
- **All-Paths**: Critical user journeys validated

### Q: What are the 71+ interaction patterns?

**A:** Organized in 7 categories:

**1. Keyboard (12 patterns)**
- Tab navigation (forward/backward)
- Enter key activation
- Arrow key navigation (up/down/left/right)
- Escape key handling
- Keyboard shortcuts (Ctrl+, Alt+, Shift+)
- Spacebar activation

**2. Mouse (12 patterns)**
- Click (left/right/middle)
- Double-click
- Hover effects
- Drag and drop
- Context menu
- Wheel scrolling

**3. Touch (12 gestures)**
- Tap / Double-tap / Long-press
- Swipe (up/down/left/right)
- Pinch zoom (in/out)
- Two-finger scroll
- Rotate gesture

**4. Scroll (9 types)**
- Wheel scroll
- Trackpad scroll
- Touch scroll
- Keyboard scroll (arrows, Page Up/Down, Home/End)
- Scroll to element
- Infinite scroll detection

**5. Zoom (6 levels)**
- Browser zoom: 50%, 75%, 100%, 125%, 150%, 200%
- Tests layout at each level
- Validates responsive breakpoints

**6. Forms (8 input types)**
- Text input (validation, max length)
- Number input (min/max, step)
- Select dropdowns
- Checkboxes
- Radio buttons
- Textareas
- File uploads
- Date pickers

**7. Voice (future)**
- Screen reader navigation
- Voice commands
- ARIA live regions

### Q: How long does screen flow testing take?

**A:** Performance breakdown:

- **State discovery**: ~1-2 seconds per route
- **Interaction testing**: ~5-10 seconds per state
- **Flow map generation**: <1 second
- **Total for 10 states**: ~2-5 minutes

**Example:**
- 5 routes discovered
- 10 unique states found
- 71 interactions per state = 710 total tests
- **Total time: ~3-4 minutes**

### Q: What flow map formats are generated?

**A:** Three complementary formats:

**1. JSON (flow-map-state-machine.json)**
- Machine-readable state machine model
- Use for: CI/CD integration, automated analysis
- Contains: States, transitions, elements, metadata

**2. Mermaid (flow-map-diagram.mmd)**
- Human-readable flow diagram
- Use for: Documentation, pull requests
- Render with: Mermaid Live Editor, GitHub (auto-renders)

**3. Interactive HTML (flow-map-interactive.html)**
- D3.js visualization with screenshots
- Use for: Presentations, stakeholder reviews
- Features: Zoom, pan, click to view screenshots

### Q: Can I customize which interactions are tested?

**A:** Currently no, but planned for v3.3. All 71+ patterns run by default.

To disable screen flow entirely:
```json
{
  "testSuites": {
    "screenFlow": false
  }
}
```

---

## Configuration

### Q: Where is the configuration file?

**A:** `.thomas-app.json` in your project root.

**Default location:**
```
/path/to/your/project/.thomas-app.json
```

**Example configuration:**
```json
{
  "baseUrl": "http://localhost:3000",
  "outputDir": "/tmp/thomas-app",
  "testSuites": {
    "discovery": true,
    "customerJourneys": true,
    "screenFlow": true,
    "autofix": true
  },
  "github": {
    "createIssues": true
  },
  "performance": {
    "lighthouse": {
      "performance": 70,
      "accessibility": 90,
      "bestPractices": 80,
      "seo": 80
    }
  }
}
```

### Q: What command-line flags are available?

**A:**

```bash
# Quick mode (2 min, essential tests only)
/thomas-app --quick

# Deep mode (15-20 min, all agents + reviews)
/thomas-app --deep

# App-specific modes
/thomas-app --game       # Game-focused testing
/thomas-app --ecommerce  # E-commerce-focused testing

# Custom test suites
/thomas-app --suites=discovery,customerJourneys,performance

# GitHub integration
/thomas-app --create-issues

# Custom base URL
/thomas-app --url=http://localhost:8080
```

### Q: How do I add custom customer journeys?

**A:** In `.thomas-app.json`:

```json
{
  "customerJourneys": [
    {
      "name": "User Registration",
      "steps": [
        { "type": "navigate", "url": "/signup" },
        { "type": "fill", "selector": "#email", "value": "test@example.com" },
        { "type": "fill", "selector": "#password", "value": "SecurePass123!" },
        { "type": "click", "selector": "button[type=submit]" },
        { "type": "waitForSelector", "selector": ".welcome-message" }
      ],
      "expected": {
        "url": "/dashboard",
        "title": "Dashboard"
      }
    }
  ]
}
```

**Available step types:**
- `navigate` - Go to URL
- `click` - Click element
- `fill` - Fill input field
- `select` - Select dropdown option
- `waitForSelector` - Wait for element
- `waitForNavigation` - Wait for page load
- `screenshot` - Capture screenshot

---

## WSL2 & Environment

### Q: Does thomas-app work in WSL2?

**A:** **YES!** WSL2 is fully supported with automatic detection.

**How it works:**
1. Detects WSL2 via `/proc/version`
2. Applies compatibility flags automatically:
   - `--disable-software-rasterizer`
   - `--disable-gpu`
   - `--no-sandbox`
   - `--disable-dev-shm-usage`

**No manual configuration required!**

### Q: I'm getting "ptrace: Operation not permitted" error

**A:** This is a WSL2 browser launch issue. Thomas-app v3.1.0+ handles this automatically.

**If you're on an older version:**
```bash
# Upgrade to latest
cd ~/.claude/scripts/thomas-app
git pull
npm install
```

**Manual workaround (if needed):**
```bash
# In .thomas-app.json
{
  "browser": {
    "args": [
      "--no-sandbox",
      "--disable-setuid-sandbox"
    ]
  }
}
```

### Q: What about native Linux?

**A:** Fully supported. Auto-detection determines if you're in WSL2 or native Linux and applies appropriate flags.

---

## Performance

### Q: How can I make thomas-app faster?

**A:**

**1. Use --quick mode**
```bash
/thomas-app --quick
```
- Skips: Deep agent reviews, game AI, real-world conditions
- Time: ~2 minutes vs. 15-20 minutes

**2. Disable unused test suites**
```json
{
  "testSuites": {
    "gameAI": false,
    "agentReviews": false,
    "autofix": false
  }
}
```

**3. Reduce viewport testing**
```json
{
  "viewports": [
    { "name": "desktop", "width": 1920, "height": 1080 }
  ]
}
```
- Default tests: mobile, tablet, desktop
- Single viewport = 3x faster

**4. Skip screen flow testing**
```json
{
  "testSuites": {
    "screenFlow": false
  }
}
```
- Saves: ~2-5 minutes depending on app size

### Q: How much memory does thomas-app use?

**A:**

**Typical usage:**
- **Browser (Chromium)**: 200-400 MB
- **Node.js process**: 100-200 MB
- **Total**: 300-600 MB

**Large apps (100+ screens):**
- **Browser**: 400-800 MB
- **Node.js**: 200-400 MB
- **Total**: 600-1200 MB

**Memory management:**
- Console logs capped at 1000 entries
- Screenshots saved to disk (not kept in memory)
- States released after verification
- Browser closed after each phase

### Q: Can I run thomas-app in CI/CD?

**A:** **YES!** See `CI-CD-INTEGRATION.md` for full guide.

**Quick setup:**

```yaml
# .github/workflows/thomas-app.yml
name: Thomas-App Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Install thomas-app
        run: |
          npm install -g thomas-app
          playwright install chromium

      - name: Run tests
        run: /thomas-app --quick

      - name: Upload report
        uses: actions/upload-artifact@v3
        with:
          name: test-report
          path: /tmp/thomas-app/report.html
```

---

## Troubleshooting

### Q: Selector timeout errors

**A:** Thomas-app v3.1.0+ provides suggestions:

```
❌ Selector timeout: ".product"

Found similar selectors:
  - .product-card (5 matches)
  - .product-item (12 matches)
  - [class*="product"] (20 matches)

Recommendation: Try .product-card or .product-item
```

**To fix:**
1. Use suggested selector
2. Check if element loads dynamically (add `waitForSelector`)
3. Increase timeout in custom journey

### Q: "thomas-fix command not found"

**A:** Install the thomas-fix slash command:

```bash
# Check if it exists
ls ~/.claude/commands/thomas-fix.md

# If missing, create it or contact support
```

thomas-fix is a separate Claude Code slash command that thomas-app uses for automatic fixing.

### Q: GitHub issues not being created

**A:** Requirements:

**1. Install GitHub CLI**
```bash
# macOS
brew install gh

# Linux
sudo apt install gh
```

**2. Authenticate**
```bash
gh auth login
```

**3. Enable in config**
```json
{
  "github": {
    "createIssues": true
  }
}
```

**4. Run with flag**
```bash
/thomas-app --create-issues
```

### Q: Flow map HTML not rendering

**A:** Open in browser:

```bash
# macOS
open /tmp/thomas-app/flow-map-interactive.html

# Linux
xdg-open /tmp/thomas-app/flow-map-interactive.html

# WSL2
explorer.exe /tmp/thomas-app/flow-map-interactive.html
```

**Requirements:**
- Modern browser (Chrome, Firefox, Edge)
- JavaScript enabled
- D3.js loads from CDN (internet required)

### Q: High memory usage

**A:**

**Check memory:**
```bash
ps aux | grep -E "chrome|node.*thomas"
```

**Solutions:**

1. **Close other browsers** (thomas-app launches its own)
2. **Reduce viewports** (test fewer screen sizes)
3. **Disable screen flow** (memory-intensive)
4. **Use --quick mode** (fewer phases)

**Memory leaks:**
- Fixed in v3.1.0 with console log capping
- Fixed in v3.2.0 with state cleanup
- Update to latest version

### Q: Tests fail randomly

**A:** Common causes:

**1. Network instability**
```json
{
  "timeouts": {
    "navigation": 30000,
    "selector": 10000
  }
}
```

**2. Race conditions**
- Add explicit waits in custom journeys
- Use `waitForSelector` before `click`

**3. Dynamic content**
- Wait for loading spinners to disappear
- Wait for API calls to complete

**4. Shared state**
- Use incognito mode (thomas-app default)
- Clear cookies between journeys

### Q: Where are the reports?

**A:** Default location: `/tmp/thomas-app/`

**Files generated:**
- `report.json` - Machine-readable results
- `report.html` - Beautiful HTML report
- `flow-map-state-machine.json` - State machine model
- `flow-map-diagram.mmd` - Mermaid diagram
- `flow-map-interactive.html` - Interactive visualization
- `flow-state-*.png` - Screenshots of each state
- `journey-*.png` - Screenshots from customer journeys

**Change location:**
```json
{
  "outputDir": "/path/to/custom/output"
}
```

### Q: How do I report bugs?

**A:**

**1. GitHub Issues**
https://github.com/thomas0369/claude_ai/issues

**2. Include:**
- thomas-app version: `cat ~/.claude/scripts/thomas-app/package.json | grep version`
- Environment: WSL2 / Linux / macOS
- Error message or unexpected behavior
- `.thomas-app.json` (if applicable)
- Console output

**3. Attach:**
- `/tmp/thomas-app/report.json`
- Screenshots of issue

---

## Advanced Topics

### Q: Can I extend thomas-app with custom phases?

**A:** Yes! Create a new phase file:

```javascript
// phases/my-custom-phase.js
async function run(orchestrator) {
  const { page, config, results } = orchestrator;

  console.log('Running custom phase...');

  // Your custom testing logic
  const customResults = {
    metric1: 'value1',
    metric2: 'value2'
  };

  return customResults;
}

module.exports = { run };
```

Add to orchestrator:
```javascript
// In orchestrator.js run() method
const customPhase = require('./phases/my-custom-phase');
this.results.phases.customPhase = await customPhase.run(this);
```

### Q: How does thomas-app detect app type?

**A:** Heuristic detection in `phases/discovery.js`:

**Game:**
- Canvas element present
- Game libraries detected (Phaser, Konva, Babylon.js)
- Keywords in title: "game", "play", "score"

**E-commerce:**
- Cart/product/checkout elements
- Keywords in HTML: "shop", "buy", "cart"

**SaaS:**
- Dashboard/settings elements
- Keywords in title: "dashboard", "app", "platform"

**Content:**
- Article elements, many headings
- Blog/post class names

**Fallback:** Generic "website"

### Q: What's the difference between phases?

**A:** 10 distinct phases:

1. **Discovery** - App type, routes, features
2. **Customer Journeys** - End-to-end flows
3. **Visual & Interaction** - Multi-viewport, interactions
4. **Screen Flow** (NEW v3.2) - 71+ patterns, flow mapping
5. **Specialized** - Game AI, e-commerce, SEO
6. **Performance** - Lighthouse, Core Web Vitals
7. **Accessibility** - axe-core, WCAG compliance
8. **Security** - Headers, data exposure
9. **Real-World** - Network throttling, devices
10. **Agent Reviews** (--deep) - Code review agents
11. **Autofix** (7.9) - Automatic bug fixing
12. **Reporting** - JSON, HTML, Mermaid

---

## Version-Specific Questions

### Q: What's new in v3.2.0?

**A:** Screen Flow & Comprehensive Interaction Testing

- 71+ interaction patterns (was ~20)
- Automatic flow mapping (JSON, Mermaid, HTML)
- 4 coverage metrics
- Phase 3.5 integration
- 900+ lines of new code

See `CHANGELOG.md` for full details.

### Q: What's new in v3.1.0?

**A:** Production Improvements from Real Usage

- WSL2 auto-detection
- Selector error suggestions
- Code quality scanning (Phase 7.3)
- GitHub issue integration
- Enhanced error messages

See `LEARNINGS-FROM-USAGE.md` for analysis.

### Q: How do I upgrade?

**A:**

```bash
cd ~/.claude/scripts/thomas-app
git pull
npm install
```

**Breaking changes:** None (backward compatible)

---

## Getting Help

### Q: Where is the documentation?

**A:**

- **README.md** - Complete user guide
- **QUICK-START.md** - Get started in 5 minutes
- **CHANGELOG.md** - Version history
- **FAQ.md** - This document
- **CI-CD-INTEGRATION.md** - CI/CD setup
- **SCREEN-FLOW-TESTING-DESIGN.md** - Technical design
- **HOW-SCREEN-FLOW-WORKS.md** - Flow testing explanation

### Q: How can I contribute?

**A:**

**1. Report bugs** - GitHub Issues
**2. Suggest features** - GitHub Discussions
**3. Submit pull requests** - See CONTRIBUTING.md
**4. Share usage** - Help improve thomas-app

### Q: What's the license?

**A:** MIT License - Free to use, modify, distribute.

---

**Last Updated**: 2025-11-15 (v3.2.0)

**Made with by Thomas - Testing applications autonomously since 2025**
