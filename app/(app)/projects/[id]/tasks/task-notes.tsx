'use client'

import { useState } from 'react'

export function TaskNotes({ notes }: { notes: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        className="text-xs text-blue-600 hover:underline"
      >
        {open ? 'Hide notes' : 'View notes'}
      </button>
      {open && (
        <p className="mt-1 text-xs text-gray-600 whitespace-pre-wrap bg-gray-50 rounded-lg p-2">
          {notes}
        </p>
      )}
    </div>
  )
}
