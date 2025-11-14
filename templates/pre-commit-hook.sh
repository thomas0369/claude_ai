#!/bin/bash
# Pre-commit hook template for Claude Code projects
# Copy this to .git/hooks/pre-commit in your project

set -e

echo "🔍 Running pre-commit validation..."

# Configuration
RUN_THOMAS_FIX=true
ALLOW_SKIP=true

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --no-fix)
            RUN_THOMAS_FIX=false
            shift
            ;;
        --no-skip)
            ALLOW_SKIP=false
            shift
            ;;
        *)
            shift
            ;;
    esac
done

# Check if skip flag is set
if [ "$ALLOW_SKIP" = true ] && git diff --cached --name-only | grep -q "SKIP_VALIDATION"; then
    echo "⏭️  Skipping validation (SKIP_VALIDATION flag found)"
    exit 0
fi

# Check for --no-verify flag
if [ "${GIT_REFLOG_ACTION}" = "--no-verify" ]; then
    echo "⏭️  Skipping validation (--no-verify used)"
    exit 0
fi

# ============================================================================
# QUICK CHECKS (Fast validation before running thomas-fix)
# ============================================================================

echo "📋 Running quick checks..."

# 1. Check for debugging code
echo "  🔍 Checking for debugging code..."
FORBIDDEN_PATTERNS=(
    "console.log"
    "debugger"
    "TODO:"
    "FIXME:"
    "xxx"
)

for pattern in "${FORBIDDEN_PATTERNS[@]}"; do
    if git diff --cached | grep -i "$pattern" > /dev/null; then
        echo "  ⚠️  Found '$pattern' in staged changes"
        echo "     Remove it or use --no-verify to skip"
    fi
done

# 2. Check file size
echo "  📊 Checking file sizes..."
git diff --cached --name-only | while read -r file; do
    if [ -f "$file" ]; then
        size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
        if [ "$size" -gt 1000000 ]; then  # 1MB
            echo "  ⚠️  Large file detected: $file (${size} bytes)"
            echo "     Consider if this file should be committed"
        fi
    fi
done

# 3. Check for secrets
echo "  🔐 Checking for potential secrets..."
SENSITIVE_PATTERNS=(
    "password.*=.*['\"][^'\"]+['\"]"
    "api[_-]?key.*=.*['\"][^'\"]+['\"]"
    "secret.*=.*['\"][^'\"]+['\"]"
    "token.*=.*['\"][^'\"]+['\"]"
    "AWS_ACCESS_KEY"
    "PRIVATE_KEY"
)

for pattern in "${SENSITIVE_PATTERNS[@]}"; do
    if git diff --cached | grep -iE "$pattern" > /dev/null; then
        echo "  🚨 Possible secret found matching pattern: $pattern"
        echo "     Review carefully before committing!"
        read -p "     Continue anyway? (y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "  ❌ Commit aborted"
            exit 1
        fi
    fi
done

# ============================================================================
# THOMAS-FIX VALIDATION (Optional but recommended)
# ============================================================================

if [ "$RUN_THOMAS_FIX" = true ]; then
    echo ""
    echo "🤖 Running /thomas-fix validation..."
    echo ""

    # Check if claude is available
    if ! command -v claude &> /dev/null; then
        echo "⚠️  Claude CLI not found, skipping thomas-fix"
        echo "   Install Claude Code to enable automatic validation"
    else
        # Run thomas-fix
        if claude /thomas-fix; then
            echo ""
            echo "✅ /thomas-fix passed!"
        else
            echo ""
            echo "❌ /thomas-fix failed!"
            echo ""
            echo "Options:"
            echo "  1. Fix the issues and try again"
            echo "  2. Use: git commit --no-verify (skip validation)"
            echo "  3. Check logs: ~/.claude/logs/hooks.log"
            echo ""
            exit 1
        fi
    fi
fi

# ============================================================================
# FINAL CHECKS
# ============================================================================

# Check if anything is actually staged
if git diff --cached --quiet; then
    echo "❌ No changes staged for commit"
    exit 1
fi

echo ""
echo "✅ Pre-commit validation passed!"
echo ""

exit 0
