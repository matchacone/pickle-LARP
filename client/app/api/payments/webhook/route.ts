import { NextRequest, NextResponse } from 'next/server'
import { getPaymentService } from '@/lib/payment'
import { confirmPayment, failPayment } from '@/lib/db/queries/paymentQueries'

// ─── POST /api/payments/webhook — Payment provider callback ───────────────────
//
// Public endpoint — no auth required. In production, the webhook signature
// is verified by the PaymentService.verifyWebhook() method.
//
// On success: invoice.status → 'paid', booking.status → 'confirmed'
// On failure: booking.status → 'cancelled'
//
export async function POST(request: NextRequest) {
  // 1. Read raw payload and signature header
  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body', code: 'INVALID_INPUT' },
      { status: 400 },
    )
  }

  // In production, read the provider-specific signature header
  // e.g. request.headers.get('x-paymongo-signature')
  const signature = request.headers.get('x-webhook-signature') ?? ''

  // 2. Verify webhook via PaymentService
  let result: { invoiceId: string; status: 'paid' | 'failed' }
  try {
    const paymentService = getPaymentService()
    result = await paymentService.verifyWebhook(payload, signature)
  } catch (error) {
    console.error('[POST /api/payments/webhook] Verification failed:', error)
    return NextResponse.json(
      { error: 'Invalid webhook payload', code: 'INVALID_INPUT' },
      { status: 400 },
    )
  }

  // 3. Update invoice + booking status
  try {
    if (result.status === 'paid') {
      await confirmPayment(result.invoiceId)
    } else {
      await failPayment(result.invoiceId)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'

    if (message === 'INVOICE_NOT_FOUND') {
      return NextResponse.json(
        { error: 'Invoice not found', code: 'NOT_FOUND' },
        { status: 404 },
      )
    }

    if (message === 'INVALID_STATUS') {
      // Invoice was already processed — idempotent response
      return NextResponse.json({ received: true })
    }

    console.error('[POST /api/payments/webhook]', error)
    return NextResponse.json(
      { error: 'Failed to process webhook', code: 'INTERNAL_ERROR' },
      { status: 500 },
    )
  }
}
