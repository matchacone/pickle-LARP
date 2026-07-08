# Payment Service — Agent Log

> **Date:** 2026-07-08  
> **Feature ID:** F-05 (Payment)  
> **Status:** complete  
> **Built by:** Antigravity AI agent

---

## What Was Built

The full mock payment flow for Phase 5 of the backend roadmap. This includes the `PaymentService` abstraction layer (interface + factory), a mock implementation, two new API endpoints (`POST /api/payments/initiate` and `POST /api/payments/webhook`), a shared payment query layer with transactional status updates, and a mock payment page that simulates a hosted checkout. The existing checkout page was wired to redirect through the payment flow instead of showing an inline success state.

---

## Files Created or Modified

| File | Action | Purpose |
|---|---|---|
| `client/lib/payment/index.ts` | created | `PaymentService` interface + `getPaymentService()` singleton factory |
| `client/lib/payment/mock.ts` | created | Mock implementation — returns `/mock-payment` checkout URL, trusts webhook payload |
| `client/lib/db/queries/paymentQueries.ts` | created | `getInvoiceForPayment()`, `confirmPayment()`, `failPayment()` — transactional Drizzle queries |
| `client/app/api/payments/initiate/route.ts` | created | `POST /api/payments/initiate` — authenticated, validates ownership, calls PaymentService |
| `client/app/api/payments/webhook/route.ts` | created | `POST /api/payments/webhook` — public, verifies webhook, updates invoice + booking status |
| `client/app/(checkout)/mock-payment/page.tsx` | created | Simulated payment checkout page with Pay Now / Cancel buttons |
| `client/app/(checkout)/checkout/page.tsx` | modified | Wired `handleConfirm` to call `/api/payments/initiate` then redirect to checkout URL |
| `docs/BACKEND_ROADMAP.md` | modified | Marked Phase 5 as complete |

---

## How It Works

### Payment Flow (happy path)

1. User selects a court + time slot → lands on `/checkout`
2. User clicks **"Confirm & Pay"** → checkout page calls `POST /api/bookings` (creates booking + invoice)
3. Checkout page calls `POST /api/payments/initiate` with `{ invoice_id }` → receives `{ checkout_url }`
4. User is redirected to the `checkout_url` (for mock: `/mock-payment?invoice_id=...&amount=...`)
5. User clicks **"Pay Now"** → mock payment page calls `POST /api/payments/webhook` with `{ invoice_id, status: 'paid' }`
6. Webhook handler calls `confirmPayment()` → `invoice.status = 'paid'`, `booking.status = 'confirmed'`
7. User is redirected to `/my-bookings`

### Failure Flow

- User clicks **"Cancel"** on mock payment → webhook receives `{ status: 'failed' }` → `booking.status = 'cancelled'`
- Invoice remains `'unpaid'`
- User redirected to `/courts`

### Architecture

```
Checkout Page → POST /api/bookings → POST /api/payments/initiate
                                        ↓
                                  PaymentService.initiatePayment()
                                        ↓
                                  Redirect → /mock-payment
                                        ↓
                                  POST /api/payments/webhook
                                        ↓
                                  PaymentService.verifyWebhook()
                                        ↓
                                  confirmPayment() / failPayment()
```

---

## Key Decisions

- **`PaymentService` interface is the single contract.** All callers import from `lib/payment/index.ts`. Swapping to a real provider (Stripe, PayMongo) means implementing the interface and changing the factory — zero caller changes.
- **`require()` for lazy import in factory.** The factory uses `require('./mock')` to avoid a top-level import of the mock when a real provider is used. This is the simplest swap mechanism.
- **Webhook is public (no auth).** Payment providers POST directly to webhooks — they don't carry user session cookies. The `verifyWebhook()` method is responsible for payload authentication (signature check). The mock trusts the payload; production implementations must verify the signature.
- **Idempotent webhook handling.** If the invoice is already `'paid'`, the webhook returns `{ received: true }` without error. This prevents duplicate processing from provider retries.
- **Mock page lives in `(checkout)` route group.** Co-located with the checkout page. In production, this page is never served — the real provider's hosted page is used instead.
- **Checkout success state is now an edge case.** The normal flow redirects to `/mock-payment` → `/my-bookings`. The inline "Booking Created" state only appears if payment initiation fails after booking creation.

---

## API Routes Added or Changed

| Method | Path | Change |
|---|---|---|
| POST | `/api/payments/initiate` | Created — authenticates, validates invoice ownership + status, calls PaymentService |
| POST | `/api/payments/webhook` | Created — verifies webhook, transitions invoice/booking status in transaction |

---

## Known Gaps and Gotchas

- **Mock payment page is demo-only.** It directly calls the webhook endpoint from the client. A real provider would POST to the webhook from their servers. This is intentional for local development.
- **No payment retry from My Bookings.** If a booking is in `'pending'` state with an `'unpaid'` invoice, there's no UI to re-initiate payment from the bookings list. Build a "Pay Now" button in My Bookings when needed.
- **No payment provider credentials.** Switching to a real provider requires: (1) implementing `PaymentService`, (2) adding API keys to `.env.local`, (3) changing the factory import in `lib/payment/index.ts`.
- **Webhook signature verification is a no-op in mock.** The `x-webhook-signature` header is read but not validated. Production implementations must verify against the provider's secret.
- **`require()` in factory triggers ESLint.** The `eslint-disable` comment is necessary for the dynamic require pattern. When switching to a real provider, this can be replaced with a static import.

---

## How to Extend This

1. **Add a real payment provider:** Create `lib/payment/stripe.ts` (or `paymongo.ts`) implementing `PaymentService`. Update the factory in `lib/payment/index.ts` to return the new implementation. Add provider credentials to `.env.local`.
2. **Add payment retry in My Bookings:** In the bookings list, check for `invoice.status === 'unpaid'` and render a "Pay Now" button that calls `POST /api/payments/initiate`.
3. **Add payment receipt page:** After successful payment, redirect to `/booking-confirmed/[id]` instead of `/my-bookings` for a richer confirmation experience.
4. **Add refund support:** Extend `PaymentService` with a `refundPayment()` method. Call it from `cancelBooking()` when the invoice is `'paid'`.
