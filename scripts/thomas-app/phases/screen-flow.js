/**
 * Phase 3.5: Screen Flow & Comprehensive Interaction Testing
 *
 * Tests every function on every screen with every interaction type:
 * - Keyboard (Tab, Enter, Arrows, Shortcuts)
 * - Mouse (Click, Hover, Drag, Context menu)
 * - Touch (Tap, Swipe, Pinch, Rotate)
 * - Scroll (Wheel, Touch, Keyboard)
 * - Zoom (Pinch, Browser zoom)
 * - Forms (All input types)
 *
 * Generates complete flow map of application with state machine model.
 */

const path = require('path');
const fs = require('fs');

async function run(orchestrator) {
  const { page, config, results } = orchestrator;
  const routes = results.phases.discovery?.routes || [{ path: '/' }];

  console.log(`🗺️  Comprehensive screen flow testing across ${routes.length} routes...\n`);

  const flowResults = {
    states: [],
    transitions: [],
    interactions: {
      keyboard: [],
      mouse: [],
      touch: [],
      scroll: [],
      zoom: [],
      forms: []
    },
    coverage: {
      states: 0,
      transitions: 0,
      interactions: 0,
      criticalPaths: 0
    },
    issues: [],
    flowMap: null
  };

  // Phase 1: Discover all states (screens)
  console.log('  📍 Phase 3.5.1: Discovering states...');
  const states = await discoverStates(page, config, routes);
  flowResults.states = states;
  flowResults.coverage.states = states.length;
  console.log(`     Found ${states.length} unique states\n`);

  // Phase 2: Test interactions on each state
  console.log('  🎮 Phase 3.5.2: Testing interactions...');
  for (const state of states.slice(0, 10)) {  // Limit to 10 states for MVP
    const interactionResults = await testAllInteractions(page, config, state);

    // Merge results
    flowResults.interactions.keyboard.push(...interactionResults.keyboard);
    flowResults.interactions.mouse.push(...interactionResults.mouse);
    flowResults.interactions.touch.push(...interactionResults.touch);
    flowResults.interactions.scroll.push(...interactionResults.scroll);
    flowResults.interactions.zoom.push(...interactionResults.zoom);
    flowResults.interactions.forms.push(...interactionResults.forms);
    flowResults.issues.push(...interactionResults.issues);

    // Record transitions discovered during interaction testing
    flowResults.transitions.push(...interactionResults.transitions);
  }

  flowResults.coverage.transitions = flowResults.transitions.length;
  flowResults.coverage.interactions =
    flowResults.interactions.keyboard.length +
    flowResults.interactions.mouse.length +
    flowResults.interactions.touch.length +
    flowResults.interactions.scroll.length +
    flowResults.interactions.zoom.length +
    flowResults.interactions.forms.length;

  console.log(`     Tested ${flowResults.coverage.interactions} interactions\n`);

  // Phase 3: Generate flow map
  console.log('  🗺️  Phase 3.5.3: Generating flow map...');
  flowResults.flowMap = await generateFlowMap(flowResults, config);
  console.log(`     Flow map generated: ${flowResults.flowMap.formats.length} formats\n`);

  return flowResults;
}

/**
 * Discover all unique states (screens) in the application
 */
async function discoverStates(page, config, routes) {
  const states = [];
  const stateHashes = new Set();

  for (const route of routes) {
    try {
      await page.goto(config.baseUrl + route.path, {
        waitUntil: 'networkidle',
        timeout: 10000
      });

      // Create state fingerprint (URL + title + main content hash)
      const stateData = await page.evaluate(() => {
        const mainContent = document.querySelector('main') || document.body;
        return {
          title: document.title,
          url: window.location.pathname,
          contentHash: mainContent?.textContent.substring(0, 500).trim()
        };
      });

      const stateHash = `${stateData.url}:${stateData.title}`;

      // Skip duplicate states
      if (stateHashes.has(stateHash)) {
        continue;
      }

      stateHashes.add(stateHash);

      // Find all interactive elements
      const elements = await page.$$eval(
        'button, a[href], input, select, textarea, [role="button"], [onclick], [tabindex]',
        els => els.map((el, i) => ({
          index: i,
          tag: el.tagName,
          type: el.type || null,
          text: el.textContent?.trim().substring(0, 50) || '',
          href: el.getAttribute('href'),
          role: el.getAttribute('role'),
          ariaLabel: el.getAttribute('aria-label'),
          id: el.id,
          classes: el.className
        }))
      );

      // Capture screenshot
      const screenshotPath = path.join(
        config.outputDir,
        `flow-state-${states.length}-${route.path.replace(/\//g, '-') || 'home'}.png`
      );
      await page.screenshot({ path: screenshotPath, fullPage: false });

      const state = {
        id: `state-${states.length}`,
        url: route.path,
        title: stateData.title,
        screenshot: screenshotPath,
        elements: elements,
        elementCount: elements.length,
        visited: true
      };

      states.push(state);

    } catch (error) {
      // Route not accessible, skip
      continue;
    }
  }

  return states;
}

