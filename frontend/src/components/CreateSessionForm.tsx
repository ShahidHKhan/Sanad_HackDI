import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDevicePid } from '../lib/device';
import * as membership from '../lib/membership';
import * as sessionStore from '../lib/sessionStore';

export function CreateSessionForm() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    setSubmitting(true);
    setError(null);
    try {
      const pid = getDevicePid();
      const code = await sessionStore.createSession(pid, trimmed);
      membership.save(code, pid, trimmed);
      navigate(`/s/${code}`);
    } catch {
      setError('Could not create a session. Please try again.');
      setSubmitting(false);
    }
  }

  return (
    <form className="panel" onSubmit={handleSubmit}>
      <h2>Start a new session</h2>
      <label htmlFor="create-name">Your name</label>
      <input
        id="create-name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Layla"
        disabled={submitting}
      />
      {error && <p className="form-error">{error}</p>}
      <button type="submit" disabled={submitting || !name.trim()}>
        {submitting ? 'Creating…' : 'Create session'}
      </button>
    </form>
  );
}
