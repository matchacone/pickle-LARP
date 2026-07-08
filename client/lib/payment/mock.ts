/**
 * Mock payment service — Phase 1 implementation.
 *
 * Auto-confirms payments for demo purposes. In production,
 * replace this with a real provider (Stripe, PayMongo, etc.)
 * by implementing the PaymentService interface.
 */

import type { PaymentService } from './index'

export const mockPaymentService: PaymentService = {
  async initiatePayment({ invoiceId, amount }) {
    // Generate a mock provider payment ID
    const providerPaymentId = `mock_${Date.now()}_${invoiceId.slice(0, 8)}`

    // Build a checkout URL pointing to our mock payment page
    const params = new URLSearchParams({
      invoice_id: invoiceId,
      amount: amount.toString(),
      provider_payment_id: providerPaymentId,
    })

    return {
      checkoutUrl: `/mock-payment?${params.toString()}`,
      providerPaymentId,
    }
  },

  async verifyWebhook(payload) {
    // For demo: trust the payload directly. In production,
    // verify the signature against the provider's secret.
    const data = payload as {
      invoice_id?: string
      status?: 'paid' | 'failed'
    }

    if (!data.invoice_id || !data.status) {
      throw new Error('Invalid webhook payload')
    }

    return {
      invoiceId: data.invoice_id,
      status: data.status,
    }
  },
}
