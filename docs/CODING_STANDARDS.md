# CODING_STANDARDS.md — Pickle All Development Standards

> **Status:** Enforced from Day 1. All code — including AI-generated code — must comply.  
> **Audience:** AI coding agents, all developers.

---

## 1. Core Principles

1. **Correctness over cleverness.** Write boring, readable code.
2. **Type everything.** No `any`. Use `unknown` and narrow it.
3. **Co-locate by feature.** Files that change together live together.
4. **Server by default.** React components are Server Components unless they need interactivity.
5. **One source of truth.** All DB types come from Drizzle's schema in `lib/db/schema.ts` — inferred automatically, never written by hand.

---

## 2. Project Structure Rules

### Route Groups (App Router)

Use Next.js route groups to organize pages by role. This keeps layouts, guards, and middleware scoped correctly:

```
app/
  (auth)/           → /login, /register, /forgot-password, /auth/callback
  (guest)/          → /courts, /courts/[id]
  (customer)/       → /dashboard, /invoices, /invoices/[id]
  (admin)/          → /admin, /admin/users, /admin/courts
  api/              → Route handlers
```

### Component Organization

```
components/
  ui/               → Primitive, single-responsibility (Button, Card, Badge, Input, Modal)
  forms/            → Form components (ReservationForm, FacilityForm)
  layout/           → Navbar, Sidebar, Footer, PageShell
  features/         → Feature composites (CourtCard, AvailabilityCalendar, BookingList)
```

**Rules:**
- `ui/` components must have zero business logic. They accept props only.
- `features/` components may call Supabase directly (server components) or use hooks (client components).
- Never import `features/` components into `ui/` components.

### Library Organization

```
lib/
  db/
    index.ts        → Drizzle client instance — import `db` from here for all queries
    schema.ts       → Drizzle table definitions — the TS source of truth for all DB types
    migrations/     → Auto-generated SQL (do not edit manually)
  supabase/
    client.ts       → createBrowserClient() — Auth state, Realtime, Storage in client components
    server.ts       → createServerClient() — Auth session verification in RSC and Route Handlers
  payment/
    index.ts        → PaymentService interface + factory
    mock.ts         → Mock implementation (Phase 1)
  utils.ts          → Pure utility functions (formatting, validation helpers)
```

---

## 3. TypeScript Rules

```typescript
// ✅ GOOD — infer types directly from Drizzle schema (zero-maintenance)
import { db } from '@/lib/db'
import { invoice } from '@/lib/db/schema'
import type { InferSelectModel } from 'drizzle-orm'

type Invoice = InferSelectModel<typeof invoice>

// ❌ BAD — never use `any`
const data: any = await db.select().from(invoice)

// ✅ GOOD — use `unknown` then narrow
async function fetchData(): Promise<unknown> { ... }

// ✅ GOOD — composed types from Drizzle schema
import { court, courtItem, item } from '@/lib/db/schema'
type CourtWithItems = InferSelectModel<typeof court> & {
  items: InferSelectModel<typeof item>[]
}

// ✅ GOOD — use discriminated unions for status types
type InvoiceStatus = 'pending' | 'confirmed' | 'cancelled' | 'no_show'
```

**Strict mode** is enabled in `tsconfig.json`. Do not disable it.

---

## 4. React Component Rules

### Server vs Client Components

```typescript
// Default: Server Component — NO 'use client' directive
// Can: async/await, use Drizzle, verify auth session
import { db } from '@/lib/db'
import { court } from '@/lib/db/schema'

export default async function CourtList() {
  const courts = await db.select().from(court)
  return <ul>{courts.map(c => <CourtCard key={c.id} court={c} />)}</ul>
}

// Client Component — required ONLY for: useState, useEffect, event handlers, browser APIs
'use client'
export function BookingCalendar({ courtId }: { courtId: string }) {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  // ...
}
```

### Naming Conventions

| Type | Convention | Example |
|---|---|---|
| Component files | PascalCase | `CourtCard.tsx` |
| Hook files | camelCase, `use` prefix | `useAvailability.ts` |
| Utility files | camelCase | `formatCurrency.ts` |
| Type files | camelCase | `database.ts` |
| Route handler files | `route.ts` | `app/api/reservations/route.ts` |
| Constants | `UPPER_SNAKE_CASE` | `MAX_BOOKING_HOURS = 8` |

### Props Pattern

```typescript
// ✅ GOOD — explicit prop type, not inline
type CourtCardProps = {
  court: CourtWithFacility
  onSelect?: (courtId: string) => void
}

export function CourtCard({ court, onSelect }: CourtCardProps) { ... }
```

---

## 5a. Drizzle ORM Rules (Database Queries)

Drizzle is used for **all database queries** in server-side code (RSC, Route Handlers, Server Actions).

### Importing the DB client

```typescript
// ✅ ALWAYS import from the wrapper — never call drizzle() directly in a component
import { db } from '@/lib/db'
import { court, invoice, reviews } from '@/lib/db/schema'
```

### Query patterns

