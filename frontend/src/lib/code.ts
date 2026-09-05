// Excludes O/0/I/1 to avoid misreads over the phone (MVP.md §1).
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 5;

export function generateCode(): string {
  const bytes = new Uint8Array(CODE_LENGTH);
  crypto.getRandomValues(bytes);
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return code;
}

export function isValidCodeFormat(value: string): boolean {
  if (value.length !== CODE_LENGTH) return false;
  const upper = value.toUpperCase();
  for (const ch of upper) {
    if (!ALPHABET.includes(ch)) return false;
  }
  return true;
}
