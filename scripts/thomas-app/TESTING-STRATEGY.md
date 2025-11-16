# Thomas-App Testing Strategy

## Goal: 100% Test Coverage

This document outlines the comprehensive testing strategy to achieve 100% code coverage for thomas-app.

---

## Current State

**Coverage**: 0% (no tests exist)
**Target**: 100% coverage across all files

**Files to Test**:
- `orchestrator.js` (main coordinator)
- `phases/*.js` (15 phase files)
- `reporters/*.js` (reporting utilities)
- `utils/*.js` (utility functions)

---

## Testing Approach

### 1. Unit Tests
Test individual functions and methods in isolation.

**Coverage**: All functions, branches, statements, lines

**Tools**:
- Vitest (test runner)
- @vitest/coverage-v8 (coverage tool)

### 2. Integration Tests
Test how components work together.

**Coverage**: Phase integration with orchestrator

### 3. Edge Case Tests
Test error conditions, boundary values, and unusual inputs.

**Coverage**: All error paths, null/undefined handling

---

## File-by-File Coverage Plan

### `orchestrator.js` (Priority: Critical)

**Functions to Test**:
- `constructor()` - Config initialization
- `detectWSL()` - WSL2 detection
- `loadConfig()` - Config loading and merging
- `isSuiteEnabled()` - Test suite checking
- `setupBrowser()` - Browser launch
- `setupConsoleMonitoring()` - Console log capture
- `setupProcessCleanup()` - Signal handlers
- `run()` - Main execution flow
- `runPhase1Discovery()` - With error handling
- `runPhase2CustomerJourneys()` - With error handling
- `runPhase3VisualInteraction()` - Visual testing
- `runPhase3ScreenFlow()` - Screen flow testing
- `runPhase4Specialized()` - Game/ecommerce/SEO
- `runPhase5PerformanceAccessibility()` - Performance testing
- `runPhase6SecurityAnalytics()` - Security testing
- `runPhase7RealWorld()` - Real-world testing
- `runPhase7CodeQuality()` - Code quality scanning
- `runPhase7AgentReviews()` - AI agent reviews
- `runPhase7Autofix()` - Autonomous bug fixing
- `runPhase8Reporting()` - Report generation
- `cleanup()` - Resource cleanup

**Edge Cases**:
- Missing config file
- Invalid config
- Browser launch failure
- Phase failures (error handling)
- Process interruption (SIGINT/SIGTERM)
- Memory limits

---

### `phases/discovery.js` (Priority: High)

**Functions to Test**:
- `run()` - Main phase execution
- `detectAppType()` - App type detection logic
- `discoverRoutes()` - Route discovery
- `identifyFeatures()` - Feature detection
- `analyzeTechStack()` - Tech stack analysis

**Edge Cases**:
- Page load timeout
- No routes found
- Missing package.json
- Invalid page content
- Network errors

---

### `phases/customer-journeys.js` (Priority: High)

**Functions to Test**:
- `run()` - Journey execution
- `findSimilarSelectors()` - Selector suggestions
- Journey step execution (all types)
- Friction point detection
- Screenshot capture

**Edge Cases**:
- Selector not found (with suggestions)
- Navigation timeout
- Element not visible
- Form submission failure
- Journey interruption

---

### `phases/autofix.js` (Priority: High)

**Functions to Test**:
- `run()` - Main autofix flow
- `/thomas-fix` availability check
- `collectFixableIssues()` - Issue collection
- `attemptFix()` - Fix routing
- `runThomasFix()` - thomas-fix execution
- `quickVerification()` - Fix verification
- Iterative fixing (max 3 iterations)

**Edge Cases**:
- /thomas-fix not found
- No fixable issues
- Fix timeout
- Fix failure
- Max iterations reached
- Verification failure

---

### `phases/screen-flow.js` (Priority: Medium)

**Functions to Test**:
- `run()` - Screen flow execution
- `discoverStates()` - State discovery
- `testInteractions()` - 71+ interaction patterns
- `generateFlowMap()` - Flow map generation (3 formats)
- Coverage calculations

