# Backend Implementation Roadmap

> **Status:** In progress. Phases are implemented sequentially — each depends on the previous.
> **Audience:** AI coding agents, developers.

---

## Overview

All frontend pages were initially built with hardcoded mock data. This roadmap tracks the incremental wiring of each feature to real Drizzle queries, Route Handlers, and Supabase services.

---

## Phase 1 — Guest Court Discovery (F-01) ✅

**Status:** Complete

**Goal:** Replace all hardcoded `MOCK_COURTS` arrays with live Drizzle queries.

**What was built:**
- `lib/db/queries/courtQueries.ts` — shared query layer (`getAllCourts`, `getCourtById`)
- `lib/utils/courtColors.ts` — deterministic accent colors from court UUID
- `lib/db/seed.ts` — TypeScript seed script (9 courts, 10 items, links, reviews, hours)
- Wired `/courts` and `/courts/[id]` pages to async RSC with Drizzle queries
- Replaced `MockCourt`/`MockReview` types with `CourtCardData`/`ReviewData`
- Graceful fallback to mock data when `DATABASE_URL` is missing

---

## Phase 2 — Auth Flow (F-02) ✅

**Status:** Complete

**Goal:** Complete the auth flow with middleware, session management, and auth-aware UI.

**Finding:** Auth pages (`/login`, `/register`, `/forgot-password`) already had working Supabase client-side logic (email/password, Google OAuth, password reset). Only the server-side plumbing was missing.

**What was built:**
- `middleware.ts` — session refresh on every request + route protection (protected routes → `/login`, auth pages → `/courts` if already logged in)
- `hooks/useAuth.ts` — lightweight client-side hook (`{ user, loading }`) with cross-tab sync via `onAuthStateChange`
- `app/actions/auth-actions.ts` — `logout()` server action (clears session cookies, redirects to `/`)
- Updated `Navbar.tsx` — shows user avatar + dropdown menu (Dashboard, Bookings, Sign Out) when logged in; original buttons when not
- Applied `supabase_trigger_profiles.sql` to auto-create profile rows on signup

**Note:** Next.js 16 shows a deprecation warning for `middleware.ts` → `proxy`. Still functional — migration deferred to a future chore.

**Dependencies:** Phase 1 (DB connection verified)

---

## Phase 3 — Court Reviews API (F-14)

**Status:** ✅ Complete

**Goal:** Add Route Handlers for creating and deleting reviews, completing the first write operation with auth.

**What was built:**
- Added `UNIQUE(user_id, court_id)` constraint on the `reviews` table (migration `0004`)
- `GET /api/courts/[id]/reviews` — public, returns `{ reviews, total }`
- `POST /api/courts/[id]/reviews` — authenticated, validates body, enforces one-per-user via unique constraint (409 on duplicate)
- `DELETE /api/reviews/[id]` — review author or admin (role check via `profiles.role`)
- Wired `CourtReviews` component with review submission form (auth-gated), inline error/success messaging, optimistic delete, and "already reviewed" indicator
- Court detail page passes `currentUserId` from server-side session to CourtReviews

**Dependencies:** Phase 2 (Auth required for POST/DELETE)

---

## Phase 4 — Court Booking + Management (F-03, F-04)

**Status:** ✅ Complete

**Goal:** Core booking flow — creating bookings, preventing double-bookings, availability queries, and cancellation.

**What was built:**
- `lib/db/queries/bookingQueries.ts` — shared query layer (`createBookingWithInvoice`, `cancelBooking`, `getUserBookings`, `getBookingById`, `getBookedSlots`) with transactional double-booking prevention
- `POST /api/bookings` — create a booking + invoice atomically (validates dates, duration 1–8h, future start, overlap check)
- `GET /api/bookings` — list authenticated user's bookings with court name and invoice details
- `GET /api/bookings/[id]` — single booking detail (owner or admin)
- `PATCH /api/bookings/[id]` — cancel a booking (enforces 24hr cancellation window, ownership, and status check)
- `GET /api/courts/[id]/availability?date=YYYY-MM-DD` — public endpoint returning booked time slots for the availability calendar
- Wired `AvailabilityCalendar` component to real API (replaced mock seededRandom with live booked-slot data)
- Wired checkout page to `POST /api/bookings` (replaced mock courts + setTimeout with real API calls, error handling for 401/409)
- Created `/my-bookings` customer dashboard (server-side Drizzle fetch, upcoming/past split, cancel functionality)
- Updated Navbar and middleware to support `/my-bookings` route

**Note:** API uses `/api/bookings` (not `/api/invoices`) because the schema separated booking from invoice. The booking creation endpoint creates both atomically.

**Dependencies:** Phase 2 (Auth), Phase 1 (court data)

---

## Phase 5 — Payment (F-05)

**Status:** Not started

**Goal:** Implement the `PaymentService` interface with a mock provider, enabling the payment flow without a real payment gateway.

**Scope:**
- `lib/payment/index.ts` — `PaymentService` interface + factory
- `lib/payment/mock.ts` — mock implementation (auto-confirms after delay)
- `POST /api/payments/webhook` — webhook handler for payment status updates
- Update invoice status transitions: `pending` → `confirmed` or `cancelled`
- Wire checkout page to payment flow

**Dependencies:** Phase 4 (Invoices exist to pay for)

---

## Phase 6 — Admin Panel (F-11)

**Status:** Not started

**Goal:** Wire the admin dashboard to real data with CRUD operations for courts, items, and users.

**Scope:**
- `GET/POST/PUT/DELETE /api/admin/courts` — court management
- `GET/POST/PUT/DELETE /api/admin/items` — item/equipment management
- `GET/PUT /api/admin/users` — user management (role changes, suspensions)
- `GET /api/admin/reports` — basic reporting (bookings, revenue)
- Role-guard all admin routes (middleware + Route Handler checks)

**Dependencies:** Phase 2 (Auth + role guards), Phase 4 (booking data for reports)

---

## Deferred — Owner Features (F-06, F-07, F-08)

**Status:** Blocked — requires schema additions not yet in `docs/schema.md`

**Goal:** Owner dashboard, court settings management, and earnings tracking.

**Scope (tentative):**
- Owner dashboard with booking stats and revenue
- Court settings CRUD (operating hours, pricing, amenities)
- Owner-specific booking management
- Payout tracking

**Dependencies:** Schema additions, Phase 4, Phase 5

---

## Conventions

All backend code follows `docs/CODING_STANDARDS.md`:
- Drizzle for all DB queries (never `supabase.from()`)
- Supabase JS only for Auth, Storage, Realtime
- Route Handlers return `{ error, code }` on failure
- Server Actions for form submissions
- Types inferred from Drizzle schema (`InferSelectModel`)
