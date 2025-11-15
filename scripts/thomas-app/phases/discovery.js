/**
 * Phase 1: Discovery & Context Analysis
 *
 * Detect app type, discover routes, identify features
 */

const fs = require('fs');
const path = require('path');

async function run(orchestrator) {
  const { page, config } = orchestrator;
  const results = {
    appType: null,
    routes: [],
    features: [],
    techStack: {},
    recommendations: []
  };

  // Navigate to base URL
  console.log(`🔍 Analyzing app at ${config.baseUrl}...`);

  try {
    await page.goto(config.baseUrl, { waitUntil: 'networkidle', timeout: 30000 });
  } catch (error) {
    throw new Error(`Failed to load ${config.baseUrl}: ${error.message}`);
  }

  // Detect app type
  results.appType = await detectAppType(page);
  console.log(`   App Type: ${results.appType}`);

  // Discover routes
  results.routes = await discoverRoutes(page, results.appType);
  console.log(`   Routes: ${results.routes.length} found`);

  // Identify features
  results.features = await identifyFeatures(page);
  console.log(`   Features: ${results.features.join(', ')}`);

  // Analyze tech stack
  results.techStack = await analyzeTechStack();
  console.log(`   Tech: ${Object.keys(results.techStack).join(', ')}`);

  return results;
}

async function detectAppType(page) {
  const detection = await page.evaluate(() => {
    const indicators = {
      game: false,
      ecommerce: false,
      content: false,
      saas: false
    };

    // Game indicators
    if (
      document.querySelector('canvas') ||
      window.Konva ||
      window.Phaser ||
      window.BABYLON ||
      window.THREE ||
      document.querySelector('[data-game]') ||
      /game|play|score|level/i.test(document.title)
    ) {
      indicators.game = true;
    }

    // E-commerce indicators
    if (
      document.querySelector('[class*="cart"]') ||
      document.querySelector('[class*="product"]') ||
      document.querySelector('[class*="checkout"]') ||
      /shop|store|cart|product|buy/i.test(document.body.innerHTML.substring(0, 10000))
    ) {
      indicators.ecommerce = true;
    }

    // Content indicators
    if (
      document.querySelector('article') ||
      document.querySelector('[class*="blog"]') ||
      document.querySelector('[class*="post"]') ||
      document.querySelectorAll('h1, h2, h3').length > 10
    ) {
      indicators.content = true;
    }

    // SaaS indicators
    if (
      document.querySelector('[class*="dashboard"]') ||
      document.querySelector('[class*="settings"]') ||
      document.querySelector('[class*="account"]') ||
      /dashboard|app|platform/i.test(document.title)
    ) {
      indicators.saas = true;
    }

    return indicators;
  });

  // Determine primary type
  if (detection.game) return 'game';
  if (detection.ecommerce) return 'ecommerce';
  if (detection.content) return 'content';
  if (detection.saas) return 'saas';

  return 'website';  // Generic fallback
}

async function discoverRoutes(page, appType) {
  const routes = new Set(['/']);  // Always include homepage

  // Discover links on homepage
  const links = await page.evaluate(() => {
    const anchors = Array.from(document.querySelectorAll('a[href]'));
    return anchors
      .map(a => {
        try {
          const url = new URL(a.href, window.location.origin);
          // Only same-origin, no anchors
          if (url.origin === window.location.origin && !url.hash) {
            return url.pathname;
          }
        } catch (e) {
          return null;
        }
      })
      .filter(Boolean);
  });

  links.forEach(link => routes.add(link));

  // Add common routes based on app type
  const commonRoutes = {
    game: ['/game', '/play', '/leaderboard'],
    ecommerce: ['/products', '/cart', '/checkout', '/account'],
    content: ['/blog', '/about', '/contact'],
    saas: ['/login', '/signup', '/dashboard', '/settings'],
    website: ['/about', '/contact']
  };

  if (commonRoutes[appType]) {
    commonRoutes[appType].forEach(route => routes.add(route));
  }

  // Convert to array of route objects
  return Array.from(routes).map(route => ({
    path: route,
    critical: route === '/' || route.includes('checkout') || route.includes('game'),
    visited: route === '/'
  }));
}

async function identifyFeatures(page) {
  const features = [];

  const checks = await page.evaluate(() => {
    return {
      hasAuth: !!(
        document.querySelector('[href*="login"]') ||
        document.querySelector('[href*="signin"]') ||
        document.querySelector('[href*="signup"]')
      ),
      hasForms: document.querySelectorAll('form').length > 0,
      hasSearch: !!(
        document.querySelector('input[type="search"]') ||
        document.querySelector('[placeholder*="search" i]')
      ),
      hasPayments: !!(
        document.querySelector('[class*="stripe"]') ||
        document.querySelector('[class*="payment"]') ||
        document.querySelector('[data-stripe]')
      ),
      hasChat: !!(
        document.querySelector('[class*="chat"]') ||
        document.querySelector('[data-intercom]') ||
        window.Intercom
      ),
      hasVideo: document.querySelectorAll('video').length > 0,
      hasCanvas: document.querySelectorAll('canvas').length > 0,
      hasWebGL: !!document.querySelector('canvas[data-engine]'),
      hasSocial: !!(
        document.querySelector('[class*="share"]') ||
        document.querySelector('[href*="facebook"]') ||
        document.querySelector('[href*="twitter"]')
      )
    };
  });

  if (checks.hasAuth) features.push('authentication');
  if (checks.hasForms) features.push('forms');
  if (checks.hasSearch) features.push('search');
  if (checks.hasPayments) features.push('payments');
  if (checks.hasChat) features.push('chat');
  if (checks.hasVideo) features.push('video');
  if (checks.hasCanvas) features.push('canvas');
  if (checks.hasWebGL) features.push('webgl');
  if (checks.hasSocial) features.push('social-sharing');

  return features;
}

function analyzeTechStack() {
  const techStack = {};

  // Check package.json if exists
  const packagePath = path.join(process.cwd(), 'package.json');
  if (fs.existsSync(packagePath)) {
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };

    // Frameworks
    if (deps.react || deps.preact) techStack.framework = deps.react ? 'React' : 'Preact';
    if (deps.next) techStack.framework = 'Next.js';
    if (deps.vue) techStack.framework = 'Vue';

    // UI Libraries
    if (deps.daisyui) techStack.ui = 'DaisyUI';
    if (deps['@mantine/core']) techStack.ui = 'Mantine';

    // State Management
    if (deps.nanostores) techStack.state = 'Nanostores';
    if (deps.zustand) techStack.state = 'Zustand';
    if (deps.redux) techStack.state = 'Redux';

    // Build Tools
    if (deps.vite) techStack.build = 'Vite';
    if (deps.webpack) techStack.build = 'Webpack';

    // Game Engines
    if (deps.konva) techStack.game = 'Konva';
    if (deps.phaser) techStack.game = 'Phaser';
    if (deps.babylonjs) techStack.game = 'Babylon.js';
  }

  return techStack;
}

module.exports = { run };
