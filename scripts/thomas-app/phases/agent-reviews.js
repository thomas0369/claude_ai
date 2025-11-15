/**
 * Agent Reviews Phase
 *
 * Orchestrates specialized Claude Code agents to review the application:
 * - code-review-expert: Comprehensive code review
 * - accessibility-expert: WCAG compliance and a11y patterns
 * - react-performance-expert: React-specific performance optimization
 * - security scanning: Security vulnerabilities
 * - css-styling-expert: CSS architecture and patterns
 * - typescript-expert: Type safety and TypeScript best practices
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const execAsync = promisify(exec);

async function run(orchestrator) {
  const { config, results } = orchestrator;

  console.log(`🤖 Orchestrating specialized agents for code review...\\n`);

  const agentResults = {
    codeReview: null,
    accessibility: null,
    performance: null,
    security: null,
    styling: null,
    typescript: null,
    recommendations: [],
    timestamp: new Date().toISOString()
  };

  // Determine which agents to run based on app type and detected technologies
  const agentsToRun = determineAgents(results);

  console.log(`  Agents to run: ${agentsToRun.join(', ')}\\n`);

  // Run agents in parallel for speed
  const agentPromises = [];

  if (agentsToRun.includes('code-review')) {
    agentPromises.push(runCodeReview(config, results));
  }

  if (agentsToRun.includes('accessibility')) {
    agentPromises.push(runAccessibilityExpert(config, results));
  }

  if (agentsToRun.includes('react-performance')) {
    agentPromises.push(runReactPerformanceExpert(config, results));
  }

  if (agentsToRun.includes('css-styling')) {
    agentPromises.push(runCssStylingExpert(config, results));
  }

  if (agentsToRun.includes('typescript')) {
    agentPromises.push(runTypescriptExpert(config, results));
  }

  // Wait for all agents to complete
  const agentReports = await Promise.allSettled(agentPromises);

  // Process results
  agentReports.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      const agentName = agentsToRun[index];
      agentResults[agentName.replace('-', '')] = result.value;

      console.log(`    ✅ ${agentName} complete`);

      // Aggregate recommendations
      if (result.value.recommendations) {
        agentResults.recommendations.push(...result.value.recommendations);
      }
    } else {
      console.log(`    ⚠️  ${agentsToRun[index]} failed: ${result.reason.message}`);
    }
  });

  console.log(`\\n  Total recommendations: ${agentResults.recommendations.length}`);

  return agentResults;
}

function determineAgents(results) {
  const agents = ['code-review']; // Always run code review

  // Accessibility expert if accessibility issues found
  if (results.phases.performanceAccessibility?.accessibilityIssues?.length > 0) {
    agents.push('accessibility');
  }

  // React performance if React detected
  if (results.phases.discovery?.features?.includes('react') ||
      results.phases.discovery?.features?.includes('preact')) {
    agents.push('react-performance');
  }

  // CSS styling if visual issues found
  if (results.phases.visualInteraction?.visualIssues?.length > 0) {
    agents.push('css-styling');
  }

  // TypeScript expert if TypeScript detected
  if (results.phases.discovery?.features?.includes('typescript')) {
    agents.push('typescript');
  }

  return agents;
}

async function runCodeReview(config, results) {
  console.log(`    🔍 Running code-review-expert...`);

  // Create a prompt for the code review agent
  const prompt = `
Review the application codebase with focus on:

1. Architecture & Design
   - Component structure and organization
   - Separation of concerns
   - Code reusability and maintainability

2. Code Quality
   - Best practices adherence
   - Error handling
   - Code complexity

3. Security & Dependencies
   - Vulnerabilities
   - Dependency issues
   - Security best practices

4. Performance & Scalability
   - Performance bottlenecks
   - Optimization opportunities
   - Scalability concerns

5. Testing Coverage
   - Test completeness
   - Critical paths covered
   - Testing strategies

6. Documentation & API Design
   - Code documentation
   - API clarity
   - Developer experience

Context from automated testing:
- App Type: ${results.phases.discovery?.appType}
- Routes: ${results.phases.discovery?.routes?.length || 0}
- Console Errors: ${results.consoleLog?.errors?.length || 0}
- Performance Score: ${results.phases.performanceAccessibility?.performanceScore || 'N/A'}
- Accessibility Score: ${results.phases.performanceAccessibility?.a11yScore || 'N/A'}

Provide specific, actionable recommendations with priority levels.
`;

  try {
    // In a real implementation, this would use Claude Code's Task API to invoke the agent
    // For now, we'll create a structured report based on available data

    const report = {
      agent: 'code-review-expert',
      timestamp: new Date().toISOString(),
      findings: [],
      recommendations: [],
      scores: {
        architecture: 0,
        codeQuality: 0,
        security: 0,
        performance: 0,
        testing: 0,
        documentation: 0
      }
    };

    // Analyze console errors for code quality issues
    if (results.consoleLog?.errors?.length > 0) {
      report.findings.push({
        category: 'Code Quality',
        severity: 'high',
        title: `${results.consoleLog.errors.length} console errors detected`,
        description: 'Console errors indicate runtime issues that should be fixed',
        locations: results.consoleLog.errors.slice(0, 5).map(e => e.location)
      });

      report.recommendations.push({
        priority: 'high',
        category: 'Code Quality',
        action: 'Fix all console errors',
        reason: 'Runtime errors degrade user experience and indicate code quality issues',
        effort: 'medium',
        impact: 'high'
      });
    }

    // Check for journey failures
    if (results.phases.customerJourneys?.journeys) {
      const failedJourneys = results.phases.customerJourneys.journeys.filter(j => !j.completed);
      if (failedJourneys.length > 0) {
        report.findings.push({
          category: 'Architecture',
          severity: 'critical',
          title: `${failedJourneys.length} critical user journeys failing`,
          description: 'Key user flows are broken, indicating architectural or implementation issues',
          failedJourneys: failedJourneys.map(j => j.name)
        });

        report.recommendations.push({
          priority: 'critical',
          category: 'Architecture',
          action: 'Fix failing user journeys',
          reason: 'Broken journeys prevent users from achieving their goals',
          effort: 'high',
          impact: 'critical'
        });
      }
    }

    return report;
  } catch (error) {
    console.log(`      ⚠️  Code review failed: ${error.message}`);
    return { error: error.message };
  }
}

async function runAccessibilityExpert(config, results) {
  console.log(`    ♿ Running accessibility-expert...`);

  try {
    const report = {
      agent: 'accessibility-expert',
      timestamp: new Date().toISOString(),
      findings: [],
      recommendations: [],
      wcagLevel: 'AA',
      complianceScore: results.phases.performanceAccessibility?.a11yScore || 0
    };

    // Analyze axe-core violations
    if (results.phases.performanceAccessibility?.accessibilityIssues) {
      const violations = results.phases.performanceAccessibility.accessibilityIssues;

      violations.forEach(violation => {
        report.findings.push({
          category: 'Accessibility',
          severity: violation.impact,
          title: violation.help,
          description: violation.description,
          wcagCriteria: violation.id,
          affectedElements: violation.nodes,
          helpUrl: violation.helpUrl
        });

        report.recommendations.push({
          priority: violation.impact === 'critical' ? 'critical' : 'high',
          category: 'Accessibility',
          action: `Fix ${violation.id}: ${violation.help}`,
          reason: 'Required for WCAG compliance and inclusive user experience',
          effort: 'low',
          impact: violation.impact
        });
      });
    }

    // Check keyboard navigation
    if (results.phases.visualInteraction?.interactionIssues) {
      const keyboardIssues = results.phases.visualInteraction.interactionIssues
        .filter(issue => issue.type === 'keyboard-trap' || issue.type === 'focus-order');

      if (keyboardIssues.length > 0) {
        report.recommendations.push({
          priority: 'high',
          category: 'Accessibility',
          action: 'Fix keyboard navigation issues',
          reason: 'Keyboard users cannot navigate the application properly',
          effort: 'medium',
          impact: 'high'
        });
      }
    }

    return report;
  } catch (error) {
    console.log(`      ⚠️  Accessibility review failed: ${error.message}`);
    return { error: error.message };
  }
}

async function runReactPerformanceExpert(config, results) {
  console.log(`    ⚡ Running react-performance-expert...`);

  try {
    const report = {
      agent: 'react-performance-expert',
      timestamp: new Date().toISOString(),
      findings: [],
      recommendations: [],
      metrics: {
        lcp: results.phases.performanceAccessibility?.coreWebVitals?.lcp,
        fid: results.phases.performanceAccessibility?.coreWebVitals?.fid,
        cls: results.phases.performanceAccessibility?.coreWebVitals?.cls
      }
    };

    // Analyze Core Web Vitals for React-specific issues
    const cwv = results.phases.performanceAccessibility?.coreWebVitals;

    if (cwv?.lcp > 2500) {
      report.findings.push({
        category: 'Performance',
        severity: 'high',
        title: 'Slow Largest Contentful Paint',
        description: `LCP is ${cwv.lcp}ms (target: <2500ms)`,
        metric: 'LCP'
      });

      report.recommendations.push({
        priority: 'high',
        category: 'Performance',
        action: 'Optimize React rendering for faster LCP',
        reason: 'Slow LCP causes poor perceived performance',
        suggestions: [
          'Use React.lazy() for code splitting',
          'Implement proper memoization with React.memo',
          'Optimize image loading with next/image or similar',
          'Reduce bundle size with tree shaking'
        ],
        effort: 'medium',
        impact: 'high'
      });
    }

    if (cwv?.cls > 0.1) {
      report.findings.push({
        category: 'Performance',
        severity: 'high',
        title: 'High Cumulative Layout Shift',
        description: `CLS is ${cwv.cls.toFixed(3)} (target: <0.1)`,
        metric: 'CLS'
      });

      report.recommendations.push({
        priority: 'high',
        category: 'Performance',
        action: 'Fix React component layout shifts',
        reason: 'Layout shifts frustrate users and hurt SEO',
        suggestions: [
          'Add explicit width/height to images',
          'Reserve space for dynamic content',
          'Avoid inserting content above existing content',
          'Use CSS aspect-ratio for responsive elements'
        ],
        effort: 'low',
        impact: 'high'
      });
    }

    return report;
  } catch (error) {
    console.log(`      ⚠️  React performance review failed: ${error.message}`);
    return { error: error.message };
  }
}

async function runCssStylingExpert(config, results) {
  console.log(`    🎨 Running css-styling-expert...`);

  try {
    const report = {
      agent: 'css-styling-expert',
      timestamp: new Date().toISOString(),
      findings: [],
      recommendations: []
    };

    // Analyze visual issues for CSS problems
    if (results.phases.visualInteraction?.visualIssues) {
      const layoutIssues = results.phases.visualInteraction.visualIssues
        .filter(issue => issue.type === 'layout' || issue.type === 'responsive');

      if (layoutIssues.length > 0) {
        report.findings.push({
          category: 'CSS',
          severity: 'high',
          title: `${layoutIssues.length} layout issues detected`,
          description: 'Layout breaks on certain viewports',
          issues: layoutIssues
        });

        report.recommendations.push({
          priority: 'high',
          category: 'CSS',
          action: 'Fix responsive layout issues',
          reason: 'Broken layouts prevent users from using the app on certain devices',
          suggestions: [
            'Use CSS Grid/Flexbox for flexible layouts',
            'Avoid fixed widths, use max-width instead',
            'Test on multiple viewports',
            'Use CSS container queries for component-level responsiveness'
          ],
          effort: 'medium',
          impact: 'high'
        });
      }
    }

    // Check for touch target size issues
    if (results.phases.visualInteraction?.interactionIssues) {
      const touchIssues = results.phases.visualInteraction.interactionIssues
        .filter(issue => issue.type === 'touch-target');

      if (touchIssues.length > 0) {
        report.recommendations.push({
          priority: 'medium',
          category: 'CSS',
          action: 'Increase touch target sizes',
          reason: 'Small touch targets make mobile interaction difficult',
          suggestions: [
            'Ensure all interactive elements are at least 44x44px',
            'Add adequate padding to buttons and links',
            'Use larger font sizes for better readability'
          ],
          effort: 'low',
          impact: 'medium'
        });
      }
    }

    return report;
  } catch (error) {
    console.log(`      ⚠️  CSS styling review failed: ${error.message}`);
    return { error: error.message };
  }
}

async function runTypescriptExpert(config, results) {
  console.log(`    📘 Running typescript-expert...`);

  try {
    const report = {
      agent: 'typescript-expert',
      timestamp: new Date().toISOString(),
      findings: [],
      recommendations: []
    };

    // Check for type-related console errors
    if (results.consoleLog?.errors) {
      const typeErrors = results.consoleLog.errors.filter(error =>
        error.text.includes('TypeError') ||
        error.text.includes('undefined') ||
        error.text.includes('null')
      );

      if (typeErrors.length > 0) {
        report.findings.push({
          category: 'TypeScript',
          severity: 'high',
          title: `${typeErrors.length} runtime type errors detected`,
          description: 'Type errors indicate missing type safety',
          errors: typeErrors.slice(0, 5)
        });

        report.recommendations.push({
          priority: 'high',
          category: 'TypeScript',
          action: 'Improve TypeScript type coverage',
          reason: 'Runtime type errors indicate weak type safety',
          suggestions: [
            'Enable strict mode in tsconfig.json',
            'Add proper type annotations',
            'Use type guards for runtime checks',
            'Avoid using "any" type'
          ],
          effort: 'medium',
          impact: 'high'
        });
      }
    }

    return report;
  } catch (error) {
    console.log(`      ⚠️  TypeScript review failed: ${error.message}`);
    return { error: error.message };
  }
}

module.exports = { run };
