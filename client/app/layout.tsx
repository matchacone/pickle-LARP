import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

const jakarta = Plus_Jakarta_Sans({
  variable: '--font-jakarta',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Pickle All — Book Pickleball Courts in the Philippines',
  description:
    'Discover and instantly book pickleball courts near you. Real-time availability, transparent pricing, and zero hassle.',
  keywords: ['pickleball', 'court booking', 'Philippines', 'padel', 'sports'],
  openGraph: {
    title: 'Pickle All — Book Pickleball Courts in the Philippines',
    description: 'Real-time pickleball court booking across the Philippines.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jakarta.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-on-surface">
        {children}
      </body>
    </html>
  )
}
