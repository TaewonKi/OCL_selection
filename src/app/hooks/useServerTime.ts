'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const DEFAULT_ENDPOINT = '/api/server-time';
const DEFAULT_RESYNC_INTERVAL_MS = 60_000;

export type ServerTimeOptions = {
  endpoint?: string;
  resyncIntervalMs?: number;
};

export type ServerTimeSync = {
  offsetMs: number;
  rttMs: number;
  lastServerTs: number;
  syncedAtPerf: number;
};

// Syncs with the server clock while using performance.now() to avoid client clock tampering.
export function useServerTime(options?: ServerTimeOptions) {
  const { endpoint = DEFAULT_ENDPOINT, resyncIntervalMs = DEFAULT_RESYNC_INTERVAL_MS } = options ?? {};
  const [syncState, setSyncState] = useState<ServerTimeSync | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const syncOnce = useCallback(async () => {
    if (typeof performance === 'undefined') {
      return;
    }

    try {
      const startPerf = performance.now();
      const response = await fetch(endpoint, { cache: 'no-store' });
      const endPerf = performance.now();
      const payload = await response.json();
      const serverNowRaw = payload?.now;
      const serverNow = typeof serverNowRaw === 'number' ? serverNowRaw : Date.parse(serverNowRaw);

      if (!Number.isFinite(serverNow)) {
        console.warn('Server time payload missing numeric `now`');
        return;
      }

      const rttMs = endPerf - startPerf;
      const estimatedServerAtPerfEnd = serverNow + rttMs / 2;
      setSyncState({
        offsetMs: estimatedServerAtPerfEnd - endPerf,
        rttMs,
        lastServerTs: estimatedServerAtPerfEnd,
        syncedAtPerf: endPerf,
      });
    } catch (error) {
      console.error('Failed to sync server time', error);
    }
  }, [endpoint]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const kickoff = window.setTimeout(() => {
      syncOnce();
    }, 0);
    intervalRef.current = setInterval(syncOnce, resyncIntervalMs);

    const handleVisibility = () => {
      if (!document.hidden) {
        syncOnce();
      }
    };

    window.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.clearTimeout(kickoff);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      window.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [resyncIntervalMs, syncOnce]);

  const now = useCallback(() => {
    if (typeof performance === 'undefined') {
      return Date.now();
    }

    if (!syncState) {
      return Date.now();
    }

    return performance.now() + syncState.offsetMs;
  }, [syncState]);

  const isSynced = Boolean(syncState);

  return useMemo(
    () => ({
      now,
      syncState,
      isSynced,
      resync: syncOnce,
    }),
    [isSynced, now, syncOnce, syncState],
  );
}
