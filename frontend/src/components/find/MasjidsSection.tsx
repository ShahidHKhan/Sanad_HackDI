import { useMemo, useState } from 'react';
import * as sessionStore from '../../lib/sessionStore';
import type { DirectoryCall, Masjid, PlaceLookupResult, SessionMeta } from '../../types/domain';
import { AddMasjidForm } from './AddMasjidForm';
import { LookupPlacesPanel } from './LookupPlacesPanel';
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
  const [addPrefill, setAddPrefill] = useState<{ name?: string; town?: string; phone?: string } | null>(
    null,
  );

  function handleAddFromLookup(result: PlaceLookupResult) {
    setAddPrefill({ name: result.name, town: result.town, phone: result.phone });
  }

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
      <LookupPlacesPanel
        title="Look up masjids near a city"
        placeholder="e.g. Paterson, NJ"
        emptyMessage="No mosques found in OpenStreetMap for that area."
        search={sessionStore.searchNearbyMasjids}
        onAdd={handleAddFromLookup}
      />

      <section className="section">
        <div className="section-head">
          <h3 className="display-3">Community directory</h3>
          {!addPrefill && (
            <button type="button" className="btn-quiet" onClick={() => setAddPrefill({})}>
              + Add a masjid
            </button>
          )}
        </div>

        <input
          className="directory-search"
          placeholder="Search masjids by name or town…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="directory-filters">
          <label className={`toggle-chip ${ghuslMenOnly ? 'active' : ''}`}>
            <input
              type="checkbox"
              checked={ghuslMenOnly}
              onChange={(e) => setGhuslMenOnly(e.target.checked)}
            />
            Ghusl (men)
          </label>
          <label className={`toggle-chip ${ghuslWomenOnly ? 'active' : ''}`}>
            <input
              type="checkbox"
              checked={ghuslWomenOnly}
              onChange={(e) => setGhuslWomenOnly(e.target.checked)}
            />
            Ghusl (women)
          </label>
          <label className={`toggle-chip ${shortNoticeOnly ? 'active' : ''}`}>
            <input
              type="checkbox"
              checked={shortNoticeOnly}
              onChange={(e) => setShortNoticeOnly(e.target.checked)}
            />
            Short notice
          </label>
        </div>

        {addPrefill && (
          <AddMasjidForm
            code={code}
            by={by}
            initial={addPrefill}
            onDone={() => setAddPrefill(null)}
          />
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
      </section>
    </div>
  );
}
