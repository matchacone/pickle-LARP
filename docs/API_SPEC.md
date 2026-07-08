# API_SPEC.md — Pickle All API Contract

> **Status:** Living document — update whenever a route is added, changed, or removed.  
> **Audience:** AI coding agents, frontend developers.  
> **Note:** This project uses Next.js Route Handlers (`app/api/`) as the thin server-side API layer. Supabase is called directly from the client or via these handlers. This document covers **Next.js Route Handlers only** — Supabase client calls are governed by `DATA_MODELS.md` and RLS policies.

---

## Conventions

- **Base URL:** `/api` (relative, same origin)
- **Auth:** All protected routes require a valid Supabase session cookie. Pass the session via `Authorization: Bearer <token>` or via cookie (handled automatically by `@supabase/ssr`).
- **Request/Response format:** `application/json`
- **Error format:**
  ```json
  {
    "error": "Human-readable message",
    "code": "MACHINE_READABLE_CODE"
  }
  ```
- **Status codes:** Standard HTTP. `401` = unauthenticated, `403` = unauthorized role, `422` = validation error, `409` = conflict.
- **Timestamps:** ISO 8601 UTC strings (`2025-01-15T08:00:00Z`). Display in `Asia/Manila` on the client.
- **Currency:** All monetary values in PHP (Philippine Peso) as `number` with 2 decimal places.
- **Roles:** `'user'` (customer) and `'admin'` (platform admin). See `DATA_MODELS.md → profiles`.

---

## Route Index

| Method | Path | Auth | Role | Description |
|---|---|---|---|---|
| POST | `/api/auth/callback` | — | — | Supabase OAuth callback handler |
| POST | `/api/bookings` | ✓ | user | Create a booking + invoice |
| GET | `/api/bookings` | ✓ | user | List user's bookings |
| GET | `/api/bookings/[id]` | ✓ | user | Single booking detail |
| PATCH | `/api/bookings/[id]` | ✓ | user | Cancel a booking |
| GET | `/api/courts/[id]/availability` | — | — | Get booked slots for a date |
| POST | `/api/payments/initiate` | ✓ | user | Initiate payment for an invoice |
| POST | `/api/payments/webhook` | — | — | Payment provider webhook |
| POST | `/api/courts` | ✓ | admin | Create a court |
| PATCH | `/api/courts/[id]` | ✓ | admin | Update court details |
| DELETE | `/api/courts/[id]` | ✓ | admin | Delete a court |
| POST | `/api/courts/[id]/items` | ✓ | admin | Link an item to a court |
| DELETE | `/api/courts/[id]/items/[itemId]` | ✓ | admin | Remove an item from a court |
| POST | `/api/items` | ✓ | admin | Create an equipment/amenity item |
| GET | `/api/courts/[id]/reviews` | — | — | Get reviews for a court |
| POST | `/api/courts/[id]/reviews` | ✓ | user | Submit a review for a court |
| DELETE | `/api/reviews/[id]` | ✓ | user / admin | Delete own review (or any, if admin) |
| POST | `/api/admin/users/[id]/suspend` | ✓ | admin | Suspend a user account |

---

## Route Definitions

---

### `POST /api/auth/callback`

Handles the OAuth redirect from Supabase. Standard Supabase SSR callback — do not modify without reading the Supabase SSR docs.

**No custom request/response body.** Redirects to `/` on success or `/login?error=...` on failure.

---

### `POST /api/invoices`

Creates a new booking invoice. Server-side validation prevents double-booking.

**Request Body:**
```json
{
  "court_id": "uuid",
  "start_at": "2025-08-01T08:00:00Z",
  "end_at": "2025-08-01T10:00:00Z",
  "payment_method": "Credit Card"
}
```

**Validation Rules:**
- `start_at` must be before `end_at`.
- Duration must be a whole number of hours (1–8 hours).
- `start_at` must be in the future.
- No overlapping `confirmed` invoice exists for this `court_id`.
- `payment_method` must be a non-empty string.

**Response `201`:**
```json
{
  "id": "uuid",
  "status": "pending",
  "payment_total": 500.00,
  "court_id": "uuid",
  "start_at": "2025-08-01T08:00:00Z",
  "end_at": "2025-08-01T10:00:00Z",
  "payment_method": "Credit Card"
}
```

**Response `409`:** Slot no longer available (double-booking conflict).

---

### `DELETE /api/invoices/[id]`

Cancels an existing booking. Only the user who created it can cancel.

**Path Params:** `id` — invoice UUID

**Validation Rules:**
- Invoice must belong to the authenticated user.
- Invoice `status` must be `'pending'` or `'confirmed'`.

**Response `200`:**
```json
{
  "id": "uuid",
  "status": "cancelled"
}
```

---

### `POST /api/payments/initiate`

Initiates a payment session with the configured payment provider for a pending invoice.

**Request Body:**
```json
{
  "invoice_id": "uuid"
}
```

**Validation Rules:**
- Invoice must belong to the authenticated user.
- Invoice `status` must be `'pending'`.

**Response `200`:**
```json
{
  "provider": "mock",
  "checkout_url": "https://payment-provider.com/checkout/...",
  "amount": 500.00,
  "currency": "PHP"
}
```

