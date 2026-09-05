import { useState } from 'react';
import type { DocumentEntry } from '../../types/domain';
import { AddDocumentForm } from './AddDocumentForm';

interface DocumentsSectionProps {
  code: string;
  documents: DocumentEntry[];
  by: { pid: string; name: string };
}

export function DocumentsSection({ code, documents, by }: DocumentsSectionProps) {
  const [adding, setAdding] = useState(false);

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
                <span className="document-row-title">{d.title}</span>
                {d.note && <span className="document-row-note">{d.note}</span>}
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
