'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  Flag, 
  Briefcase,
  Building2,
  Package,
  LogOut
} from 'lucide-react'

export default function AdminSidebar() {
  const pathname = usePathname()
  
  const coreItems = [
    { name: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'User Management', href: '/admin/users', icon: Users },
    { name: 'User Reports', href: '/admin/reports', icon: Flag },
    { name: 'Applications', href: '/admin/applications', icon: Briefcase },
  ]

  const managementItems = [
    { name: 'Courts', href: '/admin/courts', icon: Building2 },
    { name: 'Items & Equipment', href: '/admin/items', icon: Package },
  ]

  const renderNavItem = (navItem: { name: string; href: string; icon: React.ComponentType<{ size?: number; className?: string }> }) => {
    const isActive = pathname.startsWith(navItem.href)
    const Icon = navItem.icon
    
    return (
      <Link 
        key={navItem.href}
        href={navItem.href}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-md font-semibold text-sm transition-colors ${
          isActive 
            ? 'bg-asphalt text-surface shadow-sm' 
            : 'text-on-surface hover:bg-surface-low'
        }`}
      >
        <Icon size={18} className={isActive ? 'text-green-400' : 'text-on-surface-variant'} />
        {navItem.name}
      </Link>
    )
  }

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
        {coreItems.map(renderNavItem)}

        <div className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-4 px-3 mt-8">
          Management
        </div>
        {managementItems.map(renderNavItem)}
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
