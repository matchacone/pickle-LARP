import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import AvailabilityCalendar from '@/components/features/AvailabilityCalendar'
import ImageCarousel from '@/components/features/ImageCarousel'
import CourtReviews from '@/components/features/CourtReviews'
import { MapPin, Star, CheckCircle2, Navigation, Info, ShieldCheck } from 'lucide-react'
import type { CourtCardData, ReviewData } from '@/components/features/CourtCard'
import { getCourtById } from '@/lib/db/queries/courtQueries'
import { getCourtColors, getCourtImages } from '@/lib/utils/courtColors'
import { createServerClient } from '@/lib/supabase/server'

// ─── Mock court data (fallback when DATABASE_URL is not set) ──────────────────
const MOCK_COURTS: (CourtCardData & { reviews: ReviewData[] })[] = [
  {
    id: '1',
    courtName: 'BGC Sports Hub — Court A',
    description: 'Premium indoor facility with pro-grade lighting, smooth hardwood surface, and climate control. Great for serious play.',
    location: 'Bonifacio Global City, Taguig',
    pricePerHour: 350,
    courtType: 'indoor',
    avgRating: 4.9,
    reviewCount: 128,
    accent: '#4F46E5',
    accentBg: '#EEF2FF',
    amenities: ['Paddle Rental', 'Locker Room', 'Pro Shop', 'Coaching'],
    images: ['/images/courts/indoor1.png', '/images/courts/indoor2.png', '/images/courts/outdoor1.png'],
    reviews: [
      { id: 'r1', author: 'Mark D.', title: null, description: 'Best indoor court in BGC. The lighting is amazing and the surface is perfectly maintained.', createdAt: new Date('2026-06-15') },
      { id: 'r2', author: 'Sarah L.', title: null, description: 'Great facility, though finding parking during peak hours can be tough.', createdAt: new Date('2026-05-20') },
      { id: 'r3', author: 'Alex Wong', title: null, description: 'Superb courts. The AC is a lifesaver on hot afternoons.', createdAt: new Date('2026-05-10') },
      { id: 'r4', author: 'Jessica T.', title: null, description: 'Always my go-to court for weekend games with friends. Clean locker rooms!', createdAt: new Date('2026-04-25') },
      { id: 'r5', author: 'Mike R.', title: null, description: 'Courts are nice but it is a bit pricey compared to others.', createdAt: new Date('2026-04-20') },
      { id: 'r6', author: 'Diana P.', title: null, description: 'Love the online booking system, very seamless experience.', createdAt: new Date('2026-04-15') },
      { id: 'r7', author: 'Kevin S.', title: null, description: 'Solid courts, good bounce, friendly staff.', createdAt: new Date('2026-03-30') },
      { id: 'r8', author: 'Laura M.', title: null, description: 'We had a mini tournament here and everything was perfect.', createdAt: new Date('2026-03-20') },
      { id: 'r9', author: 'Tom H.', title: null, description: 'Great location. Wish they had a bigger pro shop though.', createdAt: new Date('2026-03-10') },
      { id: 'r10', author: 'Nina B.', title: null, description: 'Absolutely love playing here. 10/10 recommend.', createdAt: new Date('2026-02-28') },
      { id: 'r11', author: 'Chris K.', title: null, description: 'Good quality nets and courts. Will be coming back.', createdAt: new Date('2026-02-15') },
      { id: 'r12', author: 'Elena G.', title: null, description: 'First time playing pickleball and the staff here was so helpful!', createdAt: new Date('2026-01-20') },
    ],
  },
  {
    id: '2', courtName: 'Pickleball Manila — Court 3', description: 'Open-air court with a stunning city view.', location: 'Ayala Ave, Makati City', pricePerHour: 280, courtType: 'outdoor', avgRating: 4.7, reviewCount: 94, accent: '#059669', accentBg: '#ECFDF5', amenities: ['Ball Rental', 'Water Station', 'Parking'], images: ['/images/courts/outdoor1.png', '/images/courts/indoor1.png', '/images/courts/indoor2.png'], reviews: [],
  },
  {
    id: '3', courtName: 'The Paddle Club — VIP Court', description: 'The most prestigious court in Metro Manila.', location: 'Eastwood City, Quezon City', pricePerHour: 420, courtType: 'indoor', avgRating: 4.9, reviewCount: 211, accent: '#D97706', accentBg: '#FFFBEB', amenities: ['Paddle Rental', 'Café', 'Coaching', 'Scoreboard', 'Locker Room'], images: ['/images/courts/indoor2.png', '/images/courts/indoor1.png', '/images/courts/outdoor1.png'], reviews: [],
  },
  {
    id: '4', courtName: 'Eastside Courts — Court 2', description: 'Community-friendly outdoor courts.', location: 'Kapitolyo, Pasig City', pricePerHour: 250, courtType: 'outdoor', avgRating: 4.6, reviewCount: 67, accent: '#DC2626', accentBg: '#FEF2F2', amenities: ['Ball Rental', 'Parking'], images: ['/images/courts/outdoor1.png', '/images/courts/indoor2.png', '/images/courts/indoor1.png'], reviews: [],
  },
  {
    id: '5', courtName: 'Smash & Rally Hub', description: 'Mid-tier indoor facility with excellent acoustics.', location: 'Mandaluyong City', pricePerHour: 380, courtType: 'indoor', avgRating: 4.8, reviewCount: 156, accent: '#7C3AED', accentBg: '#F5F3FF', amenities: ['Paddle Rental', 'Locker Room', 'Coaching'], images: ['/images/courts/indoor1.png', '/images/courts/outdoor1.png', '/images/courts/indoor2.png'], reviews: [],
  },
  {
    id: '6', courtName: 'Green Court Ortigas', description: 'Bright outdoor courts surrounded by lush landscaping.', location: 'Ortigas Center, Pasig', pricePerHour: 300, courtType: 'outdoor', avgRating: 4.7, reviewCount: 89, accent: '#0369A1', accentBg: '#F0F9FF', amenities: ['Scoreboard', 'Water Station', 'Spectator Seating'], images: ['/images/courts/outdoor1.png', '/images/courts/indoor1.png', '/images/courts/indoor2.png'], reviews: [],
  },
  {
    id: '7', courtName: 'Sportivo Arena — PB Court 1', description: 'Professional-grade indoor court used for local tournaments.', location: 'Alabang, Muntinlupa', pricePerHour: 450, courtType: 'indoor', avgRating: 5.0, reviewCount: 42, accent: '#be185d', accentBg: '#fdf2f8', amenities: ['Paddle Rental', 'Pro Shop', 'Coaching', 'Scoreboard', 'Café'], images: ['/images/courts/indoor2.png', '/images/courts/outdoor1.png', '/images/courts/indoor1.png'], reviews: [],
  },
  {
    id: '8', courtName: 'Harbor Court — Bayside', description: 'Scenic outdoor court right by the bay.', location: 'CCP Complex, Pasay', pricePerHour: 220, courtType: 'outdoor', avgRating: 4.5, reviewCount: 53, accent: '#0891b2', accentBg: '#ecfeff', amenities: ['Ball Rental', 'Water Station'], images: ['/images/courts/outdoor1.png', '/images/courts/indoor2.png', '/images/courts/indoor1.png'], reviews: [],
  },
  {
    id: '9', courtName: 'UP ISSI Sports Court', description: 'University-managed indoor court with affordable rates.', location: 'UP Diliman, Quezon City', pricePerHour: 180, courtType: 'indoor', avgRating: 4.4, reviewCount: 38, accent: '#65a30d', accentBg: '#f7fee7', amenities: ['Parking', 'Water Station'], images: ['/images/courts/indoor1.png', '/images/courts/indoor2.png', '/images/courts/outdoor1.png'], reviews: [],
  },
]

