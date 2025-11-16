/**
 * Debug Configuration for Thomas App
 *
 * Three-tier debug system:
 * - off: No debugging (default)
 * - basic: Lightweight debugging (~10-15% overhead)
 * - detailed: Comprehensive debugging (~30-40% overhead)
 * - full: Maximum visibility (~50%+ overhead)
 */

export const DEBUG_CONFIGS = {
  off: {
    enabled: false,
    actionLog: false,
    consoleLog: false,
    networkLog: { enabled: false },
    screenshots: { enabled: false },
    video: false,
    trace: false,
    elementState: false,
    performance: { enabled: false },
    har: false,
    outputDir: '.thomas-app/debug',
    retention: '7d',
    maxSize: '100MB'
  },

  basic: {
    enabled: true,

    // Logging
    actionLog: true,
    consoleLog: true,
    networkLog: {
      enabled: true,
      captureBody: false,
      captureHeaders: false,
      onlyFailed: true
    },

    // Visual
    screenshots: {
      enabled: true,
      mode: 'only-on-failure',
      compress: true,
      beforeAfter: false
    },
    video: false,

    // Analysis
    trace: false,
    elementState: false,
    performance: {
      enabled: true,
      metrics: ['basic'], // Just load time, response time
      budget: null
    },
    har: false,

    // Storage
    outputDir: '.thomas-app/debug',
    retention: '7d',
    maxSize: '100MB'
  },

  detailed: {
    enabled: true,

    // Logging
    actionLog: true,
    consoleLog: true,
    networkLog: {
      enabled: true,
      captureBody: true,
      captureHeaders: true,
      onlyFailed: false
    },

    // Visual
    screenshots: {
      enabled: true,
      mode: 'on', // Every action
      compress: true,
      beforeAfter: true // Capture before AND after each action
    },
    video: false, // Still too expensive

    // Analysis
    trace: {
      enabled: true,
      mode: 'on-first-retry',
      screenshots: true,
      snapshots: true
    },
    elementState: {
      enabled: true,
      captureProperties: ['value', 'textContent', 'disabled', 'checked', 'selected'],
      captureComputed: ['display', 'visibility', 'opacity']
    },
    performance: {
      enabled: true,
      metrics: ['all'], // Everything from CDP
      budget: {
        loadTime: 3000,
        firstContentfulPaint: 1500
      }
    },
    har: false,

    // Storage
    outputDir: '.thomas-app/debug',
    retention: '7d',
    maxSize: '500MB'
  },

  full: {
    enabled: true,

    // Logging
    actionLog: true,
    consoleLog: true,
    networkLog: {
      enabled: true,
      captureBody: true,
      captureHeaders: true,
      onlyFailed: false
    },

    // Visual
    screenshots: {
      enabled: true,
      mode: 'on',
      compress: true,
      beforeAfter: true
    },
    video: {
      enabled: true,
      dir: '.thomas-app/debug/videos',
      size: { width: 1920, height: 1080 }
    },

    // Analysis
    trace: {
      enabled: true,
      mode: 'on', // Always trace
      screenshots: true,
      snapshots: true,
      sources: true
    },
    elementState: {
      enabled: true,
      captureProperties: ['value', 'textContent', 'disabled', 'checked', 'selected', 'className', 'id'],
      captureComputed: ['display', 'visibility', 'opacity', 'width', 'height', 'position']
    },
    performance: {
      enabled: true,
      metrics: ['all'],
      budget: {
        loadTime: 3000,
        firstContentfulPaint: 1500
      }
    },
    har: {
      enabled: true,
      path: '.thomas-app/debug/network.har'
    },
    accessibility: {
      enabled: true,
      snapshots: true
    },
    coverage: {
      enabled: true,
      types: ['css', 'js']
    },

    // Storage
    outputDir: '.thomas-app/debug',
    retention: '14d', // Longer retention for critical debugging
    maxSize: '2GB'
  }
};

/**
 * Get debug config by level
 * @param {string} level - Debug level: 'off', 'basic', 'detailed', 'full'
 * @returns {Object} Debug configuration
 */
export function getDebugConfig(level = 'off') {
  if (!DEBUG_CONFIGS[level]) {
    console.warn(`[DEBUG] Unknown debug level: ${level}, using 'off'`);
    return DEBUG_CONFIGS.off;
  }

  return DEBUG_CONFIGS[level];
}

/**
 * Get estimated overhead for debug level
 * @param {string} level - Debug level
 * @returns {string} Overhead estimate
 */
export function getOverhead(level) {
  const overheads = {
    off: '0%',
    basic: '~10-15%',
    detailed: '~30-40%',
    full: '~50%+'
  };
  return overheads[level] || 'unknown';
}

/**
 * Parse CLI arguments for debug flags
 * @param {Array<string>} args - Command line arguments
 * @returns {Object} Parsed debug options
 */
export function parseDebugArgs(args) {
  const options = {
    level: 'off',
    dir: null,
    retention: null
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--debug') {
      options.level = 'basic';
    } else if (arg === '--debug-detailed') {
      options.level = 'detailed';
    } else if (arg === '--debug-full') {
      options.level = 'full';
    } else if (arg === '--debug-dir' && args[i + 1]) {
      options.dir = args[++i];
    } else if (arg === '--debug-retention' && args[i + 1]) {
      options.retention = args[++i];
    }
  }

  return options;
}
