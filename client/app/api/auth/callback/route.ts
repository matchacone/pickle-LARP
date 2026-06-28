import { createServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Supabase OAuth callback handler.
 * Called after Google OAuth redirect — exchanges the one-time code for a session.
 * Also used as the email confirmation redirect target.
 *
 * Registered in Supabase Dashboard → Auth → Redirect URLs:
 *   http://localhost:3000/api/auth/callback
 *   https://<your-domain>/api/auth/callback
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // Allow the caller to specify a post-auth redirect (e.g. ?next=/update-password)
  const next = searchParams.get('next') ?? '/courts'

  if (code) {
    const supabase = await createServerClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Something went wrong — send back to login with a descriptive error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
