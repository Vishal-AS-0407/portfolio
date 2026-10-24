/* The cast: one skeleton, many skins.
   A pose is 11 angles (radians):
     [spine, neck, shL, elL, shR, elR, hipL, knL, hipR, knR, lean]
   L is the near side (drawn last, holds the weapon). Spine/neck tilt forward
   from vertical; shoulders/hips swing forward from hanging down; elbows bend
   the forearm forward/up; knees bend the shin back; lean tips the whole body
   about the hip (±1.5 ≈ lying down). `face` (+1 / −1) mirrors everything.
   Units are body heights. docs/design/inheritance-film.md §4 */

export type Pose = number[];
export type Pt = { x: number; y: number };
export type Joints = {
  hip: Pt; chest: Pt; neck: Pt; head: Pt; shoulder: Pt;
  elbowL: Pt; handL: Pt; elbowR: Pt; handR: Pt;
  kneeL: Pt; footL: Pt; kneeR: Pt; footR: Pt;
};

export const B = { torso: 0.31, neck: 0.05, headR: 0.068, ua: 0.17, fa: 0.16, th: 0.245, sh: 0.245 };

/* key poses — every strike is wind-up → active → overshoot → recovery */
export const P = {
  stand:      [0.02, 0.00, 0.08, 0.15, -0.06, 0.12, 0.03, 0.05, -0.03, 0.04, 0],
  tired:      [0.28, 0.35, 0.05, 0.10, 0.00, 0.10, 0.05, 0.12, -0.08, 0.10, 0],
  hammerUp:   [0.12, 0.15, 2.70, 0.70, 0.90, 0.80, 0.25, 0.20, -0.20, 0.10, 0],
  hammerDn:   [0.40, 0.30, 1.00, 0.15, 0.80, 0.90, 0.28, 0.32, -0.22, 0.22, 0],
  holdUp:     [-0.05, -0.30, 1.90, 0.90, 0.40, 1.20, 0.10, 0.08, -0.10, 0.06, 0],
  reach:      [0.25, 0.00, 1.45, 0.10, 0.70, 0.40, 0.45, 0.25, -0.30, 0.10, 0],
  refuse:     [-0.14, 0.05, -0.70, 1.30, 1.30, 0.40, -0.10, 0.10, 0.25, 0.15, 0],
  shoveWind:  [0.10, 0.05, 0.30, 2.20, 0.20, 2.30, 0.50, 0.60, -0.25, 0.35, 0],
  shove:      [0.35, 0.05, 1.50, 0.05, 1.45, 0.10, 0.70, 0.40, -0.55, 0.10, 0],
  stagger:    [-0.35, 0.30, -0.50, 0.60, -0.30, 0.80, 0.40, 0.50, -0.10, 0.20, 0],
  knee:       [0.35, 0.20, 0.20, 0.40, 0.60, 0.50, 1.40, 1.50, -0.10, 1.70, 0],
  grab:       [-0.05, 0.00, -0.40, 1.60, 1.20, 0.30, 0.20, 0.20, -0.20, 0.10, 0],
  triumph:    [-0.10, -0.25, 2.90, 0.20, 0.30, 0.30, 0.30, 0.10, -0.30, 0.10, 0],
  watch:      [0.02, -0.15, 1.90, 0.30, 0.20, 1.00, 0.03, 0.05, -0.03, 0.04, 0],
  flinch:     [-0.25, 0.30, 2.40, 1.60, 2.20, 1.70, 0.10, 0.30, -0.20, 0.30, -0.05],
  guard:      [0.14, -0.06, 0.90, 1.20, 0.50, 1.90, 0.38, 0.35, -0.30, 0.30, 0],
  windup:     [-0.22, -0.10, 3.00, 0.90, 1.20, 0.50, 0.20, 0.25, -0.40, 0.20, 0],
  slash:      [0.50, 0.10, 0.55, 0.05, -0.50, 0.60, 0.85, 0.65, -0.60, 0.15, 0],
  blockHigh:  [-0.05, 0.10, 2.50, 1.20, 2.60, 1.10, 0.30, 0.45, -0.35, 0.40, 0],
  pushOff:    [0.30, 0.00, 1.40, 0.30, 1.30, 0.40, 0.60, 0.35, -0.45, 0.10, 0],
  thrustWind: [-0.10, 0.00, -0.85, 1.85, 1.30, 0.30, 0.15, 0.45, -0.50, 0.35, 0],
  thrust:     [0.42, -0.05, 1.55, 0.00, -0.60, 0.40, 1.00, 0.75, -0.75, 0.05, 0],
  dodge:      [-0.35, 0.15, 0.60, 1.20, 0.30, 1.30, -0.10, 0.30, -0.45, 0.40, -0.08],
  stumble:    [0.70, -0.20, 1.20, 0.30, 1.60, 0.20, 0.90, 1.00, -0.50, 0.50, 0],
  struck:     [-0.55, 0.50, 1.50, 0.30, 1.80, 0.40, 0.45, 0.50, -0.15, 0.60, -0.15],
  fallen:     [0.00, 0.25, 0.30, 0.30, -0.40, 0.50, 0.15, 0.30, -0.10, 0.40, -1.50],
  fallenF:    [0.00, -0.20, 2.60, 0.20, 2.90, 0.40, 0.10, 0.20, -0.20, 0.30, 1.50],
  pickUp:     [1.25, -0.40, 0.30, 0.10, 0.50, 0.50, 0.60, 1.00, 0.20, 0.90, 0],
  kneel:      [0.30, 0.35, 0.25, 0.40, 0.15, 0.40, 1.45, 1.55, 0.05, 1.60, 0],
  kneelHead:  [0.45, 0.80, 0.10, 0.20, 0.05, 0.20, 1.45, 1.55, 0.05, 1.60, 0],
  weldLow:    [0.50, 0.30, 0.90, 0.60, 0.80, 0.70, 1.45, 1.55, 0.05, 1.60, 0],
  weldMid:    [0.20, 0.10, 1.30, 0.50, 1.10, 0.70, 0.30, 0.30, -0.20, 0.20, 0],
  weldHigh:   [-0.10, -0.40, 2.30, 0.40, 2.00, 0.60, 0.05, 0.05, -0.05, 0.05, 0],
  clutch:     [0.35, 0.40, 0.50, 2.00, 0.20, 0.30, 0.15, 0.30, -0.10, 0.25, 0],
  clutch2:    [0.55, 0.55, 0.45, 2.10, 0.10, 0.40, 0.25, 0.50, -0.15, 0.45, 0],
  pull:       [0.15, 0.25, 1.10, 0.70, 0.40, 0.80, 0.10, 0.10, -0.10, 0.08, 0],
  offerUp:    [0.05, -0.25, 1.75, 0.25, 0.20, 0.30, 0.35, 0.20, -0.25, 0.10, 0],
  sinkKneel:  [0.55, 0.60, 0.20, 0.20, 0.10, 0.20, 1.45, 1.55, 0.05, 1.60, 0],
  reachUp:    [-0.05, -0.60, 2.20, 0.35, 0.30, 0.40, 1.45, 1.55, 0.05, 1.60, 0],
  /* machine */
  slump:      [0.55, 0.80, 0.25, 0.20, 0.15, 0.25, 1.45, 0.70, 1.35, 0.90, -0.25],
  rise:       [0.60, 0.30, 0.50, 0.50, 0.40, 0.60, 1.20, 1.90, 0.90, 1.70, 0],
  tallM:      [-0.03, -0.05, 0.12, 0.20, -0.08, 0.20, 0.05, 0.06, -0.05, 0.06, 0],
  lookDown:   [0.15, 0.60, 0.15, 0.30, -0.05, 0.25, 0.05, 0.08, -0.05, 0.06, 0],
  regard:     [0.05, 0.25, 1.00, 1.20, -0.05, 0.25, 0.05, 0.06, -0.05, 0.06, 0],
  lookUp:     [-0.05, -0.60, 0.15, 0.30, -0.05, 0.25, 0.05, 0.06, -0.05, 0.06, 0],
  catch:      [-0.08, -0.55, 0.15, 0.20, 2.70, 0.20, 0.05, 0.06, -0.05, 0.06, 0],
  holdKite:   [0.05, 0.10, 0.10, 0.20, 1.50, 1.00, 0.05, 0.06, -0.05, 0.06, 0],
} satisfies Record<string, Pose>;
export type PoseName = keyof typeof P;

