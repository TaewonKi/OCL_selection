'use client';

import { useEffect, useMemo, useState } from 'react';
import { useServerTime } from '../hooks/useServerTime';

const TARGET_TIMESTAMP = Date.parse('2025-12-03T05:40:00.000Z');
const REFRESH_INTERVAL_MS = 250;

type CountdownProps = {
  className?: string;
  onAvailabilityChange?: (isOpen: boolean) => void;
};

const pad = (value: number) => value.toString().padStart(2, '0');

const humanize = (msRemaining: number) => {
  const totalSeconds = Math.floor(msRemaining / 1000);
  const seconds = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const minutes = totalMinutes % 60;
  const totalHours = Math.floor(totalMinutes / 60);
  const hours = totalHours % 24;
  const days = Math.floor(totalHours / 24);

  return { days, hours, minutes, seconds };
};

// Displays a countdown that is anchored to server time instead of the client clock.
export function Countdown({ className, onAvailabilityChange }: CountdownProps) {
  const { now, isSynced, syncState } = useServerTime({ resyncIntervalMs: 45_000 });
  const [remaining, setRemaining] = useState(() => Math.max(0, TARGET_TIMESTAMP - Date.now()));
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    let timer: number;

    const tick = () => {
      const serverNow = now();
      const nextRemaining = Math.max(0, TARGET_TIMESTAMP - serverNow);
      setRemaining(nextRemaining);
      if (nextRemaining > 0) {
        timer = window.setTimeout(tick, REFRESH_INTERVAL_MS);
      }
    };

    timer = window.setTimeout(tick, REFRESH_INTERVAL_MS);
    return () => window.clearTimeout(timer);
  }, [now]);

  const unlocked = remaining === 0;
  useEffect(() => {
    onAvailabilityChange?.(unlocked);
  }, [onAvailabilityChange, unlocked]);
  const { days, hours, minutes, seconds } = useMemo(() => humanize(remaining), [remaining]);

  if (!isClient) {
    return (
      <div
        className={['relative overflow-hidden rounded-3xl bg-white border border-slate-200 shadow-sm', className]
          .filter(Boolean)
          .join(' ')}
      >
        <div className="text-center py-10 sm:py-12 px-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-slate-600 text-sm font-semibold mb-8 border border-slate-200">
            <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Loading...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={['relative overflow-hidden rounded-3xl bg-white border border-slate-200 shadow-sm', className]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="text-center py-10 sm:py-12 px-6">
        {!unlocked && (
          <>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold mb-8 border border-blue-100">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Registration Opens In
            </div>
            <div className="flex items-start justify-center gap-2 sm:gap-3 lg:gap-4 mb-8">
              <TimeBlock label="Days" value={days.toString()} />
              <TimeBlock label="Hours" value={pad(hours)} />
              <TimeBlock label="Minutes" value={pad(minutes)} />
              <TimeBlock label="Seconds" value={pad(seconds)} />
            </div>
          </>
        )}

        {unlocked && (
          <div className="py-6">
            <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-emerald-50 rounded-full mb-4 border-4 border-emerald-100">
              <svg className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-emerald-600 mb-2">Registration Open!</p>
            <p className="text-base text-slate-600">You can now submit your application</p>
          </div>
        )}

        <div className="flex items-center justify-center gap-2 text-sm text-slate-500 pt-6 border-t border-slate-100">
          <span>3 Dec 2025, 12:37 PM UTC+7</span>
          <StatusBar unlocked={unlocked} isSynced={isSynced} rttMs={syncState?.rttMs} />
        </div>
      </div>
    </div>
  );
}

type TimeBlockProps = {
  label: string;
  value: string;
};

function TimeBlock({ label, value }: TimeBlockProps) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-slate-50 rounded-2xl px-4 sm:px-6 py-5 sm:py-7 border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all min-w-[70px] sm:min-w-[90px] lg:min-w-[110px]">
        <div className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-none tabular-nums">
          {value}
        </div>
      </div>
      <div className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-500 mt-3">
        {label}
      </div>
    </div>
  );
}

type StatusBarProps = {
  unlocked: boolean;
  isSynced: boolean;
  rttMs?: number;
};

function StatusBar({ unlocked, isSynced, rttMs }: StatusBarProps) {
  if (unlocked) {
    return null;
  }

  if (!isSynced) {
    return (
      <>
        <span className="text-slate-300">•</span>
        <span className="text-amber-600">Syncing…</span>
      </>
    );
  }

  return (
    <>
      <span className="text-slate-300">•</span>
      <span className="flex items-center gap-1.5 text-emerald-600">
        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
        Live
      </span>
    </>
  );
}
