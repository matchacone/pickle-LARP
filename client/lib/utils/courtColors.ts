/**
 * Deterministic accent color generation from court UUID.
 * Each court gets a consistent, visually distinct color pair
 * without needing a DB column.
 */

const COURT_PALETTES = [
  { accent: '#4F46E5', accentBg: '#EEF2FF' }, // Indigo
  { accent: '#059669', accentBg: '#ECFDF5' }, // Emerald
  { accent: '#D97706', accentBg: '#FFFBEB' }, // Amber
  { accent: '#DC2626', accentBg: '#FEF2F2' }, // Red
  { accent: '#7C3AED', accentBg: '#F5F3FF' }, // Violet
  { accent: '#0369A1', accentBg: '#F0F9FF' }, // Sky
  { accent: '#be185d', accentBg: '#fdf2f8' }, // Pink
  { accent: '#0891b2', accentBg: '#ecfeff' }, // Cyan
  { accent: '#65a30d', accentBg: '#f7fee7' }, // Lime
  { accent: '#9333ea', accentBg: '#faf5ff' }, // Purple
  { accent: '#ea580c', accentBg: '#fff7ed' }, // Orange
  { accent: '#0d9488', accentBg: '#f0fdfa' }, // Teal
] as const

/**
 * Simple hash function that converts a string (UUID) to a stable index.
 */
function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0 // Convert to 32-bit integer
  }
  return Math.abs(hash)
}

/**
 * Returns a deterministic { accent, accentBg } pair for a given court ID.
 */
export function getCourtColors(courtId: string): { accent: string; accentBg: string } {
  const index = hashString(courtId) % COURT_PALETTES.length
  return COURT_PALETTES[index]
}

/**
 * Default images for courts (until Supabase Storage integration).
 * Cycles through available local images based on court ID hash.
 */
const COURT_IMAGES = [
  ['/images/courts/indoor1.png', '/images/courts/indoor2.png', '/images/courts/outdoor1.png'],
  ['/images/courts/outdoor1.png', '/images/courts/indoor1.png', '/images/courts/indoor2.png'],
  ['/images/courts/indoor2.png', '/images/courts/indoor1.png', '/images/courts/outdoor1.png'],
  ['/images/courts/indoor1.png', '/images/courts/outdoor1.png', '/images/courts/indoor2.png'],
  ['/images/courts/outdoor1.png', '/images/courts/indoor2.png', '/images/courts/indoor1.png'],
  ['/images/courts/indoor2.png', '/images/courts/outdoor1.png', '/images/courts/indoor1.png'],
]

/**
 * Returns a deterministic set of placeholder images for a given court ID.
 */
export function getCourtImages(courtId: string): string[] {
  const index = hashString(courtId) % COURT_IMAGES.length
  return COURT_IMAGES[index]
}
