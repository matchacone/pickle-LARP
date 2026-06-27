# AGENT_PLAYBOOK.md — Pickle All AI Agent Instructions

> **This is the primary instruction file for all AI coding agents working on this repository.**  
> Read this file completely before writing any code. Failure to follow these rules will produce incorrect, inconsistent, or insecure output.

---

## 0. Before You Write Any Code

Use the **skill sequence** below. These skills automate the pre-coding checks:

```
context-loader → task-planner → pre-flight → [code] → self-review → code-documenter → git-workflow
```

**Minimum manual checklist (if not using skills):**

- [ ] Read `client/AGENTS.md` — breaking API changes in this Next.js version.
- [ ] Check `docs/agent-logs/INDEX.md` — scan for logs on files you plan to touch.
- [ ] Read `docs/ARCHITECTURE.md` — tech stack, project structure, env vars.
- [ ] Read `docs/DATA_MODELS.md` — entity names and column types before any DB work.
- [ ] Read `docs/CODING_STANDARDS.md` — all code must comply.
- [ ] Read `docs/API_SPEC.md` — if working on a Route Handler.
- [ ] Read `docs/FEATURES.md` — read the F-XX acceptance criteria for your task.

---

## 1. Scope and Authority

| You CAN | You CANNOT |
|---|---|
| Implement features from `FEATURES.md` | Invent table or column names not in `DATA_MODELS.md` |
| Create new components under the defined structure | Install new npm packages without noting it |
| Write Route Handlers per `API_SPEC.md` | Hardcode secrets, credentials, or API keys |
| Refactor code to comply with `CODING_STANDARDS.md` | Disable TypeScript strict mode or ESLint rules |
| Write tests per `TESTING_STRATEGY.md` | Use `any` types |
| Ask for clarification in a comment | Guess at business logic — always reference `FEATURES.md` |

---

## 2. Task Intake Protocol

When given a task, run the skills in this order:

1. **`context-loader`** — load exactly the right docs for this task type.
2. **`task-planner`** — if multi-file or multi-layer, decompose into a checklist before writing code.
3. **`pre-flight`** — verify env vars, dependencies, and Drizzle setup.
4. **Write the code.** Follow `CODING_STANDARDS.md`. Use `schema-sync` if the schema changes. Use `debug-trace` if errors appear.
5. **`self-review`** — run all 7 gates before declaring done.
6. **`code-documenter`** — log what was built to `docs/agent-logs/`.
7. **`git-workflow`** — commit with correct prefix, branch, and PR description.
8. **State what you have NOT done** — out-of-scope items, deferred decisions.

---

## 3. File Creation Rules

### When Creating a New Page

```
client/app/(group)/route-name/page.tsx     ← Page component (RSC by default)
client/app/(group)/route-name/loading.tsx  ← Skeleton/loading state
client/app/(group)/route-name/error.tsx    ← Error boundary
```

Use the route group that matches the user role required:
- `(guest)` — unauthenticated access
- `(customer)` — authenticated users (role = 'user')
- `(admin)` — admin users (role = 'admin')
- `(auth)` — login/register flows

### When Creating a New Component

```
client/components/features/MyFeature.tsx       ← Feature-level composite
client/components/features/MyFeature.test.tsx  ← Co-located test
```

If the component is a primitive (no business logic), put it in `ui/` instead.

### When Creating a Route Handler

```
client/app/api/resource/route.ts       ← GET, POST handlers
client/app/api/resource/[id]/route.ts  ← PATCH, DELETE handlers with dynamic segment
```

Every Route Handler must:
1. Verify session with `createServerClient()` before any DB operation.
2. Check role if the endpoint is role-restricted.
3. Validate request body before processing.
4. Return structured errors in the format defined in `API_SPEC.md`.

---

## 4. Database and Auth Patterns

### Rule: Drizzle for DB, Supabase JS for Auth/Realtime

| Use case | Use |
|---|---|
| SELECT, INSERT, UPDATE, DELETE | Drizzle (`db` from `@/lib/db`) |
| Verify user session | Supabase JS server client (`supabase.auth.getUser()`) |
| Client-side auth state | Supabase JS browser client |
| Realtime subscriptions | Supabase JS browser client |
| File uploads/downloads | Supabase Storage |