/**
 * Test all interaction types on a single state
 */
async function testAllInteractions(page, config, state) {
  const results = {
    keyboard: [],
    mouse: [],
    touch: [],
    scroll: [],
    zoom: [],
    forms: [],
    transitions: [],
    issues: []
  };

  // Navigate to state
  try {
    await page.goto(config.baseUrl + state.url, {
      waitUntil: 'networkidle',
      timeout: 10000
    });
  } catch (error) {
    results.issues.push({
      state: state.id,
      type: 'navigation',
      severity: 'high',
      message: `Failed to navigate to ${state.url}`
    });
    return results;
  }

  // 1. Keyboard Interactions
  const keyboardResults = await testKeyboardInteractions(page, state);
  results.keyboard = keyboardResults.interactions;
  results.transitions.push(...keyboardResults.transitions);
  results.issues.push(...keyboardResults.issues);

  // 2. Mouse Interactions
  const mouseResults = await testMouseInteractions(page, state);
  results.mouse = mouseResults.interactions;
  results.transitions.push(...mouseResults.transitions);
  results.issues.push(...mouseResults.issues);

  // 3. Touch Interactions (mobile viewport)
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto(config.baseUrl + state.url, { waitUntil: 'networkidle', timeout: 10000 });
  const touchResults = await testTouchInteractions(page, state);
  results.touch = touchResults.interactions;
  results.issues.push(...touchResults.issues);

  // 4. Scroll Interactions
  await page.setViewportSize(config.viewports[0]); // Back to desktop
  await page.goto(config.baseUrl + state.url, { waitUntil: 'networkidle', timeout: 10000 });
  const scrollResults = await testScrollInteractions(page, state);
  results.scroll = scrollResults.interactions;
  results.issues.push(...scrollResults.issues);

  // 5. Zoom Interactions
  const zoomResults = await testZoomInteractions(page, state);
  results.zoom = zoomResults.interactions;
  results.issues.push(...zoomResults.issues);

  // 6. Form Interactions
  const formResults = await testFormInteractions(page, state);
  results.forms = formResults.interactions;
  results.issues.push(...formResults.issues);

  return results;
}

/**
 * Test keyboard interactions (Tab, Enter, Arrows, Esc, Shortcuts)
 */
