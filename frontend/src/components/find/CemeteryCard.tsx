import { X } from 'lucide-react';
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

  const meta = [cemetery.town, cemetery.phone].filter(Boolean).join(' · ');
  const tags = [
    cemetery.islamicSection && 'Islamic section',
    cemetery.noCasketAllowed && 'No casket required',
  ].filter(Boolean) as string[];

  return (
    <div className="row">
      <div className="row-main">
        <span className="row-title">{cemetery.name}</span>
        {meta && <span className="row-meta">{meta}</span>}
        {cemetery.intermentHours && (
          <span className="row-meta">Interment hours: {cemetery.intermentHours}</span>
        )}
        {cemetery.notes && <p className="directory-card-notes">{cemetery.notes}</p>}
      </div>

      <div className="row-actions">
        {isUsed && <span className="chip chip-confirmed">In use</span>}
        <button
          type="button"
          className="directory-remove-button"
          aria-label={`Remove ${cemetery.name}`}
          title="Remove"
          onClick={handleRemove}
        >
          <X size={15} aria-hidden="true" />
        </button>
      </div>

      <div className="row-detail">
        {tags.length > 0 && (
          <div className="chip-row">
            {tags.map((tag) => (
              <span key={tag} className="chip">
                {tag}
              </span>
            ))}
          </div>
        )}

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
    </div>
  );
}
