# Landing Page — Agent Log

> **Date:** 2026-06-28
> **Feature ID:** F-01 (Guest Court Discovery), F-10 (partial), F-11 (partial)
> **Status:** partial
> **Built by:** AI agent (Antigravity)

---

## What Was Built

A fully responsive landing page at `/` implementing the Kinetic Court design system from `docs/DESIGN.md`. The page includes a hero section with a search widget, a stats bar, a 6-card court discovery grid with filter pills, a 3-step "How it Works" section, a partner/owner CTA in dark asphalt, and a footer. All court data is currently mock — no DB queries are made on this page. The global design system (CSS tokens, utility classes) was also established in `globals.css` and `layout.tsx`.

---

## Files Created or Modified

| File | Action | Purpose |
|---|---|---|
| `client/app/globals.css` | modified (full rewrite) | Kinetic Court design tokens via `@theme inline`, utility classes (.btn, .card, .glass, .badge, .input, .spinner, animations) |
| `client/app/layout.tsx` | modified | Plus Jakarta Sans via `next/font/google`, SEO metadata, root layout |
| `client/app/page.tsx` | modified (full rewrite) | Landing page — 7 sections, server component |
| `client/components/layout/Navbar.tsx` | created | Sticky glassmorphism navbar, scroll state, mobile hamburger, client component |
| `client/components/features/FilterPills.tsx` | created | Interactive filter tabs — client component (isolated to keep page.tsx as RSC) |

---

## How It Works

`app/page.tsx` is a **React Server Component** — no `'use client'` directive. Static mock court data is defined at the top of the file (array of 6 courts). The page imports two client components:
- `<Navbar />` — detects `window.scrollY` to apply glassmorphism effect; renders server-side shell on first paint.
- `<FilterPills />` — manages `active` filter state with `useState`; toggling a pill currently only changes visual state (no actual filtering logic connected to DB yet).

All other sections (hero, stats bar, court cards, how it works, partner CTA, footer) are static JSX inside the RSC.

---

## Key Decisions

- **Tailwind v4 color tokens:** custom brand colors are defined in `@theme inline` in `globals.css` using `--color-*` naming, which Tailwind v4 automatically maps to `bg-*`, `text-*`, `border-*` utilities. E.g. `--color-asphalt: #121212` → `bg-asphalt`, `text-asphalt`.
- **`--font-sans` references `var(--font-jakarta)`** which is the CSS variable injected by `next/font/google` in `layout.tsx`. This is the correct Next.js App Router font pattern.
- **Filter pills use `rounded-lg` (8px), not `rounded-full`** — per DESIGN.md "no pill-shaped structural elements for structural components".
- **Court cards use CSS gradient/geometric art** instead of real images — avoids `next.config.ts` image domain configuration requirements at this stage. Real images require adding Supabase Storage URL to `images.remotePatterns` in `next.config.ts`.
- **`FilterPills` is intentionally isolated as a client component** — this lets `page.tsx` remain a server component for better performance and future DB data fetching.

---

## API Routes Added or Changed

None — landing page is fully static/mock data.

---

## Known Gaps and Gotchas

- **Court data is mocked.** The 6 courts in `page.tsx` are hardcoded. Once courts are seeded in the DB, replace the `COURTS` array with a Drizzle `db.select().from(court)` call in the page function. The component structure is already correct for this.
- **Filter pills don't filter.** Clicking a pill changes visual state only. To wire filtering: lift state to a client component wrapper, pass the active filter to the court grid, and either re-fetch from the API or filter the client-side array.
- **Court cards lack real images.** Supabase Storage is the planned image backend (see `ARCHITECTURE.md`). To add images: add `images.remotePatterns` for `*.supabase.co` in `client/next.config.ts`, then swap the gradient div for a `<Image>` component.
- **Search widget inputs are cosmetic only** — no search route handler exists yet. Clicking "Find Courts" links to `/courts` which is not yet implemented.
- **No `location`, `price_per_hour`, or `indoor_outdoor` columns in current schema** — F-01 acceptance criteria mention filtering by these fields, but they are not in `docs/schema.md` or `DATA_MODELS.md`. A schema update is required before real filtering can be built. Do not invent column names.

---

## How to Extend This

1. **Wire real courts:** in `client/app/page.tsx`, replace `COURTS` with:
   ```typescript
   const courts = await db.select().from(court)
   ```
2. **Add search functionality:** create `client/app/api/courts/route.ts` (GET) per `API_SPEC.md` pattern, accept `?location=&type=` query params, query Drizzle, return JSON.
3. **Add real images:** configure `next.config.ts` `images.remotePatterns` for Supabase Storage, then swap court card gradient divs for `<Image src={court.imageUrl} />`.
4. **Schema additions needed for F-01:** `price_per_hour numeric`, `court_type text CHECK('indoor','outdoor')`, `location text` — run through `schema-sync` skill when ready.