/** walk / run cycle at phase φ */
export function gait(phi: number, run = 0): Pose {
  const a = 0.42 + run * 0.32;
  const s = Math.sin(phi), c = Math.cos(phi);
  return [
    0.06 + run * 0.18, -0.02,
    -0.38 * s * (1 + run * 0.6), 0.35 + run * 1.0,
    0.38 * s * (1 + run * 0.6), 0.35 + run * 1.0,
    a * s, 0.12 + (0.65 + run * 0.6) * Math.max(0, c),
    -a * s, 0.12 + (0.65 + run * 0.6) * Math.max(0, -c),
    0,
  ];
}

export const lerpPose = (a: Pose, b: Pose, t: number) => a.map((v, i) => v + (b[i] - v) * t);

/** forward kinematics with the hip at (0,0), y up */
export function fk(pose: Pose, face: number): Joints {
  const [sp, nk, shL, elL, shR, elR, hL, kL, hR, kR, lean] = pose;
  const up = (a: number, l: number, o: Pt): Pt => ({ x: o.x + Math.sin(a) * face * l, y: o.y + Math.cos(a) * l });
  const dn = (a: number, l: number, o: Pt): Pt => ({ x: o.x + Math.sin(a) * face * l, y: o.y - Math.cos(a) * l });
  const hip = { x: 0, y: 0 };
  const sA = sp + lean;
  const shoulder = up(sA, B.torso * 0.9, hip);
  const chest = up(sA, B.torso * 0.66, hip);
  const neck = up(sA, B.torso, hip);
  const head = up(sA + nk, B.neck + B.headR, neck);
  const elbowL = dn(shL + lean, B.ua, shoulder);
  const handL = dn(shL + elL + lean, B.fa, elbowL);
  const elbowR = dn(shR + lean, B.ua, shoulder);
  const handR = dn(shR + elR + lean, B.fa, elbowR);
  const kneeL = dn(hL + lean, B.th, hip);
  const footL = dn(hL - kL + lean, B.sh, kneeL);
  const kneeR = dn(hR + lean, B.th, hip);
  const footR = dn(hR - kR + lean, B.sh, kneeR);
  return { hip, chest, neck, head, shoulder, elbowL, handL, elbowR, handR, kneeL, footL, kneeR, footR };
}

