---
description: Update dev documentation before context compaction
argument-hint: Optional - specific context or tasks to focus on (leave empty for comprehensive update)
---

We're approaching context limits. Please update the development documentation to ensure seamless continuation after context reset.

## Step 1: Detect Dev-Docs Location

**Check for worktree-style dev-docs first (preferred):**
```bash
if [ -d .dev ]; then
  echo "✅ Found worktree-style dev-docs: .dev/"
  DEV_DOCS_PATH=".dev"
  DEV_DOCS_STYLE="worktree"
else
  # Fall back to legacy dev/active/ structure
  if [ -d dev/active ]; then
    echo "✅ Found legacy dev-docs: dev/active/"
    DEV_DOCS_PATH="dev/active"
    DEV_DOCS_STYLE="legacy"
  else
    echo "❌ No dev-docs found. Run /dev-docs first to create planning structure."
    exit 1
  fi
fi
```

**Location Decision:**
- **Worktree-style** (`.dev/`): Single task per worktree, docs travel with code
- **Legacy** (`dev/active/[task]/`): Multiple tasks in subdirectories

## Step 2: Identify Files to Update

**For worktree-style (`.dev/`):**
```
.dev/
├── plan.md
├── context.md
└── tasks.md
```

**For legacy (`dev/active/`):**
```
dev/active/
├── [task-name]/
│   ├── [task-name]-plan.md
│   ├── [task-name]-context.md
│   └── [task-name]-tasks.md
└── [another-task]/
    └── ...
```

## Required Updates

### 1. Update Active Task Documentation

**For worktree-style (`.dev/`):**
- Update `.dev/context.md` with:
  - Current implementation state
  - Key decisions made this session
  - Files modified and why
  - Any blockers or issues discovered
  - Next immediate steps
  - Last Updated timestamp

- Update `.dev/tasks.md` with:
  - Mark completed tasks as ✅
  - Add any new tasks discovered
  - Update in-progress tasks with current status
  - Reorder priorities if needed

**For legacy (`dev/active/`):**
- For each task in `dev/active/`:
  - Update `[task-name]-context.md` with above items
  - Update `[task-name]-tasks.md` with above items

### 2. Capture Session Context
Include any relevant information about:
- Complex problems solved
- Architectural decisions made
- Tricky bugs found and fixed
- Integration points discovered
- Testing approaches used
- Performance optimizations made

### 3. Update Memory (if applicable)
- Store any new patterns or solutions in project memory/documentation
- Update entity relationships discovered
- Add observations about system behavior

### 4. Document Unfinished Work
- What was being worked on when context limit approached
- Exact state of any partially completed features
- Commands that need to be run on restart
- Any temporary workarounds that need permanent fixes

### 5. Create Handoff Notes
If switching to a new conversation:
- Exact file and line being edited
- The goal of current changes
- Any uncommitted changes that need attention
- Test commands to verify work

## Step 3: Update Files

**For worktree-style (`.dev/`):**
1. Read `.dev/context.md` and `.dev/tasks.md`
2. Update both files with session information
3. Use Edit tool to make precise changes
4. Update "Last Updated" timestamp

**For legacy (`dev/active/`):**
1. For each subdirectory in `dev/active/`:
   - Read `[task-name]-context.md` and `[task-name]-tasks.md`
   - Update both files with session information
   - Use Edit tool to make precise changes
   - Update "Last Updated" timestamp

## Step 4: Report Status

**Display update summary:**
```
✅ Dev-docs updated!

📍 Location: [.dev/ or dev/active/]
📝 Files updated:
   - context.md (added X decisions, Y file changes)
   - tasks.md (marked Z tasks complete, added W new tasks)

🎯 Current Status:
   - Progress: X/Y tasks completed
   - Next step: [First uncompleted task]
   - Blockers: [Any blockers noted]

💡 Ready for context reset - all progress captured!
```

## Additional Context: $ARGUMENTS

**Priority**: Focus on capturing information that would be hard to rediscover or reconstruct from code alone.

**Note**: This command supports both worktree-style (`.dev/`) and legacy (`dev/active/`) dev-docs locations for backward compatibility.