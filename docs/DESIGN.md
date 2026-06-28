---
name: Kinetic Court
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#444933'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#757a60'
  outline-variant: '#c5c9ac'
  surface-tint: '#526600'
  primary: '#526600'
  on-primary: '#ffffff'
  primary-container: '#d1fe00'
  on-primary-container: '#5d7300'
  inverse-primary: '#afd500'
  secondary: '#5f5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e5e2e1'
  on-secondary-container: '#656464'
  tertiary: '#585f6c'
  on-tertiary: '#ffffff'
  tertiary-container: '#e6edfd'
  on-tertiary-container: '#646b79'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c8f300'
  primary-fixed-dim: '#afd500'
  on-primary-fixed: '#171e00'
  on-primary-fixed-variant: '#3d4c00'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474646'
  tertiary-fixed: '#dce2f3'
  tertiary-fixed-dim: '#c0c7d6'
  on-tertiary-fixed: '#151c27'
  on-tertiary-fixed-variant: '#404754'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
  court-green: '#D1FE00'
  asphalt: '#121212'
  mist: '#F3F4F6'
  alert-pink: '#E85CBA'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style

This design system establishes a high-performance, athletic aesthetic that balances the raw energy of sports with the refined precision of modern SaaS. Taking cues from professional lifestyle platforms, the interface prioritizes extreme clarity, generous whitespace, and a "less is more" philosophy to reduce cognitive load during the booking process.

The style is **Modern Athletic Minimalism**. It utilizes a sophisticated interplay of high-contrast neutrals and a singular, high-octane accent color to guide the eye. Visual interest is generated through purposeful depth, glassmorphism in fixed navigation elements, and a rhythmic use of geometric shapes that echo the lines of a pickleball court. The result is a platform that feels fast, professional, and energetically premium.

## Colors

The palette is anchored by "Pickleball Green" (#D1FE00)—a high-visibility, chartreuse-leaning lime that signifies action and energy. This is balanced against a deep "Asphalt" black to maintain professional authority and readability.

- **Primary:** Use exclusively for primary actions, success states, and key highlights.
- **Secondary (Neutral-Dark):** Used for primary text and heavy structural elements to provide a grounded, high-contrast feel.
- **Surface:** The background should remain predominantly white (#FFFFFF) or very light grey (#F9FAFB) to ensure a clean, "airy" lifestyle feel.
- **Accent:** A soft lavender and vibrant pink (derived from the reference) are used sparingly for promotional badges or secondary notifications to prevent the UI from feeling monochromatic.

## Typography

We use **Plus Jakarta Sans** for its geometric clarity and friendly but professional posture. The type system relies on significant weight contrast—pairing extra-bold headlines with regular weight body copy—to create a clear information hierarchy.

Tighten letter-spacing on larger headlines to create a "compact" and impactful editorial look. For smaller labels and badges, use semi-bold or bold weights with a slight increase in tracking to ensure legibility during quick scanning.

## Layout & Spacing

This design system utilizes a **12-column fixed-center grid** for desktop and a **fluid single-column grid** for mobile. The spacing rhythm is strictly based on an 8px base unit.

- **Desktop:** 1280px max-width container with 48px margins.
- **Mobile:** 16px side margins with vertical stacking.
- **Negative Space:** Use generous vertical padding (80px - 120px) between major sections to mimic the premium, uncluttered feel of luxury lifestyle brands.
- **Alignment:** All elements should align to the hard edges of the grid, avoiding centered text for body blocks to maintain a modern, "structured" look.

## Elevation & Depth

Hierarchy is established through a combination of **Glassmorphism** and **Tonal Layering**:

1.  **Sticky Elements:** Navigation bars and floating action footers use a "Glass" effect: 70% opacity white background with a 20px backdrop-blur and a subtle 1px inner border (#FFFFFF 20%).
2.  **Base Layer:** Surfaces are flat white or light grey.
3.  **Floating Cards:** Use "Ambient Shadows"—very soft, large-radius shadows (0px 12px 32px rgba(0,0,0, 0.04))—to suggest depth without creating visual clutter.
4.  **Active States:** When an element is pressed or active, it should "sink" (shadow removal) or gain a high-contrast border of the primary color.

## Shapes

The shape language is "Soft-Geometric." We avoid hyper-roundness (pills) for structural elements to maintain a professional "court" feel, preferring 8px to 16px radii.

- **Standard Radius:** 8px for small components like inputs and buttons.
- **Large Radius:** 16px for cards and image containers.
- **Images:** Always featured with rounded corners and subtle inner shadows to give them a "tucked-in" feel.

## Components

- **Primary Buttons:** High-contrast Asphalt background (#121212) with white text, or Pickleball Green (#D1FE00) with Asphalt text for the "Book Now" CTA. Use 12px vertical padding and bold typography.
- **Inputs:** Minimalist style with a 1px "Mist" border. On focus, the border transitions to Asphalt with a 2px thickness. No shadows on resting state.
- **Cards:** White background, 16px radius, subtle ambient shadow. Use a "Chip" overlay on top-right for pricing or status.
- **Chips/Badges:** Small, all-caps labels with high-contrast backgrounds. Use for court type (e.g., "INDOOR", "CLAY").
- **Sticky Header:** Implement the glassmorphism effect. Keep navigation links simple and monochromatic, leaving the "Join" or "Login" button as the only high-contrast element.
- **Booking Calendar:** Use a clean, non-bordered grid. Selected slots should fill with the Primary Green color, making the availability immediately obvious.