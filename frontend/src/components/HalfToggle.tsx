import { useNavigate } from 'react-router-dom';

interface HalfToggleProps {
  code: string;
  active: 'family' | 'masjid';
}

export function HalfToggle({ code, active }: HalfToggleProps) {
  const navigate = useNavigate();

  return (
    <nav className="segment-switcher">
      <button
        type="button"
        className={active === 'family' ? 'active' : ''}
        onClick={() => navigate(`/s/${code}`)}
      >
        Family
      </button>
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
