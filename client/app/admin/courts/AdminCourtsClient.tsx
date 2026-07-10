'use client'

import { useState } from 'react'
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  MapPin,
  DollarSign,
  Building2,
  Package,
} from 'lucide-react'
import { useToast } from '@/components/ui/Toast'
import type { AdminCourt, AdminItem } from '@/lib/db/queries/adminQueries'

type Props = {
  initialCourts: AdminCourt[]
  allItems: AdminItem[]
}

type CourtFormData = {
  court_name: string
  description: string
  location: string
  price_per_hour: string
  court_type: string
  status: string
}

const EMPTY_FORM: CourtFormData = {
  court_name: '',
  description: '',
  location: '',
  price_per_hour: '',
  court_type: '',
  status: 'active',
}

export default function AdminCourtsClient({ initialCourts, allItems }: Props) {
  const toast = useToast()
  const [courts, setCourts] = useState(initialCourts)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<CourtFormData>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  // Items Management Modal
  const [manageItemsCourtId, setManageItemsCourtId] = useState<string | null>(null)
  const [courtItems, setCourtItems] = useState<{ id: string; itemName: string }[]>([])
  const [itemsLoading, setItemsLoading] = useState(false)

  const filtered = courts.filter(
    (c) =>
      search === '' ||
      c.courtName.toLowerCase().includes(search.toLowerCase()) ||
      (c.location?.toLowerCase().includes(search.toLowerCase()) ?? false),
  )

  const openCreateForm = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  const openEditForm = (c: AdminCourt) => {
    setEditingId(c.id)
    setForm({
      court_name: c.courtName,
      description: c.description ?? '',
      location: c.location ?? '',
      price_per_hour: c.pricePerHour ?? '',
      court_type: c.courtType ?? '',
      status: c.status,
    })
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    const payload: Record<string, unknown> = {
      court_name: form.court_name.trim(),
      description: form.description.trim() || null,
      location: form.location.trim() || null,
      price_per_hour: form.price_per_hour ? Number(form.price_per_hour) : null,
      court_type: form.court_type || null,
      status: form.status,
    }

    try {
      const url = editingId ? `/api/courts/${editingId}` : '/api/courts'
      const method = editingId ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        toast('Error', data.error ?? 'Failed to save court', 'error')
        return
      }

      if (editingId) {
        setCourts((prev) =>
          prev.map((c) =>
            c.id === editingId
              ? { ...c, ...data, itemCount: c.itemCount, bookingCount: c.bookingCount }
              : c,
          ),
        )
        toast('Court Updated', `${data.courtName} has been updated.`, 'success')
      } else {
        setCourts((prev) => [{ ...data, itemCount: 0, bookingCount: 0 }, ...prev])
        toast('Court Created', `${data.courtName} has been created.`, 'success')
      }

      setShowForm(false)
      setEditingId(null)
      setForm(EMPTY_FORM)
    } catch {
      toast('Error', 'Network error — try again.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (c: AdminCourt) => {
    if (!confirm(`Delete "${c.courtName}"? This cannot be undone.`)) return

    setDeleting(c.id)
    try {
      const res = await fetch(`/api/courts/${c.id}`, { method: 'DELETE' })
      const data = await res.json()

      if (!res.ok) {
        toast('Error', data.error ?? 'Failed to delete court', 'error')
        return
      }

      setCourts((prev) => prev.filter((x) => x.id !== c.id))
      toast('Court Deleted', `${c.courtName} has been deleted.`, 'success')
    } catch {
      toast('Error', 'Network error — try again.', 'error')
    } finally {
      setDeleting(null)
    }
  }

  const openManageItems = async (c: AdminCourt) => {
    setManageItemsCourtId(c.id)
    setItemsLoading(true)
    try {
      const res = await fetch(`/api/courts/${c.id}/items`)
      if (res.ok) {
        const data = await res.json()
        setCourtItems(data.items || [])
      }
    } catch {
      toast('Error', 'Failed to load items', 'error')
    } finally {
      setItemsLoading(false)
    }
  }

  const toggleItem = async (item: AdminItem, isLinked: boolean) => {
    if (!manageItemsCourtId) return
    const courtId = manageItemsCourtId
    const prevItems = [...courtItems]

    // Optimistic update
    if (isLinked) {
      setCourtItems((prev) => prev.filter((i) => i.id !== item.id))
      setCourts((prev) => prev.map((c) => c.id === courtId ? { ...c, itemCount: c.itemCount - 1 } : c))
    } else {
      setCourtItems((prev) => [...prev, { id: item.id, itemName: item.itemName }])
      setCourts((prev) => prev.map((c) => c.id === courtId ? { ...c, itemCount: c.itemCount + 1 } : c))
    }

    try {
      if (isLinked) {
        await fetch(`/api/courts/${courtId}/items/${item.id}`, { method: 'DELETE' })
      } else {
        await fetch(`/api/courts/${courtId}/items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ item_id: item.id })
        })
      }
    } catch {
      // Revert on failure
      setCourtItems(prevItems)
      setCourts((prev) => prev.map((c) => c.id === courtId ? { ...c, itemCount: prevItems.length } : c))
      toast('Error', 'Failed to update items', 'error')
    }
  }

  const statusColor: Record<string, string> = {
    active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    maintenance: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    hidden: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Court Management</h1>
          <p className="text-on-surface-variant text-sm mt-1">
            {courts.length} courts registered.
          </p>
        </div>
        <button onClick={openCreateForm} className="btn btn-cta">
          <Plus size={16} /> Add Court
        </button>
      </div>

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-asphalt/50 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative bg-surface rounded-xl shadow-lift p-6 w-full max-w-lg mx-4 space-y-4 border border-outline">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">{editingId ? 'Edit Court' : 'Create Court'}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-surface-low rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1">
                  Court Name *
                </label>
                <input
                  className="input w-full"
                  value={form.court_name}
                  onChange={(e) => setForm((f) => ({ ...f, court_name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1">
                  Description
                </label>
                <textarea
                  className="input w-full min-h-[80px] resize-none"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1">
                    Location
                  </label>
                  <input
                    className="input w-full"
                    placeholder="e.g. BGC, Taguig"
                    value={form.location}
                    onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1">
                    Price / Hour (₱)
                  </label>
                  <input
                    className="input w-full"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="500"
                    value={form.price_per_hour}
                    onChange={(e) => setForm((f) => ({ ...f, price_per_hour: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1">
                    Type
                  </label>
                  <select
                    className="input w-full"
                    value={form.court_type}
                    onChange={(e) => setForm((f) => ({ ...f, court_type: e.target.value }))}
                  >
                    <option value="">—</option>
                    <option value="indoor">Indoor</option>
                    <option value="outdoor">Outdoor</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1">
                    Status
                  </label>
                  <select
                    className="input w-full"
                    value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                  >
                    <option value="active">Active</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="hidden">Hidden</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn btn-outline flex-1">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary flex-1 disabled:opacity-50">
                  {submitting ? 'Saving…' : editingId ? 'Update Court' : 'Create Court'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Items Modal */}
      {manageItemsCourtId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-asphalt/50 backdrop-blur-sm" onClick={() => setManageItemsCourtId(null)} />
          <div className="relative bg-surface rounded-xl shadow-lift p-6 w-full max-w-md mx-4 space-y-4 border border-outline">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Manage Items</h2>
              <button onClick={() => setManageItemsCourtId(null)} className="p-2 hover:bg-surface-low rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            {itemsLoading ? (
              <p className="text-sm text-on-surface-variant text-center py-8">Loading items...</p>
            ) : allItems.length === 0 ? (
              <p className="text-sm text-on-surface-variant text-center py-8">No items exist in the platform. Add items first.</p>
            ) : (
              <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
                {allItems.map((item) => {
                  const isLinked = courtItems.some((ci) => ci.id === item.id)
                  return (
                    <label key={item.id} className="flex items-center gap-3 p-3 rounded-lg border border-outline hover:bg-surface-low cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={isLinked}
                        onChange={() => toggleItem(item, isLinked)}
                        className="w-4 h-4 text-primary bg-surface border-outline rounded focus:ring-primary/20"
                      />
                      <span className="font-medium text-sm select-none">{item.itemName}</span>
                    </label>
                  )
                })}
              </div>
            )}
            
            <div className="pt-4">
              <button type="button" onClick={() => setManageItemsCourtId(null)} className="btn btn-outline w-full">
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-outline bg-surface-low/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={16} />
            <input
              type="text"
              placeholder="Search courts..."
              className="input py-2 pl-9 w-full bg-surface"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-surface-low border-b border-outline">
                <th className="p-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Court</th>
                <th className="p-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Location</th>
                <th className="p-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Type</th>
                <th className="p-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Price/hr</th>
                <th className="p-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Items</th>
                <th className="p-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Bookings</th>
                <th className="p-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-on-surface-variant text-sm font-medium">
                    {courts.length === 0 ? 'No courts yet. Create your first court.' : 'No courts match your search.'}
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-surface-low/50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-sm flex items-center gap-1.5">
                        <Building2 size={14} className="text-on-surface-variant" />
                        {c.courtName}
                      </p>
                      {c.description && (
                        <p className="text-xs text-on-surface-variant mt-0.5 line-clamp-1">
                          {c.description}
                        </p>
                      )}
                    </td>
                    <td className="p-4 text-sm">
                      {c.location ? (
                        <span className="flex items-center gap-1 text-on-surface-variant">
                          <MapPin size={12} /> {c.location}
                        </span>
                      ) : (
                        <span className="text-on-surface-variant text-xs">—</span>
                      )}
                    </td>
                    <td className="p-4 text-sm font-medium capitalize">
                      {c.courtType ?? '—'}
                    </td>
                    <td className="p-4 text-sm font-semibold">
                      {c.pricePerHour ? (
                        <span className="flex items-center gap-0.5">
                          <DollarSign size={12} />₱{Number(c.pricePerHour).toLocaleString()}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`badge ${statusColor[c.status] ?? 'bg-surface-dim text-on-surface'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm font-medium text-center">{c.itemCount}</td>
                    <td className="p-4 text-sm font-medium text-center">{c.bookingCount}</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openManageItems(c)}
                          className="p-2 text-on-surface-variant hover:bg-primary/10 hover:text-primary rounded-md transition-colors"
                          title="Manage Items"
                        >
                          <Package size={16} />
                        </button>
                        <button
                          onClick={() => openEditForm(c)}
                          className="p-2 text-on-surface-variant hover:bg-surface-dim hover:text-on-surface rounded-md transition-colors"
                          title="Edit Court"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(c)}
                          disabled={deleting === c.id}
                          className="p-2 text-on-surface-variant hover:bg-red-100 hover:text-red-600 rounded-md transition-colors disabled:opacity-50"
                          title="Delete Court"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-outline bg-surface-low/30">
          <span className="text-sm text-on-surface-variant font-medium">
            Showing {filtered.length} of {courts.length} courts
          </span>
        </div>
      </div>
    </div>
  )
}
