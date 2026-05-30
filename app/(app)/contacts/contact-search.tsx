'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'

export function ContactSearch({ defaultValue }: { defaultValue: string }) {
  const router = useRouter()
  const params = useSearchParams()
  const [, startTransition] = useTransition()

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const p = new URLSearchParams(params.toString())
    if (e.target.value) {
      p.set('q', e.target.value)
    } else {
      p.delete('q')
    }
    startTransition(() => {
      router.replace(`/contacts?${p.toString()}`)
    })
  }

  return (
    <input
      type="text"
      defaultValue={defaultValue}
      onChange={handleChange}
      placeholder="Search by name, trade, or company..."
      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  )
}
