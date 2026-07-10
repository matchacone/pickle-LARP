/**
 * Admin authentication helper — DRY utility for admin Route Handlers.
 *
 * Verifies Supabase session + admin role via Drizzle profile lookup.
 * Returns the authenticated user and profile, or a ready-to-return Response.
 */

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { profiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { createServerClient } from '@/lib/supabase/server'
import type { User } from '@supabase/supabase-js'

type AdminAuthSuccess = {
  user: User
  profile: { id: string; role: string }
}

type AdminAuthResult =
  | { ok: true; data: AdminAuthSuccess }
  | { ok: false; response: NextResponse }

/**
 * Checks that the request is from an authenticated admin user.
 * Returns { ok: true, data } on success, or { ok: false, response } with
 * a ready-to-return 401/403 NextResponse on failure.
 */
export async function requireAdmin(): Promise<AdminAuthResult> {
  const supabase = await createServerClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 },
      ),
    }
  }

  const [profile] = await db
    .select({ id: profiles.id, role: profiles.role })
    .from(profiles)
    .where(eq(profiles.id, user.id))

  if (!profile || profile.role !== 'admin') {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Admin access required', code: 'FORBIDDEN' },
        { status: 403 },
      ),
    }
  }

  return { ok: true, data: { user, profile } }
}
