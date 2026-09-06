// Sanad — AI-written community announcement (Announce tab, "Write with AI")
//
// Paste this into the Supabase dashboard's Edge Functions editor as a
// function named "write-announcement" and deploy. Requires a Gemini API key
// (from Google AI Studio) set as an Edge Function secret named
// GEMINI_API_KEY — Edge Functions -> Secrets in the dashboard. Also turn off
// "Enforce JWT Verification" on this function, same as search-masjids,
// since the browser's CORS preflight never carries an auth token.
//
// MVP.md §6: the AI is given only the session's confirmed facts and told
// explicitly never to invent a date/time/name/location, and to say
// "not yet confirmed" plainly for anything unconfirmed — the same rule the
// deterministic template already follows. The fixed opening line
// ("Inna lillahi wa inna ilayhi raji'un") is added by the frontend, not the
// model, so it's never at risk of being paraphrased.

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MODEL = 'gemini-3.5-flash-lite';

interface MilestoneFacts {
  confirmed: boolean;
  when: string | null;
  location: string | null;
}

interface AnnouncementFacts {
  deceasedName: string;
  janazah: MilestoneFacts;
  burial: MilestoneFacts;
  coordinatorName: string;
  coordinatorPhone: string;
}

function describeMilestone(label: string, m: MilestoneFacts): string {
  if (m.confirmed && m.when) {
    const when = new Date(m.when).toLocaleString();
    return `${label}: CONFIRMED for ${when}${m.location ? ` at ${m.location}` : ''}.`;
  }
  return `${label}: NOT YET CONFIRMED.`;
}

function buildPrompt(facts: AnnouncementFacts): string {
  const factsBlock = [
    `Deceased's name: ${facts.deceasedName}`,
    describeMilestone('Janazah prayer', facts.janazah),
    describeMilestone('Burial', facts.burial),
    `Family coordinator: ${facts.coordinatorName}, phone ${facts.coordinatorPhone}`,
  ].join('\n');

  return `You are writing a short community announcement for a Muslim family after a death (janazah), to be shared with their local community.

Facts (this is the ONLY information you may use):
${factsBlock}

Rules — follow exactly:
- Use ONLY the facts given above. Never invent, guess, or assume a date, time, name, or location.
- For anything marked NOT YET CONFIRMED, say plainly that it is "to be confirmed" — do not guess a likely time or place.
- Do not include the phrase "Inna lillahi wa inna ilayhi raji'un" — that line is added separately, before your text.
- Keep it to 3-5 short sentences, warm and respectful in tone, suitable to post to a masjid community group.
- Do not add a greeting, salutation, or sign-off name — just the announcement body itself.
- Output plain text only, no markdown formatting.`;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }

  try {
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) throw new Error('GEMINI_API_KEY is not configured');

    const facts: AnnouncementFacts = await req.json();
    const prompt = buildPrompt(facts);

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      },
    );
    if (!geminiRes.ok) throw new Error(`Gemini error: ${geminiRes.status}`);
    const data = await geminiRes.json();
    const text: string | undefined = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!text) throw new Error('Empty response from Gemini');

    return new Response(JSON.stringify({ text }), {
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(
      JSON.stringify({ error: 'Could not generate the announcement. Please try again or use the template.' }),
      { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    );
  }
});
