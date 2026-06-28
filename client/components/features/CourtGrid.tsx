'use client'

import { useState, useMemo } from 'react'
import CourtCard, { type MockCourt } from './CourtCard'
import { Search, SlidersHorizontal, ChevronDown, SearchX } from 'lucide-react'


// ─── Filter config ────────────────────────────────────────────────────────────
type FilterId = 'all' | 'indoor' | 'outdoor' | 'budget' | 'premium'

const FILTERS: { id: FilterId; label: string }[] = [
  { id: 'all',     label: 'All Courts' },
  { id: 'indoor',  label: '🏢 Indoor'   },
  { id: 'outdoor', label: '☀️ Outdoor'  },
  { id: 'budget',  label: '💸 Under ₱300' },
  { id: 'premium', label: '⭐ Top Rated' },
]

// ─── Sort config ──────────────────────────────────────────────────────────────
type SortId = 'featured' | 'price-asc' | 'price-desc' | 'rating'

const SORTS: { id: SortId; label: string }[] = [
  { id: 'featured',   label: 'Featured' },
  { id: 'rating',     label: 'Top Rated' },
  { id: 'price-asc',  label: 'Price: Low → High' },
  { id: 'price-desc', label: 'Price: High → Low' },
]

type Props = {
  courts: MockCourt[]
}

export default function CourtGrid({ courts }: Props) {
  const [activeFilter, setActiveFilter] = useState<FilterId>('all')
  const [activeSort, setActiveSort] = useState<SortId>('featured')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOpen, setSortOpen] = useState(false)

  const filtered = useMemo(() => {
    let result = [...courts]

    // ── Text search ──────────────────────────────
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (c) =>
          c.courtName.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q),
      )
    }

    // ── Filter tab ───────────────────────────────
    if (activeFilter === 'indoor')  result = result.filter((c) => c.courtType === 'indoor')
    if (activeFilter === 'outdoor') result = result.filter((c) => c.courtType === 'outdoor')
    if (activeFilter === 'budget')  result = result.filter((c) => c.pricePerHour < 300)
    if (activeFilter === 'premium') result = result.filter((c) => c.rating >= 4.8)

    // ── Sort ─────────────────────────────────────
    if (activeSort === 'rating')     result.sort((a, b) => b.rating - a.rating)
    if (activeSort === 'price-asc')  result.sort((a, b) => a.pricePerHour - b.pricePerHour)
    if (activeSort === 'price-desc') result.sort((a, b) => b.pricePerHour - a.pricePerHour)

    return result
  }, [courts, searchQuery, activeFilter, activeSort])

  return (
    <div>
      {/* ── Controls bar ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 mb-8">
        {/* Search + Sort row */}
        <div className="flex gap-3 items-center">
          {/* Search input */}
          <div className="relative flex-1 max-w-md">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="courts-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or location…"
              className="input pl-9"
              aria-label="Search courts"
            />
          </div>

          {/* Sort dropdown */}
          <div className="relative flex-shrink-0">
            <button
              id="courts-sort-button"
              onClick={() => setSortOpen(!sortOpen)}
              className="btn btn-outline text-sm flex items-center gap-2"
              aria-haspopup="listbox"
              aria-expanded={sortOpen}
            >
              <SlidersHorizontal size={14} aria-hidden="true" />
              <span className="hidden sm:inline">
                {SORTS.find((s) => s.id === activeSort)?.label}
              </span>
              <ChevronDown
                size={12}
                aria-hidden="true"
                className={`transition-transform duration-150 ${sortOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {sortOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lift border border-outline z-20 overflow-hidden"
                role="listbox"
                aria-label="Sort courts by"
              >
                {SORTS.map((s) => (
                  <button
                    key={s.id}
                    role="option"
                    aria-selected={activeSort === s.id}
                    onClick={() => { setActiveSort(s.id); setSortOpen(false) }}
                    className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition-colors ${
                      activeSort === s.id
                        ? 'bg-asphalt text-white'
                        : 'text-on-surface hover:bg-mist'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Filter pills */}
        <div
          className="flex gap-2 overflow-x-auto pb-1 scrollbar-none"
          role="tablist"
          aria-label="Court type filters"
        >
          {FILTERS.map((f) => (
            <button
              key={f.id}
              id={`filter-${f.id}`}
              role="tab"
              aria-selected={activeFilter === f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-semibold border transition-all duration-150 ${
                activeFilter === f.id
                  ? 'bg-asphalt text-white border-asphalt'
                  : 'bg-white text-on-surface-variant border-outline hover:border-asphalt hover:text-asphalt'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Results count */}
        <p className="text-sm text-on-surface-variant">
          {filtered.length === 0
            ? 'No courts match your filters.'
            : `${filtered.length} court${filtered.length !== 1 ? 's' : ''} found`}
        </p>
      </div>

      {/* ── Grid ───────────────────────────────────────────────────────────────── */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((court) => (
            <CourtCard key={court.id} court={court} />
          ))}
        </div>
      ) : (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
            style={{ backgroundColor: '#F3F4F5' }}
          >
            <SearchX size={36} className="text-surface-dim" aria-hidden="true" />
          </div>
          <h3 className="text-lg font-bold text-asphalt mb-2">No courts found</h3>
          <p className="text-sm text-on-surface-variant max-w-xs">
            Try adjusting your search or filters to find available courts.
          </p>
          <button
            onClick={() => { setSearchQuery(''); setActiveFilter('all') }}
            className="btn btn-outline mt-6 text-sm"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  )
}
