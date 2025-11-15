# 🚀 Thomas App - World-Class Autonomous Application Testing

**The best application testing command in the world.** Thomas App autonomously tests your application from A to Z using AI-powered strategies, real-world conditions, and intelligent analysis.

## What It Does

Thomas App is a comprehensive testing framework that goes beyond traditional testing:

- 🎯 **Customer Journey Testing**: Complete user flow validation from entry to goal
- 👁️ **Visual Analysis**: Screen-by-screen validation with screenshot comparison
- 🎮 **Game AI Player**: Intelligent game testing with multiple strategies
- 📊 **Performance Metrics**: Core Web Vitals, Lighthouse audits
- ♿ **Accessibility**: WCAG compliance with axe-core
- 🔒 **Security Scanning**: Headers, sensitive data, analytics verification
- 🌍 **Real-World Conditions**: Network throttling, device emulation
- 📝 **SEO Analysis**: Meta tags, Open Graph, structured data
- 🛒 **E-commerce Flows**: Cart, checkout, product browsing
- 🤖 **Intelligent Reporting**: ROI-based recommendations, baseline comparison

## Quick Start

```bash
# Full test suite
/thomas-app

# Quick tests (critical flows only, ~2 min)
/thomas-app --quick

# Deep tests (everything, ~15 min)
/thomas-app --deep

# Game-focused testing
/thomas-app --game

# E-commerce focused
/thomas-app --ecommerce

# Specific test suites
/thomas-app --suites=ux,performance,security
```

## Installation

```bash
cd ~/.claude/scripts/thomas-app
npm install
npx playwright install --with-deps
```

## How It Works

### 9-Phase Testing Architecture

#### Phase 1: Discovery & Context Analysis
- Detects app type (game, e-commerce, SaaS, content)
- Discovers routes and features
- Identifies interactive elements
- Maps application structure

#### Phase 2: Customer Journey Testing
- Tests complete user flows from entry to goal
- Validates critical paths (signup, purchase, gameplay)
- Monitors console for errors during journeys
- Captures screenshots at each step

#### Phase 3: Visual & Interaction Analysis
- Tests responsive design (mobile, tablet, desktop)
- Validates touch target sizes
- Checks for layout issues
- Tests all interactive elements (buttons, forms, links)

#### Phase 4: Specialized Testing (Context-Aware)

**For Games:**
- AI player with random strategy (baseline)
- AI player with optimal strategy (difficulty test)
- Difficulty curve analysis
- Exploit detection
- Game-breaking scenario testing

**For E-commerce:**
- Product browsing flows
- Add to cart functionality
- Checkout process validation
- Cart persistence testing

**For Content Sites:**
- SEO meta tags validation
- Open Graph tags
- Twitter Card validation
- Structured data detection

#### Phase 5: Performance & Accessibility
- Core Web Vitals measurement (LCP, FID, CLS)
- Lighthouse audit (performance, accessibility, SEO, best practices)
- axe-core accessibility scan (WCAG compliance)
- Performance scoring

#### Phase 6: Security & Analytics
- Security headers validation
- Sensitive data exposure detection
- Analytics implementation verification
- Privacy compliance checks

#### Phase 7: Real-World Conditions
- Network throttling (4G, 3G, Slow 3G)
- Device emulation (iPhone, iPad, Android)
- Offline behavior testing
- Load time under real conditions

#### Phase 7.5: AI Agent Code Reviews (Deep Mode Only)
- **code-review-expert**: Architecture, code quality, security, testing coverage
- **accessibility-expert**: WCAG compliance and a11y pattern analysis
- **react-performance-expert**: React-specific performance optimization (if React detected)
- **css-styling-expert**: CSS architecture and responsive design (if visual issues found)
- **typescript-expert**: Type safety and best practices (if TypeScript detected)
- Agents run in parallel for speed
- Context-aware selection based on detected technologies
- Expert-level recommendations merged with automated findings

#### Phase 8: Intelligent Reporting
- Aggregates results from all phases
- Calculates scores (0-100 scale)
- Prioritizes issues by ROI (impact/effort)
- Generates actionable recommendations
- Creates beautiful HTML report
- Saves baseline for future comparisons
- Detects visual regressions

## Configuration

Create `.thomas-app.json` in your project root:

```json
{
  "baseUrl": "http://localhost:3000",
  "outputDir": "./thomas-app-results",
  "appType": "auto",
  "timeout": 30000,
  "headless": true,
  "customerJourneys": [
    {
      "name": "User Signup",
      "steps": [
        { "action": "goto", "url": "/signup" },
        { "action": "fill", "selector": "#email", "value": "test@example.com" },
        { "action": "fill", "selector": "#password", "value": "Test123!" },
        { "action": "click", "selector": "button[type=submit]" },
        { "action": "waitForURL", "url": "/dashboard" }
      ]
    }
  ],
  "skipSuites": [],
  "viewports": [
    { "name": "Desktop", "width": 1920, "height": 1080 },
    { "name": "Mobile", "width": 375, "height": 667 }
  ]
}
```

