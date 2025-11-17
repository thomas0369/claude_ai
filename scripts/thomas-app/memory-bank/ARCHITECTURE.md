# Thomas App - Architecture Overview

## System Design

Thomas App follows a **phased orchestration architecture** where each testing phase is independent, composable, and outputs to a project-specific directory.

## Core Principles

### 1. Project Isolation
- All outputs go to `.thomas-app/` in the **project directory**
- No cross-contamination between projects
- Each project maintains its own test history

### 2. Autonomous Operation
- Auto-detects app type
- Generates intelligent recommendations
- Self-fixes discovered bugs (optional)
- Creates GitHub issues (optional)

### 3. Comprehensive Coverage
- 8 testing phases
- Specialized tests per app type
- Real-world condition simulation
- AI agent code reviews

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                   CLI Entry Point                        │
│                  orchestrator.mjs                        │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ├─ Initialize Browser (Playwright)
                  ├─ Load Config (.thomas-app.json or defaults)
                  ├─ Setup Debug Mode (optional)
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│                    Phase Execution                       │
│              (Sequential, with results)                  │
└─────────────────────────────────────────────────────────┘
                  │
    ┌─────────────┼─────────────┐
    │             │             │
    ▼             ▼             ▼
┌─────────┐  ┌─────────┐  ┌─────────┐
│ Phase 1 │  │ Phase 2 │  │ Phase 3 │  ... Phase 8
│Discovery│  │Customer │  │ Visual/ │
│         │  │Journeys │  │Interact │
└────┬────┘  └────┬────┘  └────┬────┘
     │            │            │
     │            │            │
     └────────────┼────────────┘
                  │
                  ▼
         ┌────────────────┐
         │  Aggregation   │
         │   & Scoring    │
         └────────┬───────┘
                  │
                  ▼
         ┌────────────────┐
         │   Reporting    │
         │  (HTML/JSON)   │
         └────────┬───────┘
                  │
                  ▼
         ┌────────────────┐
         │ .thomas-app/   │ ← Project Directory
         │ - report.json  │
         │ - report.html  │
         │ - baseline.json│
         │ - screenshots  │
         │ - videos       │
         │ - debug/       │
         └────────────────┘
