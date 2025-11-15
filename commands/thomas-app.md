---
description: World-class complete application testing from user perspective - customer journeys, game AI, visual analysis, accessibility, performance, SEO, and security
category: testing
allowed-tools: Bash, Task, TodoWrite, Read, Edit, MultiEdit, Glob, Grep, Write, SlashCommand
---

# Thomas App - Complete Application Testing Command

Test your application from every angle: user experience, performance, accessibility, game mechanics, SEO, security, and real-world conditions.

## Overview

`/thomas-app` provides **holistic application testing** that goes beyond code validation:

- **User Perspective**: Customer journeys, UX flows, accessibility
- **Technical Perspective**: Performance, security, reliability
- **Business Perspective**: Analytics, conversions, SEO
- **Game Perspective**: AI player testing, balance analysis (for games)
- **Visual Perspective**: Design consistency, responsive layouts
- **Real-World Testing**: Slow networks, various devices

**Difference from /thomas-fix**:
- `/thomas-fix`: Developer-focused code validation (lint, types, tests, build)
- `/thomas-app`: User-focused experience testing (does the app work well for users?)

## Usage

```bash
# Run complete application testing
/thomas-app

# Run with specific test suites
/thomas-app --suites=ux,performance,accessibility

# Quick scan (critical tests only, ~2 minutes)
/thomas-app --quick

# Full deep scan (all tests + AI agent reviews, ~15-20 minutes)
/thomas-app --deep

# Game-focused testing (includes AI player)
/thomas-app --game

# E-commerce focused testing
/thomas-app --ecommerce
```

## Process Flow

```
┌─────────────────────────────────────────────────────────┐
│  PHASE 1: Discovery & Context Analysis                 │
│  ├─ Detect app type (game, ecommerce, SaaS, content)   │
│  ├─ Discover routes and navigation structure            │
│  ├─ Identify features (auth, payments, forms, etc.)     │
│  ├─ Build route graph and priority map                  │
│  └─ Select appropriate test suites                      │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│  PHASE 2: Customer Journey Testing                      │
│  ├─ Map critical user flows based on app type           │
│  ├─ Test complete journeys (entry → goal completion)    │
│  ├─ Measure friction points and timing                  │
│  ├─ Identify drop-off risks                             │
│  └─ Screenshot key steps for visual verification        │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│  PHASE 3: Visual & Interaction Analysis                 │
│  ├─ Screen-by-screen visual checks (all viewports)      │
│  ├─ Test every button, link, form element               │
│  ├─ Visual regression detection                         │
│  ├─ Responsive layout validation                        │
│  └─ Console error monitoring                            │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│  PHASE 4: Specialized Testing (Context-Aware)           │
│  ├─ Game AI Player (if game detected)                   │
│  │  ├─ Test with random, optimal, skill curve strategies│
│  │  ├─ Detect exploits and balance issues               │
│  │  └─ Predict frustration/boredom points               │
│  ├─ E-commerce Flow (if checkout detected)              │
│  │  ├─ Complete purchase journey                        │
│  │  ├─ Cart abandonment risk analysis                   │
│  │  └─ Payment flow validation                          │
│  └─ Content Analysis (if blog/articles detected)        │
│     ├─ SEO meta tags validation                         │
│     ├─ Social sharing optimization                      │
│     └─ Reading experience metrics                       │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│  PHASE 5: Performance & Accessibility                   │
│  ├─ Core Web Vitals (LCP, FID, CLS)                     │
│  ├─ Lighthouse audit (all categories)                   │
│  ├─ Bundle size analysis                                │
│  ├─ Accessibility deep scan (axe-core)                  │
│  ├─ Keyboard navigation testing                         │
│  └─ Screen reader simulation                            │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│  PHASE 6: Security & Analytics                          │
│  ├─ Client-side security (XSS, CSRF, data exposure)     │
│  ├─ Security headers validation                         │
│  ├─ Mixed content detection                             │
│  ├─ Analytics tracking verification                     │
│  └─ Privacy compliance check (GDPR, cookies)            │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│  PHASE 7: Real-World Conditions                         │
│  ├─ Network throttling (4G, 3G, slow 3G)                │
│  ├─ Device emulation (mobile, tablet, desktop)          │
│  ├─ Offline behavior testing                            │
│  └─ Slow connection resilience                          │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│  PHASE 7.5: AI Agent Code Reviews (--deep mode only)    │
│  ├─ code-review-expert (always)                         │
│  ├─ accessibility-expert (if a11y issues)               │
│  ├─ react-performance-expert (if React detected)        │
│  ├─ css-styling-expert (if visual issues)               │
│  └─ typescript-expert (if TypeScript detected)          │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│  PHASE 8: Intelligent Reporting                         │
│  ├─ Aggregate all findings                              │
│  ├─ Calculate priority scores (impact × urgency)        │
│  ├─ Generate actionable recommendations                 │
│  ├─ Create comparison with baseline (if exists)         │
│  ├─ Generate HTML report with screenshots               │
│  └─ Save metrics for trend analysis                     │
└─────────────────────────────────────────────────────────┘
                           ↓
                       🎉 DONE
```

