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
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setError(null);
    setUploading(true);
    try {
      const uploaded = file ? await sessionStore.uploadDocumentFile(code, file) : undefined;
      await sessionStore.addDocument(code, { title: title.trim(), note: note.trim(), file: uploaded }, by);
      onDone();
    } catch {
      setError('Could not save this document. Please try again.');
      setUploading(false);
    }
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
        disabled={uploading}
      />
      <label htmlFor="doc-note">Note</label>
      <input
        id="doc-note"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="e.g. Layla has originals"
        disabled={uploading}
      />
      <label htmlFor="doc-file">Attach a file (optional)</label>
      <input
        id="doc-file"
        type="file"
        accept="application/pdf,image/*"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        disabled={uploading}
      />
      {error && <p className="form-error">{error}</p>}
      <div className="modal-actions">
        <button type="button" onClick={onDone} disabled={uploading}>
          Cancel
        </button>
        <button type="submit" disabled={uploading || !title.trim()}>
          {uploading ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  );
}
