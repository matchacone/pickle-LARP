# Unit Testing Strategy & Feature Plan

This document outlines the comprehensive unit testing strategy for the PickleAll application, using **Vitest** and **React Testing Library**. The tests are separated by architectural category, detailing exactly what features and edge cases must be covered.

## Universal Bug Categories

Across all the testing categories below, we will specifically target these common classes of bugs:

1. **Edge Case & Boundary Errors**: Testing zero, negative numbers, extremely large inputs, and off-by-one errors (e.g., booking durations that cross midnight, zero-dollar invoices).
2. **State & Concurrency Issues**: Testing race conditions, double-booking prevention, and stale UI state (e.g., booking a court slot at the exact same time as another user).
3. **Null/Undefined & Invalid Data**: Ensuring the app gracefully handles missing parameters, malformed JSON, and unexpected null values from the database or API.
4. **Security & Authorization Bypasses**: Verifying that IDOR (Insecure Direct Object Reference) is prevented, roles cannot be spoofed, and signatures (like payment webhooks) are strictly validated.
5. **Type & Formatting Errors**: Catching unexpected type coercions (string vs number for prices) and unescaped entities that could break the UI.

## 1. Database Queries (Data Access Layer)

Testing the Drizzle ORM queries is critical as they handle the core business logic and state of the application. Since we decided to use Vitest, we will **mock the database responses** to keep these tests fast, deterministic, and isolated.

### `bookingQueries.ts`
- **Conflict Prevention**: Test that attempting to book a time slot that overlaps with an existing `confirmed` or `pending` booking correctly rejects or calculates as unavailable.
- **Owner Filtering**: Test `getOwnerBookings` to ensure it only returns bookings for courts owned by the specific `ownerId`.
- **Status Updates**: Test that cancelling a booking correctly updates its status without affecting the associated invoice implicitly (unless logic dictates).

### `courtQueries.ts`
- **Search & Filtering**: Test `getAllCourts` to ensure that filtering by `indoor` vs `outdoor` or searching by text correctly applies the SQL `ilike` and `eq` clauses.
- **Availability Generation**: Test that `getCourtAvailability` accurately merges `courtOperatingHours`, `courtClosedDates`, and active `bookings` to return only the genuinely free time slots.

### `paymentQueries.ts`
- **Invoice Retrieval**: Test that `getInvoiceById` returns the invoice + joined booking data.

---

## 2. API Routes (Server Logic)

We will test the Next.js API Route Handlers directly by mocking the `NextRequest` and verifying the `NextResponse` outputs.

### `/api/payments/webhook`
- **Signature Validation**: Test that requests without a valid payment provider signature are rejected with a `401 Unauthorized`.
- **Successful Payment**: Test that a successful webhook payload correctly calls `markInvoiceAsPaid` and updates the underlying booking to `confirmed`.
- **Failed Payment**: Test that a failed payment webhook updates the invoice status to `failed` and booking to `cancelled`.

### `/api/courts/[id]/availability`
- **Missing Parameters**: Test that requests without a `date` parameter return a `400 Bad Request`.
- **Correct Data Serialization**: Test that the endpoint returns the structured JSON expected by the frontend calendar component.

---

## 3. UI Components (React Testing Library)

UI components will be tested in isolation to ensure they render correctly given specific props, and that user interactions trigger the correct state changes.

### `AvailabilityCalendar.tsx`
- **Disabled Slots**: Test that hours falling outside operating hours or overlapping with existing bookings are `disabled` and unclickable.
- **Duration Stepper**: Test that the user cannot increase the duration if the subsequent hour is already booked.
- **Price Calculation**: Test that increasing the duration correctly updates the `Total Amount` displayed based on the `pricePerHour` prop.

### `CustomerBookingsList.tsx`
- **Pay Now Button**: Test that the "Pay Now" button is ONLY rendered when an invoice status is `unpaid` AND the booking start time has not passed.
- **Empty State**: Test that an empty state message is shown if the user has no bookings.

### `OwnerDashboardOverview.tsx`
- **Revenue Calculation**: Test that the total revenue metric correctly sums up only `paid` invoices.
- **Date Filtering**: Test that changing the timeframe toggle (e.g., "Last 7 Days" vs "Last 30 Days") correctly updates the displayed metrics (mocking the date).

### `CourtGrid.tsx` & `CourtCard.tsx`
- **Search Filtering**: Test that typing into the search bar dynamically filters the rendered list of `CourtCard`s.
- **Tag Rendering**: Test that amenities are rendered as badges correctly on the card.

---

## 4. Authentication & Security

### `adminAuth.ts` & `layout.tsx` Guards
- **Role Verification**: Test the `requireAdmin` and `requireOwner` helper functions to ensure they return a `redirect` response when a user with a `user` role attempts to access them.
- **Valid Access**: Test that providing a mocked session with the correct role returns an `ok: true` response.

---

## Open Questions for You
> [!IMPORTANT]
> 1. **Database Mocking Tooling**: I plan to use `vitest-mock-extended` to mock the Drizzle `db` object cleanly. Are you comfortable adding this as a dev dependency?
> 2. **Priority**: Which of these 4 categories would you like me to implement tests for first? (I highly recommend starting with the UI Components or the Database Queries).
