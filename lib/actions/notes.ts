'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function addNote(projectId: string, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { error } = await supabase.from('notes').insert({
    project_id: projectId,
    author_id: user!.id,
    content,
  })
  if (error) throw new Error(error.message)
  revalidatePath(`/projects/${projectId}/notes`)
}

export async function editNote(noteId: string, projectId: string, content: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('notes').update({ content }).eq('id', noteId)
  if (error) throw new Error(error.message)
  revalidatePath(`/projects/${projectId}/notes`)
}

export async function deleteNote(noteId: string, projectId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('notes').delete().eq('id', noteId)
  if (error) throw new Error(error.message)
  revalidatePath(`/projects/${projectId}/notes`)
}
