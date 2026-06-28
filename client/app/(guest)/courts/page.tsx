import type { Metadata } from 'next'
import Navbar from '@/components/layout/Navbar'
import CourtGrid from '@/components/features/CourtGrid'
import type { MockCourt } from '@/components/features/CourtCard'
import { Search } from 'lucide-react'

// ─── SEO ──────────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: 'Browse Courts — PickleAll',
  description:
    'Discover and book pickleball courts across the Philippines. Filter by location, indoor/outdoor, price, and more.',
}

// ─── Mock court data ──────────────────────────────────────────────────────────
// TODO: Replace with `db.select().from(court).leftJoin(...)` once DB is seeded.
const MOCK_COURTS: MockCourt[] = [
  {
    id: '1',
    courtName: 'BGC Sports Hub — Court A',
    description: 'Premium indoor facility with pro-grade lighting, smooth hardwood surface, and climate control. Great for serious play.',
    location: 'Bonifacio Global City, Taguig',
    pricePerHour: 350,
    courtType: 'indoor',
    rating: 4.9,
    reviewCount: 128,
    accent: '#4F46E5',
    accentBg: '#EEF2FF',
    amenities: ['Paddle Rental', 'Locker Room', 'Pro Shop', 'Coaching'],
  },
  {
    id: '2',
    courtName: 'Pickleball Manila — Court 3',
    description: 'Open-air court with a stunning city view. Ideal for early morning or late afternoon games with natural ventilation.',
    location: 'Ayala Ave, Makati City',
    pricePerHour: 280,
    courtType: 'outdoor',
    rating: 4.7,
    reviewCount: 94,
    accent: '#059669',
    accentBg: '#ECFDF5',
    amenities: ['Ball Rental', 'Water Station', 'Parking'],
  },
  {
    id: '3',
    courtName: 'The Paddle Club — VIP Court',
    description: 'The most prestigious court in Metro Manila. Fully enclosed, private coaching bays, café, and an electronic scoreboard.',
    location: 'Eastwood City, Quezon City',
    pricePerHour: 420,
    courtType: 'indoor',
    rating: 4.9,
    reviewCount: 211,
    accent: '#D97706',
    accentBg: '#FFFBEB',
    amenities: ['Paddle Rental', 'Café', 'Coaching', 'Scoreboard', 'Locker Room'],
  },
  {
    id: '4',
    courtName: 'Eastside Courts — Court 2',
    description: 'Community-friendly outdoor courts with a welcoming vibe. Great for beginners and recreational players on a budget.',
    location: 'Kapitolyo, Pasig City',
    pricePerHour: 250,
    courtType: 'outdoor',
    rating: 4.6,
    reviewCount: 67,
    accent: '#DC2626',
    accentBg: '#FEF2F2',
    amenities: ['Ball Rental', 'Parking'],
  },
  {
    id: '5',
    courtName: 'Smash & Rally Hub',
    description: 'Mid-tier indoor facility with excellent acoustics and non-slip flooring. Popular with corporate leagues and groups.',
    location: 'Mandaluyong City',
    pricePerHour: 380,
    courtType: 'indoor',
    rating: 4.8,
    reviewCount: 156,
    accent: '#7C3AED',
    accentBg: '#F5F3FF',
    amenities: ['Paddle Rental', 'Locker Room', 'Coaching'],
  },
  {
    id: '6',
    courtName: 'Green Court Ortigas',
    description: 'Bright outdoor courts surrounded by lush landscaping. Excellent surface quality and spacious viewing area for spectators.',
    location: 'Ortigas Center, Pasig',
    pricePerHour: 300,
    courtType: 'outdoor',
    rating: 4.7,
    reviewCount: 89,
    accent: '#0369A1',
    accentBg: '#F0F9FF',
    amenities: ['Scoreboard', 'Water Station', 'Spectator Seating'],
  },
  {
    id: '7',
    courtName: 'Sportivo Arena — PB Court 1',
    description: 'Professional-grade indoor court used for local tournaments. Textured surface, broadcast lighting, and advanced booking system.',
    location: 'Alabang, Muntinlupa',
    pricePerHour: 450,
    courtType: 'indoor',
    rating: 5.0,
    reviewCount: 42,
    accent: '#be185d',
    accentBg: '#fdf2f8',
    amenities: ['Paddle Rental', 'Pro Shop', 'Coaching', 'Scoreboard', 'Café'],
  },
  {
    id: '8',
    courtName: 'Harbor Court — Bayside',
    description: 'Scenic outdoor court right by the bay. Enjoy the breeze while you play. Equipment available for rent on-site.',
    location: 'CCP Complex, Pasay',
    pricePerHour: 220,
    courtType: 'outdoor',
    rating: 4.5,
    reviewCount: 53,
    accent: '#0891b2',
    accentBg: '#ecfeff',
    amenities: ['Ball Rental', 'Water Station'],
  },
  {
    id: '9',
    courtName: 'UP ISSI Sports Court',
    description: 'University-managed indoor court with affordable rates. Open to the public on weekends. Clean facilities and friendly staff.',
    location: 'UP Diliman, Quezon City',
    pricePerHour: 180,
    courtType: 'indoor',
    rating: 4.4,
    reviewCount: 38,
    accent: '#65a30d',
    accentBg: '#f7fee7',
    amenities: ['Parking', 'Water Station'],
  },
]

// ─── Stats bar data ───────────────────────────────────────────────────────────
const STATS = [
  { value: `${MOCK_COURTS.length}`, label: 'Courts Listed' },
  {
    value: `₱${Math.min(...MOCK_COURTS.map((c) => c.pricePerHour))}`,
    label: 'Starting Rate / hr',
  },
  { value: '4.7★', label: 'Average Rating' },
  { value: '< 60s', label: 'Avg. Booking Time' },
]

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CourtsPage() {
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
                <a
                  href="#court-results"
                  className="btn btn-cta rounded-xl px-6 text-sm flex-shrink-0"
                >
                  Search
                </a>
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
                {MOCK_COURTS.length} courts across Metro Manila
              </p>
            </div>
          </div>

          {/* CourtGrid — client component handles all filtering/search state */}
          <CourtGrid courts={MOCK_COURTS} />
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
              <a href="/login" className="btn btn-primary text-sm px-6 py-3">
                List Your Court
              </a>
              <a href="/#how-it-works" className="btn btn-outline text-sm px-6 py-3">
                Learn More
              </a>
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
                <a
                  key={l}
                  href="#"
                  className="text-xs font-semibold text-white/40 hover:text-white/70 transition-colors"
                >
                  {l}
                </a>
              ))}
            </div>
          </div>
        </footer>
      </main>
    </>
  )
}
