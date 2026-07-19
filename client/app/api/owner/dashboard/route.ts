import { createServerClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { profiles, court, booking, invoice } from '@/lib/db/schema'
import { eq, and, gte, lt, inArray } from 'drizzle-orm'

export async function GET(req: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })
  }

  const [profile] = await db
    .select({ role: profiles.role })
    .from(profiles)
    .where(eq(profiles.id, user.id))

  if (profile?.role !== 'owner') {
    return Response.json({ error: 'Forbidden', code: 'FORBIDDEN' }, { status: 403 })
  }

  // Get owner's courts
  const ownerCourts = await db.select().from(court).where(eq(court.ownerId, user.id))
  const courtIds = ownerCourts.map(c => c.id)

  if (courtIds.length === 0) {
    return Response.json({
      metrics: {
        revenue: '₱0',
        todayBookings: 0,
        upcomingBookings: 0,
        totalPlayers: 0,
      },
      courts: [],
      timelineBookings: []
    })
  }

  // Get bookings for today and next week
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const nextWeek = new Date(today)
  nextWeek.setDate(nextWeek.getDate() + 7)

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
    })
    .from(booking)
    .innerJoin(court, eq(booking.courtId, court.id))
    .innerJoin(profiles, eq(booking.userId, profiles.id))
    .where(inArray(booking.courtId, courtIds))

  // Invoices for revenue (paid, for today's bookings)
  const invoices = await db
    .select({ paymentTotal: invoice.paymentTotal })
    .from(invoice)
    .innerJoin(booking, eq(invoice.bookingId, booking.id))
    .where(
      and(
        inArray(booking.courtId, courtIds),
        eq(invoice.status, 'paid'),
        gte(booking.startAt, today),
        lt(booking.startAt, tomorrow)
      )
    )

  const todayRevenue = invoices.reduce((sum, inv) => sum + Number(inv.paymentTotal), 0)

  const todayBookingsCount = allBookings.filter(b => 
    new Date(b.startAt) >= today && new Date(b.startAt) < tomorrow
  ).length

  const upcomingBookingsCount = allBookings.filter(b => 
    new Date(b.startAt) >= tomorrow && new Date(b.startAt) < nextWeek
  ).length

  const uniquePlayers = new Set(allBookings.map(b => b.userId)).size

  const formattedCourts = ownerCourts.map(c => `${c.courtName} - ${c.courtType === 'indoor' ? 'Indoor' : 'Outdoor'}`)

  const timelineBookings = allBookings
    .filter(b => new Date(b.startAt) >= today && new Date(b.startAt) < tomorrow)
    .map(b => {
      const startDate = new Date(b.startAt)
      const endDate = new Date(b.endAt)
      const startHour = startDate.getHours() + (startDate.getMinutes() / 60)
      const duration = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60)
      
      return {
        id: b.id,
        court: `${b.courtName} - ${b.courtType === 'indoor' ? 'Indoor' : 'Outdoor'}`,
        startHour,
        duration,
        user: b.username,
        status: b.status,
      }
    })

  return Response.json({
    metrics: {
      revenue: `₱${todayRevenue.toLocaleString()}`,
      todayBookings: todayBookingsCount,
      upcomingBookings: upcomingBookingsCount,
      totalPlayers: uniquePlayers,
    },
    courts: formattedCourts,
    timelineBookings
  })
}
