'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createHome } from '@/lib/actions/lookbook'
import Link from 'next/link'

export default function NewHomePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const form = new FormData(e.currentTarget)
    const heroFile = form.get('hero') as File
    try {
      await createHome({
        name: form.get('name') as string,
        address: form.get('address') as string,
        year: form.get('year') ? Number(form.get('year')) : null,
        heroFile: heroFile?.size > 0 ? heroFile : null,
      })
      router.push('/lookbook')
    } catch (err) {
      setError((err as Error).message)
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Link href="/lookbook" className="text-blue-600 hover:underline text-sm">← Lookbook</Link>
      <h1 className="text-2xl font-bold">Add Home</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white border rounded-xl p-4 shadow-sm">
        <div>
          <label className="block text-sm font-medium mb-1">Home Name</label>
          <input name="name" type="text" required className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Address</label>
          <input name="address" type="text" required className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Year Built (optional)</label>
          <input name="year" type="number" min="1900" max="2099" className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Hero Photo (optional)</label>
          <input name="hero" type="file" accept="image/*" className="w-full text-sm" />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button type="submit" disabled={loading} className="w-full bg-[#1e3a5f] text-white rounded-lg py-2 font-medium hover:bg-[#162d4a] disabled:opacity-50">
          {loading ? 'Saving...' : 'Save Home'}
        </button>
      </form>
    </div>
  )
}
