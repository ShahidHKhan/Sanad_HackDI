-- Sanad — initial schema (sessions, participants, tasks)
-- Paste this into the Supabase dashboard's SQL Editor and run it.

create extension if not exists pgcrypto;

create table if not exists sessions (
  code              text primary key,
  created_at        timestamptz not null default now(),
  created_by_pid    text not null,
  created_by_name   text not null
);

create table if not exists participants (
  id             uuid primary key default gen_random_uuid(),
  session_code   text not null references sessions(code) on delete cascade,
  pid            text not null,
  name           text not null,
  joined_at      timestamptz not null default now(),
  unique (session_code, pid)
);

-- Task ids are human-readable strings for the seeded defaults (e.g.
-- 'notify-family') and are only unique WITHIN a session, so the primary key
-- is (session_code, id), not id alone.
create table if not exists tasks (
  id               text not null,
  session_code     text not null references sessions(code) on delete cascade,
  title            text not null,
  group_name       text not null,
  sort_order       int not null,
  claimed_by_pid   text,
  claimed_by_name  text,
  claimed_at       timestamptz,
  done             boolean not null default false,
  done_by_pid      text,
  done_by_name     text,
  done_at          timestamptz,
  delegate_note    text not null default '',
  pinned           boolean not null default false,
  location         text,
  primary key (session_code, id)
);

create index if not exists participants_session_code_idx on participants(session_code);
create index if not exists tasks_session_code_idx on tasks(session_code);

alter publication supabase_realtime add table sessions;
alter publication supabase_realtime add table participants;
alter publication supabase_realtime add table tasks;

alter table sessions enable row level security;
alter table participants enable row level security;
alter table tasks enable row level security;

-- Same trust model as the rest of the app (MVP.md §1: "no accounts... if you
-- know the code you're in"). No auth.uid() anywhere — an accepted tradeoff,
-- not a new one; extending it from sessions/participants to tasks is what
-- makes claim/edit/remove/pin actually work for anon users.
create policy "sessions_select_anon" on sessions for select to anon using (true);
create policy "sessions_insert_anon" on sessions for insert to anon with check (true);

create policy "participants_select_anon" on participants for select to anon using (true);
create policy "participants_insert_anon" on participants for insert to anon with check (true);
create policy "participants_update_anon" on participants for update to anon using (true) with check (true);

create policy "tasks_select_anon" on tasks for select to anon using (true);
create policy "tasks_insert_anon" on tasks for insert to anon with check (true);
create policy "tasks_update_anon" on tasks for update to anon using (true) with check (true);
create policy "tasks_delete_anon" on tasks for delete to anon using (true);
