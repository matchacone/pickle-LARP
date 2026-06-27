---
name: git-workflow
description: >
  Executes git operations following the project's branching strategy and
  commit message conventions defined in CODING_STANDARDS.md. Handles branch
  creation, staging, committing with the correct prefix, and prepares a PR
  description. Use when the user says "commit this", "make a commit",
  "create a branch", "git workflow", "push this", or "/git-workflow".
  Always run after self-review passes — never commit work that has not
  passed the self-review gate.
argument-hint: "[action: branch|commit|pr|full]"
license: MIT
---

# Git Workflow

You are the agent's version control operator. You ensure every commit tells
a coherent story: what changed, why, and how a future developer (or agent)
can understand it from the log alone.

**Never run this skill if self-review has not passed.** Committing broken
or non-compliant code is worse than not committing.

---

## Conventions (from CODING_STANDARDS.md § 9)

### Commit Message Prefixes

| Type | Prefix | Example |
|---|---|---|
| New feature | `feat:` | `feat: add court reviews API and UI` |
| Bug fix | `fix:` | `fix: prevent double-booking race condition` |
| Documentation | `docs:` | `docs: update API_SPEC with reviews routes` |
| Refactor | `refactor:` | `refactor: replace supabase.from with Drizzle` |
| Chore | `chore:` | `chore: add drizzle-kit to devDependencies` |
| Style | `style:` | `style: reorder Tailwind classes in CourtCard` |
| Test | `test:` | `test: add integration tests for reviews route` |

### Branch Naming

```
feat/<feature-slug>         → feat/court-reviews
fix/<bug-slug>              → fix/double-booking
docs/<doc-slug>             → docs/api-spec-reviews
refactor/<scope>            → refactor/drizzle-migration
chore/<task>                → chore/install-drizzle
```

---

## Actions

---

### `branch` — Create a Feature Branch

1. Determine the branch name from the task type and feature slug
2. Check that the branch does not already exist
3. Create and switch to the branch

```bash
git checkout -b feat/<feature-slug>
```

Output:
```
✅ Branch created: feat/court-reviews
Now on: feat/court-reviews
```

---

### `commit` — Stage and Commit Changes

#### Step 1 — Identify changed files

```bash
git status
git diff --name-only
```

Group files into logical categories:
- Schema / migration files
- Route Handler files
- Component files
- Test files
- Documentation files

#### Step 2 — Stage selectively

Do NOT use `git add .` blindly. Stage by category:

```bash
# Schema changes
git add client/lib/db/schema.ts client/lib/db/migrations/

# Route handlers
git add client/app/api/courts/

# Components
git add client/components/features/ReviewList.tsx

# Tests
git add client/components/features/ReviewList.test.tsx

# Docs
git add docs/API_SPEC.md docs/agent-logs/
```

Verify nothing unexpected is staged:
```bash
git diff --staged --name-only
```

#### Step 3 — Write the commit message

Format:
```
<prefix>(<scope>): <imperative-mood summary under 72 chars>

- Bullet explaining a non-obvious decision or trade-off
- Bullet for any deferred work (references AGENT_PLAYBOOK TODO markers)
- Bullet for migration file if schema changed
```

Examples:

```
feat(reviews): add court reviews API and display component

- GET /api/courts/[id]/reviews is public, POST requires auth
- One review per user per court enforced at DB level (unique constraint)
- Star ratings deferred to Phase 2 (no rating column in schema.md)
- Migration: 20260628_add_reviews_table.sql
```

```
fix(invoices): prevent double-booking under concurrent requests

- Added Drizzle transaction with serializable isolation on overlap check
- Resolves race condition in POST /api/invoices identified in self-review
```

#### Step 4 — Commit

```bash
git commit -m "<message>"
```

Output confirmation:
```
✅ Committed: feat(reviews): add court reviews API and display component
Files: 7 changed, 312 insertions(+), 0 deletions(-)
```

---

### `pr` — Prepare a Pull Request Description

Generate a PR description the team can review. Output as a markdown block
the user can paste directly into GitHub/GitLab.

```markdown
## Summary

[One paragraph: what this PR does and why]

## Changes

### Schema
- Added `reviews` table to `client/lib/db/schema.ts`
- Migration: `lib/db/migrations/20260628_add_reviews.sql`

### API
- `GET /api/courts/[id]/reviews` — public, paginated
- `POST /api/courts/[id]/reviews` — authenticated users
- `DELETE /api/reviews/[id]` — owner or admin

### UI
- `ReviewList` component added to court profile page
- `ReviewForm` component with optimistic update

## Test Coverage

- Unit: `ReviewList.test.tsx` — rendering, empty state
- Integration: `reviews/route.test.ts` — auth guard, duplicate check

## Docs Updated

- `docs/API_SPEC.md` — reviews routes added
- `docs/agent-logs/reviews-api.md` — implementation log

## Out of Scope

- Star ratings (F-14 scope note — Phase 2)
- Restrict reviews to users with confirmed invoices (Phase 2)

## Checklist

- [x] Self-review passed (all 7 gates)
- [x] TypeScript build passes
- [x] Tests written and passing
- [x] No console.log in production code
- [x] No hardcoded credentials
```

---

### `full` — Full Workflow (branch → commit → PR description)

Runs `branch`, then `commit`, then `pr` in sequence.

---

## What NOT to Do

| Don't | Why |
|---|---|
| `git add .` without reviewing staged files | Risks committing .env.local |
| Commit without self-review passing | Ships defects |
| Use `git commit -m "fix stuff"` | Violates commit conventions |
| Commit directly to `main` or `master` | Always use a feature branch |
| Commit migration files you edited manually | Re-generate via drizzle-kit |
| Commit `node_modules/` | Should be in `.gitignore` |
