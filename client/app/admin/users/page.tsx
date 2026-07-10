import { getAllUsers } from '@/lib/db/queries/adminQueries'
import AdminUsersClient from './AdminUsersClient'

export default async function UsersPage() {
  const users = await getAllUsers()

  return <AdminUsersClient initialUsers={users} />
}
