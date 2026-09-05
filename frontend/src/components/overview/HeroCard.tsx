import type { StepInfo } from '../../types/domain';

interface HeroCardProps {
  burialStep: StepInfo | undefined;
}

export function HeroCard({ burialStep }: HeroCardProps) {
  const confirmed = burialStep?.status === 'confirmed';

  return (
    <div className="hero-card">
      <span className="hero-card-label">Burial</span>
      {confirmed ? (
        <>
          <span className="hero-card-value">
            {new Date(burialStep!.at!).toLocaleString()}
          </span>
          {burialStep!.location && (
            <span className="hero-card-location">{burialStep!.location}</span>
          )}
        </>
      ) : (
        <span className="hero-card-value hero-card-tbd">TBD</span>
      )}
    </div>
  );
}
