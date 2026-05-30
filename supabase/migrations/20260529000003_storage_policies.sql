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

create policy "authenticated_update_project_files"
  on storage.objects for update to authenticated
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

create policy "authenticated_update_lookbook"
  on storage.objects for update to authenticated
  using (bucket_id = 'lookbook-photos');
