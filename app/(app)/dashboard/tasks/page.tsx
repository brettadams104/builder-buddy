import { createClient } from '@/lib/supabase/server'
import { createTask } from '@/lib/actions/tasks'
import { TaskStatusButton } from '@/app/(app)/projects/[id]/tasks/task-status-button'
import { TaskNotes } from '@/app/(app)/projects/[id]/tasks/task-notes'
import { PriorityBadge } from '@/components/priority-badge'
import type { Priority, TaskStatus } from '@/lib/types'

export default async function TaskManagerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: tasks }, { data: members }, { data: projects }] = await Promise.all([
    supabase
      .from('tasks')
      .select('*, profiles(name), projects(name)')
      .eq('status', 'not_done')
      .order('due_date', { ascending: true, nullsFirst: false }),
    supabase.from('profiles').select('id, name'),
    supabase.from('projects').select('id, name').eq('status', 'active').order('name'),
  ])

  async function handleCreate(formData: FormData) {
    'use server'
    const title = formData.get('title') as string
    const assigneeId = formData.get('assignee_id') as string
    const priority = formData.get('priority') as Priority
    const dueDate = (formData.get('due_date') as string) || null
    const notes = (formData.get('notes') as string) || null
    const projectId = (formData.get('project_id') as string) || null
    if (!title?.trim() || !assigneeId || !priority) return
    await createTask({ projectId, title: title.trim(), assigneeId, priority, dueDate, notes })
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Task Manager</h1>

      <form action={handleCreate} className="bg-white border rounded-xl p-4 shadow-sm space-y-3">
        <h2 className="font-semibold text-sm">Add Task</h2>
        <input
          name="title"
          type="text"
          placeholder="Task title (e.g. Pick up prints)"
          required
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select name="project_id" className="w-full border rounded-lg px-3 py-2 text-sm">
          <option value="">No project (general task)</option>
          {projects?.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
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
        <textarea
          name="notes"
          rows={2}
          placeholder="Notes... (optional)"
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        <button type="submit" className="w-full bg-[#1e3a5f] text-white rounded-lg py-2 text-sm font-medium hover:bg-[#162d4a]">
          Add Task
        </button>
      </form>

      {!tasks?.length && (
        <p className="text-gray-500 text-sm text-center py-8">No open tasks.</p>
      )}

      <div className="space-y-2">
        {tasks?.map(task => (
          <div key={task.id} className="bg-white border rounded-xl p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1 min-w-0">
                <p className="text-sm font-medium">{task.title}</p>
                {(task.projects as { name: string } | null)?.name && (
                  <p className="text-xs text-blue-600">{(task.projects as { name: string }).name}</p>
                )}
                <p className="text-xs text-gray-500">→ {(task.profiles as { name: string } | null)?.name ?? 'Unassigned'}</p>
                {task.due_date && (
                  <p className="text-xs text-gray-400">{new Date(task.due_date + 'T00:00:00').toLocaleDateString()}</p>
                )}
                {task.notes && <TaskNotes notes={task.notes} />}
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <PriorityBadge priority={task.priority as Priority} />
                <TaskStatusButton taskId={task.id} status={task.status as TaskStatus} projectId={task.project_id ?? ''} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
