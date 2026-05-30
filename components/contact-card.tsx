import type { Contact } from '@/lib/types'

export function ContactCard({ contact }: { contact: Contact }) {
  return (
    <div className="bg-white border rounded-xl p-4 shadow-sm space-y-1">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold text-sm">{contact.name}</p>
          {contact.company && <p className="text-xs text-gray-500">{contact.company}</p>}
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{contact.trade}</span>
        </div>
        <a href={`tel:${contact.phone}`} className="text-[#1e3a5f] text-sm font-medium hover:underline shrink-0 ml-2">
          {contact.phone}
        </a>
      </div>
      {contact.notes && <p className="text-xs text-gray-500 pt-1">{contact.notes}</p>}
    </div>
  )
}