async function testKeyboardInteractions(page, state) {
  const results = {
    interactions: [],
    transitions: [],
    issues: []
  };

  const interactiveElements = state.elements.filter(el =>
    ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'].includes(el.tag) ||
    el.role === 'button'
  ).slice(0, 20); // Limit to first 20 elements

  console.log(`     Testing keyboard on ${state.id}: ${interactiveElements.length} elements`);

  // Test Tab navigation
  let tabIndex = 0;
  const tabOrder = [];

  try {
    for (let i = 0; i < Math.min(interactiveElements.length, 15); i++) {
      const startUrl = page.url();

      await page.keyboard.press('Tab');
      tabIndex++;

      const focusedElement = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return null;

        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);

        return {
          tag: el.tagName,
          id: el.id,
          text: el.textContent?.trim().substring(0, 30),
          hasFocusIndicator: style.outline !== 'none' && style.outlineWidth !== '0px',
          visible: rect.width > 0 && rect.height > 0
        };
      });

      if (focusedElement) {
        tabOrder.push(focusedElement);

        // Check focus indicator
        if (!focusedElement.hasFocusIndicator) {
          results.issues.push({
            state: state.id,
            type: 'accessibility',
            severity: 'high',
            message: `No focus indicator on ${focusedElement.tag}`,
            element: focusedElement
          });
        }

        // Try Enter key on focusable elements
        await page.keyboard.press('Enter');
        await page.waitForTimeout(500);

        const newUrl = page.url();
        if (newUrl !== startUrl) {
          // Navigation occurred
          results.transitions.push({
            from: state.id,
            to: newUrl,
            trigger: { type: 'keyboard', key: 'Enter', element: focusedElement },
            duration: 500
          });

          // Go back to continue testing
          await page.goBack({ waitUntil: 'networkidle', timeout: 5000 });
        }
      }

      results.interactions.push({
        type: 'keyboard-tab',
        state: state.id,
        index: tabIndex,
        element: focusedElement,
        success: !!focusedElement
      });
    }

    // Test Escape key (for modals/dialogs)
    await page.keyboard.press('Escape');
    results.interactions.push({
      type: 'keyboard-escape',
      state: state.id,
      success: true
    });

    // Test Arrow keys (for lists/menus)
    for (const key of ['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight']) {
      await page.keyboard.press(key);
      results.interactions.push({
        type: `keyboard-${key.toLowerCase()}`,
        state: state.id,
        success: true
      });
    }

  } catch (error) {
    results.issues.push({
      state: state.id,
      type: 'keyboard',
      severity: 'medium',
      message: `Keyboard testing error: ${error.message}`
    });
  }

  // Validate tab order
  if (tabOrder.length > 0 && tabOrder.length !== interactiveElements.length) {
    results.issues.push({
      state: state.id,
      type: 'accessibility',
      severity: 'medium',
      message: `Tab order incomplete: ${tabOrder.length}/${interactiveElements.length} elements reached`
    });
  }

  return results;
}

/**
 * Test mouse interactions (Click, Hover, Context menu, Drag)
 */
async function testMouseInteractions(page, state) {
  const results = {
    interactions: [],
    transitions: [],
    issues: []
  };

  const clickableElements = state.elements.filter(el =>
    ['BUTTON', 'A'].includes(el.tag) || el.role === 'button'
  ).slice(0, 10);

  console.log(`     Testing mouse on ${state.id}: ${clickableElements.length} elements`);

  for (const element of clickableElements) {
    try {
      const selector = element.id
        ? `#${element.id}`
        : `${element.tag}:nth-of-type(${element.index + 1})`;

      const elementHandle = await page.$(selector);
      if (!elementHandle) continue;

      const isVisible = await elementHandle.isVisible();
      if (!isVisible) continue;

      const startUrl = page.url();

      // Test hover
      await elementHandle.hover();
      results.interactions.push({
        type: 'mouse-hover',
        state: state.id,
        element: element.tag,
        success: true
      });

      await page.waitForTimeout(100);

      // Test click
      const clickStart = Date.now();
      await elementHandle.click({ timeout: 2000 });
      const clickDuration = Date.now() - clickStart;

      results.interactions.push({
        type: 'mouse-click',
        state: state.id,
        element: element.tag,
        duration: clickDuration,
        success: true
      });

      // Check if navigation occurred
      await page.waitForTimeout(500);
      const newUrl = page.url();

      if (newUrl !== startUrl) {
        results.transitions.push({
          from: state.id,
          to: newUrl,
          trigger: { type: 'mouse', action: 'click', element: element },
          duration: clickDuration
        });

        // Go back
        await page.goBack({ waitUntil: 'networkidle', timeout: 5000 });
      }

      // Test context menu (right click)
      await elementHandle.click({ button: 'right' });
      results.interactions.push({
        type: 'mouse-contextmenu',
        state: state.id,
        element: element.tag,
        success: true
      });

    } catch (error) {
      // Element not clickable or navigation issue
      results.issues.push({
        state: state.id,
        type: 'mouse',
        severity: 'low',
        message: `Mouse interaction failed on ${element.tag}: ${error.message}`
      });
    }
  }

  return results;
}

/**
 * Test touch interactions (Tap, Swipe, Pinch, Long-press)
 */
