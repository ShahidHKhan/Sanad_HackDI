import { STEP_DEFS } from '../../data/steps';
import type { SessionState } from '../../types/domain';
import { BlockerBanner } from './BlockerBanner';
import { HeroCard } from './HeroCard';
import { StepRow } from './StepRow';

interface OverviewTabProps {
  code: string;
  state: SessionState;
  by: { pid: string; name: string };
}

export function OverviewTab({ code, state, by }: OverviewTabProps) {
  const byId = new Map(state.steps.map((s) => [s.id, s]));
  const burialStep = byId.get('burial');

  return (
    <div className="overview-tab">
      <HeroCard burialStep={burialStep} />
      <BlockerBanner steps={state.steps} />
      <div className="step-list">
        {STEP_DEFS.map((def) => {
          const info = byId.get(def.id);
          if (!info) return null;
          return (
            <StepRow key={def.id} code={code} def={def} info={info} by={by} />
          );
        })}
      </div>
    </div>
  );
}
