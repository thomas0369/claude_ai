# Claude Code - Global Configuration

## Core Philosophy

### Test-First Development (MANDATORY)
- **AFTER EVERY CODE CHANGE**: Run `/thomas-fix`
- **UI Changes**: MUST test in browser with Playwright
- **Runtime Errors**: Fix immediately, don't proceed with other tasks
- **No Speculation**: No "continue" without concrete action plan

### Error-Zero-Tolerance
**If you see ANY of these**: Runtime Error, Console Error, Failed Test, Build Error → `/thomas-fix` IMMEDIATELY

**NEVER**: Ignore console errors, skip browser validation, commit without `/thomas-fix` passing

### Quality Gates
Every code change must pass:
1. Lint (automatic via hooks)
2. TypeScript type-check
3. Unit tests
4. Browser tests (Playwright)
5. Build successful

## Tech Stack

**Frontend**: Preact (3KB) + Vite
**Styling**: TailwindCSS + DaisyUI (2KB CSS-only)
**State**: Nanostores (286 bytes)
**Forms**: Preact Signals (1KB) + Zod (8KB)
**Data**: TanStack Query
**Canvas**: Konva
**Blockchain**: BSV + 1Sat Ordinals
**Testing**: Vitest + Playwright

**→ Detailed patterns in `frontend-dev-guidelines` skill (auto-activated on .tsx/.jsx/.css files)**

## Workflows

**Frontend**: Edit → `/thomas-fix` → Review `/tmp/thomas-fix-*.png` → `/git:commit`
**API**: Write route → `/auth-route-tester` → `/thomas-fix` → `/git:commit`
**Bug Fix**: Reproduce → Fix → `/thomas-fix` → Check console.json → `/git:commit`

## Dev Docs Workflow

### Starting Large Tasks
When planning complex work:
```bash
# Initialize task
~/.claude/scripts/dev-task-init.sh <task-name> [project-dir]

# Creates:
dev/active/<task-name>/
  <task-name>-plan.md      # Implementation plan
  <task-name>-context.md   # Decisions & key files
  <task-name>-tasks.md     # Checklist

# During work: Update context.md with decisions
# When done: Move to dev/completed/
```

Prevents Claude from "losing the plot" on multi-step tasks.

## Development Rules

**DO**: `/thomas-fix` after changes, browser console check, TypeScript strict, DaisyUI classes, Nanostores for state
**DON'T**: Skip validation, ignore errors, use `any` type, inline large SVGs, hardcode URLs, use React (use Preact)

## Agent Usage

**Use Task tool for exploration**: `subagent_type=Explore` for "where is X?" queries
**Delegate to specialists**: Let agents handle multi-step searches vs direct tool calls
**Parallel execution**: Batch independent operations in single message

→ See `~/.claude/AGENTS.md` for detailed agent selection guidelines

## Auto-Activation Systems

### Skills Auto-Activation (PreToolUse)
Detects file types and suggests relevant skills:
- **Frontend files** (.tsx, .jsx, .css, .html) → `frontend-dev-guidelines`
- **Backend files** (server/api/route*.ts/js) → `backend-dev-guidelines`
- Skills loaded only when needed for token efficiency

### Error Auto-Triage (PostToolUse)
Detects errors in tool output and routes to specialists:
- **TypeScript errors** → `typescript-type-expert`
- **Build failures** → `vite-expert`
- **Test failures** → `vitest-testing-expert`
- **Database errors** → `database-expert`
- **React/Preact errors** → `react-expert`
- **Unknown errors** → `triage-expert`

Errors logged to `~/.claude/logs/errors.jsonl` with timestamp, type, and recommended expert

## Performance & Monitoring

**Hooks**: Skills auto-activation + error auto-triage + file-guard + post-tracker
**Logs**: `~/.claude/logs/*.jsonl` - Auto-cleanup daily at 3am
**Error Stats**: `~/.claude/hooks/error-logger.sh stats`
**Browser Tests**: `/tmp/thomas-fix-*.png` screenshots
**Console Logs**: `/tmp/thomas-fix-console-log.json`

## Project-Specific Setup

For each project, create:
- `<project>/.claude/CLAUDE.md` - Project quirks, commands, architecture pointer
- `<project>/PROJECT_KNOWLEDGE.md` - Architecture & integration details
- `<project>/TROUBLESHOOTING.md` - Common issues & solutions

Template: `~/.claude/templates/PROJECT-CLAUDE-TEMPLATE.md`
