import { NextRequest, NextResponse } from 'next/server'
import { getBookedSlots } from '@/lib/db/queries/bookingQueries'
import { db } from '@/lib/db'
import { courtOperatingHours } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

// ─── GET /api/courts/[id]/availability?date=YYYY-MM-DD — Public ──────────────
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: courtId } = await params
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')

  // Validate date param
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json(
      { error: 'Missing or invalid "date" query parameter. Expected format: YYYY-MM-DD', code: 'INVALID_INPUT' },
      { status: 422 },
    )
  }

  // Validate date is parseable
  const parsed = new Date(`${date}T00:00:00+08:00`)
  if (isNaN(parsed.getTime())) {
    return NextResponse.json(
      { error: 'Invalid date value', code: 'INVALID_INPUT' },
      { status: 422 },
    )
  }

  try {
    const bookedSlots = await getBookedSlots(courtId, date)

    const dayOfWeek = parsed.getDay()
    const [operatingHour] = await db
      .select()
      .from(courtOperatingHours)
      .where(
        and(
          eq(courtOperatingHours.courtId, courtId),
          eq(courtOperatingHours.dayOfWeek, dayOfWeek)
        )
      )

    return NextResponse.json({
      court_id: courtId,
      date,
      booked_slots: bookedSlots.map((s) => ({
        start_hour: s.startHour,
        end_hour: s.endHour,
      })),
      operating_hours: operatingHour ? {
        is_open: operatingHour.isOpen,
        open_time: operatingHour.openTime,
        close_time: operatingHour.closeTime,
      } : {
        is_open: true,
        open_time: '08:00',
        close_time: '22:00'
      }
    })
  } catch (error) {
    console.error('[GET /api/courts/[id]/availability]', error)
    return NextResponse.json(
      { error: 'Failed to fetch availability', code: 'INTERNAL_ERROR' },
      { status: 500 },
    )
  }
}
