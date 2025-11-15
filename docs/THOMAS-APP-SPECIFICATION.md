# /thomas-app - World-Class Complete Application Testing Command

**Date**: 2025-01-15
**Status**: Specification Phase
**Goal**: Create the world's most comprehensive application testing command

---

## Executive Summary

`/thomas-app` is a holistic application testing command that goes beyond code validation (which `/thomas-fix` handles) to test **the complete user experience** from every angle:

- **User perspective**: Customer journeys, accessibility, UX flows
- **Technical perspective**: Performance, security, reliability
- **Business perspective**: Analytics, conversions, error tracking
- **Game perspective**: AI player testing, game balance, difficulty curves
- **Visual perspective**: Design consistency, responsive layouts, visual regression
- **Content perspective**: SEO, metadata, social sharing

**Key Difference from /thomas-fix**:
- `/thomas-fix`: **Developer-focused** - "Does the code work correctly?"
- `/thomas-app`: **User-focused** - "Does the app deliver value to users?"

---

## Vision: The Best Testing Command in the World

### What Makes It World-Class?

1. **🎭 Perspective-Based Testing**: Tests from multiple viewpoints (user, developer, business, game designer)
2. **🤖 AI-Powered Intelligence**: Smart agents that understand context and adapt testing
3. **🎮 Game-Aware**: Dedicated AI player for game testing with difficulty analysis
4. **📊 Actionable Insights**: Not just "what's broken" but "why it matters" and "how to fix it"
5. **🔄 Continuous Learning**: Learns app patterns and improves test coverage over time
6. **🌍 Real-World Simulation**: Tests like actual users (slow connections, mobile devices, accessibility tools)
7. **💡 Proactive Suggestions**: Identifies missed opportunities (e.g., "Add social sharing here")

---

## Architecture: Multi-Agent Orchestra

### Agent Roles

```
┌─────────────────────────────────────────────────────────────┐
│                  ORCHESTRATOR AGENT                         │
│  (Coordinates all testing, prioritizes issues, reports)     │
└─────────────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ↓                  ↓                  ↓
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ UX Testing   │  │ Performance  │  │ Security     │
│ Agent        │  │ Agent        │  │ Agent        │
└──────────────┘  └──────────────┘  └──────────────┘
        ↓                  ↓                  ↓
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Customer     │  │ Accessibility│  │ Content      │
│ Journey      │  │ Agent        │  │ Agent        │
│ Agent        │  │              │  │ (SEO/Meta)   │
└──────────────┘  └──────────────┘  └──────────────┘
        ↓                  ↓                  ↓
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Game AI      │  │ Visual       │  │ Analytics    │
│ Player       │  │ Design       │  │ Agent        │
│ Agent        │  │ Agent        │  │              │
└──────────────┘  └──────────────┘  └──────────────┘
```

---

## Testing Phases

### PHASE 1: Discovery & Context Analysis

**Goal**: Understand what kind of app we're testing

#### 1.1 App Type Detection
```bash
# Analyze package.json, file structure, routes
- Is it a game? (konva, phaser, babylonjs detected)
- Is it an e-commerce site? (checkout flow, products detected)
- Is it a SaaS app? (authentication, dashboards detected)
- Is it a content site? (blog posts, articles detected)
- Is it a PWA? (manifest.json, service worker detected)
```

**Output**: App profile with recommended test suites

#### 1.2 Route Discovery
```typescript
// Auto-detect all routes from:
- React Router configuration
- File-based routing (Next.js, Remix)
- Preact Router
- Manual route mapping

// Build route graph:
{
  "/": { type: "landing", critical: true },
  "/login": { type: "auth", critical: true },
  "/dashboard": { type: "app", critical: true, requiresAuth: true },
  "/game": { type: "game", critical: true },
  "/blog/:slug": { type: "content", critical: false }
}
```

#### 1.3 Feature Detection
```bash
# Detect features from code:
- Authentication (cookies, JWT, OAuth)
- Forms (contact, registration, checkout)
- Payments (Stripe, PayPal detected)
- Real-time features (WebSocket, SSE)
- File uploads
- Social sharing
- Comments/interactions
- Search functionality
- Filtering/sorting
```

**Output**: Feature map with test priorities

---

### PHASE 2: Customer Journey Testing

**Goal**: Test complete user flows from entry to goal completion

#### 2.1 Journey Mapping
```
JOURNEY: "New User Onboarding"
├─ Step 1: Land on homepage
│  ├─ Check: Hero message clear?
│  ├─ Check: CTA visible and compelling?
│  └─ Check: Value proposition obvious within 3 seconds?
├─ Step 2: Click "Get Started"
│  ├─ Check: Button responsive?
│  ├─ Check: Loading state shown?
│  └─ Check: Navigation smooth?
├─ Step 3: Complete registration
│  ├─ Check: Form validation helpful?
│  ├─ Check: Error messages clear?
│  ├─ Check: Success feedback shown?
│  └─ Check: Email confirmation sent?
├─ Step 4: First experience
│  ├─ Check: Onboarding tour offered?
│  ├─ Check: Empty states helpful?
│  └─ Check: Next steps clear?
└─ METRICS:
   ├─ Time to complete: 2m 34s (GOOD: < 3min)
   ├─ Friction points: 2 (form validation unclear)
   └─ Drop-off risk: Step 3 (40% abandon rate typical)
```

