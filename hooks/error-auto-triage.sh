#!/bin/bash
# Auto-triage errors by detecting them in tool output and triggering agents

# Only run for tools that might produce errors
case "$TOOL_NAME" in
  Bash|Read|Edit|Write|MultiEdit)
    # Check if there's error output (non-zero exit or error patterns)
    if [ -n "$TOOL_ERROR" ] || echo "$TOOL_OUTPUT" | grep -qiE '(error|exception|failed|cannot|unable to)'; then

      # Detect error type for smart routing
      ERROR_TYPE="unknown"

      if echo "$TOOL_OUTPUT" | grep -qiE '(type.*error|cannot find|property.*undefined)'; then
        ERROR_TYPE="typescript"
        EXPERT="typescript-type-expert"
      elif echo "$TOOL_OUTPUT" | grep -qiE '(build.*failed|webpack|vite|esbuild)'; then
        ERROR_TYPE="build"
        EXPERT="vite-expert"
      elif echo "$TOOL_OUTPUT" | grep -qiE '(test.*failed|jest|vitest|expect)'; then
        ERROR_TYPE="test"
        EXPERT="vitest-testing-expert"
      elif echo "$TOOL_OUTPUT" | grep -qiE '(database|sql|query|postgres|mongo)'; then
        ERROR_TYPE="database"
        EXPERT="database-expert"
      elif echo "$TOOL_OUTPUT" | grep -qiE '(react|component|hook|render)'; then
        ERROR_TYPE="react"
        EXPERT="react-expert"
      else
        EXPERT="triage-expert"
      fi

      # Log error for analysis
      mkdir -p ~/.claude/logs
      cat >> ~/.claude/logs/errors.jsonl <<EOF
{"timestamp":"$(date -u +"%Y-%m-%dT%H:%M:%SZ")","tool":"$TOOL_NAME","error_type":"$ERROR_TYPE","recommended_expert":"$EXPERT","preview":"$(echo "$TOOL_OUTPUT" | head -c 200)"}
EOF

      # Suggest expert (non-blocking hint)
      echo ""
      echo "⚠️  Error detected (${ERROR_TYPE}). Consider using Task tool with subagent_type=${EXPERT} for analysis"
      echo ""
    fi
    ;;
esac
