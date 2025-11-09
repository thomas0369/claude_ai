#!/bin/bash

# Worktree Agent - Runs in background

LOG_FILE=~/.claude/logs/worktree-agent.log
mkdir -p ~/.claude/logs

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> $LOG_FILE
}

log "Worktree Agent started"

# Monitor for merged branches and auto-cleanup
while true; do
    # Find all worktrees
    for repo in $(find ~ -name ".git" -type d 2>/dev/null | grep -v worktrees); do
        REPO_DIR=$(dirname "$repo")
        
        cd "$REPO_DIR" 2>/dev/null || continue
        
        # List worktrees
        git worktree list --porcelain 2>/dev/null | while read -r line; do
            if [[ $line == worktree* ]]; then
                WORKTREE_PATH=$(echo $line | cut -d' ' -f2-)
            elif [[ $line == branch* ]]; then
                BRANCH=$(echo $line | sed 's/branch refs\/heads\///')
                
                # Check if branch is merged
                if git branch --merged main 2>/dev/null | grep -q "^  $BRANCH$"; then
                    log "Found merged branch in worktree: $BRANCH"
                    log "Auto-removing worktree: $WORKTREE_PATH"
                    
                    git worktree remove "$WORKTREE_PATH" --force 2>/dev/null
                    git branch -D "$BRANCH" 2>/dev/null
                    
                    log "Cleaned up: $BRANCH"
                fi
            fi
        done
    done
    
    # Run every hour
    sleep 3600
done