#### 2.2 Critical Journeys (Auto-Generated Based on App Type)

**E-commerce App**:
1. Browse products → Add to cart → Checkout → Payment → Order confirmation
2. Search → Filter → Product detail → Add to wishlist
3. Login → Order history → Track shipment
4. Browse → Compare products → Read reviews → Purchase

**SaaS App**:
1. Landing → Sign up → Email verification → Onboarding → First value moment
2. Login → Dashboard → Create first project → Invite team
3. Settings → Billing → Upgrade plan → Payment
4. Use feature → Hit limit → See upgrade prompt → Convert

**Game App**:
1. Landing → Start game → Tutorial → First level → Victory
2. Game over → See score → View leaderboard → Play again
3. Pause → Settings → Adjust difficulty → Resume
4. Complete level → Unlock achievement → Share score

**Content Site**:
1. Landing → Browse articles → Click article → Read → Share
2. Search → Find article → Subscribe to newsletter
3. Comment → Login → Post comment → Get notification

#### 2.3 Journey Testing Execution

```typescript
// For each journey:
interface JourneyTest {
  name: string;
  steps: JourneyStep[];
  metrics: {
    expectedDuration: number;  // ms
    criticalPath: boolean;
    dropOffRisk: 'low' | 'medium' | 'high';
  };
}

interface JourneyStep {
  action: string;  // "Click 'Sign Up'", "Fill form", "Wait for redirect"
  checks: Check[];
  screenshot: boolean;
  timing: { max: number };  // Maximum acceptable duration
}

interface Check {
  type: 'visual' | 'functional' | 'performance' | 'ux';
  assertion: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

// Example execution:
const journey = await journeyAgent.execute({
  name: "New User Onboarding",
  steps: [...],
  context: {
    device: 'desktop',
    network: '4G',
    userType: 'first-time'
  }
});

// Report findings:
if (journey.completed) {
  console.log(`✅ Journey completed in ${journey.duration}ms`);
  console.log(`📊 Friction points: ${journey.frictionPoints.length}`);
  console.log(`💡 Suggestions: ${journey.improvements.length}`);
} else {
  console.log(`❌ Journey failed at step ${journey.failedStep}`);
  console.log(`🔍 Reason: ${journey.failureReason}`);
  console.log(`📸 Screenshot: ${journey.screenshot}`);
}
```

---

### PHASE 3: Screen-by-Screen Visual Analysis

**Goal**: Ensure every screen is visually correct, responsive, and accessible

#### 3.1 Screen Inventory
```bash
# Auto-discover all screens/routes
screens=(
  "/" "homepage"
  "/login" "auth"
  "/dashboard" "app"
  "/profile" "settings"
  "/game" "game"
  # ... all routes discovered in Phase 1
)

# For each screen, test:
- Desktop (1920x1080)
- Laptop (1366x768)
- Tablet (768x1024)
- Mobile (375x667)
- Mobile landscape (667x375)
```

#### 3.2 Visual Checks (Per Screen)
```typescript
interface ScreenCheck {
  route: string;
  viewport: { width: number; height: number };
  checks: {
    // Layout
    noOverflow: boolean;           // No horizontal scroll
    noClipping: boolean;           // Content not cut off
    spacing: boolean;              // Consistent margins/padding
    alignment: boolean;            // Elements properly aligned

    // Typography
    readableText: boolean;         // Font size >= 16px on mobile
    contrastRatio: number;         // WCAG AA compliance (4.5:1)
    noTextOverlap: boolean;        // Text doesn't overlap

    // Interactive Elements
    buttonsClickable: boolean;     // Min 44x44px touch target
    linksUnderlined: boolean;      // Or clearly distinguishable
    focusVisible: boolean;         // Focus indicators present

    // Images
    imagesLoaded: boolean;         // All images present
    altTextPresent: boolean;       // Alt text on all images
    imageOptimized: boolean;       // Reasonable file sizes

    // Forms
    labelsPresent: boolean;        // All inputs labeled
    errorStatesVisible: boolean;   // Validation errors shown
    placeholdersHelpful: boolean;  // Not used as labels

    // Performance
    lcp: number;                   // Largest Contentful Paint < 2.5s
    fid: number;                   // First Input Delay < 100ms
    cls: number;                   // Cumulative Layout Shift < 0.1
  };
  screenshot: string;
  issues: Issue[];
}
```

#### 3.3 Visual Regression Detection
```bash
# Compare with baseline screenshots
npx playwright test --update-snapshots  # First run: create baseline

# Subsequent runs: compare
for screen in "${screens[@]}"; do
  # Take screenshot
  screenshot_path="/tmp/thomas-app-${screen}.png"

  # Compare with baseline
  if [ -f "tests/visual-regression/baseline-${screen}.png" ]; then
    # Use pixelmatch or similar
    diff_percentage=$(compare_images \
      "tests/visual-regression/baseline-${screen}.png" \
      "$screenshot_path")

    if [ $diff_percentage -gt 5 ]; then
      echo "⚠️  Visual regression detected: ${screen} (${diff_percentage}% different)"
      # Generate diff image
      create_diff_image "$screenshot_path" "tests/visual-regression/baseline-${screen}.png" \
        "/tmp/thomas-app-diff-${screen}.png"
    fi
  fi
done
```

