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
    <div className="panel lookup-panel">
      <h3>{title}</h3>
      <form className="lookup-form" onSubmit={handleSearch}>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={placeholder} />
        <button type="submit" disabled={loading || !query.trim()}>
          {loading ? 'Searching…' : 'Search'}
        </button>
        {hasContent && (
          <button type="button" onClick={handleClear} disabled={loading}>
            Clear
          </button>
        )}
      </form>

      {error && <p className="form-error">{error}</p>}
      {notice && <p className="records-empty">{notice}</p>}
      {results && results.length === 0 && !notice && <p className="records-empty">{emptyMessage}</p>}

      {results && results.length > 0 && (
        <div className="records-list">
          {results.map((r) => (
            <div key={r.osmId} className="directory-card lookup-result-card">
              <span className="directory-card-name">{r.name}</span>
              {r.isUnnamed && (
                <span className="directory-card-meta lookup-unnamed-note">
                  Identified only as cemetery land in OpenStreetMap — no name on file. Confirm by
                  location before calling.
                </span>
              )}
              {(r.address || r.town) && (
                <span className="directory-card-meta">
                  {[r.address, r.town].filter(Boolean).join(', ')}
                </span>
              )}
              {r.phone ? (
                <span className="directory-card-meta">{r.phone}</span>
              ) : (
                <span className="directory-card-meta lookup-no-phone">
                  No phone number on file — add one after you call
                </span>
              )}
              {r.islamicSectionHint && <span className="tag-chip">Tagged as Islamic section</span>}
              {r.mapUrl && (
                <a className="lookup-map-link" href={r.mapUrl} target="_blank" rel="noreferrer">
                  View on map ↗
                </a>
              )}
              <button type="button" onClick={() => onAdd(r)}>
                Add to directory
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="lookup-attribution">Location data © OpenStreetMap contributors</p>
    </div>
  );
}
