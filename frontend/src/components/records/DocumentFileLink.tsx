import { Paperclip } from 'lucide-react';
import { useState } from 'react';
import * as sessionStore from '../../lib/sessionStore';

interface DocumentFileLinkProps {
  path: string;
  name: string;
  size: number | null;
}

function formatSize(bytes: number | null): string {
  if (bytes == null) return '';
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentFileLink({ path, name, size }: DocumentFileLinkProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function handleView() {
    setLoading(true);
    setError(false);
    try {
      const url = await sessionStore.getDocumentFileUrl(path);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="document-file-link">
      <button type="button" onClick={handleView} disabled={loading}>
        <Paperclip size={14} aria-hidden="true" /> {loading ? 'Opening…' : name}
      </button>
      {size != null && <span className="document-row-meta">{formatSize(size)}</span>}
      {error && <span className="form-error">Couldn't open the file.</span>}
    </div>
  );
}