---

### PHASE 4: Button & Interaction Testing

**Goal**: Test every interactive element in the app

#### 4.1 Button Discovery
```typescript
// Auto-discover all buttons, links, form elements
interface InteractiveElement {
  type: 'button' | 'link' | 'input' | 'select' | 'checkbox' | 'radio';
  selector: string;
  text: string;
  location: { route: string; x: number; y: number };
  expectedAction: string;  // Inferred from context
}

// Example discovery:
const buttons = await page.$$eval('button, a[href], input[type="submit"]', elements =>
  elements.map(el => ({
    type: el.tagName.toLowerCase(),
    text: el.textContent?.trim(),
    href: el.getAttribute('href'),
    onClick: el.getAttribute('onclick'),
    // ... more metadata
  }))
);
```

#### 4.2 Interaction Tests
```typescript
// For each interactive element:
const tests = [
  {
    name: 'Click responsiveness',
    action: async (element) => {
      const startTime = Date.now();
      await element.click();
      const responseTime = Date.now() - startTime;
      return { pass: responseTime < 100, responseTime };
    }
  },
  {
    name: 'Loading state',
    action: async (element) => {
      await element.click();
      // Check if loading indicator appears
      const hasLoadingState = await page.$('.loading, .spinner, [aria-busy="true"]');
      return { pass: hasLoadingState !== null };
    }
  },
  {
    name: 'Disabled state prevention',
    action: async (element) => {
      if (await element.isDisabled()) {
        // Try to click anyway
        await element.click({ force: true });
        // Should not trigger action
        const navigationOccurred = await page.waitForNavigation({ timeout: 1000 })
          .catch(() => false);
        return { pass: !navigationOccurred };
      }
      return { pass: true, skipped: true };
    }
  },
  {
    name: 'Keyboard accessibility',
    action: async (element) => {
      await element.focus();
      await page.keyboard.press('Enter');
      // Check if same action as click
      return { pass: true };  // Compare state after Enter vs Click
    }
  },
  {
    name: 'Touch target size (mobile)',
    action: async (element) => {
      const box = await element.boundingBox();
      const minSize = 44;  // WCAG guideline
      return {
        pass: box.width >= minSize && box.height >= minSize,
        size: { width: box.width, height: box.height }
      };
    }
  }
];
```

#### 4.3 Form Testing
```typescript
interface FormTest {
  route: string;
  formSelector: string;
  fields: FormField[];
}

interface FormField {
  name: string;
  type: string;
  validations: Validation[];
  testCases: TestCase[];
}

interface TestCase {
  name: string;
  input: any;
  expectedOutcome: 'accept' | 'reject';
  expectedError?: string;
}

// Example: Email field testing
{
  name: 'email',
  type: 'email',
  validations: ['required', 'email-format'],
  testCases: [
    { name: 'Valid email', input: 'user@example.com', expectedOutcome: 'accept' },
    { name: 'Invalid format', input: 'notanemail', expectedOutcome: 'reject',
      expectedError: 'Please enter a valid email' },
    { name: 'Empty field', input: '', expectedOutcome: 'reject',
      expectedError: 'Email is required' },
    { name: 'SQL injection attempt', input: "'; DROP TABLE users--",
      expectedOutcome: 'reject' },
    { name: 'XSS attempt', input: '<script>alert("xss")</script>',
      expectedOutcome: 'reject' }
  ]
}
```

---

### PHASE 5: Console & Error Monitoring

**Goal**: Catch all runtime errors, warnings, and console issues

#### 5.1 Console Tracking
```typescript
// Monitor console during all tests
const consoleLog = {
  errors: [],
  warnings: [],
  info: [],
  network: []
};

page.on('console', msg => {
  const type = msg.type();
  const text = msg.text();
  const location = msg.location();

  consoleLog[type === 'error' ? 'errors' :
              type === 'warning' ? 'warnings' : 'info'].push({
    type,
    text,
    location,
    timestamp: Date.now(),
    stack: msg.stackTrace()
  });
});

page.on('pageerror', error => {
  consoleLog.errors.push({
    type: 'uncaught-exception',
    text: error.message,
    stack: error.stack,
    timestamp: Date.now()
  });
});

page.on('requestfailed', request => {
  consoleLog.network.push({
    type: 'failed-request',
    url: request.url(),
    method: request.method(),
    failure: request.failure(),
    timestamp: Date.now()
  });
});
```

#### 5.2 Error Categorization
```typescript
interface ErrorCategory {
  category: 'critical' | 'high' | 'medium' | 'low';
  impact: string;
  examples: string[];
}

const errorCategories: Record<string, ErrorCategory> = {
  'TypeError: Cannot read': {
    category: 'critical',
    impact: 'App crash, feature broken',
    examples: ["Cannot read property 'map' of undefined"]
  },
  'Network request failed': {
    category: 'high',
    impact: 'Data not loading, poor UX',
    examples: ['Failed to fetch', '404 Not Found']
  },
  'React hydration mismatch': {
    category: 'medium',
    impact: 'Visual glitches, possible state issues',
    examples: ['Hydration failed because the initial UI does not match']
  },
  'Deprecated API usage': {
    category: 'low',
    impact: 'Future compatibility risk',
    examples: ['componentWillMount is deprecated']
  }
};
```

