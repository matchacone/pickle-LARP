import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import {
  createBookingWithInvoice,
  getUserBookings,
} from '@/lib/db/queries/bookingQueries'

// ─── POST /api/bookings — Create a booking + invoice ──────────────────────────
export async function POST(request: NextRequest) {
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

  // 2. Parse and validate body
  let body: {
    court_id?: string
    start_at?: string
    end_at?: string
    payment_method?: string
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body', code: 'INVALID_INPUT' },
      { status: 422 },
    )
  }

  const { court_id, start_at, end_at, payment_method } = body

  // Required fields
  if (!court_id || !start_at || !end_at || !payment_method) {
    return NextResponse.json(
      {
        error: 'Missing required fields: court_id, start_at, end_at, payment_method',
        code: 'INVALID_INPUT',
      },
      { status: 422 },
    )
  }

  // Parse dates
  const startAt = new Date(start_at)
  const endAt = new Date(end_at)

  if (isNaN(startAt.getTime()) || isNaN(endAt.getTime())) {
    return NextResponse.json(
      { error: 'Invalid date format. Use ISO 8601 (e.g. 2026-08-01T08:00:00Z)', code: 'INVALID_INPUT' },
      { status: 422 },
    )
  }

  // start_at must be before end_at
  if (startAt >= endAt) {
    return NextResponse.json(
      { error: 'start_at must be before end_at', code: 'INVALID_INPUT' },
      { status: 422 },
    )
  }

  // Duration must be 1–8 whole hours
  const durationMs = endAt.getTime() - startAt.getTime()
  const durationHours = durationMs / (1000 * 60 * 60)
  if (durationHours < 1 || durationHours > 8 || durationHours !== Math.floor(durationHours)) {
    return NextResponse.json(
      { error: 'Duration must be a whole number of hours between 1 and 8', code: 'INVALID_INPUT' },
      { status: 422 },
    )
  }

  // start_at must be in the future
  if (startAt <= new Date()) {
    return NextResponse.json(
      { error: 'start_at must be in the future', code: 'INVALID_INPUT' },
      { status: 422 },
    )
  }

  // payment_method must be non-empty
  if (typeof payment_method !== 'string' || payment_method.trim().length === 0) {
    return NextResponse.json(
      { error: 'payment_method must be a non-empty string', code: 'INVALID_INPUT' },
      { status: 422 },
    )
  }

  // 3. Create booking + invoice
  try {
    const result = await createBookingWithInvoice({
      userId: user.id,
      courtId: court_id,
      startAt,
      endAt,
      paymentMethod: payment_method.trim(),
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'

    if (message === 'CONFLICT') {
      return NextResponse.json(
        { error: 'This time slot is no longer available', code: 'CONFLICT' },
        { status: 409 },
      )
    }

    if (message === 'COURT_NOT_FOUND') {
      return NextResponse.json(
        { error: 'Court not found or inactive', code: 'NOT_FOUND' },
        { status: 404 },
      )
    }

    console.error('[POST /api/bookings]', error)
    return NextResponse.json(
      { error: 'Failed to create booking', code: 'INTERNAL_ERROR' },
      { status: 500 },
    )
  }
}

// ─── GET /api/bookings — List authenticated user's bookings ───────────────────
export async function GET() {
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

  // 2. Fetch bookings
  try {
    const bookings = await getUserBookings(user.id)
    return NextResponse.json({ bookings })
  } catch (error) {
    console.error('[GET /api/bookings]', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings', code: 'INTERNAL_ERROR' },
      { status: 500 },
    )
  }
}
