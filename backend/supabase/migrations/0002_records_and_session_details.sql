-- Sanad — Records (Costs & Documents) + Session Details
-- Paste this into the Supabase dashboard's SQL Editor and run it.

alter table sessions add column if not exists deceased_name text;
alter table sessions add column if not exists coordinator_name text;
alter table sessions add column if not exists coordinator_phone text;

-- MVP.md §10: "Editable by anyone in the session at any time" — sessions
-- previously had no update policy (deliberately, to keep the session's
-- identity/creation facts immutable); this adds update specifically for
-- Session Details, matching that explicit spec requirement.
create policy "sessions_update_anon" on sessions for update to anon using (true) with check (true);

create table if not exists costs (
  id              uuid primary key default gen_random_uuid(),
  session_code    text not null references sessions(code) on delete cascade,
  label           text not null,
  amount          numeric not null,
  paid_by_pid     text not null,
  paid_by_name    text not null,
  at              timestamptz not null default now(),
  added_by_pid    text not null,
  added_by_name   text not null
);

create table if not exists documents (
  id              uuid primary key default gen_random_uuid(),
  session_code    text not null references sessions(code) on delete cascade,
  title           text not null,
  note            text not null default '',
  added_by_pid    text not null,
  added_by_name   text not null,
  at              timestamptz not null default now()
);

create index if not exists costs_session_code_idx on costs(session_code);
create index if not exists documents_session_code_idx on documents(session_code);

alter publication supabase_realtime add table costs;
alter publication supabase_realtime add table documents;

alter table costs enable row level security;
alter table documents enable row level security;

-- Simple insert + list, per MVP.md §5 — no edit/delete for either table.
create policy "costs_select_anon" on costs for select to anon using (true);
create policy "costs_insert_anon" on costs for insert to anon with check (true);
create policy "documents_select_anon" on documents for select to anon using (true);
create policy "documents_insert_anon" on documents for insert to anon with check (true);
