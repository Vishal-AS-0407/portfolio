/* The script: every actor, the camera and the impacts as keyframes over the
   page's scroll p. Pure data plus a sampler — the story scrubs backwards.
   docs/design/biomech-and-inheritance.md §9.5 */
import { P, gait, lerpPose, type Pose } from './rig';

export type Ease = 'io' | 'out' | 'in' | 'snap' | 'back' | 'lin';
export const EASE: Record<Ease, (t: number) => number> = {
  lin: (t) => t,
  io: (t) => t * t * (3 - 2 * t),
  out: (t) => 1 - Math.pow(1 - t, 3),
  in: (t) => t * t,
  snap: (t) => (t < 0.85 ? 0 : 1),
  back: (t) => { const c = 1.6; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); },
};

type PoseRef = keyof typeof P | 'walk' | 'run' | 'limp';
export type Key = {
  p: number;
  x?: number;
  y?: number;        // extra lift (e.g. rising out of the ground: negative)
  pose?: PoseRef;
  face?: 1 | -1;
  dis?: number;      // disintegration 0..1
  eye?: number;      // machine eye 0..1
  vis?: number;
  e?: Ease;
};
export type Actor = { id: string; kind: 'human' | 'machine'; scale: number; keys: Key[] };

/* ── choreography A: attacker opens, defender blocks, defender's hook ends it.
   The human war and the machine war run the same moves; `side` mirrors it. ── */
function choreo(att: Key[], def: Key[], p0: number, dur: number, ax: number, dx: number, events: Ev[], machine: boolean) {
  const f = (t: number) => p0 + dur * t;
  const side = Math.sign(ax - dx) || 1;            // which side the attacker stands on
  const fa = (-side) as 1 | -1, fd = side as 1 | -1;
  att.push(
    { p: f(0), pose: 'guard', x: ax, face: fa, e: 'out' },
    { p: f(0.16), pose: 'jab', x: ax - side * 0.14, e: 'out' },
    { p: f(0.32), pose: 'guard', x: ax, e: 'io' },
    { p: f(0.55), pose: 'guard', x: ax - side * 0.05 },
    { p: f(0.62), pose: 'hit', x: ax + side * 0.35, e: 'out' },
    { p: f(0.82), pose: 'fallen', x: ax + side * 0.75, e: 'in' },
  );
  def.push(
    { p: f(0), pose: 'guard', x: dx, face: fd, e: 'out' },
    { p: f(0.18), pose: 'block', x: dx + side * -0.05, e: 'out' },
    { p: f(0.42), pose: 'guard', x: dx, e: 'io' },
    { p: f(0.56), pose: 'hook', x: dx + side * 0.18, e: 'out' },
    { p: f(0.78), pose: 'guard', x: dx + side * 0.1, e: 'io' },
    { p: f(1), pose: machine ? 'tall' : 'stand', e: 'io' },
  );
  events.push({ p: f(0.18), x: (ax + dx) / 2, k: machine ? 'spark' : 'tap' });
  events.push({ p: f(0.6), x: (ax + dx) / 2 + side * 0.15, k: machine ? 'clang' : 'hit' });
}

export type Ev = { p: number; x: number; k: 'tap' | 'hit' | 'spark' | 'clang' | 'strike' };

export const SCENES: [number, string][] = [
  [0.0, 'SC 01 · LIFE'], [0.08, 'SC 02 · QUARREL'], [0.18, 'SC 03 · WAR'], [0.3, 'SC 04 · THE LAST ONE'],
  [0.4, 'SC 05 · THE MACHINE'], [0.52, 'SC 06 · THE GIFT'], [0.62, 'SC 07 · BETRAYAL'],
  [0.72, 'SC 08 · INHERITANCE'], [0.92, 'SC 09 · ALONE'],
];
export const CUTS = [0.08, 0.18, 0.3, 0.4, 0.52, 0.62, 0.72, 0.92];

