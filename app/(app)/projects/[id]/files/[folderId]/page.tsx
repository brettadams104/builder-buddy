import { createClient } from '@/lib/supabase/server'
import { uploadFile, deleteFile } from '@/lib/actions/files'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function FolderPage({
  params,
}: {
  params: Promise<{ id: string; folderId: string }>
}) {
  const { id, folderId } = await params
  const supabase = await createClient()

  const { data: folder } = await supabase.from('folders').select('*').eq('id', folderId).eq('project_id', id).single()
  if (!folder) notFound()

  const { data: files } = await supabase
    .from('files')
    .select('*')
    .eq('folder_id', folderId)
    .order('created_at', { ascending: false })

  async function handleUpload(formData: FormData) {
    'use server'
    await uploadFile(folderId, id, formData)
  }

  return (
    <div className="space-y-4">
      <Link href={`/projects/${id}/files`} className="text-blue-600 hover:underline text-sm">← Files</Link>
      <h2 className="font-semibold">{folder.name}</h2>

      <form action={handleUpload} className="flex gap-2 items-center">
        <input name="file" type="file" accept="image/*,.pdf,.doc,.docx" className="flex-1 text-sm" />
        <button type="submit" className="bg-[#1e3a5f] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#162d4a] shrink-0">
          Upload
        </button>
      </form>

      {!files?.length && <p className="text-gray-500 text-sm text-center py-8">No files yet.</p>}

      <div className="grid grid-cols-2 gap-3">
        {files?.map(file => (
          <div key={file.id} className="border rounded-xl overflow-hidden bg-white shadow-sm">
            {file.file_type === 'image' ? (
              <a href={file.url} target="_blank" rel="noopener noreferrer">
                <img src={file.url} alt={file.name} className="w-full h-32 object-cover" />
              </a>
            ) : (
              <a href={file.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center h-32 bg-gray-50">
                <span className="text-3xl">📄</span>
              </a>
            )}
            <div className="p-2 flex items-center justify-between">
              <p className="text-xs text-gray-700 truncate">{file.name}</p>
              <form action={async () => { 'use server'; await deleteFile(file.id, folderId, id) }}>
                <button type="submit" className="text-xs text-red-500 hover:text-red-700 ml-1 shrink-0">✕</button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
