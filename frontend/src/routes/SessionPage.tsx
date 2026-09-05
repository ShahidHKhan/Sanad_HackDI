import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { CodeBadge } from '../components/CodeBadge';
import { ErrorState } from '../components/ErrorState';
import { JoinByCodeForm } from '../components/JoinByCodeForm';
import { OverviewTab } from '../components/overview/OverviewTab';
import { TasksTab } from '../components/tasks/TasksTab';
import { useSessionState } from '../hooks/useSessionState';
import * as membership from '../lib/membership';

type TabId = 'overview' | 'tasks';

export function SessionPage() {
  const { code = '' } = useParams<{ code: string }>();
  const normalizedCode = code.toUpperCase();
  const { status, state } = useSessionState(normalizedCode);
  const [tab, setTab] = useState<TabId>('overview');
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

  const by = { pid: member.pid, name: member.name };

  return (
    <div className="session-page">
      <header className="session-header">
        <CodeBadge code={normalizedCode} />
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
      </nav>

      <main>
        {tab === 'overview' && (
          <OverviewTab code={normalizedCode} state={state} by={by} />
        )}
        {tab === 'tasks' && (
          <TasksTab code={normalizedCode} state={state} by={by} />
        )}
      </main>
    </div>
  );
}
