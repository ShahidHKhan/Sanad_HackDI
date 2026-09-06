import { useState } from 'react';
import type { Volunteer } from '../../types/domain';
import { AddVolunteerForm } from './AddVolunteerForm';

interface VolunteersTabProps {
  code: string;
  volunteers: Volunteer[];
  by: { pid: string; name: string };
}

export function VolunteersTab({ code, volunteers, by }: VolunteersTabProps) {
  const [adding, setAdding] = useState(false);

  return (
    <div className="records-section">
      {adding ? (
        <AddVolunteerForm code={code} by={by} onDone={() => setAdding(false)} />
      ) : (
        <button type="button" className="records-log-button" onClick={() => setAdding(true)}>
          Add a volunteer
        </button>
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
