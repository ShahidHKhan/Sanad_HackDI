// THE swap boundary. Every function here is a plain async call — components
// and hooks (useSessionState.ts) only ever import from here, never from
// Supabase directly. That's what made this swap (localStorage -> Supabase)
// a one-file change: every signature below is unchanged from the
// localStorage version, only the bodies now call Postgres.
import { supabase } from './supabase';
import { generateCode } from './code';
import { generateUuid } from './uuid';
import type { AnnouncementFacts } from './announceTemplate';
import { seedTasks } from '../data/defaultTasks';
import type {
  Cemetery,
  ChatMessage,
  Cost,
  DirectoryCall,
  DirectoryEntryType,
  DirectoryOutcome,
  DocumentEntry,
  Masjid,
  Participant,
  Pid,
  PlaceLookupResult,
  SessionMeta,
  SessionState,
  Task,
  TaskGroupName,
  Volunteer,
} from '../types/domain';

export class SessionNotFoundError extends Error {
  constructor(code: string) {
    super(`Session not found: ${code}`);
    this.name = 'SessionNotFoundError';
  }
}

function nowIso(): string {
  return new Date().toISOString();
}

// --- row <-> domain mappers -------------------------------------------

function rowToSessionMeta(row: any): SessionMeta {
  return {
    code: row.code,
    createdAt: row.created_at,
    createdByPid: row.created_by_pid,
    createdByName: row.created_by_name,
    deceasedName: row.deceased_name,
    diedAt: row.died_at,
    deathLocation: row.death_location,
    masjidName: row.masjid_name,
    cemeteryName: row.cemetery_name,
    coordinatorName: row.coordinator_name,
    coordinatorPhone: row.coordinator_phone,
  };
}

function rowToParticipant(row: any): Participant {
  return { pid: row.pid, name: row.name, joinedAt: row.joined_at, role: row.role };
}

function rowToCost(row: any): Cost {
  return {
    id: row.id,
    label: row.label,
    amount: Number(row.amount),
    paidByPid: row.paid_by_pid,
    paidByName: row.paid_by_name,
    at: row.at,
    addedByPid: row.added_by_pid,
    addedByName: row.added_by_name,
  };
}

function rowToDocument(row: any): DocumentEntry {
  return {
    id: row.id,
    title: row.title,
    note: row.note,
    addedByPid: row.added_by_pid,
    addedByName: row.added_by_name,
    at: row.at,
    filePath: row.file_path,
    fileName: row.file_name,
    fileType: row.file_type,
    fileSize: row.file_size,
  };
}

function rowToMasjid(row: any): Masjid {
  return {
    id: row.id,
    name: row.name,
    town: row.town,
    phone: row.phone,
    ghuslMen: row.ghusl_men,
    ghuslWomen: row.ghusl_women,
    shortNotice: row.short_notice,
    notes: row.notes,
    addedByName: row.added_by_name,
    createdAt: row.created_at,
  };
}

function rowToCemetery(row: any): Cemetery {
  return {
    id: row.id,
    name: row.name,
    town: row.town,
    phone: row.phone,
    islamicSection: row.islamic_section,
    noCasketAllowed: row.no_casket_allowed,
    intermentHours: row.interment_hours,
    notes: row.notes,
    addedByName: row.added_by_name,
    createdAt: row.created_at,
  };
}

function rowToDirectoryCall(row: any): DirectoryCall {
  return {
    entryType: row.entry_type,
    entryId: row.entry_id,
    claimedByPid: row.claimed_by_pid,
    claimedByName: row.claimed_by_name,
    claimedAt: row.claimed_at,
    outcome: row.outcome,
    outcomeNote: row.outcome_note,
    confirmedAt: row.confirmed_at,
    loggedByPid: row.logged_by_pid,
    loggedByName: row.logged_by_name,
    loggedAt: row.logged_at,
  };
}

function rowToVolunteer(row: any): Volunteer {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    note: row.note,
    addedByPid: row.added_by_pid,
    addedByName: row.added_by_name,
    at: row.at,
  };
}

function rowToChatMessage(row: any): ChatMessage {
  return {
    id: row.id,
    text: row.text,
    at: row.at,
    senderPid: row.sender_pid,
    senderName: row.sender_name,
  };
}

