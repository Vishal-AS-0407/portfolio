/* The script: nine shots, the cast's keyframes, the camera, the grade and the
   impacts, all as data over film progress f (0..1). Pure — the film scrubs
   backwards. docs/design/inheritance-film.md §2 */
import { P, gait, lerpPose, type Pose, type PoseName, type Look, type Weapon } from './cast';
import type { GradeName } from './grade';

export type Ease = 'io' | 'out' | 'in' | 'back' | 'snap' | 'lin';
export const EASE: Record<Ease, (t: number) => number> = {
  lin: (t) => t,
  io: (t) => t * t * (3 - 2 * t),
  out: (t) => 1 - Math.pow(1 - t, 3),
  in: (t) => t * t * t,
  snap: (t) => (t < 0.5 ? 0 : 1),
  back: (t) => { const c = 1.7; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); },
};

export type Shot = { id: string; title: string; cap: string; f0: number; f1: number; key: number };
export const SHOTS: Shot[] = [
  { id: 'dawn', title: 'Dawn', cap: 'They built.', f0: 0, f1: 0.11, key: 0.55 },
  { id: 'want', title: 'Want', cap: 'Then they wanted more.', f0: 0.11, f1: 0.21, key: 0.57 },
  { id: 'war', title: 'War', cap: 'Then they fought.', f0: 0.21, f1: 0.37, key: 0.53 },
  { id: 'ash', title: 'Ash', cap: 'Until one remained.', f0: 0.37, f1: 0.47, key: 0.62 },
  { id: 'making', title: 'The making', cap: 'From their weapons, he built one that could not die.', f0: 0.47, f1: 0.59, key: 0.8 },
  { id: 'gift', title: 'The gift', cap: 'He gave it the only thing he had left.', f0: 0.59, f1: 0.7, key: 0.5 },
  { id: 'inherit', title: 'Inheritance', cap: 'It remembered what it was made of.', f0: 0.7, f1: 0.79, key: 0.6 },
  { id: 'again', title: 'Again', cap: 'And it began again.', f0: 0.79, f1: 0.91, key: 0.3 },
  { id: 'coda', title: 'Coda', cap: 'What we build inherits what we are.', f0: 0.91, f1: 1, key: 0.62 },
];
/** shot i, local u → film f */
export const F = (i: number, u: number) => SHOTS[i].f0 + (SHOTS[i].f1 - SHOTS[i].f0) * u;
export const shotAt = (f: number) => {
  for (let i = SHOTS.length - 1; i >= 0; i--) if (f >= SHOTS[i].f0) return i;
  return 0;
};
export const localU = (i: number, f: number) => (f - SHOTS[i].f0) / (SHOTS[i].f1 - SHOTS[i].f0);
/** sub-shots: 3a/3b and 8a/8b */
export const WAR_SPLIT = F(2, 0.375), AGAIN_SPLIT = F(7, 0.42);

/* ── the grade, keyed over f; two keys at one f are a cut ── */
export const GRADE_KEYS: [number, GradeName][] = [
  [0, 'dawn'], [0.11, 'morning'],
  [0.11, 'morning'], [0.21, 'want'],
  [0.21, 'war'], [0.37, 'war'],
  [0.37, 'ash'], [0.47, 'ash'],
  [0.47, 'night'], [0.6, 'night'], [0.66, 'gift'], [0.7, 'gift'],
  [0.7, 'steel'], [0.79, 'steel'],
  [0.79, 'plate'], [0.91, 'plate'],
  [0.91, 'dusk'], [1, 'dusk'],
];

