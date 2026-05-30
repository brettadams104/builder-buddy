'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function createEvent(input: {
  projectId: string
  title: string
  eventDate: string
  eventTime: string | null
}) {
  const supabase = await createClient()
  const { error } = await supabase.from('events').insert({
    project_id: input.projectId,
    title: input.title,
    event_date: input.eventDate,
    event_time: input.eventTime || null,
  })
  if (error) throw new Error(error.message)
  revalidatePath(`/projects/${input.projectId}/calendar`)
  revalidatePath('/dashboard')
}

export async function deleteEvent(eventId: string, projectId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('events').delete().eq('id', eventId)
  if (error) throw new Error(error.message)
  revalidatePath(`/projects/${projectId}/calendar`)
  revalidatePath('/dashboard')
}
