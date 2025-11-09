#!/bin/bash

# Claude Wrapper - Intercepts every prompt

SESSION_ID=$(date +%Y%m%d-%H%M%S)
SESSION_DIR=~/.claude/sessions/$SESSION_ID
mkdir -p $SESSION_DIR

PROMPT_COUNT=0
PROJECT_DIR=$(pwd)

echo "🤖 Claude Session Started"
echo "Session ID: $SESSION_ID"
echo "Project: $PROJECT_DIR"
echo ""

# Function to create worktree for each prompt
create_prompt_worktree() {
    local prompt="$1"
    
    PROMPT_COUNT=$((PROMPT_COUNT + 1))
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🌳 PROMPT #$PROMPT_COUNT - Creating Worktree"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    # Check if Git repo
    if [ ! -d "$PROJECT_DIR/.git" ]; then
        echo "⏭️  Not a Git repository"
        return 0
    fi
    
    # Generate branch name
    TIMESTAMP=$(date +%Y%m%d-%H%M%S)
    FEATURE_NAME=$(echo "$prompt" | \
        tr '[:upper:]' '[:lower:]' | \
        sed 's/[^a-z0-9 ]//g' | \
        tr ' ' '-' | \
        cut -c1-30 | \
        sed 's/-*$//')
    
    BRANCH_NAME="prompt/$TIMESTAMP-$FEATURE_NAME-p$PROMPT_COUNT"
    
    # Determine base path
    cd "$PROJECT_DIR"
    MAIN_REPO=$(git worktree list | head -1 | awk '{print $1}')
    PROJECT_NAME=$(basename "$MAIN_REPO")
    WORKTREE_PATH="$MAIN_REPO-prompts/$BRANCH_NAME"
    
    echo "📍 Branch: $BRANCH_NAME"
    echo "📂 Path: $WORKTREE_PATH"
    
    # Create worktree
    mkdir -p "$(dirname "$WORKTREE_PATH")"
    
    cd "$MAIN_REPO"
    
    if git worktree add "$WORKTREE_PATH" -b "$BRANCH_NAME" 2>/dev/null; then
        echo "✅ Worktree created"
        
        # Link node_modules
        if [ -d "$MAIN_REPO/node_modules" ] && [ ! -d "$WORKTREE_PATH/node_modules" ]; then
            ln -s "$MAIN_REPO/node_modules" "$WORKTREE_PATH/node_modules" 2>/dev/null
            echo "✅ Dependencies linked"
        fi
        
        # Change to worktree
        cd "$WORKTREE_PATH"
        export PROJECT_DIR="$WORKTREE_PATH"
        
        # Save prompt info
        cat > .claude-prompt-info << EOFINFO
Prompt #$PROMPT_COUNT
Branch: $BRANCH_NAME
Timestamp: $(date)
Task: $prompt
EOFINFO
        
        echo "✅ Ready in worktree"
        echo ""
        
    else
        echo "❌ Failed to create worktree"
    fi
}

# Intercept Claude calls
claude_cmd() {
    local prompt="$*"
    
    # Create worktree for this prompt
    create_prompt_worktree "$prompt"
    
    # Run actual Claude
    command claude "$@"
    
    # Auto-commit after prompt
    if [ -d ".git" ]; then
        if [ -n "$(git status --porcelain)" ]; then
            git add .
            git commit -m "prompt #$PROMPT_COUNT: ${prompt:0:50}" 2>/dev/null
            echo ""
            echo "✅ Auto-committed"
        fi
    fi
}

# Export function
export -f claude_cmd
alias claude='claude_cmd'

# Start interactive shell
echo "🚀 Enhanced Claude Session Active"
echo ""
echo "Usage:"
echo "  claude 'your prompt 1'"
echo "  claude 'your prompt 2'"
echo "  claude 'your prompt 3'"
echo ""
echo "Each prompt creates a new worktree automatically!"
echo ""
echo "Type 'exit' to end session and see summary"
echo ""

# Interactive mode
bash --rcfile <(echo "
    alias claude='claude_cmd'
    PS1='[\[\033[01;32m\]Claude Session #$SESSION_ID\[\033[00m\]] \w $ '
")

# Session summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 SESSION SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Session ID: $SESSION_ID"
echo "Total Prompts: $PROMPT_COUNT"
echo ""
echo "Worktrees created:"
git worktree list | grep prompt/ || echo "None"
echo ""
echo "To merge all prompts:"
echo "  merge-prompts"
echo ""
