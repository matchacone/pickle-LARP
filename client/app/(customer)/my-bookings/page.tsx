import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { getUserBookings, type BookingListItem } from '@/lib/db/queries/bookingQueries'
import CustomerBookingsList from './CustomerBookingsList'

export const metadata: Metadata = {
  title: 'My Bookings — PickleAll',
  description: 'View and manage your court bookings.',
}

export default async function CustomerDashboardPage() {
  // Auth check — redirect to login if not authenticated
  const supabase = await createServerClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login?next=/my-bookings')
  }

  // Fetch bookings server-side via Drizzle
  let bookings: BookingListItem[] = []
  try {
    bookings = await getUserBookings(user.id)
  } catch (error) {
    console.error('[CustomerDashboard] Failed to fetch bookings:', error)
  }

  // Split into upcoming and past
  const now = new Date()
  const upcoming = bookings.filter(
    (b) => new Date(b.startAt) > now && b.status !== 'cancelled',
  )
  const past = bookings.filter(
    (b) => new Date(b.startAt) <= now || b.status === 'cancelled',
  )

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-asphalt pt-20 pb-12">
        <div className="container-page">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            My Bookings
          </h1>
          <p className="text-base text-white/60 mt-2">
            View and manage your court reservations.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="container-page py-10">
        {bookings.length === 0 ? (
          /* Empty state */
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-2xl bg-mist flex items-center justify-center mx-auto mb-6">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="text-on-surface-variant">
                <rect x="6" y="6" width="28" height="28" rx="4" stroke="currentColor" strokeWidth="2" />
                <line x1="6" y1="14" x2="34" y2="14" stroke="currentColor" strokeWidth="2" />
                <line x1="14" y1="6" x2="14" y2="14" stroke="currentColor" strokeWidth="2" />
                <line x1="26" y1="6" x2="26" y2="14" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-asphalt">No bookings yet</h2>
            <p className="text-sm text-on-surface-variant mt-2 max-w-sm mx-auto">
              Find a court and book your first session. It only takes a minute!
            </p>
            <Link
              href="/courts"
              className="btn btn-primary mt-6 inline-flex items-center gap-2"
            >
              Browse Courts
            </Link>
          </div>
        ) : (
          <CustomerBookingsList upcoming={upcoming} past={past} />
        )}
      </section>
    </main>
  )
}
