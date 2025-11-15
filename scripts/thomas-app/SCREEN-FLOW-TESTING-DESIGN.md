# Screen Flow Testing - World-Class Design Document

## Executive Summary

This document outlines a comprehensive, world-class solution for screen flow testing in thomas-app. The solution combines **state machine modeling**, **comprehensive interaction coverage**, **intelligent flow mapping**, and **accessibility-first testing** to create the most thorough automated testing system possible.

**Goal**: Test every function on every screen with every interaction type (keyboard, mouse, touch, voice, scroll, zoom, gestures) and automatically generate a complete flow map of the application.

---

## 🌍 World-Class Solutions Research

### Top Solutions Identified

1. **Playwright + State Machine Testing** ⭐⭐⭐⭐⭐
   - Coverage: All-States, All-Transitions, All-Paths
   - Supports: Keyboard, mouse, touch, gestures, scroll, zoom
   - AI-Powered: Playwright Agents (Planner, Generator, Healer)
   - Tracing: Full timeline with DOM snapshots, network logs, video
   - **Best for**: Comprehensive interaction testing with flow visualization

2. **Crawlee + Apify** ⭐⭐⭐⭐
   - Automatic crawling and discovery
   - Screenshot capture across all pages
   - Proxy rotation and anti-blocking
   - **Best for**: Large-scale site discovery and mapping

3. **VisualSitemaps + PowerMapper** ⭐⭐⭐⭐
   - Automatic visual sitemap generation
   - Screenshot capture for every page
   - Flow diagram export
   - **Best for**: Static flow visualization

4. **GraphWalker** ⭐⭐⭐
   - State machine test generation
   - Coverage-based test selection
   - **Best for**: Model-based testing

### Recommended Solution: **Hybrid Approach**

Combine:
- **Playwright** for interaction testing and recording
- **State machine modeling** for comprehensive coverage
- **Crawlee** for discovery and crawling
- **Custom flow mapper** for visualization

---

## 🎯 Comprehensive Interaction Testing Strategy

### Interaction Types to Test

#### 1. **Keyboard Interactions** ✅
```javascript
const keyboardInteractions = [
  // Navigation
  { key: 'Tab', description: 'Tab navigation forward' },
  { key: 'Shift+Tab', description: 'Tab navigation backward' },
  { key: 'Enter', description: 'Activate focused element' },
  { key: 'Space', description: 'Activate buttons/checkboxes' },
  { key: 'Escape', description: 'Close modals/dialogs' },

  // Arrow keys
  { key: 'ArrowUp', description: 'Navigate up in lists/menus' },
  { key: 'ArrowDown', description: 'Navigate down in lists/menus' },
  { key: 'ArrowLeft', description: 'Navigate left in sliders/tabs' },
  { key: 'ArrowRight', description: 'Navigate right in sliders/tabs' },

  // Modifiers
  { key: 'Control+A', description: 'Select all text' },
  { key: 'Control+C', description: 'Copy selected text' },
  { key: 'Control+V', description: 'Paste text' },

  // Accessibility shortcuts
  { key: 'Alt+Home', description: 'Jump to main content' },
  { key: 'Alt+S', description: 'Skip navigation' }
];
```

#### 2. **Mouse Interactions** ✅
```javascript
const mouseInteractions = [
  { action: 'click', description: 'Standard click' },
  { action: 'dblclick', description: 'Double click' },
  { action: 'contextmenu', description: 'Right click' },
  { action: 'hover', description: 'Hover state' },
  { action: 'mousedown', description: 'Mouse button press' },
  { action: 'mouseup', description: 'Mouse button release' },
  { action: 'mousemove', description: 'Mouse movement' },
  { action: 'mouseenter', description: 'Mouse enters element' },
  { action: 'mouseleave', description: 'Mouse leaves element' },
  { action: 'wheel', description: 'Scroll wheel' },
  { action: 'drag', description: 'Drag operation' },
  { action: 'drop', description: 'Drop operation' }
];
```

