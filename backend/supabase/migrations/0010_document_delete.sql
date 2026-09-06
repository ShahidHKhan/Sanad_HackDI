-- Sanad — allow removing document entries (Records tab)
-- Paste this into the Supabase dashboard's SQL Editor and run it.
--
-- documents was insert/select-only when first built. Same trust model as
-- everywhere else (MVP.md §1) — anyone with the session code can remove an
-- entry, same as they can add one. Also allows deleting the underlying
-- stored file (not just the row) so removing a document actually frees the
-- file in the private "documents" bucket rather than leaving it orphaned.

create policy "documents_delete_anon" on documents for delete to anon using (true);

create policy "documents_bucket_delete_anon" on storage.objects
  for delete to anon
  using (bucket_id = 'documents');
