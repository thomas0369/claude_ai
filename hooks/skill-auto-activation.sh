#!/bin/bash
# Skills Auto-Activation Hook
# Analyzes context and suggests relevant skills before tool use

SKILL_DIR="$HOME/.claude/skills"

# Only run for Read/Write/Edit operations
case "$TOOL_NAME" in
  Read|Write|Edit|MultiEdit)
    # Extract file path from tool input
    FILE_PATH=$(echo "$TOOL_INPUT" | jq -r '.file_path // empty' 2>/dev/null)

    if [ -n "$FILE_PATH" ]; then
      # Detect backend files first (more specific)
      if echo "$FILE_PATH" | grep -qE '(server|api|route|controller|service)' && echo "$FILE_PATH" | grep -qE '\.(ts|js)$' && ! echo "$FILE_PATH" | grep -qE '\.(tsx|jsx)$'; then
        if [ -f "$SKILL_DIR/backend-dev-guidelines/SKILL.md" ]; then
          echo "💡 Backend file detected. Skill available: backend-dev-guidelines"
        fi
      # Detect frontend files
      elif echo "$FILE_PATH" | grep -qE '\.(tsx?|jsx?|css|html)$'; then
        if [ -f "$SKILL_DIR/frontend-dev-guidelines/SKILL.md" ]; then
          echo "💡 Frontend file detected. Skill available: frontend-dev-guidelines"
        fi
      fi
    fi
    ;;
esac