function rowToTask(row: any): Task {
  return {
    id: row.id,
    title: row.title,
    group: row.group_name as TaskGroupName,
    sortOrder: row.sort_order,
    claimedByPid: row.claimed_by_pid,
    claimedByName: row.claimed_by_name,
    claimedAt: row.claimed_at,
    done: row.done,
    doneByPid: row.done_by_pid,
    doneByName: row.done_by_name,
    doneAt: row.done_at,
    delegateNote: row.delegate_note,
    pinned: row.pinned,
    location: row.location,
  };
}

function taskToRow(sessionCode: string, task: Task) {
  return {
    id: task.id,
    session_code: sessionCode,
    title: task.title,
    group_name: task.group,
    sort_order: task.sortOrder,
    claimed_by_pid: task.claimedByPid,
    claimed_by_name: task.claimedByName,
    claimed_at: task.claimedAt,
    done: task.done,
    done_by_pid: task.doneByPid,
    done_by_name: task.doneByName,
    done_at: task.doneAt,
    delegate_note: task.delegateNote,
    pinned: task.pinned,
    location: task.location,
  };
}

// --- session mechanic ---------------------------------------------------

export async function createSession(
  creatorPid: Pid,
  creatorName: string,
): Promise<string> {
  let code = generateCode();
  let attempts = 0;
  for (;;) {
    const { error } = await supabase.from('sessions').insert({
      code,
      created_at: nowIso(),
      created_by_pid: creatorPid,
      created_by_name: creatorName,
    });
    if (!error) break;
    attempts += 1;
    if (error.code === '23505' && attempts < 5) {
      code = generateCode();
      continue;
    }
    throw error;
  }

  const { error: participantError } = await supabase.from('participants').insert({
    session_code: code,
    pid: creatorPid,
    name: creatorName,
    joined_at: nowIso(),
    role: 'admin',
  });
  if (participantError) throw participantError;

  const { error: tasksError } = await supabase
    .from('tasks')
    .insert(seedTasks().map((t) => taskToRow(code, t)));
  if (tasksError) throw tasksError;

  return code;
}

export async function getSession(code: string): Promise<SessionState | null> {
  const { data: sessionRow, error: sessionError } = await supabase
    .from('sessions')
    .select('*')
    .eq('code', code)
    .maybeSingle();
  if (sessionError) throw sessionError;
  if (!sessionRow) return null;

  const [
    { data: participantRows, error: participantsError },
    { data: taskRows, error: tasksError },
    { data: costRows, error: costsError },
    { data: documentRows, error: documentsError },
    { data: chatRows, error: chatError },
    { data: directoryCallRows, error: directoryCallsError },
    { data: volunteerRows, error: volunteersError },
  ] = await Promise.all([
    supabase.from('participants').select('*').eq('session_code', code).order('joined_at'),
    supabase.from('tasks').select('*').eq('session_code', code).order('sort_order'),
    supabase.from('costs').select('*').eq('session_code', code).order('at'),
    supabase.from('documents').select('*').eq('session_code', code).order('at'),
    supabase.from('chat_messages').select('*').eq('session_code', code).order('at'),
    supabase.from('directory_calls').select('*').eq('session_code', code),
    supabase.from('volunteers').select('*').eq('session_code', code).order('at'),
  ]);
  if (participantsError) throw participantsError;
  if (tasksError) throw tasksError;
  if (costsError) throw costsError;
  if (documentsError) throw documentsError;
  if (chatError) throw chatError;
  if (directoryCallsError) throw directoryCallsError;
  if (volunteersError) throw volunteersError;

  return {
    session: rowToSessionMeta(sessionRow),
    participants: (participantRows ?? []).map(rowToParticipant),
    tasks: (taskRows ?? []).map(rowToTask),
    costs: (costRows ?? []).map(rowToCost),
    documents: (documentRows ?? []).map(rowToDocument),
    chatMessages: (chatRows ?? []).map(rowToChatMessage),
    directoryCalls: (directoryCallRows ?? []).map(rowToDirectoryCall),
    volunteers: (volunteerRows ?? []).map(rowToVolunteer),
  };
}

