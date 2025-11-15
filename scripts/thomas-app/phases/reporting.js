/**
 * Phase 8: Intelligent Reporting
 *
 * Aggregates results, generates recommendations, creates reports
 */

const fs = require('fs');
const path = require('path');

async function generate(orchestrator) {
  const { results, config, page } = orchestrator;

  console.log(`\n📊 Generating intelligent report...\n`);

  const report = {
    meta: {
      timestamp: new Date().toISOString(),
      duration: Date.now() - results.startTime,
      url: config.baseUrl,
      appType: results.phases.discovery?.appType || 'unknown'
    },
    scores: {},
    issues: [],
    recommendations: [],
    metrics: {},
    comparison: null
  };

  // Calculate scores
  report.scores = calculateScores(results);

  // Aggregate all issues
  report.issues = aggregateIssues(results);

  // Sort by priority (impact/effort)
  report.issues.sort((a, b) => b.priority - a.priority);

  // Generate intelligent recommendations (pass results for agent reviews)
  report.recommendations = generateRecommendations(report, results);

  // Collect metrics
  report.metrics = collectMetrics(results);

  // Compare with baseline if exists
  report.comparison = await compareWithBaseline(report, config.outputDir);

  // Visual regression detection
  if (results.phases.visualInteraction?.screenshots) {
    report.visualRegression = await detectVisualRegression(
      results.phases.visualInteraction.screenshots,
      config.outputDir
    );
  }

  // Save baseline for future comparisons
  await saveBaseline(report, config.outputDir);

  // Generate HTML report
  await generateHTMLReport(report, config.outputDir);

  // Save JSON report
  fs.writeFileSync(
    path.join(config.outputDir, 'report.json'),
    JSON.stringify(report, null, 2)
  );

  // Print console summary
  printSummary(report);

  return report;
}

function calculateScores(results) {
  const scores = {
    overall: 0,
    ux: 0,
    performance: 0,
    accessibility: 0,
    security: 0,
    seo: 0
  };

  // UX Score (customer journeys + visual)
  let uxScore = 100;
  if (results.phases.customerJourneys) {
    const failedJourneys = results.phases.customerJourneys.journeys.filter(j => !j.success).length;
    const totalJourneys = results.phases.customerJourneys.journeys.length;
    uxScore -= (failedJourneys / totalJourneys) * 30;
  }
  if (results.phases.visualInteraction) {
    const visualIssues = results.phases.visualInteraction.issues?.length || 0;
    uxScore -= Math.min(visualIssues * 5, 30);
  }
  scores.ux = Math.max(0, Math.round(uxScore));

  // Performance Score
  if (results.phases.performanceAccessibility) {
    scores.performance = results.phases.performanceAccessibility.performanceScore || 0;
  }

  // Accessibility Score
  if (results.phases.performanceAccessibility) {
    scores.accessibility = results.phases.performanceAccessibility.a11yScore || 0;
  }

  // Security Score
  if (results.phases.securityAnalytics) {
    scores.security = results.phases.securityAnalytics.securityScore || 0;
  }

  // SEO Score
  if (results.phases.seo) {
    const seoIssues = results.phases.seo.issues?.length || 0;
    scores.seo = Math.max(0, 100 - (seoIssues * 15));
  }

  // Overall Score (weighted average)
  scores.overall = Math.round(
    scores.ux * 0.30 +
    scores.performance * 0.25 +
    scores.accessibility * 0.20 +
    scores.security * 0.15 +
    scores.seo * 0.10
  );

  return scores;
}