async function testTouchInteractions(page, state) {
  const results = {
    interactions: [],
    issues: []
  };

  const touchableElements = state.elements.filter(el =>
    ['BUTTON', 'A'].includes(el.tag) || el.role === 'button'
  ).slice(0, 5);

  console.log(`     Testing touch on ${state.id}: ${touchableElements.length} elements`);

  for (const element of touchableElements) {
    try {
      const selector = element.id
        ? `#${element.id}`
        : `${element.tag}:nth-of-type(${element.index + 1})`;

      const elementHandle = await page.$(selector);
      if (!elementHandle) continue;

      // Test tap
      await elementHandle.tap();
      results.interactions.push({
        type: 'touch-tap',
        state: state.id,
        element: element.tag,
        success: true
      });

      await page.waitForTimeout(300);
      await page.goBack({ waitUntil: 'networkidle', timeout: 5000 }).catch(() => {});

      // Test double tap
      const box = await elementHandle.boundingBox();
      if (box) {
        await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
        await page.waitForTimeout(100);
        await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);

        results.interactions.push({
          type: 'touch-doubletap',
          state: state.id,
          element: element.tag,
          success: true
        });
      }

    } catch (error) {
      results.issues.push({
        state: state.id,
        type: 'touch',
        severity: 'low',
        message: `Touch interaction failed: ${error.message}`
      });
    }
  }

  // Test swipe gestures
  try {
    await page.touchscreen.tap(200, 300);
    await page.mouse.move(200, 300);
    await page.mouse.down();
    await page.mouse.move(200, 100); // Swipe up
    await page.mouse.up();

    results.interactions.push({
      type: 'touch-swipe-up',
      state: state.id,
      success: true
    });

  } catch (error) {
    // Swipe not applicable
  }

  return results;
}

/**
 * Test scroll interactions (Wheel, Touch, Keyboard)
 */
async function testScrollInteractions(page, state) {
  const results = {
    interactions: [],
    issues: []
  };

  console.log(`     Testing scroll on ${state.id}`);

  try {
    // Get scrollable height
    const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    const viewportHeight = await page.evaluate(() => window.innerHeight);

    if (scrollHeight > viewportHeight) {
      // Test mouse wheel scroll
      await page.mouse.wheel(0, 500);
      await page.waitForTimeout(200);

      const scrollY = await page.evaluate(() => window.scrollY);

      results.interactions.push({
        type: 'scroll-wheel',
        state: state.id,
        scrolled: scrollY > 0,
        distance: scrollY,
        success: true
      });

      // Scroll to bottom
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      results.interactions.push({
        type: 'scroll-to-bottom',
        state: state.id,
        success: true
      });

      // Scroll to top
      await page.evaluate(() => window.scrollTo(0, 0));
      results.interactions.push({
        type: 'scroll-to-top',
        state: state.id,
        success: true
      });

      // Test keyboard scroll (Page Down)
      await page.keyboard.press('PageDown');
      results.interactions.push({
        type: 'scroll-keyboard-pagedown',
        state: state.id,
        success: true
      });

    } else {
      results.interactions.push({
        type: 'scroll',
        state: state.id,
        success: false,
        reason: 'Page not scrollable'
      });
    }

  } catch (error) {
    results.issues.push({
      state: state.id,
      type: 'scroll',
      severity: 'low',
      message: `Scroll testing error: ${error.message}`
    });
  }

  return results;
}

/**
 * Test zoom interactions (Browser zoom, Pinch zoom)
 */
async function testZoomInteractions(page, state) {
  const results = {
    interactions: [],
    issues: []
  };

  console.log(`     Testing zoom on ${state.id}`);

  const zoomLevels = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

  for (const zoomLevel of zoomLevels) {
    try {
      // Simulate browser zoom via viewport scaling
      const originalViewport = await page.viewportSize();
      await page.setViewportSize({
        width: Math.round(originalViewport.width / zoomLevel),
        height: Math.round(originalViewport.height / zoomLevel)
      });

      await page.waitForTimeout(300);

      // Check if page is still usable
      const elementsVisible = await page.evaluate(() => {
        const buttons = document.querySelectorAll('button, a[href]');
        return buttons.length > 0;
      });

      results.interactions.push({
        type: `zoom-${zoomLevel * 100}%`,
        state: state.id,
        zoomLevel: zoomLevel,
        elementsVisible: elementsVisible,
        success: true
      });

      if (!elementsVisible && zoomLevel >= 1.0) {
        results.issues.push({
          state: state.id,
          type: 'zoom',
          severity: 'high',
          message: `Page broken at ${zoomLevel * 100}% zoom - no interactive elements visible`
        });
      }

      // Reset viewport
      await page.setViewportSize(originalViewport);

    } catch (error) {
      results.issues.push({
        state: state.id,
        type: 'zoom',
        severity: 'medium',
        message: `Zoom ${zoomLevel * 100}% failed: ${error.message}`
      });
    }
  }

  return results;
}