## Implementation

When this command runs, it executes the Thomas App orchestrator to perform comprehensive application testing.

### Step 1: Verify Prerequisites

```bash
# Check if orchestrator is installed
if [ ! -f ~/.claude/scripts/thomas-app/orchestrator.js ]; then
  echo "❌ ERROR: Thomas App orchestrator not found"
  echo "Installing orchestrator..."
  cd ~/.claude/scripts/thomas-app && npm install
  if [ $? -ne 0 ]; then
    echo "Failed to install dependencies"
    exit 1
  fi
fi

# Check if we're in a valid project directory
if [ ! -f package.json ]; then
  echo "❌ ERROR: No package.json found. Please run from project root."
  exit 1
fi
```

### Step 2: Detect and Start Dev Server

```bash
# Check for running dev server on common ports
echo "🔍 Checking for dev server..."
DEV_PORT=""
SERVER_PID=""

for port in 3000 5173 8080 4200; do
  if lsof -ti:$port > /dev/null 2>&1; then
    echo "✅ Found dev server on port $port"
    DEV_PORT=$port
    break
  fi
done

# If no server running, start one
if [ -z "$DEV_PORT" ]; then
  echo "🚀 Starting dev server..."

  # Detect start script
  if grep -q '"dev":' package.json; then
    npm run dev > /tmp/thomas-app-server.log 2>&1 &
    SERVER_PID=$!
    DEV_PORT=3000  # Assume default
  elif grep -q '"start":' package.json; then
    npm start > /tmp/thomas-app-server.log 2>&1 &
    SERVER_PID=$!
    DEV_PORT=3000
  else
    echo "⚠️  No dev/start script found in package.json"
    echo "Please start your dev server manually and re-run /thomas-app"
    exit 1
  fi

  # Wait for server to be ready (max 30 seconds)
  echo "⏳ Waiting for server to start..."
  for i in {1..30}; do
    if curl -s http://localhost:$DEV_PORT > /dev/null 2>&1; then
      echo "✅ Server ready on port $DEV_PORT"
      break
    fi
    sleep 1
  done

  if ! curl -s http://localhost:$DEV_PORT > /dev/null 2>&1; then
    echo "❌ Server failed to start. Check /tmp/thomas-app-server.log"
    [ -n "$SERVER_PID" ] && kill $SERVER_PID 2>/dev/null
    exit 1
  fi
fi
```

### Step 3: Run the Orchestrator

```bash
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📱 THOMAS APP - COMPLETE APPLICATION TESTING"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd ~/.claude/scripts/thomas-app

# Extract command arguments (--quick, --deep, etc.)
ARGS="$@"

# Run orchestrator
node orchestrator.js $ARGS

# Capture exit code
EXIT_CODE=$?
```

### Step 4: Cleanup

```bash
# Kill dev server if we started it
if [ -n "$SERVER_PID" ]; then
  echo ""
  echo "🧹 Stopping dev server (PID: $SERVER_PID)..."
  kill $SERVER_PID 2>/dev/null
  wait $SERVER_PID 2>/dev/null
fi
```

### Step 5: Display Results Summary

```bash
if [ $EXIT_CODE -eq 0 ]; then
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "✅ TESTING COMPLETE"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "📊 View Reports:"
  echo "  JSON: ls -lt /tmp/thomas-app/report-*.json | head -1"
  echo "  HTML: ls -lt /tmp/thomas-app/report-*.html | head -1"
  echo "  Screenshots: ls /tmp/thomas-app/screenshots/"
  echo ""
  echo "🎯 Next Steps:"
  echo "  1. Review priority actions in the report"
  echo "  2. Fix critical/high issues"
  echo "  3. Run /thomas-app again to verify improvements"
  echo "  4. Consider running /thomas-fix for code validation"
  echo ""
  exit 0
else
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "❌ TESTING FAILED"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "Check output above for errors"
  echo "Server log: /tmp/thomas-app-server.log"
  echo ""
  exit $EXIT_CODE
fi
```

**What the orchestrator does:**

1. **Phase 1: Discovery** - Detects app type, routes, and features
2. **Phase 2: Customer Journeys** - Tests critical user flows
3. **Phase 3: Visual & Interaction** - Multi-viewport testing
4. **Phase 4: Specialized** - Context-aware tests (game AI, e-commerce, etc.)
5. **Phase 5: Performance & Accessibility** - Core Web Vitals, a11y scans
6. **Phase 6: Security & Analytics** - Security headers, XSS checks
7. **Phase 7: Real-World** - Network throttling, device emulation
8. **Phase 7.5: Agent Reviews** - AI code review (if --deep)
9. **Phase 7.9: Autofix** - Autonomous bug fixing
10. **Phase 8: Reporting** - Generate JSON, HTML, screenshots

## Detailed Phases

### PHASE 1: Discovery & Context Analysis

**Goal**: Understand what we're testing to select appropriate test suites

