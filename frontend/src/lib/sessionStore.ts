// THE swap boundary. Every function here is a plain async call with a
// signature that already looks like what it'll be once it calls Supabase.
// Right now, everything reads/writes one JSON blob per session in
// localStorage via localDb.ts. When Supabase lands, only the bodies below
// change — every signature and every caller stays untouched.
import * as localDb from './localDb';
import { generateCode } from './code';
import { STEP_DEFS } from '../data/steps';
import { seedTasks } from '../data/defaultTasks';
import type { Pid, SessionState, StepInfo, Task, TaskGroupName } from '../types/domain';

export class SessionNotFoundError extends Error {
  constructor(code: string) {
    super(`Session not found: ${code}`);
    this.name = 'SessionNotFoundError';
  }
}

function nowIso(): string {
  return new Date().toISOString();
}

async function mutate(
  code: string,
  fn: (state: SessionState) => SessionState,
): Promise<SessionState> {
  const current = localDb.readBlob(code);
  if (!current) throw new SessionNotFoundError(code);
  const next = fn(current);
  localDb.writeBlob(code, next);
  return next;
}

export async function createSession(
  creatorPid: Pid,
  creatorName: string,
): Promise<string> {
  let code = generateCode();
  while (localDb.readBlob(code) !== null) {
    code = generateCode();
  }

  const timestamp = nowIso();
  const state: SessionState = {
    session: {
      code,
      createdAt: timestamp,
      createdByPid: creatorPid,
      createdByName: creatorName,
    },
    participants: [{ pid: creatorPid, name: creatorName, joinedAt: timestamp }],
    tasks: seedTasks(),
    steps: STEP_DEFS.map((def) => ({
      id: def.id,
      label: def.label,
      staticNote: def.staticNote ?? null,
      status: 'tbd',
      at: null,
      location: null,
      note: null,
      confirmedByPid: null,
      confirmedByName: null,
      updatedAt: null,
    })),
  };

  localDb.writeBlob(code, state);
  return code;
}

export async function getSession(code: string): Promise<SessionState | null> {
  return localDb.readBlob(code);
}

export async function joinSession(
  code: string,
  pid: Pid,
  name: string,
): Promise<SessionState> {
  return mutate(code, (state) => {
    const existing = state.participants.find((p) => p.pid === pid);
    if (existing) {
      existing.name = name;
      return { ...state, participants: [...state.participants] };
    }
    return {
      ...state,
      participants: [
        ...state.participants,
        { pid, name, joinedAt: nowIso() },
      ],
    };
  });
}

export function subscribeToSession(
  code: string,
  onChange: (state: SessionState | null) => void,
): () => void {
  return localDb.subscribe(code, () => onChange(localDb.readBlob(code)));
}

function findTask(state: SessionState, taskId: string): Task {
  const task = state.tasks.find((t) => t.id === taskId);
  if (!task) throw new Error(`Task not found: ${taskId}`);
  return task;
}

export async function claimTask(
  code: string,
  taskId: string,
  pid: Pid,
  name: string,
): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.locks) {
    return navigator.locks.request(`sanad:session:${code}`, () =>
      claimTaskUnlocked(code, taskId, pid, name),
    );
  }
  return claimTaskUnlocked(code, taskId, pid, name);
}

function claimTaskUnlocked(
  code: string,
  taskId: string,
  pid: Pid,
  name: string,
): boolean {
  const current = localDb.readBlob(code);
  if (!current) throw new SessionNotFoundError(code);
  const task = findTask(current, taskId);

  if (task.claimedByPid && task.claimedByPid !== pid) {
    return false;
  }
  if (task.claimedByPid === pid) {
    return true; // idempotent re-claim by the same device
  }

  const nextTasks = current.tasks.map((t) =>
    t.id === taskId
      ? { ...t, claimedByPid: pid, claimedByName: name, claimedAt: nowIso() }
      : t,
  );
  localDb.writeBlob(code, { ...current, tasks: nextTasks });
  return true;
}

export async function releaseTask(code: string, taskId: string): Promise<void> {
  await mutate(code, (state) => ({
    ...state,
    tasks: state.tasks.map((t) =>
      t.id === taskId
        ? { ...t, claimedByPid: null, claimedByName: null, claimedAt: null }
        : t,
    ),
  }));
}

