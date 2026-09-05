import type { Task } from '../../types/domain';

interface TimelineRowProps {
  task: Task;
  isBlocker: boolean;
  isLast: boolean;
}

export function TimelineRow({ task, isBlocker, isLast }: TimelineRowProps) {
  return (
    <div className={`timeline-row ${isLast ? 'timeline-row-last' : ''}`}>
      <div
        className={`timeline-marker ${
          task.done ? 'timeline-marker-done' : isBlocker ? 'timeline-marker-blocker' : 'timeline-marker-pending'
        }`}
      >
        {task.done && '✓'}
      </div>
      <div className="timeline-row-content">
        <span className="timeline-title">{task.title}</span>
        {task.done ? (
          <span className="timeline-status">
            {new Date(task.doneAt!).toLocaleString()}
            {task.location && ` · ${task.location}`}
            {task.doneByName && ` · confirmed by ${task.doneByName}`}
          </span>
        ) : (
          <span className="timeline-status">
            TBD
            {isBlocker && <span className="blocker-badge">BLOCKER</span>}
          </span>
        )}
        {task.delegateNote && <p className="timeline-note">{task.delegateNote}</p>}
      </div>
    </div>
  );
}
