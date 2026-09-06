// crypto.randomUUID() is restricted to secure contexts (HTTPS, or
// http://localhost) — it throws on plain http:// access, e.g. opening the
// dev server from a phone via a LAN IP. crypto.getRandomValues() has no such
// restriction, so fall back to building an RFC 4122 v4 UUID from it.
export function generateUuid(): string {
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
