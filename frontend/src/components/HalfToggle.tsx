import { useNavigate } from 'react-router-dom';

interface HalfToggleProps {
  code: string;
  active: 'family' | 'masjid';
  hideFamily?: boolean;
}

export function HalfToggle({ code, active, hideFamily }: HalfToggleProps) {
  const navigate = useNavigate();

  return (
    <nav className="segment-switcher">
      {!hideFamily && (
        <button
          type="button"
          className={active === 'family' ? 'active' : ''}
          onClick={() => navigate(`/s/${code}`)}
        >
          Family
        </button>
      )}
      <button
        type="button"
        className={active === 'masjid' ? 'active' : ''}
        onClick={() => navigate(`/s/${code}/masjid`)}
      >
        Masjid
      </button>
    </nav>
  );
}
