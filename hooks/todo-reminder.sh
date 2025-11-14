#!/bin/bash
# Non-blocking todo reminder hook
# Shows incomplete todos as a friendly warning, never blocks

set -e

# Get transcript path from environment or use default
TRANSCRIPT_PATH="${CLAUDE_TRANSCRIPT_PATH:-$HOME/.claude/history.jsonl}"

# Check if transcript exists
if [[ ! -f "$TRANSCRIPT_PATH" ]]; then
  exit 0  # No transcript, allow stop
fi

# Find the most recent TodoWrite result
# We need to parse JSONL backwards to find the latest todo state
TODO_STATE=$(tac "$TRANSCRIPT_PATH" 2>/dev/null | grep -m1 '"type":"user".*"toolUseResult".*"newTodos"' | jq -r '.toolUseResult.newTodos // empty' 2>/dev/null)

# If no todos found, allow stop
if [[ -z "$TODO_STATE" || "$TODO_STATE" == "null" ]]; then
  exit 0
fi

# Count incomplete todos
INCOMPLETE_COUNT=$(echo "$TODO_STATE" | jq '[.[] | select(.status != "completed")] | length' 2>/dev/null)

# If all todos are completed, allow stop
if [[ "$INCOMPLETE_COUNT" -eq 0 ]]; then
  exit 0
fi

# Get the incomplete todo details
INCOMPLETE_TODOS=$(echo "$TODO_STATE" | jq -r '.[] | select(.status != "completed") | "  - [\(.status)] \(.content)"' 2>/dev/null)

# Output a friendly warning (NOT blocking)
cat <<EOF

⚠️  Incomplete Todos Reminder
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
You have $INCOMPLETE_COUNT incomplete todo item(s):

$INCOMPLETE_TODOS

💡 Suggestions:
  • Complete them if they're still relevant
  • Use TodoWrite to mark them as completed
  • Or just proceed - this is only a reminder!

EOF

# Always exit 0 - NEVER block the stop action
exit 0
