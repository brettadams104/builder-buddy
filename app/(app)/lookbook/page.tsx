import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function LookbookPage({
  searchParams,
}: {
  searchParams: Promise<{ room?: string }>
}) {
  const { room } = await searchParams
  const supabase = await createClient()

  const { data: homes } = await supabase.from('lookbook_homes').select('*').order('created_at', { ascending: false })

  const { data: allRooms } = await supabase
    .from('lookbook_rooms')
    .select('room_type')

  const roomTypes = Array.from(new Set((allRooms ?? []).map(r => r.room_type))).sort()

  let filteredPhotos: { url: string }[] = []
  if (room) {
    const { data: roomRows } = await supabase
      .from('lookbook_rooms')
      .select('id')
      .eq('room_type', room)
    const roomIds = (roomRows ?? []).map(r => r.id)
    if (roomIds.length > 0) {
      const { data } = await supabase
        .from('lookbook_photos')
        .select('url')
        .in('room_id', roomIds)
      filteredPhotos = data ?? []
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Lookbook</h1>
        <Link href="/lookbook/new" className="bg-[#1e3a5f] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#162d4a]">
          + Add Home
        </Link>
      </div>

      {roomTypes.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-500 mb-2">Browse by Room</p>
          <div className="flex gap-2 flex-wrap">
            <Link href="/lookbook" className={`px-3 py-1 rounded-full text-sm border ${!room ? 'bg-[#1e3a5f] text-white border-[#1e3a5f]' : 'bg-white text-gray-700 hover:border-blue-400'}`}>
              All Homes
            </Link>
            {roomTypes.map(rt => (
              <Link key={rt} href={`/lookbook?room=${encodeURIComponent(rt)}`} className={`px-3 py-1 rounded-full text-sm border ${room === rt ? 'bg-[#1e3a5f] text-white border-[#1e3a5f]' : 'bg-white text-gray-700 hover:border-blue-400'}`}>
                {rt}
              </Link>
            ))}
          </div>
        </div>
      )}

      {room && (
        <div>
          <h2 className="font-semibold mb-3">{room} Photos</h2>
          {!filteredPhotos?.length ? (
            <p className="text-gray-500 text-sm text-center py-8">No {room} photos yet.</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {filteredPhotos.map((p, i) => (
                <img key={i} src={p.url} alt={room} className="w-full h-40 object-cover rounded-xl" />
              ))}
            </div>
          )}
        </div>
      )}

      {!room && (
        <div className="space-y-4">
          {!homes?.length && <p className="text-gray-500 text-sm text-center py-8">No homes yet.</p>}
          {homes?.map(home => (
            <Link key={home.id} href={`/lookbook/${home.id}`} className="block border rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
              {home.hero_photo_url ? (
                <img src={home.hero_photo_url} alt={home.name} className="w-full h-48 object-cover" />
              ) : (
                <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">No photo</div>
              )}
              <div className="p-4">
                <p className="font-semibold">{home.name}</p>
                <p className="text-sm text-gray-500">{home.address}{home.year ? ` · ${home.year}` : ''}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
