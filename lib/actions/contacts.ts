'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function createContact(input: {
  name: string
  company: string | null
  trade: string
  phone: string
  notes: string | null
}) {
  const supabase = await createClient()
  const { error } = await supabase.from('contacts').insert(input)
  if (error) throw new Error(error.message)
  revalidatePath('/contacts')
}

export async function attachContact(projectId: string, contactId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('project_contacts').insert({ project_id: projectId, contact_id: contactId })
  if (error && !error.message.includes('duplicate')) throw new Error(error.message)
  revalidatePath(`/projects/${projectId}/contacts`)
}

export async function detachContact(projectId: string, contactId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('project_contacts').delete().eq('project_id', projectId).eq('contact_id', contactId)
  if (error) throw new Error(error.message)
  revalidatePath(`/projects/${projectId}/contacts`)
}
