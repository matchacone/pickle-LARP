'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  Loader2,
  ShieldCheck,
  Lock,
} from 'lucide-react'

// ─── Mock Payment Content ─────────────────────────────────────────────────────
function MockPaymentContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const invoiceId = searchParams.get('invoice_id')
  const amountStr = searchParams.get('amount')
  const providerPaymentId = searchParams.get('provider_payment_id')

  const amount = amountStr ? parseFloat(amountStr) : 0

  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<'success' | 'failed' | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Validate params
  if (!invoiceId || !amount) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-8">
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 bg-error-container">
            <XCircle size={32} className="text-error" />
          </div>
          <h1 className="text-2xl font-extrabold text-asphalt">Invalid Payment Link</h1>
          <p className="text-sm text-on-surface-variant mt-3 leading-relaxed">
            This payment link is invalid or has expired.
          </p>
          <Link href="/courts" className="btn btn-primary w-full justify-center mt-8">
            Browse Courts
          </Link>
        </div>
      </div>
    )
  }

  const handlePayment = async (action: 'paid' | 'failed') => {
    setIsProcessing(true)
    setError(null)

    try {
      const res = await fetch('/api/payments/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoice_id: invoiceId,
          status: action,
          provider_payment_id: providerPaymentId,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Payment processing failed')
        setIsProcessing(false)
        return
      }

      setResult(action === 'paid' ? 'success' : 'failed')

      // Redirect after a brief delay to show the result
      setTimeout(() => {
        if (action === 'paid') {
          router.push('/my-bookings')
        } else {
          router.push('/courts')
        }
      }, 2000)
    } catch {
      setError('Network error. Please try again.')
      setIsProcessing(false)
    }
  }

  // ── Success state ───────────────────────────────────────────────────────────
  if (result === 'success') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-8">
        <div className="w-full max-w-sm text-center animate-fade-up">
          <div className="relative mx-auto mb-8 w-20 h-20">
            <div className="absolute inset-0 rounded-full bg-green/20 animate-ping" style={{ animationDuration: '1.5s' }} />
            <div className="relative w-20 h-20 rounded-full bg-green flex items-center justify-center shadow-lg shadow-green/30">
              <CheckCircle2 size={40} className="text-asphalt" strokeWidth={2} />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-asphalt tracking-tight">
            Payment Successful!
          </h1>
          <p className="text-sm text-on-surface-variant mt-3 leading-relaxed">
            Your booking has been confirmed. Redirecting to your bookings…
          </p>
          <div className="mt-6 flex items-center justify-center gap-2 text-on-surface-variant">
            <Loader2 size={16} className="animate-spin" />
            <span className="text-xs font-semibold">Redirecting…</span>
          </div>
        </div>
      </div>
    )
  }

  // ── Failed state ────────────────────────────────────────────────────────────
  if (result === 'failed') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-8">
        <div className="w-full max-w-sm text-center animate-fade-up">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 bg-error-container">
            <XCircle size={32} className="text-error" />
          </div>
          <h1 className="text-2xl font-extrabold text-asphalt">Payment Cancelled</h1>
          <p className="text-sm text-on-surface-variant mt-3 leading-relaxed">
            Your booking has been cancelled. Redirecting…
          </p>
          <div className="mt-6 flex items-center justify-center gap-2 text-on-surface-variant">
            <Loader2 size={16} className="animate-spin" />
            <span className="text-xs font-semibold">Redirecting…</span>
          </div>
        </div>
      </div>
    )
  }

  // ── Mock payment form ───────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-mist">
      {/* Header */}
      <header className="border-b border-outline bg-white">
        <div className="container-page flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-asphalt flex items-center justify-center">
              <CreditCard size={16} className="text-green" />
            </div>
            <span className="text-base font-extrabold text-asphalt tracking-tight">
              Mock Payment
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant">
            <Lock size={12} />
            Demo Mode
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="container-page py-12 flex items-start justify-center">
        <div className="w-full max-w-md">
          {/* Demo notice */}
          <div className="flex items-start gap-3 p-4 bg-green/10 border border-green/20 rounded-xl mb-8">
            <ShieldCheck size={18} className="text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-asphalt">Demo Payment Page</p>
              <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
                This is a simulated payment page. In production, you would be
                redirected to a real payment provider (Stripe, PayMongo, etc.).
              </p>
            </div>
          </div>

          {/* Payment card */}
          <div className="card p-8">
            <div className="text-center mb-8">
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                Amount Due
              </p>
              <p className="text-4xl font-extrabold text-asphalt tracking-tight">
                ₱{amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-on-surface-variant mt-2">Philippine Peso (PHP)</p>
            </div>

            {/* Invoice reference */}
            <div className="bg-mist rounded-xl p-4 mb-8">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-on-surface-variant">Invoice</span>
                <span className="text-xs font-bold text-asphalt font-mono">
                  {invoiceId.slice(0, 8).toUpperCase()}
                </span>
              </div>
            </div>

            {/* Credit Card Fields (Mock) */}
            <div className="mb-8 space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-asphalt mb-1.5 uppercase tracking-widest">
                  Name on Card
                </label>
                <input
                  type="text"
                  placeholder="Juan Dela Cruz"
                  className="w-full px-4 py-3 rounded-xl border border-outline bg-white text-sm text-asphalt focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-asphalt mb-1.5 uppercase tracking-widest">
                  Card Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="0000 0000 0000 0000"
                    maxLength={19}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-outline bg-white text-sm text-asphalt focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all tracking-widest"
                  />
                  <CreditCard size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-asphalt mb-1.5 uppercase tracking-widest">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    maxLength={5}
                    className="w-full px-4 py-3 rounded-xl border border-outline bg-white text-sm text-asphalt focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-center tracking-widest"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-asphalt mb-1.5 uppercase tracking-widest">
                    CVC
                  </label>
                  <input
                    type="text"
                    placeholder="123"
                    maxLength={4}
                    className="w-full px-4 py-3 rounded-xl border border-outline bg-white text-sm text-asphalt focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-center tracking-widest"
                  />
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 mb-6 bg-error/10 border border-error/20 rounded-lg text-sm font-semibold text-error flex items-center gap-2">
                <XCircle size={16} className="flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <button
                id="mock-pay-now"
                type="button"
                onClick={() => handlePayment('paid')}
                disabled={isProcessing}
                className="btn btn-cta w-full justify-center gap-2 py-3.5 text-base font-extrabold shadow-lg shadow-green/20 disabled:opacity-70 disabled:cursor-wait"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Processing…
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} />
                    Pay ₱{amount.toLocaleString()}
                  </>
                )}
              </button>

              <button
                id="mock-cancel"
                type="button"
                onClick={() => handlePayment('failed')}
                disabled={isProcessing}
                className="btn btn-outline w-full justify-center gap-2 py-3 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <XCircle size={16} />
                Cancel Payment
              </button>
            </div>

            <p className="text-[10px] text-on-surface-variant text-center mt-6 leading-relaxed">
              This is a test environment. No real charges will be made.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Page wrapper with Suspense (required for useSearchParams) ─────────────
export default function MockPaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="flex items-center gap-3 text-on-surface-variant">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm font-semibold">Loading payment…</span>
          </div>
        </div>
      }
    >
      <MockPaymentContent />
    </Suspense>
  )
}
