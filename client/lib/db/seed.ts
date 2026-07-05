/**
 * Database seed script for Pickle All.
 *
 * Inserts sample courts, items, court-item links, profiles, and reviews
 * matching the original mock data so the UI looks identical after
 * switching from hardcoded arrays to Drizzle queries.
 *
 * Usage:
 *   DATABASE_URL="postgres://..." npx tsx lib/db/seed.ts
 *
 * Requirements:
 *   - DATABASE_URL env var pointing to the Supabase Postgres instance
 *   - Migrations already applied (npx drizzle-kit migrate)
 *   - The profiles trigger (supabase_trigger_profiles.sql) should be active,
 *     but we insert profiles directly here for seed data.
 */

import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { sql } from 'drizzle-orm'
import * as schema from './schema'

// ─── Connection ───────────────────────────────────────────────────────────────

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL is required. Pass it as an environment variable.')
  console.error('   Example: DATABASE_URL="postgres://..." npx tsx lib/db/seed.ts')
  process.exit(1)
}

const client = postgres(DATABASE_URL)
const db = drizzle(client, { schema })

// ─── Seed Data ────────────────────────────────────────────────────────────────

async function seed() {
  console.log('🌱 Seeding database...\n')

  // ── 1. Items (equipment / amenities) ──────────────────────────────────────
  console.log('  → Inserting items...')
  const itemsToInsert = [
    'Paddle Rental',
    'Ball Rental',
    'Locker Room',
    'Pro Shop',
    'Coaching',
    'Water Station',
    'Parking',
    'Café',
    'Scoreboard',
    'Spectator Seating',
  ]

  const insertedItems = await db
    .insert(schema.item)
    .values(itemsToInsert.map((name) => ({ itemName: name })))
    .onConflictDoNothing({ target: schema.item.itemName })
    .returning()

  // Build a name→id lookup
  const allItems = insertedItems.length > 0
    ? insertedItems
    : await db.select().from(schema.item)
  
  const itemLookup = new Map(allItems.map((i) => [i.itemName, i.id]))
  console.log(`    ✓ ${allItems.length} items ready`)

  // ── 2. Courts ─────────────────────────────────────────────────────────────
  console.log('  → Inserting courts...')
  const courtsData = [
    { courtName: 'BGC Sports Hub — Court A', description: 'Premium indoor facility with pro-grade lighting, smooth hardwood surface, and climate control. Great for serious play.', location: 'Bonifacio Global City, Taguig', pricePerHour: '350.00', courtType: 'indoor', amenities: ['Paddle Rental', 'Locker Room', 'Pro Shop', 'Coaching'] },
    { courtName: 'Pickleball Manila — Court 3', description: 'Open-air court with a stunning city view. Ideal for early morning or late afternoon games with natural ventilation.', location: 'Ayala Ave, Makati City', pricePerHour: '280.00', courtType: 'outdoor', amenities: ['Ball Rental', 'Water Station', 'Parking'] },
    { courtName: 'The Paddle Club — VIP Court', description: 'The most prestigious court in Metro Manila. Fully enclosed, private coaching bays, café, and an electronic scoreboard.', location: 'Eastwood City, Quezon City', pricePerHour: '420.00', courtType: 'indoor', amenities: ['Paddle Rental', 'Café', 'Coaching', 'Scoreboard', 'Locker Room'] },
    { courtName: 'Eastside Courts — Court 2', description: 'Community-friendly outdoor courts with a welcoming vibe. Great for beginners and recreational players on a budget.', location: 'Kapitolyo, Pasig City', pricePerHour: '250.00', courtType: 'outdoor', amenities: ['Ball Rental', 'Parking'] },
    { courtName: 'Smash & Rally Hub', description: 'Mid-tier indoor facility with excellent acoustics and non-slip flooring. Popular with corporate leagues and groups.', location: 'Mandaluyong City', pricePerHour: '380.00', courtType: 'indoor', amenities: ['Paddle Rental', 'Locker Room', 'Coaching'] },
    { courtName: 'Green Court Ortigas', description: 'Bright outdoor courts surrounded by lush landscaping. Excellent surface quality and spacious viewing area for spectators.', location: 'Ortigas Center, Pasig', pricePerHour: '300.00', courtType: 'outdoor', amenities: ['Scoreboard', 'Water Station', 'Spectator Seating'] },
    { courtName: 'Sportivo Arena — PB Court 1', description: 'Professional-grade indoor court used for local tournaments. Textured surface, broadcast lighting, and advanced booking system.', location: 'Alabang, Muntinlupa', pricePerHour: '450.00', courtType: 'indoor', amenities: ['Paddle Rental', 'Pro Shop', 'Coaching', 'Scoreboard', 'Café'] },
    { courtName: 'Harbor Court — Bayside', description: 'Scenic outdoor court right by the bay. Enjoy the breeze while you play. Equipment available for rent on-site.', location: 'CCP Complex, Pasay', pricePerHour: '220.00', courtType: 'outdoor', amenities: ['Ball Rental', 'Water Station'] },
    { courtName: 'UP ISSI Sports Court', description: 'University-managed indoor court with affordable rates. Open to the public on weekends. Clean facilities and friendly staff.', location: 'UP Diliman, Quezon City', pricePerHour: '180.00', courtType: 'indoor', amenities: ['Parking', 'Water Station'] },
  ]

  const insertedCourts = await db
    .insert(schema.court)
    .values(
      courtsData.map(({ amenities: _, ...courtFields }) => ({
        ...courtFields,
        status: 'active',
      })),
    )
    .onConflictDoNothing({ target: schema.court.courtName })
    .returning()

  const allCourts = insertedCourts.length > 0
    ? insertedCourts
    : await db.select().from(schema.court)

  console.log(`    ✓ ${allCourts.length} courts ready`)

  // ── 3. Court-Item links ───────────────────────────────────────────────────
  console.log('  → Linking court amenities...')
  let linksCreated = 0
  for (let i = 0; i < courtsData.length; i++) {
    const courtRecord = allCourts.find((c) => c.courtName === courtsData[i].courtName)
    if (!courtRecord) continue

    for (const amenityName of courtsData[i].amenities) {
      const itemId = itemLookup.get(amenityName)
      if (!itemId) continue

      await db
        .insert(schema.courtItem)
        .values({ courtId: courtRecord.id, itemId })
        .onConflictDoNothing()
      linksCreated++
    }
  }
  console.log(`    ✓ ${linksCreated} court-item links created`)

  // ── 4. Sample profiles (for reviews) ──────────────────────────────────────
  console.log('  → Inserting sample reviewer profiles...')
  
  // Generate deterministic UUIDs for reviewers so we can reference them
  const reviewerNames = [
    'markd', 'sarah_l', 'alexwong', 'jessica_t', 'mike_r',
    'diana_p', 'kevin_s', 'laura_m', 'tom_h', 'nina_b',
    'chris_k', 'elena_g',
  ]

  const profileValues = reviewerNames.map((name) => ({
    id: sql`gen_random_uuid()`,
    username: name,
    role: 'user' as const,
  }))

  // Profiles FK to auth.users — for seed data we insert with generated IDs
  // This works if auth.users FK is not enforced (seeding only)
  // If FK is enforced, you'd need to create auth.users first via Supabase Admin API
  let reviewerProfiles: { id: string; username: string }[] = []
  try {
    const inserted = await db
      .insert(schema.profiles)
      .values(profileValues)
      .onConflictDoNothing({ target: schema.profiles.username })
      .returning({ id: schema.profiles.id, username: schema.profiles.username })

    reviewerProfiles = inserted.length > 0
      ? inserted
      : await db
          .select({ id: schema.profiles.id, username: schema.profiles.username })
          .from(schema.profiles)
          .where(sql`${schema.profiles.username} = ANY(${reviewerNames})`)

    console.log(`    ✓ ${reviewerProfiles.length} reviewer profiles ready`)
  } catch (err) {
    console.log('    ⚠ Could not insert seed profiles (auth.users FK constraint).')
    console.log('      Reviews will be skipped. To seed reviews, create users via Supabase Auth first.')
  }

  // ── 5. Sample reviews for Court 1 ─────────────────────────────────────────
  if (reviewerProfiles.length > 0) {
    console.log('  → Inserting sample reviews...')
    const bgcCourt = allCourts.find((c) => c.courtName === 'BGC Sports Hub — Court A')
    
    if (bgcCourt) {
      const reviewTexts = [
        'Best indoor court in BGC. The lighting is amazing and the surface is perfectly maintained.',
        'Great facility, though finding parking during peak hours can be tough.',
        'Superb courts. The AC is a lifesaver on hot afternoons.',
        'Always my go-to court for weekend games with friends. Clean locker rooms!',
        'Courts are nice but it is a bit pricey compared to others.',
        'Love the online booking system, very seamless experience.',
        'Solid courts, good bounce, friendly staff.',
        'We had a mini tournament here and everything was perfect.',
        'Great location. Wish they had a bigger pro shop though.',
        'Absolutely love playing here. 10/10 recommend.',
        'Good quality nets and courts. Will be coming back.',
        'First time playing pickleball and the staff here was so helpful!',
      ]

      for (let i = 0; i < Math.min(reviewTexts.length, reviewerProfiles.length); i++) {
        await db
          .insert(schema.reviews)
          .values({
            userId: reviewerProfiles[i].id,
            courtId: bgcCourt.id,
            description: reviewTexts[i],
          })
          .onConflictDoNothing()
      }
      console.log(`    ✓ ${Math.min(reviewTexts.length, reviewerProfiles.length)} reviews created for BGC Sports Hub`)
    }
  }

  // ── 6. Operating hours for all courts ─────────────────────────────────────
  console.log('  → Setting operating hours...')
  let hoursCreated = 0
  for (const courtRecord of allCourts) {
    for (let day = 0; day <= 6; day++) {
      // Closed on Sundays (day 0) for most courts
      const isOpen = day !== 0
      await db
        .insert(schema.courtOperatingHours)
        .values({
          courtId: courtRecord.id,
          dayOfWeek: day,
          openTime: isOpen ? '06:00:00' : null,
          closeTime: isOpen ? '22:00:00' : null,
          isOpen,
        })
        .onConflictDoNothing()
      hoursCreated++
    }
  }
  console.log(`    ✓ ${hoursCreated} operating hour entries created`)

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
