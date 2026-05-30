# BuilderBuddy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build BuilderBuddy — an internal project communication tool for small custom home builders with projects, notes, tasks, calendar, file storage, contacts, and a lookbook.

**Architecture:** Next.js 16 App Router with server components for data fetching and client components only where interactivity is needed. Supabase handles auth, database, and file storage. All routes protected by middleware.

**Tech Stack:** Next.js 16.2.6, Supabase (auth + postgres + storage), Tailwind CSS v4, Twilio (SMS), Vercel (deploy), Vitest (tests)

---

## File Map

```
app/
  layout.tsx                        # Root layout, imports globals.css
  page.tsx                          # Redirects to /dashboard
  globals.css                       # Tailwind import, base styles
  (auth)/login/page.tsx             # Login form
  dashboard/
    layout.tsx                      # App shell — navy header, hamburger nav
    nav.tsx                         # Hamburger nav (client component)
    page.tsx                        # Home: project cards + master calendar + my tasks
  projects/
    new/page.tsx                    # Create project form
    [id]/layout.tsx                 # Project shell with tab bar
    [id]/page.tsx                   # Redirects to /projects/[id]/notes
    [id]/notes/page.tsx             # Notes feed + add note form
    [id]/tasks/page.tsx             # Task list + add task form
    [id]/tasks/task-status-button.tsx  # Client component: status toggle
    [id]/calendar/page.tsx          # Project calendar + add event
    [id]/files/page.tsx             # Folder list + create folder
    [id]/files/[folderId]/page.tsx  # Files in folder + upload
    [id]/contacts/page.tsx          # Attached contacts + attach from directory
  contacts/
    page.tsx                        # Full directory, filterable by trade
    new/page.tsx                    # Add contact form
  lookbook/
    page.tsx                        # House cards + room-type filter
    new/page.tsx                    # Add lookbook home
    [id]/page.tsx                   # Room folders for one home
    [id]/new-room/page.tsx          # Add room to home
    [id]/[roomId]/page.tsx          # Photo grid for one room
components/
  project-card.tsx                  # Card shown on home screen
  task-item.tsx                     # Single task row
  note-item.tsx                     # Single note row
  priority-badge.tsx                # Urgent/Moderate/Low pill
  calendar-grid.tsx                 # Month-view calendar (client component)
lib/
  types.ts                          # All TS interfaces
  supabase/server.ts                # createServerClient helper
  supabase/client.ts                # createBrowserClient helper
  supabase/admin.ts                 # Service role client
  actions/projects.ts               # createProject, archiveProject
  actions/notes.ts                  # addNote
  actions/tasks.ts                  # createTask, updateTaskStatus
  actions/events.ts                 # createEvent, deleteEvent
  actions/files.ts                  # createFolder, uploadFile, deleteFile
  actions/contacts.ts               # createContact, attachContact, detachContact
  actions/lookbook.ts               # createHome, createRoom, uploadPhoto
  notifications/sms.ts              # sendUrgentTaskSMS
supabase/migrations/
  20260529000001_initial_schema.sql
  20260529000002_rls_policies.sql
  20260529000003_storage_policies.sql
middleware.ts                       # Protect all routes except /login
AGENTS.md                           # Next.js 16 warning (same as taxidermy portal)
```

---

## Task 1: Scaffold Project

**Files:**
- Create: `package.json`, `tsconfig.json`, `AGENTS.md`, `app/globals.css`, `app/layout.tsx`, `app/page.tsx`, `.env.local.example`

- [ ] **Step 1: Create the project**
```bash
cd /Users/sydneycollins/Desktop
npx create-next-app@16.2.6 builder-buddy --typescript --tailwind --app --no-src-dir --no-import-alias
cd builder-buddy
```

- [ ] **Step 2: Install dependencies**
```bash
npm install @supabase/ssr @supabase/supabase-js twilio
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
```

- [ ] **Step 3: Write AGENTS.md**
```markdown
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
```

- [ ] **Step 4: Write vitest.config.ts**
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
  },
})
```

- [ ] **Step 5: Write vitest.setup.ts**
```typescript
import '@testing-library/jest-dom'
```

- [ ] **Step 6: Write .env.local.example**
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
NEXT_PUBLIC_APP_NAME=BuilderBuddy
```

- [ ] **Step 7: Update globals.css — remove dark mode media query**
```css
@import "tailwindcss";

body {
  font-family: Arial, Helvetica, sans-serif;
}
```

- [ ] **Step 8: Write app/layout.tsx**
```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'BuilderBuddy',
  description: 'Project communication for custom home builders',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 text-gray-900`}>
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 9: Write app/page.tsx**
```typescript
import { redirect } from 'next/navigation'

export default function RootPage() {
  redirect('/dashboard')
}
```

- [ ] **Step 10: Commit**
```bash
git add -A
git commit -m "feat: scaffold Next.js project with dependencies"
```

---

## Task 2: Database Schema

**Files:**
- Create: `supabase/migrations/20260529000001_initial_schema.sql`
- Create: `supabase/migrations/20260529000002_rls_policies.sql`
- Create: `supabase/migrations/20260529000003_storage_policies.sql`

- [ ] **Step 1: Write initial schema**

Create `supabase/migrations/20260529000001_initial_schema.sql`:
```sql
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  phone text,
  created_at timestamptz not null default now()
);

create table public.projects (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  address text not null,
  color text not null default '#2563eb',
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now()
);

create table public.notes (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  author_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamptz not null default now()
);

create table public.tasks (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  title text not null,
  assignee_id uuid references public.profiles(id) on delete cascade not null,
  priority text not null check (priority in ('urgent', 'moderate', 'low')),
  status text not null default 'not_done' check (status in ('not_done', 'done', 'rescheduled')),
  due_date date,
  created_at timestamptz not null default now()
);

create table public.events (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  title text not null,
  event_date date not null,
  event_time time,
  contact_id uuid,
  created_at timestamptz not null default now()
);

create table public.folders (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  name text not null,
  created_at timestamptz not null default now()
);

create table public.files (
  id uuid default gen_random_uuid() primary key,
  folder_id uuid references public.folders(id) on delete cascade not null,
  name text not null,
  url text not null,
  file_type text not null check (file_type in ('image', 'document')),
  created_at timestamptz not null default now()
);

create table public.contacts (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  company text,
  trade text not null,
  phone text not null,
  notes text,
  created_at timestamptz not null default now()
);

create table public.project_contacts (
  project_id uuid references public.projects(id) on delete cascade not null,
  contact_id uuid references public.contacts(id) on delete cascade not null,
  primary key (project_id, contact_id)
);

create table public.lookbook_homes (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  address text not null,
  year integer,
  hero_photo_url text,
  created_at timestamptz not null default now()
);

create table public.lookbook_rooms (
  id uuid default gen_random_uuid() primary key,
  home_id uuid references public.lookbook_homes(id) on delete cascade not null,
  room_type text not null,
  created_at timestamptz not null default now()
);

create table public.lookbook_photos (
  id uuid default gen_random_uuid() primary key,
  room_id uuid references public.lookbook_rooms(id) on delete cascade not null,
  url text not null,
  created_at timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', 'Team Member'));
  return new;
end;
$$ language plpgsql security definer set search_path = public, pg_catalog;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create index on public.notes (project_id);
create index on public.tasks (project_id);
create index on public.tasks (assignee_id);
create index on public.events (project_id);
create index on public.events (event_date);
create index on public.folders (project_id);
```

