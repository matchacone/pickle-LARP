'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, Search, Filter, XCircle, Loader2, Clock } from 'lucide-react'
import { ReceiptModal } from '@/components/features/ReceiptModal'
import type { BookingListItem } from '@/lib/db/queries/bookingQueries'

type Booking = {
  id: string
  date: string
  time: string
  court: string
  user: string
  status: string
  amount: string
}

export function OwnerBookingsTable() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReceipt, setSelectedReceipt] = useState<BookingListItem | null>(null)
  const [receiptLoadingId, setReceiptLoadingId] = useState<string | null>(null)

  const handleViewReceipt = async (bookingId: string) => {
    setReceiptLoadingId(bookingId)
    try {
      const res = await fetch(`/api/bookings/${bookingId}`)
      if (res.ok) {
        const data = await res.json()
        setSelectedReceipt(data.booking)
      }
    } catch (err) {
      console.error('Failed to fetch receipt', err)
    } finally {
      setReceiptLoadingId(null)
    }
  }

  useEffect(() => {
    async function fetchBookings() {
      try {
        const res = await fetch('/api/owner/bookings')
        const data = await res.json()
        if (data.bookings) {
          setBookings(data.bookings)
        }
      } catch (err) {
        console.error('Failed to fetch bookings', err)
      } finally {
        setLoading(false)
      }
    }
    fetchBookings()
  }, [])

  return (
    <div className="flex flex-col gap-6">
      {selectedReceipt && (
        <ReceiptModal
          booking={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-asphalt">Bookings History</h1>
          <p className="text-on-surface-variant mt-1 text-sm">
            View all past reservations across your courts.
          </p>
        </div>
        <div className="flex gap-2">
           <button className="btn btn-outline text-sm">Export CSV</button>
        </div>
      </div>

      <div className="bg-surface rounded-2xl border border-outline shadow-sm overflow-hidden flex flex-col">
        {/* Table Toolbar */}
        <div className="p-5 border-b border-outline flex flex-col sm:flex-row gap-4 justify-between items-center bg-mist/30">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={16} />
            <input 
              type="text" 
              placeholder="Search by player or court..." 
              className="w-full pl-9 pr-4 py-2 text-sm bg-surface border border-outline/50 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-shadow"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold border border-outline/50 bg-surface rounded-lg hover:bg-mist transition-colors">
              <Filter size={16} /> Filter
            </button>
            <select className="px-3 py-2 text-sm font-semibold border border-outline/50 bg-surface rounded-lg focus:ring-2 focus:ring-primary outline-none">
              <option>All Statuses</option>
              <option>Completed</option>
              <option>Cancelled</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto min-h-[300px] relative">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-surface/50 z-10">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-mist/50 text-on-surface-variant text-xs uppercase tracking-wider border-b border-outline">
                <tr>
                  <th className="px-6 py-4 font-semibold">Date & Time</th>
                  <th className="px-6 py-4 font-semibold">Court</th>
                  <th className="px-6 py-4 font-semibold">Player</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Amount</th>
                  <th className="px-6 py-4 font-semibold text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline">
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-on-surface-variant">
                      No bookings found.
                    </td>
                  </tr>
                ) : bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-mist/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-asphalt">{booking.date}</div>
                      <div className="text-xs text-on-surface-variant">{booking.time}</div>
                    </td>
                    <td className="px-6 py-4 text-asphalt font-medium">{booking.court}</td>
                    <td className="px-6 py-4 text-asphalt font-medium">@{booking.user}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        booking.status === 'completed' 
                          ? 'bg-green-100 text-green-700' 
                          : booking.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {booking.status === 'completed' ? <CheckCircle2 size={12} /> : booking.status === 'pending' ? <Clock size={12} /> : <XCircle size={12} />}
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-asphalt">{booking.amount}</td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleViewReceipt(booking.id)}
                        disabled={receiptLoadingId === booking.id}
                        className="text-primary font-semibold hover:text-asphalt transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                      >
                        {receiptLoadingId === booking.id ? <Loader2 size={16} className="animate-spin inline" /> : 'View'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Pagination Footer */}
        <div className="p-4 border-t border-outline flex items-center justify-between text-sm text-on-surface-variant bg-mist/10">
          <span>Showing 1 to {bookings.length} of {bookings.length} entries</span>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-outline rounded-md hover:bg-mist disabled:opacity-50" disabled>Prev</button>
            <button className="px-3 py-1 border border-outline rounded-md bg-surface font-bold text-asphalt">1</button>
            <button className="px-3 py-1 border border-outline rounded-md hover:bg-mist disabled:opacity-50" disabled>Next</button>
          </div>
        </div>
      </div>
    </div>
  )
}