---

### PHASE 6: Game AI Player Testing (Game Apps Only)

**Goal**: Test game mechanics, balance, and difficulty with AI player

#### 6.1 Game Detection
```typescript
// Detect if app is a game
const isGame = (
  hasCanvasElement() ||
  usesKonva() ||
  usesPhaser() ||
  usesBabylonJS() ||
  hasGameKeywords()  // "score", "level", "lives", "enemies"
);

if (!isGame) {
  console.log('⏭️  Skipping game AI player (not a game app)');
  return;
}
```

#### 6.2 Game State Analysis
```typescript
interface GameState {
  currentLevel: number;
  score: number;
  lives: number;
  powerUps: string[];
  enemies: Enemy[];
  player: Player;
  obstacles: Obstacle[];

  // Meta
  difficulty: 'easy' | 'medium' | 'hard';
  objective: string;
  winCondition: string;
  loseCondition: string;
}

// AI Player analyzes game state every frame
const analyzeGameState = async (page) => {
  return await page.evaluate(() => {
    // Access game state from window/global
    const game = window.gameInstance || window.game;

    return {
      score: game?.score || 0,
      level: game?.level || 1,
      lives: game?.lives || 3,
      playerPosition: game?.player?.position,
      enemies: game?.enemies?.map(e => ({
        type: e.type,
        position: e.position,
        health: e.health
      })) || []
    };
  });
};
```

#### 6.3 AI Player Strategies
```typescript
class GameAIPlayer {
  // Strategy 1: Random Player (Baseline)
  async playRandom(maxActions = 100) {
    const actions = ['up', 'down', 'left', 'right', 'jump', 'shoot'];
    for (let i = 0; i < maxActions; i++) {
      const action = actions[Math.floor(Math.random() * actions.length)];
      await this.performAction(action);
      await this.wait(100);
    }
    return this.getResults();
  }

  // Strategy 2: Optimal Player (Tests difficulty)
  async playOptimal(maxTime = 60000) {
    const startTime = Date.now();

    while (Date.now() - startTime < maxTime) {
      const state = await this.analyzeGameState();

      // Calculate best action based on state
      const action = this.calculateBestAction(state);

      await this.performAction(action);
      await this.wait(16);  // ~60fps

      if (this.isGameOver(state)) break;
      if (this.isGameWon(state)) break;
    }

    return this.getResults();
  }

  // Strategy 3: Skill Curve Testing (Ramps up difficulty)
  async testSkillCurve() {
    const difficulties = ['easy', 'medium', 'hard', 'expert'];
    const results = {};

    for (const difficulty of difficulties) {
      await this.setDifficulty(difficulty);
      results[difficulty] = await this.playOptimal(30000);
    }

    return this.analyzeSkillCurve(results);
  }

  calculateBestAction(state: GameState): string {
    // Pathfinding, threat avoidance, objective pursuit
    const threats = this.identifyThreats(state);
    const opportunities = this.identifyOpportunities(state);

    if (threats.length > 0) {
      return this.avoidThreat(threats[0], state);
    }

    if (opportunities.length > 0) {
      return this.pursueOpportunity(opportunities[0], state);
    }

    return this.moveTowardsObjective(state);
  }

  identifyThreats(state: GameState): Threat[] {
    return state.enemies
      .filter(enemy => this.isInDangerZone(enemy, state.player))
      .map(enemy => ({
        type: 'enemy',
        position: enemy.position,
        danger: this.calculateDanger(enemy, state.player)
      }))
      .sort((a, b) => b.danger - a.danger);
  }
}
```

#### 6.4 Game Metrics & Analysis
```typescript
interface GameTestResults {
  // Performance
  averageFPS: number;
  frameDrops: number;
  memoryLeaks: boolean;

  // Difficulty Analysis
  difficultyRating: {
    easy: { winRate: number; avgTime: number },
    medium: { winRate: number; avgTime: number },
    hard: { winRate: number; avgTime: number }
  };

  // Balance
  balanceIssues: BalanceIssue[];
  skillCurve: number[];  // Should be smooth progression

  // AI Insights
  exploits: Exploit[];  // Strategies that make game too easy
  deadEnds: DeadEnd[];  // Situations with no winning move
  unfairMechanics: UnfairMechanic[];

  // Player Experience Predictions
  predictedFrustrationPoints: FrustrationPoint[];
  predictedBoredomPoints: BoredomPoint[];
  estimatedLearningCurve: number;  // Time to master mechanics

  // Suggestions
  suggestions: GameSuggestion[];
}

interface GameSuggestion {
  type: 'balance' | 'difficulty' | 'ux' | 'mechanics';
  priority: 'critical' | 'high' | 'medium' | 'low';
  issue: string;
  suggestion: string;
  reasoning: string;
}

// Example suggestions:
{
  type: 'balance',
  priority: 'high',
  issue: 'Level 3 is significantly harder than Level 4',
  suggestion: 'Swap enemy counts or reduce Level 3 enemy damage by 20%',
  reasoning: 'AI player took 3.2x longer to beat Level 3 vs Level 4, indicating difficulty spike'
}

{
  type: 'difficulty',
  priority: 'medium',
  issue: 'Easy mode is too easy (100% win rate in < 30s)',
  suggestion: 'Increase enemy speed by 15% or reduce player starting lives from 5 to 3',
  reasoning: 'Random AI player beat easy mode 10/10 times without trying'
}

{
  type: 'mechanics',
  priority: 'critical',
  issue: 'Jump mechanic exploit: double-jump allows skipping 40% of level',
  suggestion: 'Add collision detection to ceiling or remove double-jump near shortcuts',
  reasoning: 'AI discovered unintended path that bypasses core gameplay'
}
```