/** lift so the lowest point touches y = 0 */
export function ground(j: Joints) {
  let min = Infinity;
  for (const k in j) {
    const p = j[k as keyof Joints];
    const r = k === 'head' ? B.headR : k.startsWith('foot') ? 0.012 : 0.03;
    min = Math.min(min, p.y - r);
  }
  return -min;
}

/** points along the bones, for coming apart */
export function bonePoints(j: Joints, n: number): Pt[] {
  const bones: [keyof Joints, keyof Joints][] = [
    ['hip', 'neck'], ['neck', 'head'], ['shoulder', 'elbowL'], ['elbowL', 'handL'], ['shoulder', 'elbowR'], ['elbowR', 'handR'],
    ['hip', 'kneeL'], ['kneeL', 'footL'], ['hip', 'kneeR'], ['kneeR', 'footR'], ['hip', 'neck'], ['head', 'head'], ['chest', 'shoulder'],
  ];
  const out: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const [a, b] = bones[i % bones.length];
    const t = (i * 0.618) % 1;
    const w = ((i * 0.377) % 1 - 0.5) * 0.08;
    out.push({ x: j[a].x + (j[b].x - j[a].x) * t + w, y: j[a].y + (j[b].y - j[a].y) * t + w * 0.5 });
  }
  return out;
}

/* ── skins ── */
type Ctx = CanvasRenderingContext2D;
type S = [number, number];
const TAU = Math.PI * 2;

export type Look = 'smith' | 'rival' | 'child' | 'soldier' | 'prime' | 'drone';
export type Weapon = 'hammer' | 'blade' | 'spear' | 'banner' | null;
export type Skin = {
  look: Look;
  /** near-side and far-side ink */
  ink: string; back: string;
  weapon: Weapon;
  /** weapon angle off the forearm, radians, + tips it up */
  grip: number;
  helmet: boolean;
  t: number;
  /** machine: the heart's light running along its seams 0..1, eye 0..1 */
  seam: number; eye: number; seamCol: string; eyeCol: string;
  /** machine assembly: which parts exist (0..1 per part) */
  build: number;
  /** hot blade glow 0..1 */
  heat: number; heatCol: string;
};

