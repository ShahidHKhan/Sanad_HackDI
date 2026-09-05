// Tracks the last time this device viewed a session's chat, so the trigger
// button can show an unread dot. Permanently local — same category as
// membership.ts, never synced to Supabase.

const STORAGE_KEY = 'sanad_chat_seen';

type SeenMap = Record<string, string>; // code -> ISO timestamp

function readAll(): SeenMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SeenMap) : {};
  } catch {
    return {};
  }
}

export function getLastSeen(code: string): string | null {
  return readAll()[code] ?? null;
}

export function markSeen(code: string): void {
  const all = readAll();
  all[code] = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}
