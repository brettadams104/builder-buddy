import Link from 'next/link'
import type { Project } from '@/lib/types'

interface Props {
  project: Project
  urgentCount: number
}

export function ProjectCard({ project, urgentCount }: Props) {
  return (
    <Link
      href={`/projects/${project.id}/notes`}
      className="shrink-0 w-56 border rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-2">
        <span className="w-3 h-3 rounded-full mt-1 shrink-0" style={{ backgroundColor: project.color }} />
        {urgentCount > 0 && (
          <span className="text-xs bg-red-100 text-red-700 font-medium px-1.5 py-0.5 rounded-full">
            {urgentCount} urgent
          </span>
        )}
      </div>
      <p className="font-semibold text-sm leading-tight">{project.name}</p>
      <p className="text-xs text-gray-500 mt-1 leading-tight">{project.address}</p>
    </Link>
  )
}
