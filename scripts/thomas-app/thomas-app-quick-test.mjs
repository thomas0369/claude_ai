#!/usr/bin/env node

/**
 * Quick Thomas App Test
 * Simplified version for production URL testing
 */

import { chromium } from 'playwright';
import fs from 'fs';

const URL = 'https://hantel-hero-app.vercel.app/auth';
const OUTPUT_DIR = '/tmp/thomas-app';

async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📱 THOMAS APP - QUICK PRODUCTION TEST');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`🌐 URL: ${URL}\n`);

  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  let browser, page;
  const consoleLog = { errors: [], warnings: [], info: [] };
  const results = {
    url: URL,
    timestamp: new Date().toISOString(),
    phases: {}
  };

  try {
    // Launch browser
    console.log('🚀 Starting browser...');
    browser = await chromium.launch({
      headless: false,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-software-rasterizer',
        '--disable-gpu'
      ]
    });

    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });

    page = await context.newPage();

    // Set up console monitoring
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();

      if (type === 'error') {
        consoleLog.errors.push({ text, location: msg.location() });
      } else if (type === 'warning') {
        consoleLog.warnings.push({ text, location: msg.location() });
      }
    });

    page.on('pageerror', error => {
      consoleLog.errors.push({
        text: error.message,
        stack: error.stack,
        type: 'uncaught-exception'
      });
    });

    console.log('✅ Browser ready\n');

    // Phase 1: Load page and screenshot
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('PHASE 1: Page Load & Visual Check');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const loadStart = Date.now();
    await page.goto(URL, { waitUntil: 'networkidle' });
    const loadTime = Date.now() - loadStart;

    console.log(`✅ Page loaded in ${loadTime}ms`);

    // Screenshot
    const screenshotPath = `${OUTPUT_DIR}/auth-page.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`📸 Screenshot: ${screenshotPath}\n`);

    results.phases.load = {
      loadTime,
      screenshot: screenshotPath
    };

    // Phase 2: Check page content
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('PHASE 2: Content & Elements Check');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Check for auth elements
    const title = await page.title();
    console.log(`📄 Page Title: "${title}"`);

    const hasLoginForm = await page.locator('form, [role="form"]').count() > 0;
    console.log(`🔐 Login Form Present: ${hasLoginForm ? '✅' : '❌'}`);

    const buttons = await page.locator('button').count();
    console.log(`🔘 Buttons Found: ${buttons}`);

    const inputs = await page.locator('input').count();
    console.log(`📝 Input Fields Found: ${inputs}`);

    results.phases.content = {
      title,
      hasLoginForm,
      buttonCount: buttons,
      inputCount: inputs
    };

    // Phase 3: Test interactions
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('PHASE 3: Button & Link Testing');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const buttonList = await page.$$eval('button', btns =>
      btns.map(btn => ({
        text: btn.textContent?.trim() || '',
        visible: btn.offsetParent !== null,
        disabled: btn.disabled
      }))
    );

    console.log('Buttons found:');
    buttonList.forEach((btn, i) => {
      const status = btn.disabled ? '🚫 Disabled' : btn.visible ? '✅ Visible' : '❌ Hidden';
      console.log(`  ${i + 1}. "${btn.text}" - ${status}`);
    });

    results.phases.interactions = {
      buttons: buttonList
    };

    // Phase 4: Console errors check
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('PHASE 4: Console Error Analysis');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log(`🔴 Errors: ${consoleLog.errors.length}`);
    console.log(`🟡 Warnings: ${consoleLog.warnings.length}\n`);

    if (consoleLog.errors.length > 0) {
      console.log('Console Errors:');
      consoleLog.errors.slice(0, 5).forEach((err, i) => {
        console.log(`  ${i + 1}. ${err.text}`);
        if (err.location) {
          console.log(`     ${err.location.url}:${err.location.lineNumber}`);
        }
      });

      if (consoleLog.errors.length > 5) {
        console.log(`  ... and ${consoleLog.errors.length - 5} more errors\n`);
      }
    }

    results.phases.console = {
      errors: consoleLog.errors,
      warnings: consoleLog.warnings
    };

    // Phase 5: Performance metrics
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('PHASE 5: Performance Metrics');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      return {
        domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart,
        loadComplete: navigation?.loadEventEnd - navigation?.loadEventStart,
        domInteractive: navigation?.domInteractive,
        totalSize: performance.getEntriesByType('resource')
          .reduce((sum, r) => sum + (r.transferSize || 0), 0)
      };
    });

    console.log(`⚡ DOM Content Loaded: ${Math.round(metrics.domContentLoaded)}ms`);
    console.log(`⚡ Load Complete: ${Math.round(metrics.loadComplete)}ms`);
    console.log(`📦 Total Transfer Size: ${Math.round(metrics.totalSize / 1024)}KB\n`);

    results.phases.performance = metrics;

    // Phase 6: Accessibility quick check
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('PHASE 6: Accessibility Quick Check');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const a11y = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      const imagesWithoutAlt = images.filter(img => !img.alt);

      const buttonsWithoutLabel = Array.from(document.querySelectorAll('button'))
        .filter(btn => !btn.textContent?.trim() && !btn.ariaLabel);

      return {
        imagesWithoutAlt: imagesWithoutAlt.length,
        buttonsWithoutLabel: buttonsWithoutLabel.length,
        hasLang: !!document.documentElement.lang
      };
    });

    console.log(`📷 Images without alt text: ${a11y.imagesWithoutAlt}`);
    console.log(`🔘 Buttons without labels: ${a11y.buttonsWithoutLabel}`);
    console.log(`🌐 Language attribute: ${a11y.hasLang ? '✅' : '❌'}\n`);

    results.phases.accessibility = a11y;

    // Save full results
    const reportPath = `${OUTPUT_DIR}/quick-test-results.json`;
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    console.log(`📊 Full results: ${reportPath}`);

    // Summary
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const issues = [];
    if (consoleLog.errors.length > 0) {
      issues.push(`🔴 ${consoleLog.errors.length} console errors`);
    }
    if (!hasLoginForm) {
      issues.push('❌ No login form detected');
    }
    if (a11y.imagesWithoutAlt > 0) {
      issues.push(`⚠️  ${a11y.imagesWithoutAlt} images without alt text`);
    }
    if (loadTime > 3000) {
      issues.push(`⚠️  Slow page load (${loadTime}ms)`);
    }

    if (issues.length === 0) {
      console.log('✅ No critical issues found!\n');
    } else {
      console.log('Issues Found:');
      issues.forEach(issue => console.log(`  ${issue}`));
      console.log();
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('\n❌ Test Failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

main();
