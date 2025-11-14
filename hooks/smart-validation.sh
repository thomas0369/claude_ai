#!/bin/bash
# Smart conditional validation - only runs relevant checks based on file type
# This replaces the 5 separate validation hooks with one intelligent hook

set -e

# Read tool information from stdin
tool_info=$(cat)

# Extract file path
file_path=$(echo "$tool_info" | jq -r '.tool_input.file_path // empty')

# Exit early if no file path
if [[ -z "$file_path" ]]; then
    exit 0
fi

# Skip markdown files
if [[ "$file_path" =~ \.(md|markdown)$ ]]; then
    exit 0
fi

# Create logs directory
mkdir -p ~/.claude/logs

# Log file
VALIDATION_LOG="$HOME/.claude/logs/smart-validation.log"

# Function to log validation actions
log_validation() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$VALIDATION_LOG"
}

# Detect file type and decide what to validate
FILE_EXT="${file_path##*.}"
FILE_BASENAME=$(basename "$file_path")
SHOULD_LINT=false
SHOULD_TYPECHECK=false
SHOULD_TEST=false

# TypeScript/JavaScript files
if [[ "$FILE_EXT" =~ ^(ts|tsx|js|jsx)$ ]]; then
    SHOULD_LINT=true

    # TypeScript files need type-checking
    if [[ "$FILE_EXT" =~ ^(ts|tsx)$ ]]; then
        SHOULD_TYPECHECK=true
    fi

    # Test files
    if [[ "$FILE_BASENAME" =~ \.(test|spec)\.(ts|tsx|js|jsx)$ ]]; then
        SHOULD_TEST=true
    fi

    log_validation "File: $file_path - Lint: $SHOULD_LINT, TypeCheck: $SHOULD_TYPECHECK, Test: $SHOULD_TEST"
fi

# JSON files (config files) - only lint
if [[ "$FILE_EXT" == "json" ]]; then
    # Only lint important config files
    if [[ "$FILE_BASENAME" =~ ^(package\.json|tsconfig\.json|\.eslintrc\.json)$ ]]; then
        SHOULD_LINT=true
        log_validation "File: $file_path - Config file, will lint"
    fi
fi

# CSS/SCSS - only lint
if [[ "$FILE_EXT" =~ ^(css|scss|sass)$ ]]; then
    SHOULD_LINT=true
    log_validation "File: $file_path - Style file, will lint"
fi

# Exit if nothing to validate
if [[ "$SHOULD_LINT" == "false" ]] && [[ "$SHOULD_TYPECHECK" == "false" ]] && [[ "$SHOULD_TEST" == "false" ]]; then
    log_validation "File: $file_path - No validation needed"
    exit 0
fi

# Get project directory
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"

# Find nearest package.json to determine project root for this file
find_project_root() {
    local dir=$(dirname "$1")
    local max_depth=10
    local depth=0

    while [ "$depth" -lt "$max_depth" ]; do
        if [ -f "$dir/package.json" ]; then
            echo "$dir"
            return 0
        fi

        # Stop at project root or filesystem root
        if [ "$dir" == "$PROJECT_DIR" ] || [ "$dir" == "/" ]; then
            break
        fi

        dir=$(dirname "$dir")
        depth=$((depth + 1))
    done

    echo "$PROJECT_DIR"
}

FILE_PROJECT_ROOT=$(find_project_root "$file_path")

# Change to project root
cd "$FILE_PROJECT_ROOT" || exit 0

# Run validations (non-blocking - informational only)
VALIDATION_ERRORS=0

# Lint if needed
if [[ "$SHOULD_LINT" == "true" ]]; then
    if command -v npm >/dev/null 2>&1; then
        if npm run lint --if-present -- "$file_path" >/dev/null 2>&1; then
            log_validation "✅ Lint passed: $file_path"
        else
            log_validation "⚠️  Lint issues: $file_path (non-blocking)"
            VALIDATION_ERRORS=$((VALIDATION_ERRORS + 1))
        fi
    fi
fi

# Type-check if needed (only for TS files)
if [[ "$SHOULD_TYPECHECK" == "true" ]]; then
    # Only run if tsconfig exists
    if [ -f "$FILE_PROJECT_ROOT/tsconfig.json" ] || [ -f "$FILE_PROJECT_ROOT/tsconfig.app.json" ]; then
        if command -v npx >/dev/null 2>&1; then
            if npx tsc --noEmit >/dev/null 2>&1; then
                log_validation "✅ Type-check passed: $file_path"
            else
                log_validation "⚠️  Type-check issues: $file_path (non-blocking)"
                VALIDATION_ERRORS=$((VALIDATION_ERRORS + 1))
            fi
        fi
    fi
fi

# Test if needed (only for test files)
if [[ "$SHOULD_TEST" == "true" ]]; then
    if npm run test --if-present -- "$file_path" >/dev/null 2>&1; then
        log_validation "✅ Tests passed: $file_path"
    else
        log_validation "⚠️  Test failures: $file_path (non-blocking)"
        VALIDATION_ERRORS=$((VALIDATION_ERRORS + 1))
    fi
fi

# Summary
if [ $VALIDATION_ERRORS -gt 0 ]; then
    log_validation "Summary: $VALIDATION_ERRORS validation issue(s) for $file_path"
    echo "⚠️  Smart validation found $VALIDATION_ERRORS issue(s) (check ~/.claude/logs/smart-validation.log)" >&2
fi

# Always exit 0 (non-blocking)
exit 0
