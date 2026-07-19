import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { ownerApplication } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(req: Request) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const {
      businessName,
      contactNumber,
      location,
      permitUrl,
      idUrl,
      courtPicUrl,
      lobbyPicUrl,
    } = body

    if (
      !businessName ||
      !contactNumber ||
      !location ||
      !permitUrl ||
      !idUrl ||
      !courtPicUrl ||
      !lobbyPicUrl
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      )
    }

    // Check if the user already has a pending application
    const existing = await db
      .select()
      .from(ownerApplication)
      .where(eq(ownerApplication.userId, user.id))
      .limit(1)

    if (existing.length > 0 && existing[0].status === 'pending') {
      return NextResponse.json(
        { error: 'You already have a pending application.' },
        { status: 400 },
      )
    }

    const [application] = await db
      .insert(ownerApplication)
      .values({
        userId: user.id,
        businessName,
        contactNumber,
        location,
        permitUrl,
        idUrl,
        courtPicUrl,
        lobbyPicUrl,
      })
      .returning()

    return NextResponse.json({ application })
  } catch (error) {
    console.error('Error creating application:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
