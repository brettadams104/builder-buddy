import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export default async function TeamPage() {
  const supabase = await createClient()
  const adminClient = createAdminClient()

  const { data: profiles } = await supabase.from('profiles').select('*').order('name')
  const { data: { users } } = await adminClient.auth.admin.listUsers()
  const emailMap = Object.fromEntries(users.map(u => [u.id, u.email ?? '']))

  async function createMember(formData: FormData) {
    'use server'
    const email = formData.get('email') as string
    const name = formData.get('name') as string
    const password = formData.get('password') as string
    if (!email || !name || !password) return
    const adminClient = createAdminClient()
    const { data, error } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    })
    if (error) throw new Error(error.message)
    const supabase = await createClient()
    await supabase.from('profiles').update({ name }).eq('id', data.user.id)
    revalidatePath('/dashboard/team')
  }

  async function updateName(formData: FormData) {
    'use server'
    const id = formData.get('id') as string
    const name = formData.get('name') as string
    if (!name?.trim()) return
    const supabase = await createClient()
    await supabase.from('profiles').update({ name: name.trim() }).eq('id', id)
    revalidatePath('/dashboard/team')
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Team</h1>

      <div className="border rounded-xl bg-white shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b font-semibold text-sm">Members</div>
        <ul>
          {profiles?.map(p => (
            <li key={p.id} className="px-4 py-3 border-b last:border-0 space-y-2">
              <div>
                <p className="text-sm font-medium">{p.name}</p>
                <p className="text-xs text-gray-500">{emailMap[p.id]}</p>
              </div>
              <form action={updateName} className="flex gap-2">
                <input type="hidden" name="id" value={p.id} />
                <input
                  name="name"
                  type="text"
                  defaultValue={p.name}
                  placeholder="Update name..."
                  className="flex-1 border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button type="submit" className="bg-[#1e3a5f] text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-[#162d4a]">
                  Save
                </button>
              </form>
            </li>
          ))}
        </ul>
      </div>

      <div className="border rounded-xl bg-white shadow-sm p-4 space-y-3">
        <h2 className="font-semibold text-sm">Add Team Member</h2>
        <p className="text-xs text-gray-500">Creates the account immediately — no email sent. Share the credentials with them directly.</p>
        <form action={createMember} className="space-y-3">
          <input name="name" type="text" placeholder="Full name" required className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input name="email" type="email" placeholder="Email address" required className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input name="password" type="text" placeholder="Temporary password" required className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <button type="submit" className="w-full bg-[#1e3a5f] text-white rounded-lg py-2 text-sm font-medium hover:bg-[#162d4a]">
            Create Account
          </button>
        </form>
      </div>
    </div>
  )
}
