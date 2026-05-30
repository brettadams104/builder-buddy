import { createClient } from '@/lib/supabase/server'
import { attachContact, detachContact } from '@/lib/actions/contacts'
import { ContactCard } from '@/components/contact-card'
import type { Contact } from '@/lib/types'

export default async function ProjectContactsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: attached }, { data: all }] = await Promise.all([
    supabase.from('project_contacts').select('contact_id, contacts(*)').eq('project_id', id),
    supabase.from('contacts').select('*').order('name'),
  ])

  const attachedIds = new Set((attached ?? []).map(r => r.contact_id))
  const attachedContacts = (attached ?? []).map(r => r.contacts as unknown as Contact)
  const unattached = (all ?? []).filter(c => !attachedIds.has(c.id)) as Contact[]

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-semibold mb-3">On This Job</h2>
        {!attachedContacts.length && <p className="text-gray-500 text-sm">No contacts attached yet.</p>}
        <div className="space-y-3">
          {attachedContacts.map(c => (
            <div key={c.id} className="space-y-1">
              <ContactCard contact={c} />
              <form action={async () => { 'use server'; await detachContact(id, c.id) }}>
                <button type="submit" className="text-xs text-red-500 hover:text-red-700 px-1">Remove from job</button>
              </form>
            </div>
          ))}
        </div>
      </div>

      {unattached.length > 0 && (
        <div>
          <h2 className="font-semibold mb-3">Add from Directory</h2>
          <div className="space-y-2">
            {unattached.map(c => (
              <div key={c.id} className="flex items-center justify-between bg-white border rounded-xl px-4 py-3 shadow-sm">
                <div>
                  <p className="text-sm font-medium">{c.name}</p>
                  <p className="text-xs text-gray-500">{c.trade}{c.company ? ` · ${c.company}` : ''}</p>
                </div>
                <form action={async () => { 'use server'; await attachContact(id, c.id) }}>
                  <button type="submit" className="text-sm text-[#1e3a5f] font-medium hover:underline">+ Attach</button>
                </form>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
