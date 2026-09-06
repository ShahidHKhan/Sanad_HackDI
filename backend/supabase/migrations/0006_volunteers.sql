-- Sanad — Volunteers roster (Masjid half, third tab)
-- Paste this into the Supabase dashboard's SQL Editor and run it.

create table if not exists volunteers (
  id              uuid primary key default gen_random_uuid(),
  session_code    text not null references sessions(code) on delete cascade,
  name            text not null,
  phone           text not null default '',
  note            text not null default '',
  added_by_pid    text not null,
  added_by_name   text not null,
  at              timestamptz not null default now()
);

create index if not exists volunteers_session_code_idx on volunteers(session_code);

alter publication supabase_realtime add table volunteers;

alter table volunteers enable row level security;

-- Same trust model as everywhere else (MVP.md §1) — anyone with the session
-- code can read/write, no auth.uid(). Per-session (not global, unlike
-- masjids/cemeteries) since a session isn't currently linked to a specific
-- masjid identity that a shared roster could scope by.
create policy "volunteers_select_anon" on volunteers for select to anon using (true);
create policy "volunteers_insert_anon" on volunteers for insert to anon with check (true);
