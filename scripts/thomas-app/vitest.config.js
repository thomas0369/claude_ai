/**
 * Vitest Configuration for Thomas-App
 *
 * Goal: 100% test coverage
 */

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Test files pattern
    include: ['**/*.{test,spec}.{mjs,js,cjs,ts,mts,cts,jsx,tsx}'],

    // Exclude patterns
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*'
    ],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: [
        'orchestrator.js',
        'phases/**/*.js',
        'reporters/**/*.js',
        'utils/**/*.js'
      ],
      exclude: [
        '**/*.test.js',
        '**/*.spec.js',
        '**/node_modules/**',
        '**/.thomas-app/**'
      ],
      // Thresholds for 100% coverage
      statements: 100,
      branches: 100,
      functions: 100,
      lines: 100,
      // Report uncovered lines
      all: true,
      skipFull: false
    },

    // Test environment
    environment: 'node',

    // Globals
    globals: true,

    // Support CommonJS
    deps: {
      inline: ['vitest']
    },

    // Timeout
    testTimeout: 30000,
    hookTimeout: 30000,

    // Mock configuration
    mockReset: true,
    clearMocks: true,
    restoreMocks: true,

    // Reporter
    reporter: ['verbose'],

    // Parallel execution
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: false
      }
    }
  }
});
