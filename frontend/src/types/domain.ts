export type Pid = string;

export interface Participant {
  pid: Pid;
  name: string;
  joinedAt: string;
}

export type TaskGroupName =
  | 'Notify & Authorize'
  | 'Body & Religious Care'
  | 'Legal & Documents'
  | 'Logistics'
  | 'Community';

export interface Task {
  id: string;
  title: string;
  group: TaskGroupName;
  sortOrder: number;
  claimedByPid: Pid | null;
  claimedByName: string | null;
  claimedAt: string | null;
  done: boolean;
  doneByPid: Pid | null;
  doneByName: string | null;
  doneAt: string | null;
  delegateNote: string;
  pinned: boolean;
  location: string | null;
}

export interface Cost {
  id: string;
  label: string;
  amount: number;
  paidByPid: Pid;
  paidByName: string;
  at: string;
  addedByPid: Pid;
  addedByName: string;
}

export interface DocumentEntry {
  id: string;
  title: string;
  note: string;
  addedByPid: Pid;
  addedByName: string;
  at: string;
}

export interface SessionMeta {
  code: string;
  createdAt: string;
  createdByPid: Pid;
  createdByName: string;
  deceasedName: string | null;
  diedAt: string | null;
  deathLocation: string | null;
  masjidName: string | null;
  cemeteryName: string | null;
  coordinatorName: string | null;
  coordinatorPhone: string | null;
}

export interface ChatMessage {
  id: string;
  text: string;
  at: string;
  senderPid: Pid;
  senderName: string;
}

export interface Masjid {
  id: string;
  name: string;
  town: string;
  phone: string;
  ghuslMen: boolean;
  ghuslWomen: boolean;
  shortNotice: boolean;
  notes: string;
  addedByName: string;
  createdAt: string;
}

export interface Cemetery {
  id: string;
  name: string;
  town: string;
  phone: string;
  islamicSection: boolean;
  noCasketAllowed: boolean;
  intermentHours: string;
  notes: string;
  addedByName: string;
  createdAt: string;
}

export type DirectoryEntryType = 'masjid' | 'cemetery';
export type DirectoryOutcome = 'confirmed' | 'not_available';

export interface DirectoryCall {
  entryType: DirectoryEntryType;
  entryId: string;
  claimedByPid: Pid | null;
  claimedByName: string | null;
  claimedAt: string | null;
  outcome: DirectoryOutcome | null;
  outcomeNote: string | null;
  confirmedAt: string | null;
  loggedByPid: Pid | null;
  loggedByName: string | null;
  loggedAt: string | null;
}

export interface SessionState {
  session: SessionMeta;
  participants: Participant[];
  tasks: Task[];
  costs: Cost[];
  documents: DocumentEntry[];
  chatMessages: ChatMessage[];
  directoryCalls: DirectoryCall[];
}
