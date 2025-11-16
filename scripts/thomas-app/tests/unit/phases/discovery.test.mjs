/**
 * Tests for phases/discovery.js
 *
 * Target: 100% coverage
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { MockPage } from '../../helpers/mock-browser.mjs';
import { mockFS } from '../../helpers/mock-fs.mjs';
import { createMockConfig } from '../../helpers/test-utils.mjs';

// Mock fs at module level
vi.mock('fs', () => {
  return {
    default: {
      existsSync: vi.fn((path) => mockFS.hasFile(path) || mockFS.hasDir(path)),
      readFileSync: vi.fn((path, encoding) => mockFS.readFileSync(path, encoding))
    },
    existsSync: vi.fn((path) => mockFS.hasFile(path) || mockFS.hasDir(path)),
    readFileSync: vi.fn((path, encoding) => mockFS.readFileSync(path, encoding))
  };
});

describe('Discovery Phase', () => {
  let discovery;

  // Helper to create page.evaluate mock that handles multiple function calls
  function createEvaluateMock(detection = {}, links = [], features = {}) {
    return vi.fn(async (fn) => {
      const fnString = fn.toString();

      // Detection function - first call
      if (fnString.includes('indicators')) {
        return {
          game: detection.game || false,
          ecommerce: detection.ecommerce || false,
          content: detection.content || false,
          saas: detection.saas || false
        };
      }

      // Route discovery function - second call
      if (fnString.includes('querySelectorAll')) {
        return links;
      }

      // Feature detection - third call
      if (fnString.includes('hasAuth')) {
        return {
          hasAuth: features.hasAuth || false,
          hasForms: features.hasForms || false,
          hasSearch: features.hasSearch || false,
          hasPayments: features.hasPayments || false,
          hasChat: features.hasChat || false,
          hasVideo: features.hasVideo || false,
          hasCanvas: features.hasCanvas || false,
          hasWebGL: features.hasWebGL || false,
          hasSocial: features.hasSocial || false
        };
      }

      return null;
    });
  }

  beforeEach(async () => {
    mockFS.reset();
    vi.clearAllMocks();

    // Dynamically import discovery module
    const discoveryModule = await import('/home/thoma/.claude/scripts/thomas-app/phases/discovery.mjs');
    discovery = discoveryModule;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('run', () => {
    test('should successfully analyze app', async () => {
      const page = new MockPage();
      page.evaluate = createEvaluateMock({ ecommerce: true });

      const orchestrator = {
        page,
        config: createMockConfig()
      };

      const result = await discovery.run(orchestrator);

      expect(result.appType).toBe('ecommerce');
      expect(result.routes).toBeDefined();
      expect(Array.isArray(result.routes)).toBe(true);
      expect(result.features).toBeDefined();
      expect(result.techStack).toBeDefined();
    });

    test('should throw error if page fails to load', async () => {
      const page = new MockPage();
      const config = createMockConfig({ baseUrl: 'http://fail-to-load' });

      const orchestrator = { page, config };

      await expect(discovery.run(orchestrator)).rejects.toThrow(
        'Failed to load'
      );
    });

    test('should detect game app type', async () => {
      const page = new MockPage();
      page.evaluate = createEvaluateMock({ game: true });

      const orchestrator = {
        page,
        config: createMockConfig()
      };

      const result = await discovery.run(orchestrator);

      expect(result.appType).toBe('game');
      expect(result.routes.some(r => r.path === '/game')).toBe(true);
    });

    test('should detect ecommerce app type', async () => {
      const page = new MockPage();
      page.evaluate = createEvaluateMock({ ecommerce: true });

      const orchestrator = {
        page,
        config: createMockConfig()
      };

      const result = await discovery.run(orchestrator);

      expect(result.appType).toBe('ecommerce');
      expect(result.routes.some(r => r.path === '/products')).toBe(true);
      expect(result.routes.some(r => r.path === '/cart')).toBe(true);
    });

    test('should detect content app type', async () => {
      const page = new MockPage();
      page.evaluate = createEvaluateMock({ content: true });

      const orchestrator = {
        page,
        config: createMockConfig()
      };

      const result = await discovery.run(orchestrator);

      expect(result.appType).toBe('content');
      expect(result.routes.some(r => r.path === '/blog')).toBe(true);
    });

    test('should detect saas app type', async () => {
      const page = new MockPage();
      page.evaluate = createEvaluateMock({ saas: true });

      const orchestrator = {
        page,
        config: createMockConfig()
      };

      const result = await discovery.run(orchestrator);

      expect(result.appType).toBe('saas');
      expect(result.routes.some(r => r.path === '/dashboard')).toBe(true);
    });

    test('should fallback to website type', async () => {
      const page = new MockPage();
      page.evaluate = createEvaluateMock({});

      const orchestrator = {
        page,
        config: createMockConfig()
      };

      const result = await discovery.run(orchestrator);

      expect(result.appType).toBe('website');
      expect(result.routes.some(r => r.path === '/about')).toBe(true);
    });

    test('should discover routes from page links', async () => {
      const page = new MockPage();

      // Mock route discovery
      page.evaluate = vi.fn(async (fn) => {
        const fnString = fn.toString();

        // Detection function
        if (fnString.includes('indicators')) {
          return {
            game: false,
            ecommerce: false,
            content: false,
            saas: false
          };
        }

        // Route discovery function
        if (fnString.includes('querySelectorAll')) {
          return ['/about', '/contact', '/pricing'];
        }

        // Feature detection
        if (fnString.includes('hasAuth')) {
          return {
            hasAuth: true,
            hasForms: true,
            hasSearch: false,
            hasPayments: false,
            hasChat: false,
            hasVideo: false,
            hasCanvas: false,
            hasWebGL: false,
            hasSocial: true
          };
        }

        return null;
      });

      const orchestrator = {
        page,
        config: createMockConfig()
      };

      const result = await discovery.run(orchestrator);

      expect(result.routes.length).toBeGreaterThan(0);
      expect(result.routes.every(r => typeof r.path === 'string')).toBe(true);
      expect(result.routes.every(r => typeof r.critical === 'boolean')).toBe(true);
    });

    test('should identify features correctly', async () => {
      const page = new MockPage();

      // Need to handle all three evaluate calls in sequence
      let evaluateCallCount = 0;
      page.evaluate = vi.fn(async (fn) => {
        const fnString = fn.toString();
        evaluateCallCount++;

        // First call: detectAppType - check for 'indicators'
        if (fnString.includes('indicators')) {
          return {
            game: false,
            ecommerce: false,
            content: false,
            saas: false
          };
        }

        // Second call: discoverRoutes - check for 'querySelectorAll'
        if (fnString.includes('querySelectorAll') && fnString.includes('a[href]')) {
          return [];
        }

        // Third call: identifyFeatures - check for 'hasAuth'
        if (fnString.includes('hasAuth')) {
          return {
            hasAuth: true,
            hasForms: true,
            hasSearch: true,
            hasPayments: true,
            hasChat: true,
            hasVideo: true,
            hasCanvas: true,
            hasWebGL: true,
            hasSocial: true
          };
        }

        return null;
      });

      const orchestrator = {
        page,
        config: createMockConfig()
      };

      const result = await discovery.run(orchestrator);

      expect(result.features).toContain('authentication');
      expect(result.features).toContain('forms');
      expect(result.features).toContain('search');
      expect(result.features).toContain('payments');
      expect(result.features).toContain('chat');
      expect(result.features).toContain('video');
      expect(result.features).toContain('canvas');
      expect(result.features).toContain('webgl');
      expect(result.features).toContain('social-sharing');
    });

    test('should not include features that are not present', async () => {
      const page = new MockPage();
      page.evaluate = createEvaluateMock({}, [], {});

      const orchestrator = {
        page,
        config: createMockConfig()
      };

      const result = await discovery.run(orchestrator);

      expect(result.features).toEqual([]);
    });

    test('should analyze tech stack from package.json', async () => {

      const packageJson = {
        dependencies: {
          react: '^18.0.0',
          vite: '^5.0.0',
          zustand: '^4.0.0',
          daisyui: '^3.0.0'
        },
        devDependencies: {
          playwright: '^1.40.0'
        }
      };

      mockFS.addFile('/home/thoma/.claude/scripts/thomas-app/package.json', JSON.stringify(packageJson));

      const page = new MockPage();
      page.evaluate = createEvaluateMock({});

      const orchestrator = {
        page,
        config: createMockConfig()
      };

      const result = await discovery.run(orchestrator);

      expect(result.techStack.framework).toBe('React');
      expect(result.techStack.build).toBe('Vite');
      expect(result.techStack.state).toBe('Zustand');
      expect(result.techStack.ui).toBe('DaisyUI');
    });

    test('should detect Next.js framework', async () => {
      const packageJson = {
        dependencies: {
          next: '^14.0.0',
          react: '^18.0.0'
        }
      };

      mockFS.addFile('/home/thoma/.claude/scripts/thomas-app/package.json', JSON.stringify(packageJson));

      const page = new MockPage();
      page.evaluate = createEvaluateMock({});

      const orchestrator = {
        page,
        config: createMockConfig()
      };

      const result = await discovery.run(orchestrator);

      expect(result.techStack.framework).toBe('Next.js');
    });

    test('should detect Vue framework', async () => {
      const packageJson = {
        dependencies: {
          vue: '^3.0.0'
        }
      };

      mockFS.addFile('/home/thoma/.claude/scripts/thomas-app/package.json', JSON.stringify(packageJson));

      const page = new MockPage();
      page.evaluate = createEvaluateMock({});

      const orchestrator = {
        page,
        config: createMockConfig()
      };

      const result = await discovery.run(orchestrator);

      expect(result.techStack.framework).toBe('Vue');
    });

    test('should detect Preact over React', async () => {
      const packageJson = {
        dependencies: {
          preact: '^10.0.0'
        }
      };

      mockFS.addFile('/home/thoma/.claude/scripts/thomas-app/package.json', JSON.stringify(packageJson));

      const page = new MockPage();
      page.evaluate = createEvaluateMock({});

      const orchestrator = {
        page,
        config: createMockConfig()
      };

      const result = await discovery.run(orchestrator);

      expect(result.techStack.framework).toBe('Preact');
    });

    test('should detect game engines', async () => {
      const packageJson = {
        dependencies: {
          konva: '^9.0.0'
        }
      };

      mockFS.addFile('/home/thoma/.claude/scripts/thomas-app/package.json', JSON.stringify(packageJson));

      const page = new MockPage();
      page.evaluate = createEvaluateMock({ game: true });

      const orchestrator = {
        page,
        config: createMockConfig()
      };

      const result = await discovery.run(orchestrator);

      expect(result.techStack.game).toBe('Konva');
    });

    test('should detect Phaser game engine', async () => {
      const packageJson = {
        dependencies: {
          phaser: '^3.60.0'
        }
      };

      mockFS.addFile('/home/thoma/.claude/scripts/thomas-app/package.json', JSON.stringify(packageJson));

      const page = new MockPage();
      page.evaluate = createEvaluateMock({ game: true });

      const orchestrator = {
        page,
        config: createMockConfig()
      };

      const result = await discovery.run(orchestrator);

      expect(result.techStack.game).toBe('Phaser');
    });

    test('should detect Babylon.js game engine', async () => {
      const packageJson = {
        dependencies: {
          babylonjs: '^6.0.0'
        }
      };

      mockFS.addFile('/home/thoma/.claude/scripts/thomas-app/package.json', JSON.stringify(packageJson));

      const page = new MockPage();
      page.evaluate = createEvaluateMock({ game: true });

      const orchestrator = {
        page,
        config: createMockConfig()
      };

      const result = await discovery.run(orchestrator);

      expect(result.techStack.game).toBe('Babylon.js');
    });

    test('should handle missing package.json gracefully', async () => {
      const page = new MockPage();
      page.evaluate = createEvaluateMock({});

      const orchestrator = {
        page,
        config: createMockConfig()
      };

      const result = await discovery.run(orchestrator);

      expect(result.techStack).toEqual({});
    });

    test('should detect Mantine UI library', async () => {
      const packageJson = {
        dependencies: {
          '@mantine/core': '^7.0.0'
        }
      };

      mockFS.addFile('/home/thoma/.claude/scripts/thomas-app/package.json', JSON.stringify(packageJson));

      const page = new MockPage();
      page.evaluate = createEvaluateMock({});

      const orchestrator = {
        page,
        config: createMockConfig()
      };

      const result = await discovery.run(orchestrator);

      expect(result.techStack.ui).toBe('Mantine');
    });

    test('should detect Nanostores state management', async () => {
      const packageJson = {
        dependencies: {
          nanostores: '^0.9.0'
        }
      };

      mockFS.addFile('/home/thoma/.claude/scripts/thomas-app/package.json', JSON.stringify(packageJson));

      const page = new MockPage();
      page.evaluate = createEvaluateMock({});

      const orchestrator = {
        page,
        config: createMockConfig()
      };

      const result = await discovery.run(orchestrator);

      expect(result.techStack.state).toBe('Nanostores');
    });

    test('should detect Redux state management', async () => {
      const packageJson = {
        dependencies: {
          redux: '^5.0.0'
        }
      };

      mockFS.addFile('/home/thoma/.claude/scripts/thomas-app/package.json', JSON.stringify(packageJson));

      const page = new MockPage();
      page.evaluate = createEvaluateMock({});

      const orchestrator = {
        page,
        config: createMockConfig()
      };

      const result = await discovery.run(orchestrator);

      expect(result.techStack.state).toBe('Redux');
    });

    test('should detect Webpack build tool', async () => {
      const packageJson = {
        dependencies: {
          webpack: '^5.0.0'
        }
      };

      mockFS.addFile('/home/thoma/.claude/scripts/thomas-app/package.json', JSON.stringify(packageJson));

      const page = new MockPage();
      page.evaluate = createEvaluateMock({});

      const orchestrator = {
        page,
        config: createMockConfig()
      };

      const result = await discovery.run(orchestrator);

      expect(result.techStack.build).toBe('Webpack');
    });

    test('should mark critical routes correctly', async () => {
      const page = new MockPage();
      page.evaluate = vi.fn(async (fn) => {
        const fnString = fn.toString();

        if (fnString.includes('querySelectorAll')) {
          return ['/checkout', '/game', '/about'];
        }

        return {
          game: false,
          ecommerce: false,
          content: false,
          saas: false
        };
      });

      const orchestrator = {
        page,
        config: createMockConfig()
      };

      const result = await discovery.run(orchestrator);

      const checkoutRoute = result.routes.find(r => r.path === '/checkout');
      const gameRoute = result.routes.find(r => r.path === '/game');
      const aboutRoute = result.routes.find(r => r.path === '/about');
      const homeRoute = result.routes.find(r => r.path === '/');

      expect(homeRoute?.critical).toBe(true);
      if (checkoutRoute) expect(checkoutRoute.critical).toBe(true);
      if (gameRoute) expect(gameRoute.critical).toBe(true);
      if (aboutRoute) expect(aboutRoute.critical).toBe(false);
    });

    test('should mark homepage as visited', async () => {
      const page = new MockPage();
      page.evaluate = createEvaluateMock({});

      const orchestrator = {
        page,
        config: createMockConfig()
      };

      const result = await discovery.run(orchestrator);

      const homeRoute = result.routes.find(r => r.path === '/');
      expect(homeRoute?.visited).toBe(true);

      const otherRoutes = result.routes.filter(r => r.path !== '/');
      otherRoutes.forEach(route => {
        expect(route.visited).toBe(false);
      });
    });
  });
});
