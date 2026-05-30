'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { sendUrgentTaskSMS } from '@/lib/notifications/sms'
import type { Priority, TaskStatus } from '@/lib/types'

export async function createTask(input: {
  projectId: string | null
  title: string
  assigneeId: string
  priority: Priority
  dueDate: string | null
  notes: string | null
}) {
  const supabase = await createClient()
  const { error } = await supabase.from('tasks').insert({
    project_id: input.projectId || null,
    title: input.title,
    assignee_id: input.assigneeId,
    priority: input.priority,
    due_date: input.dueDate,
    notes: input.notes,
  })
  if (error) throw new Error(error.message)

  if (input.priority === 'urgent') {
    const [{ data: profile }, { data: project }] = await Promise.all([
      supabase.from('profiles').select('phone').eq('id', input.assigneeId).single(),
      supabase.from('projects').select('name').eq('id', input.projectId).single(),
    ])
    if (profile?.phone && project?.name) {
      await sendUrgentTaskSMS(profile.phone, project.name, input.title).catch(() => {})
    }
  }

  revalidatePath(`/projects/${input.projectId}/tasks`)
  revalidatePath('/dashboard')
}

export async function updateTaskStatus(taskId: string, status: TaskStatus, projectId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('tasks').update({ status }).eq('id', taskId)
  if (error) throw new Error(error.message)
  revalidatePath(`/projects/${projectId}/tasks`)
  revalidatePath('/dashboard')
}
