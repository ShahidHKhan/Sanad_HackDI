import { useState } from 'react';
import * as sessionStore from '../../lib/sessionStore';
import type { StepDef } from '../../data/steps';
import type { StepInfo } from '../../types/domain';
import { StepConfirmModal } from './StepConfirmModal';

interface StepRowProps {
  code: string;
  def: StepDef;
  info: StepInfo;
  by: { pid: string; name: string };
}

export function StepRow({ code, def, info, by }: StepRowProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const confirmed = info.status === 'confirmed';

  return (
    <div className="step-row">
      <div className="step-row-main">
        <span className={`step-status ${confirmed ? 'confirmed' : 'tbd'}`}>
          {confirmed ? 'Confirmed' : 'TBD'}
        </span>
        <span className="step-label">{def.label}</span>
      </div>

      {def.staticNote && <p className="step-static-note">{def.staticNote}</p>}

      {confirmed && (
        <div className="step-details">
          <span>{new Date(info.at!).toLocaleString()}</span>
          {info.location && <span> · {info.location}</span>}
          {info.note && <p className="step-note">{info.note}</p>}
        </div>
      )}

      <div className="step-actions">
        {confirmed ? (
          <button type="button" onClick={() => sessionStore.markStepTBD(code, def.id)}>
            Mark TBD
          </button>
        ) : (
          <button type="button" onClick={() => setModalOpen(true)}>
            Confirm
          </button>
        )}
      </div>

      {modalOpen && (
        <StepConfirmModal
          stepLabel={def.label}
          onClose={() => setModalOpen(false)}
          onConfirm={(fields) => {
            sessionStore.confirmStep(code, def.id, fields, by);
            setModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
