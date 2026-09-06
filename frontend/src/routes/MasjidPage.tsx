import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CodeBadge } from '../components/CodeBadge';
import { ComingSoonPlaceholder } from '../components/ComingSoonPlaceholder';
import { ErrorState } from '../components/ErrorState';
import { FindTab } from '../components/find/FindTab';
import { HalfToggle } from '../components/HalfToggle';
import { JoinByCodeForm } from '../components/JoinByCodeForm';
import { VolunteersTab } from '../components/volunteers/VolunteersTab';
import { useSessionState } from '../hooks/useSessionState';
import * as membership from '../lib/membership';

type TabId = 'find' | 'logistics' | 'volunteers';

const NAV_ITEMS: { id: TabId; label: string; icon: string }[] = [
  { id: 'find', label: 'Find', icon: '🕌' },
  { id: 'logistics', label: 'Logistics', icon: '🗒️' },
  { id: 'volunteers', label: 'Volunteers', icon: '🤝' },
];

export function MasjidPage() {
  const { code = '' } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const normalizedCode = code.toUpperCase();
  const { status, state } = useSessionState(normalizedCode);
  const [joinedTick, setJoinedTick] = useState(0);
  const [tab, setTab] = useState<TabId>('find');

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

  const by = { pid: member.pid, name: member.name };
  const myRole = state.participants.find((p) => p.pid === member.pid)?.role;

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

      <HalfToggle code={normalizedCode} active="masjid" hideFamily={myRole === 'masjid'} />

      <main>
        {tab === 'find' && <FindTab code={normalizedCode} state={state} by={by} />}
        {tab === 'logistics' && (
          <ComingSoonPlaceholder message="A future home for ghusl facility availability, burial slot confirmation, and related logistics." />
        )}
        {tab === 'volunteers' && (
          <VolunteersTab code={normalizedCode} volunteers={state.volunteers} by={by} />
        )}
      </main>

      <nav className="bottom-nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`bottom-nav-item ${tab === item.id ? 'active' : ''}`}
            onClick={() => setTab(item.id)}
          >
            <span className="bottom-nav-icon">{item.icon}</span>
            <span className="bottom-nav-label">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