function cap(x: Ctx, a: S, b: S, ra: number, rb: number) {
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1e-6;
  const nx = -dy / L, ny = dx / L;
  x.beginPath();
  x.moveTo(a[0] + nx * ra, a[1] + ny * ra); x.lineTo(b[0] + nx * rb, b[1] + ny * rb);
  x.lineTo(b[0] - nx * rb, b[1] - ny * rb); x.lineTo(a[0] - nx * ra, a[1] - ny * ra);
  x.closePath(); x.fill();
  x.beginPath(); x.arc(a[0], a[1], ra, 0, TAU); x.fill();
  x.beginPath(); x.arc(b[0], b[1], rb, 0, TAU); x.fill();
}
function poly(x: Ctx, pts: S[]) {
  x.beginPath(); x.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) x.lineTo(pts[i][0], pts[i][1]);
  x.closePath(); x.fill();
}
function dot(x: Ctx, p: S, r: number) { x.beginPath(); x.arc(p[0], p[1], r, 0, TAU); x.fill(); }
const add = (a: S, b: S, k = 1): S => [a[0] + b[0] * k, a[1] + b[1] * k];
const sub = (a: S, b: S): S => [a[0] - b[0], a[1] - b[1]];
const nrm = (v: S): S => { const l = Math.hypot(v[0], v[1]) || 1e-6; return [v[0] / l, v[1] / l]; };
const rot = (v: S, a: number): S => [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a)];
const lp = (a: S, b: S, t: number): S => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

/** a cloth ribbon: scarf, ponytail, banner tail — trails downwind, flutters */
function ribbon(x: Ctx, base: S, U: number, n: number, seg: number, w0: number, w1: number, wind: number, t: number, droop: number) {
  const top: S[] = [], bot: S[] = [];
  let p = base;
  for (let i = 0; i <= n; i++) {
    const k = i / n;
    const fl = Math.sin(t * 6.2 - i * 0.95) * 0.022 * k + Math.sin(t * 3.1 - i * 0.5) * 0.012 * k;
    if (i > 0) p = add(p, [wind * seg * U, (droop * seg + fl) * U]);
    const w = (w0 + (w1 - w0) * k) * U * 0.5;
    top.push([p[0], p[1] - w]); bot.push([p[0], p[1] + w]);
  }
  poly(x, [...top, ...bot.reverse()]);
}

