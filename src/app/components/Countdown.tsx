'use client';

import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { useServerTime } from '../hooks/useServerTime';

const noopSubscribe = () => () => {};
// Resolves to false during SSR and the hydration pass, then true once mounted —
// avoids a time-based hydration mismatch without a setState-in-effect.
const useIsClient = () =>
  useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );

const TARGET_DATE = new Date('2025-01-01T11:00:00.000Z');
const TARGET_TIMESTAMP = TARGET_DATE.getTime(); // 01 Jan 2027, 18:00 UTC+7

const formattedDate = TARGET_DATE.toLocaleDateString('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
}).toUpperCase();


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

const boardClasses = (className?: string) =>
  [
    'board-sheen relative overflow-hidden rounded-3xl bg-board text-paper shadow-xl ring-1 ring-ink/40',
    className,
  ]
    .filter(Boolean)
    .join(' ');

// Departure board anchored to server time rather than the client clock.
export function Countdown({ className, onAvailabilityChange }: CountdownProps) {
  const { now, isSynced, syncState } = useServerTime({ resyncIntervalMs: 45_000 });
  const [remaining, setRemaining] = useState(() => Math.max(0, TARGET_TIMESTAMP - Date.now()));
  const isClient = useIsClient();

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
      <div className={boardClasses(className)}>
        <div className="px-6 py-10 sm:py-12 text-center">
          <span className="font-mono text-xs tracking-[0.25em] text-paper/60 uppercase">
            Departure board · syncing
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={boardClasses(className)}>
      <div className="px-5 sm:px-8 py-7 sm:py-9">
        {/* Board header */}
        <div className="flex items-center justify-between gap-4 pb-6 mb-7 border-b border-paper/15">
          <div className="flex items-center gap-2.5">
            <span
              className={`h-2 w-2 rounded-full ${unlocked ? 'bg-stamp' : 'bg-brass-soft gate-pulse'}`}
              aria-hidden="true"
            />
            <span className="font-mono text-[0.65rem] sm:text-xs tracking-[0.25em] text-paper/70 uppercase">
              {unlocked ? 'Now boarding' : 'Next departure'}
            </span>
          </div>
          <span className="font-mono text-[0.65rem] sm:text-xs tracking-[0.25em] text-paper/50 uppercase">
            Gate · OCL 2027
          </span>
        </div>

        {!unlocked && (
          <>
            <p className="font-mono text-[0.65rem] tracking-[0.3em] text-brass-soft uppercase text-center mb-5">
              Registration departs in
            </p>
            <div className="flex items-stretch justify-center gap-2 sm:gap-3">
              <TimeBlock label="Days" value={pad(days)} />
              <Colon />
              <TimeBlock label="Hours" value={pad(hours)} />
              <Colon />
              <TimeBlock label="Minutes" value={pad(minutes)} />
              <Colon />
              <TimeBlock label="Seconds" value={pad(seconds)} />
            </div>
          </>
        )}

        {unlocked && (
          <div className="py-3 text-center">
            <p className="font-serif text-3xl sm:text-4xl font-semibold text-paper mb-2">
              Now boarding
            </p>
            <p className="text-sm text-paper/70">
              Registration is open — claim your seat.
            </p>
          </div>
        )}

        {/* Board footer */}
        <div className="mt-7 pt-5 border-t border-paper/15 flex items-center justify-center gap-2 font-mono text-[0.65rem] sm:text-xs tracking-[0.2em] text-paper/55 uppercase">
          <span>Scheduled · {formattedDate}</span>
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
      <div className="flap rounded-xl bg-black/35 ring-1 ring-paper/10 px-3 sm:px-5 py-4 sm:py-5 min-w-[58px] sm:min-w-[84px]">
        <div className="font-mono text-3xl sm:text-5xl font-semibold text-paper leading-none tabular-nums">
          {value}
        </div>
      </div>
      <div className="mt-2.5 font-mono text-[0.6rem] sm:text-[0.65rem] tracking-[0.2em] uppercase text-paper/50">
        {label}
      </div>
    </div>
  );
}

function Colon() {
  return (
    <span
      className="self-start mt-3 sm:mt-4 font-mono text-2xl sm:text-4xl text-brass-soft/70 leading-none"
      aria-hidden="true"
    >
      :
    </span>
  );
}

type StatusBarProps = {
  unlocked: boolean;
  isSynced: boolean;
  rttMs?: number;
};

function StatusBar({ unlocked, isSynced }: StatusBarProps) {
  if (unlocked) {
    return null;
  }

  if (!isSynced) {
    return (
      <>
        <span className="text-paper/30">•</span>
        <span className="text-brass-soft">Syncing…</span>
      </>
    );
  }

  return null;
}
