#!/usr/bin/env node

/**
 * Thomas Demo V2 - Visual Journey Results Demonstration
 *
 * Reads test results from thomas-app and visually demonstrates
 * each customer journey in Chromium, showing what was tested.
 *
 * This is NOT a test runner - it's a visual replay tool for understanding
 * customer journeys and UI flows from thomas-app test results.
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getJourneysForAppType } from './phases/customer-journeys.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Demo configuration
const DEMO_CONFIG = {
  delays: {
    beforeStep: 1500,      // 1.5s before each step
    afterStep: 1000,       // 1s after each step
    highlight: 800,        // 0.8s for element highlight
    betweenJourneys: 3000, // 3s between journeys
    onFailure: 5000        // 5s to view failure
  },

  highlighting: {
    color: '#FF6B6B',
    thickness: '4px',
    duration: 800
  }
};

class ThomasDemoVisualizer {
  constructor(options = {}) {
    this.options = {
      resultsPath: options.resultsPath || '/tmp/thomas-app/report.json',
      journey: options.journey || null, // Filter to specific journey
      speed: options.speed || 1.0,
      ...options
    };

    this.browser = null;
    this.context = null;
    this.page = null;
    this.testResults = null;
  }

  async run() {
    try {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🎭 THOMAS DEMO - VISUAL JOURNEY DEMONSTRATION');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      // Load test results
      await this.loadTestResults();

      // Launch browser
      await this.initializeBrowser();

      // Get journeys from results
      const journeys = this.getJourneysToDemo();

      if (journeys.length === 0) {
        console.log('❌ No customer journeys found in test results');
        return;
      }

      console.log(`📋 Found ${journeys.length} customer ${journeys.length === 1 ? 'journey' : 'journeys'} to demonstrate\n`);

      // Show intro
      await this.showIntro(journeys);

      // Demonstrate each journey
      for (let i = 0; i < journeys.length; i++) {
        await this.demonstrateJourney(journeys[i], i + 1, journeys.length);

        if (i < journeys.length - 1) {
          await this.page.waitForTimeout(this.delay(DEMO_CONFIG.delays.betweenJourneys));
        }
      }

      // Show final summary
      await this.showFinalSummary(journeys);

      // Keep browser open
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅ Demo complete - Press Ctrl+C to exit');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      await new Promise(() => {}); // Keep alive

    } catch (error) {
      console.error('\n❌ Demo error:', error.message);
      throw error;
    }
  }

  async loadTestResults() {
    if (!fs.existsSync(this.options.resultsPath)) {
      throw new Error(`Test results not found at ${this.options.resultsPath}\nRun 'thomas-app' first to generate test results.`);
    }

    console.log(`📂 Loading test results from: ${this.options.resultsPath}`);

    const resultsData = fs.readFileSync(this.options.resultsPath, 'utf8');
    this.testResults = JSON.parse(resultsData);

    console.log(`   App Type: ${this.testResults.meta.appType}`);
    console.log(`   Base URL: ${this.testResults.meta.url}`);
    console.log(`   Test Date: ${new Date(this.testResults.meta.timestamp).toLocaleString()}\n`);
  }

  async initializeBrowser() {
    console.log('🚀 Launching browser...');

    this.browser = await chromium.launch({
      headless: false,
      slowMo: 100,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--start-maximized']
    });

    this.context = await this.browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });

    this.page = await this.context.newPage();
    console.log('✅ Browser ready\n');
  }

  getJourneysToDemo() {
    // Extract journeys from test results
    const journeyResults = this.testResults.metrics?.journeys;

    if (!journeyResults) {
      console.log('⚠️  No journey metrics found in results');
      return [];
    }

    // Get actual journey data from phases
    const customerJourneys = this.testResults.phases?.customerJourneys;

    if (!customerJourneys || !customerJourneys.journeys) {
      console.log('⚠️  No customer journey data found');
      return [];
    }

    let journeys = customerJourneys.journeys;

    // Filter by specific journey name if requested
    if (this.options.journey) {
      journeys = journeys.filter(j => j.name === this.options.journey);
    }

    return journeys;
  }

  async showIntro(journeys) {
    await this.page.goto(this.testResults.meta.url, { waitUntil: 'networkidle' });

    // Inject demo UI
    await this.injectDemoUI();

    const passed = journeys.filter(j => j.completed).length;
    const total = journeys.length;

    await this.updateUI({
      title: `${this.testResults.meta.appType.toUpperCase()} App - Journey Demo`,
      message: `
        <div style="text-align: center; padding: 30px;">
          <div style="font-size: 64px; margin-bottom: 20px;">🧭</div>
          <div style="font-size: 24px; font-weight: 700; margin-bottom: 15px;">
            Customer Journey Demonstration
          </div>
          <div style="font-size: 16px; color: #718096; margin-bottom: 30px;">
            Replaying test results from thomas-app
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; max-width: 400px; margin: 0 auto;">
            <div style="background: #F7FAFC; padding: 20px; border-radius: 8px;">
              <div style="font-size: 36px; font-weight: 700; color: #667eea;">${total}</div>
              <div style="font-size: 14px; color: #718096;">Total Journeys</div>
            </div>
            <div style="background: #F7FAFC; padding: 20px; border-radius: 8px;">
              <div style="font-size: 36px; font-weight: 700; color: ${passed === total ? '#48BB78' : '#F59E0B'};">${passed}</div>
              <div style="font-size: 14px; color: #718096;">Passed</div>
            </div>
          </div>
        </div>
      `
    });

    await this.page.waitForTimeout(4000);
  }

  async demonstrateJourney(journey, index, total) {
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`🧭 Journey ${index}/${total}: ${journey.name}`);
    console.log(`   Status: ${journey.completed ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`   Duration: ${Math.round(journey.duration / 1000)}s`);
    console.log(`   Steps: ${journey.steps.length}`);
    if (journey.frictionPoints?.length > 0) {
      console.log(`   ⚠️  Friction points: ${journey.frictionPoints.length}`);
    }
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    // Update UI with journey info
    await this.updateUI({
      journeyName: journey.name,
      journeyIndex: index,
      totalJourneys: total,
      journeyStatus: journey.completed ? 'passed' : 'failed',
      progress: { current: 0, total: journey.steps.length },
      steps: journey.steps.map(s => ({
        description: s.description || s.action,
        status: 'pending'
      }))
    });

    // Replay each step
    for (let i = 0; i < journey.steps.length; i++) {
      const step = journey.steps[i];

      console.log(`  Step ${i + 1}/${journey.steps.length}: ${step.description}`);

      // Mark step as current
      const stepStatuses = journey.steps.map((s, idx) => ({
        description: s.description || s.action,
        status: idx < i ? 'completed' : idx === i ? 'current' : 'pending',
        passed: s.passed
      }));

      await this.updateUI({
        progress: { current: i + 1, total: journey.steps.length },
        steps: stepStatuses
      });

      // Delay before step
      await this.page.waitForTimeout(this.delay(DEMO_CONFIG.delays.beforeStep));

      // Visually replay the step
      await this.replayStep(step, journey);

      // Show result
      if (step.passed) {
        console.log(`    ✅ ${step.duration}ms`);
      } else {
        console.log(`    ❌ FAILED: ${step.error || 'Unknown error'}`);
      }

      // Mark complete
      stepStatuses[i].status = step.passed ? 'completed' : 'failed';
      await this.updateUI({ steps: stepStatuses });

      // Delay after step
      await this.page.waitForTimeout(this.delay(DEMO_CONFIG.delays.afterStep));

      // Stop if step failed
      if (!step.passed) {
        await this.page.waitForTimeout(this.delay(DEMO_CONFIG.delays.onFailure));
        break;
      }
    }

    // Show journey result
    if (journey.completed) {
      console.log(`\n✅ Journey completed successfully`);
    } else {
      console.log(`\n❌ Journey failed at: ${journey.failedStep}`);
      if (journey.error) {
        console.log(`   Error: ${journey.error}`);
      }
    }

    // Show friction points
    if (journey.frictionPoints?.length > 0) {
      console.log(`\n⚠️  Friction Points Detected:`);
      journey.frictionPoints.forEach((fp, idx) => {
        console.log(`   ${idx + 1}. Step ${fp.step}: ${fp.issue}`);
      });
    }
  }

  async replayStep(step, journey) {
    try {
      // Get the original journey definition to find the selector
      const originalJourney = this.getOriginalJourneyDefinition(journey.name);
      if (!originalJourney) return;

      // Find the matching step in the original definition
      const stepIndex = step.number - 1;
      const originalStep = originalJourney.steps[stepIndex];

      if (!originalStep) return;

      // Highlight element if it has a selector
      if (originalStep.selector) {
        await this.highlightElement(originalStep.selector, step.description);
      }

      // Don't actually execute the action - just show it visually
      // The test already ran, we're just demonstrating what happened

    } catch (error) {
      // Element might not be on current page, that's ok
    }
  }

  getOriginalJourneyDefinition(journeyName) {
    // Load journey definitions for this app type
    const journeyDefs = getJourneysForAppType(this.testResults.meta.appType, {});
    return journeyDefs.find(j => j.name === journeyName);
  }

  async highlightElement(selector, description) {
    try {
      await this.page.evaluate(({ sel, desc, config }) => {
        const element = document.querySelector(sel);
        if (!element) return;

        // Scroll into view
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Add highlight
        const originalOutline = element.style.outline;
        const originalOutlineOffset = element.style.outlineOffset;

        element.style.outline = `${config.thickness} solid ${config.color}`;
        element.style.outlineOffset = '3px';
        element.style.transition = 'outline 0.3s ease';

        // Create tooltip
        const tooltip = document.createElement('div');
        tooltip.id = 'thomas-step-tooltip';
        tooltip.textContent = desc;
        tooltip.style.cssText = `
          position: absolute;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          z-index: 2147483646;
          pointer-events: none;
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        `;

        const rect = element.getBoundingClientRect();
        tooltip.style.left = rect.left + window.scrollX + 'px';
        tooltip.style.top = (rect.top + window.scrollY - 60) + 'px';

        document.body.appendChild(tooltip);

        // Remove after duration
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
      // Element not found, skip highlighting
    }
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
          width: 400px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
          z-index: 2147483647;
          font-size: 14px;
          overflow: hidden;
        ">
          <div style="padding: 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
            <h3 id="thomas-title" style="margin: 0; font-size: 20px; font-weight: 700; color: white;">
              🎭 Thomas Demo
            </h3>
          </div>
          <div style="padding: 24px; background: white; color: #2D3748;">
            <div id="thomas-journey-info" style="margin-bottom: 20px;"></div>
            <div id="thomas-progress" style="margin-bottom: 20px;"></div>
            <div id="thomas-steps-list" style="max-height: 500px; overflow-y: auto; margin-bottom: 20px;"></div>
            <div id="thomas-message" style="padding: 16px; background: #F7FAFC; border-radius: 8px; font-size: 13px;"></div>
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
          const statusColor = d.journeyStatus === 'passed' ? '#48BB78' : '#F56565';
          const statusIcon = d.journeyStatus === 'passed' ? '✅' : '❌';

          infoEl.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <div style="color: #667eea; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                Journey ${d.journeyIndex || 1} of ${d.totalJourneys || 1}
              </div>
              <div style="font-size: 20px;">${statusIcon}</div>
            </div>
            <div style="font-size: 20px; font-weight: 700; color: #2D3748;">
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
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; color: #718096; font-weight: 600;">
              <span>Step ${d.progress.current} of ${d.progress.total}</span>
              <span>${percent}%</span>
            </div>
            <div style="width: 100%; height: 10px; background: #E2E8F0; border-radius: 5px; overflow: hidden;">
              <div style="
                width: ${percent}%;
                height: 100%;
                background: linear-gradient(90deg, #667eea, #764ba2);
                transition: width 0.5s ease;
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
            let bgColor = 'transparent';

            if (step.status === 'completed') {
              icon = step.passed === false ? '❌' : '✅';
              color = step.passed === false ? '#F56565' : '#48BB78';
            } else if (step.status === 'current') {
              icon = '▶️';
              color = '#667eea';
              bgColor = '#EEF2FF';
            } else if (step.status === 'failed') {
              icon = '❌';
              color = '#F56565';
            }

            return `
              <div style="
                display: flex;
                align-items: center;
                padding: 12px;
                margin: 4px 0;
                border-radius: 6px;
                background: ${bgColor};
                font-size: 13px;
                transition: all 0.3s ease;
              ">
                <span style="margin-right: 12px; font-size: 18px;">${icon}</span>
                <span style="flex: 1; color: ${color}; ${step.status === 'current' ? 'font-weight: 700;' : ''}">
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

  async showFinalSummary(journeys) {
    const passed = journeys.filter(j => j.completed).length;
    const failed = journeys.length - passed;
    const totalSteps = journeys.reduce((sum, j) => sum + j.steps.length, 0);
    const passedSteps = journeys.reduce((sum, j) => sum + j.steps.filter(s => s.passed).length, 0);
    const totalFriction = journeys.reduce((sum, j) => sum + (j.frictionPoints?.length || 0), 0);

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📊 DEMONSTRATION SUMMARY`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`\n  Customer Journeys:  ${passed}/${journeys.length} passed (${Math.round(passed/journeys.length * 100)}%)`);
    console.log(`  Total Steps:        ${passedSteps}/${totalSteps} successful`);
    console.log(`  Friction Points:    ${totalFriction} detected`);
    console.log(`  Overall Score:      ${this.testResults.scores.overall}/100\n`);

    await this.updateUI({
      title: passed === journeys.length ? 'All Journeys Passed!' : 'Demo Complete',
      message: `
        <div style="text-align: center; padding: 30px 0;">
          <div style="font-size: 72px; margin-bottom: 20px;">
            ${passed === journeys.length ? '🎉' : '⚠️'}
          </div>
          <div style="font-size: 28px; font-weight: 700; margin-bottom: 30px; color: ${passed === journeys.length ? '#48BB78' : '#F59E0B'};">
            ${passed}/${journeys.length} Journeys Passed
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 14px; color: #718096;">
            <div>
              <div style="font-size: 24px; font-weight: 700; color: #667eea;">${passedSteps}/${totalSteps}</div>
              <div>Steps Successful</div>
            </div>
            <div>
              <div style="font-size: 24px; font-weight: 700; color: ${totalFriction > 0 ? '#F59E0B' : '#48BB78'};">${totalFriction}</div>
              <div>Friction Points</div>
            </div>
          </div>
        </div>
      `
    });
  }

  delay(ms) {
    return ms / this.options.speed;
  }
}

// CLI interface
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
  const args = process.argv.slice(2);
  const options = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--results' && args[i + 1]) {
      options.resultsPath = args[++i];
    } else if (arg === '--journey' && args[i + 1]) {
      options.journey = args[++i];
    } else if (arg === '--speed' && args[i + 1]) {
      options.speed = parseFloat(args[++i]);
    }
  }

  const demo = new ThomasDemoVisualizer(options);

  demo.run()
    .catch(error => {
      console.error('\nFatal error:', error.message);
      process.exit(1);
    });
}

export default ThomasDemoVisualizer;
