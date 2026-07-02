'use client'

import { useState } from 'react'
import { Calendar, Clock, DollarSign, Users, X } from 'lucide-react'

// Static mock data for the UI
const MOCK_METRICS = [
  { label: "Today's Revenue", value: '₱4,500', icon: <DollarSign size={20} />, trend: '+12% from yesterday', positive: true },
  { label: 'Today\'s Bookings', value: '12', icon: <Calendar size={20} />, trend: '3 remaining today', positive: true },
  { label: 'Upcoming Bookings', value: '34', icon: <Clock size={20} />, trend: 'Next 7 days', positive: true },
  { label: 'Total Players', value: '156', icon: <Users size={20} />, trend: '+24 new this week', positive: true },
]

const TIMELINE_START_HOUR = 12 // 12:00 PM
const TIMELINE_END_HOUR = 20 // 8:00 PM
const TOTAL_HOURS = TIMELINE_END_HOUR - TIMELINE_START_HOUR
const TIMELINE_HOURS = Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => TIMELINE_START_HOUR + i)

const INITIAL_COURTS = ['Court 1 - Indoor', 'Court 2 - Indoor', 'Court 3 - Outdoor', 'Court 4 - Outdoor']

const MOCK_TIMELINE_BOOKINGS = [
  { id: '1', court: 'Court 1 - Indoor', startHour: 14, duration: 1, user: 'johndoe', status: 'confirmed' },
  { id: '2', court: 'Court 3 - Outdoor', startHour: 15, duration: 2, user: 'janem', status: 'confirmed' },
  { id: '3', court: 'Court 1 - Indoor', startHour: 16, duration: 1.5, user: 'mikep', status: 'pending' },
  { id: '4', court: 'Court 2 - Indoor', startHour: 18, duration: 2, user: 'sarahs', status: 'confirmed' },
  { id: '5', court: 'Court 4 - Outdoor', startHour: 13, duration: 2, user: 'alexb', status: 'confirmed' },
]

