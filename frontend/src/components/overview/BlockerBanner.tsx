import type { StepInfo } from '../../types/domain';

interface BlockerBannerProps {
  steps: StepInfo[];
}

export function BlockerBanner({ steps }: BlockerBannerProps) {
  if (steps.length === 0) {
    return <div className="blocker-banner">No steps yet.</div>;
  }

  const firstUnconfirmed = steps.find((s) => s.status !== 'confirmed');

  if (!firstUnconfirmed) {
    return <div className="blocker-banner blocker-banner-done">Everything confirmed.</div>;
  }

  return <div className="blocker-banner">Waiting on: {firstUnconfirmed.label}</div>;
}
