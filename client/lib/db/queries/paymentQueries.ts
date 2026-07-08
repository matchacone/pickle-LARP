/**
 * Payment query functions — shared data access layer.
 *
 * All payment-related Drizzle queries live here so Route Handlers
 * import from a single source.
 */

import { db } from '@/lib/db'
import { invoice, booking } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

// ─── Types ────────────────────────────────────────────────────────────────────

/** Shape returned by getInvoiceForPayment() */
export type InvoiceForPayment = {
  id: string
  bookingId: string
  paymentTotal: number
  status: string
  userId: string
}

// ─── Queries ──────────────────────────────────────────────────────────────────

/**
 * Fetches an invoice with its booking's userId for ownership validation.
 * Returns null if not found.
 */
export async function getInvoiceForPayment(
  invoiceId: string,
): Promise<InvoiceForPayment | null> {
  const [row] = await db
    .select({
      id: invoice.id,
      bookingId: invoice.bookingId,
      paymentTotal: invoice.paymentTotal,
      status: invoice.status,
      userId: booking.userId,
    })
    .from(invoice)
    .innerJoin(booking, eq(invoice.bookingId, booking.id))
    .where(eq(invoice.id, invoiceId))

  if (!row) return null

  return {
    id: row.id,
    bookingId: row.bookingId,
    paymentTotal: Number(row.paymentTotal),
    status: row.status,
    userId: row.userId,
  }
}

/**
 * Confirms a payment: sets invoice.status = 'paid' and booking.status = 'confirmed'.
 * Runs in a single transaction.
 *
 * @throws {Error} with message 'INVOICE_NOT_FOUND' if invoice doesn't exist
 * @throws {Error} with message 'INVALID_STATUS' if invoice is not 'unpaid'
 */
export async function confirmPayment(invoiceId: string): Promise<void> {
  await db.transaction(async (tx) => {
    // 1. Fetch invoice
    const [inv] = await tx
      .select({
        id: invoice.id,
        bookingId: invoice.bookingId,
        status: invoice.status,
      })
      .from(invoice)
      .where(eq(invoice.id, invoiceId))

    if (!inv) {
      throw new Error('INVOICE_NOT_FOUND')
    }

    if (inv.status !== 'unpaid') {
      throw new Error('INVALID_STATUS')
    }

    const now = new Date()

    // 2. Update invoice → paid
    await tx
      .update(invoice)
      .set({ status: 'paid', updatedAt: now })
      .where(eq(invoice.id, invoiceId))

    // 3. Update booking → confirmed
    await tx
      .update(booking)
      .set({ status: 'confirmed', updatedAt: now })
      .where(eq(booking.id, inv.bookingId))
  })
}

/**
 * Handles a failed payment: sets booking.status = 'cancelled'.
 * The invoice remains 'unpaid'.
 *
 * @throws {Error} with message 'INVOICE_NOT_FOUND' if invoice doesn't exist
 */
export async function failPayment(invoiceId: string): Promise<void> {
  await db.transaction(async (tx) => {
    // 1. Fetch invoice to get the booking ID
    const [inv] = await tx
      .select({
        id: invoice.id,
        bookingId: invoice.bookingId,
      })
      .from(invoice)
      .where(eq(invoice.id, invoiceId))

    if (!inv) {
      throw new Error('INVOICE_NOT_FOUND')
    }

    const now = new Date()

    // 2. Cancel the booking
    await tx
      .update(booking)
      .set({ status: 'cancelled', updatedAt: now })
      .where(eq(booking.id, inv.bookingId))
  })
}
