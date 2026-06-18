// Top-view cabin diagram: one seat per place on the trip, filled to match how
// many students have registered. Decorative (aria-hidden) — the card carries the
// accessible seat count — and non-interactive, since seats aren't individually
// assigned. Geometry is in SVG user units and scales to the container width.

type Variant = "available" | "selected" | "full";

const PER_ROW = 6;
const HALF = 3;
const SEAT = 11;
const SEAT_GAP = 4;
const AISLE = 10;
const SIDE_PAD = 13;
const NOSE = 32;
const TAIL = 26;
const COL = SEAT + SEAT_GAP;
const BLOCK_W = HALF * SEAT + (HALF - 1) * SEAT_GAP;
const CABIN_W = 2 * BLOCK_W + AISLE;
const FUSE_W = CABIN_W + 2 * SIDE_PAD;

const OCCUPIED_FILL = "#0e2a4761"; // muted ink — a taken seat
const FREE_STROKE: Record<Variant, string> = {
  available: "#15736b", // teal — open seat
  selected: "#b0832a", // brass — open seat on the chosen destination
  full: "#0e2a4733",
};

type AirplaneSeatMapProps = {
  total: number;
  taken: number;
  variant?: Variant;
  className?: string;
};

export function AirplaneSeatMap({ total, taken, variant = "available", className }: AirplaneSeatMapProps) {
  const safeTotal = Math.max(0, Math.floor(total) || 0);
  const safeTaken = Math.min(safeTotal, Math.max(0, Math.floor(taken) || 0));

  const rows = Math.max(1, Math.ceil(safeTotal / PER_ROW));
  const cabinH = rows * COL - SEAT_GAP;
  const bodyBot = NOSE + cabinH;
  const fuseH = bodyBot + TAIL;
  const viewW = FUSE_W * 1.7;
  const viewH = fuseH + 4;
  const cx = viewW / 2;
  const fx0 = cx - FUSE_W / 2;
  const fx1 = cx + FUSE_W / 2;
  const blockLeft = cx - CABIN_W / 2;

  // Fuselage: pointed nose, parallel body, rounded tail cone.
  const fuselage = [
    `M ${fx0} ${NOSE}`,
    `C ${fx0} ${NOSE * 0.28} ${cx - FUSE_W * 0.07} 0 ${cx} 0`,
    `C ${cx + FUSE_W * 0.07} 0 ${fx1} ${NOSE * 0.28} ${fx1} ${NOSE}`,
    `L ${fx1} ${bodyBot}`,
    `C ${fx1} ${bodyBot + TAIL * 0.6} ${cx + FUSE_W * 0.16} ${fuseH} ${cx} ${fuseH}`,
    `C ${cx - FUSE_W * 0.16} ${fuseH} ${fx0} ${bodyBot + TAIL * 0.6} ${fx0} ${bodyBot}`,
    "Z",
  ].join(" ");

  // Main wings, swept back to the tips at the view edges.
  const wRF = NOSE + cabinH * 0.14;
  const wRB = wRF + cabinH * 0.3;
  const wTF = wRF + cabinH * 0.3;
  const wTB = wTF + cabinH * 0.085;
  const wingL = `${fx0},${wRF} 0,${wTF} 0,${wTB} ${fx0},${wRB}`;
  const wingR = `${fx1},${wRF} ${viewW},${wTF} ${viewW},${wTB} ${fx1},${wRB}`;

  // Horizontal tail stabilizers near the tail cone.
  const sEdge = FUSE_W * 0.6;
  const tRF = NOSE + cabinH * 0.88;
  const tRB = tRF + cabinH * 0.15;
  const tTF = tRF + cabinH * 0.12;
  const tTB = tTF + cabinH * 0.045;
  const stabL = `${fx0},${tRF} ${cx - sEdge},${tTF} ${cx - sEdge},${tTB} ${fx0},${tRB}`;
  const stabR = `${fx1},${tRF} ${cx + sEdge},${tTF} ${cx + sEdge},${tTB} ${fx1},${tRB}`;

  const seats = Array.from({ length: safeTotal }, (_, i) => {
    const r = Math.floor(i / PER_ROW);
    const c = i % PER_ROW;
    const x = c < HALF ? blockLeft + c * COL : blockLeft + BLOCK_W + AISLE + (c - HALF) * COL;
    const y = NOSE + r * COL;
    return { x, y, occupied: i < safeTaken };
  });

  return (
    <svg
      viewBox={`0 0 ${viewW} ${viewH}`}
      className={className}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
    >
      <g fill="#f3efe4" stroke="#d4ccb6" strokeWidth={1.5} strokeLinejoin="round">
        <polygon points={wingL} />
        <polygon points={wingR} />
        <polygon points={stabL} />
        <polygon points={stabR} />
      </g>
      <path d={fuselage} fill="#fbfaf6" stroke="#cfc6ad" strokeWidth={1.5} strokeLinejoin="round" />
      {seats.map((s, i) => (
        <rect
          key={i}
          x={s.x}
          y={s.y}
          width={SEAT}
          height={SEAT}
          rx={3}
          fill={s.occupied ? OCCUPIED_FILL : "#ffffff"}
          stroke={s.occupied ? "none" : FREE_STROKE[variant]}
          strokeWidth={1.3}
        />
      ))}
    </svg>
  );
}
