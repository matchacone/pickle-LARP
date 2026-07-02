# Booking and Invoice Refactor — Agent Log

> **Date:** 2026-07-02  
> **Feature ID:** F-08  
> **Status:** complete  
> **Built by:** Antigravity AI agent

---

## What Was Built

Refactored the dashboard layout to use a persistent side-navigation instead of the top Navbar. Transformed the dashboard overview into a Gantt-style visual timeline schedule, and created a new Bookings History table page. Additionally, separated the database schema's `invoice` table into two normalized tables (`booking` and `invoice`) to decouple scheduling logic from financial records.

---

## Files Created or Modified

| File | Action | Purpose |
|---|---|---|
| `client/app/(owner)/layout.tsx` | modified | Replaced Navbar with OwnerSidebar for dashboard navigation |
| `client/components/layout/OwnerSidebar.tsx` | created | New sidebar navigation component with dynamic active route styling |
| `client/app/(owner)/dashboard/page.tsx` | modified | Adjusted padding wrappers for sidebar layout |
| `client/components/features/OwnerDashboardOverview.tsx` | modified | Replaced static data table with a programmatic Gantt-chart timeline layout |
| `client/app/(owner)/bookings/page.tsx` | created | New route for historical bookings |
| `client/components/features/OwnerBookingsTable.tsx` | created | Static UI table displaying historical bookings with search/filter |
| `docs/schema.md` | modified | Split `invoice` table into `booking` and `invoice` |
| `docs/DATA_MODELS.md` | modified | Synced schema documentation to reflect Supabase DB layout |
| `client/lib/db/schema.ts` | modified | Renamed `invoice` to `booking` and added new `invoice` table |
| `client/lib/db/migrations/0002_short_whirlwind.sql` | created | Generated Drizzle migration for the schema split |

---

## How It Works

- **Layout Update:** The `OwnerLayout` now injects `OwnerSidebar` on the left. `OwnerSidebar` uses `usePathname` from Next.js to highlight the currently active tab.
- **Visual Timeline:** `OwnerDashboardOverview` uses absolute CSS positioning (`left: X%`, `width: Y%`) to map booking times onto a 12-hour grid (7:00 AM - 7:00 PM) across multiple courts.
- **Schema Refactor:** The `booking` table now stores `start_at` and `end_at` intervals and checks for overlapping boundaries. The `invoice` table contains `booking_id` as a foreign key with `ON DELETE CASCADE`.

---

## Key Decisions

- **Gantt Chart with Absolute Positioning:** Instead of using a heavy charting library, the visual timeline uses CSS absolute positioning based on a simple hours-from-start calculation for cleaner UI and faster load times.
- **Active Navigation State:** Added client-side Next.js hooks in `OwnerSidebar.tsx` to handle route highlighting dynamically.
- **Normalization over Convenience:** Split the `invoice` table to adhere to strictly normalized relationships. A booking can now easily exist without a payment (e.g. comped), and an invoice has its own lifecycle.

---

## Drizzle Schema Changes

```typescript
export const booking = pgTable('booking', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'restrict' }),
  courtId: uuid('court_id').notNull().references(() => court.id, { onDelete: 'restrict' }),
  startAt: tstz('start_at').notNull(),
  endAt: tstz('end_at').notNull(),
  status: text('status').notNull().default('pending'),
  createdAt: tstz('created_at').notNull().defaultNow(),
  updatedAt: tstz('updated_at').notNull().defaultNow(),
})

export const invoice = pgTable('invoice', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  bookingId: uuid('booking_id').notNull().references(() => booking.id, { onDelete: 'cascade' }),
  paymentMethod: text('payment_method').notNull(),
  paymentTotal: numeric('payment_total', { precision: 10, scale: 2 }).notNull(),
  status: text('status').notNull().default('unpaid'),
  createdAt: tstz('created_at').notNull().defaultNow(),
  updatedAt: tstz('updated_at').notNull().defaultNow(),
})
```

---

## Known Gaps and Gotchas

- **Static Data:** `OwnerBookingsTable` and `OwnerDashboardOverview` are still using mock data. They need to be wired up to actual server actions or Supabase client queries.
- **Overlap Logic:** The `DATA_MODELS.md` specifies an overlap exclusion constraint, but Postgres lacks a native overlapping constraint for standard `timestamp` columns without using `btree_gist` and `tsrange`. We will need to enforce this via application logic or a DB trigger.
- **Drizzle Generation Issue:** When generating the schema, Drizzle interactively asked if `booking_id` was renamed from other columns. This must be handled carefully when generating migrations in CI/CD.

---

## How to Extend This

- To wire up the data, create a route handler or Server Action that queries the `booking` table joining `profiles`.
- To add a new tab to the sidebar, modify the `navLinks` array in `OwnerSidebar.tsx`.
- Review `docs/DATA_MODELS.md` before writing queries to ensure you use the correct timezone handling (`timestamptz`).
