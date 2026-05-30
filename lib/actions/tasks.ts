'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { sendUrgentTaskSMS } from '@/lib/notifications/sms'
import type { Priority } from '@/lib/types'

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

  if (input.priority === 'urgent' && input.projectId) {
    const [{ data: profile }, { data: project }] = await Promise.all([
      supabase.from('profiles').select('phone').eq('id', input.assigneeId).single(),
      supabase.from('projects').select('name').eq('id', input.projectId).single(),
    ])
    if (profile?.phone && project?.name) {
      await sendUrgentTaskSMS(profile.phone, project.name, input.title).catch(() => {})
    }
  }

  revalidatePath('/dashboard/tasks')
  revalidatePath('/dashboard')
  if (input.projectId) revalidatePath(`/projects/${input.projectId}/tasks`)
}

export async function updateTaskStatus(taskId: string, status: string, projectId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('tasks').update({ status }).eq('id', taskId)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/tasks')
  revalidatePath('/dashboard')
  if (projectId) revalidatePath(`/projects/${projectId}/tasks`)
}

export async function completeTask(taskId: string, projectId: string | null) {
  const supabase = await createClient()
  const { error } = await supabase.from('tasks').update({ status: 'done' }).eq('id', taskId)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/tasks')
  revalidatePath('/dashboard')
  if (projectId) revalidatePath(`/projects/${projectId}/tasks`)
  redirect('/dashboard/tasks?tab=completed')
}

export async function reopenTask(taskId: string, projectId: string | null) {
  const supabase = await createClient()
  const { error } = await supabase.from('tasks').update({ status: 'not_done' }).eq('id', taskId)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/tasks')
  revalidatePath('/dashboard')
  if (projectId) revalidatePath(`/projects/${projectId}/tasks`)
  redirect('/dashboard/tasks')
}

export async function deleteTask(taskId: string, projectId: string | null) {
  const supabase = await createClient()
  const { error } = await supabase.from('tasks').delete().eq('id', taskId)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/tasks')
  revalidatePath('/dashboard')
  if (projectId) revalidatePath(`/projects/${projectId}/tasks`)
  redirect('/dashboard/tasks')
}

export async function pushTaskToTomorrow(taskId: string, projectId: string | null) {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().split('T')[0]

  const supabase = await createClient()
  const { error } = await supabase.from('tasks').update({ due_date: tomorrowStr }).eq('id', taskId)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/tasks')
  revalidatePath('/dashboard')
  if (projectId) revalidatePath(`/projects/${projectId}/tasks`)
  redirect('/dashboard/tasks')
}