## Test Modes

### Quick Mode (`--quick`)
- Essential customer journeys only
- Single viewport (desktop)
- Performance metrics only
- Basic accessibility scan
- ~2 minutes

### Deep Mode (`--deep`)
- All customer journeys
- All viewports
- Full Lighthouse audit
- Complete accessibility scan
- Network throttling tests
- Device emulation
- **AI Agent Code Reviews** (5 specialized agents)
- ~15-20 minutes

### Default Mode
- Standard customer journeys
- Key viewports (desktop + mobile)
- Core Web Vitals
- Basic accessibility
- ~5-8 minutes

## App Type Detection

Thomas App automatically detects your app type:

- **Game**: Detects canvas, game engines (Phaser, Konva)
- **E-commerce**: Detects cart, product elements
- **Content**: Detects articles, blog posts
- **SaaS**: Detects dashboard, admin panels

Or override with `--game`, `--ecommerce`, `--saas`, or `--content`

## Game AI Testing

When testing games, Thomas App uses multiple AI strategies:

### Random Strategy (Baseline)
- Random inputs to test basic functionality
- Establishes baseline score
- Tests game doesn't crash with random input

### Optimal Strategy (Difficulty Test)
- Pathfinding to objectives
- Threat avoidance
- Optimal decision making
- Tests if game is too easy

### Exploit Detection
- Tests edge cases
- Looks for game-breaking strategies
- Validates win conditions
- Checks for unfair advantages

### Difficulty Curve Analysis
- Compares random vs optimal performance
- Identifies if game is too easy/hard
- Tests progression balance

## Reports

After testing, Thomas App generates:

### HTML Report (`report.html`)
- Beautiful, shareable report
- Score cards for each category
- Top recommendations with ROI
- Detailed issue breakdown
- Metrics visualization
- Baseline comparison (if available)

### JSON Report (`report.json`)
- Machine-readable format
- Complete test results
- All metrics and scores
- Issue details with severity
- CI/CD integration ready

### Screenshots
- Before/after comparisons
- Error screenshots
- Journey step captures
- Visual regression detection

### Console Logs
- All console messages
- Error tracking
- Warning detection
- Performance logs

## Scoring System

Each category is scored 0-100:

- **Overall**: Weighted average of all categories
  - UX: 30%
  - Performance: 25%
  - Accessibility: 20%
  - Security: 15%
  - SEO: 10%

- **UX**: Based on journey success and visual issues
- **Performance**: Core Web Vitals and Lighthouse
- **Accessibility**: axe-core violations by severity
- **Security**: Headers, sensitive data, vulnerabilities
- **SEO**: Meta tags, Open Graph, structured data

### Score Interpretation

- **90-100**: Excellent - Production ready
- **80-89**: Good - Minor improvements needed
- **70-79**: Fair - Some issues to address
- **60-69**: Poor - Significant improvements needed
- **<60**: Critical - Major issues blocking production

## Issue Prioritization

Issues are prioritized by ROI (Return on Investment):

**Priority = Impact × Ease of Fix**

- **Critical + Low Effort** = Highest priority (fix first)
- **High + Low Effort** = High priority
- **Medium + Low Effort** = Medium priority
- **Low + High Effort** = Lowest priority (backlog)

## CI/CD Integration

See [CI-CD-INTEGRATION.md](./CI-CD-INTEGRATION.md) for:
- GitHub Actions workflows
- GitLab CI pipelines
- Jenkins integration
- CircleCI configuration
- Docker setup
- Quality gates
- Slack notifications

## Advanced Usage

### Custom Customer Journeys

```javascript
// .thomas-app.json
{
  "customerJourneys": [
    {
      "name": "Complete Checkout",
      "steps": [
        { "action": "goto", "url": "/" },
        { "action": "click", "selector": ".product:first-child" },
        { "action": "click", "selector": ".add-to-cart" },
        { "action": "goto", "url": "/cart" },
        { "action": "fill", "selector": "#email", "value": "test@example.com" },
        { "action": "click", "selector": ".checkout" },
        { "action": "waitForSelector", "selector": ".success-message" }
      ],
      "criticalPath": true
    }
  ]
}
```

### Skip Specific Suites

```bash
/thomas-app --skip=game,ecommerce
```

### Custom Viewports

```json
{
  "viewports": [
    { "name": "iPhone 12", "width": 390, "height": 844 },
    { "name": "iPad Pro", "width": 1024, "height": 1366 },
    { "name": "4K Desktop", "width": 3840, "height": 2160 }
  ]
}
```

### Environment Variables

```bash
export THOMAS_APP_BASE_URL=http://localhost:3000
export THOMAS_APP_MODE=deep
export THOMAS_APP_HEADLESS=false  # Show browser
export THOMAS_APP_TIMEOUT=60000
```

