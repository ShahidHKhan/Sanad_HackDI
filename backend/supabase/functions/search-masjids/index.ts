// Sanad — masjid & cemetery lookup by area (Find tab)
//
// Paste this into the Supabase dashboard's Edge Functions editor, into the
// already-deployed "search-masjids" function, and redeploy (or
// `supabase functions deploy search-masjids` if the project is CLI-linked).
// Kept as one function under its original name so cemetery support didn't
// require creating (and re-configuring "Enforce JWT Verification" on) a
// second function — request body now carries a `type` field instead.
//
// Looks up places near a user-typed place name using two free, keyless OSM
// services: Nominatim (text -> bounding box) then Overpass (bounding box ->
// tagged places). Deliberately not an LLM call — an AI asked to "find
// mosques/cemeteries near X" from its own knowledge will fabricate names,
// phone numbers, and addresses, which is unacceptable for a feature whose
// result people actually call. Runs server-side because Nominatim's usage
// policy requires a descriptive User-Agent (browsers can't reliably set one).
//
// Returns raw, unverified location data — the frontend treats these as
// lookup results distinct from the community-verified directory, with an
// "Add to directory" action that copies a result into the curated table.

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const USER_AGENT = 'Sanad-Janazah-Coordinator/1.0 (hackathon project)';

interface NominatimResult {
  boundingbox: [string, string, string, string]; // [south, north, west, east]
}

interface OverpassElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

function pickTown(tags: Record<string, string>, fallback: string): string {
  return tags['addr:city'] || tags['addr:town'] || tags['addr:suburb'] || fallback;
}

function pickAddress(tags: Record<string, string>): string {
  return [tags['addr:housenumber'], tags['addr:street']].filter(Boolean).join(' ');
}

function buildMapUrl(lat: number | null, lon: number | null): string | null {
  if (lat == null || lon == null) return null;
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=18/${lat}/${lon}`;
}

type PlaceType = 'masjid' | 'cemetery';

function buildOverpassQuery(type: PlaceType, south: number, west: number, north: number, east: number): string {
  const bbox = `${south},${west},${north},${east}`;
  if (type === 'cemetery') {
    return `
      [out:json][timeout:25];
      (
        node["landuse"="cemetery"](${bbox});
        way["landuse"="cemetery"](${bbox});
        relation["landuse"="cemetery"](${bbox});
        node["amenity"="grave_yard"](${bbox});
        way["amenity"="grave_yard"](${bbox});
        relation["amenity"="grave_yard"](${bbox});
      );
      out center tags;
    `;
  }
  return `
    [out:json][timeout:25];
    (
      node["amenity"="place_of_worship"]["religion"="muslim"](${bbox});
      way["amenity"="place_of_worship"]["religion"="muslim"](${bbox});
      relation["amenity"="place_of_worship"]["religion"="muslim"](${bbox});
    );
    out center tags;
  `;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }

  try {
    const { query, type } = await req.json();
    const placeType: PlaceType = type === 'cemetery' ? 'cemetery' : 'masjid';
    if (!query || typeof query !== 'string' || !query.trim()) {
      return new Response(JSON.stringify({ error: 'A location query is required.' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }
    const trimmedQuery = query.trim();

    const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(trimmedQuery)}`;
    const geocodeRes = await fetch(geocodeUrl, { headers: { 'User-Agent': USER_AGENT } });
    if (!geocodeRes.ok) throw new Error(`Nominatim error: ${geocodeRes.status}`);
    const geocodeResults: NominatimResult[] = await geocodeRes.json();
    if (geocodeResults.length === 0) {
      return new Response(
        JSON.stringify({ results: [], notice: `No location found for "${trimmedQuery}".` }),
        { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
      );
    }

    const [south, north, west, east] = geocodeResults[0].boundingbox.map(Number);
    const overpassQuery = buildOverpassQuery(placeType, south, west, north, east);

    const overpassRes = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'User-Agent': USER_AGENT, 'Content-Type': 'text/plain' },
      body: overpassQuery,
    });
    if (!overpassRes.ok) throw new Error(`Overpass error: ${overpassRes.status}`);
    const overpassData: { elements: OverpassElement[] } = await overpassRes.json();

    // For masjids, an unnamed OSM result is essentially never real — mosques
    // are manually mapped and named by someone in the community. Cemetery
    // boundaries, though, are frequently bulk-imported from government
    // land-use datasets (e.g. tagged `source=NJ2002LULC`) with no name at
    // all, even when they're a real, specific cemetery — dropping those
    // silently hid real results. So: keep filtering unnamed masjid results,
    // but surface unnamed cemetery results labeled honestly instead of
    // discarding them.
    const results = overpassData.elements
      .filter((el) => placeType === 'masjid' ? !!el.tags?.name : true)
      .slice(0, 25)
      .map((el) => {
        const tags = el.tags ?? {};
        const lat = el.lat ?? el.center?.lat ?? null;
        const lon = el.lon ?? el.center?.lon ?? null;
        const isUnnamed = !tags.name;
        return {
          osmId: `${el.type}/${el.id}`,
          name: tags.name || 'Unnamed cemetery',
          isUnnamed,
          town: pickTown(tags, trimmedQuery),
          address: pickAddress(tags),
          phone: tags.phone || tags['contact:phone'] || '',
          website: tags.website || tags['contact:website'] || '',
          lat,
          lon,
          mapUrl: buildMapUrl(lat, lon),
          ...(placeType === 'cemetery' ? { islamicSectionHint: tags.religion === 'muslim' } : {}),
        };
      });

    return new Response(JSON.stringify({ results }), {
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Lookup failed. Please try again.' }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
});
