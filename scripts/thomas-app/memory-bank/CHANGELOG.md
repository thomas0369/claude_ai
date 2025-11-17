# Thomas App - Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Fixed
- Project-based output directory now working correctly (`.thomas-app/`)
- ESM module imports fixed for all phase files
- thomas-demo now reads from project directory by default

### Removed
- Old/deprecated files: `thomas-demo-old.mjs`, `thomas-app-quick-test.mjs`, `workout-journey-test.mjs`, `orchestrator.js`

## [2.4.0] - 2025-11-17

### Added
- **Project-based output directory**: All results now saved to `.thomas-app/` in project
- Report archiving with timestamps (`report-{timestamp}.json`)
- Separate latest report (`report.json`) for thomas-demo
- Memory bank documentation (PROJECT-STRUCTURE.md, ARCHITECTURE.md)

### Changed
- Default output directory changed from `/tmp/thomas-app` to `.thomas-app`
- thomas-demo default path changed to `.thomas-app/report.json`
- All debug artifacts now save to `.thomas-app/debug/`

### Why This Matters
- **Project isolation**: Each project maintains its own test history
- **Baseline tracking**: Comparisons work correctly per project
- **Visual regression**: Baselines match the right project
- **No cross-contamination**: Different projects don't mix results

## [2.3.0] - 2025-11-16

### Added
- **thomas-demo visual demonstration tool**
  - Reads and replays test results visually in Chromium
  - Floating UI overlay with progress tracking
  - Element highlighting and tooltips
  - Adjustable replay speed
  - Journey-by-journey demonstration

### Changed
- thomas-demo is now a results viewer, not a test runner
- Loads journey definitions to get selectors
- Shows which journeys passed/failed from actual tests

## [2.2.0] - 2025-11-16

### Added
- **Three-tier debug system**
  - Basic mode (~10-15% overhead)
  - Detailed mode (~30-40% overhead)
  - Full mode (~50%+ overhead)
- Action logger with Playwright action wrapping
- Element state capture (before/after)
- Performance monitoring via Chrome DevTools Protocol
- Artifact manager with automatic cleanup
- JSONL structured logging for debug actions

### Changed
- Converted to ESM module system (`"type": "module"`)
- customer-journeys.js converted to ESM
- reporting.js converted to ESM
- All debug outputs go to `.thomas-app/debug/`

## [2.1.0] - 2025-11-16

### Added
- AI agent code reviews (Phase 7.5)
- Autonomous bug fixing (Phase 7.9)
- Agent recommendations in reports
- Code quality marker scanning

## [2.0.0] - 2025-11-16

### Added
- **Comprehensive Screen Flow Testing** (Phase 3.5)
  - Tests every function on every screen
  - All interaction types: keyboard, mouse, touch, scroll, zoom, forms
  - State machine flow mapping
  - Multiple export formats (JSON, Mermaid, HTML)
  - Interactive flow visualization

### Changed
- Enhanced customer journey error messages with selector suggestions
- Improved failure screenshots

## [1.5.0] - 2025-11-16

### Added
- Visual regression detection
- Baseline comparison system
- Screenshot baselining

### Fixed
- WSL2 compatibility improvements
- Browser launch flags for WSL2 environment

## [1.0.0] - 2025-11-15

### Added
- Initial release
- 8 testing phases
- App type auto-detection
- Customer journey testing
- Visual & interaction analysis
- Performance & accessibility testing
- Security & analytics
- Real-world condition testing
- Intelligent reporting with HTML/JSON
- GitHub integration (optional)

### Supported App Types
- Game
- E-commerce
- SaaS
- Content sites
- Generic websites

## Development Notes

### Module System Evolution

**v1.0-v2.1**: CommonJS
```javascript
const fs = require('fs');
module.exports = { run };
```

**v2.2+**: ESM
```javascript
import fs from 'fs';
export default { run };  // or export { run }
```

### Output Directory Evolution

**v1.0-v2.3**: Global temp directory
```javascript
outputDir: '/tmp/thomas-app'  // ❌ Wrong - shared across projects
```

**v2.4+**: Project directory
```javascript
outputDir: '.thomas-app'  // ✅ Correct - project-specific
```

### Debug System Evolution

**v1.0-v2.1**: No dedicated debug system

**v2.2+**: Three-tier debug system
- Configurable overhead
- Automatic artifact management
- Structured logging
- Performance monitoring

### Demo Tool Evolution

**v2.3 (initial)**: Test runner with UI overlay
- Re-ran all tests visually
- Slow execution
- Duplicate testing

**v2.4 (redesigned)**: Results viewer
- Reads existing test results
- Visual replay of what was tested
- No duplicate testing
- Presentation-ready

## Migration Guides

### Migrating from v2.3 to v2.4

If you were using thomas-app before v2.4:

1. **Old results in `/tmp/thomas-app/`** are not migrated
2. **New runs** will create `.thomas-app/` in your project
3. **Update thomas-demo usage**:
   ```bash
   # Old way (still works with --results flag)
   node thomas-demo.mjs --results /tmp/thomas-app/report.json

   # New way (default)
   cd your-project
   node thomas-demo.mjs  # reads from .thomas-app/report.json
   ```

4. **Add to .gitignore**:
   ```
   .thomas-app/
   ```

5. **Run new test**:
   ```bash
   cd your-project
   node ~/path/to/orchestrator.mjs --app-type yourtype --base-url http://localhost:3000
   ```

### Migrating from v2.1 to v2.2 (CommonJS to ESM)

No action required - backward compatible.

If you were importing phases directly:
```javascript
// Old (CommonJS)
const journeys = require('./phases/customer-journeys.js');

// New (ESM)
const journeys = await import('./phases/customer-journeys.js');
await journeys.default.run(orchestrator);
```

## Breaking Changes

### v2.4.0
- Default output directory changed (but `--output-dir` flag still works)
- thomas-demo default path changed

### v2.2.0
- package.json now requires `"type": "module"`
- All imports must use ESM syntax

## Deprecations

### v2.4.0
- ❌ `/tmp/thomas-app/` output (deprecated, use `.thomas-app/`)
- ❌ `thomas-demo-old.mjs` (removed)
- ❌ `thomas-app-quick-test.mjs` (removed)
- ❌ `orchestrator.js` (removed, use `orchestrator.mjs`)

## Roadmap

### Short Term (v2.5)
- [ ] Pixel-perfect visual regression comparison
- [ ] Performance budget enforcement
- [ ] Custom reporter plugins

### Medium Term (v3.0)
- [ ] Multi-tenant testing support
- [ ] A/B testing capabilities
- [ ] CI/CD integration templates

### Long Term (v4.0)
- [ ] Docker containerization
- [ ] Cloud execution support
- [ ] Distributed testing
- [ ] Real-time collaboration features

## Contributors

Built with Claude Code by Thomas.

## License

Proprietary
