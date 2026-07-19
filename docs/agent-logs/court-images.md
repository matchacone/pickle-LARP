# Real Court Images — Agent Log

> **Date:** 2026-07-20  
> **Feature ID:** F-07 (implicit)  
> **Status:** complete  
> **Built by:** Antigravity

---

## What Was Built

Added end-to-end support for facility owners to upload real images of their pickleball courts from the Owner Dashboard (`/my-court`). These uploaded images are instantly visible to guests on the court listing cards and court details pages, replacing the fallback procedural geometric art.

---

## Files Created or Modified

| File | Action | Purpose |
|---|---|---|
| `client/lib/db/schema.ts` | modified | Added `images` array column to `court` table. |
| `client/tmp-create-court-images.ts` | created | Setup script for public `court_images` Supabase bucket. |
| `client/app/api/owner/my-court/route.ts` | modified | Added `images` to PUT request handler. |
| `client/lib/db/queries/courtQueries.ts` | modified | Fetched `images` field in `getAllCourts` and `getCourtById`. |
| `client/app/(owner)/my-court/page.tsx` | modified | Added Supabase storage file uploader and UI. |
| `client/components/features/CourtCard.tsx` | modified | Fallback geometry replaced by background image if `court.images` exists. |
| `client/app/(guest)/courts/[id]/page.tsx` | modified | Passed `court.images` into `<ImageCarousel>`. |

---

## How It Works

1. **Owner Side:** User goes to `/my-court` and uploads an image. The file is directly sent to the `court_images` Supabase bucket using `@supabase/ssr` `createBrowserClient()`.
2. The bucket returns a `publicUrl` which is temporarily stored in the React state.
3. Upon clicking "Save Changes", the `/api/owner/my-court` (PUT) route receives the URLs and persists them to the Postgres `court` table as a `text[]`.
4. **Guest Side:** The `/courts` page queries `getAllCourts()`, fetching the `images` array. `CourtCard` maps the first image to a `backgroundImage`.
5. The `/courts/[id]` page queries `getCourtById()` and passes the `images` array to the `ImageCarousel`.

---

## Key Decisions

*   **Public Bucket vs Signed URLs:** `owner_applications` uses private signed URLs because it contains sensitive PII. `court_images` needs to be blazingly fast and cacheable for the public-facing listings. Therefore, `court_images` is explicitly set to `public: true`.
*   **Direct Uploads:** Images upload straight from the browser to Supabase storage to avoid routing binary data through Next.js API endpoints.

---

## Drizzle Schema Changes

```typescript
export const court = pgTable('court', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  // ...
  images: text('images').array().notNull().default(sql`ARRAY[]::text[]`),
  // ...
});
```

Command run: `npx drizzle-kit generate && npx drizzle-kit migrate`

---

## Known Gaps and Gotchas

*   **Image Deletion on Storage:** Clicking the "X" button on the UI only removes the URL from the array. It does **not** currently issue a DELETE request to Supabase Storage to actually remove the binary object. This can lead to orphaned files over time.
*   **Permissions:** The RLS policy on the bucket currently allows *any* authenticated user to insert files. We rely on the API route to ensure that only the owner of the court can link those URLs to the specific court.

---

## How to Extend This

*   To fix orphaned files, update `removeImage` in `client/app/(owner)/my-court/page.tsx` to `supabase.storage.from('court_images').remove([filepath])`.
*   To add a cover image selector, the `images[0]` index logic in `CourtCard.tsx` can be updated to read a `cover_image` string field if one is added to the database.
