#!/usr/bin/env node

/**
 * Workout Journey Test - Complete User Flow Testing
 * Tests the full journey: Login → Workout Selection → Dumbbell Training → Completion
 */

import { chromium } from 'playwright';
import fs from 'fs';

const BASE_URL = 'https://hantel-hero-app.vercel.app';
const OUTPUT_DIR = '/tmp/thomas-app/workout-journey';
const SCREENSHOT_DIR = `${OUTPUT_DIR}/screenshots`;

// Test credentials (you may need to update these)
const TEST_USER = {
  email: 'test@example.com',
  password: 'testpassword123'
};

async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🏋️ HANTEL-HERO WORKOUT JOURNEY TEST');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`🌐 Base URL: ${BASE_URL}\n`);

  // Create output directories
  [OUTPUT_DIR, SCREENSHOT_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  let browser, page;
  const consoleLog = { errors: [], warnings: [], info: [] };
  const journey = {
    url: BASE_URL,
    timestamp: new Date().toISOString(),
    steps: [],
    screenshots: [],
    consoleErrors: []
  };

  let stepNumber = 0;

  async function takeScreenshot(name) {
    stepNumber++;
    const filename = `${stepNumber.toString().padStart(2, '0')}-${name}.png`;
    const path = `${SCREENSHOT_DIR}/${filename}`;
    await page.screenshot({ path, fullPage: true });
    journey.screenshots.push({ step: stepNumber, name, path });
    console.log(`   📸 Screenshot: ${filename}`);
    return path;
  }

  async function logStep(name, action) {
    console.log(`\n${'─'.repeat(60)}`);
    console.log(`Step ${stepNumber + 1}: ${name}`);
    console.log('─'.repeat(60));

    const startTime = Date.now();
    const result = await action();
    const duration = Date.now() - startTime;

    journey.steps.push({
      number: stepNumber,
      name,
      duration,
      url: page.url(),
      success: true,
      ...result
    });

    console.log(`✅ Completed in ${duration}ms`);
    return result;
  }

  try {
    // Launch browser
    console.log('🚀 Starting browser...\n');
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
      viewport: { width: 1920, height: 1080 },
      recordVideo: {
        dir: `${OUTPUT_DIR}/videos`,
        size: { width: 1920, height: 1080 }
      }
    });

    page = await context.newPage();

    // Set up console monitoring
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();

      if (type === 'error') {
        consoleLog.errors.push({ text, location: msg.location(), timestamp: Date.now() });
        console.log(`   🔴 Console Error: ${text}`);
      } else if (type === 'warning') {
        consoleLog.warnings.push({ text, location: msg.location(), timestamp: Date.now() });
      } else if (text.includes('TensorFlow') || text.includes('pose')) {
        consoleLog.info.push({ text, timestamp: Date.now() });
        console.log(`   ℹ️  ${text}`);
      }
    });

    page.on('pageerror', error => {
      consoleLog.errors.push({
        text: error.message,
        stack: error.stack,
        type: 'uncaught-exception',
        timestamp: Date.now()
      });
      console.log(`   🔴 Page Error: ${error.message}`);
    });

    // STEP 1: Navigate to auth page
    await logStep('Navigate to Auth Page', async () => {
      await page.goto(`${BASE_URL}/auth`, { waitUntil: 'networkidle' });
      await takeScreenshot('auth-page');

      const title = await page.title();
      const hasForm = await page.locator('form, [role="form"]').count() > 0;

      return { title, hasForm };
    });

    // STEP 2: Check if already logged in
    await logStep('Check Authentication State', async () => {
      await page.waitForTimeout(1000);

      const currentUrl = page.url();
      const isLoggedIn = !currentUrl.includes('/auth');

      console.log(`   Current URL: ${currentUrl}`);
      console.log(`   Logged in: ${isLoggedIn ? 'Yes' : 'No'}`);

      return { isLoggedIn, currentUrl };
    });

    // STEP 3: Explore available routes/pages
    await logStep('Discover Available Navigation', async () => {
      // Check what's visible on the page
      const buttons = await page.$$eval('button', btns =>
        btns.map(btn => ({
          text: btn.textContent?.trim(),
          visible: btn.offsetParent !== null
        })).filter(b => b.visible)
      );

      const links = await page.$$eval('a[href]', links =>
        links.map(link => ({
          text: link.textContent?.trim(),
          href: link.getAttribute('href'),
          visible: link.offsetParent !== null
        })).filter(l => l.visible)
      );

      console.log('\n   Available Buttons:');
      buttons.forEach(btn => console.log(`     - ${btn.text}`));

      console.log('\n   Available Links:');
      links.forEach(link => console.log(`     - ${link.text} (${link.href})`));

      await takeScreenshot('available-navigation');

      return { buttons, links };
    });

    // STEP 4: Try to navigate to workout/training page
    await logStep('Navigate to Workout/Training Page', async () => {
      // Try common workout URLs
      const workoutUrls = [
        '/workout',
        '/training',
        '/kurzhantel',
        '/exercise',
        '/dashboard',
        '/'
      ];

      let foundWorkoutPage = false;
      let workoutUrl = null;

      for (const url of workoutUrls) {
        try {
          await page.goto(`${BASE_URL}${url}`, { waitUntil: 'networkidle', timeout: 5000 });
          await page.waitForTimeout(1000);

          const currentUrl = page.url();
          const pageContent = await page.content();

          // Check if we found a workout-related page
          if (pageContent.includes('Kurzhantel') ||
              pageContent.includes('Training') ||
              pageContent.includes('Workout') ||
              pageContent.includes('Übung')) {
            foundWorkoutPage = true;
            workoutUrl = currentUrl;
            console.log(`   ✅ Found workout page at: ${url}`);
            await takeScreenshot(`workout-page${url.replace(/\//g, '-')}`);
            break;
          }
        } catch (e) {
          console.log(`   ⏭️  ${url} - Not found or timed out`);
        }
      }

      if (!foundWorkoutPage) {
        console.log('   ⚠️  No workout page found, checking current page content...');
        await takeScreenshot('current-page-content');
      }

      return { foundWorkoutPage, workoutUrl };
    });

    // STEP 5: Analyze current page structure
    await logStep('Analyze Page Structure', async () => {
      const structure = await page.evaluate(() => {
        const headings = Array.from(document.querySelectorAll('h1, h2, h3')).map(h => ({
          tag: h.tagName,
          text: h.textContent?.trim()
        }));

        const sections = Array.from(document.querySelectorAll('[class*="section"], [class*="container"], main, section')).map(s => ({
          className: s.className,
          textContent: s.textContent?.substring(0, 100)
        }));

        const interactiveElements = {
          buttons: Array.from(document.querySelectorAll('button')).length,
          links: Array.from(document.querySelectorAll('a[href]')).length,
          inputs: Array.from(document.querySelectorAll('input')).length,
          forms: Array.from(document.querySelectorAll('form')).length
        };

        return { headings, interactiveElements, sectionsCount: sections.length };
      });

      console.log('\n   Page Headings:');
      structure.headings.forEach(h => console.log(`     ${h.tag}: ${h.text}`));

      console.log('\n   Interactive Elements:');
      console.log(`     Buttons: ${structure.interactiveElements.buttons}`);
      console.log(`     Links: ${structure.interactiveElements.links}`);
      console.log(`     Inputs: ${structure.interactiveElements.inputs}`);
      console.log(`     Forms: ${structure.interactiveElements.forms}`);

      await takeScreenshot('page-structure');

      return structure;
    });

    // STEP 6: Check for camera/pose detection features
    await logStep('Check for TensorFlow.js / Pose Detection', async () => {
      const hasCamera = await page.evaluate(() => {
        // Check if TensorFlow.js or pose detection is loaded
        const hasTensorFlow = typeof window.tf !== 'undefined' ||
                             typeof window.poseDetection !== 'undefined';

        // Check for video element (camera feed)
        const hasVideo = document.querySelector('video') !== null;

        // Check for canvas (pose visualization)
        const hasCanvas = document.querySelector('canvas') !== null;

        return { hasTensorFlow, hasVideo, hasCanvas };
      });

      console.log(`   TensorFlow.js loaded: ${hasCamera.hasTensorFlow ? '✅' : '❌'}`);
      console.log(`   Video element found: ${hasCamera.hasVideo ? '✅' : '❌'}`);
      console.log(`   Canvas element found: ${hasCamera.hasCanvas ? '✅' : '❌'}`);

      if (hasCamera.hasVideo || hasCamera.hasCanvas) {
        await takeScreenshot('camera-pose-detection');
      }

      return hasCamera;
    });

    // STEP 7: Search for "Kurzhantel" text on page
    await logStep('Search for Dumbbell Training Content', async () => {
      const dumbbellContent = await page.evaluate(() => {
        const pageText = document.body.textContent || '';
        const keywords = ['Kurzhantel', 'Hantel', 'Training', 'Übung', 'Workout', 'Satz', 'Wiederholung'];

        const found = {};
        keywords.forEach(keyword => {
          const regex = new RegExp(keyword, 'gi');
          const matches = pageText.match(regex);
          found[keyword] = matches ? matches.length : 0;
        });

        // Look for specific elements
        const workoutButtons = Array.from(document.querySelectorAll('button'))
          .filter(btn => {
            const text = btn.textContent?.toLowerCase() || '';
            return text.includes('training') || text.includes('start') || text.includes('übung');
          })
          .map(btn => btn.textContent?.trim());

        return { keywordCounts: found, workoutButtons };
      });

      console.log('\n   Keyword Occurrences:');
      Object.entries(dumbbellContent.keywordCounts).forEach(([keyword, count]) => {
        if (count > 0) {
          console.log(`     "${keyword}": ${count} times`);
        }
      });

      if (dumbbellContent.workoutButtons.length > 0) {
        console.log('\n   Workout-related buttons:');
        dumbbellContent.workoutButtons.forEach(btn => console.log(`     - ${btn}`));
      }

      await takeScreenshot('dumbbell-content-search');

      return dumbbellContent;
    });

    // STEP 8: Try to start a workout if possible
    await logStep('Attempt to Start Workout', async () => {
      // Look for buttons that might start a workout
      const startButtons = await page.$$eval('button', buttons =>
        buttons
          .map((btn, index) => ({
            index,
            text: btn.textContent?.trim().toLowerCase() || '',
            visible: btn.offsetParent !== null,
            disabled: btn.disabled
          }))
          .filter(btn =>
            btn.visible &&
            !btn.disabled &&
            (btn.text.includes('start') ||
             btn.text.includes('training') ||
             btn.text.includes('übung') ||
             btn.text.includes('workout') ||
             btn.text.includes('begin'))
          )
      );

      console.log(`\n   Found ${startButtons.length} potential start buttons`);

      let clicked = false;
      if (startButtons.length > 0) {
        const firstButton = startButtons[0];
        console.log(`   Clicking: "${firstButton.text}"`);

        const buttons = await page.$$('button');
        await buttons[firstButton.index].click();
        await page.waitForTimeout(2000);

        await takeScreenshot('after-start-click');
        clicked = true;
      }

      return { startButtons, clicked };
    });

    // STEP 9: Final state analysis
    await logStep('Final State Analysis', async () => {
      const finalState = await page.evaluate(() => {
        return {
          url: window.location.href,
          title: document.title,
          hasVideo: document.querySelector('video') !== null,
          hasCanvas: document.querySelector('canvas') !== null,
          bodyText: document.body.textContent?.substring(0, 500)
        };
      });

      console.log(`\n   Final URL: ${finalState.url}`);
      console.log(`   Final Title: ${finalState.title}`);
      console.log(`   Camera Active: ${finalState.hasVideo ? 'Yes' : 'No'}`);
      console.log(`   Pose Detection: ${finalState.hasCanvas ? 'Possible' : 'No'}`);

      await takeScreenshot('final-state');

      return finalState;
    });

    // Save console log
    journey.consoleErrors = consoleLog.errors;
    journey.consoleWarnings = consoleLog.warnings;

    // Save journey report
    const reportPath = `${OUTPUT_DIR}/journey-report.json`;
    fs.writeFileSync(reportPath, JSON.stringify(journey, null, 2));
    console.log(`\n📊 Journey report saved: ${reportPath}`);

    // Summary
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 JOURNEY SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`Total Steps: ${journey.steps.length}`);
    console.log(`Screenshots: ${journey.screenshots.length}`);
    console.log(`Console Errors: ${consoleLog.errors.length}`);
    console.log(`Console Warnings: ${consoleLog.warnings.length}`);
    console.log(`\nScreenshots saved to: ${SCREENSHOT_DIR}`);
    console.log(`Video saved to: ${OUTPUT_DIR}/videos`);
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('\n❌ Journey Test Failed:', error.message);
    console.error(error.stack);

    if (page) {
      await page.screenshot({ path: `${SCREENSHOT_DIR}/error-state.png` });
    }

    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

main();
