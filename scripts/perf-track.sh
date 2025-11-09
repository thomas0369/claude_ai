#!/bin/bash
PROJECT=${1:-.}
PERF_DIR="$PROJECT/.claude/performance"
mkdir -p "$PERF_DIR"

TIMESTAMP=$(date +%Y%m%d-%H%M%S)

if [ -d "$PROJECT/dist" ]; then
    SIZE=$(du -sh "$PROJECT/dist" | cut -f1)
    echo "$TIMESTAMP,$SIZE" >> "$PERF_DIR/bundle-size.csv"
    echo "📦 Bundle: $SIZE"
fi

DEP_COUNT=$(cat "$PROJECT/package.json" 2>/dev/null | jq '.dependencies | length')
echo "$TIMESTAMP,$DEP_COUNT" >> "$PERF_DIR/dependencies.csv"
echo "📚 Dependencies: $DEP_COUNT"

echo "✅ Performance tracked"
