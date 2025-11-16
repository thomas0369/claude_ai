/**
 * Tests for phases/reporting.js
 *
 * Target: High-value tests for report generation
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { mockFS } from '../../helpers/mock-fs.mjs';
import { createMockResults } from '../../helpers/test-utils.mjs';

// Mock fs
vi.mock('fs', () => {
  return {
    existsSync: vi.fn((path) => mockFS.hasFile(path) || mockFS.hasDir(path)),
    readFileSync: vi.fn((path, encoding) => mockFS.readFileSync(path, encoding)),
    writeFileSync: vi.fn((path, content) => mockFS.writeFileSync(path, content)),
    mkdirSync: vi.fn((path, options) => mockFS.mkdirSync(path, options))
  };
});

describe('Reporting Phase', () => {
  let reporting;
  let fs;

  beforeEach(async () => {
    mockFS.reset();
    vi.clearAllMocks();

    // Import mocked modules
    fs = await import('fs');

    // Import reporting module
    const reportingModule = await import('/home/thoma/.claude/scripts/thomas-app/phases/reporting.js');
    reporting = reportingModule;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('generate', () => {
    test('should generate report with summary', async () => {
      const orchestrator = {
        results: createMockResults(),
        config: {
          baseUrl: 'http://localhost:3000',
          outputDir: '/tmp/thomas-app'
        }
      };

      const report = await reporting.generate(orchestrator);

      expect(report).toBeDefined();
      expect(report.summary).toBeDefined();
      expect(report.summary.overallScore).toBeGreaterThanOrEqual(0);
      expect(report.summary.overallScore).toBeLessThanOrEqual(100);
    });

    test('should calculate overall score from phase results', async () => {
      const orchestrator = {
        results: {
          phases: {
            discovery: { appType: 'website' },
            performanceAccessibility: {
              performanceScore: 90,
              a11yScore: 85
            },
            securityAnalytics: {
              securityScore: 80
            }
          },
          issues: [],
          metrics: {},
          startTime: Date.now() - 60000
        },
        config: {
          baseUrl: 'http://localhost:3000',
          outputDir: '/tmp/thomas-app'
        }
      };

      const report = await reporting.generate(orchestrator);

      expect(report.summary.overallScore).toBeGreaterThan(0);
      expect(typeof report.summary.overallScore).toBe('number');
    });

    test('should include duration in summary', async () => {
      const startTime = Date.now() - 120000; // 2 minutes ago
      const orchestrator = {
        results: {
          phases: {},
          issues: [],
          metrics: {},
          startTime
        },
        config: {
          baseUrl: 'http://localhost:3000',
          outputDir: '/tmp/thomas-app'
        }
      };

      const report = await reporting.generate(orchestrator);

      expect(report.summary.duration).toBeGreaterThan(0);
      expect(report.summary.duration).toBeGreaterThan(100000); // At least 100 seconds
    });

    test('should categorize issues by severity', async () => {
      const orchestrator = {
        results: {
          phases: {},
          issues: [
            { severity: 'critical', title: 'Critical issue' },
            { severity: 'critical', title: 'Another critical' },
            { severity: 'high', title: 'High severity' },
            { severity: 'medium', title: 'Medium severity' },
            { severity: 'medium', title: 'Another medium' },
            { severity: 'low', title: 'Low severity' }
          ],
          metrics: {},
          startTime: Date.now()
        },
        config: {
          baseUrl: 'http://localhost:3000',
          outputDir: '/tmp/thomas-app'
        }
      };

      const report = await reporting.generate(orchestrator);

      expect(report.summary.criticalIssues).toBe(2);
      expect(report.summary.highIssues).toBe(1);
      expect(report.summary.mediumIssues).toBe(2);
      expect(report.summary.lowIssues).toBe(1);
    });

    test('should include all phase results', async () => {
      const mockResults = createMockResults();
      const orchestrator = {
        results: mockResults,
        config: {
          baseUrl: 'http://localhost:3000',
          outputDir: '/tmp/thomas-app'
        }
      };

      const report = await reporting.generate(orchestrator);

      expect(report.phases).toBeDefined();
      expect(report.phases.discovery).toBeDefined();
      expect(report.phases.customerJourneys).toBeDefined();
      expect(report.phases.performanceAccessibility).toBeDefined();
    });

    test('should handle missing phase results gracefully', async () => {
      const orchestrator = {
        results: {
          phases: {
            discovery: { appType: 'website' }
            // Other phases missing
          },
          issues: [],
          metrics: {},
          startTime: Date.now()
        },
        config: {
          baseUrl: 'http://localhost:3000',
          outputDir: '/tmp/thomas-app'
        }
      };

      const report = await reporting.generate(orchestrator);

      expect(report).toBeDefined();
      expect(report.summary).toBeDefined();
      // Should not throw error
    });

    test('should include timestamp in report', async () => {
      const orchestrator = {
        results: createMockResults(),
        config: {
          baseUrl: 'http://localhost:3000',
          outputDir: '/tmp/thomas-app'
        }
      };

      const report = await reporting.generate(orchestrator);

      expect(report.timestamp).toBeDefined();
      expect(typeof report.timestamp).toBe('string');
    });

    test('should include config information', async () => {
      const orchestrator = {
        results: createMockResults(),
        config: {
          baseUrl: 'http://localhost:8080',
          outputDir: '/tmp/thomas-app',
          testSuites: {
            discovery: true,
            performance: true
          }
        }
      };

      const report = await reporting.generate(orchestrator);

      expect(report.config).toBeDefined();
      expect(report.config.baseUrl).toBe('http://localhost:8080');
    });
  });
});
