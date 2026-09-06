import { useState, type FormEvent } from 'react';
import type { PlaceLookupResult } from '../../types/domain';

interface LookupPlacesPanelProps {
  title: string;
  placeholder: string;
  emptyMessage: string;
  search: (query: string) => Promise<{ results: PlaceLookupResult[]; notice?: string }>;
  onAdd: (result: PlaceLookupResult) => void;
}

export function LookupPlacesPanel({ title, placeholder, emptyMessage, search, onAdd }: LookupPlacesPanelProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<PlaceLookupResult[] | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setNotice(null);
    try {
      const data = await search(query.trim());
      setResults(data.results);
      setNotice(data.notice ?? null);
    } catch {
      setError('Lookup failed. Please try again.');
      setResults(null);
    } finally {
      setLoading(false);
    }
  }

  function handleClear() {
    setQuery('');
    setResults(null);
    setNotice(null);
    setError(null);
  }

  const hasContent = query || results || notice || error;

  return (
    <section className="section lookup-section">
      <div className="section-head">
        <h3 className="display-3">{title}</h3>
        {hasContent && (
          <button type="button" className="btn-quiet" onClick={handleClear} disabled={loading}>
            Clear
          </button>
        )}
      </div>

      <form className="lookup-form" onSubmit={handleSearch}>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={placeholder} />
        <button type="submit" className="btn-secondary" disabled={loading || !query.trim()}>
          {loading ? 'Searching…' : 'Search'}
        </button>
      </form>

      {error && <p className="form-error">{error}</p>}
      {notice && <p className="records-empty">{notice}</p>}
      {results && results.length === 0 && !notice && <p className="records-empty">{emptyMessage}</p>}

      {results && results.length > 0 && (
        <div className="records-list">
          {results.map((r) => (
            <div key={r.osmId} className="row">
              <div className="row-main">
                <span className="row-title">{r.name}</span>
                {r.isUnnamed && (
                  <span className="row-meta aside-note">
                    Identified only as cemetery land in OpenStreetMap — no name on file. Confirm by
                    location before calling.
                  </span>
                )}
                {(r.address || r.town) && (
                  <span className="row-meta">
                    {[r.address, r.town].filter(Boolean).join(', ')}
                  </span>
                )}
                {r.phone ? (
                  <span className="row-meta">{r.phone}</span>
                ) : (
                  <span className="row-meta aside-note">
                    No phone number on file — add one after you call
                  </span>
                )}
              </div>

              <div className="row-actions">
                <button type="button" className="btn-quiet" onClick={() => onAdd(r)}>
                  Add to directory
                </button>
              </div>

              {(r.islamicSectionHint || r.mapUrl) && (
                <div className="row-detail">
                  {r.islamicSectionHint && (
                    <div className="chip-row">
                      <span className="chip">Tagged as Islamic section</span>
                    </div>
                  )}
                  {r.mapUrl && (
                    <a className="lookup-map-link" href={r.mapUrl} target="_blank" rel="noreferrer">
                      View on map ↗
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="lookup-attribution">Location data © OpenStreetMap contributors</p>
    </section>
  );
}
