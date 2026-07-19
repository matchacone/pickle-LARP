# Owner Onboarding — Agent Log

> **Date:** 2026-07-20  
> **Feature ID:** F-06  
> **Status:** complete  
> **Built by:** Antigravity

---

## What Was Built

Implemented the Facility Owner Onboarding flow. Users can now apply to become court owners by submitting their business details and uploading four mandatory documents (Business Permit, Valid ID, Court Photo, and Lobby Photo). Admins can view these applications in their dashboard, view the securely uploaded files via signed URLs, and approve or reject them. Approving an application automatically promotes the user to the `owner` role.

---

## Files Created or Modified

| File | Action | Purpose |
|---|---|---|
| `client/lib/db/schema.ts` | modified | Added `owner_application` table with `status` enum check. |
| `docs/schema.md` | modified | Documented `owner_application` schema. |
| `docs/DATA_MODELS.md` | modified | Documented `owner_application` schema. |
| `client/app/(customer)/apply-owner/page.tsx` | created | Frontend form for users to upload files and submit applications. |
| `client/app/api/applications/route.ts` | created | POST handler to create an application in the DB. |
| `client/app/api/admin/applications/[id]/route.ts` | created | PATCH handler to approve/reject an application and update the user role. |
| `client/app/admin/applications/page.tsx` | modified | Converted to a Server Component to fetch data from DB and generate signed URLs for documents. |
| `client/app/admin/applications/ClientPage.tsx` | created | Contains the interactive UI (search, modal, approve/reject buttons) for the admin dashboard. |
| `client/middleware.ts` | modified | Added `/apply-owner` to `PROTECTED_ROUTES`. |

---

## How It Works

1. **Upload Form**: A logged-in user goes to `/apply-owner`. They fill out the form and select files.
2. **Direct to Storage**: Upon submission, the client uploads the 4 files directly to the Supabase `owner_applications` bucket.
3. **Database Insert**: The client then POSTs the generated storage paths to `/api/applications`, which inserts an `owner_application` record (`status = 'pending'`).
4. **Admin Review**: Admins visit `/admin/applications` where `page.tsx` fetches the applications and generates 1-hour signed URLs for the secure bucket.
5. **Approval**: An admin clicks "Approve". `ClientPage.tsx` calls `PATCH /api/admin/applications/[id]`.
6. **Role Upgrade**: The API updates the application `status` to `approved` and updates the applicant's `role` to `'owner'` in the `profiles` table.

---

## Key Decisions

- **Direct-to-Supabase Uploads**: The client component uploads files directly to the storage bucket rather than piping them through a Next.js API route to save server memory and bandwidth.
- **Signed URLs for Security**: The `owner_applications` bucket is private. The admin server component generates signed URLs so admins can view the IDs and permits securely.
- **Server/Client Component Split**: The admin applications page was split into a Server Component (for DB fetching and signed URL generation) and a Client Component (for modal interactions and toasts) to keep secrets secure.

---

## Drizzle Schema Changes

```typescript
export const ownerApplication = pgTable('owner_application', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id')
    .notNull()
    .references(() => profiles.id, { onDelete: 'cascade' }),
  businessName: text('business_name').notNull(),
  contactNumber: text('contact_number').notNull(),
  location: text('location').notNull(),
  permitUrl: text('permit_url').notNull(),
  idUrl: text('id_url').notNull(),
  courtPicUrl: text('court_pic_url').notNull(),
  lobbyPicUrl: text('lobby_pic_url').notNull(),
  status: text('status').notNull().default('pending'),
  createdAt: tstz('created_at').notNull().defaultNow(),
  updatedAt: tstz('updated_at').notNull().defaultNow(),
}, (table) => [
  check(
    'owner_application_status_check',
    sql`${table.status} IN ('pending', 'approved', 'rejected')`,
  ),
])
```

Command run: `npx drizzle-kit generate` — migration file: `lib/db/migrations/0006_far_king_cobra.sql`

---

## API Routes Added or Changed

| Method | Path | Change |
|---|---|---|
| POST | `/api/applications` | Created — handles application form submission. |
| PATCH | `/api/admin/applications/[id]` | Created — handles admin approve/reject actions. |

---

## Known Gaps and Gotchas

- **File Limits & Validation**: The frontend form does basic validation (checking file extension via `accept`), but the backend does not enforce file size limits or strict MIME typing before the upload reaches Supabase Storage.
- **No Email Notifications**: The PATCH endpoint approves or rejects the application but does not currently send a confirmation or rejection email to the user.
- **Single Pending Application**: A user can only have one pending application at a time. If they want to register multiple separate business entities before approval, they can't.

---

## How to Extend This

- **Add Email Notifications**: Modify `client/app/api/admin/applications/[id]/route.ts` to trigger an email via Resend or AWS SES when the status changes to `approved` or `rejected`.
- **Implement Application Resubmission**: Update the UI in the user's dashboard to let them see if their application was rejected, read the `rejectReason`, and submit a new one.
