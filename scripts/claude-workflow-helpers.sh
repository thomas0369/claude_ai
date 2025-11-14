#!/bin/bash
# Claude Code Workflow Helper Scripts
# Source this file in your ~/.bashrc or ~/.zshrc:
#   source ~/.claude/scripts/claude-workflow-helpers.sh

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================================================
# ERROR LOGGING HELPERS
# ============================================================================

# View Claude error statistics
claude-errors() {
    local hours="${1:-24}"
    echo -e "${BLUE}=== Claude Error Statistics (Last ${hours}h) ===${NC}"
    ~/.claude/hooks/error-logger.sh stats "$hours"
}

# View recent hook errors
claude-hook-errors() {
    local lines="${1:-20}"
    echo -e "${YELLOW}=== Recent Hook Errors (Last $lines) ===${NC}"
    tail -n "$lines" ~/.claude/logs/hooks.log | grep -E "WARNING|ERROR" || echo "No recent errors"
}

# Cleanup old logs
claude-cleanup-logs() {
    local days="${1:-7}"
    echo -e "${BLUE}Cleaning up logs older than $days days...${NC}"
    ~/.claude/hooks/error-logger.sh cleanup "$days"
}

# View smart validation log
claude-validation-log() {
    local lines="${1:-50}"
    if [ -f ~/.claude/logs/smart-validation.log ]; then
        echo -e "${BLUE}=== Recent Validation Results (Last $lines) ===${NC}"
        tail -n "$lines" ~/.claude/logs/smart-validation.log
    else
        echo "No validation log found"
    fi
}

# ============================================================================
# DEVELOPMENT WORKFLOW ALIASES
# ============================================================================

# Quick fix workflow: thomas-fix + commit
alias cfix='echo -e "${BLUE}Running full validation & fix...${NC}" && claude /thomas-fix && claude /git:commit'

# Development workflow: thomas-fix only
alias ctest='echo -e "${BLUE}Running /thomas-fix...${NC}" && claude /thomas-fix'

# Code review + fix
alias creview='echo -e "${BLUE}Running code review...${NC}" && claude /code-review recent changes && claude /thomas-fix'

# Quick commit (assumes tests already passed)
alias ccommit='claude /git:commit'

# Git status with insights
alias cstatus='claude /git:status'

# Push with safety checks
alias cpush='claude /git:push'

# ============================================================================
# PROJECT MANAGEMENT HELPERS
# ============================================================================

# Create checkpoint before risky changes
claude-checkpoint() {
    local description="${1:-Manual checkpoint}"
    echo -e "${BLUE}Creating checkpoint: $description${NC}"
    claude /checkpoint:create "$description"
}

# List all checkpoints
claude-checkpoints() {
    echo -e "${BLUE}=== Available Checkpoints ===${NC}"
    git stash list | grep -E "claude|thomas-fix|checkpoint" || echo "No Claude checkpoints found"
}

# Restore to checkpoint
claude-restore() {
    local checkpoint="${1:-0}"
    echo -e "${YELLOW}Restoring to checkpoint $checkpoint...${NC}"
    claude /checkpoint:restore "$checkpoint"
}

# ============================================================================
# PERFORMANCE MONITORING
# ============================================================================

# Check hook performance
claude-hook-perf() {
    local hours="${1:-24}"
    echo -e "${BLUE}=== Hook Performance (Last ${hours}h) ===${NC}"

    if [ -f ~/.claude/logs/performance.jsonl ]; then
        echo -e "\n${GREEN}Average Hook Duration:${NC}"
        jq -r '[.hook, .duration_ms] | @tsv' ~/.claude/logs/performance.jsonl | \
            awk '{sum[$1]+=$2; count[$1]++} END {for (hook in sum) printf "  %-30s %6.0fms (n=%d)\n", hook, sum[hook]/count[hook], count[hook]}' | \
            sort -k2 -rn

        echo -e "\n${YELLOW}Slowest Recent Executions:${NC}"
        jq -r '[.timestamp, .hook, .duration_ms] | @tsv' ~/.claude/logs/performance.jsonl | \
            sort -k3 -rn | head -5 | awk '{printf "  %s - %s: %dms\n", $1, $2, $3}'
    else
        echo "No performance data available"
    fi
}

# ============================================================================
# DEBUGGING HELPERS
# ============================================================================

# Show active Claude processes
claude-ps() {
    echo -e "${BLUE}=== Active Claude Processes ===${NC}"
    ps aux | grep -E "claude|keep-alive" | grep -v grep
}

