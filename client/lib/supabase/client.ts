'use client'

import { createBrowserClient as _createBrowserClient } from '@supabase/ssr'

/**
 * Browser-side Supabase client.
 * Use for: auth state, onAuthStateChange, Realtime subscriptions, Storage.
 * For all DB queries, use Drizzle via a Server Component or Route Handler.
 */
export function createBrowserClient() {
  return _createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  )
}