- [ ] **Step 2: Write RLS policies**

Create `supabase/migrations/20260529000002_rls_policies.sql`:
```sql
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.notes enable row level security;
alter table public.tasks enable row level security;
alter table public.events enable row level security;
alter table public.folders enable row level security;
alter table public.files enable row level security;
alter table public.contacts enable row level security;
alter table public.project_contacts enable row level security;
alter table public.lookbook_homes enable row level security;
alter table public.lookbook_rooms enable row level security;
alter table public.lookbook_photos enable row level security;

-- All authenticated users can read and write everything (internal tool, no roles)
create policy "authenticated_all" on public.profiles for all to authenticated using (true) with check (true);
create policy "authenticated_all" on public.projects for all to authenticated using (true) with check (true);
create policy "authenticated_all" on public.notes for all to authenticated using (true) with check (true);
create policy "authenticated_all" on public.tasks for all to authenticated using (true) with check (true);
create policy "authenticated_all" on public.events for all to authenticated using (true) with check (true);
create policy "authenticated_all" on public.folders for all to authenticated using (true) with check (true);
create policy "authenticated_all" on public.files for all to authenticated using (true) with check (true);
create policy "authenticated_all" on public.contacts for all to authenticated using (true) with check (true);
create policy "authenticated_all" on public.project_contacts for all to authenticated using (true) with check (true);
create policy "authenticated_all" on public.lookbook_homes for all to authenticated using (true) with check (true);
create policy "authenticated_all" on public.lookbook_rooms for all to authenticated using (true) with check (true);
create policy "authenticated_all" on public.lookbook_photos for all to authenticated using (true) with check (true);
```

- [ ] **Step 3: Write storage policies**

Create `supabase/migrations/20260529000003_storage_policies.sql`:
```sql
insert into storage.buckets (id, name, public) values ('project-files', 'project-files', true);
insert into storage.buckets (id, name, public) values ('lookbook-photos', 'lookbook-photos', true);

create policy "authenticated_upload_project_files"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'project-files');

create policy "public_read_project_files"
  on storage.objects for select
  using (bucket_id = 'project-files');

create policy "authenticated_delete_project_files"
  on storage.objects for delete to authenticated
  using (bucket_id = 'project-files');

create policy "authenticated_upload_lookbook"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'lookbook-photos');

create policy "public_read_lookbook"
  on storage.objects for select
  using (bucket_id = 'lookbook-photos');

create policy "authenticated_delete_lookbook"
  on storage.objects for delete to authenticated
  using (bucket_id = 'lookbook-photos');
```

- [ ] **Step 4: Commit**
```bash
git add supabase/
git commit -m "feat: add database schema and RLS policies"
```

---

## Task 3: Supabase Clients + Types + Middleware

**Files:**
- Create: `lib/types.ts`
- Create: `lib/supabase/server.ts`
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/admin.ts`
- Create: `middleware.ts`

- [ ] **Step 1: Write lib/types.ts**
```typescript
export interface Profile {
  id: string
  name: string
  phone: string | null
  created_at: string
}

export type ProjectStatus = 'active' | 'archived'
export type Priority = 'urgent' | 'moderate' | 'low'
export type TaskStatus = 'not_done' | 'done' | 'rescheduled'

export const PROJECT_COLORS = [
  '#2563eb', '#16a34a', '#dc2626', '#d97706',
  '#7c3aed', '#db2777', '#0891b2', '#65a30d',
]

export interface Project {
  id: string
  name: string
  address: string
  color: string
  status: ProjectStatus
  created_at: string
}

export interface Note {
  id: string
  project_id: string
  author_id: string
  content: string
  created_at: string
}

export interface Task {
  id: string
  project_id: string
  title: string
  assignee_id: string
  priority: Priority
  status: TaskStatus
  due_date: string | null
  created_at: string
}

export interface CalendarEvent {
  id: string
  project_id: string
  title: string
  event_date: string
  event_time: string | null
  contact_id: string | null
  created_at: string
}

export interface Folder {
  id: string
  project_id: string
  name: string
  created_at: string
}

export interface ProjectFile {
  id: string
  folder_id: string
  name: string
  url: string
  file_type: 'image' | 'document'
  created_at: string
}

export interface Contact {
  id: string
  name: string
  company: string | null
  trade: string
  phone: string
  notes: string | null
  created_at: string
}

export interface LookbookHome {
  id: string
  name: string
  address: string
  year: number | null
  hero_photo_url: string | null
  created_at: string
}

export interface LookbookRoom {
  id: string
  home_id: string
  room_type: string
  created_at: string
}

export interface LookbookPhoto {
  id: string
  room_id: string
  url: string
  created_at: string
}
```

- [ ] **Step 2: Write lib/supabase/server.ts**

Read `node_modules/next/dist/docs/` for the correct cookie API before writing. Then:
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
```

- [ ] **Step 3: Write lib/supabase/client.ts**
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 4: Write lib/supabase/admin.ts**
```typescript
import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
```

- [ ] **Step 5: Write middleware.ts**

Read `node_modules/next/dist/docs/` for proxy/middleware conventions. Then:
```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  if (!user && !pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

- [ ] **Step 6: Commit**
```bash
git add lib/ middleware.ts
git commit -m "feat: add Supabase clients, types, and auth middleware"
```

---

## Task 4: Auth — Login Page

**Files:**
- Create: `app/(auth)/login/page.tsx`

- [ ] **Step 1: Write login page**
```typescript
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm space-y-6">
        <div>
          <h1 className="text-2xl font-bold">BuilderBuddy</h1>
          <p className="text-gray-600 text-sm mt-1">Sign in to your account</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 bg-white border rounded-xl p-6 shadow-sm">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1e3a5f] text-white rounded-lg py-2 font-medium hover:bg-[#162d4a] disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify build passes**
```bash
npm run build
```
Expected: clean build, `/login` route appears as static.

- [ ] **Step 3: Commit**
```bash
git add app/
git commit -m "feat: add login page"
```

---

## Task 5: App Shell — Layout + Nav

**Files:**
- Create: `app/dashboard/layout.tsx`
- Create: `app/dashboard/nav.tsx`

