/* Descent — the world as data. The ground is the loss surface; the traveller's
   position, pose and light are pure functions of page progress p, so the story
   scrubs both ways. docs/design/descent.md */

export const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
export const sat = (v: number) => clamp(v, 0, 1);
export const ss = (a: number, b: number, v: number) => { const t = sat((v - a) / (b - a)); return t * t * (3 - 2 * t); };
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/* seeded hash + value noise — every "random" thing in the world comes from here */
export const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
export function noise(x: number) {
  const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f);
  return lerp(hash(i), hash(i + 1), u) * 2 - 1;
}
export const fbm = (x: number, o = 4) => { let s = 0, a = 0.5, f = 1; for (let i = 0; i < o; i++) { s += a * noise(x * f + i * 17.3); f *= 2.03; a *= 0.5; } return s; };

/* ── the loss surface ─────────────────────────────────────────────
   summit → scree → ravine (overshoot) → the hollow (local minimum) → rim →
   plateau (vanishing gradient) → the edge (noise) → the lake (echoes) →
   the basin (global minimum) */
const T: [number, number][] = [
  [-40, 12], [-20, 14], [-8, 15.4], [-2.2, 16.3], [0, 17.4], [1.8, 16.2], [5, 14.2], [9, 12.4], [13, 10.9], [16, 9.4],
  [18.5, 7.2], [20, 5.8], [21.2, 5.4], [22.4, 5.9], [24, 7.6], [25.5, 8.8], [27, 9.0],
  [30, 8.2], [34, 6.6], [38, 5.0], [40.5, 4.45], [41.4, 4.35], [43, 4.4], [45, 4.75], [48, 5.65], [51, 6.6], [54, 7.2],
  [56, 7.25], [60, 7.2], [66, 7.23], [72, 7.2], [78, 7.18], [82, 7.15],
  [84, 6.9], [86.5, 5.6], [89.5, 3.8], [93, 2.4], [96, 1.5], [99, 1.0],
  [101, 0.92], [106, 0.9], [111, 0.92], [116, 0.9], [121, 0.88],
  [124, 0.55], [127, -0.4], [130, -1.4], [132.4, -1.9], [133.5, -2.0], [135, -1.8], [138, -0.8], [143, 1.2], [150, 3.6], [165, 6.5], [190, 8],
];
const TX = T.map((t) => t[0]);
/* Catmull-Rom through the control points, plus a little seeded grit */
function spline(x: number) {
  let i = 0;
  while (i < T.length - 2 && TX[i + 1] < x) i++;
  const p0 = T[Math.max(0, i - 1)], p1 = T[i], p2 = T[i + 1], p3 = T[Math.min(T.length - 1, i + 2)];
  const t = sat((x - p1[0]) / (p2[0] - p1[0]));
  const m1 = ((p2[1] - p0[1]) / (p2[0] - p0[0])) * (p2[0] - p1[0]);
  const m2 = ((p3[1] - p1[1]) / (p3[0] - p1[0])) * (p2[0] - p1[0]);
  const t2 = t * t, t3 = t2 * t;
  return (2 * t3 - 3 * t2 + 1) * p1[1] + (t3 - 2 * t2 + t) * m1 + (-2 * t3 + 3 * t2) * p2[1] + (t3 - t2) * m2;
}
const ROUGH = (x: number) => (x < 30 ? 0.12 : x < 54 ? 0.05 : x < 83 ? 0.02 : x < 100 ? 0.09 : x < 122 ? 0.0 : 0.04);
export const ground = (x: number) => spline(x) + fbm(x * 1.7) * ROUGH(x);
export const slope = (x: number) => (ground(x + 0.25) - ground(x - 0.25)) / 0.5;

export const LAKE = { x0: 100.5, x1: 122.5, y: 0.58 };
export const CAIRN = 133.9;

