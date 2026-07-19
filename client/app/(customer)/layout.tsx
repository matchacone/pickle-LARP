import Navbar from '@/components/layout/Navbar'
import { ToastProvider } from '@/components/ui/Toast'

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ToastProvider>
      <Navbar />
      {children}
    </ToastProvider>
  )
}
