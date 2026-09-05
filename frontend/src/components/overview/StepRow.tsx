import { useState } from 'react';
import * as sessionStore from '../../lib/sessionStore';
import type { StepInfo } from '../../types/domain';
import { StepConfirmModal } from './StepConfirmModal';

interface StepRowProps {
  code: string;
  info: StepInfo;
  by: { pid: string; name: string };
}

export function StepRow({ code, info, by }: StepRowProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [labelDraft, setLabelDraft] = useState(info.label);
  const [staticNoteDraft, setStaticNoteDraft] = useState(info.staticNote ?? '');
  const confirmed = info.status === 'confirmed';

  function startEditing() {
    setLabelDraft(info.label);
    setStaticNoteDraft(info.staticNote ?? '');
    setEditing(true);
  }

  function saveEdit() {
    if (!labelDraft.trim()) return;
    sessionStore.editStep(code, info.id, {
      label: labelDraft.trim(),
      staticNote: staticNoteDraft.trim() || undefined,
    });
    setEditing(false);
  }

  function handleRemove() {
    if (window.confirm(`Remove "${info.label}" from the timeline?`)) {
      sessionStore.removeStep(code, info.id);
    }
  }

  if (editing) {
    return (
      <div className="step-row step-edit-form">
        <label htmlFor={`step-label-${info.id}`}>Label</label>
        <input
          id={`step-label-${info.id}`}
          value={labelDraft}
          onChange={(e) => setLabelDraft(e.target.value)}
        />
        <label htmlFor={`step-static-note-${info.id}`}>Static note (optional)</label>
        <input
          id={`step-static-note-${info.id}`}
          value={staticNoteDraft}
          onChange={(e) => setStaticNoteDraft(e.target.value)}
        />
        <div className="modal-actions">
          <button type="button" onClick={() => setEditing(false)}>
            Cancel
          </button>
          <button type="button" onClick={saveEdit}>
            Save
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="step-row">
      <div className="step-row-main">
        <span className={`step-status ${confirmed ? 'confirmed' : 'tbd'}`}>
          {confirmed ? 'Confirmed' : 'TBD'}
        </span>
        <span className="step-label">{info.label}</span>
      </div>

      {info.staticNote && <p className="step-static-note">{info.staticNote}</p>}

      {confirmed && (
        <div className="step-details">
          <span>{new Date(info.at!).toLocaleString()}</span>
          {info.location && <span> · {info.location}</span>}
          {info.note && <p className="step-note">{info.note}</p>}
        </div>
      )}

      <div className="step-actions">
        {confirmed ? (
          <button type="button" onClick={() => sessionStore.markStepTBD(code, info.id)}>
            Mark TBD
          </button>
        ) : (
          <button type="button" onClick={() => setModalOpen(true)}>
            Confirm
          </button>
        )}
        <button type="button" onClick={startEditing}>
          Edit
        </button>
        <button type="button" className="btn-danger" onClick={handleRemove}>
          Remove
        </button>
      </div>

      {modalOpen && (
        <StepConfirmModal
          stepLabel={info.label}
          onClose={() => setModalOpen(false)}
          onConfirm={(fields) => {
            sessionStore.confirmStep(code, info.id, fields, by);
            setModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
