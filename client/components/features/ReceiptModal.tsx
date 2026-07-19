'use client'

import { Printer, CheckCircle2, X } from 'lucide-react'
import type { BookingListItem } from '@/lib/db/queries/bookingQueries'

// Native date formatting helpers
function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-PH', {
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

export function ReceiptModal({
  booking,
  onClose,
}: {
  booking: BookingListItem
  onClose: () => void
}) {
  const durationMs = new Date(booking.endAt).getTime() - new Date(booking.startAt).getTime()
  const durationHours = durationMs / (1000 * 60 * 60)
  const isPaid = booking.invoice?.status === 'paid'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 print:bg-white print:p-0">
      {/* Click outside to close (hidden on print) */}
      <div className="absolute inset-0 print:hidden" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-md bg-mist rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden print:shadow-none print:bg-white print:max-h-none print:max-w-full">
        {/* Top Header (hidden on print) */}
        <div className="flex items-center justify-between p-4 bg-asphalt text-white print:hidden">
          <h2 className="text-sm font-bold tracking-widest uppercase">Receipt</h2>
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 text-xs font-bold hover:text-primary transition-colors"
            >
              <Printer size={14} />
              Print
            </button>
            <button onClick={onClose} className="hover:text-error transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 print:p-0 print:overflow-visible">
          {/* Thermal Receipt UI */}
          <div className="bg-white w-full p-6 sm:p-8 shadow-float rounded-lg relative border-t-8 border-t-primary print:shadow-none print:border-none print:rounded-none">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-extrabold text-asphalt tracking-tight uppercase">PickleAll</h1>
              <p className="text-sm text-on-surface-variant font-medium mt-1">Official Booking Receipt</p>
              <p className="text-xs text-on-surface-variant mt-0.5">Booking #{booking.id.split('-')[0].toUpperCase()}</p>
            </div>

            {/* Status Badge */}
            {isPaid ? (
              <div className="flex items-center justify-center gap-2 text-green-700 bg-green-50 py-2 rounded-lg font-bold text-sm mb-8 border border-green-200">
                <CheckCircle2 size={18} />
                PAID IN FULL
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 text-yellow-700 bg-yellow-50 py-2 rounded-lg font-bold text-sm mb-8 border border-yellow-200">
                {booking.invoice?.status.toUpperCase() || 'UNPAID'}
              </div>
            )}

            {/* Customer & Court Info */}
            <div className="space-y-4 mb-8">
              <div className="flex justify-between border-b border-dashed border-outline pb-2">
                <span className="text-sm font-semibold text-on-surface-variant">Court</span>
                <span className="text-sm font-bold text-asphalt text-right">{booking.courtName}</span>
              </div>
              <div className="flex justify-between border-b border-dashed border-outline pb-2">
                <span className="text-sm font-semibold text-on-surface-variant">Location</span>
                <span className="text-sm font-bold text-asphalt text-right">{booking.location || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-dashed border-outline pb-2">
                <span className="text-sm font-semibold text-on-surface-variant">Date</span>
                <span className="text-sm font-bold text-asphalt text-right">{formatDate(booking.startAt)}</span>
              </div>
              <div className="flex justify-between border-b border-dashed border-outline pb-2">
                <span className="text-sm font-semibold text-on-surface-variant">Time</span>
                <span className="text-sm font-bold text-asphalt text-right">
                  {formatTime(booking.startAt)} - {formatTime(booking.endAt)}
                </span>
              </div>
            </div>

            {/* Line Items */}
            <table className="w-full mb-8 text-sm">
              <thead>
                <tr className="border-b-2 border-asphalt text-left">
                  <th className="py-2 font-bold text-asphalt">Item</th>
                  <th className="py-2 font-bold text-asphalt text-right">Qty</th>
                  <th className="py-2 font-bold text-asphalt text-right">Rate</th>
                  <th className="py-2 font-bold text-asphalt text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-dashed border-outline">
                  <td className="py-3 font-semibold text-asphalt">Court Rental ({booking.courtType || 'Standard'})</td>
                  <td className="py-3 font-medium text-on-surface-variant text-right">{durationHours}h</td>
                  <td className="py-3 font-medium text-on-surface-variant text-right">₱{booking.pricePerHour.toFixed(2)}</td>
                  <td className="py-3 font-bold text-asphalt text-right">₱{(booking.pricePerHour * durationHours).toFixed(2)}</td>
                </tr>
              </tbody>
            </table>

            {/* Totals */}
            <div className="space-y-2 mb-8">
              <div className="flex justify-between items-center text-sm">
                <span className="font-semibold text-on-surface-variant">Subtotal</span>
                <span className="font-bold text-asphalt">₱{(booking.pricePerHour * durationHours).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-asphalt pb-4">
                <span className="font-semibold text-on-surface-variant">Platform Fee</span>
                <span className="font-bold text-asphalt">₱0.00</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-lg font-extrabold text-asphalt">Total</span>
                <span className="text-2xl font-extrabold text-primary">₱{(booking.invoice?.paymentTotal || 0).toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-mist p-4 rounded-lg text-xs space-y-1 text-center text-on-surface-variant">
              <p className="font-semibold">Payment Method: <span className="text-asphalt capitalize">{booking.invoice?.paymentMethod.replace('_', ' ')}</span></p>
              <p>Invoice ID: {booking.invoice?.id}</p>
              <p>Issued: {formatDate(booking.createdAt)} {formatTime(booking.createdAt)}</p>
            </div>

            {/* Zigzag Bottom Edge (CSS trick) */}
            <div className="absolute -bottom-3 left-0 right-0 h-4 bg-[length:16px_16px] print:hidden" style={{
              backgroundImage: 'radial-gradient(circle at 8px 16px, transparent 0, transparent 8px, white 8px)',
            }} />
          </div>
        </div>
      </div>
    </div>
  )
}
