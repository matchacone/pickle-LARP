import { createServerClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { court, courtClosedDates } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export async function POST(req: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { courtId, date, isClosed } = body

  if (!courtId || !date || typeof isClosed !== 'boolean') {
    return Response.json({ error: 'Invalid payload' }, { status: 400 })
  }

  // Ensure owner owns this court
  const [existing] = await db.select().from(court).where(eq(court.id, courtId))
  if (!existing || existing.ownerId !== user.id) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (isClosed) {
    try {
      await db.insert(courtClosedDates).values({
        courtId,
        closedDate: date,
        reason: 'Owner marked closed'
      })
    } catch (e: any) {
      // Ignore unique constraint violation if already closed
      if (e.code !== '23505') {
        throw e
      }
    }
  } else {
    // Delete closure
    await db.delete(courtClosedDates).where(
      and(
        eq(courtClosedDates.courtId, courtId),
        eq(courtClosedDates.closedDate, date)
      )
    )
  }

  return Response.json({ success: true })
}
