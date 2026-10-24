/* The traveller (and the Settled, and the echoes): a hooded cloak over two-bone
   legs, a staff, and a lantern on a damped pendulum. Drawn in world units into
   the scene buffer — colour here is not colour but meaning (see paint.ts):
   R = how much matter, G = light, B = material. */
import type { Mode } from './world';
import { sat, ss, lerp } from './world';

export type Ctx = CanvasRenderingContext2D;
type V = [number, number];

const THIGH = 0.43, SHIN = 0.41, TORSO = 0.56, HEAD = 0.118;

export type Pose = {
  thigh: [number, number]; shin: [number, number];
  lean: number; hipY: number | null; arm: number; staff: boolean;
  sit: number; rot: number; flutter: number;
};

const sin = Math.sin, cos = Math.cos;

/** a pose from the traveller's mode, its progress u in that mode, where it is and how fast */
export function pose(m: Mode, u: number, x: number, speed: number, wind: number, t: number, slopeAhead: number): Pose {
  const ph = (x * Math.PI) / 0.62;
  const breathe = sin(t * 1.7) * 0.015;
  const base: Pose = { thigh: [0.02, -0.02], shin: [0.02, -0.02], lean: 0.04 + breathe, hipY: null, arm: 0.5, staff: true, sit: 0, rot: 0, flutter: wind * 0.6 };
  const walk = (amp: number, lean: number): Pose => {
    const a = sin(ph) * 0.46 * amp, b = sin(ph + Math.PI) * 0.46 * amp;
    const ka = Math.max(0, -sin(ph - 0.9)) * 0.75 * amp + 0.06, kb = Math.max(0, -sin(ph + Math.PI - 0.9)) * 0.75 * amp + 0.06;
    return { ...base, thigh: [a, b], shin: [a - ka, b - kb], lean, arm: 0.45 + sin(ph) * 0.12 * amp, flutter: wind * 0.6 + Math.min(1, speed * 0.02) * 0.5 };
  };
  switch (m) {
    case 'walk': {
      const tired = sat((0.6 - speed * 0.006) * 1.4);
      const uphill = sat(slopeAhead * 1.4);
      return walk(lerp(1, 0.62, tired), 0.06 + uphill * 0.3 + tired * 0.16);
    }
    case 'climb': return walk(0.85, 0.34 + sat(slopeAhead) * 0.12);
    case 'slide': {
      /* a surfer's crouch down the scree, leaning back against the fall */
      return { ...base, thigh: [0.62, -0.42], shin: [0.05, -0.95], lean: -0.12, arm: 1.05, flutter: 0.9 + wind * 0.4 };
    }
    case 'brace': {
      const w = walk(0.4, 0.5);
      return { ...w, thigh: [w.thigh[0] + 0.15, w.thigh[1] - 0.2], arm: 0.85, flutter: 1.4 };
    }
    case 'fall': {
      const r = ss(0, 0.35, u);
      return { ...base, thigh: [0.5, 0.9], shin: [0.1, 0.3], lean: -0.3, rot: -1.35 * r, arm: 1.8, flutter: 1.2, hipY: lerp(0.84, 0.16, r) };
    }
    case 'get': {
      const r = 1 - ss(0.1, 0.9, u);
      const k = kneel();
      return { ...k, rot: -1.35 * r * r, lean: lerp(k.lean, 0.3, r), hipY: lerp(0.5, 0.16, r), flutter: 0.6 };
    }
    case 'sit': case 'dissolve': return sitting(u);
    case 'rise': {
      const s = sitting(1), st = walk(0.3, 0.12), r = ss(0, 1, u);
      return { ...st, thigh: [lerp(s.thigh[0], st.thigh[0], r), lerp(s.thigh[1], st.thigh[1], r)], shin: [lerp(s.shin[0], st.shin[0], r), lerp(s.shin[1], st.shin[1], r)], hipY: r > 0.98 ? null : lerp(0.13, 0.84, r * r), lean: lerp(0.3, 0.12, r), sit: 1 - r };
    }
    case 'kneel': return kneel();
    default: return base;
  }
  function sitting(_u: number): Pose {
    /* knees up, arms around them, the staff laid down */
    return { ...base, thigh: [1.3, 1.22], shin: [-0.35, -0.5], lean: 0.32 + breathe * 2, hipY: 0.13, arm: 1.25, staff: false, sit: 1, flutter: wind * 0.3 };
  }
  function kneel(): Pose {
    return { ...base, thigh: [1.45, 0.05], shin: [0.02, -1.5], lean: 0.26, hipY: 0.45, arm: 1.1, flutter: wind * 0.4 };
  }
}

