import { createClient } from '@/lib/supabase/server'
import { createTask } from '@/lib/actions/tasks'
import { TaskStatusButton } from './task-status-button'
import { PriorityBadge } from '@/components/priority-badge'
import type { Priority, TaskStatus } from '@/lib/types'

export default async function TasksPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: tasks }, { data: members }] = await Promise.all([
    supabase.from('tasks').select('*, profiles(name)').eq('project_id', id).order('created_at', { ascending: false }),
    supabase.from('profiles').select('id, name'),
  ])

  const priorityOrder = { urgent: 0, moderate: 1, low: 2 }
  const sorted = [...(tasks ?? [])].sort(
    (a, b) => priorityOrder[a.priority as Priority] - priorityOrder[b.priority as Priority]
  )

  async function handleCreate(formData: FormData) {
    'use server'
    const title = formData.get('title') as string
    const assigneeId = formData.get('assignee_id') as string
    const priority = formData.get('priority') as Priority
    const dueDate = (formData.get('due_date') as string) || null
    if (!title?.trim() || !assigneeId || !priority) return
    await createTask({ projectId: id, title: title.trim(), assigneeId, priority, dueDate })
  }

  return (
    <div className="space-y-4">
      <form action={handleCreate} className="bg-white border rounded-xl p-4 shadow-sm space-y-3">
        <h2 className="font-semibold text-sm">Add Task</h2>
        <input name="title" type="text" placeholder="Task title" required className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <div className="grid grid-cols-2 gap-2">
          <select name="assignee_id" required className="border rounded-lg px-3 py-2 text-sm">
            <option value="">Assign to...</option>
            {members?.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <select name="priority" required className="border rounded-lg px-3 py-2 text-sm">
            <option value="">Priority...</option>
            <option value="urgent">Urgent</option>
            <option value="moderate">Moderate</option>
            <option value="low">Low</option>
          </select>
        </div>
        <input name="due_date" type="date" className="w-full border rounded-lg px-3 py-2 text-sm" />
        <button type="submit" className="w-full bg-[#1e3a5f] text-white rounded-lg py-2 text-sm font-medium hover:bg-[#162d4a]">
          Add Task
        </button>
      </form>

      {!sorted.length && <p className="text-gray-500 text-sm text-center py-8">No tasks yet.</p>}

      <div className="space-y-2">
        {sorted.map(task => (
          <div key={task.id} className="bg-white border rounded-xl p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1 min-w-0">
                <p className="text-sm font-medium">{task.title}</p>
                <p className="text-xs text-gray-500">→ {(task.profiles as { name: string } | null)?.name ?? 'Unassigned'}</p>
                {task.due_date && <p className="text-xs text-gray-400">{new Date(task.due_date).toLocaleDateString()}</p>}
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <PriorityBadge priority={task.priority as Priority} />
                <TaskStatusButton taskId={task.id} status={task.status as TaskStatus} projectId={id} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
