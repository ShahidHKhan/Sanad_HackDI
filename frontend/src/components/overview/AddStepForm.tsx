import { useState, type FormEvent } from 'react';
import * as sessionStore from '../../lib/sessionStore';

interface AddStepFormProps {
  code: string;
}

export function AddStepForm({ code }: AddStepFormProps) {
  const [label, setLabel] = useState('');
  const [staticNote, setStaticNote] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = label.trim();
    if (!trimmed) return;
    sessionStore.addStep(code, {
      label: trimmed,
      staticNote: staticNote.trim() || undefined,
    });
    setLabel('');
    setStaticNote('');
  }

  return (
    <form className="panel add-form" onSubmit={handleSubmit}>
      <h3>Add a step</h3>
      <label htmlFor="add-step-label">Label</label>
      <input
        id="add-step-label"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="e.g. Visa/travel arrangements"
      />
      <label htmlFor="add-step-note">Static note (optional)</label>
      <input
        id="add-step-note"
        value={staticNote}
        onChange={(e) => setStaticNote(e.target.value)}
      />
      <button type="submit" disabled={!label.trim()}>
        Add step
      </button>
    </form>
  );
}