/** draws one figure; returns the weapon tip in screen space (for smears) */
export function drawFigure(x: Ctx, j: Joints, M: (q: Pt) => S, U: number, face: number, k: Skin): S | null {
  const P2 = (n: keyof Joints) => M(j[n]);
  if (k.look === 'prime' || k.look === 'drone') return drawMachine(x, j, P2, U, face, k);
  const big = k.look === 'smith' ? 1.22 : k.look === 'child' ? 0.85 : k.look === 'soldier' ? 0.95 : 1;
  const hip = P2('hip'), nk = P2('neck'), hd = P2('head');
  const axis = sub(nk, hip), L = Math.hypot(axis[0], axis[1]) || 1;
  const u: S = [axis[0] / L, axis[1] / L];
  /* front is +x for face +1 in screen space */
  const front: S = [-u[1] * face, u[0] * face];
  const at = (t: number, off: number): S => add(add(hip, u, L * t), front, off * U);

  /* far side */
  x.fillStyle = k.back;
  cap(x, P2('shoulder'), P2('elbowR'), 0.03 * U * big, 0.026 * U * big);
  cap(x, P2('elbowR'), P2('handR'), 0.026 * U * big, 0.02 * U * big);
  cap(x, hip, P2('kneeR'), 0.043 * U * big, 0.032 * U * big);
  cap(x, P2('kneeR'), P2('footR'), 0.032 * U * big, 0.021 * U * big);
  foot(x, P2('footR'), U * big, face);

  x.fillStyle = k.ink;
  /* scarf / ponytail trail downwind, behind the body */
  const wind = -1;
  if (k.look === 'smith') ribbon(x, at(0.96, -0.02), U, 7, 0.065, 0.045, 0.012, wind, k.t, 0.12);

  /* torso: hips, waist, chest, shoulders */
  const W = (v: number) => v * big;
  const F: [number, number][] = [[0, 0.055], [0.35, 0.05], [0.7, 0.072], [0.92, 0.05], [1, 0.024]];
  const Bk: [number, number][] = [[1, 0.024], [0.92, 0.062], [0.7, 0.056], [0.35, 0.046], [0, 0.062]];
  poly(x, [...F.map(([t, o]) => at(t, W(o))), ...Bk.map(([t, o]) => at(t, -W(o)))]);

  /* clothing: an apron for the smith, a tunic hem for everyone else */
  const kn = P2('kneeL'), kf = P2('kneeR');
  const fwdK = (kn[0] - hip[0]) * face > (kf[0] - hip[0]) * face ? kn : kf;
  const bakK = fwdK === kn ? kf : kn;
  if (k.look === 'smith') {
    poly(x, [at(0.78, W(0.08)), at(0.3, W(0.065)), add(lp(hip, fwdK, 1.02), front, 0.035 * U), lp(hip, fwdK, 0.5), at(0.3, -W(0.02))]);
  } else {
    const hemF = add(lp(hip, fwdK, k.look === 'child' ? 0.75 : 0.55), front, 0.03 * U);
    const hemB = add(lp(hip, bakK, k.look === 'child' ? 0.75 : 0.55), front, -0.03 * U);
    poly(x, [at(0.32, W(0.055)), hemF, hemB, at(0.32, -W(0.05))]);
  }

  /* head in profile: skull, jaw, nose */
  cap(x, nk, hd, 0.026 * U * big, 0.022 * U * big);
  const hu = nrm(sub(hd, nk));
  const hf: S = [-hu[1] * face, hu[0] * face];
  const ht = (a: number, b: number): S => [hd[0] + hf[0] * a * r + hu[0] * b * r, hd[1] + hf[1] * a * r + hu[1] * b * r];
  const r = B.headR * U * (k.look === 'child' ? 1.25 : 1);
  dot(x, hd, r);
  dot(x, ht(0.32, -0.5), r * 0.62);
  poly(x, [ht(0.82, 0.08), ht(1.24, -0.16), ht(0.84, -0.34)]);
  if (k.look === 'smith') {
    poly(x, [ht(0.7, -0.48), ht(0.98, -0.78), ht(0.58, -1.25), ht(-0.08, -0.7)]);
    dot(x, ht(-0.16, 0.12), r * 1.02);
  } else if (k.look === 'rival' && !k.helmet) {
    ribbon(x, ht(-0.85, 0.35), U, 6, 0.05, 0.03, 0.01, wind, k.t + 1.3, 0.35);
    dot(x, ht(-0.12, 0.16), r * 1.0);
  } else if (k.look === 'child') {
    dot(x, ht(-0.3, 0.55), r * 0.45);
  }
  if (k.helmet) {
    dot(x, ht(-0.05, 0.18), r * 1.14);
    poly(x, [ht(0.95, 0.15), ht(1.08, -0.6), ht(0.85, -0.6), ht(0.78, 0.1)]);
    /* crest */
    poly(x, [ht(0.5, 1.0), ht(0.15, 1.75), ht(-0.6, 1.55), ht(-1.3, 0.9), ht(-0.6, 1.05)]);
  }

  /* near side */
  cap(x, hip, kn, 0.048 * U * big, 0.035 * U * big);
  cap(x, kn, P2('footL'), 0.035 * U * big, 0.023 * U * big);
  foot(x, P2('footL'), U * big, face);
  const tip = weapon(x, P2('elbowL'), P2('handL'), U, face, k);
  cap(x, P2('shoulder'), P2('elbowL'), 0.034 * U * big, 0.029 * U * big);
  cap(x, P2('elbowL'), P2('handL'), 0.029 * U * big, 0.022 * U * big);
  dot(x, P2('handL'), 0.026 * U * big);
  return tip;
}

