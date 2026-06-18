// Map of Thailand with a pin at each destination's real geographic location.
// Pins are buttons (keyboard accessible); full or pre-open destinations are
// inert. Cities without known coordinates fall back to a chip row below the map
// so every destination stays selectable.

type MapCity = {
  city_id: string;
  name: string;
  quota: number;
  current_count: number;
  remaining: number;
};

type ThailandMapProps = {
  cities: MapCity[];
  selectedCity: string | null;
  onSelect: (cityId: string) => void;
  registrationOpen: boolean;
};

// Equirectangular projection tuned to Thailand's bounding box.
const LON0 = 97.0;
const LAT1 = 21.2;
const LAT0 = 5.2;
const SCALE = 22;
const XS = SCALE * 0.97;
const VW = (106.2 - LON0) * XS;
const VH = (LAT1 - LAT0) * SCALE;
const project = (lon: number, lat: number): [number, number] => [(lon - LON0) * XS, (LAT1 - lat) * SCALE];

// Coarse clockwise outline of the country (lon, lat).
const BORDER: [number, number][] = [
  [100.1, 20.45], [101.1, 19.6], [101.8, 18.3], [102.7, 17.88], [103.9, 18.25], [104.8, 17.4],
  [105.45, 16.5], [105.6, 15.3], [105.05, 14.55], [104.0, 14.4], [103.0, 14.35], [102.55, 13.6],
  [102.5, 12.25], [101.8, 12.55], [101.0, 12.65], [100.9, 12.93], [100.98, 13.35], [100.55, 13.55],
  [99.96, 12.57], [99.8, 11.8], [99.2, 10.5], [99.33, 9.14], [100.0, 8.43], [100.6, 7.2],
  [101.5, 6.6], [101.0, 6.45], [100.1, 6.55], [99.6, 7.5], [98.9, 8.1], [98.3, 7.9],
  [98.55, 9.0], [98.6, 9.95], [98.5, 11.5], [98.5, 13.0], [98.45, 14.0], [98.9, 15.3],
  [99.1, 16.9], [98.2, 18.5], [97.9, 19.3], [98.6, 20.0],
];

// Destination coordinates by lowercased name.
const COORDS: Record<string, [number, number]> = {
  bangkok: [100.52, 13.75],
  "chiang mai": [98.98, 18.79],
  phuket: [98.39, 7.88],
  pattaya: [100.88, 12.93],
  "chiang rai": [99.84, 19.91],
  nan: [100.77, 18.78],
  sukhothai: [99.82, 17.01],
  "nakhon ratchasima": [102.1, 14.97],
  "ubon ratchathani": [104.85, 15.24],
  "udon thani": [102.79, 17.41],
  "khon kaen": [102.83, 16.43],
  krabi: [98.9, 8.09],
  "surat thani": [99.33, 9.14],
  kanchanaburi: [99.53, 14.02],
  ayutthaya: [100.58, 14.35],
  "hua hin": [99.96, 12.57],
  loei: [101.72, 17.49],
  phetchabun: [101.16, 16.42],
};

// Catmull-Rom → cubic-bezier smoothing for a natural coastline.
const outlinePath = (() => {
  const q = BORDER.map(([lon, lat]) => project(lon, lat));
  const n = q.length;
  let d = `M ${q[0][0].toFixed(1)} ${q[0][1].toFixed(1)} `;
  for (let i = 0; i < n; i++) {
    const p0 = q[(i - 1 + n) % n];
    const p1 = q[i];
    const p2 = q[(i + 1) % n];
    const p3 = q[(i + 2) % n];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += `C ${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)} `;
  }
  return d + "Z";
})();

export function ThailandMap({ cities, selectedCity, onSelect, registrationOpen }: ThailandMapProps) {
  const pinned = cities
    .map((city) => ({ city, coord: COORDS[city.name.trim().toLowerCase()] }))
    .filter((entry): entry is { city: MapCity; coord: [number, number] } => Boolean(entry.coord));
  const unplaced = cities.filter((city) => !COORDS[city.name.trim().toLowerCase()]);

  return (
    <div>
      <div className="relative mx-auto w-full max-w-[280px]">
        <svg
          viewBox={`0 0 ${VW.toFixed(1)} ${VH.toFixed(1)}`}
          className="block w-full h-auto"
          aria-hidden="true"
        >
          <path d={outlinePath} fill="#eef1ee" stroke="#9fb0a6" strokeWidth={1.2} strokeLinejoin="round" />
        </svg>

        <div className="absolute inset-0">
          {pinned.map(({ city, coord }) => {
            const [px, py] = project(coord[0], coord[1]);
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
                style={{ left: `${(px / VW) * 100}%`, top: `${(py / VH) * 100}%` }}
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
