import { NextRequest, NextResponse } from 'next/server'
import { getBookedSlots } from '@/lib/db/queries/bookingQueries'

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

    return NextResponse.json({
      court_id: courtId,
      date,
      booked_slots: bookedSlots.map((s) => ({
        start_hour: s.startHour,
        end_hour: s.endHour,
      })),
    })
  } catch (error) {
    console.error('[GET /api/courts/[id]/availability]', error)
    return NextResponse.json(
      { error: 'Failed to fetch availability', code: 'INTERNAL_ERROR' },
      { status: 500 },
    )
  }
}
