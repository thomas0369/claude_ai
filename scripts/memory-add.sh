#!/bin/bash
[ $# -lt 3 ] && exit 1
TYPE=$1; NAME=$2; CONTENT=$3
DIR=~/.claude/memory-bank/${TYPE}s
mkdir -p $DIR
echo -e "# $NAME\n$(date)\n\n$CONTENT" > "$DIR/$NAME.md"
~/.claude/scripts/sync-memory.sh &
