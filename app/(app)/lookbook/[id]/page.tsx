import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { updateHome } from '@/lib/actions/lookbook'

export default async function HomeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: home } = await supabase.from('lookbook_homes').select('*').eq('id', id).single()
  if (!home) notFound()

  const { data: rooms } = await supabase
    .from('lookbook_rooms')
    .select('*, lookbook_photos(id)')
    .eq('home_id', id)
    .order('room_type')

  async function handleUpdate(formData: FormData) {
    'use server'
    const name = formData.get('name') as string
    const address = formData.get('address') as string
    const yearStr = formData.get('year') as string
    if (!name?.trim() || !address?.trim()) return
    await updateHome(id, {
      name: name.trim(),
      address: address.trim(),
      year: yearStr ? Number(yearStr) : null,
    })
  }

  return (
    <div className="space-y-4">
      <Link href="/lookbook" className="text-blue-600 hover:underline text-sm">← Lookbook</Link>

      {home.hero_photo_url && (
        <img src={home.hero_photo_url} alt={home.name} className="w-full h-56 object-cover rounded-2xl" />
      )}

      {/* Editable header */}
      <form action={handleUpdate} className="bg-white border rounded-xl p-4 shadow-sm space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Home Name</label>
          <input
            name="name"
            type="text"
            defaultValue={home.name}
            required
            className="w-full border rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Address</label>
          <input
            name="address"
            type="text"
            defaultValue={home.address}
            required
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Year Built (optional)</label>
          <input
            name="year"
            type="number"
            min="1900"
            max="2099"
            defaultValue={home.year ?? ''}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button type="submit" className="w-full bg-[#1e3a5f] text-white rounded-lg py-2 text-sm font-medium hover:bg-[#162d4a]">
          Save Changes
        </button>
      </form>

      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Rooms</h2>
        <Link href={`/lookbook/${id}/new-room`} className="text-sm text-[#1e3a5f] font-medium hover:underline">+ Add Room</Link>
      </div>

      {!rooms?.length && <p className="text-gray-500 text-sm">No rooms yet.</p>}

      <div className="grid grid-cols-2 gap-3">
        {rooms?.map(room => (
          <Link
            key={room.id}
            href={`/lookbook/${id}/${room.id}`}
            className="border rounded-xl p-4 bg-white shadow-sm hover:border-blue-400 transition-colors text-center"
          >
            <p className="font-medium text-sm">{room.room_type}</p>
            <p className="text-xs text-gray-400 mt-1">{(room.lookbook_photos as { id: string }[])?.length ?? 0} photos</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