#### 3. **Touch Interactions** ✅
```javascript
const touchInteractions = [
  { gesture: 'tap', description: 'Single tap', fingers: 1 },
  { gesture: 'doubleTap', description: 'Double tap', fingers: 1 },
  { gesture: 'longPress', description: 'Long press (500ms+)', fingers: 1, duration: 500 },
  { gesture: 'swipeUp', description: 'Swipe up', fingers: 1, direction: 'up' },
  { gesture: 'swipeDown', description: 'Swipe down', fingers: 1, direction: 'down' },
  { gesture: 'swipeLeft', description: 'Swipe left', fingers: 1, direction: 'left' },
  { gesture: 'swipeRight', description: 'Swipe right', fingers: 1, direction: 'right' },
  { gesture: 'pinchIn', description: 'Pinch to zoom out', fingers: 2 },
  { gesture: 'pinchOut', description: 'Pinch to zoom in', fingers: 2 },
  { gesture: 'rotate', description: 'Two-finger rotation', fingers: 2 },
  { gesture: 'twoFingerScroll', description: 'Two-finger scroll', fingers: 2 },
  { gesture: 'threeFingerSwipe', description: 'Three-finger swipe (navigation)', fingers: 3 }
];
```

#### 4. **Scroll Interactions** ✅
```javascript
const scrollInteractions = [
  { type: 'wheel', description: 'Mouse wheel scroll' },
  { type: 'twoFingerScroll', description: 'Trackpad two-finger scroll' },
  { type: 'touchScroll', description: 'Touch drag scroll' },
  { type: 'keyboardScroll', description: 'Page Up/Down, Arrow keys' },
  { type: 'scrollbar', description: 'Scrollbar drag' },
  { type: 'programmatic', description: 'JavaScript scrollTo/scrollIntoView' },
  { type: 'smoothScroll', description: 'Smooth scroll behavior' },
  { type: 'snapScroll', description: 'Scroll snap points' },
  { type: 'infiniteScroll', description: 'Lazy loading on scroll' }
];
```

#### 5. **Zoom Interactions** ✅
```javascript
const zoomInteractions = [
  { type: 'pinchZoom', description: 'Pinch to zoom (mobile)', range: [0.5, 3.0] },
  { type: 'ctrlWheel', description: 'Ctrl + Mouse wheel zoom', range: [0.5, 2.0] },
  { type: 'ctrlPlus', description: 'Ctrl + Plus key', levels: [110, 125, 150, 200] },
  { type: 'ctrlMinus', description: 'Ctrl - Minus key', levels: [90, 75, 50] },
  { type: 'browserZoom', description: 'Browser zoom menu', levels: [50, 75, 100, 125, 150, 200] },
  { type: 'textOnlyZoom', description: 'Text-only zoom (Firefox)' }
];
```

#### 6. **Form Input Interactions** ✅
```javascript
const formInteractions = [
  { type: 'textInput', inputs: ['normal text', 'special chars !@#$%', 'unicode 你好', 'emoji 🚀'] },
  { type: 'numberInput', inputs: ['123', '-456', '0.5', '1e10'] },
  { type: 'dateInput', inputs: ['2025-01-15', 'invalid', '9999-12-31'] },
  { type: 'select', actions: ['select by value', 'select by text', 'select by keyboard'] },
  { type: 'checkbox', actions: ['check', 'uncheck', 'indeterminate'] },
  { type: 'radio', actions: ['select first', 'select last', 'arrow key navigation'] },
  { type: 'file', inputs: ['single file', 'multiple files', 'drag & drop'] },
  { type: 'autocomplete', actions: ['type and select', 'keyboard navigation', 'clear'] },
  { type: 'colorPicker', actions: ['select color', 'input hex', 'input RGB'] },
  { type: 'rangeSlider', actions: ['drag handle', 'click track', 'arrow keys', 'page up/down'] }
];
```

