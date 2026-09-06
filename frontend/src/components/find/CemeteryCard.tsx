import * as sessionStore from '../../lib/sessionStore';
import type { Cemetery, DirectoryCall } from '../../types/domain';
import { DirectoryCallControls } from './DirectoryCallControls';

interface CemeteryCardProps {
  code: string;
  cemetery: Cemetery;
  call: DirectoryCall | null;
  isUsed: boolean;
  by: { pid: string; name: string };
}

export function CemeteryCard({ code, cemetery, call, isUsed, by }: CemeteryCardProps) {
  function handleRemove() {
    if (window.confirm(`Remove "${cemetery.name}" from the directory? This can't be undone.`)) {
      sessionStore.removeCemetery(cemetery.id);
    }
  }

  return (
    <div className="directory-card">
      <div className="directory-card-header">
        <span className="directory-card-name">{cemetery.name}</span>
        <div className="directory-card-header-actions">
          {isUsed && <span className="directory-used-badge">In use</span>}
          <button
            type="button"
            className="directory-remove-button"
            aria-label={`Remove ${cemetery.name}`}
            onClick={handleRemove}
          >
            ✕
          </button>
        </div>
      </div>
      {cemetery.town && <span className="directory-card-meta">{cemetery.town}</span>}
      {cemetery.phone && <span className="directory-card-meta">{cemetery.phone}</span>}
      {cemetery.intermentHours && (
        <span className="directory-card-meta">Interment hours: {cemetery.intermentHours}</span>
      )}
      {(cemetery.islamicSection || cemetery.noCasketAllowed) && (
        <div className="directory-card-tags">
          {cemetery.islamicSection && <span className="tag-chip">Islamic section</span>}
          {cemetery.noCasketAllowed && <span className="tag-chip">No casket required</span>}
        </div>
      )}
      {cemetery.notes && <p className="directory-card-notes">{cemetery.notes}</p>}

      <DirectoryCallControls
        code={code}
        entryType="cemetery"
        entryId={cemetery.id}
        entryLocation={[cemetery.name, cemetery.town].filter(Boolean).join(', ')}
        call={call}
        isUsed={isUsed}
        useLabel="Use this cemetery"
        onUse={() => sessionStore.updateSessionDetails(code, { cemeteryName: cemetery.name })}
        syncNote="Also marks “Cemetery confirms the burial slot” done on the family's Overview timeline."
        by={by}
      />
    </div>
  );
}
