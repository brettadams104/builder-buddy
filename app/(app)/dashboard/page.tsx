import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ProjectCard } from '@/components/project-card'
import { CalendarGrid } from '@/components/calendar-grid'
import { TaskItem } from '@/components/task-item'
import type { CalendarEvent, Project, Task } from '@/lib/types'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: projects }, { data: tasks }, { data: events }] = await Promise.all([
    supabase.from('projects').select('*').eq('status', 'active').order('created_at'),
    supabase.from('tasks').select('*, projects(name)').eq('assignee_id', user!.id).eq('status', 'not_done').eq('due_date', new Date().toISOString().split('T')[0]).order('created_at'),
    supabase.from('events').select('*, projects(color, name)').order('event_date'),
  ])

  const urgentCountByProject = (tasks ?? []).reduce<Record<string, number>>((acc, t) => {
    if (t.priority === 'urgent') acc[t.project_id] = (acc[t.project_id] ?? 0) + 1
    return acc
  }, {})

  const enrichedEvents = (events ?? []).map(e => ({
    ...e,
    project: e.projects as { color: string; name: string },
  })) as (CalendarEvent & { project: { color: string; name: string } })[]

  const priorityOrder = { urgent: 0, moderate: 1, low: 2 }
  const sortedTasks = [...(tasks ?? [])].sort(
    (a, b) => priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder]
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Link href="/projects/new" className="bg-[#1e3a5f] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#162d4a]">
          + New Project
        </Link>
      </div>

      <div>
        <h2 className="font-semibold mb-3">Active Projects</h2>
        {!projects?.length ? (
          <p className="text-gray-500 text-sm">No active projects. Create one to get started.</p>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {projects.map(p => (
              <ProjectCard key={p.id} project={p as Project} urgentCount={urgentCountByProject[p.id] ?? 0} />
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="font-semibold mb-3">Calendar</h2>
        <CalendarGrid events={enrichedEvents} />
      </div>

      <div>
        <h2 className="font-semibold mb-3">Today's Tasks</h2>
        {!sortedTasks.length ? (
          <p className="text-gray-500 text-sm">No tasks due today.</p>
        ) : (
          <div className="space-y-2">
            {sortedTasks.map(t => (
              <TaskItem key={t.id} task={t as Task} projectName={(t.projects as { name: string })?.name ?? ''} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
