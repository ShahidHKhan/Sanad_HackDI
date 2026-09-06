-- Sanad — participant roles: admin / family / masjid
-- Paste this into the Supabase dashboard's SQL Editor and run it.

alter table participants add column role text not null default 'family'
  check (role in ('admin', 'family', 'masjid'));

-- Backfill: whoever created each existing session becomes that session's admin.
update participants p
set role = 'admin'
from sessions s
where p.session_code = s.code and p.pid = s.created_by_pid;
