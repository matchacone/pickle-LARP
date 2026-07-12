/**
 * Database seed script for Pickle All.
 *
 * Inserts sample courts, items, court-item links, reviews,
 * bookings, and invoices to mimic a realistic production database.
 *
 * Usage:
 *   npx tsx --env-file=.env lib/db/seed.ts
 *
 * Optional:
 *   OWNER_ID="your-supabase-user-uuid" (Links courts to your account so you can see them in the Owner Dashboard)
 */

import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { sql, inArray } from 'drizzle-orm'
import * as schema from './schema'

// ─── Connection ───────────────────────────────────────────────────────────────

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL is required. Pass it as an environment variable.')
  process.exit(1)
}

const client = postgres(DATABASE_URL)
const db = drizzle(client, { schema })

// ─── Seed Data ────────────────────────────────────────────────────────────────

async function seed() {
  console.log('🌱 Seeding database...\n')

  // ── 1. Fetch Existing Profiles ──────────────────────────────────────────
  console.log('  → Fetching existing profiles...')
  
  const existingProfiles = await db.select({
    id: schema.profiles.id,
    username: schema.profiles.username,
    role: schema.profiles.role
  }).from(schema.profiles)
  
  if (existingProfiles.length === 0) {
    console.error('    ⚠ No profiles found in the database.')
    console.error('      Please sign up at least one user via the UI to populate auth.users before running the seeder.')
    process.exit(1)
  }

  let ownerProfile = existingProfiles.find(p => p.role === 'owner')

  if (process.env.OWNER_ID) {
    ownerProfile = existingProfiles.find(p => p.id === process.env.OWNER_ID)
    if (ownerProfile && ownerProfile.role !== 'owner') {
      await db.update(schema.profiles).set({ role: 'owner' }).where(sql`id = ${ownerProfile.id}`)
      ownerProfile.role = 'owner'
    } else if (!ownerProfile) {
      console.warn(`    ⚠ Provided OWNER_ID ${process.env.OWNER_ID} not found in profiles table. Falling back to an existing user.`)
    }
  }

  if (!ownerProfile) {
    // If no explicit owner found, make the first available user an owner
    ownerProfile = existingProfiles[existingProfiles.length - 1] // picking the most recently created
    await db.update(schema.profiles).set({ role: 'owner' }).where(sql`id = ${ownerProfile.id}`)
    ownerProfile.role = 'owner'
  }

  console.log(`    ✓ Owner selected: ${ownerProfile.username} (${ownerProfile.id})`)

  let userProfiles = existingProfiles.filter(p => p.id !== ownerProfile!.id)
  if (userProfiles.length === 0) {
    userProfiles = [ownerProfile!] // fallback if only 1 user exists
  }

  // ── 2. Items (equipment / amenities) ──────────────────────────────────────
  console.log('  → Inserting items...')
  const itemsToInsert = [
    'Paddle Rental', 'Ball Rental', 'Locker Room', 'Pro Shop', 
    'Coaching', 'Water Station', 'Parking', 'Café', 'Scoreboard', 'Spectator Seating',
  ]

  const insertedItems = await db
    .insert(schema.item)
    .values(itemsToInsert.map((name) => ({ itemName: name })))
    .onConflictDoNothing({ target: schema.item.itemName })
    .returning()

  const allItems = insertedItems.length > 0 ? insertedItems : await db.select().from(schema.item)
  const itemLookup = new Map(allItems.map((i) => [i.itemName, i.id]))
  console.log(`    ✓ ${allItems.length} items ready`)

  // ── 3. Courts ─────────────────────────────────────────────────────────────
  console.log('  → Inserting courts...')
  const courtsData = [
    { courtName: 'BGC Sports Hub — Court A', description: 'Premium indoor facility...', location: 'BGC, Taguig', pricePerHour: '350.00', courtType: 'indoor', amenities: ['Paddle Rental', 'Locker Room', 'Pro Shop'] },
    { courtName: 'Pickleball Manila — Court 3', description: 'Open-air court with city view.', location: 'Ayala Ave, Makati', pricePerHour: '280.00', courtType: 'outdoor', amenities: ['Ball Rental', 'Water Station'] },
    { courtName: 'The Paddle Club — VIP Court', description: 'Enclosed, private coaching bays.', location: 'Eastwood, QC', pricePerHour: '420.00', courtType: 'indoor', amenities: ['Paddle Rental', 'Café', 'Coaching', 'Scoreboard'] },
    { courtName: 'Eastside Courts — Court 2', description: 'Community outdoor courts.', location: 'Kapitolyo, Pasig', pricePerHour: '250.00', courtType: 'outdoor', amenities: ['Ball Rental', 'Parking'] },
    { courtName: 'Smash & Rally Hub', description: 'Mid-tier indoor facility.', location: 'Mandaluyong City', pricePerHour: '380.00', courtType: 'indoor', amenities: ['Paddle Rental', 'Locker Room'] },
  ]

  const courtNames = courtsData.map(c => c.courtName)
  await db.delete(schema.court).where(inArray(schema.court.courtName, courtNames))

  const insertedCourts = await db
    .insert(schema.court)
    .values(
      courtsData.map(({ amenities: _, ...courtFields }) => ({
        ...courtFields,
        status: 'active',
        ownerId: ownerProfile!.id,
      })),
    )
    .onConflictDoNothing({ target: schema.court.courtName })
    .returning()

  const allCourts = insertedCourts.length > 0 ? insertedCourts : await db.select().from(schema.court)
  console.log(`    ✓ ${allCourts.length} courts ready`)

  // ── 4. Court-Item links ───────────────────────────────────────────────────
  console.log('  → Linking court amenities...')
  let linksCreated = 0
  for (let i = 0; i < courtsData.length; i++) {
    const courtRecord = allCourts.find((c) => c.courtName === courtsData[i].courtName)
    if (!courtRecord) continue
    for (const amenityName of courtsData[i].amenities) {
      const itemId = itemLookup.get(amenityName)
      if (!itemId) continue
      await db.insert(schema.courtItem).values({ courtId: courtRecord.id, itemId }).onConflictDoNothing()
      linksCreated++
    }
  }
  console.log(`    ✓ ${linksCreated} court-item links created`)

  // ── 5. Operating hours ────────────────────────────────────────────────────
  console.log('  → Setting operating hours...')
  let hoursCreated = 0
  for (const courtRecord of allCourts) {
    for (let day = 0; day <= 6; day++) {
      const isOpen = day !== 0 // closed sundays
      await db.insert(schema.courtOperatingHours).values({
        courtId: courtRecord.id,
        dayOfWeek: day,
        openTime: isOpen ? '06:00:00' : null,
        closeTime: isOpen ? '22:00:00' : null,
        isOpen,
      }).onConflictDoNothing()
      hoursCreated++
    }
  }
  console.log(`    ✓ ${hoursCreated} operating hour entries created`)

  // ── 6. Bookings & Invoices ────────────────────────────────────────────────
  console.log('  → Creating realistic bookings & invoices...')
  if (userProfiles.length > 0 && allCourts.length > 0) {
    const now = new Date()
    const statuses = ['confirmed', 'pending', 'cancelled', 'no_show']
    let bookingsCreated = 0

    // Clear existing bookings for these courts to avoid duplicates on re-seed
    const courtIds = allCourts.map(c => c.id)
    await db.delete(schema.booking).where(inArray(schema.booking.courtId, courtIds))

    for (let i = 0; i < 20; i++) {
      const court = allCourts[i % allCourts.length]
      const user = userProfiles[i % userProfiles.length]
      
      const dayOffset = Math.floor(Math.random() * 14) - 7 // -7 to +7 days
      const hourOffset = Math.floor(Math.random() * 12) + 8 // 8 AM to 8 PM
      const durationHours = Math.random() > 0.5 ? 1 : 2

      const startAt = new Date(now)
      startAt.setDate(now.getDate() + dayOffset)
      startAt.setHours(hourOffset, 0, 0, 0)

      const endAt = new Date(startAt)
      endAt.setHours(startAt.getHours() + durationHours)

      let status = statuses[Math.floor(Math.random() * statuses.length)]
      if (startAt > now && status === 'no_show') status = 'confirmed' 
      
      const [booking] = await db.insert(schema.booking).values({
        courtId: court.id,
        userId: user.id,
        startAt,
        endAt,
        status,
      }).returning()

      const paymentTotal = (Number(court.pricePerHour) * durationHours).toFixed(2)
      let invoiceStatus = 'paid'
      if (status === 'pending') invoiceStatus = 'unpaid'
      if (status === 'cancelled') invoiceStatus = Math.random() > 0.5 ? 'refunded' : 'unpaid'

      await db.insert(schema.invoice).values({
        bookingId: booking.id,
        paymentMethod: ['Credit Card', 'GCash', 'Cash'][Math.floor(Math.random() * 3)],
        paymentTotal,
        status: invoiceStatus,
      })
      bookingsCreated++
    }
    console.log(`    ✓ ${bookingsCreated} bookings & invoices created`)
  }

  // ── 7. Reviews ────────────────────────────────────────────────────────────
  console.log('  → Inserting sample reviews...')
  if (userProfiles.length > 0 && allCourts.length > 0) {
    const reviewTexts = ['Great lighting!', 'Slippery floor.', 'Friendly staff.', 'Will definitely book again.']
    let reviewsCreated = 0
    for (let i = 0; i < 10; i++) {
      const court = allCourts[i % allCourts.length]
      const user = userProfiles[i % userProfiles.length]
      await db.insert(schema.reviews).values({
        userId: user.id,
        courtId: court.id,
        description: reviewTexts[i % reviewTexts.length],
        title: 'Good Court',
      }).onConflictDoNothing()
      reviewsCreated++
    }
    console.log(`    ✓ ${reviewsCreated} reviews created`)
  }

  console.log('\n✅ Seed complete!')
}

// ─── Run ──────────────────────────────────────────────────────────────────────
seed()
  .catch((err) => {
    console.error('\n❌ Seed failed:', err)
    process.exit(1)
  })
  .finally(async () => {
    await client.end()
  })
