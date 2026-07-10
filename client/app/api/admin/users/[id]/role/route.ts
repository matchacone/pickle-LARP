import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'
import { updateUserRole } from '@/lib/db/queries/adminQueries'
import { db } from '@/lib/db'
import { profiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

// ─── PATCH /api/admin/users/[id]/role — Admin: update user role ──────────────
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const { id: userId } = await params

  let body: { role?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body', code: 'INVALID_INPUT' },
      { status: 422 },
    )
  }

  if (!body.role || !['admin', 'owner', 'user'].includes(body.role)) {
    return NextResponse.json(
      { error: 'Invalid role. Must be admin, owner, or user.', code: 'INVALID_INPUT' },
      { status: 422 },
    )
  }

  // Prevent modifying the last admin or self
  if (userId === auth.data.user.id) {
     return NextResponse.json(
       { error: 'Cannot change your own role', code: 'FORBIDDEN' },
       { status: 403 },
     )
  }

  const [target] = await db
    .select({ id: profiles.id })
    .from(profiles)
    .where(eq(profiles.id, userId))

  if (!target) {
    return NextResponse.json(
      { error: 'User not found', code: 'NOT_FOUND' },
      { status: 404 },
    )
  }

  try {
    const result = await updateUserRole(userId, body.role)
    return NextResponse.json({ id: result?.id, role: result?.role })
  } catch (error) {
    console.error('[PATCH /api/admin/users/[id]/role]', error)
    return NextResponse.json(
      { error: 'Failed to update user role', code: 'INTERNAL_ERROR' },
      { status: 500 },
    )
  }
}
