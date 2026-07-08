/**
 * Booking query functions — shared data access layer.
 *
 * All booking-related Drizzle queries live here so Route Handlers
 * and pages import from a single source.
 */

import { db } from '@/lib/db'
import { booking, invoice, court, profiles } from '@/lib/db/schema'
import { eq, and, or, sql, desc, gte, lte, ne } from 'drizzle-orm'

// ─── Types ────────────────────────────────────────────────────────────────────

/** Shape returned by getUserBookings() */
export type BookingListItem = {
  id: string
  courtId: string
  courtName: string
  location: string | null
  startAt: Date
  endAt: Date
  status: string
  createdAt: Date
  invoice: {
    id: string
    paymentMethod: string
    paymentTotal: number
    status: string
  } | null
}

/** Shape returned by getBookingById() */
export type BookingDetail = BookingListItem & {
  courtType: string | null
  pricePerHour: number
}

/** Shape for booked time ranges on a given date */
export type BookedSlot = {
  startHour: number
  endHour: number
}

/** Input for creating a booking + invoice */
export type CreateBookingInput = {
  userId: string
  courtId: string
  startAt: Date
  endAt: Date
  paymentMethod: string
}

/** Result of booking creation */
export type CreateBookingResult = {
  booking: {
    id: string
    courtId: string
    startAt: Date
    endAt: Date
    status: string
  }
  invoice: {
    id: string
    paymentMethod: string
    paymentTotal: number
    status: string
  }
}

// ─── Queries ──────────────────────────────────────────────────────────────────

/**
 * Fetches all confirmed/pending booking time ranges for a court on a specific date.
 * Used by the availability calendar to gray out booked slots.
 *
 * @param courtId - The court UUID
 * @param date - The date string (YYYY-MM-DD) in Asia/Manila timezone
 */
export async function getBookedSlots(
  courtId: string,
  date: string,
): Promise<BookedSlot[]> {
  // Build the day boundaries in Manila time → UTC
  // The date string represents a Manila date, so 00:00 Manila = 16:00 UTC (prev day)
  const dayStartManila = new Date(`${date}T00:00:00+08:00`)
  const dayEndManila = new Date(`${date}T23:59:59+08:00`)

  const bookings = await db
    .select({
      startAt: booking.startAt,
      endAt: booking.endAt,
    })
    .from(booking)
    .where(
      and(
        eq(booking.courtId, courtId),
        // Only non-cancelled bookings block slots
        or(eq(booking.status, 'confirmed'), eq(booking.status, 'pending')),
        // Overlaps with the requested day
        lte(booking.startAt, dayEndManila),
        gte(booking.endAt, dayStartManila),
      ),
    )

  // Convert to Manila-timezone hours
  return bookings.map((b) => {
    const start = new Date(b.startAt)
    const end = new Date(b.endAt)
    // Get the hour in Manila timezone
    const startHour = parseInt(
      new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        hour12: false,
        timeZone: 'Asia/Manila',
      }).format(start),
      10,
    )
    const endHour = parseInt(
      new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        hour12: false,
        timeZone: 'Asia/Manila',
      }).format(end),
      10,
    )
    return { startHour, endHour: endHour === 0 ? 24 : endHour }
  })
}

/**
 * Fetches all bookings for a user, ordered by start time descending.
 * Includes court name and invoice details.
 */
export async function getUserBookings(
  userId: string,
): Promise<BookingListItem[]> {
  const rows = await db
    .select({
      id: booking.id,
      courtId: booking.courtId,
      courtName: court.courtName,
      location: court.location,
      startAt: booking.startAt,
      endAt: booking.endAt,
      status: booking.status,
      createdAt: booking.createdAt,
      invoiceId: invoice.id,
      paymentMethod: invoice.paymentMethod,
      paymentTotal: invoice.paymentTotal,
      invoiceStatus: invoice.status,
    })
    .from(booking)
    .innerJoin(court, eq(booking.courtId, court.id))
    .leftJoin(invoice, eq(invoice.bookingId, booking.id))
    .where(eq(booking.userId, userId))
    .orderBy(desc(booking.startAt))

  return rows.map((r) => ({
    id: r.id,
    courtId: r.courtId,
    courtName: r.courtName,
    location: r.location,
    startAt: r.startAt,
    endAt: r.endAt,
    status: r.status,
    createdAt: r.createdAt,
    invoice: r.invoiceId
      ? {
          id: r.invoiceId,
          paymentMethod: r.paymentMethod!,
          paymentTotal: Number(r.paymentTotal!),
          status: r.invoiceStatus!,
        }
      : null,
  }))
}

/**
 * Fetches a single booking by ID with court details and invoice.
 * Returns null if not found.
 */
