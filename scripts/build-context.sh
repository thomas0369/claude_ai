#!/bin/bash
PROJECT=${1:-.}
OUTPUT="$PROJECT/.claude/context.md"
mkdir -p $(dirname $OUTPUT)

cat > "$OUTPUT" << EOF
# Project Context
**Project:** $(basename $PROJECT)
**Date:** $(date)

## Structure
$(tree -L 2 -I 'node_modules|dist|.git' $PROJECT 2>/dev/null || ls -R $PROJECT | head -20)

## Recent Commits
$(cd $PROJECT && git log -5 --oneline 2>/dev/null || echo "No git history")

## TODOs
$(grep -rn "TODO" $PROJECT/src 2>/dev/null | head -5 || echo "No TODOs")

## Tech Stack
$(cat $PROJECT/package.json 2>/dev/null | jq -r '.dependencies | keys[]' | head -5 || echo "No package.json")
EOF

echo "✅ Context: $OUTPUT"
