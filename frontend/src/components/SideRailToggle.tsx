import { useNavigate } from 'react-router-dom';

interface SideRailToggleProps {
  code: string;
  active: 'family' | 'masjid';
  hideFamily?: boolean;
}

// Desktop-only sliding switch for the right rail — a physical toggle
// metaphor (track + sliding thumb) instead of two plain buttons, since
// there are exactly two mutually-exclusive positions to move between.
export function SideRailToggle({ code, active, hideFamily }: SideRailToggleProps) {
  const navigate = useNavigate();

  // A masjid-only participant has nothing to switch to — a badge, not a
  // switch with only one reachable position.
  if (hideFamily) {
    return <div className="rail-toggle-badge">Masjid</div>;
  }

  return (
    <div className="rail-toggle" role="group" aria-label="Switch portal">
      <span
        className={`rail-toggle-thumb ${active === 'masjid' ? 'rail-toggle-thumb-masjid' : ''}`}
        aria-hidden="true"
      />
      <button
        type="button"
        className={`rail-toggle-option ${active === 'family' ? 'active' : ''}`}
        onClick={() => navigate(`/s/${code}`)}
      >
        Family
      </button>
      <button
        type="button"
        className={`rail-toggle-option ${active === 'masjid' ? 'active' : ''}`}
        onClick={() => navigate(`/s/${code}/masjid`)}
      >
        Masjid
      </button>
    </div>
  );
}
