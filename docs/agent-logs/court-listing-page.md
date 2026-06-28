# Court Listing Page — Agent Log

> **Date:** 2026-06-29
> **Feature ID:** F-01 (Guest Court Discovery)
> **Status:** partial
> **Built by:** AI agent (Antigravity)

---

## What Was Built

The `/courts` guest court discovery page — the primary destination the landing page's "Find Courts" CTA and post-login redirect point to. The page has a dark asphalt header with a "Find Your Perfect Court." headline, a live stats bar, and a 9-card responsive grid of mock courts. A client-side `CourtGrid` component handles text search (filters by name, location, description), filter tabs (All / Indoor / Outdoor / Under ₱300 / Top Rated), and a sort dropdown (Featured / Top Rated / Price Low→High / Price High→Low). A shimmer skeleton loading state is provided. Three new nullable columns (`location`, `price_per_hour`, `court_type`) were also added to the `court` table in schema and Drizzle — required to power the filter UI once real data exists.

---

## Files Created or Modified

| File | Action | Purpose |
|---|---|---|
| `client/app/(guest)/layout.tsx` | created | Minimal passthrough layout for the (guest) route group |
| `client/app/(guest)/courts/page.tsx` | created | RSC page — dark header, stats bar, 9 mock courts, bottom CTA, footer |
| `client/app/(guest)/courts/loading.tsx` | created | Shimmer skeleton grid (9 cards) shown while RSC streams |
| `client/components/features/CourtCard.tsx` | created | Single court display card; exports `MockCourt` type used by page and grid |
| `client/components/features/CourtGrid.tsx` | created | Client component — owns search, filter, sort state; renders CourtCard array |
| `client/app/globals.css` | modified | Added `@keyframes shimmer` + `.skeleton` utility class |
| `client/lib/db/schema.ts` | modified | Added `location`, `pricePerHour`, `courtType` columns to `court` table |
| `docs/schema.md` | modified | Added same three columns to the conceptual court table |
| `docs/DATA_MODELS.md` | modified | Added same three columns to the Supabase implementation court table |

---

## How It Works

1. User navigates to `/courts` (from landing page CTA or post-login redirect in `login/page.tsx`).
2. Next.js serves `app/(guest)/courts/page.tsx` — a **React Server Component**. It imports `MOCK_COURTS` (a static array at the top of the file) and renders the page shell.
3. The page shell passes `courts={MOCK_COURTS}` as a prop to `<CourtGrid />` (client component boundary).
4. `CourtGrid` receives the full court array on mount. It uses `useMemo` to filter/sort client-side whenever `searchQuery`, `activeFilter`, or `activeSort` state changes — no API call.
5. Each filtered court is rendered as a `<CourtCard />` — a **server-compatible** component (no `'use client'`; it does not need it since it receives only props).
6. While the RSC is streaming, Next.js shows `loading.tsx` — a shimmer skeleton grid.

---

## Key Decisions

- **Static mock data, not Drizzle.** The `court` table exists in the DB but is unseeded. Rather than show an empty page, 9 mock courts with realistic PH data are hardcoded at the top of `page.tsx`. The TODO comment marks exactly where to drop in the Drizzle join query.
- **Client-side filtering on a small dataset.** All 9 courts are loaded from the RSC prop. Filtering/sorting happens in `useMemo` in `CourtGrid` — no `/api/courts?filter=` route needed until the court count grows large. This avoids a premature API route.
- **CourtCard is NOT `'use client'`.** It only receives props and renders JSX. Keeping it a server component means it can eventually be used inside RSC pages without hydration overhead.
- **Schema columns added as NULLABLE.** `location`, `price_per_hour`, `court_type` are all `NULL`-able so existing rows (if any) don't break. The Drizzle check constraint on `court_type` allows `NULL OR IN ('indoor', 'outdoor')`.
- **`(guest)` layout is a passthrough.** No auth guard is applied — guests can browse `/courts` freely per F-01. Auth middleware (`client/middleware.ts`) is not yet implemented; when it is, `(guest)` routes must be explicitly excluded.
- **Court card "Book Now" links to `/login`.** The booking flow (`/courts/[id]`, invoice creation) does not exist yet. Rather than a dead link, "Book Now" routes to `/login` with the expectation that post-login redirect will eventually target the court detail page.

