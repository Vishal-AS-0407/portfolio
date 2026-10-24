/* The world: sky, sun, five parallax planes and one village seen across one
   long day — intact, burning, ruined, built over by machines.
   Plane depth d scales and pans by k·d; its ground sits at hy + (gy − hy)·d.
   docs/design/inheritance-film.md §6 */
import { css, mix, type Grade, type RGB, EYE, HOT } from './grade';
import { fk, gait, drawFigure, P, lerpPose, type Pose, type Look, type Weapon, type Skin } from './cast';

type Ctx = CanvasRenderingContext2D;
const TAU = Math.PI * 2;

export type View = {
  W: number; H: number; k: number; kRef: number; cx: number; gy: number; hy: number;
  t: number; f: number; reduced: boolean; g: Grade;
};
export type Plane = { d: number; kd: number; base: number; X: (wx: number) => number; Y: (wy: number) => number };
export function plane(v: View, d: number): Plane {
  const kp = d >= 1 ? v.k * (1 + (d - 1) * 0.35) : v.kRef + (v.k - v.kRef) * d;
  const kd = kp * d;
  const base = d >= 1 ? v.gy + (d - 1) * (v.H - v.gy) * 0.55 : v.hy + (v.gy - v.hy) * d;
  return { d, kd, base, X: (wx) => v.W / 2 + (wx - v.cx) * kd, Y: (wy) => base - wy * kd };
}

/* seeded hash + value noise */
export const h1 = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const vn = (x: number) => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return h1(i) * (1 - u) + h1(i + 1) * u; };
const fbm = (x: number) => vn(x) * 0.6 + vn(x * 2.3 + 7) * 0.28 + vn(x * 5.1 + 3) * 0.12;
const sat = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const band = (a: number, b: number, x: number) => sat((x - a) / (b - a));

export type Era = { village: number; burn: number; ruin: number; city: number };
export function eraAt(f: number): Era {
  if (f < 0.21) return { village: 1, burn: 0, ruin: 0, city: 0 };
  if (f < 0.37) return { village: 1, burn: 1, ruin: 0, city: 0 };
  if (f < 0.79) return { village: 0, burn: 0, ruin: 1, city: 0 };
  return { village: 0, burn: 0, ruin: 1, city: 1 };
}

/* ── sky ── */
export function drawSky(x: Ctx, v: View) {
  const { W, H, g, hy } = v;
  const sk = x.createLinearGradient(0, 0, 0, Math.max(hy, 1));
  sk.addColorStop(0, css(g.top)); sk.addColorStop(0.62, css(g.mid)); sk.addColorStop(1, css(g.hor));
  x.fillStyle = sk; x.fillRect(0, 0, W, hy + 1);
  x.fillStyle = css(g.hor); x.fillRect(0, hy, W, H - hy);

  if (g.stars > 0.01) {
    for (let i = 0; i < 160; i++) {
      const sx = h1(i * 3.1) * W, sy = h1(i * 7.7) * hy * 0.85;
      const tw = v.reduced ? 0.7 : 0.55 + 0.45 * Math.sin(v.t * (1 + h1(i) * 2) + i);
      x.fillStyle = `rgba(232,228,245,${(g.stars * tw * (0.25 + h1(i * 1.3) * 0.6)).toFixed(3)})`;
      const s = h1(i * 9.1) > 0.92 ? 2 : 1.2;
      x.fillRect(sx, sy, s, s);
    }
  }

  /* sun (or moon, or eclipse) */
  const R = g.sunR * H;
  if (R < 0.5) return;
  const sx = g.sunX * W - v.cx * v.kRef * 0.012, sy = hy - g.sunAlt * H;
  if (g.rays > 0.01) {
    x.save(); x.translate(sx, sy);
    x.globalCompositeOperation = 'lighter';
    const rot = v.reduced ? 0 : v.t * 0.02;
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * TAU + rot + h1(i) * 0.3, w = 0.05 + h1(i * 5) * 0.07;
      x.fillStyle = css(g.sun, g.rays * 0.035);
      x.beginPath(); x.moveTo(0, 0);
      x.arc(0, 0, H * 1.4, a - w, a + w); x.closePath(); x.fill();
    }
    x.restore();
  }
  const glow = x.createRadialGradient(sx, sy, R * 0.5, sx, sy, R * 5);
  const gc: RGB = g.eclipse > 0.5 ? EYE : g.sun;
  glow.addColorStop(0, css(gc, 0.55 * g.glow)); glow.addColorStop(0.35, css(gc, 0.16 * g.glow)); glow.addColorStop(1, css(gc, 0));
  x.fillStyle = glow; x.fillRect(sx - R * 5, sy - R * 5, R * 10, R * 10);
  if (g.eclipse > 0.5) {
    x.fillStyle = css(EYE, 0.85);
    x.beginPath(); x.arc(sx, sy, R * 1.035, 0, TAU); x.fill();
    x.fillStyle = css(g.ink);
    x.beginPath(); x.arc(sx, sy, R, 0, TAU); x.fill();
  } else {
    x.fillStyle = css(g.sun);
    x.beginPath(); x.arc(sx, sy, R, 0, TAU); x.fill();
  }
}

