#!/bin/bash
# Auto-generate agents/README.md from agent frontmatter
# Usage: ./scripts/update-agent-readme.sh

set -e

AGENTS_DIR="/home/thoma/.claude/agents"
README_FILE="$AGENTS_DIR/README.md"
TEMP_FILE="/tmp/agent-readme-temp.md"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Generating agents README from frontmatter...${NC}"

# Start README
cat > "$TEMP_FILE" << 'EOF'
---
name: agents-readme
type: documentation
description: Documentation about the agents system (not an actual agent)
---

# Agents

Specialized agents for complex, multi-step tasks.

---

## What Are Agents?

Agents are autonomous Claude instances that handle specific complex tasks. Unlike skills (which provide inline guidance), agents:
- Run as separate sub-tasks
- Work autonomously with minimal supervision
- Have specialized tool access
- Return comprehensive reports when complete

**Key advantage:** Agents are **standalone** - just copy the `.md` file and use immediately!

---

## Available Agents

EOF

# Function to extract frontmatter value
extract_frontmatter() {
    local file=$1
    local key=$2
    awk -v key="$key" '
        BEGIN { in_frontmatter=0 }
        /^---$/ { in_frontmatter++; next }
        in_frontmatter==1 && $0 ~ "^" key ":" {
            sub("^" key ":[[:space:]]*", "")
            gsub(/^["'"'"']|["'"'"']$/, "")
            print
            exit
        }
    ' "$file"
}

# Count agents
agent_count=0
declare -A categories

# First pass: count and categorize
while IFS= read -r agent_file; do
    # Skip README and templates
    [[ "$agent_file" == *"/README.md" ]] && continue
    [[ "$agent_file" == *"/_templates/"* ]] && continue

    name=$(extract_frontmatter "$agent_file" "name")
    category=$(extract_frontmatter "$agent_file" "category")
    description=$(extract_frontmatter "$agent_file" "description")

    # Skip if no name
    [[ -z "$name" ]] && continue

    # Default category
    [[ -z "$category" ]] && category="general"

    # Store agent info
    categories["$category"]+="$name|$description|$agent_file"$'\n'
    agent_count=$((agent_count + 1))
done < <(find "$AGENTS_DIR" -name "*.md" -type f | sort)

echo -e "${GREEN}Found $agent_count agents${NC}"

# Update count in README
echo "**Total Agents: $agent_count**" >> "$TEMP_FILE"
echo "" >> "$TEMP_FILE"

# Category display names
declare -A category_names=(
    ["general"]="General Purpose"
    ["typescript"]="TypeScript & Build"
    ["react"]="React & Frontend"
    ["testing"]="Testing & QA"
    ["devops"]="DevOps & Infrastructure"
    ["database"]="Database"
    ["code-quality"]="Code Quality"
    ["research"]="Research & Documentation"
    ["blockchain"]="Blockchain"
    ["framework"]="Frameworks"
    ["frontend"]="Frontend Specialists"
    ["build-tools"]="Build Tools"
    ["git"]="Version Control"
    ["infrastructure"]="Infrastructure"
    ["nodejs"]="Node.js Runtime"
    ["kafka"]="Apache Kafka"
    ["loopback"]="LoopBack Framework"
    ["e2e"]="End-to-End Testing"
)

# Second pass: generate README by category
for category in $(printf '%s\n' "${!categories[@]}" | sort); do
    category_display="${category_names[$category]:-$category}"

    echo "### $category_display" >> "$TEMP_FILE"
    echo "" >> "$TEMP_FILE"

    # Process agents in this category
    while IFS='|' read -r name description file; do
        [[ -z "$name" ]] && continue

        # Get relative path
        rel_path="${file#$AGENTS_DIR/}"

        # Format agent entry
        echo "#### \`$name\`" >> "$TEMP_FILE"
        echo "" >> "$TEMP_FILE"

        if [[ -n "$description" ]]; then
            echo "$description" >> "$TEMP_FILE"
            echo "" >> "$TEMP_FILE"
        fi

        echo "**File:** \`$rel_path\`" >> "$TEMP_FILE"
        echo "" >> "$TEMP_FILE"

    done <<< "${categories[$category]}"

    echo "---" >> "$TEMP_FILE"
    echo "" >> "$TEMP_FILE"
done

# Add usage section
cat >> "$TEMP_FILE" << 'EOF'

## How to Use Agents

### Via Task Tool
```
I'll use the Task tool to launch the [agent-name] agent
```

### Direct Request
```
Use the [agent-name] agent to review my code
```

### In Commands
Many commands automatically invoke agents:
- `/code-review` → Uses code-review-expert
- `/research <query>` → Uses research-expert
- `/thomas-fix` → Uses multiple testing agents

---

## When to Use Agents vs Skills

| Use Agents When... | Use Skills When... |
|-------------------|-------------------|
| Task requires multiple steps | Need inline guidance |
| Complex analysis needed | Checking best practices |
| Autonomous work preferred | Want to maintain control |
| Task has clear end goal | Ongoing development work |
| Example: "Review all controllers" | Example: "Creating a new route" |

**Both can work together:**
- Skill provides patterns during development
- Agent reviews the result when complete

---

## Creating Custom Agents

Agents are markdown files with YAML frontmatter:

```markdown
---
name: my-agent
description: What this agent does
category: general
---

# My Agent

## When Invoked

### Step 1: Environment Detection
Check project setup and adapt

### Step 2: Problem Analysis
Identify the issue

### Step 3: Solution Implementation
Fix the problem

## Tools Available
List of tools this agent uses

## Expected Output
Format for results
```

**Tips:**
- Be very specific in instructions
- Break complex tasks into numbered steps
- Specify exactly what to return
- Include examples of good output

---

## Integration Guide

**Standard Integration (Most Agents):**

```bash
# Copy agent to your project
cp showcase/.claude/agents/agent-name.md \
   your-project/.claude/agents/

# Verify (check for hardcoded paths)
grep -n "~/git/\|/root/" your-project/.claude/agents/agent-name.md

# Use it
# Ask Claude: "Use the [agent-name] agent to [task]"
```

**That's it!** Agents are standalone and work immediately.

---

## Troubleshooting

### Agent not found
```bash
# Check if agent file exists
ls -la .claude/agents/[agent-name].md
```

### Agent fails with path errors
```bash
# Check for hardcoded paths
grep "~/\|/root/\|/Users/" .claude/agents/[agent-name].md

# Fix with environment variables
sed -i 's|~/git/.*project|$CLAUDE_PROJECT_DIR|g' .claude/agents/[agent-name].md
```

---

**Last Updated:** $(date +%Y-%m-%d)
**Auto-generated:** Yes (via scripts/update-agent-readme.sh)
**Agent Count:** $agent_count
EOF

# Move temp file to README
mv "$TEMP_FILE" "$README_FILE"

echo -e "${GREEN}✅ agents/README.md updated successfully${NC}"
echo -e "${BLUE}📊 Total agents documented: $agent_count${NC}"
