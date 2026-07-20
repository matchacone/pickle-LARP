'use client'

import { useEffect, useState, useTransition } from 'react'
import Link from 'next/link'
import { Menu, X, LogOut, User as UserIcon, LayoutDashboard } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { logout } from '@/app/actions/auth-actions'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const { user, role, loading: authLoading } = useAuth()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 16)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // Close user menu when clicking outside
  useEffect(() => {
    if (!userMenuOpen) return
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('#user-menu-container')) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [userMenuOpen])

  const handleLogout = () => {
    startTransition(() => {
      logout()
    })
  }

  // User initial for avatar
  const userInitial = user?.email?.[0]?.toUpperCase() ?? '?'
  const userEmail = user?.email ?? ''

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 backdrop-blur-xl border-b border-outline shadow-float'
          : 'bg-transparent'
      }`}
    >
      <nav className="container-page flex items-center justify-between h-16">
        {/* ── Logo ── */}
        <Link href="/" className="flex items-center gap-1.5 flex-shrink-0">
          {/* Court icon */}
          <span
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-asphalt"
            aria-hidden="true"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect x="2" y="2" width="14" height="14" rx="1" stroke="#D1FE00" strokeWidth="1.5"/>
              <line x1="9" y1="2" x2="9" y2="16" stroke="#D1FE00" strokeWidth="1.5"/>
              <line x1="2" y1="9" x2="16" y2="9" stroke="#D1FE00" strokeWidth="1"/>
            </svg>
          </span>
          <span className="text-lg font-extrabold tracking-tight text-asphalt">
            Pick-<span className="text-primary">All</span>
          </span>
        </Link>

        {/* ── Desktop nav links ── */}
        <div className="hidden md:flex items-center gap-8">
          {[
            { label: 'Courts', href: '/courts' },
            { label: 'How it Works', href: '/#how-it-works' },
            { label: 'For Owners', href: '/#partner' },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-on-surface-variant hover:text-asphalt transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* ── Auth section (desktop) ── */}
        <div className="hidden md:flex items-center gap-2">
          {authLoading ? (
            // Skeleton while loading auth state to prevent layout shift
            <div className="w-8 h-8 rounded-full bg-mist animate-pulse" />
          ) : user ? (
            // ── Logged in: user menu ──
            <div id="user-menu-container" className="relative">
              <button
                id="user-menu-button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-mist transition-colors"
                aria-haspopup="menu"
                aria-expanded={userMenuOpen}
              >
                <span className="w-8 h-8 rounded-full bg-asphalt text-green text-sm font-bold flex items-center justify-center">
                  {userInitial}
                </span>
              </button>

              {userMenuOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lift border border-outline z-50 overflow-hidden"
                  role="menu"
                >
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-outline">
                    <p className="text-sm font-bold text-asphalt truncate">{userEmail}</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">Signed in</p>
                  </div>

                  {/* Menu items */}
                  <div className="py-1">
                    {(role === 'admin' || role === 'owner') && (
                      <Link
                        href={role === 'admin' ? '/admin/dashboard' : '/dashboard'}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-on-surface hover:bg-mist transition-colors"
                        role="menuitem"
                      >
                        <LayoutDashboard size={16} className="text-on-surface-variant" />
                        Dashboard
                      </Link>
                    )}
                    <Link
                      href="/my-bookings"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-on-surface hover:bg-mist transition-colors"
                      role="menuitem"
                    >
                      <UserIcon size={16} className="text-on-surface-variant" />
                      My Bookings
                    </Link>
                  </div>

                  {/* Logout */}
                  <div className="border-t border-outline py-1">
                    <button
                      onClick={handleLogout}
                      disabled={isPending}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-semibold text-on-surface hover:bg-mist transition-colors disabled:opacity-50"
                      role="menuitem"
                    >
                      <LogOut size={16} className="text-on-surface-variant" />
                      {isPending ? 'Signing out…' : 'Sign Out'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // ── Not logged in: auth buttons ──
            <>
              <Link href="/login" className="btn btn-ghost text-sm">
                Log in
              </Link>
              <Link href="/login?mode=register" className="btn btn-primary text-sm">
                Join Free
              </Link>
            </>
          )}
        </div>

        {/* ── Mobile hamburger ── */}
        <button
          id="mobile-menu-button"
          className="md:hidden flex items-center justify-center p-2 rounded-lg hover:bg-mist transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen
            ? <X size={20} className="text-asphalt" />
            : <Menu size={20} className="text-asphalt" />}
        </button>
      </nav>

      {/* ── Mobile menu ── */}
      {menuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-b border-outline px-4 py-4 flex flex-col gap-2">
          {[
            { label: 'Courts', href: '/courts' },
            { label: 'How it Works', href: '/#how-it-works' },
            { label: 'For Owners', href: '/#partner' },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-on-surface-variant hover:text-asphalt py-2 border-b border-outline last:border-0"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          {!authLoading && user ? (
            // ── Mobile: logged in ──
            <div className="flex flex-col gap-2 pt-2">
              <div className="flex items-center gap-3 px-2 py-2">
                <span className="w-8 h-8 rounded-full bg-asphalt text-green text-sm font-bold flex items-center justify-center flex-shrink-0">
                  {userInitial}
                </span>
                <span className="text-sm font-semibold text-asphalt truncate">{userEmail}</span>
              </div>
              {(role === 'admin' || role === 'owner') && (
                <Link
                  href={role === 'admin' ? '/admin/dashboard' : '/dashboard'}
                  onClick={() => setMenuOpen(false)}
                  className="btn btn-outline flex-1 justify-center text-sm"
                >
                  Dashboard
                </Link>
              )}
              <button
                onClick={() => { handleLogout(); setMenuOpen(false) }}
                disabled={isPending}
                className="btn btn-ghost flex-1 justify-center text-sm"
              >
                {isPending ? 'Signing out…' : 'Sign Out'}
              </button>
            </div>
          ) : !authLoading ? (
            // ── Mobile: not logged in ──
            <div className="flex gap-2 pt-2">
              <Link href="/login" className="btn btn-outline flex-1 justify-center text-sm">
                Log in
              </Link>
              <Link href="/login?mode=register" className="btn btn-primary flex-1 justify-center text-sm">
                Join Free
              </Link>
            </div>
          ) : null}
        </div>
      )}
    </header>
  )
}
