-- Sanad — Chat drawer (MVP.md §9)
-- Paste this into the Supabase dashboard's SQL Editor and run it.

create table if not exists chat_messages (
  id              uuid primary key default gen_random_uuid(),
  session_code    text not null references sessions(code) on delete cascade,
  text            text not null,
  at              timestamptz not null default now(),
  sender_pid      text not null,
  sender_name     text not null
);

create index if not exists chat_messages_session_code_idx on chat_messages(session_code);

alter publication supabase_realtime add table chat_messages;

alter table chat_messages enable row level security;

-- Simple insert + list, anyone with the session code (same trust model as
-- everywhere else in the app) — no edit/delete for chat messages.
create policy "chat_messages_select_anon" on chat_messages for select to anon using (true);
create policy "chat_messages_insert_anon" on chat_messages for insert to anon with check (true);
