#!/bin/bash

clear

cat << 'EOFBANNER'
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║           CLAUDE SESSION - PER-PROMPT WORKTREE             ║
║                                                            ║
║  Jeder Prompt erstellt automatisch einen neuen Worktree   ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
EOFBANNER

echo ""

PROJECT_DIR=$(pwd)

if [ ! -d "$PROJECT_DIR/.git" ]; then
    echo "❌ Not a Git repository"
    echo "💡 Run: git init && git add . && git commit -m 'init'"
    exit 1
fi

MAIN_REPO=$(git worktree list 2>/dev/null | head -1 | awk '{print $1}')
PROJECT_NAME=$(basename "$MAIN_REPO")

echo "📂 Project: $PROJECT_NAME"
echo "📍 Location: $MAIN_REPO"
echo ""
echo "Commands:"
echo "  'merge'  - Merge all prompt branches"
echo "  'list'   - Show all worktrees"
echo "  'quit'   - Exit session"
echo ""

PROMPT_COUNT=0

while true; do
    PROMPT_COUNT=$((PROMPT_COUNT + 1))
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "\n💭 Prompt #$PROMPT_COUNT:"
    read -r USER_PROMPT
    
    case "$USER_PROMPT" in
        quit|exit|q)
            echo -e "\n👋 Ending session..."
            echo "Created $((PROMPT_COUNT - 1)) worktrees"
            break
            ;;
        list|ls)
            echo ""
            git worktree list | grep prompt/ || echo "No prompt worktrees yet"
            echo ""
            PROMPT_COUNT=$((PROMPT_COUNT - 1))
            continue
            ;;
        merge|m)
            echo ""
            ~/.claude/scripts/merge-prompts.sh
            PROMPT_COUNT=$((PROMPT_COUNT - 1))
            continue
            ;;
        "")
            PROMPT_COUNT=$((PROMPT_COUNT - 1))
            continue
            ;;
    esac
    
    # Generate branch
    TS=$(date +%H%M%S)
    NAME=$(echo "$USER_PROMPT" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9 ]//g' | tr ' ' '-' | cut -c1-25)
    BRANCH="prompt/$(date +%Y%m%d)-$TS-$NAME"
    WORKTREE="$MAIN_REPO-prompts/$BRANCH"
    
    echo -e "\n🌳 Branch: $BRANCH"
    
    # Create worktree
    mkdir -p "$(dirname "$WORKTREE")"
    cd "$MAIN_REPO"
    
    if git worktree add "$WORKTREE" -b "$BRANCH" >/dev/null 2>&1; then
        
        # Link node_modules
        [ -d "$MAIN_REPO/node_modules" ] && ln -sf "$MAIN_REPO/node_modules" "$WORKTREE/node_modules" 2>/dev/null
        
        cd "$WORKTREE"
        
        echo "✅ Worktree created"
        echo -e "\n🤖 Claude is working...\n"
        
        # Run Claude
        claude "$USER_PROMPT"
        
        # Commit
        if [ -n "$(git status --porcelain 2>/dev/null)" ]; then
            git add . 2>/dev/null
            git commit -m "prompt: ${USER_PROMPT:0:60}" >/dev/null 2>&1
            echo -e "\n✅ Changes committed"
        fi
        
        cd "$MAIN_REPO"
        
    else
        echo "❌ Failed to create worktree"
    fi
    
    echo ""
done

echo -e "\n📊 Session Summary:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
git worktree list | grep prompt/ | nl
echo ""
