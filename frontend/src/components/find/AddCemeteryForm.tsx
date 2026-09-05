import { useState, type FormEvent } from 'react';
import * as sessionStore from '../../lib/sessionStore';

interface AddCemeteryFormProps {
  code: string;
  by: { pid: string; name: string };
  onDone: () => void;
}

export function AddCemeteryForm({ by, onDone }: AddCemeteryFormProps) {
  const [name, setName] = useState('');
  const [town, setTown] = useState('');
  const [phone, setPhone] = useState('');
  const [islamicSection, setIslamicSection] = useState(false);
  const [noCasketAllowed, setNoCasketAllowed] = useState(false);
  const [intermentHours, setIntermentHours] = useState('');
  const [notes, setNotes] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    sessionStore.addCemetery(
      {
        name: name.trim(),
        town: town.trim(),
        phone: phone.trim(),
        islamicSection,
        noCasketAllowed,
        intermentHours: intermentHours.trim(),
        notes: notes.trim(),
      },
      { name: by.name },
    );
    onDone();
  }

  return (
    <form className="panel add-form" onSubmit={handleSubmit}>
      <h3>Add a cemetery</h3>
      <label htmlFor="cemetery-name">Name</label>
      <input id="cemetery-name" value={name} onChange={(e) => setName(e.target.value)} />
      <label htmlFor="cemetery-town">Town</label>
      <input id="cemetery-town" value={town} onChange={(e) => setTown(e.target.value)} />
      <label htmlFor="cemetery-phone">Phone</label>
      <input id="cemetery-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
      <label className="filter-chip">
        <input
          type="checkbox"
          checked={islamicSection}
          onChange={(e) => setIslamicSection(e.target.checked)}
        />
        Has an Islamic/Muslim section
      </label>
      <label className="filter-chip">
        <input
          type="checkbox"
          checked={noCasketAllowed}
          onChange={(e) => setNoCasketAllowed(e.target.checked)}
        />
        Burial without a casket allowed
      </label>
      <label htmlFor="cemetery-hours">Interment days/hours</label>
      <input
        id="cemetery-hours"
        value={intermentHours}
        onChange={(e) => setIntermentHours(e.target.value)}
        placeholder="e.g. Mon–Sat 9am–3pm"
      />
      <label htmlFor="cemetery-notes">Notes</label>
      <input id="cemetery-notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional" />
      <div className="modal-actions">
        <button type="button" onClick={onDone}>
          Cancel
        </button>
        <button type="submit">Save</button>
      </div>
    </form>
  );
}
