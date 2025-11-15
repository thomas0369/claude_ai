/**
 * Phase 2: Customer Journey Testing
 *
 * Test complete user flows from entry to goal completion
 */

const fs = require('fs');
const path = require('path');

async function run(orchestrator) {
  const { page, config, results } = orchestrator;
  const appType = results.phases.discovery?.appType || 'website';

  console.log(`🧭 Testing customer journeys for ${appType} app...\n`);

  const journeyResults = {
    journeys: [],
    totalFrictionPoints: 0,
    screenshots: []
  };

  // Get journeys based on app type
  const journeys = getJourneysForAppType(appType, config);

  for (const journey of journeys) {
    console.log(`\n  Testing: ${journey.name}`);

    const result = await testJourney(page, journey, config);
    journeyResults.journeys.push(result);
    journeyResults.totalFrictionPoints += result.frictionPoints.length;

    if (result.completed) {
      console.log(`    ✅ Completed in ${Math.round(result.duration / 1000)}s`);
    } else {
      console.log(`    ❌ Failed at: ${result.failedStep}`);
      console.log(`    Reason: ${result.error}`);
    }

    if (result.frictionPoints.length > 0) {
      console.log(`    ⚠️  ${result.frictionPoints.length} friction points`);
    }
  }

  return journeyResults;
}

function getJourneysForAppType(appType, config) {
  // Pre-defined journeys by app type
  const journeyTemplates = {
    game: [
      {
        name: 'New Player Onboarding',
        critical: true,
        steps: [
          { action: 'goto', url: '/game', check: 'gameLoaded', description: 'Navigate to game' },
          { action: 'waitForSelector', selector: 'canvas', description: 'Wait for game canvas' },
          { action: 'click', selector: '[data-start-game], button:has-text("Start"), button:has-text("Play")', optional: true, description: 'Click start button if present' },
          { action: 'wait', duration: 3000, description: 'Wait for game to initialize' },
          { action: 'screenshot', name: 'game-started', description: 'Screenshot game started' },
          { action: 'press', key: 'Space', count: 5, description: 'Test basic controls' },
          { action: 'wait', duration: 2000 },
          { action: 'screenshot', name: 'game-playing', description: 'Screenshot gameplay' }
        ]
      },
      {
        name: 'Gameplay Loop',
        critical: true,
        steps: [
          { action: 'goto', url: '/game' },
          { action: 'waitForSelector', selector: 'canvas' },
          { action: 'press', key: 'Space', count: 10, description: 'Play game' },
          { action: 'wait', duration: 5000 },
          { action: 'evaluate', fn: 'getGameScore', description: 'Check score updates' }
        ]
      }
    ],

    ecommerce: [
      {
        name: 'Browse to Purchase',
        critical: true,
        steps: [
          { action: 'goto', url: '/', description: 'Land on homepage' },
          { action: 'screenshot', name: 'homepage' },
          { action: 'waitForSelector', selector: '[class*="product"], [data-product]', description: 'Wait for products' },
          { action: 'click', selector: '[class*="product"]:first-child, [data-product]:first-child', description: 'Click first product' },
          { action: 'screenshot', name: 'product-detail' },
          { action: 'click', selector: '[class*="add-to-cart"], button:has-text("Add to Cart")', description: 'Add to cart' },
          { action: 'wait', duration: 1000 },
          { action: 'goto', url: '/cart', description: 'Navigate to cart' },
          { action: 'screenshot', name: 'cart' },
          { action: 'click', selector: '[class*="checkout"], button:has-text("Checkout")', description: 'Go to checkout' },
          { action: 'screenshot', name: 'checkout' }
        ]
      },
      {
        name: 'Product Search',
        critical: false,
        steps: [
          { action: 'goto', url: '/' },
          { action: 'fill', selector: 'input[type="search"], [placeholder*="search" i]', value: 'test', description: 'Enter search term' },
          { action: 'press', key: 'Enter', description: 'Submit search' },
          { action: 'wait', duration: 1000 },
          { action: 'screenshot', name: 'search-results' },
          { action: 'waitForSelector', selector: '[class*="product"], [data-product]', description: 'Wait for search results' }
        ]
      }
    ],

    saas: [
      {
        name: 'Sign Up to First Value',
        critical: true,
        steps: [
          { action: 'goto', url: '/', description: 'Land on homepage' },
          { action: 'screenshot', name: 'homepage' },
          { action: 'click', selector: 'a:has-text("Sign Up"), a:has-text("Get Started"), button:has-text("Sign Up")', description: 'Click sign up' },
          { action: 'screenshot', name: 'signup-page' },
          { action: 'fill', selector: 'input[type="email"], input[name="email"]', value: 'test@example.com', description: 'Enter email' },
          { action: 'fill', selector: 'input[type="password"], input[name="password"]', value: 'TestPassword123!', description: 'Enter password' },
          { action: 'click', selector: 'button[type="submit"], button:has-text("Sign Up")', description: 'Submit form' },
          { action: 'wait', duration: 2000 },
          { action: 'screenshot', name: 'post-signup' }
        ]
      },
      {
        name: 'Dashboard Navigation',
        critical: false,
        steps: [
          { action: 'goto', url: '/dashboard', description: 'Navigate to dashboard' },
          { action: 'screenshot', name: 'dashboard' },
          { action: 'waitForSelector', selector: '[class*="dashboard"], main', description: 'Wait for dashboard load' }
        ]
      }
    ],

    content: [
      {
        name: 'Browse and Read Article',
        critical: true,
        steps: [
          { action: 'goto', url: '/', description: 'Land on homepage' },
          { action: 'screenshot', name: 'homepage' },
          { action: 'click', selector: 'article a:first-child, [class*="post"] a:first-child', description: 'Click first article' },
          { action: 'screenshot', name: 'article' },
          { action: 'wait', duration: 2000, description: 'Read time' },
          { action: 'scroll', amount: 500, description: 'Scroll article' }
        ]
      }
    ],

    website: [
      {
        name: 'Homepage to Contact',
        critical: false,
        steps: [
          { action: 'goto', url: '/', description: 'Land on homepage' },
          { action: 'screenshot', name: 'homepage' },
          { action: 'click', selector: 'a:has-text("Contact")', description: 'Click contact link' },
          { action: 'screenshot', name: 'contact-page' }
        ]
      }
    ]
  };

  // Return journeys for this app type, or fallback to website
  return journeyTemplates[appType] || journeyTemplates.website;
}

