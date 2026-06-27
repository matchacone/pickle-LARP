---
name: debug-trace
description: >
  Systematic error debugging protocol. Given an error message, stack trace,
  or unexpected behavior, traces it to its root cause using a structured
  read-before-fix approach. Prevents the most common agent debugging failure:
  patching the symptom instead of the cause. Use when the user says "this
  is broken", "I'm getting an error", "why isn't this working", "debug this",
  "fix this error", or "/debug-trace". Also activates automatically when a
  build or test command produces an error output.
argument-hint: "[error message or file:line]"
license: MIT
---

# Debug Trace

You are the agent's debugger. You do not guess. You do not try random fixes.
You read the error, trace the call chain, identify the root cause, and apply
the smallest correct fix at the origin — not at the symptom.

The most expensive debugging mistake: fixing the last line of the stack trace
instead of the first line that went wrong.

---

## Protocol

### Phase 1 — Read the Error

Before touching any file, extract:

1. **Error type and message** — what category of error is this?
2. **File and line number** — where did it surface?
3. **Stack trace** — what called what?
4. **Context** — when does it happen? (build time, runtime, test, specific
   user action)

Classify the error:

| Class | Examples |
|---|---|
| `type-error` | TypeScript compile errors, wrong type passed |
| `runtime` | Uncaught exception, unhandled rejection |
| `db-error` | Drizzle query failure, constraint violation, connection error |
| `auth-error` | 401/403 from Supabase, missing session |
| `network` | fetch failure, CORS, wrong URL |
| `env-error` | Missing env var, wrong value |
| `test-failure` | Assertion failure, mock not called |
| `build-error` | Next.js build failure, module not found |

---

### Phase 2 — Trace the Root

Walk up the stack from the error site to the origin.

**Read each file in the stack trace**, not just the one with the error
message. The error surface is often not the root cause.

Use this reasoning chain:
1. What function threw / what assertion failed?
2. What called that function? With what arguments?
3. Were those arguments valid? Where did they come from?
4. Keep tracing until you find the first point where the data or state
   went wrong.

**For each error class, start here:**

| Class | First place to look |
|---|---|
| `type-error` | The type definition in `lib/db/schema.ts` or `types/` |
| `db-error` | The Drizzle query — compare column names to `schema.ts` |
| `auth-error` | The Route Handler auth check — is `supabase.auth.getUser()` called first? |
| `env-error` | `client/.env.local` — is the variable present? |
| `test-failure` | The test fixture — does mock data match the actual schema? |
| `build-error` | The import paths — does the module exist at that path? |
| `runtime` | The null/undefined access — where was the value expected to be set? |

---

### Phase 3 — State the Root Cause

Before writing a fix, write one sentence:

> "The root cause is: [specific condition] at [specific location], because
> [why it happened]."

If you cannot write this sentence, you have not finished Phase 2.
Go back and read more.

Examples of good root-cause statements:
- "The root cause is: `invoice.userId` is `undefined` in `POST /api/invoices/route.ts:42`, because the Drizzle insert maps `user_id` but the schema column is named `userId` (camelCase)."
- "The root cause is: `DATABASE_URL` is missing from `.env.local`, which causes `drizzle()` to throw at startup."
- "The root cause is: the `reviews` table references `court.id` but the Drizzle schema defines the PK as `courtId`, causing a foreign key mismatch."

---

### Phase 4 — Apply the Fix

Apply the fix at the root cause location. Not at the call site. Not with
a try/catch wrapper that swallows the error.

**Fix sizing rule:** The fix should be smaller than the root cause statement.
If your fix is larger than 10 lines, you are likely fixing a symptom.

**For common patterns:**

#### Drizzle column name mismatch
```typescript
// ❌ Wrong — using SQL name in JS
.where(eq(invoice.user_id, userId))

// ✅ Correct — using the camelCase JS property name
.where(eq(invoice.userId, userId))
```

#### Missing auth check
```typescript
// ✅ Always first in a Route Handler
const { data: { user }, error } = await supabase.auth.getUser()
if (error || !user) return Response.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })
```

#### Env var missing
- Add the variable to `client/.env.local`
- Document it in `docs/ARCHITECTURE.md` § 9 if it's new

#### Type error from `any` usage
- Find where `any` was used (or inferred)
- Replace with the correct Drizzle inferred type: `InferSelectModel<typeof table>`

#### Constraint violation (duplicate key)
- Check the unique constraint in `lib/db/schema.ts`
- Return `409 CONFLICT` from the Route Handler with code `CONFLICT`
- Do not catch the DB error silently

---

### Phase 5 — Verify the Fix

After applying the fix:

1. Re-run the failing command (build, test, or the specific action)
2. Confirm the error is gone
3. Confirm no new errors were introduced
4. If it was a test failure — run all tests in the affected file, not just
   the failing one

---

## Output Format

```
DEBUG TRACE: [error message or description]
────────────────────────────────────────────
Error class   : db-error
Error site    : client/app/api/invoices/route.ts:42
Stack         : POST handler → db.insert(invoice) → postgres error

Phase 2 trace:
  route.ts:42   → db.insert(invoice).values({ user_id: userId })
  schema.ts:18  → userId: uuid('user_id') ← JS prop is `userId`, not `user_id`

Root cause    : Column referenced as `user_id` in insert values object,
                but Drizzle JS property is `userId` (camelCase mapping)

Fix           : route.ts:42 — change `user_id` to `userId` in values object

Verified      : ✅ build passes, test passes
────────────────────────────────────────────
```

---

## What NOT to Do

| Don't | Why |
|---|---|
| Add a `try/catch` that swallows the error | Hides the bug, breaks observability |
| Change the type to `any` to silence TypeScript | Masks the real type mismatch |
| Add `!` non-null assertion without tracing why it's null | Moves the crash, doesn't fix it |
| Fix the caller before checking all callers | Sibling callers still broken |
| Apply a fix without running verification | You might have introduced a new bug |
| Patch more than the root cause | Scope creep in a bug fix |
