import { useState, type FormEvent } from 'react';

interface StepConfirmModalProps {
  stepLabel: string;
  onConfirm: (fields: { at: string; location?: string; note?: string }) => void;
  onClose: () => void;
}

export function StepConfirmModal({ stepLabel, onConfirm, onClose }: StepConfirmModalProps) {
  const [datetime, setDatetime] = useState('');
  const [location, setLocation] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!datetime) {
      setError('Date & time is required.');
      return;
    }
    onConfirm({
      at: new Date(datetime).toISOString(),
      location: location.trim() || undefined,
      note: note.trim() || undefined,
    });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <form
        className="modal panel"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <h2>Confirm: {stepLabel}</h2>
        <label htmlFor="step-datetime">Date & time</label>
        <input
          id="step-datetime"
          type="datetime-local"
          value={datetime}
          onChange={(e) => setDatetime(e.target.value)}
        />
        <label htmlFor="step-location">Location (optional)</label>
        <input
          id="step-location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <label htmlFor="step-note">Note (optional)</label>
        <input
          id="step-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        {error && <p className="form-error">{error}</p>}
        <div className="modal-actions">
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button type="submit">Save</button>
        </div>
      </form>
    </div>
  );
}
