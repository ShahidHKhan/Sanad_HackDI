import { X } from 'lucide-react';
import * as sessionStore from '../../lib/sessionStore';
import type { DirectoryCall, Masjid } from '../../types/domain';
import { DirectoryCallControls } from './DirectoryCallControls';

interface MasjidCardProps {
  code: string;
  masjid: Masjid;
  call: DirectoryCall | null;
  isUsed: boolean;
  by: { pid: string; name: string };
}

export function MasjidCard({ code, masjid, call, isUsed, by }: MasjidCardProps) {
  function handleRemove() {
    if (window.confirm(`Remove "${masjid.name}" from the directory? This can't be undone.`)) {
      sessionStore.removeMasjid(masjid.id);
    }
  }

  const meta = [masjid.town, masjid.phone].filter(Boolean).join(' · ');
  const tags = [
    masjid.ghuslMen && 'Ghusl (men)',
    masjid.ghuslWomen && 'Ghusl (women)',
    masjid.shortNotice && 'Short notice',
  ].filter(Boolean) as string[];

  return (
    <div className="row">
      <div className="row-main">
        <span className="row-title">{masjid.name}</span>
        {meta && <span className="row-meta">{meta}</span>}
        {masjid.notes && <p className="directory-card-notes">{masjid.notes}</p>}
      </div>

      <div className="row-actions">
        {isUsed && <span className="chip chip-confirmed">In use</span>}
        <button
          type="button"
          className="directory-remove-button"
          aria-label={`Remove ${masjid.name}`}
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
          entryType="masjid"
          entryId={masjid.id}
          entryLocation={[masjid.name, masjid.town].filter(Boolean).join(', ')}
          call={call}
          isUsed={isUsed}
          useLabel="Use this masjid"
          onUse={() => sessionStore.updateSessionDetails(code, { masjidName: masjid.name })}
          syncNote="Also marks “Janazah prayer held” done on the family's Overview timeline."
          by={by}
        />
      </div>
    </div>
  );
}
