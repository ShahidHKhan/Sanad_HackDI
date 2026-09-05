import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isValidCodeFormat } from '../lib/code';
import { CreateSessionForm } from '../components/CreateSessionForm';
import { JoinByCodeForm } from '../components/JoinByCodeForm';

export function Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, '');
    if (isValidCodeFormat(hash)) {
      navigate(`/s/${hash.toUpperCase()}`, { replace: true });
    }
  }, [navigate]);

  return (
    <div className="landing">
      <h1>Sanad</h1>
      <p className="landing-subtitle">
        A shared space to coordinate with family in the first hours after a death.
      </p>
      <div className="landing-forms">
        <CreateSessionForm />
        <JoinByCodeForm />
      </div>
    </div>
  );
}
