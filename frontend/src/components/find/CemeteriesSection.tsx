import { useMemo, useState } from 'react';
import type { Cemetery, DirectoryCall, SessionMeta } from '../../types/domain';
import { AddCemeteryForm } from './AddCemeteryForm';
import { CemeteryCard } from './CemeteryCard';

interface CemeteriesSectionProps {
  code: string;
  cemeteries: Cemetery[];
  calls: DirectoryCall[];
  session: SessionMeta;
  by: { pid: string; name: string };
}

export function CemeteriesSection({ code, cemeteries, calls, session, by }: CemeteriesSectionProps) {
  const [query, setQuery] = useState('');
  const [islamicSectionOnly, setIslamicSectionOnly] = useState(false);
  const [noCasketOnly, setNoCasketOnly] = useState(false);
  const [adding, setAdding] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return cemeteries.filter((c) => {
      if (q && !`${c.name} ${c.town}`.toLowerCase().includes(q)) return false;
      if (islamicSectionOnly && !c.islamicSection) return false;
      if (noCasketOnly && !c.noCasketAllowed) return false;
      return true;
    });
  }, [cemeteries, query, islamicSectionOnly, noCasketOnly]);

  return (
    <div className="records-section">
      <input
        className="directory-search"
        placeholder="Search cemeteries by name or town…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="directory-filters">
        <label className="filter-chip">
          <input
            type="checkbox"
            checked={islamicSectionOnly}
            onChange={(e) => setIslamicSectionOnly(e.target.checked)}
          />
          Islamic section
        </label>
        <label className="filter-chip">
          <input
            type="checkbox"
            checked={noCasketOnly}
            onChange={(e) => setNoCasketOnly(e.target.checked)}
          />
          No casket required
        </label>
      </div>

      {adding ? (
        <AddCemeteryForm code={code} by={by} onDone={() => setAdding(false)} />
      ) : (
        <button type="button" className="records-log-button" onClick={() => setAdding(true)}>
          Add a cemetery
        </button>
      )}

      {filtered.length === 0 ? (
        <p className="records-empty">
          {cemeteries.length === 0 ? 'No cemeteries added yet.' : 'No cemeteries match your filters.'}
        </p>
      ) : (
        <div className="records-list">
          {filtered.map((c) => (
            <CemeteryCard
              key={c.id}
              code={code}
              cemetery={c}
              call={calls.find((call) => call.entryType === 'cemetery' && call.entryId === c.id) ?? null}
              isUsed={!!session.cemeteryName && session.cemeteryName === c.name}
              by={by}
            />
          ))}
        </div>
      )}
    </div>
  );
}
