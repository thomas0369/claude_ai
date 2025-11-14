# Preact-Specific Patterns

## Tech Stack

**Frontend**: Preact (3KB React alternative) + Vite (next-gen build tool)
**Styling**: TailwindCSS (utility-first) + DaisyUI (2KB CSS-only components)
**State**: Nanostores (286 byte atomic state management)
**Forms**: Preact Signals (1KB) + Zod validation (8KB)
**Data**: TanStack Query (data fetching & caching)
**Canvas**: Konva (canvas library for graphics)
**Blockchain**: BSV (Bitcoin SV) + 1Sat Ordinals (BSV ordinals protocol)
**Testing**: Vitest (units) + Playwright (E2E)

## Preact Components

```typescript
import { h } from 'preact'
import { useState } from 'preact/hooks'

// Use h() or JSX pragma
// NOT React - always import from 'preact'
```

### Component Pattern
```typescript
import { h } from 'preact'
import { useState, useCallback } from 'preact/hooks'

interface MyComponentProps {
  title: string
  onAction?: () => void
}

export function MyComponent({ title, onAction }: MyComponentProps) {
  const [count, setCount] = useState(0)

  const handleClick = useCallback(() => {
    setCount(c => c + 1)
    onAction?.()
  }, [onAction])

  return (
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title">{title}</h2>
        <p>Count: {count}</p>
        <button class="btn btn-primary" onClick={handleClick}>
          Click Me
        </button>
      </div>
    </div>
  )
}
```

## DaisyUI Components

CSS-only components - no JS imports needed!

### Common Components

**Buttons**:
```html
<button class="btn btn-primary">Primary</button>
<button class="btn btn-secondary">Secondary</button>
<button class="btn btn-accent">Accent</button>
<button class="btn btn-ghost">Ghost</button>
<button class="btn btn-link">Link</button>

<!-- Sizes -->
<button class="btn btn-lg">Large</button>
<button class="btn btn-md">Medium</button>
<button class="btn btn-sm">Small</button>
<button class="btn btn-xs">Tiny</button>

<!-- States -->
<button class="btn btn-primary loading">Loading</button>
<button class="btn btn-primary" disabled>Disabled</button>
```

**Cards**:
```html
<div class="card bg-base-100 shadow-xl">
  <figure><img src="/image.jpg" alt="Image" /></figure>
  <div class="card-body">
    <h2 class="card-title">Card Title</h2>
    <p>Card content here</p>
    <div class="card-actions justify-end">
      <button class="btn btn-primary">Action</button>
    </div>
  </div>
</div>
```

**Forms**:
```html
<div class="form-control">
  <label class="label">
    <span class="label-text">Email</span>
  </label>
  <input type="email" placeholder="email@example.com" class="input input-bordered" />
  <label class="label">
    <span class="label-text-alt">Helper text</span>
  </label>
</div>

<div class="form-control">
  <label class="label cursor-pointer">
    <span class="label-text">Remember me</span>
    <input type="checkbox" checked class="checkbox" />
  </label>
</div>
```

**Modals**:
```html
<!-- Button to open modal -->
<label for="my-modal" class="btn">Open Modal</label>

<!-- Modal -->
<input type="checkbox" id="my-modal" class="modal-toggle" />
<div class="modal">
  <div class="modal-box">
    <h3 class="font-bold text-lg">Modal Title</h3>
    <p class="py-4">Modal content</p>
    <div class="modal-action">
      <label for="my-modal" class="btn">Close</label>
    </div>
  </div>
</div>
```

**Alerts**:
```html
<div class="alert alert-info">
  <svg>...</svg>
  <span>Info alert</span>
</div>

<div class="alert alert-success">Success</div>
<div class="alert alert-warning">Warning</div>
<div class="alert alert-error">Error</div>
```

## Nanostores State Management

Atomic stores - tiny and reactive!

### Basic Store
```typescript
import { atom, map } from 'nanostores'

// Atom store (single value)
export const $count = atom(0)

// Map store (object)
export const $user = map({
  name: '',
  email: '',
  wallet: ''
})
```

### Using in Components
```typescript
import { useStore } from '@nanostores/preact'
import { $count, $user } from './stores'

export function MyComponent() {
  const count = useStore($count)
  const user = useStore($user)

  return (
    <div>
      <p>Count: {count}</p>
      <p>User: {user.name}</p>
      <button onClick={() => $count.set(count + 1)}>
        Increment
      </button>
      <button onClick={() => $user.setKey('name', 'John')}>
        Set Name
      </button>
    </div>
  )
}
```

### Computed Values
```typescript
import { computed } from 'nanostores'

const $firstName = atom('John')
const $lastName = atom('Doe')

export const $fullName = computed([$firstName, $lastName], (first, last) => {
  return `${first} ${last}`
})
```

## Forms with Preact Signals + Zod

Ultra-lightweight form handling (9KB total vs 53KB for React Hook Form)

