import Link from 'next/link'
import type { Task } from '@/lib/types'
import { PriorityBadge } from './priority-badge'

interface Props {
  task: Task
  projectName: string
}

export function TaskItem({ task, projectName }: Props) {
  return (
    <Link
      href={`/projects/${task.project_id}/tasks`}
      className="flex items-start justify-between p-3 bg-white border rounded-xl hover:border-blue-400 transition-colors"
    >
      <div className="space-y-1">
        <p className="text-sm font-medium">{task.title}</p>
        <p className="text-xs text-gray-500">{projectName}</p>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0 ml-3">
        <PriorityBadge priority={task.priority} />
        {task.due_date && (
          <p className="text-xs text-gray-400">{new Date(task.due_date).toLocaleDateString()}</p>
        )}
      </div>
    </Link>
  )
}
