# Court Detail Page — Agent Log

> **Date:** 2026-06-30
> **Feature ID:** F-10 (Court Detail Page)
> **Status:** partial (Mock Data)
> **Built by:** AI agent (Antigravity)

---

## What Was Built

The `/courts/[id]` guest court detail page. It features a hero section with the court's name, type, location, and rating; a content body detailing amenities and good-to-know rules; and a sticky `AvailabilityCalendar` client component widget that lets users explore time slots and duration logic for a mock day. It also includes a `loading.tsx` shimmer skeleton for smooth streaming.

---

## Files Created or Modified

| File | Action | Purpose |
|---|---|---|
| `client/app/(guest)/courts/[id]/page.tsx` | created | RSC page — dynamic route displaying the court's details from mock data |
| `client/app/(guest)/courts/[id]/loading.tsx` | created | Shimmer skeleton mirroring the detail page layout |
| `client/components/features/AvailabilityCalendar.tsx` | created | Interactive date, time, and duration selector widget with pricing logic |
| `client/components/features/CourtCard.tsx` | modified | Updated the "Book Now" CTA to link to `/courts/${id}` instead of `/login` |

---

## How It Works

1. **RSC page.tsx:** It uses `params: Promise<{ id: string }>` to fetch the court by ID from the mock data array. If the ID does not exist, it throws Next.js's `notFound()`.
2. **Metadata:** `generateMetadata` allows Next.js to set dynamic `<title>` and `<meta name="description">` tags based on the court.
3. **AvailabilityCalendar:** This client component renders a 7-day selector and time slots (8 AM to 9 PM). It employs a deterministic pseudo-random generator seeded by court ID, date, and hour to mock which slots are available.
4. **Duration Logic:** Users can choose how many hours they want to book. The widget automatically validates if the adjacent subsequent hours are also available. 
5. **Loading State:** The `loading.tsx` mimics the final layout, using `.skeleton` utility classes, providing a high-quality loading UX before the page finishes rendering.

---

## Key Decisions

- **Mock Data Persistence:** As the DB migrations haven't run and `location`/`price_per_hour`/`court_type` aren't yet available, the detail page relies on the same `MOCK_COURTS` array used in the listing page.
- **Client/Server Boundary:** The complex booking logic and PRNG is confined to the `AvailabilityCalendar.tsx` client component, keeping the parent page a pristine RSC that fetches data and renders UI swiftly.
- **Booking Flow Handoff:** Since the checkout/invoice creation (F-03) isn't complete, clicking the "Book Slot" button within the calendar widget simply routes users to `/login`.

---

## API Routes Added or Changed

None.

---

## Known Gaps and Gotchas

- **Mock Data:** Like the listing page, the data is entirely mocked. `MOCK_COURTS` must be swapped with a query fetching data using Drizzle ORM once the DB is fully seeded.
- **Booking Flow Not Connected:** The "Book Slot" button forwards to `/login` but does not retain slot selection state in cookies, local storage, or URL parameters. A robust post-login callback handoff will need to be developed when F-03 is implemented.
- **Missing DB Constraints:** Just a reminder that RLS policies and `UNIQUE (user_id, court_id)` haven't been created/migrated in the live DB yet.

---

## How to Extend This

1. **Wire real court data:** Replace `MOCK_COURTS` with Drizzle's `db.select().from(court).where(eq(court.id, resolvedParams.id))`.
2. **Connect the Booking Flow:** Pass the `selectedDate`, `selectedSlot`, and `duration` as query parameters when redirecting to the `/login` route, so the app can create the invoice once the user authenticates.
3. **Add Map Widget:** Swap the generic "Open in Maps" CTA with a live, interactive map like Google Maps API or Mapbox.
