import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'
import { db } from '@/lib/db'
import { item, courtItem } from '@/lib/db/schema'
import { eq, count } from 'drizzle-orm'

// ─── DELETE /api/items/[id] — Admin: delete an equipment/amenity item ────────
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const { id: itemId } = await params

  // Check if item is linked to any courts
  const [linkCount] = await db
    .select({ total: count() })
    .from(courtItem)
    .where(eq(courtItem.itemId, itemId))

  if (Number(linkCount.total) > 0) {
    return NextResponse.json(
      { error: 'Cannot delete item while it is linked to courts', code: 'CONFLICT' },
      { status: 409 },
    )
  }

  try {
    await db.delete(item).where(eq(item.id, itemId))
    return NextResponse.json({ id: itemId, deleted: true })
  } catch (error) {
    console.error('[DELETE /api/items/[id]]', error)
    return NextResponse.json(
      { error: 'Failed to delete item', code: 'INTERNAL_ERROR' },
      { status: 500 },
    )
  }
}
