# Project-Specific Claude Configuration

**See also**:
- `PROJECT_KNOWLEDGE.md` - Architecture & integration details
- `TROUBLESHOOTING.md` - Common issues & solutions
- `dev/` - Active and completed task documentation

## Tech Stack

**Frontend**: Preact (3KB React alternative) + Vite (next-gen build tool)
**Styling**: TailwindCSS (utility-first) + DaisyUI (2KB CSS-only components)
**State**: Nanostores (286 byte atomic state management)
**Forms**: Preact Signals (1KB) + Zod validation (8KB)
**Data**: TanStack Query (data fetching & caching)
**Canvas**: Konva (canvas library for graphics)
**Blockchain**: BSV (Bitcoin SV) + 1Sat Ordinals (BSV ordinals protocol)
**Testing**: Vitest (units) + Playwright (E2E)

## Common Patterns

### Preact Components
```typescript
import { h } from 'preact'
import { useState } from 'preact/hooks'
// Use Preact, not React
```

### DaisyUI Components
```html
<button class="btn btn-primary">Click</button>
<div class="card bg-base-100 shadow-xl">...</div>
<!-- CSS-only, no JS imports -->
```

### Nanostores State
```typescript
import { atom, map } from 'nanostores'
export const $count = atom(0)
export const $user = map({ wallet: '' })
```

### TanStack Query
```typescript
import { useQuery } from '@tanstack/preact-query'
const { data, isLoading } = useQuery({
  queryKey: ['data'],
  queryFn: fetchData
})
```

### Forms with Signals + Zod
```typescript
import { signal } from '@preact/signals'
import { z } from 'zod'

const formData = signal({ email: '', password: '' })
const errors = signal({})

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
})

function handleSubmit(e) {
  e.preventDefault()
  const result = schema.safeParse(formData.value)
  if (!result.success) {
    errors.value = result.error.flatten()
  }
}
```

### BSV Blockchain
```typescript
// Use BSV primitives
// 1Sat Ordinals for NFT/tokens
```

## Quick Commands

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm test           # Run all tests
npm run lint       # Lint code
```

## Project Quirks

[Add project-specific quirks, conventions, or gotchas here]

- Example: API routes use `/form/route` not `/api/form/route`
- Example: All modals must use DaisyUI modal-toggle pattern
- Example: BSV wallet operations require user confirmation

## Critical Files

- `vite.config.ts` - Build configuration
- `src/routes/` - Page routing (TanStack Router)
- `src/features/` - Feature-based organization
- `src/stores/` - Nanostores global state

## Integration Notes

[Add notes about external services, APIs, blockchain, etc.]

## Workflows

**Frontend**: Edit → `/thomas-fix` → Review `/tmp/thomas-fix-*.png` → `/git:commit`
**API**: Write route → `/auth-route-tester` → `/thomas-fix` → `/git:commit`
**Bug**: Reproduce → Fix → `/thomas-fix` → Check console.json → `/git:commit`

**Large Tasks**: Use `~/.claude/scripts/dev-task-init.sh <task-name>` to create structured docs

## Project Rules

**DO**: DaisyUI classes, Nanostores for state, TypeScript strict, Preact hooks, check PROJECT_KNOWLEDGE.md
**DON'T**: `any` type, inline large SVGs, hardcoded URLs, use React (use Preact), skip TROUBLESHOOTING.md
