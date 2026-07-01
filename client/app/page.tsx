import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import FilterPills from '@/components/features/FilterPills'
import { Search, MapPin, Search as SearchIcon, Star, Calendar, Trophy } from 'lucide-react'


// ─── Mock court data (will be replaced with DB fetch once courts are seeded) ──
const COURTS = [
  {
    id: '1',
    name: 'BGC Sports Hub — Court A',
    location: 'Bonifacio Global City, Taguig',
    type: 'Indoor',
    price: 350,
    rating: 4.9,
    reviews: 128,
    accent: '#4F46E5',   // indigo
    accentBg: '#EEF2FF',
    amenities: ['Paddle Rental', 'Locker Room', 'Pro Shop'],
  },
  {
    id: '2',
    name: 'Pickleball Manila — Court 3',
    location: 'Ayala Ave, Makati City',
    type: 'Outdoor',
    price: 280,
    rating: 4.7,
    reviews: 94,
    accent: '#059669',  // emerald
    accentBg: '#ECFDF5',
    amenities: ['Ball Rental', 'Water Station'],
  },
  {
    id: '3',
    name: 'The Paddle Club — VIP Court',
    location: 'Eastwood City, Quezon City',
    type: 'Indoor',
    price: 420,
    rating: 4.9,
    reviews: 211,
    accent: '#D97706',  // amber
    accentBg: '#FFFBEB',
    amenities: ['Paddle Rental', 'Café', 'Coaching', 'Scoreboard'],
  },
  {
    id: '4',
    name: 'Eastside Courts — Court 2',
    location: 'Kapitolyo, Pasig City',
    type: 'Outdoor',
    price: 250,
    rating: 4.6,
    reviews: 67,
    accent: '#DC2626',  // red
    accentBg: '#FEF2F2',
    amenities: ['Ball Rental', 'Parking'],
  },
  {
    id: '5',
    name: 'Smash & Rally Hub',
    location: 'Mandaluyong City',
    type: 'Indoor',
    price: 380,
    rating: 4.8,
    reviews: 156,
    accent: '#7C3AED',  // violet
    accentBg: '#F5F3FF',
    amenities: ['Paddle Rental', 'Locker Room', 'Coaching'],
  },
  {
    id: '6',
    name: 'Green Court Ortigas',
    location: 'Ortigas Center, Pasig',
    type: 'Outdoor',
    price: 300,
    rating: 4.7,
    reviews: 89,
    accent: '#0369A1',  // sky
    accentBg: '#F0F9FF',
    amenities: ['Scoreboard', 'Water Station'],
  },
]

const STEPS = [
  {
    num: '01',
    title: 'Find Your Court',
    body: 'Search by location, date, and time. Filter by indoor, outdoor, or pro-level courts.',
    icon: <SearchIcon size={28} />,
  },
  {
    num: '02',
    title: 'Book Instantly',
    body: 'Choose your slot and confirm in seconds. No phone calls, no waiting.',
    icon: <Calendar size={28} />,
  },
  {
    num: '03',
    title: 'Play & Review',
    body: 'Show up, play your best game, then leave a review to help other players.',
    icon: <Trophy size={28} />,
  },
]

const STATS = [
  { value: '500+',   label: 'Courts Listed' },
  { value: '12K+',   label: 'Active Players' },
  { value: '4.9★',   label: 'Average Rating' },
  { value: '< 60s',  label: 'Avg. Booking Time' },
]

// ─── Court type badge ─────────────────────────────────────────────────────────
function CourtTypeBadge({ type }: { type: string }) {
  const cls =
    type === 'Indoor'
      ? 'badge badge-indoor'
      : 'badge badge-outdoor'
  return <span className={cls}>{type}</span>
}

