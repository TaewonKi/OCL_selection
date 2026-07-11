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
  const coords = trip.stops.map(resolveProvince).filter(Boolean) as [number, number][];
  if (coords.length === 0) return undefined;
  const cx = coords.reduce((s, [x]) => s + x, 0) / coords.length;
  const cy = coords.reduce((s, [, y]) => s + y, 0) / coords.length;
  return [cx, cy];
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

  const unplaced = trips.filter((trip) => !pinPosition(trip));

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

            const dotColor = allFull ? "bg-oxblood" : anySelected ? "bg-brass" : "bg-stamp";

            return (
              <div
                key={key}
                className="absolute -translate-x-1/2 -translate-y-full flex flex-col items-center"
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
                            isSelected
                              ? "bg-brass/10 text-brass"
                              : isFull
                              ? "text-oxblood/60 cursor-not-allowed"
                              : "text-ink hover:bg-paper cursor-pointer"
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
                        className={`mb-1 rounded-md border bg-white px-1.5 py-0.5 font-mono text-[0.6rem] font-bold uppercase tracking-wide whitespace-nowrap shadow-sm transition-all duration-150 ${labelColor} ${
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
                  className={`group/pin relative flex items-center justify-center focus:outline-none ${
                    multi || (registrationOpen && !allFull) ? "cursor-pointer" : "cursor-not-allowed"
                  }`}
                >
                  <span
                    className={`block h-3.5 w-3.5 -rotate-45 border-2 border-white shadow transition-transform duration-150 ${dotColor} ${
                      anySelected || isGroupOpen ? "scale-125" : "group-hover/pin:scale-110"
                    }`}
                    style={{ borderRadius: "50% 50% 50% 0" }}
                  />
                  {multi && (
                    <span className="absolute -top-1.5 -right-2 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-ink text-white font-mono text-[0.5rem] font-bold leading-none border border-white">
                      {group.length}
                    </span>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {unplaced.length > 0 && (
        <div className="mt-5">
          <p className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-ink-soft mb-2 text-center">
            More destinations
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {unplaced.map((trip) => {
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
                  className={`rounded-lg border px-3 py-1.5 font-mono text-[0.65rem] uppercase tracking-wide transition-all ${
                    isSelected
                      ? "border-brass bg-brass/10 text-brass"
                      : "border-line bg-white text-ink-soft hover:border-ink/30 hover:text-ink"
                  } ${!interactive ? "cursor-not-allowed opacity-60" : ""}`}
                >
                  {trip.name}
                  {isFull ? " · Full" : ` · ${trip.remaining}`}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
