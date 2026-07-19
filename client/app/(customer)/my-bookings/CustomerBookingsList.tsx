'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Calendar,
  Clock,
  MapPin,
  XCircle,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import type { BookingListItem } from '@/lib/db/queries/bookingQueries'
import { ReceiptModal } from '@/components/features/ReceiptModal'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat('en-PH', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'Asia/Manila',
  }).format(new Date(date))
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat('en-PH', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Manila',
  }).format(new Date(date))
}

function getDurationHours(start: Date, end: Date) {
  const ms = new Date(end).getTime() - new Date(start).getTime()
  return Math.round(ms / (1000 * 60 * 60))
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'confirmed':
      return { label: 'Confirmed', className: 'bg-green/20 text-green-800 dark:text-green-300' }
    case 'pending':
      return { label: 'Pending', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' }
    case 'cancelled':
      return { label: 'Cancelled', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' }
    case 'no_show':
      return { label: 'No Show', className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300' }
    default:
      return { label: status, className: 'bg-mist text-on-surface-variant' }
  }
}

function canCancel(booking: BookingListItem): boolean {
  if (booking.status !== 'pending' && booking.status !== 'confirmed') return false
  const hoursUntilStart =
    (new Date(booking.startAt).getTime() - Date.now()) / (1000 * 60 * 60)
  return hoursUntilStart >= 24
}

// ─── Booking Card ─────────────────────────────────────────────────────────────

function BookingCard({
  booking,
  onCancel,
  onViewReceipt,
}: {
  booking: BookingListItem
  onCancel: (id: string) => Promise<void>
  onViewReceipt: (b: BookingListItem) => void
}) {
  const [isCancelling, setIsCancelling] = useState(false)
  const [cancelError, setCancelError] = useState<string | null>(null)
  const statusBadge = getStatusBadge(booking.status)
  const duration = getDurationHours(booking.startAt, booking.endAt)
  const cancellable = canCancel(booking)

  const handleCancel = async () => {
    if (!cancellable) return
    const confirmed = window.confirm(
      'Are you sure you want to cancel this booking? This action cannot be undone.',
    )
    if (!confirmed) return

    setIsCancelling(true)
    setCancelError(null)
    try {
      await onCancel(booking.id)
    } catch (err) {
      setCancelError(err instanceof Error ? err.message : 'Failed to cancel')
    } finally {
      setIsCancelling(false)
    }
  }

  return (
    <div className="card p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Court name + status */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h3 className="text-base font-bold text-asphalt truncate">
              {booking.courtName}
            </h3>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusBadge.className}`}
            >
              {statusBadge.label}
            </span>
          </div>

          {/* Location */}
          {booking.location && (
            <p className="text-xs text-on-surface-variant flex items-center gap-1 mb-3">
              <MapPin size={12} />
              {booking.location}
            </p>
          )}

          {/* Date/time row */}
          <div className="flex flex-wrap gap-4 text-sm">
            <span className="flex items-center gap-1.5 text-on-surface-variant">
              <Calendar size={14} className="text-asphalt" />
              <span className="font-semibold text-asphalt">
                {formatDateTime(booking.startAt)}
              </span>
            </span>
            <span className="flex items-center gap-1.5 text-on-surface-variant">
              <Clock size={14} className="text-asphalt" />
              <span className="font-semibold text-asphalt">
                {formatTime(booking.startAt)} — {formatTime(booking.endAt)}
              </span>
              <span className="text-xs text-on-surface-variant">
                ({duration}h)
              </span>
            </span>
          </div>

          {/* Invoice info */}
          {booking.invoice && (
            <div className="mt-3 flex items-center gap-4 text-xs text-on-surface-variant">
              <span>
                <span className="font-bold text-asphalt">₱{booking.invoice.paymentTotal.toLocaleString()}</span>
                {' '}via {booking.invoice.paymentMethod}
              </span>
              <span className="text-on-surface-variant">
                Invoice: {booking.invoice.status}
              </span>
              <button 
                onClick={() => onViewReceipt(booking)}
                className="text-primary hover:underline font-semibold"
              >
                View Receipt
              </button>
              {booking.invoice.status === 'unpaid' && booking.status !== 'cancelled' && (
                <button
                  onClick={async () => {
                    try {
                      const res = await fetch('/api/payments/initiate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ invoice_id: booking.invoice!.id }),
                      })
                      const data = await res.json()
                      if (!res.ok) throw new Error(data.error || 'Failed to initiate payment')
                      if (data.checkout_url) {
                        window.location.href = data.checkout_url
                      }
                    } catch (err) {
                      alert(err instanceof Error ? err.message : 'Payment failed')
                    }
                  }}
                  className="btn btn-primary py-1 px-3 text-xs ml-auto"
                >
                  Pay Now
                </button>
              )}
            </div>
          )}

          {/* Cancel error */}
          {cancelError && (
            <div className="mt-3 p-2 bg-error/10 border border-error/20 rounded-lg text-xs font-semibold text-error flex items-center gap-1.5">
              <AlertCircle size={14} />
              {cancelError}
            </div>
          )}
        </div>

        {/* Cancel button */}
        {cancellable && (
          <button
            onClick={handleCancel}
            disabled={isCancelling}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-error border border-error/20 hover:bg-error/10 transition-colors disabled:opacity-50 disabled:cursor-wait"
          >
            {isCancelling ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <XCircle size={14} />
            )}
            Cancel
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Main List ────────────────────────────────────────────────────────────────

type Props = {
  upcoming: BookingListItem[]
  past: BookingListItem[]
}

export default function CustomerBookingsList({ upcoming, past }: Props) {
  const router = useRouter()
  const [upcomingBookings, setUpcomingBookings] = useState(upcoming)
  const [pastBookings, setPastBookings] = useState(past)
  const [selectedReceipt, setSelectedReceipt] = useState<BookingListItem | null>(null)

  const handleCancel = async (bookingId: string) => {
    const res = await fetch(`/api/bookings/${bookingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'cancelled' }),
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Failed to cancel booking')
    }

    // Move the cancelled booking from upcoming to past
    const cancelled = upcomingBookings.find((b) => b.id === bookingId)
    if (cancelled) {
      const updated = { ...cancelled, status: 'cancelled' }
      setUpcomingBookings((prev) => prev.filter((b) => b.id !== bookingId))
      setPastBookings((prev) => [updated, ...prev])
    }

    // Refresh server data
    router.refresh()
  }

  return (
    <div className="space-y-10">
      {selectedReceipt && (
        <ReceiptModal
          booking={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}

      {/* Upcoming */}
      <div>
        <h2 className="text-lg font-bold text-asphalt mb-4 flex items-center gap-2">
          <CheckCircle2 size={18} className="text-primary" />
          Upcoming ({upcomingBookings.length})
        </h2>
        {upcomingBookings.length === 0 ? (
          <div className="text-center py-10 bg-mist rounded-xl">
            <p className="text-sm text-on-surface-variant">No upcoming bookings.</p>
            <Link href="/courts" className="text-sm font-bold text-primary hover:underline mt-2 inline-block">
              Book a court →
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {upcomingBookings.map((b) => (
              <BookingCard key={b.id} booking={b} onCancel={handleCancel} onViewReceipt={setSelectedReceipt} />
            ))}
          </div>
        )}
      </div>

      {/* Past / Cancelled */}
      {pastBookings.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-asphalt mb-4 flex items-center gap-2">
            <Clock size={18} className="text-on-surface-variant" />
            Past & Cancelled ({pastBookings.length})
          </h2>
          <div className="flex flex-col gap-3 opacity-75">
            {pastBookings.map((b) => (
              <BookingCard key={b.id} booking={b} onCancel={handleCancel} onViewReceipt={setSelectedReceipt} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
