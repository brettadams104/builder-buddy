import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'

const TABS = ['notes', 'tasks', 'calendar', 'files', 'contacts'] as const

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: project } = await supabase.from('projects').select('*').eq('id', id).single()
  if (!project) notFound()

  return (
    <div className="space-y-4">
      <div>
        <Link href="/dashboard" className="text-blue-600 hover:underline text-sm">← Dashboard</Link>
        <h1 className="text-2xl font-bold mt-1">{project.name}</h1>
        <p className="text-sm text-gray-500">{project.address}</p>
      </div>

      <div className="flex gap-1 border-b overflow-x-auto">
        {TABS.map(tab => (
          <Link
            key={tab}
            href={`/projects/${id}/${tab}`}
            className="px-3 py-2 text-sm font-medium capitalize text-gray-600 hover:text-gray-900 whitespace-nowrap border-b-2 border-transparent hover:border-gray-300"
          >
            {tab}
          </Link>
        ))}
      </div>

      {children}
    </div>
  )
}
