/**
 * Phase 3: Visual & Interaction Analysis
 *
 * Screen-by-screen visual checks and interaction testing
 */

const path = require('path');

async function run(orchestrator) {
  const { page, config, results } = orchestrator;
  const routes = results.phases.discovery?.routes || [{ path: '/' }];

  console.log(`📱 Testing visual & interactions across ${config.viewports.length} viewports...\n`);

  const visualResults = {
    screensTested: 0,
    visualIssues: [],
    interactionIssues: [],
    screenshots: []
  };

  // Test each route across viewports
  for (const route of routes.slice(0, 5)) {  // Limit to first 5 routes for MVP
    for (const viewport of config.viewports) {
      await page.setViewportSize(viewport);
      await page.goto(config.baseUrl + route.path, { waitUntil: 'networkidle' });

      console.log(`  Testing ${route.path} @ ${viewport.name}`);

      // Visual checks
      const visualChecks = await performVisualChecks(page, viewport);
      visualResults.visualIssues.push(...visualChecks.issues);

      // Screenshot
      const screenshotPath = path.join(
        config.outputDir,
        `visual-${route.path.replace(/\//g, '-') || 'home'}-${viewport.name}.png`
      );
      await page.screenshot({ path: screenshotPath, fullPage: true });
      visualResults.screenshots.push(screenshotPath);

      visualResults.screensTested++;
    }

    // Test interactions on desktop viewport
    await page.setViewportSize(config.viewports[0]);
    const interactionChecks = await testInteractions(page);
    visualResults.interactionIssues.push(...interactionChecks.issues);
  }

  return visualResults;
}

async function performVisualChecks(page, viewport) {
  const checks = {
    route: page.url(),
    viewport: viewport.name,
    issues: []
  };

  // Check 1: No horizontal scroll
  const hasHorizontalScroll = await page.evaluate(() => {
    return document.documentElement.scrollWidth > window.innerWidth;
  });

  if (hasHorizontalScroll) {
    checks.issues.push({
      type: 'layout',
      severity: 'high',
      message: `Horizontal scroll present on ${viewport.name}`,
      suggestion: 'Check for fixed-width elements or missing responsive CSS'
    });
  }

  // Check 2: Text readability
  const textIssues = await page.evaluate(() => {
    const issues = [];
    const elements = Array.from(document.querySelectorAll('*'));

    for (const el of elements) {
      const style = window.getComputedStyle(el);
      const fontSize = parseFloat(style.fontSize);

      // Check font size (min 14px on mobile, 16px on desktop)
      const minSize = window.innerWidth < 768 ? 14 : 16;
      if (fontSize > 0 && fontSize < minSize && el.textContent.trim()) {
        issues.push({
          element: el.tagName,
          fontSize: fontSize,
          text: el.textContent.substring(0, 50)
        });
      }
    }

    return issues.slice(0, 5);  // Limit to 5 examples
  });

  textIssues.forEach(issue => {
    checks.issues.push({
      type: 'typography',
      severity: 'medium',
      message: `Text too small: ${issue.fontSize}px in ${issue.element}`,
      suggestion: 'Increase font size to at least 16px'
    });
  });

  // Check 3: Images loaded
  const unloadedImages = await page.$$eval('img', imgs =>
    imgs.filter(img => !img.complete || img.naturalHeight === 0).length
  );

  if (unloadedImages > 0) {
    checks.issues.push({
      type: 'images',
      severity: 'high',
      message: `${unloadedImages} images failed to load`,
      suggestion: 'Check image URLs and optimize loading'
    });
  }

  // Check 4: Touch targets (mobile only)
  if (viewport.width < 768) {
    const smallTargets = await page.evaluate(() => {
      const MIN_SIZE = 44;  // WCAG guideline
      const issues = [];

      const interactive = Array.from(
        document.querySelectorAll('button, a[href], input[type="submit"], [role="button"]')
      );

      for (const el of interactive) {
        const rect = el.getBoundingClientRect();
        if ((rect.width < MIN_SIZE || rect.height < MIN_SIZE) && rect.width > 0) {
          issues.push({
            element: el.tagName,
            size: `${Math.round(rect.width)}x${Math.round(rect.height)}`,
            text: el.textContent?.trim().substring(0, 30)
          });
        }
      }

      return issues.slice(0, 5);
    });

    smallTargets.forEach(issue => {
      checks.issues.push({
        type: 'touch-target',
        severity: 'high',
        message: `Touch target too small: ${issue.size}px on ${issue.element}`,
        suggestion: 'Increase to minimum 44x44px'
      });
    });
  }

  return checks;
}

async function testInteractions(page) {
  const results = {
    tested: 0,
    issues: []
  };

  // Discover interactive elements
  const interactive = await page.$$eval(
    'button, a[href], input[type="submit"], [role="button"]',
    elements => elements.slice(0, 20).map((el, i) => ({  // Limit to 20 elements
      index: i,
      tag: el.tagName,
      text: el.textContent?.trim().substring(0, 50),
      hasHref: !!el.getAttribute('href')
    }))
  );

  console.log(`    Testing ${interactive.length} interactive elements...`);

  for (const element of interactive) {
    const selector = `${element.tag}:nth-of-type(${element.index + 1})`;

    try {
      // Test 1: Click responsiveness
      const clickStart = Date.now();
      const elementHandle = await page.$(selector);

      if (!elementHandle) continue;

      // Check if element is visible and enabled
      const isVisible = await elementHandle.isVisible();
      const isEnabled = await elementHandle.isEnabled();

      if (!isVisible || !isEnabled) {
        continue;  // Skip hidden or disabled elements
      }

      await elementHandle.click({ timeout: 1000 });
      const clickDuration = Date.now() - clickStart;

      if (clickDuration > 100) {
        results.issues.push({
          type: 'interaction',
          severity: 'low',
          message: `Slow click response on "${element.text}" (${clickDuration}ms)`,
          suggestion: 'Optimize click handler or reduce JavaScript execution'
        });
      }

      // Test 2: Focus indicator (keyboard accessibility)
      await page.keyboard.press('Tab');
      const hasFocusIndicator = await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        if (!el) return false;

        const style = window.getComputedStyle(el, ':focus');
        return style.outline !== 'none' && style.outlineWidth !== '0px';
      }, selector);

      if (!hasFocusIndicator) {
        results.issues.push({
          type: 'accessibility',
          severity: 'medium',
          message: `No focus indicator on "${element.text}"`,
          suggestion: 'Add visible focus styles for keyboard navigation'
        });
      }

      results.tested++;

    } catch (error) {
      // Element might not be clickable or might navigate away
      // This is acceptable, continue testing
    }
  }

  return results;
}

module.exports = { run };
