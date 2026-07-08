/**
 * PaymentService — abstract interface for payment providers.
 *
 * Route Handlers and components call this interface — never a
 * payment SDK directly. Swap `getPaymentService()` to switch
 * from mock to a real provider (Stripe, PayMongo, etc.) without
 * touching any caller.
 */

export interface PaymentService {
  /**
   * Initiates a payment session with the provider.
   * Returns a checkout URL the user should be redirected to.
   */
  initiatePayment(params: {
    invoiceId: string
    amount: number
    currency: 'PHP'
  }): Promise<{
    checkoutUrl: string
    providerPaymentId: string
  }>

  /**
   * Verifies a webhook payload from the payment provider.
   * Returns the invoice ID and resolved status.
   */
  verifyWebhook(
    payload: unknown,
    signature: string,
  ): Promise<{
    invoiceId: string
    status: 'paid' | 'failed'
  }>
}

// ─── Factory ──────────────────────────────────────────────────────────────────

let _service: PaymentService | null = null

/**
 * Returns the configured PaymentService singleton.
 * Currently returns the mock implementation.
 * Swap this to return a real provider when ready.
 */
export function getPaymentService(): PaymentService {
  if (!_service) {
    // Dynamic import is avoided — the mock is lightweight enough to import eagerly.
    // When switching to a real provider, change this import.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { mockPaymentService } = require('./mock') as { mockPaymentService: PaymentService }
    _service = mockPaymentService
  }
  return _service
}