function aggregateIssues(results) {
  const issues = [];

  // Customer journey failures
  if (results.phases.customerJourneys) {
    results.phases.customerJourneys.journeys
      .filter(j => !j.success)
      .forEach(journey => {
        issues.push({
          phase: 'Customer Journeys',
          type: 'journey-failure',
          severity: 'critical',
          title: `Journey "${journey.name}" failed`,
          description: journey.error || 'Journey did not complete successfully',
          impact: 'Users cannot complete critical flows',
          effort: 'medium',
          priority: calculatePriority('critical', 'medium')
        });
      });
  }

  // Visual/interaction issues
  if (results.phases.visualInteraction?.issues) {
    results.phases.visualInteraction.issues.forEach(issue => {
      issues.push({
        phase: 'Visual/Interaction',
        type: issue.type,
        severity: issue.severity,
        title: issue.message,
        description: issue.details || issue.message,
        impact: getImpactDescription(issue.type),
        effort: getEffortEstimate(issue.type),
        priority: calculatePriority(issue.severity, getEffortEstimate(issue.type))
      });
    });
  }

  // Performance issues
  if (results.phases.performanceAccessibility?.coreWebVitals) {
    const cwv = results.phases.performanceAccessibility.coreWebVitals;

    if (cwv.lcp > 2500) {
      issues.push({
        phase: 'Performance',
        type: 'lcp',
        severity: cwv.lcp > 4000 ? 'high' : 'medium',
        title: `LCP too slow (${cwv.lcp}ms)`,
        description: `Largest Contentful Paint is ${cwv.lcp}ms (target: <2500ms)`,
        impact: 'Poor perceived loading performance, higher bounce rates',
        effort: 'medium',
        priority: calculatePriority(cwv.lcp > 4000 ? 'high' : 'medium', 'medium')
      });
    }

    if (cwv.cls > 0.1) {
      issues.push({
        phase: 'Performance',
        type: 'cls',
        severity: cwv.cls > 0.25 ? 'high' : 'medium',
        title: `CLS too high (${cwv.cls.toFixed(3)})`,
        description: `Cumulative Layout Shift is ${cwv.cls.toFixed(3)} (target: <0.1)`,
        impact: 'Unexpected layout shifts frustrate users',
        effort: 'low',
        priority: calculatePriority(cwv.cls > 0.25 ? 'high' : 'medium', 'low')
      });
    }
  }

  // Accessibility violations
  if (results.phases.performanceAccessibility?.accessibilityIssues) {
    results.phases.performanceAccessibility.accessibilityIssues.forEach(violation => {
      issues.push({
        phase: 'Accessibility',
        type: 'a11y-violation',
        severity: violation.impact === 'critical' ? 'critical' : violation.impact === 'serious' ? 'high' : 'medium',
        title: violation.help,
        description: `${violation.description} (${violation.nodes} instances)`,
        impact: 'Blocks users with disabilities, potential legal issues',
        effort: 'low',
        priority: calculatePriority(
          violation.impact === 'critical' ? 'critical' : violation.impact === 'serious' ? 'high' : 'medium',
          'low'
        ),
        helpUrl: violation.helpUrl
      });
    });
  }

  // Security issues
  if (results.phases.securityAnalytics?.sensitiveData) {
    results.phases.securityAnalytics.sensitiveData.forEach(finding => {
      issues.push({
        phase: 'Security',
        type: 'sensitive-data',
        severity: 'high',
        title: `Sensitive data in ${finding.storage}`,
        description: finding.issue,
        impact: 'Potential data breach, privacy violations',
        effort: 'low',
        priority: calculatePriority('high', 'low')
      });
    });
  }

  if (results.phases.securityAnalytics?.securityHeaders) {
    Object.entries(results.phases.securityAnalytics.securityHeaders).forEach(([header, value]) => {
      if (value.includes('MISSING')) {
        issues.push({
          phase: 'Security',
          type: 'security-header',
          severity: 'medium',
          title: `Missing security header: ${header}`,
          description: `Security header "${header}" is not set`,
          impact: 'Increased vulnerability to attacks',
          effort: 'low',
          priority: calculatePriority('medium', 'low')
        });
      }
    });
  }

  // SEO issues
  if (results.phases.seo?.issues) {
    results.phases.seo.issues.forEach(issue => {
      issues.push({
        phase: 'SEO',
        type: issue.type,
        severity: 'medium',
        title: issue.message,
        description: issue.message,
        impact: 'Reduced search visibility and social sharing',
        effort: 'low',
        priority: calculatePriority('medium', 'low')
      });
    });
  }

  // Game AI issues (if applicable)
  if (results.phases.gameAI?.difficultyCurve) {
    const curve = results.phases.gameAI.difficultyCurve;
    if (curve.tooEasy || curve.tooHard) {
      issues.push({
        phase: 'Game AI',
        type: 'difficulty-balance',
        severity: 'medium',
        title: curve.tooEasy ? 'Game too easy' : 'Game too hard',
        description: `Difficulty curve analysis: ${curve.tooEasy ? 'Players progress too quickly' : 'Players get stuck'}`,
        impact: 'Poor player retention and engagement',
        effort: 'high',
        priority: calculatePriority('medium', 'high')
      });
    }
  }

  if (results.phases.gameAI?.exploits) {
    results.phases.gameAI.exploits.forEach(exploit => {
      issues.push({
        phase: 'Game AI',
        type: 'exploit',
        severity: 'high',
        title: `Game exploit detected: ${exploit.type}`,
        description: exploit.description,
        impact: 'Players can abuse mechanics for unfair advantage',
        effort: 'medium',
        priority: calculatePriority('high', 'medium')
      });
    });
  }

  // Real-world condition issues
  if (results.phases.realWorld?.networkTests) {
    results.phases.realWorld.networkTests.forEach(test => {
      if (!test.acceptable) {
        issues.push({
          phase: 'Real-World',
          type: 'slow-network',
          severity: 'medium',
          title: `Slow load on ${test.profile}`,
          description: `Page loads in ${test.loadTime}ms on ${test.profile} (target: <10s)`,
          impact: 'Users on slower connections have poor experience',
          effort: 'medium',
          priority: calculatePriority('medium', 'medium')
        });
      }
    });
  }

  if (results.phases.realWorld?.deviceTests) {
    results.phases.realWorld.deviceTests
      .filter(test => !test.responsive)
      .forEach(test => {
        issues.push({
          phase: 'Real-World',
          type: 'responsive',
          severity: 'high',
          title: `Layout broken on ${test.device}`,
          description: `Horizontal scrolling detected on ${test.device}`,
          impact: 'Mobile users cannot use the app properly',
          effort: 'low',
          priority: calculatePriority('high', 'low')
        });
      });
  }

  return issues;
}

