import { useEffect, useState } from 'react';
import * as sessionStore from '../lib/sessionStore';
import type { DirectoryData } from '../lib/sessionStore';

export interface UseDirectoryResult {
  loading: boolean;
  data: DirectoryData;
}

const EMPTY: DirectoryData = { masjids: [], cemeteries: [] };

export function useDirectory(): UseDirectoryResult {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DirectoryData>(EMPTY);

  useEffect(() => {
    let cancelled = false;

    sessionStore.getDirectory().then((initial) => {
      if (cancelled) return;
      setData(initial);
      setLoading(false);
    });

    const unsubscribe = sessionStore.subscribeToDirectory((next) => {
      if (cancelled) return;
      setData(next);
      setLoading(false);
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return { loading, data };
}
