import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'
import { createCourt } from '@/lib/db/queries/adminQueries'

// ─── POST /api/courts — Admin: create a court ────────────────────────────────
export async function POST(request: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  let body: {
    court_name?: string
    description?: string
    location?: string
    price_per_hour?: number
    court_type?: string
    status?: string
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body', code: 'INVALID_INPUT' },
      { status: 422 },
    )
  }

  if (!body.court_name || typeof body.court_name !== 'string' || body.court_name.trim().length === 0) {
    return NextResponse.json(
      { error: 'court_name is required', code: 'INVALID_INPUT' },
      { status: 422 },
    )
  }

  // Validate court_type if provided
  if (body.court_type && !['indoor', 'outdoor'].includes(body.court_type)) {
    return NextResponse.json(
      { error: 'court_type must be "indoor" or "outdoor"', code: 'INVALID_INPUT' },
      { status: 422 },
    )
  }

  // Validate status if provided
  if (body.status && !['active', 'maintenance', 'hidden'].includes(body.status)) {
    return NextResponse.json(
      { error: 'status must be "active", "maintenance", or "hidden"', code: 'INVALID_INPUT' },
      { status: 422 },
    )
  }

  try {
    const created = await createCourt({
      courtName: body.court_name.trim(),
      description: body.description ?? null,
      location: body.location ?? null,
      pricePerHour: body.price_per_hour != null ? String(body.price_per_hour) : null,
      courtType: body.court_type ?? null,
      status: body.status ?? 'active',
    })

    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    // Unique constraint violation
    if (error instanceof Error && error.message.includes('unique')) {
      return NextResponse.json(
        { error: 'A court with this name already exists', code: 'CONFLICT' },
        { status: 409 },
      )
    }

    console.error('[POST /api/courts]', error)
    return NextResponse.json(
      { error: 'Failed to create court', code: 'INTERNAL_ERROR' },
      { status: 500 },
    )
  }
}
