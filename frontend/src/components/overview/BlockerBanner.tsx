import { STEP_DEFS } from '../../data/steps';
import type { StepInfo } from '../../types/domain';

interface BlockerBannerProps {
  steps: StepInfo[];
}

export function BlockerBanner({ steps }: BlockerBannerProps) {
  const byId = new Map(steps.map((s) => [s.id, s]));
  const firstUnconfirmed = STEP_DEFS.find(
    (def) => byId.get(def.id)?.status !== 'confirmed',
  );

  if (!firstUnconfirmed) {
    return <div className="blocker-banner blocker-banner-done">Everything confirmed.</div>;
  }

  return (
    <div className="blocker-banner">
      Waiting on: {firstUnconfirmed.label}
    </div>
  );
}
