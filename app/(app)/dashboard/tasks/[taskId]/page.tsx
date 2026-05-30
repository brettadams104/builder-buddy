import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { deleteTask, pushTaskToTomorrow } from '@/lib/actions/tasks'
import { PriorityBadge } from '@/components/priority-badge'
import type { Priority } from '@/lib/types'

export default async function TaskDetailPage({ params }: { params: Promise<{ taskId: string }> }) {
  const { taskId } = await params
  const supabase = await createClient()

  const { data: task } = await supabase
    .from('tasks')
    .select('*, profiles(name), projects(id, name)')
    .eq('id', taskId)
    .single()

  if (!task) notFound()

  const project = task.projects as { id: string; name: string } | null
  const assignee = task.profiles as { name: string } | null

  async function handleDone() {
    'use server'
    await deleteTask(taskId, project?.id ?? null)
  }

  async function handleDelete() {
    'use server'
    await deleteTask(taskId, project?.id ?? null)
  }

  async function handlePushToTomorrow() {
    'use server'
    await pushTaskToTomorrow(taskId, project?.id ?? null)
  }

  return (
    <div className="space-y-5">
      <Link href="/dashboard/tasks" className="text-blue-600 hover:underline text-sm">← Task Manager</Link>

      <div className="bg-white border rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h1 className="text-xl font-bold leading-tight">{task.title}</h1>
          <PriorityBadge priority={task.priority as Priority} />
        </div>

        {project && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Project</span>
            <span className="text-sm font-medium text-blue-600">{project.name}</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Assigned to</span>
          <span className="text-sm font-medium">{assignee?.name ?? 'Unassigned'}</span>
        </div>

        {task.due_date && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Due</span>
            <span className="text-sm font-medium">
              {new Date(task.due_date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
          </div>
        )}

        {task.notes && (
          <div className="space-y-1">
            <p className="text-xs text-gray-500">Notes</p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-lg p-3">{task.notes}</p>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <form action={handleDone}>
          <button type="submit" className="w-full bg-green-600 text-white rounded-xl py-3 font-semibold hover:bg-green-700">
            Mark as Done
          </button>
        </form>

        <form action={handlePushToTomorrow}>
          <button type="submit" className="w-full bg-[#1e3a5f] text-white rounded-xl py-3 font-semibold hover:bg-[#162d4a]">
            Push to Tomorrow
          </button>
        </form>

        <form action={handleDelete}>
          <button type="submit" className="w-full border border-red-300 text-red-600 rounded-xl py-3 font-semibold hover:bg-red-50">
            Delete Task
          </button>
        </form>
      </div>
    </div>
  )
}
