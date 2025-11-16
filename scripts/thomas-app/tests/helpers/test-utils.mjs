/**
 * Test Utilities
 *
 * Common helpers for thomas-app tests
 */

import { vi } from 'vitest';
import { createMockBrowser } from './mock-browser.mjs';

/**
 * Create mock execAsync for child_process
 */
function createMockExecAsync() {
  return vi.fn(async (command, options = {}) => {
    // Simulate command execution based on command string
    if (command.includes('which /thomas-fix') || command.includes('command -v /thomas-fix')) {
      // Command exists
      return { stdout: '/thomas-fix', stderr: '' };
    }

    if (command.includes('/thomas-fix')) {
      // Simulate thomas-fix success
      return {
        stdout: '✅ All checks passed\nLint: ✅\nTypeCheck: ✅\nTests: ✅\nBuild: ✅',
        stderr: ''
      };
    }

    if (command.includes('gh issue create')) {
      // Simulate GitHub issue creation
      return {
        stdout: 'https://github.com/owner/repo/issues/123',
        stderr: ''
      };
    }

    // Default: command not found
    throw new Error(`Command not found: ${command}`);
  });
}

/**
 * Create mock config for orchestrator
 */
function createMockConfig(overrides = {}) {
  return {
    appType: 'website',
    baseUrl: 'http://localhost:3000',
    testSuites: {
      discovery: true,
      customerJourneys: true,
      visualAnalysis: true,
      interactions: true,
      screenFlow: true,
      gameAI: false,
      performance: true,
      accessibility: true,
      security: true,
      seo: true,
      analytics: false,
      realWorld: true,
      agentReviews: true,
      autofix: true
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
    outputDir: '/tmp/thomas-app',
    ...overrides
  };
}

/**
 * Create mock orchestrator
 */
function createMockOrchestrator(options = {}) {
  const browser = createMockBrowser();
  const context = browser.newContext();
  const page = context.then(ctx => ctx.newPage());

  const orchestrator = {
    options: {
      quick: false,
      deep: false,
      suites: null,
      appType: null,
      configPath: '.thomas-app.json',
      ...options
    },
    config: createMockConfig(),
    results: {
      phases: {},
      issues: [],
      metrics: {},
      startTime: Date.now()
    },
    browser: null,
    context: null,
    page: null,
    consoleLog: {
      errors: [],
      warnings: [],
      info: [],
      network: []
    }
  };

  return orchestrator;
}

/**
 * Create mock results for testing
 */
function createMockResults(options = {}) {
  return {
    phases: {
      discovery: {
        appType: 'website',
        routes: [
          { path: '/', critical: true, visited: true },
          { path: '/about', critical: false, visited: false }
        ],
        features: ['authentication', 'forms'],
        techStack: { framework: 'React', build: 'Vite' },
        recommendations: []
      },
      customerJourneys: {
        journeys: [
          {
            name: 'Homepage to Contact',
            critical: false,
            completed: true,
            steps: [],
            frictionPoints: [],
            screenshots: [],
            duration: 1234
          }
        ],
        totalFrictionPoints: 0,
        screenshots: []
      },
      performanceAccessibility: {
        performanceScore: 95,
        a11yScore: 92,
        coreWebVitals: {
          lcp: 1800,
          fid: 50,
          cls: 0.05
        },
        accessibilityIssues: []
      },
      securityAnalytics: {
        securityScore: 88,
        sensitiveData: []
      },
      visualInteraction: {
        screensTested: 5,
        visualIssues: [],
        interactionIssues: []
      },
      ...options.phases
    },
    issues: options.issues || [],
    metrics: options.metrics || {},
    startTime: options.startTime || Date.now()
  };
}

/**
 * Wait for condition with timeout
 */
async function waitFor(condition, timeout = 5000, interval = 100) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (await condition()) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  throw new Error('Timeout waiting for condition');
}

/**
 * Capture console output
 */
function captureConsole() {
  const logs = [];
  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;

  console.log = (...args) => {
    logs.push({ type: 'log', args });
  };

  console.error = (...args) => {
    logs.push({ type: 'error', args });
  };

  console.warn = (...args) => {
    logs.push({ type: 'warn', args });
  };

  return {
    logs,
    restore: () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    }
  };
}

export {
  createMockExecAsync,
  createMockConfig,
  createMockOrchestrator,
  createMockResults,
  waitFor,
  captureConsole
};