// ─── Court card ───────────────────────────────────────────────────────────────
function CourtCard({ court }: { court: (typeof COURTS)[number] }) {
  return (
    <article className="card group overflow-hidden hover:-translate-y-1 transition-transform duration-200">
      {/* Image placeholder — geometric accent panel */}
      <div
        className="relative h-44 flex items-end p-4"
        style={{ backgroundColor: court.accentBg }}
      >
        {/* Decorative court lines */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-4 rounded-md opacity-15"
            style={{ border: `2px solid ${court.accent}` }}
          />
          <div
            className="absolute left-1/2 top-4 bottom-4 w-px opacity-15"
            style={{ backgroundColor: court.accent }}
          />
          <div
            className="absolute left-4 right-4 top-1/2 h-px opacity-15"
            style={{ backgroundColor: court.accent }}
          />
          {/* Kinetic accent dot */}
          <div
            className="absolute top-4 right-4 w-10 h-10 rounded-full opacity-20"
            style={{ backgroundColor: court.accent }}
          />
        </div>

        {/* Price chip — top left */}
        <div className="absolute top-3 left-3 bg-white rounded-lg px-3 py-1.5 shadow-float">
          <span className="text-sm font-extrabold text-asphalt">
            ₱{court.price}
            <span className="text-xs font-medium text-on-surface-variant">/hr</span>
          </span>
        </div>

        {/* Type badge — bottom left */}
        <CourtTypeBadge type={court.type} />
      </div>

      {/* Card body */}
      <div className="p-4">
        <h3 className="font-bold text-asphalt text-base leading-tight line-clamp-1">
          {court.name}
        </h3>
        <p className="text-sm text-on-surface-variant mt-0.5 flex items-center gap-1">
          <MapPin size={12} aria-hidden="true" />
          {court.location}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-1 mt-2">
          <span className="text-sm font-bold text-asphalt">★ {court.rating}</span>
          <span className="text-xs text-on-surface-variant">({court.reviews} reviews)</span>
        </div>

        {/* Amenity chips */}
        <div className="flex flex-wrap gap-1 mt-3">
          {court.amenities.slice(0, 2).map((a) => (
            <span
              key={a}
              className="text-xs font-semibold px-2 py-0.5 rounded-full bg-mist text-on-surface-variant"
            >
              {a}
            </span>
          ))}
          {court.amenities.length > 2 && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-mist text-on-surface-variant">
              +{court.amenities.length - 2} more
            </span>
          )}
        </div>

        {/* Book button */}
        <Link
          href={`/courts/${court.id}`}
          id={`book-court-${court.id}`}
          className="btn btn-primary w-full justify-center mt-4 text-sm"
        >
          Book Now
        </Link>
      </div>
    </article>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <>
      <Navbar />

      <main>
        {/* ═══════════════════════════════════════════
            HERO
        ═══════════════════════════════════════════ */}
        <section className="relative bg-white pt-16 overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            {/* Large green rotated block — right side accent */}
            <div
              className="absolute -right-32 top-8 w-[520px] h-[520px] rounded-3xl opacity-90 rotate-12"
              style={{ backgroundColor: '#D1FE00' }}
            />
            {/* Subtle grid dot pattern */}
            <div
              className="absolute inset-0 opacity-[0.025]"
              style={{
                backgroundImage: 'radial-gradient(circle, #121212 1px, transparent 1px)',
                backgroundSize: '32px 32px',
              }}
            />
          </div>

          <div className="container-page relative grid grid-cols-1 lg:grid-cols-2 gap-16 items-center min-h-[calc(100vh-64px)] py-20">
            {/* ── Left: Copy + Search ── */}
            <div className="flex flex-col gap-8 max-w-xl">
              {/* Pre-title pill */}
              <span className="inline-flex items-center gap-2 self-start px-4 py-2 rounded-full bg-asphalt text-white text-xs font-bold tracking-widest uppercase">
                <span className="w-2 h-2 rounded-full bg-green animate-pulse" />
                Philippines&apos; #1 Court Platform
              </span>

              {/* Headline */}
              <div>
                <h1 className="text-5xl lg:text-6xl font-extrabold text-asphalt leading-[1.05] tracking-tight">
                  Find the Court.
                  <br />
                  <span className="relative inline-block">
                    Win the Day.
                    {/* Green underline accent */}
                    <svg
                      className="absolute -bottom-2 left-0 w-full"
                      height="8"
                      viewBox="0 0 300 8"
                      fill="none"
                      preserveAspectRatio="none"
                      aria-hidden="true"
                    >
                      <path d="M0 6C60 2 120 2 180 5C240 8 270 5 300 6" stroke="#D1FE00" strokeWidth="4" strokeLinecap="round"/>
                    </svg>
                  </span>
                </h1>
                <p className="mt-6 text-lg text-on-surface-variant leading-relaxed max-w-md">
                  Discover and instantly book pickleball courts across the Philippines.
                  Real-time availability, no phone calls, no hassle.
                </p>
              </div>

              {/* ── Search widget ── */}
              <div className="card p-2 shadow-lift">
                <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-outline">
                  {/* Location */}
                  <label className="flex flex-col gap-0.5 px-4 py-3 cursor-pointer">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Location</span>
                    <input
                      id="search-location"
                      type="text"
                      placeholder="City or barangay"
                      className="text-sm font-semibold text-asphalt placeholder:text-surface-dim bg-transparent outline-none"
                    />
                  </label>

                  {/* Date */}
                  <label className="flex flex-col gap-0.5 px-4 py-3 cursor-pointer">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Date</span>
                    <input
                      id="search-date"
                      type="date"
                      className="text-sm font-semibold text-asphalt bg-transparent outline-none"
                    />
                  </label>

                  {/* Duration */}
                  <div className="flex items-center gap-2 px-4 py-3">
                    <div className="flex flex-col gap-0.5 flex-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Duration</span>
                      <select
                        id="search-duration"
                        className="text-sm font-semibold text-asphalt bg-transparent outline-none"
                      >
                        {[1, 2, 3, 4, 5, 6].map((h) => (
                          <option key={h} value={h}>{h} hour{h > 1 ? 's' : ''}</option>
                        ))}
                      </select>
                    </div>
                    <Link
                      href="/courts"
                      id="hero-search-button"
                      className="btn btn-primary flex-shrink-0 gap-2"
                    >
                      <Search size={16} aria-hidden="true" />
                      Find Courts
                    </Link>
                  </div>
                </div>
              </div>

              {/* Social proof */}
              <div className="flex items-center gap-3">
                {/* Avatar stack */}
                <div className="flex -space-x-2" aria-hidden="true">
                  {['#4F46E5', '#059669', '#D97706', '#DC2626'].map((c, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: c }}
                    >
                      {['J', 'M', 'R', 'A'][i]}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-on-surface-variant">
                  <span className="font-bold text-asphalt">12,000+</span> players booked this month
                  &nbsp;·&nbsp;
                  <span className="font-bold text-asphalt">★ 4.9</span> average
                </p>
              </div>
            </div>

            {/* ── Right: Visual showcase ── */}
            <div className="hidden lg:flex items-center justify-center relative h-[500px]">
              {/* Floating court preview card */}
              <div className="relative z-10 card shadow-lift w-72 -ml-8 mt-8">
                {/* Card image — court lines art */}
                <div className="h-36 rounded-t-lg overflow-hidden relative bg-asphalt flex items-center justify-center">
                  {/* Aerial court view in CSS */}
                  <svg width="260" height="130" viewBox="0 0 260 130" fill="none" className="opacity-80" aria-hidden="true">
                    {/* Court boundary */}
                    <rect x="20" y="10" width="220" height="110" rx="2" stroke="#D1FE00" strokeWidth="1.5"/>
                    {/* Center line */}
                    <line x1="130" y1="10" x2="130" y2="120" stroke="#D1FE00" strokeWidth="1" strokeDasharray="4 3"/>
                    {/* Kitchen lines */}
                    <line x1="20" y1="47" x2="240" y2="47" stroke="#D1FE00" strokeWidth="1"/>
                    <line x1="20" y1="83" x2="240" y2="83" stroke="#D1FE00" strokeWidth="1"/>
                    {/* Net */}
                    <line x1="20" y1="65" x2="240" y2="65" stroke="white" strokeWidth="2"/>
                    {/* Ball */}
                    <circle cx="155" cy="55" r="5" fill="#D1FE00"/>
                  </svg>
                  {/* AVAILABLE badge */}
                  <span className="absolute top-2 right-2 badge" style={{ backgroundColor: '#D1FE00', color: '#121212' }}>
                    ● AVAILABLE
                  </span>
                </div>
                <div className="p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">BGC Sports Hub</p>
                  <p className="font-extrabold text-asphalt mt-0.5">Court A — Indoor</p>
                  <div className="flex items-center justify-between mt-3">
                    <div>
                      <p className="text-xs text-on-surface-variant">Today, 4:00 PM – 6:00 PM</p>
                      <p className="text-lg font-extrabold text-asphalt">₱700</p>
                    </div>
                    <button className="btn btn-cta text-sm px-5">Book</button>
                  </div>
                </div>
              </div>

              {/* Floating review card */}
              <div className="absolute bottom-12 right-0 card shadow-float p-3 w-52 z-10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-violet-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">J</div>
                  <div>
                    <p className="text-xs font-bold text-asphalt leading-tight">Jian C.</p>
                    <p className="text-xs text-yellow-500 font-bold">★★★★★</p>
                  </div>
                </div>
                <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
                  &ldquo;Easiest booking I&apos;ve ever done. Showed up and the court was perfect.&rdquo;
                </p>
              </div>

              {/* Floating stat card */}
              <div className="absolute top-6 right-8 card shadow-float px-4 py-3 z-10">
                <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Bookings Today</p>
                <p className="text-2xl font-extrabold text-asphalt leading-tight">247</p>
                <p className="text-xs text-green font-bold mt-0.5">↑ +18% vs last week</p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            STATS BAR
        ═══════════════════════════════════════════ */}
        <section className="border-y border-outline bg-mist">
          <div className="container-page py-8">
            <dl className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 lg:divide-x divide-outline">
              {STATS.map((s) => (
                <div key={s.label} className="flex flex-col items-center lg:items-start lg:px-10 first:lg:pl-0">
                  <dt className="text-3xl font-extrabold text-asphalt tracking-tight">{s.value}</dt>
                  <dd className="text-sm text-on-surface-variant font-medium mt-0.5">{s.label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            COURT DISCOVERY
        ═══════════════════════════════════════════ */}
        <section className="bg-white py-20" id="courts">
          <div className="container-page">
            {/* Section header */}
            <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">
                  Available Now
                </p>
                <h2 className="text-3xl font-extrabold text-asphalt tracking-tight">
                  Courts Near You
                </h2>
              </div>
              <Link
                href="/courts"
                id="view-all-courts"
                className="btn btn-outline text-sm"
              >
                View All Courts →
              </Link>
            </div>

            {/* Filter pills */}
            <div className="mb-8">
              <FilterPills />
            </div>

            {/* Court grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {COURTS.map((court) => (
                <CourtCard key={court.id} court={court} />
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            HOW IT WORKS
        ═══════════════════════════════════════════ */}
        <section className="bg-mist py-24" id="how-it-works">
          <div className="container-page">
            <div className="text-center mb-16">
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Simple Process</p>
              <h2 className="text-3xl font-extrabold text-asphalt tracking-tight">
                Ready to play in 3 steps
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Connector line (desktop only) */}
              <div className="hidden md:block absolute top-14 left-[20%] right-[20%] h-px bg-outline" aria-hidden="true"/>

              {STEPS.map((step) => (
                <div key={step.num} className="flex flex-col items-center text-center relative">
                  {/* Number + icon */}
                  <div className="relative mb-6">
                    <div className="w-28 h-28 rounded-2xl bg-white shadow-card flex flex-col items-center justify-center gap-1 border border-outline">
                      <div className="text-asphalt">{step.icon}</div>
                      <span className="text-xs font-bold tracking-widest text-on-surface-variant">{step.num}</span>
                    </div>
                    {/* Green dot accent */}
                    <span
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-green border-2 border-white"
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-asphalt mb-2">{step.title}</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed max-w-xs">{step.body}</p>
                </div>
              ))}
            </div>

            <div className="text-center mt-14">
              <Link href="/courts" id="how-it-works-cta" className="btn btn-primary px-8 py-4 text-base">
                Find a Court Now →
              </Link>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            PARTNER / OWNER CTA
        ═══════════════════════════════════════════ */}
        <section className="bg-asphalt py-24" id="partner">
          <div className="container-page">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Left */}
              <div>
                <span className="badge" style={{ backgroundColor: '#D1FE0022', color: '#D1FE00', borderColor: '#D1FE0044' }}>
                  For Facility Owners
                </span>
                <h2 className="text-4xl font-extrabold text-white tracking-tight mt-4 leading-tight">
                  List Your Court.<br/>
                  <span style={{ color: '#D1FE00' }}>Grow Your Revenue.</span>
                </h2>
                <p className="text-base text-white/60 mt-4 max-w-md leading-relaxed">
                  Join 200+ facility owners on Pickle All. Get a beautiful booking page,
                  real-time calendar management, and instant payouts — all in one platform.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 mt-8">
                  <Link href="/login?mode=register" id="partner-cta-primary" className="btn btn-cta px-8 py-4 text-base">
                    Partner With Us →
                  </Link>
                  <Link href="/#how-it-works" id="partner-cta-secondary" className="btn px-8 py-4 text-base" style={{ color: 'white', border: '1.5px solid rgba(255,255,255,0.2)' }}>
                    Learn More
                  </Link>
                </div>
              </div>

              {/* Right — feature list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: '📅', title: 'Real-Time Calendar', body: 'Automatic availability sync — no double bookings, ever.' },
                  { icon: '💳', title: 'Instant Payouts', body: 'Earnings deposited the next business day.' },
                  { icon: '📊', title: 'Analytics Dashboard', body: 'Track revenue, occupancy, and player trends.' },
                  { icon: '⭐', title: 'Reviews & Ratings', body: 'Build credibility and attract more players organically.' },
                ].map((f) => (
                  <div
                    key={f.title}
                    className="rounded-xl p-5"
                    style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <span className="text-2xl">{f.icon}</span>
                    <h3 className="text-base font-bold text-white mt-2">{f.title}</h3>
                    <p className="text-sm text-white/50 mt-1 leading-relaxed">{f.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            FOOTER
        ═══════════════════════════════════════════ */}
        <footer className="bg-white border-t border-outline">
          <div className="container-page py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
              {/* Brand */}
              <div className="col-span-2 md:col-span-1">
                <div className="flex items-center gap-1.5 mb-3">
                  <span className="flex items-center justify-center w-7 h-7 rounded-md bg-asphalt" aria-hidden="true">
                    <svg width="15" height="15" viewBox="0 0 18 18" fill="none">
                      <rect x="2" y="2" width="14" height="14" rx="1" stroke="#D1FE00" strokeWidth="1.5"/>
                      <line x1="9" y1="2" x2="9" y2="16" stroke="#D1FE00" strokeWidth="1.5"/>
                      <line x1="2" y1="9" x2="16" y2="9" stroke="#D1FE00" strokeWidth="1"/>
                    </svg>
                  </span>
                  <span className="font-extrabold text-asphalt">PickleAll</span>
                </div>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  The Philippines&apos; premier pickleball court booking platform.
                </p>
              </div>

              {[
                {
                  heading: 'Platform',
                  links: [
                    { label: 'Browse Courts', href: '/courts' },
                    { label: 'How it Works', href: '/#how-it-works' },
                    { label: 'Pricing', href: '/pricing' },
                  ],
                },
                {
                  heading: 'For Owners',
                  links: [
                    { label: 'Partner With Us', href: '/#partner' },
                    { label: 'Owner Dashboard', href: '/admin' },
                    { label: 'Resources', href: '/resources' },
                  ],
                },
                {
                  heading: 'Company',
                  links: [
                    { label: 'About', href: '/about' },
                    { label: 'Blog', href: '/blog' },
                    { label: 'Contact', href: '/contact' },
                  ],
                },
              ].map((col) => (
                <div key={col.heading}>
                  <p className="text-xs font-bold uppercase tracking-widest text-asphalt mb-4">{col.heading}</p>
                  <ul className="flex flex-col gap-2">
                    {col.links.map((l) => (
                      <li key={l.label}>
                        <Link href={l.href} className="text-sm text-on-surface-variant hover:text-asphalt transition-colors">
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Bottom bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-8 border-t border-outline">
              <p className="text-xs text-on-surface-variant">
                © {new Date().getFullYear()} Pickle All. All rights reserved.
              </p>
              <div className="flex gap-6">
                {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((t) => (
                  <Link key={t} href="#" className="text-xs text-on-surface-variant hover:text-asphalt transition-colors">
                    {t}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </footer>
      </main>
    </>
  )
}
