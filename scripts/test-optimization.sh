#!/bin/bash
# Test script to verify Claude Code optimization is working correctly

set -e

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Claude Code Optimization Test Suite                    ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

TESTS_PASSED=0
TESTS_FAILED=0
WARNINGS=0

# Function to run a test
run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_result="${3:-0}"

    echo -n "  Testing: $test_name... "

    if eval "$test_command" > /dev/null 2>&1; then
        if [ "$expected_result" -eq 0 ]; then
            echo -e "${GREEN}✅ PASS${NC}"
            TESTS_PASSED=$((TESTS_PASSED + 1))
            return 0
        else
            echo -e "${RED}❌ FAIL${NC} (expected failure but succeeded)"
            TESTS_FAILED=$((TESTS_FAILED + 1))
            return 1
        fi
    else
        if [ "$expected_result" -ne 0 ]; then
            echo -e "${GREEN}✅ PASS${NC} (expected failure)"
            TESTS_PASSED=$((TESTS_PASSED + 1))
            return 0
        else
            echo -e "${RED}❌ FAIL${NC}"
            TESTS_FAILED=$((TESTS_FAILED + 1))
            return 1
        fi
    fi
}

run_warning() {
    local warning_msg="$1"
    echo -e "  ${YELLOW}⚠️  WARNING:${NC} $warning_msg"
    WARNINGS=$((WARNINGS + 1))
}

# ============================================================================
# TEST 1: File Existence
# ============================================================================

echo -e "${BLUE}[1/7] Testing File Existence${NC}"

run_test "error-logger.sh exists" "[ -f ~/.claude/hooks/error-logger.sh ]"
run_test "safe-hook-wrapper.sh exists" "[ -f ~/.claude/hooks/safe-hook-wrapper.sh ]"
run_test "smart-validation.sh exists" "[ -f ~/.claude/hooks/smart-validation.sh ]"
run_test "claude-workflow-helpers.sh exists" "[ -f ~/.claude/scripts/claude-workflow-helpers.sh ]"
run_test "install-git-hooks.sh exists" "[ -f ~/.claude/scripts/install-git-hooks.sh ]"
run_test "pre-commit-hook.sh exists" "[ -f ~/.claude/templates/pre-commit-hook.sh ]"
run_test "CLAUDE.md exists" "[ -f ~/.claude/CLAUDE.md ]"
run_test "OPTIMIZATION_GUIDE.md exists" "[ -f ~/.claude/OPTIMIZATION_GUIDE.md ]"

echo ""

# ============================================================================
# TEST 2: File Permissions
# ============================================================================

echo -e "${BLUE}[2/7] Testing File Permissions${NC}"

run_test "error-logger.sh is executable" "[ -x ~/.claude/hooks/error-logger.sh ]"
run_test "safe-hook-wrapper.sh is executable" "[ -x ~/.claude/hooks/safe-hook-wrapper.sh ]"
run_test "smart-validation.sh is executable" "[ -x ~/.claude/hooks/smart-validation.sh ]"
run_test "claude-workflow-helpers.sh is executable" "[ -x ~/.claude/scripts/claude-workflow-helpers.sh ]"
run_test "install-git-hooks.sh is executable" "[ -x ~/.claude/scripts/install-git-hooks.sh ]"

echo ""

# ============================================================================
# TEST 3: Configuration
# ============================================================================

echo -e "${BLUE}[3/7] Testing Configuration${NC}"

# Check settings.json structure
if [ -f ~/.claude/settings.json ]; then
    # Count PostToolUse hooks
    post_hooks=$(jq '.hooks.PostToolUse | length' ~/.claude/settings.json 2>/dev/null || echo "error")

    if [ "$post_hooks" == "1" ]; then
        echo -e "  ${GREEN}✅ PASS${NC} PostToolUse hooks optimized (1 hook)"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    elif [ "$post_hooks" == "error" ]; then
        echo -e "  ${RED}❌ FAIL${NC} Invalid settings.json"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    else
        run_warning "PostToolUse has $post_hooks hooks (expected 1 for optimization)"
    fi

    # Check Stop hooks are wrapped
    stop_hooks=$(jq -r '.hooks.Stop[0].hooks[].command' ~/.claude/settings.json 2>/dev/null | grep -c "safe-hook-wrapper" || echo "0")

    if [ "$stop_hooks" -ge 1 ]; then
        echo -e "  ${GREEN}✅ PASS${NC} Stop hooks use safe-wrapper"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        run_warning "Stop hooks don't use safe-hook-wrapper (blocking errors may occur)"
    fi
else
    echo -e "  ${RED}❌ FAIL${NC} settings.json not found"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

echo ""

# ============================================================================
# TEST 4: Script Functionality
# ============================================================================