#### Steps:

1. **Detect app type**
   ```bash
   # Check package.json dependencies
   if grep -q "konva\|phaser\|babylonjs" package.json; then
     APP_TYPE="game"
   elif grep -q "stripe\|@stripe\|commerce" package.json; then
     APP_TYPE="ecommerce"
   elif grep -q "next\|remix\|gatsby" package.json; then
     APP_TYPE="content"
   else
     APP_TYPE="saas"
   fi
   ```

2. **Discover routes**
   - Parse route files (React Router, Next.js, etc.)
   - Build navigation graph
   - Identify critical paths

3. **Identify features**
   - Authentication (check for login/auth routes)
   - Forms (scan for form elements)
   - Payments (Stripe, PayPal detected)
   - Real-time (WebSocket, SSE)
   - File uploads
   - Search functionality

4. **Select test suites**
   - Critical tests (always run)
   - Context-aware tests (based on app type)
   - Optional tests (based on time budget)

### PHASE 2: Customer Journey Testing

**Goal**: Test complete user flows from entry to goal

#### Auto-Generated Journeys by App Type:

**Game App**:
```typescript
journeys = [
  {
    name: "New Player Onboarding",
    steps: [
      { action: "Navigate to /game", check: "Game loads" },
      { action: "Start tutorial", check: "Tutorial clear and helpful" },
      { action: "Complete first level", check: "Victory feedback shown" },
      { action: "View score", check: "Score displayed correctly" }
    ],
    expectedDuration: 180000,  // 3 minutes
    criticalPath: true
  },
  {
    name: "Gameplay Loop",
    steps: [
      { action: "Play level", check: "Controls responsive" },
      { action: "Die/Game over", check: "Clear feedback" },
      { action: "Retry", check: "Quick restart" },
      { action: "Win", check: "Progress saved" }
    ]
  }
]
```

**E-commerce App**:
```typescript
journeys = [
  {
    name: "Browse to Purchase",
    steps: [
      { action: "Land on homepage", check: "Products visible" },
      { action: "Search for product", check: "Search works" },
      { action: "View product details", check: "Details complete" },
      { action: "Add to cart", check: "Cart updates" },
      { action: "Checkout", check: "Checkout flow smooth" },
      { action: "Enter payment", check: "Payment secure" },
      { action: "Complete order", check: "Confirmation shown" }
    ],
    expectedDuration: 300000,  // 5 minutes
    criticalPath: true
  }
]
```

**SaaS App**:
```typescript
journeys = [
  {
    name: "Sign Up to First Value",
    steps: [
      { action: "Land on homepage", check: "Value prop clear" },
      { action: "Click 'Get Started'", check: "CTA works" },
      { action: "Complete registration", check: "Form validation helpful" },
      { action: "Verify email", check: "Email sent" },
      { action: "Complete onboarding", check: "Onboarding clear" },
      { action: "Reach first value moment", check: "Success!" }
    ],
    expectedDuration: 240000,  // 4 minutes
    criticalPath: true
  }
]
```

#### Journey Testing Execution:

```typescript
for (const journey of journeys) {
  console.log(`\n🧭 Testing Journey: ${journey.name}`);

  const startTime = Date.now();
  const results = {
    completed: true,
    steps: [],
    frictionPoints: [],
    screenshots: []
  };

  for (const step of journey.steps) {
    try {
      const stepStart = Date.now();

      // Execute step action
      await executeAction(page, step.action);

      // Perform check
      const checkResult = await performCheck(page, step.check);

      const stepDuration = Date.now() - stepStart;

      // Screenshot critical steps
      if (step.screenshot !== false) {
        const screenshotPath = `/tmp/thomas-app-journey-${journey.name}-step${step.number}.png`;
        await page.screenshot({ path: screenshotPath, fullPage: true });
        results.screenshots.push(screenshotPath);
      }

      results.steps.push({
        name: step.action,
        passed: checkResult.passed,
        duration: stepDuration,
        issues: checkResult.issues
      });

      // Detect friction
      if (stepDuration > step.expectedDuration * 2) {
        results.frictionPoints.push({
          step: step.action,
          issue: `Took ${stepDuration}ms (expected ~${step.expectedDuration}ms)`,
          severity: 'high'
        });
      }

    } catch (error) {
      results.completed = false;
      results.failedStep = step.action;
      results.error = error.message;
      break;
    }
  }

  const totalDuration = Date.now() - startTime;

  if (results.completed) {
    console.log(`  ✅ Completed in ${totalDuration}ms`);
    if (results.frictionPoints.length > 0) {
      console.log(`  ⚠️  ${results.frictionPoints.length} friction points detected`);
    }
  } else {
    console.log(`  ❌ Failed at: ${results.failedStep}`);
    console.log(`  Error: ${results.error}`);
  }
}
```

### PHASE 3: Visual & Interaction Analysis

**Goal**: Verify visual correctness across all screens and viewports

#### Screen Testing:

