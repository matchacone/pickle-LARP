import { OwnerDashboardOverview } from '@/components/features/OwnerDashboardOverview'

export const metadata = {
  title: 'Owner Dashboard — Pickle All',
  description: 'Manage your pickleball courts, bookings, and revenue.',
}

export default function OwnerDashboardPage() {
  return (
    <>
      <OwnerDashboardOverview />
    </>
  )
}
