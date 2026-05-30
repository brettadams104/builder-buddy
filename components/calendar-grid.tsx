'use client'

import { useState } from 'react'
import type { CalendarEvent, Project } from '@/lib/types'

interface Props {
  events: (CalendarEvent & { project: Pick<Project, 'color' | 'name'> })[]
}

export function CalendarGrid({ events }: Props) {
  const [current, setCurrent] = useState(() => new Date())

  const year = current.getFullYear()
  const month = current.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const monthLabel = current.toLocaleString('default', { month: 'long', year: 'numeric' })

  const eventsByDate = events.reduce<Record<string, typeof events>>((acc, e) => {
    const d = e.event_date
    if (!acc[d]) acc[d] = []
    acc[d].push(e)
    return acc
  }, {})

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  const today = new Date()
  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear()

  function dateKey(day: number) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  return (
    <div className="border rounded-xl bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <button onClick={() => setCurrent(new Date(year, month - 1, 1))} className="text-gray-500 hover:text-gray-900 px-2">‹</button>
        <p className="font-semibold text-sm">{monthLabel}</p>
        <button onClick={() => setCurrent(new Date(year, month + 1, 1))} className="text-gray-500 hover:text-gray-900 px-2">›</button>
      </div>
      <div className="grid grid-cols-7 text-center">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
          <div key={d} className="text-xs text-gray-400 py-1">{d}</div>
        ))}
        {cells.map((day, i) => {
          const key = day ? dateKey(day) : null
          const dayEvents = key ? (eventsByDate[key] ?? []) : []
          return (
            <div key={i} className={`min-h-10 p-1 border-t ${day && isToday(day) ? 'bg-blue-50' : ''}`}>
              {day && (
                <>
                  <p className={`text-xs mb-0.5 ${isToday(day) ? 'font-bold text-blue-600' : 'text-gray-700'}`}>{day}</p>
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 2).map(e => (
                      <div key={e.id} className="text-xs truncate rounded px-1 text-white leading-4" style={{ backgroundColor: e.project.color }} title={`${e.title} — ${e.project.name}`}>
                        {e.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && <p className="text-xs text-gray-400">+{dayEvents.length - 2}</p>}
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
