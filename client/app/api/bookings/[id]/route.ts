import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { profiles, court } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { createServerClient } from '@/lib/supabase/server'
import {
  getBookingById,
  cancelBooking,
} from '@/lib/db/queries/bookingQueries'

// ─── GET /api/bookings/[id] — Single booking detail ──────────────────────────
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: bookingId } = await params

  // 1. Authenticate
  const supabase = await createServerClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Authentication required', code: 'UNAUTHORIZED' },
      { status: 401 },
    )
  }

  // 2. Fetch booking
  try {
    const detail = await getBookingById(bookingId)

    if (!detail) {
      return NextResponse.json(
        { error: 'Booking not found', code: 'NOT_FOUND' },
        { status: 404 },
      )
    }

    // 3. Authorization — must own the booking or be admin
    if (detail.invoice && detail.invoice.paymentMethod) {
      // Booking exists; check ownership via the booking's userId
    }

    // We need to check userId from the booking table directly
    const bookingRecord = await db.query.booking.findFirst({
      where: (b, { eq: eqOp }) => eqOp(b.id, bookingId),
      columns: { userId: true, courtId: true },
    })

    if (!bookingRecord) {
      return NextResponse.json(
        { error: 'Booking not found', code: 'NOT_FOUND' },
        { status: 404 },
      )
    }

    const isOwner = bookingRecord.userId === user.id

    if (!isOwner) {
      // Allow if the user is the owner of the court
      const [courtRecord] = await db
        .select({ ownerId: court.ownerId })
        .from(court)
        .where(eq(court.id, bookingRecord.courtId))
        
      const isCourtOwner = courtRecord?.ownerId === user.id
      
      if (!isCourtOwner) {
        const [profile] = await db
          .select({ role: profiles.role })
          .from(profiles)
          .where(eq(profiles.id, user.id))

        if (profile?.role !== 'admin') {
          return NextResponse.json(
            { error: 'You can only view your own bookings', code: 'FORBIDDEN' },
            { status: 403 },
          )
        }
      }
    }

    return NextResponse.json({ booking: detail })
  } catch (error) {
    console.error('[GET /api/bookings/[id]]', error)
    return NextResponse.json(
      { error: 'Failed to fetch booking', code: 'INTERNAL_ERROR' },
      { status: 500 },
    )
  }
}

// ─── PATCH /api/bookings/[id] — Cancel a booking ─────────────────────────────
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: bookingId } = await params

  // 1. Authenticate
  const supabase = await createServerClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Authentication required', code: 'UNAUTHORIZED' },
      { status: 401 },
    )
  }

  // 2. Parse body
  let body: { status?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body', code: 'INVALID_INPUT' },
      { status: 422 },
    )
  }

  // Only 'cancelled' is supported
  if (body.status !== 'cancelled') {
    return NextResponse.json(
      { error: 'Only status "cancelled" is supported', code: 'INVALID_INPUT' },
      { status: 422 },
    )
  }

  // 3. Check if user is admin
  let isAdmin = false
  const [profile] = await db
    .select({ role: profiles.role })
    .from(profiles)
    .where(eq(profiles.id, user.id))

  if (profile?.role === 'admin') {
    isAdmin = true
  }

  // 4. Cancel
  try {
    const result = await cancelBooking(bookingId, user.id, isAdmin)
    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'

    if (message === 'NOT_FOUND') {
      return NextResponse.json(
        { error: 'Booking not found', code: 'NOT_FOUND' },
        { status: 404 },
      )
    }

    if (message === 'FORBIDDEN') {
      return NextResponse.json(
        { error: 'You can only cancel your own bookings', code: 'FORBIDDEN' },
        { status: 403 },
      )
    }

    if (message === 'INVALID_STATUS') {
      return NextResponse.json(
        { error: 'Booking cannot be cancelled (already cancelled or completed)', code: 'INVALID_INPUT' },
        { status: 422 },
      )
    }

    if (message === 'CANCELLATION_WINDOW') {
      return NextResponse.json(
        { error: 'Bookings can only be cancelled at least 24 hours before the start time', code: 'INVALID_INPUT' },
        { status: 422 },
      )
    }

    console.error('[PATCH /api/bookings/[id]]', error)
    return NextResponse.json(
      { error: 'Failed to cancel booking', code: 'INTERNAL_ERROR' },
      { status: 500 },
    )
  }
}
