import type { SessionState } from '../types/domain';

function formatMilestone(state: SessionState, taskId: string, verb: string): string {
  const task = state.tasks.find((t) => t.id === taskId);
  const location = task?.location ? ` at ${task.location}` : '';

  if (task?.done && task.doneAt) {
    return `${verb}: confirmed for ${new Date(task.doneAt).toLocaleString()}${location}`;
  }
  return `${verb}: to be confirmed${location}`;
}

export function buildAnnouncementText(state: SessionState): string {
  const { session } = state;
  const deceasedName = session.deceasedName || '[name not yet set]';
  const coordinatorName = session.coordinatorName || 'the family';
  const coordinatorPhone = session.coordinatorPhone || '[phone not yet set]';

  const lines = [
    "Inna lillahi wa inna ilayhi raji'un.",
    '',
    `It is with heavy hearts that we share the passing of ${deceasedName}.`,
    formatMilestone(state, 'janazah-prayer-held', 'Janazah prayer'),
    formatMilestone(state, 'burial-completed', 'Burial'),
    '',
    `For updates, please contact ${coordinatorName} at ${coordinatorPhone}.`,
  ];

  return lines.join('\n');
}
