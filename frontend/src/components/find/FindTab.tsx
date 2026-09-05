import { useState } from 'react';
import { useDirectory } from '../../hooks/useDirectory';
import type { SessionState } from '../../types/domain';
import { CemeteriesSection } from './CemeteriesSection';
import { MasjidsSection } from './MasjidsSection';

interface FindTabProps {
  code: string;
  state: SessionState;
  by: { pid: string; name: string };
}

type Segment = 'masjids' | 'cemeteries';

export function FindTab({ code, state, by }: FindTabProps) {
  const [segment, setSegment] = useState<Segment>('masjids');
  const { loading, data } = useDirectory();

  return (
    <div className="find-tab">
      <nav className="segment-switcher">
        <button
          type="button"
          className={segment === 'masjids' ? 'active' : ''}
          onClick={() => setSegment('masjids')}
        >
          Masjids
        </button>
        <button
          type="button"
          className={segment === 'cemeteries' ? 'active' : ''}
          onClick={() => setSegment('cemeteries')}
        >
          Cemeteries
        </button>
      </nav>

      {loading ? (
        <p className="records-empty">Loading directory…</p>
      ) : segment === 'masjids' ? (
        <MasjidsSection
          code={code}
          masjids={data.masjids}
          calls={state.directoryCalls}
          session={state.session}
          by={by}
        />
      ) : (
        <CemeteriesSection
          code={code}
          cemeteries={data.cemeteries}
          calls={state.directoryCalls}
          session={state.session}
          by={by}
        />
      )}
    </div>
  );
}
