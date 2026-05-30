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
