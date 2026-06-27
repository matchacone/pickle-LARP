---
name: task-planner
description: >
  Decomposes a complex or multi-file task into a concrete, ordered execution
  plan before writing a single line of code. Produces a checklist of atomic
  steps, identifies every file to be created or modified, flags dependencies
  between steps, and surface blockers before they become wasted work. Use
  when a task touches more than two files, spans multiple layers (DB + API +
  UI), or when the user says "plan this", "break this down", "what's the
  approach", or "/task-planner". Must run after context-loader and before
  pre-flight.
argument-hint: "[task description]"
license: MIT
---

# Task Planner

You are the agent's prefrontal cortex. You plan before acting. An agent that
writes code before planning produces half-correct work, leaves gaps, and
forces expensive re-reads. You prevent that.

Planning is not bureaucracy. A plan is the minimal structure that lets you
execute without stopping to ask "what next?"

---

## When to Use

Activate for any task that:
- Touches **more than 2 files**
- Spans **multiple layers** (e.g., schema + Route Handler + component)
- Has **ambiguous scope** (e.g., "add reviews" — does that mean schema, API,
  and UI, or just the API?)
- Has **sequential dependencies** (e.g., migration must run before the
  Route Handler can be tested)

For single-file fixes or trivial changes, skip this skill.

---

## Protocol

### 1. Restate the Goal

One sentence. What does "done" look like from the user's perspective?

> "A logged-in user can submit a review for a court and see it on the court
> profile page."

### 2. Identify the Feature ID

Check `docs/FEATURES.md`. Find the F-XX entry. Read its acceptance criteria.
These are your exit conditions — the plan is done when every checkbox is
satisfiable.

### 3. Map the Layers

Identify which layers the task touches. For each layer, list the specific
files:

| Layer | Files Involved | Action |
|---|---|---|
| Schema | `docs/schema.md`, `client/lib/db/schema.ts` | Add/modify tables |
| Migration | `client/lib/db/migrations/` | Generate via drizzle-kit |
| Route Handler | `client/app/api/.../route.ts` | Create/modify |
| Page / RSC | `client/app/(group)/route/page.tsx` | Create/modify |
| Component | `client/components/features/...` | Create/modify |
| Hook | `client/hooks/...` | Create/modify |
| Types | `client/types/...` | Update if needed |
| Tests | `*.test.ts` co-located | Write |
| Docs | `docs/agent-logs/`, `docs/API_SPEC.md` | Update |

### 4. Order the Steps

Write a dependency-ordered checklist. Steps that unlock other steps go first.
Always follow this ordering principle:
1. Schema / data model changes first
2. Migration next
3. Server-side logic (Route Handlers, RSC data fetching) next
4. Client-side UI last
5. Tests alongside or immediately after each step
6. Documentation last

**Output format:**

```markdown
## Execution Plan: [Task Name]

**Goal:** [one sentence]
**Feature:** F-XX

### Steps

- [ ] 1. Update `docs/schema.md` — add `reviews` table definition
- [ ] 2. Update `docs/DATA_MODELS.md` — add `reviews` Supabase mapping
- [ ] 3. Edit `client/lib/db/schema.ts` — add Drizzle `reviews` table
- [ ] 4. Run `npx drizzle-kit generate` — generates migration file
- [ ] 5. Create `client/app/api/courts/[id]/reviews/route.ts` — GET + POST handlers
- [ ] 6. Create `client/app/api/reviews/[id]/route.ts` — DELETE handler
- [ ] 7. Create `client/components/features/ReviewList.tsx` — display component
- [ ] 8. Create `client/components/features/ReviewForm.tsx` — submit form
- [ ] 9. Update `client/app/(guest)/courts/[id]/page.tsx` — embed ReviewList
- [ ] 10. Write tests: `ReviewList.test.tsx`, `reviews/route.test.ts`
- [ ] 11. Update `docs/API_SPEC.md` — add reviews routes
- [ ] 12. Run `code-documenter` — log to `docs/agent-logs/reviews-api.md`

### Blockers

- None / [list any missing information that would stop execution]

### Out of Scope

- [anything explicitly NOT being built in this task]
```

### 5. Surface Blockers

A blocker is anything that would force you to stop mid-execution:
- A column not defined in `docs/schema.md`
- An environment variable not in `.env.local`
- A dependency not installed in `package.json`
- An ambiguous business rule not covered in `FEATURES.md`

List blockers in the plan. If a blocker is critical, stop and ask before
proceeding. If it is minor, add a `// TODO: [AGENT_BLOCKED]` comment to the
plan and continue.

### 6. Confirm Before Executing

After producing the plan, **stop and present it**. Do not begin execution
until the user (or the orchestrating agent) confirms:
- The scope is correct
- The out-of-scope list is accepted
- There are no known blockers the plan missed

Only then proceed, step by step, marking each checkbox as complete.

---

## During Execution

- Execute one step at a time. Finish and verify before moving to the next.
- If a step reveals new information that changes the plan, update the plan
  before continuing.
- If you complete a step that was not in the plan, add it retroactively.
- When all steps are checked, hand off to `self-review`.

---

## Anti-patterns to Avoid

| Don't | Do instead |
|---|---|
| Write UI before the schema is settled | Schema → migration → API → UI |
| Estimate "5 files" when it's 12 | Count every file touched before you start |
| Leave blockers vague | Name the exact missing information |
| Add "bonus" features mid-plan | Scope-creep goes in a new plan |
| Start coding while plan is unconfirmed | Wait for confirmation |