#### 7. **Voice/Speech Interactions** ⚠️ (Future)
```javascript
const voiceInteractions = [
  { type: 'voiceInput', description: 'Speech-to-text input' },
  { type: 'voiceCommands', description: 'Voice navigation commands' },
  { type: 'screenReader', description: 'Screen reader simulation (NVDA/JAWS)' }
];
```

---

## 🗺️ Screen Flow Mapping System

### State Machine Model

Each screen is a **state**, each interaction is a **transition**.

```javascript
const StateMachine = {
  states: [
    {
      id: 'home',
      url: '/',
      screenshot: '/tmp/flow/home.png',
      elements: [...],
      interactions: [...]
    },
    {
      id: 'login',
      url: '/login',
      screenshot: '/tmp/flow/login.png',
      elements: [...],
      interactions: [...]
    }
  ],

  transitions: [
    {
      from: 'home',
      to: 'login',
      trigger: { type: 'click', selector: '#login-button' },
      expectedDuration: 500
    }
  ],

  paths: [
    { name: 'User Login Flow', steps: ['home', 'login', 'dashboard'] },
    { name: 'Checkout Flow', steps: ['home', 'product', 'cart', 'checkout', 'success'] }
  ]
};
```

### Coverage Metrics

#### **All-States Coverage** ✅
- Visit every unique screen/state at least once
- Capture screenshot for each state
- Detect duplicate states (same URL + same DOM structure)

#### **All-Transitions Coverage** ✅
- Test every link, button, form submission
- Test every navigation method (click, keyboard, touch)
- Verify expected destination

#### **All-Paths Coverage** ⚠️ (Selective)
- Test critical user journeys end-to-end
- Test common paths (90% of user traffic)
- Avoid infinite loops (max depth limit)

### Flow Map Visualization

Generate multiple output formats:

```javascript
const flowMapOutputs = {
  // 1. JSON (machine-readable)
  json: {
    format: 'state-machine.json',
    schema: 'StateMachine schema above'
  },

  // 2. Mermaid Diagram (human-readable)
  mermaid: {
    format: 'flow-diagram.mmd',
    example: `
      graph LR
        Home --> Login
        Home --> Products
        Login --> Dashboard
        Products --> ProductDetail
        ProductDetail --> Cart
        Cart --> Checkout
        Checkout --> Success
    `
  },

  // 3. HTML Interactive Map
  html: {
    format: 'flow-map.html',
    features: [
      'Click to zoom to screenshot',
      'Hover to see transition details',
      'Filter by element type',
      'Search for screens'
    ]
  },

  // 4. DOT Graph (Graphviz)
  dot: {
    format: 'flow-diagram.dot',
    features: ['Hierarchical layout', 'Export to SVG/PNG']
  }
};
```

---

## 🏗️ Implementation Architecture

### Phase Structure

```
Phase 3.5: Screen Flow & Comprehensive Interaction Testing
├── 1. Discovery & Crawling (Crawlee)
│   ├── Find all pages/screens
│   ├── Build URL graph
│   └── Detect dynamic routes
│
├── 2. State Modeling
│   ├── Create state for each unique screen
│   ├── Identify interactive elements
│   └── Map transitions
│
├── 3. Comprehensive Interaction Testing
│   ├── Keyboard testing (Tab, Enter, Arrow keys)
│   ├── Mouse testing (Click, Hover, Drag)
│   ├── Touch testing (Tap, Swipe, Pinch, Rotate)
│   ├── Scroll testing (Wheel, Touch, Keyboard)
│   ├── Zoom testing (Pinch, Ctrl+Wheel)
│   └── Form input testing (Text, Select, Checkbox, etc.)
│
├── 4. Flow Recording & Mapping
│   ├── Record all transitions
│   ├── Capture screenshots for each state
│   ├── Measure transition performance
│   └── Detect dead ends & loops
│
└── 5. Flow Visualization
    ├── Generate JSON state machine
    ├── Generate Mermaid diagram
    ├── Generate interactive HTML map
    └── Export to DOT/SVG
```

