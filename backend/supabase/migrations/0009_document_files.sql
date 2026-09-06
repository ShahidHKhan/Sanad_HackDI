-- Sanad — file attachments for Documents (Records tab)
-- Paste this into the Supabase dashboard's SQL Editor and run it.
--
-- Reverses MVP.md §5/§12's original "no file uploads, notes only" scope —
-- deliberately deferred at the time, now being added. A document entry can
-- still be a plain note (all file columns null), a file with no note, or
-- both.

-- Private bucket (not public): a death certificate can carry real personal
-- info (name, DOB, address), so files should only be reachable through a
-- signed URL the app generates for someone who already has session access —
-- not a plain public URL anyone on the internet could guess or share.
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

-- Same trust model as every table in this app (MVP.md §1) — anyone with
-- anon access can upload/read within this bucket, no auth.uid().
create policy "documents_bucket_insert_anon" on storage.objects
  for insert to anon
  with check (bucket_id = 'documents');

create policy "documents_bucket_select_anon" on storage.objects
  for select to anon
  using (bucket_id = 'documents');

alter table documents
  add column file_path text,
  add column file_name text,
  add column file_type text,
  add column file_size bigint;
