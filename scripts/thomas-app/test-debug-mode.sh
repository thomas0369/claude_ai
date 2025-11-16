#!/bin/bash

# Test script to demonstrate thomas-app debug mode functionality
#
# This script demonstrates all three debug tiers:
# - Basic: Lightweight logging and failure screenshots
# - Detailed: Full element state tracking and action screenshots
# - Full: Maximum visibility with video, HAR, and traces

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Thomas App Debug Mode Test"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Function to display usage
usage() {
    echo "Usage: $0 [basic|detailed|full]"
    echo ""
    echo "Debug Tiers:"
    echo "  basic     - Lightweight debugging (~10-15% overhead)"
    echo "              Action logging, screenshots on failure"
    echo ""
    echo "  detailed  - Comprehensive debugging (~30-40% overhead)"
    echo "              Element state tracking, screenshots on every action"
    echo "              Performance metrics, network logging, tracing"
    echo ""
    echo "  full      - Maximum visibility (~50%+ overhead)"
    echo "              Everything from detailed, plus:"
    echo "              Video recording, HAR files, full traces"
    echo ""
    echo "Examples:"
    echo "  $0 basic"
    echo "  $0 detailed"
    echo "  $0 full"
    exit 1
}

# Check argument
if [ $# -eq 0 ]; then
    usage
fi

DEBUG_LEVEL=$1

case "$DEBUG_LEVEL" in
    basic)
        echo "Testing BASIC debug mode..."
        echo "Expected output:"
        echo "  - [DEBUG] Action logging to console"
        echo "  - Screenshots on test failures"
        echo "  - Console error capture"
        echo "  - Failed network request logging"
        echo ""

        # Note: This would normally run thomas-app with --debug
        # For now, we'll just show the command
        echo "Command: ./orchestrator.mjs --debug"
        echo ""
        echo "Debug artifacts will be saved to: .thomas-app/debug/"
        ;;

    detailed)
        echo "Testing DETAILED debug mode..."
        echo "Expected output:"
        echo "  - Everything from basic mode"
        echo "  - Element state before/after each action"
        echo "  - Screenshots on every action"
        echo "  - Full network request/response logging"
        echo "  - Performance metrics via CDP"
        echo "  - Playwright trace recording"
        echo ""

        echo "Command: ./orchestrator.mjs --debug-detailed"
        echo ""
        echo "Debug artifacts will be saved to: .thomas-app/debug/"
        ;;

    full)
        echo "Testing FULL debug mode..."
        echo "Expected output:"
        echo "  - Everything from detailed mode"
        echo "  - Video recording of entire session"
        echo "  - HAR files for network replay"
        echo "  - Full trace recording"
        echo "  - Accessibility snapshots"
        echo "  - Code coverage tracking"
        echo ""

        echo "Command: ./orchestrator.mjs --debug-full"
        echo ""
        echo "⚠️  Warning: Full debug mode can generate 100MB+ of artifacts"
        echo "Debug artifacts will be saved to: .thomas-app/debug/"
        ;;

    *)
        echo "Error: Unknown debug level '$DEBUG_LEVEL'"
        echo ""
        usage
        ;;
esac

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test Configuration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Show what debug artifacts will be created
echo "Debug Artifacts (example):"
echo ""
echo ".thomas-app/debug/"
echo "├── actions.jsonl              # All actions logged"
echo "├── console.json               # Browser console messages"
echo "├── summary.json               # Test summary with stats"
echo "├── screenshots/               # Screenshots directory"
echo "│   ├── before-001-click-button.png"
echo "│   ├── after-001-click-button.png"
echo "│   └── error-003-click-form.png"

if [ "$DEBUG_LEVEL" = "detailed" ] || [ "$DEBUG_LEVEL" = "full" ]; then
    echo "├── trace.zip                  # Playwright trace"
    echo "├── performance-metrics.json   # CDP performance data"
    echo "└── load-metrics.json          # Page load metrics"
fi

if [ "$DEBUG_LEVEL" = "full" ]; then
    echo "├── network.har                # Network HAR file"
    echo "└── videos/                    # Video recordings"
    echo "    └── test-run-001.webm"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Example Console Output"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cat << 'EOF'
[DEBUG] GOTO: http://localhost:3000
  └─ Success (1234ms)

[DEBUG] CLICK: button[data-testid="login-button"]
  ├─ Before: value="", disabled=false, textContent="Login"
  ├─ Screenshot: .thomas-app/debug/screenshots/before-001-click-button.png
  ├─ After: value="", disabled=false, textContent="Login"
  └─ Screenshot: .thomas-app/debug/screenshots/after-001-click-button.png
  └─ Success (234ms)

[DEBUG] FILL: input[name="email"] = "test@example.com"
  ├─ Before: value="", disabled=false
  ├─ After: value="test@example.com", disabled=false
  └─ Success (123ms)

[DEBUG] NETWORK REQUEST: POST /api/login
  ├─ Headers: 5 headers

[DEBUG] NETWORK RESPONSE: ✅ 200 /api/login
  └─ Body: {"success":true,"token":"..."}

[CONSOLE ERROR] Uncaught TypeError: Cannot read property 'foo' of undefined
  ├─ Location: app.js:123
  ├─ Timestamp: 2025-11-16T12:34:56.789Z
  └─ URL: http://localhost:3000/dashboard
EOF

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Usage Tips"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. View action log:"
echo "   cat .thomas-app/debug/actions.jsonl | jq ."
echo ""
echo "2. Filter for errors only:"
echo "   jq 'select(.success == false)' .thomas-app/debug/actions.jsonl"
echo ""
echo "3. View debug summary:"
echo "   cat .thomas-app/debug/summary.json | jq ."
echo ""
echo "4. Open Playwright trace:"
echo "   npx playwright show-trace .thomas-app/debug/trace.zip"
echo ""
echo "5. View screenshots:"
echo "   ls -lh .thomas-app/debug/screenshots/"
echo ""
echo "6. Custom debug directory:"
echo "   ./orchestrator.mjs --debug --debug-dir /tmp/my-debug"
echo ""
echo "7. Custom retention period:"
echo "   ./orchestrator.mjs --debug --debug-retention 3d"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
