import { createClient } from '@/lib/supabase/server'
import { createFolder } from '@/lib/actions/files'
import Link from 'next/link'

export default async function FilesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: folders } = await supabase
    .from('folders')
    .select('*, files(id)')
    .eq('project_id', id)
    .order('created_at')

  async function handleCreate(formData: FormData) {
    'use server'
    const name = formData.get('name') as string
    if (!name?.trim()) return
    await createFolder(id, name.trim())
  }

  return (
    <div className="space-y-4">
      <form action={handleCreate} className="flex gap-2">
        <input name="name" type="text" placeholder="New folder name..." className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <button type="submit" className="bg-[#1e3a5f] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#162d4a]">
          + Folder
        </button>
      </form>

      {!folders?.length && <p className="text-gray-500 text-sm text-center py-8">No folders yet.</p>}

      <div className="space-y-2">
        {folders?.map(folder => (
          <Link
            key={folder.id}
            href={`/projects/${id}/files/${folder.id}`}
            className="flex items-center justify-between bg-white border rounded-xl px-4 py-3 shadow-sm hover:border-blue-400 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">📁</span>
              <p className="font-medium text-sm">{folder.name}</p>
            </div>
            <p className="text-xs text-gray-400">{(folder.files as { id: string }[])?.length ?? 0} files</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
