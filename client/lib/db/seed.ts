/**
 * Database seed script for Pickle All.
 *
 * Usage:
 *   npx tsx --env-file=.env lib/db/seed.ts
 */

import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { sql, inArray } from 'drizzle-orm'
import { createClient } from '@supabase/supabase-js'
import * as schema from './schema'

// ─── Connection ───────────────────────────────────────────────────────────────

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL is required. Pass it as an environment variable.')
  process.exit(1)
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase env vars missing. NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY are required.')
  process.exit(1)
}

const client = postgres(DATABASE_URL)
const db = drizzle(client, { schema })
const supabase = createClient(supabaseUrl, supabaseKey)

// ─── Seed Data ────────────────────────────────────────────────────────────────

async function getOrCreateUser(email: string, password: string, username: string, role: string) {
  // First, check if the profile exists
  const existing = await db.select({
    id: schema.profiles.id,
    username: schema.profiles.username,
    role: schema.profiles.role
  }).from(schema.profiles).where(sql`username = ${username}`)
  
  if (existing.length > 0) {
    const p = existing[0]
    await db.update(schema.profiles).set({ role }).where(sql`id = ${p.id}`)
    return { id: p.id, role, username }
  }

  // Check if email already exists in auth.users
  const authUsers = await db.execute(sql`SELECT id FROM auth.users WHERE email = ${email}`)
  let actualId = (authUsers as any)[0]?.id

  if (!actualId) {
    const userId = crypto.randomUUID();
    await db.execute(sql`
      INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, 
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at
      ) VALUES (
        ${userId}, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 
        ${email}, crypt(${password}, gen_salt('bf')), now(), 
        '{"provider":"email","providers":["email"]}', 
        ${JSON.stringify({ username })}, now(), now()
      );
    `)
    actualId = userId
  }

  // Wait a moment for trigger to create the profile
  await new Promise(r => setTimeout(r, 1500))

  // Ensure role is correct
  await db.update(schema.profiles).set({ role }).where(sql`id = ${actualId}`)
  
  return { id: actualId, role, username }
}

async function seed() {
  console.log('🌱 Seeding database...\n')

  // ── 1. Setup Users ──────────────────────────────────────────
  console.log('  → Setting up Test, Owner, and Admin users...')
  const testUser = await getOrCreateUser('pickleall.testuser@gmail.com', 'password', 'Test', 'user')
  const ownerUser = await getOrCreateUser('pickleall.owner@gmail.com', 'password', 'Owner', 'owner')
  const adminUser = await getOrCreateUser('pickleall.admin@gmail.com', 'password', 'Admin', 'admin')
  
  console.log(`    ✓ Users ready`)

  const userProfiles = [testUser, ownerUser, adminUser]
  const ownerProfile = ownerUser

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
  
  // Clean up old data to avoid FK errors
  await db.delete(schema.invoice)
  await db.delete(schema.booking)
  await db.delete(schema.reviews)
  await db.delete(schema.courtOperatingHours)
  await db.delete(schema.courtItem)
  await db.delete(schema.court)
  
  const courtsData = [
    { courtName: 'Owner Seeder Court', description: 'A test court linked to the owner account.', location: 'Test Location', pricePerHour: '150.00', courtType: 'indoor', amenities: ['Paddle Rental', 'Water Station'] },
  ]

  const insertedCourts = await db
    .insert(schema.court)
    .values(
      courtsData.map(({ amenities: _, ...courtFields }) => ({
        ...courtFields,
        status: 'active',
        ownerId: ownerProfile.id,
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

    const courtIds = allCourts.map(c => c.id)
    await db.delete(schema.booking).where(inArray(schema.booking.courtId, courtIds))

    for (let i = 0; i < 5; i++) {
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
