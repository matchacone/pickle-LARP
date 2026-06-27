# FEATURES.md — Pickle All Feature Specification

> **Status:** Living document — update as features are confirmed or revised.  
> **Audience:** AI coding agents, developers, business analysts.  
> **Format:** Each feature has a user story, acceptance criteria, and scope notes.

---

## Feature Index

| ID | Feature | Role | Status |
|---|---|---|---|
| F-01 | Guest Court Discovery | Guest | Planned |
| F-02 | User Registration & Login | All | Planned |
| F-03 | Court Booking (Invoice) | user | Planned |
| F-04 | Booking Management | user | Planned |
| F-05 | Integrated Payment | user | Planned |
| F-06 | Facility Owner Onboarding | — | ⏳ Deferred (not in schema) |
| F-07 | Court & Schedule Management | — | ⏳ Deferred (not in schema) |
| F-08 | Owner Booking Dashboard | — | ⏳ Deferred (not in schema) |
| F-09 | Event & Match Scheduling | — | ⏳ Deferred (not in schema) |
| F-10 | Detailed Court Profiles | Guest + user | Planned |
| F-11 | Admin Panel | admin | Planned |
| F-12 | Real-time Availability | All | Planned |
| F-13 | Notifications | user | Planned |
| F-14 | Court Reviews | user | Planned |

---

## F-01 — Guest Court Discovery

**User Story:**  
As a guest (unauthenticated visitor), I want to browse available pickleball courts near me so that I can decide where to play before creating an account.

**Acceptance Criteria:**
- [ ] Guest can view a list of courts without logging in.
- [ ] Courts display: name, location (city/barangay), indoor/outdoor tag, price range, thumbnail image.
- [ ] Guest can filter by: location, indoor/outdoor, price range, availability date.
- [ ] Guest cannot book — a CTA prompts them to register.
- [ ] Page is indexable by search engines (SSR or SSG).

**Scope Notes:**
- Map view is a stretch goal (Phase 2).
- Location filtering is text-based initially (no GPS required in Phase 1).

---

## F-02 — User Registration & Login

**User Story:**  
As a new user, I want to create an account using my email or Google so that I can access the platform's booking features.

**Acceptance Criteria:**
- [ ] Email + password registration with email verification.
- [ ] OAuth login via Google.
- [ ] Password reset via email link.
- [ ] On registration, a `profiles` record is created with `role = 'user'`.
- [ ] Session persists across page refreshes.
- [ ] Protected routes redirect unauthenticated users to `/login`.

**Scope Notes:**
- Roles per `schema.md`: `'user'` (customer) and `'admin'` (platform admin).
- `admin` role is assigned manually via Supabase dashboard — not self-service.
- There is no self-service facility owner registration in the current schema.

---

## F-03 — Court Booking (Invoice)

**User Story:**  
As a logged-in user, I want to select a court, choose a date and time slot, and confirm my booking so that I can guarantee my playing time.

**Acceptance Criteria:**
- [ ] User can view a court's availability calendar (slots with existing `confirmed` invoices are grayed out).
- [ ] User selects: date, start time, duration (in 1-hour increments).
- [ ] Booking summary screen shows: court name, date/time, duration, payment method, total price.
- [ ] User confirms booking → an `invoice` record with `status = 'pending'` is created → proceeds to payment.
- [ ] System prevents double-booking at the DB level (no overlapping `confirmed` invoices per court).
- [ ] On payment success: `invoice.status` updated to `'confirmed'`, confirmation screen shown + email sent.

**Data:** `invoice` table — see `DATA_MODELS.md`.

**Scope Notes:**
- All times displayed in `Asia/Manila` (UTC+8).
- Minimum booking unit is 1 hour. Maximum is 8 hours.

---

## F-04 — Booking Management

**User Story:**  
As a logged-in user, I want to view and cancel my bookings so that I can manage my schedule.

**Acceptance Criteria:**
- [ ] User dashboard shows: Upcoming invoices, Past invoices.
- [ ] Each invoice card displays: court name, date/time, payment method, total paid, status badge.
- [ ] User can cancel a booking — sets `invoice.status = 'cancelled'`.
- [ ] Cancellation makes the slot available again in real-time.
- [ ] Cancelled invoices remain visible with a `Cancelled` badge.

**Data:** `invoice` table — see `DATA_MODELS.md`.

**Scope Notes:**
- Refund logic is handled by the payment service layer (abstract in Phase 1).
- Cancellation time-window policy is a future enhancement (no `cancellation_policy_hours` in current schema).

---

## F-05 — Integrated Payment

**User Story:**  
As a customer, I want to pay for my court reservation securely within the app so that I don't need to pay on-site.

**Acceptance Criteria:**
- [ ] Payment is triggered after booking confirmation.
- [ ] Payment status transitions: `pending` → `paid` / `failed`.
- [ ] Failed payment cancels the reservation hold.
- [ ] Receipt/confirmation shown on-screen and sent via email.
- [ ] Payment provider is configurable (abstract service layer — no provider hardcoded in UI).

**Scope Notes:**
- Specific payment provider (Stripe, PayMongo, GCash) TBD. Implement a `PaymentService` interface so the provider can be swapped without touching UI code.
- Phase 1 may use a mock/placeholder payment flow for demo purposes.