- [ ] **Step 1: Write nav.tsx (hamburger menu)**
```typescript
'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

interface Props {
  signOut: () => Promise<void>
}

export function Nav({ signOut }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
        aria-label="Menu"
      >
        <span className="block w-5 h-0.5 bg-white mb-1" />
        <span className="block w-5 h-0.5 bg-white mb-1" />
        <span className="block w-5 h-0.5 bg-white" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white border rounded-xl shadow-lg overflow-hidden z-20">
          <Link href="/dashboard" onClick={() => setOpen(false)} className="block px-4 py-3 text-sm hover:bg-gray-50 border-b">Dashboard</Link>
          <Link href="/contacts" onClick={() => setOpen(false)} className="block px-4 py-3 text-sm hover:bg-gray-50 border-b">Contacts</Link>
          <Link href="/lookbook" onClick={() => setOpen(false)} className="block px-4 py-3 text-sm hover:bg-gray-50 border-b">Lookbook</Link>
          <form action={signOut}>
            <button type="submit" className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-gray-50">Sign Out</button>
          </form>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Write dashboard/layout.tsx**
```typescript
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Nav } from './nav'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  async function signOut() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-[#1e3a5f] px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <Link href="/dashboard" className="font-bold text-lg text-white">BuilderBuddy</Link>
        <Nav signOut={signOut} />
      </header>
      <main className="flex-1 max-w-2xl mx-auto w-full p-4">
        {children}
      </main>
    </div>
  )
}
```

- [ ] **Step 3: Commit**
```bash
git add app/dashboard/
git commit -m "feat: add app shell with navy header and hamburger nav"
```

---

## Task 6: Home Screen

**Files:**
- Create: `app/dashboard/page.tsx`
- Create: `components/project-card.tsx`
- Create: `components/calendar-grid.tsx`
- Create: `components/task-item.tsx`
- Create: `components/priority-badge.tsx`

- [ ] **Step 1: Write components/priority-badge.tsx**
```typescript
import type { Priority } from '@/lib/types'

export function PriorityBadge({ priority }: { priority: Priority }) {
  const styles = {
    urgent: 'bg-red-100 text-red-700',
    moderate: 'bg-yellow-100 text-yellow-700',
    low: 'bg-gray-100 text-gray-600',
  }
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles[priority]}`}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  )
}
```

- [ ] **Step 2: Write components/project-card.tsx**
```typescript
import Link from 'next/link'
import type { Project } from '@/lib/types'

interface Props {
  project: Project
  urgentCount: number
}

export function ProjectCard({ project, urgentCount }: Props) {
  return (
    <Link
      href={`/projects/${project.id}/notes`}
      className="shrink-0 w-56 border rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-2">
        <span className="w-3 h-3 rounded-full mt-1 shrink-0" style={{ backgroundColor: project.color }} />
        {urgentCount > 0 && (
          <span className="text-xs bg-red-100 text-red-700 font-medium px-1.5 py-0.5 rounded-full">
            {urgentCount} urgent
          </span>
        )}
      </div>
      <p className="font-semibold text-sm leading-tight">{project.name}</p>
      <p className="text-xs text-gray-500 mt-1 leading-tight">{project.address}</p>
    </Link>
  )
}
```

- [ ] **Step 3: Write components/task-item.tsx**
```typescript
import Link from 'next/link'
import type { Task } from '@/lib/types'
import { PriorityBadge } from './priority-badge'

interface Props {
  task: Task
  projectName: string
}

export function TaskItem({ task, projectName }: Props) {
  return (
    <Link
      href={`/projects/${task.project_id}/tasks`}
      className="flex items-start justify-between p-3 bg-white border rounded-xl hover:border-blue-400 transition-colors"
    >
      <div className="space-y-1">
        <p className="text-sm font-medium">{task.title}</p>
        <p className="text-xs text-gray-500">{projectName}</p>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0 ml-3">
        <PriorityBadge priority={task.priority} />
        {task.due_date && (
          <p className="text-xs text-gray-400">{new Date(task.due_date).toLocaleDateString()}</p>
        )}
      </div>
    </Link>
  )
}
```

