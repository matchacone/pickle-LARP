# Pickle All — Documentation Index

This folder contains all technical documentation for the **Pickle All** pickleball court booking platform. These files are the single source of truth for all development decisions. AI agents and human developers must consult the relevant documents before writing code.

---

## Reading Order

**For a new agent or developer, read in this order:**

| # | File | Purpose |
|---|---|---|
| 1 | [`project_proposal.md`](./project_proposal.md) | Business context, client background, core features overview |
| 2 | [`schema.md`](./schema.md) | **Authoritative normalized database schema** (team-designed) |
| 3 | [`ARCHITECTURE.md`](./ARCHITECTURE.md) | Tech stack, repo structure, system design, key decisions |
| 4 | [`DATA_MODELS.md`](./DATA_MODELS.md) | Supabase implementation guide derived from `schema.md` |
| 5 | [`FEATURES.md`](./FEATURES.md) | Full feature list with user stories and acceptance criteria |
| 6 | [`API_SPEC.md`](./API_SPEC.md) | Route Handler contracts, request/response schemas |
| 7 | [`CODING_STANDARDS.md`](./CODING_STANDARDS.md) | Style guide, conventions, forbidden patterns |
| 8 | [`TESTING_STRATEGY.md`](./TESTING_STRATEGY.md) | Test types, tooling, coverage targets, examples |
| 9 | [`AGENT_PLAYBOOK.md`](./AGENT_PLAYBOOK.md) | **AI agent protocols, patterns, and definition of done** |
| 10 | [`agent-logs/INDEX.md`](./agent-logs/INDEX.md) | **Post-implementation agent logs** — read before touching existing features |

---

## Agent Logs (`agent-logs/`)

The [`agent-logs/`](./agent-logs/) folder contains structured markdown logs written by AI agents **after** completing a feature. Each log records what was built, which files were created or modified, key implementation decisions, gotchas, and how to extend the work.

**Agents:** Before starting any task, check `agent-logs/INDEX.md` for logs related to the files you plan to touch.  
**Agents:** After completing a task, use the `code-documenter` skill (`.agent/skills/code-documenter/SKILL.md`) to produce a log entry.

---

## Document Ownership

| Document | Owned By | Update Trigger |
|---|---|---|
| `project_proposal.md` | Business Analyst (Shawn) | Client requirement changes |
| `schema.md` | All team members | DB schema changes — primary source of truth |
| `ARCHITECTURE.md` | Project Lead (Jian) | Any structural or tech decision |
| `DATA_MODELS.md` | Project Lead (Jian) | Must be updated whenever `schema.md` changes |
| `FEATURES.md` | All team members | Feature additions or scope changes |
| `API_SPEC.md` | Developer implementing the route | New/changed Route Handlers |
| `CODING_STANDARDS.md` | Project Lead (Jian) | Team agreement |
| `TESTING_STRATEGY.md` | All developers | New test patterns |
| `AGENT_PLAYBOOK.md` | Project Lead (Jian) | Process changes |

---

## Pending Documents

| File | Status | Blocked On |
|---|---|---|
| `UI_UX_SPEC.md` | 🔲 Not started | Design decisions |
| `ROADMAP.md` | 🔲 Not started | Milestone planning session |
