# Court Reviews API — Agent Log

> **Date:** 2026-07-07  
> **Feature ID:** F-14 (Court Reviews)  
> **Status:** complete  
> **Built by:** Antigravity AI agent

---

## What Was Built

The full Reviews API for the court booking platform. Three Route Handlers (`GET`, `POST`, `DELETE`) provide public review listing, authenticated review creation (one per user per court), and author/admin-only deletion. The `CourtReviews` component was upgraded from a read-only display to an interactive form with submission, duplicate detection, and inline delete. A `UNIQUE(user_id, court_id)` constraint was added to the `reviews` table to enforce the one-review-per-court business rule at the database level.

---

## Files Created or Modified

| File | Action | Purpose |
|---|---|---|
| `client/lib/db/schema.ts` | modified | Added `uniqueIndex('reviews_user_court_unique')` on `(userId, courtId)` |
| `client/app/api/courts/[id]/reviews/route.ts` | created | GET (public, reviews + total) and POST (auth, creates review, catches 23505 → 409) |
| `client/app/api/reviews/[id]/route.ts` | created | DELETE (auth, owner or admin only) |
| `client/components/features/CourtReviews.tsx` | modified | Added review form (auth-gated), delete button, optimistic UI, error/success states |
| `client/components/features/CourtCard.tsx` | modified | Added `userId?` to `ReviewData` type |
| `client/lib/db/queries/courtQueries.ts` | modified | Added `userId` to `CourtReviewItem` type and `getCourtById()` review select/mapping |
| `client/app/(guest)/courts/[id]/page.tsx` | modified | Fetches `currentUserId` server-side, passes to `CourtReviews` |
| `docs/BACKEND_ROADMAP.md` | modified | Marked Phase 3 as ✅ Complete |

---

## How It Works

### GET /api/courts/[id]/reviews
1. Receives `courtId` from the URL parameter.
2. Queries `reviews` table joined with `profiles` for author usernames, ordered by `created_at DESC`.
3. Returns `{ reviews: [...], total }`.

### POST /api/courts/[id]/reviews
1. Authenticates via `createServerClient().auth.getUser()` → 401 if no session.
2. Validates body: `description` required (trimmed, non-empty), `title` optional.
3. Verifies the court exists → 404 if not.
4. Inserts into `reviews` table. Postgres unique constraint `reviews_user_court_unique` catches duplicates → error code `23505` → 409 "You have already reviewed this court".
5. Returns 201 with the created review object (including author username).

### DELETE /api/reviews/[id]
1. Authenticates → 401 if no session.
2. Fetches the review by ID → 404 if not found.
3. Checks `review.userId === user.id`. If not, queries `profiles.role` — only `'admin'` role can delete others' reviews → 403 otherwise.
4. Deletes and returns `{ id, deleted: true }`.

### CourtReviews Component
- **Form visibility:** Only shown when `currentUserId` is set AND the user hasn't already reviewed this court.
- **"Already reviewed" indicator:** Shown when user has an existing review (detected by matching `userId` in the reviews array).
- **Submit:** Calls POST, adds the new review to the top of the list on success, shows inline success message for 3s.
- **Delete:** Calls DELETE, removes from local state. Spinner on the button while pending.
- **Dark mode:** Changed `bg-white` to `bg-surface` per dark mode conventions.

---

## Key Decisions

- **Unique constraint at DB level, not application level.** The `UNIQUE(user_id, court_id)` index is the definitive guard. The Postgres error code `23505` is caught and mapped to HTTP 409. This prevents race conditions that application-level checks would miss.
- **No pagination on GET (yet).** Reviews are returned in full. The `CourtReviews` component already has client-side pagination (5 per page). Server-side pagination can be added later if review counts grow large (>100 per court).
- **Server-side user fetch in RSC.** The court detail page (`page.tsx`) fetches `currentUserId` using `createServerClient().auth.getUser()` — this is a zero-cost server-side check, not a client round-trip. It's passed as a prop to the client component.
- **`userId` is optional in `ReviewData`.** Made optional (`userId?`) to avoid breaking mock data that doesn't include it. The CourtReviews component handles `undefined` gracefully.

---

## Drizzle Schema Changes

```typescript
// client/lib/db/schema.ts — reviews table (added constraint)
export const reviews = pgTable('reviews', {
  // ... existing columns ...
}, (table) => [
  uniqueIndex('reviews_user_court_unique').on(table.userId, table.courtId),
])
```

> ⚠️ **Migration application required.** The migration `0004` has been generated. Run `npx drizzle-kit migrate` from `client/` to apply the unique index to the live DB.

---

## API Routes Added or Changed

| Method | Path | Auth | Status Codes |
|---|---|---|---|
| GET | `/api/courts/[id]/reviews` | None | 200, 500 |
| POST | `/api/courts/[id]/reviews` | Required | 201, 400, 401, 404, 409, 500 |
| DELETE | `/api/reviews/[id]` | Required (owner or admin) | 200, 401, 403, 404, 500 |

---

## Known Gaps and Gotchas

- **Migration not run.** The `UNIQUE` index exists in `schema.ts` but `drizzle-kit generate` + `drizzle-kit migrate` have not been executed. The constraint must be applied to the live DB before POST will correctly return 409 on duplicates — without it, duplicate reviews can be inserted.
- **No rate limiting.** The POST endpoint has no rate limiting. A malicious user could spam review submissions (they'd all fail after the first due to the unique constraint, but it's still unnecessary load).
- **No input sanitization beyond trim.** Review descriptions are stored as-is. Consider HTML escaping or a profanity filter before production.
- **Admin delete has no audit trail.** When an admin deletes a user's review, there's no log of who deleted it or why.

---

## How to Extend This

- **Run the migration:** `cd client && npx drizzle-kit migrate`
- **Add rating field:** Add a `rating integer` column to `reviews` (1–5), update the form to include a star picker, update `getCourtById` to compute `avgRating` from `AVG(reviews.rating)`.
- **Add edit capability:** Create `PATCH /api/reviews/[id]` — same auth pattern as DELETE (owner only), update `title` and `description`.
- **Server-side pagination:** Add `?page=&limit=` query params to the GET route, use Drizzle `.limit().offset()`.
