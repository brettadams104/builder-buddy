import { createClient } from '@/lib/supabase/server'
import { ContactCard } from '@/components/contact-card'
import Link from 'next/link'
import type { Contact } from '@/lib/types'

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ trade?: string }>
}) {
  const { trade } = await searchParams
  const supabase = await createClient()

  const { data: contacts } = await supabase.from('contacts').select('*').order('name')
  const trades = Array.from(new Set((contacts ?? []).map(c => c.trade))).sort()
  const filtered = trade ? (contacts ?? []).filter(c => c.trade === trade) : (contacts ?? [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Contacts</h1>
        <Link href="/contacts/new" className="bg-[#1e3a5f] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#162d4a]">
          + Add
        </Link>
      </div>

      {trades.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <Link href="/contacts" className={`px-3 py-1 rounded-full text-sm border ${!trade ? 'bg-[#1e3a5f] text-white border-[#1e3a5f]' : 'bg-white text-gray-700 hover:border-blue-400'}`}>
            All
          </Link>
          {trades.map(t => (
            <Link key={t} href={`/contacts?trade=${encodeURIComponent(t)}`} className={`px-3 py-1 rounded-full text-sm border ${trade === t ? 'bg-[#1e3a5f] text-white border-[#1e3a5f]' : 'bg-white text-gray-700 hover:border-blue-400'}`}>
              {t}
            </Link>
          ))}
        </div>
      )}

      {!filtered.length && <p className="text-gray-500 text-sm text-center py-8">No contacts yet.</p>}

      <div className="space-y-3">
        {filtered.map(c => <ContactCard key={c.id} contact={c as Contact} />)}
      </div>
    </div>
  )
}
