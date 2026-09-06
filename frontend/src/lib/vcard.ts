export interface ParsedVCard {
  name: string | null;
  phone: string | null;
}

// A minimal, dependency-free vCard reader — not a full RFC 6350 parser (no
// line-unfolding, no quoted-printable decoding). Good enough for the common
// case: a single contact exported from a phone's own Contacts app.
export function parseVCard(text: string): ParsedVCard {
  let name: string | null = null;
  let phone: string | null = null;

  for (const rawLine of text.split(/\r\n|\r|\n/)) {
    const line = rawLine.trim();
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;

    const key = line.slice(0, colonIndex).toUpperCase();
    const value = line.slice(colonIndex + 1).trim();
    if (!value) continue;

    if (key === 'FN' && !name) {
      name = value;
    } else if (key.startsWith('TEL') && !phone) {
      phone = value;
    }
  }

  return { name, phone };
}
