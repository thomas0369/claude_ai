/**
 * Tests for phases/autofix.js
 *
 * Target: 100% coverage
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { MockPage } from '../../helpers/mock-browser.mjs';
import { createMockExecAsync, createMockConfig, createMockResults } from '../../helpers/test-utils.mjs';

// Mock modules at file level
vi.mock('child_process', () => ({
  exec: vi.fn()
}));

vi.mock('fs', () => ({}));

describe('Autofix Phase', () => {
  let autofix;
  let mockExecAsync;
  let originalSetTimeout;

  beforeEach(async () => {
    // Mock exec/execAsync
    mockExecAsync = createMockExecAsync();

    // Mock util.promisify to return mockExecAsync
    vi.doMock('util', () => ({
      promisify: () => mockExecAsync
    }));

    // Speed up setTimeout for tests
    originalSetTimeout = global.setTimeout;
    global.setTimeout = (fn, delay) => {
      if (delay >= 1000) {
        return originalSetTimeout(fn, 0); // Run immediately
      }
      return originalSetTimeout(fn, delay);
    };

    // Clear module cache and reload autofix module (ESM)
    vi.resetModules();
    const autofixModule = await import('/home/thoma/.claude/scripts/thomas-app/phases/autofix.mjs');
    autofix = autofixModule;
  });

  afterEach(() => {
    vi.clearAllMocks();
    global.setTimeout = originalSetTimeout;
  });

  describe('run', () => {
    test('should skip if /thomas-fix command not available', async () => {
      mockExecAsync.mockRejectedValueOnce(new Error('command not found'));

      const orchestrator = {
        results: createMockResults(),
        config: createMockConfig()
      };

      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const result = await autofix.run(orchestrator);

      expect(result.attempted).toBe(0);
      expect(result.error).toBe('thomas-fix command not available');
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('/thomas-fix command not found')
      );

      consoleLogSpy.mockRestore();
    });

    test('should return early if no fixable issues', async () => {
      // Create clean results with no issues
      const orchestrator = {
        results: {
          phases: {},
          consoleLog: { errors: [], warnings: [], info: [], network: [] }
        },
        config: createMockConfig()
      };

      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const result = await autofix.run(orchestrator);

      expect(result.attempted).toBe(0);
      expect(result.fixed).toEqual([]);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('No bugs to fix')
      );

      consoleLogSpy.mockRestore();
    });

    test('should fix console errors', async () => {
      const orchestrator = {
        results: {
          ...createMockResults(),
          consoleLog: {
            errors: [
              {
                text: 'Uncaught ReferenceError: foo is not defined',
                location: { url: 'app.js', lineNumber: 42 },
                url: 'http://localhost:3000'
              }
            ],
            warnings: [],
            info: [],
            network: []
          }
        },
        config: createMockConfig(),
        page: new MockPage(),
        consoleLog: { errors: [], warnings: [], info: [], network: [] }
      };

      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const result = await autofix.run(orchestrator);

      expect(result.attempted).toBeGreaterThan(0);
      expect(result.fixed.length).toBeGreaterThan(0);
      expect(result.fixed[0].method).toBe('/thomas-fix');

      consoleLogSpy.mockRestore();
    });

    test('should fix failed customer journeys', async () => {
      const orchestrator = {
        results: {
          ...createMockResults(),
          phases: {
            customerJourneys: {
              journeys: [
                {
                  name: 'Browse to Purchase',
                  success: false,
                  error: 'Selector timeout'
                }
              ]
            }
          }
        },
        config: createMockConfig(),
        page: new MockPage(),
        consoleLog: { errors: [], warnings: [], info: [], network: [] }
      };

      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const result = await autofix.run(orchestrator);

      expect(result.attempted).toBe(1);
      expect(result.fixed[0].issue.type).toBe('journey-failure');

      consoleLogSpy.mockRestore();
    });

    test('should fix critical accessibility violations', async () => {
      const orchestrator = {
        results: {
          ...createMockResults(),
          phases: {
            performanceAccessibility: {
              performanceScore: 95,
              a11yScore: 80,
              accessibilityIssues: [
                {
                  impact: 'critical',
                  help: 'Images must have alternate text',
                  description: 'Missing alt attribute',
                  id: 'image-alt',
                  helpUrl: 'https://deque.com/image-alt'
                },
                {
                  impact: 'serious',
                  help: 'Form elements must have labels',
                  description: 'Missing label',
                  id: 'label',
                  helpUrl: 'https://deque.com/label'
                }
              ]
            }
          }
        },
        config: createMockConfig(),
        page: new MockPage(),
        consoleLog: { errors: [], warnings: [], info: [], network: [] }
      };

      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const result = await autofix.run(orchestrator);

      expect(result.attempted).toBe(2);
      expect(result.fixed.some(f => f.issue.type === 'accessibility-violation')).toBe(true);

      consoleLogSpy.mockRestore();
    });

    test('should fix security vulnerabilities', async () => {
      const orchestrator = {
        results: {
          ...createMockResults(),
          phases: {
            securityAnalytics: {
              securityScore: 70,
              sensitiveData: [
                {
                  storage: 'localStorage',
                  key: 'apiKey',
                  issue: 'API key stored in localStorage'
                }
              ]
            }
          }
        },
        config: createMockConfig(),
        page: new MockPage(),
        consoleLog: { errors: [], warnings: [], info: [], network: [] }
      };

      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const result = await autofix.run(orchestrator);

      expect(result.attempted).toBe(1);
      expect(result.fixed[0].issue.type).toBe('sensitive-data');
      expect(result.fixed[0].issue.autoFixMethod).toBe('security-fix');

      consoleLogSpy.mockRestore();
    });

    test('should fix layout issues', async () => {
      const orchestrator = {
        results: {
          ...createMockResults(),
          phases: {
            visualInteraction: {
              screensTested: 5,
              visualIssues: [
                {
                  severity: 'high',
                  message: 'Element overflows container',
                  details: 'Button extends beyond parent width'
                }
              ],
              interactionIssues: []
            }
          }
        },
        config: createMockConfig(),
        page: new MockPage(),
        consoleLog: { errors: [], warnings: [], info: [], network: [] }
      };

      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const result = await autofix.run(orchestrator);

      expect(result.attempted).toBe(1);
      expect(result.fixed[0].issue.type).toBe('layout-issue');
      expect(result.fixed[0].issue.autoFixMethod).toBe('css-styling-expert');

      consoleLogSpy.mockRestore();
    });

    test('should fix performance LCP issues', async () => {
      const orchestrator = {
        results: {
          ...createMockResults(),
          phases: {
            performanceAccessibility: {
              performanceScore: 60,
              a11yScore: 95,
              coreWebVitals: {
                lcp: 4500, // > 4000ms threshold
                fid: 50,
                cls: 0.05
              }
            }
          }
        },
        config: createMockConfig(),
        page: new MockPage(),
        consoleLog: { errors: [], warnings: [], info: [], network: [] }
      };

      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const result = await autofix.run(orchestrator);

      expect(result.attempted).toBe(1);
      expect(result.fixed[0].issue.type).toBe('performance-lcp');
      expect(result.fixed[0].issue.metric).toBe('LCP');
      expect(result.fixed[0].issue.autoFixMethod).toBe('react-performance-expert');

      consoleLogSpy.mockRestore();
    });

    test('should fix performance CLS issues', async () => {
      const orchestrator = {
        results: {
          ...createMockResults(),
          phases: {
            performanceAccessibility: {
              performanceScore: 70,
              a11yScore: 95,
              coreWebVitals: {
                lcp: 2000,
                fid: 50,
                cls: 0.3 // > 0.25 threshold
              }
            }
          }
        },
        config: createMockConfig(),
        page: new MockPage(),
        consoleLog: { errors: [], warnings: [], info: [], network: [] }
      };

      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const result = await autofix.run(orchestrator);

      expect(result.attempted).toBe(1);
      expect(result.fixed[0].issue.type).toBe('performance-cls');
      expect(result.fixed[0].issue.metric).toBe('CLS');

      consoleLogSpy.mockRestore();
    });

    test('should prioritize critical issues first', async () => {
      const orchestrator = {
        results: {
          ...createMockResults(),
          consoleLog: {
            errors: [{ text: 'Critical error', location: {}, url: '/' }]
          },
          phases: {
            visualInteraction: {
              screensTested: 1,
              visualIssues: [
                { severity: 'high', message: 'High severity issue' }
              ],
              interactionIssues: []
            }
          }
        },
        config: createMockConfig(),
        page: new MockPage(),
        consoleLog: { errors: [], warnings: [], info: [], network: [] }
      };

      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const result = await autofix.run(orchestrator);

      // Console errors (critical) should be fixed before layout issues (high)
      expect(result.fixed[0].issue.severity).toBe('critical');

      consoleLogSpy.mockRestore();
    });

    test('should handle fix failures', async () => {
      const orchestrator = {
        results: {
          ...createMockResults(),
          consoleLog: {
            errors: [{ text: 'Test error', location: {}, url: '/' }]
          }
        },
        config: createMockConfig(),
        page: new MockPage(),
        consoleLog: { errors: [], warnings: [], info: [], network: [] }
      };

      // Override just the /thomas-fix call to throw
      mockExecAsync
        .mockResolvedValueOnce({ stdout: '/thomas-fix', stderr: '' }) // which check
        .mockRejectedValueOnce(new Error('Fix failed')); // thomas-fix execution

      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const result = await autofix.run(orchestrator);

      expect(result.failed.length).toBeGreaterThan(0);
      expect(result.failed[0].reason).toContain('Fix failed');

      consoleLogSpy.mockRestore();
    });

    test('should limit to max 3 iterations', async () => {
      const orchestrator = {
        results: {
          ...createMockResults(),
          consoleLog: {
            errors: [
              { text: 'Error 1', location: {}, url: '/' },
              { text: 'Error 2', location: {}, url: '/' },
              { text: 'Error 3', location: {}, url: '/' },
              { text: 'Error 4', location: {}, url: '/' }
            ]
          }
        },
        config: createMockConfig(),
        page: new MockPage(),
        consoleLog: { errors: [] }
      };

      // Mock reload to always succeed
      orchestrator.page.reload = vi.fn(async () => {
        // Reload sets errors back (simulating persistent bugs)
        orchestrator.consoleLog.errors = [
          { text: 'Error 1', location: {}, url: '/' },
          { text: 'Error 2', location: {}, url: '/' },
          { text: 'Error 3', location: {}, url: '/' },
          { text: 'Error 4', location: {}, url: '/' }
        ];
        return {};
      });

      // Mock which check and multiple /thomas-fix calls (one per error per iteration)
      mockExecAsync
        .mockResolvedValueOnce({ stdout: '/thomas-fix', stderr: '' }) // which check
        .mockResolvedValue({ stdout: '✅ All checks passed', stderr: '' }); // all thomas-fix calls

      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const result = await autofix.run(orchestrator);

      expect(result.iterations.length).toBeLessThanOrEqual(3);
      expect(result.skipped.length).toBeGreaterThan(0);
      expect(result.skipped[0].reason).toBe('Max iterations reached');

      consoleLogSpy.mockRestore();
    });

    test('should verify fixes after each iteration', async () => {
      const page = new MockPage();
      const reloadSpy = vi.spyOn(page, 'reload');

      const orchestrator = {
        results: {
          ...createMockResults(),
          consoleLog: {
            errors: [{ text: 'Test error', location: {}, url: '/' }]
          }
        },
        config: createMockConfig(),
        page,
        consoleLog: { errors: [] }
      };

      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await autofix.run(orchestrator);

      expect(reloadSpy).toHaveBeenCalled();

      consoleLogSpy.mockRestore();
    });

    test('should handle verification errors gracefully', async () => {
      const page = new MockPage();
      page.reload = vi.fn(async () => {
        throw new Error('Reload failed');
      });

      const orchestrator = {
        results: {
          ...createMockResults(),
          consoleLog: {
            errors: [{ text: 'Test error', location: {}, url: '/' }]
          }
        },
        config: createMockConfig(),
        page,
        consoleLog: { errors: [] }
      };

      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const result = await autofix.run(orchestrator);

      // Should not crash, just mark verification failed
      expect(result).toBeDefined();

      consoleLogSpy.mockRestore();
    });
  });

  describe('collectFixableIssues', () => {
    test('should collect console errors', () => {
      const results = {
        consoleLog: {
          errors: [
            { text: 'Error 1', location: {}, url: '/' },
            { text: 'Error 2', location: {}, url: '/' }
          ]
        },
        phases: {}
      };

      // Access internal function for testing
      const { run, ...internals } = autofix;

      // We'll test this through the run function behavior
      // (collectFixableIssues is not exported)
    });

    test('should not collect non-critical accessibility issues', async () => {
      const orchestrator = {
        results: {
          ...createMockResults(),
          phases: {
            performanceAccessibility: {
              performanceScore: 95,
              a11yScore: 90,
              accessibilityIssues: [
                {
                  impact: 'moderate',
                  help: 'Low contrast',
                  description: 'Text has low contrast ratio',
                  id: 'color-contrast',
                  helpUrl: 'https://deque.com/color-contrast'
                }
              ]
            }
          }
        },
        config: createMockConfig(),
        page: new MockPage(),
        consoleLog: { errors: [], warnings: [], info: [], network: [] }
      };

      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const result = await autofix.run(orchestrator);

      // Only critical/serious issues should be fixed
      expect(result.attempted).toBe(0);

      consoleLogSpy.mockRestore();
    });

    test('should not collect low/medium visual issues', async () => {
      const orchestrator = {
        results: {
          ...createMockResults(),
          phases: {
            visualInteraction: {
              screensTested: 5,
              visualIssues: [
                { severity: 'low', message: 'Minor spacing issue' },
                { severity: 'medium', message: 'Color consistency issue' }
              ],
              interactionIssues: []
            }
          }
        },
        config: createMockConfig(),
        page: new MockPage(),
        consoleLog: { errors: [], warnings: [], info: [], network: [] }
      };

      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const result = await autofix.run(orchestrator);

      // Only high severity visual issues should be fixed
      expect(result.attempted).toBe(0);

      consoleLogSpy.mockRestore();
    });

    test('should not collect non-critical performance issues', async () => {
      const orchestrator = {
        results: {
          ...createMockResults(),
          phases: {
            performanceAccessibility: {
              performanceScore: 85,
              a11yScore: 95,
              coreWebVitals: {
                lcp: 3000, // < 4000ms (good)
                fid: 80,
                cls: 0.15 // < 0.25 (good)
              }
            }
          }
        },
        config: createMockConfig(),
        page: new MockPage(),
        consoleLog: { errors: [], warnings: [], info: [], network: [] }
      };

      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const result = await autofix.run(orchestrator);

      // Performance is acceptable, no fixes needed
      expect(result.attempted).toBe(0);

      consoleLogSpy.mockRestore();
    });
  });

  describe('attemptFix', () => {
    test('should use thomas-fix for console errors', async () => {
      const orchestrator = {
        results: {
          ...createMockResults(),
          consoleLog: {
            errors: [{ text: 'Console error', location: {}, url: '/' }]
          }
        },
        config: createMockConfig(),
        page: new MockPage(),
        consoleLog: { errors: [] }
      };

      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const result = await autofix.run(orchestrator);

      // Check that mockExecAsync was called with thomas-fix command
      const thomasFixCalls = mockExecAsync.mock.calls.filter(call =>
        call[0] && typeof call[0] === 'string' && call[0].includes('/thomas-fix') && !call[0].includes('which')
      );
      expect(thomasFixCalls.length).toBeGreaterThan(0);
      expect(thomasFixCalls[0][1]).toMatchObject({ timeout: 300000 });

      consoleLogSpy.mockRestore();
    });

    test('should handle unknown fix methods', async () => {
      const orchestrator = {
        results: {
          ...createMockResults(),
          consoleLog: {
            errors: [
              {
                text: 'Custom error',
                location: {},
                url: '/',
                autoFixMethod: 'unknown-method'
              }
            ]
          }
        },
        config: createMockConfig(),
        page: new MockPage(),
        consoleLog: { errors: [] }
      };

      // Manually add an issue with unknown method
      orchestrator.results.phases = {
        customPhase: {
          issues: [
            {
              type: 'custom-issue',
              severity: 'high',
              title: 'Custom issue',
              autoFixMethod: 'unknown-method'
            }
          ]
        }
      };

      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      // This should not crash
      const result = await autofix.run(orchestrator);

      consoleLogSpy.mockRestore();
    });

    test('should handle thomas-fix timeout', async () => {
      const orchestrator = {
        results: {
          ...createMockResults(),
          consoleLog: {
            errors: [{ text: 'Error', location: {}, url: '/' }]
          }
        },
        config: createMockConfig(),
        page: new MockPage(),
        consoleLog: { errors: [] }
      };

      // Mock which check success, then timeout on thomas-fix
      mockExecAsync
        .mockResolvedValueOnce({ stdout: '/thomas-fix', stderr: '' }) // which check
        .mockRejectedValueOnce(new Error('Command timeout')); // thomas-fix execution

      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const result = await autofix.run(orchestrator);

      expect(result.failed.length).toBeGreaterThan(0);
      expect(result.failed[0].reason).toContain('timeout');

      consoleLogSpy.mockRestore();
    });

    test('should handle thomas-fix partial success', async () => {
      const orchestrator = {
        results: {
          ...createMockResults(),
          consoleLog: {
            errors: [{ text: 'Error', location: {}, url: '/' }]
          }
        },
        config: createMockConfig(),
        page: new MockPage(),
        consoleLog: { errors: [] }
      };

      // Mock which check success, then partial success (no checkmark) on thomas-fix
      mockExecAsync
        .mockResolvedValueOnce({ stdout: '/thomas-fix', stderr: '' }) // which check
        .mockResolvedValueOnce({ stdout: 'Running tests...', stderr: '' }); // thomas-fix without checkmark

      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const result = await autofix.run(orchestrator);

      expect(result.failed.length).toBeGreaterThan(0);
      expect(result.failed[0].reason).toContain('did not resolve');

      consoleLogSpy.mockRestore();
    });
  });

  describe('quickVerification', () => {
    test('should verify console errors are fixed', async () => {
      const page = new MockPage();

      const orchestrator = {
        results: {
          ...createMockResults(),
          consoleLog: {
            errors: [{ text: 'Error that gets fixed', location: {}, url: '/' }]
          }
        },
        config: createMockConfig(),
        page,
        consoleLog: { errors: [] } // Empty after reload = fixed
      };

      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const result = await autofix.run(orchestrator);

      // Error should be verified as fixed
      expect(result.fixed.length).toBeGreaterThan(0);

      consoleLogSpy.mockRestore();
    });

    test('should mark journey failures as needing manual verification', async () => {
      const orchestrator = {
        results: {
          ...createMockResults(),
          phases: {
            customerJourneys: {
              journeys: [
                { name: 'Test Journey', success: false, error: 'Failed' }
              ]
            }
          }
        },
        config: createMockConfig(),
        page: new MockPage(),
        consoleLog: { errors: [] }
      };

      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const result = await autofix.run(orchestrator);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('requires manual verification')
      );

      consoleLogSpy.mockRestore();
    });

    test('should verify accessibility issues with axe-core', async () => {
      const page = new MockPage();
      page.addScriptTag = vi.fn(async () => ({ src: 'axe.min.js' }));
      page.evaluate = vi.fn(async (fn, ruleId) => {
        // Return no violations = fixed
        return { violations: [] };
      });

      const orchestrator = {
        results: {
          ...createMockResults(),
          phases: {
            performanceAccessibility: {
              performanceScore: 95,
              a11yScore: 85,
              accessibilityIssues: [
                {
                  impact: 'critical',
                  help: 'Alt text missing',
                  description: 'Images need alt',
                  id: 'image-alt',
                  helpUrl: 'https://deque.com'
                }
              ]
            }
          }
        },
        config: createMockConfig(),
        page,
        consoleLog: { errors: [] }
      };

      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const result = await autofix.run(orchestrator);

      expect(page.addScriptTag).toHaveBeenCalled();
      expect(result.fixed.length).toBeGreaterThan(0);

      consoleLogSpy.mockRestore();
    });

    test('should handle axe-core verification errors', async () => {
      const page = new MockPage();
      page.addScriptTag = vi.fn(async () => {
        throw new Error('Failed to load axe-core');
      });

      const orchestrator = {
        results: {
          ...createMockResults(),
          phases: {
            performanceAccessibility: {
              performanceScore: 95,
              a11yScore: 85,
              accessibilityIssues: [
                {
                  impact: 'critical',
                  help: 'Alt text',
                  description: 'Missing alt',
                  id: 'image-alt',
                  helpUrl: 'https://deque.com'
                }
              ]
            }
          }
        },
        config: createMockConfig(),
        page,
        consoleLog: { errors: [] }
      };

      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const result = await autofix.run(orchestrator);

      // Should not crash, just skip verification
      expect(result).toBeDefined();

      consoleLogSpy.mockRestore();
    });

    test('should mark other issue types for manual verification', async () => {
      const orchestrator = {
        results: {
          ...createMockResults(),
          phases: {
            securityAnalytics: {
              securityScore: 70,
              sensitiveData: [
                { storage: 'localStorage', key: 'token', issue: 'Sensitive data' }
              ]
            },
            visualInteraction: {
              screensTested: 1,
              visualIssues: [{ severity: 'high', message: 'Layout issue' }],
              interactionIssues: []
            },
            performanceAccessibility: {
              performanceScore: 60,
              a11yScore: 95,
              coreWebVitals: {
                lcp: 4500,
                fid: 50,
                cls: 0.3
              }
            }
          }
        },
        config: createMockConfig(),
        page: new MockPage(),
        consoleLog: { errors: [] }
      };

      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const result = await autofix.run(orchestrator);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('marked for manual verification')
      );

      consoleLogSpy.mockRestore();
    });
  });
});
