#!/bin/bash
# Install Claude Code git hooks to a project
# Usage: ./install-git-hooks.sh [project-dir]

set -e

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

PROJECT_DIR="${1:-.}"
HOOKS_DIR="$PROJECT_DIR/.git/hooks"
TEMPLATE_DIR="$HOME/.claude/templates"

echo -e "${BLUE}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Claude Code Git Hooks Installer                    ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════╝${NC}"
echo ""

# Validate project directory
if [ ! -d "$PROJECT_DIR/.git" ]; then
    echo -e "${RED}❌ Error: $PROJECT_DIR is not a git repository${NC}"
    echo "   Initialize git first: git init"
    exit 1
fi

# Create hooks directory if it doesn't exist
mkdir -p "$HOOKS_DIR"

# ============================================================================
# INSTALL PRE-COMMIT HOOK
# ============================================================================

echo -e "${BLUE}📦 Installing pre-commit hook...${NC}"

PRE_COMMIT_HOOK="$HOOKS_DIR/pre-commit"

# Backup existing hook if it exists
if [ -f "$PRE_COMMIT_HOOK" ]; then
    echo -e "  ${YELLOW}⚠️  Existing pre-commit hook found, backing up...${NC}"
    mv "$PRE_COMMIT_HOOK" "$PRE_COMMIT_HOOK.backup.$(date +%Y%m%d%H%M%S)"
fi

# Install hook
cp "$TEMPLATE_DIR/pre-commit-hook.sh" "$PRE_COMMIT_HOOK"
chmod +x "$PRE_COMMIT_HOOK"

echo -e "  ${GREEN}✅ Pre-commit hook installed${NC}"

# ============================================================================
# INSTALL COMMIT-MSG HOOK (Optional)
# ============================================================================

echo ""
read -p "Install commit-msg hook for message validation? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    COMMIT_MSG_HOOK="$HOOKS_DIR/commit-msg"

    cat > "$COMMIT_MSG_HOOK" << 'EOF'
#!/bin/bash
# Commit message validation hook

COMMIT_MSG_FILE=$1
COMMIT_MSG=$(cat "$COMMIT_MSG_FILE")

# Check minimum length
if [ ${#COMMIT_MSG} -lt 10 ]; then
    echo "❌ Commit message too short (minimum 10 characters)"
    exit 1
fi

# Check for conventional commit format (optional)
if [[ ! "$COMMIT_MSG" =~ ^(feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert)(\(.+\))?: ]]; then
    echo "⚠️  Commit message doesn't follow conventional commits format"
    echo "   Recommended: type(scope): message"
    echo "   Types: feat, fix, docs, style, refactor, test, chore, perf, ci, build, revert"
    echo ""
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

exit 0
EOF

    chmod +x "$COMMIT_MSG_HOOK"
    echo -e "  ${GREEN}✅ Commit-msg hook installed${NC}"
fi

# ============================================================================
# CONFIGURE HOOK OPTIONS
# ============================================================================

echo ""
echo -e "${BLUE}🔧 Hook Configuration${NC}"
echo ""
echo "Pre-commit hook options:"
echo "  1. Full validation (runs /thomas-fix) - Recommended"
echo "  2. Quick checks only (no thomas-fix)"
echo "  3. Custom (configure .git-hooks-config)"
echo ""
read -p "Select option (1-3): " -n 1 -r
echo

case $REPLY in
    1)
        # Default: Full validation
        echo "RUN_THOMAS_FIX=true" > "$PROJECT_DIR/.git-hooks-config"
        echo "ALLOW_SKIP=true" >> "$PROJECT_DIR/.git-hooks-config"
        echo -e "  ${GREEN}✅ Full validation enabled${NC}"
        ;;
    2)
        # Quick checks only
        echo "RUN_THOMAS_FIX=false" > "$PROJECT_DIR/.git-hooks-config"
        echo "ALLOW_SKIP=true" >> "$PROJECT_DIR/.git-hooks-config"
        echo -e "  ${YELLOW}⚠️  Quick checks only (thomas-fix disabled)${NC}"
        ;;
    3)
        # Custom
        cat > "$PROJECT_DIR/.git-hooks-config" << 'EOF'
# Git hooks configuration
# Edit these values to customize hook behavior

# Run /thomas-fix before commit (true/false)
RUN_THOMAS_FIX=true

# Allow skipping validation with SKIP_VALIDATION file (true/false)
ALLOW_SKIP=true

# Additional forbidden patterns (space-separated)
FORBIDDEN_PATTERNS="console.log debugger TODO FIXME"

# Maximum file size in bytes (default: 1MB)
MAX_FILE_SIZE=1000000
EOF
        echo -e "  ${BLUE}ℹ️  Custom config created: .git-hooks-config${NC}"
        ;;
esac

# ============================================================================
# SUMMARY
# ============================================================================

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  Installation Complete!                              ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════╝${NC}"
echo ""
echo "Installed hooks:"
echo "  ✅ pre-commit - Validation before commits"
if [ -f "$HOOKS_DIR/commit-msg" ]; then
    echo "  ✅ commit-msg - Message format validation"
fi
echo ""
echo "Usage:"
echo "  • Normal commit: git commit -m \"message\""
echo "  • Skip validation: git commit --no-verify -m \"message\""
echo "  • Configure: edit $PROJECT_DIR/.git-hooks-config"
echo ""
echo "Next steps:"
echo "  1. Test the hook: make a small change and commit"
echo "  2. Configure options: vim .git-hooks-config"
echo "  3. Share with team: commit .git-hooks-config to repo"
echo ""
