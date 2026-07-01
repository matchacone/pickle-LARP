'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 16)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

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
            Pickle<span className="text-primary">All</span>
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

        {/* ── Auth buttons ── */}
        <div className="hidden md:flex items-center gap-2">
          <Link href="/login" className="btn btn-ghost text-sm">
            Log in
          </Link>
          <Link href="/login?mode=register" className="btn btn-primary text-sm">
            Join Free
          </Link>
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
          <div className="flex gap-2 pt-2">
            <Link href="/login" className="btn btn-outline flex-1 justify-center text-sm">
              Log in
            </Link>
            <Link href="/login?mode=register" className="btn btn-primary flex-1 justify-center text-sm">
              Join Free
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