---

### PHASE 7: Performance & Lighthouse Auditing

**Goal**: Measure real-world performance metrics

#### 7.1 Performance Metrics
```typescript
// Core Web Vitals
const metrics = await page.evaluate(() => {
  return new Promise((resolve) => {
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const vitals = {};

      // LCP - Largest Contentful Paint
      const lcpEntry = entries.find(e => e.entryType === 'largest-contentful-paint');
      vitals.lcp = lcpEntry?.renderTime || lcpEntry?.loadTime;

      // FID - First Input Delay
      const fidEntry = entries.find(e => e.entryType === 'first-input');
      vitals.fid = fidEntry?.processingStart - fidEntry?.startTime;

      // CLS - Cumulative Layout Shift
      const clsEntries = entries.filter(e => e.entryType === 'layout-shift' && !e.hadRecentInput);
      vitals.cls = clsEntries.reduce((sum, e) => sum + e.value, 0);

      resolve(vitals);
    }).observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
  });
});

// Grading (Google standards)
const grading = {
  lcp: metrics.lcp < 2500 ? 'good' : metrics.lcp < 4000 ? 'needs-improvement' : 'poor',
  fid: metrics.fid < 100 ? 'good' : metrics.fid < 300 ? 'needs-improvement' : 'poor',
  cls: metrics.cls < 0.1 ? 'good' : metrics.cls < 0.25 ? 'needs-improvement' : 'poor'
};
```

#### 7.2 Lighthouse Integration
```bash
# Run Lighthouse for all critical pages
npx lighthouse http://localhost:3000 \
  --output json \
  --output html \
  --output-path /tmp/thomas-app-lighthouse.json \
  --chrome-flags="--headless" \
  --only-categories=performance,accessibility,best-practices,seo,pwa

# Parse results
lighthouse_score=$(jq '.categories.performance.score * 100' /tmp/thomas-app-lighthouse.json)

if [ $lighthouse_score -lt 90 ]; then
  echo "⚠️  Performance score below 90: ${lighthouse_score}"

  # Show top issues
  jq '.audits | to_entries |
      map(select(.value.score != null and .value.score < 0.9)) |
      map({title: .value.title, score: .value.score, description: .value.description})' \
    /tmp/thomas-app-lighthouse.json
fi
```

#### 7.3 Bundle Size Analysis
```typescript
// Analyze JavaScript bundle sizes
interface BundleAnalysis {
  total: number;
  mainBundle: number;
  chunks: { name: string; size: number }[];
  thirdParty: { name: string; size: number }[];
  recommendations: string[];
}

const analyzeBundles = async () => {
  // Use webpack-bundle-analyzer or similar
  const stats = await getBuildStats();

  const analysis: BundleAnalysis = {
    total: stats.assets.reduce((sum, a) => sum + a.size, 0),
    mainBundle: stats.assets.find(a => a.name === 'main.js')?.size || 0,
    chunks: stats.assets.filter(a => a.name.includes('chunk')),
    thirdParty: identifyThirdPartyCode(stats),
    recommendations: []
  };

  // Generate recommendations
  if (analysis.total > 500000) {  // > 500KB
    analysis.recommendations.push('Total bundle > 500KB. Consider code splitting.');
  }

  const largeThirdParty = analysis.thirdParty.filter(lib => lib.size > 100000);
  if (largeThirdParty.length > 0) {
    analysis.recommendations.push(
      `Large third-party libraries detected: ${largeThirdParty.map(l => l.name).join(', ')}. ` +
      `Consider lighter alternatives or lazy loading.`
    );
  }

  return analysis;
};
```

---

### PHASE 8: Accessibility (A11y) Deep Testing

**Goal**: Ensure app is usable by everyone, including assistive technology users

#### 8.1 Automated A11y Checks
```typescript
import { injectAxe, checkA11y } from 'axe-playwright';

// For each route
await injectAxe(page);
const results = await checkA11y(page, null, {
  detailedReport: true,
  detailedReportOptions: { html: true }
});

// Categorize violations
const violations = {
  critical: results.violations.filter(v => v.impact === 'critical'),
  serious: results.violations.filter(v => v.impact === 'serious'),
  moderate: results.violations.filter(v => v.impact === 'moderate'),
  minor: results.violations.filter(v => v.impact === 'minor')
};
```

