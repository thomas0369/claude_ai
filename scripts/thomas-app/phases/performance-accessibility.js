/**
 * Phase 5: Performance & Accessibility
 *
 * Core Web Vitals, Lighthouse audit, accessibility deep scan
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

async function run(orchestrator) {
  const { page, config } = orchestrator;

  console.log(`📊 Measuring performance & accessibility...\n`);

  const results = {
    performanceScore: 0,
    a11yScore: 0,
    coreWebVitals: {},
    lighthouse: null,
    accessibilityIssues: []
  };

  // Core Web Vitals
  console.log(`  Measuring Core Web Vitals...`);
  results.coreWebVitals = await measureCoreWebVitals(page);
  console.log(`    LCP: ${results.coreWebVitals.lcp}ms`);
  console.log(`    FID: ${results.coreWebVitals.fid || 'N/A'}ms`);
  console.log(`    CLS: ${results.coreWebVitals.cls.toFixed(3)}`);

  // Performance score from CWV
  results.performanceScore = calculatePerformanceScore(results.coreWebVitals);

  // Accessibility scan with axe-core
  console.log(`\n  Running accessibility scan...`);
  const a11yResults = await runAccessibilityScan(page);
  results.accessibilityIssues = a11yResults.violations;
  results.a11yScore = calculateA11yScore(a11yResults);
  console.log(`    Violations: ${a11yResults.violations.length}`);
  console.log(`    Score: ${results.a11yScore}/100`);

  // Lighthouse (if available)
  try {
    console.log(`\n  Running Lighthouse audit...`);
    results.lighthouse = await runLighthouse(config.baseUrl, config.outputDir);
    console.log(`    Performance: ${results.lighthouse.performance}`);
    console.log(`    Accessibility: ${results.lighthouse.accessibility}`);
    console.log(`    SEO: ${results.lighthouse.seo}`);
  } catch (error) {
    console.log(`    ⚠️  Lighthouse unavailable: ${error.message}`);
  }

  return results;
}

async function measureCoreWebVitals(page) {
  return await page.evaluate(() => {
    return new Promise((resolve) => {
      const vitals = { lcp: 0, fid: null, cls: 0 };

      // LCP
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        vitals.lcp = lastEntry.renderTime || lastEntry.loadTime;
      }).observe({ entryTypes: ['largest-contentful-paint'], buffered: true });

      // CLS
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            vitals.cls += entry.value;
          }
        }
      }).observe({ entryTypes: ['layout-shift'], buffered: true });

      setTimeout(() => resolve(vitals), 3000);
    });
  });
}

function calculatePerformanceScore(vitals) {
  let score = 100;

  // LCP scoring
  if (vitals.lcp > 4000) score -= 30;
  else if (vitals.lcp > 2500) score -= 15;

  // CLS scoring
  if (vitals.cls > 0.25) score -= 30;
  else if (vitals.cls > 0.1) score -= 15;

  return Math.max(0, score);
}

async function runAccessibilityScan(page) {
  // Inject axe-core
  await page.addScriptTag({
    url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.7.2/axe.min.js'
  });

  // Run axe
  const results = await page.evaluate(() => {
    return new Promise((resolve) => {
      // @ts-ignore
      window.axe.run((err, results) => {
        if (err) throw err;
        resolve(results);
      });
    });
  });

  return {
    violations: results.violations.map(v => ({
      id: v.id,
      impact: v.impact,
      description: v.description,
      help: v.help,
      helpUrl: v.helpUrl,
      nodes: v.nodes.length
    })),
    passes: results.passes.length,
    incomplete: results.incomplete.length
  };
}

function calculateA11yScore(results) {
  const totalTests = results.violations.length + results.passes;
  if (totalTests === 0) return 100;

  const criticalViolations = results.violations.filter(v => v.impact === 'critical').length;
  const seriousViolations = results.violations.filter(v => v.impact === 'serious').length;

  let score = 100;
  score -= criticalViolations * 15;
  score -= seriousViolations * 10;
  score -= (results.violations.length - criticalViolations - seriousViolations) * 5;

  return Math.max(0, score);
}

async function runLighthouse(url, outputDir) {
  try {
    const { stdout } = await execAsync(
      `npx lighthouse ${url} --output json --output-path ${outputDir}/lighthouse.json --chrome-flags="--headless" --only-categories=performance,accessibility,seo,best-practices --quiet`
    );

    const fs = require('fs');
    const report = JSON.parse(fs.readFileSync(`${outputDir}/lighthouse.json`, 'utf8'));

    return {
      performance: Math.round(report.categories.performance.score * 100),
      accessibility: Math.round(report.categories.accessibility.score * 100),
      seo: Math.round(report.categories.seo.score * 100),
      bestPractices: Math.round(report.categories['best-practices'].score * 100)
    };
  } catch (error) {
    throw new Error(`Lighthouse failed: ${error.message}`);
  }
}

module.exports = { run };
