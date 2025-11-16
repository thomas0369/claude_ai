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
    test('should generate report with scores', async () => {
      const orchestrator = {
        results: createMockResults(),
        config: {
          baseUrl: 'http://localhost:3000',
          outputDir: '/tmp/thomas-app'
        }
      };

      const report = await reporting.generate(orchestrator);

      expect(report).toBeDefined();
      expect(report.scores).toBeDefined();
      expect(report.scores.overall).toBeGreaterThanOrEqual(0);
      expect(report.scores.overall).toBeLessThanOrEqual(100);
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

      expect(report.scores.overall).toBeGreaterThan(0);
      expect(typeof report.scores.overall).toBe('number');
    });

    test('should include duration in meta', async () => {
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

      expect(report.meta.duration).toBeGreaterThan(0);
      expect(report.meta.duration).toBeGreaterThan(100000); // At least 100 seconds
    });

    test('should include issues array', async () => {
      const orchestrator = {
        results: {
          phases: {},
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

      expect(Array.isArray(report.issues)).toBe(true);
      expect(report.issues).toBeDefined();
    });

    test('should include scores from phase results', async () => {
      const mockResults = createMockResults();
      const orchestrator = {
        results: mockResults,
        config: {
          baseUrl: 'http://localhost:3000',
          outputDir: '/tmp/thomas-app'
        }
      };

      const report = await reporting.generate(orchestrator);

      expect(report.scores).toBeDefined();
      expect(report.scores.overall).toBeDefined();
      expect(report.scores.performance).toBe(95); // From mock data
      expect(report.scores.accessibility).toBe(92); // From mock data
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
      expect(report.scores).toBeDefined();
      expect(report.meta).toBeDefined();
      // Should not throw error
    });

    test('should include timestamp in meta', async () => {
      const orchestrator = {
        results: createMockResults(),
        config: {
          baseUrl: 'http://localhost:3000',
          outputDir: '/tmp/thomas-app'
        }
      };

      const report = await reporting.generate(orchestrator);

      expect(report.meta.timestamp).toBeDefined();
      expect(typeof report.meta.timestamp).toBe('string');
    });

    test('should include baseUrl in meta', async () => {
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

      expect(report.meta).toBeDefined();
      expect(report.meta.url).toBe('http://localhost:8080');
    });
  });
});
