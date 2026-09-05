// Which sessions this device belongs to, and under what name. Permanently
// local — this never becomes a Supabase table, on either side of the swap.

const STORAGE_KEY = 'sanad_memberships';

interface MembershipRecord {
  pid: string;
  name: string;
}

type MembershipMap = Record<string, MembershipRecord>;

function readAll(): MembershipMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as MembershipMap) : {};
  } catch {
    return {};
  }
}

export function get(code: string): MembershipRecord | null {
  return readAll()[code] ?? null;
}

export function save(code: string, pid: string, name: string): void {
  const all = readAll();
  all[code] = { pid, name };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function clear(code: string): void {
  const all = readAll();
  delete all[code];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}