**Edge Cases**:
- No states found
- Interaction timeout
- Screenshot failure
- Flow map generation error

---

### `phases/code-quality.js` (Priority: Medium)

**Functions to Test**:
- `run()` - Code scanning
- `scanFile()` - File scanning
- `scanDirectory()` - Recursive directory scan
- Marker detection (TODO, FIXME, BUG, etc.)
- Severity categorization

**Edge Cases**:
- No files to scan
- File read error
- Binary files
- Large files

---

### `phases/github-integration.js` (Priority: Medium)

**Functions to Test**:
- `run()` - Main execution
- `createIssues()` - Issue creation
- `createGitHubIssue()` - gh CLI integration
- Issue filtering (max 10)
- Label application

**Edge Cases**:
- gh CLI not installed
- Authentication failure
- Network error
- Rate limiting
- Invalid issue data

---

### `phases/performance-accessibility.js` (Priority: Medium)

**Functions to Test**:
- `run()` - Main execution
- `runLighthouse()` - Lighthouse integration
- `runAccessibility()` - axe-core integration
- WSL2 support
- Core Web Vitals calculation

**Edge Cases**:
- Lighthouse failure
- axe-core script load failure
- No accessibility violations
- Performance timeout

---

### `phases/game-ai.js` (Priority: Low)

**Functions to Test**:
- `run()` - Game AI execution
- Random strategy
- Optimal strategy
- Score tracking
- Exploit detection

**Edge Cases**:
- No canvas element
- Game not interactive
- Score not readable
- Timeout

---

### `phases/ecommerce.js` (Priority: Low)

**Functions to Test**:
- `run()` - E-commerce testing
- Product browsing
- Add to cart
- Checkout flow

**Edge Cases**:
- No products
- Cart issues
- Payment not configured

---

### `phases/seo.js` (Priority: Low)

**Functions to Test**:
- `run()` - SEO analysis
- Meta tag validation
- Open Graph validation
- Structured data detection

**Edge Cases**:
- Missing meta tags
- Invalid structured data

---

### `phases/security-analytics.js` (Priority: Medium)

**Functions to Test**:
- `run()` - Security scanning
- Header validation
- Sensitive data detection
- localStorage/sessionStorage scan

**Edge Cases**:
- No security headers
- Sensitive data found
- Storage unavailable

---

### `phases/visual-interaction.js` (Priority: Medium)

**Functions to Test**:
- `run()` - Visual testing
- Multi-viewport testing
- Touch target validation
- Layout issue detection

**Edge Cases**:
- Screenshot failure
- Layout calculation error
- Viewport change failure

---

### `phases/real-world.js` (Priority: Low)

**Functions to Test**:
- `run()` - Real-world testing
- Network throttling
- Device emulation
- Offline behavior

**Edge Cases**:
- Throttling not supported
- Device emulation failure

---

### `phases/agent-reviews.js` (Priority: Low - Deep mode only)

**Functions to Test**:
- `run()` - Agent orchestration
- Agent selection
- Parallel execution

**Edge Cases**:
- Agent unavailable
- Review timeout

---

### `phases/reporting.js` (Priority: High)

**Functions to Test**:
- `run()` - Report generation
- JSON report creation
- HTML report creation
- Mermaid diagram generation
- GitHub integration

**Edge Cases**:
- Write permission error
- Invalid report data
- Missing template

---

## Test Organization

