import { useState } from 'react';
import type { SessionState } from '../../types/domain';
import { CostsSection } from './CostsSection';
import { DocumentsSection } from './DocumentsSection';

interface RecordsTabProps {
  code: string;
  state: SessionState;
  by: { pid: string; name: string };
}

type Segment = 'costs' | 'documents';

export function RecordsTab({ code, state, by }: RecordsTabProps) {
  const [segment, setSegment] = useState<Segment>('costs');

  return (
    <div className="records-tab">
      <nav className="segment-switcher">
        <button
          type="button"
          className={segment === 'costs' ? 'active' : ''}
          onClick={() => setSegment('costs')}
        >
          Costs
        </button>
        <button
          type="button"
          className={segment === 'documents' ? 'active' : ''}
          onClick={() => setSegment('documents')}
        >
          Documents
        </button>
      </nav>

      {segment === 'costs' ? (
        <CostsSection code={code} costs={state.costs} participants={state.participants} by={by} />
      ) : (
        <DocumentsSection code={code} documents={state.documents} by={by} />
      )}
    </div>
  );
}