function calculatePriority(severity, effort) {
  const severityScore = {
    'critical': 10,
    'high': 7,
    'medium': 4,
    'low': 1
  }[severity] || 1;

  const effortScore = {
    'low': 3,
    'medium': 2,
    'high': 1
  }[effort] || 1;

  // Priority = Impact / Effort (higher is better ROI)
  return severityScore * effortScore;
}

function getImpactDescription(type) {
  const impacts = {
    'layout': 'Users cannot view content properly',
    'touch-target': 'Mobile users struggle to tap buttons',
    'contrast': 'Text is hard to read',
    'broken-link': 'Users hit dead ends',
    'console-error': 'App may malfunction'
  };
  return impacts[type] || 'Degrades user experience';
}

function getEffortEstimate(type) {
  const efforts = {
    'layout': 'low',
    'touch-target': 'low',
    'contrast': 'low',
    'broken-link': 'low',
    'console-error': 'medium',
    'journey-failure': 'medium'
  };
  return efforts[type] || 'medium';
}

function generateRecommendations(report, results) {
  const recommendations = [];

  // Include agent review recommendations first (highest priority)
  if (results?.phases?.agentReviews?.recommendations) {
    results.phases.agentReviews.recommendations.forEach(rec => {
      recommendations.push({
        category: rec.category || 'Code Review',
        priority: rec.priority,
        action: rec.action,
        reason: rec.reason,
        roi: rec.priority === 'critical' ? 10 : rec.priority === 'high' ? 8 : 6,
        source: 'AI Agent Review'
      });
    });
  }

  // Top 5 priority issues
  const topIssues = report.issues.slice(0, 5);
  topIssues.forEach(issue => {
    recommendations.push({
      category: issue.phase,
      priority: issue.severity,
      action: getActionForIssue(issue),
      reason: issue.impact,
      roi: issue.priority
    });
  });

  // Score-based recommendations
  if (report.scores.performance < 70) {
    recommendations.push({
      category: 'Performance',
      priority: 'high',
      action: 'Optimize Core Web Vitals',
      reason: `Performance score is ${report.scores.performance}/100. This affects SEO rankings and user retention.`,
      roi: 8
    });
  }

  if (report.scores.accessibility < 80) {
    recommendations.push({
      category: 'Accessibility',
      priority: 'high',
      action: 'Fix accessibility violations',
      reason: `A11y score is ${report.scores.accessibility}/100. This excludes users with disabilities and creates legal risk.`,
      roi: 9
    });
  }

  if (report.scores.security < 70) {
    recommendations.push({
      category: 'Security',
      priority: 'critical',
      action: 'Address security vulnerabilities',
      reason: `Security score is ${report.scores.security}/100. This puts user data at risk.`,
      roi: 10
    });
  }

  // Sort by ROI
  recommendations.sort((a, b) => b.roi - a.roi);

  return recommendations.slice(0, 10); // Top 10 recommendations
}

