/**
 * Phase 6: Security & Analytics
 *
 * Security headers, sensitive data, analytics verification
 */

async function run(orchestrator) {
  const { page, config } = orchestrator;

  console.log(`🔒 Running security & analytics checks...\n`);

  const results = {
    securityScore: 100,
    sensitiveData: [],
    securityHeaders: {},
    analytics: {},
    issues: []
  };

  // Check for sensitive data in storage
  console.log(`  Checking for sensitive data exposure...`);
  results.sensitiveData = await checkSensitiveData(page);
  if (results.sensitiveData.length > 0) {
    console.log(`    ⚠️  Found ${results.sensitiveData.length} potential issues`);
    results.securityScore -= 20;
  }

  // Check security headers
  console.log(`  Checking security headers...`);
  results.securityHeaders = await checkSecurityHeaders(page);
  const missingHeaders = Object.values(results.securityHeaders).filter(v => v.includes('MISSING')).length;
  if (missingHeaders > 0) {
    console.log(`    ⚠️  ${missingHeaders} headers missing`);
    results.securityScore -= missingHeaders * 10;
  }

  // Check analytics
  console.log(`  Checking analytics implementation...`);
  results.analytics = await checkAnalytics(page);

  results.securityScore = Math.max(0, results.securityScore);

  return results;
}

async function checkSensitiveData(page) {
  return await page.evaluate(() => {
    const findings = [];
    const sensitivePatterns = /password|secret|token|key|credential|private|ssn|credit.*card/i;

    // Check localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);

      if (sensitivePatterns.test(key) || sensitivePatterns.test(value)) {
        findings.push({
          storage: 'localStorage',
          key,
          issue: 'Potentially sensitive data in localStorage'
        });
      }
    }

    // Check sessionStorage
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      const value = sessionStorage.getItem(key);

      if (sensitivePatterns.test(key) || sensitivePatterns.test(value)) {
        findings.push({
          storage: 'sessionStorage',
          key,
          issue: 'Potentially sensitive data in sessionStorage'
        });
      }
    }

    return findings;
  });
}

async function checkSecurityHeaders(page) {
  const response = await page.goto(page.url());
  const headers = response.headers();

  return {
    'content-security-policy': headers['content-security-policy'] || '❌ MISSING',
    'x-frame-options': headers['x-frame-options'] || '❌ MISSING',
    'x-content-type-options': headers['x-content-type-options'] || '❌ MISSING',
    'strict-transport-security': headers['strict-transport-security'] || '❌ MISSING',
    'referrer-policy': headers['referrer-policy'] || '❌ MISSING'
  };
}

async function checkAnalytics(page) {
  return await page.evaluate(() => {
    return {
      googleAnalytics: !!(window.gtag || window.ga || window._gaq),
      googleTagManager: !!window.dataLayer,
      facebookPixel: !!window.fbq,
      mixpanel: !!window.mixpanel,
      amplitude: !!window.amplitude
    };
  });
}

export default { run };
