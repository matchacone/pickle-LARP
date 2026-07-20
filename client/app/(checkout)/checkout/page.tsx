'use client'

import { useState, useMemo, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  Timer,
  CreditCard,
  Smartphone,
  Banknote,
  ShieldCheck,
  Lock,
  CheckCircle2,
  ArrowRight,
  Loader2,
  AlertCircle,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
type CourtInfo = {
  id: string
  courtName: string
  description: string | null
  location: string | null
  pricePerHour: number
  courtType: string | null
}

// ─── Payment method definitions ───────────────────────────────────────────────
const PAYMENT_METHODS = [
  { id: 'Credit Card', label: 'Credit / Debit Card', icon: CreditCard, description: 'Visa, Mastercard, JCB' },
  { id: 'GCash', label: 'GCash', icon: Smartphone, description: 'Pay via GCash e-wallet' },
  { id: 'Cash', label: 'Cash on Site', icon: Banknote, description: 'Pay when you arrive' },
] as const

// ─── Time formatting helpers ──────────────────────────────────────────────────
function formatHour(hour: number): string {
  const isPM = hour >= 12
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
  return `${displayHour}:00 ${isPM ? 'PM' : 'AM'}`
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return new Intl.DateTimeFormat('en-PH', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'Asia/Manila',
  }).format(d)
}

