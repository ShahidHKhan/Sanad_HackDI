import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { isValidCodeFormat } from '../lib/code';
import { getDevicePid } from '../lib/device';
import * as membership from '../lib/membership';
import * as sessionStore from '../lib/sessionStore';

interface JoinByCodeFormProps {
  /** When set, the code is fixed (e.g. arriving via an invite link) and only a name is asked for. */
  fixedCode?: string;
  /** Called after a successful join when fixedCode is set, instead of navigating. */
  onJoined?: () => void;
}

export function JoinByCodeForm({ fixedCode, onJoined }: JoinByCodeFormProps) {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'family' | 'masjid'>('family');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;

    const targetCode = (fixedCode ?? code).trim().toUpperCase();
    if (!fixedCode && !isValidCodeFormat(targetCode)) {
      setError('That doesn’t look like a valid code.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      if (!fixedCode) {
        const existing = await sessionStore.getSession(targetCode);
        if (!existing) {
          setError('Code not found. Double-check it and try again.');
          setSubmitting(false);
          return;
        }
      }

      const pid = getDevicePid();
      await sessionStore.joinSession(targetCode, pid, trimmedName, role);
      membership.save(targetCode, pid, trimmedName);

      if (fixedCode) {
        onJoined?.();
      } else {
        navigate(`/s/${targetCode}`);
      }
    } catch {
      setError('Could not join that session. Please try again.');
      setSubmitting(false);
    }
  }

  return (
    <form className="panel" onSubmit={handleSubmit}>
      <h2>{fixedCode ? `Join session ${fixedCode}` : 'Join a session'}</h2>
      {!fixedCode && (
        <>
          <label htmlFor="join-code">Session code</label>
          <input
            id="join-code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="ABCDE"
            maxLength={5}
            disabled={submitting}
          />
        </>
      )}
      <label htmlFor="join-name">Your name</label>
      <input
        id="join-name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Omar"
        disabled={submitting}
      />
      <label>I'm joining as</label>
      <div className="role-choice">
        <label className={`role-choice-option ${role === 'family' ? 'active' : ''}`}>
          <input
            type="radio"
            name="join-role"
            checked={role === 'family'}
            disabled={submitting}
            onChange={() => setRole('family')}
          />
          <span className="role-choice-text">
            <span className="role-choice-label">Family / close friend</span>
            <span className="role-choice-desc">
              Coordinating tasks, costs, and documents for the family
            </span>
          </span>
        </label>
        <label className={`role-choice-option ${role === 'masjid' ? 'active' : ''}`}>
          <input
            type="radio"
            name="join-role"
            checked={role === 'masjid'}
            disabled={submitting}
            onChange={() => setRole('masjid')}
          />
          <span className="role-choice-text">
            <span className="role-choice-label">Masjid board member</span>
            <span className="role-choice-desc">
              Coordinating the masjid/cemetery directory and volunteers
            </span>
          </span>
        </label>
      </div>
      {error && <p className="form-error">{error}</p>}
      <button type="submit" disabled={submitting || !name.trim()}>
        {submitting ? 'Joining…' : 'Join'}
      </button>
    </form>
  );
}
