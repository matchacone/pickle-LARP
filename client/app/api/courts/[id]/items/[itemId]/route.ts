import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'
import { unlinkItemFromCourt } from '@/lib/db/queries/adminQueries'

// ─── DELETE /api/courts/[id]/items/[itemId] — Admin: unlink item ─────────────
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> },
) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const { id: courtId, itemId } = await params

  try {
    const result = await unlinkItemFromCourt(courtId, itemId)
    return NextResponse.json(result)
  } catch (error) {
    console.error('[DELETE /api/courts/[id]/items/[itemId]]', error)
    return NextResponse.json(
      { error: 'Failed to unlink item from court', code: 'INTERNAL_ERROR' },
      { status: 500 },
    )
  }
}
