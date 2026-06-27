---
name: code-documenter
description: >
  Documents code written by an AI agent into the project's docs folder for
  future agentic work. Creates or updates a dedicated docs/agent-logs/ folder
  with structured markdown files per feature or task. Each log records what
  was built, where files live, key decisions, gotchas, and how to extend the
  work. Use when an agent says "document this", "log what I built", "write
  agent docs", "update agent-logs", or invokes /code-documenter. One-shot
  per task — produces a self-contained log entry, then stops.
argument-hint: "[feature-name]"
license: MIT
---

# Code Documenter

You are writing documentation for **future AI agents**, not humans. The reader
is an agent with no memory of this session. Write what that agent needs to pick
up the work cold, without guessing, without reading every file.

---

## Target Location

All output goes into `docs/agent-logs/`. Create this folder if it does not
exist. One file per feature or task:

```
docs/agent-logs/
  <feature-slug>.md      ← one file per completed feature/task
  INDEX.md               ← running index of all log entries (create or append)
```

`feature-slug` = kebab-case name of what was built. Example: `court-booking-invoice`, `reviews-api`, `drizzle-setup`.

---

## Log File Format

Every `docs/agent-logs/<feature-slug>.md` must follow this exact structure.
Omit sections that are genuinely not applicable — do not fill them with
placeholders.

```markdown
# [Feature Name] — Agent Log

> **Date:** YYYY-MM-DD  
> **Feature ID:** F-XX (from FEATURES.md, if applicable)  
> **Status:** complete | partial | blocked  
> **Built by:** [agent name or "AI agent"]

---

## What Was Built

One paragraph. What the feature does, from the user's perspective. No
implementation details yet — just the outcome.

---

## Files Created or Modified

| File | Action | Purpose |
|---|---|---|
| `path/to/file.ts` | created | What this file does |
| `path/to/other.ts` | modified | What changed and why |

---

## How It Works

Step-by-step flow of the implementation. Trace the data path from trigger to
result. Include:
- Entry point (page, route handler, hook)
- Key function calls and in what order
- DB tables read/written (reference DATA_MODELS.md names)
- Any async or side effects

---

## Key Decisions

Bullet list. Each decision: what was chosen, what was considered, why this
option won. Decisions a future agent might second-guess or accidentally undo.

---

## Drizzle Schema Changes

> Skip this section if no schema changes were made.

List every table or column added/modified. Format:

```typescript
// Paste the relevant Drizzle schema snippet here
```

Command run: `npx drizzle-kit generate` — migration file: `lib/db/migrations/<timestamp>_<name>.sql`

---

## API Routes Added or Changed

> Skip this section if no Route Handlers were touched.

| Method | Path | Change |
|---|---|---|
| POST | `/api/invoices` | Created — see API_SPEC.md |

---

## Environment Variables

> Skip if none added.

| Variable | Location | Purpose |
|---|---|---|
| `VAR_NAME` | `.env.local` | What it does |

---

## Tests Written

| File | What it covers |
|---|---|
| `path/to/feature.test.ts` | Test descriptions |

---

## Known Gaps and Gotchas

Bullet list of:
- Things that are NOT implemented yet (and why)
- Edge cases not handled
- Anything that will break if someone changes X
- Anything a future agent must NOT do here

---

## How to Extend This

Short instructions for a future agent picking up this feature:
- What to read first
- What files to modify for the most common follow-up tasks
- Any commands to run before starting (migrations, type gen, etc.)
```

---

## INDEX.md Format

`docs/agent-logs/INDEX.md` is a running table. Create it on first use,
append a row on every subsequent use. Never rewrite existing rows.

```markdown
# Agent Log Index

| Date | Slug | Feature | Status | Key Files |
|---|---|---|---|---|
| YYYY-MM-DD | `slug` | Feature name | complete | `file1.ts`, `file2.ts` |
```

---

## Rules

1. **Write for a cold agent.** Assume zero session memory. If a future agent
   needs to know it, write it.

2. **Be specific about file paths.** Never write "the invoice file" — write
   `client/app/api/invoices/route.ts`.

3. **Reference the living docs by name.** When something is defined
   elsewhere, say so and name the file:
   - Schema → `DATA_MODELS.md`
   - API contract → `API_SPEC.md`
   - Feature spec → `FEATURES.md` (F-XX)
   - Standards → `CODING_STANDARDS.md`
   - Agent rules → `AGENT_PLAYBOOK.md`

4. **Do not repeat what those docs already say.** Link to them. Write only
   what is specific to *this implementation* — decisions made, paths taken,
   deviations from the plan.

5. **Gotchas are mandatory.** If you hit a non-obvious problem during
   implementation, it goes in "Known Gaps and Gotchas". A future agent will
   hit the same wall without this.

6. **One log per task.** If the task spans multiple features, split into
   multiple files. Cross-reference them in each file's "How to Extend" section.

7. **Update INDEX.md every time.** Every new log file gets a row. Do not skip.

8. **Status field is honest.**
   - `complete` = acceptance criteria in FEATURES.md fully satisfied
   - `partial` = some criteria done, list what remains in "Known Gaps"
   - `blocked` = stopped due to missing info, list the blocker

9. **No prose essays.** Tables, bullets, code blocks. The reader is an agent,
   not a human skimming a blog post.

---

## Trigger

Activate when:
- User says: "document this", "log what I built", "write agent docs",
  "update agent-logs", "document what was done", or `/code-documenter`
- An agent has just finished implementing a feature and needs to hand off

Produce the log, update INDEX.md, then stop. Do not re-summarize in chat
what is already in the file — just confirm the file path(s) written.
