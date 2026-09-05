import { useEffect, useState } from 'react';
import * as sessionStore from '../lib/sessionStore';
import type { SessionState } from '../types/domain';

export type SessionStatus = 'loading' | 'ready' | 'not_found';

export interface UseSessionStateResult {
  status: SessionStatus;
  state: SessionState | null;
}

export function useSessionState(code: string): UseSessionStateResult {
  const [status, setStatus] = useState<SessionStatus>('loading');
  const [state, setState] = useState<SessionState | null>(null);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    setState(null);

    sessionStore.getSession(code).then((initial) => {
      if (cancelled) return;
      if (!initial) {
        setStatus('not_found');
        return;
      }
      setState(initial);
      setStatus('ready');
    });

    const unsubscribe = sessionStore.subscribeToSession(code, (next) => {
      if (cancelled) return;
      if (!next) {
        setStatus('not_found');
        setState(null);
        return;
      }
      setState(next);
      setStatus('ready');
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [code]);

  return { status, state };
}
