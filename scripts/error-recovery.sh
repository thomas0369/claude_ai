#!/bin/bash
PROJECT=${1:-.}
REPORT_DIR="$PROJECT/.claude/error-reports"
mkdir -p "$REPORT_DIR"

REPORT="$REPORT_DIR/error-$(date +%Y%m%d-%H%M%S).json"

cat > "$REPORT" << EOF
{
  "timestamp": "$(date -Iseconds)",
  "project": "$(basename $PROJECT)",
  "logs": "Check .claude/logs/"
}
EOF

echo "📄 Error report: $REPORT"
echo "🤖 Fix with: claude 'analyze and fix errors in $REPORT'"
