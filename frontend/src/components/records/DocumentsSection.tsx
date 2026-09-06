import { X } from 'lucide-react';
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
      <section className="section">
        <div className="section-head">
          <h3 className="display-3">Documents</h3>
          {!adding && (
            <button type="button" className="btn-quiet" onClick={() => setAdding(true)}>
              + Add a document
            </button>
          )}
        </div>

        {adding && <AddDocumentForm code={code} by={by} onDone={() => setAdding(false)} />}

        {documents.length === 0 ? (
          <p className="records-empty">No documents logged yet.</p>
        ) : (
          <div className="records-list">
            {documents
              .slice()
              .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
              .map((d) => (
                <div key={d.id} className="row">
                  <div className="row-main">
                    <span className="row-title">{d.title}</span>
                    {d.note && <span className="row-meta">{d.note}</span>}
                    <span className="row-meta">
                      Added by {d.addedByName} · {new Date(d.at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="row-actions">
                    <button
                      type="button"
                      className="directory-remove-button"
                      aria-label={`Remove ${d.title}`}
                      title="Remove"
                      onClick={() => handleRemove(d)}
                    >
                      <X size={15} aria-hidden="true" />
                    </button>
                  </div>

                  {d.filePath && d.fileName && (
                    <div className="row-detail">
                      <DocumentFileLink path={d.filePath} name={d.fileName} size={d.fileSize} />
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}
      </section>
    </div>
  );
}