```

## Testing Phases

### Phase 1: Discovery & Context Analysis
**File**: `phases/discovery.mjs`

- Detects app type (game, ecommerce, SaaS, content, website)
- Discovers routes via sitemap and navigation
- Identifies features (auth, forms, payments, etc.)
- Detects tech stack from meta tags and scripts
- Establishes testing baseline

**Outputs**: App type, routes, features, tech stack

### Phase 2: Customer Journey Testing
**File**: `phases/customer-journeys.js`

- Pre-defined journeys per app type
- Tests complete user flows end-to-end
- Detects friction points (slow steps)
- Captures journey screenshots
- Enhanced error messages with selector suggestions

**Journeys**:
- **Game**: Onboarding, gameplay loop
- **Ecommerce**: Browse to purchase, search
- **SaaS**: Sign up to first value, dashboard
- **Content**: Browse and read articles
- **Website**: Homepage to contact

**Outputs**: Journey results, friction points, failure screenshots

### Phase 3: Visual & Interaction Analysis
**File**: `phases/visual-interaction.js`

- Tests across 4 viewports (desktop, laptop, tablet, mobile)
- Captures full-page screenshots per viewport
- Tests interactive elements (buttons, links)
- Detects visual issues (layout, touch targets, contrast)
- Checks responsive design

**Outputs**: Visual issues, screenshots, interaction results

### Phase 3.5: Screen Flow & Comprehensive Interaction
**File**: `phases/screen-flow.js`

- Discovers all application states (screens)
- Tests ALL interaction types:
  - Keyboard (Tab, Enter, Arrows, shortcuts)
  - Mouse (Click, hover, context menu)
  - Touch (Tap, swipe, pinch)
  - Scroll (Wheel, touch, keyboard)
  - Zoom (Browser zoom, pinch zoom)
  - Forms (All input types)

- Builds complete flow map (state machine)
- Exports in multiple formats (JSON, Mermaid, HTML)
- Tracks state transitions

**Outputs**: Flow maps, state transitions, interaction coverage

### Phase 4: Specialized Testing
**Files**: `phases/game-ai.js`, `phases/ecommerce.js`, `phases/seo.js`

Context-aware testing based on app type:

#### Game AI Player
- Plays game autonomously using AI heuristics
- Tests difficulty balance
- Detects exploits and balance issues
- Measures player progression

#### E-commerce Flows
- Tests complete purchase flow
- Validates cart functionality
- Checks payment integration
- Tests product search

#### SEO Analysis (Content sites)
- Meta tags validation
- Open Graph / Twitter Cards
- Structured data
- XML sitemap

**Outputs**: App-specific test results and recommendations

### Phase 5: Performance & Accessibility
**File**: `phases/performance-accessibility.js`

#### Performance
- Core Web Vitals (LCP, FID, CLS)
- Lighthouse audit (optional)
- Performance scoring

#### Accessibility
- Axe-core scanning
- WCAG 2.1 compliance
- Alternative text validation
- Focus indicator checking
- Form label validation

**Outputs**: Performance score, a11y score, violations

### Phase 6: Security & Analytics
**File**: `phases/security-analytics.js`

#### Security
- Sensitive data exposure detection
- Security headers checking
- HTTPS validation
- XSS vulnerability detection
- Cookie security analysis

#### Analytics (Optional)
- Analytics provider detection
- Event tracking validation

**Outputs**: Security score, vulnerabilities, header status

### Phase 7: Real-World Conditions
**File**: `phases/real-world.js`

- Network throttling (3G, 4G, slow)
- Device simulation (old devices)
- Geolocation testing
- Offline mode testing

**Outputs**: Network test results, device compatibility

### Phase 7.3: Code Quality Scanning
**File**: `phases/code-quality.js`

Scans codebase for markers:
- TODO comments
- FIXME notes
- HACK warnings
- BUG markers
- DEPRECATED code

**Outputs**: Code quality markers count and locations

### Phase 7.5: AI Agent Code Reviews
**File**: `phases/agent-reviews.js`

AI-powered code review for:
- Architecture patterns
- Best practices
- Performance optimizations
- Security concerns
- Accessibility improvements

**Outputs**: Agent recommendations with priority

### Phase 7.9: Autonomous Bug Fixing
**File**: `phases/autofix.mjs`

Autonomously fixes discovered bugs:
- Analyzes test failures
- Generates fixes
- Validates fixes
- Creates commits (optional)

**Outputs**: Fixed bugs count, fix attempts, success rate

### Phase 8: Intelligent Reporting
**File**: `phases/reporting.js`

- Aggregates all phase results
- Calculates overall scores
- Generates priority-ranked recommendations
- Compares with baseline
- Detects visual regressions
- Creates HTML + JSON reports
- Optionally creates GitHub issues

**Outputs**:
- `report.json` (latest)
- `report-{timestamp}.json` (archived)
- `report.html` (visual)
- `baseline.json` (for comparisons)

## Debug System

### Architecture

```
┌─────────────────────────────────────┐
│     Orchestrator (Main Process)     │
└────────────┬────────────────────────┘
             │
             ├─ Debug Config (3 tiers)
             │
    ┌────────┴────────┐
    │                 │
    ▼                 ▼
┌──────────┐    ┌──────────────┐
│  Action  │    │ Performance  │
│  Logger  │    │   Monitor    │
└────┬─────┘    └──────┬───────┘
     │                 │
     ├─ Wraps Playwright actions
     ├─ Captures element state
     ├─ Screenshots (before/after)
     │                 │
     │                 ├─ Chrome DevTools Protocol
     │                 ├─ Metrics collection
     │                 ├─ Budget checking
     │
     ▼                 ▼
┌────────────────────────────┐
│   .thomas-app/debug/       │
│   - actions.jsonl          │
│   - screenshots/           │
│   - trace.zip              │
│   - network.har            │
│   - videos/                │
│   - summary.json           │
└────────────────────────────┘
```

### Debug Tiers

**Basic** (~10-15% overhead):
- Action logs (JSONL)
- Console monitoring
- Failed network requests only
- Screenshots on failure

**Detailed** (~30-40% overhead):
- Element state before/after
- Full network logs + headers
- Screenshots every action
- Playwright traces (on retry)
- Performance metrics

**Full** (~50%+ overhead):
- Video recording
- HAR files
- Always-on traces
- Code coverage
- Accessibility snapshots

### Artifact Management

Automatic cleanup based on:
- Retention period (7d default, 14d for full mode)
- Max size (100MB to 2GB based on tier)
- Age-based pruning

## Data Flow

```
User Input (CLI args)
    ↓