export async function getBookingById(
  bookingId: string,
): Promise<BookingDetail | null> {
  const [row] = await db
    .select({
      id: booking.id,
      courtId: booking.courtId,
      courtName: court.courtName,
      location: court.location,
      courtType: court.courtType,
      pricePerHour: court.pricePerHour,
      startAt: booking.startAt,
      endAt: booking.endAt,
      status: booking.status,
      createdAt: booking.createdAt,
      userId: booking.userId,
      invoiceId: invoice.id,
      paymentMethod: invoice.paymentMethod,
      paymentTotal: invoice.paymentTotal,
      invoiceStatus: invoice.status,
    })
    .from(booking)
    .innerJoin(court, eq(booking.courtId, court.id))
    .leftJoin(invoice, eq(invoice.bookingId, booking.id))
    .where(eq(booking.id, bookingId))

  if (!row) return null

  return {
    id: row.id,
    courtId: row.courtId,
    courtName: row.courtName,
    location: row.location,
    courtType: row.courtType,
    pricePerHour: Number(row.pricePerHour ?? 0),
    startAt: row.startAt,
    endAt: row.endAt,
    status: row.status,
    createdAt: row.createdAt,
    invoice: row.invoiceId
      ? {
          id: row.invoiceId,
          paymentMethod: row.paymentMethod!,
          paymentTotal: Number(row.paymentTotal!),
          status: row.invoiceStatus!,
        }
      : null,
  }
}

/**
 * Creates a booking and invoice in a single transaction.
 * Checks for overlapping confirmed/pending bookings before inserting.
 *
 * @throws {Error} with message 'CONFLICT' if a double-booking is detected
 * @throws {Error} with message 'COURT_NOT_FOUND' if court doesn't exist or is inactive
 */
export async function createBookingWithInvoice(
  input: CreateBookingInput,
): Promise<CreateBookingResult> {
  return await db.transaction(async (tx) => {
    // 1. Verify court exists and is active, get price
    const [foundCourt] = await tx
      .select({
        id: court.id,
        pricePerHour: court.pricePerHour,
        status: court.status,
      })
      .from(court)
      .where(eq(court.id, input.courtId))

    if (!foundCourt || foundCourt.status !== 'active') {
      throw new Error('COURT_NOT_FOUND')
    }

    // 2. Check for overlapping bookings (pending or confirmed)
    const overlapping = await tx
      .select({ id: booking.id })
      .from(booking)
      .where(
        and(
          eq(booking.courtId, input.courtId),
          or(eq(booking.status, 'confirmed'), eq(booking.status, 'pending')),
          // Overlap condition: existing.start < new.end AND existing.end > new.start
          sql`${booking.startAt} < ${input.endAt}`,
          sql`${booking.endAt} > ${input.startAt}`,
        ),
      )
      .limit(1)

    if (overlapping.length > 0) {
      throw new Error('CONFLICT')
    }

    // 3. Calculate total
    const pricePerHour = Number(foundCourt.pricePerHour ?? 0)
    const durationMs = input.endAt.getTime() - input.startAt.getTime()
    const durationHours = durationMs / (1000 * 60 * 60)
    const paymentTotal = pricePerHour * durationHours

    // 4. Insert booking
    const [newBooking] = await tx
      .insert(booking)
      .values({
        userId: input.userId,
        courtId: input.courtId,
        startAt: input.startAt,
        endAt: input.endAt,
        status: 'pending',
      })
      .returning()

    // 5. Insert invoice
    const [newInvoice] = await tx
      .insert(invoice)
      .values({
        bookingId: newBooking.id,
        paymentMethod: input.paymentMethod,
        paymentTotal: paymentTotal.toFixed(2),
        status: 'unpaid',
      })
      .returning()

    return {
      booking: {
        id: newBooking.id,
        courtId: newBooking.courtId,
        startAt: newBooking.startAt,
        endAt: newBooking.endAt,
        status: newBooking.status,
      },
      invoice: {
        id: newInvoice.id,
        paymentMethod: newInvoice.paymentMethod,
        paymentTotal: Number(newInvoice.paymentTotal),
        status: newInvoice.status,
      },
    }
  })
}

/**
 * Cancels a booking. Enforces:
 * - Booking must belong to userId (or userId is admin)
 * - Booking status must be 'pending' or 'confirmed'
 * - Booking start_at must be > 24 hours from now
 *
 * Also sets the linked invoice status to 'refunded' if it was 'paid'.
 *
 * @throws {Error} with message describing the failure
 */
export async function cancelBooking(
  bookingId: string,
  userId: string,
  isAdmin: boolean = false,
): Promise<{ bookingId: string; status: string }> {
  return await db.transaction(async (tx) => {
    // 1. Fetch booking
    const [found] = await tx
      .select({
        id: booking.id,
        userId: booking.userId,
        status: booking.status,
        startAt: booking.startAt,
      })
      .from(booking)
      .where(eq(booking.id, bookingId))

    if (!found) {
      throw new Error('NOT_FOUND')
    }

    // 2. Ownership check
    if (!isAdmin && found.userId !== userId) {
      throw new Error('FORBIDDEN')
    }

    // 3. Status check
    if (found.status !== 'pending' && found.status !== 'confirmed') {
      throw new Error('INVALID_STATUS')
    }

    // 4. 24-hour cancellation window
    const now = new Date()
    const msUntilStart = found.startAt.getTime() - now.getTime()
    const hoursUntilStart = msUntilStart / (1000 * 60 * 60)

    if (hoursUntilStart < 24) {
      throw new Error('CANCELLATION_WINDOW')
    }

    // 5. Cancel booking
    await tx
      .update(booking)
      .set({ status: 'cancelled', updatedAt: new Date() })
      .where(eq(booking.id, bookingId))

    // 6. Update invoice to refunded (if it was paid)
    await tx
      .update(invoice)
      .set({ status: 'refunded', updatedAt: new Date() })
      .where(
        and(
          eq(invoice.bookingId, bookingId),
          eq(invoice.status, 'paid'),
        ),
      )

    return { bookingId, status: 'cancelled' }
  })
}
