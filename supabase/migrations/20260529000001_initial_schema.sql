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
