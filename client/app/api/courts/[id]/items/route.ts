import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'
import { db } from '@/lib/db'
import { courtItem, item } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

// ─── GET /api/courts/[id]/items — Admin: get items for a court ──────────────
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const { id: courtId } = await params

  try {
    const linkedItems = await db
      .select({
        id: item.id,
        itemName: item.itemName,
      })
      .from(courtItem)
      .innerJoin(item, eq(courtItem.itemId, item.id))
      .where(eq(courtItem.courtId, courtId))

    return NextResponse.json({ items: linkedItems })
  } catch (error) {
    console.error('[GET /api/courts/[id]/items]', error)
    return NextResponse.json(
      { error: 'Failed to fetch court items', code: 'INTERNAL_ERROR' },
      { status: 500 },
    )
  }
}

// ─── POST /api/courts/[id]/items — Admin: link an item to a court ─────────────
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const { id: courtId } = await params

  let body: { item_id?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body', code: 'INVALID_INPUT' },
      { status: 422 },
    )
  }

  if (!body.item_id) {
    return NextResponse.json(
      { error: 'Missing item_id', code: 'INVALID_INPUT' },
      { status: 422 },
    )
  }

  try {
    await db.insert(courtItem).values({
      courtId,
      itemId: body.item_id,
    })

    return NextResponse.json({ court_id: courtId, item_id: body.item_id }, { status: 201 })
  } catch (error: unknown) {
    console.error('[POST /api/courts/[id]/items]', error)
    if (typeof error === 'object' && error !== null && 'code' in error && (error as any).code === '23505') { // Postgres unique violation
      return NextResponse.json(
        { error: 'Item is already linked to this court', code: 'CONFLICT' },
        { status: 409 },
      )
    }
    return NextResponse.json(
      { error: 'Failed to link item', code: 'INTERNAL_ERROR' },
      { status: 500 },
    )
  }
}
