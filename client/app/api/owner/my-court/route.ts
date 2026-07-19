import { createServerClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { court, courtOperatingHours, courtClosedDates, courtItem, item } from '@/lib/db/schema'
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
  const courtItemsRows = await db
    .select({ itemName: item.itemName })
    .from(courtItem)
    .innerJoin(item, eq(courtItem.itemId, item.id))
    .where(eq(courtItem.courtId, myCourt.id))
  
  const amenities = courtItemsRows.map(r => r.itemName)

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
  const { id, courtName, description, location, pricePerHour, courtType, status, schedule, amenities } = body

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

  if (schedule && Array.isArray(schedule)) {
    // Delete existing operating hours for this court
    await db.delete(courtOperatingHours).where(eq(courtOperatingHours.courtId, id))
    
    // Insert new operating hours
    const dayMap: Record<string, number> = {
      'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6
    }
    
    const inserts = schedule.map((s: any) => ({
      courtId: id,
      dayOfWeek: dayMap[s.day],
      openTime: s.open,
      closeTime: s.close,
      isOpen: s.isOpen
    }))
    
    if (inserts.length > 0) {
      await db.insert(courtOperatingHours).values(inserts)
    }
  }

  if (amenities && Array.isArray(amenities)) {
    // Delete existing links for this court
    await db.delete(courtItem).where(eq(courtItem.courtId, id))
    
    for (const amenityName of amenities) {
      if (!amenityName) continue
      
      // Find or create the item
      let [existingItem] = await db.select().from(item).where(eq(item.itemName, amenityName))
      if (!existingItem) {
        try {
          const [newItem] = await db.insert(item).values({ itemName: amenityName }).returning()
          existingItem = newItem
        } catch (e: any) {
          // In case of race conditions with unique constraint, try fetching again
          if (e.code === '23505') {
            const [retryItem] = await db.select().from(item).where(eq(item.itemName, amenityName))
            existingItem = retryItem
          } else {
            throw e
          }
        }
      }
      
      // Insert junction table record
      if (existingItem) {
        try {
          await db.insert(courtItem).values({
            courtId: id,
            itemId: existingItem.id
          })
        } catch (e: any) {
          if (e.code !== '23505') throw e // ignore duplicate key if somehow already linked
        }
      }
    }
  }

  return Response.json({ success: true })
}