/** a plane's ink: toward the haze with distance, toward the horizon at the far end */
export const planeCol = (g: Grade, a: number): RGB => mix(mix(g.ink, g.haze, a), g.hor, a * a * 0.45);

function ridge(x: Ctx, v: View, pl: Plane, col: RGB, amp: number, freq: number, seed: number, shape: (wx: number) => number = () => 1) {
  x.fillStyle = css(col);
  x.beginPath(); x.moveTo(0, v.H);
  const step = 6;
  for (let sx = -step; sx <= v.W + step; sx += step) {
    const wx = v.cx + (sx - v.W / 2) / pl.kd;
    const h = fbm(wx * freq + seed) * amp * shape(wx);
    x.lineTo(sx, pl.base - h * v.H * (pl.kd / (v.kRef * pl.d)));
  }
  x.lineTo(v.W, v.H); x.closePath(); x.fill();
}
function mist(x: Ctx, v: View, y: number, a: number, h = 0.12) {
  const m = x.createLinearGradient(0, y - v.H * h, 0, y + 2);
  m.addColorStop(0, css(v.g.haze, 0)); m.addColorStop(1, css(v.g.haze, a));
  x.fillStyle = m; x.fillRect(0, y - v.H * h, v.W, v.H * h + 2);
}

/* ── the far planes, with their set pieces ── */
export function drawFar(x: Ctx, v: View, e: Era) {
  const g = v.g;
  const p0 = plane(v, 0.05), p1 = plane(v, 0.11), p2 = plane(v, 0.25);
  ridge(x, v, p0, planeCol(g, 0.8), 0.2, 0.06, 11);
  mist(x, v, p0.base, 0.35, 0.08);
  ridge(x, v, p1, planeCol(g, 0.62), 0.12, 0.11, 37);
  if (e.city) towers(x, v, p1, planeCol(g, 0.6), 41, 0.55);
  mist(x, v, p1.base, 0.4, 0.07);
  ridge(x, v, p2, planeCol(g, 0.45), 0.065, 0.2, 73);
  /* hills: a windmill on the village side, machine towers later */
  const hc = planeCol(g, 0.45);
  if (e.village || e.ruin) windmill(x, v, p2, -8, hc, e);
  if (e.burn) fires(x, v, p2, [-14, -9, -5], 1.6);
  if (e.city) towers(x, v, p2, planeCol(g, 0.42), 9, 1);
  mist(x, v, p2.base, 0.45, 0.06);
}

function windmill(x: Ctx, v: View, pl: Plane, wx: number, col: RGB, e: Era) {
  const sx = pl.X(wx), by = pl.base - fbm(wx * 0.2 + 73) * 0.065 * v.H * (pl.kd / (v.kRef * pl.d)) + 2;
  const u = pl.kd;
  x.fillStyle = css(col);
  x.beginPath();
  x.moveTo(sx - 0.42 * u, by); x.lineTo(sx - 0.24 * u, by - 1.9 * u); x.lineTo(sx + 0.24 * u, by - 1.9 * u); x.lineTo(sx + 0.42 * u, by);
  x.closePath(); x.fill();
  x.beginPath(); x.moveTo(sx - 0.34 * u, by - 1.9 * u); x.lineTo(sx, by - 2.25 * u); x.lineTo(sx + 0.34 * u, by - 1.9 * u); x.fill();
  const hx = sx + 0.06 * u, hyy = by - 1.95 * u;
  const n = e.ruin ? 2 : 4;
  const a0 = e.ruin ? 0.9 : (v.reduced ? 0.3 : v.t * 0.45);
  x.strokeStyle = css(col); x.lineWidth = Math.max(1, 0.05 * u);
  for (let i = 0; i < n; i++) {
    const a = a0 + (i / 4) * TAU, L = (e.ruin && i === 1 ? 0.6 : 1.35) * u;
    const ex = hx + Math.cos(a) * L, ey = hyy + Math.sin(a) * L;
    x.beginPath(); x.moveTo(hx, hyy); x.lineTo(ex, ey); x.stroke();
    const nx = -Math.sin(a), ny = Math.cos(a);
    x.beginPath();
    x.moveTo(hx + Math.cos(a) * L * 0.3, hyy + Math.sin(a) * L * 0.3);
    x.lineTo(ex, ey); x.lineTo(ex + nx * 0.22 * u, ey + ny * 0.22 * u);
    x.lineTo(hx + Math.cos(a) * L * 0.3 + nx * 0.18 * u, hyy + Math.sin(a) * L * 0.3 + ny * 0.18 * u);
    x.fill();
  }
}