function foot(x: Ctx, f: S, U: number, face: number) {
  poly(x, [[f[0] - face * 0.03 * U, f[1] + 0.012 * U], [f[0] + face * 0.07 * U, f[1] + 0.012 * U], [f[0] + face * 0.05 * U, f[1] - 0.012 * U], [f[0] - face * 0.025 * U, f[1] - 0.03 * U]]);
}

function weapon(x: Ctx, el: S, hand: S, U: number, face: number, k: Skin): S | null {
  if (!k.weapon) return null;
  const d = rot(nrm(sub(hand, el)), -k.grip * face);
  const nn: S = [-d[1], d[0]];
  if (k.weapon === 'hammer') {
    const end = add(hand, d, 0.3 * U);
    cap(x, add(hand, d, -0.04 * U), end, 0.011 * U, 0.011 * U);
    poly(x, [add(add(end, nn, 0.06 * U), d, -0.02 * U), add(add(end, nn, 0.06 * U), d, 0.05 * U), add(add(end, nn, -0.05 * U), d, 0.05 * U), add(add(end, nn, -0.05 * U), d, -0.02 * U)]);
    return end;
  }
  if (k.weapon === 'blade') {
    const base = add(hand, d, 0.02 * U), tip = add(hand, d, 0.5 * U);
    cap(x, add(hand, d, -0.05 * U), base, 0.012 * U, 0.012 * U);
    poly(x, [add(base, nn, 0.05 * U), add(add(base, nn, 0.05 * U), d, 0.018 * U), add(add(base, nn, -0.05 * U), d, 0.018 * U), add(base, nn, -0.05 * U)]);
    const blade: S[] = [add(add(base, nn, 0.019 * U), d, 0.018 * U), add(add(tip, nn, 0.006 * U), d, -0.06 * U), tip, add(add(tip, nn, -0.006 * U), d, -0.06 * U), add(add(base, nn, -0.019 * U), d, 0.018 * U)];
    poly(x, blade);
    if (k.heat > 0.01) {
      x.save();
      x.globalAlpha = k.heat; x.fillStyle = k.heatCol;
      x.shadowColor = k.heatCol; x.shadowBlur = 14 * k.heat;
      poly(x, blade);
      x.restore();
    }
    return tip;
  }
  if (k.weapon === 'spear') {
    const tip = add(hand, d, 0.62 * U);
    cap(x, add(hand, d, -0.42 * U), tip, 0.009 * U, 0.008 * U);
    poly(x, [add(tip, nn, 0.022 * U), add(tip, d, 0.09 * U), add(tip, nn, -0.022 * U)]);
    return add(tip, d, 0.09 * U);
  }
  /* banner: a pole straight up from the fist, cloth downwind */
  const top: S = [hand[0], hand[1] - 0.9 * U];
  cap(x, [hand[0], hand[1] + 0.12 * U], top, 0.009 * U, 0.008 * U);
  ribbon(x, [top[0], top[1] + 0.09 * U], U, 6, 0.06, 0.18, 0.12, -1, k.t * 0.8, 0.05);
  return null;
}