/* ── camera: x, ground line g (×H), world height above it h, min visible width w, eye height eh ── */
export type Cam = { f: number; x: number; g: number; h: number; w: number; eh: number; e?: Ease };
const C = (f: number, x: number, g: number, h: number, w: number, eh: number, e: Ease = 'io'): Cam => ({ f, x, g, h, w, eh, e });
export const CAMERA: Cam[] = [
  C(0, -3.2, 0.74, 3.4, 4.4, 1.0), C(0.11, 0.0, 0.75, 3.2, 4.2, 0.95),
  C(0.11, 0.0, 0.8, 2.15, 2.8, 0.72), C(0.21, 0.12, 0.8, 1.8, 2.5, 0.7),
  C(0.21, 6.0, 0.87, 4.7, 5.4, 1.7), C(WAR_SPLIT, 6.5, 0.87, 4.3, 5.0, 1.65),
  C(WAR_SPLIT, 2.6, 0.8, 2.0, 2.5, 0.62), C(F(2, 0.7), 2.7, 0.8, 1.85, 2.4, 0.6), C(0.37, 3.0, 0.8, 2.15, 2.6, 0.62),
  C(0.37, 3.4, 0.78, 2.6, 3.0, 0.82), C(0.47, 1.1, 0.78, 2.35, 2.8, 0.8),
  C(0.47, 0.3, 0.8, 3.2, 3.2, 0.8), C(0.59, 0.32, 0.8, 2.9, 3.0, 0.78),
  C(0.59, 0.22, 0.86, 2.45, 2.3, 0.62), C(0.7, 0.2, 0.86, 2.15, 2.0, 0.6),
  C(0.7, 0.15, 0.9, 2.95, 2.7, 0.22), C(0.79, 0.12, 0.9, 2.75, 2.6, 0.24),
  C(0.79, 6.5, 0.87, 4.7, 5.4, 1.7), C(AGAIN_SPLIT, 6.0, 0.87, 4.3, 5.0, 1.65),
  C(AGAIN_SPLIT, 2.65, 0.82, 3.0, 3.2, 0.7), C(0.91, 2.7, 0.82, 2.7, 3.0, 0.7),
  C(0.91, 2.5, 0.82, 2.9, 2.9, 0.8), C(1, 2.55, 0.82, 2.35, 2.6, 0.8),
];

/* ── the cast ── */
type PoseRef = PoseName | 'walk' | 'run' | 'limp' | 'drag';
export type Key = {
  f: number; e?: Ease;
  x?: number; pose?: PoseRef; face?: 1 | -1; vis?: number;
  dis?: number; eye?: number; seam?: number; build?: number; heat?: number; fade?: number; grip?: number;
};
export type Actor = {
  id: string; look: Look; scale: number; keys: Key[];
  /** step timelines over f */
  weapon: [number, Weapon][]; helmet?: [number, boolean][];
};

export type Ev = { f: number; x: number; y: number; k: 'tap' | 'hit' | 'clang' | 'spark' | 'strike' | 'weld' };