### Technology Stack

```javascript
const techStack = {
  // Discovery & Crawling
  crawler: 'Crawlee (Playwright integration)',

  // Interaction Testing
  automation: 'Playwright',
  gestures: 'Playwright touch API + custom gesture library',

  // State Modeling
  stateTracking: 'Custom state machine implementation',
  deduplication: 'URL + DOM hash comparison',

  // Flow Mapping
  graphing: 'Mermaid.js + Graphviz DOT',
  visualization: 'D3.js for interactive HTML map',

  // Reporting
  screenshots: 'Playwright screenshot API',
  tracing: 'Playwright trace viewer',
  metrics: 'Custom coverage calculator'
};
```

---

## 📊 Coverage Calculation

### Interaction Coverage Formula

```javascript
function calculateInteractionCoverage(results) {
  const totalInteractionTypes =
    keyboardInteractions.length +
    mouseInteractions.length +
    touchInteractions.length +
    scrollInteractions.length +
    zoomInteractions.length +
    formInteractions.length;

  const testedInteractions = results.interactionsTested.length;

  const coverage = {
    // Element coverage
    elementCoverage: results.elementsTested / results.totalElements,

    // Interaction type coverage
    interactionTypeCoverage: testedInteractions / totalInteractionTypes,

    // State coverage
    stateCoverage: results.statesVisited / results.totalStates,

    // Transition coverage
    transitionCoverage: results.transitionsExecuted / results.totalTransitions,

    // Path coverage
    pathCoverage: results.criticalPathsTested / results.totalCriticalPaths,

    // Overall score (weighted)
    overall: (
      elementCoverage * 0.25 +
      interactionTypeCoverage * 0.20 +
      stateCoverage * 0.20 +
      transitionCoverage * 0.20 +
      pathCoverage * 0.15
    ) * 100
  };

  return coverage;
}
```

### Quality Metrics

```javascript
const qualityMetrics = {
  // Performance
  averageTransitionTime: 'avg(transition.duration)',
  slowTransitions: 'transitions where duration > 1000ms',

  // Accessibility
  keyboardAccessibleElements: 'elements with tab index and keyboard handlers',
  focusIndicatorCoverage: 'elements with visible :focus styles',
  touchTargetCompliance: 'elements >= 44x44px',

  // Robustness
  brokenLinks: 'transitions that result in 404',
  deadEnds: 'states with no outgoing transitions',
  loops: 'circular transition paths',

  // User Experience
  expectedDestinations: 'transitions that reach expected state',
  unexpectedPopups: 'transitions that trigger unexpected modals/alerts',
  scrollJank: 'scroll events with frame drops'
};
```

---

## 🎮 Real-World Example: Testing a Form

### Complete Test Coverage for a Login Form