```typescript
const viewports = [
  { name: 'Desktop', width: 1920, height: 1080 },
  { name: 'Laptop', width: 1366, height: 768 },
  { name: 'Tablet', width: 768, height: 1024 },
  { name: 'Mobile', width: 375, height: 667 }
];

for (const route of discoveredRoutes) {
  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.goto(`http://localhost:${PORT}${route}`);

    // Visual checks
    const checks = {
      noHorizontalScroll: await page.evaluate(() =>
        document.documentElement.scrollWidth <= window.innerWidth
      ),

      noOverlap: await checkElementOverlap(page),

      readableText: await page.$$eval('*', elements =>
        elements.every(el => {
          const style = window.getComputedStyle(el);
          const fontSize = parseFloat(style.fontSize);
          return fontSize >= 14;  // Minimum readable size
        })
      ),

      contrastRatio: await checkColorContrast(page),

      imagesLoaded: await page.$$eval('img', imgs =>
        imgs.every(img => img.complete && img.naturalHeight > 0)
      ),

      buttonsClickable: await checkTouchTargets(page)
    };

    // Screenshot
    const screenshotPath = `/tmp/thomas-app-${route.replace(/\//g, '-')}-${viewport.name}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });

    // Visual regression (if baseline exists)
    if (fs.existsSync(`.thomas-app/baseline/${route}-${viewport.name}.png`)) {
      const diff = await compareImages(
        screenshotPath,
        `.thomas-app/baseline/${route}-${viewport.name}.png`
      );

      if (diff.percentage > 5) {
        console.log(`  ⚠️  Visual regression: ${route} @ ${viewport.name} (${diff.percentage}% different)`);
      }
    }
  }
}
```

#### Button & Interaction Testing:

```typescript
// Discover all interactive elements
const interactiveElements = await page.$$eval(
  'button, a[href], input[type="submit"], [role="button"]',
  elements => elements.map((el, index) => ({
    index,
    tag: el.tagName,
    text: el.textContent?.trim(),
    type: el.getAttribute('type'),
    role: el.getAttribute('role')
  }))
);

console.log(`\n🔘 Testing ${interactiveElements.length} interactive elements...`);

for (const element of interactiveElements) {
  const selector = `${element.tag}:nth-of-type(${element.index + 1})`;

  // Test 1: Click responsiveness
  const clickTime = await measureClickResponse(page, selector);
  if (clickTime > 100) {
    console.log(`  ⚠️  Slow click response: "${element.text}" (${clickTime}ms)`);
  }

  // Test 2: Touch target size (mobile)
  await page.setViewportSize({ width: 375, height: 667 });
  const size = await page.$eval(selector, el => {
    const rect = el.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  });

  if (size.width < 44 || size.height < 44) {
    console.log(`  ⚠️  Touch target too small: "${element.text}" (${size.width}x${size.height})`);
  }

  // Test 3: Keyboard accessibility
  await page.$eval(selector, el => el.focus());
  await page.keyboard.press('Enter');
  // Verify same action as click

  // Test 4: Focus indicator visible
  const hasFocusIndicator = await page.$eval(selector, el => {
    const style = window.getComputedStyle(el, ':focus');
    return style.outline !== 'none' && style.outlineWidth !== '0px';
  });

  if (!hasFocusIndicator) {
    console.log(`  ⚠️  No focus indicator: "${element.text}"`);
  }
}
```

### PHASE 4: Game AI Player (Games Only)

**Goal**: Test game mechanics, balance, and difficulty with intelligent AI

#### Game Detection:

```typescript
const isGame = await page.evaluate(() => {
  return !!(
    document.querySelector('canvas') ||
    window.Konva ||
    window.Phaser ||
    window.BABYLON ||
    document.querySelector('[data-game]')
  );
});

if (!isGame) {
  console.log('⏭️  Skipping Game AI Player (not a game)');
  return;
}
```

#### AI Player Implementation:

