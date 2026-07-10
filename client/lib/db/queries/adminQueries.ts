/**
 * Admin query functions — shared data access layer for admin operations.
 *
 * All admin-specific Drizzle queries live here so admin pages and
 * Route Handlers import data from a single source.
 */

import { db } from '@/lib/db'
import {
  profiles,
  court,
  courtItem,
  item,
  booking,
  invoice,
  reviews,
} from '@/lib/db/schema'
import { eq, sql, count, sum, and, ne, desc } from 'drizzle-orm'
import type { InferSelectModel } from 'drizzle-orm'

// ─── Types ────────────────────────────────────────────────────────────────────

export type AdminUser = {
  id: string
  username: string
  role: string
  suspendedAt: Date | null
  createdAt: Date
}

export type AdminCourt = InferSelectModel<typeof court> & {
  itemCount: number
  bookingCount: number
}

export type AdminItem = InferSelectModel<typeof item> & {
  courtCount: number
}

export type DashboardStats = {
  totalUsers: number
  totalBookings: number
  totalRevenue: number
  bookingsByStatus: { status: string; count: number }[]
  recentBookings: {
    id: string
    courtName: string
    username: string
    startAt: Date
    status: string
  }[]
}

// ─── User Queries ─────────────────────────────────────────────────────────────

/** Fetches all user profiles for the admin users table. */
export async function getAllUsers(): Promise<AdminUser[]> {
  const rows = await db
    .select({
      id: profiles.id,
      username: profiles.username,
      role: profiles.role,
      suspendedAt: profiles.suspendedAt,
      createdAt: profiles.createdAt,
    })
    .from(profiles)
    .orderBy(desc(profiles.createdAt))

  return rows
}

/** Suspends a user by setting suspended_at to now. */
export async function suspendUser(userId: string) {
  const [updated] = await db
    .update(profiles)
    .set({ suspendedAt: new Date(), updatedAt: new Date() })
    .where(eq(profiles.id, userId))
    .returning({ id: profiles.id, suspendedAt: profiles.suspendedAt })

  return updated ?? null
}

/** Unsuspends a user by setting suspended_at to null. */
export async function unsuspendUser(userId: string) {
  const [updated] = await db
    .update(profiles)
    .set({ suspendedAt: null, updatedAt: new Date() })
    .where(eq(profiles.id, userId))
    .returning({ id: profiles.id, suspendedAt: profiles.suspendedAt })

  return updated ?? null
}

/** Updates a user's role. */
export async function updateUserRole(userId: string, role: string) {
  const [updated] = await db
    .update(profiles)
    .set({ role, updatedAt: new Date() })
    .where(eq(profiles.id, userId))
    .returning({ id: profiles.id, role: profiles.role })

  return updated ?? null
}

// ─── Court Queries ────────────────────────────────────────────────────────────

/** Fetches all courts (all statuses) with item and booking counts. */
export async function getAllCourtsAdmin(): Promise<AdminCourt[]> {
  // Fetch all courts
  const courts = await db.select().from(court).orderBy(desc(court.createdAt))

  if (courts.length === 0) return []

  // Fetch item counts per court
  const itemCounts = await db
    .select({
      courtId: courtItem.courtId,
      count: count(courtItem.itemId),
    })
    .from(courtItem)
    .groupBy(courtItem.courtId)

  // Fetch booking counts per court
  const bookingCounts = await db
    .select({
      courtId: booking.courtId,
      count: count(booking.id),
    })
    .from(booking)
    .groupBy(booking.courtId)

  const itemCountMap = new Map(itemCounts.map((r) => [r.courtId, Number(r.count)]))
  const bookingCountMap = new Map(bookingCounts.map((r) => [r.courtId, Number(r.count)]))

  return courts.map((c) => ({
    ...c,
    itemCount: itemCountMap.get(c.id) ?? 0,
    bookingCount: bookingCountMap.get(c.id) ?? 0,
  }))
}

