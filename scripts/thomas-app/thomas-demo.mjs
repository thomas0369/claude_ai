#!/usr/bin/env node

/**
 * Thomas Demo - Visual Journey Demonstration
 *
 * Shows customer journeys running in Chromium with visual UI overlay,
 * element highlighting, and step-by-step progress tracking.
 *
 * Based on thomas-app but optimized for visual demonstration.
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Demo configuration
const DEMO_CONFIG = {
  delays: {
    beforeStep: 1200,      // 1.2s before each step
    afterStep: 800,        // 0.8s after each step
    highlight: 600,        // 0.6s for element highlight
    betweenJourneys: 2500, // 2.5s between journeys
    resultScreen: 4000     // 4s on result screen
  },

  highlighting: {
    color: '#FF6B6B',
    thickness: '3px',
    pulseColor: '#FFE66D',
    duration: 600
  },

  ui: {
    position: 'top-right',
    showStepNumbers: true,
    showTimings: true,
    enableControls: false // TODO: implement pause/resume
  }
};

class ThomasDemoOrchestrator {
  constructor(options = {}) {
    this.options = {
      appType: options.appType || null,
      journey: options.journey || null,
      baseUrl: options.baseUrl || process.env.BASE_URL || 'http://localhost:3000',
      speed: options.speed || 1.0,
      outputDir: '/tmp/thomas-demo',
      ...options
    };

    this.browser = null;
    this.context = null;
    this.page = null;
    this.isPaused = false;
    this.currentJourney = null;
    this.stats = {
      totalJourneys: 0,
      passedJourneys: 0,
      totalSteps: 0,
      passedSteps: 0,
      startTime: Date.now(),
      screenshots: []
    };
  }

  async run() {
    try {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🎭 THOMAS APP - VISUAL DEMONSTRATION MODE');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      // Create output directory
      if (!fs.existsSync(this.options.outputDir)) {
        fs.mkdirSync(this.options.outputDir, { recursive: true });
      }

      // Auto-detect app type if not provided
      if (!this.options.appType) {
        this.options.appType = await this.detectAppType();
      }

      console.log(`App Type: ${this.options.appType}`);
      console.log(`Base URL: ${this.options.baseUrl}\n`);

      // Launch browser
      await this.initializeBrowser();

      // Load journeys
      const journeys = await this.loadJourneys();

      // Show demo intro
      await this.showIntro(journeys);

      // Run journeys
      for (const journey of journeys) {
        await this.runJourney(journey);
        await this.page.waitForTimeout(DEMO_CONFIG.delays.betweenJourneys);
      }

      // Show final results
      await this.showResults();

      // Keep browser open for viewing
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Press Ctrl+C to exit...');
      await new Promise(() => {}); // Keep alive

    } catch (error) {
      console.error('\n❌ Demo error:', error.message);
      throw error;
    }
  }

  async detectAppType() {
    // Simple detection based on package.json or route structure
    // For demo purposes, default to 'website'
    return 'website';
  }

  async initializeBrowser() {
    console.log('🚀 Launching browser...');

    this.browser = await chromium.launch({
      headless: false,
      slowMo: 100, // Slow down all Playwright actions
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--start-maximized']
    });

    this.context = await this.browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });

    this.page = await this.context.newPage();

    console.log('✅ Browser ready\n');
  }

  async loadJourneys() {
    // Load journeys from customer-journeys.js
    const customerJourneysPath = path.join(__dirname, 'phases', 'customer-journeys.js');
    const journeyModule = await import(customerJourneysPath);

    // Get journeys for app type
    const journeys = this.getJourneysForAppType(this.options.appType);

    // Filter by specific journey if requested
    if (this.options.journey) {
      return journeys.filter(j => j.name === this.options.journey);
    }

    return journeys;
  }

  getJourneysForAppType(appType) {
    // Same journey templates as in customer-journeys.js
    const journeyTemplates = {
      game: [
        {
          name: 'New Player Onboarding',
          steps: [
            { action: 'goto', url: '/game', description: 'Navigate to game' },
            { action: 'waitForSelector', selector: 'canvas', description: 'Wait for game canvas' },
            { action: 'click', selector: '[data-start-game], button:has-text("Start")', optional: true, description: 'Click start button' },
            { action: 'wait', duration: 3000, description: 'Game initialization' },
            { action: 'press', key: 'Space', count: 5, description: 'Test game controls' }
          ]
        }
      ],

      ecommerce: [
        {
          name: 'Browse to Purchase',
          steps: [
            { action: 'goto', url: '/', description: 'Land on homepage' },
            { action: 'waitForSelector', selector: '[class*="product"], [data-product]', description: 'Wait for products to load' },
            { action: 'click', selector: '[class*="product"]:first-child', description: 'Click first product' },
            { action: 'click', selector: '[class*="add-to-cart"], button:has-text("Add to Cart")', description: 'Add product to cart' },
            { action: 'goto', url: '/cart', description: 'Navigate to cart' },
            { action: 'click', selector: '[class*="checkout"], button:has-text("Checkout")', description: 'Proceed to checkout' }
          ]
        }
      ],

      saas: [
        {
          name: 'Sign Up Flow',
          steps: [
            { action: 'goto', url: '/', description: 'Land on homepage' },
            { action: 'click', selector: 'a:has-text("Sign Up"), button:has-text("Get Started")', description: 'Click sign up button' },
            { action: 'fill', selector: 'input[type="email"]', value: 'demo@example.com', description: 'Enter email address' },
            { action: 'fill', selector: 'input[type="password"]', value: 'DemoPassword123!', description: 'Enter password' },
            { action: 'click', selector: 'button[type="submit"]', description: 'Submit registration form' },
            { action: 'wait', duration: 2000, description: 'Wait for account creation' }
          ]
        }
      ],

      content: [
        {
          name: 'Browse and Read',
          steps: [
            { action: 'goto', url: '/', description: 'Land on homepage' },
            { action: 'click', selector: 'article a:first-child, [class*="post"] a:first-child', description: 'Click first article' },
            { action: 'wait', duration: 2000, description: 'Reading time' },
            { action: 'scroll', amount: 500, description: 'Scroll through content' }
          ]
        }
      ],

      website: [
        {
          name: 'Homepage Tour',
          steps: [
            { action: 'goto', url: '/', description: 'Navigate to homepage' },
            { action: 'wait', duration: 1500, description: 'View homepage' },
            { action: 'scroll', amount: 300, description: 'Scroll down page' },
            { action: 'wait', duration: 1000, description: 'View content' }
          ]
        }
      ]
    };

    return journeyTemplates[appType] || journeyTemplates.website;
  }

  async showIntro(journeys) {
    await this.page.goto(this.options.baseUrl, { waitUntil: 'networkidle' });

    // Inject demo UI
    await this.injectDemoUI();

    // Show intro message
    await this.updateUI({
      title: `${this.options.appType.toUpperCase()} App Demo`,
      message: `Demonstrating ${journeys.length} customer ${journeys.length === 1 ? 'journey' : 'journeys'}`,
      journeys: journeys.map(j => ({
        name: j.name,
        steps: j.steps.length
      }))
    });

    await this.page.waitForTimeout(3000);
  }

  async injectDemoUI() {
    await this.page.evaluate(() => {
      if (document.getElementById('thomas-demo-panel')) return;

      const panel = document.createElement('div');
      panel.id = 'thomas-demo-panel';
      panel.innerHTML = `
        <div id="thomas-demo-container" style="
          position: fixed;
          top: 20px;
          right: 20px;
          width: 380px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.3);
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
          z-index: 2147483647;
          font-size: 14px;
          color: white;
          overflow: hidden;
        ">
          <div style="padding: 20px; background: rgba(255,255,255,0.1);">
            <h3 id="thomas-title" style="margin: 0; font-size: 20px; font-weight: 600;">
              🎭 Thomas App Demo
            </h3>
          </div>
          <div style="padding: 20px; background: white; color: #2D3748;">
            <div id="thomas-journey-info" style="margin-bottom: 15px; font-size: 16px; font-weight: 600;"></div>
            <div id="thomas-progress" style="margin-bottom: 15px;"></div>
            <div id="thomas-steps-list" style="max-height: 400px; overflow-y: auto; margin-bottom: 15px;"></div>
            <div id="thomas-message" style="padding: 12px; background: #F7FAFC; border-radius: 6px; font-size: 13px;"></div>
          </div>
        </div>
      `;
      document.body.appendChild(panel);
    });
  }

  async updateUI(data) {
    await this.page.evaluate((d) => {
      if (d.title) {
        const titleEl = document.getElementById('thomas-title');
        if (titleEl) titleEl.textContent = '🎭 ' + d.title;
      }

      if (d.journeyName) {
        const infoEl = document.getElementById('thomas-journey-info');
        if (infoEl) {
          infoEl.innerHTML = `
            <div style="color: #4299E1; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">
              Journey ${d.journeyIndex || 1} of ${d.totalJourneys || 1}
            </div>
            <div style="font-size: 18px; font-weight: 700; color: #2D3748;">
              ${d.journeyName}
            </div>
          `;
        }
      }

      if (d.progress) {
        const progressEl = document.getElementById('thomas-progress');
        if (progressEl) {
          const percent = Math.round((d.progress.current / d.progress.total) * 100);
          progressEl.innerHTML = `
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px; color: #718096;">
              <span>Step ${d.progress.current} of ${d.progress.total}</span>
              <span>${percent}%</span>
            </div>
            <div style="width: 100%; height: 8px; background: #E2E8F0; border-radius: 4px; overflow: hidden;">
              <div style="
                width: ${percent}%;
                height: 100%;
                background: linear-gradient(90deg, #667eea, #764ba2);
                transition: width 0.3s ease;
              "></div>
            </div>
          `;
        }
      }

      if (d.steps) {
        const stepsEl = document.getElementById('thomas-steps-list');
        if (stepsEl) {
          stepsEl.innerHTML = d.steps.map((step, i) => {
            let icon = '⏸';
            let color = '#CBD5E0';

            if (step.status === 'completed') {
              icon = '✅';
              color = '#48BB78';
            } else if (step.status === 'current') {
              icon = '▶️';
              color = '#4299E1';
            } else if (step.status === 'failed') {
              icon = '❌';
              color = '#F56565';
            }

            return `
              <div style="
                display: flex;
                align-items: center;
                padding: 8px 0;
                border-bottom: 1px solid #E2E8F0;
                font-size: 13px;
              ">
                <span style="margin-right: 10px; font-size: 16px;">${icon}</span>
                <span style="flex: 1; color: ${color}; ${step.status === 'current' ? 'font-weight: 600;' : ''}">
                  ${step.description}
                </span>
              </div>
            `;
          }).join('');
        }
      }

      if (d.message) {
        const messageEl = document.getElementById('thomas-message');
        if (messageEl) {
          messageEl.innerHTML = d.message;
        }
      }
    }, data);
  }

  async runJourney(journey) {
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`🧭 Journey: ${journey.name}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    this.currentJourney = journey;
    this.stats.totalJourneys++;

    const journeySteps = journey.steps.map(s => ({
      description: s.description || s.action,
      status: 'pending'
    }));

    await this.updateUI({
      journeyName: journey.name,
      journeyIndex: this.stats.totalJourneys,
      totalJourneys: this.stats.totalJourneys,
      progress: { current: 0, total: journey.steps.length },
      steps: journeySteps
    });

    let allStepsPassed = true;

    for (let i = 0; i < journey.steps.length; i++) {
      const step = journey.steps[i];

      // Update current step
      journeySteps[i].status = 'current';
      await this.updateUI({
        progress: { current: i + 1, total: journey.steps.length },
        steps: journeySteps
      });

      // Delay before step
      await this.page.waitForTimeout(DEMO_CONFIG.delays.beforeStep / this.options.speed);

      try {
        console.log(`  Step ${i + 1}: ${step.description || step.action}`);

        // Execute step with visual feedback
        await this.executeStepWithVisuals(step);

        // Mark step complete
        journeySteps[i].status = 'completed';
        this.stats.totalSteps++;
        this.stats.passedSteps++;

        console.log(`  ✅ Complete`);

      } catch (error) {
        console.log(`  ❌ Failed: ${error.message}`);

        journeySteps[i].status = 'failed';
        this.stats.totalSteps++;
        allStepsPassed = false;

        // Take failure screenshot
        const screenshotPath = path.join(this.options.outputDir, `journey-${journey.name}-failed-step${i + 1}.png`);
        await this.page.screenshot({ path: screenshotPath, fullPage: true });
        this.stats.screenshots.push(screenshotPath);

        break; // Stop journey on failure
      }

      // Update UI
      await this.updateUI({ steps: journeySteps });

      // Delay after step
      await this.page.waitForTimeout(DEMO_CONFIG.delays.afterStep / this.options.speed);
    }

    if (allStepsPassed) {
      this.stats.passedJourneys++;
      console.log(`\n✅ Journey Complete!`);
    } else {
      console.log(`\n❌ Journey Failed`);
    }
  }

  async executeStepWithVisuals(step) {
    // Highlight element if it has a selector
    if (step.selector && (step.action === 'click' || step.action === 'fill' || step.action === 'waitForSelector')) {
      await this.highlightElement(step.selector, step.description);
    }

    // Execute the actual step
    await this.executeStep(step);
  }

  async highlightElement(selector, description) {
    try {
      await this.page.evaluate(({ sel, desc, config }) => {
        const element = document.querySelector(sel);
        if (!element) return;

        // Scroll element into view
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Add pulsing highlight
        const originalOutline = element.style.outline;
        const originalOutlineOffset = element.style.outlineOffset;

        element.style.outline = `${config.thickness} solid ${config.color}`;
        element.style.outlineOffset = '2px';

        // Create tooltip
        const tooltip = document.createElement('div');
        tooltip.id = 'thomas-step-tooltip';
        tooltip.textContent = desc;
        tooltip.style.cssText = `
          position: absolute;
          background: #2D3748;
          color: white;
          padding: 10px 14px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          z-index: 2147483646;
          pointer-events: none;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;

        const rect = element.getBoundingClientRect();
        tooltip.style.left = rect.left + window.scrollX + 'px';
        tooltip.style.top = (rect.top + window.scrollY - 50) + 'px';

        document.body.appendChild(tooltip);

        // Remove highlight and tooltip after duration
        setTimeout(() => {
          element.style.outline = originalOutline;
          element.style.outlineOffset = originalOutlineOffset;
          tooltip.remove();
        }, config.duration);

      }, {
        sel: selector,
        desc: description,
        config: DEMO_CONFIG.highlighting
      });

      await this.page.waitForTimeout(DEMO_CONFIG.highlighting.duration);

    } catch (error) {
      // Element might not exist, continue anyway
    }
  }

  async executeStep(step) {
    const config = { baseUrl: this.options.baseUrl };

    switch (step.action) {
      case 'goto':
        const url = step.url.startsWith('http') ? step.url : config.baseUrl + step.url;
        await this.page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        break;

      case 'click':
        try {
          await this.page.click(step.selector, { timeout: 5000 });
        } catch (error) {
          if (step.optional) return;
          throw error;
        }
        break;

      case 'fill':
        await this.page.fill(step.selector, step.value, { timeout: 5000 });
        break;

      case 'press':
        const count = step.count || 1;
        for (let i = 0; i < count; i++) {
          await this.page.keyboard.press(step.key);
          if (count > 1) await this.page.waitForTimeout(100);
        }
        break;

      case 'wait':
        await this.page.waitForTimeout(step.duration);
        break;

      case 'waitForSelector':
        await this.page.waitForSelector(step.selector, { timeout: 10000 });
        break;

      case 'scroll':
        await this.page.evaluate((amount) => {
          window.scrollBy({ top: amount, behavior: 'smooth' });
        }, step.amount);
        await this.page.waitForTimeout(500);
        break;

      case 'evaluate':
        await this.page.evaluate(step.fn);
        break;

      default:
        throw new Error(`Unknown step action: ${step.action}`);
    }
  }

  async showResults() {
    const duration = Math.round((Date.now() - this.stats.startTime) / 1000);
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    const durationStr = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

    const passRate = this.stats.totalJourneys > 0
      ? Math.round((this.stats.passedJourneys / this.stats.totalJourneys) * 100)
      : 0;

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📊 DEMO RESULTS`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`\nJourneys:     ${this.stats.passedJourneys}/${this.stats.totalJourneys} passed (${passRate}%)`);
    console.log(`Steps:        ${this.stats.passedSteps}/${this.stats.totalSteps} successful`);
    console.log(`Duration:     ${durationStr}`);
    console.log(`Screenshots:  ${this.stats.screenshots.length} captured\n`);

    await this.updateUI({
      title: passRate === 100 ? '✅ Demo Complete!' : '⚠️ Demo Complete (with issues)',
      message: `
        <div style="text-align: center; padding: 20px 0;">
          <div style="font-size: 48px; margin-bottom: 10px;">
            ${passRate === 100 ? '✅' : '⚠️'}
          </div>
          <div style="font-size: 16px; font-weight: 600; margin-bottom: 20px;">
            ${this.stats.passedJourneys}/${this.stats.totalJourneys} Journeys Passed
          </div>
          <div style="font-size: 14px; color: #718096;">
            ${this.stats.passedSteps}/${this.stats.totalSteps} steps • ${durationStr} duration
          </div>
        </div>
      `
    });

    await this.page.waitForTimeout(DEMO_CONFIG.delays.resultScreen);
  }
}

// CLI interface
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
  const args = process.argv.slice(2);

  const options = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--app-type' && args[i + 1]) {
      options.appType = args[++i];
    } else if (arg === '--journey' && args[i + 1]) {
      options.journey = args[++i];
    } else if (arg === '--speed' && args[i + 1]) {
      options.speed = parseFloat(args[++i]);
    } else if (arg === '--base-url' && args[i + 1]) {
      options.baseUrl = args[++i];
    }
  }

  const demo = new ThomasDemoOrchestrator(options);

  demo.run()
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export default ThomasDemoOrchestrator;
