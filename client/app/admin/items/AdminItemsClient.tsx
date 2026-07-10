'use client'

import { useState } from 'react'
import { Plus, Package, Search } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'
import type { AdminItem } from '@/lib/db/queries/adminQueries'

type Props = {
  initialItems: AdminItem[]
}

export default function AdminItemsClient({ initialItems }: Props) {
  const toast = useToast()
  const [items, setItems] = useState(initialItems)
  const [search, setSearch] = useState('')
  const [newItemName, setNewItemName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const filtered = items.filter(
    (i) =>
      search === '' ||
      i.itemName.toLowerCase().includes(search.toLowerCase()),
  )

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    const name = newItemName.trim()
    if (!name) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_name: name }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast('Error', data.error ?? 'Failed to create item', 'error')
        return
      }

      setItems((prev) => [...prev, { ...data, courtCount: 0 }].sort((a, b) => a.itemName.localeCompare(b.itemName)))
      setNewItemName('')
      toast('Item Created', `"${data.itemName}" has been added.`, 'success')
    } catch {
      toast('Error', 'Network error — try again.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (item: AdminItem) => {
    if (item.courtCount > 0) {
      toast('Cannot Delete', 'This item is linked to one or more courts. Unlink it first.', 'error')
      return
    }

    if (!confirm(`Delete item "${item.itemName}"?`)) return

    setDeleting(item.id)
    try {
      const res = await fetch(`/api/items/${item.id}`, { method: 'DELETE' })
      const data = await res.json()

      if (!res.ok) {
        toast('Error', data.error ?? 'Failed to delete item', 'error')
        return
      }

      setItems((prev) => prev.filter((i) => i.id !== item.id))
      toast('Item Deleted', `"${item.itemName}" has been removed.`, 'success')
    } catch {
      toast('Error', 'Network error — try again.', 'error')
    } finally {
      setDeleting(null)
    }
  }

  // Format date
  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat('en-PH', {
      timeZone: 'Asia/Manila',
      dateStyle: 'medium',
    }).format(new Date(date))

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Items & Equipment</h1>
        <p className="text-on-surface-variant text-sm mt-1">
          Manage the equipment and amenity lookup table. Items can be linked to courts.
        </p>
      </div>

      {/* Add Item Form */}
      <div className="card p-5">
        <form onSubmit={handleCreate} className="flex gap-3">
          <div className="flex-1 relative">
            <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={16} />
            <input
              type="text"
              placeholder="New item name (e.g. Paddle, Ball, Scoreboard)..."
              className="input py-2.5 pl-9 w-full bg-surface"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={submitting || !newItemName.trim()}
            className="btn btn-cta disabled:opacity-50"
          >
            <Plus size={16} /> {submitting ? 'Adding…' : 'Add Item'}
          </button>
        </form>
      </div>

      {/* Items Table */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-outline bg-surface-low/50">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={16} />
            <input
              type="text"
              placeholder="Search items..."
              className="input py-2 pl-9 w-full bg-surface"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-low border-b border-outline">
                <th className="p-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Item Name</th>
                <th className="p-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Linked Courts</th>
                <th className="p-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Added</th>
                <th className="p-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-on-surface-variant text-sm font-medium">
                    {items.length === 0
                      ? 'No items yet. Add your first item above.'
                      : 'No items match your search.'}
                  </td>
                </tr>
              ) : (
                filtered.map((i) => (
                  <tr key={i.id} className="hover:bg-surface-low/50 transition-colors">
                    <td className="p-4">
                      <span className="font-bold text-sm flex items-center gap-2">
                        <Package size={14} className="text-primary" />
                        {i.itemName}
                      </span>
                    </td>
                    <td className="p-4 text-sm font-medium">
                      <span className="badge bg-surface-dim text-on-surface">
                        {i.courtCount} {i.courtCount === 1 ? 'court' : 'courts'}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-on-surface-variant">
                      {formatDate(i.createdAt)}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(i)}
                        disabled={deleting === i.id || i.courtCount > 0}
                        className={`text-xs font-bold px-3 py-1.5 rounded-md transition-colors ${
                          i.courtCount > 0
                            ? 'text-on-surface-variant/50 cursor-not-allowed bg-surface-dim'
                            : 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                        } disabled:opacity-50`}
                        title={i.courtCount > 0 ? "Cannot delete item linked to courts" : "Delete Item"}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-outline bg-surface-low/30">
          <span className="text-sm text-on-surface-variant font-medium">
            {filtered.length} of {items.length} items
          </span>
        </div>
      </div>
    </div>
  )
}
