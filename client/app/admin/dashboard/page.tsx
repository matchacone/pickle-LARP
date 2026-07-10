import { Users, CalendarCheck, DollarSign, TrendingUp, AlertTriangle, AlertCircle, Database, CheckCircle } from 'lucide-react'
import { getAdminDashboardStats } from '@/lib/db/queries/adminQueries'

export default async function AdminDashboardPage() {
  const stats = await getAdminDashboardStats()

  // Format currency
  const formatPHP = (amount: number) =>
    new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)

  // Format date for recent bookings
  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat('en-PH', {
      timeZone: 'Asia/Manila',
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(date))

  // Build status breakdown map for quick access
  const statusMap = new Map(stats.bookingsByStatus.map((s) => [s.status, s.count]))

  const metrics = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: 'text-blue-500',
    },
    {
      title: 'Total Bookings',
      value: stats.totalBookings.toLocaleString(),
      icon: CalendarCheck,
      color: 'text-green-500',
    },
    {
      title: 'Revenue (Paid)',
      value: formatPHP(stats.totalRevenue),
      icon: DollarSign,
      color: 'text-primary',
    },
    {
      title: 'Confirmed Bookings',
      value: (statusMap.get('confirmed') ?? 0).toLocaleString(),
      icon: TrendingUp,
      color: 'text-orange-500',
    },
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Dashboard Overview</h1>
        <p className="text-on-surface-variant text-sm mt-1">
          Platform metrics from live data.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => {
          const Icon = m.icon
          return (
            <div key={i} className="card p-5 flex flex-col gap-4 relative overflow-hidden group">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-semibold text-on-surface-variant">{m.title}</p>
                  <h3 className="text-3xl font-black tracking-tighter mt-1">{m.value}</h3>
                </div>
                <div className={`p-2 rounded-lg bg-surface-low ${m.color}`}>
                  <Icon size={24} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Booking Status Breakdown */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          <div className="card p-6">
            <h3 className="text-lg font-bold mb-6">Bookings by Status</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {(['pending', 'confirmed', 'cancelled', 'no_show'] as const).map((status) => {
                const count = statusMap.get(status) ?? 0
                const colorMap: Record<string, string> = {
                  pending: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
                  confirmed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                  no_show: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
                }
                return (
                  <div key={status} className="bg-surface-low rounded-lg p-4 text-center">
                    <p className="text-2xl font-black">{count}</p>
                    <span className={`badge mt-2 inline-block ${colorMap[status]}`}>
                      {status.replace('_', ' ')}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Recent Bookings Table */}
          <div className="card overflow-hidden">
            <div className="p-5 border-b border-outline">
              <h3 className="text-lg font-bold">Recent Bookings</h3>
            </div>
            {stats.recentBookings.length === 0 ? (
              <div className="p-8 text-center text-on-surface-variant">
                <p className="text-sm font-medium">No bookings yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-surface-low border-b border-outline">
                      <th className="p-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Court</th>
                      <th className="p-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">User</th>
                      <th className="p-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Date</th>
                      <th className="p-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline">
                    {stats.recentBookings.map((b) => {
                      const statusColor: Record<string, string> = {
                        pending: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
                        confirmed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                        cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                        no_show: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
                      }
                      return (
                        <tr key={b.id} className="hover:bg-surface-low/50 transition-colors">
                          <td className="p-4 text-sm font-semibold">{b.courtName}</td>
                          <td className="p-4 text-sm font-medium">{b.username}</td>
                          <td className="p-4 text-sm">{formatDate(b.startAt)}</td>
                          <td className="p-4">
                            <span className={`badge ${statusColor[b.status] ?? 'bg-surface-dim text-on-surface'}`}>
                              {b.status}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats Sidebar */}
        <div className="card p-0 flex flex-col h-fit">
          <div className="p-5 border-b border-outline">
            <h3 className="text-lg font-bold">Quick Actions</h3>
          </div>
          <div className="p-5 space-y-2">
            <a href="/admin/courts" className="btn btn-outline w-full justify-start border-outline text-on-surface">
              Manage Courts
            </a>
            <a href="/admin/items" className="btn btn-outline w-full justify-start border-outline text-on-surface">
              Manage Items
            </a>
            <a href="/admin/users" className="btn btn-outline w-full justify-start border-outline text-on-surface">
              Manage Users
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