function getActionForIssue(issue) {
  const actions = {
    'journey-failure': `Fix the "${issue.title}" flow to ensure users can complete it`,
    'lcp': 'Optimize largest contentful paint: reduce image sizes, improve server response time, use CDN',
    'cls': 'Fix layout shifts: add width/height to images, avoid inserting content above existing content',
    'a11y-violation': `Fix accessibility: ${issue.title}`,
    'sensitive-data': 'Remove sensitive data from client-side storage, use secure backend storage',
    'security-header': `Add security header: ${issue.title.split(':')[1]?.trim()}`,
    'layout': 'Fix responsive layout: remove fixed widths, use flexible layouts',
    'touch-target': 'Increase touch target sizes to minimum 44x44px',
    'slow-network': 'Optimize for slow networks: reduce bundle size, lazy load content',
    'responsive': 'Fix responsive layout for mobile devices'
  };
  return actions[issue.type] || `Address: ${issue.title}`;
}

function collectMetrics(results) {
  const metrics = {};

  if (results.phases.performanceAccessibility?.coreWebVitals) {
    metrics.coreWebVitals = results.phases.performanceAccessibility.coreWebVitals;
  }

  if (results.phases.performanceAccessibility?.lighthouse) {
    metrics.lighthouse = results.phases.performanceAccessibility.lighthouse;
  }

  if (results.phases.customerJourneys) {
    metrics.journeys = {
      total: results.phases.customerJourneys.journeys.length,
      successful: results.phases.customerJourneys.journeys.filter(j => j.success).length,
      failed: results.phases.customerJourneys.journeys.filter(j => !j.success).length
    };
  }

  if (results.phases.visualInteraction) {
    metrics.visual = {
      screenshotsTaken: results.phases.visualInteraction.screenshots?.length || 0,
      issuesFound: results.phases.visualInteraction.issues?.length || 0
    };
  }

  return metrics;
}

async function compareWithBaseline(report, outputDir) {
  const baselinePath = path.join(outputDir, 'baseline.json');

  if (!fs.existsSync(baselinePath)) {
    return null;
  }

  const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));

  return {
    scoreChanges: {
      overall: report.scores.overall - baseline.scores.overall,
      ux: report.scores.ux - baseline.scores.ux,
      performance: report.scores.performance - baseline.scores.performance,
      accessibility: report.scores.accessibility - baseline.scores.accessibility,
      security: report.scores.security - baseline.scores.security,
      seo: report.scores.seo - baseline.scores.seo
    },
    newIssues: report.issues.length - baseline.issues.length,
    metricChanges: compareMetrics(report.metrics, baseline.metrics)
  };
}

function compareMetrics(current, baseline) {
  const changes = {};

  if (current.coreWebVitals && baseline.coreWebVitals) {
    changes.lcp = current.coreWebVitals.lcp - baseline.coreWebVitals.lcp;
    changes.cls = current.coreWebVitals.cls - baseline.coreWebVitals.cls;
  }

  return changes;
}

