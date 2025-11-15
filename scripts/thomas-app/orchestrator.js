#!/usr/bin/env node

/**
 * Thomas App - Complete Application Testing Orchestrator
 *
 * Main orchestrator that coordinates all testing phases
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

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
  }

  loadConfig() {
    // Default configuration
    const defaultConfig = {
      appType: null,  // Will be auto-detected
      baseUrl: 'http://localhost:3000',
      testSuites: {
        discovery: true,
        customerJourneys: true,
        visualAnalysis: true,
        interactions: true,
        gameAI: false,  // Auto-enabled if game detected
        performance: true,
        accessibility: true,
        security: true,
        seo: true,
        analytics: false,
        realWorld: true,
        agentReviews: false  // Only enabled in --deep mode or explicit request
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

    // Launch browser
    console.log('🚀 Starting browser...');
    this.browser = await chromium.launch({
      headless: false,  // Run in headed mode to see tests
      args: ['--no-sandbox', '--disable-setuid-sandbox']
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
      } else if (type === 'warning') {
        this.consoleLog.warnings.push(entry);
      } else {
        this.consoleLog.info.push(entry);
      }
    });

    this.page.on('pageerror', error => {
      this.consoleLog.errors.push({
        type: 'uncaught-exception',
        text: error.message,
        stack: error.stack,
        timestamp: Date.now(),
        url: this.page.url()
      });
    });

    this.page.on('requestfailed', request => {
      this.consoleLog.network.push({
        type: 'failed-request',
        url: request.url(),
        method: request.method(),
        failure: request.failure(),
        timestamp: Date.now()
      });
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

      // Phase 7.5: Agent Reviews (Deep mode only or explicit request)
      if (this.options.deep || this.isSuiteEnabled('agentReviews')) {
        await this.runPhase7AgentReviews();
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

    const discovery = require('./phases/discovery');
    this.results.phases.discovery = await discovery.run(this);

    console.log(`\n✅ Phase 1 Complete`);
    console.log(`   App Type: ${this.results.phases.discovery.appType}`);
    console.log(`   Routes Found: ${this.results.phases.discovery.routes.length}`);
    console.log(`   Features Detected: ${this.results.phases.discovery.features.length}\n`);
  }

  async runPhase2CustomerJourneys() {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('PHASE 2: Customer Journey Testing');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const journeys = require('./phases/customer-journeys');
    this.results.phases.customerJourneys = await journeys.run(this);

    const total = this.results.phases.customerJourneys.journeys.length;
    const passed = this.results.phases.customerJourneys.journeys.filter(j => j.completed).length;

    console.log(`\n✅ Phase 2 Complete`);
    console.log(`   Journeys: ${passed}/${total} passed (${Math.round(passed/total*100)}%)`);
    console.log(`   Friction Points: ${this.results.phases.customerJourneys.totalFrictionPoints}\n`);
  }

  async runPhase3VisualInteraction() {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('PHASE 3: Visual & Interaction Analysis');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const visual = require('./phases/visual-interaction');
    this.results.phases.visualInteraction = await visual.run(this);

    console.log(`\n✅ Phase 3 Complete`);
    console.log(`   Screens Tested: ${this.results.phases.visualInteraction.screensTested}`);
    console.log(`   Visual Issues: ${this.results.phases.visualInteraction.visualIssues.length}`);
    console.log(`   Interaction Issues: ${this.results.phases.visualInteraction.interactionIssues.length}\n`);
  }

  async runPhase4Specialized() {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('PHASE 4: Specialized Testing');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const appType = this.results.phases.discovery?.appType || this.config.appType;

    // Game AI Player (if game)
    if (appType === 'game' || this.isSuiteEnabled('gameAI')) {
      console.log('🎮 Running Game AI Player...\n');
      const gameAI = require('./phases/game-ai');
      this.results.phases.gameAI = await gameAI.run(this);
      console.log(`   ✅ Game AI Complete\n`);
    }

    // E-commerce specific tests
    if (appType === 'ecommerce') {
      console.log('🛒 Running E-commerce Flow Tests...\n');
      const ecommerce = require('./phases/ecommerce');
      this.results.phases.ecommerce = await ecommerce.run(this);
      console.log(`   ✅ E-commerce Tests Complete\n`);
    }

    // Content site SEO
    if (appType === 'content' && this.isSuiteEnabled('seo')) {
      console.log('📝 Running SEO Analysis...\n');
      const seo = require('./phases/seo');
      this.results.phases.seo = await seo.run(this);
      console.log(`   ✅ SEO Analysis Complete\n`);
    }

    console.log(`✅ Phase 4 Complete\n`);
  }

  async runPhase5PerformanceAccessibility() {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('PHASE 5: Performance & Accessibility');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const perfA11y = require('./phases/performance-accessibility');
    this.results.phases.performanceAccessibility = await perfA11y.run(this);

    console.log(`\n✅ Phase 5 Complete`);
    console.log(`   Performance Score: ${this.results.phases.performanceAccessibility.performanceScore}/100`);
    console.log(`   Accessibility Score: ${this.results.phases.performanceAccessibility.a11yScore}/100\n`);
  }

  async runPhase6SecurityAnalytics() {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('PHASE 6: Security & Analytics');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const security = require('./phases/security-analytics');
    this.results.phases.securityAnalytics = await security.run(this);

    console.log(`\n✅ Phase 6 Complete`);
    console.log(`   Security Score: ${this.results.phases.securityAnalytics.securityScore}/100\n`);
  }

  async runPhase7RealWorld() {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('PHASE 7: Real-World Conditions');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const realWorld = require('./phases/real-world');
    this.results.phases.realWorld = await realWorld.run(this);

    console.log(`\n✅ Phase 7 Complete\n`);
  }

  async runPhase7AgentReviews() {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('PHASE 7.5: AI Agent Code Reviews');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const agentReviews = require('./phases/agent-reviews');
    this.results.phases.agentReviews = await agentReviews.run(this);

    const totalRecommendations = this.results.phases.agentReviews.recommendations.length;

    console.log(`\n✅ Phase 7.5 Complete`);
    console.log(`   Agent Recommendations: ${totalRecommendations}\n`);
  }

  async runPhase8Reporting() {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('PHASE 8: Generating Reports');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const reporting = require('./phases/reporting');
    const finalReport = await reporting.generate(this);

    // Save reports
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    // JSON report
    const jsonPath = path.join(this.config.outputDir, `report-${timestamp}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(finalReport, null, 2));
    console.log(`📄 JSON Report: ${jsonPath}`);

    // HTML report
    const htmlPath = path.join(this.config.outputDir, `report-${timestamp}.html`);
    const html = reporting.generateHTML(finalReport);
    fs.writeFileSync(htmlPath, html);
    console.log(`📄 HTML Report: ${htmlPath}`);

    // Console summary
    this.printSummary(finalReport);

    // Save to baseline if enabled
    if (this.config.baseline.enabled) {
      const baselinePath = path.join(this.config.baseline.path, 'latest.json');
      fs.mkdirSync(this.config.baseline.path, { recursive: true });
      fs.writeFileSync(baselinePath, JSON.stringify(finalReport, null, 2));
      console.log(`\n💾 Baseline saved: ${baselinePath}`);
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

    if (this.context) {
      await this.context.close();
    }

    if (this.browser) {
      await this.browser.close();
    }

    console.log('✅ Done!\n');
  }
}

// CLI interface
if (require.main === module) {
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

module.exports = ThomasAppOrchestrator;