export function buildScript() {
  const events: Ev[] = [];
  const A: Key[] = [], Bk: Key[] = [], C: Key[] = [], D: Key[] = [], E: Key[] = [];
  const M0: Key[] = [], M1: Key[] = [], M2: Key[] = [], M3: Key[] = [];

  /* 1 · LIFE — A hammers at the forge, B carries a beam in, a child runs through */
  A.push({ p: 0, x: 5.8, face: 1, pose: 'hammerUp', vis: 1 });
  for (let k = 0; k < 7; k++) {
    A.push({ p: 0.02 + k * 0.009, pose: 'hammerDn', e: 'in' }, { p: 0.0245 + k * 0.009, pose: 'hammerUp', e: 'out' });
  }
  A.push({ p: 0.086, pose: 'stand', face: -1, x: 5.8, e: 'io' }, { p: 0.1, pose: 'walk', x: 5.15, e: 'lin' }, { p: 0.108, pose: 'stand', e: 'io' });
  Bk.push({ p: 0.02, x: -5, face: 1, pose: 'walk', vis: 1 }, { p: 0.088, x: 4.0, pose: 'walk', e: 'lin' }, { p: 0.096, pose: 'stand', e: 'io' });
  C.push({ p: 0.02, x: -7, face: 1, pose: 'run', vis: 1 }, { p: 0.075, x: 13, pose: 'run', e: 'lin' }, { p: 0.0751, vis: 0 });

  /* 2 · QUARREL — the beam drops, postures rise, a shove */
  A.push({ p: 0.125, pose: 'posture', e: 'out' }, { p: 0.142, pose: 'posture' }, { p: 0.15, pose: 'shove', x: 4.95, e: 'out' }, { p: 0.165, pose: 'posture', x: 5.1, e: 'io' });
  Bk.push({ p: 0.12, pose: 'posture', e: 'out' }, { p: 0.149, pose: 'posture', x: 4.0 }, { p: 0.156, pose: 'stagger', x: 3.6, e: 'out' }, { p: 0.172, pose: 'guard', x: 3.85, e: 'io' });
  events.push({ p: 0.152, x: 4.5, k: 'tap' });

  /* 3 · WAR — choreography A, three times; B is the one left standing */
  choreo(A, Bk, 0.18, 0.05, 5.0, 4.0, events, false);
  D.push({ p: 0.2, x: -5, face: 1, pose: 'run', vis: 1 }, { p: 0.232, x: 3.0, pose: 'run', e: 'lin' });
  Bk.push({ p: 0.234, face: -1 });
  choreo(D, Bk, 0.235, 0.032, 3.0, 4.0, events, false);
  E.push({ p: 0.245, x: 14, face: -1, pose: 'run', vis: 1 }, { p: 0.264, x: 5.1, pose: 'run', e: 'lin' });
  Bk.push({ p: 0.266, face: 1 });
  choreo(E, Bk, 0.267, 0.03, 5.1, 4.1, events, false);

  /* 4 · THE LAST ONE — he walks through the fallen, and kneels */
  Bk.push({ p: 0.302, pose: 'stand', x: 4.25 }, { p: 0.31, pose: 'limp', x: 4.4 }, { p: 0.364, pose: 'limp', x: 11.6, e: 'lin' }, { p: 0.39, pose: 'kneel', x: 11.7, e: 'io' });

  /* 5 · THE MACHINE — a dormant frame rises from the ground line */
  M0.push({ p: 0, x: 13.1, face: -1, pose: 'crouch', y: -1.4, eye: 0, vis: 1 }, { p: 0.42, y: -1.4 }, { p: 0.49, y: 0, pose: 'crouch', e: 'out' }, { p: 0.51, pose: 'dormant', e: 'io' });
  Bk.push({ p: 0.43, pose: 'lookUp', e: 'io' }, { p: 0.49, pose: 'lookUp' }, { p: 0.5, pose: 'stand', x: 11.7, e: 'io' }, { p: 0.505, pose: 'walk', x: 11.75 }, { p: 0.522, pose: 'walk', x: 12.3, e: 'lin' }, { p: 0.528, pose: 'stand', e: 'io' });
  events.push({ p: 0.49, x: 13.1, k: 'tap' });

  /* 6 · THE GIFT — he takes out his heart and gives it; the eye ignites */
  Bk.push({ p: 0.54, pose: 'reachIn', e: 'io' }, { p: 0.556, pose: 'reachIn' }, { p: 0.57, pose: 'offer', e: 'out' }, { p: 0.6, pose: 'offer' });
  M0.push({ p: 0.598, eye: 0 }, { p: 0.606, eye: 1, e: 'snap' });

  /* 7 · BETRAYAL — it stands, regards him, strikes; he comes apart */
  Bk.push({ p: 0.615, pose: 'stand', x: 12.3, e: 'io' }, { p: 0.674, pose: 'stand' }, { p: 0.682, pose: 'hit', x: 11.9, e: 'out' }, { p: 0.688, dis: 0 }, { p: 0.72, dis: 1, x: 11.7, e: 'out' }, { p: 0.721, vis: 0 });
  M0.push({ p: 0.625, pose: 'dormant' }, { p: 0.645, pose: 'tall', e: 'back' }, { p: 0.655, pose: 'tilt', e: 'io' }, { p: 0.664, pose: 'tilt' },
    { p: 0.672, pose: 'guard', e: 'out' }, { p: 0.68, pose: 'jab', e: 'out' }, { p: 0.7, pose: 'tall', e: 'io' });
  events.push({ p: 0.681, x: 12.4, k: 'strike' });

  /* 8 · INHERITANCE — the same war, among machines */
  M0.push({ p: 0.726, face: 1 });
  M1.push({ p: 0.72, x: 24, face: -1, pose: 'walk', eye: 0.8, vis: 1 }, { p: 0.765, x: 14.4, pose: 'walk', e: 'lin' });
  choreo(M1, M0, 0.768, 0.045, 14.4, 13.2, events, true);
  M2.push({ p: 0.78, x: 26, face: -1, pose: 'walk', eye: 0.8, vis: 1 }, { p: 0.816, x: 14.3, pose: 'walk', e: 'lin' });
  choreo(M2, M0, 0.818, 0.035, 14.3, 13.25, events, true);
  M3.push({ p: 0.8, x: 4, face: 1, pose: 'walk', eye: 0.8, vis: 1 }, { p: 0.846, x: 12.2, pose: 'walk', e: 'lin' });
  M0.push({ p: 0.847, face: -1 });
  choreo(M3, M0, 0.848, 0.035, 12.2, 13.25, events, true);

  /* 9 · ALONE — it walks into the machine city, and looks at its hands */
  M0.push({ p: 0.9, pose: 'tall', x: 13.3 }, { p: 0.906, face: 1 }, { p: 0.915, pose: 'walk', x: 13.4 }, { p: 0.962, pose: 'walk', x: 18.6, e: 'lin' }, { p: 0.972, pose: 'tall', e: 'io' }, { p: 0.988, pose: 'hands', e: 'io' });

  const actors: Actor[] = [
    { id: 'A', kind: 'human', scale: 1, keys: A }, { id: 'B', kind: 'human', scale: 1, keys: Bk },
    { id: 'C', kind: 'human', scale: 0.62, keys: C }, { id: 'D', kind: 'human', scale: 1, keys: D },
    { id: 'E', kind: 'human', scale: 0.96, keys: E },
    { id: 'M1', kind: 'machine', scale: 1.22, keys: M1 }, { id: 'M2', kind: 'machine', scale: 1.15, keys: M2 },
    { id: 'M3', kind: 'machine', scale: 1.28, keys: M3 }, { id: 'M0', kind: 'machine', scale: 1.3, keys: M0 },
  ];
  for (const a of actors) a.keys.sort((k1, k2) => k1.p - k2.p);
  /* actors that haven't entered yet are hidden */
  for (const a of actors) if (a.keys[0].vis === undefined) a.keys[0].vis = 1;
  for (const a of actors) if (a.keys[0].p > 0) a.keys.unshift({ p: 0, vis: 0 }), a.keys.splice(1, 0, { p: a.keys[1].p - 1e-4, vis: 0 });

  const camera: [number, number][] = [
    [0, 1.2], [0.08, 3.2], [0.11, 4.6], [0.18, 4.6], [0.235, 4.0], [0.265, 4.8], [0.3, 4.9], [0.366, 11.0],
    [0.4, 12.1], [0.52, 12.6], [0.62, 12.6], [0.72, 13.0], [0.77, 13.8], [0.82, 13.8], [0.85, 12.8], [0.9, 13.1],
    [0.965, 18.0], [1, 18.8],
  ];

  /* the heart: in B's chest, then his hand, then the machine's chest */
  return { actors, camera, events };
}

