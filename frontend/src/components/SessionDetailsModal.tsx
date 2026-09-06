import { useState, type FormEvent } from 'react';
import * as sessionStore from '../lib/sessionStore';
import type { SessionMeta } from '../types/domain';

interface SessionDetailsModalProps {
  code: string;
  session: SessionMeta;
  onClose: () => void;
}

// Reasonable default set — the original artifact's exact option list isn't
// available to us. Informational only (MVP.md §10), safe to edit freely.
const DEATH_LOCATION_OPTIONS = [
  'Home, attended (expected)',
  'Home, unattended (unexpected)',
  'Hospital',
  'Hospice',
  'Nursing/care facility',
  'Other',
];

function toDatetimeLocalValue(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function SessionDetailsModal({ code, session, onClose }: SessionDetailsModalProps) {
  const [deceasedName, setDeceasedName] = useState(session.deceasedName ?? '');
  const [diedAt, setDiedAt] = useState(toDatetimeLocalValue(session.diedAt));
  const [deathLocation, setDeathLocation] = useState(
    session.deathLocation ?? DEATH_LOCATION_OPTIONS[0],
  );
  const [masjidName, setMasjidName] = useState(session.masjidName ?? '');
  const [cemeteryName, setCemeteryName] = useState(session.cemeteryName ?? '');
  const [coordinatorName, setCoordinatorName] = useState(session.coordinatorName ?? '');
  const [coordinatorPhone, setCoordinatorPhone] = useState(session.coordinatorPhone ?? '');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    sessionStore.updateSessionDetails(code, {
      deceasedName,
      diedAt: diedAt ? new Date(diedAt).toISOString() : undefined,
      deathLocation,
      masjidName,
      cemeteryName,
      coordinatorName,
      coordinatorPhone,
    });
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <form className="modal panel" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <h2>Details</h2>
        <label htmlFor="deceased-name">Deceased's name</label>
        <input
          id="deceased-name"
          value={deceasedName}
          onChange={(e) => setDeceasedName(e.target.value)}
        />
        <label htmlFor="died-at">Time of death</label>
        <input
          id="died-at"
          type="datetime-local"
          value={diedAt}
          onChange={(e) => setDiedAt(e.target.value)}
        />
        <label htmlFor="death-location">Where it happened</label>
        <select
          id="death-location"
          value={deathLocation}
          onChange={(e) => setDeathLocation(e.target.value)}
        >
          {DEATH_LOCATION_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <label htmlFor="masjid-name">Masjid</label>
        <input
          id="masjid-name"
          value={masjidName}
          onChange={(e) => setMasjidName(e.target.value)}
        />
        <label htmlFor="cemetery-name">Cemetery</label>
        <input
          id="cemetery-name"
          value={cemeteryName}
          onChange={(e) => setCemeteryName(e.target.value)}
        />
        <label htmlFor="coordinator-name">Family coordinator</label>
        <input
          id="coordinator-name"
          value={coordinatorName}
          onChange={(e) => setCoordinatorName(e.target.value)}
        />
        <label htmlFor="coordinator-phone">Coordinator phone</label>
        <input
          id="coordinator-phone"
          value={coordinatorPhone}
          onChange={(e) => setCoordinatorPhone(e.target.value)}
        />
        <div className="modal-actions">
          <button type="button" className="btn-quiet" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-primary">Save</button>
        </div>
      </form>
    </div>
  );
}