/* ── the journey ──────────────────────────────────────────────────── */
export type Mode = 'stand' | 'walk' | 'slide' | 'climb' | 'sit' | 'rise' | 'brace' | 'fall' | 'get' | 'kneel' | 'dissolve';
type Ease = 'lin' | 'in' | 'out' | 'io';
const EZ: Record<Ease, (t: number) => number> = {
  lin: (t) => t,
  in: (t) => t * t,
  out: (t) => 1 - (1 - t) * (1 - t),
  io: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
};
type Seg = { m: Mode; p0: number; p1: number; x0: number; x1: number; e: Ease };
const S = (m: Mode, p0: number, p1: number, x0: number, x1 = x0, e: Ease = 'lin'): Seg => ({ m, p0, p1, x0, x1, e });

export const JOURNEY: Seg[] = [
  S('stand', 0, 0.075, 0),
  S('walk', 0.075, 0.16, 0, 14, 'in'),
  S('slide', 0.16, 0.2, 14, 21.2, 'in'),
  S('slide', 0.2, 0.222, 21.2, 24.2, 'out'),
  S('slide', 0.222, 0.25, 24.2, 18.4, 'io'),
  S('slide', 0.25, 0.272, 18.4, 22.8, 'io'),
  S('slide', 0.272, 0.287, 22.8, 21.1, 'io'),
  S('stand', 0.287, 0.293, 21.1),
  S('climb', 0.293, 0.312, 21.1, 27, 'io'),
  S('walk', 0.312, 0.336, 27, 41.2, 'out'),
  S('sit', 0.336, 0.38, 41.2),
  S('rise', 0.38, 0.389, 41.2),
  S('climb', 0.389, 0.44, 41.2, 55, 'in'),
  S('walk', 0.44, 0.6, 55, 80, 'lin'),
  S('brace', 0.6, 0.652, 80, 83.2),
  S('fall', 0.652, 0.672, 83.2, 89.6, 'in'),
  S('get', 0.672, 0.687, 89.6),
  S('walk', 0.687, 0.72, 89.6, 99.5, 'lin'),
  S('walk', 0.72, 0.9, 99.5, 122.6, 'lin'),
  S('walk', 0.9, 0.935, 122.6, 132.7, 'out'),
  S('kneel', 0.935, 0.955, 132.7),
  S('sit', 0.955, 0.966, 132.7),
  S('dissolve', 0.966, 0.99, 132.7),
  S('dissolve', 0.99, 1.01, 132.7),
];

export type Traveller = {
  x: number; y: number; m: Mode; u: number; face: 1 | -1; speed: number;
  /** 0 dark … 1 blazing — the gradient, made visible */
  light: number; dissolve: number;
};

function segAt(p: number) {
  let i = 0;
  while (i < JOURNEY.length - 1 && JOURNEY[i + 1].p0 <= p) i++;
  return JOURNEY[i];
}
export function xAt(p: number) {
  const s = segAt(p);
  return lerp(s.x0, s.x1, EZ[s.e](sat((p - s.p0) / (s.p1 - s.p0))));
}

export function traveller(p: number): Traveller {
  const s = segAt(p), u = sat((p - s.p0) / (s.p1 - s.p0));
  const x = xAt(p);
  const dx = xAt(p + 0.0015) - xAt(p - 0.0015);
  const face: 1 | -1 = Math.abs(dx) > 1e-4 && dx < 0 ? -1 : 1;
  const speed = Math.abs(dx) / 0.003;
  /* light = how steep the ground falls ahead; beats override it */
  const g = Math.abs(slope(x + face * 0.8));
  let light = sat(0.22 + g * 0.55);
  if (s.m === 'sit' && p < 0.5) light = lerp(light, 0.08, ss(0, 0.5, u));
  if (s.m === 'rise') light = lerp(0.08, 0.35, u);
  if (p > 0.44 && p < 0.6) light = 0.07 + 0.05 * (1 - ss(0.44, 0.52, p)) + 0.03 * Math.max(0, noise(p * 300));
  if (s.m === 'brace') light = 0.12 + 0.2 * ss(0.62, 0.65, p);
  if (s.m === 'fall' || s.m === 'get') light = 0.85;
  if (p > 0.72 && p < 0.935) light = Math.max(light, 0.42);
  if (p >= 0.935) light = 0;
  return { x, y: ground(x), m: s.m, u, face, speed, light, dissolve: s.m === 'dissolve' ? (p > 0.99 ? 1 : u) : 0 };
}

