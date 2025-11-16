#!/usr/bin/env node

/**
 * Debug Mode Demonstration Script
 *
 * This script demonstrates thomas-app debug mode by running
 * a simple customer journey on the demo application.
 */

import { chromium } from 'playwright';
import { ActionLogger } from './lib/debug/action-logger.js';
import { getDebugConfig } from './config/debug-config.js';
import fs from 'fs';

const DEBUG_LEVEL = process.argv[2] || 'basic';
const BASE_URL = 'http://localhost:8888';

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🐛 Thomas App Debug Mode Demonstration');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`Debug Level: ${DEBUG_LEVEL}`);
console.log(`Base URL: ${BASE_URL}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

async function runDemo() {
  // Get debug configuration
  const debugConfig = getDebugConfig(DEBUG_LEVEL);

  if (debugConfig.enabled) {
    console.log('[DEBUG] Debug mode configuration:');
    console.log(`[DEBUG] - Action logging: ${debugConfig.actionLog}`);
    console.log(`[DEBUG] - Element state: ${debugConfig.elementState?.enabled || false}`);
    console.log(`[DEBUG] - Screenshots: ${debugConfig.screenshots.mode}`);
    console.log(`[DEBUG] - Network logging: ${debugConfig.networkLog.enabled}`);
    console.log(`[DEBUG] - Output directory: ${debugConfig.outputDir}\n`);
  }

  // Launch browser
  console.log('🚀 Launching browser...\n');
  const browser = await chromium.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });

  const page = await context.newPage();

  // Initialize action logger if debug enabled
  let actionLogger = null;
  if (debugConfig.enabled) {
    actionLogger = new ActionLogger(page, debugConfig, debugConfig.outputDir);
    console.log('[DEBUG] Action logger initialized\n');
  }

  // Set up console monitoring
  const consoleMessages = [];
  page.on('console', msg => {
    const entry = {
      type: msg.type(),
      text: msg.text(),
      timestamp: new Date().toISOString()
    };
    consoleMessages.push(entry);

    if (msg.type() === 'error') {
      console.log(`[CONSOLE ERROR] ${msg.text()}`);
    } else if (msg.type() === 'warning') {
      console.log(`[CONSOLE WARNING] ${msg.text()}`);
    } else if (debugConfig.enabled && debugConfig.consoleLog) {
      console.log(`[CONSOLE ${msg.type().toUpperCase()}] ${msg.text()}`);
    }
  });

  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Starting Demo Customer Journey');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Step 1: Navigate to page
    console.log('Step 1: Navigate to demo page');
    await page.goto(`${BASE_URL}/index.html`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Step 2: Fill username
    console.log('Step 2: Fill username field');
    await page.fill('input[data-testid="username-input"]', 'debug_user');
    await page.waitForTimeout(500);

    // Step 3: Fill email
    console.log('Step 3: Fill email field');
    await page.fill('input[data-testid="email-input"]', 'debug@example.com');
    await page.waitForTimeout(500);

    // Step 4: Select role
    console.log('Step 4: Select role');
    await page.selectOption('select[data-testid="role-select"]', 'developer');
    await page.waitForTimeout(500);

    // Step 5: Click submit button
    console.log('Step 5: Click submit button');
    await page.click('button[data-testid="submit-button"]');
    await page.waitForTimeout(2000);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Demo Journey Complete');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Show console messages captured
    console.log('Console Messages Captured:');
    console.log(`  - Total: ${consoleMessages.length}`);
    console.log(`  - Errors: ${consoleMessages.filter(m => m.type === 'error').length}`);
    console.log(`  - Warnings: ${consoleMessages.filter(m => m.type === 'warning').length}`);
    console.log(`  - Info: ${consoleMessages.filter(m => m.type === 'log').length}\n`);

    // Save console log
    if (debugConfig.enabled) {
      const consoleLogPath = `${debugConfig.outputDir}/console-messages.json`;
      if (!fs.existsSync(debugConfig.outputDir)) {
        fs.mkdirSync(debugConfig.outputDir, { recursive: true });
      }
      fs.writeFileSync(consoleLogPath, JSON.stringify(consoleMessages, null, 2));
      console.log(`[DEBUG] Console log saved: ${consoleLogPath}\n`);
    }

    // Close action logger
    if (actionLogger) {
      await actionLogger.close();
      console.log('[DEBUG] Action logger closed\n');
    }

    // Show debug artifacts summary
    if (debugConfig.enabled) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('[DEBUG] Debug Artifacts Created');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      // Count screenshots
      let screenshotCount = 0;
      const screenshotsDir = `${debugConfig.outputDir}/screenshots`;
      if (fs.existsSync(screenshotsDir)) {
        screenshotCount = fs.readdirSync(screenshotsDir).length;
      }

      console.log(`[DEBUG] - Actions log: ${debugConfig.outputDir}/actions.jsonl`);
      console.log(`[DEBUG] - Console log: ${debugConfig.outputDir}/console-messages.json`);
      console.log(`[DEBUG] - Screenshots: ${screenshotCount} files`);

      if (screenshotCount > 0) {
        console.log(`[DEBUG] - Screenshot directory: ${screenshotsDir}`);
      }

      console.log('[DEBUG]\n[DEBUG] To view action log:');
      console.log(`[DEBUG]   cat ${debugConfig.outputDir}/actions.jsonl | jq .`);
      console.log('[DEBUG]\n[DEBUG] To filter for errors:');
      console.log(`[DEBUG]   jq 'select(.success == false)' ${debugConfig.outputDir}/actions.jsonl`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    }

  } catch (error) {
    console.error('\n❌ Error during demo:', error.message);
    console.error(error.stack);
  } finally {
    // Keep browser open for 3 seconds to see the result
    console.log('Keeping browser open for 3 seconds...\n');
    await page.waitForTimeout(3000);

    await page.close();
    await context.close();
    await browser.close();

    console.log('✅ Browser closed\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Demo Complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  }
}

runDemo().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
