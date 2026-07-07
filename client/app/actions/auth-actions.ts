'use server'

import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

/**
 * Signs the user out server-side and redirects to the homepage.
 * Called from client components via form action or startTransition.
 */
export async function logout() {
  const supabase = await createServerClient()
  await supabase.auth.signOut()
  redirect('/')
}