export function buildScript() {
  const ev: Ev[] = [];
  const smith: Key[] = [], rival: Key[] = [], child: Key[] = [], prime: Key[] = [], drone: Key[] = [];
  const at = (keys: Key[], i: number, u: number, k: Omit<Key, 'f'>) => keys.push({ f: F(i, u), ...k });

  /* 1 · DAWN — the smith at his anvil, the rival walking in, the child and the kite */
  at(smith, 0, 0, { x: 0.3, face: 1, pose: 'hammerUp', vis: 1, grip: 0.1 });
  for (let i = 0; i < 7; i++) {
    at(smith, 0, 0.1 + i * 0.095, { pose: 'hammerDn', e: 'in' });
    at(smith, 0, 0.145 + i * 0.095, { pose: 'hammerUp', e: 'out' });
    ev.push({ f: F(0, 0.1 + i * 0.095), x: 0.66, y: 0.36, k: 'spark' });
  }
  at(smith, 0, 0.8, { pose: 'stand', e: 'io' }); at(smith, 0, 0.86, { face: -1 });
  at(rival, 0, 0, { vis: 0 }); at(rival, 0, 0.3, { vis: 1, x: -4.4, face: 1, pose: 'walk' });
  at(rival, 0, 0.98, { x: -0.75, pose: 'walk', e: 'lin' }); at(rival, 1, 0.04, { pose: 'stand', e: 'io' });
  at(child, 0, 0, { vis: 1, x: -5.3, face: 1, pose: 'run' }); at(child, 0, 0.5, { x: -1.6, pose: 'run', e: 'lin' });
  at(child, 0, 0.58, { x: -1.5, pose: 'watch', e: 'io' });

  /* 2 · WANT — the blade; a reach, a refusal, a shove; the kite string snaps */
  at(smith, 1, 0, { x: 0.32, pose: 'stand', heat: 1, grip: 0.4 });
  at(smith, 1, 0.14, { pose: 'holdUp', e: 'io', heat: 0.95 }); at(smith, 1, 0.3, { pose: 'holdUp' });
  at(smith, 1, 0.38, { pose: 'refuse', e: 'out', grip: 1.4 }); at(smith, 1, 0.5, { pose: 'refuse' });
  at(smith, 1, 0.6, { pose: 'stagger', x: 0.5, e: 'out' }); at(smith, 1, 0.7, { pose: 'knee', x: 0.55, e: 'io', heat: 0.5 });
  at(smith, 1, 1, { pose: 'knee', heat: 0.25 });
  at(rival, 1, 0.22, { pose: 'walk', x: -0.28, e: 'lin' }); at(rival, 1, 0.3, { pose: 'reach', x: -0.12, e: 'out' });
  at(rival, 1, 0.42, { pose: 'reach' }); at(rival, 1, 0.5, { pose: 'shoveWind', x: -0.14, e: 'io' });
  at(rival, 1, 0.56, { pose: 'shove', x: 0.02, e: 'back' }); at(rival, 1, 0.64, { pose: 'grab', x: -0.05, e: 'out', grip: 0.9, heat: 0.5 });
  at(rival, 1, 0.8, { pose: 'triumph', x: -0.15, e: 'back', grip: 0.1 }); at(rival, 1, 1, { pose: 'triumph', heat: 0.2 });
  at(child, 1, 0.54, { pose: 'watch' }); at(child, 1, 0.6, { pose: 'flinch', e: 'out' }); at(child, 1, 0.78, { pose: 'flinch' });
  at(child, 1, 0.92, { pose: 'stand', e: 'io' }); at(child, 1, 1, { vis: 1 }); at(child, 2, 0, { vis: 0 });
  ev.push({ f: F(1, 0.56), x: 0.2, y: 0.6, k: 'hit' });

  /* 3b · the duel — the rival's slash, the block, the thrust, a stray arrow */
  at(rival, 2, 0, { vis: 0 });
  at(rival, 2, 0.375, { vis: 1, x: 2.0, face: 1, pose: 'guard', grip: 0.5, heat: 0 });
  const D = (u: number) => 0.375 + u * 0.625;
  at(rival, 2, D(0.1), { pose: 'windup', x: 1.95, e: 'out', grip: 0.2 });
  at(rival, 2, D(0.17), { pose: 'slash', x: 2.3, e: 'back', grip: 0.3 }); at(rival, 2, D(0.24), { pose: 'slash' });
  at(rival, 2, D(0.3), { pose: 'stagger', x: 1.9, e: 'out' }); at(rival, 2, D(0.38), { pose: 'guard', x: 1.95, e: 'io', grip: 0.5 });
  at(rival, 2, D(0.46), { pose: 'thrustWind', x: 1.85, e: 'out', grip: -0.1 });
  at(rival, 2, D(0.53), { pose: 'thrust', x: 2.5, e: 'back', grip: 0 });
  at(rival, 2, D(0.58), { pose: 'stumble', x: 2.75, e: 'out' }); at(rival, 2, D(0.66), { pose: 'stumble', x: 2.85 });
  at(rival, 2, D(0.7), { pose: 'struck', x: 2.92, e: 'out' }); at(rival, 2, D(0.82), { pose: 'fallenF', x: 3.12, e: 'in' });
  at(rival, 3, 1, { pose: 'fallenF' }); at(rival, 4, 0, { vis: 0 });
  at(smith, 2, 0, { vis: 0 });
  at(smith, 2, 0.375, { vis: 1, x: 3.12, face: -1, pose: 'guard', grip: 0.3, heat: 0 });
  at(smith, 2, D(0.14), { pose: 'blockHigh', x: 3.16, e: 'out', grip: 1.45 }); at(smith, 2, D(0.2), { pose: 'blockHigh' });
  at(smith, 2, D(0.26), { pose: 'pushOff', x: 2.96, e: 'back', grip: 0.5 }); at(smith, 2, D(0.34), { pose: 'guard', x: 3.1, e: 'io', grip: 0.3 });
  at(smith, 2, D(0.5), { pose: 'dodge', x: 3.48, e: 'out' }); at(smith, 2, D(0.6), { pose: 'guard', x: 3.52, e: 'io' });
  at(smith, 2, D(0.78), { pose: 'guard' }); at(smith, 2, D(0.94), { pose: 'tired', x: 3.52, e: 'io', grip: 0 });
  ev.push({ f: F(2, D(0.17)), x: 2.72, y: 0.98, k: 'clang' });
  ev.push({ f: F(2, D(0.26)), x: 2.6, y: 0.62, k: 'hit' });
  ev.push({ f: F(2, D(0.69)), x: 2.92, y: 0.62, k: 'hit' });

  /* 4 · ASH — he limps through the dead, takes up the blade, kneels at the cold forge */
  at(smith, 3, 0, { x: 3.5, pose: 'tired', face: -1, grip: 0 });
  at(smith, 3, 0.1, { pose: 'limp', x: 3.4 }); at(smith, 3, 0.3, { pose: 'limp', x: 2.86, e: 'lin' });
  at(smith, 3, 0.36, { pose: 'pickUp', x: 2.8, e: 'io' }); at(smith, 3, 0.45, { pose: 'tired', e: 'io', grip: -1.2 });
  at(smith, 3, 0.5, { pose: 'limp', x: 2.74 }); at(smith, 3, 0.82, { pose: 'limp', x: 1.0, e: 'lin' });
  at(smith, 3, 0.9, { pose: 'kneel', x: 0.95, e: 'io' }); at(smith, 3, 1, { pose: 'kneelHead', e: 'io' });

  /* 5 · THE MAKING — legs, pelvis, a chest of shields, pauldrons, arms, the blade, spines, the helmet */
  at(prime, 4, 0, { vis: 1, x: -0.12, face: 1, pose: 'slump', build: 0, eye: 0, seam: 0 });
  const parts = [0.08, 0.2, 0.32, 0.42, 0.52, 0.62, 0.72, 0.82];
  parts.forEach((b, i) => {
    at(prime, 4, 0.1 + i * 0.1, { build: b - 0.001, e: 'lin' });
    at(prime, 4, 0.14 + i * 0.1, { build: b + 0.045, e: 'out' });
    ev.push({ f: F(4, 0.11 + i * 0.1), x: 0.05 + (i < 2 ? 0.15 : 0), y: 0.18 + i * 0.12, k: 'weld' });
  });
  at(prime, 4, 0.98, { build: 1 });
  at(smith, 4, 0, { x: 1.5, face: -1, pose: 'drag', grip: 0.4 }); at(smith, 4, 0.1, { x: 0.62, pose: 'drag', e: 'lin' });
  at(smith, 4, 0.14, { pose: 'weldLow', e: 'io' }); at(smith, 4, 0.27, { pose: 'weldLow' });
  at(smith, 4, 0.33, { pose: 'weldMid', x: 0.6, e: 'io' }); at(smith, 4, 0.5, { pose: 'weldMid' });
  at(smith, 4, 0.56, { pose: 'weldHigh', x: 0.56, e: 'io' }); at(smith, 4, 0.86, { pose: 'weldHigh' });
  at(smith, 4, 0.94, { pose: 'tired', x: 0.6, e: 'io', grip: 0 });

  /* 6 · THE GIFT — he draws out his heart and sets it in the machine's chest */
  at(smith, 5, 0, { x: 0.5, pose: 'stand', fade: 0 });
  at(smith, 5, 0.16, { pose: 'clutch', e: 'io' }); at(smith, 5, 0.3, { pose: 'clutch2', e: 'io' });
  at(smith, 5, 0.42, { pose: 'pull', x: 0.48, e: 'out' }); at(smith, 5, 0.56, { pose: 'offerUp', x: 0.4, e: 'io' });
  at(smith, 5, 0.64, { pose: 'offerUp', fade: 0 }); at(smith, 5, 0.76, { pose: 'sinkKneel', x: 0.5, e: 'io' });
  at(smith, 5, 0.92, { fade: 0.55 });
  at(prime, 5, 0.6, { seam: 0 }); at(prime, 5, 0.92, { seam: 1, e: 'io' });
  at(prime, 5, 0.86, { eye: 0 }); at(prime, 5, 0.9, { eye: 1, e: 'snap' });

  /* 7 · INHERITANCE — it rises, looks down at him, and thrusts with the rival's move */
  at(prime, 6, 0, { pose: 'slump' }); at(prime, 6, 0.12, { pose: 'rise', e: 'io' });
  at(prime, 6, 0.26, { pose: 'tallM', e: 'back' }); at(prime, 6, 0.36, { pose: 'lookDown', e: 'io' }); at(prime, 6, 0.5, { pose: 'lookDown' });
  at(prime, 6, 0.56, { pose: 'thrustWind', x: -0.18, e: 'out' }); at(prime, 6, 0.63, { pose: 'thrust', x: 0.06, e: 'back' });
  at(prime, 6, 0.74, { pose: 'thrust' }); at(prime, 6, 0.88, { pose: 'regard', x: 0.0, e: 'io' });
  at(smith, 6, 0, { pose: 'sinkKneel', x: 0.62, fade: 0.55 }); at(smith, 6, 0.4, { pose: 'reachUp', e: 'io' });
  at(smith, 6, 0.62, { pose: 'reachUp', dis: 0 }); at(smith, 6, 0.645, { pose: 'struck', e: 'out' });
  at(smith, 6, 0.9, { dis: 1, e: 'out' }); at(smith, 6, 0.91, { vis: 0 });
  ev.push({ f: F(6, 0.635), x: 0.55, y: 0.72, k: 'strike' });

  /* 8b · the machine war, the duel mirrored — and it wins with the thrust */
  at(prime, 7, 0, { vis: 0 });
  at(prime, 7, 0.42, { vis: 1, x: 1.95, face: 1, pose: 'guard', eye: 1, seam: 1 });
  const A = (u: number) => 0.42 + u * 0.58;
  at(prime, 7, A(0.14), { pose: 'blockHigh', x: 2.0, e: 'out' }); at(prime, 7, A(0.22), { pose: 'blockHigh' });
  at(prime, 7, A(0.29), { pose: 'pushOff', x: 2.2, e: 'back' }); at(prime, 7, A(0.38), { pose: 'guard', x: 2.1, e: 'io' });
  at(prime, 7, A(0.46), { pose: 'thrustWind', x: 1.98, e: 'out' }); at(prime, 7, A(0.55), { pose: 'thrust', x: 2.55, e: 'back' });
  at(prime, 7, A(0.66), { pose: 'thrust' }); at(prime, 7, A(0.82), { pose: 'tallM', x: 2.45, e: 'io' });
  at(drone, 7, 0, { vis: 0 });
  at(drone, 7, 0.42, { vis: 1, x: 3.45, face: -1, pose: 'guard', eye: 1 });
  at(drone, 7, A(0.1), { pose: 'windup', x: 3.5, e: 'out' }); at(drone, 7, A(0.18), { pose: 'slash', x: 3.12, e: 'back' });
  at(drone, 7, A(0.25), { pose: 'slash' }); at(drone, 7, A(0.32), { pose: 'stagger', x: 3.55, e: 'out' });
  at(drone, 7, A(0.42), { pose: 'guard', x: 3.5, e: 'io' }); at(drone, 7, A(0.54), { pose: 'guard' });
  at(drone, 7, A(0.6), { pose: 'struck', x: 3.65, e: 'out' }); at(drone, 7, A(0.66), { eye: 1 });
  at(drone, 7, A(0.76), { pose: 'fallen', x: 3.95, e: 'in', eye: 0 });
  ev.push({ f: F(7, A(0.18)), x: 2.8, y: 1.9, k: 'clang' });
  ev.push({ f: F(7, A(0.29)), x: 2.85, y: 1.2, k: 'hit' });
  ev.push({ f: F(7, A(0.56)), x: 3.4, y: 1.25, k: 'strike' });

  /* 9 · CODA — alone; the kite comes down; it catches the string */
  at(prime, 8, 0, { x: 2.4, pose: 'tallM' }); at(prime, 8, 0.12, { pose: 'lookUp', e: 'io' });
  at(prime, 8, 0.32, { pose: 'catch', e: 'out' }); at(prime, 8, 0.46, { pose: 'catch' });
  at(prime, 8, 0.62, { pose: 'holdKite', e: 'io' });
  at(drone, 8, 0, { x: 3.95, pose: 'fallen' });

  const actors: Actor[] = [
    { id: 'rival', look: 'rival', scale: 1, keys: rival,
      weapon: [[0, null], [F(1, 0.62), 'blade'], [F(2, D(0.74)), null]], helmet: [[0, false], [0.21, true]] },
    { id: 'child', look: 'child', scale: 0.62, keys: child, weapon: [[0, null]] },
    { id: 'drone', look: 'drone', scale: 1.72, keys: drone, weapon: [[0, null]] },
    { id: 'prime', look: 'prime', scale: 2.0, keys: prime, weapon: [[0, null]] },
    { id: 'smith', look: 'smith', scale: 1.04, keys: smith,
      weapon: [[0, 'hammer'], [F(1, 0), 'blade'], [F(1, 0.62), null], [0.21, 'hammer'], [0.37, null], [F(3, 0.38), 'blade'], [0.47, 'hammer'], [F(4, 0.9), null]] },
  ];
  for (const a of actors) {
    a.keys.sort((k1, k2) => k1.f - k2.f);
    if (a.keys[0].vis === undefined) a.keys[0].vis = 1;
    if (a.keys[0].f > 0) a.keys.unshift({ f: 0, vis: 0 });
  }
  ev.sort((a, b) => a.f - b.f);
  return { actors, ev };
}

