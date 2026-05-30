'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

interface Props {
  signOut: () => Promise<void>
}

export function Nav({ signOut }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
        aria-label="Menu"
      >
        <span className="block w-5 h-0.5 bg-white mb-1" />
        <span className="block w-5 h-0.5 bg-white mb-1" />
        <span className="block w-5 h-0.5 bg-white" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white border rounded-xl shadow-lg overflow-hidden z-20">
          <Link href="/dashboard" onClick={() => setOpen(false)} className="block px-4 py-3 text-sm hover:bg-gray-50 border-b">Dashboard</Link>
          <Link href="/dashboard/tasks" onClick={() => setOpen(false)} className="block px-4 py-3 text-sm hover:bg-gray-50 border-b">Task Manager</Link>
          <Link href="/contacts" onClick={() => setOpen(false)} className="block px-4 py-3 text-sm hover:bg-gray-50 border-b">Contacts</Link>
          <Link href="/lookbook" onClick={() => setOpen(false)} className="block px-4 py-3 text-sm hover:bg-gray-50 border-b">Lookbook</Link>
          <Link href="/dashboard/team" onClick={() => setOpen(false)} className="block px-4 py-3 text-sm hover:bg-gray-50 border-b">Team</Link>
          <form action={signOut}>
            <button type="submit" className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-gray-50">Sign Out</button>
          </form>
        </div>
      )}
    </div>
  )
}
