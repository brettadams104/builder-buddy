import { createClient } from '@/lib/supabase/server'
import { uploadLookbookPhoto } from '@/lib/actions/lookbook'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function RoomPhotosPage({
  params,
}: {
  params: Promise<{ id: string; roomId: string }>
}) {
  const { id, roomId } = await params
  const supabase = await createClient()

  const { data: room } = await supabase.from('lookbook_rooms').select('*').eq('id', roomId).single()
  if (!room) notFound()

  const { data: photos } = await supabase
    .from('lookbook_photos')
    .select('*')
    .eq('room_id', roomId)
    .order('created_at', { ascending: false })

  async function handleUpload(formData: FormData) {
    'use server'
    const file = formData.get('file') as File
    if (!file || file.size === 0) return
    await uploadLookbookPhoto(roomId, id, file)
  }

  return (
    <div className="space-y-4">
      <Link href={`/lookbook/${id}`} className="text-blue-600 hover:underline text-sm">← {room.room_type}</Link>
      <h1 className="text-2xl font-bold">{room.room_type}</h1>

      <form action={handleUpload} className="flex gap-2 items-center">
        <input name="file" type="file" accept="image/*" className="flex-1 text-sm" />
        <button type="submit" className="bg-[#1e3a5f] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#162d4a] shrink-0">
          Upload
        </button>
      </form>

      {!photos?.length && <p className="text-gray-500 text-sm text-center py-8">No photos yet.</p>}

      <div className="grid grid-cols-2 gap-2">
        {photos?.map(photo => (
          <img key={photo.id} src={photo.url} alt={room.room_type} className="w-full h-40 object-cover rounded-xl" />
        ))}
      </div>
    </div>
  )
}
