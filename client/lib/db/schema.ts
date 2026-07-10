import { pgTable, uuid, text, numeric, timestamp, check, primaryKey, boolean, integer, time, date, uniqueIndex } from 'drizzle-orm/pg-core'
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
  suspendedAt: tstz('suspended_at'), // null = active, non-null = suspended
  createdAt: tstz('created_at').notNull().defaultNow(),
  updatedAt: tstz('updated_at').notNull().defaultNow(),
}, (table) => [
  check('profiles_role_check', sql`${table.role} IN ('user', 'admin', 'owner')`),
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
  status: text('status').notNull().default('active'),
  ownerId: uuid('owner_id').references(() => profiles.id, { onDelete: 'set null' }),
  createdAt: tstz('created_at').notNull().defaultNow(),
  updatedAt: tstz('updated_at').notNull().defaultNow(),
}, (table) => [
  check('court_type_check', sql`${table.courtType} IS NULL OR ${table.courtType} IN ('indoor', 'outdoor')`),
  check('court_status_check', sql`${table.status} IN ('active', 'maintenance', 'hidden')`),
])

// ---------------------------------------------------------------------------
// court_operating_hours
// Stores the weekly recurring schedule for a court.
// ---------------------------------------------------------------------------
export const courtOperatingHours = pgTable('court_operating_hours', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  courtId: uuid('court_id')
    .notNull()
    .references(() => court.id, { onDelete: 'cascade' }),
  dayOfWeek: integer('day_of_week').notNull(),
  openTime: time('open_time'),
  closeTime: time('close_time'),
  isOpen: boolean('is_open').notNull().default(true),
  createdAt: tstz('created_at').notNull().defaultNow(),
  updatedAt: tstz('updated_at').notNull().defaultNow(),
}, (table) => [
  check('day_of_week_check', sql`${table.dayOfWeek} >= 0 AND ${table.dayOfWeek} <= 6`),
  uniqueIndex('court_operating_hours_unique').on(table.courtId, table.dayOfWeek),
])

// ---------------------------------------------------------------------------
// court_closed_dates
// Stores specific dates (exceptions) when the court is closed.
// ---------------------------------------------------------------------------
export const courtClosedDates = pgTable('court_closed_dates', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  courtId: uuid('court_id')
    .notNull()
    .references(() => court.id, { onDelete: 'cascade' }),
  closedDate: date('closed_date').notNull(),
  reason: text('reason'),
  createdAt: tstz('created_at').notNull().defaultNow(),
}, (table) => [
  uniqueIndex('court_closed_dates_unique').on(table.courtId, table.closedDate),
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
// booking
// Booking record: links a user to a court for a time window.
// ---------------------------------------------------------------------------
export const booking = pgTable('booking', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id')
    .notNull()
    .references(() => profiles.id, { onDelete: 'restrict' }),
  courtId: uuid('court_id')
    .notNull()
    .references(() => court.id, { onDelete: 'restrict' }),
  startAt: tstz('start_at').notNull(),
  endAt: tstz('end_at').notNull(),
  status: text('status').notNull().default('pending'),
  createdAt: tstz('created_at').notNull().defaultNow(),
  updatedAt: tstz('updated_at').notNull().defaultNow(),
}, (table) => [
  check(
    'booking_status_check',
    sql`${table.status} IN ('pending', 'confirmed', 'cancelled', 'no_show')`,
  ),
])

// ---------------------------------------------------------------------------
// invoice
// Stores payment details for a specific booking.
// ---------------------------------------------------------------------------
export const invoice = pgTable('invoice', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  bookingId: uuid('booking_id')
    .notNull()
    .references(() => booking.id, { onDelete: 'cascade' }),
  paymentMethod: text('payment_method').notNull(),
  paymentTotal: numeric('payment_total', { precision: 10, scale: 2 }).notNull(),
  status: text('status').notNull().default('unpaid'),
  createdAt: tstz('created_at').notNull().defaultNow(),
  updatedAt: tstz('updated_at').notNull().defaultNow(),
}, (table) => [
  check(
    'invoice_status_check',
    sql`${table.status} IN ('unpaid', 'paid', 'refunded')`,
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
}, (table) => [
  uniqueIndex('reviews_user_court_unique').on(table.userId, table.courtId),
])
