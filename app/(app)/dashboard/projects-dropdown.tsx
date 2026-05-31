'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Project } from '@/lib/types'

interface Props {
  projects: (Project & { urgentCount: number })[]
}

export function ProjectsDropdown({ projects }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div className="space-y-1">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between bg-white border rounded-xl px-4 py-3 shadow-sm hover:border-blue-400 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">Projects</span>
          <span className="text-xs bg-[#1e3a5f] text-white px-2 py-0.5 rounded-full">
            {projects.length} active
          </span>
        </div>
        <span className="text-gray-400 text-lg">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="border rounded-xl bg-white shadow-sm overflow-hidden">
          {projects.length === 0 && (
            <p className="text-gray-500 text-sm text-center py-5">No active projects.</p>
          )}
          <ul className="divide-y">
            {projects.map(p => (
              <li key={p.id}>
                <Link
                  href={`/projects/${p.id}/notes`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{p.name}</p>
                      <p className="text-xs text-gray-500 truncate">{p.address}</p>
                    </div>
                  </div>
                  {p.urgentCount > 0 && (
                    <span className="text-xs bg-red-100 text-red-700 font-medium px-2 py-0.5 rounded-full shrink-0 ml-2">
                      {p.urgentCount} urgent
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