async function detectVisualRegression(screenshots, outputDir) {
  const baselinesDir = path.join(outputDir, 'baselines');

  if (!fs.existsSync(baselinesDir)) {
    // No baselines yet, save current screenshots as baseline
    fs.mkdirSync(baselinesDir, { recursive: true });
    screenshots.forEach(screenshot => {
      const baselinePath = path.join(baselinesDir, path.basename(screenshot.path));
      fs.copyFileSync(screenshot.path, baselinePath);
    });
    return { baseline: true, differences: [] };
  }

  // Compare screenshots with baselines
  // Note: For now we just report that baselines exist
  // Full pixel-by-pixel comparison would require image processing libraries
  return {
    baseline: false,
    differences: [],
    note: 'Visual regression detection requires manual comparison or additional image processing libraries'
  };
}

async function saveBaseline(report, outputDir) {
  const baselinePath = path.join(outputDir, 'baseline.json');

  fs.writeFileSync(baselinePath, JSON.stringify({
    timestamp: report.meta.timestamp,
    scores: report.scores,
    issues: report.issues,
    metrics: report.metrics
  }, null, 2));
}

async function generateHTMLReport(report, outputDir) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thomas App Test Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem;
      color: #333;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 2rem;
      text-align: center;
    }
    .header h1 { font-size: 2.5rem; margin-bottom: 0.5rem; }
    .header p { opacity: 0.9; font-size: 1.1rem; }
    .scores {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
      padding: 2rem;
      background: #f8f9fa;
    }
    .score-card {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      text-align: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .score-card h3 { font-size: 0.9rem; color: #666; margin-bottom: 0.5rem; text-transform: uppercase; }
    .score-value {
      font-size: 3rem;
      font-weight: bold;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .score-good { color: #22c55e !important; -webkit-text-fill-color: #22c55e !important; }
    .score-warning { color: #f59e0b !important; -webkit-text-fill-color: #f59e0b !important; }
    .score-bad { color: #ef4444 !important; -webkit-text-fill-color: #ef4444 !important; }
    .section {
      padding: 2rem;
      border-bottom: 1px solid #e5e7eb;
    }
    .section h2 {
      font-size: 1.75rem;
      margin-bottom: 1.5rem;
      color: #1f2937;
    }
    .issue {
      background: white;
      border-left: 4px solid #e5e7eb;
      padding: 1rem;
      margin-bottom: 1rem;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .issue-critical { border-left-color: #dc2626; }
    .issue-high { border-left-color: #f59e0b; }
    .issue-medium { border-left-color: #3b82f6; }
    .issue-low { border-left-color: #22c55e; }
    .issue-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }
    .issue-title { font-weight: 600; color: #1f2937; }
    .issue-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }
    .badge-critical { background: #fee2e2; color: #dc2626; }
    .badge-high { background: #fef3c7; color: #f59e0b; }
    .badge-medium { background: #dbeafe; color: #3b82f6; }
    .badge-low { background: #dcfce7; color: #22c55e; }
    .issue-description { color: #6b7280; margin-bottom: 0.5rem; }
    .issue-impact { color: #374151; font-size: 0.9rem; }
    .recommendation {
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      padding: 1rem;
      margin-bottom: 1rem;
      border-radius: 8px;
      border-left: 4px solid #f59e0b;
    }
    .recommendation-action { font-weight: 600; color: #92400e; margin-bottom: 0.5rem; }
    .recommendation-reason { color: #78350f; font-size: 0.9rem; }
    .metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }
    .metric {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 8px;
    }
    .metric-label { font-size: 0.9rem; color: #6b7280; margin-bottom: 0.25rem; }
    .metric-value { font-size: 1.5rem; font-weight: bold; color: #1f2937; }
    .footer {
      background: #f8f9fa;
      padding: 2rem;
      text-align: center;
      color: #6b7280;
      font-size: 0.9rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚀 Thomas App Test Report</h1>
      <p>${report.meta.url} · ${report.meta.appType} · ${new Date(report.meta.timestamp).toLocaleString()}</p>
    </div>

    <div class="scores">
      <div class="score-card">
        <h3>Overall</h3>
        <div class="score-value ${getScoreClass(report.scores.overall)}">${report.scores.overall}</div>
      </div>
      <div class="score-card">
        <h3>UX</h3>
        <div class="score-value ${getScoreClass(report.scores.ux)}">${report.scores.ux}</div>
      </div>
      <div class="score-card">
        <h3>Performance</h3>
        <div class="score-value ${getScoreClass(report.scores.performance)}">${report.scores.performance}</div>
      </div>
      <div class="score-card">
        <h3>Accessibility</h3>
        <div class="score-value ${getScoreClass(report.scores.accessibility)}">${report.scores.accessibility}</div>
      </div>
      <div class="score-card">
        <h3>Security</h3>
        <div class="score-value ${getScoreClass(report.scores.security)}">${report.scores.security}</div>
      </div>
      <div class="score-card">
        <h3>SEO</h3>
        <div class="score-value ${getScoreClass(report.scores.seo)}">${report.scores.seo}</div>
      </div>
    </div>

    ${report.recommendations.length > 0 ? `
    <div class="section">
      <h2>🎯 Top Recommendations</h2>
      ${report.recommendations.map(rec => `
        <div class="recommendation">
          <div class="recommendation-action">📌 ${rec.action}</div>
          <div class="recommendation-reason">${rec.reason}</div>
        </div>
      `).join('')}
    </div>
    ` : ''}

    ${report.issues.length > 0 ? `
    <div class="section">
      <h2>⚠️ Issues Found (${report.issues.length})</h2>
      ${report.issues.map(issue => `
        <div class="issue issue-${issue.severity}">
          <div class="issue-header">
            <span class="issue-title">${issue.title}</span>
            <span class="issue-badge badge-${issue.severity}">${issue.severity}</span>
          </div>
          <div class="issue-description">${issue.description}</div>
          <div class="issue-impact">💡 Impact: ${issue.impact}</div>
        </div>
      `).join('')}
    </div>
    ` : ''}

    ${Object.keys(report.metrics).length > 0 ? `
    <div class="section">
      <h2>📊 Metrics</h2>
      <div class="metrics">
        ${report.metrics.coreWebVitals ? `
          <div class="metric">
            <div class="metric-label">LCP</div>
            <div class="metric-value">${report.metrics.coreWebVitals.lcp}ms</div>
          </div>
          <div class="metric">
            <div class="metric-label">CLS</div>
            <div class="metric-value">${report.metrics.coreWebVitals.cls.toFixed(3)}</div>
          </div>
        ` : ''}
        ${report.metrics.journeys ? `
          <div class="metric">
            <div class="metric-label">Journeys Passed</div>
            <div class="metric-value">${report.metrics.journeys.successful}/${report.metrics.journeys.total}</div>
          </div>
        ` : ''}
        ${report.metrics.visual ? `
          <div class="metric">
            <div class="metric-label">Screenshots</div>
            <div class="metric-value">${report.metrics.visual.screenshotsTaken}</div>
          </div>
        ` : ''}
      </div>
    </div>
    ` : ''}

    ${report.comparison ? `
    <div class="section">
      <h2>📈 Comparison with Baseline</h2>
      <div class="metrics">
        <div class="metric">
          <div class="metric-label">Overall Score Change</div>
          <div class="metric-value" style="color: ${report.comparison.scoreChanges.overall >= 0 ? '#22c55e' : '#ef4444'}">
            ${report.comparison.scoreChanges.overall >= 0 ? '+' : ''}${report.comparison.scoreChanges.overall}
          </div>
        </div>
        <div class="metric">
          <div class="metric-label">New Issues</div>
          <div class="metric-value" style="color: ${report.comparison.newIssues <= 0 ? '#22c55e' : '#ef4444'}">
            ${report.comparison.newIssues >= 0 ? '+' : ''}${report.comparison.newIssues}
          </div>
        </div>
      </div>
    </div>
    ` : ''}

    <div class="footer">
      <p>Generated by Thomas App Testing Framework · Duration: ${Math.round(report.meta.duration / 1000)}s</p>
      <p style="margin-top: 0.5rem;">🤖 Autonomous AI-powered testing from A to Z</p>
    </div>
  </div>

  <script>
    function getScoreClass(score) {
      if (score >= 80) return 'score-good';
      if (score >= 60) return 'score-warning';
      return 'score-bad';
    }
  </script>
</body>
</html>`;

  fs.writeFileSync(path.join(outputDir, 'report.html'), html);
}

function getScoreClass(score) {
  if (score >= 80) return 'score-good';
  if (score >= 60) return 'score-warning';
  return 'score-bad';
}

function printSummary(report) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`📊 THOMAS APP TEST RESULTS`);
  console.log(`${'='.repeat(80)}\n`);

  console.log(`📍 URL: ${report.meta.url}`);
  console.log(`🎯 App Type: ${report.meta.appType}`);
  console.log(`⏱️  Duration: ${Math.round(report.meta.duration / 1000)}s\n`);

  console.log(`📈 SCORES:`);
  console.log(`  Overall:        ${getScoreEmoji(report.scores.overall)} ${report.scores.overall}/100`);
  console.log(`  UX:             ${getScoreEmoji(report.scores.ux)} ${report.scores.ux}/100`);
  console.log(`  Performance:    ${getScoreEmoji(report.scores.performance)} ${report.scores.performance}/100`);
  console.log(`  Accessibility:  ${getScoreEmoji(report.scores.accessibility)} ${report.scores.accessibility}/100`);
  console.log(`  Security:       ${getScoreEmoji(report.scores.security)} ${report.scores.security}/100`);
  console.log(`  SEO:            ${getScoreEmoji(report.scores.seo)} ${report.scores.seo}/100\n`);

  if (report.comparison) {
    console.log(`📊 CHANGES FROM BASELINE:`);
    console.log(`  Overall Score:  ${formatChange(report.comparison.scoreChanges.overall)}`);
    console.log(`  New Issues:     ${formatChange(-report.comparison.newIssues)}\n`);
  }

  if (report.recommendations.length > 0) {
    console.log(`🎯 TOP RECOMMENDATIONS:\n`);
    report.recommendations.slice(0, 5).forEach((rec, i) => {
      console.log(`  ${i + 1}. ${rec.action}`);
      console.log(`     ${rec.reason}\n`);
    });
  }

  if (report.issues.length > 0) {
    const critical = report.issues.filter(i => i.severity === 'critical').length;
    const high = report.issues.filter(i => i.severity === 'high').length;
    const medium = report.issues.filter(i => i.severity === 'medium').length;
    const low = report.issues.filter(i => i.severity === 'low').length;

    console.log(`⚠️  ISSUES FOUND: ${report.issues.length} total`);
    if (critical > 0) console.log(`  🔴 Critical: ${critical}`);
    if (high > 0) console.log(`  🟠 High:     ${high}`);
    if (medium > 0) console.log(`  🟡 Medium:   ${medium}`);
    if (low > 0) console.log(`  🟢 Low:      ${low}`);
    console.log();
  }

  console.log(`📄 REPORTS SAVED:`);
  console.log(`  HTML: ${report.meta.url}/thomas-app-results/report.html`);
  console.log(`  JSON: ${report.meta.url}/thomas-app-results/report.json\n`);

  console.log(`${'='.repeat(80)}\n`);
}

function getScoreEmoji(score) {
  if (score >= 90) return '🟢';
  if (score >= 70) return '🟡';
  if (score >= 50) return '🟠';
  return '🔴';
}

function formatChange(value) {
  const emoji = value >= 0 ? '📈' : '📉';
  const sign = value >= 0 ? '+' : '';
  return `${emoji} ${sign}${value}`;
}

module.exports = { generate };
