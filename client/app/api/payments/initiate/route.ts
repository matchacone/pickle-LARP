import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getPaymentService } from '@/lib/payment'
import { getInvoiceForPayment } from '@/lib/db/queries/paymentQueries'

// ─── POST /api/payments/initiate — Initiate a payment session ─────────────────
export async function POST(request: NextRequest) {
  // 1. Authenticate
  const supabase = await createServerClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Authentication required', code: 'UNAUTHORIZED' },
      { status: 401 },
    )
  }

  // 2. Parse body
  let body: { invoice_id?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body', code: 'INVALID_INPUT' },
      { status: 422 },
    )
  }

  const { invoice_id } = body

  if (!invoice_id || typeof invoice_id !== 'string') {
    return NextResponse.json(
      { error: 'Missing required field: invoice_id', code: 'INVALID_INPUT' },
      { status: 422 },
    )
  }

  // 3. Fetch invoice and validate ownership
  try {
    let inv = await getInvoiceForPayment(invoice_id)

    // Handle potential read-replica replication lag by retrying once
    if (!inv) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      inv = await getInvoiceForPayment(invoice_id)
    }

    if (!inv) {
      return NextResponse.json(
        { error: 'Invoice not found', code: 'NOT_FOUND' },
        { status: 404 },
      )
    }

    // Ownership check — the booking's user_id must match the authenticated user
    if (inv.userId !== user.id) {
      return NextResponse.json(
        { error: 'You do not own this invoice', code: 'FORBIDDEN' },
        { status: 403 },
      )
    }

    // Status check — only unpaid invoices can be paid
    if (inv.status !== 'unpaid') {
      return NextResponse.json(
        { error: `Invoice is already ${inv.status}`, code: 'CONFLICT' },
        { status: 409 },
      )
    }

    // 4. Call payment service
    const paymentService = getPaymentService()
    const result = await paymentService.initiatePayment({
      invoiceId: inv.id,
      amount: inv.paymentTotal,
      currency: 'PHP',
    })

    return NextResponse.json({
      provider: 'mock',
      checkout_url: result.checkoutUrl,
      amount: inv.paymentTotal,
      currency: 'PHP',
    })
  } catch (error) {
    console.error('[POST /api/payments/initiate]', error)
    return NextResponse.json(
      { error: 'Failed to initiate payment', code: 'INTERNAL_ERROR' },
      { status: 500 },
    )
  }
}
