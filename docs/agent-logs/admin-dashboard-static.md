# Admin Dashboard Static UI — Agent Log

> **Date:** 2026-07-03  
> **Feature ID:** None  
> **Status:** partial  
> **Built by:** Antigravity AI  

---

## What Was Built

Created the static user interface for the Admin Dashboard. This includes a persistent layout with a sidebar and header, and four core pages: Website Overview (metrics, charts, alerts), User Management (search, filters, table), User Reports (moderation queue with slide-over review panel), and Business Applications (court authorization queue with approval controls). It also features a global Toast notification context to simulate interactive actions.

---

## Files Created or Modified

| File | Action | Purpose |
|---|---|---|
| `client/app/admin/layout.tsx` | created | The shell layout for the admin section, providing the sidebar and header. |
| `client/components/layout/AdminSidebar.tsx` | created | The left-hand navigation menu for admin pages. |
| `client/components/layout/AdminHeader.tsx` | created | The top navigation bar containing search, notifications, and profile. |
| `client/app/admin/dashboard/page.tsx` | created | Website Overview page showing mocked system metrics and CSS-based charts. |
| `client/app/admin/users/page.tsx` | created | User Management data table with mocked actions and filters. |
| `client/app/admin/reports/page.tsx` | created | User Reports queue featuring a slide-over modal to review flagged content. |
| `client/app/admin/applications/page.tsx` | created | Business Applications queue to approve/reject court listings. |
| `client/components/ui/Toast.tsx` | created | A React Context provider and hook for triggering success/error toast notifications. |
| `client/components/ui/Skeleton.tsx` | created | Reusable skeleton loader utility component. |

---

## How It Works

1. **Routing:** The pages are explicitly namespaced under the standard `client/app/admin/` folder (e.g. `/admin/dashboard`) to prevent route collisions with the `(owner)` or `(guest)` route groups. 
2. **Interactive UI:** Modals/panels for the Reports and Applications pages are handled using local `useState` hooks to track the `selectedReport` or `selectedApp`. When an item is selected, the panel slides in from the right.
3. **Toast Notifications:** The layout wraps all admin pages in `<ToastProvider>`. Pages consume it via `const toast = useToast()` and call `toast('Title', 'Message', 'success')` to simulate saving data or performing actions.

---

## Key Decisions

- **Folder Namespacing:** Originally attempted to use `(admin)` as a route group. This caused a Next.js collision because `(owner)/dashboard` and `(admin)/dashboard` both resolved to `/dashboard`. Renamed to `admin/` to ensure a distinct `/admin/*` path prefix.
- **CSS Charts:** Because no dedicated charting library (like Recharts) was installed, the traffic and device usage charts on the dashboard are mocked entirely using Tailwind CSS, `conic-gradient`, and random inline heights.
- **Tailwind Tokens:** UI components heavily utilize existing tokens (`var(--app-surface)`, `bg-surface-low`, etc.) from `globals.css` to ensure it automatically inherits any future theme tweaks.

---

## Known Gaps and Gotchas

- **Mock Data Only:** Every page in the admin panel currently runs on static `useState` mock arrays. None of it is connected to Drizzle or Supabase.
- **No Middleware Auth Protection:** There is currently no `middleware.ts` or server-side checks preventing non-admin users from accessing the `/admin/` routes.
- **Charts aren't dynamic:** The CSS charts just render randomly every time.

---

## How to Extend This

- **Wire to DB:** Replace the mocked `useState` arrays in each page with Server Components that fetch real data from `drizzle-orm` (e.g., fetch users, reports, and applications).
- **Convert Actions to Server Actions:** Hook up the Toast notifications to actual form submissions or Server Actions that update database rows.
- **Add Authentication:** Add route protection in `middleware.ts` to ensure only users where `role === 'admin'` can load these pages.