function towers(x: Ctx, v: View, pl: Plane, col: RGB, seed: number, scale: number) {
  const span = v.W / pl.kd + 4;
  const i0 = Math.floor(v.cx - span / 2), u = pl.kd;
  for (let i = i0; i < i0 + span; i += 1) {
    const r = h1(i * 3.7 + seed), r2 = h1(i * 1.9 + seed * 2);
    if (r < 0.35) continue;
    const sx = pl.X(i + r2 * 0.6), w = (0.35 + r * 0.5) * u * scale, h = (1.4 + r2 * 3.4) * u * scale;
    x.fillStyle = css(col);
    x.fillRect(sx, pl.base - h, w, h + 2);
    x.fillRect(sx + w * 0.42, pl.base - h - 0.6 * u * scale, Math.max(1, w * 0.1), 0.6 * u * scale);
    if (r2 > 0.4) x.fillRect(sx - w * 0.3, pl.base - h * 0.62, w * 1.6, Math.max(1, 0.08 * u * scale));
    const blink = v.reduced ? 1 : 0.5 + 0.5 * Math.sin(v.t * (1.5 + r) + i);
    x.fillStyle = css(EYE, 0.55 + 0.45 * blink);
    const s = Math.max(1.5, 0.07 * u * scale);
    x.fillRect(sx + w * 0.42, pl.base - h - 0.6 * u * scale - s, s, s);
  }
}

function fires(x: Ctx, v: View, pl: Plane, xs: number[], size: number) {
  const u = pl.kd * size;
  for (const [n, wx] of xs.entries()) {
    const sx = pl.X(wx), by = pl.base;
    /* smoke column first, then the flame */
    for (let i = 0; i < 9; i++) {
      const age = v.reduced ? i / 9 : (v.t * 0.08 + i / 9 + n * 0.3) % 1;
      x.fillStyle = css(v.g.ink, 0.28 * (1 - age));
      x.beginPath(); x.arc(sx - age * 2.4 * u, by - (0.4 + age * 3.2) * u, (0.25 + age * 0.9) * u, 0, TAU); x.fill();
    }
    x.save(); x.globalCompositeOperation = 'lighter';
    const fl = x.createRadialGradient(sx, by - 0.2 * u, 0, sx, by - 0.2 * u, 1.4 * u);
    fl.addColorStop(0, css(HOT, 0.75)); fl.addColorStop(1, css(HOT, 0));
    x.fillStyle = fl; x.fillRect(sx - 1.4 * u, by - 1.6 * u, 2.8 * u, 2.8 * u);
    x.restore();
    x.fillStyle = css(mix(HOT, v.g.sun, 0.4));
    x.beginPath(); x.moveTo(sx - 0.3 * u, by);
    for (let i = 0; i <= 6; i++) {
      const fx = sx - 0.3 * u + (i / 6) * 0.6 * u;
      const fh = (0.3 + 0.5 * Math.abs(Math.sin(i * 1.7 + (v.reduced ? 0 : v.t * 9) + n))) * u * (1 - Math.abs(i - 3) / 4);
      x.lineTo(fx, by - fh);
    }
    x.lineTo(sx + 0.3 * u, by); x.closePath(); x.fill();
  }
}

