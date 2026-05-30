'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function createProject(input: {
  name: string
  address: string
  color: string
}) {
  const supabase = await createClient()
  const { error } = await supabase.from('projects').insert(input)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard')
}

export async function archiveProject(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('projects').update({ status: 'archived' }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard')
}
