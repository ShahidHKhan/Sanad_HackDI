// Private storage transport for sessionStore.ts. Nothing else should import
// this file — when Supabase lands, this file is deleted wholesale and
// sessionStore.ts's function bodies are rewritten to call Supabase instead.
import type { SessionState } from '../types/domain';

const POLL_INTERVAL_MS = 3000;

function storageKey(code: string): string {
  return `sanad:session:${code}`;
}

export function readBlob(code: string): SessionState | null {
  try {
    const raw = localStorage.getItem(storageKey(code));
    return raw ? (JSON.parse(raw) as SessionState) : null;
  } catch {
    return null;
  }
}

const localSubscribers = new Map<string, Set<() => void>>();

function notifyLocal(code: string): void {
  const subs = localSubscribers.get(code);
  if (subs) {
    for (const cb of subs) cb();
  }
}

export function writeBlob(code: string, value: SessionState): void {
  localStorage.setItem(storageKey(code), JSON.stringify(value));
  // Tier 1: same-tab, instant — no event round-trip.
  notifyLocal(code);
  // Tier 2: cross-tab, primary.
  getChannel(code)?.postMessage('changed');
}

const channels = new Map<string, BroadcastChannel>();

function getChannel(code: string): BroadcastChannel | null {
  if (typeof BroadcastChannel === 'undefined') return null;
  let channel = channels.get(code);
  if (!channel) {
    channel = new BroadcastChannel(`sanad:session:${code}`);
    channels.set(code, channel);
  }
  return channel;
}

export function subscribe(code: string, cb: () => void): () => void {
  // Tier 1: same-tab.
  let subs = localSubscribers.get(code);
  if (!subs) {
    subs = new Set();
    localSubscribers.set(code, subs);
  }
  subs.add(cb);

  // Tier 2: cross-tab, primary.
  const channel = getChannel(code);
  const onMessage = () => cb();
  channel?.addEventListener('message', onMessage);

  // Tier 3: cross-tab fallback (storage event, fires on other tabs only) + poll safety net.
  const key = storageKey(code);
  const onStorage = (e: StorageEvent) => {
    if (e.key === key) cb();
  };
  window.addEventListener('storage', onStorage);
  const pollId = window.setInterval(cb, POLL_INTERVAL_MS);

  return () => {
    subs?.delete(cb);
    channel?.removeEventListener('message', onMessage);
    window.removeEventListener('storage', onStorage);
    window.clearInterval(pollId);
  };
}
