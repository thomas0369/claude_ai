#!/bin/bash
cd ~/.claude/memory-bank 2>/dev/null || exit 0
[[ -z $(git status --porcelain 2>/dev/null) ]] && exit 0
git add . 2>/dev/null
git commit -m "sync $(date +%Y%m%d)" 2>/dev/null
git push > /dev/null 2>&1
