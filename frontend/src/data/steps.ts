import type { StepId } from '../types/domain';

export interface StepDef {
  id: StepId;
  label: string;
  staticNote?: string;
}

// Fixed order per MVP.md §2 — never re-sort this list.
export const STEP_DEFS: StepDef[] = [
  { id: 'me_release', label: 'Medical examiner/physician releases the body' },
  { id: 'transport', label: 'Transport to funeral home' },
  { id: 'ghusl_kafan', label: 'Ghusl & kafan' },
  {
    id: 'burial_permit',
    label: 'Burial permit issued',
    staticNote: 'Registrar hours: weekdays 9am–4pm',
  },
  {
    id: 'cemetery_confirm',
    label: 'Cemetery confirms the slot',
    staticNote: 'Cemetery hours: Mon–Sat 9am–3pm, closed Sunday',
  },
  { id: 'janazah', label: 'Janazah prayer held' },
  { id: 'burial', label: 'Burial' },
];
