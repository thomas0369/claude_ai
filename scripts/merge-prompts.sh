#!/bin/bash

echo "🔀 MERGE PROMPT BRANCHES"
echo "========================"
echo ""

# Find main repo
MAIN_REPO=$(git worktree list | head -1 | awk '{print $1}')
cd "$MAIN_REPO"

echo "📂 Main repo: $MAIN_REPO"
echo ""

# List all prompt branches ready for merge
echo "📋 Prompt branches ready for merge:"
echo ""

PROMPT_BRANCHES=$(git branch | grep 'prompt/' | sed 's/^[ *]*//')

if [ -z "$PROMPT_BRANCHES" ]; then
    echo "   No prompt branches found"
    exit 0
fi

echo "$PROMPT_BRANCHES" | while read branch; do
    echo "   • $branch"
done

echo ""
read -p "Merge all prompt branches to main? [y/N] " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    git checkout main
    git pull origin main 2>/dev/null || true
    
    echo ""
    echo "Merging branches..."
    echo ""
    
    echo "$PROMPT_BRANCHES" | while read branch; do
        echo "🔀 Merging $branch..."
        
        if git merge --no-ff "$branch" -m "merge: $branch"; then
            echo "   ✅ Merged"
            
            # Remove worktree
            WORKTREE_PATH=$(git worktree list | grep "$branch" | awk '{print $1}')
            if [ ! -z "$WORKTREE_PATH" ]; then
                echo "   🧹 Removing worktree..."
                git worktree remove "$WORKTREE_PATH" --force 2>/dev/null
            fi
            
            # Delete branch
            git branch -D "$branch"
            echo "   ✅ Cleaned up"
        else
            echo "   ❌ Merge conflict - resolve manually"
        fi
        
        echo ""
    done
    
    echo "✅ All prompts merged!"
    echo ""
    echo "📊 Summary:"
    git log --oneline -10
else
    echo "Cancelled"
fi