```typescript
class GameAIPlayer {
  async analyzeGame(page) {
    // Detect game state structure
    this.gameState = await page.evaluate(() => {
      // Try to access game instance
      const game = window.game || window.gameInstance || window.app;

      if (!game) return null;

      return {
        score: game.score || 0,
        level: game.level || 1,
        lives: game.lives || 0,
        playerPosition: game.player?.position || { x: 0, y: 0 },
        enemies: game.enemies?.length || 0,
        controls: this.detectControls()
      };
    });
  }

  detectControls() {
    // Detect keyboard controls
    const controls = {
      up: 'ArrowUp',
      down: 'ArrowDown',
      left: 'ArrowLeft',
      right: 'ArrowRight',
      jump: 'Space',
      shoot: 'KeyX'
    };

    // Could be WASD instead
    // Could be mouse-based
    // Return detected control scheme
    return controls;
  }

  async playRandom(page, duration = 30000) {
    console.log('\n🎮 AI Player: Random Strategy (Baseline)');

    const actions = ['up', 'down', 'left', 'right', 'jump', 'shoot'];
    const startTime = Date.now();
    let actionCount = 0;

    while (Date.now() - startTime < duration) {
      const action = actions[Math.floor(Math.random() * actions.length)];
      await this.performAction(page, action);
      actionCount++;
      await page.waitForTimeout(100);

      // Check if game over
      const gameOver = await this.isGameOver(page);
      if (gameOver) break;
    }

    const finalState = await this.getGameState(page);

    return {
      strategy: 'random',
      duration: Date.now() - startTime,
      actions: actionCount,
      score: finalState.score,
      level: finalState.level,
      survived: !finalState.gameOver
    };
  }

  async playOptimal(page, duration = 60000) {
    console.log('\n🎮 AI Player: Optimal Strategy (Difficulty Test)');

    const startTime = Date.now();
    let actionCount = 0;

    while (Date.now() - startTime < duration) {
      // Get current game state
      const state = await this.getGameState(page);

      // Calculate best action
      const action = this.calculateBestAction(state);

      await this.performAction(page, action);
      actionCount++;
      await page.waitForTimeout(16);  // ~60fps

      if (state.gameOver || state.levelComplete) break;
    }

    const finalState = await this.getGameState(page);

    return {
      strategy: 'optimal',
      duration: Date.now() - startTime,
      actions: actionCount,
      score: finalState.score,
      level: finalState.level,
      efficiency: finalState.score / actionCount
    };
  }

  calculateBestAction(state) {
    // Pathfinding and threat analysis
    const threats = this.identifyThreats(state);
    const opportunities = this.identifyOpportunities(state);

    if (threats.length > 0) {
      // Avoid most dangerous threat
      return this.avoidThreat(threats[0], state);
    }

    if (opportunities.length > 0) {
      // Pursue best opportunity (power-up, collectible, etc.)
      return this.pursueOpportunity(opportunities[0], state);
    }

    // Move towards objective
    return this.moveTowardsObjective(state);
  }

  identifyThreats(state) {
    // Enemies, obstacles, projectiles
    return state.enemies
      .filter(enemy => this.isInDangerZone(enemy, state.player))
      .map(enemy => ({
        type: 'enemy',
        position: enemy.position,
        danger: this.calculateDanger(enemy, state.player)
      }))
      .sort((a, b) => b.danger - a.danger);
  }

  async testDifficultyCurve(page) {
    console.log('\n📊 Testing Difficulty Curve...');

    const levels = [];
    let currentLevel = 1;

    while (currentLevel <= 10) {  // Test first 10 levels
      await this.startLevel(page, currentLevel);

      const result = await this.playOptimal(page, 120000);  // 2 min per level

      levels.push({
        level: currentLevel,
        completed: result.levelComplete,
        time: result.duration,
        score: result.score,
        deaths: result.deaths || 0
      });

      if (!result.levelComplete) {
        console.log(`  ❌ AI failed at level ${currentLevel}`);
        break;
      }

      currentLevel++;
    }

    // Analyze curve
    const analysis = this.analyzeDifficultyCurve(levels);

    return analysis;
  }

  analyzeDifficultyCurve(levels) {
    const issues = [];

    for (let i = 1; i < levels.length; i++) {
      const prev = levels[i - 1];
      const curr = levels[i];

      // Check for difficulty spikes
      const timeIncrease = curr.time / prev.time;
      if (timeIncrease > 2.0) {
        issues.push({
          type: 'difficulty-spike',
          level: curr.level,
          message: `Level ${curr.level} is ${timeIncrease.toFixed(1)}x harder than level ${prev.level}`,
          suggestion: 'Consider smoothing difficulty progression'
        });
      }

      // Check for easier levels after harder ones
      if (curr.time < prev.time * 0.7) {
        issues.push({
          type: 'difficulty-drop',
          level: curr.level,
          message: `Level ${curr.level} is easier than level ${prev.level}`,
          suggestion: 'Ensure consistent difficulty progression'
        });
      }
    }

    return {
      levels,
      issues,
      recommendation: this.getDifficultyRecommendation(levels, issues)
    };
  }

  async detectExploits(page) {
    console.log('\n🔍 Searching for exploits...');

    const exploits = [];

    // Try unusual strategies
    const strategies = [
      { name: 'Spam jump', action: () => this.spamAction(page, 'jump', 100) },
      { name: 'Stay still', action: () => this.stayStill(page, 30000) },
      { name: 'Corner camping', action: () => this.campInCorner(page) },
      { name: 'Rapid fire', action: () => this.spamAction(page, 'shoot', 200) }
    ];

    for (const strategy of strategies) {
      const before = await this.getGameState(page);
      await strategy.action();
      const after = await this.getGameState(page);

      // Check if strategy gives unfair advantage
      if (after.score > before.score * 3) {
        exploits.push({
          strategy: strategy.name,
          impact: 'high',
          description: `${strategy.name} grants ${((after.score / before.score) * 100).toFixed(0)}% score increase`,
          suggestion: 'Add cooldowns or limitations to prevent abuse'
        });
      }
    }

    return exploits;
  }
}
```

#### Game Testing Report:

