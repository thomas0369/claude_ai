/**
 * GitHub Issue Integration
 *
 * Automatically create GitHub issues from critical findings
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

async function createIssues(results, config) {
  // Check if GitHub integration is enabled
  if (!config.github || !config.github.createIssues) {
    return {
      enabled: false,
      message: 'GitHub integration disabled'
    };
  }

  console.log(`\n🐙 Creating GitHub issues for critical findings...`);

  const issuesCreated = [];
  const issuesFailed = [];

  // Check if gh CLI is available
  try {
    await execAsync('gh --version');
  } catch (error) {
    console.log(`  ⚠️  GitHub CLI (gh) not installed - skipping issue creation`);
    console.log(`     Install from: https://cli.github.com/`);
    return {
      enabled: false,
      message: 'GitHub CLI not installed'
    };
  }

  // Collect critical issues from all phases
  const criticalIssues = collectCriticalIssues(results);

  if (criticalIssues.length === 0) {
    console.log(`  ℹ️  No critical issues found - no GitHub issues to create`);
    return {
      enabled: true,
      created: 0,
      message: 'No critical issues'
    };
  }

  console.log(`  Found ${criticalIssues.length} critical issues\n`);

  for (const issue of criticalIssues.slice(0, 10)) {  // Limit to 10 issues per run
    try {
      const ghIssue = await createGitHubIssue(issue, config);
      issuesCreated.push(ghIssue);
      console.log(`  ✅ Created: ${ghIssue.title} (#${ghIssue.number})`);
    } catch (error) {
      issuesFailed.push({
        issue,
        error: error.message
      });
      console.log(`  ❌ Failed to create: ${issue.title}`);
      console.log(`     Error: ${error.message}`);
    }
  }

  console.log(`\n  📊 GitHub Issues Summary:`);
  console.log(`    Created: ${issuesCreated.length}`);
  console.log(`    Failed: ${issuesFailed.length}`);

  return {
    enabled: true,
    created: issuesCreated.length,
    failed: issuesFailed.length,
    issues: issuesCreated
  };
}

function collectCriticalIssues(results) {
  const issues = [];

  // Customer journey failures
  if (results.phases.customerJourneys) {
    const failedJourneys = results.phases.customerJourneys.journeys.filter(j => !j.completed);
    failedJourneys.forEach(journey => {
      issues.push({
        title: `Customer journey "${journey.name}" failed`,
        severity: 'critical',
        phase: 'Customer Journeys',
        description: journey.error || 'Journey failed to complete',
        impact: 'Users cannot complete critical flows',
        effort: 'medium',
        priority: 20,
        labels: ['thomas-app', 'automated-qa', 'critical', 'customer-journey'],
        body: formatJourneyIssue(journey)
      });
    });
  }

  // Visual issues (mobile horizontal scroll, etc.)
  if (results.phases.visualInteraction && results.phases.visualInteraction.visualIssues) {
    const criticalVisual = results.phases.visualInteraction.visualIssues.filter(
      i => i.severity === 'high' || i.severity === 'critical'
    );
    criticalVisual.forEach(visualIssue => {
      issues.push({
        title: `Visual issue: ${visualIssue.issue} on ${visualIssue.viewport}`,
        severity: visualIssue.severity,
        phase: 'Visual Analysis',
        description: visualIssue.issue,
        impact: 'Poor user experience on ' + visualIssue.viewport,
        effort: 'low',
        priority: 15,
        labels: ['thomas-app', 'automated-qa', 'visual', visualIssue.severity],
        body: formatVisualIssue(visualIssue)
      });
    });
  }

  // Accessibility violations (critical/serious only)
  if (results.phases.performanceAccessibility && results.phases.performanceAccessibility.accessibilityIssues) {
    const criticalA11y = results.phases.performanceAccessibility.accessibilityIssues.filter(
      i => i.impact === 'critical' || i.impact === 'serious'
    );
    criticalA11y.slice(0, 5).forEach(a11yIssue => {  // Limit to top 5
      issues.push({
        title: `Accessibility: ${a11yIssue.description}`,
        severity: a11yIssue.impact === 'critical' ? 'critical' : 'high',
        phase: 'Accessibility',
        description: a11yIssue.help,
        impact: 'Excludes users with disabilities, creates legal risk',
        effort: 'medium',
        priority: 18,
        labels: ['thomas-app', 'automated-qa', 'accessibility', a11yIssue.impact],
        body: formatA11yIssue(a11yIssue)
      });
    });
  }

  // Security issues
  if (results.phases.securityAnalytics && results.phases.securityAnalytics.securityScore < 70) {
    issues.push({
      title: `Security score below threshold (${results.phases.securityAnalytics.securityScore}/100)`,
      severity: 'critical',
      phase: 'Security',
      description: 'Multiple security issues detected',
      impact: 'User data at risk',
      effort: 'high',
      priority: 19,
      labels: ['thomas-app', 'automated-qa', 'security', 'critical'],
      body: formatSecurityIssue(results.phases.securityAnalytics)
    });
  }

  // Code quality markers (BUG and FIXME only)
  if (results.phases.codeQuality) {
    if (results.phases.codeQuality.bugs.length > 0) {
      const topBugs = results.phases.codeQuality.bugs.slice(0, 3);
      topBugs.forEach(bug => {
        issues.push({
          title: `Code marker: BUG in ${getFileName(bug.file)}`,
          severity: 'critical',
          phase: 'Code Quality',
          description: bug.text,
          impact: 'Potential bug in production code',
          effort: 'medium',
          priority: 17,
          labels: ['thomas-app', 'automated-qa', 'bug', 'code-quality'],
          body: formatCodeQualityIssue(bug, 'BUG')
        });
      });
    }
  }

  // Sort by priority (highest first)
  return issues.sort((a, b) => b.priority - a.priority);
}

async function createGitHubIssue(issue, config) {
  // Create issue title
  const title = `[Thomas-App] ${issue.title}`;

  // Create issue body
  const body = issue.body ||
    `## ${issue.title}\n\n` +
    `**Severity**: ${issue.severity}\n` +
    `**Phase**: ${issue.phase}\n` +
    `**Impact**: ${issue.impact}\n` +
    `**Effort**: ${issue.effort}\n` +
    `**Priority**: ${issue.priority}\n\n` +
    `### Description\n${issue.description}\n\n` +
    `---\n*Auto-generated by Thomas-App*`;

  // Build labels
  const labels = issue.labels.join(',');

  // Create issue using gh CLI
  const cmd = `gh issue create --title "${title.replace(/"/g, '\\"')}" --body "${body.replace(/"/g, '\\"')}" --label "${labels}"`;

  try {
    const { stdout } = await execAsync(cmd);
    const issueUrl = stdout.trim();
    const issueNumber = issueUrl.split('/').pop();

    return {
      title: issue.title,
      number: issueNumber,
      url: issueUrl
    };
  } catch (error) {
    throw new Error(`GitHub CLI error: ${error.message}`);
  }
}

function formatJourneyIssue(journey) {
  return `## Customer Journey Failed: ${journey.name}

**Status**: Failed
**Failed at step**: ${journey.failedStep || 'Unknown'}
**Error**: ${journey.error || 'No error message'}

### Journey Steps
${journey.steps.map((s, i) => `${i + 1}. ${s.description || s.action} - ${s.passed ? '✅ Passed' : '❌ Failed'}`).join('\n')}

### Impact
Users cannot complete this critical flow, blocking core functionality.

### Screenshots
${journey.screenshots.length > 0 ? journey.screenshots.map(s => `- ${s}`).join('\n') : 'No screenshots available'}

### Recommendation
1. Review the failed step: ${journey.failedStep}
2. Check browser console for errors
3. Verify selectors are correct
4. Re-test manually to reproduce

---
*Auto-generated by Thomas-App*`;
}

function formatVisualIssue(issue) {
  return `## Visual Issue: ${issue.issue}

**Viewport**: ${issue.viewport}
**Route**: ${issue.route || 'Multiple routes'}
**Severity**: ${issue.severity}

### Description
${issue.issue}

### Impact
Poor user experience on ${issue.viewport} devices.

### Screenshots
${issue.screenshot ? `![Screenshot](${issue.screenshot})` : 'No screenshot available'}

### Recommendation
1. Test on real ${issue.viewport} device
2. Review CSS for responsive breakpoints
3. Check for horizontal scroll issues
4. Validate touch target sizes

---
*Auto-generated by Thomas-App*`;
}

function formatA11yIssue(issue) {
  return `## Accessibility Violation: ${issue.description}

**Impact**: ${issue.impact}
**WCAG Guideline**: ${issue.id}
**Affected Elements**: ${issue.nodes} node(s)

### Description
${issue.help}

### Learn More
${issue.helpUrl}

### Impact
This creates barriers for users with disabilities and may violate legal accessibility requirements (ADA, Section 508, WCAG).

### Recommendation
Review the axe-core documentation and fix the affected elements.

---
*Auto-generated by Thomas-App*`;
}

function formatSecurityIssue(securityResults) {
  return `## Security Issues Detected

**Security Score**: ${securityResults.securityScore}/100

### Issues Found
${securityResults.issues ? securityResults.issues.map(i => `- ${i.description}`).join('\n') : 'Multiple security issues detected'}

### Impact
User data may be at risk. Security vulnerabilities can lead to:
- Data breaches
- XSS attacks
- CSRF vulnerabilities
- Exposed sensitive information

### Recommendation
1. Review security scan results
2. Implement security best practices
3. Add security headers
4. Validate all user inputs
5. Use HTTPS everywhere

---
*Auto-generated by Thomas-App*`;
}

function formatCodeQualityIssue(marker, type) {
  return `## Code Quality: ${type} marker found

**File**: \`${marker.file}\`
**Line**: ${marker.line}
**Type**: ${type}

### Marker Text
\`\`\`
${marker.text}
\`\`\`

### Context
\`\`\`
${marker.context}
\`\`\`

### Impact
${type === 'BUG' ? 'Potential bug in production code that needs immediate attention.' :
    type === 'FIXME' ? 'High priority code fix required.' :
      'Technical debt that should be addressed.'}

### Recommendation
Review the code at the specified location and address the ${type} marker.

---
*Auto-generated by Thomas-App*`;
}

function getFileName(filePath) {
  return filePath.split('/').pop();
}

module.exports = { createIssues };
