#!/bin/bash
# UserPromptSubmit hook: Suggests relevant skills based on user prompt
set -e

# Get the hooks directory
HOOKS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Run the TypeScript implementation
cd "$HOOKS_DIR"
cat | npx tsx skill-activation-prompt.ts