/* the first machine and its soldiers: shields, spear shafts, pistons, a blade arm */
function drawMachine(x: Ctx, j: Joints, P2: (n: keyof Joints) => S, U: number, face: number, k: Skin): S | null {
  const prime = k.look === 'prime';
  const b = k.build;
  const has = (th: number) => b >= th;
  const pop = (th: number) => Math.min(1, Math.max(0, (b - th) / 0.04));
  const hip = P2('hip'), nk = P2('neck'), ch = P2('chest'), sh = P2('shoulder');
  const axis = nrm(sub(nk, hip));
  const front: S = [-axis[1] * face, axis[0] * face];

  const leg = (kn: S, ft: S, h: S) => {
    cap(x, h, kn, 0.05 * U, 0.04 * U);
    const sd = nrm(sub(ft, kn)), sn: S = [-sd[1], sd[0]];
    poly(x, [add(kn, sn, 0.042 * U), add(ft, sn, 0.026 * U), add(ft, sn, -0.026 * U), add(kn, sn, -0.042 * U)]);
    dot(x, kn, 0.05 * U);
    poly(x, [[ft[0] - face * 0.06 * U, ft[1] + 0.012 * U], [ft[0] + face * 0.12 * U, ft[1] + 0.012 * U], [ft[0] + face * 0.07 * U, ft[1] - 0.03 * U], [ft[0] - face * 0.03 * U, ft[1] - 0.04 * U]]);
  };
  const arm = (el: S, hd: S, blade: boolean) => {
    cap(x, sh, el, 0.04 * U, 0.034 * U);
    dot(x, el, 0.04 * U);
    cap(x, el, hd, 0.036 * U, 0.03 * U);
    const d = nrm(sub(hd, el)), nn: S = [-d[1], d[0]];
    if (blade) {
      const base = add(hd, d, 0.01 * U), tip = add(hd, d, 0.62 * U);
      poly(x, [add(base, nn, 0.032 * U), add(add(tip, nn, 0.008 * U), d, -0.08 * U), tip, add(add(tip, nn, -0.008 * U), d, -0.08 * U), add(base, nn, -0.032 * U)]);
      return tip;
    }
    for (const a of [-0.6, 0, 0.6]) cap(x, hd, add(hd, rot(d, a), 0.07 * U), 0.012 * U, 0.006 * U);
    return null;
  };

  /* far side */
  x.fillStyle = k.back;
  if (has(0.08)) leg(P2('kneeR'), P2('footR'), hip);
  if (has(0.52)) arm(P2('elbowR'), P2('handR'), false);

  x.fillStyle = k.ink;
  /* spear-shaft spines out of its back */
  if (has(0.72) && prime) {
    const back: S = [-front[0], -front[1]];
    const e = pop(0.72);
    for (const [a, l] of [[0.5, 0.48], [0.75, 0.42], [1.0, 0.34]] as const) {
      const dir = nrm(add(axis, back, Math.tan(a)));
      const s0 = add(add(hip, axis, 0.24 * U), back, 0.04 * U);
      const s1 = add(s0, dir, l * U * e);
      cap(x, s0, s1, 0.009 * U, 0.008 * U);
      const dn: S = [-dir[1], dir[0]];
      poly(x, [add(s1, dn, 0.02 * U), add(s1, dir, 0.08 * U * e), add(s1, dn, -0.02 * U)]);
    }
  }
  if (has(0.2)) {
    /* pelvis plate and spine column */
    poly(x, [add(add(hip, front, 0.08 * U), axis, 0.04 * U), add(hip, front, 0.06 * U), add(add(hip, front, -0.07 * U), axis, -0.01 * U), add(add(hip, front, -0.08 * U), axis, 0.05 * U)]);
    cap(x, hip, ch, 0.045 * U, 0.06 * U);
  }
  if (has(0.32)) {
    /* a chest of shields */
    const e = pop(0.32);
    dot(x, add(ch, front, 0.015 * U), (prime ? 0.135 : 0.11) * U * (0.85 + 0.15 * e));
    dot(x, add(add(ch, axis, -0.09 * U), front, 0.01 * U), 0.085 * U);
    if (prime) {
      /* the cavity the heart goes into */
      const c = add(ch, front, 0.05 * U);
      x.save();
      x.fillStyle = '#000';
      dot(x, c, 0.048 * U);
      x.strokeStyle = k.back; x.lineWidth = 0.012 * U;
      x.beginPath(); x.arc(c[0], c[1], 0.062 * U, 0, TAU); x.stroke();
      x.restore();
    }
  }
  /* slack cables, chest to hip */
  if (has(0.42) && prime) {
    x.save();
    x.strokeStyle = k.back; x.lineWidth = 0.014 * U;
    const a0 = add(add(ch, front, -0.1 * U), axis, -0.02 * U), a1 = add(hip, front, -0.06 * U);
    const m = add(lp(a0, a1, 0.5), front, -0.09 * U);
    x.beginPath(); x.moveTo(a0[0], a0[1]); x.quadraticCurveTo(m[0], m[1], a1[0], a1[1]); x.stroke();
    x.restore();
  }
  /* head: the rival's crested helmet for the first machine, a box for the others */
  let eyeAt: S | null = null;
  if (has(0.82) || !prime) {
    const hd = P2('head');
    cap(x, nk, hd, 0.03 * U, 0.03 * U);
    const hu = nrm(sub(hd, nk));
    const hf: S = [-hu[1] * face, hu[0] * face];
    const r = 0.07 * U;
    const ht = (a: number, c: number): S => [hd[0] + hf[0] * a * r + hu[0] * c * r, hd[1] + hf[1] * a * r + hu[1] * c * r];
    if (prime) {
      dot(x, ht(0, 0.1), r * 1.08);
      poly(x, [ht(1.05, 0.2), ht(1.15, -0.75), ht(0.6, -0.95), ht(-0.6, -0.6)]);
      poly(x, [ht(0.4, 1.0), ht(0.1, 1.85), ht(-0.6, 1.6), ht(-1.4, 0.95), ht(-0.55, 1.05)]);
    } else {
      poly(x, [ht(1.1, 0.8), ht(1.1, -0.8), ht(-0.9, -0.8), ht(-0.9, 0.8)]);
      poly(x, [ht(0.2, 0.8), ht(-0.1, 1.6), ht(-0.4, 0.8)]);
    }
    eyeAt = ht(0.62, -0.05);
  }
  if (has(0.08)) leg(P2('kneeL'), P2('footL'), hip);
  /* near arm: the blade the smith forged */
  let tip: S | null = null;
  if (has(0.62)) tip = arm(P2('elbowL'), P2('handL'), true);
  else if (has(0.52)) arm(P2('elbowL'), P2('handL'), false);
  /* shield pauldron */
  if (has(0.42)) {
    const e = pop(0.42);
    x.beginPath();
    const a = Math.atan2(axis[1], axis[0]);
    x.arc(sh[0], sh[1], (prime ? 0.1 : 0.075) * U * (0.8 + 0.2 * e), a - Math.PI / 2, a + Math.PI / 2);
    x.closePath(); x.fill();
  }

  /* the heart's light along its seams */
  if (k.seam > 0.01 && prime) {
    x.save();
    x.strokeStyle = k.seamCol; x.lineCap = 'round';
    x.shadowColor = k.seamCol; x.shadowBlur = 8;
    const lines: [S, S, number][] = [
      [hip, ch, 0], [sh, P2('elbowL'), 0.2], [P2('elbowL'), P2('handL'), 0.32], [sh, P2('elbowR'), 0.25],
      [hip, P2('kneeL'), 0.45], [P2('kneeL'), P2('footL'), 0.6], [hip, P2('kneeR'), 0.5], [nk, P2('head'), 0.75],
    ];
    for (const [a, c, th] of lines) {
      const s = Math.min(1, Math.max(0, (k.seam - th) / 0.25));
      if (s <= 0) continue;
      x.globalAlpha = 0.85 * s; x.lineWidth = 0.008 * U;
      const e = lp(a, c, s);
      x.beginPath(); x.moveTo(a[0], a[1]); x.lineTo(e[0], e[1]); x.stroke();
    }
    x.restore();
  }
  if (eyeAt && k.eye > 0.01) {
    const r = 0.11 * U * (prime ? 1 : 0.8);
    const g = x.createRadialGradient(eyeAt[0], eyeAt[1], 0, eyeAt[0], eyeAt[1], r * 2.2);
    g.addColorStop(0, k.eyeCol); g.addColorStop(1, 'rgba(222,73,104,0)');
    x.save();
    x.globalAlpha = Math.min(1, k.eye) * 0.75; x.fillStyle = g;
    x.fillRect(eyeAt[0] - r * 2.2, eyeAt[1] - r * 2.2, r * 4.4, r * 4.4);
    x.globalAlpha = Math.min(1, k.eye); x.fillStyle = k.eyeCol;
    x.fillRect(eyeAt[0] - 0.035 * U, eyeAt[1] - 0.009 * U, 0.06 * U, 0.018 * U);
    x.restore();
  }
  return tip;
}

/** where a prime's heart sits, in body units relative to the hip */
export function cavity(j: Joints, face: number): Pt {
  const ax = { x: j.neck.x - j.hip.x, y: j.neck.y - j.hip.y };
  const l = Math.hypot(ax.x, ax.y) || 1;
  const fx = (ax.y / l) * face, fy = (-ax.x / l) * face;
  return { x: j.chest.x + fx * 0.05, y: j.chest.y + fy * 0.05 };
}
