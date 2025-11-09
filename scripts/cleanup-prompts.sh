#!/bin/bash

echo "🧹 CLEANUP PROMPT WORKTREES"
echo "==========================="
echo ""

# Find all prompt worktrees
git worktree list | grep 'prompt/' | while read line; do
    PATH=$(echo $line | awk '{print $1}')
    BRANCH=$(echo $line | awk '{print $3}' | sed 's/[\[\]]//g')
    
    echo "Found: $BRANCH"
    echo "  Path: $PATH"
    
    # Check if merged
    if git branch --merged main | grep -q "$BRANCH"; then
        echo "  ✅ Merged - removing..."
        git worktree remove "$PATH" --force
        git branch -D "$BRANCH"
        echo "  ✅ Cleaned up"
    else
        echo "  ⚠️  Not merged - keeping"
    fi
    
    echo ""
done

echo "✅ Cleanup complete!"
