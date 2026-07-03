# DATA_MODELS.md — Pickle All Entity Definitions

> **Status:** Updated to reflect `schema.md` (v1 — team-designed normalized schema).  
> **Audience:** AI coding agents, backend/DB developers.  
> **Source of truth:** [`schema.md`](./schema.md) is the authoritative conceptual schema. This file is the **Supabase implementation guide** derived from it. Agents must not invent table or column names that contradict either document.

---

## Supabase Adaptation Notes

The team's `schema.md` uses a traditional relational design (SERIAL PKs, plain `user` table with hashed passwords). Supabase requires the following adaptations — do not treat these as contradictions, they are implementation-layer decisions:

| schema.md convention | Supabase implementation |
|---|---|
| `SERIAL` integer PKs | `uuid DEFAULT gen_random_uuid()` — Supabase requires UUIDs for RLS and auth integration |
| `user` table with `password` column | `auth.users` (Supabase-managed) + `profiles` public table — Supabase handles password hashing; do NOT store passwords in any custom table |
| `INTEGER` foreign keys | `uuid` foreign keys referencing the UUID PK of the related table |
| `DATE` + `TIME` split columns (invoice) | Single `timestamptz` columns (UTC) — recombined as `start_at` / `end_at` |
| `VARCHAR(n)` | `text` — Postgres `text` is preferred in Supabase; length validation is handled in application layer |

---

## Conventions

- All tables use UUID primary keys: `id uuid DEFAULT gen_random_uuid() PRIMARY KEY`.
- All timestamps stored as `timestamptz` (UTC). Display in `Asia/Manila` (UTC+8).
- RLS (Row-Level Security) enabled on all tables.
- `created_at timestamptz NOT NULL DEFAULT now()` present on all tables.
- `updated_at timestamptz NOT NULL DEFAULT now()` present on mutable tables.

---

## Entity Relationship Overview

```
auth.users (Supabase-managed)
    │
    └──< profiles (1:1)           ← maps to schema.md `user` table
            │
            ├──< invoices (1:many, via user_id)
            │       │
            │       └── court (many:1, via court_id)
            │
            └──< reviews (1:many, via user_id)
                    │
                    └── court (many:1, via court_id)

court ──< court_item (many:many junction)
item  ──< court_item
```

> **Not yet in schema.md (deferred):** `facilities`, `availability_blocks`, `events`, `event_participants`. These were initially planned and may be added in a later schema revision. Do not implement them until the schema is updated.

---

## Table: `profiles`

**Derived from:** `schema.md → user`

Extends Supabase `auth.users`. Created automatically on user sign-up via a Postgres trigger. The `password` column from the conceptual schema is omitted — Supabase Auth handles password hashing internally.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `uuid` | PK, FK → `auth.users.id` | Matches Supabase Auth UID |
| `username` | `text` | NOT NULL, UNIQUE | Display handle |
| `role` | `text` | NOT NULL, CHECK(`role` IN ('user','admin','owner')), DEFAULT `'user'` | `'user'` = customer; `'admin'` = platform admin; `'owner'` = court owner |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT now() | |
| `updated_at` | `timestamptz` | NOT NULL, DEFAULT now() | |

> **Role values:** The schema defines `'user'`, `'admin'`, and `'owner'`. Super Admin is assigned manually via Supabase dashboard.

---

## Table: `court`

**Derived from:** `schema.md → court`

An individual bookable pickleball court. Courts are standalone — there is no `facilities` grouping in the current schema.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `uuid` | PK | |
| `court_name` | `text` | NOT NULL, UNIQUE | Display name e.g. "Court A" |
| `description` | `text` | NULLABLE | Long-form description |
| `location` | `text` | NULLABLE | City/barangay text (e.g. `'BGC, Taguig'`). No GPS in Phase 1. |
| `price_per_hour` | `numeric(10,2)` | NULLABLE | Rental rate in PHP per hour. NULL = price on request. |
| `court_type` | `text` | NULLABLE, CHECK(`court_type` IN ('indoor','outdoor')) | Surface/environment type. |
| `status` | `text` | NOT NULL, CHECK(`status` IN ('active','maintenance','hidden')), DEFAULT `'active'` | Court visibility/booking state. |
| `owner_id` | `uuid` | FK → `profiles.id` NULLABLE | The owner of the court |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT now() | |
| `updated_at` | `timestamptz` | NOT NULL, DEFAULT now() | |

---

## Table: `court_operating_hours`

**Derived from:** `schema.md → court_operating_hours`

Stores the weekly recurring schedule for a court.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `uuid` | PK | |
| `court_id` | `uuid` | FK → `court.id` NOT NULL (CASCADE) | |
| `day_of_week` | `integer` | NOT NULL, CHECK(`day_of_week` >= 0 AND `day_of_week` <= 6) | 0 = Sunday, 6 = Saturday |
| `open_time` | `time` | NULLABLE | e.g. `'06:00:00'` |
| `close_time` | `time` | NULLABLE | e.g. `'22:00:00'` |
| `is_open` | `boolean` | NOT NULL, DEFAULT `true` | If false, closed all day |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT now() | |
| `updated_at` | `timestamptz` | NOT NULL, DEFAULT now() | |

