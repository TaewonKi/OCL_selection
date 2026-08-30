"use client";

import { useState } from "react";
import { PROVINCE_PATHS, VW, VH } from "./thailand-paths";

type MapTrip = {
  trip_id: string;
  name: string;
  quota: number;
  current_count: number;
  remaining: number;
  stops: string[];
};

type ThailandMapProps = {
  trips: MapTrip[];
  selectedTrip: string | null;
  onSelect: (tripId: string) => void;
  registrationOpen: boolean;
  mapClassName?: string;
};

const ALIASES: Record<string, string> = {
  bangkok:                           "Bangkok Metropolis",
  pattaya:                           "Phatthaya",
  ayutthaya:                         "Phra Nakhon Si Ayutthaya",
  "hua hin":                         "Prachuap Khiri Khan",
  huahin:                            "Prachuap Khiri Khan",
  "phang-nga":                       "Phangnga",
  "kiriwong nakhon si thammarat":    "Nakhon Si Thammarat",
};

const provinceCentroid = Object.fromEntries(
  PROVINCE_PATHS.map((p) => [p.name.toLowerCase(), [p.cx, p.cy] as [number, number]])
);

function resolveProvince(part: string): [number, number] | undefined {
  const key = part.trim().toLowerCase();
  const name = ALIASES[key] ?? key;
  return provinceCentroid[name.toLowerCase()];
}

function pinPosition(trip: MapTrip): [number, number] | undefined {
  for (const stop of trip.stops) {
    const coord = resolveProvince(stop);
    if (coord) return coord;
  }
  return undefined;
}

// Returns all province names (lowercased) that the route visits.
function getAffectedProvinces(trip: MapTrip): Set<string> {
  const names = new Set<string>();
  trip.stops.forEach((part) => {
    const key = part.trim().toLowerCase();
    const resolved = (ALIASES[key] ?? key).toLowerCase();
    if (provinceCentroid[resolved]) names.add(resolved);
  });
  return names;
}

function coordKey([x, y]: [number, number]) {
  return `${x.toFixed(1)},${y.toFixed(1)}`;
}

