import Link from 'next/link'
import { MapPin } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
export type MockCourt = {
  id: string
  courtName: string
  description: string
  location: string
  pricePerHour: number
  courtType: 'indoor' | 'outdoor'
  rating: number
  reviewCount: number
  amenities: string[]
  accent: string
  accentBg: string
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function CourtTypeBadge({ type }: { type: 'indoor' | 'outdoor' }) {
  return (
    <span className={type === 'indoor' ? 'badge badge-indoor' : 'badge badge-outdoor'}>
      {type === 'indoor' ? '🏢 Indoor' : '☀️ Outdoor'}
    </span>
  )
}

// ─── CourtCard ────────────────────────────────────────────────────────────────
export default function CourtCard({ court }: { court: MockCourt }) {
  return (
    <article
      className="card group overflow-hidden flex flex-col hover:-translate-y-1 transition-transform duration-200"
      aria-label={court.courtName}
    >
      {/* ── Geometric art thumbnail ─────────────────── */}
      <div
        className="relative h-48 flex items-end p-4 flex-shrink-0"
        style={{ backgroundColor: court.accentBg }}
      >
        {/* Court line decorations */}
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          {/* Outer rectangle */}
          <div
            className="absolute inset-5 rounded-md opacity-20"
            style={{ border: `2.5px solid ${court.accent}` }}
          />
          {/* Center vertical line */}
          <div
            className="absolute left-1/2 top-5 bottom-5 w-px opacity-20"
            style={{ backgroundColor: court.accent }}
          />
          {/* Center horizontal line */}
          <div
            className="absolute left-5 right-5 top-1/2 h-px opacity-20"
            style={{ backgroundColor: court.accent }}
          />
          {/* Kitchen box — top */}
          <div
            className="absolute left-5 right-5 top-5 opacity-10"
            style={{
              height: '28%',
              borderBottom: `2px solid ${court.accent}`,
            }}
          />
          {/* Kitchen box — bottom */}
          <div
            className="absolute left-5 right-5 bottom-5 opacity-10"
            style={{
              height: '28%',
              borderTop: `2px solid ${court.accent}`,
            }}
          />
          {/* Accent circle */}
          <div
            className="absolute top-3 right-3 w-12 h-12 rounded-full opacity-15"
            style={{ backgroundColor: court.accent }}
          />
          {/* Pickleball dot */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full opacity-40"
            style={{ backgroundColor: court.accent }}
          />
        </div>

        {/* Price chip — top-left */}
        <div className="absolute top-3 left-3 bg-white rounded-lg px-3 py-1.5 shadow-float">
          <span className="text-sm font-extrabold text-asphalt">
            ₱{court.pricePerHour.toLocaleString()}
            <span className="text-xs font-medium text-on-surface-variant">/hr</span>
          </span>
        </div>

        {/* Type badge — bottom-left */}
        <CourtTypeBadge type={court.courtType} />
      </div>

      {/* ── Card body ───────────────────────────────── */}
      <div className="p-5 flex flex-col flex-1">
        {/* Name */}
        <h3 className="font-bold text-asphalt text-base leading-tight line-clamp-1">
          {court.courtName}
        </h3>

        {/* Location */}
        <p className="text-sm text-on-surface-variant mt-1 flex items-center gap-1.5">
          <MapPin size={12} aria-hidden="true" />
          {court.location}
        </p>

        {/* Description */}
        {court.description && (
          <p className="text-sm text-on-surface-variant mt-2 line-clamp-2 leading-relaxed">
            {court.description}
          </p>
        )}

        {/* Rating */}
        <div className="flex items-center gap-1.5 mt-3">
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-md"
            style={{ backgroundColor: '#D1FE00', color: '#121212' }}
          >
            ★ {court.rating.toFixed(1)}
          </span>
          <span className="text-xs text-on-surface-variant">
            {court.reviewCount} review{court.reviewCount !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Amenity chips */}
        {court.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {court.amenities.slice(0, 3).map((a) => (
              <span
                key={a}
                className="text-xs font-semibold px-2 py-0.5 rounded-full bg-mist text-on-surface-variant"
              >
                {a}
              </span>
            ))}
            {court.amenities.length > 3 && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-mist text-on-surface-variant">
                +{court.amenities.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* CTA */}
        <div className="flex gap-2 mt-auto pt-4">
          <Link
            href={`/courts/${court.id}`}
            id={`view-court-${court.id}`}
            className="btn btn-outline flex-1 justify-center text-sm"
          >
            View Details
          </Link>
          <Link
            href="/login"
            id={`book-court-${court.id}`}
            className="btn btn-cta flex-1 justify-center text-sm"
          >
            Book Now
          </Link>
        </div>
      </div>
    </article>
  )
}
