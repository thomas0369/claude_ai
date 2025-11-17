# Thomas App - Project Structure

## Overview

Thomas App is a comprehensive autonomous testing framework that provides complete application testing from discovery to bug fixing, with specialized testing for different app types (game, ecommerce, SaaS, content sites, websites).

## Key Principle: Project-Based Testing

**CRITICAL**: All test results are saved in the **project directory** (`.thomas-app/`), NOT in user/global locations.

- Each project gets its own `.thomas-app/` directory
- Results are project-specific and don't cross-contaminate
- Historical data is preserved with timestamped archives
- `.thomas-app/` should be git-ignored

## Directory Structure

```
thomas-app/
├── orchestrator.mjs           # Main orchestrator (ESM)
├── thomas-demo.mjs            # Visual demo tool (reads test results)
├── demo-debug.mjs             # Debug mode demonstration
├── package.json               # Dependencies (type: "module")
├── vitest.config.js           # Test configuration
│
├── config/
│   └── debug-config.js        # Three-tier debug system
│
├── lib/
│   └── debug/
│       ├── action-logger.js   # Playwright action logging
│       ├── artifact-manager.js # Debug artifact management
│       └── performance-monitor.js # Performance tracking
│
├── phases/                    # Test phases (all use .thomas-app/)
│   ├── discovery.mjs          # App type detection (ESM, named export)
│   ├── customer-journeys.js   # User flow testing (default export)
│   ├── visual-interaction.js  # Visual & interaction tests
│   ├── screen-flow.js         # Comprehensive interaction testing
│   ├── game-ai.js             # Game-specific AI player
│   ├── ecommerce.js           # E-commerce flow tests
│   ├── seo.js                 # SEO analysis
│   ├── performance-accessibility.js # Core Web Vitals + a11y
│   ├── security-analytics.js  # Security scanning
│   ├── real-world.js          # Network/device testing
│   ├── code-quality.js        # Code marker scanning
│   ├── agent-reviews.js       # AI agent code reviews
│   ├── autofix.mjs            # Autonomous bug fixing (ESM)
│   ├── reporting.js           # Report generation (named export)
│   └── github-integration.js  # GitHub issue creation
│
├── tests/                     # Unit tests
│   ├── unit/
│   └── helpers/
│
└── memory-bank/               # Documentation
    ├── PROJECT-STRUCTURE.md   # This file
    ├── ARCHITECTURE.md        # Architecture overview
    ├── DEBUG-MODE.md          # Debug system docs
    └── TESTING-GUIDE.md       # Testing guide
```

## Output Directory Structure (Per Project)

```
your-project/
└── .thomas-app/               # ← All results saved here
    ├── report.json            # Latest test results
    ├── report-{timestamp}.json # Archived results
    ├── report.html            # HTML report
    ├── baseline.json          # Baseline for comparisons
    ├── baseline/
    │   └── latest.json
    ├── baselines/             # Visual regression baselines
    │   └── *.png
    ├── videos/                # Recorded test videos
    │   └── *.webm
    ├── flow-map-*.json        # Screen flow maps
    ├── flow-map-*.mmd         # Mermaid diagrams
    ├── flow-map-*.html        # Interactive flow maps
    ├── lighthouse.json        # Lighthouse reports
    ├── lighthouse.html
    ├── journey-*.png          # Journey screenshots
    ├── visual-*.png           # Visual test screenshots
    ├── flow-state-*.png       # Screen flow screenshots
    │
    └── debug/                 # Debug mode artifacts
        ├── actions.jsonl      # Action logs (JSONL)
        ├── trace.zip          # Playwright traces
        ├── network.har        # Network HAR files
        ├── screenshots/       # Debug screenshots
        │   ├── before-*.png
        │   └── after-*.png
        ├── videos/            # Debug videos
        └── summary.json       # Debug summary
```

## Module System

### ESM vs CommonJS

**package.json**: `"type": "module"` (ESM)

**Import Pattern:**
- `.mjs` files use **named exports**: `export { run }`
  - Import: `const module = await import('./file.mjs'); module.run()`

- `.js` files use **default exports**: `export default { run }`
  - Import: `const module = await import('./file.js'); module.default.run()`

**Exception:** `reporting.js` uses named export despite `.js` extension
- Export: `export { generate }`
- Import: `const reporting = await import('./phases/reporting.js'); reporting.generate()`

### Phase Modules

| File | Extension | Export Type | Import Pattern |
|------|-----------|-------------|----------------|
| discovery.mjs | .mjs | Named | `module.run()` |
| customer-journeys.js | .js | Default | `module.default.run()` |
| visual-interaction.js | .js | Default | `module.default.run()` |
| screen-flow.js | .js | Default | `module.default.run()` |
| game-ai.js | .js | Default | `module.default.run()` |
| ecommerce.js | .js | Default | `module.default.run()` |
| seo.js | .js | Default | `module.default.run()` |
| performance-accessibility.js | .js | Default | `module.default.run()` |
| security-analytics.js | .js | Default | `module.default.run()` |
| real-world.js | .js | Default | `module.default.run()` |
| code-quality.js | .js | Default | `module.default.run()` |
| agent-reviews.js | .js | Default | `module.default.run()` |
| autofix.mjs | .mjs | Named | `module.run()` |
| reporting.js | .js | **Named** | `module.generate()` ⚠️ |

## Configuration

### Default Config (orchestrator.mjs)

