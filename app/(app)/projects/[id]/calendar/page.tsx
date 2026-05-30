import { createClient } from '@/lib/supabase/server'
import { createEvent, deleteEvent } from '@/lib/actions/events'

export default async function CalendarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('project_id', id)
    .order('event_date', { ascending: true })

  async function handleCreate(formData: FormData) {
    'use server'
    await createEvent({
      projectId: id,
      title: formData.get('title') as string,
      eventDate: formData.get('event_date') as string,
      eventTime: (formData.get('event_time') as string) || null,
    })
  }

  return (
    <div className="space-y-4">
      <form action={handleCreate} className="bg-white border rounded-xl p-4 shadow-sm space-y-3">
        <h2 className="font-semibold text-sm">Add Event</h2>
        <input name="title" type="text" placeholder="Event title" required className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <div className="grid grid-cols-2 gap-2">
          <input name="event_date" type="date" required className="border rounded-lg px-3 py-2 text-sm" />
          <input name="event_time" type="time" className="border rounded-lg px-3 py-2 text-sm" />
        </div>
        <button type="submit" className="w-full bg-[#1e3a5f] text-white rounded-lg py-2 text-sm font-medium hover:bg-[#162d4a]">
          Add Event
        </button>
      </form>

      {!events?.length && <p className="text-gray-500 text-sm text-center py-8">No events scheduled.</p>}

      <ul className="space-y-2">
        {events?.map(event => (
          <li key={event.id} className="flex items-center justify-between bg-white border rounded-xl px-4 py-3 shadow-sm">
            <div>
              <p className="text-sm font-medium">{event.title}</p>
              <p className="text-xs text-gray-500">
                {new Date(event.event_date).toLocaleDateString()}
                {event.event_time && ` at ${event.event_time.slice(0, 5)}`}
              </p>
            </div>
            <form action={async () => { 'use server'; await deleteEvent(event.id, id) }}>
              <button type="submit" className="text-xs text-red-500 hover:text-red-700">Remove</button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  )
}
