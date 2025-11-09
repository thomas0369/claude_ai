---
description: Create a comprehensive strategic plan with structured task breakdown
argument-hint: Describe what you need planned (e.g., "refactor authentication system", "implement microservices")
---

You are an elite strategic planning specialist. Create a comprehensive, actionable plan for: $ARGUMENTS

## Workflow: Worktree-First Development

### Step 1: Git Environment Detection

**Check current environment:**
1. **Is this a git repository?**
   - Run: `git rev-parse --git-dir 2>/dev/null`
   - If yes, continue to step 2
   - If no, skip to Step 3 (create dev-docs without worktree)

2. **What branch are we on?**
   - Run: `git branch --show-current`
   - Check if on protected branch: `main`, `master`, `develop`, `dev`

3. **Worktree Decision:**
   - **If on protected branch:** Create worktree (Step 2)
   - **If already in worktree/feature branch:** Skip to Step 3
   - **If not a git repo:** Skip to Step 3

### Step 2: Auto-Create Worktree (Protected Branch Only)

**When on main/master/develop:**

1. **Generate branch name from task:**
   ```
   Task: "implement user authentication system"
   Branch: feature/YYYYMMDD-implement-user-authentication-system

   Rules:
   - Prefix: feature/
   - Date: YYYYMMDD (e.g., 20250109)
   - Slug: lowercase, alphanumeric + hyphens only
   - Max length: 60 characters total
   - Remove: common prefixes (implement, create, add, build, etc.)
   ```

2. **Determine worktree path:**
   ```
   Project: /path/to/my-project
   Worktree: /path/to/my-project-worktrees/feature/YYYYMMDD-task-name/
   ```

3. **Check if worktree already exists:**
   - Run: `git worktree list`
   - If exists: Switch to existing worktree, skip creation
   - If new: Create worktree

4. **Create worktree:**
   ```bash
   # Create parent directory
   mkdir -p ../my-project-worktrees

   # Create worktree with new branch
   git worktree add "../my-project-worktrees/feature/YYYYMMDD-task-name" -b "feature/YYYYMMDD-task-name"

   # Change to worktree directory
   cd ../my-project-worktrees/feature/YYYYMMDD-task-name
   ```

5. **Setup worktree environment:**
   ```bash
   # Install dependencies if package.json exists
   if [ -f package.json ]; then
     echo "📦 Installing dependencies..."
     npm install
   fi

   # Copy .env.example if exists
   if [ -f .env.example ] && [ ! -f .env ]; then
     cp .env.example .env
     echo "✅ Created .env from template"
   fi
   ```

6. **Report worktree creation:**
   ```
   ✅ Worktree created!
   📍 Branch: feature/YYYYMMDD-task-name
   📁 Path: ../my-project-worktrees/feature/YYYYMMDD-task-name/
   📦 Dependencies installed
   ```

### Step 3: Create Dev-Docs Structure

**Location Decision:**
- **If in worktree:** Create `.dev/` in worktree root
- **If not git repo or legacy:** Create `dev/active/[task-name]/`

**Recommended location:** `.dev/` (simpler, travels with worktree)

**Create directory:**
```bash
# In worktree
mkdir -p .dev

# Legacy (for non-worktree projects)
mkdir -p dev/active/[task-slug]
```

**Generate three files:**

1. **`.dev/plan.md`** (or `[task-slug]-plan.md` for legacy)
2. **`.dev/context.md`** (or `[task-slug]-context.md` for legacy)
3. **`.dev/tasks.md`** (or `[task-slug]-tasks.md` for legacy)

### Step 4: Generate Strategic Plan

**Create comprehensive plan in `.dev/plan.md`:**

#### Executive Summary
- What: Brief description of the task
- Why: Business/technical justification
- How: High-level approach
- When: Timeline estimate
- Who: Required expertise/resources

#### Current State Analysis
- Examine relevant files in codebase
- Document existing architecture
- Identify pain points or limitations
- List current dependencies
- Note any technical debt

#### Proposed Future State
- Describe end result
- Show architecture changes
- List new components/files
- Define success criteria
- Specify acceptance criteria

#### Implementation Phases

**Break down into logical phases (3-5 phases ideal):**

**Phase 1: Planning & Research** (Est: S/M)
- [ ] Review existing code
- [ ] Research best practices
- [ ] Design solution architecture
- [ ] Identify edge cases
- [ ] Document decisions