/* ── the ridge plane (d .5): houses, armies charging, distant duels ── */
const RIDGE_D = 0.5;
const ridgeShape = (wx: number) => 0.6 + 0.8 * Math.max(0, 1 - Math.abs(wx - 6) / 9);
function ridgeTop(v: View, pl: Plane, wx: number) {
  return pl.base - fbm(wx * 0.32 + 5) * 0.05 * ridgeShape(wx) * v.H * (pl.kd / (v.kRef * pl.d));
}
export function drawRidge(x: Ctx, v: View, e: Era, armies: number, machines: boolean, duelists: number) {
  const g = v.g, pl = plane(v, RIDGE_D);
  const col = planeCol(g, 0.26);
  ridge(x, v, pl, col, 0.05, 0.32, 5, ridgeShape);
  const u = pl.kd;
  /* a back row of houses in their era */
  for (const wx of [-7.5, -6.2, -4.4, -2.9, 9.5, 11.2]) {
    const by = ridgeTop(v, pl, wx) + 2, sx = pl.X(wx);
    house(x, sx, by, u * 0.9, col, e, wx);
  }
  if (e.burn) fires(x, v, pl, [-6.2, -2.9, 11.2], 0.8);
  /* armies: two lines charging each other across the ridge (3a, mirrored in 8a) */
  if (armies > 0) {
    const meet = 6, n = 13;
    for (let side = -1; side <= 1; side += 2) {
      for (let i = 0; i < n; i++) {
        const r = h1(i * 4.3 + side * 17);
        const dir = machines ? -side : side;
        const start = meet - dir * (7.5 + i * 0.75 + r * 0.6);
        const prog = Math.min(armies * (1.25 + r * 0.2), 1);
        let wx = start + dir * (7.2 + r * 0.4) * prog;
        if (prog >= 1) wx += Math.sin(v.t * 3 + i) * 0.05;
        const by = ridgeTop(v, pl, wx);
        const ph = (wx / 1.5) * TAU;
        let pose: Pose = gait(ph, 1);
        pose = pose.slice(); pose[2] = 1.25; pose[3] = 0.3;
        const banner = i % 5 === 2;
        if (banner) { pose[2] = 0.95; pose[3] = 0.4; }
        if (prog >= 1) pose = lerpPose(P.guard, P.slash, 0.5 + 0.5 * Math.sin(v.t * 4 + i * 1.7));
        figure(x, v, pl, wx, by, pose, dir as 1 | -1, machines ? 'drone' : 'soldier', banner ? 'banner' : 'spear', 0.9 + r * 0.15, col, machines);
      }
    }
  }
  /* distant pairs still fighting behind a duel — they fall one by one */
  if (duelists >= 0) {
    for (let i = 0; i < 5; i++) {
      const wx = -1.5 + i * 2.1 + h1(i * 9) * 0.6;
      for (let s = 0; s < 2; s++) {
        const fallAt = 0.25 + h1(i * 3 + s * 7) * 0.7;
        const down = s === 1 && duelists > fallAt;
        const by = ridgeTop(v, pl, wx + s * 0.5);
        const ph = v.reduced ? 0.5 : 0.5 + 0.5 * Math.sin(v.t * (3.4 + i * 0.3) + s * Math.PI + i);
        const pose = down ? P.fallen : lerpPose(P.guard, s ? P.slash : P.thrust, ph);
        figure(x, v, pl, wx + s * 0.5, by, pose, (s ? -1 : 1) as 1 | -1, machines ? 'drone' : 'soldier', 'spear', 0.95, col, machines);
      }
    }
  }
  mist(x, v, pl.base, 0.35, 0.05);
}

function house(x: Ctx, sx: number, by: number, u: number, col: RGB, e: Era, seed: number) {
  x.fillStyle = css(col);
  const w = (0.8 + h1(seed) * 0.4) * u, h = (0.5 + h1(seed * 2) * 0.2) * u;
  if (e.city) {
    /* the machines' blocks where the houses were */
    x.fillRect(sx - w * 0.6, by - h * 2.8, w * 1.2, h * 2.8);
    x.fillStyle = css(EYE, 0.8); x.fillRect(sx - w * 0.1, by - h * 2.5, Math.max(1.5, u * 0.06), Math.max(1.5, u * 0.06));
    return;
  }
  if (e.ruin) {
    x.fillRect(sx - w / 2, by - h * 0.55, w * 0.12, h * 0.55);
    x.fillRect(sx + w * 0.38, by - h * 0.9, w * 0.12, h * 0.9);
    x.save(); x.translate(sx, by - h * 0.8); x.rotate(-0.35);
    x.fillRect(-w * 0.5, -u * 0.03, w * 0.9, u * 0.05); x.restore();
    return;
  }
  x.fillRect(sx - w / 2, by - h, w, h);
  x.beginPath(); x.moveTo(sx - w * 0.62, by - h); x.lineTo(sx, by - h - w * 0.55); x.lineTo(sx + w * 0.62, by - h); x.fill();
}

function figure(x: Ctx, v: View, pl: Plane, wx: number, by: number, pose: Pose, face: 1 | -1, look: Look, weapon: Weapon, sc: number, col: RGB, machine: boolean) {
  const j = fk(pose, face);
  let lo = Infinity;
  for (const q of Object.values(j)) lo = Math.min(lo, q.y);
  const s = machine ? sc * 1.5 : sc;
  const U = pl.kd * s;
  const sx = pl.X(wx);
  const M = (q: { x: number; y: number }): [number, number] => [sx + q.x * U, by - (q.y - lo) * U];
  const c = css(col);
  const skin: Skin = {
    look, ink: c, back: c, weapon: machine ? null : weapon, grip: 0.25, helmet: look === 'soldier',
    t: v.t + wx, seam: 0, eye: machine ? 1 : 0, seamCol: '', eyeCol: css(EYE), build: 1, heat: 0, heatCol: '',
  };
  drawFigure(x, j, M, U, face, skin);
}

