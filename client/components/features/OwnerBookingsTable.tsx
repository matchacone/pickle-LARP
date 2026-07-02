import { CheckCircle2, Search, Filter, XCircle } from 'lucide-react'

const HISTORICAL_BOOKINGS = [
  { id: '101', date: 'Oct 12, 2026', time: '14:00 - 15:00', court: 'Court 1 - Indoor', user: 'johndoe', status: 'completed', amount: '₱500' },
  { id: '102', date: 'Oct 12, 2026', time: '15:00 - 17:00', court: 'Court 3 - Outdoor', user: 'janem', status: 'completed', amount: '₱800' },
  { id: '103', date: 'Oct 11, 2026', time: '09:00 - 10:00', court: 'Court 2 - Indoor', user: 'alexb', status: 'cancelled', amount: '₱0' },
  { id: '104', date: 'Oct 10, 2026', time: '18:00 - 20:00', court: 'Court 4 - Outdoor', user: 'sarahs', status: 'completed', amount: '₱1,000' },
  { id: '105', date: 'Oct 09, 2026', time: '16:00 - 18:00', court: 'Court 1 - Indoor', user: 'mikep', status: 'completed', amount: '₱1,000' },
  { id: '106', date: 'Oct 08, 2026', time: '07:00 - 09:00', court: 'Court 2 - Indoor', user: 'chrisw', status: 'completed', amount: '₱1,000' },
]

export function OwnerBookingsTable() {
  return (
    <div className="flex flex-col gap-6">
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
        <div className="overflow-x-auto">
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
              {HISTORICAL_BOOKINGS.map((booking) => (
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
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {booking.status === 'completed' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-asphalt">{booking.amount}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-primary font-semibold hover:text-asphalt transition-colors opacity-0 group-hover:opacity-100">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        <div className="p-4 border-t border-outline flex items-center justify-between text-sm text-on-surface-variant bg-mist/10">
          <span>Showing 1 to 6 of 6 entries</span>
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
