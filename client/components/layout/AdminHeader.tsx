'use client'

import { Bell, Search, Menu, UserCircle } from 'lucide-react'

export default function AdminHeader() {
  return (
    <header className="h-16 bg-surface border-b border-outline flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40 shadow-sm">
      <div className="flex items-center gap-4">
        <button className="md:hidden p-2 text-on-surface-variant hover:bg-surface-low rounded-md">
          <Menu size={20} />
        </button>
        
        <div className="hidden sm:flex relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={16} />
          <input 
            type="text" 
            placeholder="Search users, reports..." 
            className="input py-1.5 pl-9 bg-surface-low border-transparent focus:bg-surface focus:border-outline text-sm w-64 focus:w-80 transition-all rounded-full"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-5">
        <button className="relative p-2 text-on-surface-variant hover:bg-surface-low rounded-full transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-alert-pink rounded-full border-2 border-surface"></span>
        </button>
        
        <div className="h-6 w-px bg-outline"></div>
        
        <button className="flex items-center gap-2 p-1 hover:bg-surface-low rounded-full pr-3 transition-colors">
          <UserCircle size={28} className="text-primary" />
          <div className="hidden sm:flex flex-col items-start text-left">
            <span className="text-sm font-bold leading-tight">Super Admin</span>
            <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">System</span>
          </div>
        </button>
      </div>
    </header>
  )
}
