import type { StepInfo } from '../../types/domain';

interface HeroCardProps {
  lastStep: StepInfo | undefined;
}

export function HeroCard({ lastStep }: HeroCardProps) {
  if (!lastStep) {
    return (
      <div className="hero-card">
        <span className="hero-card-value hero-card-tbd">No steps yet</span>
      </div>
    );
  }

  const confirmed = lastStep.status === 'confirmed';

  return (
    <div className="hero-card">
      <span className="hero-card-label">{lastStep.label}</span>
      {confirmed ? (
        <>
          <span className="hero-card-value">
            {new Date(lastStep.at!).toLocaleString()}
          </span>
          {lastStep.location && (
            <span className="hero-card-location">{lastStep.location}</span>
          )}
        </>
      ) : (
        <span className="hero-card-value hero-card-tbd">TBD</span>
      )}
    </div>
  );
}
