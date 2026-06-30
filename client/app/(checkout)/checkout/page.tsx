'use client'

import { useState, useMemo, Suspense } from 'react'
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

// ─── Mock court data (same source as courts pages) ────────────────────────────
// TODO: Replace with Drizzle query once DB is seeded.
type MockCourt = {
  id: string
  courtName: string
  description: string
  location: string
  pricePerHour: number
  courtType: 'indoor' | 'outdoor'
  accent: string
  accentBg: string
}

const MOCK_COURTS: MockCourt[] = [
  { id: '1', courtName: 'BGC Sports Hub — Court A', description: 'Premium indoor facility with pro-grade lighting, smooth hardwood surface, and climate control.', location: 'Bonifacio Global City, Taguig', pricePerHour: 350, courtType: 'indoor', accent: '#4F46E5', accentBg: '#EEF2FF' },
  { id: '2', courtName: 'Pickleball Manila — Court 3', description: 'Open-air court with a stunning city view. Ideal for early morning or late afternoon games.', location: 'Ayala Ave, Makati City', pricePerHour: 280, courtType: 'outdoor', accent: '#059669', accentBg: '#ECFDF5' },
  { id: '3', courtName: 'The Paddle Club — VIP Court', description: 'The most prestigious court in Metro Manila. Fully enclosed, private coaching bays, café, and an electronic scoreboard.', location: 'Eastwood City, Quezon City', pricePerHour: 420, courtType: 'indoor', accent: '#D97706', accentBg: '#FFFBEB' },
  { id: '4', courtName: 'Eastside Courts — Court 2', description: 'Community-friendly outdoor courts with a welcoming vibe.', location: 'Kapitolyo, Pasig City', pricePerHour: 250, courtType: 'outdoor', accent: '#DC2626', accentBg: '#FEF2F2' },
  { id: '5', courtName: 'Smash & Rally Hub', description: 'Mid-tier indoor facility with excellent acoustics and non-slip flooring.', location: 'Mandaluyong City', pricePerHour: 380, courtType: 'indoor', accent: '#7C3AED', accentBg: '#F5F3FF' },
  { id: '6', courtName: 'Green Court Ortigas', description: 'Bright outdoor courts surrounded by lush landscaping.', location: 'Ortigas Center, Pasig', pricePerHour: 300, courtType: 'outdoor', accent: '#0369A1', accentBg: '#F0F9FF' },
  { id: '7', courtName: 'Sportivo Arena — PB Court 1', description: 'Professional-grade indoor court used for local tournaments.', location: 'Alabang, Muntinlupa', pricePerHour: 450, courtType: 'indoor', accent: '#be185d', accentBg: '#fdf2f8' },
  { id: '8', courtName: 'Harbor Court — Bayside', description: 'Scenic outdoor court right by the bay.', location: 'CCP Complex, Pasay', pricePerHour: 220, courtType: 'outdoor', accent: '#0891b2', accentBg: '#ecfeff' },
  { id: '9', courtName: 'UP ISSI Sports Court', description: 'University-managed indoor court with affordable rates.', location: 'UP Diliman, Quezon City', pricePerHour: 180, courtType: 'indoor', accent: '#65a30d', accentBg: '#f7fee7' },
]

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

  // Look up court
  const court = useMemo(
    () => MOCK_COURTS.find((c) => c.id === courtId) ?? null,
    [courtId],
  )

  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState<string>('Credit Card')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [bookingRef] = useState(
    () => `PK-${Date.now().toString(36).toUpperCase().slice(-6)}`,
  )

  // Validate params
  const isValid =
    court !== null &&
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
  const totalAmount = court && duration ? court.pricePerHour * duration : 0

  // Handle confirm
  const handleConfirm = async () => {
    if (!isValid) return
    setIsSubmitting(true)

    // Simulate API call delay (mock payment)
    // TODO: Replace with POST /api/invoices + POST /api/payments/initiate
    await new Promise((resolve) => setTimeout(resolve, 1800))

    setIsSubmitting(false)
    setIsConfirmed(true)
  }

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
  if (isConfirmed) {
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
              Booking Confirmed!
            </h1>
            <p className="text-base text-on-surface-variant mt-3 leading-relaxed">
              Your court has been reserved. You&apos;re all set to play!
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
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: court.accentBg }}>
                    <MapPin size={16} style={{ color: court.accent }} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-asphalt">{court.courtName}</p>
                    <p className="text-xs text-on-surface-variant">{court.location}</p>
                  </div>
                </div>

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
                      Status: <span className="text-primary font-bold">Pending</span>
                    </p>
                  </div>
                </div>

                <div className="border-t border-outline pt-4 flex items-center justify-between">
                  <span className="text-sm font-bold text-on-surface-variant">Total Paid</span>
                  <span className="text-xl font-extrabold text-asphalt">₱{totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                href="/courts"
                className="btn btn-outline flex-1 justify-center text-sm py-3"
              >
                Browse Courts
              </Link>
              <Link
                href={`/courts/${court.id}`}
                className="btn btn-primary flex-1 justify-center text-sm py-3"
              >
                Back to Court
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
            {/* Court card */}
            <div className="card overflow-hidden">
              {/* Accent bar */}
              <div className="h-1.5 bg-gradient-to-r from-primary to-primary-container" />

              <div className="p-6">
                <div className="flex items-start gap-4">
                  {/* Court art thumbnail */}
                  <div
                    className="w-20 h-20 rounded-xl flex-shrink-0 relative overflow-hidden"
                    style={{ backgroundColor: court.accentBg }}
                  >
                    {/* Mini court lines */}
                    <div className="absolute inset-0" aria-hidden="true">
                      <div
                        className="absolute inset-2 rounded-sm opacity-25"
                        style={{ border: `1.5px solid ${court.accent}` }}
                      />
                      <div
                        className="absolute left-1/2 top-2 bottom-2 w-px opacity-25"
                        style={{ backgroundColor: court.accent }}
                      />
                      <div
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full opacity-40"
                        style={{ backgroundColor: court.accent }}
                      />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`badge text-[10px] ${court.courtType === 'indoor' ? 'badge-indoor' : 'badge-outdoor'}`}>
                        {court.courtType === 'indoor' ? '🏢 Indoor' : '☀️ Outdoor'}
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-asphalt leading-tight truncate">
                      {court.courtName}
                    </h2>
                    <p className="text-sm text-on-surface-variant flex items-center gap-1 mt-1">
                      <MapPin size={12} />
                      {court.location}
                    </p>
                  </div>
                </div>
              </div>
            </div>

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
                      <button
                        key={method.id}
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
                      Court rental ({duration} hr{duration! > 1 ? 's' : ''} × ₱{court.pricePerHour.toLocaleString()})
                    </span>
                    <span className="font-bold text-asphalt">₱{totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-on-surface-variant">Service fee</span>
                    <span className="font-bold text-primary">FREE</span>
                  </div>
                </div>

                <div className="border-t border-outline pt-4 flex items-center justify-between mb-6">
                  <span className="text-base font-bold text-asphalt">Total</span>
                  <span className="text-2xl font-extrabold text-asphalt">
                    ₱{totalAmount.toLocaleString()}
                  </span>
                </div>

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
                      Confirm Booking
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
            © {new Date().getFullYear()} PickleAll. All rights reserved.
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