/* ── the action plane: its ground, and the props the cast stands among ── */
export function drawGround(x: Ctx, v: View, e: Era) {
  const g = v.g, pl = plane(v, 1);
  x.fillStyle = css(g.ink);
  x.beginPath(); x.moveTo(0, v.H);
  for (let sx = -8; sx <= v.W + 8; sx += 8) {
    const wx = v.cx + (sx - v.W / 2) / pl.kd;
    x.lineTo(sx, v.gy - (fbm(wx * 1.3) - 0.5) * 0.035 * pl.kd);
  }
  x.lineTo(v.W, v.H); x.closePath(); x.fill();
  /* grass, rubble or scrap along the edge */
  const span = v.W / pl.kd + 2, i0 = Math.floor((v.cx - span / 2) * 6);
  x.strokeStyle = css(g.ink); x.lineWidth = Math.max(1, pl.kd * 0.008);
  for (let i = i0; i < i0 + span * 6; i++) {
    const r = h1(i * 2.17);
    if (r < 0.45) continue;
    const wx = i / 6 + r * 0.1, sx = pl.X(wx), sy = v.gy - (fbm(wx * 1.3) - 0.5) * 0.035 * pl.kd + 1;
    if (e.village || e.burn) {
      const hh = (0.04 + r * 0.06) * pl.kd, sway = v.reduced ? 0 : Math.sin(v.t * 1.6 + wx * 2) * hh * 0.25;
      x.beginPath(); x.moveTo(sx, sy); x.quadraticCurveTo(sx + sway * 0.5, sy - hh * 0.6, sx + sway + (r - 0.7) * hh, sy - hh); x.stroke();
    } else {
      x.fillStyle = css(g.ink);
      const s = (0.015 + r * 0.03) * pl.kd;
      x.beginPath(); x.moveTo(sx - s, sy); x.lineTo(sx - s * 0.2, sy - s * (0.6 + r)); x.lineTo(sx + s, sy); x.fill();
    }
  }
}

/** the forge, the huts, the well, the tree — behind the cast */
export function drawSet(x: Ctx, v: View, e: Era, glow: number) {
  const g = v.g, pl = plane(v, 1), u = pl.kd;
  const X = pl.X, Y = pl.Y;
  const ink = css(g.ink);
  x.fillStyle = ink;
  /* forge: hearth, chimney, anvil */
  const hx0 = X(1.0), hx1 = X(1.5);
  x.fillRect(hx0, Y(0.42), hx1 - hx0, 0.42 * u + 2);
  if (e.ruin) {
    x.beginPath(); x.moveTo(X(1.3), Y(0.42)); x.lineTo(X(1.3), Y(1.18)); x.lineTo(X(1.36), Y(1.08)); x.lineTo(X(1.41), Y(1.24)); x.lineTo(X(1.46), Y(1.0)); x.lineTo(X(1.46), Y(0.42)); x.fill();
  } else {
    x.fillRect(X(1.3), Y(1.55), X(1.46) - X(1.3), 1.13 * u);
    x.fillRect(X(1.27), Y(1.6), X(1.49) - X(1.27), 0.07 * u);
  }
  /* the hearth's mouth and its fire */
  const mouth = { x0: X(1.08), x1: X(1.27), y0: Y(0.3), y1: Y(0.1) };
  if (glow > 0.01) {
    const fl = v.reduced ? 1 : 0.8 + 0.2 * Math.sin(v.t * 13) * Math.sin(v.t * 7.3);
    x.save(); x.globalCompositeOperation = 'lighter';
    const cx = (mouth.x0 + mouth.x1) / 2, cy = (mouth.y0 + mouth.y1) / 2;
    const gr = x.createRadialGradient(cx, cy, 0, cx, cy, 0.9 * u);
    gr.addColorStop(0, css(HOT, 0.5 * glow * fl)); gr.addColorStop(1, css(HOT, 0));
    x.fillStyle = gr; x.fillRect(cx - 0.9 * u, cy - 0.9 * u, 1.8 * u, 1.8 * u);
    x.restore();
    x.fillStyle = css(mix(HOT, g.sun, 0.25), glow * fl);
  } else x.fillStyle = '#000';
  x.fillRect(mouth.x0, mouth.y0, mouth.x1 - mouth.x0, mouth.y1 - mouth.y0);
  x.fillStyle = ink;
  /* anvil */
  const ax = X(0.62);
  x.fillRect(ax - 0.05 * u, Y(0.22), 0.1 * u, 0.22 * u);
  x.beginPath();
  x.moveTo(ax - 0.16 * u, Y(0.22)); x.lineTo(ax - 0.1 * u, Y(0.3)); x.lineTo(ax + 0.14 * u, Y(0.3)); x.lineTo(ax + 0.2 * u, Y(0.27)); x.lineTo(ax + 0.12 * u, Y(0.22));
  x.closePath(); x.fill();
  x.fillRect(ax - 0.09 * u, Y(0.04), 0.18 * u, 0.04 * u);

  /* huts on the action plane */
  for (const [wx, w] of [[-2.7, 1.1], [-4.8, 0.9], [-7.0, 1.2]] as const) {
    const sx = X(wx), wd = w * u, hh = 0.62 * u;
    if (e.city) {
      x.fillRect(sx - wd * 0.3, Y(0.25), wd * 0.6, 0.25 * u);
      continue;
    }
    if (e.ruin) {
      x.fillRect(sx - wd / 2, Y(0.5), 0.05 * u, 0.5 * u);
      x.fillRect(sx + wd / 2 - 0.05 * u, Y(0.35), 0.05 * u, 0.35 * u);
      x.save(); x.translate(sx, Y(0.48)); x.rotate(0.28);
      x.fillRect(-wd * 0.55, -0.02 * u, wd, 0.04 * u); x.restore();
      x.fillRect(sx - wd / 2, Y(0.12), wd, 0.12 * u);
      continue;
    }
    x.fillRect(sx - wd / 2, Y(0.62), wd, hh + 1);
    x.beginPath(); x.moveTo(sx - wd * 0.66, Y(0.6)); x.lineTo(sx, Y(0.6) - wd * 0.62); x.lineTo(sx + wd * 0.66, Y(0.6)); x.fill();
    /* a lit window in the village */
    if (e.village && !e.burn) {
      x.fillStyle = css(mix(HOT, g.sun, 0.5), 0.55);
      x.fillRect(sx - wd * 0.12, Y(0.42), wd * 0.14, 0.12 * u);
      x.fillStyle = ink;
    }
    if (e.burn) fires(x, v, pl, [wx], 0.35);
    x.fillStyle = ink;
  }
  /* well */
  if (!e.city) {
    const wx = X(-1.55);
    x.fillRect(wx - 0.16 * u, Y(0.22), 0.32 * u, 0.22 * u);
    if (!e.ruin) {
      x.fillRect(wx - 0.15 * u, Y(0.55), 0.03 * u, 0.33 * u); x.fillRect(wx + 0.12 * u, Y(0.55), 0.03 * u, 0.33 * u);
      x.beginPath(); x.moveTo(wx - 0.24 * u, Y(0.52)); x.lineTo(wx, Y(0.66)); x.lineTo(wx + 0.24 * u, Y(0.52)); x.fill();
    }
  }
  /* the tree at the edge of the field */
  const tx = X(4.9);
  x.fillRect(tx - 0.035 * u, Y(0.9), 0.07 * u, 0.9 * u);
  if (e.village && !e.burn) {
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * TAU, r = (0.24 + h1(i) * 0.12) * u;
      const sway = v.reduced ? 0 : Math.sin(v.t * 0.9 + i) * 0.01 * u;
      x.beginPath(); x.arc(tx + Math.cos(a) * 0.22 * u + sway, Y(1.1) + Math.sin(a) * 0.14 * u, r, 0, TAU); x.fill();
    }
  } else {
    x.strokeStyle = ink; x.lineWidth = Math.max(1, 0.025 * u); x.lineCap = 'round';
    for (const [a, l] of [[-0.6, 0.45], [0.5, 0.4], [-0.15, 0.55], [0.9, 0.25]] as const) {
      x.beginPath(); x.moveTo(tx, Y(0.75)); x.lineTo(tx + Math.sin(a) * l * u, Y(0.75) - Math.cos(a) * l * u); x.stroke();
    }
    if (e.burn) fires(x, v, pl, [4.9], 0.3);
  }
  /* fence */
  if (e.village) {
    for (let i = 0; i < 6; i++) x.fillRect(X(-3.6 - i * 0.22), Y(0.26), 0.025 * u, 0.26 * u);
    x.fillRect(X(-4.75), Y(0.2), 1.15 * u, 0.025 * u);
  }
}

