'use client'

import { useState } from 'react'
import { Search, Filter, Edit2, ShieldAlert, Trash2, Key } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'

export default function UsersPage() {
  const toast = useToast()
  
  const [users] = useState([
    { id: 'usr_001', name: 'Alice Smith', email: 'alice@example.com', joinDate: '2026-01-15', role: 'admin', status: 'active' },
    { id: 'usr_002', name: 'Bob Jones', email: 'bob@example.com', joinDate: '2026-02-20', role: 'user', status: 'active' },
    { id: 'usr_003', name: 'Charlie Court', email: 'charlie@pickle.com', joinDate: '2026-03-10', role: 'owner', status: 'active' },
    { id: 'usr_004', name: 'Diana Prince', email: 'diana@example.com', joinDate: '2026-04-05', role: 'user', status: 'suspended' },
    { id: 'usr_005', name: 'Evan Wright', email: 'evan@example.com', joinDate: '2026-05-12', role: 'user', status: 'active' },
  ])

  const handleAction = (action: string, user: any) => {
    toast(`Action: ${action}`, `Successfully applied ${action} to ${user.name}`, 'success')
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">User Management</h1>
          <p className="text-on-surface-variant text-sm mt-1">View, moderate, and manage platform users.</p>
        </div>
        
        <button className="btn btn-cta">
          Export Users
        </button>
      </div>

      <div className="card overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-outline flex flex-col md:flex-row gap-4 justify-between items-center bg-surface-low/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={16} />
            <input 
              type="text" 
              placeholder="Search by name, email, or ID..." 
              className="input py-2 pl-9 w-full bg-surface"
            />
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-40">
              <select className="input py-2 bg-surface appearance-none pr-8 cursor-pointer">
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="owner">Owner</option>
                <option value="user">User</option>
              </select>
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" size={14} />
            </div>
            <div className="relative flex-1 md:w-40">
              <select className="input py-2 bg-surface appearance-none pr-8 cursor-pointer">
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
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-surface-low border-b border-outline">
                <th className="p-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">User ID</th>
                <th className="p-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">User</th>
                <th className="p-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Join Date</th>
                <th className="p-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Role</th>
                <th className="p-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-surface-low/50 transition-colors">
                  <td className="p-4 text-sm font-mono text-on-surface-variant">{user.id}</td>
                  <td className="p-4">
                    <p className="font-bold text-sm">{user.name}</p>
                    <p className="text-xs text-on-surface-variant">{user.email}</p>
                  </td>
                  <td className="p-4 text-sm font-medium">{user.joinDate}</td>
                  <td className="p-4">
                    <span className={`badge ${
                      user.role === 'admin' ? 'bg-asphalt text-surface' :
                      user.role === 'owner' ? 'bg-primary/20 text-primary' :
                      'bg-surface-dim text-on-surface'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`badge ${
                      user.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleAction('Edit', user)} className="p-2 text-on-surface-variant hover:bg-surface-dim hover:text-on-surface rounded-md transition-colors" title="Edit User">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleAction('Reset Password', user)} className="p-2 text-on-surface-variant hover:bg-surface-dim hover:text-on-surface rounded-md transition-colors" title="Reset Password">
                        <Key size={16} />
                      </button>
                      <button onClick={() => handleAction(user.status === 'active' ? 'Suspend' : 'Unsuspend', user)} className="p-2 text-on-surface-variant hover:bg-orange-100 hover:text-orange-600 rounded-md transition-colors" title={user.status === 'active' ? "Suspend User" : "Unsuspend User"}>
                        <ShieldAlert size={16} />
                      </button>
                      <button onClick={() => handleAction('Delete', user)} className="p-2 text-on-surface-variant hover:bg-red-100 hover:text-red-600 rounded-md transition-colors" title="Delete User">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Mock */}
        <div className="p-4 border-t border-outline flex flex-col sm:flex-row justify-between items-center gap-4 bg-surface-low/30">
          <span className="text-sm text-on-surface-variant font-medium">Showing 1 to 5 of 12,450 users</span>
          <div className="flex gap-1">
            <button className="btn btn-outline py-1 px-3 text-sm disabled:opacity-50" disabled>Prev</button>
            <button className="btn py-1 px-3 text-sm bg-asphalt text-surface">1</button>
            <button className="btn btn-outline py-1 px-3 text-sm bg-surface">2</button>
            <button className="btn btn-outline py-1 px-3 text-sm bg-surface">3</button>
            <span className="px-2 py-1 text-on-surface-variant">...</span>
            <button className="btn btn-outline py-1 px-3 text-sm bg-surface">Next</button>
          </div>
        </div>
      </div>
    </div>
  )
}
