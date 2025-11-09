#!/bin/bash

echo "🤖 Claude Interactive Mode (Per-Prompt Worktree)"
echo "=================================================="
echo ""

PROJECT_DIR=$(pwd)
PROMPT_NUM=0

if [ ! -d "$PROJECT_DIR/.git" ]; then
    echo "❌ Not a Git repository"
    exit 1
fi

MAIN_REPO=$(git worktree list | head -1 | awk '{print $1}')
PROJECT_NAME=$(basename "$MAIN_REPO")

echo "📂 Project: $PROJECT_NAME"
echo "📍 Main: $MAIN_REPO"
echo ""
echo "Each prompt will create a new worktree automatically."
echo "Type 'merge' to merge all, 'list' to see all, 'quit' to exit."
echo ""

while true; do
    PROMPT_NUM=$((PROMPT_NUM + 1))
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -n "💬 Prompt #$PROMPT_NUM: "
    read -r PROMPT
    
    # Commands
    case "$PROMPT" in
        quit|exit|q)
            echo ""
            echo "👋 Session ended. Created $((PROMPT_NUM - 1)) worktrees."
            break
            ;;
        list|ls)
            echo ""
            git worktree list | grep prompt/
            echo ""
            continue
            ;;
        merge)
            echo ""
            ~/.claude/scripts/merge-prompts.sh
            continue
            ;;
        "")
            continue
            ;;
    esac
    
    # Create worktree for this prompt
    TIMESTAMP=$(date +%Y%m%d-%H%M%S)
    FEATURE=$(echo "$PROMPT" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9 ]//g' | tr ' ' '-' | cut -c1-30)
    BRANCH="prompt/$TIMESTAMP-$FEATURE-p$PROMPT_NUM"
    WORKTREE_PATH="$MAIN_REPO-prompts/$BRANCH"
    
    echo ""
    echo "🌳 Creating worktree: $BRANCH"
    
    mkdir -p "$(dirname "$WORKTREE_PATH")"
    
    cd "$MAIN_REPO"
    
    if git worktree add "$WORKTREE_PATH" -b "$BRANCH" 2>/dev/null; then
        echo "✅ Worktree created"
        
        # Link dependencies
        if [ -d "$MAIN_REPO/node_modules" ]; then
            ln -s "$MAIN_REPO/node_modules" "$WORKTREE_PATH/node_modules" 2>/dev/null
        fi
        
        cd "$WORKTREE_PATH"
        
        # Run Claude
        echo ""
        echo "🤖 Running Claude..."
        echo ""
        
        claude "$PROMPT"
        
        # Auto-commit
        if [ -n "$(git status --porcelain)" ]; then
            git add .
            git commit -m "prompt #$PROMPT_NUM: ${PROMPT:0:60}" 2>/dev/null
            echo ""
            echo "✅ Changes committed"
        fi
        
        echo ""
        echo "✅ Prompt #$PROMPT_NUM complete"
        
        cd "$MAIN_REPO"
    else
        echo "❌ Failed to create worktree"
    fi
    
    echo ""
done

echo ""
echo "📊 Worktrees created:"
git worktree list | grep prompt/ | nl
echo ""
