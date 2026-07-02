import { OwnerBookingsTable } from '@/components/features/OwnerBookingsTable'

export const metadata = {
  title: 'Bookings History — Pickle All',
  description: 'View all historical court bookings.',
}

export default function BookingsPage() {
  return (
    <>
      <OwnerBookingsTable />
    </>
  )
}
