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
}

export interface StepInfo {
  id: string;
  label: string;
  staticNote: string | null;
  status: 'tbd' | 'confirmed';
  at: string | null;
  location: string | null;
  note: string | null;
  confirmedByPid: Pid | null;
  confirmedByName: string | null;
  updatedAt: string | null;
}

export interface SessionMeta {
  code: string;
  createdAt: string;
  createdByPid: Pid;
  createdByName: string;
}

export interface SessionState {
  session: SessionMeta;
  participants: Participant[];
  tasks: Task[];
  steps: StepInfo[];
}