/** the dead of the war, its weapons, its torn banners — the field from shot 4 on */
export function drawBattlefield(x: Ctx, v: View, e: Era) {
  if (!e.ruin) return;
  const g = v.g, pl = plane(v, 1), u = pl.kd, ink = css(g.ink);
  x.fillStyle = ink; x.strokeStyle = ink;
  /* bodies: low mounds */
  for (const wx of [-0.9, 1.75, 2.3, 4.0, 4.6, 5.7, -2.2]) {
    const sx = pl.X(wx);
    x.beginPath(); x.ellipse(sx, v.gy, 0.28 * u, 0.07 * u, 0, Math.PI, 0); x.fill();
    x.beginPath(); x.arc(sx + 0.25 * u, v.gy - 0.04 * u, 0.06 * u, 0, TAU); x.fill();
  }
  /* spears in the ground */
  x.lineWidth = Math.max(1, 0.016 * u); x.lineCap = 'butt';
  for (const [wx, a, l] of [[-1.2, 0.35, 0.9], [2.05, -0.25, 1.05], [3.7, 0.18, 0.8], [5.2, -0.4, 0.95], [0.1, 0.12, 0.7]] as const) {
    const sx = pl.X(wx), ex = sx + Math.sin(a) * l * u, ey = v.gy - Math.cos(a) * l * u;
    x.beginPath(); x.moveTo(sx, v.gy); x.lineTo(ex, ey); x.stroke();
    x.beginPath(); x.moveTo(ex - 0.02 * u, ey); x.lineTo(ex + Math.sin(a) * 0.09 * u, ey - Math.cos(a) * 0.09 * u); x.lineTo(ex + 0.02 * u, ey); x.fill();
  }
  /* shields */
  for (const wx of [1.95, 4.3]) { x.beginPath(); x.ellipse(pl.X(wx), v.gy - 0.05 * u, 0.12 * u, 0.06 * u, 0.2, 0, TAU); x.fill(); }
  /* torn banners on their poles */
  for (const wx of [3.95, -0.5]) {
    const sx = pl.X(wx);
    x.fillRect(sx, v.gy - 1.25 * u, 0.02 * u, 1.25 * u);
    const top = v.gy - 1.2 * u;
    x.beginPath(); x.moveTo(sx, top);
    for (let i = 0; i <= 6; i++) {
      const k = i / 6, fl = v.reduced ? 0 : Math.sin(v.t * 4 - i * 0.9) * 0.03 * u * k;
      x.lineTo(sx - k * 0.42 * u, top + fl + k * 0.05 * u);
    }
    for (let i = 6; i >= 0; i--) {
      const k = i / 6, fl = v.reduced ? 0 : Math.sin(v.t * 4 - i * 0.9 + 0.4) * 0.03 * u * k;
      const tear = i % 2 ? 0.06 : 0.14;
      x.lineTo(sx - k * 0.42 * u, top + (0.22 - tear * k) * u + fl);
    }
    x.closePath(); x.fill();
  }
  /* machine wrecks in the machine age */
  if (e.city) {
    for (const wx of [0.8, 1.6, 5.0, 5.6]) {
      const sx = pl.X(wx);
      x.beginPath(); x.moveTo(sx - 0.35 * u, v.gy); x.lineTo(sx - 0.2 * u, v.gy - 0.22 * u); x.lineTo(sx + 0.05 * u, v.gy - 0.3 * u); x.lineTo(sx + 0.3 * u, v.gy - 0.12 * u); x.lineTo(sx + 0.4 * u, v.gy); x.fill();
      x.fillStyle = css(EYE, 0.25); x.fillRect(sx - 0.02 * u, v.gy - 0.2 * u, 0.04 * u, 0.02 * u); x.fillStyle = ink;
    }
  }
}