```typescript
// ✅ SELECT
const courts = await db.select().from(court)

// ✅ SELECT with WHERE
import { eq } from 'drizzle-orm'
const userInvoices = await db.select().from(invoice).where(eq(invoice.userId, userId))

// ✅ INSERT — returns the inserted row
const [newInvoice] = await db.insert(invoice).values({
  userId,
  courtId,
  paymentMethod: 'Credit Card',
  paymentTotal: 500,
  startAt: new Date(start_at),
  endAt: new Date(end_at),
  status: 'pending',
}).returning()

// ✅ UPDATE
await db.update(invoice)
  .set({ status: 'confirmed' })
  .where(eq(invoice.id, invoiceId))

// ✅ DELETE
await db.delete(reviews).where(eq(reviews.id, reviewId))
```

### Error handling

```typescript
// ✅ GOOD — wrap Drizzle calls in try/catch in Route Handlers
try {
  const [created] = await db.insert(invoice).values(payload).returning()
  return Response.json(created, { status: 201 })
} catch (err) {
  console.error('[POST /api/invoices]', err)
  return Response.json({ error: 'Database error', code: 'INTERNAL_ERROR' }, { status: 500 })
}
```

### Schema changes

```bash
# After editing lib/db/schema.ts:
npx drizzle-kit generate   # generates a new migration file
npx drizzle-kit migrate    # applies it to the DB
```

Never edit files in `lib/db/migrations/` manually.

---

## 5b. Supabase Usage Rules (Auth, Storage, Realtime)

The Supabase JS client is used **only** for Auth, Storage, and Realtime. Do not use it for database queries.

### Auth — server side (RSC, Route Handler)

```typescript
import { createServerClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    return Response.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })
  }
  // now use Drizzle for DB queries
}
```

### Auth — client side (Client Component, hook)

```typescript
'use client'
import { createBrowserClient } from '@/lib/supabase/client'

export function useCurrentUser() {
  const supabase = createBrowserClient()
  // supabase.auth.getUser(), supabase.auth.onAuthStateChange(), etc.
}
```

### Realtime subscriptions

```typescript
// ✅ GOOD — always clean up the channel
useEffect(() => {
  const supabase = createBrowserClient()
  const channel = supabase
    .channel('invoice-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'invoice' }, handleChange)
    .subscribe()
  return () => { supabase.removeChannel(channel) }
}, [])
```

---

## 6. Styling Rules (Tailwind CSS v4)

- **Mobile-first always.** Write base styles for mobile, use `md:`, `lg:` for larger screens.
- **No magic numbers.** Use Tailwind tokens (`p-4`, not `p-[17px]`).
- **No inline `style` props** unless absolutely necessary (e.g., dynamic CSS variables).
- **Class ordering:** Layout → Spacing → Sizing → Typography → Color → Effects → State → Responsive.
- **Dark mode:** Use `dark:` variants. The site supports system dark mode.

```tsx
// ✅ GOOD — ordered, readable
<button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 dark:bg-green-500 md:px-6">

// ❌ BAD — random order, magic number
<button className="bg-green-600 text-white rounded-lg p-[9px] hover:bg-green-700 flex gap-2 items-center text-sm font-medium">
```

---

## 7. File & Folder Naming

| Type | Convention |
|---|---|
| Directories | `kebab-case` |
| React component files | `PascalCase.tsx` |
| Non-component `.ts` files | `camelCase.ts` |
| Next.js special files | lowercase (`layout.tsx`, `page.tsx`, `loading.tsx`, `error.tsx`, `route.ts`) |
| Test files | `*.test.ts` or `*.spec.ts` co-located with the source file |

---

## 8. Imports

- Use absolute imports via the `@/` alias (configured in `tsconfig.json`).
- Group imports: 1) React/Next, 2) Third-party, 3) Internal `@/`, 4) Relative `./`.
- No barrel files (`index.ts` re-exports) unless there are >5 exports from a directory.

```typescript
// ✅ GOOD
import { useState } from 'react'
import postgres from 'postgres'
import { db } from '@/lib/db'
import type { InferSelectModel } from 'drizzle-orm'
import { court } from '@/lib/db/schema'
import { CourtCard } from './CourtCard'
```

---

## 9. Git Conventions

| Type | Prefix | Example |
|---|---|---|
| New feature | `feat:` | `feat: add court reservation form` |
| Bug fix | `fix:` | `fix: prevent double-booking on concurrent requests` |
| Docs | `docs:` | `docs: update API_SPEC with payment webhook` |
| Refactor | `refactor:` | `refactor: extract PaymentService interface` |
| Chore | `chore:` | `chore: update dependencies` |
| Style | `style:` | `style: reorder Tailwind classes in CourtCard` |

**Branch naming:** `feat/court-reservation`, `fix/double-booking`, `docs/api-spec`

---

## 10. Forbidden Patterns

| Pattern | Why | Alternative |
|---|---|---|
| `any` type | Bypasses TypeScript | `unknown` + type narrowing |
| Hardcoded credentials | Security | Environment variables |
| `supabase.from('table').select()` for DB queries | Drizzle is the DB layer | `db.select().from(table)` via Drizzle |
| Calling `drizzle()` directly in a component | Bypass wrapper | Import `db` from `@/lib/db` |
| `useEffect` for data fetching | React anti-pattern | Server Components or `use` hook |
| `.env` committed to git | Security | `.env.local` (gitignored) |
| Payment SDK called outside `PaymentService` | Tight coupling | `lib/payment/index.ts` interface |
| Editing files in `lib/db/migrations/` | Breaks migration history | Run `drizzle-kit generate` instead |
| `console.log` in production code | Noise | `console.error` for errors only; remove debug logs before commit |
