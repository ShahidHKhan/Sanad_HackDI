import { useState, type FormEvent } from 'react';
import type { Task } from '../../types/domain';

interface LogisticsSlotCardProps {
  title: string;
  task: Task | undefined;
  locationLabel: string;
  locationPlaceholder: string;
  onConfirm: (fields: { at: string; location?: string }) => void;
  onMarkTbd: () => void;
}

export function LogisticsSlotCard({
  title,
  task,
  locationLabel,
  locationPlaceholder,
  onConfirm,
  onMarkTbd,
}: LogisticsSlotCardProps) {
  const [editing, setEditing] = useState(false);
  const [atDraft, setAtDraft] = useState('');
  const [locationDraft, setLocationDraft] = useState('');

  if (!task) {
    return (
      <section className="section">
        <h3 className="display-3">{title}</h3>
        <p className="logistics-slot-missing">
          This step isn't on the task list anymore, so it can't be confirmed here.
        </p>
      </section>
    );
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!atDraft) return;
    onConfirm({ at: new Date(atDraft).toISOString(), location: locationDraft.trim() || undefined });
    setEditing(false);
    setAtDraft('');
    setLocationDraft('');
  }

  const showForm = editing || !task.done;

  return (
    <section className="section">
      <div className="section-head">
        <h3 className="display-3">{title}</h3>
        {!showForm && (
          <div className="row-actions">
            <button type="button" className="btn-quiet" onClick={() => setEditing(true)}>
              Edit
            </button>
            <button type="button" className="btn-destructive" onClick={onMarkTbd}>
              Mark TBD
            </button>
          </div>
        )}
      </div>

      {!showForm && (
        <>
          <p className="logistics-slot-confirmed">
            {new Date(task.doneAt!).toLocaleString()}
            {task.location && ` · ${task.location}`}
          </p>
          {task.doneByName && (
            <span className="row-meta">Confirmed by {task.doneByName}</span>
          )}
        </>
      )}

      {showForm && (
        <form className="logistics-slot-form" onSubmit={handleSubmit}>
          <label htmlFor={`logistics-at-${task.id}`}>Confirmed date/time</label>
          <input
            id={`logistics-at-${task.id}`}
            type="datetime-local"
            value={atDraft}
            onChange={(e) => setAtDraft(e.target.value)}
            required
          />
          <label htmlFor={`logistics-location-${task.id}`}>{locationLabel}</label>
          <input
            id={`logistics-location-${task.id}`}
            value={locationDraft}
            onChange={(e) => setLocationDraft(e.target.value)}
            placeholder={locationPlaceholder}
          />
          <div className="modal-actions">
            {editing && (
              <button type="button" className="btn-quiet" onClick={() => setEditing(false)}>
                Cancel
              </button>
            )}
            <button type="submit" className="btn-primary">
              Confirm
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
