// Top-view airliner whose cabin holds one seat per place on the trip, filled to
// match how many students have registered. Decorative (aria-hidden) — the
// surrounding card carries the accessible seat count — and non-interactive,
// since seats aren't individually assigned. Units are SVG user units; the
// drawing scales to the container width.

type Variant = "available" | "selected" | "full";

const PER_ROW = 6;
const HALF = 3;
const SEAT = 9;
const SEAT_GAP = 3;
const AISLE = 8;
const SIDE_PAD = 10;
const NOSE = 48;
const TAIL = 44;
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
  const viewW = FUSE_W * 1.42;
  const viewH = fuseH + 6;
  const cx = viewW / 2;
  const fx0 = cx - FUSE_W / 2;
  const fx1 = cx + FUSE_W / 2;
  const blockLeft = cx - CABIN_W / 2;

  // Fuselage: long pointed nose, slender body, tapered tail cone.
  const fuselage = [
    `M ${fx0} ${NOSE}`,
    `C ${fx0} ${NOSE * 0.4} ${cx - FUSE_W * 0.05} ${NOSE * 0.03} ${cx} 0`,
    `C ${cx + FUSE_W * 0.05} ${NOSE * 0.03} ${fx1} ${NOSE * 0.4} ${fx1} ${NOSE}`,
    `L ${fx1} ${bodyBot}`,
    `C ${fx1} ${bodyBot + TAIL * 0.38} ${cx + FUSE_W * 0.075} ${fuseH} ${cx} ${fuseH}`,
    `C ${cx - FUSE_W * 0.075} ${fuseH} ${fx0} ${bodyBot + TAIL * 0.38} ${fx0} ${bodyBot}`,
    "Z",
  ].join(" ");

  // Main wings, sharply swept back to the tips at the view edges.
  const wRF = NOSE + cabinH * 0.15;
  const wRB = wRF + cabinH * 0.22;
  const wTF = wRF + cabinH * 0.48;
  const wTB = wTF + cabinH * 0.05;
  const tip = 5;
  const wingL = `${fx0 + 2},${wRF} ${tip},${wTF} ${tip},${wTB} ${fx0 + 2},${wRB}`;
  const wingR = `${fx1 - 2},${wRF} ${viewW - tip},${wTF} ${viewW - tip},${wTB} ${fx1 - 2},${wRB}`;

  // Engine nacelles slung under the wings.
  const engW = 5.5;
  const engH = cabinH * 0.2;
  const engY = wRF + cabinH * 0.18;
  const engLx = cx - FUSE_W * 0.74;
  const engRx = cx + FUSE_W * 0.74;

  // Horizontal tail stabilizers near the tail cone.
  const hsRF = bodyBot - cabinH * 0.05;
  const hsRB = hsRF + cabinH * 0.12;
  const hsTF = hsRF + cabinH * 0.1;
  const hsTB = hsTF + cabinH * 0.035;
  const he = FUSE_W * 0.84;
  const stabL = `${fx0 + 2},${hsRF} ${cx - he},${hsTF} ${cx - he},${hsTB} ${fx0 + 2},${hsRB}`;
  const stabR = `${fx1 - 2},${hsRF} ${cx + he},${hsTF} ${cx + he},${hsTB} ${fx1 - 2},${hsRB}`;

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
      <g fill="#f1ece0" stroke="#d4ccb6" strokeWidth={1.4} strokeLinejoin="round">
        <polygon points={wingL} />
        <polygon points={wingR} />
        <polygon points={stabL} />
        <polygon points={stabR} />
      </g>
      <rect x={engLx - engW / 2} y={engY} width={engW} height={engH} rx={2.5} fill="#e7e0cf" stroke="#cfc6ad" strokeWidth={1} />
      <rect x={engRx - engW / 2} y={engY} width={engW} height={engH} rx={2.5} fill="#e7e0cf" stroke="#cfc6ad" strokeWidth={1} />
      <path d={fuselage} fill="#fbfaf6" stroke="#cfc6ad" strokeWidth={1.4} strokeLinejoin="round" />
      {seats.map((s, i) => (
        <rect
          key={i}
          x={s.x}
          y={s.y}
          width={SEAT}
          height={SEAT}
          rx={2.5}
          fill={s.occupied ? OCCUPIED_FILL : "#ffffff"}
          stroke={s.occupied ? "none" : FREE_STROKE[variant]}
          strokeWidth={1.1}
        />
      ))}
    </svg>
  );
}