---

## Drizzle Schema Changes

```typescript
// client/lib/db/schema.ts — court table (added columns)
export const court = pgTable('court', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  courtName: text('court_name').notNull().unique(),
  description: text('description'),
  location: text('location'),                                          // NEW
  pricePerHour: numeric('price_per_hour', { precision: 10, scale: 2 }), // NEW
  courtType: text('court_type'),                                       // NEW
  createdAt: tstz('created_at').notNull().defaultNow(),
  updatedAt: tstz('updated_at').notNull().defaultNow(),
}, (table) => [
  check('court_type_check', sql`${table.courtType} IS NULL OR ${table.courtType} IN ('indoor', 'outdoor')`),
])
```

> ⚠️ **Migration NOT run.** The schema file was updated but `npx drizzle-kit generate` and `npx drizzle-kit migrate` were NOT run — the DB is not yet connected in this dev environment. Run both commands before any code that reads `location`, `price_per_hour`, or `court_type` from the DB.

---

## API Routes Added or Changed

None. Court data is static mock. The GET /courts endpoint (per `API_SPEC.md` — Supabase direct client, not a Route Handler) is not implemented yet.

---

## Known Gaps and Gotchas

- **Mock data only.** `MOCK_COURTS` in `client/app/(guest)/courts/page.tsx` must be replaced with a Drizzle join query once courts are seeded. See "How to Extend" below.
- **DB migration not applied.** The three new `court` columns are in `schema.ts` but the actual Postgres table has not been altered. Running any Drizzle query against `court.location`, `court.pricePerHour`, or `court.courtType` will fail until the migration is generated and applied.
- **Filter pills don't use DB columns yet.** The "Indoor" and "Outdoor" filter tabs work against the mock `courtType` field. Once real DB data flows in, this will work automatically — but only if `court_type` is populated on insert.
- **"Book Now" links to `/login`.** This is a placeholder. Once the court detail page (`/courts/[id]`) is built, update `CourtCard.tsx` line: `href="/login"` → `href={`/courts/${court.id}`}`.
- **No pagination.** The grid loads all courts at once. Acceptable for a small catalogue; add server-side pagination or infinite scroll if the count exceeds ~50.
- **Search input on court page header is cosmetic.** The dark header has a search `<input>` with `readOnly` — it does not scroll to or filter the grid. Clicking "Search" anchor-links to `#court-results`. Wire it to `CourtGrid`'s `setSearchQuery` when refactoring to a shared state/URL param approach.
- **No `(guest)` middleware guard yet.** `client/middleware.ts` does not exist. When it's added, ensure `/courts` is NOT in the protected-routes list.

---

## How to Extend This

### Wire real court data
In `client/app/(guest)/courts/page.tsx`, replace `MOCK_COURTS` with:

```typescript
import { db } from '@/lib/db'
import { court, courtItem, item } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

const rows = await db
  .select()
  .from(court)
  .leftJoin(courtItem, eq(courtItem.courtId, court.id))
  .leftJoin(item, eq(item.id, courtItem.itemId))

// Group by court.id to build CourtWithItems[]
const courtsMap = new Map<string, MockCourt>()
for (const row of rows) {
  // ... group items per court
}
const courts = [...courtsMap.values()]
```

Also update the `MockCourt` type in `CourtCard.tsx` to `InferSelectModel<typeof court> & { amenities: string[] }`.

### Add the court detail page
Create `client/app/(guest)/courts/[id]/page.tsx`. Reference F-10 in `FEATURES.md`. Pass `court.id` from the listing grid.

### Run the DB migration
```bash
cd client
npx drizzle-kit generate
npx drizzle-kit migrate
```
