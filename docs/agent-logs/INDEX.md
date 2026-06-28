# Agent Log Index

This folder contains post-implementation logs written by AI agents for future AI agents.
Each file documents a completed feature or task: what was built, where the files live,
key decisions, gotchas, and how to extend the work.

**Before starting any task**, scan this index for logs related to files you plan to touch.

---

## How to Add an Entry

Use the `code-documenter` skill (`.agent/skills/code-documenter/SKILL.md`).
Say "document this" or invoke `/code-documenter` after completing a feature.
The skill creates the log file and appends a row to this table.

---

## Log Entries

| Date | Slug | Feature | Status | Key Files |
|---|---|---|---|---|
| 2026-06-28 | `drizzle-schema-setup` | Drizzle ORM schema, Supabase clients, DB migration | complete | `client/lib/db/schema.ts`, `client/lib/db/index.ts`, `client/lib/supabase/server.ts`, `client/lib/supabase/client.ts`, `client/drizzle.config.ts` |
| 2026-06-28 | `landing-page` | Landing page, design system, Navbar, FilterPills | partial | `client/app/page.tsx`, `client/app/globals.css`, `client/app/layout.tsx`, `client/components/layout/Navbar.tsx`, `client/components/features/FilterPills.tsx` |
| 2026-06-28 | `auth-pages` | Login/register carousel, forgot password, OAuth callback | partial | `client/app/(auth)/login/page.tsx`, `client/app/(auth)/forgot-password/page.tsx`, `client/app/api/auth/callback/route.ts` |