#### 8.2 Keyboard Navigation Testing
```typescript
// Test keyboard-only navigation
const keyboardNavigation = async (page) => {
  const report = {
    allInteractiveElementsReachable: true,
    focusTrapIssues: [],
    skipLinksPresent: false,
    focusIndicatorsVisible: true
  };

  // Start from top
  await page.keyboard.press('Tab');
  const focusableElements = await page.$$(':focus');

  let previousElement = null;
  let tabCount = 0;
  const maxTabs = 100;

  while (tabCount < maxTabs) {
    await page.keyboard.press('Tab');
    tabCount++;

    const currentElement = await page.$(':focus');

    // Check for focus trap
    if (currentElement === previousElement) {
      report.focusTrapIssues.push({
        element: await currentElement.evaluate(el => el.tagName),
        location: await currentElement.evaluate(el => el.getBoundingClientRect())
      });
      break;
    }

    // Check focus visibility
    const isVisible = await currentElement.evaluate(el => {
      const style = window.getComputedStyle(el);
      return style.outline !== 'none' && style.outlineWidth !== '0px';
    });

    if (!isVisible) {
      report.focusIndicatorsVisible = false;
    }

    previousElement = currentElement;
  }

  return report;
};
```

#### 8.3 Screen Reader Simulation
```typescript
// Test with screen reader context
const screenReaderTest = async (page) => {
  const ariaLabels = await page.$$eval('[aria-label]', elements =>
    elements.map(el => ({
      tag: el.tagName,
      label: el.getAttribute('aria-label'),
      role: el.getAttribute('role')
    }))
  );

  const images = await page.$$eval('img', imgs =>
    imgs.map(img => ({
      src: img.src,
      alt: img.alt,
      hasAlt: !!img.alt
    }))
  );

  const headingStructure = await page.$$eval('h1, h2, h3, h4, h5, h6', headings =>
    headings.map((h, index) => ({
      level: parseInt(h.tagName[1]),
      text: h.textContent,
      order: index
    }))
  );

  // Validate heading hierarchy
  const headingIssues = [];
  for (let i = 1; i < headingStructure.length; i++) {
    const prev = headingStructure[i - 1];
    const current = headingStructure[i];

    if (current.level > prev.level + 1) {
      headingIssues.push({
        issue: `Heading level skipped: h${prev.level} → h${current.level}`,
        location: `"${current.text}"`
      });
    }
  }

  return {
    ariaLabels,
    images: images.filter(img => !img.hasAlt),
    headingIssues
  };
};
```

---

### PHASE 9: SEO & Meta Analysis (Content Apps)

**Goal**: Ensure discoverability and social sharing optimization

#### 9.1 Meta Tags Validation
```typescript
const metaAnalysis = await page.evaluate(() => {
  const getMeta = (name) => {
    const element = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
    return element?.getAttribute('content') || null;
  };

  return {
    // Basic SEO
    title: document.title,
    description: getMeta('description'),
    keywords: getMeta('keywords'),

    // Open Graph (Facebook, LinkedIn)
    ogTitle: getMeta('og:title'),
    ogDescription: getMeta('og:description'),
    ogImage: getMeta('og:image'),
    ogUrl: getMeta('og:url'),
    ogType: getMeta('og:type'),

    // Twitter Card
    twitterCard: getMeta('twitter:card'),
    twitterTitle: getMeta('twitter:title'),
    twitterDescription: getMeta('twitter:description'),
    twitterImage: getMeta('twitter:image'),

    // Structured Data
    hasStructuredData: !!document.querySelector('script[type="application/ld+json"]'),

    // Canonical
    canonical: document.querySelector('link[rel="canonical"]')?.href
  };
});

// Validate
const issues = [];

if (!metaAnalysis.title || metaAnalysis.title.length < 30) {
  issues.push({ type: 'title', message: 'Title too short (< 30 chars)' });
}

if (!metaAnalysis.description || metaAnalysis.description.length < 120) {
  issues.push({ type: 'description', message: 'Meta description too short (< 120 chars)' });
}

if (!metaAnalysis.ogImage) {
  issues.push({ type: 'social', message: 'Missing Open Graph image (poor social sharing)' });
}
```

#### 9.2 Social Sharing Preview
```typescript
// Generate social sharing previews
const socialPreviews = {
  facebook: {
    title: metaAnalysis.ogTitle || metaAnalysis.title,
    description: metaAnalysis.ogDescription || metaAnalysis.description,
    image: metaAnalysis.ogImage,
    validation: {
      titleLength: metaAnalysis.ogTitle?.length <= 60,  // Facebook truncates
      descriptionLength: metaAnalysis.ogDescription?.length <= 200,
      imageAspectRatio: '1.91:1 recommended'
    }
  },
  twitter: {
    title: metaAnalysis.twitterTitle || metaAnalysis.title,
    description: metaAnalysis.twitterDescription || metaAnalysis.description,
    image: metaAnalysis.twitterImage || metaAnalysis.ogImage,
    cardType: metaAnalysis.twitterCard || 'summary',
    validation: {
      titleLength: metaAnalysis.twitterTitle?.length <= 70,
      descriptionLength: metaAnalysis.twitterDescription?.length <= 200,
      imageSize: 'Min 300x157px, max 4096x4096px'
    }
  },
  linkedIn: {
    // Uses Open Graph tags
    ...socialPreviews.facebook
  }
};
```