> **Agent Note:** The `PaymentService` interface lives in `client/lib/payment/index.ts`. Call that — never call any payment SDK directly from a Route Handler.

---

### `POST /api/payments/webhook`

Receives payment status callbacks from the payment provider. Verifies the webhook signature and updates `invoice.status`.

**Headers:** Provider-specific signature header (e.g., `x-paymongo-signature`).

**Request Body:** Provider-specific webhook payload (pass through as-is — do not normalize in the handler).

**Response `200`:** `{ "received": true }`

**Security:** Webhook signature must be verified before processing. Reject with `400` if signature is invalid.

On success: set `invoice.status = 'confirmed'`. On failure: set `invoice.status = 'cancelled'`.

---

### `POST /api/courts`

Creates a new bookable court. Admin only.

**Request Body:**
```json
{
  "court_name": "string (required)",
  "description": "string (optional)"
}
```

**Response `201`:**
```json
{
  "id": "uuid",
  "court_name": "Court A",
  "description": null
}
```

---

### `PATCH /api/courts/[id]`

Updates court details. Admin only. Partial updates accepted.

**Request Body:** Any subset of `{ court_name, description }`.

**Response `200`:** Updated court object.

---

### `DELETE /api/courts/[id]`

Deletes a court. Admin only. Only allowed if no `confirmed` invoices reference this court.

**Response `200`:** `{ "id": "uuid", "deleted": true }`

**Response `409`:** Court has active confirmed bookings — deletion blocked.

---

### `POST /api/courts/[id]/items`

Links an existing item (equipment/amenity) to a court. Admin only.

**Path Params:** `id` — court UUID

**Request Body:**
```json
{
  "item_id": "uuid"
}
```

**Response `201`:** `{ "court_id": "uuid", "item_id": "uuid" }`

**Response `409`:** Item already linked to this court.

---

### `DELETE /api/courts/[id]/items/[itemId]`

Removes an item link from a court. Admin only.

**Response `200`:** `{ "court_id": "uuid", "item_id": "uuid", "removed": true }`

---

### `POST /api/items`

Creates a new equipment/amenity item in the lookup table. Admin only.

**Request Body:**
```json
{
  "item_name": "string (required)"
}
```

**Response `201`:**
```json
{
  "id": "uuid",
  "item_name": "Paddle"
}
```

**Response `409`:** Item name already exists.

---

### `GET /api/courts/[id]/reviews`

Returns all reviews for a specific court. Public — no auth required.

**Path Params:** `id` — court UUID

**Response `200`:**
```json
{
  "reviews": [
    {
      "id": "uuid",
      "title": "Great court!",
      "description": "Very clean, well maintained.",
      "user": { "id": "uuid", "username": "jbryce" },
      "created_at": "2025-07-20T10:00:00Z"
    }
  ],
  "total": 1
}
```

---

### `POST /api/courts/[id]/reviews`

Submits a review for a court. Authenticated users only.

**Path Params:** `id` — court UUID

**Request Body:**
```json
{
  "title": "string (optional)",
  "description": "string (required)"
}
```

**Validation Rules:**
- `description` must not be empty.
- User must not have an existing review for this court (one review per user per court).

**Response `201`:**
```json
{
  "id": "uuid",
  "court_id": "uuid",
  "title": "Great court!",
  "description": "Very clean, well maintained.",
  "created_at": "2025-07-20T10:00:00Z"
}
```

**Response `409`:** User has already reviewed this court.

---

### `DELETE /api/reviews/[id]`

Deletes a review. A user can delete their own review. An admin can delete any review.

**Path Params:** `id` — review UUID

**Response `200`:** `{ "id": "uuid", "deleted": true }`

**Response `403`:** Authenticated user does not own this review and is not an admin.

---

### `POST /api/admin/users/[id]/suspend`

Suspends a user account. Admin only.

**Request Body:**
```json
{
  "reason": "string (optional)"
}
```

**Response `200`:** `{ "id": "uuid", "suspended": true }`

---

## Supabase Direct Client Calls (No Route Handler)

The following operations are performed **directly** via the Supabase JS client because RLS alone is sufficient:

| Operation | Table | Notes |
|---|---|---|
| Fetch all courts | `court` + `court_item` + `item` | Public read — guest accessible |
| Fetch single court | `court` | Public read |
| Fetch own invoices | `invoice` | RLS: `user_id = auth.uid()` |
| Fetch all invoices (admin) | `invoice` | RLS: role = 'admin' |
| Fetch court reviews | `reviews` | Public read |
| Realtime invoice updates | `invoice` channel | Subscribe in booking components |

---

## Removed / Deferred Routes

These routes existed in an earlier version of this spec but were removed because the corresponding tables are not in the current `schema.md`:

| Route | Reason Removed |
|---|---|
| `POST /api/facilities` | `facilities` table not in schema — deferred |
| `PATCH /api/facilities/[id]` | Same |
| `POST /api/facilities/[id]/courts` | Same |
| `POST /api/admin/facilities/[id]/approve` | Same |
| `POST /api/admin/facilities/[id]/reject` | Same |
