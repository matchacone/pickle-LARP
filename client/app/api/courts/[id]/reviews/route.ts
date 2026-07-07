import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { reviews, profiles, court } from '@/lib/db/schema'
import { eq, desc, count } from 'drizzle-orm'
import { createServerClient } from '@/lib/supabase/server'

// ─── GET /api/courts/[id]/reviews — Public ────────────────────────────────────
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: courtId } = await params

  try {
    // Fetch reviews with author usernames
    const courtReviews = await db
      .select({
        id: reviews.id,
        userId: reviews.userId,
        title: reviews.title,
        description: reviews.description,
        authorName: profiles.username,
        createdAt: reviews.createdAt,
      })
      .from(reviews)
      .innerJoin(profiles, eq(reviews.userId, profiles.id))
      .where(eq(reviews.courtId, courtId))
      .orderBy(desc(reviews.createdAt))

    // Get total count
    const [countResult] = await db
      .select({ total: count(reviews.id) })
      .from(reviews)
      .where(eq(reviews.courtId, courtId))

    return NextResponse.json({
      reviews: courtReviews.map((r) => ({
        id: r.id,
        userId: r.userId,
        author: r.authorName,
        title: r.title,
        description: r.description,
        createdAt: r.createdAt,
      })),
      total: Number(countResult.total),
    })
  } catch (error) {
    console.error('[GET /api/courts/[id]/reviews]', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}

// ─── POST /api/courts/[id]/reviews — Authenticated ───────────────────────────
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: courtId } = await params

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

  // 2. Validate body
  let body: { title?: string; description?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    )
  }

  const description = body.description?.trim()
  if (!description || description.length === 0) {
    return NextResponse.json(
      { error: 'Description is required' },
      { status: 400 }
    )
  }

  const title = body.title?.trim() || null

  // 3. Verify court exists
  const [foundCourt] = await db
    .select({ id: court.id })
    .from(court)
    .where(eq(court.id, courtId))

  if (!foundCourt) {
    return NextResponse.json(
      { error: 'Court not found' },
      { status: 404 }
    )
  }

  // 4. Insert review (unique constraint catches duplicates)
  try {
    const [created] = await db
      .insert(reviews)
      .values({
        userId: user.id,
        courtId,
        title,
        description,
      })
      .returning()

    // Fetch author username for the response
    const [profile] = await db
      .select({ username: profiles.username })
      .from(profiles)
      .where(eq(profiles.id, user.id))

    return NextResponse.json(
      {
        review: {
          id: created.id,
          userId: created.userId,
          author: profile?.username ?? user.email?.split('@')[0] ?? 'User',
          title: created.title,
          description: created.description,
          createdAt: created.createdAt,
        },
      },
      { status: 201 }
    )
  } catch (error: unknown) {
    // Check for unique constraint violation (Postgres error code 23505)
    const pgError = error as { code?: string }
    if (pgError.code === '23505') {
      return NextResponse.json(
        { error: 'You have already reviewed this court' },
        { status: 409 }
      )
    }
    console.error('[POST /api/courts/[id]/reviews]', error)
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    )
  }
}