**Recommended constraint:** UNIQUE `(court_id, day_of_week)`.

---

## Table: `court_closed_dates`

**Derived from:** `schema.md → court_closed_dates`

Stores specific dates (exceptions) when the court is closed.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `uuid` | PK | |
| `court_id` | `uuid` | FK → `court.id` NOT NULL (CASCADE) | |
| `closed_date` | `date` | NOT NULL | e.g. `'2026-10-15'` |
| `reason` | `text` | NULLABLE | e.g. `'Holiday'` |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT now() | |

**Recommended constraint:** UNIQUE `(court_id, closed_date)`.

---

## Table: `item`

**Derived from:** `schema.md → item`

Lookup table for all equipment and amenities that can be associated with a court.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `uuid` | PK | |
| `item_name` | `text` | NOT NULL, UNIQUE | e.g., `'Paddle'`, `'Ball'`, `'Electronic Scoreboard'` |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT now() | |

---

## Table: `court_item`

**Derived from:** `schema.md → court_item`

Junction table linking courts to their available items (Many-to-Many). The combination of `court_id` + `item_id` is unique — the same item cannot be linked to the same court twice.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `court_id` | `uuid` | PK (composite), FK → `court.id` NOT NULL | |
| `item_id` | `uuid` | PK (composite), FK → `item.id` NOT NULL | |

**Composite PK:** `(court_id, item_id)`

---

## Table: `booking`

**Derived from:** `schema.md → booking`

Stores court reservations. Manages the scheduling aspect.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `uuid` | PK | |
| `user_id` | `uuid` | FK → `profiles.id` NOT NULL | The customer who booked |
| `court_id` | `uuid` | FK → `court.id` NOT NULL | The booked court |
| `start_at` | `timestamptz` | NOT NULL | UTC |
| `end_at` | `timestamptz` | NOT NULL | UTC |
| `status` | `text` | NOT NULL, CHECK IN (`'pending'`,`'confirmed'`,`'cancelled'`,`'no_show'`), DEFAULT `'pending'` | Booking lifecycle status |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT now() | |
| `updated_at` | `timestamptz` | NOT NULL, DEFAULT now() | |

**Uniqueness constraint:** No two `confirmed` bookings on the same `court_id` may have overlapping `start_at`/`end_at` intervals.

---

## Table: `invoice`

**Derived from:** `schema.md → invoice`

Stores financial transactions linked to a specific booking.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `uuid` | PK | |
| `booking_id` | `uuid` | FK → `booking.id` NOT NULL (CASCADE) | The associated booking |
| `payment_method` | `text` | NOT NULL | e.g., `'Credit Card'`, `'Cash'`, `'GCash'` |
| `payment_total` | `numeric(10,2)` | NOT NULL | Total amount (PHP) |
| `status` | `text` | NOT NULL, CHECK IN (`'unpaid'`,`'paid'`,`'refunded'`), DEFAULT `'unpaid'` | Payment status |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT now() | |
| `updated_at` | `timestamptz` | NOT NULL, DEFAULT now() | |

---

## Table: `reviews`

**Derived from:** `schema.md → reviews`

User-generated reviews for specific courts. A user may review a court after completing a booking.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `uuid` | PK | |
| `user_id` | `uuid` | FK → `profiles.id` NOT NULL | Reviewer |
| `court_id` | `uuid` | FK → `court.id` NOT NULL | Reviewed court |
| `title` | `text` | NULLABLE | Short headline |
| `description` | `text` | NOT NULL | Review body |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT now() | |
| `updated_at` | `timestamptz` | NOT NULL, DEFAULT now() | |

**Recommended constraint:** One review per `(user_id, court_id)` pair — UNIQUE `(user_id, court_id)`.

---

## TypeScript Interface Conventions

All DB row types live in `client/types/database.ts`. Use the Supabase CLI to auto-generate them:

```bash
npx supabase gen types typescript --project-id <project-id> > client/types/database.ts
```

Re-run this command whenever the Supabase schema changes. Do **not** manually edit `database.ts`.

---

## Deferred / Not Yet in Schema

These entities were in early planning but are **not part of the current `schema.md`**. Do not implement them until the schema is formally updated:

| Entity | Original Purpose | Status |
|---|---|---|
| `facilities` | Group courts under a physical location with an owner | ⏳ Deferred |
| `availability_blocks` | Owner-defined recurring open/blocked hours | ⏳ Deferred |
| `events` | Organized matches and tournaments | ⏳ Deferred |
| `event_participants` | Event join records | ⏳ Deferred |