---

## F-06 — Facility Owner Onboarding

**User Story:**  
As a facility owner, I want to register my courts on the platform so that customers can discover and book them.

**Acceptance Criteria:**
- [ ] Owner can create a facility profile: name, address, description, contact info, operating hours.
- [ ] Owner can upload facility images (stored in Supabase Storage).
- [ ] Owner can define individual courts within a facility: court name, surface type (hardcourt/wood), indoor/outdoor, rental price per hour.
- [ ] Facility is in `pending` state until approved by Super Admin.
- [ ] Owner is notified (in-app or email) when facility is approved/rejected.

**Scope Notes:**
- A single owner account can manage multiple facilities.

---

## F-07 — Court & Schedule Management (Owner)

**User Story:**  
As a facility owner, I want to set my courts' operating hours and block off dates so that only valid slots are bookable.

**Acceptance Criteria:**
- [ ] Owner can set weekly recurring availability per court (e.g., Mon–Fri 6am–10pm).
- [ ] Owner can block specific dates/times (holidays, maintenance).
- [ ] Blocked slots are not bookable by customers.
- [ ] Owner can update court details (price, description, images) at any time.
- [ ] Changes to pricing apply only to future, unconfirmed bookings.

---

## F-08 — Owner Booking Dashboard

**User Story:**  
As a facility owner, I want to see all incoming and past bookings for my courts so that I can manage daily operations.

**Acceptance Criteria:**
- [ ] Dashboard shows: Today's bookings, Upcoming bookings, Revenue summary.
- [ ] Owner can filter bookings by court, date range, status.
- [ ] Owner can manually mark a booking as "no-show".
- [ ] Real-time update when a new booking is made.

---

## F-09 — Event & Match Scheduling

**User Story:**  
As a customer or owner, I want to create and join organized events (tournaments, casual match days) at a facility.

**Acceptance Criteria:**
- [ ] Owner or Customer can create an event tied to a facility + court.
- [ ] Events have: title, description, date/time, max participants, entry fee (optional).
- [ ] Customers can browse and join events.
- [ ] Joining an event reserves the associated time slot.
- [ ] Event organizer can see a participant list.

**Scope Notes:**
- Phase 1: Basic event listing + join. Tournament bracket management is Phase 2.

---

## F-10 — Detailed Court Profiles

**User Story:**  
As a guest or user, I want to see full details about a court before booking so that I know what to expect.

**Acceptance Criteria:**
- [ ] Court profile page displays: court name, description, and all linked items/amenities (from `court_item` + `item` tables).
- [ ] Items listed clearly: e.g., "Paddle rental available", "Electronic Scoreboard".
- [ ] Availability calendar embedded on the page (grayed-out slots = confirmed invoices).
- [ ] Court reviews section shows submitted user reviews.

**Data:** `court`, `court_item`, `item`, `reviews` tables — see `DATA_MODELS.md`.

---

## F-11 — Admin Panel

**User Story:**  
As an admin, I want to oversee all platform activity so that I can maintain quality and resolve disputes.

**Acceptance Criteria:**
- [ ] Admin can view all users and all invoices.
- [ ] Admin can create, update, and delete courts.
- [ ] Admin can manage the items lookup table (add/remove equipment/amenities).
- [ ] Admin can link/unlink items to courts.
- [ ] Admin can suspend user accounts.
- [ ] Admin can delete inappropriate reviews.
- [ ] Admin panel is only accessible to users with `role = 'admin'`.

**Data:** `profiles`, `court`, `item`, `court_item`, `invoice`, `reviews` tables.

---

## F-12 — Real-Time Availability

**User Story:**  
As any user, I want court availability to reflect the latest state without requiring a page refresh.

**Acceptance Criteria:**
- [ ] Booking a slot immediately marks it as unavailable for all concurrent users.
- [ ] Supabase Realtime subscription used on availability calendar components.
- [ ] No polling — event-driven updates only.

---

## F-13 — Notifications

**User Story:**  
As a user, I want to receive timely notifications about my bookings so that I never miss an appointment.

**Acceptance Criteria:**
- [ ] User: booking confirmation email when invoice transitions to `'confirmed'`.
- [ ] User: cancellation confirmation email.
- [ ] Notifications delivered via Supabase Auth email or SMTP integration.
- [ ] In-app notification bell (Phase 2: push notifications).

---

## F-14 — Court Reviews

**User Story:**  
As a user who has played at a court, I want to leave a review so that other players can make informed decisions.

**Acceptance Criteria:**
- [ ] Authenticated users can submit a review (title optional, description required) for any court.
- [ ] One review per user per court — duplicate submission returns an error.
- [ ] Reviews are publicly visible on the court profile page (F-10).
- [ ] User can delete their own review.
- [ ] Admin can delete any review.
- [ ] Reviews display: reviewer username, title, description, date posted.

**Data:** `reviews` table — see `DATA_MODELS.md`.

**API:** `GET /api/courts/[id]/reviews`, `POST /api/courts/[id]/reviews`, `DELETE /api/reviews/[id]` — see `API_SPEC.md`.

**Scope Notes:**
- Star ratings are a Phase 2 enhancement (no `rating` column in current schema).
- A review should ideally be restricted to users who have a `confirmed` invoice for that court — Phase 2 enforcement.