```typescript
const gameReport = {
  randomPlayer: await aiPlayer.playRandom(page),
  optimalPlayer: await aiPlayer.playOptimal(page),
  difficultyCurve: await aiPlayer.testDifficultyCurve(page),
  exploits: await aiPlayer.detectExploits(page),

  analysis: {
    balanceScore: calculateBalanceScore(),
    difficulty: estimateDifficulty(),
    skillCeiling: estimateSkillCeiling(),
    replayability: estimateReplayability()
  },

  suggestions: generateGameSuggestions()
};
```

### PHASE 5: Performance & Accessibility

#### Core Web Vitals:

```typescript
const metrics = await page.evaluate(() => {
  return new Promise((resolve) => {
    const vitals = {};

    // LCP - Largest Contentful Paint
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      vitals.lcp = lastEntry.renderTime || lastEntry.loadTime;
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // FID - First Input Delay
    new PerformanceObserver((list) => {
      const entry = list.getEntries()[0];
      vitals.fid = entry.processingStart - entry.startTime;
    }).observe({ entryTypes: ['first-input'] });

    // CLS - Cumulative Layout Shift
    new PerformanceObserver((list) => {
      vitals.cls = list.getEntries()
        .filter(e => !e.hadRecentInput)
        .reduce((sum, e) => sum + e.value, 0);
    }).observe({ entryTypes: ['layout-shift'] });

    setTimeout(() => resolve(vitals), 5000);
  });
});

const grades = {
  lcp: metrics.lcp < 2500 ? 'good' : metrics.lcp < 4000 ? 'needs-improvement' : 'poor',
  fid: metrics.fid < 100 ? 'good' : metrics.fid < 300 ? 'needs-improvement' : 'poor',
  cls: metrics.cls < 0.1 ? 'good' : metrics.cls < 0.25 ? 'needs-improvement' : 'poor'
};

console.log(`\n📊 Core Web Vitals:`);
console.log(`  LCP: ${metrics.lcp}ms (${grades.lcp})`);
console.log(`  FID: ${metrics.fid}ms (${grades.fid})`);
console.log(`  CLS: ${metrics.cls.toFixed(3)} (${grades.cls})`);
```

#### Lighthouse Audit:

```bash
npx lighthouse http://localhost:${PORT} \
  --output json \
  --output html \
  --output-path /tmp/thomas-app-lighthouse \
  --chrome-flags="--headless" \
  --only-categories=performance,accessibility,best-practices,seo,pwa

# Parse scores
lighthouse_performance=$(jq '.categories.performance.score * 100' /tmp/thomas-app-lighthouse.json)
lighthouse_accessibility=$(jq '.categories.accessibility.score * 100' /tmp/thomas-app-lighthouse.json)
lighthouse_seo=$(jq '.categories.seo.score * 100' /tmp/thomas-app-lighthouse.json)

echo "Lighthouse Scores:"
echo "  Performance: ${lighthouse_performance}"
echo "  Accessibility: ${lighthouse_accessibility}"
echo "  SEO: ${lighthouse_seo}"
```

#### Accessibility Deep Scan:

```typescript
// Install axe-core
await page.addScriptTag({ path: 'node_modules/axe-core/axe.min.js' });

// Run accessibility audit
const a11yResults = await page.evaluate(() => {
  return new Promise((resolve) => {
    axe.run((err, results) => {
      if (err) throw err;
      resolve(results);
    });
  });
});

const violations = {
  critical: a11yResults.violations.filter(v => v.impact === 'critical'),
  serious: a11yResults.violations.filter(v => v.impact === 'serious'),
  moderate: a11yResults.violations.filter(v => v.impact === 'moderate'),
  minor: a11yResults.violations.filter(v => v.impact === 'minor')
};

console.log(`\n♿ Accessibility Issues:`);
console.log(`  Critical: ${violations.critical.length}`);
console.log(`  Serious: ${violations.serious.length}`);
console.log(`  Moderate: ${violations.moderate.length}`);
console.log(`  Minor: ${violations.minor.length}`);
```

### PHASE 6: Security & Analytics

#### Security Checks:

```typescript
// Check for sensitive data in localStorage/sessionStorage
const sensitiveData = await page.evaluate(() => {
  const findings = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const value = localStorage.getItem(key);

    if (/password|secret|token|key|credential|private/i.test(key + value)) {
      findings.push({
        storage: 'localStorage',
        key,
        issue: 'Potentially sensitive data in localStorage'
      });
    }
  }

  return findings;
});

// Check security headers
const response = await page.goto(url);
const headers = response.headers();

const securityHeaders = {
  'content-security-policy': headers['content-security-policy'] || '❌ MISSING',
  'x-frame-options': headers['x-frame-options'] || '❌ MISSING',
  'x-content-type-options': headers['x-content-type-options'] || '❌ MISSING',
  'strict-transport-security': headers['strict-transport-security'] || '❌ MISSING'
};

console.log(`\n🔒 Security Headers:`);
Object.entries(securityHeaders).forEach(([header, value]) => {
  console.log(`  ${header}: ${value}`);
});
```

