import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'
import { suspendUser, unsuspendUser } from '@/lib/db/queries/adminQueries'
import { db } from '@/lib/db'
import { profiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

// ─── POST /api/admin/users/[id]/suspend — Admin: suspend user ────────────────
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const { id: userId } = await params

  // Verify user exists
  const [target] = await db
    .select({ id: profiles.id, role: profiles.role })
    .from(profiles)
    .where(eq(profiles.id, userId))

  if (!target) {
    return NextResponse.json(
      { error: 'User not found', code: 'NOT_FOUND' },
      { status: 404 },
    )
  }

  // Prevent self-suspension or suspending other admins
  if (target.role === 'admin') {
    return NextResponse.json(
      { error: 'Cannot suspend admin users', code: 'FORBIDDEN' },
      { status: 403 },
    )
  }

  try {
    const result = await suspendUser(userId)
    return NextResponse.json({ id: result?.id, suspended: true })
  } catch (error) {
    console.error('[POST /api/admin/users/[id]/suspend]', error)
    return NextResponse.json(
      { error: 'Failed to suspend user', code: 'INTERNAL_ERROR' },
      { status: 500 },
    )
  }
}

// ─── DELETE /api/admin/users/[id]/suspend — Admin: unsuspend user ────────────
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const { id: userId } = await params

  // Verify user exists
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
    const result = await unsuspendUser(userId)
    return NextResponse.json({ id: result?.id, suspended: false })
  } catch (error) {
    console.error('[DELETE /api/admin/users/[id]/suspend]', error)
    return NextResponse.json(
      { error: 'Failed to unsuspend user', code: 'INTERNAL_ERROR' },
      { status: 500 },
    )
  }
}