# Kill hanging Claude processes
claude-kill-all() {
    echo -e "${RED}Killing all Claude processes...${NC}"
    pkill -f "claude" || echo "No Claude processes found"
    pkill -f "keep-alive" || echo "No keep-alive processes found"
}

# Check Claude configuration
claude-config() {
    echo -e "${BLUE}=== Claude Configuration ===${NC}"
    echo -e "${GREEN}Settings:${NC}"
    cat ~/.claude/settings.json | jq '.hooks | keys'

    echo -e "\n${GREEN}Enabled Plugins:${NC}"
    cat ~/.claude/settings.json | jq '.enabledPlugins'

    echo -e "\n${GREEN}Hook Statistics:${NC}"
    echo "  PreToolUse hooks: $(cat ~/.claude/settings.json | jq '.hooks.PreToolUse | length')"
    echo "  PostToolUse hooks: $(cat ~/.claude/settings.json | jq '.hooks.PostToolUse | length')"
    echo "  Stop hooks: $(cat ~/.claude/settings.json | jq '.hooks.Stop | length')"
    echo "  UserPromptSubmit hooks: $(cat ~/.claude/settings.json | jq '.hooks.UserPromptSubmit | length')"
}

# ============================================================================
# LOG ANALYSIS
# ============================================================================

# Find most common errors
claude-top-errors() {
    local count="${1:-10}"
    echo -e "${BLUE}=== Top $count Error Types ===${NC}"

    if [ -f ~/.claude/logs/errors.jsonl ]; then
        jq -r '.type' ~/.claude/logs/errors.jsonl | sort | uniq -c | sort -rn | head -n "$count"
    else
        echo "No error log found"
    fi
}

# Search error log
claude-error-search() {
    local search_term="$1"

    if [ -z "$search_term" ]; then
        echo -e "${RED}Usage: claude-error-search <search_term>${NC}"
        return 1
    fi

    echo -e "${BLUE}=== Searching for: $search_term ===${NC}"

    if [ -f ~/.claude/logs/errors.jsonl ]; then
        jq -r "select(.message | contains(\"$search_term\")) | [.timestamp, .severity, .type, .message] | @tsv" ~/.claude/logs/errors.jsonl | \
            awk -F'\t' '{printf "%s [%s] %s: %s\n", $1, $2, $3, $4}'
    else
        echo "No error log found"
    fi
}

# ============================================================================
# HELP FUNCTION
# ============================================================================

claude-help() {
    cat << 'EOF'
╔══════════════════════════════════════════════════════════════════╗
║              Claude Code Workflow Helpers                        ║
╚══════════════════════════════════════════════════════════════════╝

📊 ERROR MONITORING:
  claude-errors [hours]          View error statistics
  claude-hook-errors [lines]     View recent hook errors
  claude-top-errors [count]      Show most common error types
  claude-error-search <term>     Search error logs
  claude-validation-log [lines]  View validation results

🛠️  DEVELOPMENT WORKFLOWS:
  cfix                          Full fix workflow (thomas-fix + commit)
  ctest                         Run /thomas-fix
  creview                       Code review + thomas-fix
  ccommit                       Quick commit
  cstatus                       Git status with insights
  cpush                         Safe git push

💾 CHECKPOINTS:
  claude-checkpoint [desc]      Create checkpoint
  claude-checkpoints            List checkpoints
  claude-restore [num]          Restore checkpoint

⚡ PERFORMANCE:
  claude-hook-perf [hours]      Hook performance statistics
  claude-config                 Show configuration

🐛 DEBUGGING:
  claude-ps                     Show Claude processes
  claude-kill-all               Kill all Claude processes

🧹 MAINTENANCE:
  claude-cleanup-logs [days]    Cleanup old logs

Examples:
  claude-errors 24              # Last 24 hours of errors
  cfix                          # Run thomas-fix and commit
  claude-checkpoint "Before refactor"
  claude-hook-perf 48           # Hook performance last 2 days

EOF
}

# Show help on first source
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    claude-help
fi

# Auto-completion for common commands (optional)
if [ -n "$BASH_VERSION" ]; then
    complete -W "24 48 168" claude-errors
    complete -W "1 7 14 30" claude-cleanup-logs
fi

echo -e "${GREEN}✅ Claude workflow helpers loaded! Type 'claude-help' for usage.${NC}"