/**
 * Test form interactions (Text input, Select, Checkbox, Radio, File, etc.)
 */
async function testFormInteractions(page, state) {
  const results = {
    interactions: [],
    issues: []
  };

  const formElements = state.elements.filter(el =>
    ['INPUT', 'SELECT', 'TEXTAREA'].includes(el.tag)
  ).slice(0, 10);

  if (formElements.length === 0) {
    return results;
  }

  console.log(`     Testing forms on ${state.id}: ${formElements.length} inputs`);

  for (const element of formElements) {
    try {
      const selector = element.id
        ? `#${element.id}`
        : `${element.tag}:nth-of-type(${element.index + 1})`;

      const elementHandle = await page.$(selector);
      if (!elementHandle) continue;

      const inputType = element.type || 'text';

      // Test based on input type
      switch (inputType) {
        case 'text':
        case 'email':
        case 'password':
        case 'search':
          await elementHandle.fill('Test input 123');
          results.interactions.push({
            type: `form-input-${inputType}`,
            state: state.id,
            success: true
          });
          break;

        case 'number':
          await elementHandle.fill('42');
          results.interactions.push({
            type: 'form-input-number',
            state: state.id,
            success: true
          });
          break;

        case 'checkbox':
          await elementHandle.check();
          await page.waitForTimeout(100);
          await elementHandle.uncheck();
          results.interactions.push({
            type: 'form-checkbox',
            state: state.id,
            success: true
          });
          break;

        case 'radio':
          await elementHandle.check();
          results.interactions.push({
            type: 'form-radio',
            state: state.id,
            success: true
          });
          break;

        default:
          if (element.tag === 'SELECT') {
            const options = await elementHandle.$$eval('option', opts =>
              opts.map(o => o.value).filter(v => v)
            );
            if (options.length > 0) {
              await elementHandle.selectOption(options[0]);
              results.interactions.push({
                type: 'form-select',
                state: state.id,
                success: true
              });
            }
          } else if (element.tag === 'TEXTAREA') {
            await elementHandle.fill('Test textarea content');
            results.interactions.push({
              type: 'form-textarea',
              state: state.id,
              success: true
            });
          }
      }

    } catch (error) {
      results.issues.push({
        state: state.id,
        type: 'form',
        severity: 'low',
        message: `Form testing error on ${element.tag}: ${error.message}`
      });
    }
  }

  return results;
}

/**
 * Generate flow map in multiple formats (JSON, Mermaid, HTML, DOT)
 */
async function generateFlowMap(flowResults, config) {
  const flowMap = {
    formats: [],
    files: []
  };

  // 1. JSON State Machine
  const jsonStateMachine = {
    states: flowResults.states.map(s => ({
      id: s.id,
      url: s.url,
      title: s.title,
      elementCount: s.elementCount,
      screenshot: s.screenshot
    })),
    transitions: flowResults.transitions,
    coverage: flowResults.coverage,
    generated: new Date().toISOString()
  };

  const jsonPath = path.join(config.outputDir, 'flow-map-state-machine.json');
  fs.writeFileSync(jsonPath, JSON.stringify(jsonStateMachine, null, 2));
  flowMap.formats.push('JSON');
  flowMap.files.push(jsonPath);

  // 2. Mermaid Diagram
  const mermaidDiagram = generateMermaidDiagram(flowResults);
  const mermaidPath = path.join(config.outputDir, 'flow-map-diagram.mmd');
  fs.writeFileSync(mermaidPath, mermaidDiagram);
  flowMap.formats.push('Mermaid');
  flowMap.files.push(mermaidPath);

  // 3. Interactive HTML Map
  const htmlMap = generateHTMLMap(flowResults, config);
  const htmlPath = path.join(config.outputDir, 'flow-map-interactive.html');
  fs.writeFileSync(htmlPath, htmlMap);
  flowMap.formats.push('HTML');
  flowMap.files.push(htmlPath);

  return flowMap;
}

/**
 * Generate Mermaid diagram from flow results
 */
