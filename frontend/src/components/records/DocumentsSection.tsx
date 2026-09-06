import { useState } from 'react';
import * as sessionStore from '../../lib/sessionStore';
import type { DocumentEntry } from '../../types/domain';
import { AddDocumentForm } from './AddDocumentForm';
import { DocumentFileLink } from './DocumentFileLink';

interface DocumentsSectionProps {
  code: string;
  documents: DocumentEntry[];
  by: { pid: string; name: string };
}

export function DocumentsSection({ code, documents, by }: DocumentsSectionProps) {
  const [adding, setAdding] = useState(false);

  function handleRemove(d: DocumentEntry) {
    if (window.confirm(`Remove "${d.title}"? This can't be undone.`)) {
      sessionStore.removeDocument(code, d.id, d.filePath);
    }
  }

  return (
    <div className="records-section">
      {adding ? (
        <AddDocumentForm code={code} by={by} onDone={() => setAdding(false)} />
      ) : (
        <button type="button" className="records-log-button" onClick={() => setAdding(true)}>
          Add a document
        </button>
      )}

      {documents.length === 0 ? (
        <p className="records-empty">No documents logged yet.</p>
      ) : (
        <div className="records-list">
          {documents
            .slice()
            .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
            .map((d) => (
              <div key={d.id} className="document-row">
                <div className="document-row-header">
                  <span className="document-row-title">{d.title}</span>
                  <button
                    type="button"
                    className="directory-remove-button"
                    aria-label={`Remove ${d.title}`}
                    onClick={() => handleRemove(d)}
                  >
                    ✕
                  </button>
                </div>
                {d.note && <span className="document-row-note">{d.note}</span>}
                {d.filePath && d.fileName && (
                  <DocumentFileLink path={d.filePath} name={d.fileName} size={d.fileSize} />
                )}
                <span className="document-row-meta">
                  Added by {d.addedByName} · {new Date(d.at).toLocaleDateString()}
                </span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