export function OwnerDashboardOverview() {
  const [courts, setCourts] = useState<string[]>(INITIAL_COURTS)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newCourtName, setNewCourtName] = useState('')
  const [newCourtType, setNewCourtType] = useState('Indoor')

  const handleAddCourt = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCourtName.trim()) return
    const fullName = `${newCourtName.trim()} - ${newCourtType}`
    if (!courts.includes(fullName)) {
      setCourts([...courts, fullName])
    }
    setNewCourtName('')
    setIsAddModalOpen(false)
  }

  return (
    <div className="flex flex-col gap-8 relative">
      
      {/* ── Add Court Modal ── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-asphalt/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-float border border-outline">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-asphalt">Add New Court</h3>
              <button 
                onClick={() => setIsAddModalOpen(false)} 
                className="text-on-surface-variant hover:text-asphalt transition-colors"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddCourt} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold text-asphalt mb-1.5">Court Name</label>
                <input 
                  type="text" 
                  value={newCourtName}
                  onChange={e => setNewCourtName(e.target.value)}
                  className="w-full bg-mist border border-outline/50 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none transition-shadow"
                  placeholder="e.g. Court 5"
                  autoFocus
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-asphalt mb-1.5">Surface / Type</label>
                <select 
                  value={newCourtType}
                  onChange={e => setNewCourtType(e.target.value)}
                  className="w-full bg-mist border border-outline/50 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none transition-shadow"
                >
                  <option>Indoor</option>
                  <option>Outdoor</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary w-full mt-2 justify-center">
                Create Court
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-asphalt">Owner Dashboard</h1>
          <p className="text-on-surface-variant mt-1 text-sm">
            View incoming bookings and track revenue for the courts you own.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn btn-outline text-sm">Export Data</button>
          <button onClick={() => setIsAddModalOpen(true)} className="btn btn-primary text-sm">Add New Court</button>
        </div>
      </div>

      {/* ── Key Metrics ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {MOCK_METRICS.map((metric, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-outline shadow-sm flex flex-col gap-3 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 text-on-surface-variant">
              <div className="w-10 h-10 rounded-xl bg-mist flex items-center justify-center text-primary">
                {metric.icon}
              </div>
              <span className="text-sm font-semibold">{metric.label}</span>
            </div>
            <div>
              <div className="text-3xl font-bold text-asphalt">{metric.value}</div>
              <div className={`text-xs font-medium mt-1 ${metric.positive ? 'text-green-600' : 'text-red-500'}`}>
                {metric.trend}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Visual Schedule Timeline ── */}
      <div className="bg-white rounded-2xl border border-outline shadow-sm overflow-hidden flex flex-col">
        <div className="p-5 border-b border-outline flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-asphalt">Visual Schedule Timeline</h2>
          <div className="flex gap-4 text-sm font-medium">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500"></span> Confirmed
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-yellow-500"></span> Pending
            </span>
          </div>
        </div>
        
        <div className="p-5 overflow-x-auto">
          <div 
            className="flex flex-col"
            style={{ minWidth: `${Math.max(700, courts.length * 160 + 64)}px` }}
          >
            {/* Headers (Courts) */}
            <div className="flex pl-16 border-b border-outline pb-3 mb-2">
              {courts.map(court => (
                <div key={court} className="flex-1 text-sm font-bold text-asphalt text-center px-2">
                  {court}
                </div>
              ))}
            </div>

            {/* Timeline Body */}
            <div className="flex h-[600px] relative">
              
              {/* Y-axis: Time Labels */}
              <div className="w-16 flex-shrink-0 relative">
                {TIMELINE_HOURS.map((hour, idx) => {
                  const label = hour > 12 ? `${hour - 12} PM` : hour === 12 ? '12 PM' : `${hour} AM`
                  return (
                    <div 
                      key={hour} 
                      className="absolute right-4 text-xs font-semibold text-on-surface-variant -mt-2 text-right"
                      style={{ top: `${(idx / TOTAL_HOURS) * 100}%` }}
                    >
                      {label}
                    </div>
                  )
                })}
              </div>

              {/* Schedule Grid */}
              <div className="flex-1 flex relative bg-mist/10 rounded-xl border border-outline/50 overflow-hidden">
                
                {/* Horizontal Grid lines */}
                {TIMELINE_HOURS.map((hour, idx) => (
                  <div 
                    key={hour}
                    className="absolute left-0 right-0 border-t border-outline/40 pointer-events-none z-0"
                    style={{ top: `${(idx / TOTAL_HOURS) * 100}%` }}
                  />
                ))}

                {/* Court Columns */}
                {courts.map(court => (
                  <div key={court} className="flex-1 relative border-r border-outline/30 last:border-0 z-10">
                    {MOCK_TIMELINE_BOOKINGS.filter(b => b.court === court).map(booking => {
                      const topPct = ((booking.startHour - TIMELINE_START_HOUR) / TOTAL_HOURS) * 100
                      const heightPct = (booking.duration / TOTAL_HOURS) * 100
                      
                      const isConfirmed = booking.status === 'confirmed'
                      const bgClass = isConfirmed ? 'bg-green-100/90 border-green-300 text-green-800' : 'bg-yellow-100/90 border-yellow-300 text-yellow-800'
                      
                      const endHourDec = booking.startHour + booking.duration
                      const startLabel = booking.startHour > 12 ? `${booking.startHour - 12}:00` : `${booking.startHour}:00`
                      const endLabel = endHourDec > 12 ? `${Math.floor(endHourDec - 12)}:${(endHourDec % 1) * 60 === 0 ? '00' : '30'}` : `${Math.floor(endHourDec)}:${(endHourDec % 1) * 60 === 0 ? '00' : '30'}`

                      return (
                        <div 
                          key={booking.id}
                          className={`absolute left-1 right-1 border rounded-lg p-2 shadow-sm flex flex-col overflow-hidden hover:shadow-md transition-shadow cursor-pointer ${bgClass}`}
                          style={{ top: `${topPct}%`, height: `${heightPct}%` }}
                          title={`@${booking.user} - ${booking.status}`}
                        >
                          <span className="text-xs font-bold leading-tight truncate">@{booking.user}</span>
                          <span className="text-[10px] font-medium opacity-80 truncate">{startLabel} - {endLabel}</span>
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
