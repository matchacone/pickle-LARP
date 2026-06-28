'use client'

import { useState } from 'react'

const filters = [
  { id: 'all',     label: 'All Courts' },
  { id: 'indoor',  label: '🏢 Indoor'   },
  { id: 'outdoor', label: '☀️ Outdoor'  },
  { id: 'pro',     label: '🏆 Pro Shop' },
  { id: 'top',     label: '⭐ Top Rated' },
]

export default function FilterPills() {
  const [active, setActive] = useState('all')

  return (
    <div
      className="flex gap-2 overflow-x-auto pb-1 scrollbar-none"
      role="tablist"
      aria-label="Court type filters"
    >
      {filters.map((f) => (
        <button
          key={f.id}
          id={`filter-${f.id}`}
          role="tab"
          aria-selected={active === f.id}
          onClick={() => setActive(f.id)}
          className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-semibold border transition-all duration-150 ${
            active === f.id
              ? 'bg-asphalt text-white border-asphalt'
              : 'bg-white text-on-surface-variant border-outline hover:border-asphalt hover:text-asphalt'
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}