/** Creates a new court. Returns the created row. */
export async function createCourt(data: {
  courtName: string
  description?: string | null
  location?: string | null
  pricePerHour?: string | null
  courtType?: string | null
  status?: string
}) {
  const [created] = await db
    .insert(court)
    .values({
      courtName: data.courtName,
      description: data.description ?? null,
      location: data.location ?? null,
      pricePerHour: data.pricePerHour ?? null,
      courtType: data.courtType ?? null,
      status: data.status ?? 'active',
    })
    .returning()

  return created
}

/** Updates a court. Partial update — only provided fields are changed. */
export async function updateCourt(
  courtId: string,
  data: Partial<{
    courtName: string
    description: string | null
    location: string | null
    pricePerHour: string | null
    courtType: string | null
    status: string
  }>,
) {
  const [updated] = await db
    .update(court)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(court.id, courtId))
    .returning()

  return updated ?? null
}

/**
 * Deletes a court. Throws 'HAS_ACTIVE_BOOKINGS' if confirmed bookings exist.
 */
export async function deleteCourt(courtId: string) {
  // Check for confirmed bookings
  const [activeBooking] = await db
    .select({ id: booking.id })
    .from(booking)
    .where(and(eq(booking.courtId, courtId), eq(booking.status, 'confirmed')))
    .limit(1)

  if (activeBooking) {
    throw new Error('HAS_ACTIVE_BOOKINGS')
  }

  await db.delete(court).where(eq(court.id, courtId))
  return { id: courtId, deleted: true }
}

// ─── Item Queries ─────────────────────────────────────────────────────────────

/** Fetches all items with the number of courts each is linked to. */
export async function getAllItems(): Promise<AdminItem[]> {
  const items = await db.select().from(item).orderBy(item.itemName)

  if (items.length === 0) return []

  const courtCounts = await db
    .select({
      itemId: courtItem.itemId,
      count: count(courtItem.courtId),
    })
    .from(courtItem)
    .groupBy(courtItem.itemId)

  const courtCountMap = new Map(courtCounts.map((r) => [r.itemId, Number(r.count)]))

  return items.map((i) => ({
    ...i,
    courtCount: courtCountMap.get(i.id) ?? 0,
  }))
}

/** Creates a new item. Throws on unique constraint violation. */
export async function createItem(itemName: string) {
  const [created] = await db
    .insert(item)
    .values({ itemName })
    .returning()

  return created
}

/** Links an item to a court. Throws on duplicate. */
export async function linkItemToCourt(courtId: string, itemId: string) {
  const [created] = await db
    .insert(courtItem)
    .values({ courtId, itemId })
    .returning()

  return created
}

/** Unlinks an item from a court. */
export async function unlinkItemFromCourt(courtId: string, itemId: string) {
  await db
    .delete(courtItem)
    .where(and(eq(courtItem.courtId, courtId), eq(courtItem.itemId, itemId)))

  return { courtId, itemId, removed: true }
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

/** Aggregate stats for the admin dashboard overview. */
export async function getAdminDashboardStats(): Promise<DashboardStats> {
  // Total users
  const [userCount] = await db
    .select({ total: count(profiles.id) })
    .from(profiles)

  // Total bookings
  const [bookingCount] = await db
    .select({ total: count(booking.id) })
    .from(booking)

  // Total revenue (sum of paid invoices)
  const [revenueResult] = await db
    .select({ total: sum(invoice.paymentTotal) })
    .from(invoice)
    .where(eq(invoice.status, 'paid'))

  // Bookings by status
  const statusBreakdown = await db
    .select({
      status: booking.status,
      count: count(booking.id),
    })
    .from(booking)
    .groupBy(booking.status)

  // Recent bookings (last 10)
  const recent = await db
    .select({
      id: booking.id,
      courtName: court.courtName,
      username: profiles.username,
      startAt: booking.startAt,
      status: booking.status,
    })
    .from(booking)
    .innerJoin(court, eq(booking.courtId, court.id))
    .innerJoin(profiles, eq(booking.userId, profiles.id))
    .orderBy(desc(booking.createdAt))
    .limit(10)

  return {
    totalUsers: Number(userCount.total),
    totalBookings: Number(bookingCount.total),
    totalRevenue: Number(revenueResult.total ?? 0),
    bookingsByStatus: statusBreakdown.map((r) => ({
      status: r.status,
      count: Number(r.count),
    })),
    recentBookings: recent,
  }
}
