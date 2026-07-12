import { OwnerSidebar } from '@/components/layout/OwnerSidebar'
import { createServerClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { profiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { ShieldOff } from 'lucide-react'
import Link from 'next/link'

export default async function OwnerLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/dashboard')
  }

  const [profile] = await db
    .select({ role: profiles.role })
    .from(profiles)
    .where(eq(profiles.id, user.id))

  if (!profile || profile.role !== 'owner') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mist">
        <div className="card p-8 max-w-md text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <ShieldOff className="text-red-500" size={32} />
          </div>
          <h1 className="text-2xl font-extrabold text-pickle-900">Access Denied</h1>
          <p className="text-slate-600">
            You don&apos;t have owner permissions to access this area. If you want to list your facility, please apply for an owner account.
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

  return (
    <div className="min-h-screen bg-mist flex">
      <OwnerSidebar />
      <main className="flex-1 p-6 md:p-10 overflow-y-auto h-screen">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
