'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createRoom } from '@/lib/actions/lookbook'
import Link from 'next/link'

const COMMON_ROOMS = ['Kitchen', 'Master Bathroom', 'Bathroom', 'Master Bedroom', 'Bedroom', 'Living Room', 'Dining Room', 'Exterior', 'Other']

export default function NewRoomPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const [loading, setLoading] = useState(false)
  const [custom, setCustom] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function add(roomType: string) {
    setLoading(true)
    setError(null)
    try {
      await createRoom(params.id, roomType)
      router.push(`/lookbook/${params.id}`)
    } catch (err) {
      setError((err as Error).message)
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Link href={`/lookbook/${params.id}`} className="text-blue-600 hover:underline text-sm">← Home</Link>
      <h1 className="text-2xl font-bold">Add Room</h1>

      <div className="space-y-2">
        {COMMON_ROOMS.map(r => (
          <button key={r} onClick={() => add(r)} disabled={loading} className="w-full text-left border rounded-xl px-4 py-3 bg-white hover:border-blue-400 text-sm font-medium disabled:opacity-50">
            {r}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Custom room name..."
          value={custom}
          onChange={e => setCustom(e.target.value)}
          className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button onClick={() => custom.trim() && add(custom.trim())} disabled={loading || !custom.trim()} className="bg-[#1e3a5f] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#162d4a] disabled:opacity-50">
          Add
        </button>
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
    </div>
  )
}
