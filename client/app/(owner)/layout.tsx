import { OwnerSidebar } from '@/components/layout/OwnerSidebar'

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-mist flex">
      <OwnerSidebar />
      <main className="flex-1 p-6 md:p-10 overflow-y-auto h-screen">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
