'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  Flag, 
  Briefcase,
  LogOut
} from 'lucide-react'

export default function AdminSidebar() {
  const pathname = usePathname()
  
  const navItems = [
    { name: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'User Management', href: '/admin/users', icon: Users },
    { name: 'User Reports', href: '/admin/reports', icon: Flag },
    { name: 'Applications', href: '/admin/applications', icon: Briefcase },
  ]

  return (
    <aside className="w-64 bg-surface border-r border-outline hidden md:flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-outline">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-asphalt text-surface rounded-md flex items-center justify-center font-black text-xl leading-none">
            P
          </div>
          <span className="font-extrabold tracking-tight text-xl">Admin<span className="text-primary">Panel</span></span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <div className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-4 px-3 mt-4">
          Core
        </div>
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          const Icon = item.icon
          
          return (
            <Link 
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md font-semibold text-sm transition-colors ${
                isActive 
                  ? 'bg-asphalt text-surface shadow-sm' 
                  : 'text-on-surface hover:bg-surface-low'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-green-400' : 'text-on-surface-variant'} />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-outline">
        <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-md font-semibold text-sm text-on-surface hover:bg-surface-low transition-colors">
          <LogOut size={18} className="text-on-surface-variant" />
          Exit Admin
        </Link>
      </div>
    </aside>
  )
}