- [ ] **Step 4: Write components/calendar-grid.tsx**
```typescript
'use client'

import { useState } from 'react'
import type { CalendarEvent, Project } from '@/lib/types'

interface Props {
  events: (CalendarEvent & { project: Pick<Project, 'color' | 'name'> })[]
}

export function CalendarGrid({ events }: Props) {
  const [current, setCurrent] = useState(() => new Date())

  const year = current.getFullYear()
  const month = current.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const monthLabel = current.toLocaleString('default', { month: 'long', year: 'numeric' })

  const eventsByDate = events.reduce<Record<string, typeof events>>((acc, e) => {
    const d = e.event_date
    if (!acc[d]) acc[d] = []
    acc[d].push(e)
    return acc
  }, {})

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  const today = new Date()
  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear()

  function prevMonth() {
    setCurrent(new Date(year, month - 1, 1))
  }
  function nextMonth() {
    setCurrent(new Date(year, month + 1, 1))
  }

  function dateKey(day: number) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  return (
    <div className="border rounded-xl bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <button onClick={prevMonth} className="text-gray-500 hover:text-gray-900 px-2">‹</button>
        <p className="font-semibold text-sm">{monthLabel}</p>
        <button onClick={nextMonth} className="text-gray-500 hover:text-gray-900 px-2">›</button>
      </div>
      <div className="grid grid-cols-7 text-center">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
          <div key={d} className="text-xs text-gray-400 py-1">{d}</div>
        ))}
        {cells.map((day, i) => {
          const key = day ? dateKey(day) : null
          const dayEvents = key ? (eventsByDate[key] ?? []) : []
          return (
            <div key={i} className={`min-h-10 p-1 border-t ${day && isToday(day) ? 'bg-blue-50' : ''}`}>
              {day && (
                <>
                  <p className={`text-xs mb-0.5 ${isToday(day) ? 'font-bold text-blue-600' : 'text-gray-700'}`}>
                    {day}
                  </p>
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 2).map(e => (
                      <div
                        key={e.id}
                        className="text-xs truncate rounded px-1 text-white leading-4"
                        style={{ backgroundColor: e.project.color }}
                        title={`${e.title} — ${e.project.name}`}
                      >
                        {e.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <p className="text-xs text-gray-400">+{dayEvents.length - 2}</p>
                    )}
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Write app/dashboard/page.tsx**
```typescript
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ProjectCard } from '@/components/project-card'
import { CalendarGrid } from '@/components/calendar-grid'
import { TaskItem } from '@/components/task-item'
import type { CalendarEvent, Project } from '@/lib/types'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: projects }, { data: tasks }, { data: events }] = await Promise.all([
    supabase.from('projects').select('*').eq('status', 'active').order('created_at'),
    supabase.from('tasks').select('*, projects(name)').eq('assignee_id', user!.id).eq('status', 'not_done').order('created_at'),
    supabase.from('events').select('*, projects(color, name)').order('event_date'),
  ])

  const urgentCountByProject = (tasks ?? []).reduce<Record<string, number>>((acc, t) => {
    if (t.priority === 'urgent') acc[t.project_id] = (acc[t.project_id] ?? 0) + 1
    return acc
  }, {})

  const enrichedEvents = (events ?? []).map(e => ({
    ...e,
    project: e.projects as { color: string; name: string },
  })) as (CalendarEvent & { project: { color: string; name: string } })[]

  const priorityOrder = { urgent: 0, moderate: 1, low: 2 }
  const sortedTasks = [...(tasks ?? [])].sort(
    (a, b) => priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder]
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Link href="/projects/new" className="bg-[#1e3a5f] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#162d4a]">
          + New Project
        </Link>
      </div>

      {/* Project cards */}
      <div>
        <h2 className="font-semibold mb-3">Active Projects</h2>
        {!projects?.length ? (
          <p className="text-gray-500 text-sm">No active projects. Create one to get started.</p>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {projects.map(p => (
              <ProjectCard key={p.id} project={p as Project} urgentCount={urgentCountByProject[p.id] ?? 0} />
            ))}
          </div>
        )}
      </div>

      {/* Master calendar */}
      <div>
        <h2 className="font-semibold mb-3">Calendar</h2>
        <CalendarGrid events={enrichedEvents} />
      </div>

      {/* My tasks */}
      <div>
        <h2 className="font-semibold mb-3">My Tasks</h2>
        {!sortedTasks.length ? (
          <p className="text-gray-500 text-sm">No tasks assigned to you.</p>
        ) : (
          <div className="space-y-2">
            {sortedTasks.map(t => (
              <TaskItem
                key={t.id}
                task={t}
                projectName={(t.projects as { name: string })?.name ?? ''}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Verify build**
```bash
npm run build
```
Expected: clean build, `/dashboard` route appears.

- [ ] **Step 7: Commit**
```bash
git add app/dashboard/page.tsx components/
git commit -m "feat: add home screen with project cards, calendar, and my tasks"
```

---

## Task 7: Projects — Create + List

**Files:**
- Create: `app/projects/new/page.tsx`
- Create: `lib/actions/projects.ts`

- [ ] **Step 1: Write lib/actions/projects.ts**
```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function createProject(input: {
  name: string
  address: string
  color: string
}) {
  const supabase = await createClient()
  const { error } = await supabase.from('projects').insert(input)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard')
}

export async function archiveProject(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('projects').update({ status: 'archived' }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard')
}
```

- [ ] **Step 2: Write app/projects/new/page.tsx**
```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createProject } from '@/lib/actions/projects'
import { PROJECT_COLORS } from '@/lib/types'
import Link from 'next/link'

export default function NewProjectPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [color, setColor] = useState(PROJECT_COLORS[0])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const form = new FormData(e.currentTarget)
    try {
      await createProject({
        name: form.get('name') as string,
        address: form.get('address') as string,
        color,
      })
      router.push('/dashboard')
    } catch (err) {
      setError((err as Error).message)
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Link href="/dashboard" className="text-blue-600 hover:underline text-sm">← Dashboard</Link>
      <h1 className="text-2xl font-bold">New Project</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white border rounded-xl p-4 shadow-sm">
        <div>
          <label className="block text-sm font-medium mb-1">Project Name</label>
          <input name="name" type="text" required className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Address</label>
          <input name="address" type="text" required className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Project Color</label>
          <div className="flex gap-2 flex-wrap">
            {PROJECT_COLORS.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-full border-2 transition-transform ${color === c ? 'border-gray-900 scale-110' : 'border-transparent'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button type="submit" disabled={loading} className="w-full bg-[#1e3a5f] text-white rounded-lg py-2 font-medium hover:bg-[#162d4a] disabled:opacity-50">
          {loading ? 'Creating...' : 'Create Project'}
        </button>
      </form>
    </div>
  )
}
```

- [ ] **Step 3: Commit**
```bash
git add app/projects/ lib/actions/projects.ts
git commit -m "feat: add create project page and action"
```

---

## Task 8: Project Shell — Layout + Tabs

**Files:**
- Create: `app/projects/[id]/layout.tsx`
- Create: `app/projects/[id]/page.tsx`

- [ ] **Step 1: Write app/projects/[id]/page.tsx**
```typescript
import { redirect } from 'next/navigation'

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  redirect(`/projects/${id}/notes`)
}
```

- [ ] **Step 2: Write app/projects/[id]/layout.tsx**
```typescript
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'

const TABS = ['notes', 'tasks', 'calendar', 'files', 'contacts'] as const

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: project } = await supabase.from('projects').select('*').eq('id', id).single()
  if (!project) notFound()

  return (
    <div className="space-y-4">
      <div>
        <Link href="/dashboard" className="text-blue-600 hover:underline text-sm">← Dashboard</Link>
        <h1 className="text-2xl font-bold mt-1">{project.name}</h1>
        <p className="text-sm text-gray-500">{project.address}</p>
      </div>

      <div className="flex gap-1 border-b overflow-x-auto">
        {TABS.map(tab => (
          <Link
            key={tab}
            href={`/projects/${id}/${tab}`}
            className="px-3 py-2 text-sm font-medium capitalize text-gray-600 hover:text-gray-900 whitespace-nowrap border-b-2 border-transparent hover:border-gray-300"
          >
            {tab}
          </Link>
        ))}
      </div>

      {children}
    </div>
  )
}
```

- [ ] **Step 3: Commit**
```bash
git add app/projects/
git commit -m "feat: add project shell with tab navigation"
```

---

## Task 9: Notes Tab

**Files:**
- Create: `app/projects/[id]/notes/page.tsx`
- Create: `lib/actions/notes.ts`
- Create: `components/note-item.tsx`

- [ ] **Step 1: Write lib/actions/notes.ts**
```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function addNote(projectId: string, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { error } = await supabase.from('notes').insert({
    project_id: projectId,
    author_id: user!.id,
    content,
  })
  if (error) throw new Error(error.message)
  revalidatePath(`/projects/${projectId}/notes`)
}
```

- [ ] **Step 2: Write components/note-item.tsx**
```typescript
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
```

- [ ] **Step 3: Write app/projects/[id]/notes/page.tsx**
```typescript
import { createClient } from '@/lib/supabase/server'
import { addNote } from '@/lib/actions/notes'
import { NoteItem } from '@/components/note-item'
import type { Note, Profile } from '@/lib/types'

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
            author={(note.profiles as { name: string })}
          />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Commit**
```bash
git add app/projects/ lib/actions/notes.ts components/note-item.tsx
git commit -m "feat: add notes tab with post and feed"
```

---

## Task 10: Tasks Tab + SMS Notification

**Files:**
- Create: `lib/notifications/sms.ts`
- Create: `lib/actions/tasks.ts`
- Create: `app/projects/[id]/tasks/page.tsx`
- Create: `app/projects/[id]/tasks/task-status-button.tsx`

- [ ] **Step 1: Write lib/notifications/sms.ts**
```typescript
import twilio from 'twilio'

export async function sendUrgentTaskSMS(toPhone: string, projectName: string, taskTitle: string) {
  if (!toPhone) return
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  await client.messages.create({
    body: `BuilderBuddy — ${projectName}: Urgent task assigned to you: "${taskTitle}"`,
    from: process.env.TWILIO_PHONE_NUMBER!,
    to: toPhone,
  })
}
```

- [ ] **Step 2: Write lib/actions/tasks.ts**
```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { sendUrgentTaskSMS } from '@/lib/notifications/sms'
import type { Priority, TaskStatus } from '@/lib/types'

export async function createTask(input: {
  projectId: string
  title: string
  assigneeId: string
  priority: Priority
  dueDate: string | null
}) {
  const supabase = await createClient()
  const { error } = await supabase.from('tasks').insert({
    project_id: input.projectId,
    title: input.title,
    assignee_id: input.assigneeId,
    priority: input.priority,
    due_date: input.dueDate,
  })
  if (error) throw new Error(error.message)

  if (input.priority === 'urgent') {
    const [{ data: profile }, { data: project }] = await Promise.all([
      supabase.from('profiles').select('phone').eq('id', input.assigneeId).single(),
      supabase.from('projects').select('name').eq('id', input.projectId).single(),
    ])
    if (profile?.phone && project?.name) {
      await sendUrgentTaskSMS(profile.phone, project.name, input.title).catch(() => {})
    }
  }

  revalidatePath(`/projects/${input.projectId}/tasks`)
  revalidatePath('/dashboard')
}

export async function updateTaskStatus(taskId: string, status: TaskStatus, projectId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('tasks').update({ status }).eq('id', taskId)
  if (error) throw new Error(error.message)
  revalidatePath(`/projects/${projectId}/tasks`)
  revalidatePath('/dashboard')
}
```

- [ ] **Step 3: Write app/projects/[id]/tasks/task-status-button.tsx**
```typescript
'use client'

import { useState } from 'react'
import { updateTaskStatus } from '@/lib/actions/tasks'
import type { TaskStatus } from '@/lib/types'

const STATUSES: TaskStatus[] = ['not_done', 'done', 'rescheduled']
const LABELS: Record<TaskStatus, string> = {
  not_done: 'Not Done',
  done: 'Done',
  rescheduled: 'Rescheduled',
}
const STYLES: Record<TaskStatus, string> = {
  not_done: 'bg-gray-100 text-gray-700',
  done: 'bg-green-100 text-green-700',
  rescheduled: 'bg-yellow-100 text-yellow-700',
}

export function TaskStatusButton({ taskId, status, projectId }: { taskId: string; status: TaskStatus; projectId: string }) {
  const [current, setCurrent] = useState(status)
  const [loading, setLoading] = useState(false)

  async function cycle() {
    const next = STATUSES[(STATUSES.indexOf(current) + 1) % STATUSES.length]
    setLoading(true)
    await updateTaskStatus(taskId, next, projectId)
    setCurrent(next)
    setLoading(false)
  }

  return (
    <button
      onClick={cycle}
      disabled={loading}
      className={`text-xs font-medium px-3 py-1 rounded-full ${STYLES[current]} disabled:opacity-50`}
    >
      {LABELS[current]}
    </button>
  )
}
```

- [ ] **Step 4: Write app/projects/[id]/tasks/page.tsx**
```typescript
import { createClient } from '@/lib/supabase/server'
import { createTask } from '@/lib/actions/tasks'
import { TaskStatusButton } from './task-status-button'
import { PriorityBadge } from '@/components/priority-badge'
import type { Priority, Task, Profile } from '@/lib/types'

export default async function TasksPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: tasks }, { data: members }] = await Promise.all([
    supabase.from('tasks').select('*, profiles(name)').eq('project_id', id).order('created_at', { ascending: false }),
    supabase.from('profiles').select('id, name'),
  ])

  const priorityOrder = { urgent: 0, moderate: 1, low: 2 }
  const sorted = [...(tasks ?? [])].sort(
    (a, b) => priorityOrder[a.priority as Priority] - priorityOrder[b.priority as Priority]
  )

  async function handleCreate(formData: FormData) {
    'use server'
    const title = formData.get('title') as string
    const assigneeId = formData.get('assignee_id') as string
    const priority = formData.get('priority') as Priority
    const dueDate = (formData.get('due_date') as string) || null
    if (!title?.trim() || !assigneeId || !priority) return
    await createTask({ projectId: id, title: title.trim(), assigneeId, priority, dueDate })
  }

  return (
    <div className="space-y-4">
      <form action={handleCreate} className="bg-white border rounded-xl p-4 shadow-sm space-y-3">
        <h2 className="font-semibold text-sm">Add Task</h2>
        <input name="title" type="text" placeholder="Task title" required className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <div className="grid grid-cols-2 gap-2">
          <select name="assignee_id" required className="border rounded-lg px-3 py-2 text-sm">
            <option value="">Assign to...</option>
            {members?.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <select name="priority" required className="border rounded-lg px-3 py-2 text-sm">
            <option value="">Priority...</option>
            <option value="urgent">Urgent</option>
            <option value="moderate">Moderate</option>
            <option value="low">Low</option>
          </select>
        </div>
        <input name="due_date" type="date" className="w-full border rounded-lg px-3 py-2 text-sm" />
        <button type="submit" className="w-full bg-[#1e3a5f] text-white rounded-lg py-2 text-sm font-medium hover:bg-[#162d4a]">
          Add Task
        </button>
      </form>

      {!sorted.length && <p className="text-gray-500 text-sm text-center py-8">No tasks yet.</p>}

      <div className="space-y-2">
        {sorted.map(task => (
          <div key={task.id} className="bg-white border rounded-xl p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1 min-w-0">
                <p className="text-sm font-medium">{task.title}</p>
                <p className="text-xs text-gray-500">→ {(task.profiles as { name: string })?.name}</p>
                {task.due_date && <p className="text-xs text-gray-400">{new Date(task.due_date).toLocaleDateString()}</p>}
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <PriorityBadge priority={task.priority as Priority} />
                <TaskStatusButton taskId={task.id} status={task.status as any} projectId={id} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Commit**
```bash
git add app/projects/ lib/actions/tasks.ts lib/notifications/
git commit -m "feat: add tasks tab with priority, assignment, status cycling, and urgent SMS"
```

---

## Task 11: Calendar Tab

**Files:**
- Create: `lib/actions/events.ts`
- Create: `app/projects/[id]/calendar/page.tsx`

- [ ] **Step 1: Write lib/actions/events.ts**
```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function createEvent(input: {
  projectId: string
  title: string
  eventDate: string
  eventTime: string | null
}) {
  const supabase = await createClient()
  const { error } = await supabase.from('events').insert({
    project_id: input.projectId,
    title: input.title,
    event_date: input.eventDate,
    event_time: input.eventTime || null,
  })
  if (error) throw new Error(error.message)
  revalidatePath(`/projects/${input.projectId}/calendar`)
  revalidatePath('/dashboard')
}

export async function deleteEvent(eventId: string, projectId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('events').delete().eq('id', eventId)
  if (error) throw new Error(error.message)
  revalidatePath(`/projects/${projectId}/calendar`)
  revalidatePath('/dashboard')
}
```

- [ ] **Step 2: Write app/projects/[id]/calendar/page.tsx**
```typescript
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
```

- [ ] **Step 3: Commit**
```bash
git add app/projects/ lib/actions/events.ts
git commit -m "feat: add calendar tab with event creation and deletion"
```

---

## Task 12: Files Tab

**Files:**
- Create: `lib/actions/files.ts`
- Create: `app/projects/[id]/files/page.tsx`
- Create: `app/projects/[id]/files/[folderId]/page.tsx`

- [ ] **Step 1: Write lib/actions/files.ts**
```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function createFolder(projectId: string, name: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('folders').insert({ project_id: projectId, name })
  if (error) throw new Error(error.message)
  revalidatePath(`/projects/${projectId}/files`)
}

export async function uploadFile(folderId: string, projectId: string, formData: FormData) {
  const file = formData.get('file') as File
  if (!file || file.size === 0) throw new Error('No file provided')

  const supabase = await createClient()
  const ext = file.name.split('.').pop()
  const path = `${folderId}/${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('project-files')
    .upload(path, file)
  if (uploadError) throw new Error(uploadError.message)

  const { data: { publicUrl } } = supabase.storage.from('project-files').getPublicUrl(path)

  const isImage = file.type.startsWith('image/')
  const { error } = await supabase.from('files').insert({
    folder_id: folderId,
    name: file.name,
    url: publicUrl,
    file_type: isImage ? 'image' : 'document',
  })
  if (error) throw new Error(error.message)
  revalidatePath(`/projects/${projectId}/files/${folderId}`)
}

export async function deleteFile(fileId: string, folderId: string, projectId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('files').delete().eq('id', fileId)
  if (error) throw new Error(error.message)
  revalidatePath(`/projects/${projectId}/files/${folderId}`)
}
```

- [ ] **Step 2: Write app/projects/[id]/files/page.tsx**
```typescript
import { createClient } from '@/lib/supabase/server'
import { createFolder } from '@/lib/actions/files'
import Link from 'next/link'

export default async function FilesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: folders } = await supabase
    .from('folders')
    .select('*, files(id)')
    .eq('project_id', id)
    .order('created_at')

  async function handleCreate(formData: FormData) {
    'use server'
    const name = formData.get('name') as string
    if (!name?.trim()) return
    await createFolder(id, name.trim())
  }

  return (
    <div className="space-y-4">
      <form action={handleCreate} className="flex gap-2">
        <input name="name" type="text" placeholder="New folder name..." className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <button type="submit" className="bg-[#1e3a5f] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#162d4a]">
          + Folder
        </button>
      </form>

      {!folders?.length && <p className="text-gray-500 text-sm text-center py-8">No folders yet.</p>}

      <div className="space-y-2">
        {folders?.map(folder => (
          <Link
            key={folder.id}
            href={`/projects/${id}/files/${folder.id}`}
            className="flex items-center justify-between bg-white border rounded-xl px-4 py-3 shadow-sm hover:border-blue-400 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">📁</span>
              <p className="font-medium text-sm">{folder.name}</p>
            </div>
            <p className="text-xs text-gray-400">{(folder.files as { id: string }[])?.length ?? 0} files</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Write app/projects/[id]/files/[folderId]/page.tsx**
```typescript
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

  const { data: folder } = await supabase.from('folders').select('*').eq('id', folderId).single()
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
```

- [ ] **Step 4: Commit**
```bash
git add app/projects/ lib/actions/files.ts
git commit -m "feat: add files tab with folder creation and file upload"
```

---

## Task 13: Contacts Directory + Project Contacts Tab

**Files:**
- Create: `lib/actions/contacts.ts`
- Create: `app/contacts/page.tsx`
- Create: `app/contacts/new/page.tsx`
- Create: `app/projects/[id]/contacts/page.tsx`
- Create: `components/contact-card.tsx`

- [ ] **Step 1: Write lib/actions/contacts.ts**
```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function createContact(input: {
  name: string
  company: string | null
  trade: string
  phone: string
  notes: string | null
}) {
  const supabase = await createClient()
  const { error } = await supabase.from('contacts').insert(input)
  if (error) throw new Error(error.message)
  revalidatePath('/contacts')
}

export async function attachContact(projectId: string, contactId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('project_contacts').insert({ project_id: projectId, contact_id: contactId })
  if (error && !error.message.includes('duplicate')) throw new Error(error.message)
  revalidatePath(`/projects/${projectId}/contacts`)
}

export async function detachContact(projectId: string, contactId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('project_contacts').delete().eq('project_id', projectId).eq('contact_id', contactId)
  if (error) throw new Error(error.message)
  revalidatePath(`/projects/${projectId}/contacts`)
}
```

- [ ] **Step 2: Write components/contact-card.tsx**
```typescript
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
```

- [ ] **Step 3: Write app/contacts/new/page.tsx**
```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createContact } from '@/lib/actions/contacts'
import Link from 'next/link'

export default function NewContactPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const form = new FormData(e.currentTarget)
    try {
      await createContact({
        name: form.get('name') as string,
        company: (form.get('company') as string) || null,
        trade: form.get('trade') as string,
        phone: form.get('phone') as string,
        notes: (form.get('notes') as string) || null,
      })
      router.push('/contacts')
    } catch (err) {
      setError((err as Error).message)
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Link href="/contacts" className="text-blue-600 hover:underline text-sm">← Contacts</Link>
      <h1 className="text-2xl font-bold">Add Contact</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white border rounded-xl p-4 shadow-sm">
        {[
          { name: 'name', label: 'Name', type: 'text', required: true },
          { name: 'trade', label: 'Trade / Role', type: 'text', required: true },
          { name: 'phone', label: 'Phone', type: 'tel', required: true },
          { name: 'company', label: 'Company', type: 'text', required: false },
        ].map(f => (
          <div key={f.name}>
            <label className="block text-sm font-medium mb-1">{f.label}{!f.required && ' (optional)'}</label>
            <input name={f.name} type={f.type} required={f.required} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        ))}
        <div>
          <label className="block text-sm font-medium mb-1">Notes (optional)</label>
          <textarea name="notes" rows={2} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button type="submit" disabled={loading} className="w-full bg-[#1e3a5f] text-white rounded-lg py-2 font-medium hover:bg-[#162d4a] disabled:opacity-50">
          {loading ? 'Saving...' : 'Save Contact'}
        </button>
      </form>
    </div>
  )
}
```

- [ ] **Step 4: Write app/contacts/page.tsx**
```typescript
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
```

- [ ] **Step 5: Write app/projects/[id]/contacts/page.tsx**
```typescript
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
```

- [ ] **Step 6: Commit**
```bash
git add app/contacts/ app/projects/ lib/actions/contacts.ts components/contact-card.tsx
git commit -m "feat: add contacts directory and project contacts tab with tap-to-call"
```

---

## Task 14: Lookbook

**Files:**
- Create: `lib/actions/lookbook.ts`
- Create: `app/lookbook/page.tsx`
- Create: `app/lookbook/new/page.tsx`
- Create: `app/lookbook/[id]/page.tsx`
- Create: `app/lookbook/[id]/new-room/page.tsx`
- Create: `app/lookbook/[id]/[roomId]/page.tsx`

- [ ] **Step 1: Write lib/actions/lookbook.ts**
```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function createHome(input: {
  name: string
  address: string
  year: number | null
  heroFile: File | null
}) {
  const supabase = await createClient()
  let heroUrl: string | null = null

  if (input.heroFile && input.heroFile.size > 0) {
    const ext = input.heroFile.name.split('.').pop()
    const path = `heroes/${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage.from('lookbook-photos').upload(path, input.heroFile)
    if (uploadError) throw new Error(uploadError.message)
    heroUrl = supabase.storage.from('lookbook-photos').getPublicUrl(path).data.publicUrl
  }

  const { error } = await supabase.from('lookbook_homes').insert({
    name: input.name,
    address: input.address,
    year: input.year,
    hero_photo_url: heroUrl,
  })
  if (error) throw new Error(error.message)
  revalidatePath('/lookbook')
}

export async function createRoom(homeId: string, roomType: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('lookbook_rooms').insert({ home_id: homeId, room_type: roomType })
  if (error) throw new Error(error.message)
  revalidatePath(`/lookbook/${homeId}`)
}

export async function uploadLookbookPhoto(roomId: string, homeId: string, file: File) {
  const supabase = await createClient()
  const ext = file.name.split('.').pop()
  const path = `rooms/${roomId}/${Date.now()}.${ext}`
  const { error: uploadError } = await supabase.storage.from('lookbook-photos').upload(path, file)
  if (uploadError) throw new Error(uploadError.message)
  const url = supabase.storage.from('lookbook-photos').getPublicUrl(path).data.publicUrl
  const { error } = await supabase.from('lookbook_photos').insert({ room_id: roomId, url })
  if (error) throw new Error(error.message)
  revalidatePath(`/lookbook/${homeId}/${roomId}`)
}
```

- [ ] **Step 2: Write app/lookbook/page.tsx**
```typescript
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function LookbookPage({
  searchParams,
}: {
  searchParams: Promise<{ room?: string }>
}) {
  const { room } = await searchParams
  const supabase = await createClient()

  const { data: homes } = await supabase.from('lookbook_homes').select('*').order('created_at', { ascending: false })

  const { data: allRooms } = await supabase
    .from('lookbook_rooms')
    .select('room_type, lookbook_photos(url)')

  const roomTypes = Array.from(new Set((allRooms ?? []).map(r => r.room_type))).sort()

  const { data: filteredPhotos } = room
    ? await supabase.from('lookbook_photos').select('url, lookbook_rooms!inner(room_type)').eq('lookbook_rooms.room_type', room)
    : { data: null }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Lookbook</h1>
        <Link href="/lookbook/new" className="bg-[#1e3a5f] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#162d4a]">
          + Add Home
        </Link>
      </div>

      {roomTypes.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-500 mb-2">Browse by Room</p>
          <div className="flex gap-2 flex-wrap">
            <Link href="/lookbook" className={`px-3 py-1 rounded-full text-sm border ${!room ? 'bg-[#1e3a5f] text-white border-[#1e3a5f]' : 'bg-white text-gray-700 hover:border-blue-400'}`}>
              All Homes
            </Link>
            {roomTypes.map(rt => (
              <Link key={rt} href={`/lookbook?room=${encodeURIComponent(rt)}`} className={`px-3 py-1 rounded-full text-sm border ${room === rt ? 'bg-[#1e3a5f] text-white border-[#1e3a5f]' : 'bg-white text-gray-700 hover:border-blue-400'}`}>
                {rt}
              </Link>
            ))}
          </div>
        </div>
      )}

      {room && filteredPhotos && (
        <div>
          <h2 className="font-semibold mb-3">{room} Photos</h2>
          <div className="grid grid-cols-2 gap-2">
            {filteredPhotos.map((p, i) => (
              <img key={i} src={p.url} alt={room} className="w-full h-40 object-cover rounded-xl" />
            ))}
          </div>
        </div>
      )}

      {!room && (
        <div className="space-y-4">
          {!homes?.length && <p className="text-gray-500 text-sm text-center py-8">No homes yet.</p>}
          {homes?.map(home => (
            <Link key={home.id} href={`/lookbook/${home.id}`} className="block border rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
              {home.hero_photo_url ? (
                <img src={home.hero_photo_url} alt={home.name} className="w-full h-48 object-cover" />
              ) : (
                <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">No photo</div>
              )}
              <div className="p-4">
                <p className="font-semibold">{home.name}</p>
                <p className="text-sm text-gray-500">{home.address}{home.year ? ` · ${home.year}` : ''}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Write app/lookbook/new/page.tsx**
```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createHome } from '@/lib/actions/lookbook'
import Link from 'next/link'

export default function NewHomePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const form = new FormData(e.currentTarget)
    const heroFile = form.get('hero') as File
    try {
      await createHome({
        name: form.get('name') as string,
        address: form.get('address') as string,
        year: form.get('year') ? Number(form.get('year')) : null,
        heroFile: heroFile?.size > 0 ? heroFile : null,
      })
      router.push('/lookbook')
    } catch (err) {
      setError((err as Error).message)
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Link href="/lookbook" className="text-blue-600 hover:underline text-sm">← Lookbook</Link>
      <h1 className="text-2xl font-bold">Add Home</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white border rounded-xl p-4 shadow-sm">
        <div>
          <label className="block text-sm font-medium mb-1">Home Name</label>
          <input name="name" type="text" required className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Address</label>
          <input name="address" type="text" required className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Year Built (optional)</label>
          <input name="year" type="number" min="1900" max="2099" className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Hero Photo (optional)</label>
          <input name="hero" type="file" accept="image/*" className="w-full text-sm" />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button type="submit" disabled={loading} className="w-full bg-[#1e3a5f] text-white rounded-lg py-2 font-medium hover:bg-[#162d4a] disabled:opacity-50">
          {loading ? 'Saving...' : 'Save Home'}
        </button>
      </form>
    </div>
  )
}
```

- [ ] **Step 4: Write app/lookbook/[id]/page.tsx**
```typescript
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function HomeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: home } = await supabase.from('lookbook_homes').select('*').eq('id', id).single()
  if (!home) notFound()

  const { data: rooms } = await supabase
    .from('lookbook_rooms')
    .select('*, lookbook_photos(id)')
    .eq('home_id', id)
    .order('room_type')

  return (
    <div className="space-y-4">
      <Link href="/lookbook" className="text-blue-600 hover:underline text-sm">← Lookbook</Link>

      {home.hero_photo_url && (
        <img src={home.hero_photo_url} alt={home.name} className="w-full h-56 object-cover rounded-2xl" />
      )}
      <div>
        <h1 className="text-2xl font-bold">{home.name}</h1>
        <p className="text-gray-500 text-sm">{home.address}{home.year ? ` · ${home.year}` : ''}</p>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Rooms</h2>
        <Link href={`/lookbook/${id}/new-room`} className="text-sm text-[#1e3a5f] font-medium hover:underline">+ Add Room</Link>
      </div>

      {!rooms?.length && <p className="text-gray-500 text-sm">No rooms yet.</p>}

      <div className="grid grid-cols-2 gap-3">
        {rooms?.map(room => (
          <Link
            key={room.id}
            href={`/lookbook/${id}/${room.id}`}
            className="border rounded-xl p-4 bg-white shadow-sm hover:border-blue-400 transition-colors text-center"
          >
            <p className="font-medium text-sm">{room.room_type}</p>
            <p className="text-xs text-gray-400 mt-1">{(room.lookbook_photos as { id: string }[])?.length ?? 0} photos</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Write app/lookbook/[id]/new-room/page.tsx**
```typescript
'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createRoom } from '@/lib/actions/lookbook'
import Link from 'next/link'

const COMMON_ROOMS = ['Kitchen', 'Master Bathroom', 'Bathroom', 'Master Bedroom', 'Bedroom', 'Living Room', 'Dining Room', 'Exterior', 'Other']

export default function NewRoomPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const [loading, setLoading] = useState(false)
  const [custom, setCustom] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function add(roomType: string) {
    setLoading(true)
    setError(null)
    try {
      await createRoom(params.id, roomType)
      router.push(`/lookbook/${params.id}`)
    } catch (err) {
      setError((err as Error).message)
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Link href={`/lookbook/${params.id}`} className="text-blue-600 hover:underline text-sm">← Home</Link>
      <h1 className="text-2xl font-bold">Add Room</h1>

      <div className="space-y-2">
        {COMMON_ROOMS.map(r => (
          <button key={r} onClick={() => add(r)} disabled={loading} className="w-full text-left border rounded-xl px-4 py-3 bg-white hover:border-blue-400 text-sm font-medium disabled:opacity-50">
            {r}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Custom room name..."
          value={custom}
          onChange={e => setCustom(e.target.value)}
          className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button onClick={() => custom.trim() && add(custom.trim())} disabled={loading || !custom.trim()} className="bg-[#1e3a5f] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#162d4a] disabled:opacity-50">
          Add
        </button>
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
    </div>
  )
}
```

- [ ] **Step 6: Write app/lookbook/[id]/[roomId]/page.tsx**
```typescript
import { createClient } from '@/lib/supabase/server'
import { uploadLookbookPhoto } from '@/lib/actions/lookbook'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function RoomPhotosPage({
  params,
}: {
  params: Promise<{ id: string; roomId: string }>
}) {
  const { id, roomId } = await params
  const supabase = await createClient()

  const { data: room } = await supabase.from('lookbook_rooms').select('*').eq('id', roomId).single()
  if (!room) notFound()

  const { data: photos } = await supabase
    .from('lookbook_photos')
    .select('*')
    .eq('room_id', roomId)
    .order('created_at', { ascending: false })

  async function handleUpload(formData: FormData) {
    'use server'
    const file = formData.get('file') as File
    if (!file || file.size === 0) return
    await uploadLookbookPhoto(roomId, id, file)
  }

  return (
    <div className="space-y-4">
      <Link href={`/lookbook/${id}`} className="text-blue-600 hover:underline text-sm">← {room.room_type}</Link>
      <h1 className="text-2xl font-bold">{room.room_type}</h1>

      <form action={handleUpload} className="flex gap-2 items-center">
        <input name="file" type="file" accept="image/*" className="flex-1 text-sm" />
        <button type="submit" className="bg-[#1e3a5f] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#162d4a] shrink-0">
          Upload
        </button>
      </form>

      {!photos?.length && <p className="text-gray-500 text-sm text-center py-8">No photos yet.</p>}

      <div className="grid grid-cols-2 gap-2">
        {photos?.map(photo => (
          <img key={photo.id} src={photo.url} alt={room.room_type} className="w-full h-40 object-cover rounded-xl" />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 7: Commit**
```bash
git add app/lookbook/ lib/actions/lookbook.ts
git commit -m "feat: add lookbook with Zillow-style homes, room folders, and photo grid"
```

---

## Task 15: Team Management + GitHub + Deploy

**Files:**
- Create: `app/dashboard/team/page.tsx`

- [ ] **Step 1: Write team management page**
```typescript
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export default async function TeamPage() {
  const supabase = await createClient()
  const adminClient = createAdminClient()

  const { data: profiles } = await supabase.from('profiles').select('*').order('name')
  const { data: { users } } = await adminClient.auth.admin.listUsers()
  const emailMap = Object.fromEntries(users.map(u => [u.id, u.email ?? '']))

  async function inviteMember(formData: FormData) {
    'use server'
    const email = formData.get('email') as string
    const name = formData.get('name') as string
    const adminClient = createAdminClient()
    const { data, error } = await adminClient.auth.admin.inviteUserByEmail(email, {
      data: { name },
    })
    if (error) throw new Error(error.message)
    const supabase = await createClient()
    await supabase.from('profiles').update({ name }).eq('id', data.user.id)
    revalidatePath('/dashboard/team')
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Team</h1>

      <div className="border rounded-xl bg-white shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b font-semibold text-sm">Members</div>
        <ul>
          {profiles?.map(p => (
            <li key={p.id} className="flex items-center justify-between px-4 py-3 border-b last:border-0">
              <div>
                <p className="text-sm font-medium">{p.name}</p>
                <p className="text-xs text-gray-500">{emailMap[p.id]}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="border rounded-xl bg-white shadow-sm p-4 space-y-3">
        <h2 className="font-semibold text-sm">Invite Team Member</h2>
        <form action={inviteMember} className="space-y-3">
          <input name="name" type="text" placeholder="Full name" required className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input name="email" type="email" placeholder="Email address" required className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <button type="submit" className="w-full bg-[#1e3a5f] text-white rounded-lg py-2 text-sm font-medium hover:bg-[#162d4a]">
            Send Invite
          </button>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Add Team link to nav**

In `app/dashboard/nav.tsx`, add after the Lookbook link:
```typescript
<Link href="/dashboard/team" onClick={() => setOpen(false)} className="block px-4 py-3 text-sm hover:bg-gray-50 border-b">Team</Link>
```

- [ ] **Step 3: Run full build and fix any errors**
```bash
npm run build
```
Fix any TypeScript errors before proceeding.

- [ ] **Step 4: Push to GitHub**
```bash
gh repo create builder-buddy --public --source=. --remote=origin --push
```

- [ ] **Step 5: Deploy to Vercel**

Go to vercel.com → New Project → Import `builder-buddy` from GitHub. Add all environment variables from `.env.local.example`. Deploy.

- [ ] **Step 6: Run Supabase migrations**

In Supabase dashboard → SQL Editor → run each migration file in order:
1. `20260529000001_initial_schema.sql`
2. `20260529000002_rls_policies.sql`
3. `20260529000003_storage_policies.sql`

- [ ] **Step 7: Create your admin account**

In Supabase → Authentication → Invite user with your email. Set password. You're in.

- [ ] **Step 8: Final commit**
```bash
git add -A
git commit -m "feat: add team management page and complete BuilderBuddy v1"
```