/* ── sampling ── */
type Field = 'x' | 'y' | 'face' | 'dis' | 'eye' | 'vis';
export function sampleField(keys: Key[], f: Field, p: number, def: number): number {
  let prev: Key | null = null, next: Key | null = null;
  for (const k of keys) {
    if (k[f] === undefined) continue;
    if (k.p <= p) prev = k; else { next = k; break; }
  }
  if (!prev) return next ? (next[f] as number) : def;
  if (!next || f === 'face' || f === 'vis') return prev[f] as number;
  const t = (p - prev.p) / (next.p - prev.p);
  return (prev[f] as number) + ((next[f] as number) - (prev[f] as number)) * EASE[next.e ?? 'io'](t);
}

const STRIDE = { walk: 0.95, run: 1.5, limp: 0.8 };
function resolve(ref: PoseRef, x: number, t: number): Pose {
  if (ref === 'walk') return gait((x / STRIDE.walk) * Math.PI * 2);
  if (ref === 'run') return gait((x / STRIDE.run) * Math.PI * 2, 1);
  if (ref === 'limp') {
    const g = gait((x / STRIDE.limp) * Math.PI * 2);
    g[0] += 0.22; g[1] += 0.3; g[3] += 0.3; g[5] += 0.2;
    g[8] *= 0.4;
    return g;
  }
  void t;
  return P[ref];
}
export function samplePose(keys: Key[], p: number, x: number, t: number): Pose {
  let prev: Key | null = null, next: Key | null = null;
  for (const k of keys) {
    if (!k.pose) continue;
    if (k.p <= p) prev = k; else { next = k; break; }
  }
  if (!prev && !next) return P.stand;
  if (!prev) return resolve(next!.pose!, x, t);
  if (!next) return resolve(prev.pose!, x, t);
  const tt = (p - prev.p) / (next.p - prev.p);
  return lerpPose(resolve(prev.pose!, x, t), resolve(next.pose!, x, t), EASE[next.e ?? 'io'](tt));
}

export function sampleCamera(cam: [number, number][], p: number) {
  if (p <= cam[0][0]) return cam[0][1];
  for (let i = 1; i < cam.length; i++) {
    if (p <= cam[i][0]) {
      const [p0, x0] = cam[i - 1], [p1, x1] = cam[i];
      return x0 + (x1 - x0) * EASE.io((p - p0) / (p1 - p0));
    }
  }
  return cam[cam.length - 1][1];
}

export const sceneAt = (p: number) => {
  let s = SCENES[0][1];
  for (const [k, v] of SCENES) if (p >= k) s = v;
  return s;
};