### PHASE 7: Real-World Conditions

```typescript
const networkProfiles = [
  { name: '4G', downloadThroughput: 4 * 1024 * 1024 / 8, latency: 20 },
  { name: '3G', downloadThroughput: 1.6 * 1024 * 1024 / 8, latency: 100 },
  { name: 'Slow 3G', downloadThroughput: 400 * 1024 / 8, latency: 400 }
];

console.log(`\n🌍 Real-World Network Testing:`);

for (const profile of networkProfiles) {
  await page.emulateNetworkConditions(profile);

  const start = Date.now();
  await page.goto(url);
  const loadTime = Date.now() - start;

  console.log(`  ${profile.name}: ${loadTime}ms`);

  if (loadTime > 10000) {
    console.log(`    ⚠️  Slow loading on ${profile.name}`);
  }
}
```

### PHASE 8: Intelligent Reporting

```typescript
interface FinalReport {
  summary: {
    overallScore: number;  // 0-100
    totalIssues: number;
    criticalIssues: number;
    passRate: number;
    testDuration: number;
    timestamp: string;
  };

  phases: {
    discovery: DiscoveryReport;
    customerJourneys: JourneyReport[];
    visualAnalysis: VisualReport;
    interactions: InteractionReport;
    gameAI?: GameAIReport;
    performance: PerformanceReport;
    accessibility: AccessibilityReport;
    security: SecurityReport;
    realWorld: RealWorldReport;
  };

  priorityActions: Action[];  // Top 10 by ROI

  recommendations: Recommendation[];

  comparison?: ComparisonReport;  // If baseline exists
}

// Calculate ROI for each issue
const calculateROI = (issue) => {
  const impactScore = {
    'critical': 10,
    'high': 7,
    'medium': 4,
    'low': 2
  }[issue.priority];

  const effortScore = {
    'low': 10,
    'medium': 5,
    'high': 2
  }[issue.effort];

  return (impactScore / effortScore) * 10;
};

// Sort recommendations by ROI
const sortedRecommendations = recommendations
  .map(rec => ({
    ...rec,
    roi: calculateROI(rec)
  }))
  .sort((a, b) => b.roi - a.roi);

// Generate HTML report
const htmlReport = generateHTMLReport(finalReport);
fs.writeFileSync('/tmp/thomas-app-report.html', htmlReport);

console.log(`\n📊 Report saved to: /tmp/thomas-app-report.html`);
```

## Output

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📱 THOMAS APP - COMPLETE APPLICATION TESTING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

App Type: E-commerce
Routes: 12 discovered
Test Suites: 8 selected
Duration: 8m 32s

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 OVERALL SCORE: 78/100
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Issues Found:
  🔴 Critical: 2
  🟠 High: 5
  🟡 Medium: 12
  🟢 Low: 8

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 TOP PRIORITY ACTIONS (by ROI)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 🔴 Fix checkout button on mobile (ROI: 10.0)
   Issue: Submit button not clickable on screens < 375px
   Impact: Blocking 40% of mobile users from purchase
   Effort: Low (CSS fix)
   Fix: Add min-width: 100% to .checkout-button

2. 🟠 Optimize main bundle size (ROI: 8.5)
   Issue: Main bundle is 850KB (target: < 500KB)
   Impact: 4.2s load time on 3G (target: < 3s)
   Effort: Medium (code splitting)
   Fix: Use React.lazy() for product pages

3. 🟠 Add alt text to product images (ROI: 7.5)
   Issue: 45 images missing alt text
   Impact: Poor accessibility + SEO
   Effort: Low (add alt attributes)
   Fix: Generate alt text from product names

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📈 PHASE RESULTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Customer Journeys: 3/4 passed (75%)
   ✅ Browse to Purchase: Completed (4m 12s)
   ✅ Product Search: Completed (1m 8s)
   ❌ Checkout Flow: Failed at payment step
   ✅ Account Creation: Completed (2m 5s)

✅ Visual Analysis: 87/100
   ✅ Desktop: No issues
   ✅ Tablet: No issues
   ⚠️  Mobile: 3 layout issues

⚠️  Interactions: 92/100
   ✅ Buttons: 45/48 working (3 issues)
   ✅ Forms: All working
   ✅ Links: All working

✅ Performance: 68/100
   🟡 LCP: 3.2s (needs improvement)
   ✅ FID: 45ms (good)
   ✅ CLS: 0.08 (good)
   ⚠️  Lighthouse: 68/100

⚠️  Accessibility: 72/100
   🔴 Critical: 2 issues
   🟠 Serious: 4 issues
   ✅ WCAG AA: 85% compliant

✅ Security: 85/100
   ✅ No XSS vulnerabilities
   ✅ CSRF tokens present
   ⚠️  2 security headers missing

✅ Real-World: 75/100
   ✅ 4G: < 2s load time
   ⚠️  3G: 4.2s load time
   ❌ Slow 3G: 12.8s load time

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 KEY INSIGHTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 Biggest Impact Opportunity:
   Fixing mobile checkout button would recover ~$15k/month
   in lost conversions (est. 40% mobile abandonment)

