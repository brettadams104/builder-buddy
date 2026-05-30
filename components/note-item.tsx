import type { Note, Profile } from '@/lib/types'

interface Props {
  note: Note
  author: Pick<Profile, 'name'>
}

export function NoteItem({ note, author }: Props) {
  return (
    <div className="bg-white border rounded-xl p-4 shadow-sm space-y-1">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">{author.name}</p>
        <p className="text-xs text-gray-400">
          {new Date(note.created_at).toLocaleString()}
        </p>
      </div>
      <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.content}</p>
    </div>
  )
}