### Route Handler — full pattern

```typescript
import { db } from '@/lib/db'
import { profiles, invoice } from '@/lib/db/schema'
import { createServerClient } from '@/lib/supabase/server'
import { eq } from 'drizzle-orm'

export async function POST(req: Request) {
  // Step 1: Verify auth via Supabase
  const supabase = createServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return Response.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })
  }

  // Step 2: Check role via Drizzle
  const [profile] = await db.select({ role: profiles.role })
    .from(profiles)
    .where(eq(profiles.id, user.id))

  if (profile?.role !== 'admin') {
    return Response.json({ error: 'Forbidden', code: 'FORBIDDEN' }, { status: 403 })
  }

  // Step 3: Business logic via Drizzle
  try {
    const body = await req.json()
    const [created] = await db.insert(invoice).values(body).returning()
    return Response.json(created, { status: 201 })
  } catch (err) {
    console.error('[POST /api/invoices]', err)
    return Response.json({ error: 'Database error', code: 'INTERNAL_ERROR' }, { status: 500 })
  }
}
```

### RSC — server component fetching data

```typescript
import { db } from '@/lib/db'
import { court } from '@/lib/db/schema'

export default async function CourtsPage() {
  const courts = await db.select().from(court)
  return <CourtList courts={courts} />
}
```

---

## 5. Date/Time Handling Rules

- **All times stored in UTC** in the database (`timestamptz`).
- **All times displayed in `Asia/Manila` (UTC+8)** in the UI.
- Use `Intl.DateTimeFormat` with `timeZone: 'Asia/Manila'` for display.
- Never use `new Date().toLocaleDateString()` — it uses the client's system timezone.

```typescript
// ✅ GOOD
const formatted = new Intl.DateTimeFormat('en-PH', {
  timeZone: 'Asia/Manila',
  dateStyle: 'medium',
  timeStyle: 'short',
}).format(new Date(reservation.start_at))

// ❌ BAD
const formatted = new Date(reservation.start_at).toLocaleDateString()
```

---

## 6. Payment Service Pattern

The payment provider is abstract. **Never call a payment SDK directly** from a Route Handler or component. Always use the service interface:

```typescript
// lib/payment/index.ts — the interface
export interface PaymentService {
  initiatePayment(params: {
    invoiceId: string
    amount: number
    currency: 'PHP'
  }): Promise<{ checkoutUrl: string; providerPaymentId: string }>

  verifyWebhook(payload: unknown, signature: string): Promise<{
    invoiceId: string
    status: 'paid' | 'failed'
  }>
}
```

```typescript
// lib/payment/mock.ts — Phase 1 implementation
export const mockPaymentService: PaymentService = {
  async initiatePayment({ reservationId, amount }) {
    return {
      checkoutUrl: `/mock-payment?reservation=${reservationId}&amount=${amount}`,
      providerPaymentId: `mock_${Date.now()}`,
    }
  },
  async verifyWebhook(payload) {
    // For demo: always return paid
    return { reservationId: (payload as any).reservationId, status: 'paid' }
  },
}
```

---

## 7. Realtime Subscription Pattern

Use this pattern for any client component that needs live DB updates. **Initial data fetch uses Drizzle via a server action or server component prop; the Realtime subscription triggers a re-fetch or state update.**

```typescript
'use client'
import { useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import type { InferSelectModel } from 'drizzle-orm'
import type { invoice } from '@/lib/db/schema'

type Invoice = InferSelectModel<typeof invoice>

// invoices are passed as initial props from a Server Component (fetched via Drizzle)
export function InvoiceList({ initialInvoices, courtId }: { initialInvoices: Invoice[]; courtId: string }) {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices)

  useEffect(() => {
    const supabase = createBrowserClient()
    const channel = supabase
      .channel(`court-invoices-${courtId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'invoice', filter: `court_id=eq.${courtId}` },
        async () => {
          // Re-fetch via a server action or API call that uses Drizzle
          const res = await fetch(`/api/courts/${courtId}/invoices`)
          const data = await res.json()
          setInvoices(data)
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [courtId])

  return <ul>{invoices.map(inv => <InvoiceCard key={inv.id} invoice={inv} />)}</ul>
}
```

---

## 8. Error Response Pattern (Route Handlers)

```typescript
// Always use this shape
return Response.json(
  { error: 'Human message', code: 'MACHINE_CODE' },
  { status: 422 }
)

