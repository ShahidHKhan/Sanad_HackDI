import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CodeBadge } from '../components/CodeBadge';
import { ErrorState } from '../components/ErrorState';
import { HalfToggle } from '../components/HalfToggle';
import { JoinByCodeForm } from '../components/JoinByCodeForm';
import { useSessionState } from '../hooks/useSessionState';
import * as membership from '../lib/membership';

export function MasjidPage() {
  const { code = '' } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const normalizedCode = code.toUpperCase();
  const { status, state } = useSessionState(normalizedCode);
  const [joinedTick, setJoinedTick] = useState(0);

  if (status === 'loading') {
    return <div className="loading-state">Loading…</div>;
  }

  if (status === 'not_found') {
    return (
      <ErrorState
        title="Session not found"
        message={`No session found for code "${normalizedCode}". It may be mistyped or no longer exists.`}
      />
    );
  }

  const member = membership.get(normalizedCode);
  if (!member) {
    return (
      <div className="landing">
        <JoinByCodeForm
          fixedCode={normalizedCode}
          onJoined={() => setJoinedTick((n) => n + 1)}
        />
      </div>
    );
  }
  void joinedTick; // forces a re-render after join, membership.get is re-read above

  if (!state) {
    return <div className="loading-state">Loading…</div>;
  }

  return (
    <div className="session-page">
      <header className="session-header">
        <button
          type="button"
          className="icon-button"
          aria-label="Back"
          onClick={() => navigate('/')}
        >
          ←
        </button>

        <div className="session-title-block">
          <h1 className="session-title">Masjid Portal</h1>
          <span className="session-subtitle">
            {state.session.deceasedName || 'Deceased’s name not yet set'}
          </span>
        </div>

        <div className="session-header-actions">
          <CodeBadge code={normalizedCode} />
        </div>
      </header>

      <HalfToggle code={normalizedCode} active="masjid" />

      <main>
        <div className="masjid-placeholder">
          <p>
            This section is for masjid board members to coordinate
            community-facing parts of the janazah — ghusl facility
            availability, burial slot confirmation, and related logistics.
          </p>
          <p className="masjid-placeholder-note">Coming soon.</p>
        </div>
      </main>
    </div>
  );
}