```
tests/
├── unit/
│   ├── orchestrator.test.js         # Orchestrator tests
│   ├── phases/
│   │   ├── discovery.test.js        # Discovery phase tests
│   │   ├── customer-journeys.test.js
│   │   ├── autofix.test.js
│   │   ├── screen-flow.test.js
│   │   ├── code-quality.test.js
│   │   ├── github-integration.test.js
│   │   ├── performance-accessibility.test.js
│   │   ├── security-analytics.test.js
│   │   ├── visual-interaction.test.js
│   │   ├── game-ai.test.js
│   │   ├── ecommerce.test.js
│   │   ├── seo.test.js
│   │   ├── real-world.test.js
│   │   ├── agent-reviews.test.js
│   │   └── reporting.test.js
│   └── reporters/
│       └── (reporter tests)
├── integration/
│   ├── orchestrator-phases.test.js  # Phase integration tests
│   ├── end-to-end.test.js           # Full flow tests
│   └── error-recovery.test.js       # Error handling tests
├── fixtures/
│   ├── mock-config.json             # Test configurations
│   ├── mock-page.html               # Mock HTML pages
│   └── mock-package.json            # Mock package.json files
└── helpers/
    ├── mock-browser.js              # Browser mocks
    ├── mock-page.js                 # Page mocks
    └── test-utils.js                # Test utilities
```

---

## Mocking Strategy

### Browser/Playwright Mocks
- Mock `playwright` module
- Mock `Browser`, `Page`, `Context` objects
- Mock navigation, selectors, screenshots

### File System Mocks
- Mock `fs` operations
- Mock config file reads
- Mock package.json reads

### External Command Mocks
- Mock `/thomas-fix` execution
- Mock `gh` CLI commands
- Mock Lighthouse execution

### Network Mocks
- Mock HTTP requests
- Mock page navigation
- Mock script loading

---

## Coverage Requirements

### Statements: 100%
- Every line of code must be executed
- All branches must be covered

### Branches: 100%
- All if/else conditions tested
- All switch cases covered
- All ternary operators tested

### Functions: 100%
- Every function called at least once
- All parameters tested

### Lines: 100%
- Every line executed
- No dead code

---

## Testing Phases

### Phase 1: Critical Path (Priority: High)
**Files**: orchestrator.js, discovery.js, customer-journeys.js, autofix.js, reporting.js

**Goal**: 80% overall coverage

**Estimated Time**: 4-6 hours

### Phase 2: Core Features (Priority: Medium)
**Files**: screen-flow.js, code-quality.js, github-integration.js, performance-accessibility.js, security-analytics.js, visual-interaction.js

**Goal**: 95% overall coverage

**Estimated Time**: 6-8 hours

### Phase 3: Edge Cases (Priority: High)
**All Files**: Add edge case tests for error handling

**Goal**: 98% overall coverage

**Estimated Time**: 2-4 hours

### Phase 4: Complete Coverage (Priority: High)
**All Files**: Cover remaining lines, branches

**Goal**: 100% coverage

**Estimated Time**: 2-4 hours

---

## Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch

# UI mode
npm run test:ui

# Specific test file
npm test tests/unit/orchestrator.test.js
```

---

## Coverage Reports

After running `npm run test:coverage`:

```bash
# View HTML report
open coverage/index.html

# View console output
cat coverage/coverage-summary.json

# Check thresholds
# Vitest will fail if any threshold < 100%
```

---

## Continuous Integration

Add to CI/CD pipeline:

```yaml
- name: Run Tests
  run: npm test

- name: Check Coverage
  run: npm run test:coverage

- name: Upload Coverage
  uses: codecov/codecov-action@v3
  with:
    file: ./coverage/lcov.info
```

---

## Success Criteria

✅ All tests passing
✅ 100% statement coverage
✅ 100% branch coverage
✅ 100% function coverage
✅ 100% line coverage
✅ No skipped tests
✅ No ignored files
✅ Coverage report generated
✅ CI/CD integration

---

## Next Steps

1. Create mock helpers (browser, page, fs)
2. Implement Phase 1 tests (critical path)
3. Implement Phase 2 tests (core features)
4. Implement Phase 3 tests (edge cases)
5. Achieve 100% coverage
6. Document testing patterns
7. Release v3.3.0 with tests

---

**Target Release**: v3.3.0
**Focus**: 100% Test Coverage
**Estimated Completion**: 14-22 hours of development

**Made with 🤖 by Thomas - Testing the tester since 2025**
