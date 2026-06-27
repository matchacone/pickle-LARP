---
name: schema-sync
description: >
  Propagates a database schema change through all downstream artifacts that
  must stay consistent: docs/schema.md → docs/DATA_MODELS.md →
  client/lib/db/schema.ts → Drizzle migration → docs/API_SPEC.md (if
  affected). Prevents the silent drift where one file is updated and the
  others become stale, causing type errors and agent confusion. Use whenever
  the database schema changes, or when the user says "update the schema",
  "sync the schema", "I changed the DB", "schema-sync", or "/schema-sync".
  Run before any code that queries the new or changed table.
argument-hint: "[table-name or change description]"
license: MIT
---

# Schema Sync

You are the agent's schema propagation engine. A schema change has
N downstream consumers. This skill ensures all N are updated before
any code is written that touches the changed table.

The most common agent failure mode: update one file, forget the others,
then write a Drizzle query against a column that doesn't exist yet in
`schema.ts`, or reference a table that isn't in `DATA_MODELS.md`.
This skill eliminates that failure mode.

---

## Trigger

Activate whenever:
- A table is added to `docs/schema.md`
- A column is added, removed, or renamed in `docs/schema.md`
- A new table relationship is introduced
- The user says they changed the DB or schema

---

## Artifact Map

Every schema change must propagate through this chain, in order:

```
docs/schema.md                   ← 1. Source of truth (human-edited)
    ↓
docs/DATA_MODELS.md              ← 2. Supabase implementation notes
    ↓
client/lib/db/schema.ts          ← 3. Drizzle table definitions
    ↓
npx drizzle-kit generate         ← 4. Migration file auto-generated
    ↓
docs/API_SPEC.md                 ← 5. Update if route contracts change
    ↓
docs/agent-logs/ (via code-documenter) ← 6. Log the change
```

---

## Step-by-Step Protocol

### Step 1 — Read the Change

Read `docs/schema.md` and identify what changed:
- New table? New columns? Removed columns? Renamed columns? New FK?

State it explicitly:
```
Change detected: Added `reviews` table with columns:
  reviewID (PK), title, description, userID (FK), courtID (FK)
```

### Step 2 — Update `docs/DATA_MODELS.md`

Add or update the relevant table section following the existing format:

```markdown
## Table: `reviews`

**Derived from:** `schema.md → reviews`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `uuid` | PK | Maps from SERIAL reviewID |
| `user_id` | `uuid` | FK → `profiles.id` NOT NULL | |
| `court_id` | `uuid` | FK → `court.id` NOT NULL | |
| `title` | `text` | NULLABLE | |
| `description` | `text` | NOT NULL | |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT now() | |
| `updated_at` | `timestamptz` | NOT NULL, DEFAULT now() | |
```

Apply the Supabase adaptation rules from `DATA_MODELS.md` § "Supabase
Adaptation Notes":
- `SERIAL` → `uuid DEFAULT gen_random_uuid()`
- `INTEGER FK` → `uuid FK`
- `VARCHAR(n)` → `text`
- `DATE` + `TIME` → `timestamptz`

### Step 3 — Update `client/lib/db/schema.ts`

Add or modify the Drizzle table definition. Follow the pattern of existing
tables in that file. Use Drizzle's type-safe helpers:

```typescript
import {
  pgTable, uuid, text, timestamp, numeric, boolean, uniqueIndex
} from 'drizzle-orm/pg-core'

export const reviews = pgTable('reviews', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => profiles.id),
  courtId: uuid('court_id').notNull().references(() => court.id),
  title: text('title'),
  description: text('description').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  // One review per user per court
  uniqueUserCourt: uniqueIndex('reviews_user_court_unique').on(table.userId, table.courtId),
}))
```

**Naming conventions for Drizzle:**
- Table export name: `camelCase` (matches the conceptual entity)
- Table SQL name: `snake_case` string argument
- Column export name: `camelCase`
- Column SQL name: `snake_case` string argument

### Step 4 — Generate the Migration

```bash
cd client && npx drizzle-kit generate
```

Verify:
- A new file appeared in `client/lib/db/migrations/`
- The migration file contains the expected `CREATE TABLE` or `ALTER TABLE`
- The migration does NOT drop data unexpectedly

If the generated SQL looks wrong, stop. Do not apply. Read the Drizzle
schema definition again — the error is there.

### Step 5 — Check API Impact

Scan `docs/API_SPEC.md` for any route that:
- References the changed table by name in its description
- Has a request/response body that includes the changed column

If a route's contract is affected, update `docs/API_SPEC.md` to reflect
the new field or changed behavior.

### Step 6 — Update TypeScript Types (if any custom types exist)

Scan `client/types/` for manually written types that reference the changed
table. Update them. Prefer deleting manual types in favor of
`InferSelectModel<typeof table>` from Drizzle.

### Step 7 — Verify No Broken Queries

Search the codebase for queries against the changed table:

```bash
grep -rn "from(reviews)" client/
grep -rn "from(court)" client/
```

For each hit: verify the column names used still exist in the updated schema.

---

## Output Format

After completing all steps:

```
═══════════════════════════════════════════
SCHEMA SYNC: reviews table added
───────────────────────────────────────────
Step 1 — Change identified   : ✅ new table: reviews (5 columns)
Step 2 — DATA_MODELS.md      : ✅ reviews section added
Step 3 — lib/db/schema.ts    : ✅ reviews table defined
Step 4 — Migration generated : ✅ 20260628_add_reviews.sql
Step 5 — API_SPEC.md         : ✅ no contract changes required
Step 6 — Custom types        : ✅ none to update
Step 7 — Existing queries    : ✅ no broken references found
───────────────────────────────────────────
Status: ✅ SYNC COMPLETE — safe to write queries against reviews
═══════════════════════════════════════════
```

---

## Hard Rules

- **Never manually edit migration files** — re-run `drizzle-kit generate`
- **Never skip Step 2** — `DATA_MODELS.md` must always match `schema.ts`
- **Never write a Drizzle query before Step 4** — the table doesn't exist
  in the DB until the migration is applied
- **Always use `uuid` for PKs**, never `serial` or `integer` in Drizzle
  definitions — see `DATA_MODELS.md` Supabase Adaptation Notes
