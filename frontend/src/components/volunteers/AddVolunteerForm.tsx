import { useState, type FormEvent } from 'react';
import * as sessionStore from '../../lib/sessionStore';

interface AddVolunteerFormProps {
  code: string;
  by: { pid: string; name: string };
  onDone: () => void;
}

export function AddVolunteerForm({ code, by, onDone }: AddVolunteerFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    sessionStore.addVolunteer(code, { name: name.trim(), phone: phone.trim(), note: note.trim() }, by);
    onDone();
  }

  return (
    <form className="panel add-form" onSubmit={handleSubmit}>
      <h3>Add a volunteer</h3>
      <label htmlFor="volunteer-name">Name</label>
      <input
        id="volunteer-name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Brother Yusuf"
      />
      <label htmlFor="volunteer-phone">Phone</label>
      <input id="volunteer-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
      <label htmlFor="volunteer-note">How they can help</label>
      <input
        id="volunteer-note"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="e.g. Ghusl for men, has a van for transport"
      />
      <div className="modal-actions">
        <button type="button" onClick={onDone}>
          Cancel
        </button>
        <button type="submit">Save</button>
      </div>
    </form>
  );
}
