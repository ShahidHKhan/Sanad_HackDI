-- Sanad — allow removing masjid/cemetery directory entries (Find tab)
-- Paste this into the Supabase dashboard's SQL Editor and run it.
--
-- masjids/cemeteries were deliberately insert-only when first built, but a
-- global directory anyone can add to also needs a way to remove bad/test
-- entries. Same trust model as everywhere else (MVP.md §1) — no auth.uid(),
-- anyone with access can remove an entry, same as they can add one.

create policy "masjids_delete_anon" on masjids for delete to anon using (true);
create policy "cemeteries_delete_anon" on cemeteries for delete to anon using (true);
create policy "directory_calls_delete_anon" on directory_calls for delete to anon using (true);