export function ThailandMap({ trips, selectedTrip, onSelect, registrationOpen, mapClassName = "max-w-[280px]" }: ThailandMapProps) {
  const [openKey, setOpenKey] = useState<string | null>(null);

  const pinned = trips
    .map((trip) => ({ trip, coord: pinPosition(trip) }))
    .filter((e): e is { trip: MapTrip; coord: [number, number] } => Boolean(e.coord));

  // Provinces to glow: derived from the selected trip's route.
  const glowingProvinces: Set<string> = selectedTrip
    ? (() => {
        const trip = trips.find((t) => t.trip_id === selectedTrip);
        return trip ? getAffectedProvinces(trip) : new Set<string>();
      })()
    : new Set<string>();

  // Group co-located pins.
  const groups = new Map<string, { coord: [number, number]; trips: MapTrip[] }>();
  for (const { trip, coord } of pinned) {
    const key = coordKey(coord);
    if (!groups.has(key)) groups.set(key, { coord, trips: [] });
    groups.get(key)!.trips.push(trip);
  }

  return (
    <div>
      {/* Primary: numbered manifest list — the main way to choose a destination */}
      <div className="space-y-2.5 mb-8">
        {trips.map((trip, i) => {
          const isFull = trip.remaining === 0;
          const isSelected = selectedTrip === trip.trip_id;
          const interactive = registrationOpen && !isFull;
          return (
            <button
              key={trip.trip_id}
              type="button"
              onClick={() => interactive && onSelect(trip.trip_id)}
              disabled={!interactive}
              aria-pressed={isSelected}
              className={`group/row w-full flex items-center gap-3 sm:gap-4 rounded-2xl border p-3.5 sm:p-4 text-left transition-all duration-150 ${
                isSelected
                  ? "border-brass bg-brass/5 shadow-md"
                  : isFull
                  ? "border-line bg-paper/60"
                  : "border-line bg-white hover:border-ink/25 hover:shadow-sm"
              } ${interactive ? "cursor-pointer active:scale-[0.99]" : "cursor-not-allowed opacity-70"}`}
            >
              <span
                className={`shrink-0 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border font-mono text-xs font-bold tabular-nums transition-colors ${
                  isSelected
                    ? "border-brass bg-brass text-white"
                    : isFull
                    ? "border-line text-ink-soft/50"
                    : "border-ink/15 text-ink-soft group-hover/row:border-ink/30"
                }`}
              >
                {String(i + 1).padStart(2, "0")}
              </span>

              <span className="min-w-0 flex-1">
                <span className="block font-serif text-lg sm:text-xl font-semibold text-ink truncate">
                  {trip.name}
                </span>
                <span className="block font-mono text-[0.6rem] sm:text-[0.65rem] tracking-[0.15em] uppercase text-ink-soft mt-0.5 tabular-nums">
                  {trip.current_count} / {trip.quota} taken
                </span>
              </span>

              <span
                className={`shrink-0 font-mono text-[0.65rem] sm:text-xs font-bold uppercase tracking-wide tabular-nums ${
                  isFull ? "text-oxblood" : isSelected ? "text-brass" : "text-stamp"
                }`}
              >
                {isFull ? "Full" : `${trip.remaining} left`}
              </span>

              <span
                className={`shrink-0 flex h-5 w-5 items-center justify-center rounded-full border transition-all ${
                  isSelected ? "border-brass bg-brass text-white scale-100 opacity-100" : "border-ink/15 scale-75 opacity-0"
                }`}
                aria-hidden="true"
              >
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </span>
            </button>
          );
        })}
      </div>

      {/* Secondary: route map — an alternate, visual way to browse the same list.
          Pins are precise-pointer territory, so they're desktop/tablet-only;
          mobile still gets the map as a route preview, minus the tap targets. */}
      <p className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-ink-soft mb-3 text-center">
        <span className="sm:hidden">Route preview</span>
        <span className="hidden sm:inline">Or explore the route map</span>
      </p>
      <div className={`relative mx-auto w-full ${mapClassName}`}>
        <svg viewBox={`0 0 ${VW} ${VH}`} className="block w-full h-auto" aria-hidden="true">
          <defs>
            <filter id="province-glow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feFlood floodColor="#c9a84c" floodOpacity="0.55" result="color" />
              <feComposite in="color" in2="blur" operator="in" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <rect width={VW} height={VH} fill="#ffffff" />

          {/* Render non-glowing provinces first, then glowing on top */}
          {PROVINCE_PATHS.filter((p) => !glowingProvinces.has(p.name.toLowerCase())).map((p) => (
            <path
              key={p.id}
              d={p.d}
              fill="#ede8da"
              stroke="#b8ae9c"
              strokeWidth={0.6}
              strokeLinejoin="round"
              style={{ transition: "fill 0.35s ease" }}
            />
          ))}
          {PROVINCE_PATHS.filter((p) => glowingProvinces.has(p.name.toLowerCase())).map((p) => (
            <path
              key={p.id}
              d={p.d}
              fill="rgba(201,168,76,0.28)"
              stroke="#c9a84c"
              strokeWidth={1.1}
              strokeLinejoin="round"
              filter="url(#province-glow)"
              style={{ transition: "fill 0.35s ease" }}
            />
          ))}
        </svg>

        <div className="absolute inset-0">
          {[...groups.entries()].map(([key, { coord, trips: group }]) => {
            const isGroupOpen = openKey === key;
            const anySelected = group.some((t) => t.trip_id === selectedTrip);
            const allFull = group.every((t) => t.remaining === 0);
            const multi = group.length > 1;

            const pinColor = allFull ? "text-oxblood" : anySelected ? "text-brass" : "text-stamp";

            return (
              <div
                key={key}
                className="group/pin absolute -translate-x-1/2 -translate-y-full hidden sm:flex flex-col items-center"
                style={{ left: `${(coord[0] / VW) * 100}%`, top: `${(coord[1] / VH) * 100}%` }}
              >
                {multi ? (
                  <div
                    className={`mb-1.5 flex flex-col gap-0.5 rounded-lg border border-line bg-white shadow-md overflow-hidden transition-all duration-150 origin-bottom ${
                      isGroupOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
                    }`}
                  >
                    {group.map((trip) => {
                      const isFull = trip.remaining === 0;
                      const isSelected = selectedTrip === trip.trip_id;
                      const interactive = registrationOpen && !isFull;
                      return (
                        <button
                          key={trip.trip_id}
                          type="button"
                          disabled={!interactive}
                          onClick={() => {
                            if (interactive) { onSelect(trip.trip_id); setOpenKey(null); }
                          }}
                          className={`flex items-center justify-between gap-3 px-2.5 py-1.5 text-left font-mono text-[0.6rem] uppercase tracking-wide whitespace-nowrap transition-colors ${
                            isFull ? "cursor-not-allowed" : "cursor-pointer"
                          } ${
                            isSelected
                              ? "bg-brass/10 text-brass"
                              : isFull
                              ? "text-oxblood/60"
                              : "text-ink hover:bg-paper"
                          }`}
                        >
                          <span>{trip.name}</span>
                          <span className={`text-[0.55rem] font-bold ${isFull ? "text-oxblood/50" : "text-stamp"}`}>
                            {isFull ? "FULL" : `${trip.remaining} left`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  (() => {
                    const trip = group[0];
                    const isFull = trip.remaining === 0;
                    const isSelected = selectedTrip === trip.trip_id;
                    const labelColor =
                      isFull ? "text-oxblood border-oxblood/40"
                      : isSelected ? "text-brass border-brass"
                      : "text-stamp border-line";
                    return (
                      <span
                        className={`mb-1 rounded-md border bg-white px-1.5 py-0.5 font-mono text-[0.6rem] font-bold uppercase tracking-wide whitespace-nowrap shadow-sm transition-all duration-150 pointer-events-none ${labelColor} ${
                          isSelected ? "opacity-100 -translate-y-0.5 ring-1 ring-brass" : "opacity-0 group-hover/pin:opacity-100 group-hover/pin:-translate-y-0.5"
                        }`}
                      >
                        {trip.name}
                      </span>
                    );
                  })()
                )}

                <button
                  type="button"
                  aria-expanded={multi ? isGroupOpen : undefined}
                  aria-label={
                    multi
                      ? `${group.length} destinations here — tap to expand`
                      : (() => {
                          const t = group[0];
                          return t.remaining === 0 ? `${t.name} — full` : `${t.name} — ${t.remaining} seats left`;
                        })()
                  }
                  onClick={() => {
                    if (multi) {
                      setOpenKey(isGroupOpen ? null : key);
                    } else {
                      const trip = group[0];
                      if (registrationOpen && trip.remaining > 0) onSelect(trip.trip_id);
                    }
                  }}
                  className={`relative flex items-center justify-center touch-manipulation focus:outline-none [-webkit-tap-highlight-color:transparent] ${
                    multi || (registrationOpen && !allFull) ? "cursor-pointer" : "cursor-not-allowed"
                  }`}
                >
                  {/* Invisible touch-target buffer: the arrow marker itself is already
                      larger than the old dot, this just rounds it up to a comfortable
                      tap size and forgives a tap that lands just beside it. */}
                  <span className="absolute -inset-2.5 sm:-inset-2" aria-hidden="true" />
                  {/* Arrow/pin marker: the point touches the exact destination, the
                      body sits above it in open space so there's more to aim for
                      than a tiny dot right on top of the province. */}
                  <svg
                    viewBox="0 0 24 32"
                    className={`h-7 w-6 sm:h-9 sm:w-7 drop-shadow transition-transform duration-150 origin-bottom ${pinColor} ${
                      anySelected || isGroupOpen ? "scale-110" : "group-hover/pin:scale-105 active:scale-110"
                    }`}
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 8.5 10.6 18.9 11.14 19.42a1.25 1.25 0 0 0 1.72 0C13.4 30.9 24 20.5 24 12 24 5.373 18.627 0 12 0z" />
                    <circle cx="12" cy="12" r="4.5" fill="white" />
                  </svg>
                  {multi && (
                    <span className="absolute -top-1 -right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-ink text-white font-mono text-[0.5rem] font-bold leading-none border border-white">
                      {group.length}
                    </span>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
