#!/usr/bin/env node

/**
 * Thomas App - Complete Application Testing Orchestrator
 *
 * Main orchestrator that coordinates all testing phases
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ThomasAppOrchestrator {
  constructor(options = {}) {
    this.options = {
      quick: options.quick || false,
      deep: options.deep || false,
      suites: options.suites || null,
      appType: options.appType || null,
      configPath: options.configPath || '.thomas-app.json',
      ...options
    };

    this.config = this.loadConfig();
    this.results = {
      phases: {},
      issues: [],
      metrics: {},
      startTime: Date.now()
    };

    this.browser = null;
    this.context = null;
    this.page = null;

    // Setup cleanup handlers for graceful shutdown
    this.setupProcessCleanup();
  }

  detectWSL() {
    try {
      // Check /proc/version for Microsoft/WSL identifiers
      if (fs.existsSync('/proc/version')) {
        const version = fs.readFileSync('/proc/version', 'utf8').toLowerCase();
        return version.includes('microsoft') || version.includes('wsl');
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  loadConfig() {
    // Default configuration
    const defaultConfig = {
      appType: null,  // Will be auto-detected
      baseUrl: process.env.BASE_URL || 'http://localhost:3000',
      testSuites: {
        discovery: true,
        customerJourneys: true,
        visualAnalysis: true,
        interactions: true,
        screenFlow: true,  // Comprehensive interaction testing + flow mapping
        gameAI: false,  // Auto-enabled if game detected
        performance: true,
        accessibility: true,
        security: true,
        seo: true,
        analytics: false,
        realWorld: true,
        agentReviews: true,  // Always enabled by default (deep mode)
        autofix: true  // Autonomous iterative bug fixing enabled by default
      },
      thresholds: {
        lcp: 2500,
        fid: 100,
        cls: 0.1,
        lighthouseMin: 90,
        accessibilityMin: 90
      },
      viewports: [
        { name: 'Desktop', width: 1920, height: 1080 },
        { name: 'Laptop', width: 1366, height: 768 },
        { name: 'Tablet', width: 768, height: 1024 },
        { name: 'Mobile', width: 375, height: 667 }
      ],
      baseline: {
        enabled: true,
        path: '.thomas-app/baseline'
      },
      outputDir: '/tmp/thomas-app'
    };

    // Load user config if exists
    if (fs.existsSync(this.options.configPath)) {
      try {
        const userConfig = JSON.parse(fs.readFileSync(this.options.configPath, 'utf8'));
        return { ...defaultConfig, ...userConfig };
      } catch (error) {
        console.warn(`⚠️  Failed to load config from ${this.options.configPath}: ${error.message}`);
        return defaultConfig;
      }
    }

    return defaultConfig;
  }

  async initialize() {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📱 THOMAS APP - COMPLETE APPLICATION TESTING');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Create output directory
    if (!fs.existsSync(this.config.outputDir)) {
      fs.mkdirSync(this.config.outputDir, { recursive: true });
    }

    // Detect WSL2 environment
    const isWSL = this.detectWSL();
    if (isWSL) {
      console.log('⚙️  WSL2 detected - applying compatibility flags');
    }

    // Build browser launch args with WSL2 compatibility
    const launchArgs = [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage'
    ];

    if (isWSL) {
      launchArgs.push('--disable-software-rasterizer');
      launchArgs.push('--disable-gpu');
    }

    // Launch browser
    console.log('🚀 Starting browser...');
    this.browser = await chromium.launch({
      headless: false,  // Run in headed mode to see tests
      args: launchArgs
    });

    this.context = await this.browser.newContext({
      viewport: this.config.viewports[0],  // Start with desktop
      recordVideo: {
        dir: path.join(this.config.outputDir, 'videos'),
        size: { width: 1920, height: 1080 }
      }
    });

    this.page = await this.context.newPage();

    // Set up console monitoring
    this.setupConsoleMonitoring();

    console.log('✅ Browser ready\n');
  }

  setupConsoleMonitoring() {
    const MAX_ENTRIES = 1000; // Limit to prevent memory issues

    this.consoleLog = {
      errors: [],
      warnings: [],
      info: [],
      network: []
    };

    this.page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      const location = msg.location();

      const entry = {
        type,
        text,
        location,
        timestamp: Date.now(),
        url: this.page.url()
      };

      if (type === 'error') {
        this.consoleLog.errors.push(entry);
        // Limit array size to prevent memory exhaustion
        if (this.consoleLog.errors.length > MAX_ENTRIES) {
          this.consoleLog.errors.shift();
        }
      } else if (type === 'warning') {
        this.consoleLog.warnings.push(entry);
        if (this.consoleLog.warnings.length > MAX_ENTRIES) {
          this.consoleLog.warnings.shift();
        }
      } else {
        // Only keep recent info logs (they're less critical)
        if (this.consoleLog.info.length < MAX_ENTRIES / 10) {
          this.consoleLog.info.push(entry);
        }
      }
    });

    this.page.on('pageerror', error => {
      const entry = {
        type: 'uncaught-exception',
        text: error.message,
        stack: error.stack,
        timestamp: Date.now(),
        url: this.page.url()
      };

      this.consoleLog.errors.push(entry);
      if (this.consoleLog.errors.length > MAX_ENTRIES) {
        this.consoleLog.errors.shift();
      }
    });

    this.page.on('requestfailed', request => {
      const entry = {
        type: 'failed-request',
        url: request.url(),
        method: request.method(),
        failure: request.failure(),
        timestamp: Date.now()
      };

      this.consoleLog.network.push(entry);
      if (this.consoleLog.network.length > MAX_ENTRIES) {
        this.consoleLog.network.shift();
      }
    });
  }

  async run() {
    try {
      await this.initialize();

      // Phase 1: Discovery
      if (this.isSuiteEnabled('discovery')) {
        await this.runPhase1Discovery();
      }

      // Phase 2: Customer Journey Testing
      if (this.isSuiteEnabled('customerJourneys')) {
        await this.runPhase2CustomerJourneys();
      }

      // Phase 3: Visual & Interaction Analysis
      if (this.isSuiteEnabled('visualAnalysis') || this.isSuiteEnabled('interactions')) {
        await this.runPhase3VisualInteraction();
      }

      // Phase 3.5: Screen Flow & Comprehensive Interaction Testing
      if (this.isSuiteEnabled('screenFlow')) {
        await this.runPhase3ScreenFlow();
      }

      // Phase 4: Specialized Testing (context-aware)
      await this.runPhase4Specialized();

      // Phase 5: Performance & Accessibility
      if (this.isSuiteEnabled('performance') || this.isSuiteEnabled('accessibility')) {
        await this.runPhase5PerformanceAccessibility();
      }

      // Phase 6: Security & Analytics
      if (this.isSuiteEnabled('security') || this.isSuiteEnabled('analytics')) {
        await this.runPhase6SecurityAnalytics();
      }

      // Phase 7: Real-World Conditions
      if (this.isSuiteEnabled('realWorld')) {
        await this.runPhase7RealWorld();
      }

      // Phase 7.3: Code Quality Scanning
      await this.runPhase7CodeQuality();

      // Phase 7.5: Agent Reviews (enabled by default)
      if (this.isSuiteEnabled('agentReviews')) {
        await this.runPhase7AgentReviews();
      }

      // Phase 7.9: Autonomous Bug Fixing (enabled by default)
      if (this.isSuiteEnabled('autofix')) {
        await this.runPhase7AutonomousBugFixing();
      }

      // Phase 8: Generate Reports
      await this.runPhase8Reporting();

    } catch (error) {
      console.error('\n❌ Fatal error:', error);
      this.results.fatalError = {
        message: error.message,
        stack: error.stack
      };
    } finally {
      await this.cleanup();
    }
  }

  isSuiteEnabled(suite) {
    // If specific suites specified, only run those
    if (this.options.suites) {
      const suites = this.options.suites.split(',');
      return suites.includes(suite);
    }

    // Quick mode: only critical tests
    if (this.options.quick) {
      return ['discovery', 'customerJourneys', 'visualAnalysis'].includes(suite);
    }

    // Otherwise use config
    return this.config.testSuites[suite];
  }

  async runPhase1Discovery() {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('PHASE 1: Discovery & Context Analysis');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    try {
      const discovery = await import('./phases/discovery.mjs');
      this.results.phases.discovery = await discovery.run(this);

      console.log(`\n✅ Phase 1 Complete`);
      console.log(`   App Type: ${this.results.phases.discovery.appType}`);
      console.log(`   Routes Found: ${this.results.phases.discovery.routes.length}`);
      console.log(`   Features Detected: ${this.results.phases.discovery.features.length}\n`);
    } catch (error) {
      console.log(`\n❌ Phase 1 Failed: ${error.message}`);
      this.results.phases.discovery = { error: error.message, stack: error.stack };
    }
  }

  async runPhase2CustomerJourneys() {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('PHASE 2: Customer Journey Testing');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    try {
      const journeys = await import('./phases/customer-journeys.js');
      this.results.phases.customerJourneys = await journeys.run(this);

      const total = this.results.phases.customerJourneys.journeys.length;
      const passed = this.results.phases.customerJourneys.journeys.filter(j => j.completed).length;

      console.log(`\n✅ Phase 2 Complete`);
      console.log(`   Journeys: ${passed}/${total} passed (${Math.round(passed/total*100)}%)`);
      console.log(`   Friction Points: ${this.results.phases.customerJourneys.totalFrictionPoints}\n`);
    } catch (error) {
      console.log(`\n❌ Phase 2 Failed: ${error.message}`);
      this.results.phases.customerJourneys = { error: error.message, stack: error.stack };
    }
  }

  async runPhase3VisualInteraction() {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('PHASE 3: Visual & Interaction Analysis');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const visual = await import('./phases/visual-interaction.js');
    this.results.phases.visualInteraction = await visual.run(this);

    console.log(`\n✅ Phase 3 Complete`);
    console.log(`   Screens Tested: ${this.results.phases.visualInteraction.screensTested}`);
    console.log(`   Visual Issues: ${this.results.phases.visualInteraction.visualIssues.length}`);
    console.log(`   Interaction Issues: ${this.results.phases.visualInteraction.interactionIssues.length}\n`);
  }

  async runPhase3ScreenFlow() {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('PHASE 3.5: Screen Flow & Comprehensive Interaction Testing');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const screenFlow = await import('./phases/screen-flow.js');
    this.results.phases.screenFlow = await screenFlow.run(this);

    console.log(`\n✅ Phase 3.5 Complete`);
    console.log(`   States Discovered: ${this.results.phases.screenFlow.coverage.states}`);
    console.log(`   Transitions Tested: ${this.results.phases.screenFlow.coverage.transitions}`);
    console.log(`   Total Interactions: ${this.results.phases.screenFlow.coverage.interactions}`);
    console.log(`   Flow Map Formats: ${this.results.phases.screenFlow.flowMap.formats.join(', ')}\n`);
  }

  async runPhase4Specialized() {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('PHASE 4: Specialized Testing');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const appType = this.results.phases.discovery?.appType || this.config.appType;

    // Game AI Player (if game)
    if (appType === 'game' || this.isSuiteEnabled('gameAI')) {
      try {
        console.log('🎮 Running Game AI Player...\n');
        const gameAI = await import('./phases/game-ai.js');
        this.results.phases.gameAI = await gameAI.run(this);
        console.log(`   ✅ Game AI Complete\n`);
      } catch (error) {
        console.log(`   ❌ Game AI Failed: ${error.message}\n`);
        this.results.phases.gameAI = { error: error.message, stack: error.stack };
      }
    }

    // E-commerce specific tests
    if (appType === 'ecommerce') {
      try {
        console.log('🛒 Running E-commerce Flow Tests...\n');
        const ecommerce = await import('./phases/ecommerce.js');
        this.results.phases.ecommerce = await ecommerce.run(this);
        console.log(`   ✅ E-commerce Tests Complete\n`);
      } catch (error) {
        console.log(`   ❌ E-commerce Tests Failed: ${error.message}\n`);
        this.results.phases.ecommerce = { error: error.message, stack: error.stack };
      }
    }

    // Content site SEO
    if (appType === 'content' && this.isSuiteEnabled('seo')) {
      try {
        console.log('📝 Running SEO Analysis...\n');
        const seo = await import('./phases/seo.js');
        this.results.phases.seo = await seo.run(this);
        console.log(`   ✅ SEO Analysis Complete\n`);
      } catch (error) {
        console.log(`   ❌ SEO Analysis Failed: ${error.message}\n`);
        this.results.phases.seo = { error: error.message, stack: error.stack };
      }
    }

    console.log(`✅ Phase 4 Complete\n`);
  }

  async runPhase5PerformanceAccessibility() {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('PHASE 5: Performance & Accessibility');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const perfA11y = await import('./phases/performance-accessibility.js');
    this.results.phases.performanceAccessibility = await perfA11y.run(this);

    console.log(`\n✅ Phase 5 Complete`);
    console.log(`   Performance Score: ${this.results.phases.performanceAccessibility.performanceScore}/100`);
    console.log(`   Accessibility Score: ${this.results.phases.performanceAccessibility.a11yScore}/100\n`);
  }

  async runPhase6SecurityAnalytics() {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('PHASE 6: Security & Analytics');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const security = await import('./phases/security-analytics.js');
    this.results.phases.securityAnalytics = await security.run(this);

    console.log(`\n✅ Phase 6 Complete`);
    console.log(`   Security Score: ${this.results.phases.securityAnalytics.securityScore}/100\n`);
  }

  async runPhase7RealWorld() {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('PHASE 7: Real-World Conditions');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const realWorld = await import('./phases/real-world.js');
    this.results.phases.realWorld = await realWorld.run(this);

    console.log(`\n✅ Phase 7 Complete\n`);
  }

  async runPhase7CodeQuality() {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('PHASE 7.3: Code Quality Scanning');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const codeQuality = await import('./phases/code-quality.js');
    this.results.phases.codeQuality = await codeQuality.run(this);

    const totalMarkers = this.results.phases.codeQuality.totalMarkers;

    console.log(`\n✅ Phase 7.3 Complete`);
    console.log(`   Code Markers Found: ${totalMarkers}\n`);
  }

  async runPhase7AgentReviews() {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('PHASE 7.5: AI Agent Code Reviews');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const agentReviews = await import('./phases/agent-reviews.js');
    this.results.phases.agentReviews = await agentReviews.run(this);

    const totalRecommendations = this.results.phases.agentReviews.recommendations.length;

    console.log(`\n✅ Phase 7.5 Complete`);
    console.log(`   Agent Recommendations: ${totalRecommendations}\n`);
  }

  async runPhase7AutonomousBugFixing() {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('PHASE 7.9: Autonomous Bug Fixing');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const autofix = await import('./phases/autofix.mjs');
    this.results.phases.autofix = await autofix.run(this);

    const totalFixed = this.results.phases.autofix.fixed.length;
    const totalAttempted = this.results.phases.autofix.attempted;

    console.log(`\n✅ Phase 7.9 Complete`);
    console.log(`   Bugs Fixed: ${totalFixed}/${totalAttempted}\n`);
  }

  async runPhase8Reporting() {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('PHASE 8: Generating Reports');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const reporting = await import('./phases/reporting.js');
    const finalReport = await reporting.generate(this);

    // Save reports with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const jsonPath = path.join(this.config.outputDir, `report-${timestamp}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(finalReport, null, 2));
    console.log(`📄 JSON Report: ${jsonPath}`);

    // Save to baseline if enabled
    if (this.config.baseline.enabled) {
      const baselinePath = path.join(this.config.baseline.path, 'latest.json');
      fs.mkdirSync(this.config.baseline.path, { recursive: true });
      fs.writeFileSync(baselinePath, JSON.stringify(finalReport, null, 2));
      console.log(`💾 Baseline saved: ${baselinePath}`);
    }
  }

  printSummary(report) {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log(`Overall Score: ${report.summary.overallScore}/100`);
    console.log(`Duration: ${Math.round(report.summary.duration / 1000)}s`);
    console.log(`\nIssues Found:`);
    console.log(`  🔴 Critical: ${report.summary.criticalIssues}`);
    console.log(`  🟠 High: ${report.summary.highIssues}`);
    console.log(`  🟡 Medium: ${report.summary.mediumIssues}`);
    console.log(`  🟢 Low: ${report.summary.lowIssues}`);

    if (report.priorityActions && report.priorityActions.length > 0) {
      console.log(`\n🎯 TOP PRIORITY ACTIONS:\n`);
      report.priorityActions.slice(0, 5).forEach((action, i) => {
        console.log(`${i + 1}. ${action.priority === 'critical' ? '🔴' : '🟠'} ${action.title}`);
        console.log(`   Impact: ${action.impact}`);
        console.log(`   Effort: ${action.effort}`);
        console.log(`   ROI: ${action.roi.toFixed(1)}\n`);
      });
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }

  async cleanup() {
    console.log('🧹 Cleaning up...');

    try {
      // Close page first
      if (this.page && !this.page.isClosed()) {
        await this.page.close().catch(e => console.warn('⚠️  Failed to close page:', e.message));
      }

      // Close context
      if (this.context) {
        await this.context.close().catch(e => console.warn('⚠️  Failed to close context:', e.message));
      }

      // Close browser
      if (this.browser) {
        await this.browser.close().catch(e => console.warn('⚠️  Failed to close browser:', e.message));
      }

      console.log('✅ Cleanup complete\n');
    } catch (error) {
      console.error('❌ Cleanup error:', error.message);

      // Force kill browser process if still running
      if (this.browser) {
        try {
          const pid = this.browser.process()?.pid;
          if (pid) {
            process.kill(pid, 'SIGKILL');
            console.log('🔪 Force killed browser process');
          }
        } catch (e) {
          // Process already dead
        }
      }
    }
  }

  setupProcessCleanup() {
    const cleanup = async () => {
      console.log('\n⚠️  Interrupt received, cleaning up...');
      await this.cleanup();
      process.exit(0);
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
    process.on('uncaughtException', async (error) => {
      console.error('💥 Uncaught exception:', error);
      await this.cleanup();
      process.exit(1);
    });
    process.on('unhandledRejection', async (reason, promise) => {
      console.error('💥 Unhandled rejection at:', promise, 'reason:', reason);
      await this.cleanup();
      process.exit(1);
    });
  }
}

// CLI interface - ESM check for main module
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
  const args = process.argv.slice(2);

  const options = {
    quick: args.includes('--quick'),
    deep: args.includes('--deep'),
    game: args.includes('--game'),
    ecommerce: args.includes('--ecommerce'),
    suites: args.find(arg => arg.startsWith('--suites='))?.split('=')[1]
  };

  const orchestrator = new ThomasAppOrchestrator(options);

  orchestrator.run()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export default ThomasAppOrchestrator;
