#!/bin/bash
echo "🧠 Memory Bank"
for d in ~/.claude/memory-bank/*/; do
    c=$(ls "$d"*.md 2>/dev/null | wc -l)
    [ $c -gt 0 ] && echo "  $(basename $d): $c"
done
