'use client'

import { useState } from 'react'
import type { CalendarEvent, Project } from '@/lib/types'

interface Props {
  events: (CalendarEvent & { project: Pick<Project, 'color' | 'name'> })[]
}

export function CalendarGrid({ events }: Props) {
  const [current, setCurrent] = useState(() => new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

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

  function handleDayClick(day: number) {
    const key = dateKey(day)
    setSelectedDate(prev => prev === key ? null : key)
  }

  const selectedEvents = selectedDate ? (eventsByDate[selectedDate] ?? []) : []
  const selectedLabel = selectedDate
    ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    : null

  return (
    <div className="border rounded-xl bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <button onClick={() => { setCurrent(new Date(year, month - 1, 1)); setSelectedDate(null) }} className="text-gray-500 hover:text-gray-900 px-2 text-lg">‹</button>
        <p className="font-semibold text-sm">{monthLabel}</p>
        <button onClick={() => { setCurrent(new Date(year, month + 1, 1)); setSelectedDate(null) }} className="text-gray-500 hover:text-gray-900 px-2 text-lg">›</button>
      </div>

      <div className="grid grid-cols-7 text-center">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
          <div key={d} className="text-xs text-gray-400 py-1 font-medium">{d}</div>
        ))}
        {cells.map((day, i) => {
          const key = day ? dateKey(day) : null
          const dayEvents = key ? (eventsByDate[key] ?? []) : []
          const isSelected = key === selectedDate
          const hasEvents = dayEvents.length > 0

          return (
            <div
              key={i}
              onClick={() => day && handleDayClick(day)}
              className={`min-h-12 p-1 border-t transition-colors ${day ? 'cursor-pointer' : ''} ${isSelected ? 'bg-[#1e3a5f]' : day && isToday(day) ? 'bg-blue-50' : day && hasEvents ? 'hover:bg-gray-50' : ''}`}
            >
              {day && (
                <>
                  <p className={`text-xs mb-0.5 font-medium ${isSelected ? 'text-white' : isToday(day) ? 'font-bold text-blue-600' : 'text-gray-700'}`}>
                    {day}
                  </p>
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 2).map(e => (
                      <div
                        key={e.id}
                        className="text-xs truncate rounded px-1 text-white leading-4"
                        style={{ backgroundColor: isSelected ? 'rgba(255,255,255,0.3)' : e.project.color }}
                        title={`${e.title} — ${e.project.name}`}
                      >
                        {e.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <p className={`text-xs ${isSelected ? 'text-white/70' : 'text-gray-400'}`}>+{dayEvents.length - 2} more</p>
                    )}
                    {hasEvents && dayEvents.length === 0 && null}
                  </div>
                  {hasEvents && dayEvents.length === 0 && null}
                  {!hasEvents && <span className="block w-1 h-1" />}
                </>
              )}
            </div>
          )
        })}
      </div>

      {/* Day agenda panel */}
      {selectedDate && (
        <div className="border-t">
          <div className="px-4 py-3 bg-gray-50 border-b flex items-center justify-between">
            <p className="font-semibold text-sm">{selectedLabel}</p>
            <button onClick={() => setSelectedDate(null)} className="text-gray-400 hover:text-gray-700 text-lg leading-none">✕</button>
          </div>
          {selectedEvents.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-5">Nothing scheduled.</p>
          ) : (
            <ul className="divide-y">
              {selectedEvents.map(e => (
                <li key={e.id} className="flex items-start gap-3 px-4 py-3">
                  <span className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: e.project.color }} />
                  <div>
                    <p className="text-sm font-medium">{e.title}</p>
                    <p className="text-xs text-gray-500">{e.project.name}{e.event_time ? ` · ${e.event_time.slice(0, 5)}` : ''}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
