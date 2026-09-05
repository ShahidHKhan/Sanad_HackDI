import type { SessionState } from '../../types/domain';
import { HeroCard } from './HeroCard';
import { TimelineRow } from './TimelineRow';

interface OverviewTabProps {
  state: SessionState;
}

export function OverviewTab({ state }: OverviewTabProps) {
  const pinnedTasks = state.tasks
    .filter((t) => t.pinned)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  if (pinnedTasks.length === 0) {
    return (
      <div className="overview-tab">
        <p className="overview-empty">
          No pinned tasks yet. Pin a task from the Tasks page to show it here.
        </p>
      </div>
    );
  }

  const lastTask = pinnedTasks[pinnedTasks.length - 1];
  const blockerTask = pinnedTasks.find((t) => !t.done);

  return (
    <div className="overview-tab">
      <HeroCard lastTask={lastTask} blockerTask={blockerTask} />
      <div className="timeline">
        {pinnedTasks.map((task, index) => (
          <TimelineRow
            key={task.id}
            task={task}
            isBlocker={task.id === blockerTask?.id}
            isLast={index === pinnedTasks.length - 1}
          />
        ))}
      </div>
    </div>
  );
}
