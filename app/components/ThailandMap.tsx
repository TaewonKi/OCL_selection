// Map of Thailand with a pin at each destination's real geographic location.
// Province boundaries are pre-projected from real GeoJSON (public/th.json).
// Pins are buttons (keyboard accessible); full or pre-open destinations are
// inert. Cities without known coordinates fall back to a chip row below the map.

import { PROVINCE_PATHS, VW, VH } from "./thailand-paths";

type MapCity = {
  city_id: string;
  name: string;
  quota: number;
  current_count: number;
  remaining: number;
  pin_province?: string | null;
};

type ThailandMapProps = {
  cities: MapCity[];
  selectedCity: string | null;
  onSelect: (cityId: string) => void;
  registrationOpen: boolean;
  mapClassName?: string;
};

// Maps each destination name (lowercased) to its province name in th.json.
// Most match directly; exceptions are listed explicitly.
const CITY_TO_PROVINCE: Record<string, string> = {
  bangkok:              "Bangkok Metropolis",
  pattaya:              "Phatthaya",
  ayutthaya:            "Phra Nakhon Si Ayutthaya",
  "hua hin":            "Prachuap Khiri Khan",
};

// Build a centroid lookup keyed by lowercased province name.
const provinceCentroid = Object.fromEntries(
  PROVINCE_PATHS.map((p) => [p.name.toLowerCase(), [p.cx, p.cy] as [number, number]])
);

function pinPosition(city: MapCity): [number, number] | undefined {
  const province = city.pin_province ?? city.name;
  const key = province.trim().toLowerCase();
  const resolved = (CITY_TO_PROVINCE[key] ?? province).toLowerCase();
  return provinceCentroid[resolved];
}

export function ThailandMap({ cities, selectedCity, onSelect, registrationOpen, mapClassName = "max-w-[280px]" }: ThailandMapProps) {
  const pinned = cities
    .map((city) => ({ city, coord: pinPosition(city) }))
    .filter((entry): entry is { city: MapCity; coord: [number, number] } => Boolean(entry.coord));
  const unplaced = cities.filter((city) => !pinPosition(city));

  return (
    <div>
      <div className={`relative mx-auto w-full ${mapClassName}`}>
        <svg
          viewBox={`0 0 ${VW} ${VH}`}
          className="block w-full h-auto"
          aria-hidden="true"
        >
          {/* Ocean */}
          <rect width={VW} height={VH} fill="#ffffff" />
          {/* Provinces — fill + thin internal borders */}
          {PROVINCE_PATHS.map((p) => (
            <path key={p.id} d={p.d} fill="#ede8da" stroke="#b8ae9c" strokeWidth={0.6} strokeLinejoin="round" />
          ))}
        </svg>

        <div className="absolute inset-0">
          {pinned.map(({ city, coord }) => {
            const [px, py] = coord;
            const isFull = city.remaining === 0;
            const isSelected = selectedCity === city.city_id;
            const interactive = registrationOpen && !isFull;
            const state = isFull ? "full" : isSelected ? "selected" : "available";

            const labelColor =
              state === "full"
                ? "text-oxblood border-oxblood/40"
                : state === "selected"
                ? "text-brass border-brass"
                : "text-stamp border-line";
            const dotColor = state === "full" ? "bg-oxblood" : state === "selected" ? "bg-brass" : "bg-stamp";

            return (
              <button
                key={city.city_id}
                type="button"
                onClick={() => interactive && onSelect(city.city_id)}
                disabled={!interactive}
                aria-pressed={isSelected}
                aria-label={
                  isFull
                    ? `${city.name} — full`
                    : `${city.name} — ${city.remaining} seats left${interactive ? ", select" : ""}`
                }
                className={`absolute flex -translate-x-1/2 -translate-y-full flex-col items-center focus:outline-none ${
                  interactive ? "cursor-pointer" : "cursor-not-allowed"
                } ${!registrationOpen ? "opacity-60" : ""}`}
                style={{ left: `${(coord[0] / VW) * 100}%`, top: `${(coord[1] / VH) * 100}%` }}
              >
                <span
                  className={`mb-1 rounded-md border bg-white px-1.5 py-0.5 font-mono text-[0.6rem] font-bold uppercase tracking-wide whitespace-nowrap shadow-sm transition-transform ${labelColor} ${
                    interactive ? "group-hover:-translate-y-0.5" : ""
                  } ${isSelected ? "ring-1 ring-brass" : ""}`}
                >
                  {city.name}
                </span>
                <span
                  className={`block h-3.5 w-3.5 -rotate-45 border-2 border-white shadow ${dotColor} ${
                    isSelected ? "scale-125" : ""
                  }`}
                  style={{ borderRadius: "50% 50% 50% 0" }}
                />
              </button>
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
            {unplaced.map((city) => {
              const isFull = city.remaining === 0;
              const isSelected = selectedCity === city.city_id;
              const interactive = registrationOpen && !isFull;
              return (
                <button
                  key={city.city_id}
                  type="button"
                  onClick={() => interactive && onSelect(city.city_id)}
                  disabled={!interactive}
                  aria-pressed={isSelected}
                  className={`rounded-lg border px-3 py-1.5 font-mono text-[0.65rem] uppercase tracking-wide transition-all ${
                    isSelected
                      ? "border-brass bg-brass/10 text-brass"
                      : "border-line bg-white text-ink-soft hover:border-ink/30 hover:text-ink"
                  } ${!interactive ? "cursor-not-allowed opacity-60" : ""}`}
                >
                  {city.name}
                  {isFull ? " · Full" : ` · ${city.remaining}`}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
