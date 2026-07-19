'use client'

import { useState, useEffect } from 'react'
import { Save, Image as ImageIcon, MapPin, DollarSign, Info, List, Clock, Calendar as CalendarIcon, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'

const HOURS = Array.from({ length: 24 }, (_, i) => {
  const ampm = i >= 12 ? 'PM' : 'AM'
  const displayHour = i % 12 === 0 ? 12 : i % 12
  const value = i.toString().padStart(2, '0') + ':00'
  return { value, label: `${displayHour}:00 ${ampm}` }
})

export default function MyCourtPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [courtData, setCourtData] = useState<any>(null)
  
  // Form State
  const [courtName, setCourtName] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [courtType, setCourtType] = useState('indoor')
  const [status, setStatus] = useState('active')
  const [pricePerHour, setPricePerHour] = useState('400.00')

  const [schedule, setSchedule] = useState([
    { day: 'Monday', isOpen: true, open: '06:00', close: '22:00' },
    { day: 'Tuesday', isOpen: true, open: '06:00', close: '22:00' },
    { day: 'Wednesday', isOpen: true, open: '06:00', close: '22:00' },
    { day: 'Thursday', isOpen: true, open: '06:00', close: '22:00' },
    { day: 'Friday', isOpen: true, open: '06:00', close: '22:00' },
    { day: 'Saturday', isOpen: true, open: '06:00', close: '22:00' },
    { day: 'Sunday', isOpen: false, open: '06:00', close: '22:00' },
  ])

  const [closedDates, setClosedDates] = useState<number[]>([15, 22])

  useEffect(() => {
    async function fetchCourt() {
      try {
        const res = await fetch('/api/owner/my-court')
        const data = await res.json()
        if (data.court) {
          setCourtData(data.court)
          setCourtName(data.court.courtName || '')
          setDescription(data.court.description || '')
          setLocation(data.court.location || '')
          setCourtType(data.court.courtType || 'indoor')
          setStatus(data.court.status || 'active')
          setPricePerHour(data.court.pricePerHour || '400.00')
          // If operating hours existed, we would set them here
        }
      } catch (error) {
        console.error('Failed to load court', error)
      } finally {
        setLoading(false)
      }
    }
    fetchCourt()
  }, [])

  const handleSave = async () => {
    if (!courtData) return
    setSaving(true)
    try {
      const res = await fetch('/api/owner/my-court', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: courtData.id,
          courtName,
          description,
          location,
          courtType,
          status,
          pricePerHour
        })
      })
      if (!res.ok) throw new Error('Failed to save')
      toast.success('Court settings saved!')
    } catch (e) {
      toast.error('Failed to save settings')
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const toggleDay = (index: number) => {
    const newSchedule = [...schedule]
    newSchedule[index].isOpen = !newSchedule[index].isOpen
    setSchedule(newSchedule)
  }

  const toggleDate = (date: number) => {
    if (closedDates.includes(date)) {
      setClosedDates(closedDates.filter(d => d !== date))
    } else {
      setClosedDates([...closedDates, date])
    }
  }

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-pickle-500" />
      </div>
    )
  }

  if (!courtData) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center">
        <h2 className="text-2xl font-bold text-asphalt mb-2">No Court Found</h2>
        <p className="text-on-surface-variant">You haven't set up a court yet. Please contact support.</p>
      </div>
    )
  }

  return (
    <div className="animate-fade-up max-w-4xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-asphalt">
            My Court Settings
          </h1>
          <p className="text-on-surface-variant mt-1">
            Manage details, pricing, and amenities for your court.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="btn btn-outline bg-surface">
            Discard Changes
          </button>
          <button onClick={handleSave} disabled={saving} className="btn btn-cta shadow-float">
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save size={18} />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* Basic Information */}
          <section className="card p-6 md:p-8">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6 border-b border-outline pb-4">
              <Info size={20} className="text-primary" />
              Basic Information
            </h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold mb-1.5" htmlFor="courtName">
                  Court Name
                </label>
                <input 
                  id="courtName"
                  className="input" 
                  value={courtName}
                  onChange={e => setCourtName(e.target.value)}
                  placeholder="e.g., Sunset Park Court 1" 
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1.5" htmlFor="description">
                  Description
                </label>
                <textarea 
                  id="description"
                  className="input min-h-[120px] resize-y" 
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Describe the court, rules, and vibe..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1.5" htmlFor="location">
                  Location / Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin size={18} className="text-on-surface-variant" />
                  </div>
                  <input 
                    id="location"
                    className="input pl-10" 
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="Full address of the facility" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold mb-1.5" htmlFor="courtType">
                    Court Type
                  </label>
                  <select id="courtType" className="input bg-surface" value={courtType} onChange={e => setCourtType(e.target.value)}>
                    <option value="indoor">Indoor</option>
                    <option value="outdoor">Outdoor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1.5" htmlFor="status">
                    Status
                  </label>
                  <select id="status" className="input bg-surface" value={status} onChange={e => setStatus(e.target.value)}>
                    <option value="active">Active (Bookable)</option>
                    <option value="maintenance">Under Maintenance</option>
                    <option value="hidden">Hidden</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Amenities / Equipment */}
          <section className="card p-6 md:p-8">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6 border-b border-outline pb-4">
              <List size={20} className="text-primary" />
              Amenities & Equipment
            </h2>
            <p className="text-sm text-on-surface-variant mb-4">
              Select the items and features available for players renting this court.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {['Paddles Included', 'Pickleballs', 'Water Dispenser', 'Locker Room', 'Shower', 'Parking'].map((item) => (
                <label key={item} className="flex items-center gap-3 p-3 border border-outline rounded-lg cursor-pointer hover:bg-mist transition-colors">
                  <input type="checkbox" className="w-5 h-5 accent-asphalt rounded" defaultChecked={['Paddles Included', 'Pickleballs', 'Parking'].includes(item)} />
                  <span className="text-sm font-semibold">{item}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Operating Hours */}
          <section className="card p-6 md:p-8">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6 border-b border-outline pb-4">
              <Clock size={20} className="text-primary" />
              Operating Hours
            </h2>
            <p className="text-sm text-on-surface-variant mb-6">
              Set the hours your court is available for booking each day.
            </p>
            
            <div className="space-y-3">
              {schedule.map((entry, i) => {
                const isOpen = entry.isOpen;
                return (
                  <div key={entry.day} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 border border-outline rounded-lg bg-surface">
                    <div className="flex items-center justify-between sm:w-32">
                      <span className="font-semibold text-sm">{entry.day}</span>
                      <label className="relative inline-flex items-center cursor-pointer sm:hidden">
                        <input type="checkbox" className="sr-only peer" checked={isOpen} onChange={() => toggleDay(i)} />
                        <div className="w-9 h-5 bg-red-500 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                      </label>
                    </div>
                    
                    <div className={`flex items-center gap-2 flex-1 transition-opacity ${!isOpen ? 'opacity-50 pointer-events-none' : ''}`}>
                      <select className="input py-1.5 px-2 bg-surface text-sm flex-1" value={entry.open} onChange={(e) => {
                        const newSchedule = [...schedule];
                        newSchedule[i].open = e.target.value;
                        setSchedule(newSchedule);
                      }} disabled={!isOpen}>
                        {HOURS.map(h => (
                          <option key={h.value} value={h.value}>{h.label}</option>
                        ))}
                      </select>
                      <span className="text-on-surface-variant font-bold text-sm">to</span>
                      <select className="input py-1.5 px-2 bg-surface text-sm flex-1" value={entry.close} onChange={(e) => {
                        const newSchedule = [...schedule];
                        newSchedule[i].close = e.target.value;
                        setSchedule(newSchedule);
                      }} disabled={!isOpen}>
                        {HOURS.map(h => (
                          <option key={h.value} value={h.value}>{h.label}</option>
                        ))}
                      </select>
                    </div>
                    
                    <label className="hidden sm:inline-flex items-center cursor-pointer ml-auto">
                      <input type="checkbox" className="sr-only peer" checked={isOpen} onChange={() => toggleDay(i)} />
                      <div className="w-9 h-5 bg-red-500 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                    </label>
                  </div>
                )
              })}
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-8">
          {/* Closed Dates Calendar */}
          <section className="card p-6 md:p-8">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6 border-b border-outline pb-4">
              <CalendarIcon size={20} className="text-primary" />
              Closed Dates
            </h2>
            <p className="text-sm text-on-surface-variant mb-4">
              Click a date to &quot;crush it out&quot; and mark the court as closed (e.g., maintenance, holidays).
            </p>
            
            <div className="border border-outline rounded-lg p-4 bg-surface-low select-none shadow-inner">
              <div className="flex justify-between items-center mb-4">
                <button className="p-1.5 hover:bg-mist rounded transition-colors text-asphalt font-bold">&lt;</button>
                <span className="font-extrabold text-sm tracking-wide text-asphalt">OCTOBER 2026</span>
                <button className="p-1.5 hover:bg-mist rounded transition-colors text-asphalt font-bold">&gt;</button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                  <div key={d} className="text-[10px] font-extrabold text-on-surface-variant uppercase tracking-wider">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {/* Empty slots for starting day of month (Thursday) */}
                <div className="p-2"></div>
                <div className="p-2"></div>
                <div className="p-2"></div>
                <div className="p-2"></div>
                {Array.from({ length: 31 }, (_, i) => i + 1).map(date => {
                  const isClosed = closedDates.includes(date);
                  return (
                    <button 
                      key={date}
                      onClick={() => toggleDate(date)}
                      className={`relative aspect-square flex items-center justify-center text-sm rounded-md transition-all font-semibold overflow-hidden
                        ${isClosed ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-900/50 opacity-80' : 'bg-surface hover:bg-mist border border-transparent shadow-sm'}
                      `}
                    >
                      <span className="z-10">{date}</span>
                      {isClosed && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-[140%] h-[3px] bg-red-500/70 rotate-45"></div>
                          <div className="absolute w-[140%] h-[3px] bg-red-500/70 -rotate-45"></div>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="card p-6 md:p-8">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6 border-b border-outline pb-4">
              <DollarSign size={20} className="text-primary" />
              Pricing
            </h2>
            
            <div>
              <label className="block text-sm font-bold mb-1.5" htmlFor="pricePerHour">
                Price per Hour (PHP)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-on-surface-variant font-bold">₱</span>
                </div>
                <input 
                  id="pricePerHour"
                  type="number"
                  className="input pl-8 text-lg font-bold" 
                  value={pricePerHour}
                  onChange={e => setPricePerHour(e.target.value)}
                />
              </div>
              <p className="text-xs text-on-surface-variant mt-2">
                This is the base rate. You can set peak hours later.
              </p>
            </div>
          </section>

          {/* Media / Images */}
          <section className="card p-6 md:p-8">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6 border-b border-outline pb-4">
              <ImageIcon size={20} className="text-primary" />
              Court Images
            </h2>
            
            <div className="space-y-4">
              <div className="aspect-video bg-mist rounded-lg border-2 border-dashed border-outline-strong flex flex-col items-center justify-center p-6 text-center cursor-pointer hover:bg-surface-low transition-colors group">
                <div className="w-12 h-12 bg-surface rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm">
                  <ImageIcon size={24} className="text-on-surface-variant" />
                </div>
                <p className="text-sm font-bold mb-1">Click to upload photos</p>
                <p className="text-xs text-on-surface-variant">PNG, JPG up to 5MB</p>
              </div>

              {/* Mock Uploaded Images */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                <div className="relative w-20 h-20 rounded-md overflow-hidden border border-outline flex-shrink-0 bg-asphalt">
                  <div className="absolute inset-0 bg-gradient-to-tr from-green-500/20 to-transparent"></div>
                  <button className="absolute top-1 right-1 bg-surface/80 rounded-full p-1 hover:bg-red-50 hover:text-red-600 transition-colors">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  </button>
                </div>
                <div className="relative w-20 h-20 rounded-md overflow-hidden border border-outline flex-shrink-0 bg-asphalt">
                  <div className="absolute inset-0 bg-gradient-to-bl from-blue-500/20 to-transparent"></div>
                  <button className="absolute top-1 right-1 bg-surface/80 rounded-full p-1 hover:bg-red-50 hover:text-red-600 transition-colors">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