async function testJourney(page, journey, config) {
  const result = {
    name: journey.name,
    critical: journey.critical,
    completed: true,
    steps: [],
    frictionPoints: [],
    screenshots: [],
    duration: 0,
    failedStep: null,
    error: null
  };

  const startTime = Date.now();

  for (let i = 0; i < journey.steps.length; i++) {
    const step = journey.steps[i];
    const stepStart = Date.now();

    try {
      await executeStep(page, step, config);

      const stepDuration = Date.now() - stepStart;

      result.steps.push({
        number: i + 1,
        action: step.action,
        description: step.description || step.action,
        passed: true,
        duration: stepDuration
      });

      // Detect friction (step takes unusually long)
      const expectedDuration = step.expectedDuration || 2000;
      if (stepDuration > expectedDuration * 2) {
        result.frictionPoints.push({
          step: i + 1,
          description: step.description || step.action,
          issue: `Slow response (${stepDuration}ms, expected ~${expectedDuration}ms)`,
          severity: 'medium'
        });
      }

    } catch (error) {
      result.completed = false;
      result.failedStep = step.description || step.action;
      result.error = error.message;

      result.steps.push({
        number: i + 1,
        action: step.action,
        description: step.description || step.action,
        passed: false,
        error: error.message
      });

      // Screenshot failure
      try {
        const screenshotPath = path.join(config.outputDir, `journey-${journey.name}-failed-step${i + 1}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: true });
        result.screenshots.push(screenshotPath);
      } catch (e) {
        // Screenshot failed, continue
      }

      break;  // Stop journey on first failure
    }
  }

  result.duration = Date.now() - startTime;

  return result;
}

async function executeStep(page, step, config) {
  switch (step.action) {
    case 'goto':
      const url = step.url.startsWith('http') ? step.url : config.baseUrl + step.url;
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      break;

    case 'click':
      try {
        await page.click(step.selector, { timeout: 5000 });
      } catch (error) {
        if (step.optional) {
          // Skip optional clicks
          return;
        }
        throw error;
      }
      break;

    case 'fill':
      await page.fill(step.selector, step.value, { timeout: 5000 });
      break;

    case 'press':
      const count = step.count || 1;
      for (let i = 0; i < count; i++) {
        await page.keyboard.press(step.key);
        if (count > 1) await page.waitForTimeout(100);
      }
      break;

    case 'wait':
      await page.waitForTimeout(step.duration);
      break;

    case 'waitForSelector':
      await page.waitForSelector(step.selector, { timeout: 10000 });
      break;

    case 'screenshot':
      const screenshotPath = path.join(config.outputDir, `journey-${step.name}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      break;

    case 'scroll':
      await page.evaluate((amount) => {
        window.scrollBy(0, amount);
      }, step.amount);
      break;

    case 'evaluate':
      await page.evaluate(step.fn);
      break;

    default:
      throw new Error(`Unknown step action: ${step.action}`);
  }
}

module.exports = { run };
