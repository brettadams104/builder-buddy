'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function createHome(input: {
  name: string
  address: string
  year: number | null
  heroFile: File | null
}) {
  const supabase = await createClient()
  let heroUrl: string | null = null

  if (input.heroFile && input.heroFile.size > 0) {
    const ext = input.heroFile.name.split('.').pop()
    const path = `heroes/${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage.from('lookbook-photos').upload(path, input.heroFile)
    if (uploadError) throw new Error(uploadError.message)
    heroUrl = supabase.storage.from('lookbook-photos').getPublicUrl(path).data.publicUrl
  }

  const { error } = await supabase.from('lookbook_homes').insert({
    name: input.name,
    address: input.address,
    year: input.year,
    hero_photo_url: heroUrl,
  })
  if (error) throw new Error(error.message)
  revalidatePath('/lookbook')
}

export async function createRoom(homeId: string, roomType: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('lookbook_rooms').insert({ home_id: homeId, room_type: roomType })
  if (error) throw new Error(error.message)
  revalidatePath(`/lookbook/${homeId}`)
}

export async function updateHome(homeId: string, input: { name: string; address: string; year: number | null }) {
  const supabase = await createClient()
  const { error } = await supabase.from('lookbook_homes').update(input).eq('id', homeId)
  if (error) throw new Error(error.message)
  revalidatePath(`/lookbook/${homeId}`)
  revalidatePath('/lookbook')
}

export async function uploadLookbookPhoto(roomId: string, homeId: string, file: File) {
  const supabase = await createClient()
  const ext = file.name.split('.').pop()
  const path = `rooms/${roomId}/${Date.now()}.${ext}`
  const { error: uploadError } = await supabase.storage.from('lookbook-photos').upload(path, file)
  if (uploadError) throw new Error(uploadError.message)
  const url = supabase.storage.from('lookbook-photos').getPublicUrl(path).data.publicUrl
  const { error } = await supabase.from('lookbook_photos').insert({ room_id: roomId, url })
  if (error) throw new Error(error.message)
  revalidatePath(`/lookbook/${homeId}/${roomId}`)
}

export async function deleteLookbookPhoto(photoId: string, homeId: string, roomId: string) {
  const supabase = await createClient()

  const { data: photo } = await supabase.from('lookbook_photos').select('url').eq('id', photoId).single()

  const { error } = await supabase.from('lookbook_photos').delete().eq('id', photoId)
  if (error) throw new Error(error.message)

  if (photo?.url) {
    const urlParts = photo.url.split('/lookbook-photos/')
    if (urlParts.length > 1) {
      await supabase.storage.from('lookbook-photos').remove([urlParts[1]]).catch(() => {})
    }
  }

  revalidatePath(`/lookbook/${homeId}/${roomId}`)
}
