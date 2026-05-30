import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'

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

  return (
    <div className="space-y-4">
      <Link href="/lookbook" className="text-blue-600 hover:underline text-sm">← Lookbook</Link>

      {home.hero_photo_url && (
        <img src={home.hero_photo_url} alt={home.name} className="w-full h-56 object-cover rounded-2xl" />
      )}
      <div>
        <h1 className="text-2xl font-bold">{home.name}</h1>
        <p className="text-gray-500 text-sm">{home.address}{home.year ? ` · ${home.year}` : ''}</p>
      </div>

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