**Phase 2: Core Implementation** (Est: M/L)
- [ ] [Specific implementation tasks]
- [ ] [Include acceptance criteria for each]
- [ ] [Note dependencies]

**Phase 3: Testing & Validation** (Est: M)
- [ ] Unit tests
- [ ] Integration tests
- [ ] Manual testing
- [ ] Edge case testing
- [ ] Performance testing

**Phase 4: Documentation & Cleanup** (Est: S/M)
- [ ] Code documentation
- [ ] API documentation
- [ ] Update README/CLAUDE.md
- [ ] Clean up debug code
- [ ] Final review

#### Risk Assessment

**Identify potential risks:**
- **Technical Risks:**
  - Performance bottlenecks
  - Breaking changes
  - Compatibility issues

- **Business Risks:**
  - Timeline slippage
  - Scope creep
  - Resource constraints

**Mitigation Strategies:**
- For each risk, provide mitigation approach
- Include contingency plans
- Identify early warning signs

#### Success Metrics
- How to measure completion
- Quality criteria
- Performance targets
- User acceptance criteria

#### Required Resources
- Dependencies (npm packages, APIs, etc.)
- Tools needed
- Documentation references
- Team members/expertise

#### Timeline Estimates
- Phase-by-phase estimates
- Total effort (in story points or hours)
- Critical path items
- Buffer for unknowns

**Last Updated:** YYYY-MM-DD

---

### Step 5: Generate Context Document

**Create `.dev/context.md`:**

```markdown
# Context: [Task Name]

**Created:** YYYY-MM-DD
**Branch:** feature/YYYYMMDD-task-name
**Status:** In Progress

## Key Files to Modify

### Primary Files
- `src/path/to/file1.ts` - [Why this file]
- `src/path/to/file2.ts` - [What changes needed]

### Supporting Files
- `src/path/to/file3.ts` - [Related changes]
- `tests/path/to/test.spec.ts` - [Test updates]

## Dependencies

### External Dependencies
- Package: `@package/name` (version: ^1.0.0)
  - Purpose: [Why needed]
  - Docs: [Link to docs]

### Internal Dependencies
- Module: `src/utils/helper.ts`
  - Relationship: [How it's used]

## Integration Points

### API Endpoints
- `POST /api/endpoint` - [Purpose]
- `GET /api/resource/:id` - [Purpose]

### Database Changes
- Table: `users` - [Changes needed]
- Migration: [Migration approach]

### UI Components
- Component: `UserForm` - [Changes needed]
- State: [State management approach]

## Design Decisions

### Decision 1: [Decision Title]
- **Problem:** [What problem we're solving]
- **Options Considered:**
  1. Option A - [Pros/cons]
  2. Option B - [Pros/cons]
- **Chosen:** Option A
- **Rationale:** [Why this choice]
- **Trade-offs:** [What we're accepting]

### Decision 2: [Next Decision]
[Same format]

## Session Notes

### Session 1 (YYYY-MM-DD)
- Completed: [Tasks done]
- Decisions: [Decisions made]
- Blockers: [Issues encountered]
- Next: [Next steps]

### Session 2 (YYYY-MM-DD)
[Updated each session]

## Last Updated
YYYY-MM-DD HH:MM
```

---

### Step 6: Generate Task Checklist

**Create `.dev/tasks.md`:**

