import { pgTable, uuid, text, numeric, timestamp, check, primaryKey } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

// Shorthand helper — all timestamps are stored as UTC with timezone
const tstz = (name: string) => timestamp(name, { withTimezone: true, mode: 'date' })

// ---------------------------------------------------------------------------
// profiles
// Extends Supabase auth.users (1:1). Created via DB trigger on signup.
// ---------------------------------------------------------------------------
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(), // FK → auth.users.id (managed by Supabase trigger)
  username: text('username').notNull().unique(),
  role: text('role').notNull().default('user'),
  createdAt: tstz('created_at').notNull().defaultNow(),
  updatedAt: tstz('updated_at').notNull().defaultNow(),
}, (table) => [
  check('profiles_role_check', sql`${table.role} IN ('user', 'admin')`),
])

// ---------------------------------------------------------------------------
// court
// Individual bookable pickleball court. No facility grouping in current schema.
// ---------------------------------------------------------------------------
export const court = pgTable('court', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  courtName: text('court_name').notNull().unique(),
  description: text('description'),
  location: text('location'),
  pricePerHour: numeric('price_per_hour', { precision: 10, scale: 2 }),
  courtType: text('court_type'),
  createdAt: tstz('created_at').notNull().defaultNow(),
  updatedAt: tstz('updated_at').notNull().defaultNow(),
}, (table) => [
  check('court_type_check', sql`${table.courtType} IS NULL OR ${table.courtType} IN ('indoor', 'outdoor')`),
])

// ---------------------------------------------------------------------------
// item
// Lookup table for equipment / amenities (e.g. 'Paddle', 'Ball').
// ---------------------------------------------------------------------------
export const item = pgTable('item', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  itemName: text('item_name').notNull().unique(),
  createdAt: tstz('created_at').notNull().defaultNow(),
})

// ---------------------------------------------------------------------------
// court_item
// Many-to-many junction: links items to courts.
// Composite PK (court_id, item_id) prevents duplicates.
// ---------------------------------------------------------------------------
export const courtItem = pgTable('court_item', {
  courtId: uuid('court_id')
    .notNull()
    .references(() => court.id, { onDelete: 'cascade' }),
  itemId: uuid('item_id')
    .notNull()
    .references(() => item.id, { onDelete: 'cascade' }),
}, (table) => [
  primaryKey({ columns: [table.courtId, table.itemId] }),
])

// ---------------------------------------------------------------------------
// invoice
// Booking record: links a user to a court for a time window.
// Combines booking_date + start_time + end_time from schema.md into
// start_at / end_at timestamptz (UTC). Display in Asia/Manila in the UI.
// ---------------------------------------------------------------------------
export const invoice = pgTable('invoice', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id')
    .notNull()
    .references(() => profiles.id, { onDelete: 'restrict' }),
  courtId: uuid('court_id')
    .notNull()
    .references(() => court.id, { onDelete: 'restrict' }),
  paymentMethod: text('payment_method').notNull(),
  paymentTotal: numeric('payment_total', { precision: 10, scale: 2 }).notNull(),
  startAt: tstz('start_at').notNull(),
  endAt: tstz('end_at').notNull(),
  status: text('status').notNull().default('pending'),
  createdAt: tstz('created_at').notNull().defaultNow(),
  updatedAt: tstz('updated_at').notNull().defaultNow(),
}, (table) => [
  check(
    'invoice_status_check',
    sql`${table.status} IN ('pending', 'confirmed', 'cancelled', 'no_show')`,
  ),
])

// ---------------------------------------------------------------------------
// reviews
// User-generated court reviews. One per (user_id, court_id) pair.
// ---------------------------------------------------------------------------
export const reviews = pgTable('reviews', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id')
    .notNull()
    .references(() => profiles.id, { onDelete: 'cascade' }),
  courtId: uuid('court_id')
    .notNull()
    .references(() => court.id, { onDelete: 'cascade' }),
  title: text('title'),
  description: text('description').notNull(),
  createdAt: tstz('created_at').notNull().defaultNow(),
  updatedAt: tstz('updated_at').notNull().defaultNow(),
})
