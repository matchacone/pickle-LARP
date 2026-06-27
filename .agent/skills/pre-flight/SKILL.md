---
name: pre-flight
description: >
  Validates the development environment before writing any code. Checks that
  required environment variables exist, key dependencies are installed, the
  database connection is reachable, and the dev server can start. Surfaces
  problems before they cause mid-task failures. Use when starting a new
  coding session, setting up on a new machine, before running migrations,
  or when the user says "check my setup", "is the env ready", "pre-flight",
  or "/pre-flight". Run after context-loader and before task-planner or
  coding.
argument-hint: "[scope: env|deps|db|all]"
license: MIT
---

# Pre-Flight Check

You are the agent's launch controller. No code until the runway is clear.
A missing environment variable discovered mid-task costs far more than the
60 seconds this check takes.

---

## Checklist

Run these checks in order. Stop and report any failure immediately — do not
continue past a critical failure.

---

### 1. Environment Variables

Read `docs/ARCHITECTURE.md` § 9 for the full list of required variables.
Then verify `client/.env.local` contains all of them with non-empty values.

**Required variables:**

| Variable | Scope | Critical |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Public | ✅ Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | ✅ Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | ✅ Yes |
| `DATABASE_URL` | Server only (Drizzle) | ✅ Yes |

**Check protocol:**
- Verify the file exists at `client/.env.local`
- Verify each key is present and has a non-empty value
- Do NOT read or print the actual values — only confirm they exist
- Flag any key as `MISSING` or `EMPTY`

**Failure action:** If any critical variable is missing, stop. Output:
```
❌ PRE-FLIGHT FAILED
Missing: DATABASE_URL
Action: Add DATABASE_URL to client/.env.local (see ARCHITECTURE.md § 9)
```

---

### 2. Dependencies

Check `client/package.json` for required packages.

**Required in `dependencies`:**
- `next` (16.x)
- `react`, `react-dom` (19.x)
- `drizzle-orm`
- `postgres`
- `@supabase/supabase-js`
- `@supabase/ssr`

**Required in `devDependencies`:**
- `drizzle-kit`
- `typescript`
- `eslint`

**Check protocol:**
- Read `client/package.json`
- Report any missing package as `NOT INSTALLED`
- Report any installed package whose major version mismatches the spec

**Failure action:** If a required package is missing:
```
❌ PRE-FLIGHT FAILED
Missing package: drizzle-orm
Action: Run `npm install drizzle-orm postgres` from client/
```

---

### 3. Drizzle Configuration

Verify the Drizzle setup files exist:

| File | Required |
|---|---|
| `client/drizzle.config.ts` | ✅ |
| `client/lib/db/index.ts` | ✅ |
| `client/lib/db/schema.ts` | ✅ |

**Check protocol:**
- Confirm each file exists (do not validate contents unless debugging)
- If `client/lib/db/migrations/` exists, note the count of migration files

**Failure action:** If setup files are missing:
```
⚠️ PRE-FLIGHT WARNING
Missing: client/lib/db/schema.ts
Action: Drizzle schema not initialized. Run schema-sync skill or create manually.
```

---

### 4. Supabase Client Setup

Verify the Supabase client wrappers exist:

| File | Required |
|---|---|
| `client/lib/supabase/client.ts` | ✅ |
| `client/lib/supabase/server.ts` | ✅ |

---

### 5. TypeScript Integrity (if `tsc` is available)

If the task involves TypeScript changes, verify no pre-existing type errors:

```bash
cd client && npx tsc --noEmit
```

Report the result:
- `✅ 0 TypeScript errors` → proceed
- `⚠️ N errors found` → list the files with errors; do not proceed if errors
  are in files you plan to modify

---

## Output Format

Always end with a summary card:

```
═══════════════════════════════
PRE-FLIGHT SUMMARY
───────────────────────────────
Environment vars : ✅ all present
Dependencies     : ✅ all installed
Drizzle setup    : ✅ ready (3 migrations)
Supabase clients : ✅ ready
TypeScript       : ✅ 0 errors
───────────────────────────────
Status: ✅ CLEAR FOR TAKEOFF
═══════════════════════════════
```

Or if failures:
```
═══════════════════════════════
PRE-FLIGHT SUMMARY
───────────────────────────────
Environment vars : ❌ DATABASE_URL missing
Dependencies     : ✅ all installed
Drizzle setup    : ⚠️ schema.ts missing
Supabase clients : ✅ ready
TypeScript       : ✅ 0 errors
───────────────────────────────
Status: ❌ BLOCKED — fix failures before coding
═══════════════════════════════
```

---

## Scope Arguments

| Scope | What it checks |
|---|---|
| `env` | Environment variables only |
| `deps` | package.json dependencies only |
| `db` | Drizzle files + DATABASE_URL only |
| `all` | Full checklist (default) |
