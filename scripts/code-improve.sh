#!/bin/bash
PROJECT=${1:-.}
cd "$PROJECT"

REPORT=.claude/improvement-reports/analysis-$(date +%Y%m%d).md
mkdir -p $(dirname $REPORT)

cat > "$REPORT" << EOF
# Code Improvement Analysis
**Date:** $(date)
**Project:** $(basename $(pwd))

## Bundle Size
$(du -sh dist/ 2>/dev/null || echo "No build yet")

## TODOs
$(grep -rn "TODO\|FIXME" src/ 2>/dev/null | head -10 || echo "No TODOs")

## Dependencies
$(npm outdated 2>/dev/null | head -10 || echo "All up to date")

## Security
$(npm audit --production 2>/dev/null | grep "found" || echo "No vulnerabilities")

## Recommendations
1. Review and complete TODOs
2. Update outdated dependencies
3. Run security audit fixes
4. Optimize bundle size
EOF

echo "✅ Report: $REPORT"
