-- Create private storage bucket for CV files
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'cvs',
  'cvs',
  false,
  10485760,
  array['application/pdf']
);

-- Storage paths follow the pattern: {user_id}/{cv_id}_{filename}
-- The first path segment is always the owner's auth.uid(), which the policies verify.
-- Uploads happen via the admin client (service role) from server actions — INSERT policy
-- is therefore defence-in-depth for any future client-side upload path.

create policy "cvs storage: owner insert"
  on storage.objects for insert
  with check (
    bucket_id = 'cvs'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "cvs storage: owner select"
  on storage.objects for select
  using (
    bucket_id = 'cvs'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "cvs storage: owner delete"
  on storage.objects for delete
  using (
    bucket_id = 'cvs'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