---

### PHASE 10: Security Deep Scan

**Goal**: Identify security vulnerabilities beyond basic code scanning

#### 10.1 Client-Side Security
```typescript
const securityChecks = {
  // XSS Protection
  xssVulnerabilities: await testForXSS(page),

  // CSRF Protection
  csrfTokenPresent: await checkCSRFTokens(page),

  // Sensitive Data Exposure
  sensitiveDataInLocalStorage: await page.evaluate(() => {
    const sensitive = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);

      // Check for passwords, tokens, keys
      if (/password|token|secret|key|credential/i.test(key) ||
          /password|token|secret|key/i.test(value)) {
        sensitive.push({ key, preview: value.substring(0, 20) + '...' });
      }
    }
    return sensitive;
  }),

  // HTTPS Enforcement
  mixedContent: await checkMixedContent(page),

  // Security Headers
  securityHeaders: await checkSecurityHeaders(page)
};

const checkSecurityHeaders = async (page) => {
  const response = await page.goto(page.url());
  const headers = response.headers();

  return {
    'content-security-policy': headers['content-security-policy'] || 'MISSING',
    'x-frame-options': headers['x-frame-options'] || 'MISSING',
    'x-content-type-options': headers['x-content-type-options'] || 'MISSING',
    'strict-transport-security': headers['strict-transport-security'] || 'MISSING',
    'referrer-policy': headers['referrer-policy'] || 'MISSING'
  };
};
```

---

### PHASE 11: Analytics & Tracking Verification

**Goal**: Ensure analytics are working correctly

#### 11.1 Analytics Detection
```typescript
const analyticsCheck = await page.evaluate(() => {
  const analytics = {
    googleAnalytics: !!(window.gtag || window.ga || window._gaq),
    googleTagManager: !!window.dataLayer,
    facebookPixel: !!window.fbq,
    mixpanel: !!window.mixpanel,
    amplitude: !!window.amplitude,
    segment: !!window.analytics,

    // Check if actually sending data
    networkCalls: {
      ga: [],
      fb: [],
      other: []
    }
  };

  return analytics;
});

// Monitor network for analytics calls
page.on('request', request => {
  const url = request.url();

  if (url.includes('google-analytics.com') || url.includes('analytics.google.com')) {
    analyticsCheck.networkCalls.ga.push({ url, timestamp: Date.now() });
  }

  if (url.includes('facebook.com/tr')) {
    analyticsCheck.networkCalls.fb.push({ url, timestamp: Date.now() });
  }
});
```

---

### PHASE 12: Real-World Condition Testing

**Goal**: Test under real-world network/device conditions

#### 12.1 Network Throttling
```typescript
// Test under various network conditions
const networkProfiles = [
  { name: '4G', downloadThroughput: 4 * 1024 * 1024 / 8, uploadThroughput: 3 * 1024 * 1024 / 8, latency: 20 },
  { name: '3G', downloadThroughput: 1.6 * 1024 * 1024 / 8, uploadThroughput: 750 * 1024 / 8, latency: 100 },
  { name: 'Slow 3G', downloadThroughput: 400 * 1024 / 8, uploadThroughput: 400 * 1024 / 8, latency: 400 },
  { name: 'Offline', offline: true }
];

for (const profile of networkProfiles) {
  await page.emulateNetworkConditions(profile);

  const startTime = Date.now();
  await page.goto(url);
  const loadTime = Date.now() - startTime;

  console.log(`${profile.name}: ${loadTime}ms load time`);

  if (loadTime > 10000) {
    console.warn(`⚠️  Slow loading on ${profile.name}: ${loadTime}ms`);
  }
}
```

#### 12.2 Device Emulation
```typescript
const devices = [
  'iPhone 12',
  'iPhone SE',
  'Pixel 5',
  'iPad Pro',
  'Galaxy S9+'
];

for (const deviceName of devices) {
  const device = devices[deviceName];
  await page.emulate(device);

  // Run core tests on this device
  const results = await runCoreTests(page);

  console.log(`${deviceName}: ${results.passRate}% tests passed`);
}
```

---

### PHASE 13: Orchestrator Intelligence

**Goal**: Smart coordination, prioritization, and reporting

