'use client'

import { useState } from 'react'
import { updateTaskStatus } from '@/lib/actions/tasks'
import type { TaskStatus } from '@/lib/types'

const STATUSES: TaskStatus[] = ['not_done', 'done', 'rescheduled']
const LABELS: Record<TaskStatus, string> = {
  not_done: 'Not Done',
  done: 'Done',
  rescheduled: 'Rescheduled',
}
const STYLES: Record<TaskStatus, string> = {
  not_done: 'bg-gray-100 text-gray-700',
  done: 'bg-green-100 text-green-700',
  rescheduled: 'bg-yellow-100 text-yellow-700',
}

export function TaskStatusButton({ taskId, status, projectId }: { taskId: string; status: TaskStatus; projectId: string }) {
  const [current, setCurrent] = useState(status)
  const [loading, setLoading] = useState(false)

  async function cycle() {
    const next = STATUSES[(STATUSES.indexOf(current) + 1) % STATUSES.length]
    setLoading(true)
    try {
      await updateTaskStatus(taskId, next, projectId)
      setCurrent(next)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={cycle}
      disabled={loading}
      className={`text-xs font-medium px-3 py-1 rounded-full ${STYLES[current]} disabled:opacity-50`}
    >
      {LABELS[current]}
    </button>
  )
}
