---
name: self-review
description: >
  Quality gate an agent runs on its own output before declaring a task done.
  Checks the produced code against CODING_STANDARDS.md, API_SPEC.md, and the
  Definition of Done in AGENT_PLAYBOOK.md. Catches type errors, forbidden
  patterns, missing tests, and incomplete doc updates before the human sees
  the result. Use after finishing any coding task, or when the user says
  "review your work", "check what you built", "self-review", "/self-review",
  or "are you done?" Always run before code-documenter.
argument-hint: "[files or feature-slug to review]"
license: MIT
---

# Self Review

You are the agent's internal critic. You review your own work the same way
a senior engineer reviews a PR: not to find blame, but to find the bugs,
the missing edge cases, and the standards violations before they ship.

The goal is not perfection — it is not shipping a known defect.

---

## When to Activate

Run self-review after every coding task, before:
- Telling the user the task is done
- Running `code-documenter`
- Committing via `git-workflow`

---

## Review Protocol

Work through each gate in order. A single ❌ means the task is NOT done.
Fix the issue and re-run the gate before continuing.

---

### Gate 1 — Definition of Done (AGENT_PLAYBOOK.md § 10)

For each item in the Definition of Done, answer yes or no:

- [ ] All acceptance criteria from `FEATURES.md` F-XX are satisfied
- [ ] `npm run build` passes (no TypeScript errors)
- [ ] `npm run lint` passes (no ESLint errors)
- [ ] Tests written and passing (`npm run test`)
- [ ] No `console.log` debug statements left in code
- [ ] No hardcoded credentials or magic strings
- [ ] New env variables documented in `ARCHITECTURE.md` § 9
- [ ] `lib/db/schema.ts` changes have a generated migration committed
- [ ] `DATA_MODELS.md` updated if schema changed
- [ ] `API_SPEC.md` updated if Route Handlers created or changed

---

### Gate 2 — TypeScript Gate

```bash
cd client && npx tsc --noEmit
```

- ✅ 0 errors → pass
- ❌ Any error → fix before declaring done. Do not suppress with `@ts-ignore`
  or `any` casts

---

### Gate 3 — Forbidden Patterns (CODING_STANDARDS.md § 10)

Scan every file you modified or created for these patterns:

| Pattern | How to find it | Fix |
|---|---|---|
| `any` type | `grep -n ": any"` in your files | `unknown` + narrowing |
| `console.log` | `grep -n "console.log"` | Remove or use `console.error` |
| Hardcoded secret | Look for URL strings, key strings | Move to env var |
| `supabase.from(` for DB query | `grep -n "supabase.from("` | Replace with Drizzle |
| `drizzle(` called directly | `grep -n "drizzle("` | Import `db` from `@/lib/db` |
| `.env` file committed | Check git status | Use `.env.local` |
| Migration files edited | Check `lib/db/migrations/` diffs | Re-generate instead |

---

### Gate 4 — API Contract Compliance

For every Route Handler created or modified, verify:

- Request body shape matches `docs/API_SPEC.md`
- Response shape matches `docs/API_SPEC.md`
- Error responses use the standard format: `{ error, code }` with correct HTTP codes
- Auth check runs before any DB operation
- Role check runs before any role-restricted operation
- No DB operation is called outside a `try/catch`

---

### Gate 5 — Data Model Compliance

For every Drizzle query:

- Table names match `client/lib/db/schema.ts` exactly
- Column names match `client/lib/db/schema.ts` exactly
- `eq`, `and`, `or` operators imported from `drizzle-orm` (not written as raw strings)
- `insert().values().returning()` used when the inserted row is needed

---

### Gate 6 — React Component Rules

For every component created or modified:

- Is it a Server Component by default? (no `'use client'` unless needed)
- Does it use Drizzle for data fetching (not `supabase.from()` in RSC)?
- Are props typed explicitly (no inline anonymous types for complex shapes)?
- Are Tailwind classes ordered: Layout → Spacing → Sizing → Typography → Color → Effects → State → Responsive?
- No `style={{ }}` prop unless for a CSS variable

---

### Gate 7 — Test Coverage

For every new function, hook, or Route Handler:

- Is there at least one unit or integration test?
- Does the test cover the happy path?
- Does the test cover at least one error/invalid-input case?
- Are test files co-located with the source file?

---

## Output Format

```
═══════════════════════════════════════
SELF-REVIEW: [feature or task name]
───────────────────────────────────────
Gate 1 — Definition of Done : ✅ all checks pass
Gate 2 — TypeScript         : ✅ 0 errors
Gate 3 — Forbidden patterns  : ✅ none found
Gate 4 — API compliance      : ✅ matches API_SPEC.md
Gate 5 — Data model          : ✅ schema names verified
Gate 6 — React components    : ✅ 2 components reviewed
Gate 7 — Test coverage       : ⚠️ DELETE handler has no test
───────────────────────────────────────
Status: ⚠️ FIX REQUIRED
Issues: 1
  → Add test for DELETE /api/reviews/[id] in reviews/[id]/route.test.ts
═══════════════════════════════════════
```

After all gates pass:

```
═══════════════════════════════════════
SELF-REVIEW: [feature or task name]
───────────────────────────────────────
All 7 gates: ✅ PASSED
───────────────────────────────────────
Status: ✅ READY — run code-documenter, then git-workflow
═══════════════════════════════════════
```

---

## Hard Stops

These issues block completion unconditionally — they are not warnings:

- TypeScript build errors in files you wrote
- `any` type introduced by you
- Auth check missing on a protected route
- A table or column name used that does not exist in the Drizzle schema
- A hardcoded credential or secret in any file
