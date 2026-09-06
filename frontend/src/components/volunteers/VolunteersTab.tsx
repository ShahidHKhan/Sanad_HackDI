import { useRef, useState, type ChangeEvent } from 'react';
import { parseVCard } from '../../lib/vcard';
import type { Volunteer } from '../../types/domain';
import { AddVolunteerForm } from './AddVolunteerForm';

interface VolunteersTabProps {
  code: string;
  volunteers: Volunteer[];
  by: { pid: string; name: string };
}

export function VolunteersTab({ code, volunteers, by }: VolunteersTabProps) {
  // Non-null whenever the form is open — manual "Add a volunteer" opens it
  // blank, importing a contact opens it pre-filled with the parsed values.
  const [formSeed, setFormSeed] = useState<{ name: string; phone: string } | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file again later
    if (!file) return;

    setImportError(null);
    const text = await file.text();
    const { name, phone } = parseVCard(text);
    if (!name && !phone) {
      setImportError("Couldn't read a contact from that file.");
      return;
    }
    setFormSeed({ name: name ?? '', phone: phone ?? '' });
  }

  return (
    <div className="records-section">
      {formSeed ? (
        <AddVolunteerForm
          code={code}
          by={by}
          initialName={formSeed.name}
          initialPhone={formSeed.phone}
          onDone={() => setFormSeed(null)}
        />
      ) : (
        <div className="volunteer-add-actions">
          <button
            type="button"
            className="records-log-button"
            onClick={() => setFormSeed({ name: '', phone: '' })}
          >
            Add a volunteer
          </button>
          <button type="button" onClick={() => fileInputRef.current?.click()}>
            Import a contact
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".vcf,text/vcard,text/x-vcard"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </div>
      )}

      {importError && <p className="form-error">{importError}</p>}

      {!formSeed && (
        <p className="field-hint">
          On iPhone: open Contacts → pick someone → Share Contact → Save to Files, then import it
          here.
        </p>
      )}

      {volunteers.length === 0 ? (
        <p className="records-empty">No volunteers added yet.</p>
      ) : (
        <div className="records-list">
          {volunteers
            .slice()
            .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
            .map((v) => (
              <div key={v.id} className="document-row">
                <span className="document-row-title">{v.name}</span>
                {v.phone && <span className="document-row-note">{v.phone}</span>}
                {v.note && <span className="document-row-note">{v.note}</span>}
                <span className="document-row-meta">
                  Added by {v.addedByName} · {new Date(v.at).toLocaleDateString()}
                </span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