## Troubleshooting

### Tests are slow
- Use `--quick` mode for faster results
- Reduce number of viewports
- Skip non-essential suites
- Increase timeout for slow networks

### Game AI not working
- Ensure canvas element is present
- Check game controls are keyboard-accessible
- Verify game state is readable via JS
- Add custom game detection logic

### False positives
- Adjust thresholds in config
- Mark expected console warnings
- Whitelist known issues
- Use baseline comparison

### Accessibility violations
- Check axe-core documentation
- Review WCAG guidelines
- Use semantic HTML
- Add ARIA labels

## Architecture

```
thomas-app/
├── orchestrator.js           # Main coordinator
├── phases/
│   ├── discovery.js          # App type & route detection
│   ├── customer-journeys.js  # User flow testing
│   ├── visual-interaction.js # Screen & interaction testing
│   ├── game-ai.js            # Game AI player
│   ├── ecommerce.js          # E-commerce flows
│   ├── seo.js                # SEO analysis
│   ├── performance-accessibility.js  # Metrics & a11y
│   ├── security-analytics.js # Security & analytics
│   ├── real-world.js         # Network & devices
│   ├── agent-reviews.js      # AI agent orchestration (--deep)
│   └── reporting.js          # Report generation
├── package.json
├── README.md
└── CI-CD-INTEGRATION.md
```

## Philosophy

Thomas App follows these principles:

1. **Test Like a User**: Focus on real user flows, not just technical checks
2. **AI-Powered**: Use intelligent strategies, not just scripts
3. **Context-Aware**: Adapt testing to app type automatically
4. **Real-World**: Test under actual conditions users face
5. **Actionable**: Provide clear, prioritized recommendations
6. **Beautiful**: Reports should be shareable and understandable
7. **Autonomous**: Run without manual intervention
8. **Comprehensive**: Cover all aspects from UX to security

## Comparison with Other Tools

| Feature | Thomas App | Playwright | Cypress | Lighthouse |
|---------|-----------|-----------|---------|------------|
| Customer Journeys | ✅ AI-powered | ⚠️ Manual scripts | ⚠️ Manual scripts | ❌ |
| Visual Testing | ✅ Multi-viewport | ⚠️ Screenshots only | ⚠️ Screenshots only | ❌ |
| Game AI Testing | ✅ Multiple strategies | ❌ | ❌ | ❌ |
| Performance | ✅ CWV + Lighthouse | ❌ | ❌ | ✅ |
| Accessibility | ✅ axe-core | ⚠️ Manual | ⚠️ Manual | ✅ |
| Security | ✅ Full scan | ❌ | ❌ | ⚠️ Basic |
| Real-World Testing | ✅ Network + devices | ⚠️ Manual | ⚠️ Manual | ⚠️ Mobile only |
| **AI Agent Code Review** | ✅ **5 specialized agents** | ❌ | ❌ | ❌ |
| Intelligent Reports | ✅ ROI-based | ❌ | ❌ | ⚠️ Scores only |
| Auto App Detection | ✅ | ❌ | ❌ | ❌ |

## FAQ

**Q: How long does a full test take?**
A: Quick mode ~2 min, default ~5-8 min, deep mode ~15-20 min (includes AI agent reviews)

**Q: Can I test production sites?**
A: Yes, but be aware of rate limits and analytics impacts

**Q: Does it work with all frameworks?**
A: Yes - React, Vue, Angular, Svelte, vanilla JS - anything that runs in a browser

**Q: Can I customize the AI player?**
A: Yes, edit `phases/game-ai.js` to add custom strategies

**Q: Does it replace manual testing?**
A: No, it complements manual testing by automating repetitive checks

**Q: Can I run it in CI/CD?**
A: Yes! See CI-CD-INTEGRATION.md for setup guides

**Q: How does scoring work?**
A: Each category is 0-100 based on industry best practices and WCAG/W3C standards

**Q: Can I test mobile apps?**
A: Currently browser-based only, but supports mobile viewport emulation

**Q: Is it free?**
A: Yes, it's part of the Thomas CLI tools

**Q: How do I contribute?**
A: Submit PRs to improve phases, add new test types, or enhance reporting

## Roadmap

- [ ] Visual regression pixel-by-pixel comparison
- [ ] Multi-language support for content testing
- [ ] Video recording of test runs
- [ ] Performance budgets
- [ ] Custom plugin system
- [ ] Mobile app testing (React Native, Flutter)
- [ ] AI-powered test generation from screenshots
- [ ] Automated fix suggestions with code patches

## License

MIT

## Credits

Created by Thomas as part of the Claude Code automation toolkit.

Powered by:
- Playwright (browser automation)
- axe-core (accessibility testing)
- Lighthouse (performance auditing)

---

**Made with 🤖 by Thomas - Testing applications autonomously since 2025**