echo -e "${BLUE}[4/7] Testing Script Functionality${NC}"

# Test error-logger
run_test "error-logger stats command" "~/.claude/hooks/error-logger.sh stats 1 2>&1 | grep -q 'Error Statistics'"

# Test safe-hook-wrapper
run_test "safe-hook-wrapper basic functionality" "~/.claude/hooks/safe-hook-wrapper.sh echo 'test'"

# Test workflow helpers can be sourced
run_test "workflow helpers can be sourced" "bash -c 'source ~/.claude/scripts/claude-workflow-helpers.sh 2>/dev/null'"

echo ""

# ============================================================================
# TEST 5: Log Directories
# ============================================================================

echo -e "${BLUE}[5/7] Testing Log Infrastructure${NC}"

if [ ! -d ~/.claude/logs ]; then
    mkdir -p ~/.claude/logs
    echo -e "  ${YELLOW}⚠️  Created${NC} ~/.claude/logs directory"
fi

run_test "logs directory exists" "[ -d ~/.claude/logs ]"
run_test "logs directory is writable" "[ -w ~/.claude/logs ]"

# Test log file creation
run_test "can write to error log" "echo 'test' >> ~/.claude/logs/test.log && rm ~/.claude/logs/test.log"

echo ""

# ============================================================================
# TEST 6: Workflow Commands
# ============================================================================

echo -e "${BLUE}[6/7] Testing Workflow Commands${NC}"

# Source workflow helpers for testing
if source ~/.claude/scripts/claude-workflow-helpers.sh 2>/dev/null; then
    # Check if functions are defined
    run_test "claude-errors function defined" "type claude-errors &>/dev/null"
    run_test "claude-help function defined" "type claude-help &>/dev/null"
    run_test "claude-config function defined" "type claude-config &>/dev/null"

    # Check if aliases are defined
    run_test "ctest alias defined" "type ctest &>/dev/null"
    run_test "cfix alias defined" "type cfix &>/dev/null"
else
    run_warning "Could not source workflow helpers (may need to reload shell)"
fi

echo ""

# ============================================================================
# TEST 7: CLAUDE.md Content
# ============================================================================

echo -e "${BLUE}[7/7] Testing CLAUDE.md Content${NC}"

if [ -f ~/.claude/CLAUDE.md ]; then
    claude_md_size=$(wc -c < ~/.claude/CLAUDE.md)

    if [ "$claude_md_size" -gt 10000 ]; then
        echo -e "  ${GREEN}✅ PASS${NC} CLAUDE.md is comprehensive (${claude_md_size} bytes)"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        run_warning "CLAUDE.md is small (${claude_md_size} bytes), expected >10KB"
    fi

    # Check for key sections
    run_test "CLAUDE.md has Error Logging section" "grep -q 'Error Logging' ~/.claude/CLAUDE.md"
    run_test "CLAUDE.md has Workflows section" "grep -q 'Workflows' ~/.claude/CLAUDE.md"
    run_test "CLAUDE.md has Commands section" "grep -q 'Available Commands' ~/.claude/CLAUDE.md"
else
    echo -e "  ${RED}❌ FAIL${NC} CLAUDE.md not found"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

echo ""

# ============================================================================
# SUMMARY
# ============================================================================

echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Test Results                                            ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

TOTAL_TESTS=$((TESTS_PASSED + TESTS_FAILED))

echo "Tests Run: $TOTAL_TESTS"
echo -e "${GREEN}Tests Passed: $TESTS_PASSED${NC}"

if [ "$TESTS_FAILED" -gt 0 ]; then
    echo -e "${RED}Tests Failed: $TESTS_FAILED${NC}"
fi

if [ "$WARNINGS" -gt 0 ]; then
    echo -e "${YELLOW}Warnings: $WARNINGS${NC}"
fi

echo ""

# Overall result
if [ "$TESTS_FAILED" -eq 0 ]; then
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  ✅ ALL TESTS PASSED!                                    ║${NC}"
    echo -e "${GREEN}║  Your Claude Code optimization is working correctly!     ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Source workflow helpers: source ~/.bashrc"
    echo "  2. Run: claude-help"
    echo "  3. Test a workflow: ctest"
    echo ""
    exit 0
else
    echo -e "${RED}╔══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║  ❌ SOME TESTS FAILED                                    ║${NC}"
    echo -e "${RED}║  Please review the output above                          ║${NC}"
    echo -e "${RED}╚══════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Troubleshooting:"
    echo "  1. Check file permissions: ls -la ~/.claude/hooks/"
    echo "  2. Verify configuration: cat ~/.claude/settings.json"
    echo "  3. Re-run optimization if needed"
    echo ""
    exit 1
fi
