import { createServerClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { court, courtOperatingHours, courtClosedDates, courtItem } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(req: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get owner's first court for now
  console.log('Fetching court for user.id:', user.id)
  const myCourts = await db.select().from(court).where(eq(court.ownerId, user.id))
  console.log('Found courts:', myCourts)
  const myCourt = myCourts[0]

  if (!myCourt) {
    return Response.json({ court: null })
  }

  // Fetch operating hours
  const operatingHours = await db.select().from(courtOperatingHours).where(eq(courtOperatingHours.courtId, myCourt.id))
  
  // Fetch closed dates
  const closedDates = await db.select().from(courtClosedDates).where(eq(courtClosedDates.courtId, myCourt.id))
  
  // Fetch amenities
  const amenities = await db.select().from(courtItem).where(eq(courtItem.courtId, myCourt.id))

  return Response.json({
    court: myCourt,
    operatingHours,
    closedDates,
    amenities
  })
}

export async function PUT(req: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { id, courtName, description, location, pricePerHour, courtType, status } = body

  // Ensure owner owns this court
  const [existing] = await db.select().from(court).where(eq(court.id, id))
  if (!existing || existing.ownerId !== user.id) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  await db.update(court).set({
    courtName,
    description,
    location,
    pricePerHour: pricePerHour.toString(),
    courtType,
    status,
    updatedAt: new Date()
  }).where(eq(court.id, id))

  return Response.json({ success: true })
}