/** foreground plane: dark shapes passing fast, out of focus */
export function drawFore(x: Ctx, v: View, e: Era) {
  const pl = plane(v, 1.7), u = pl.kd;
  x.fillStyle = css(mix(v.g.ink, [0, 0, 0], 0.35));
  const span = v.W / u + 4, i0 = Math.floor(v.cx - span / 2) - 1;
  for (let i = i0; i < i0 + span + 2; i++) {
    const r = h1(i * 5.3 + 2);
    if (r < 0.62) continue;
    const sx = pl.X(i + r), by = pl.base + 0.05 * u;
    if (e.village || e.burn) {
      for (let b = 0; b < 9; b++) {
        const hh = (0.12 + h1(i * 7 + b) * 0.22) * u, ox = (b - 4) * 0.035 * u;
        const sway = v.reduced ? 0 : Math.sin(v.t * 1.3 + b + i) * 0.03 * u;
        x.beginPath(); x.moveTo(sx + ox - 0.012 * u, by); x.quadraticCurveTo(sx + ox + sway * 0.5, by - hh * 0.6, sx + ox + sway + (b - 4) * 0.02 * u, by - hh); x.lineTo(sx + ox + 0.012 * u, by); x.fill();
      }
    } else {
      x.beginPath(); x.moveTo(sx - 0.3 * u, by); x.lineTo(sx - 0.1 * u, by - (0.12 + r * 0.15) * u); x.lineTo(sx + 0.18 * u, by - 0.08 * u); x.lineTo(sx + 0.32 * u, by); x.fill();
    }
  }
}