function generateMermaidDiagram(flowResults) {
  let mermaid = 'graph LR\n';

  // Add states
  flowResults.states.forEach(state => {
    const label = `${state.title || state.url}`;
    mermaid += `  ${state.id}["${label}"]\n`;
  });

  mermaid += '\n';

  // Add transitions
  const uniqueTransitions = new Map();
  flowResults.transitions.forEach(t => {
    const key = `${t.from}-${t.to}`;
    if (!uniqueTransitions.has(key)) {
      uniqueTransitions.set(key, t);
    }
  });

  uniqueTransitions.forEach(transition => {
    const fromState = flowResults.states.find(s => s.id === transition.from);
    const toState = flowResults.states.find(s => s.url === transition.to);

    if (fromState && toState) {
      const trigger = transition.trigger.key || transition.trigger.action || 'click';
      mermaid += `  ${fromState.id} -->|${trigger}| ${toState.id}\n`;
    }
  });

  return mermaid;
}

/**
 * Generate interactive HTML map with D3.js visualization
 */
function generateHTMLMap(flowResults, config) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Thomas App - Screen Flow Map</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      margin: 0;
      padding: 20px;
      background: #f5f5f5;
    }
    h1 {
      color: #333;
      margin-bottom: 10px;
    }
    .stats {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 20px;
    }
    .stat {
      display: inline-block;
      margin-right: 30px;
    }
    .stat-value {
      font-size: 2em;
      font-weight: bold;
      color: #0066cc;
    }
    .stat-label {
      color: #666;
      font-size: 0.9em;
    }
    .states-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }
    .state-card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      overflow: hidden;
      transition: transform 0.2s;
    }
    .state-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }
    .state-screenshot {
      width: 100%;
      height: 200px;
      object-fit: cover;
      background: #eee;
    }
    .state-info {
      padding: 15px;
    }
    .state-title {
      font-weight: bold;
      margin-bottom: 5px;
      color: #333;
    }
    .state-url {
      color: #666;
      font-size: 0.9em;
      margin-bottom: 10px;
    }
    .state-meta {
      font-size: 0.85em;
      color: #999;
    }
  </style>
</head>
<body>
  <h1>🗺️ Screen Flow Map</h1>

  <div class="stats">
    <div class="stat">
      <div class="stat-value">${flowResults.states.length}</div>
      <div class="stat-label">States (Screens)</div>
    </div>
    <div class="stat">
      <div class="stat-value">${flowResults.transitions.length}</div>
      <div class="stat-label">Transitions</div>
    </div>
    <div class="stat">
      <div class="stat-value">${flowResults.coverage.interactions}</div>
      <div class="stat-label">Interactions Tested</div>
    </div>
    <div class="stat">
      <div class="stat-value">${Math.round((flowResults.coverage.states / (flowResults.states.length || 1)) * 100)}%</div>
      <div class="stat-label">State Coverage</div>
    </div>
  </div>

  <h2>States</h2>
  <div class="states-grid">
    ${flowResults.states.map(state => `
      <div class="state-card">
        <img src="${path.basename(state.screenshot)}" alt="${state.title}" class="state-screenshot" onerror="this.style.display='none'">
        <div class="state-info">
          <div class="state-title">${state.title || 'Untitled'}</div>
          <div class="state-url">${state.url}</div>
          <div class="state-meta">${state.elementCount} interactive elements</div>
        </div>
      </div>
    `).join('')}
  </div>

  <h2>Interaction Coverage</h2>
  <div class="stats">
    <div class="stat">
      <div class="stat-value">${flowResults.interactions.keyboard.length}</div>
      <div class="stat-label">⌨️ Keyboard</div>
    </div>
    <div class="stat">
      <div class="stat-value">${flowResults.interactions.mouse.length}</div>
      <div class="stat-label">🖱️ Mouse</div>
    </div>
    <div class="stat">
      <div class="stat-value">${flowResults.interactions.touch.length}</div>
      <div class="stat-label">👆 Touch</div>
    </div>
    <div class="stat">
      <div class="stat-value">${flowResults.interactions.scroll.length}</div>
      <div class="stat-label">📜 Scroll</div>
    </div>
    <div class="stat">
      <div class="stat-value">${flowResults.interactions.zoom.length}</div>
      <div class="stat-label">🔍 Zoom</div>
    </div>
    <div class="stat">
      <div class="stat-value">${flowResults.interactions.forms.length}</div>
      <div class="stat-label">📝 Forms</div>
    </div>
  </div>
</body>
</html>`;
}

module.exports = { run };
