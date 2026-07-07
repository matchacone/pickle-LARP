import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Next.js middleware — runs on every matched request.
 *
 * 1. Refreshes the Supabase session (prevents stale cookies).
 * 2. Protects restricted routes by redirecting unauthenticated users.
 * 3. Redirects authenticated users away from auth pages.
 */

// Routes that require authentication
const PROTECTED_ROUTES = ['/dashboard', '/bookings', '/my-court']
// Routes that require admin role
const ADMIN_ROUTES = ['/admin']
// Routes that authenticated users should be redirected away from
const AUTH_ROUTES = ['/login', '/register', '/forgot-password']

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  // Create a Supabase client that can read/write cookies in the middleware context
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Set cookies on the request (for downstream server components)
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          // Also set on the response (so the browser receives them)
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // IMPORTANT: Do not use getSession() — it reads from cookies without
  // validation. getUser() makes a request to the Supabase Auth server
  // and is the only safe way to verify the session.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // ── Redirect authenticated users away from auth pages ──────────────────
  if (user && AUTH_ROUTES.some((route) => pathname.startsWith(route))) {
    const url = request.nextUrl.clone()
    url.pathname = '/courts'
    return NextResponse.redirect(url)
  }

  // ── Protect restricted routes ──────────────────────────────────────────
  if (!user && PROTECTED_ROUTES.some((route) => pathname.startsWith(route))) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  // ── Protect admin routes ───────────────────────────────────────────────
  if (ADMIN_ROUTES.some((route) => pathname.startsWith(route))) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('next', pathname)
      return NextResponse.redirect(url)
    }

    // Check admin role via Drizzle query — import dynamically to avoid
    // bundling the full DB client in the middleware edge runtime.
    // Instead, we check the profile role from Supabase user metadata
    // or make a lightweight fetch. For now, we use app_metadata approach.
    //
    // Note: Supabase stores custom claims in app_metadata. If the
    // profiles trigger sets the role, we need to sync it. For a simpler
    // approach, we'll do the admin check in the admin layout instead.
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public folder files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|images/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
