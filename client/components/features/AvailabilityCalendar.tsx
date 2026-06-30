'use client'

import { useState, useMemo } from 'react'
import { Calendar as CalendarIcon, Clock, ArrowRight } from 'lucide-react'

// Basic 14-hour slot array (8 AM to 9 PM)
const TIME_SLOTS = Array.from({ length: 14 }).map((_, i) => {
  const hour = i + 8
  const isPM = hour >= 12
  const displayHour = hour > 12 ? hour - 12 : hour
  return {
    id: `${hour}:00`,
    label: `${displayHour}:00 ${isPM ? 'PM' : 'AM'}`,
    hour,
  }
})

// Quick deterministic PRNG for mock slot availability based on court + date + time
function seededRandom(seed: number) {
  const x = Math.sin(seed++) * 10000
  return x - Math.floor(x)
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
    d.setHours(0, 0, 0, 0)
    return d
  })
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null)
  const [duration, setDuration] = useState<number>(1)

  // Generate next 7 days for the date picker
  const upcomingDays = useMemo(() => {
    const days = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    for (let i = 0; i < 7; i++) {
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

  // Check if a specific hour on the selected date is available (mock logic)
  const isSlotAvailable = (hour: number) => {
    const seed = parseInt(courtId) * 100 + selectedDate.getDate() * 10 + hour
    return seededRandom(seed) > 0.3 // 70% chance to be available
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
    for (let i = 0; i < duration; i++) {
      const hourToCheck = selectedSlot + i
      if (hourToCheck > 21) return false // Past 9 PM (last slot)
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

        {/* Time slot grid */}
        <div className="grid grid-cols-3 gap-2">
          {TIME_SLOTS.map((slot) => {
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
                disabled={duration >= maxBookingHours || (selectedSlot ? selectedSlot + duration >= 22 : false)}
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
              href="/login"
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
            You will be redirected to login to complete this booking.
          </p>
        </div>
      </div>
    </div>
  )
}
