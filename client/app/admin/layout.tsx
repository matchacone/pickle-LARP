import AdminSidebar from '@/components/layout/AdminSidebar'
import AdminHeader from '@/components/layout/AdminHeader'
import { ToastProvider } from '@/components/ui/Toast'

export const metadata = {
  title: 'Admin Dashboard | Pickle All',
  description: 'Platform administration and moderation panel.',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-surface-low text-on-surface font-sans">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <AdminHeader />
          <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  )
}
