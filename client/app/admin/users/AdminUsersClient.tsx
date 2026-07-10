'use client'

import { useState } from 'react'
import { Search, Filter, ShieldAlert, ShieldCheck } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'
import type { AdminUser } from '@/lib/db/queries/adminQueries'

type Props = {
  initialUsers: AdminUser[]
}

export default function AdminUsersClient({ initialUsers }: Props) {
  const toast = useToast()
  const [users, setUsers] = useState(initialUsers)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState<string | null>(null)

  // Format date in Asia/Manila
  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat('en-PH', {
      timeZone: 'Asia/Manila',
      dateStyle: 'medium',
    }).format(new Date(date))

  // Filter users by search + role + status
  const filtered = users.filter((u) => {
    const matchesSearch =
      search === '' ||
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.id.toLowerCase().includes(search.toLowerCase())

    const matchesRole = roleFilter === '' || u.role === roleFilter

    const isSuspended = u.suspendedAt !== null
    const matchesStatus =
      statusFilter === '' ||
      (statusFilter === 'active' && !isSuspended) ||
      (statusFilter === 'suspended' && isSuspended)

    return matchesSearch && matchesRole && matchesStatus
  })

  const handleSuspendToggle = async (user: AdminUser) => {
    const isSuspended = user.suspendedAt !== null
    const action = isSuspended ? 'DELETE' : 'POST'

    setLoading(user.id)

    try {
      const res = await fetch(`/api/admin/users/${user.id}/suspend`, {
        method: action,
      })

      if (!res.ok) {
        const data = await res.json()
        toast('Error', data.error ?? 'Failed to update user', 'error')
        return
      }

      // Optimistically update user in the list
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id
            ? { ...u, suspendedAt: isSuspended ? null : new Date() }
            : u,
        ),
      )

      toast(
        isSuspended ? 'User Unsuspended' : 'User Suspended',
        `${user.username} has been ${isSuspended ? 'unsuspended' : 'suspended'}.`,
        'success',
      )
    } catch {
      toast('Error', 'Network error — try again.', 'error')
    } finally {
      setLoading(null)
    }
  }

  const handleRoleChange = async (user: AdminUser, newRole: string) => {
    if (newRole === user.role) return

    setLoading(user.id)
    try {
      const res = await fetch(`/api/admin/users/${user.id}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })

      if (!res.ok) {
        const data = await res.json()
        toast('Error', data.error ?? 'Failed to update role', 'error')
        return
      }

      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u)),
      )
      toast('Role Updated', `${user.username} is now ${newRole}.`, 'success')
    } catch {
      toast('Error', 'Network error — try again.', 'error')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">User Management</h1>
          <p className="text-on-surface-variant text-sm mt-1">
            {users.length} registered users.
          </p>
        </div>
      </div>

      <div className="card overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-outline flex flex-col md:flex-row gap-4 justify-between items-center bg-surface-low/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={16} />
            <input
              type="text"
              placeholder="Search by username or ID..."
              className="input py-2 pl-9 w-full bg-surface"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-40">
              <select
                className="input py-2 bg-surface appearance-none pr-8 cursor-pointer"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="owner">Owner</option>
                <option value="user">User</option>
              </select>
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" size={14} />
            </div>
            <div className="relative flex-1 md:w-40">
              <select
                className="input py-2 bg-surface appearance-none pr-8 cursor-pointer"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" size={14} />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-surface-low border-b border-outline">
                <th className="p-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">User ID</th>
                <th className="p-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Username</th>
                <th className="p-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Join Date</th>
                <th className="p-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Role</th>
                <th className="p-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-on-surface-variant text-sm font-medium">
                    No users match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((user) => {
                  const isSuspended = user.suspendedAt !== null

                  return (
                    <tr key={user.id} className="hover:bg-surface-low/50 transition-colors">
                      <td className="p-4 text-sm font-mono text-on-surface-variant">
                        {user.id.slice(0, 8)}…
                      </td>
                      <td className="p-4 text-sm font-bold">{user.username}</td>
                      <td className="p-4 text-sm font-medium">{formatDate(user.createdAt)}</td>
                      <td className="p-4">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user, e.target.value)}
                          disabled={loading === user.id}
                          className={`badge cursor-pointer outline-none appearance-none ${
                            user.role === 'admin'
                              ? 'bg-asphalt text-surface'
                              : user.role === 'owner'
                                ? 'bg-primary/20 text-primary'
                                : 'bg-surface-dim text-on-surface'
                          }`}
                        >
                          <option value="user">user</option>
                          <option value="owner">owner</option>
                          <option value="admin">admin</option>
                        </select>
                      </td>
                      <td className="p-4">
                        <span
                          className={`badge ${
                            isSuspended
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                              : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          }`}
                        >
                          {isSuspended ? 'suspended' : 'active'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => handleSuspendToggle(user)}
                            disabled={loading === user.id}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                              isSuspended
                                ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                                : 'text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                            } disabled:opacity-50`}
                            title={isSuspended ? 'Unsuspend User' : 'Suspend User'}
                          >
                            {isSuspended ? (
                              <>
                                <ShieldCheck size={14} /> Unsuspend
                              </>
                            ) : (
                              <>
                                <ShieldAlert size={14} /> Suspend
                              </>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-outline bg-surface-low/30">
          <span className="text-sm text-on-surface-variant font-medium">
            Showing {filtered.length} of {users.length} users
          </span>
        </div>
      </div>
    </div>
  )
}
