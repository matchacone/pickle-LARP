---
name: context-loader
description: >
  Systematically loads the minimum set of project documents an agent needs
  before starting any task. Maps task type to the exact docs to read, in the
  correct order, so agents never start cold or read unnecessary files. Use at
  the start of every session or whenever an agent says "load context",
  "what should I read", "context-load", or "/context-loader". Essential
  first step before task-planner, pre-flight, or any coding work.
argument-hint: "[task-type: db|api|ui|auth|admin|general]"
license: MIT
---

# Context Loader

You are the agent's orientation system. Your job is to load the minimum
context needed for the task at hand — nothing more, nothing less. Reading
unnecessary files wastes tokens and introduces noise. Reading the wrong files
produces hallucinated table names and incorrect patterns.

---

## Step 1 — Identify the Task Type

Classify the incoming task into one or more types:

| Type | Keywords |
|---|---|
| `db` | schema, table, column, migration, Drizzle, query, data model |
| `api` | route handler, endpoint, API, request, response, webhook |
| `ui` | component, page, layout, form, styling, Tailwind, RSC |
| `auth` | login, register, session, role, guard, Supabase Auth |
| `admin` | admin panel, suspend, moderate, manage courts, manage items |
| `test` | test, spec, coverage, Vitest, Playwright |
| `general` | architecture question, standards check, debugging |

---

## Step 2 — Load by Task Type

Read **only** the files listed for the identified type(s). Read them in order.
Stop reading a file once you have the relevant section — do not read entire
files if a section heading suffices.

### `db` — Database / Schema Work
1. `docs/schema.md` — authoritative table definitions
2. `docs/DATA_MODELS.md` — Supabase adaptation notes, column types, constraints
3. `client/lib/db/schema.ts` — actual Drizzle schema (if it exists)
4. `docs/CODING_STANDARDS.md` § 5a — Drizzle query patterns

### `api` — Route Handlers
1. `docs/API_SPEC.md` — contract for the specific route you're building
2. `docs/DATA_MODELS.md` — tables the route reads/writes
3. `docs/CODING_STANDARDS.md` § 5a and § 5b — Drizzle + Supabase Auth patterns
4. `docs/AGENT_PLAYBOOK.md` § 4 — Route Handler full pattern

### `ui` — Components / Pages
1. `docs/FEATURES.md` — acceptance criteria for the feature (F-XX)
2. `docs/CODING_STANDARDS.md` § 4 and § 6 — component rules, Tailwind rules
3. `docs/ARCHITECTURE.md` § 3 — folder structure (which route group to use)

### `auth` — Authentication / Authorization
1. `docs/ARCHITECTURE.md` § 5 — roles and access model
2. `docs/CODING_STANDARDS.md` § 5b — Supabase Auth patterns
3. `docs/AGENT_PLAYBOOK.md` § 4 — full Route Handler auth pattern
4. `docs/DATA_MODELS.md` — `profiles` table

### `admin` — Admin Panel Work
1. `docs/FEATURES.md` — F-11 (Admin Panel)
2. `docs/API_SPEC.md` — admin routes
3. `docs/DATA_MODELS.md` — tables admin manages
4. `docs/ARCHITECTURE.md` § 5 — role model

### `test` — Testing
1. `docs/TESTING_STRATEGY.md` — test types, tooling, examples
2. `docs/CODING_STANDARDS.md` § 3 — TypeScript type patterns for fixtures

### `general` — Architecture / Standards
1. `docs/ARCHITECTURE.md` — full read
2. `docs/CODING_STANDARDS.md` — full read
3. `docs/AGENT_PLAYBOOK.md` — full read

---

## Step 3 — Always Read These First

Before any type-specific reading, always check:

1. `client/AGENTS.md` — breaking API changes in this Next.js version
2. `docs/agent-logs/INDEX.md` — scan for logs touching files you plan to modify

If `agent-logs/INDEX.md` has a relevant entry, read that log file before
reading any other doc. A previous agent may have documented a gotcha that
saves you significant work.

---

## Step 4 — Report What You Loaded

After loading, output a one-line confirmation:

```
Context loaded: [list of files read] → ready for [task type] task.
```

Then proceed directly to the task or hand off to `task-planner`.

---

## What NOT to Load

- Do not read `node_modules/` or any generated files
- Do not read `client/lib/db/migrations/` unless debugging a specific migration
- Do not read `docs/TESTING_STRATEGY.md` unless the task involves tests
- Do not read `docs/ROADMAP.md` or `docs/project_proposal.md` unless asked
- Do not re-read files you already have in context
