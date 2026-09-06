import { useState, type FormEvent } from 'react';
import * as sessionStore from '../../lib/sessionStore';

interface AddMasjidFormProps {
  code: string;
  by: { pid: string; name: string };
  onDone: () => void;
  initial?: { name?: string; town?: string; phone?: string };
}

export function AddMasjidForm({ by, onDone, initial }: AddMasjidFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [town, setTown] = useState(initial?.town ?? '');
  const [phone, setPhone] = useState(initial?.phone ?? '');
  const [ghuslMen, setGhuslMen] = useState(false);
  const [ghuslWomen, setGhuslWomen] = useState(false);
  const [shortNotice, setShortNotice] = useState(false);
  const [notes, setNotes] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    sessionStore.addMasjid(
      {
        name: name.trim(),
        town: town.trim(),
        phone: phone.trim(),
        ghuslMen,
        ghuslWomen,
        shortNotice,
        notes: notes.trim(),
      },
      { name: by.name },
    );
    onDone();
  }

  return (
    <form className="panel add-form" onSubmit={handleSubmit}>
      <h3>Add a masjid</h3>
      <label htmlFor="masjid-name">Name</label>
      <input id="masjid-name" value={name} onChange={(e) => setName(e.target.value)} />
      <label htmlFor="masjid-town">Town</label>
      <input id="masjid-town" value={town} onChange={(e) => setTown(e.target.value)} />
      <label htmlFor="masjid-phone">Phone</label>
      <input id="masjid-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
      <label className="filter-chip">
        <input type="checkbox" checked={ghuslMen} onChange={(e) => setGhuslMen(e.target.checked)} />
        Ghusl facility (men)
      </label>
      <label className="filter-chip">
        <input type="checkbox" checked={ghuslWomen} onChange={(e) => setGhuslWomen(e.target.checked)} />
        Ghusl facility (women)
      </label>
      <label className="filter-chip">
        <input type="checkbox" checked={shortNotice} onChange={(e) => setShortNotice(e.target.checked)} />
        Can accommodate short notice
      </label>
      <label htmlFor="masjid-notes">Notes</label>
      <input id="masjid-notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional" />
      <div className="modal-actions">
        <button type="button" className="btn-quiet" onClick={onDone}>
          Cancel
        </button>
        <button type="submit" className="btn-primary">Save</button>
      </div>
    </form>
  );
}
