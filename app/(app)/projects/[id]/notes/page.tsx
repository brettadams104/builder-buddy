import { createClient } from '@/lib/supabase/server'
import { addNote } from '@/lib/actions/notes'
import { NoteItem } from '@/components/note-item'
import type { Note } from '@/lib/types'

export default async function NotesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: notes } = await supabase
    .from('notes')
    .select('*, profiles(name)')
    .eq('project_id', id)
    .order('created_at', { ascending: false })

  async function handleAdd(formData: FormData) {
    'use server'
    const content = formData.get('content') as string
    if (!content?.trim()) return
    await addNote(id, content.trim())
  }

  return (
    <div className="space-y-4">
      <form action={handleAdd} className="bg-white border rounded-xl p-4 shadow-sm space-y-2">
        <textarea
          name="content"
          rows={3}
          placeholder="Add an update... (e.g. Drywallers confirmed Thursday)"
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        <button type="submit" className="bg-[#1e3a5f] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#162d4a]">
          Post Update
        </button>
      </form>

      {!notes?.length && <p className="text-gray-500 text-sm text-center py-8">No updates yet.</p>}

      <div className="space-y-3">
        {notes?.map(note => (
          <NoteItem
            key={note.id}
            note={note as Note}
            author={{ name: (note.profiles as { name: string } | null)?.name ?? 'Unknown' }}
            projectId={id}
          />
        ))}
      </div>
    </div>
  )
}
