#!/bin/bash
grep -ri "$1" ~/.claude/memory-bank 2>/dev/null | head -20
