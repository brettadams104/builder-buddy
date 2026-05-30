'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function createFolder(projectId: string, name: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('folders').insert({ project_id: projectId, name })
  if (error) throw new Error(error.message)
  revalidatePath(`/projects/${projectId}/files`)
}

export async function uploadFile(folderId: string, projectId: string, formData: FormData) {
  const file = formData.get('file') as File
  if (!file || file.size === 0) throw new Error('No file provided')

  const supabase = await createClient()
  const ext = file.name.split('.').pop()
  const path = `${folderId}/${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('project-files')
    .upload(path, file)
  if (uploadError) throw new Error(uploadError.message)

  const { data: { publicUrl } } = supabase.storage.from('project-files').getPublicUrl(path)

  const isImage = file.type.startsWith('image/')
  const { error } = await supabase.from('files').insert({
    folder_id: folderId,
    name: file.name,
    url: publicUrl,
    file_type: isImage ? 'image' : 'document',
  })
  if (error) throw new Error(error.message)
  revalidatePath(`/projects/${projectId}/files/${folderId}`)
}

export async function deleteFile(fileId: string, folderId: string, projectId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('files').delete().eq('id', fileId)
  if (error) throw new Error(error.message)
  revalidatePath(`/projects/${projectId}/files/${folderId}`)
}
