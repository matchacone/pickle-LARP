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
| 2026-06-29 | `court-listing-page` | /courts page with search, filter, sort, schema columns added | partial | `client/app/(guest)/courts/page.tsx`, `client/components/features/CourtCard.tsx`, `client/components/features/CourtGrid.tsx`, `client/lib/db/schema.ts` |
| 2026-06-29 | `lucide-icons` | Replaced all inline SVG UI icons with lucide-react across all pages | complete | `client/components/layout/Navbar.tsx`, `client/components/features/CourtCard.tsx`, `client/components/features/CourtGrid.tsx`, `client/app/page.tsx`, `client/app/(guest)/courts/page.tsx`, `client/app/(auth)/login/page.tsx`, `client/app/(auth)/register/page.tsx`, `client/app/(auth)/forgot-password/page.tsx` |
| 2026-07-02 | `owner-dashboard-static` | Owner Booking Dashboard static UI and schema additions | partial | `client/app/(owner)/layout.tsx`, `client/app/(owner)/dashboard/page.tsx`, `client/components/features/OwnerDashboardOverview.tsx`, `client/lib/db/schema.ts`, `docs/schema.md`, `docs/DATA_MODELS.md` |
| 2026-07-02 | `booking-invoice-refactor` | Owner sidebar, bookings table, and schema refactor | complete | `client/components/layout/OwnerSidebar.tsx`, `client/components/features/OwnerBookingsTable.tsx`, `client/lib/db/schema.ts`, `docs/schema.md`, `docs/DATA_MODELS.md` |
| 2026-07-02 | `dark-mode-tailwind-v4` | Global CSS Dark Mode implementation for Tailwind v4 | complete | `client/app/globals.css`, `client/components/layout/OwnerSidebar.tsx`, `client/components/features/OwnerDashboardOverview.tsx`, `client/components/features/OwnerBookingsTable.tsx` |
| 2026-07-03 | `owner-my-court-settings` | Owner My Court settings UI and schedule schema changes | partial | `client/app/(owner)/my-court/page.tsx`, `client/lib/db/schema.ts` |
| 2026-07-03 | `admin-dashboard-static` | Admin Dashboard Static UI, Navigation, and Route fix | partial | `client/app/admin/layout.tsx`, `client/app/admin/dashboard/page.tsx`, `client/app/admin/users/page.tsx`, `client/app/admin/reports/page.tsx`, `client/app/admin/applications/page.tsx`, `client/components/ui/Toast.tsx` |
