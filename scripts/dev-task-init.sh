#!/bin/bash
# Initialize a new development task with structured documentation

set -e

TASK_NAME="$1"
PROJECT_DIR="${2:-$(pwd)}"

if [ -z "$TASK_NAME" ]; then
    echo "Usage: dev-task-init.sh <task-name> [project-dir]"
    echo ""
    echo "Example: dev-task-init.sh implement-dark-mode ~/my-project"
    echo ""
    exit 1
fi

# Create task directory
TASK_DIR="$PROJECT_DIR/dev/active/$TASK_NAME"
mkdir -p "$TASK_DIR"

# Copy templates
cp ~/.claude/templates/dev-docs/task-plan.md "$TASK_DIR/${TASK_NAME}-plan.md"
cp ~/.claude/templates/dev-docs/task-context.md "$TASK_DIR/${TASK_NAME}-context.md"
cp ~/.claude/templates/dev-docs/task-tasks.md "$TASK_DIR/${TASK_NAME}-tasks.md"

# Replace placeholders
DATE=$(date +"%Y-%m-%d")
for file in "$TASK_DIR"/*.md; do
    sed -i "s/\[Task Name\]/${TASK_NAME}/g" "$file"
    sed -i "s/\[Date\]/${DATE}/g" "$file"
done

echo "✅ Task initialized: $TASK_DIR"
echo ""
echo "Files created:"
echo "  - ${TASK_NAME}-plan.md    (implementation plan)"
echo "  - ${TASK_NAME}-context.md (decisions & key files)"
echo "  - ${TASK_NAME}-tasks.md   (checklist)"
echo ""
echo "Next steps:"
echo "  1. Edit ${TASK_NAME}-plan.md with your implementation plan"
echo "  2. Use ${TASK_NAME}-tasks.md as your checklist"
echo "  3. Update ${TASK_NAME}-context.md with decisions as you work"
echo ""
echo "When complete, move to: $PROJECT_DIR/dev/completed/"
