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
      <div className="panel logistics-slot">
        <h3>{title}</h3>
        <p className="logistics-slot-missing">
          This step isn't on the task list anymore, so it can't be confirmed here.
        </p>
      </div>
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
    <div className="panel logistics-slot">
      <h3>{title}</h3>

      {!showForm && (
        <>
          <p className="logistics-slot-confirmed">
            {new Date(task.doneAt!).toLocaleString()}
            {task.location && ` · ${task.location}`}
          </p>
          {task.doneByName && (
            <span className="directory-card-meta">Confirmed by {task.doneByName}</span>
          )}
          <div className="modal-actions">
            <button type="button" onClick={() => setEditing(true)}>
              Edit
            </button>
            <button type="button" className="btn-danger" onClick={onMarkTbd}>
              Mark TBD
            </button>
          </div>
        </>
      )}

      {showForm && (
        <form className="task-edit-form" onSubmit={handleSubmit}>
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
              <button type="button" onClick={() => setEditing(false)}>
                Cancel
              </button>
            )}
            <button type="submit">Confirm</button>
          </div>
        </form>
      )}
    </div>
  );
}