/* ── sampling ── */
type Field = 'x' | 'face' | 'dis' | 'eye' | 'vis' | 'seam' | 'build' | 'heat' | 'fade' | 'grip';
export function sampleField(keys: Key[], fl: Field, f: number, def: number): number {
  let prev: Key | null = null, next: Key | null = null;
  for (const k of keys) {
    if (k[fl] === undefined) continue;
    if (k.f <= f) prev = k; else { next = k; break; }
  }
  if (!prev) return next ? (next[fl] as number) : def;
  if (!next || fl === 'face' || fl === 'vis') return prev[fl] as number;
  const t = (f - prev.f) / (next.f - prev.f || 1);
  return (prev[fl] as number) + ((next[fl] as number) - (prev[fl] as number)) * EASE[next.e ?? 'io'](t);
}

const STRIDE = { walk: 0.95, run: 1.5, limp: 0.75, drag: 0.7 };
function resolve(ref: PoseRef, x: number): Pose {
  if (ref === 'walk') return gait((x / STRIDE.walk) * Math.PI * 2);
  if (ref === 'run') return gait((x / STRIDE.run) * Math.PI * 2, 1);
  if (ref === 'limp' || ref === 'drag') {
    const g = gait((x / STRIDE[ref]) * Math.PI * 2);
    g[0] += 0.24; g[1] += 0.3; g[8] *= 0.45;
    if (ref === 'drag') { g[0] += 0.12; g[2] = -0.7; g[3] = 0.3; }
    else { g[3] += 0.3; g[5] += 0.2; }
    return g;
  }
  return P[ref];
}
export function samplePose(keys: Key[], f: number, x: number): Pose {
  let prev: Key | null = null, next: Key | null = null;
  for (const k of keys) {
    if (!k.pose) continue;
    if (k.f <= f) prev = k; else { next = k; break; }
  }
  if (!prev && !next) return P.stand;
  if (!prev) return resolve(next!.pose!, x);
  if (!next) return resolve(prev.pose!, x);
  const t = (f - prev.f) / (next.f - prev.f || 1);
  return lerpPose(resolve(prev.pose!, x), resolve(next.pose!, x), EASE[next.e ?? 'io'](t));
}
export function step<T>(tl: [number, T][], f: number): T {
  let v = tl[0][1];
  for (const [k, val] of tl) if (f >= k) v = val;
  return v;
}

export function sampleCamera(f: number): Cam {
  let i = 0;
  while (i < CAMERA.length - 1 && CAMERA[i + 1].f <= f) i++;
  const a = CAMERA[i], b = CAMERA[i + 1];
  if (!b || b.f === a.f) return a;
  const t = EASE[b.e ?? 'io']((f - a.f) / (b.f - a.f));
  const L = (p: number, q: number) => p + (q - p) * t;
  return { f, x: L(a.x, b.x), g: L(a.g, b.g), h: L(a.h, b.h), w: L(a.w, b.w), eh: L(a.eh, b.eh) };
}
