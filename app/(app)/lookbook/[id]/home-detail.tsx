'use client'

import { useState } from 'react'
import { updateHome } from '@/lib/actions/lookbook'

interface Props {
  id: string
  name: string
  address: string
  year: number | null
  heroPhotoUrl: string | null
  description: string | null
}

export function HomeDetail({ id, name, address, year, heroPhotoUrl, description }: Props) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    const form = new FormData(e.currentTarget)
    const yearStr = form.get('year') as string
    try {
      await updateHome(id, {
        name: form.get('name') as string,
        address: form.get('address') as string,
        year: yearStr ? Number(yearStr) : null,
        description: (form.get('description') as string) || null,
      })
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-3">
      {heroPhotoUrl && (
        <img src={heroPhotoUrl} alt={name} className="w-full h-56 object-cover rounded-2xl" />
      )}

      {editing ? (
        <form onSubmit={handleSave} className="bg-white border rounded-xl p-4 shadow-sm space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Home Name</label>
            <input name="name" type="text" defaultValue={name} required className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Address</label>
            <input name="address" type="text" defaultValue={address} required className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Year Built (optional)</label>
            <input name="year" type="number" min="1900" max="2099" defaultValue={year ?? ''} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Description (optional)</label>
            <textarea name="description" rows={3} defaultValue={description ?? ''} placeholder="Brief overview of this home for clients..." className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="flex-1 bg-[#1e3a5f] text-white rounded-lg py-2 text-sm font-medium hover:bg-[#162d4a] disabled:opacity-50">
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button type="button" onClick={() => setEditing(false)} className="flex-1 border rounded-lg py-2 text-sm hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold">{name}</h1>
              <p className="text-gray-500 text-sm">{address}{year ? ` · ${year}` : ''}</p>
            </div>
            <button
              onClick={() => setEditing(true)}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              title="Edit home details"
            >
              ⚙️
            </button>
          </div>
          {description && (
            <p className="text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-3 leading-relaxed">{description}</p>
          )}
        </div>
      )}
    </div>
  )
}