/* ── weather and life: birds, smoke, embers, ash, arrows, bolts, crows ── */
export function drawAir(x: Ctx, v: View, e: Era, opt: { birds: number; ash: number; embers: number; smoke: number }) {
  const { W, H, t, g } = v;
  const pl = plane(v, 1);
  if (opt.smoke > 0) {
    /* the forge chimney breathes while the village lives */
    const cx = pl.X(1.38), cy = pl.Y(1.6);
    for (let i = 0; i < 12; i++) {
      const age = v.reduced ? i / 12 : (t * 0.1 + i / 12) % 1;
      x.fillStyle = css(mix(g.haze, g.hor, 0.4), 0.22 * (1 - age) * opt.smoke);
      x.beginPath(); x.arc(cx - age * 1.1 * pl.kd, cy - age * 1.3 * pl.kd, (0.05 + age * 0.3) * pl.kd, 0, TAU); x.fill();
    }
  }
  if (opt.birds > 0) {
    x.strokeStyle = css(g.ink, 0.75); x.lineWidth = 1.4; x.lineJoin = 'round';
    for (let i = 0; i < 9; i++) {
      const sp = 22 + h1(i) * 16;
      const bx = ((h1(i * 3) * W + (v.reduced ? 0 : t * sp)) % (W + 80)) - 40;
      const by = v.hy - H * (0.18 + h1(i * 5) * 0.3) + Math.sin(t * 0.7 + i) * 6;
      const s = 4 + h1(i * 7) * 4, fl = v.reduced ? 0.4 : Math.sin(t * 9 + i * 2) * 0.8;
      x.beginPath(); x.moveTo(bx - s, by - s * fl * 0.6); x.lineTo(bx, by); x.lineTo(bx + s, by - s * fl * 0.6); x.stroke();
    }
  }
  if (opt.embers > 0) {
    x.save(); x.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 70; i++) {
      const age = v.reduced ? h1(i) : (t * (0.08 + h1(i) * 0.08) + h1(i * 2)) % 1;
      const ex = h1(i * 4.4) * W + Math.sin(t + i) * 20 - age * 80, ey = H - age * H * 1.05;
      x.fillStyle = css(mix(HOT, g.sun, h1(i * 3)), (1 - age) * 0.8 * opt.embers);
      x.fillRect(ex, ey, 2, 2);
    }
    x.restore();
  }
  if (opt.ash > 0) {
    for (let i = 0; i < 140; i++) {
      const age = v.reduced ? h1(i * 1.1) : (t * (0.03 + h1(i) * 0.04) + h1(i * 2)) % 1;
      const ax = (h1(i * 4.4) * W + Math.sin(t * 0.6 + i) * 30 - age * 120 + W) % W, ay = age * H;
      const light = h1(i * 8) > 0.5;
      x.fillStyle = light ? css(g.sun, 0.5 * opt.ash) : css(g.ink, 0.45 * opt.ash);
      const s = 1 + h1(i * 6) * 2;
      x.fillRect(ax, ay, s, s);
    }
  }
}

/** the volley over the ridge: arrows in 3a, red bolts in 8a. u is the sub-shot's progress */
export function drawVolley(x: Ctx, v: View, u: number, bolts: boolean) {
  const { W, H, hy } = v;
  for (let i = 0; i < 28; i++) {
    const u0 = 0.12 + h1(i * 2.1) * 0.45, dur = bolts ? 0.18 : 0.38;
    const s = (u - u0) / dur;
    if (s <= 0 || s >= 1) continue;
    const dir = bolts ? 1 : -1;
    const x0 = dir < 0 ? W * (1.05 + h1(i) * 0.2) : -W * (0.05 + h1(i) * 0.2);
    const x1 = dir < 0 ? W * (-0.1 + h1(i * 3) * 0.5) : W * (0.6 + h1(i * 3) * 0.5);
    const px = x0 + (x1 - x0) * s;
    const arc = bolts ? 0.08 : 0.32 + h1(i * 5) * 0.12;
    const py = hy - H * (0.05 + arc * Math.sin(Math.PI * s)) + H * 0.12 * s;
    const vx = (x1 - x0), vy = -H * arc * Math.PI * Math.cos(Math.PI * s) + H * 0.12;
    const l = Math.hypot(vx, vy) || 1, L = bolts ? 46 : 22;
    if (bolts) {
      x.save(); x.globalCompositeOperation = v.g.tone ? 'source-over' : 'lighter';
      x.strokeStyle = css(EYE, 0.9); x.lineWidth = 2;
    } else { x.save(); x.strokeStyle = css(v.g.ink, 0.9); x.lineWidth = 1.5; }
    x.beginPath(); x.moveTo(px, py); x.lineTo(px - (vx / l) * L, py - (vy / l) * L); x.stroke();
    x.restore();
  }
}

/** crows on a broken post that lift as he passes */
export function drawCrows(x: Ctx, v: View, lift: number) {
  const pl = plane(v, 1), u = pl.kd;
  const px = pl.X(2.2);
  x.fillStyle = css(v.g.ink);
  x.fillRect(px - 0.02 * u, v.gy - 0.6 * u, 0.04 * u, 0.6 * u);
  for (let i = 0; i < 3; i++) {
    const k = sat((lift - i * 0.06) / 0.5);
    const bx = px + (i - 1) * 0.07 * u - k * (0.8 + i * 0.5) * u * 1.6;
    const by = v.gy - 0.62 * u - k * (1.2 + i * 0.4) * u;
    if (k <= 0) {
      x.beginPath(); x.ellipse(bx, by - 0.035 * u, 0.04 * u, 0.03 * u, 0, 0, TAU); x.fill();
      x.beginPath(); x.arc(bx + 0.035 * u, by - 0.06 * u, 0.018 * u, 0, TAU); x.fill();
    } else {
      const fl = v.reduced ? 0.5 : Math.sin(v.t * 14 + i * 2);
      x.beginPath(); x.moveTo(bx - 0.09 * u, by - fl * 0.05 * u); x.lineTo(bx, by + 0.015 * u); x.lineTo(bx + 0.09 * u, by - fl * 0.05 * u); x.lineTo(bx, by - 0.01 * u); x.fill();
    }
  }
}

export { band };