```javascript
async function testLoginFormComprehensively(page) {
  const results = {
    interactions: [],
    transitions: [],
    issues: []
  };

  // 1. Keyboard Testing
  await page.keyboard.press('Tab'); // Focus username
  await page.keyboard.type('user@example.com');
  await page.keyboard.press('Tab'); // Focus password
  await page.keyboard.type('password123');
  await page.keyboard.press('Enter'); // Submit
  results.interactions.push({ type: 'keyboard', success: true });

  // 2. Mouse Testing
  await page.goto('/login');
  await page.click('#username');
  await page.fill('#username', 'user@example.com');
  await page.click('#password');
  await page.fill('#password', 'password123');
  await page.hover('#submit-button'); // Check hover state
  await page.click('#submit-button');
  results.interactions.push({ type: 'mouse', success: true });

  // 3. Touch Testing (mobile viewport)
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/login');
  await page.tap('#username');
  await page.fill('#username', 'user@example.com');
  await page.tap('#password');
  await page.fill('#password', 'password123');
  await page.tap('#submit-button');
  results.interactions.push({ type: 'touch', success: true });

  // 4. Scroll Testing
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.mouse.wheel(0, -100); // Scroll up
  results.interactions.push({ type: 'scroll', success: true });

  // 5. Zoom Testing
  await page.setViewportSize({ width: 375, height: 667 });
  // Simulate pinch zoom (custom implementation needed)
  await simulatePinchZoom(page, { scale: 2.0 });
  const inputVisible = await page.locator('#username').isVisible();
  results.interactions.push({
    type: 'zoom',
    success: inputVisible,
    issue: !inputVisible ? 'Form broken at 2x zoom' : null
  });

  // 6. Form Input Validation Testing
  const inputTests = [
    { field: 'username', value: '', expected: 'error' },
    { field: 'username', value: 'invalid-email', expected: 'error' },
    { field: 'username', value: 'user@example.com', expected: 'valid' },
    { field: 'password', value: '', expected: 'error' },
    { field: 'password', value: '123', expected: 'error' }, // Too short
    { field: 'password', value: 'ValidPass123!', expected: 'valid' }
  ];

  for (const test of inputTests) {
    await page.goto('/login');
    await page.fill(`#${test.field}`, test.value);
    await page.click('#submit-button');

    const hasError = await page.locator('.error-message').isVisible();
    const actual = hasError ? 'error' : 'valid';

    results.interactions.push({
      type: 'form-validation',
      field: test.field,
      value: test.value,
      expected: test.expected,
      actual: actual,
      success: actual === test.expected
    });
  }

  // 7. Accessibility Testing
  await page.goto('/login');

  // Tab order test
  const tabOrder = [];
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press('Tab');
    const focusedElement = await page.evaluate(() => {
      const el = document.activeElement;
      return {
        tag: el.tagName,
        id: el.id,
        name: el.name,
        hasFocusIndicator: getComputedStyle(el).outline !== 'none'
      };
    });
    tabOrder.push(focusedElement);
  }

  const expectedTabOrder = ['username', 'password', 'submit-button', 'forgot-password', 'signup-link'];
  const correctTabOrder = tabOrder.every((el, i) => el.id === expectedTabOrder[i]);

  if (!correctTabOrder) {
    results.issues.push({
      type: 'accessibility',
      severity: 'high',
      message: 'Tab order is incorrect',
      expected: expectedTabOrder,
      actual: tabOrder.map(el => el.id)
    });
  }

  // 8. Screen Reader Testing (simulated)
  const ariaLabels = await page.evaluate(() => {
    return {
      username: document.querySelector('#username')?.getAttribute('aria-label'),
      password: document.querySelector('#password')?.getAttribute('aria-label'),
      submit: document.querySelector('#submit-button')?.getAttribute('aria-label')
    };
  });

  if (!ariaLabels.username || !ariaLabels.password) {
    results.issues.push({
      type: 'accessibility',
      severity: 'critical',
      message: 'Missing aria-labels for screen readers',
      missingLabels: Object.entries(ariaLabels)
        .filter(([_, label]) => !label)
        .map(([field, _]) => field)
    });
  }

  return results;
}
```

---

## 🚀 Recommended Implementation Plan

### MVP (v3.2) - 2-3 days
- ✅ **Enhanced Discovery Phase**: Use Crawlee to discover all pages
- ✅ **State Tracking**: Build state machine model during testing
- ✅ **Keyboard Testing**: Comprehensive Tab/Enter/Arrow key testing
- ✅ **Basic Flow Map**: Generate JSON state machine + Mermaid diagram

### v3.3 - 1 week
- ✅ **Mouse Interaction Testing**: Click, hover, drag, context menu
- ✅ **Touch Gesture Testing**: Tap, swipe, pinch, rotate (mobile viewports)
- ✅ **Scroll Testing**: Wheel, touch scroll, keyboard scroll
- ✅ **Interactive HTML Flow Map**: D3.js visualization with screenshots

### v3.4 - 1-2 weeks
- ✅ **Zoom Testing**: Pinch zoom, browser zoom, text-only zoom
- ✅ **Form Input Testing**: All input types with edge cases
- ✅ **Advanced Coverage Metrics**: All-States, All-Transitions, All-Paths
- ✅ **Playwright Trace Integration**: Full timeline with DOM snapshots

### v3.5 - Future
- ⏳ **Voice/Speech Testing**: Screen reader simulation (NVDA/JAWS via APIs)
- ⏳ **Visual Regression**: Pixel-by-pixel comparison with baselines
- ⏳ **AI-Powered Test Generation**: Playwright Agents integration
- ⏳ **Performance Profiling**: Frame rate, jank detection during interactions

---

## 📝 Configuration Example

```json
{
  "screenFlowTesting": {
    "enabled": true,
    "modes": ["quick", "standard", "comprehensive"],

    "discovery": {
      "maxDepth": 5,
      "maxPages": 100,
      "followExternalLinks": false,
      "respectRobotsTxt": true
    },

    "interactions": {
      "keyboard": true,
      "mouse": true,
      "touch": true,
      "scroll": true,
      "zoom": true,
      "forms": true,
      "voice": false
    },

    "coverage": {
      "allStates": true,
      "allTransitions": true,
      "allPaths": false,
      "criticalPathsOnly": true
    },

    "flowMap": {
      "formats": ["json", "mermaid", "html", "dot"],
      "includeScreenshots": true,
      "includeMetrics": true,
      "interactive": true
    },

    "performance": {
      "maxTransitionTime": 1000,
      "maxScrollJank": 16,
      "minFrameRate": 30
    }
  }
}
```

---

## 🏆 Expected Outcomes

### Comprehensive Coverage
- **100% State Coverage**: Every screen visited and tested
- **95%+ Transition Coverage**: Nearly all clickable elements tested
- **90%+ Interaction Coverage**: All interaction types tested
- **100% Critical Path Coverage**: All user journeys validated

### Flow Map Benefits
- **Visual Understanding**: See entire application structure at a glance
- **Dead End Detection**: Find screens with no exit paths
- **Loop Detection**: Identify infinite navigation loops
- **Performance Bottlenecks**: See slow transitions highlighted
- **Accessibility Issues**: Focus indicator coverage visualized

### Quality Improvements
- **Keyboard Navigation**: 100% keyboard accessible
- **Touch Targets**: All buttons/links meet 44x44px minimum
- **Zoom Compatibility**: Works at 200% zoom
- **Screen Reader Ready**: All elements have proper ARIA labels
- **Performance Optimized**: All transitions < 100ms

---

## 🎓 References

### Industry Standards
- **WCAG 2.1/2.2**: Accessibility guidelines for touch targets, keyboard navigation
- **W3C Pointer Events**: Specification for touch/mouse/pen events
- **Model-Based Testing**: State machine coverage criteria
- **BrowserStack**: Mobile gesture testing best practices

### Tools & Libraries
- **Playwright**: https://playwright.dev/
- **Crawlee**: https://crawlee.dev/
- **GraphWalker**: https://graphwalker.github.io/
- **Mermaid.js**: https://mermaid.js.org/
- **D3.js**: https://d3js.org/

### Research Papers
- "Projected state machine coverage for software testing" (ResearchGate)
- "ScrollTest: Evaluating Scrolling Speed and Accuracy" (arXiv)
- "Model-Based Testing Using State Machines" (Abstracta)

---

**Document Version**: 1.0
**Created**: 2025-11-15
**Author**: Claude (Thomas-App Enhancement)
**Status**: Design Complete - Ready for Implementation
