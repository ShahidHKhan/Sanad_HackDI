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
  return (
    <div className="directory-card">
      <div className="directory-card-header">
        <span className="directory-card-name">{masjid.name}</span>
        {isUsed && <span className="directory-used-badge">In use</span>}
      </div>
      {masjid.town && <span className="directory-card-meta">{masjid.town}</span>}
      {masjid.phone && <span className="directory-card-meta">{masjid.phone}</span>}
      {(masjid.ghuslMen || masjid.ghuslWomen || masjid.shortNotice) && (
        <div className="directory-card-tags">
          {masjid.ghuslMen && <span className="tag-chip">Ghusl (men)</span>}
          {masjid.ghuslWomen && <span className="tag-chip">Ghusl (women)</span>}
          {masjid.shortNotice && <span className="tag-chip">Short notice</span>}
        </div>
      )}
      {masjid.notes && <p className="directory-card-notes">{masjid.notes}</p>}

      <DirectoryCallControls
        code={code}
        entryType="masjid"
        entryId={masjid.id}
        call={call}
        isUsed={isUsed}
        useLabel="Use this masjid"
        onUse={() => sessionStore.updateSessionDetails(code, { masjidName: masjid.name })}
        by={by}
      />
    </div>
  );
}