// ─── Data fetching ────────────────────────────────────────────────────────────
type CourtWithReviews = CourtCardData & { reviews: ReviewData[] }

async function getCourtData(id: string): Promise<CourtWithReviews | null> {
  // If DATABASE_URL is not set, fall back to mock data
  if (!process.env.DATABASE_URL) {
    return MOCK_COURTS.find((c) => c.id === id) ?? null
  }

  try {
    const court = await getCourtById(id)
    if (!court) {
      // Try mock data as last resort (for numeric IDs during transition)
      return MOCK_COURTS.find((c) => c.id === id) ?? null
    }
    return court
  } catch {
    console.error(`[CourtDetailPage] Database query failed for court ${id}, using mock data`)
    return MOCK_COURTS.find((c) => c.id === id) ?? null
  }
}

// ─── Metadata ─────────────────────────────────────────────────────────────────
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params
  const court = await getCourtData(resolvedParams.id)
  
  if (!court) {
    return { title: 'Court Not Found' }
  }

  return {
    title: `${court.courtName} — PickleAll`,
    description: court.description,
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function CourtDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const court = await getCourtData(resolvedParams.id)

  if (!court) {
    notFound()
  }

  // Fetch current user (nullable for guests)
  let currentUserId: string | null = null
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    currentUserId = user?.id ?? null
  } catch {
    // Guest — no session
  }

  // Resolve display properties
  const colors = court.accent && court.accentBg
    ? { accent: court.accent, accentBg: court.accentBg }
    : getCourtColors(court.id)
  const images = court.images ?? getCourtImages(court.id)
  const ratingDisplay = court.avgRating > 0 ? court.avgRating.toFixed(1) : 'New'

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-white">
        {/* ═══════════════════════════════════════════
            HERO
        ═══════════════════════════════════════════ */}
        <section className="relative bg-asphalt pt-20 pb-16 overflow-hidden">
          {/* Background decorations */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            {/* Dynamic accent color based on court */}
            <div
              className="absolute -right-24 top-0 bottom-0 w-80 opacity-20"
              style={{
                background: `linear-gradient(135deg, ${colors.accent} 0%, transparent 100%)`,
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
          </div>

          <div className="container-page relative z-10">
            <div className="max-w-4xl mx-auto flex flex-col gap-6">
              
              {/* Badges */}
              <div className="flex gap-2">
                {court.courtType && (
                  <span className="badge bg-primary text-asphalt font-bold border-none uppercase tracking-widest text-[10px]">
                    {court.courtType}
                  </span>
                )}
                <span className="badge bg-white/10 text-white border-none text-[10px] uppercase font-bold tracking-widest flex items-center gap-1">
                  <Star size={10} className="text-yellow-400 fill-current" />
                  {ratingDisplay} ({court.reviewCount} Reviews)
                </span>
              </div>

              {/* Title */}
              <div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.08] tracking-tight">
                  {court.courtName}
                </h1>
                <div className="flex flex-wrap items-center gap-4 mt-4 text-white/70">
                  {court.location && (
                    <>
                      <span className="flex items-center gap-1.5 text-sm font-medium">
                        <MapPin size={16} />
                        {court.location}
                      </span>
                      <span className="text-white/30">•</span>
                    </>
                  )}
                  <span className="flex items-center gap-1.5 text-sm font-medium">
                    <span className="text-primary font-bold">₱{court.pricePerHour}</span> / hr
                  </span>
                </div>
              </div>

              {/* Image Carousel */}
              <div className="mt-4">
                <ImageCarousel images={images} courtName={court.courtName} />
              </div>

            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            CONTENT
        ═══════════════════════════════════════════ */}
        <section className="container-page py-12 md:py-16">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
              
              {/* LEFT COLUMN: Details */}
              <div className="w-full lg:w-7/12 flex flex-col gap-12">
                
                {/* About */}
                <div>
                  <h2 className="text-2xl font-bold text-asphalt mb-4">About this court</h2>
                  <p className="text-base text-on-surface-variant leading-relaxed">
                    {court.description}
                  </p>
                  <p className="text-base text-on-surface-variant leading-relaxed mt-4">
                    Whether you are organizing a casual game with friends or a competitive match, 
                    this facility provides an excellent environment. Book your slot in advance to 
                    secure your playtime.
                  </p>
                </div>

                {/* Amenities */}
                {court.amenities.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold text-asphalt mb-4">Amenities</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-2">
                      {court.amenities.map((amenity) => (
                        <div key={amenity} className="flex items-center gap-2">
                          <CheckCircle2 size={18} className="text-primary flex-shrink-0" />
                          <span className="text-sm font-semibold text-on-surface-variant">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Rules & Info */}
                <div className="bg-mist rounded-2xl p-6 border border-outline-variant">
                  <h3 className="text-sm font-bold text-asphalt uppercase tracking-widest flex items-center gap-2 mb-4">
                    <Info size={16} />
                    Good to Know
                  </h3>
                  <ul className="space-y-3 text-sm text-on-surface-variant">
                    <li className="flex items-start gap-2">
                      <span className="text-asphalt font-bold mt-0.5">•</span>
                      <span>Please arrive 10 minutes before your scheduled time.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-asphalt font-bold mt-0.5">•</span>
                      <span>Non-marking athletic shoes are required on the court surface.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-asphalt font-bold mt-0.5">•</span>
                      <span>Cancellations must be made at least 24 hours in advance for a full refund.</span>
                    </li>
                  </ul>
                </div>

                {/* Reviews */}
                <CourtReviews reviews={court.reviews} avgRating={court.avgRating} reviewCount={court.reviewCount} courtId={court.id} currentUserId={currentUserId} />

              </div>

              {/* RIGHT COLUMN: Booking Widget */}
              <div className="w-full lg:w-5/12">
                <div className="sticky top-24">
                  <AvailabilityCalendar 
                    courtId={court.id} 
                    pricePerHour={court.pricePerHour} 
                  />

                  <div className="mt-6 flex items-start gap-3 p-4 bg-surface-container rounded-xl">
                    <ShieldCheck size={20} className="text-asphalt flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-asphalt">Secure Booking</h4>
                      <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                        Your payment and booking details are encrypted and securely processed.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            BOTTOM CTA
        ═══════════════════════════════════════════ */}
        <section className="bg-mist border-t border-outline">
          <div className="container-page py-14 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-lg text-center md:text-left">
              <h2 className="text-2xl font-extrabold text-asphalt tracking-tight leading-tight">
                Need directions?
              </h2>
              <p className="mt-2 text-base text-on-surface-variant">
                Open {court.courtName} in your preferred navigation app.
              </p>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <button className="btn btn-outline text-sm px-6 py-3 flex items-center gap-2">
                <Navigation size={16} />
                Open in Maps
              </button>
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
