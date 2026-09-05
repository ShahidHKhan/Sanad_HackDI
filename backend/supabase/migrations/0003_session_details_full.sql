-- Sanad — full Session Details fields (MVP.md §10)
-- Paste this into the Supabase dashboard's SQL Editor and run it.

alter table sessions add column if not exists died_at timestamptz;
alter table sessions add column if not exists death_location text;
alter table sessions add column if not exists masjid_name text;
alter table sessions add column if not exists cemetery_name text;
