export interface GuidanceSection {
  heading: string;
  steps: string[];
}

export interface GuidanceGuide {
  id: string;
  title: string;
  intro: string;
  sections: GuidanceSection[];
}

// General outlines of common Sunni practice — not a substitute for guidance
// from an imam or funeral committee, since practice varies by tradition
// (MVP.md §8). Safe to edit freely, this is just content.
export const GUIDANCE_GUIDES: GuidanceGuide[] = [
  {
    id: 'ghusl',
    title: 'How to give the body ghusl',
    intro:
      'A general outline of common Sunni practice. Requirements can vary by family tradition and school of thought — confirm with your imam or local funeral committee, and have someone experienced lead if possible.',
    sections: [
      {
        heading: 'Before you begin',
        steps: [
          'Ghusl is normally performed by people of the same gender as the deceased. A spouse may wash their spouse regardless of gender. Two or three people is typical — one to wash, others to help turn the body and keep it covered.',
          'Gather: gloves, unscented soap, a clean sheet or cloth, cotton, camphor (kafur) if available, and a private surface that drains. Keep the kafan (shroud) nearby.',
          'The awrah — the area between navel and knee — must stay covered by a cloth for the entire process, even while washing.',
        ],
      },
      {
        heading: 'The washing',
        steps: [
          'Gently press the abdomen to help release anything remaining, then clean the area thoroughly and re-cover.',
          'Perform wudu (ablution) on the body in the usual order — hands, mouth and nose wiped with a wet cloth, face, arms, head, feet — without pouring water inside the mouth or nose.',
          'Wash the whole body an odd number of times, commonly three, starting with the right side. Use plain water, then water with a little soap or sidr leaves if available.',
          'On the final wash, add a small amount of camphor to the rinse water for a pleasant scent, then gently dry the body with a clean cloth.',
        ],
      },
    ],
  },
  {
    id: 'kafan',
    title: 'How to wrap the kafan (shroud)',
    intro:
      'A general outline of common Sunni practice for shrouding. Requirements can vary by tradition and school of thought — confirm specifics with your imam or funeral committee.',
    sections: [
      {
        heading: 'Before you begin',
        steps: [
          'The kafan is typically plain white cloth, unstitched and unadorned. Men are traditionally wrapped in three pieces of cloth; women in five.',
          'Lay the cloth pieces flat and layered on a clean surface before placing the body, with the largest/outermost piece on the bottom.',
          'Prepare cotton and any remaining camphor to place at the forehead, hands, knees, and feet, per family/masjid custom.',
        ],
      },
      {
        heading: 'Wrapping',
        steps: [
          'Place the body on the layered cloth, arms resting naturally at the sides — confirm with your imam, as some traditions differ.',
          'Fold each layer over the body from left, then right, starting with the innermost piece and working outward.',
          'Secure the wrapped shroud with ties at the head, chest, waist, and feet, loosely enough that they can be removed easily at burial.',
        ],
      },
      {
        heading: 'Closing',
        steps: [
          'Keep the kafan modest and unadorned — simplicity and equality in death is the emphasis, not decoration.',
          'Move the body to the bier promptly once wrapped, in preparation for the janazah prayer.',
        ],
      },
    ],
  },
  {
    id: 'janazah',
    title: 'How to perform the janazah prayer',
    intro:
      'Salat al-janazah is prayed standing — there is no bowing or prostration. It is usually led by an imam with the congregation in rows behind. Confirm timing and arrangement with your masjid.',
    sections: [
      {
        heading: 'Setup',
        steps: [
          'The body, wrapped in its kafan, is placed on a bier facing the qibla, in front of the congregation.',
          "The imam stands level with the deceased's chest for a man, and around the middle of the body for a woman.",
          'The congregation forms straight rows behind the imam, facing qibla — at least three rows is traditionally encouraged.',
          'There is no adhan or iqamah before this prayer.',
        ],
      },
      {
        heading: 'The four takbirs',
        steps: [
          'First takbir — raise your hands, say "Allahu Akbar," place your hands over your chest, and silently recite Al-Fatiha.',
          'Second takbir — say "Allahu Akbar" and recite salutations on the Prophet ﷺ (durood/salawat).',
          'Third takbir — say "Allahu Akbar" and recite a dua for the deceased, asking for forgiveness and mercy.',
          'Fourth takbir — say "Allahu Akbar," pause briefly for a short dua, then conclude.',
        ],
      },
      {
        heading: 'Closing',
        steps: [
          'End with the taslim — turning the head to say "As-salamu alaykum wa rahmatullah" to the right, then repeating it to the left.',
        ],
      },
    ],
  },
];
