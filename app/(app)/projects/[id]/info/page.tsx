import { createClient } from '@/lib/supabase/server'
import { updateProjectInfo } from '@/lib/actions/projects'
import { notFound } from 'next/navigation'

export default async function InfoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: project } = await supabase.from('projects').select('*').eq('id', id).single()
  if (!project) notFound()

  async function handleSave(formData: FormData) {
    'use server'
    await updateProjectInfo(id, {
      owner_name: (formData.get('owner_name') as string) || null,
      garage_pin: (formData.get('garage_pin') as string) || null,
      info_notes: (formData.get('info_notes') as string) || null,
    })
  }

  return (
    <div className="space-y-4">
      <form action={handleSave} className="space-y-4">

        <div className="bg-white border rounded-xl p-4 shadow-sm space-y-4">
          <h2 className="font-semibold text-sm text-gray-700 uppercase tracking-wide">Project Details</h2>

          <div>
            <label className="block text-sm font-medium mb-1">Owner Name</label>
            <input
              name="owner_name"
              type="text"
              defaultValue={project.owner_name ?? ''}
              placeholder="e.g. John & Sarah Smith"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Garage / Gate PIN</label>
            <input
              name="garage_pin"
              type="text"
              defaultValue={project.garage_pin ?? ''}
              placeholder="e.g. 1234"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="bg-white border rounded-xl p-4 shadow-sm space-y-3">
          <h2 className="font-semibold text-sm text-gray-700 uppercase tracking-wide">General Notes</h2>
          <textarea
            name="info_notes"
            rows={6}
            defaultValue={project.info_notes ?? ''}
            placeholder="Overview, special instructions, key details about this project..."
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-[#1e3a5f] text-white rounded-xl py-3 font-semibold hover:bg-[#162d4a]"
        >
          Save
        </button>
      </form>
    </div>
  )
}
