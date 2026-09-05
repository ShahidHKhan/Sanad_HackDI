import { useMemo, useState } from 'react';
import type { DirectoryCall, Masjid, SessionMeta } from '../../types/domain';
import { AddMasjidForm } from './AddMasjidForm';
import { MasjidCard } from './MasjidCard';

interface MasjidsSectionProps {
  code: string;
  masjids: Masjid[];
  calls: DirectoryCall[];
  session: SessionMeta;
  by: { pid: string; name: string };
}

export function MasjidsSection({ code, masjids, calls, session, by }: MasjidsSectionProps) {
  const [query, setQuery] = useState('');
  const [ghuslMenOnly, setGhuslMenOnly] = useState(false);
  const [ghuslWomenOnly, setGhuslWomenOnly] = useState(false);
  const [shortNoticeOnly, setShortNoticeOnly] = useState(false);
  const [adding, setAdding] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return masjids.filter((m) => {
      if (q && !`${m.name} ${m.town}`.toLowerCase().includes(q)) return false;
      if (ghuslMenOnly && !m.ghuslMen) return false;
      if (ghuslWomenOnly && !m.ghuslWomen) return false;
      if (shortNoticeOnly && !m.shortNotice) return false;
      return true;
    });
  }, [masjids, query, ghuslMenOnly, ghuslWomenOnly, shortNoticeOnly]);

  return (
    <div className="records-section">
      <input
        className="directory-search"
        placeholder="Search masjids by name or town…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="directory-filters">
        <label className="filter-chip">
          <input
            type="checkbox"
            checked={ghuslMenOnly}
            onChange={(e) => setGhuslMenOnly(e.target.checked)}
          />
          Ghusl (men)
        </label>
        <label className="filter-chip">
          <input
            type="checkbox"
            checked={ghuslWomenOnly}
            onChange={(e) => setGhuslWomenOnly(e.target.checked)}
          />
          Ghusl (women)
        </label>
        <label className="filter-chip">
          <input
            type="checkbox"
            checked={shortNoticeOnly}
            onChange={(e) => setShortNoticeOnly(e.target.checked)}
          />
          Short notice
        </label>
      </div>

      {adding ? (
        <AddMasjidForm code={code} by={by} onDone={() => setAdding(false)} />
      ) : (
        <button type="button" className="records-log-button" onClick={() => setAdding(true)}>
          Add a masjid
        </button>
      )}

      {filtered.length === 0 ? (
        <p className="records-empty">
          {masjids.length === 0 ? 'No masjids added yet.' : 'No masjids match your filters.'}
        </p>
      ) : (
        <div className="records-list">
          {filtered.map((m) => (
            <MasjidCard
              key={m.id}
              code={code}
              masjid={m}
              call={calls.find((c) => c.entryType === 'masjid' && c.entryId === m.id) ?? null}
              isUsed={!!session.masjidName && session.masjidName === m.name}
              by={by}
            />
          ))}
        </div>
      )}
    </div>
  );
}