// ─── Step indicator ───────────────────────────────────────────────────────────
function StepIndicator({ current }: { current: 'review' | 'confirmed' }) {
  const steps = [
    { id: 'select', label: 'Select' },
    { id: 'review', label: 'Review' },
    { id: 'confirmed', label: 'Confirmed' },
  ] as const

  const currentIdx = current === 'review' ? 1 : 2

  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {steps.map((step, i) => {
        const isCompleted = i < currentIdx
        const isCurrent = i === currentIdx
        const isLast = i === steps.length - 1

        return (
          <div key={step.id} className="flex items-center">
            {/* Step circle */}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
                  ${isCompleted
                    ? 'bg-green text-asphalt'
                    : isCurrent
                    ? 'bg-asphalt text-white ring-4 ring-asphalt/10'
                    : 'bg-mist text-on-surface-variant border border-outline'
                  }
                `}
              >
                {isCompleted ? (
                  <CheckCircle2 size={16} strokeWidth={2.5} />
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={`text-[10px] font-bold uppercase tracking-widest ${
                  isCompleted || isCurrent ? 'text-asphalt' : 'text-on-surface-variant'
                }`}
              >
                {step.label}
              </span>
            </div>
            {/* Connector line */}
            {!isLast && (
              <div
                className={`w-16 md:w-24 h-0.5 mx-2 mb-5 rounded-full transition-all duration-500 ${
                  isCompleted ? 'bg-green' : 'bg-outline'
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Checkout content (needs useSearchParams) ─────────────────────────────────
function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Parse query params
  const courtId = searchParams.get('courtId')
  const dateStr = searchParams.get('date')
  const startHourStr = searchParams.get('startHour')
  const durationStr = searchParams.get('duration')

  const startHour = startHourStr ? parseInt(startHourStr, 10) : null
  const duration = durationStr ? parseInt(durationStr, 10) : null

  // Court data — fetched from the availability API (which returns court info)
  const [court, setCourt] = useState<CourtInfo | null>(null)
  const [courtLoading, setCourtLoading] = useState(true)

  // Fetch court data on mount
  useEffect(() => {
    if (!courtId) {
      setTimeout(() => setCourtLoading(false), 0)
      return
    }

    // We can fetch from the availability endpoint or do a lightweight fetch
    // For simplicity, we'll fetch from a simple court query endpoint
    // Since we don't have a dedicated GET /api/courts/[id], we use the booking
    // queries to get court info. But actually the simplest is to just check
    // if the court exists via the availability endpoint + get data from there.
    // Let's just fetch basic court info via a server action pattern or a small API.
    // For now, let's use a simple fetch to get availability which confirms the court exists.
    async function fetchCourt() {
      try {
        // Fetch availability to verify court exists and get booked slots
        const res = await fetch(`/api/courts/${courtId}/availability?date=${dateStr}`)
        if (!res.ok) {
          setCourtLoading(false)
          return
        }

        // We also need court details. Let's fetch from the page data.
        // Since the court detail page uses getCourtById, we can create a lightweight
        // endpoint. But to avoid scope creep, we'll use the existing court listing
        // query indirectly — the booking creation will validate the court server-side.
        // For display, we pass the data via query params (already have courtId).
        // We'll fetch the court data from the reviews endpoint which includes court info.
        // Actually, the cleanest approach: fetch from the court detail page's RSC data.
        // But since this is a client component, let's just add a small fetch.

        // Use the existing booking queries which join on court table
        // For now, just set placeholder data — the server will validate on submit
        const courtRes = await fetch(`/api/courts/${courtId}/reviews`)
        if (courtRes.ok) {
          // Reviews endpoint exists — we know the court exists
          // But it doesn't return court details. Let's fetch availability and
          // construct what we need from query params + price will come from
          // the booking creation response.
        }

        // Simplest path: fetch court data from a lightweight endpoint
        // Since we don't have GET /api/courts/[id], we'll use a server action
        // For MVP: store court info in sessionStorage from the previous page
        // and fall back to a direct DB query via a new endpoint.
        // But for correctness, let's create a minimal server action.

        // Actually — let's just use the data we have. The booking API validates
        // everything server-side. We only need display data here.
        // The previous page (court detail) has the price. We'll encode it in the URL.
        setCourtLoading(false)
      } catch {
        setCourtLoading(false)
      }
    }
    fetchCourt()
  }, [courtId, dateStr])

  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState<string>('Credit Card')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isConfirmed] = useState(false)
  const [bookingResult, setBookingResult] = useState<{
    bookingId: string
    invoiceId: string
    paymentTotal: number
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Validate params
  const isValid =
    courtId !== null &&
    dateStr !== null &&
    startHour !== null &&
    duration !== null &&
    !isNaN(startHour) &&
    !isNaN(duration) &&
    startHour >= 8 &&
    startHour <= 21 &&
    duration >= 1 &&
    duration <= 8

  // Computed values
  const endHour = startHour !== null && duration !== null ? startHour + duration : 0

  // Build ISO timestamps from the query params
  const buildTimestamps = () => {
    if (!dateStr || startHour === null || duration === null) return null
    // Build Manila time → UTC
    const startISO = `${dateStr}T${String(startHour).padStart(2, '0')}:00:00+08:00`
    const endISO = `${dateStr}T${String(startHour + duration).padStart(2, '0')}:00:00+08:00`
    return {
      start_at: new Date(startISO).toISOString(),
      end_at: new Date(endISO).toISOString(),
    }
  }

  // Handle confirm — create booking then initiate payment
  const handleConfirm = async () => {
    if (!isValid || !courtId) return
    setIsSubmitting(true)
    setError(null)

    const timestamps = buildTimestamps()
    if (!timestamps) {
      setError('Invalid booking parameters')
      setIsSubmitting(false)
      return
    }

    try {
      // Step 1: Create booking + invoice
      const bookingRes = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          court_id: courtId,
          start_at: timestamps.start_at,
          end_at: timestamps.end_at,
          payment_method: paymentMethod,
        }),
      })

      const bookingData = await bookingRes.json()

      if (!bookingRes.ok) {
        if (bookingRes.status === 401) {
          router.push(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`)
          return
        }
        setError(bookingData.error || 'Failed to create booking')
        setIsSubmitting(false)
        return
      }

      const invoiceId = bookingData.invoice.id

      // Step 2: Initiate payment
      const paymentRes = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoice_id: invoiceId }),
      })

      const paymentData = await paymentRes.json()

      if (!paymentRes.ok) {
        // Booking was created but payment initiation failed.
        // Show the error but store the result so user can retry.
        setBookingResult({
          bookingId: bookingData.booking.id,
          invoiceId,
          paymentTotal: bookingData.invoice.paymentTotal,
        })
        setError(paymentData.error || 'Failed to initiate payment. Your booking is saved — you can pay from My Bookings.')
        setIsSubmitting(false)
        return
      }

      // Step 3: Redirect to payment provider checkout
      router.push(paymentData.checkout_url)
    } catch {
      setError('Network error. Please try again.')
      setIsSubmitting(false)
    }
  }

  // Read price from URL (passed from the AvailabilityCalendar via the court detail page)
  const priceParam = searchParams.get('price')
  const estimatedPrice = priceParam ? parseFloat(priceParam) : 0
  const totalAmount = bookingResult
    ? bookingResult.paymentTotal
    : estimatedPrice && duration
    ? estimatedPrice * duration
    : 0

  // ── Invalid params — redirect back ──────────────────────────────────────────
  if (!isValid) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-8">
        <div className="w-full max-w-sm text-center animate-fade-up">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 bg-error-container">
            <AlertCircle size={32} className="text-error" />
          </div>
          <h1 className="text-2xl font-extrabold text-asphalt">Invalid Booking</h1>
          <p className="text-sm text-on-surface-variant mt-3 leading-relaxed">
            The booking details are missing or invalid. Please go back and select a court and time slot.
          </p>
          <Link
            href="/courts"
            className="btn btn-primary w-full justify-center mt-8"
          >
            Browse Courts
          </Link>
        </div>
      </div>
    )
  }

  // ── Success state ───────────────────────────────────────────────────────────
  if (isConfirmed && bookingResult) {
    const bookingRef = bookingResult.bookingId.slice(0, 8).toUpperCase()

    return (
      <div className="min-h-screen bg-white">
        {/* Minimal header */}
        <header className="border-b border-outline bg-white">
          <div className="container-page flex items-center h-16">
            <Link href="/" className="flex items-center gap-1.5">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-asphalt">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <rect x="2" y="2" width="14" height="14" rx="1" stroke="#D1FE00" strokeWidth="1.5"/>
                  <line x1="9" y1="2" x2="9" y2="16" stroke="#D1FE00" strokeWidth="1.5"/>
                  <line x1="2" y1="9" x2="16" y2="9" stroke="#D1FE00" strokeWidth="1"/>
                </svg>
              </span>
              <span className="text-lg font-extrabold tracking-tight text-asphalt">
                Pickle<span className="text-primary">All</span>
              </span>
            </Link>
          </div>
        </header>

        <div className="flex items-center justify-center p-8" style={{ minHeight: 'calc(100vh - 64px)' }}>
          <div className="w-full max-w-lg text-center animate-fade-up">
            {/* Success icon */}
            <div className="relative mx-auto mb-8 w-20 h-20">
              <div className="absolute inset-0 rounded-full bg-green/20 animate-ping" style={{ animationDuration: '1.5s' }} />
              <div className="relative w-20 h-20 rounded-full bg-green flex items-center justify-center shadow-lg shadow-green/30">
                <CheckCircle2 size={40} className="text-asphalt" strokeWidth={2} />
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold text-asphalt tracking-tight">
              Booking Created!
            </h1>
            <p className="text-base text-on-surface-variant mt-3 leading-relaxed">
              Your court has been reserved. Complete payment to confirm your booking.
            </p>

            {/* Booking details card */}
            <div className="mt-8 card p-6 text-left">
              <div className="flex items-center justify-between mb-5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  Booking Reference
                </span>
                <span className="text-sm font-extrabold text-asphalt bg-green/20 px-3 py-1 rounded-full">
                  {bookingRef}
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-mist flex items-center justify-center flex-shrink-0">
                    <Calendar size={16} className="text-asphalt" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-asphalt">{formatDate(dateStr!)}</p>
                    <p className="text-xs text-on-surface-variant">
                      {formatHour(startHour!)} — {formatHour(endHour)} ({duration} hr{duration! > 1 ? 's' : ''})
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-mist flex items-center justify-center flex-shrink-0">
                    <CreditCard size={16} className="text-asphalt" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-asphalt">{paymentMethod}</p>
                    <p className="text-xs text-on-surface-variant">
                      Status: <span className="text-amber-600 font-bold">Awaiting Payment</span>
                    </p>
                  </div>
                </div>

                <div className="border-t border-outline pt-4 flex items-center justify-between">
                  <span className="text-sm font-bold text-on-surface-variant">Total</span>
                  <span className="text-xl font-extrabold text-asphalt">₱{totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                href="/my-bookings"
                className="btn btn-primary flex-1 justify-center text-sm py-3"
              >
                Go to My Bookings
              </Link>
              <Link
                href="/courts"
                className="btn btn-outline flex-1 justify-center text-sm py-3"
              >
                Browse Courts
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Main checkout form ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="border-b border-outline bg-white sticky top-0 z-40">
        <div className="container-page flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1.5 text-sm font-semibold text-on-surface-variant hover:text-asphalt transition-colors"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Back</span>
            </button>
            <div className="w-px h-6 bg-outline" />
            <Link href="/" className="flex items-center gap-1.5">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-asphalt">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <rect x="2" y="2" width="14" height="14" rx="1" stroke="#D1FE00" strokeWidth="1.5"/>
                  <line x1="9" y1="2" x2="9" y2="16" stroke="#D1FE00" strokeWidth="1.5"/>
                  <line x1="2" y1="9" x2="16" y2="9" stroke="#D1FE00" strokeWidth="1"/>
                </svg>
              </span>
              <span className="text-lg font-extrabold tracking-tight text-asphalt">
                Pickle<span className="text-primary">All</span>
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant">
            <Lock size={12} />
            Secure Checkout
          </div>
        </div>
      </header>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <div className="container-page py-8 md:py-12">
        {/* Step indicator */}
        <StepIndicator current="review" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-asphalt tracking-tight text-center mb-2">
          Review Your Booking
        </h1>
        <p className="text-sm text-on-surface-variant text-center mb-10 md:mb-14">
          Double-check the details below, then confirm to reserve your court.
        </p>

        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* ── LEFT: Booking Summary ───────────────────────────────────────── */}
          <div className="w-full lg:w-7/12 flex flex-col gap-6">
            {/* Date & time details */}
            <div className="card p-6">
              <h3 className="text-sm font-bold text-asphalt uppercase tracking-widest mb-5 flex items-center gap-2">
                <Clock size={14} className="text-primary" />
                Booking Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-mist rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar size={14} className="text-on-surface-variant" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                      Date
                    </span>
                  </div>
                  <p className="text-sm font-bold text-asphalt">
                    {formatDate(dateStr!)}
                  </p>
                </div>

                <div className="bg-mist rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock size={14} className="text-on-surface-variant" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                      Time
                    </span>
                  </div>
                  <p className="text-sm font-bold text-asphalt">
                    {formatHour(startHour!)} — {formatHour(endHour)}
                  </p>
                </div>

                <div className="bg-mist rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Timer size={14} className="text-on-surface-variant" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                      Duration
                    </span>
                  </div>
                  <p className="text-sm font-bold text-asphalt">
                    {duration} hour{duration! > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>

            {/* Cancellation policy */}
            <div className="flex items-start gap-3 p-4 bg-surface-low rounded-xl border border-outline">
              <ShieldCheck size={18} className="text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-asphalt">Free Cancellation</p>
                <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
                  Cancel up to 24 hours before your booking for a full refund. No questions asked.
                </p>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Payment + Confirm ────────────────────────────────────── */}
          <div className="w-full lg:w-5/12">
            <div className="lg:sticky lg:top-24 flex flex-col gap-6">
              {/* Payment method */}
              <div className="card p-6">
                <h3 className="text-sm font-bold text-asphalt uppercase tracking-widest mb-5 flex items-center gap-2">
                  <CreditCard size={14} className="text-primary" />
                  Payment Method
                </h3>

                <div className="flex flex-col gap-3">
                  {PAYMENT_METHODS.map((method) => {
                    const isSelected = paymentMethod === method.id
                    const Icon = method.icon
                    return (
                      <div key={method.id} className="flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod(method.id)}
                          disabled={isSubmitting}
                          className={`
                            flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all
                            ${isSelected
                              ? 'border-asphalt bg-asphalt/[0.03] ring-1 ring-asphalt/10'
                              : 'border-outline hover:border-outline-strong hover:bg-mist/50'
                            }
                            disabled:opacity-50 disabled:cursor-not-allowed
                          `}
                        >
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                              isSelected ? 'bg-asphalt text-white' : 'bg-mist text-on-surface-variant'
                            }`}
                          >
                            <Icon size={18} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-asphalt">{method.label}</p>
                            <p className="text-xs text-on-surface-variant">{method.description}</p>
                          </div>
                          {/* Radio indicator */}
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                              isSelected ? 'border-asphalt' : 'border-outline-strong'
                            }`}
                          >
                            {isSelected && (
                              <div className="w-2.5 h-2.5 rounded-full bg-asphalt" />
                            )}
                          </div>
                        </button>

                        {/* Credit Card Fields - Only show if selected and is Credit Card */}
                        {isSelected && method.id === 'Credit Card' && (
                          <div className="p-4 border-2 border-outline-strong rounded-xl bg-surface-low space-y-4 animate-fade-in text-left">
                            <div className="space-y-3">
                              <div>
                                <label className="text-xs font-bold text-asphalt uppercase tracking-widest mb-1.5 block">Card Number</label>
                                <input type="text" placeholder="0000 0000 0000 0000" className="w-full bg-white border border-outline rounded-lg px-3 py-2 text-sm font-semibold text-asphalt focus:outline-none focus:border-asphalt transition-colors" />
                              </div>
                              <div className="flex gap-3">
                                <div className="flex-1">
                                  <label className="text-xs font-bold text-asphalt uppercase tracking-widest mb-1.5 block">Expiry</label>
                                  <input type="text" placeholder="MM/YY" className="w-full bg-white border border-outline rounded-lg px-3 py-2 text-sm font-semibold text-asphalt focus:outline-none focus:border-asphalt transition-colors" />
                                </div>
                                <div className="flex-1">
                                  <label className="text-xs font-bold text-asphalt uppercase tracking-widest mb-1.5 block">CVC</label>
                                  <input type="text" placeholder="123" className="w-full bg-white border border-outline rounded-lg px-3 py-2 text-sm font-semibold text-asphalt focus:outline-none focus:border-asphalt transition-colors" />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Order summary */}
              <div className="card p-6">
                <h3 className="text-sm font-bold text-asphalt uppercase tracking-widest mb-5">
                  Order Summary
                </h3>

                <div className="space-y-3 mb-5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-on-surface-variant">
                      Court rental ({duration} hr{duration! > 1 ? 's' : ''})
                    </span>
                    <span className="font-bold text-asphalt">
                      {totalAmount > 0 ? `₱${totalAmount.toLocaleString()}` : 'Calculated on confirm'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-on-surface-variant">Service fee</span>
                    <span className="font-bold text-primary">FREE</span>
                  </div>
                </div>

                <div className="border-t border-outline pt-4 flex items-center justify-between mb-6">
                  <span className="text-base font-bold text-asphalt">Total</span>
                  <span className="text-2xl font-extrabold text-asphalt">
                    {totalAmount > 0 ? `₱${totalAmount.toLocaleString()}` : '—'}
                  </span>
                </div>

                {/* Error message */}
                {error && (
                  <div className="p-3 mb-4 bg-error/10 border border-error/20 rounded-lg text-sm font-semibold text-error flex items-center gap-2">
                    <AlertCircle size={16} className="flex-shrink-0" />
                    {error}
                  </div>
                )}

                {/* Confirm button */}
                <button
                  id="checkout-confirm"
                  type="button"
                  onClick={handleConfirm}
                  disabled={isSubmitting}
                  className="btn btn-cta w-full justify-center gap-2 py-3.5 text-base font-extrabold shadow-lg shadow-green/20 disabled:opacity-70 disabled:cursor-wait"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Processing…
                    </>
                  ) : (
                    <>
                      Confirm & Pay
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>

                <p className="text-[10px] text-on-surface-variant text-center mt-4 leading-relaxed flex items-center justify-center gap-1">
                  <Lock size={10} />
                  Your payment details are encrypted and secure.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-outline mt-16">
        <div className="container-page py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs font-semibold text-on-surface-variant">
            © {new Date().getFullYear()} Pick-All. All rights reserved.
          </span>
          <div className="flex gap-6">
            {['Privacy', 'Terms', 'Contact'].map((l) => (
              <a
                key={l}
                href="#"
                className="text-xs font-semibold text-on-surface-variant hover:text-asphalt transition-colors"
              >
                {l}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}

// ─── Page wrapper with Suspense (required for useSearchParams) ─────────────
export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="flex items-center gap-3 text-on-surface-variant">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm font-semibold">Loading checkout…</span>
          </div>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  )
}
