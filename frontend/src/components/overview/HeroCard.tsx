import type { Task } from '../../types/domain';

interface HeroCardProps {
  lastTask: Task;
  blockerTask: Task | undefined;
}

export function HeroCard({ lastTask, blockerTask }: HeroCardProps) {
  return (
    <div className="hero-card">
      <span className="hero-card-label">{lastTask.title}</span>
      {lastTask.done ? (
        <>
          <span className="hero-card-value">
            {new Date(lastTask.doneAt!).toLocaleString()}
          </span>
          {lastTask.location && (
            <span className="hero-card-location">{lastTask.location}</span>
          )}
        </>
      ) : (
        <span className="hero-card-value hero-card-tbd">TBD</span>
      )}

      {blockerTask ? (
        <div className="blocker-strip">Waiting on: {blockerTask.title}</div>
      ) : (
        <div className="blocker-strip blocker-strip-done">All confirmed</div>
      )}
    </div>
  );
}
