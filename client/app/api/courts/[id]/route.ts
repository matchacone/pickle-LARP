import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'
import { updateCourt, deleteCourt } from '@/lib/db/queries/adminQueries'

// ─── PATCH /api/courts/[id] — Admin: update court ────────────────────────────
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const { id: courtId } = await params

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body', code: 'INVALID_INPUT' },
      { status: 422 },
    )
  }

  // Build update payload — only include known fields
  const updateData: Record<string, unknown> = {}

  if (body.court_name !== undefined) {
    if (typeof body.court_name !== 'string' || body.court_name.trim().length === 0) {
      return NextResponse.json(
        { error: 'court_name must be a non-empty string', code: 'INVALID_INPUT' },
        { status: 422 },
      )
    }
    updateData.courtName = body.court_name.trim()
  }

  if (body.description !== undefined) updateData.description = body.description
  if (body.location !== undefined) updateData.location = body.location

  if (body.price_per_hour !== undefined) {
    updateData.pricePerHour = body.price_per_hour != null ? String(body.price_per_hour) : null
  }

  if (body.court_type !== undefined) {
    if (body.court_type !== null && !['indoor', 'outdoor'].includes(body.court_type as string)) {
      return NextResponse.json(
        { error: 'court_type must be "indoor", "outdoor", or null', code: 'INVALID_INPUT' },
        { status: 422 },
      )
    }
    updateData.courtType = body.court_type
  }

  if (body.status !== undefined) {
    if (!['active', 'maintenance', 'hidden'].includes(body.status as string)) {
      return NextResponse.json(
        { error: 'status must be "active", "maintenance", or "hidden"', code: 'INVALID_INPUT' },
        { status: 422 },
      )
    }
    updateData.status = body.status
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json(
      { error: 'No valid fields to update', code: 'INVALID_INPUT' },
      { status: 422 },
    )
  }

  try {
    const updated = await updateCourt(courtId, updateData as Parameters<typeof updateCourt>[1])

    if (!updated) {
      return NextResponse.json(
        { error: 'Court not found', code: 'NOT_FOUND' },
        { status: 404 },
      )
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error('[PATCH /api/courts/[id]]', error)
    return NextResponse.json(
      { error: 'Failed to update court', code: 'INTERNAL_ERROR' },
      { status: 500 },
    )
  }
}

// ─── DELETE /api/courts/[id] — Admin: delete court ───────────────────────────
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const { id: courtId } = await params

  try {
    const result = await deleteCourt(courtId)
    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof Error && error.message === 'HAS_ACTIVE_BOOKINGS') {
      return NextResponse.json(
        { error: 'Cannot delete court with active confirmed bookings', code: 'CONFLICT' },
        { status: 409 },
      )
    }

    console.error('[DELETE /api/courts/[id]]', error)
    return NextResponse.json(
      { error: 'Failed to delete court', code: 'INTERNAL_ERROR' },
      { status: 500 },
    )
  }
}
