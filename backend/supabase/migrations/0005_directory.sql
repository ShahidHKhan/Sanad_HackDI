-- Sanad — Find directory: masjids & cemeteries (MVP.md §4), Masjid half
-- Paste this into the Supabase dashboard's SQL Editor and run it.

create table if not exists masjids (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  town              text not null default '',
  phone             text not null default '',
  ghusl_men         boolean not null default false,
  ghusl_women       boolean not null default false,
  short_notice      boolean not null default false,
  notes             text not null default '',
  created_at        timestamptz not null default now(),
  added_by_name     text not null
);

create table if not exists cemeteries (
  id                    uuid primary key default gen_random_uuid(),
  name                  text not null,
  town                  text not null default '',
  phone                 text not null default '',
  islamic_section       boolean not null default false,
  no_casket_allowed     boolean not null default false,
  interment_hours       text not null default '',
  notes                 text not null default '',
  created_at            timestamptz not null default now(),
  added_by_name         text not null
);

-- Per-session call-tracking (not global) — "I'll call this one" claims an
-- entry with a short lease so two people don't duplicate a call; logging an
-- outcome (Confirmed / Not available) records who confirmed what and when.
-- One row per (session_code, entry_type, entry_id): a session only has one
-- in-flight claim / one outcome per directory entry at a time.
create table if not exists directory_calls (
  session_code      text not null references sessions(code) on delete cascade,
  entry_type        text not null check (entry_type in ('masjid', 'cemetery')),
  entry_id          uuid not null,
  claimed_by_pid    text,
  claimed_by_name   text,
  claimed_at        timestamptz,
  outcome           text check (outcome in ('confirmed', 'not_available')),
  outcome_note      text,
  confirmed_at      timestamptz,
  logged_by_pid     text,
  logged_by_name    text,
  logged_at         timestamptz,
  primary key (session_code, entry_type, entry_id)
);

create index if not exists directory_calls_session_code_idx on directory_calls(session_code);

alter publication supabase_realtime add table masjids;
alter publication supabase_realtime add table cemeteries;
alter publication supabase_realtime add table directory_calls;

alter table masjids enable row level security;
alter table cemeteries enable row level security;
alter table directory_calls enable row level security;

-- Same trust model as everywhere else (MVP.md §1) — no auth.uid(), anyone
-- with a session code can read/write. Masjids/cemeteries are global (MVP.md
-- §4: "shared across every session... one family's entry benefits the next
-- family"), so there's no session_code scoping on those two tables at all —
-- the Masjid half reuses the same code-based join as the family half.
create policy "masjids_select_anon" on masjids for select to anon using (true);
create policy "masjids_insert_anon" on masjids for insert to anon with check (true);

create policy "cemeteries_select_anon" on cemeteries for select to anon using (true);
create policy "cemeteries_insert_anon" on cemeteries for insert to anon with check (true);

create policy "directory_calls_select_anon" on directory_calls for select to anon using (true);
create policy "directory_calls_insert_anon" on directory_calls for insert to anon with check (true);
create policy "directory_calls_update_anon" on directory_calls for update to anon using (true) with check (true);