#### 13.1 Intelligent Test Selection
```typescript
class OrchestratorAgent {
  async selectTests(context: AppContext): Promise<TestSuite[]> {
    const allTests = this.getAllAvailableTests();
    const selectedTests: TestSuite[] = [];

    // Critical tests (always run)
    selectedTests.push(...allTests.filter(t => t.priority === 'critical'));

    // Context-aware selection
    if (context.appType === 'game') {
      selectedTests.push(this.gameAIPlayerTest);
      selectedTests.push(this.performanceStressTest);
    }

    if (context.hasAuthentication) {
      selectedTests.push(this.authenticationFlowTest);
      selectedTests.push(this.securityDeepScanTest);
    }

    if (context.hasPayments) {
      selectedTests.push(this.paymentFlowTest);
      selectedTests.push(this.pciComplianceTest);
    }

    if (context.hasRealtime) {
      selectedTests.push(this.websocketStabilityTest);
    }

    // Time-based selection (for CI/CD)
    if (context.timeLimit) {
      return this.prioritizeByRisk(selectedTests, context.timeLimit);
    }

    return selectedTests;
  }

  prioritizeByRisk(tests: TestSuite[], timeLimit: number): TestSuite[] {
    // Calculate risk score for each area
    const riskScores = this.calculateRiskScores();

    // Sort tests by risk * coverage
    return tests
      .map(test => ({
        test,
        score: riskScores[test.area] * test.coverage
      }))
      .sort((a, b) => b.score - a.score)
      .filter(t => t.test.estimatedDuration < timeLimit)
      .map(t => t.test);
  }
}
```

#### 13.2 Parallel Execution Strategy
```typescript
// Run tests in parallel where possible
const parallelGroups = {
  group1: [
    'visualScreenAnalysis',
    'performanceLighthouse',
    'seoMetaCheck'
  ],
  group2: [
    'customerJourneyTests',
    'accessibilityDeepScan'
  ],
  group3: [
    'gameAIPlayer',  // Resource intensive, runs alone
  ]
};

// Execute groups in sequence, tests within group in parallel
for (const [groupName, tests] of Object.entries(parallelGroups)) {
  console.log(`Running ${groupName}...`);

  const results = await Promise.all(
    tests.map(test => this.runTest(test))
  );

  this.aggregateResults(results);
}
```

---

## Final Report Structure

```typescript
interface ThomasAppReport {
  summary: {
    overallScore: number;  // 0-100
    totalIssues: number;
    criticalIssues: number;
    testDuration: number;
    appType: string;
    timestamp: string;
  };

  phases: {
    customerJourneys: CustomerJourneyReport;
    visualAnalysis: VisualAnalysisReport;
    interactions: InteractionReport;
    console: ConsoleReport;
    gameAI?: GameAIReport;  // If game
    performance: PerformanceReport;
    accessibility: AccessibilityReport;
    seo?: SEOReport;  // If content site
    security: SecurityReport;
    analytics: AnalyticsReport;
    realWorld: RealWorldReport;
  };

  recommendations: Recommendation[];

  priorityActions: Action[];  // Top 5 actions to take

  comparison?: {
    baseline: ThomasAppReport;
    changes: Change[];
  };
}

interface Recommendation {
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  title: string;
  description: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
  roi: number;  // Return on investment (impact/effort)
}

// Example recommendations sorted by ROI:
[
  {
    priority: 'critical',
    category: 'ux',
    title: 'Fix broken checkout flow on mobile',
    description: 'Submit button not clickable on screens < 375px width',
    impact: 'Blocking 40% of mobile users from completing purchase',
    effort: 'low',
    roi: 10  // HIGH ROI: Critical impact, easy fix
  },
  {
    priority: 'high',
    category: 'performance',
    title: 'Lazy load images below the fold',
    description: 'Currently loading 2MB of images on initial page load',
    impact: 'Reducing load time from 4.2s to 1.8s (57% improvement)',
    effort: 'medium',
    roi: 7
  },
  {
    priority: 'medium',
    category: 'accessibility',
    title: 'Add ARIA labels to icon-only buttons',
    description: '8 buttons have no accessible name for screen readers',
    impact: 'Making app usable for 2-3% more users',
    effort: 'low',
    roi: 5
  }
]
```

---

## Implementation Strategy

### Phase 1: MVP (1 week)
- Basic orchestrator
- Customer journey testing (3 predefined journeys)
- Visual screen analysis
- Console monitoring
- Simple report generation

### Phase 2: Intelligence (2 weeks)
- App type detection
- Context-aware test selection
- Game AI player (basic)
- Performance metrics
- Accessibility checks

### Phase 3: Depth (2 weeks)
- Advanced game AI (multiple strategies)
- SEO/Meta analysis
- Security deep scan
- Real-world condition testing
- Comparison with baselines

### Phase 4: Polish (1 week)
- Visual regression detection
- Analytics verification
- Intelligent recommendations
- Beautiful HTML reports
- CI/CD integration

---

## Success Metrics

The command is world-class if:

1. **Coverage**: Tests ≥ 90% of user-facing functionality automatically
2. **Intelligence**: Finds issues humans would miss (game exploits, subtle UX friction)
3. **Actionable**: Every issue has clear priority, impact, and fix suggestion
4. **Fast**: Completes core tests in < 5 minutes
5. **Adaptive**: Automatically adjusts tests based on app type
6. **Predictive**: Estimates user impact (e.g., "This will frustrate 30% of users")
7. **Trend-aware**: Tracks improvements/regressions over time

---

## Next Steps

1. Review this specification
2. Approve/modify scope
3. Create `/thomas-app` command stub
4. Implement Phase 1 (MVP)
5. Test on real applications
6. Iterate based on findings

---

**End of Specification**

Would you like me to proceed with implementation, or would you like to adjust the scope first?
