'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createContact } from '@/lib/actions/contacts'
import Link from 'next/link'

export default function NewContactPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const form = new FormData(e.currentTarget)
    try {
      await createContact({
        name: form.get('name') as string,
        company: (form.get('company') as string) || null,
        trade: form.get('trade') as string,
        phone: form.get('phone') as string,
        notes: (form.get('notes') as string) || null,
      })
      router.push('/contacts')
    } catch (err) {
      setError((err as Error).message)
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Link href="/contacts" className="text-blue-600 hover:underline text-sm">← Contacts</Link>
      <h1 className="text-2xl font-bold">Add Contact</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white border rounded-xl p-4 shadow-sm">
        {[
          { name: 'name', label: 'Name', type: 'text', required: true },
          { name: 'trade', label: 'Trade / Role', type: 'text', required: true },
          { name: 'phone', label: 'Phone', type: 'tel', required: true },
          { name: 'company', label: 'Company', type: 'text', required: false },
        ].map(f => (
          <div key={f.name}>
            <label className="block text-sm font-medium mb-1">{f.label}{!f.required && ' (optional)'}</label>
            <input name={f.name} type={f.type} required={f.required} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        ))}
        <div>
          <label className="block text-sm font-medium mb-1">Notes (optional)</label>
          <textarea name="notes" rows={2} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button type="submit" disabled={loading} className="w-full bg-[#1e3a5f] text-white rounded-lg py-2 font-medium hover:bg-[#162d4a] disabled:opacity-50">
          {loading ? 'Saving...' : 'Save Contact'}
        </button>
      </form>
    </div>
  )
}
