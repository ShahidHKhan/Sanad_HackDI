import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AnnounceTab } from '../components/announce/AnnounceTab';
import { ChatDrawer } from '../components/ChatDrawer';
import { CodeBadge } from '../components/CodeBadge';
import { ErrorState } from '../components/ErrorState';
import { FindTab } from '../components/find/FindTab';
import { GuidanceDrawer } from '../components/GuidanceDrawer';
import { HalfToggle } from '../components/HalfToggle';
import { JoinByCodeForm } from '../components/JoinByCodeForm';
import { OverviewTab } from '../components/overview/OverviewTab';
import { RecordsTab } from '../components/records/RecordsTab';
import { SessionDetailsModal } from '../components/SessionDetailsModal';
import { SideRailToggle } from '../components/SideRailToggle';
import { TasksTab } from '../components/tasks/TasksTab';
import { useSessionState } from '../hooks/useSessionState';
import * as chatSeen from '../lib/chatSeen';
import * as membership from '../lib/membership';

type TabId = 'overview' | 'tasks' | 'find' | 'records' | 'announce';

const NAV_ITEMS: { id: TabId; label: string; icon: string }[] = [
  { id: 'overview', label: 'Overview', icon: '🕐' },
  { id: 'tasks', label: 'Tasks', icon: '✅' },
  { id: 'find', label: 'Find', icon: '🕌' },
  { id: 'records', label: 'Records', icon: '📄' },
  { id: 'announce', label: 'Announce', icon: '📢' },
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

export function SessionPage() {
  const { code = '' } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const normalizedCode = code.toUpperCase();
  const { status, state } = useSessionState(normalizedCode);
  const [tab, setTab] = useState<TabId>('overview');
  const [joinedTick, setJoinedTick] = useState(0);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [guidanceOpen, setGuidanceOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const member = membership.get(normalizedCode);
  const myRole = state?.participants.find((p) => p.pid === member?.pid)?.role;

  // Masjid-role participants only get the Masjid half — Records/Chat/Tasks
  // carry family-private info they have no reason to see.
  useEffect(() => {
    if (myRole === 'masjid') {
      navigate(`/s/${normalizedCode}/masjid`, { replace: true });
    }
  }, [myRole, navigate, normalizedCode]);

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

  if (myRole === 'masjid') {
    return <div className="loading-state">Redirecting…</div>;
  }

  const by = { pid: member.pid, name: member.name };
  const isAdmin = myRole === 'admin';
  const lastSeenChat = chatSeen.getLastSeen(normalizedCode);
  const hasUnreadChat = state.chatMessages.some(
    (m) => !lastSeenChat || new Date(m.at) > new Date(lastSeenChat),
  );

  return (
    <div className="session-page">
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

      <div className="content-area">
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
            <h1 className="session-title">Janaza Organizer</h1>
            <span className="session-subtitle">
              {state.session.deceasedName || 'Deceased’s name not yet set'}
            </span>
          </div>

          <div className="session-header-actions">
            <span className="avatar-badge">{getInitials(member.name)}</span>
            <CodeBadge code={normalizedCode} />
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
              aria-label="Open chat"
              onClick={() => {
                chatSeen.markSeen(normalizedCode);
                setChatOpen(true);
              }}
            >
              💬
              {hasUnreadChat && <span className="unread-dot" />}
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

        <HalfToggle code={normalizedCode} active="family" />

        <div className="content-body">
          <main>
            {tab === 'overview' && <OverviewTab state={state} />}
            {tab === 'tasks' && (
              <TasksTab code={normalizedCode} state={state} by={by} isAdmin={isAdmin} />
            )}
            {tab === 'find' && <FindTab code={normalizedCode} state={state} by={by} />}
            {tab === 'records' && (
              <RecordsTab code={normalizedCode} state={state} by={by} />
            )}
            {tab === 'announce' && <AnnounceTab state={state} />}
          </main>

          <aside className="side-rail">
            <SideRailToggle code={normalizedCode} active="family" />
          </aside>
        </div>
      </div>

      {detailsOpen && (
        <SessionDetailsModal
          code={normalizedCode}
          session={state.session}
          onClose={() => setDetailsOpen(false)}
        />
      )}

      {guidanceOpen && <GuidanceDrawer onClose={() => setGuidanceOpen(false)} />}

      {chatOpen && (
        <ChatDrawer
          code={normalizedCode}
          messages={state.chatMessages}
          by={by}
          onClose={() => setChatOpen(false)}
        />
      )}
    </div>
  );
}
