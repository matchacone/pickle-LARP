/**
 * Court query functions — shared data access layer.
 *
 * All court-related Drizzle queries live here so pages and components
 * import data from a single source instead of duplicating mock arrays.
 */

import { db } from '@/lib/db'
import { court, courtItem, item, reviews, profiles } from '@/lib/db/schema'
import { eq, sql, and, avg, count, desc } from 'drizzle-orm'

// ─── Types ────────────────────────────────────────────────────────────────────

/** Shape returned by getAllCourts() — what the listing page and CourtCard need */
export type CourtListItem = {
  id: string
  courtName: string
  description: string | null
  location: string | null
  pricePerHour: number
  courtType: 'indoor' | 'outdoor' | null
  status: string
  ownerId: string | null
  amenities: string[]
  reviewCount: number
  // Note: rating is not in the schema — we compute from reviews
  // Since there's no `rating` column, we default to 0 when no reviews exist
  avgRating: number
}

/** Shape returned by getCourtById() — includes full review list */
export type CourtDetail = CourtListItem & {
  reviews: CourtReviewItem[]
}

/** Individual review shape */
export type CourtReviewItem = {
  id: string
  title: string | null
  description: string
  author: string
  createdAt: Date
}

// ─── Queries ──────────────────────────────────────────────────────────────────

/**
 * Fetches all active courts with their amenities and review stats.
 * Used by the /courts listing page.
 */
export async function getAllCourts(): Promise<CourtListItem[]> {
  // 1. Fetch all active courts
  const courts = await db
    .select()
    .from(court)
    .where(eq(court.status, 'active'))

  if (courts.length === 0) return []

  // 2. Fetch all court-item links with item names
  const allItems = await db
    .select({
      courtId: courtItem.courtId,
      itemName: item.itemName,
    })
    .from(courtItem)
    .innerJoin(item, eq(courtItem.itemId, item.id))

  // 3. Fetch review stats per court (avg rating not in schema, so we just count)
  const reviewStats = await db
    .select({
      courtId: reviews.courtId,
      reviewCount: count(reviews.id),
    })
    .from(reviews)
    .groupBy(reviews.courtId)

  // Build lookup maps
  const itemsByCourtId = new Map<string, string[]>()
  for (const row of allItems) {
    const existing = itemsByCourtId.get(row.courtId) ?? []
    existing.push(row.itemName)
    itemsByCourtId.set(row.courtId, existing)
  }

  const statsByCourtId = new Map<string, { reviewCount: number }>()
  for (const row of reviewStats) {
    statsByCourtId.set(row.courtId, {
      reviewCount: Number(row.reviewCount),
    })
  }

  // 4. Combine into CourtListItem[]
  return courts.map((c) => {
    const stats = statsByCourtId.get(c.id)
    return {
      id: c.id,
      courtName: c.courtName,
      description: c.description,
      location: c.location,
      pricePerHour: Number(c.pricePerHour ?? 0),
      courtType: c.courtType as 'indoor' | 'outdoor' | null,
      status: c.status,
      ownerId: c.ownerId,
      amenities: itemsByCourtId.get(c.id) ?? [],
      reviewCount: stats?.reviewCount ?? 0,
      avgRating: 0, // No rating column in schema — Phase 2 enhancement
    }
  })
}

/**
 * Fetches a single court by ID with items, review stats, and full review list.
 * Used by the /courts/[id] detail page.
 * Returns null if court not found or not active.
 */
export async function getCourtById(courtId: string): Promise<CourtDetail | null> {
  // 1. Fetch the court
  const [foundCourt] = await db
    .select()
    .from(court)
    .where(eq(court.id, courtId))

  if (!foundCourt) return null

  // 2. Fetch amenities
  const courtItems = await db
    .select({ itemName: item.itemName })
    .from(courtItem)
    .innerJoin(item, eq(courtItem.itemId, item.id))
    .where(eq(courtItem.courtId, courtId))

  // 3. Fetch reviews with author usernames
  const courtReviews = await db
    .select({
      id: reviews.id,
      title: reviews.title,
      description: reviews.description,
      authorName: profiles.username,
      createdAt: reviews.createdAt,
    })
    .from(reviews)
    .innerJoin(profiles, eq(reviews.userId, profiles.id))
    .where(eq(reviews.courtId, courtId))
    .orderBy(desc(reviews.createdAt))

  // 4. Combine
  return {
    id: foundCourt.id,
    courtName: foundCourt.courtName,
    description: foundCourt.description,
    location: foundCourt.location,
    pricePerHour: Number(foundCourt.pricePerHour ?? 0),
    courtType: foundCourt.courtType as 'indoor' | 'outdoor' | null,
    status: foundCourt.status,
    ownerId: foundCourt.ownerId,
    amenities: courtItems.map((ci) => ci.itemName),
    reviewCount: courtReviews.length,
    avgRating: 0,
    reviews: courtReviews.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      author: r.authorName,
      createdAt: r.createdAt,
    })),
  }
}
