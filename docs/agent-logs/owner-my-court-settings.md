# Owner My Court Settings — Agent Log

> **Date:** 2026-07-03  
> **Feature ID:** None  
> **Status:** partial  
> **Built by:** Antigravity AI  

---

## What Was Built

Created a single-court management interface (`/my-court`) for court owners to manage their court's details, operating hours, closed dates (exceptions), amenities, and pricing. Updated the underlying database schema to support these new features (status, recurring hours, closed dates). Currently, the UI is mostly static but features interactive React state for the Operating Hours and Closed Dates calendar to demonstrate the UX.

---

## Files Created or Modified

| File | Action | Purpose |
|---|---|---|
| `client/app/(owner)/my-court/page.tsx` | created | The main settings page for court owners. Contains basic info, amenities, operating hours schedule, closed dates calendar, and pricing. |
| `client/components/layout/OwnerSidebar.tsx` | modified | Updated navigation to point to `/my-court` instead of the multi-court list. |
| `client/app/(owner)/my-courts/page.tsx` | deleted | Removed the multi-court list page since the dashboard manages a single court. |
| `client/lib/db/schema.ts` | modified | Added `courtOperatingHours` and `courtClosedDates` tables. Added `status` column to `court` table. |
| `docs/schema.md` | modified | Updated conceptual schema documentation with new tables and columns. |
| `docs/DATA_MODELS.md` | modified | Updated Supabase implementation documentation with new tables and columns. |

---

## How It Works

1. **Static UI with State:** `MyCourtPage` is a React Client Component that initializes state for a weekly schedule (`schedule`) and exceptions (`closedDates`).
2. **Interactive Toggles:** Toggling a day's availability dynamically disables and dims the time dropdowns.
3. **Interactive Calendar:** Clicking a date on the mock calendar pushes/pops it from the `closedDates` array, visually "crushing it out" with a red 'X'.
4. **Schema Enhancements:** The DB schema now includes `court_operating_hours` for recurring schedules (0-6 day of week) and `court_closed_dates` for specific date blocks.

---

## Key Decisions

- **Single Court per Owner:** The user requested the dashboard manage only one court. Changed `/my-courts` to `/my-court`. If an owner has multiple courts in the future, this will need a dropdown or context switcher.
- **Separate Operating Hours Table:** Used a `court_operating_hours` table (1 row per day) rather than a JSONB column to ensure robust querying and validation.
- **Disabled State Handling:** For closed days, time dropdowns are visually disabled and greyed out (`opacity-50 pointer-events-none`) rather than removing the `<option>` elements entirely.

---

## Drizzle Schema Changes

```typescript
export const courtOperatingHours = pgTable('court_operating_hours', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  courtId: uuid('court_id').notNull().references(() => court.id, { onDelete: 'cascade' }),
  dayOfWeek: integer('day_of_week').notNull(),
  openTime: time('open_time'),
  closeTime: time('close_time'),
  isOpen: boolean('is_open').notNull().default(true),
  createdAt: tstz('created_at').notNull().defaultNow(),
  updatedAt: tstz('updated_at').notNull().defaultNow(),
}, (table) => [
  check('day_of_week_check', sql`${table.dayOfWeek} >= 0 AND ${table.dayOfWeek} <= 6`),
  uniqueIndex('court_operating_hours_unique').on(table.courtId, table.dayOfWeek),
])

export const courtClosedDates = pgTable('court_closed_dates', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  courtId: uuid('court_id').notNull().references(() => court.id, { onDelete: 'cascade' }),
  closedDate: date('closed_date').notNull(),
  reason: text('reason'),
  createdAt: tstz('created_at').notNull().defaultNow(),
}, (table) => [
  uniqueIndex('court_closed_dates_unique').on(table.courtId, table.closedDate),
])
```

Command run: `npx drizzle-kit generate` — migration file: `lib/db/migrations/0003_warm_crusher_hogan.sql`

---

## Known Gaps and Gotchas

- **Mock Data:** The UI uses hardcoded mock data for the schedule, closed dates, and inputs. It is not currently fetching from or saving to the database.
- **Calendar Logic:** The mock calendar in `/my-court` is hardcoded to October 2026 and does not use a real date library like `date-fns` or `dayjs` to calculate offsets or empty grid cells correctly.
- **Pricing:** Only a flat `price_per_hour` is supported. Peak pricing is noted in the UI but has no DB schema support yet.

---

## How to Extend This

- **Wire to Real Data:** Fetch the court data, operating hours, and closed dates inside `MyCourtPage` (or pass it from a Server Component) using Drizzle.
- **Implement Save:** Wire up the "Save Changes" button to a Server Action or API route that runs an UPSERT transaction on `court`, `court_operating_hours`, and `court_closed_dates`.
- **Integrate Real Date Picker:** Swap the mock grid calendar with a headless UI library component (e.g. `react-day-picker`) or build a robust grid generator.
