import AdminSidebar from '@/components/layout/AdminSidebar'
import AdminHeader from '@/components/layout/AdminHeader'
import { ToastProvider } from '@/components/ui/Toast'
import { createServerClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { profiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { ShieldOff } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Admin Dashboard | Pickle All',
  description: 'Platform administration and moderation panel.',
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // ── Server-side role guard ──────────────────────────────────────────────────
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/admin/dashboard')
  }

  const [profile] = await db
    .select({ role: profiles.role })
    .from(profiles)
    .where(eq(profiles.id, user.id))

  if (!profile || profile.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-low">
        <div className="card p-8 max-w-md text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <ShieldOff className="text-red-500" size={32} />
          </div>
          <h1 className="text-2xl font-extrabold">Access Denied</h1>
          <p className="text-on-surface-variant">
            You don&apos;t have admin permissions to access this area. Contact a
            platform administrator if you believe this is an error.
          </p>
          <Link
            href="/courts"
            className="btn btn-primary inline-flex mt-2"
          >
            Back to Courts
          </Link>
        </div>
      </div>
    )
  }

  // ── Admin shell ─────────────────────────────────────────────────────────────
  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-surface-low text-on-surface font-sans">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <AdminHeader />
          <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  )
}
