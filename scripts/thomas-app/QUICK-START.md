# Thomas App - Quick Start Guide

## Installation (5 minutes)

```bash
# One-command install
~/.claude/scripts/thomas-app/install.sh
```

This installs:
- Playwright (browser automation)
- Lighthouse (performance auditing)
- axe-core (accessibility testing)
- Chromium browser (~150MB)

## Basic Usage

### Standard Testing (~5-8 min)

```bash
/thomas-app
```

Tests:
- ✅ Customer journeys
- ✅ Visual analysis (all viewports)
- ✅ Performance (Core Web Vitals + Lighthouse)
- ✅ Accessibility (axe-core)
- ✅ Security scanning
- ✅ Real-world conditions

### Quick Scan (~2 min)

```bash
/thomas-app --quick
```

Tests only:
- ✅ Critical customer journeys
- ✅ Desktop viewport
- ✅ Core Web Vitals
- ✅ Basic accessibility

### Deep Scan (~15-20 min)

```bash
/thomas-app --deep
```

Everything + **5 AI Agents**:
- 🤖 code-review-expert
- 🤖 accessibility-expert
- 🤖 react-performance-expert
- 🤖 css-styling-expert
- 🤖 typescript-expert

## Focused Testing

```bash
# Game testing (includes AI player)
/thomas-app --game

# E-commerce testing
/thomas-app --ecommerce

# Specific suites
/thomas-app --suites=ux,performance,accessibility
```

## Output

After testing completes, you get:

1. **Console Summary** - Immediate results with scores
2. **HTML Report** - `/tmp/thomas-app/report.html` (shareable)
3. **JSON Report** - `/tmp/thomas-app/report.json` (machine-readable)
4. **Screenshots** - `/tmp/thomas-app/screenshots/` (visual proof)
5. **Lighthouse Report** - `/tmp/thomas-app/lighthouse.html` (detailed performance)

## Scores Explained

Each category is scored 0-100:

- **90-100**: Excellent ✅ - Production ready
- **80-89**: Good ✅ - Minor improvements
- **70-79**: Fair ⚠️ - Some issues
- **60-69**: Poor ⚠️ - Significant improvements needed
- **<60**: Critical ❌ - Major issues blocking production

### Overall Score

Weighted average:
- UX: 30%
- Performance: 25%
- Accessibility: 20%
- Security: 15%
- SEO: 10%

## Priority Actions

Issues are prioritized by **ROI** (Return on Investment):

```
ROI = Impact Score × Ease of Fix

High Impact + Easy Fix = Top Priority
```

## Example Workflow

```bash
# 1. Install (once)
~/.claude/scripts/thomas-app/install.sh

# 2. Test during development
/thomas-app --quick

# 3. Test before PR
/thomas-app

# 4. Test before release
/thomas-app --deep

# 5. View report
open /tmp/thomas-app/report.html
```

## Configuration

Create `.thomas-app.json` in your project root:

```json
{
  "baseUrl": "http://localhost:3000",
  "appType": "ecommerce",
  "viewports": [
    { "name": "Desktop", "width": 1920, "height": 1080 },
    { "name": "Mobile", "width": 375, "height": 667 }
  ],
  "customerJourneys": [
    {
      "name": "Checkout Flow",
      "steps": [
        { "action": "goto", "url": "/cart" },
        { "action": "click", "selector": ".checkout-button" },
        { "action": "fill", "selector": "#email", "value": "test@example.com" }
      ]
    }
  ]
}
```

## Troubleshooting

### Node.js version error

```bash
node --version  # Should be v18+
# Install from https://nodejs.org/
```

### Installation fails

```bash
# Manual install
cd ~/.claude/scripts/thomas-app
rm -rf node_modules package-lock.json
npm install
npx playwright install chromium --with-deps
```

### Tests fail to start

```bash
# Ensure your app is running
npm run dev  # or whatever starts your app

# Check port in config
cat .thomas-app.json  # baseUrl should match your dev server
```

### Browser launch errors

```bash
# Install browser dependencies
npx playwright install-deps chromium

# Or install manually (Ubuntu/Debian)
sudo apt-get install -y \
  libnss3 \
  libnspr4 \
  libdbus-1-3 \
  libatk1.0-0 \
  libatk-bridge2.0-0 \
  libcups2 \
  libdrm2 \
  libxkbcommon0 \
  libatspi2.0-0 \
  libxcomposite1 \
  libxdamage1 \
  libxfixes3 \
  libxrandr2 \
  libgbm1 \
  libpango-1.0-0 \
  libcairo2
```

## CI/CD Integration

### GitHub Actions

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
        with:
          node-version: '18'

      - name: Install thomas-app
        run: ~/.claude/scripts/thomas-app/install.sh

      - name: Start dev server
        run: npm run dev &

      - name: Run tests
        run: /thomas-app --quick

      - name: Upload report
        uses: actions/upload-artifact@v3
        with:
          name: thomas-app-report
          path: /tmp/thomas-app/
```

## Next Steps

1. ✅ Install thomas-app
2. ✅ Run first test: `/thomas-app --quick`
3. ✅ Review HTML report
4. ✅ Fix top priority issues
5. ✅ Re-test to verify fixes
6. ✅ Set up CI/CD integration
7. ✅ Schedule weekly deep scans

## Support

- 📖 Full Documentation: `~/.claude/scripts/thomas-app/README.md`
- 🔧 CI/CD Guide: `~/.claude/scripts/thomas-app/CI-CD-INTEGRATION.md`
- 📝 Specification: `~/.claude/docs/THOMAS-APP-SPECIFICATION.md`

---

**Ready to test?**

```bash
/thomas-app
```
