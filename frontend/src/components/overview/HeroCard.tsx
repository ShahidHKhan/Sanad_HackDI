import type { Task } from '../../types/domain';

interface HeroCardProps {
  lastTask: Task;
  blockerTask: Task | undefined;
}

export function HeroCard({ lastTask, blockerTask }: HeroCardProps) {
  return (
    <div className="hero">
      <span className="eyebrow">{lastTask.title}</span>
      {lastTask.done ? (
        <>
          <span className="hero-value">
            {new Date(lastTask.doneAt!).toLocaleString()}
          </span>
          {lastTask.location && (
            <span className="hero-location">{lastTask.location}</span>
          )}
        </>
      ) : (
        <span className="hero-value hero-value-pending">Not scheduled</span>
      )}

      {blockerTask ? (
        <div className="blocker-strip">Waiting on: {blockerTask.title}</div>
      ) : (
        <div className="blocker-strip blocker-strip-done">All confirmed</div>
      )}
    </div>
  );
}
