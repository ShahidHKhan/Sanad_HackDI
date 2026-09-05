import type { Task, TaskGroupName } from '../types/domain';

// Fixed order per MVP.md §3 — never re-sort this list.
export const GROUP_ORDER: TaskGroupName[] = [
  'Notify & Authorize',
  'Body & Religious Care',
  'Legal & Documents',
  'Logistics',
  'Community',
];

export interface DefaultTask {
  id: string;
  title: string;
  group: TaskGroupName;
}

// MVP.md only names two of these tasks explicitly; the rest are a reasonable
// placeholder set (3 per group) until the original artifact's exact copy is
// available. Safe to edit freely — this is just data, not architecture.
export const DEFAULT_TASKS: DefaultTask[] = [
  { id: 'notify-family', title: 'Notify immediate family and close relatives', group: 'Notify & Authorize' },
  { id: 'notify-masjid', title: 'Notify the imam / masjid of the death', group: 'Notify & Authorize' },
  { id: 'authorize-funeral-home', title: 'Authorize the funeral home to receive the body', group: 'Notify & Authorize' },

  { id: 'arrange-ghusl', title: 'Arrange ghusl (ritual washing) with the masjid or funeral home', group: 'Body & Religious Care' },
  { id: 'arrange-kafan', title: 'Arrange kafan (burial shroud)', group: 'Body & Religious Care' },
  { id: 'confirm-janazah-time', title: 'Confirm janazah prayer time with the masjid', group: 'Body & Religious Care' },

  { id: 'obtain-death-certificate', title: 'Obtain the death certificate', group: 'Legal & Documents' },
  { id: 'obtain-burial-permit', title: 'Obtain the burial permit', group: 'Legal & Documents' },
  { id: 'gather-id-documents', title: 'Gather ID / legal documents needed by the funeral home', group: 'Legal & Documents' },

  { id: 'confirm-cemetery-slot', title: 'Call the cemetery to confirm the burial slot', group: 'Logistics' },
  { id: 'transport-body', title: 'Arrange transport for the body to the funeral home', group: 'Logistics' },
  { id: 'transport-family', title: 'Arrange transport for family to the cemetery/masjid', group: 'Logistics' },

  { id: 'meal-train', title: 'Set up a meal train / food coordination for the family', group: 'Community' },
  { id: 'coordinate-visitors', title: 'Coordinate visitors and condolence calls', group: 'Community' },
  { id: 'post-announcement', title: 'Post the community announcement (once details are confirmed)', group: 'Community' },
];

export function seedTasks(): Task[] {
  return DEFAULT_TASKS.map((def, index) => ({
    id: def.id,
    title: def.title,
    group: def.group,
    sortOrder: index,
    claimedByPid: null,
    claimedByName: null,
    claimedAt: null,
    done: false,
    doneByPid: null,
    doneByName: null,
    doneAt: null,
    delegateNote: '',
  }));
}