### Basic Form
```typescript
import { signal } from '@preact/signals'
import { z } from 'zod'

// Define schema
const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be 8+ characters')
})

// Create signals
const email = signal('')
const password = signal('')
const errors = signal<Record<string, string>>({})

function handleSubmit(e: Event) {
  e.preventDefault()

  // Validate
  const result = loginSchema.safeParse({
    email: email.value,
    password: password.value
  })

  if (!result.success) {
    errors.value = result.error.flatten().fieldErrors
    return
  }

  // Submit
  console.log('Valid:', result.data)
}

// In component
<form onSubmit={handleSubmit}>
  <input
    type="email"
    value={email}
    onInput={(e) => email.value = e.currentTarget.value}
    class="input input-bordered"
  />
  {errors.value.email && (
    <span class="text-error">{errors.value.email[0]}</span>
  )}

  <input
    type="password"
    value={password}
    onInput={(e) => password.value = e.currentTarget.value}
    class="input input-bordered"
  />
  {errors.value.password && (
    <span class="text-error">{errors.value.password[0]}</span>
  )}

  <button type="submit" class="btn btn-primary">Login</button>
</form>
```

### Form Component Pattern
```typescript
import { signal, computed } from '@preact/signals'
import { z } from 'zod'

const formSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  age: z.number().min(18)
})

type FormData = z.infer<typeof formSchema>

const formData = signal<FormData>({
  name: '',
  email: '',
  age: 0
})

const errors = signal<Record<string, string[]>>({})

const isValid = computed(() => {
  const result = formSchema.safeParse(formData.value)
  return result.success
})

function updateField<K extends keyof FormData>(
  field: K,
  value: FormData[K]
) {
  formData.value = { ...formData.value, [field]: value }
}

function validateForm(): boolean {
  const result = formSchema.safeParse(formData.value)

  if (!result.success) {
    errors.value = result.error.flatten().fieldErrors
    return false
  }

  errors.value = {}
  return true
}

export function MyForm() {
  const handleSubmit = (e: Event) => {
    e.preventDefault()
    if (validateForm()) {
      console.log('Valid data:', formData.value)
      // Submit logic
    }
  }

  return (
    <form onSubmit={handleSubmit} class="space-y-4">
      <div class="form-control">
        <label class="label">
          <span class="label-text">Name</span>
        </label>
        <input
          type="text"
          value={formData.value.name}
          onInput={(e) => updateField('name', e.currentTarget.value)}
          class="input input-bordered"
        />
        {errors.value.name && (
          <span class="text-error text-sm">{errors.value.name[0]}</span>
        )}
      </div>

      <button
        type="submit"
        class="btn btn-primary"
        disabled={!isValid.value}
      >
        Submit
      </button>
    </form>
  )
}
```

## TanStack Query with Preact

```typescript
import { useQuery, useMutation } from '@tanstack/preact-query'

function MyComponent() {
  // Fetch data
  const { data, isLoading, error } = useQuery({
    queryKey: ['ordinals'],
    queryFn: fetchOrdinals
  })

  // Mutation
  const mutation = useMutation({
    mutationFn: createOrdinal,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['ordinals'] })
    }
  })

  if (isLoading) return <div class="loading loading-spinner"></div>
  if (error) return <div class="alert alert-error">Error!</div>

  return (
    <div>
      {data.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
      <button
        onClick={() => mutation.mutate(newData)}
        class="btn btn-primary"
      >
        Create
      </button>
    </div>
  )
}
```

## BSV Blockchain Integration

```typescript
// BSV transaction patterns
// Use BSV primitives for blockchain operations
// 1Sat Ordinals for NFT/token operations

interface Ordinal {
  id: string
  owner: string
  content: string
}

async function mintOrdinal(data: any): Promise<Ordinal> {
  // BSV minting logic
}

async function transferOrdinal(id: string, toAddress: string) {
  // BSV transfer logic
}
```

## Key Differences: Preact vs React

1. **Import from 'preact'** not 'react'
2. **Use `class` not `className`** (standard HTML)
3. **Smaller bundle** - 3KB vs 40KB+
4. **Faster** - optimized for performance
5. **Compatible** with most React libraries via preact/compat

## Bundle Size Optimization

Your ultra-lightweight stack:
- Preact: 3KB
- DaisyUI: 2KB (CSS only!)
- Nanostores: 286 bytes
- Preact Signals: 1KB
- Zod: 8KB

**Total**: ~14KB for full UI framework!

Compare to alternatives:
- React + MUI + Zustand + React Hook Form: ~200KB+
- Your stack is **93% smaller**!

## Best Practices

1. **Always use Preact imports** - never React
2. **Use DaisyUI classes** - no JS component imports
3. **Nanostores for global state** - not Context
4. **Preact Signals for forms** - not React Hook Form
5. **Keep bundle small** - this is the philosophy!
6. **Use `class` not `className`** - standard HTML attributes
7. **Test with Vitest + Playwright** - fast and reliable
