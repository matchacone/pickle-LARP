'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { Calendar as CalendarIcon, Clock, ArrowRight, Loader2 } from 'lucide-react'

// TIME_SLOTS is now computed dynamically based on operating hours

/** Shape of a booked slot from the availability API */
type BookedSlot = { start_hour: number; end_hour: number }

type OperatingHours = {
  is_open: boolean
  open_time: string
  close_time: string
}

interface Props {
  courtId: string
  pricePerHour: number
  maxBookingHours?: number
}

export default function AvailabilityCalendar({
  courtId,
  pricePerHour,
  maxBookingHours = 4,
}: Props) {
  // State
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const d = new Date()
    d.setDate(d.getDate() + 1) // Start from tomorrow
    d.setHours(0, 0, 0, 0)
    return d
  })
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null)
  const [duration, setDuration] = useState<number>(1)
  const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([])
  const [operatingHours, setOperatingHours] = useState<OperatingHours | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Generate next 7 days for the date picker
  const upcomingDays = useMemo(() => {
    const days = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Start from i = 1 (tomorrow) up to 7 days
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      days.push({
        date,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: date.getDate(),
        month: date.toLocaleDateString('en-US', { month: 'short' }),
      })
    }
    return days
  }, [])

  // Fetch availability from the API when date or courtId changes
  const fetchAvailability = useCallback(async () => {
    setIsLoading(true)
    try {
      const dateStr = selectedDate.toLocaleDateString('en-CA') // YYYY-MM-DD format
      const res = await fetch(`/api/courts/${courtId}/availability?date=${dateStr}`)
      if (res.ok) {
        const data = await res.json()
        setBookedSlots(data.booked_slots ?? [])
        setOperatingHours(data.operating_hours ?? null)
      } else {
        // On error, treat all slots as available (graceful degradation)
        setBookedSlots([])
        setOperatingHours(null)
      }
    } catch {
      setBookedSlots([])
      setOperatingHours(null)
    } finally {
      setIsLoading(false)
    }
  }, [courtId, selectedDate])

  useEffect(() => {
    Promise.resolve().then(() => fetchAvailability())
  }, [fetchAvailability])

  const timeSlots = useMemo(() => {
    if (!operatingHours || !operatingHours.is_open) return []
    const startHour = parseInt(operatingHours.open_time.split(':')[0], 10)
    const endHour = parseInt(operatingHours.close_time.split(':')[0], 10)
    if (isNaN(startHour) || isNaN(endHour) || startHour >= endHour) return []
    
    const length = endHour - startHour
    return Array.from({ length }).map((_, i) => {
      const hour = i + startHour
      const isPM = hour >= 12
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
      return {
        id: `${hour}:00`,
        label: `${displayHour}:00 ${isPM ? 'PM' : 'AM'}`,
        hour,
      }
    })
  }, [operatingHours])

  // Check if a specific hour on the selected date is available
  const isSlotAvailable = (hour: number) => {
    // Check against real booked slots
    for (const slot of bookedSlots) {
      if (hour >= slot.start_hour && hour < slot.end_hour) {
        return false
      }
    }
    return true
  }

  // Handle slot click
  const handleSlotClick = (hour: number) => {
    if (selectedSlot === hour) {
      setSelectedSlot(null) // Deselect
      setDuration(1)
    } else {
      setSelectedSlot(hour)
      setDuration(1)
    }
  }

  // Check if current duration is valid (subsequent slots are available)
  const isDurationValid = () => {
    if (selectedSlot === null) return false
    const maxHour = operatingHours ? parseInt(operatingHours.close_time.split(':')[0], 10) : 22
    for (let i = 0; i < duration; i++) {
      const hourToCheck = selectedSlot + i
      if (hourToCheck >= maxHour) return false // Past close time
      if (!isSlotAvailable(hourToCheck)) return false
    }
    return true
  }

  // Calculate totals
  const totalAmount = pricePerHour * duration
  const validDuration = isDurationValid()

  return (
    <div className="card p-6 bg-white border border-outline-variant rounded-2xl shadow-sm relative overflow-hidden">
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary-container" />

      <h3 className="text-xl font-bold text-asphalt mb-6 flex items-center gap-2">
        <CalendarIcon size={20} className="text-primary" />
        Select a Time
      </h3>

      {/* Date selector tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-2 -mx-2 px-2 snap-x scrollbar-hide">
        {upcomingDays.map((d, i) => {
          const isSelected = selectedDate.getTime() === d.date.getTime()
          return (
            <button
              key={i}
              onClick={() => {
                setSelectedDate(d.date)
                setSelectedSlot(null) // Reset slot on day change
                setDuration(1)
              }}
              className={`flex-shrink-0 snap-start flex flex-col items-center justify-center w-[72px] h-[84px] rounded-xl border transition-all ${
                isSelected
                  ? 'bg-asphalt border-asphalt text-white ring-2 ring-primary/30 ring-offset-2'
                  : 'bg-white border-outline-variant text-asphalt hover:border-asphalt/30 hover:bg-mist'
              }`}
            >
              <span className={`text-xs font-semibold uppercase tracking-wider ${isSelected ? 'text-white/70' : 'text-on-surface-variant'}`}>
                {d.dayName}
              </span>
              <span className="text-2xl font-extrabold -mt-1 leading-none">{d.dayNum}</span>
              <span className={`text-[10px] font-bold uppercase mt-1 ${isSelected ? 'text-primary' : 'text-on-surface-variant'}`}>
                {d.month}
              </span>
            </button>
          )
        })}
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold text-asphalt flex items-center gap-1.5">
            <Clock size={14} className="text-on-surface-variant" />
            Available Slots
          </span>
          <span className="text-xs font-semibold text-on-surface-variant bg-mist px-2 py-0.5 rounded-full">
            {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>

        {/* Loading state */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-on-surface-variant">
            <Loader2 size={20} className="animate-spin mr-2" />
            <span className="text-sm font-semibold">Loading availability…</span>
          </div>
        ) : timeSlots.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-on-surface-variant">
            <span className="text-sm font-semibold">Court is closed on this day.</span>
          </div>
        ) : (
          /* Time slot grid */
          <div className="grid grid-cols-3 gap-2">
            {timeSlots.map((slot) => {
              const available = isSlotAvailable(slot.hour)
              const isSelected = selectedSlot === slot.hour
              
              // Highlight if part of a multi-hour duration
              const isPartOfDuration = 
                selectedSlot !== null && 
                slot.hour >= selectedSlot && 
                slot.hour < selectedSlot + duration

              return (
                <button
                  key={slot.id}
                  disabled={!available}
                  onClick={() => handleSlotClick(slot.hour)}
                  className={`
                    py-3 rounded-lg text-sm font-bold transition-all border
                    ${
                      !available
                        ? 'bg-mist/50 border-mist text-asphalt/20 cursor-not-allowed line-through decoration-asphalt/20'
                        : isSelected
                        ? 'bg-primary border-primary text-asphalt shadow-sm ring-2 ring-primary/30 ring-offset-1'
                        : isPartOfDuration
                        ? 'bg-primary/20 border-primary/30 text-asphalt'
                        : 'bg-white border-outline-variant text-asphalt hover:border-asphalt/40 hover:bg-mist'
                    }
                  `}
                >
                  {slot.label}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Duration Stepper (only show if a slot is selected) */}
      <div className={`transition-all duration-300 overflow-hidden ${selectedSlot ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="border-t border-outline-variant pt-5 mb-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-asphalt">Duration</span>
            <div className="flex items-center bg-mist rounded-lg p-1 border border-outline-variant">
              <button
                onClick={() => setDuration(Math.max(1, duration - 1))}
                disabled={duration <= 1}
                className="w-8 h-8 flex items-center justify-center rounded-md bg-white border border-outline-variant text-asphalt font-bold hover:bg-surface disabled:opacity-50 disabled:hover:bg-white"
              >
                -
              </button>
              <span className="w-12 text-center text-sm font-bold text-asphalt">
                {duration} hr{duration > 1 ? 's' : ''}
              </span>
              <button
                onClick={() => setDuration(Math.min(maxBookingHours, duration + 1))}
                disabled={duration >= maxBookingHours || (selectedSlot ? selectedSlot + duration >= (operatingHours ? parseInt(operatingHours.close_time.split(':')[0], 10) : 22) : false)}
                className="w-8 h-8 flex items-center justify-center rounded-md bg-white border border-outline-variant text-asphalt font-bold hover:bg-surface disabled:opacity-50 disabled:hover:bg-white"
              >
                +
              </button>
            </div>
          </div>

          {!validDuration && (
            <div className="p-3 mb-4 bg-error/10 border border-error/20 rounded-lg text-xs font-semibold text-error">
              One or more subsequent slots are unavailable. Please reduce duration or select a different start time.
            </div>
          )}

          <div className="flex items-end justify-between bg-surface-container rounded-xl p-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">
                Total Amount
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-asphalt leading-none">
                  ₱{totalAmount.toLocaleString()}
                </span>
              </div>
            </div>
            
            <a 
              href={validDuration && selectedSlot !== null
                ? `/checkout?courtId=${courtId}&date=${selectedDate.toLocaleDateString('en-CA')}&startHour=${selectedSlot}&duration=${duration}&price=${pricePerHour}`
                : '#'
              }
              className={`btn ${validDuration ? 'btn-primary' : 'bg-mist text-asphalt/40 pointer-events-none'} py-3 px-6 shadow-md shadow-primary/20 flex items-center gap-2`}
              onClick={(e) => {
                if (!validDuration) e.preventDefault()
              }}
            >
              Book Slot
              <ArrowRight size={16} />
            </a>
          </div>
          <p className="text-[10px] text-center text-on-surface-variant font-medium mt-3">
            You&apos;ll review your booking on the next page.
          </p>
        </div>
      </div>
    </div>
  )
}