/** returns the lantern's position in world units (or null when it isn't carried) */
export function drawFigure(
  x: Ctx, M: (wx: number, wy: number) => V, k: number,
  wx: number, wy: number, face: 1 | -1, P: Pose, fill: string,
  opt: { scale?: number; lantern?: boolean; swing?: number; t: number; reflect?: number }
): V | null {
  const s = opt.scale ?? 1;
  const [sx, sy] = M(wx, wy);
  x.save();
  x.translate(sx, sy);
  if (opt.reflect !== undefined) x.scale(1, -1);
  x.scale(face * k * s, -k * s);
  x.rotate(-P.rot);

  const legs: V[][] = [0, 1].map((i) => {
    const a = P.thigh[i], b = P.shin[i];
    const knee: V = [sin(a) * THIGH, -cos(a) * THIGH];
    const foot: V = [knee[0] + sin(b) * SHIN, knee[1] - cos(b) * SHIN];
    return [[0, 0], knee, foot];
  });
  const lowFoot = Math.min(legs[0][2][1], legs[1][2][1]);
  const hipY = P.hipY ?? -lowFoot;
  const hip: V = [0, hipY];
  const neck: V = [hip[0] + sin(P.lean) * TORSO, hip[1] + cos(P.lean) * TORSO];
  const head: V = [neck[0] + sin(P.lean * 1.25) * 0.17, neck[1] + cos(P.lean * 1.25) * 0.17];

  x.fillStyle = fill; x.strokeStyle = fill;
  x.lineCap = 'round'; x.lineJoin = 'round';

  /* legs: the far leg first, a little thinner */
  for (let i = 1; i >= 0; i--) {
    const L = legs[i];
    x.lineWidth = i ? 0.1 : 0.115;
    x.beginPath();
    x.moveTo(hip[0] + L[0][0], hip[1] + L[0][1]);
    x.lineTo(hip[0] + L[1][0], hip[1] + L[1][1]);
    x.lineTo(hip[0] + L[2][0], hip[1] + L[2][1]);
    x.stroke();
    /* a boot */
    x.beginPath();
    x.ellipse(hip[0] + L[2][0] + 0.05, hip[1] + L[2][1] + 0.02, 0.08, 0.04, 0, 0, Math.PI * 2);
    x.fill();
  }

  /* the cloak — a hood, shoulders and a hem that the wind and the pace lift behind */
  const fl = P.flutter, w = sin(opt.t * 7.3 + wx) * 0.05 * (0.4 + fl);
  const hemY = P.sit ? 0.02 - hipY : -0.3 - fl * 0.06;
  const back: V = [hip[0] - 0.24 - fl * 0.2 + w, hip[1] + hemY + fl * 0.12];
  const backMid: V = [hip[0] - 0.2 - fl * 0.14, hip[1] + 0.14];
  const front: V = [hip[0] + 0.18 + (P.sit ? 0.32 : 0), hip[1] + (P.sit ? 0.02 - hipY + 0.06 : -0.27)];
  x.beginPath();
  x.moveTo(head[0] - 0.05, head[1] + 0.13);
  x.quadraticCurveTo(neck[0] - 0.22, neck[1] + 0.02, backMid[0], backMid[1]);
  x.quadraticCurveTo(back[0] + 0.02, back[1] + 0.2, back[0], back[1]);
  /* a ragged hem */
  const n = 5;
  for (let i = 1; i <= n; i++) {
    const tx = lerp(back[0], front[0], i / n), ty = lerp(back[1], front[1], i / n);
    x.lineTo(tx - 0.03, ty + (i % 2 ? -0.05 : 0.01) + sin(opt.t * 5 + i) * 0.012 * fl);
  }
  x.quadraticCurveTo(neck[0] + 0.2, hip[1] + 0.2, neck[0] + 0.08, neck[1] - 0.04);
  x.lineTo(head[0] + 0.08, head[1] - 0.03);
  x.closePath();
  x.fill();

  /* the hood: a head with a peak that falls back */
  x.beginPath();
  x.arc(head[0], head[1], HEAD, 0, Math.PI * 2);
  x.fill();
  x.beginPath();
  x.moveTo(head[0] - 0.02, head[1] + HEAD);
  x.quadraticCurveTo(head[0] - 0.2, head[1] + 0.1, head[0] - 0.26 - fl * 0.08, head[1] - 0.06 + w);
  x.lineTo(head[0] - 0.06, head[1] - 0.04);
  x.fill();

  /* arm and staff */
  const sh: V = [neck[0] + 0.02, neck[1] - 0.07];
  const hand: V = [sh[0] + sin(P.arm) * 0.48, sh[1] - cos(P.arm) * 0.48];
  x.lineWidth = 0.085;
  x.beginPath(); x.moveTo(sh[0], sh[1]); x.lineTo(hand[0], hand[1]); x.stroke();
  let lantern: V | null = null;
  if (P.staff) {
    const top: V = [hand[0] + 0.12, hand[1] + 0.62];
    const foot: V = [hand[0] - 0.05, hand[1] - 0.86];
    x.lineWidth = 0.04;
    x.beginPath(); x.moveTo(foot[0], foot[1]); x.lineTo(top[0], top[1]);
    /* the hook */
    x.quadraticCurveTo(top[0] + 0.1, top[1] + 0.1, top[0] + 0.15, top[1] - 0.02);
    x.stroke();
    if (opt.lantern) {
      const sw = opt.swing ?? 0;
      const hook: V = [top[0] + 0.15, top[1] - 0.02];
      const lp: V = [hook[0] + sin(sw) * 0.2, hook[1] - cos(sw) * 0.2];
      x.lineWidth = 0.018;
      x.beginPath(); x.moveTo(hook[0], hook[1]); x.lineTo(lp[0], lp[1]); x.stroke();
      lantern = local(lp);
    }
  }
  x.restore();
  return lantern;

  /* local (figure) units back to world units, undoing rotation/face/scale */
  function local(q: V): V {
    const c = cos(-P.rot), si = sin(-P.rot);
    const rx = q[0] * c - q[1] * si, ry = q[0] * si + q[1] * c;
    return [wx + rx * face * s, wy + ry * s];
  }
}

/** the lantern itself: a small cage around a flame */
export function drawLantern(x: Ctx, M: (wx: number, wy: number) => V, k: number, at: V, lit: number, cage: string, flame: string) {
  const [sx, sy] = M(at[0], at[1] - 0.08);
  x.save();
  x.translate(sx, sy);
  x.scale(k, -k);
  x.fillStyle = cage;
  x.fillRect(-0.065, 0.06, 0.13, 0.03);
  x.fillRect(-0.06, -0.08, 0.12, 0.025);
  x.fillRect(-0.06, -0.08, 0.02, 0.16);
  x.fillRect(0.04, -0.08, 0.02, 0.16);
  if (lit > 0.02) {
    x.fillStyle = flame;
    x.beginPath(); x.ellipse(0, -0.005, 0.035, 0.05 * (0.7 + lit * 0.4), 0, 0, Math.PI * 2); x.fill();
  }
  x.restore();
}
