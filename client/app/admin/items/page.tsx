import { getAllItems } from '@/lib/db/queries/adminQueries'
import AdminItemsClient from './AdminItemsClient'

export default async function AdminItemsPage() {
  const items = await getAllItems()

  return <AdminItemsClient initialItems={items} />
}