export async function setTaskDone(
  code: string,
  taskId: string,
  done: boolean,
  by: { pid: Pid; name: string } | null,
): Promise<void> {
  await mutate(code, (state) => ({
    ...state,
    tasks: state.tasks.map((t) =>
      t.id === taskId
        ? {
            ...t,
            done,
            doneByPid: done ? (by?.pid ?? null) : null,
            doneByName: done ? (by?.name ?? null) : null,
            doneAt: done ? nowIso() : null,
          }
        : t,
    ),
  }));
}

export async function setTaskDelegateNote(
  code: string,
  taskId: string,
  note: string,
): Promise<void> {
  await mutate(code, (state) => ({
    ...state,
    tasks: state.tasks.map((t) =>
      t.id === taskId ? { ...t, delegateNote: note } : t,
    ),
  }));
}

export async function confirmStep(
  code: string,
  stepId: string,
  fields: { at: string; location?: string; note?: string },
  by: { pid: Pid; name: string },
): Promise<void> {
  await mutate(code, (state) => ({
    ...state,
    steps: state.steps.map((s) =>
      s.id === stepId
        ? {
            ...s,
            status: 'confirmed',
            at: fields.at,
            location: fields.location ?? null,
            note: fields.note ?? null,
            confirmedByPid: by.pid,
            confirmedByName: by.name,
            updatedAt: nowIso(),
          }
        : s,
    ),
  }));
}

export async function markStepTBD(code: string, stepId: string): Promise<void> {
  await mutate(code, (state) => ({
    ...state,
    steps: state.steps.map((s) =>
      s.id === stepId
        ? {
            ...s,
            status: 'tbd',
            at: null,
            location: null,
            note: null,
            confirmedByPid: null,
            confirmedByName: null,
            updatedAt: null,
          }
        : s,
    ),
  }));
}

export async function addTask(
  code: string,
  fields: { title: string; group: TaskGroupName },
): Promise<string> {
  const id = crypto.randomUUID();
  await mutate(code, (state) => {
    const maxSortOrder = state.tasks.reduce((max, t) => Math.max(max, t.sortOrder), -1);
    const newTask: Task = {
      id,
      title: fields.title,
      group: fields.group,
      sortOrder: maxSortOrder + 1,
      claimedByPid: null,
      claimedByName: null,
      claimedAt: null,
      done: false,
      doneByPid: null,
      doneByName: null,
      doneAt: null,
      delegateNote: '',
    };
    return { ...state, tasks: [...state.tasks, newTask] };
  });
  return id;
}

export async function editTask(
  code: string,
  taskId: string,
  fields: { title: string; group: TaskGroupName },
): Promise<void> {
  await mutate(code, (state) => ({
    ...state,
    tasks: state.tasks.map((t) =>
      t.id === taskId ? { ...t, title: fields.title, group: fields.group } : t,
    ),
  }));
}

export async function removeTask(code: string, taskId: string): Promise<void> {
  await mutate(code, (state) => ({
    ...state,
    tasks: state.tasks.filter((t) => t.id !== taskId),
  }));
}

export async function addStep(
  code: string,
  fields: { label: string; staticNote?: string },
): Promise<string> {
  const id = crypto.randomUUID();
  await mutate(code, (state) => {
    const newStep: StepInfo = {
      id,
      label: fields.label,
      staticNote: fields.staticNote ?? null,
      status: 'tbd',
      at: null,
      location: null,
      note: null,
      confirmedByPid: null,
      confirmedByName: null,
      updatedAt: null,
    };
    return { ...state, steps: [...state.steps, newStep] };
  });
  return id;
}

export async function editStep(
  code: string,
  stepId: string,
  fields: { label: string; staticNote?: string },
): Promise<void> {
  await mutate(code, (state) => ({
    ...state,
    steps: state.steps.map((s) =>
      s.id === stepId
        ? { ...s, label: fields.label, staticNote: fields.staticNote ?? null }
        : s,
    ),
  }));
}

export async function removeStep(code: string, stepId: string): Promise<void> {
  await mutate(code, (state) => ({
    ...state,
    steps: state.steps.filter((s) => s.id !== stepId),
  }));
}
