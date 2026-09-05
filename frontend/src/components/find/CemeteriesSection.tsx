import { useMemo, useState } from 'react';
import * as sessionStore from '../../lib/sessionStore';
import type { Cemetery, DirectoryCall, PlaceLookupResult, SessionMeta } from '../../types/domain';
import { AddCemeteryForm } from './AddCemeteryForm';
import { CemeteryCard } from './CemeteryCard';
import { LookupPlacesPanel } from './LookupPlacesPanel';

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
  const [addPrefill, setAddPrefill] = useState<{
    name?: string;
    town?: string;
    phone?: string;
    islamicSection?: boolean;
    notes?: string;
  } | null>(null);

  function handleAddFromLookup(result: PlaceLookupResult) {
    setAddPrefill({
      name: result.isUnnamed ? '' : result.name,
      town: result.town,
      phone: result.phone,
      islamicSection: result.islamicSectionHint,
      notes: result.isUnnamed
        ? 'Found via OpenStreetMap location lookup — the map data has no name on file, confirm the actual name before saving.'
        : undefined,
    });
  }

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
      <LookupPlacesPanel
        title="Look up cemeteries near a city"
        placeholder="e.g. Paterson, NJ"
        emptyMessage="No cemeteries found in OpenStreetMap for that area."
        search={sessionStore.searchNearbyCemeteries}
        onAdd={handleAddFromLookup}
      />

      <h3 className="directory-section-heading">Community directory</h3>

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

      {addPrefill ? (
        <AddCemeteryForm
          code={code}
          by={by}
          initial={addPrefill}
          onDone={() => setAddPrefill(null)}
        />
      ) : (
        <button type="button" className="records-log-button" onClick={() => setAddPrefill({})}>
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
