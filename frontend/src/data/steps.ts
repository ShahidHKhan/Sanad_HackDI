export interface StepDef {
  id: string;
  label: string;
  staticNote?: string;
}

// Seed data only — used once by sessionStore.createSession. Session state
// (state.steps) is authoritative for order/labels/notes after that; nothing
// else should import STEP_DEFS.
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