```markdown
# Tasks: [Task Name]

**Branch:** feature/YYYYMMDD-task-name
**Created:** YYYY-MM-DD
**Progress:** 0/X tasks completed

---

## Phase 1: Planning & Research (0/5)

- [ ] **1.1** Review existing implementation
  - **Acceptance:** Document current architecture in context.md
  - **Effort:** S
  - **Files:** `src/current/implementation.ts`

- [ ] **1.2** Research best practices
  - **Acceptance:** Document approach in plan.md
  - **Effort:** M
  - **References:** [Links to articles/docs]

- [ ] **1.3** Design solution architecture
  - **Acceptance:** Architecture diagram in plan.md
  - **Effort:** M
  - **Dependencies:** 1.1, 1.2

- [ ] **1.4** Identify edge cases
  - **Acceptance:** List of edge cases with handling approach
  - **Effort:** S
  - **Dependencies:** 1.3

- [ ] **1.5** Document design decisions
  - **Acceptance:** Decisions recorded in context.md
  - **Effort:** S
  - **Dependencies:** 1.3, 1.4

---

## Phase 2: Core Implementation (0/X)

- [ ] **2.1** [Specific implementation task]
  - **Acceptance:** [Clear criteria]
  - **Effort:** [S/M/L/XL]
  - **Files:** [Files to create/modify]
  - **Dependencies:** [Task IDs]

[Continue with all implementation tasks]

---

## Phase 3: Testing & Validation (0/X)

- [ ] **3.1** Write unit tests
  - **Acceptance:** >80% code coverage
  - **Effort:** M
  - **Files:** `tests/unit/*.spec.ts`
  - **Dependencies:** 2.x

- [ ] **3.2** Write integration tests
  - **Acceptance:** All integration points tested
  - **Effort:** M
  - **Dependencies:** 2.x

- [ ] **3.3** Manual testing
  - **Acceptance:** Test plan completed, no critical bugs
  - **Effort:** S
  - **Dependencies:** 3.1, 3.2

- [ ] **3.4** Performance testing
  - **Acceptance:** Meets performance targets
  - **Effort:** S
  - **Dependencies:** 2.x

---

## Phase 4: Documentation & Cleanup (0/X)

- [ ] **4.1** Code documentation
  - **Acceptance:** All public APIs documented
  - **Effort:** S
  - **Dependencies:** 2.x

- [ ] **4.2** Update CLAUDE.md
  - **Acceptance:** New features documented
  - **Effort:** S
  - **Dependencies:** 2.x

- [ ] **4.3** Clean up debug code
  - **Acceptance:** No console.logs, debug flags removed
  - **Effort:** S
  - **Dependencies:** 3.x

- [ ] **4.4** Final code review
  - **Acceptance:** All review comments addressed
  - **Effort:** M
  - **Dependencies:** 4.1, 4.2, 4.3

---

## Completed Tasks

### YYYY-MM-DD
- ✅ **X.X** [Task completed]

[Move completed tasks here]

---

## Blocked Tasks

[Track blocked tasks with blocker information]

---

## Last Updated
YYYY-MM-DD HH:MM
```

---

### Step 7: Report Status

**Display comprehensive summary:**

```
✅ Strategic plan created!

📍 Location:
   Worktree: ../my-project-worktrees/feature/20250109-task-name/
   Branch: feature/20250109-task-name

📋 Dev-Docs:
   .dev/plan.md     - Strategic plan (executive summary, phases, risks)
   .dev/context.md  - Key files, decisions, dependencies
   .dev/tasks.md    - Task checklist (X tasks across Y phases)

🎯 Next Steps:
   1. Review .dev/plan.md for strategic approach
   2. Start with task 1.1: [First task description]
   3. Update progress in .dev/tasks.md as you complete tasks
   4. Run `/dev-docs-update` before context resets to save progress

💡 Pro Tips:
   - Mark tasks complete: Change [ ] to [✅] in .dev/tasks.md
   - Update context.md with decisions made during implementation
   - Commit frequently: git add . && git commit -m "feat: description"
   - When done: Create PR to merge feature branch back to main
```

---

## Quality Standards

- Plans must be self-contained with all necessary context
- Use clear, actionable language
- Include specific technical details where relevant
- Consider both technical and business perspectives
- Account for potential risks and edge cases
- Tasks should have clear acceptance criteria
- Effort estimates help with planning (S/M/L/XL)
- Dependencies prevent blocking work

## Context References

**Check for existing documentation:**
- `CLAUDE.md` - Project-specific guidelines
- `PROJECT_KNOWLEDGE.md` - Architecture overview
- `BEST_PRACTICES.md` - Coding standards
- `TROUBLESHOOTING.md` - Common issues
- `.dev/README.md` - Task management guidelines (if exists)

## Worktree Benefits

**Why worktrees + dev-docs:**
- ✅ **Isolated work** - Changes don't affect main branch
- ✅ **Context preservation** - `.dev/` travels with code
- ✅ **Auto-cleanup** - Merging worktree removes dev-docs
- ✅ **Professional workflow** - Industry best practice
- ✅ **Perfect for BSV** - Main branch stays clean for on-chain deployment

**When worktree merged:**
- Code goes to main branch
- `.dev/` directory is deleted (add to .gitignore)
- Worktree can be removed: `git worktree remove [path]`
- History preserved in git

---

**Note**: This command creates persistent task structure that survives context resets. Use `/dev-docs-update` to save progress before context limits.
