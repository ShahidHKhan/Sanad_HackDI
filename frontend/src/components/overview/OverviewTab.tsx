import type { SessionState } from '../../types/domain';
import { AddStepForm } from './AddStepForm';
import { BlockerBanner } from './BlockerBanner';
import { HeroCard } from './HeroCard';
import { StepRow } from './StepRow';

interface OverviewTabProps {
  code: string;
  state: SessionState;
  by: { pid: string; name: string };
}

export function OverviewTab({ code, state, by }: OverviewTabProps) {
  const lastStep = state.steps[state.steps.length - 1];

  return (
    <div className="overview-tab">
      <HeroCard lastStep={lastStep} />
      <BlockerBanner steps={state.steps} />
      <div className="step-list">
        {state.steps.map((info) => (
          <StepRow key={info.id} code={code} info={info} by={by} />
        ))}
      </div>
      <AddStepForm code={code} />
    </div>
  );
}