Config Loader (.thomas-app.json or defaults)
    ↓
Browser Initialization (Playwright + Chrome)
    ↓
Debug Setup (if enabled)
    ↓
Phase 1: Discovery → context for other phases
    ↓
Phase 2-7.9: Specialized testing → accumulate results
    ↓
Phase 8: Reporting → aggregate & score
    ↓
Output to .thomas-app/ (project directory)
    ↓
Optional: GitHub issue creation
    ↓
Cleanup (browser, debug artifacts)
```

## Scoring System

### Overall Score
Weighted average of all category scores:
```
Overall = (UX × 0.30) +
          (Performance × 0.25) +
          (Accessibility × 0.20) +
          (Security × 0.15) +
          (SEO × 0.10)
```

### UX Score
```
Start: 100
- Failed journeys: -30 per journey
- Visual issues: -5 per issue (max -30)
```

### Performance Score
```
Start: 100
- LCP > 4000ms: -30
- LCP > 2500ms: -15
- CLS > 0.25: -30
- CLS > 0.1: -15
```

### Accessibility Score
```
Start: 100
- Critical violations: -15 each
- Serious violations: -10 each
- Other violations: -5 each
```

### Security Score
```
Start: 100
- Missing security headers: -10 each
- Sensitive data exposure: -20 each
- XSS vulnerabilities: -30 each
```

### Priority Calculation
```
Priority = Severity Score × Effort Score

Severity:
- critical: 10
- high: 7
- medium: 4
- low: 1

Effort:
- low: 3
- medium: 2
- high: 1

Result: Higher priority = better ROI (fix first)
```

## Extension Points

### Adding New App Types

1. Add journey templates in `customer-journeys.js`:
```javascript
myNewAppType: [
  {
    name: 'My Journey',
    critical: true,
    steps: [...]
  }
]
```

2. Add specialized tests in `phases/`:
```javascript
// phases/my-new-app.js
async function run(orchestrator) {
  const { page, config, results } = orchestrator;
  // Custom testing logic
  return testResults;
}
export default { run };
```

3. Update orchestrator.mjs:
```javascript
if (appType === 'myNewAppType') {
  const myTest = await import('./phases/my-new-app.js');
  this.results.phases.myNewApp = await myTest.default.run(this);
}
```

### Adding New Phases

1. Create `phases/new-phase.js`
2. Implement `async function run(orchestrator)`
3. Use `config.outputDir` for all file writes
4. Return structured results
5. Update orchestrator to call your phase
6. Update reporting to include your results

### Custom Recommendations

In `reporting.js`, add custom logic to `generateRecommendations()`:

```javascript
if (myCondition) {
  recommendations.push({
    category: 'My Category',
    priority: 'high',
    action: 'Do something',
    reason: 'Because X',
    roi: 9
  });
}
```

## Performance Considerations

### Memory Management
- Page screenshots limited to prevent OOM
- Console log entries capped at 1000
- Artifact cleanup automatic
- Browser restart between major phases (optional)

### Execution Time
- Quick mode: ~30s (3 phases)
- Normal mode: ~3-5min (all phases)
- Deep mode: ~10-15min (with autofix)

### Parallelization
- Phases run sequentially (dependency chain)
- Within phases: parallel where possible
- Screenshots taken concurrently
- Network requests monitored async

## Error Handling

### Graceful Degradation
- Phase failures don't stop orchestrator
- Missing dependencies skip phases
- Lighthouse unavailable? Continue without it
- CSP blocking axe-core? Use fallback checks

### Cleanup Guarantee
- Process signal handlers (SIGINT, SIGTERM)
- Uncaught exception handlers
- Browser force-kill on timeout
- Artifact cleanup on exit

## Security

### Defensive Testing Only
- No credential harvesting
- No malicious code generation
- No vulnerability exploitation
- Only defensive security checks

### Data Privacy
- All data stays in project directory
- No telemetry
- No external API calls (except GitHub if enabled)
- Local execution only

## Future Enhancements

Potential additions:
- [ ] Visual regression pixel-perfect comparison
- [ ] Performance budgets enforcement
- [ ] A/B testing support
- [ ] Multi-tenant testing
- [ ] CI/CD integration scripts
- [ ] Docker containerization
- [ ] Cloud execution support
- [ ] Custom reporter plugins
