import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'
import { createItem } from '@/lib/db/queries/adminQueries'

// ─── POST /api/items — Admin: create an equipment/amenity item ───────────────
export async function POST(request: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  let body: { item_name?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body', code: 'INVALID_INPUT' },
      { status: 422 },
    )
  }

  if (!body.item_name || typeof body.item_name !== 'string' || body.item_name.trim().length === 0) {
    return NextResponse.json(
      { error: 'item_name is required', code: 'INVALID_INPUT' },
      { status: 422 },
    )
  }

  try {
    const created = await createItem(body.item_name.trim())
    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message.includes('unique')) {
      return NextResponse.json(
        { error: 'An item with this name already exists', code: 'CONFLICT' },
        { status: 409 },
      )
    }

    console.error('[POST /api/items]', error)
    return NextResponse.json(
      { error: 'Failed to create item', code: 'INTERNAL_ERROR' },
      { status: 500 },
    )
  }
}
