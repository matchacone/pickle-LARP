import type { Metadata } from 'next'
import Navbar from '@/components/layout/Navbar'
import CourtGrid from '@/components/features/CourtGrid'
import { Search } from 'lucide-react'
import { getAllCourts } from '@/lib/db/queries/courtQueries'
import Link from 'next/link'

// ─── SEO ──────────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: 'Browse Courts — PickleAll',
  description:
    'Discover and book pickleball courts across the Philippines. Filter by location, indoor/outdoor, price, and more.',
}

// ─── Data fetching ────────────────────────────────────────────────────────────
async function getCourts() {
  try {
    return await getAllCourts()
  } catch (err) {
    console.error('[CourtsPage] Database query failed:', err)
    return []
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function CourtsPage() {
  const courts = await getCourts()

  // Compute stats from actual data
  const STATS = [
    { value: `${courts.length}`, label: 'Courts Listed' },
    {
      value: courts.length > 0
        ? `₱${Math.min(...courts.map((c) => c.pricePerHour))}`
        : '₱0',
      label: 'Starting Rate / hr',
    },
    {
      value: courts.length > 0
        ? `${(courts.reduce((sum, c) => sum + c.avgRating, 0) / courts.length).toFixed(1)}★`
        : 'N/A',
      label: 'Average Rating',
    },
    { value: '< 60s', label: 'Avg. Booking Time' },
  ]

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-white">
        {/* ═══════════════════════════════════════════
            PAGE HEADER
        ═══════════════════════════════════════════ */}
        <section className="relative bg-asphalt pt-16 overflow-hidden">
          {/* Background decorations */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            {/* Green rotated accent block */}
            <div
              className="absolute -right-24 top-0 bottom-0 w-80 opacity-90"
              style={{
                background: 'linear-gradient(135deg, #D1FE00 0%, #afd500 100%)',
                clipPath: 'polygon(30% 0%, 100% 0%, 100% 100%, 0% 100%)',
              }}
            />
            {/* Subtle dot grid */}
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
                backgroundSize: '28px 28px',
              }}
            />
            {/* Court line accent */}
            <div
              className="absolute left-0 right-0 bottom-0 h-px opacity-10"
              style={{ backgroundColor: '#D1FE00' }}
            />
          </div>

          <div className="container-page relative py-12 md:py-16">
            <div className="max-w-2xl">
              {/* Pre-label */}
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 text-xs font-bold uppercase tracking-widest text-white/70 mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
                Philippines · Pickleball Courts
              </span>

              {/* Headline */}
              <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-[1.08] tracking-tight">
                Find Your Perfect
                <br />
                <span className="text-green">Court.</span>
              </h1>

              <p className="mt-4 text-base text-white/60 max-w-md leading-relaxed">
                Browse all available courts across Metro Manila. Filter by type, price, and
                amenities — then book your slot in seconds.
              </p>

              {/* Search bar */}
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
                    placeholder="Search by city or court name…"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 text-sm font-medium outline-none focus:border-green focus:bg-white/15 transition-all duration-150"
                    aria-label="Search courts by location"
                    readOnly
                  />
                </div>
                <Link
                  href="#court-results"
                  className="btn btn-cta rounded-xl px-6 text-sm flex-shrink-0"
                >
                  Search
                </Link>
              </div>
            </div>
          </div>

          {/* Stats bar */}
          <div className="relative border-t border-white/10">
            <div className="container-page py-4">
              <dl className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {STATS.map((s) => (
                  <div key={s.label} className="flex flex-col">
                    <dt className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                      {s.label}
                    </dt>
                    <dd className="text-xl font-extrabold text-white mt-0.5">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            COURT GRID
        ═══════════════════════════════════════════ */}
        <section
          id="court-results"
          className="container-page py-12 md:py-16"
          aria-label="Court listings"
        >
          {/* Section label */}
          <div className="flex items-baseline justify-between mb-8">
            <div>
              <h2 className="text-2xl font-extrabold text-asphalt tracking-tight">
                Available Courts
              </h2>
              <p className="text-sm text-on-surface-variant mt-1">
                {courts.length} courts across Metro Manila
              </p>
            </div>
          </div>

          {/* CourtGrid — client component handles all filtering/search state */}
          <CourtGrid courts={courts} />
        </section>

        {/* ═══════════════════════════════════════════
            BOTTOM CTA
        ═══════════════════════════════════════════ */}
        <section className="bg-mist border-t border-outline">
          <div className="container-page py-14 md:py-20 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-lg text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-extrabold text-asphalt tracking-tight leading-tight">
                Don&apos;t see your court?
              </h2>
              <p className="mt-3 text-base text-on-surface-variant leading-relaxed">
                We&apos;re expanding across the Philippines. Register your facility and reach
                thousands of players looking to book courts near them.
              </p>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <Link href="/login" className="btn btn-primary text-sm px-6 py-3">
                List Your Court
              </Link>
              <Link href="/#how-it-works" className="btn btn-outline text-sm px-6 py-3">
                Learn More
              </Link>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            FOOTER
        ═══════════════════════════════════════════ */}
        <footer className="bg-asphalt">
          <div className="container-page py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-sm font-bold text-white/60">
              © {new Date().getFullYear()} PickleAll. All rights reserved.
            </span>
            <div className="flex gap-6">
              {['Privacy', 'Terms', 'Contact'].map((l) => (
                <Link
                  key={l}
                  href="#"
                  className="text-xs font-semibold text-white/40 hover:text-white/70 transition-colors"
                >
                  {l}
                </Link>
              ))}
            </div>
          </div>
        </footer>
      </main>
    </>
  )
}
