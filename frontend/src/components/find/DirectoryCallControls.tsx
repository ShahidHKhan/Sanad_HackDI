import { useState } from 'react';
import * as sessionStore from '../../lib/sessionStore';
import type { DirectoryCall, DirectoryEntryType, DirectoryOutcome } from '../../types/domain';

interface DirectoryCallControlsProps {
  code: string;
  entryType: DirectoryEntryType;
  entryId: string;
  entryLocation: string;
  call: DirectoryCall | null;
  isUsed: boolean;
  useLabel: string;
  onUse: () => void;
  syncNote: string;
  by: { pid: string; name: string };
}

export function DirectoryCallControls({
  code,
  entryType,
  entryId,
  entryLocation,
  call,
  isUsed,
  useLabel,
  onUse,
  syncNote,
  by,
}: DirectoryCallControlsProps) {
  const [loggingOutcome, setLoggingOutcome] = useState(false);
  const [outcome, setOutcome] = useState<DirectoryOutcome>('confirmed');
  const [note, setNote] = useState('');
  const [confirmedAt, setConfirmedAt] = useState('');
  const [error, setError] = useState<string | null>(null);

  const claimedByMe = call?.claimedByPid === by.pid;
  const claimedBySomeoneElse = !!call?.claimedByPid && !claimedByMe;

  async function handleClaim() {
    setError(null);
    const ok = await sessionStore.claimDirectoryEntry(code, entryType, entryId, by.pid, by.name);
    if (!ok) setError(`Already being called by ${call?.claimedByName}`);
  }

  function handleLogOutcome() {
    sessionStore.logDirectoryOutcome(
      code,
      entryType,
      entryId,
      {
        outcome,
        note: note.trim(),
        confirmedAt: outcome === 'confirmed' && confirmedAt ? new Date(confirmedAt).toISOString() : null,
        entryLocation,
      },
      by,
    );
    setLoggingOutcome(false);
    setNote('');
    setConfirmedAt('');
  }

  if (call?.outcome) {
    return (
      <div className={`directory-outcome directory-outcome-${call.outcome}`}>
        <span className="directory-outcome-status">
          {call.outcome === 'confirmed' ? 'Confirmed' : 'Not available'}
          {call.confirmedAt && ` · ${new Date(call.confirmedAt).toLocaleString()}`}
        </span>
        {call.outcomeNote && <span className="directory-outcome-note">{call.outcomeNote}</span>}
        <span className="directory-card-meta">Logged by {call.loggedByName}</span>
        {call.outcome === 'confirmed' && !isUsed && (
          <button type="button" onClick={onUse}>
            {useLabel}
          </button>
        )}
        {isUsed && <span className="directory-used-note">Currently in use for this session</span>}
      </div>
    );
  }

  if (loggingOutcome) {
    return (
      <div className="directory-log-form">
        <label htmlFor={`outcome-${entryId}`}>Outcome</label>
        <select
          id={`outcome-${entryId}`}
          value={outcome}
          onChange={(e) => setOutcome(e.target.value as DirectoryOutcome)}
        >
          <option value="confirmed">Confirmed</option>
          <option value="not_available">Not available</option>
        </select>
        {outcome === 'confirmed' && (
          <>
            <label htmlFor={`confirmed-at-${entryId}`}>Confirmed date/time</label>
            <input
              id={`confirmed-at-${entryId}`}
              type="datetime-local"
              value={confirmedAt}
              onChange={(e) => setConfirmedAt(e.target.value)}
            />
            {confirmedAt && <p className="directory-sync-note">{syncNote}</p>}
          </>
        )}
        <label htmlFor={`note-${entryId}`}>Note</label>
        <input
          id={`note-${entryId}`}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Optional"
        />
        <div className="modal-actions">
          <button type="button" onClick={() => setLoggingOutcome(false)}>
            Cancel
          </button>
          <button type="button" onClick={handleLogOutcome}>
            Save
          </button>
        </div>
      </div>
    );
  }

  if (call?.claimedByPid) {
    return (
      <div className="directory-call-status">
        <span className="task-claimed-by">Calling: {claimedByMe ? 'you' : call.claimedByName}</span>
        {claimedByMe && (
          <>
            <button
              type="button"
              onClick={() => sessionStore.releaseDirectoryEntry(code, entryType, entryId)}
            >
              Release
            </button>
            <button type="button" onClick={() => setLoggingOutcome(true)}>
              Log outcome
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <>
      <button type="button" onClick={handleClaim} disabled={claimedBySomeoneElse}>
        I'll call this one
      </button>
      {error && <p className="form-error">{error}</p>}
    </>
  );
}
