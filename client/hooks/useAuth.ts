'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

/**
 * Lightweight client-side auth hook.
 *
 * Returns the current Supabase user and a loading state.
 * Listens to onAuthStateChange for cross-tab sync (login/logout
 * in another tab is reflected immediately).
 *
 * Role checking is done server-side (middleware / layout) — this hook
 * intentionally does NOT fetch the profile role to keep it simple.
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createBrowserClient()

    const fetchRole = async (currentUser: User | null) => {
      if (!currentUser) {
        setRole(null)
        return
      }
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', currentUser.id)
        .single()
      
      setRole(data?.role ?? null)
    }

    // Initial check
    supabase.auth.getUser().then(({ data: { user: currentUser } }) => {
      setUser(currentUser)
      if (currentUser) {
        fetchRole(currentUser).finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    // Listen for auth state changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser) {
        setLoading(true)
        fetchRole(currentUser).finally(() => setLoading(false))
      } else {
        setRole(null)
        setLoading(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return { user, role, loading }
}
