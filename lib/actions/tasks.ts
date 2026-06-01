'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendTaskAssignedEmail } from '@/lib/notifications/email'
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
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase.from('tasks').insert({
    project_id: input.projectId || null,
    title: input.title,
    assignee_id: input.assigneeId,
    priority: input.priority,
    due_date: input.dueDate,
    notes: input.notes,
  })
  if (error) throw new Error(error.message)

  // Send email to assignee (skip if assigning to yourself)
  if (input.assigneeId !== user?.id) {
    const adminClient = createAdminClient()
    const [{ data: { user: assignee } }, { data: profile }, { data: project }, { data: assigner }] = await Promise.all([
      adminClient.auth.admin.getUserById(input.assigneeId),
      supabase.from('profiles').select('name').eq('id', input.assigneeId).single(),
      input.projectId ? supabase.from('projects').select('name').eq('id', input.projectId).single() : Promise.resolve({ data: null }),
      supabase.from('profiles').select('name').eq('id', user!.id).single(),
    ])
    if (assignee?.email) {
      await sendTaskAssignedEmail({
        toEmail: assignee.email,
        toName: profile?.name ?? 'Team Member',
        taskTitle: input.title,
        priority: input.priority,
        projectName: project?.name ?? null,
        dueDate: input.dueDate,
        notes: input.notes,
        assignedBy: assigner?.name ?? 'A team member',
      }).catch(() => {})
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