📊 Performance Opportunity:
   Reducing bundle size to 500KB would improve Lighthouse
   score to 85+ and reduce bounce rate by ~12%

♿ Accessibility Gap:
   Missing ARIA labels on icon buttons affects 2-3% of users
   (screen reader users). Quick win: 30 min fix.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📁 ARTIFACTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

HTML Report: /tmp/thomas-app-report.html
JSON Report: /tmp/thomas-app-report.json
Screenshots: /tmp/thomas-app-screenshots/ (48 files)
Lighthouse: /tmp/thomas-app-lighthouse.html
Metrics: ~/.thomas-app/metrics/2025-01-15.jsonl

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Configuration

Create `.thomas-app.json` in project root to customize:

```json
{
  "appType": "ecommerce",
  "testSuites": {
    "customerJourneys": true,
    "visualAnalysis": true,
    "interactions": true,
    "gameAI": false,
    "performance": true,
    "accessibility": true,
    "security": true,
    "seo": true,
    "analytics": true,
    "realWorld": true
  },
  "journeys": [
    {
      "name": "Custom Journey",
      "steps": [...]
    }
  ],
  "thresholds": {
    "lcp": 2500,
    "fid": 100,
    "cls": 0.1,
    "lighthouseMin": 90
  },
  "viewports": [
    { "name": "Desktop", "width": 1920, "height": 1080 },
    { "name": "Mobile", "width": 375, "height": 667 }
  ],
  "baseline": {
    "enabled": true,
    "path": ".thomas-app/baseline"
  }
}
```

## Integration with CI/CD

```yaml
# .github/workflows/thomas-app.yml
name: Application Testing

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3

      - name: Install dependencies
        run: npm install

      - name: Build application
        run: npm run build

      - name: Start dev server
        run: npm run dev &

      - name: Run Thomas App
        run: /thomas-app --quick

      - name: Upload report
        uses: actions/upload-artifact@v3
        with:
          name: thomas-app-report
          path: /tmp/thomas-app-report.html

      - name: Fail if critical issues
        run: |
          critical=$(jq '.summary.criticalIssues' /tmp/thomas-app-report.json)
          if [ $critical -gt 0 ]; then
            echo "❌ Found $critical critical issues"
            exit 1
          fi
```

## Comparison with /thomas-fix

| Feature | /thomas-fix | /thomas-app |
|---------|-------------|-------------|
| **Focus** | Code quality | User experience |
| **Lint/Type Check** | ✅ | ❌ (use thomas-fix first) |
| **Unit Tests** | ✅ | ❌ |
| **Build Validation** | ✅ | ❌ |
| **Browser Testing** | ✅ Basic | ✅ Comprehensive |
| **Customer Journeys** | ❌ | ✅ |
| **Visual Regression** | ❌ | ✅ |
| **Game AI Testing** | ❌ | ✅ |
| **Accessibility** | ❌ | ✅ Deep scan |
| **Performance Metrics** | ❌ | ✅ Lighthouse + CWV |
| **SEO Analysis** | ❌ | ✅ |
| **Security Scan** | ✅ Basic | ✅ Deep |
| **Real-World Testing** | ❌ | ✅ |
| **Auto-Fix** | ✅ | ❌ (reports only) |
| **Auto-Commit** | ✅ | ❌ |
| **Duration** | 2-5 min | 5-15 min |
| **When to Use** | After every code change | Before releases, weekly |

**Recommended Workflow**:
1. Make code changes
2. Run `/thomas-fix` → Fixes code issues automatically
3. Run `/thomas-app` → Validates user experience
4. Fix any UX/performance issues found
5. Run `/thomas-fix` again → Ensures fixes don't break code
6. Commit and deploy

## Next Steps

This is the command specification. Implementation follows in phases:

### Implementation Phases:

**Phase 1: MVP (Week 1)**
- [x] Basic orchestrator setup
- [ ] Customer journey testing (3 predefined)
- [ ] Visual screen analysis
- [ ] Console monitoring
- [ ] Simple JSON report

**Phase 2: Intelligence (Weeks 2-3)**
- [ ] App type detection
- [ ] Context-aware test selection
- [ ] Game AI player (basic)
- [ ] Performance metrics (Lighthouse)
- [ ] Accessibility checks (axe-core)

**Phase 3: Depth (Weeks 4-5)**
- [ ] Advanced game AI (multiple strategies)
- [ ] SEO/Meta analysis
- [ ] Security deep scan
- [ ] Real-world condition testing
- [ ] Baseline comparison

**Phase 4: Polish (Week 6)**
- [ ] Visual regression detection
- [ ] Analytics verification
- [ ] Intelligent recommendations engine
- [ ] Beautiful HTML reports
- [ ] CI/CD integration docs

---

**Status**: Ready for autonomous implementation
**Estimated Total Effort**: 6 weeks
**Lines of Code**: ~5000-7000 (including Playwright tests)
