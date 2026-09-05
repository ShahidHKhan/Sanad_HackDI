import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { AnnounceTab } from '../components/announce/AnnounceTab';
import { CodeBadge } from '../components/CodeBadge';
import { ErrorState } from '../components/ErrorState';
import { GuidanceDrawer } from '../components/GuidanceDrawer';
import { JoinByCodeForm } from '../components/JoinByCodeForm';
import { OverviewTab } from '../components/overview/OverviewTab';
import { RecordsTab } from '../components/records/RecordsTab';
import { SessionDetailsModal } from '../components/SessionDetailsModal';
import { TasksTab } from '../components/tasks/TasksTab';
import { useSessionState } from '../hooks/useSessionState';
import * as membership from '../lib/membership';

type TabId = 'overview' | 'tasks' | 'records' | 'announce';

export function SessionPage() {
  const { code = '' } = useParams<{ code: string }>();
  const normalizedCode = code.toUpperCase();
  const { status, state } = useSessionState(normalizedCode);
  const [tab, setTab] = useState<TabId>('overview');
  const [joinedTick, setJoinedTick] = useState(0);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [guidanceOpen, setGuidanceOpen] = useState(false);

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

  return (
    <div className="session-page">
      <header className="session-header">
        <CodeBadge code={normalizedCode} />
        <div className="session-header-actions">
          <button
            type="button"
            className="icon-button"
            aria-label="Open guidance"
            onClick={() => setGuidanceOpen(true)}
          >
            📖
          </button>
          <button
            type="button"
            className="icon-button"
            aria-label="Edit session details"
            onClick={() => setDetailsOpen(true)}
          >
            ✏️
          </button>
        </div>
      </header>

      <nav className="tab-switcher">
        <button
          type="button"
          className={tab === 'overview' ? 'active' : ''}
          onClick={() => setTab('overview')}
        >
          Overview
        </button>
        <button
          type="button"
          className={tab === 'tasks' ? 'active' : ''}
          onClick={() => setTab('tasks')}
        >
          Tasks
        </button>
        <button
          type="button"
          className={tab === 'records' ? 'active' : ''}
          onClick={() => setTab('records')}
        >
          Records
        </button>
        <button
          type="button"
          className={tab === 'announce' ? 'active' : ''}
          onClick={() => setTab('announce')}
        >
          Announce
        </button>
      </nav>

      <main>
        {tab === 'overview' && <OverviewTab state={state} />}
        {tab === 'tasks' && (
          <TasksTab code={normalizedCode} state={state} by={by} />
        )}
        {tab === 'records' && (
          <RecordsTab code={normalizedCode} state={state} by={by} />
        )}
        {tab === 'announce' && <AnnounceTab state={state} />}
      </main>

      {detailsOpen && (
        <SessionDetailsModal
          code={normalizedCode}
          session={state.session}
          onClose={() => setDetailsOpen(false)}
        />
      )}

      {guidanceOpen && <GuidanceDrawer onClose={() => setGuidanceOpen(false)} />}
    </div>
  );
}
