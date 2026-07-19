import { createServerClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { profiles, court, booking, invoice } from '@/lib/db/schema'
import { eq, inArray, desc } from 'drizzle-orm'

export async function GET(req: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get owner's courts
  const ownerCourts = await db.select().from(court).where(eq(court.ownerId, user.id))
  const courtIds = ownerCourts.map(c => c.id)

  if (courtIds.length === 0) {
    return Response.json({ bookings: [] })
  }

  // Fetch all bookings for the owner's courts, ordered by most recent
  const allBookings = await db
    .select({
      id: booking.id,
      courtId: booking.courtId,
      startAt: booking.startAt,
      endAt: booking.endAt,
      status: booking.status,
      userId: booking.userId,
      username: profiles.username,
      courtName: court.courtName,
      courtType: court.courtType,
      paymentTotal: invoice.paymentTotal
    })
    .from(booking)
    .innerJoin(court, eq(booking.courtId, court.id))
    .innerJoin(profiles, eq(booking.userId, profiles.id))
    .leftJoin(invoice, eq(invoice.bookingId, booking.id))
    .where(inArray(booking.courtId, courtIds))
    .orderBy(desc(booking.startAt))

  // Map to format suitable for UI
  const formattedBookings = allBookings.map(b => {
    const startDate = new Date(b.startAt)
    const endDate = new Date(b.endAt)
    
    // Formatting Date: Oct 12, 2026
    const dateOptions: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }
    const formattedDate = startDate.toLocaleDateString('en-US', dateOptions)
    
    // Formatting Time: 14:00 - 15:00
    const formatTime = (d: Date) => {
      const h = d.getHours().toString().padStart(2, '0')
      const m = d.getMinutes().toString().padStart(2, '0')
      return `${h}:${m}`
    }
    const time = `${formatTime(startDate)} - ${formatTime(endDate)}`

    // Map DB status to UI status (if needed)
    let displayStatus = b.status
    if (b.status === 'confirmed') displayStatus = 'completed'
    else if (b.status === 'pending') displayStatus = 'pending'
    else displayStatus = 'cancelled'

    return {
      id: b.id,
      date: formattedDate,
      time,
      court: `${b.courtName} - ${b.courtType === 'indoor' ? 'Indoor' : 'Outdoor'}`,
      user: b.username,
      status: displayStatus,
      amount: b.paymentTotal ? `₱${Number(b.paymentTotal).toLocaleString()}` : '₱0'
    }
  })

  return Response.json({ bookings: formattedBookings })
}