export async function joinSession(
  code: string,
  pid: Pid,
  name: string,
  role: 'family' | 'masjid' = 'family',
): Promise<SessionState> {
  const { data: existing, error: findError } = await supabase
    .from('participants')
    .select('id')
    .eq('session_code', code)
    .eq('pid', pid)
    .maybeSingle();
  if (findError) throw findError;

  if (existing) {
    // Re-joining never changes an existing role — a returning admin/family/
    // masjid participant keeps whatever role they already had.
    const { error } = await supabase
      .from('participants')
      .update({ name })
      .eq('session_code', code)
      .eq('pid', pid);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('participants')
      .insert({ session_code: code, pid, name, joined_at: nowIso(), role });
    if (error) throw error;
  }

  const state = await getSession(code);
  if (!state) throw new SessionNotFoundError(code);
  return state;
}

export function subscribeToSession(
  code: string,
  onChange: (state: SessionState | null) => void,
): () => void {
  const POLL_INTERVAL_MS = 5000;
  let cancelled = false;

  const refetch = () => {
    if (cancelled) return;
    getSession(code)
      .then((state) => {
        if (!cancelled) onChange(state);
      })
      .catch(() => {
        // transient network hiccup — the poll fallback will retry
      });
  };

  const channel = supabase
    .channel(`session:${code}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'sessions', filter: `code=eq.${code}` },
      refetch,
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'participants', filter: `session_code=eq.${code}` },
      refetch,
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'tasks', filter: `session_code=eq.${code}` },
      refetch,
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'costs', filter: `session_code=eq.${code}` },
      refetch,
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'documents', filter: `session_code=eq.${code}` },
      refetch,
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'chat_messages', filter: `session_code=eq.${code}` },
      refetch,
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'directory_calls', filter: `session_code=eq.${code}` },
      refetch,
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'volunteers', filter: `session_code=eq.${code}` },
      refetch,
    )
    .subscribe();

  // Defensive fallback — same philosophy as everywhere else: if Realtime
  // misbehaves, a slow poll still gets everyone to the right state.
  const pollId = window.setInterval(refetch, POLL_INTERVAL_MS);

  return () => {
    cancelled = true;
    supabase.removeChannel(channel);
    window.clearInterval(pollId);
  };
}

// --- tasks ---------------------------------------------------------------

export async function claimTask(
  code: string,
  taskId: string,
  pid: Pid,
  name: string,
): Promise<boolean> {
  const { data: existing, error: findError } = await supabase
    .from('tasks')
    .select('claimed_by_pid')
    .eq('session_code', code)
    .eq('id', taskId)
    .maybeSingle();
  if (findError) throw findError;
  if (existing?.claimed_by_pid === pid) return true; // idempotent re-claim

  const { data, error } = await supabase
    .from('tasks')
    .update({ claimed_by_pid: pid, claimed_by_name: name, claimed_at: nowIso() })
    .eq('session_code', code)
    .eq('id', taskId)
    .is('claimed_by_pid', null)
    .select();
  if (error) throw error;
  return (data?.length ?? 0) > 0; // zero rows back = someone else beat us to it
}

export async function releaseTask(code: string, taskId: string): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .update({ claimed_by_pid: null, claimed_by_name: null, claimed_at: null })
    .eq('session_code', code)
    .eq('id', taskId);
  if (error) throw error;
}

export async function setTaskDone(
  code: string,
  taskId: string,
  done: boolean,
  by: { pid: Pid; name: string } | null,
): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .update({
      done,
      done_by_pid: done ? (by?.pid ?? null) : null,
      done_by_name: done ? (by?.name ?? null) : null,
      done_at: done ? nowIso() : null,
    })
    .eq('session_code', code)
    .eq('id', taskId);
  if (error) throw error;
}

// Sets a pinned Overview task to done with a specific real-world confirmed
// time (not "now") — used by the Find-tab auto-sync below, where the
// confirmed date/time is the actual janazah/burial-slot time, which may be
// well before or after the moment the call was logged. Only touches
// `location` when one is supplied, so it never overwrites a location a
// family member already entered manually on the Tasks tab.
async function setTaskConfirmed(
  code: string,
  taskId: string,
  fields: { at: string; location?: string },
  by: { pid: Pid; name: string },
): Promise<void> {
  const update: Record<string, unknown> = {
    done: true,
    done_by_pid: by.pid,
    done_by_name: by.name,
    done_at: fields.at,
  };
  if (fields.location) update.location = fields.location;
  const { error } = await supabase.from('tasks').update(update).eq('session_code', code).eq('id', taskId);
  if (error) throw error;
}

export async function setTaskDelegateNote(
  code: string,
  taskId: string,
  note: string,
): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .update({ delegate_note: note })
    .eq('session_code', code)
    .eq('id', taskId);
  if (error) throw error;
}

export async function addTask(
  code: string,
  fields: { title: string; group: TaskGroupName },
): Promise<string> {
  const { data: rows, error: fetchError } = await supabase
    .from('tasks')
    .select('sort_order')
    .eq('session_code', code);
  if (fetchError) throw fetchError;
  const maxSortOrder = (rows ?? []).reduce((max, r) => Math.max(max, r.sort_order), -1);

  const id = generateUuid();
  const { error } = await supabase.from('tasks').insert({
    id,
    session_code: code,
    title: fields.title,
    group_name: fields.group,
    sort_order: maxSortOrder + 1,
    claimed_by_pid: null,
    claimed_by_name: null,
    claimed_at: null,
    done: false,
    done_by_pid: null,
    done_by_name: null,
    done_at: null,
    delegate_note: '',
    pinned: false,
    location: null,
  });
  if (error) throw error;
  return id;
}

export async function editTask(
  code: string,
  taskId: string,
  fields: { title: string; group: TaskGroupName },
): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .update({ title: fields.title, group_name: fields.group })
    .eq('session_code', code)
    .eq('id', taskId);
  if (error) throw error;
}

export async function removeTask(code: string, taskId: string): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('session_code', code)
    .eq('id', taskId);
  if (error) throw error;
}

export async function setTaskPinned(
  code: string,
  taskId: string,
  pinned: boolean,
): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .update({ pinned })
    .eq('session_code', code)
    .eq('id', taskId);
  if (error) throw error;
}

export async function setTaskLocation(
  code: string,
  taskId: string,
  location: string,
): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .update({ location: location || null })
    .eq('session_code', code)
    .eq('id', taskId);
  if (error) throw error;
}

// --- session details -------------------------------------------------------

export async function updateSessionDetails(
  code: string,
  fields: {
    deceasedName?: string;
    diedAt?: string;
    deathLocation?: string;
    masjidName?: string;
    cemeteryName?: string;
    coordinatorName?: string;
    coordinatorPhone?: string;
  },
): Promise<void> {
  const { error } = await supabase
    .from('sessions')
    .update({
      deceased_name: fields.deceasedName || null,
      died_at: fields.diedAt || null,
      death_location: fields.deathLocation || null,
      masjid_name: fields.masjidName || null,
      cemetery_name: fields.cemeteryName || null,
      coordinator_name: fields.coordinatorName || null,
      coordinator_phone: fields.coordinatorPhone || null,
    })
    .eq('code', code);
  if (error) throw error;
}

// --- records: costs & documents ---------------------------------------------

export async function addCost(
  code: string,
  fields: { label: string; amount: number; paidByPid: Pid; paidByName: string },
  by: { pid: Pid; name: string },
): Promise<void> {
  const { error } = await supabase.from('costs').insert({
    session_code: code,
    label: fields.label,
    amount: fields.amount,
    paid_by_pid: fields.paidByPid,
    paid_by_name: fields.paidByName,
    at: nowIso(),
    added_by_pid: by.pid,
    added_by_name: by.name,
  });
  if (error) throw error;
}

export interface UploadedDocumentFile {
  path: string;
  name: string;
  type: string;
  size: number;
}

const MAX_DOCUMENT_FILE_BYTES = 10 * 1024 * 1024; // 10MB

// A document's file lives in the private "documents" storage bucket at
// {session_code}/{uuid}-{original filename} — grouped by session, collision
// -proofed with a uuid prefix. Private (not a public bucket) because a
// death certificate can carry real personal info; view links are always
// generated on demand via getDocumentFileUrl, never a stored public URL.
export async function uploadDocumentFile(code: string, file: File): Promise<UploadedDocumentFile> {
  if (file.size > MAX_DOCUMENT_FILE_BYTES) {
    throw new Error('File is too large (10MB max).');
  }
  const path = `${code}/${generateUuid()}-${file.name}`;
  const { error } = await supabase.storage.from('documents').upload(path, file);
  if (error) throw error;
  return { path, name: file.name, type: file.type, size: file.size };
}

export async function getDocumentFileUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage.from('documents').createSignedUrl(path, 60 * 60);
  if (error) throw error;
  return data.signedUrl;
}

export async function addDocument(
  code: string,
  fields: { title: string; note: string; file?: UploadedDocumentFile },
  by: { pid: Pid; name: string },
): Promise<void> {
  const { error } = await supabase.from('documents').insert({
    session_code: code,
    title: fields.title,
    note: fields.note,
    added_by_pid: by.pid,
    added_by_name: by.name,
    at: nowIso(),
    file_path: fields.file?.path ?? null,
    file_name: fields.file?.name ?? null,
    file_type: fields.file?.type ?? null,
    file_size: fields.file?.size ?? null,
  });
  if (error) throw error;
}

export async function removeDocument(
  code: string,
  documentId: string,
  filePath: string | null,
): Promise<void> {
  if (filePath) {
    const { error: storageError } = await supabase.storage.from('documents').remove([filePath]);
    if (storageError) throw storageError;
  }
  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('session_code', code)
    .eq('id', documentId);
  if (error) throw error;
}

// --- chat --------------------------------------------------------------

export async function sendChatMessage(
  code: string,
  text: string,
  by: { pid: Pid; name: string },
): Promise<void> {
  const { error } = await supabase.from('chat_messages').insert({
    session_code: code,
    text,
    at: nowIso(),
    sender_pid: by.pid,
    sender_name: by.name,
  });
  if (error) throw error;
}

// --- find: masjid & cemetery directory --------------------------------
//
// Masjids/cemeteries are global (MVP.md §4) — shared across every session,
// not per-family — so they're fetched/subscribed independently of a session
// code. Call-tracking (directory_calls) stays per-session and flows through
// getSession/subscribeToSession above like everything else.

export interface DirectoryData {
  masjids: Masjid[];
  cemeteries: Cemetery[];
}

export async function getDirectory(): Promise<DirectoryData> {
  const [
    { data: masjidRows, error: masjidError },
    { data: cemeteryRows, error: cemeteryError },
  ] = await Promise.all([
    supabase.from('masjids').select('*').order('name'),
    supabase.from('cemeteries').select('*').order('name'),
  ]);
  if (masjidError) throw masjidError;
  if (cemeteryError) throw cemeteryError;

  return {
    masjids: (masjidRows ?? []).map(rowToMasjid),
    cemeteries: (cemeteryRows ?? []).map(rowToCemetery),
  };
}

export function subscribeToDirectory(onChange: (data: DirectoryData) => void): () => void {
  const POLL_INTERVAL_MS = 5000;
  let cancelled = false;

  const refetch = () => {
    if (cancelled) return;
    getDirectory()
      .then((data) => {
        if (!cancelled) onChange(data);
      })
      .catch(() => {
        // transient network hiccup — the poll fallback will retry
      });
  };

  const channel = supabase
    .channel('directory')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'masjids' }, refetch)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'cemeteries' }, refetch)
    .subscribe();

  const pollId = window.setInterval(refetch, POLL_INTERVAL_MS);

  return () => {
    cancelled = true;
    supabase.removeChannel(channel);
    window.clearInterval(pollId);
  };
}

export async function addMasjid(
  fields: {
    name: string;
    town: string;
    phone: string;
    ghuslMen: boolean;
    ghuslWomen: boolean;
    shortNotice: boolean;
    notes: string;
  },
  by: { name: string },
): Promise<void> {
  const { error } = await supabase.from('masjids').insert({
    name: fields.name,
    town: fields.town,
    phone: fields.phone,
    ghusl_men: fields.ghuslMen,
    ghusl_women: fields.ghuslWomen,
    short_notice: fields.shortNotice,
    notes: fields.notes,
    added_by_name: by.name,
  });
  if (error) throw error;
}

export async function addCemetery(
  fields: {
    name: string;
    town: string;
    phone: string;
    islamicSection: boolean;
    noCasketAllowed: boolean;
    intermentHours: string;
    notes: string;
  },
  by: { name: string },
): Promise<void> {
  const { error } = await supabase.from('cemeteries').insert({
    name: fields.name,
    town: fields.town,
    phone: fields.phone,
    islamic_section: fields.islamicSection,
    no_casket_allowed: fields.noCasketAllowed,
    interment_hours: fields.intermentHours,
    notes: fields.notes,
    added_by_name: by.name,
  });
  if (error) throw error;
}

// Removes a directory entry and any per-session call-tracking rows pointing
// at it — entry_id isn't a real foreign key (it can reference either
// masjids or cemeteries depending on entry_type), so nothing cascades this
// automatically.
export async function removeMasjid(id: string): Promise<void> {
  const { error: callsError } = await supabase
    .from('directory_calls')
    .delete()
    .eq('entry_type', 'masjid')
    .eq('entry_id', id);
  if (callsError) throw callsError;
  const { error } = await supabase.from('masjids').delete().eq('id', id);
  if (error) throw error;
}

export async function removeCemetery(id: string): Promise<void> {
  const { error: callsError } = await supabase
    .from('directory_calls')
    .delete()
    .eq('entry_type', 'cemetery')
    .eq('entry_id', id);
  if (callsError) throw callsError;
  const { error } = await supabase.from('cemeteries').delete().eq('id', id);
  if (error) throw error;
}

export async function claimDirectoryEntry(
  code: string,
  entryType: DirectoryEntryType,
  entryId: string,
  pid: Pid,
  name: string,
): Promise<boolean> {
  const { data: existing, error: findError } = await supabase
    .from('directory_calls')
    .select('claimed_by_pid')
    .eq('session_code', code)
    .eq('entry_type', entryType)
    .eq('entry_id', entryId)
    .maybeSingle();
  if (findError) throw findError;

  if (!existing) {
    const { error } = await supabase.from('directory_calls').insert({
      session_code: code,
      entry_type: entryType,
      entry_id: entryId,
      claimed_by_pid: pid,
      claimed_by_name: name,
      claimed_at: nowIso(),
    });
    if (error) {
      if (error.code === '23505') return false; // someone else inserted first
      throw error;
    }
    return true;
  }

  if (existing.claimed_by_pid === pid) return true; // idempotent re-claim
  if (existing.claimed_by_pid) return false; // someone else already has it

  const { data, error } = await supabase
    .from('directory_calls')
    .update({ claimed_by_pid: pid, claimed_by_name: name, claimed_at: nowIso() })
    .eq('session_code', code)
    .eq('entry_type', entryType)
    .eq('entry_id', entryId)
    .is('claimed_by_pid', null)
    .select();
  if (error) throw error;
  return (data?.length ?? 0) > 0; // zero rows back = someone else beat us to it
}

export async function releaseDirectoryEntry(
  code: string,
  entryType: DirectoryEntryType,
  entryId: string,
): Promise<void> {
  const { error } = await supabase
    .from('directory_calls')
    .update({ claimed_by_pid: null, claimed_by_name: null, claimed_at: null })
    .eq('session_code', code)
    .eq('entry_type', entryType)
    .eq('entry_id', entryId);
  if (error) throw error;
}

async function searchNearbyPlaces(
  type: 'masjid' | 'cemetery',
  query: string,
): Promise<{ results: PlaceLookupResult[]; notice?: string }> {
  const { data, error } = await supabase.functions.invoke('search-masjids', {
    body: { query, type },
  });
  if (error) throw error;
  return data;
}

export function searchNearbyMasjids(query: string) {
  return searchNearbyPlaces('masjid', query);
}

export function searchNearbyCemeteries(query: string) {
  return searchNearbyPlaces('cemetery', query);
}

// IMPLEMENTATION.md Phase 5: "Logging an outcome as Confirmed with a time
// writes into the matching Overview step (masjid -> janazah;
// cemetery -> cemetery-confirms-slot) — implement it as one function both
// features call, not duplicated logic." One direction only: a Find
// confirmation updates Overview; the reverse isn't part of the spec.
const OVERVIEW_TASK_BY_ENTRY_TYPE: Record<DirectoryEntryType, string> = {
  masjid: 'janazah-prayer-held',
  cemetery: 'cemetery-confirms-slot',
};

export async function logDirectoryOutcome(
  code: string,
  entryType: DirectoryEntryType,
  entryId: string,
  fields: { outcome: DirectoryOutcome; note: string; confirmedAt: string | null; entryLocation?: string },
  by: { pid: Pid; name: string },
): Promise<void> {
  const { error } = await supabase.from('directory_calls').upsert({
    session_code: code,
    entry_type: entryType,
    entry_id: entryId,
    outcome: fields.outcome,
    outcome_note: fields.note || null,
    confirmed_at: fields.confirmedAt,
    logged_by_pid: by.pid,
    logged_by_name: by.name,
    logged_at: nowIso(),
  });
  if (error) throw error;

  if (fields.outcome === 'confirmed' && fields.confirmedAt) {
    await setTaskConfirmed(
      code,
      OVERVIEW_TASK_BY_ENTRY_TYPE[entryType],
      { at: fields.confirmedAt, location: fields.entryLocation },
      by,
    );
  }
}

// --- logistics (Masjid half, direct confirmation of facility-side steps) --
//
// The masjid board is the authoritative source for these two Overview steps
// — they shouldn't need a family member to call them and log the outcome
// via the Find tab (logDirectoryOutcome above) just to get their own
// confirmed slot onto the shared timeline. Same underlying setTaskConfirmed
// as the Find-tab sync, so both paths update the one shared task consistently.

export async function confirmGhuslSlot(
  code: string,
  fields: { at: string; location?: string },
  by: { pid: Pid; name: string },
): Promise<void> {
  await setTaskConfirmed(code, 'ghusl-kafan-completed', fields, by);
}

export async function confirmJanazahSlot(
  code: string,
  fields: { at: string; location?: string },
  by: { pid: Pid; name: string },
): Promise<void> {
  await setTaskConfirmed(code, 'janazah-prayer-held', fields, by);
}

// A free-text "extra context" note, modeled as one more well-known task
// (like the two above) so it reuses setTaskDelegateNote/state.tasks with no
// schema change. Sessions created after this task was added to
// seedTasks() already have it; ensureLogisticsContextTask self-heals it
// onto older sessions the first time their Logistics tab loads.
export const LOGISTICS_CONTEXT_TASK_ID = 'masjid-extra-context';

export async function ensureLogisticsContextTask(code: string): Promise<void> {
  const { data: existing, error: findError } = await supabase
    .from('tasks')
    .select('id')
    .eq('session_code', code)
    .eq('id', LOGISTICS_CONTEXT_TASK_ID)
    .maybeSingle();
  if (findError) throw findError;
  if (existing) return;

  const { data: rows, error: fetchError } = await supabase
    .from('tasks')
    .select('sort_order')
    .eq('session_code', code);
  if (fetchError) throw fetchError;
  const maxSortOrder = (rows ?? []).reduce((max, r) => Math.max(max, r.sort_order), -1);

  const { error } = await supabase.from('tasks').insert({
    id: LOGISTICS_CONTEXT_TASK_ID,
    session_code: code,
    title: 'Extra context for the family',
    group_name: 'Logistics',
    sort_order: maxSortOrder + 1,
    claimed_by_pid: null,
    claimed_by_name: null,
    claimed_at: null,
    done: false,
    done_by_pid: null,
    done_by_name: null,
    done_at: null,
    delegate_note: '',
    pinned: false,
    location: null,
  });
  // A concurrent ensure-call from another participant may have inserted it
  // first — that's fine, not a real error.
  if (error && error.code !== '23505') throw error;
}

// --- volunteers (Masjid half, per-session roster) -----------------------

export async function addVolunteer(
  code: string,
  fields: { name: string; phone: string; note: string },
  by: { pid: Pid; name: string },
): Promise<void> {
  const { error } = await supabase.from('volunteers').insert({
    session_code: code,
    name: fields.name,
    phone: fields.phone,
    note: fields.note,
    added_by_pid: by.pid,
    added_by_name: by.name,
    at: nowIso(),
  });
  if (error) throw error;
}

// --- announce: AI-written option -----------------------------------------

export async function generateAnnouncementText(facts: AnnouncementFacts): Promise<string> {
  const { data, error } = await supabase.functions.invoke('write-announcement', {
    body: facts,
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data.text;
}
