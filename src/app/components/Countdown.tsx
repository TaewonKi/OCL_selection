'use client';

import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
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

const TARGET_DATE = new Date('2026-08-29T10:51:00.000Z');
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
  const isFinalCountdown = !unlocked && days === 0 && hours === 0 && minutes === 0;

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
      {unlocked && <ApprovalStamp />}
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
            {isFinalCountdown ? (
              <div className="flex items-stretch justify-center">
                <TimeBlock label="Seconds" value={pad(seconds)} size="lg" />
              </div>
            ) : (
              <div className="flex items-stretch justify-center gap-2 sm:gap-3">
                <TimeBlock label="Days" value={pad(days)} />
                <Colon />
                <TimeBlock label="Hours" value={pad(hours)} />
                <Colon />
                <TimeBlock label="Minutes" value={pad(minutes)} />
                <Colon />
                <TimeBlock label="Seconds" value={pad(seconds)} />
              </div>
            )}
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

// Oversized ink stamp pressed onto the board once the gate opens — the
// single clearest signal that registration can now be claimed.
function ApprovalStamp() {
  return (
    <div
      className="stamp-in absolute top-1/2 right-3 sm:right-6 z-10 -translate-y-1/2 rotate-[-12deg]"
      aria-hidden="true"
    >
      <div className="flex h-20 w-20 sm:h-28 sm:w-28 flex-col items-center justify-center gap-1 rounded-full border-[3px] border-stamp bg-stamp/10 text-stamp shadow-lg">
        <svg
          className="h-7 w-7 sm:h-9 sm:w-9"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
        <span className="font-mono text-[0.5rem] sm:text-[0.6rem] tracking-[0.15em] uppercase leading-none">
          Open
        </span>
      </div>
    </div>
  );
}

type TimeBlockProps = {
  label: string;
  value: string;
  size?: 'md' | 'lg';
};

function TimeBlock({ label, value, size = 'md' }: TimeBlockProps) {
  const tileClasses =
    size === 'lg'
      ? 'px-5 sm:px-7 py-6 sm:py-8 min-w-[84px] sm:min-w-[130px]'
      : 'px-3 sm:px-5 py-4 sm:py-5 min-w-[58px] sm:min-w-[84px]';
  const labelClasses =
    size === 'lg'
      ? 'mt-3 text-xs sm:text-sm tracking-[0.25em]'
      : 'mt-2.5 text-[0.6rem] sm:text-[0.65rem] tracking-[0.2em]';

  return (
    <div className="flex flex-col items-center">
      <div className={`flap flex rounded-xl bg-black/35 ring-1 ring-paper/10 ${tileClasses}`}>
        {value.split('').map((digit, i) => (
          <RollingDigit key={i} digit={digit} size={size} />
        ))}
      </div>
      <div className={`font-mono uppercase text-paper/50 ${labelClasses}`}>{label}</div>
    </div>
  );
}

// Suitcase-lock style digit wheel: the outgoing digit rolls up and out while
// the incoming one rolls up from below, like a mechanical tumbler.
function RollingDigit({ digit, size = 'md' }: { digit: string; size?: 'md' | 'lg' }) {
  const reduceMotion = useReducedMotion();
  const digitClasses =
    size === 'lg'
      ? 'h-[1em] w-[0.62em] text-6xl sm:text-8xl'
      : 'h-[1em] w-[0.62em] text-3xl sm:text-5xl';

  return (
    <span
      className={`relative inline-block overflow-hidden font-mono font-semibold text-paper leading-none tabular-nums ${digitClasses}`}
    >
      <span className="invisible" aria-hidden="true">
        {digit}
      </span>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={digit}
          initial={reduceMotion ? false : { y: '100%' }}
          animate={{ y: '0%' }}
          exit={reduceMotion ? undefined : { y: '-100%' }}
          transition={{ duration: 0.32, ease: [0.32, 0.72, 0.35, 1] }}
          className="absolute inset-0 flex items-center justify-center"
        >
          {digit}
        </motion.span>
      </AnimatePresence>
    </span>
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
