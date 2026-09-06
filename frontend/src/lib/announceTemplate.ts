import type { SessionState } from '../types/domain';

export interface MilestoneFacts {
  confirmed: boolean;
  when: string | null;
  location: string | null;
}

export interface AnnouncementFacts {
  deceasedName: string;
  janazah: MilestoneFacts;
  burial: MilestoneFacts;
  coordinatorName: string;
  coordinatorPhone: string;
}

function getMilestoneFacts(state: SessionState, taskId: string): MilestoneFacts {
  const task = state.tasks.find((t) => t.id === taskId);
  const confirmed = !!(task?.done && task.doneAt);
  return {
    confirmed,
    when: confirmed ? task!.doneAt : null,
    location: task?.location ?? null,
  };
}

// Single source of truth for the facts both the deterministic template and
// the AI-generation request are built from — never invent a fact beyond
// what's here (MVP.md §6).
export function getAnnouncementFacts(state: SessionState): AnnouncementFacts {
  const { session } = state;
  return {
    deceasedName: session.deceasedName || '[name not yet set]',
    janazah: getMilestoneFacts(state, 'janazah-prayer-held'),
    burial: getMilestoneFacts(state, 'burial-completed'),
    coordinatorName: session.coordinatorName || 'the family',
    coordinatorPhone: session.coordinatorPhone || '[phone not yet set]',
  };
}

function formatMilestoneLine(verb: string, milestone: MilestoneFacts): string {
  const location = milestone.location ? ` at ${milestone.location}` : '';
  if (milestone.confirmed && milestone.when) {
    return `${verb}: confirmed for ${new Date(milestone.when).toLocaleString()}${location}`;
  }
  return `${verb}: to be confirmed${location}`;
}

export const OPENING_LINE = "Inna lillahi wa inna ilayhi raji'un.";

export function buildAnnouncementText(state: SessionState): string {
  const facts = getAnnouncementFacts(state);

  const lines = [
    OPENING_LINE,
    '',
    `It is with heavy hearts that we share the passing of ${facts.deceasedName}.`,
    formatMilestoneLine('Janazah prayer', facts.janazah),
    formatMilestoneLine('Burial', facts.burial),
    '',
    `For updates, please contact ${facts.coordinatorName} at ${facts.coordinatorPhone}.`,
  ];

  return lines.join('\n');
}
