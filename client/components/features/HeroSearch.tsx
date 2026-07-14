'use client'

import { Search } from 'lucide-react'
import { useState } from 'react'

export function HeroSearch() {
  const [val, setVal] = useState('')

  const handleSearch = () => {
    const realInput = document.getElementById('courts-search') as HTMLInputElement
    if (realInput) {
      // Synchronize the typed value to the real search bar in CourtGrid
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value'
      )?.set
      nativeInputValueSetter?.call(realInput, val)
      realInput.dispatchEvent(new Event('input', { bubbles: true }))

      // Smooth scroll to results
      document.getElementById('court-results')?.scrollIntoView({ behavior: 'smooth' })
      
      // Focus the real input
      setTimeout(() => realInput.focus(), 100)
    } else {
      // Fallback if the element isn't there
      document.getElementById('court-results')?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="mt-8 flex gap-3">
      <div className="relative flex-1">
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
          aria-hidden="true"
        />
        <input
          id="hero-search-location"
          type="text"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search by city or court name…"
          className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 text-sm font-medium outline-none focus:border-green focus:bg-white/15 transition-all duration-150"
          aria-label="Search courts by location"
        />
      </div>
      <button
        onClick={handleSearch}
        className="btn btn-cta rounded-xl px-6 text-sm flex-shrink-0"
      >
        Search
      </button>
    </div>
  )
}
