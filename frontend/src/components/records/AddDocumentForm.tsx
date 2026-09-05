import { useState, type FormEvent } from 'react';
import * as sessionStore from '../../lib/sessionStore';

interface AddDocumentFormProps {
  code: string;
  by: { pid: string; name: string };
  onDone: () => void;
}

export function AddDocumentForm({ code, by, onDone }: AddDocumentFormProps) {
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    sessionStore.addDocument(code, { title: title.trim(), note: note.trim() }, by);
    onDone();
  }

  return (
    <form className="panel add-form" onSubmit={handleSubmit}>
      <h3>Add a document</h3>
      <label htmlFor="doc-title">Title</label>
      <input
        id="doc-title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="e.g. Death certificate (10 copies)"
      />
      <label htmlFor="doc-note">Note</label>
      <input
        id="doc-note"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="e.g. Layla has originals"
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