// Error codes to use:
// UNAUTHORIZED    → 401 (no session)
// FORBIDDEN       → 403 (wrong role)
// NOT_FOUND       → 404
// INVALID_INPUT   → 422 (validation failed)
// CONFLICT        → 409 (double-booking, duplicate)
// INTERNAL_ERROR  → 500 (unexpected)
```

---

## 9. What to Do When Blocked

If you encounter a situation where:

- A table or column is not defined in `DATA_MODELS.md`
- An endpoint is not in `API_SPEC.md`
- A business rule is ambiguous in `FEATURES.md`
- You need to install a new dependency

**STOP. Do not guess.** Add a `// TODO: [AGENT_BLOCKED] — reason here` comment at the exact location in the code and document the blocker clearly. Do not invent solutions to underspecified requirements.

---

## 10. Definition of Done

A task is complete when:

- [ ] All acceptance criteria in `FEATURES.md` are satisfied.
- [ ] All TypeScript errors are resolved (`npm run build` passes).
- [ ] ESLint passes (`npm run lint`).
- [ ] Unit/component tests are written and passing.
- [ ] No `console.log` debug statements are left in the code.
- [ ] No hardcoded credentials or magic strings.
- [ ] Any new environment variables are documented in `ARCHITECTURE.md` section 9.
- [ ] If `lib/db/schema.ts` was changed, `npx drizzle-kit generate` was run and the migration file is committed.
- [ ] `DATA_MODELS.md` is updated if new columns or tables were added to the schema.
- [ ] `API_SPEC.md` is updated if new Route Handlers were created.

---

## 11. Skills Index

All skills live in `.agent/skills/<name>/SKILL.md`. Invoke by name or trigger phrase.

### Essential Skills (core workflow)

| Skill | When to use | Trigger phrases |
|---|---|---|
| `context-loader` | First — before any task | "load context", "what should I read", `/context-loader` |
| `task-planner` | Second — multi-file or multi-layer tasks | "plan this", "break this down", `/task-planner` |
| `pre-flight` | Third — before writing code | "check my setup", "is env ready", `/pre-flight` |
| `self-review` | After coding — quality gate | "review your work", "are you done?", `/self-review` |
| `code-documenter` | After self-review passes | "document this", "log what I built", `/code-documenter` |
| `git-workflow` | After code-documenter | "commit this", "make a branch", `/git-workflow` |
| `schema-sync` | Whenever schema.md changes | "update the schema", "I changed the DB", `/schema-sync` |
| `debug-trace` | On any error or unexpected behavior | "this is broken", "debug this", `/debug-trace` |

### Code Quality Skills (optional, on-demand)

| Skill | When to use | Trigger phrases |
|---|---|---|
| `ponytail` | Simplify — avoid over-engineering | "be lazy", "simplest solution", `/ponytail` |
| `ponytail-review` | Review a diff for over-engineering | "review for over-engineering", `/ponytail-review` |
| `ponytail-audit` | Full codebase complexity audit | "audit this codebase", `/ponytail-audit` |
| `ponytail-debt` | List all deferred shortcuts | "what did ponytail defer", `/ponytail-debt` |

### Standard Execution Order

```
New session:
  context-loader → pre-flight → [work] → self-review → code-documenter → git-workflow

Schema change:
  schema-sync → context-loader (db) → pre-flight (db) → [code] → self-review → code-documenter → git-workflow

Error encountered:
  debug-trace → [fix] → self-review (re-run) → git-workflow

Complex feature:
  context-loader → task-planner → pre-flight → [step-by-step code] → self-review → code-documenter → git-workflow
```
