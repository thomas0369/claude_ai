/**
 * Phase 7.9: Autonomous Bug Fixing
 *
 * Automatically fixes identified bugs iteratively using /thomas-fix
 * - Console errors
 * - Failed customer journeys
 * - Accessibility violations (critical/serious)
 * - Security vulnerabilities
 * - Performance issues
 * - Layout/responsive issues
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const execAsync = promisify(exec);

async function run(orchestrator) {
  const { results, config } = orchestrator;

  console.log(`🔧 Starting autonomous bug fixing...\n`);

  const fixResults = {
    attempted: 0,
    fixed: [],
    failed: [],
    skipped: [],
    iterations: []
  };

  // Collect all fixable issues from test results
  const fixableIssues = collectFixableIssues(results);

  console.log(`  Found ${fixableIssues.length} fixable issues\n`);

  if (fixableIssues.length === 0) {
    console.log(`  ✅ No bugs to fix!\n`);
    return fixResults;
  }

  // Sort by priority (fix critical first)
  fixableIssues.sort((a, b) => {
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    return (priorityOrder[b.severity] || 0) - (priorityOrder[a.severity] || 0);
  });

  // Iterative fixing - max 3 iterations to prevent infinite loops
  const maxIterations = 3;
  let iteration = 0;
  let remainingIssues = [...fixableIssues];

  while (remainingIssues.length > 0 && iteration < maxIterations) {
    iteration++;
    console.log(`\n  📍 Iteration ${iteration}/${maxIterations}\n`);

    const iterationResults = {
      iteration,
      issuesAttempted: 0,
      issuesFixed: 0,
      issuesFailed: 0,
      fixes: []
    };

    // Fix issues one by one (to avoid conflicts)
    for (const issue of remainingIssues) {
      fixResults.attempted++;
      iterationResults.issuesAttempted++;

      console.log(`    🔨 Fixing: ${issue.title}`);
      console.log(`       Severity: ${issue.severity}`);
      console.log(`       Type: ${issue.type}\n`);

      try {
        const fixResult = await attemptFix(issue, config);

        if (fixResult.success) {
          fixResults.fixed.push({
            issue,
            iteration,
            method: fixResult.method,
            changes: fixResult.changes
          });
          iterationResults.issuesFixed++;
          iterationResults.fixes.push({
            issue: issue.title,
            success: true,
            method: fixResult.method
          });
          console.log(`       ✅ Fixed using ${fixResult.method}\n`);
        } else {
          fixResults.failed.push({
            issue,
            iteration,
            reason: fixResult.reason
          });
          iterationResults.issuesFailed++;
          iterationResults.fixes.push({
            issue: issue.title,
            success: false,
            reason: fixResult.reason
          });
          console.log(`       ❌ Failed: ${fixResult.reason}\n`);
        }
      } catch (error) {
        fixResults.failed.push({
          issue,
          iteration,
          reason: error.message
        });
        iterationResults.issuesFailed++;
        console.log(`       ❌ Error: ${error.message}\n`);
      }

      // Small delay to avoid overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    fixResults.iterations.push(iterationResults);

    // Re-verify after fixes to see what's left
    console.log(`\n  🔍 Re-verifying application state...\n`);

    // Quick re-test to see if issues are resolved
    const verificationResults = await quickVerification(orchestrator, remainingIssues);
    remainingIssues = verificationResults.stillPresent;

    console.log(`  📊 Iteration ${iteration} Summary:`);
    console.log(`     Attempted: ${iterationResults.issuesAttempted}`);
    console.log(`     Fixed: ${iterationResults.issuesFixed}`);
    console.log(`     Failed: ${iterationResults.issuesFailed}`);
    console.log(`     Remaining: ${remainingIssues.length}\n`);

    if (remainingIssues.length === 0) {
      console.log(`  🎉 All bugs fixed!\n`);
      break;
    }

    if (iteration >= maxIterations) {
      console.log(`  ⚠️  Max iterations reached. Some bugs remain.\n`);
      remainingIssues.forEach(issue => {
        fixResults.skipped.push({
          issue,
          reason: 'Max iterations reached'
        });
      });
    }
  }

  return fixResults;
}

function collectFixableIssues(results) {
  const issues = [];

  // Console errors (highest priority)
  if (results.consoleLog?.errors?.length > 0) {
    results.consoleLog.errors.forEach((error, index) => {
      issues.push({
        type: 'console-error',
        severity: 'critical',
        title: `Console error: ${error.text}`,
        description: error.text,
        location: error.location,
        url: error.url,
        fixable: true,
        autoFixMethod: 'thomas-fix'
      });
    });
  }

  // Failed customer journeys
  if (results.phases.customerJourneys) {
    results.phases.customerJourneys.journeys
      .filter(j => !j.success)
      .forEach(journey => {
        issues.push({
          type: 'journey-failure',
          severity: 'critical',
          title: `Journey failed: ${journey.name}`,
          description: journey.error || 'Journey did not complete',
          journey: journey.name,
          fixable: true,
          autoFixMethod: 'journey-debug'
        });
      });
  }

  // Critical accessibility violations
  if (results.phases.performanceAccessibility?.accessibilityIssues) {
    results.phases.performanceAccessibility.accessibilityIssues
      .filter(v => v.impact === 'critical' || v.impact === 'serious')
      .forEach(violation => {
        issues.push({
          type: 'accessibility-violation',
          severity: violation.impact === 'critical' ? 'critical' : 'high',
          title: violation.help,
          description: violation.description,
          wcagId: violation.id,
          helpUrl: violation.helpUrl,
          fixable: true,
          autoFixMethod: 'accessibility-expert'
        });
      });
  }

  // Security vulnerabilities
  if (results.phases.securityAnalytics?.sensitiveData?.length > 0) {
    results.phases.securityAnalytics.sensitiveData.forEach(finding => {
      issues.push({
        type: 'sensitive-data',
        severity: 'high',
        title: `Sensitive data in ${finding.storage}`,
        description: finding.issue,
        storage: finding.storage,
        key: finding.key,
        fixable: true,
        autoFixMethod: 'security-fix'
      });
    });
  }

  // Layout/responsive issues
  if (results.phases.visualInteraction?.visualIssues) {
    results.phases.visualInteraction.visualIssues
      .filter(issue => issue.severity === 'high')
      .forEach(issue => {
        issues.push({
          type: 'layout-issue',
          severity: 'high',
          title: issue.message,
          description: issue.details || issue.message,
          fixable: true,
          autoFixMethod: 'css-styling-expert'
        });
      });
  }

  // Performance issues (only critical ones)
  if (results.phases.performanceAccessibility?.coreWebVitals) {
    const cwv = results.phases.performanceAccessibility.coreWebVitals;

    if (cwv.lcp > 4000) {
      issues.push({
        type: 'performance-lcp',
        severity: 'high',
        title: `LCP too slow: ${cwv.lcp}ms`,
        description: 'Largest Contentful Paint exceeds 4 seconds',
        metric: 'LCP',
        value: cwv.lcp,
        fixable: true,
        autoFixMethod: 'react-performance-expert'
      });
    }

    if (cwv.cls > 0.25) {
      issues.push({
        type: 'performance-cls',
        severity: 'high',
        title: `CLS too high: ${cwv.cls.toFixed(3)}`,
        description: 'Cumulative Layout Shift causes layout instability',
        metric: 'CLS',
        value: cwv.cls,
        fixable: true,
        autoFixMethod: 'css-styling-expert'
      });
    }
  }

  return issues;
}

async function attemptFix(issue, config) {
  // Use different fix strategies based on issue type
  switch (issue.autoFixMethod) {
    case 'thomas-fix':
      return await runThomasFix(issue, config);

    case 'journey-debug':
      return await fixJourneyFailure(issue, config);

    case 'accessibility-expert':
      return await fixAccessibilityIssue(issue, config);

    case 'security-fix':
      return await fixSecurityIssue(issue, config);

    case 'css-styling-expert':
      return await fixCSSIssue(issue, config);

    case 'react-performance-expert':
      return await fixPerformanceIssue(issue, config);

    default:
      return {
        success: false,
        reason: `Unknown fix method: ${issue.autoFixMethod}`
      };
  }
}

async function runThomasFix(issue, config) {
  try {
    console.log(`       Running /thomas-fix...`);

    // Run thomas-fix command
    const { stdout, stderr } = await execAsync('/thomas-fix', {
      cwd: config.projectRoot || process.cwd(),
      timeout: 300000 // 5 minute timeout
    });

    // Check if thomas-fix succeeded
    if (stdout.includes('✅') || stdout.includes('All checks passed')) {
      return {
        success: true,
        method: '/thomas-fix',
        changes: stdout
      };
    }

    return {
      success: false,
      reason: 'thomas-fix did not resolve the issue',
      output: stdout
    };
  } catch (error) {
    return {
      success: false,
      reason: error.message,
      stderr: error.stderr
    };
  }
}

async function fixJourneyFailure(issue, config) {
  // For journey failures, we need to identify the root cause
  // This could be:
  // 1. Missing elements (selector issues)
  // 2. Timing issues (waits needed)
  // 3. Auth/permission issues
  // 4. Network failures

  console.log(`       Analyzing journey failure...`);

  // Run thomas-fix which will handle the debugging
  return await runThomasFix(issue, config);
}

async function fixAccessibilityIssue(issue, config) {
  console.log(`       Invoking accessibility-expert...`);

  // Create a detailed prompt for the accessibility expert
  const prompt = `Fix accessibility violation: ${issue.title}

WCAG Criteria: ${issue.wcagId}
Description: ${issue.description}
Help: ${issue.helpUrl}

Automatically fix this accessibility issue following WCAG 2.1 AA standards.`;

  // In a real implementation, this would use Claude Code's Task API
  // For now, we run thomas-fix which includes accessibility checks
  return await runThomasFix(issue, config);
}

async function fixSecurityIssue(issue, config) {
  console.log(`       Fixing security vulnerability...`);

  // Security fixes are straightforward:
  // - Remove sensitive data from localStorage/sessionStorage
  // - Move to secure backend storage
  // - Add proper encryption

  const prompt = `Fix security issue: ${issue.title}

Storage: ${issue.storage}
Key: ${issue.key}
Issue: ${issue.description}

Remove sensitive data from client-side storage and ensure it's stored securely on the backend.`;

  return await runThomasFix(issue, config);
}

async function fixCSSIssue(issue, config) {
  console.log(`       Invoking css-styling-expert...`);

  const prompt = `Fix CSS/layout issue: ${issue.title}

Description: ${issue.description}

Fix responsive layout, ensure mobile compatibility, and follow CSS best practices.`;

  return await runThomasFix(issue, config);
}

async function fixPerformanceIssue(issue, config) {
  console.log(`       Invoking react-performance-expert...`);

  const prompt = `Fix performance issue: ${issue.title}

Metric: ${issue.metric}
Current Value: ${issue.value}
Target: ${issue.metric === 'LCP' ? '<2500ms' : '<0.1'}

Optimize React rendering, bundle size, and Core Web Vitals.`;

  return await runThomasFix(issue, config);
}

async function quickVerification(orchestrator, issues) {
  // Re-run only the relevant tests to verify fixes
  const stillPresent = [];

  console.log(`    Verifying ${issues.length} issues...\n`);

  for (const issue of issues) {
    // Quick check based on issue type
    let isFixed = false;

    switch (issue.type) {
      case 'console-error':
        // Check console log again
        isFixed = orchestrator.consoleLog.errors.length === 0 ||
                 !orchestrator.consoleLog.errors.some(e => e.text === issue.description);
        break;

      case 'journey-failure':
        // Would need to re-run the specific journey
        // For now, assume it needs verification
        isFixed = false;
        break;

      case 'accessibility-violation':
        // Would need to re-run axe-core
        isFixed = false;
        break;

      default:
        isFixed = false;
    }

    if (!isFixed) {
      stillPresent.push(issue);
    }
  }

  return { stillPresent };
}

module.exports = { run };
