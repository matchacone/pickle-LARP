import { getAllCourtsAdmin, getAllItems } from '@/lib/db/queries/adminQueries'
import AdminCourtsClient from './AdminCourtsClient'

export default async function AdminCourtsPage() {
  const [courts, items] = await Promise.all([getAllCourtsAdmin(), getAllItems()])

  return <AdminCourtsClient initialCourts={courts} allItems={items} />
}
