'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Calendar, MapPin, Settings, LogOut, Moon, Sun } from 'lucide-react'
import { useState, useEffect } from 'react'

export function OwnerSidebar() {
  const pathname = usePathname()
  const [isDarkMode, setIsDarkMode] = useState(false)

  // Optional: Actually toggle a dark class on the HTML body if you add dark mode CSS later
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  const navLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Bookings', href: '/bookings', icon: Calendar },
    { name: 'My Courts', href: '/my-courts', icon: MapPin },
    { name: 'Settings', href: '/settings', icon: Settings },
  ]

  return (
    <aside className="w-64 bg-surface border-r border-outline flex flex-col h-screen sticky top-0 flex-shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-outline">
        <Link href="/" className="flex items-center gap-1.5 flex-shrink-0">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-asphalt" aria-hidden="true">
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
      </div>

      <nav className="flex-1 p-4 flex flex-col gap-1.5">
        {navLinks.map((link) => {
          const isActive = pathname === link.href || pathname?.startsWith(`${link.href}/`)
          const Icon = link.icon

          return (
            <Link 
              key={link.name} 
              href={link.href} 
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold transition-colors ${
                isActive 
                  ? 'bg-asphalt/5 text-asphalt font-bold' 
                  : 'text-on-surface-variant hover:bg-mist hover:text-asphalt'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-primary' : ''} />
              {link.name}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-outline flex flex-col gap-2">
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="flex items-center justify-between px-3 py-2 w-full rounded-lg text-on-surface-variant hover:bg-mist hover:text-asphalt font-semibold transition-colors"
        >
          <div className="flex items-center gap-3">
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </div>
          <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${isDarkMode ? 'bg-primary' : 'bg-outline-strong'}`}>
            <div className={`w-3 h-3 rounded-full bg-white transition-transform ${isDarkMode ? 'translate-x-4' : 'translate-x-0'}`} />
          </div>
        </button>

        <button className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-on-surface-variant hover:bg-red-50 hover:text-red-600 font-semibold transition-colors">
          <LogOut size={20} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
