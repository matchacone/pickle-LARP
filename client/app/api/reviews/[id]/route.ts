import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { reviews, profiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { createServerClient } from '@/lib/supabase/server'

// ─── DELETE /api/reviews/[id] — Auth: owner or admin ──────────────────────────
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: reviewId } = await params

  // 1. Authenticate
  const supabase = await createServerClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }

  // 2. Fetch the review
  const [review] = await db
    .select({
      id: reviews.id,
      userId: reviews.userId,
    })
    .from(reviews)
    .where(eq(reviews.id, reviewId))

  if (!review) {
    return NextResponse.json(
      { error: 'Review not found' },
      { status: 404 }
    )
  }

  // 3. Authorization — review owner or admin
  const isOwner = review.userId === user.id

  if (!isOwner) {
    // Check if the user is an admin
    const [profile] = await db
      .select({ role: profiles.role })
      .from(profiles)
      .where(eq(profiles.id, user.id))

    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'You can only delete your own reviews' },
        { status: 403 }
      )
    }
  }

  // 4. Delete
  try {
    await db.delete(reviews).where(eq(reviews.id, reviewId))

    return NextResponse.json({ id: reviewId, deleted: true })
  } catch (error) {
    console.error('[DELETE /api/reviews/[id]]', error)
    return NextResponse.json(
      { error: 'Failed to delete review' },
      { status: 500 }
    )
  }
}