```javascript
{
  appType: null,  // Auto-detected
  baseUrl: 'http://localhost:3000',
  outputDir: '.thomas-app',  // ← PROJECT DIRECTORY

  testSuites: {
    discovery: true,
    customerJourneys: true,
    visualAnalysis: true,
    interactions: true,
    screenFlow: true,
    gameAI: false,  // Auto-enabled if game detected
    performance: true,
    accessibility: true,
    security: true,
    seo: true,
    analytics: false,
    realWorld: true,
    agentReviews: true,
    autofix: true
  },

  viewports: [
    { name: 'Desktop', width: 1920, height: 1080 },
    { name: 'Laptop', width: 1366, height: 768 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Mobile', width: 375, height: 667 }
  ],

  baseline: {
    enabled: true,
    path: '.thomas-app/baseline'
  }
}
```

### Debug Configuration

Three-tier system in `config/debug-config.js`:

- **off**: No debugging (default)
- **basic**: Lightweight (~10-15% overhead)
  - Action logging (JSONL)
  - Console monitoring
  - Failed network requests
  - Screenshots on failure only

- **detailed**: Comprehensive (~30-40% overhead)
  - Full action logging with element state
  - All network requests + headers + body
  - Screenshots before/after each action
  - Playwright traces (on retry)
  - Performance metrics

- **full**: Maximum visibility (~50%+ overhead)
  - Everything from detailed
  - Video recording
  - HAR files
  - Full Playwright traces
  - Code coverage
  - Accessibility snapshots

All debug output goes to `.thomas-app/debug/`

## CLI Usage

```bash
# Basic usage
node orchestrator.mjs --app-type website --base-url http://localhost:3000

# Quick mode (only critical tests)
node orchestrator.mjs --quick

# Specific test suites
node orchestrator.mjs --suites=discovery,customerJourneys,performance

# With debug mode
node orchestrator.mjs --debug           # basic
node orchestrator.mjs --debug-detailed  # detailed
node orchestrator.mjs --debug-full      # full

# Custom debug output
node orchestrator.mjs --debug --debug-dir ./my-debug --debug-retention 30d
```

## Thomas Demo

Visual demonstration tool that **reads** test results (doesn't run tests):

```bash
# Default: reads from .thomas-app/report.json
node thomas-demo.mjs

# Custom results file
node thomas-demo.mjs --results /path/to/report.json

# Specific journey
node thomas-demo.mjs --journey "Browse to Purchase"

# Adjust speed
node thomas-demo.mjs --speed 0.5  # slower
node thomas-demo.mjs --speed 2.0  # faster
```

## Testing Philosophy

### Project Isolation

Every project tested gets:
- Its own `.thomas-app/` directory
- Project-specific baselines
- Historical test data
- Visual regression tracking
- Independent debug artifacts

### Why Not User/Global?

❌ **Wrong**: Saving to `/tmp/thomas-app/` or `~/.thomas-app/`
- Results from different projects mix together
- Baselines compare wrong apps
- Visual regression fails
- History is meaningless

✅ **Correct**: Saving to `<project>/.thomas-app/`
- Each project has its own results
- Baselines track project evolution
- Visual regression works correctly
- History shows project improvement

## Common Pitfalls

### 1. Wrong Import Pattern

```javascript
// ❌ WRONG - missing .default for .js files
const journeys = await import('./phases/customer-journeys.js');
await journeys.run(this);  // Error: journeys.run is not a function

// ✅ CORRECT
const journeys = await import('./phases/customer-journeys.js');
await journeys.default.run(this);
```

### 2. Global Output Directory

```javascript
// ❌ WRONG - global directory
outputDir: '/tmp/thomas-app'

// ✅ CORRECT - project directory
outputDir: '.thomas-app'
```

### 3. Hardcoded Paths

```javascript
// ❌ WRONG - hardcoded path
fs.writeFileSync('/tmp/results.json', data);

// ✅ CORRECT - use config.outputDir
fs.writeFileSync(
  path.join(config.outputDir, 'results.json'),
  data
);
```

## Version History

- **v3.0**: World-class autonomous fix command with security scanning
- **v2.5**: Debug mode integration (three-tier system)
- **v2.4**: Thomas-demo visual demonstration tool
- **v2.3**: Project-based output directory (`.thomas-app/`)
- **v2.2**: ESM module system conversion
- **v2.1**: Agent reviews and autonomous bug fixing
- **v2.0**: Comprehensive screen flow testing
- **v1.0**: Initial release

## Maintenance

### Adding New Phases

1. Create `phases/new-phase.js` or `.mjs`
2. Export: `export default { run }` or `export { run }`
3. In orchestrator.mjs:
   ```javascript
   const newPhase = await import('./phases/new-phase.js');
   this.results.phases.newPhase = await newPhase.default.run(this);
   ```
4. **ALWAYS** use `config.outputDir` for file writes
5. Update this documentation

### Updating Dependencies

```bash
npm update
npm test  # Run all 111 unit tests
```

### Cleaning Up

```bash
# Remove old test artifacts in projects
find . -name ".thomas-app" -type d -mtime +30 -exec rm -rf {} +

# Clean debug artifacts (per project)
cd your-project/.thomas-app/debug
~/.claude/scripts/thomas-app/lib/debug/artifact-manager.js cleanup
```

## Support

- Issues: Create GitHub issue
- Documentation: See `memory-bank/` directory
- Examples: See `tests/` directory
