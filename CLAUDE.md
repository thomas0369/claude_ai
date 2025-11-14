# Claude Code - Global Configuration & Workflows

## Core Principles

### 1. Test-First Development (MANDATORY)
- **AFTER EVERY CODE CHANGE**: Run `/thomas-fix`
- **UI Changes**: MUST test in browser with Playwright
- **Runtime Errors**: Fix immediately, don't proceed with other tasks
- **No Speculation**: No "continue" without concrete action plan

### 2. Error-Zero-Tolerance
```bash
# If you see ANY of these:
- Runtime Error → /thomas-fix IMMEDIATELY
- Console Error → /thomas-fix IMMEDIATELY
- Failed Test → Fix before continuing
- Build Error → Stop and fix

# NEVER:
- Ignore console errors
- Skip browser validation
- Commit without /thomas-fix passing
```

### 3. Quality Gates
Every code change must pass:
1. ✅ Lint (automatic via hooks)
2. ✅ TypeScript type-check
3. ✅ Unit tests
4. ✅ Browser tests (Playwright)
5. ✅ Build successful

## Common Workflows

### Frontend Development
```bash
# Standard workflow
1. Make UI changes
2. /thomas-fix (auto: lint → typecheck → test → build → browser test)
3. Review screenshots in /tmp/thomas-fix-*.png
4. Fix any issues found
5. /git:commit

# Quick iteration (dev server running)
1. Make change
2. /thomas-fix (will use existing dev server)
3. Repeat
```

### API/Backend Development
```bash
# Route implementation
1. Write route
2. /auth-route-tester (test auth + functionality)
3. /thomas-fix (code validation)
4. /git:commit

# Database changes
1. Update schema/migrations
2. Test with actual data
3. /thomas-fix
```

### Bug Fixing
```bash
# ALWAYS:
1. Reproduce bug in browser (if UI)
2. Fix issue
3. /thomas-fix (verify fix + no regressions)
4. Check console log: /tmp/thomas-fix-console-log.json
5. Review screenshots
6. /git:commit
```

## Project-Specific Patterns

### Tech Stack
- **Frontend**: React/Preact + Vite
- **UI Library**: shadcn/ui (Radix UI primitives)
- **Styling**: Tailwind CSS
- **State**: Zustand for global state
- **Forms**: React Hook Form + Zod validation
- **Testing**: Vitest (units) + Playwright (E2E)
- **Auth**: Keycloak with cookie-based sessions

### Common Errors & Solutions

#### 1. Select.Item Error
```typescript
// ❌ WRONG (empty value)
<Select.Item value="">None</Select.Item>

// ✅ CORRECT
<Select.Item value="none">None</Select.Item>
```

#### 2. Form Validation
```typescript
// ALWAYS use Zod schemas
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
})
```

#### 3. API Routes Auth
```typescript
// All API routes MUST check auth
import { requireAuth } from '@/lib/auth'

export async function POST(req: Request) {
  const user = await requireAuth(req)
  // ... route logic
}
```

## Available Commands

### Development
- `/thomas-fix` - Full autonomous validation + testing cycle
- `/dev-docs <task>` - Create strategic plan with task breakdown
- `/dev-docs-update` - Update documentation before context compaction

### Testing
- `/auth-route-tester` - Test authenticated routes
- `/route-research-for-testing` - Map edited routes & launch tests

### Code Quality
- `/code-review <what>` - Multi-aspect code review with parallel agents
- `/create-command` - Create custom slash commands

### Git Operations
- `/git:commit` - Smart commit with repo style detection
- `/git:status` - Analyze git status with insights
- `/git:push` - Safe push with checks
- `/git:checkout <branch>` - Smart branch creation

### Utilities
- `/checkpoint:create [desc]` - Create rollback point
- `/checkpoint:restore <num>` - Restore to checkpoint
- `/research <question>` - Deep research with citations

## Error Logging & Monitoring

### View Error Stats
```bash
# Last 24 hours
~/.claude/hooks/error-logger.sh stats

# Last week
~/.claude/hooks/error-logger.sh stats 168

# Cleanup old logs (keep 7 days)
~/.claude/hooks/error-logger.sh cleanup
```

### Log Files
- **Errors**: `~/.claude/logs/errors.jsonl`
- **Hook Performance**: `~/.claude/logs/performance.jsonl`
- **Hook Debug**: `~/.claude/logs/hooks.log`

### Common Patterns in Logs
```bash
# Find most common errors
jq -r '.type' ~/.claude/logs/errors.jsonl | sort | uniq -c | sort -rn

# Find slowest hooks
jq -r 'select(.duration_ms > 1000) | [.hook, .duration_ms] | @tsv' ~/.claude/logs/performance.jsonl

# Recent failures
tail -20 ~/.claude/logs/hooks.log | grep WARNING
```

## Development Rules

### DO:
- ✅ Run `/thomas-fix` after every change
- ✅ Check browser console for errors
- ✅ Review Playwright screenshots
- ✅ Use TypeScript strict mode
- ✅ Write tests for new features
- ✅ Document complex logic
- ✅ Use existing components from shadcn/ui

### DON'T:
- ❌ Skip browser validation
- ❌ Ignore TypeScript errors
- ❌ Commit with failing tests
- ❌ Use `any` type
- ❌ Inline large SVGs (use components)
- ❌ Hardcode URLs (use env vars)
- ❌ Skip error handling

## Performance Optimization

### Hook Performance
All hooks now use safe-hook-wrapper.sh:
- ⏱️ 5s timeout (prevents hanging)
- 📊 Performance logging
- 🛡️ Non-blocking errors
- 📝 Detailed error logs

### Reduced Hooks
**Before**: 11 hooks per edit/write
**After**: 2 hooks per edit/write
**Savings**: ~82% reduction in hook overhead

### Smart Caching
- TypeScript checks cached per session
- Build commands cached per repo
- Skill suggestions deduplicated

## Troubleshooting

### Hook Errors
```bash
# Check recent hook issues
tail -50 ~/.claude/logs/hooks.log

# View error details
cat ~/.claude/logs/errors.jsonl | jq -r 'select(.type=="hook_failure")'

# Performance issues?
~/.claude/hooks/error-logger.sh stats | grep "Slowest"
```

### Browser Test Failures
```bash
# View screenshots
ls -lh /tmp/thomas-fix-*.png

# Check console errors
cat /tmp/thomas-fix-console-log.json | jq '.errors'

# View server logs (if thomas-fix started server)
cat /tmp/thomas-fix-server.log
```

### Timeout Issues
```bash
# Increase bash timeout if needed
/config:bash-timeout 30m project

# Check for hanging hooks
ps aux | grep claude | grep hook
```

## Best Practices Summary

1. **Never skip /thomas-fix** - It's your safety net
2. **Browser = Source of Truth** - Always verify in browser
3. **Errors = Stop Signal** - Fix immediately, don't accumulate
4. **Tests = Documentation** - Write them, maintain them
5. **Logs = Insights** - Check them regularly for patterns
6. **Hooks = Helpers** - They shouldn't block you (safe-wrapper ensures this)

---

*Last updated: 2025-01-14*
*Hook optimization: 82% overhead reduction*
*Error logging: Fully instrumented*