/* the lantern: on the staff until it is set on the cairn */
export const lanternSet = (p: number) => ss(0.94, 0.952, p);

/* ── the Settled (the hollow) and the echoes (the lake) ──────────── */
export const SETTLED = [
  { x: 39.2, face: 1 as const, scale: 1, lean: 0.12 },
  { x: 43.6, face: -1 as const, scale: 0.96, lean: 0.2 },
  { x: 44.6, face: -1 as const, scale: 0.68, lean: 0.05 },
];
export const FIRE = 41.9;
/* the smallest one follows a few steps, then stops */
export function childX(p: number) {
  return lerp(44.6, 47.4, ss(0.392, 0.414, p));
}

/* echoes walk the shore the other way, repeating its exact steps */
export const ECHOES = [0, 1, 2].map((i) => ({ off: 7 + i * 3.1, alpha: 1 - i * 0.18 }));
export const echoAlive = (p: number) => ss(0.728, 0.745, p) * (1 - ss(0.842, 0.848, p));
export const SHATTER = 0.845;

/* ── beats and their lines ───────────────────────────────────────── */
export type Beat = { id: string; label: string; line: string; p0: number; p1: number };
export const BEATS: Beat[] = [
  { id: 'init', label: 'init', line: 'A point, somewhere high, with no idea where it was.', p0: 0, p1: 0.07 },
  { id: 'lean', label: 'the lean', line: 'Its light leaned one way. It followed the lean.', p0: 0.07, p1: 0.16 },
  { id: 'overshoot', label: 'overshoot', line: 'Too fast. It missed the bottom, twice.', p0: 0.16, p1: 0.3 },
  { id: 'hollow', label: 'local minimum', line: 'Others had stopped here. It was warm. It was almost enough.', p0: 0.3, p1: 0.38 },
  { id: 'momentum', label: 'momentum', line: 'It kept what speed it had, and climbed out.', p0: 0.38, p1: 0.44 },
  { id: 'plateau', label: 'plateau', line: 'Then the ground went flat, and the light went quiet.', p0: 0.44, p1: 0.6 },
  { id: 'noise', label: 'noise', line: "The storm didn't stop it. It shook it loose.", p0: 0.6, p1: 0.72 },
  { id: 'echoes', label: 'overfit', line: "It met copies of itself that only knew the way they'd come.", p0: 0.72, p1: 0.81 },
  { id: 'validation', label: 'validation', line: 'In the light, only what was true held.', p0: 0.81, p1: 0.9 },
  { id: 'converged', label: 'converged', line: 'At the lowest point, it set its light down with the others.', p0: 0.9, p1: 0.972 },
  { id: 'again', label: 'epoch 0', line: 'Far up, a new light woke. Every model starts lost.', p0: 0.972, p1: 1.01 },
];
export const beatAt = (p: number) => { let i = 0; while (i < BEATS.length - 1 && BEATS[i + 1].p0 <= p) i++; return i; };

/* ── weather ─────────────────────────────────────────────────────── */
export const fogAt = (p: number) => ss(0.45, 0.5, p) * (1 - ss(0.58, 0.63, p));
export const rainAt = (p: number) => ss(0.612, 0.635, p) * (1 - ss(0.69, 0.715, p));
export const windAt = (p: number) => 0.15 + ss(0.6, 0.63, p) * (1 - ss(0.69, 0.72, p)) * 1.4 + (p > 0.44 && p < 0.6 ? 0.12 : 0);
export const LIGHTNING = [0.628, 0.645, 0.664];

/* ── camera: follows the traveller with a lead; the ground sinks as you read ── */
export function camera(p: number) {
  const t = traveller(p);
  const lead = t.face * clamp(t.speed * 0.012, 0, 2.6);
  const x = t.x + lead + ss(0.966, 1, p) * 1.5;
  /* average the ground around the view so the camera never jitters on rocks */
  let y = 0;
  for (let i = -6; i <= 6; i++) y += ground(x + i * 0.9) * (i === 0 ? 2 : 1);
  y /= 14;
  y = lerp(y, t.y, 0.55);
  /* at the end the camera lifts toward the far summit and the new light */
  y += ss(0.968, 1, p) * 0.9;
  return { x, y };
}
