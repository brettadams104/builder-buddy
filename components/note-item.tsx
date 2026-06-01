'use client'

import { useState } from 'react'
import { editNote, deleteNote } from '@/lib/actions/notes'
import type { Note, Profile } from '@/lib/types'

interface Props {
  note: Note
  author: Pick<Profile, 'name'>
  projectId: string
}

export function NoteItem({ note, author, projectId }: Props) {
  const [editing, setEditing] = useState(false)
  const [content, setContent] = useState(note.content)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleSave() {
    if (!content.trim()) return
    setSaving(true)
    try {
      await editNote(note.id, projectId, content.trim())
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this note?')) return
    setDeleting(true)
    await deleteNote(note.id, projectId)
  }

  return (
    <div className="bg-white border rounded-xl p-4 shadow-sm space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">{author.name}</p>
        <div className="flex items-center gap-3">
          <p className="text-xs text-gray-400">{new Date(note.created_at).toLocaleString()}</p>
          {!editing && (
            <div className="flex gap-2">
              <button onClick={() => setEditing(true)} className="text-xs text-blue-500 hover:text-blue-700">Edit</button>
              <button onClick={handleDelete} disabled={deleting} className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50">
                {deleting ? '…' : 'Delete'}
              </button>
            </div>
          )}
        </div>
      </div>

      {editing ? (
        <div className="space-y-2">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={3}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving} className="bg-[#1e3a5f] text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-[#162d4a] disabled:opacity-50">
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button onClick={() => { setEditing(false); setContent(note.content) }} className="border px-4 py-1.5 rounded-lg text-sm hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-700 whitespace-pre-wrap">{content}</p>
      )}
    </div>
  )
}
