/* Paints one frame of Descent into the scene buffer. Nothing here is visible:
   the buffer is read by the stipple printer (printer.ts), so its channels are
   meanings, not colours —
     R  how much matter (dot size)
     G  light (added; tints dots toward magma and blooms)
     B  material, as a ratio of R: 0 world · .25 people · .5 echo · .75 flame · 1 water
   Planes, far → near: ridges (.14) · hills (.38) · the loss surface (1). */
import {
  ground, slope, traveller, camera, lanternSet, xAt, fogAt, rainAt, windAt, LIGHTNING, SHATTER,
  SETTLED, FIRE, childX, ECHOES, echoAlive, LAKE, CAIRN, hash, fbm, noise, ss, sat, lerp, clamp,
} from './world';
import { pose, drawFigure, drawLantern, type Ctx } from './figure';
import { createMotes } from './motes';

type V = [number, number];
export type FrameIn = { W: number; H: number; top: number; band: number; p: number; t: number; dt: number; intro: number; still: boolean; dpr: number; ink: RGB };
export type FrameOut = { flash: number; fog: number; wind: number; motes: Float32Array; moteCount: number };
type RGB = [number, number, number];
const EMBER: RGB = [0.996, 0.624, 0.427], CORE: RGB = [0.988, 0.992, 0.749], ECHO_C: RGB = [0.871, 0.288, 0.409];

const WORLD = (d: number) => { const r = Math.round(sat(d) * 255); return `rgb(${r},0,0)`; };
const PERSON = (d: number) => { const r = Math.round(sat(d) * 255); return `rgb(${r},0,${Math.round(r * 0.25)})`; };
const ECHO = (d: number) => { const r = Math.round(sat(d) * 255); return `rgb(${r},0,${Math.round(r * 0.5)})`; };
const FLAME = (d: number) => { const r = Math.round(sat(d) * 255); return `rgb(${r},0,${Math.round(r * 0.75)})`; };
const WATER = (d: number) => { const r = Math.round(sat(d) * 255); return `rgb(${r},0,${r})`; };

export function createPainter() {
  const motes = createMotes();
  const out = new Float32Array(2400 * 7 + 64);
  let lastP = -1, flashT = 0, bolt = { x: 0, seed: 0 }, swing = 0, swingV = 0, lastX = 0, fliesOn = false;

  function paint(x: Ctx, f: FrameIn): FrameOut {
    const { W, H, top, band, p, t, dt, still } = f;
    const k = band / 4.5;
    const gy0 = top + band * 0.66;
    const cam = camera(p);
    const wind = windAt(p), fog = fogAt(p), rain = rainAt(p);
    const tr = traveller(p);
    const fwd = !still && lastP >= 0 && p > lastP && p - lastP < 0.02;

    /* plane mapping: world/plane units → css px */
    const plane = (r: number) => (px: number, py: number): V => [W / 2 + (px - cam.x * r) * k, gy0 - (py - cam.y * r) * k];
    const M = plane(1);
    const toW = (sx: number) => (sx - W / 2) / k + cam.x;
    const x0 = toW(-20), x1 = toW(W + 20);

    x.setTransform(1, 0, 0, 1, 0, 0);
    x.globalCompositeOperation = 'source-over';
    x.fillStyle = '#000'; x.fillRect(0, 0, x.canvas.width, x.canvas.height);
    const sc = x.canvas.width / W;
    x.setTransform(sc, 0, 0, sc, 0, 0);

    /* ── far ridges ─────────────────────────────────────────────── */
    const far = plane(0.14);
    const farH = (q: number) => 1.55 + fbm(q * 0.11 + 3) * 1.6 + Math.pow(Math.max(0, noise(q * 0.045 + 9)), 2) * 2.6;
    ridge(x, far, (q) => farH(q), 0.14, 0.13, 0.04, W, k, cam.x, 1.6);
    /* the new light, on the highest peak in view, at the very end */
    if (p > 0.978) {
      let bq = 0, bh = -1e9;
      const qa = cam.x * 0.14 + (W * 0.05) / k, qb = cam.x * 0.14 + (W * 0.45) / k;
      for (let q = qa; q < qb; q += 0.1) { const h = farH(q); if (h > bh) { bh = h; bq = q; } }
      const [lx, ly] = far(bq, bh + 0.06);
      const a = ss(0.978, 0.995, p) * (still ? 1 : 0.75 + 0.25 * Math.sin(t * 3.1));
      x.fillStyle = FLAME(a); x.beginPath(); x.arc(lx, ly - 3, 3.4, 0, Math.PI * 2); x.fill();
      x.globalCompositeOperation = 'lighter';
      glow(x, lx, ly - 3, 0.9 * k * a, a);
      glow(x, lx, ly - 3, 2.4 * k * a, 0.5 * a);
      x.globalCompositeOperation = 'source-over';
    }

    /* ── hills ──────────────────────────────────────────────────── */
    const mid = plane(0.38);
    ridge(x, mid, (q) => 2.3 + fbm(q * 0.19 + 41) * 1.25, 0.38, 0.24, 0.07, W, k, cam.x, 1.9);
    hillProps(x, mid, p, cam.x * 0.38, W, k, t, wind);

    /* ── the loss surface ───────────────────────────────────────── */
    const xs: number[] = [];
    for (let q = x0; q <= x1; q += 0.12) xs.push(q);
    const layers: [number, number][] = [[2.4, 0.07], [1.0, 0.2], [0.38, 0.46]];
    for (const [depth, d] of layers) {
      x.fillStyle = WORLD(d);
      x.beginPath();
      xs.forEach((q, i) => { const [sx, sy] = M(q, ground(q)); i ? x.lineTo(sx, sy) : x.moveTo(sx, sy); });
      for (let i = xs.length - 1; i >= 0; i--) { const q = xs[i]; const [sx, sy] = M(q, ground(q) - depth * (0.8 + 0.2 * noise(q * 0.7))); x.lineTo(sx, sy); }
      x.closePath(); x.fill();
    }
    x.strokeStyle = WORLD(1); x.lineWidth = 0.1 * k; x.lineJoin = 'round';
    x.beginPath();
    xs.forEach((q, i) => { const [sx, sy] = M(q, ground(q) - 0.05); i ? x.lineTo(sx, sy) : x.moveTo(sx, sy); });
    x.stroke();

    /* the lake: a still band of water below the causeway */
    if (x1 > LAKE.x0 && x0 < LAKE.x1) {
      const [ax, ay] = M(LAKE.x0, LAKE.y), [bx] = M(LAKE.x1, LAKE.y);
      const g = x.createLinearGradient(0, ay, 0, ay + 1.8 * k);
      g.addColorStop(0, WATER(0.42)); g.addColorStop(1, WATER(0));
      x.fillStyle = g; x.fillRect(ax, ay, bx - ax, 1.8 * k);
      /* ripples: thin gaps that drift */
      x.globalCompositeOperation = 'destination-out';
      for (let i = 0; i < 7; i++) {
        const yy = ay + (0.12 + i * 0.2) * k, off = still ? 0 : (t * (12 + i * 3)) % 60;
        x.fillStyle = 'rgba(0,0,0,.85)';
        for (let sx = ax - 60 + off; sx < bx; sx += 60) x.fillRect(sx + hash(i * 7) * 20, yy, 18 + hash(i) * 14, 0.9);
      }
      x.globalCompositeOperation = 'source-over';
    }

    props(x, M, p, k, t, wind, x0, x1, still);

    /* ── people ─────────────────────────────────────────────────── */
    /* the Settled, around their fire */
    if (x1 > 35 && x0 < 50) {
      SETTLED.forEach((s, i) => {
        if (i === 2) {
          const cx = childX(p);
          const moving = p > 0.39 && p < 0.414;
          const m = p < 0.388 ? 'sit' : p < 0.393 ? 'rise' : moving ? 'walk' : 'stand';
          const u = m === 'rise' ? sat((p - 0.388) / 0.005) : 0;
          const P = pose(m, u, cx, moving ? 30 : 0, wind, t + i, 0);
          drawFigure(x, M, k, cx, ground(cx), m === 'sit' ? -1 : 1, P, PERSON(0.78), { scale: s.scale, t: t + i });
        } else {
          const P = pose('sit', 1, s.x, 0, wind, t + i * 2.1, 0);
          P.lean += s.lean;
          drawFigure(x, M, k, s.x, ground(s.x), s.face, P, PERSON(0.8), { scale: s.scale, t: t + i });
        }
      });
    }

    /* the echoes: its own steps, walked the other way */
    const ea = echoAlive(p);
    const echoPos: V[] = [];
    if (ea > 0.01) {
      ECHOES.forEach((e) => {
        const ex = 2 * 106.5 - tr.x + e.off;
        if (ex < x0 - 2 || ex > x1 + 2) return;
        const P = pose('walk', 0, tr.x, 34, wind, t, 0);
        drawFigure(x, M, k, ex, ground(ex), -1, P, ECHO(0.82 * e.alpha * ea), { t, lantern: false });
        echoPos.push([ex, ground(ex)]);
        reflect(ex, -1, P, ECHO(0.3 * e.alpha * ea));
      });
    }
    if (fwd && lastP < SHATTER && p >= SHATTER) {
      ECHOES.forEach((e) => {
        const ex = 2 * 106.5 - xAt(SHATTER) + e.off;
        for (let i = 0; i < 70; i++) motes.add('shard', ex + (Math.random() - 0.5) * 0.5, ground(ex) + Math.random() * 1.6, (Math.random() - 0.5) * 3.2, Math.random() * 2.2, 1.4 + Math.random() * 1.4, 1);
      });
    }

    /* the traveller */
    const sAhead = -slope(tr.x + tr.face * 0.6) * tr.face;
    const P = pose(tr.m, tr.u, tr.x, tr.speed, wind, t, -sAhead);
    /* the lantern swings: driven by changes of pace and the wind */
    if (!still) {
      const acc = (tr.x - lastX) / Math.max(dt, 1e-3);
      swingV += (-swing * 30 - swingV * 3.2 - clamp(acc * 0.002, -1, 1) * 8 + Math.sin(t * 2.2) * wind * 6) * dt;
      swing = clamp(swing + swingV * dt, -0.9, 0.9);
      lastX = tr.x;
    }
    const dis = tr.dissolve;
    const body = PERSON(1 - dis);
    const intro = f.intro;
    let lantern = drawFigure(x, M, k, tr.x, tr.y, tr.face, P, body, { t, lantern: true, swing: still ? 0.08 : swing + 0.08 });
    if (!P.staff) lantern = [tr.x + tr.face * 0.5, tr.y + 0.1];
    const setU = lanternSet(p);
    const cairnTop: V = [CAIRN, ground(CAIRN) + 0.66];
    if (lantern && setU > 0) lantern = [lerp(lantern[0], cairnTop[0], setU), lerp(lantern[1], cairnTop[1], setU)];
    if (p >= 0.952) lantern = cairnTop;
    if (LAKE.x0 < tr.x && tr.x < LAKE.x1) reflect(tr.x, tr.face, P, PERSON(0.34 * (1 - dis)));

    /* dissolving: points leave the body and rise out of the strip, into the page */
    if (dis > 0 && dis < 1 && !still) {
      const n = Math.round((fwd ? 160 : 40) * dt * 4);
      for (let i = 0; i < n; i++) motes.add('rise', tr.x + (Math.random() - 0.4) * 0.5, tr.y + Math.random() * 1.0, (Math.random() - 0.5) * 0.4, 0.6 + Math.random() * 1.2, 2.4 + Math.random() * 2.2, 1);
    }

    /* ── light ──────────────────────────────────────────────────── */
    x.globalCompositeOperation = 'lighter';
    const lit = (p < 0.075 ? intro : 1) * (p >= 0.952 ? 0.85 : tr.light);
    if (lantern) {
      const [lx, ly] = M(lantern[0], lantern[1] - 0.08);
      /* the cone falls the way the ground falls */
      const dir = Math.atan2(slope(tr.x + tr.face) * tr.face, tr.face);
      if (p < 0.94 && lit > 0.05) cone(x, lx, ly, dir, (1.1 + lit * 3.4) * k, 0.38 + lit * 0.12, lit * 0.75);
      glow(x, lx, ly, (0.7 + lit * 1.9) * k, Math.min(1, 0.25 + lit * 0.9));
    }
    if (x1 > 36 && x0 < 48) {
      const [fx, fy] = M(FIRE, ground(FIRE) + 0.2);
      const fl = still ? 1 : 0.85 + 0.15 * Math.sin(t * 11) * Math.sin(t * 7.3);
      glow(x, fx, fy, 2.6 * k * fl, 0.85);
    }
    if (x1 > CAIRN - 4 && x0 < CAIRN + 4) {
      const [cx, cy] = M(CAIRN, ground(CAIRN) + 0.35);
      glow(x, cx, cy, (1.3 + ss(0.95, 0.99, p) * 1.6) * k, 0.45 + ss(0.95, 0.99, p) * 0.4);
    }
    x.globalCompositeOperation = 'source-over';
    if (lantern) drawLantern(x, M, k, lantern, lit, PERSON(1 - (p >= 0.952 ? 0 : dis)), FLAME(0.6 + lit * 0.4));

    /* ── weather and events ─────────────────────────────────────── */
    if (fwd) {
      for (const lp of LIGHTNING) if (lastP < lp && p >= lp) { flashT = 0.42; bolt = { x: cam.x + 2 + hash(lp * 99) * 6, seed: lp }; }
      if (lastP < 0.654 && p >= 0.654) for (let i = 0; i < 40; i++) motes.add('dust', tr.x + (Math.random() - 0.5) * 0.6, tr.y + 0.1, (Math.random() - 0.3) * 2.4, Math.random() * 1.2, 0.9 + Math.random() * 0.6, 1);
      if (lastP < 0.948 && p >= 0.948) for (let i = 0; i < 26; i++) motes.add('spark', CAIRN, ground(CAIRN) + 0.62, (Math.random() - 0.5) * 2, 1 + Math.random() * 2.4, 0.6 + Math.random() * 0.6, 1);
    }
    if (flashT > 0) {
      flashT = Math.max(0, flashT - dt);
      const a = flashT / 0.42;
      if (a > 0.45) {
        x.strokeStyle = FLAME(1); x.lineWidth = 0.06 * k;
        x.beginPath();
        let bx = bolt.x, by = cam.y + 5.5;
        let [sx, sy] = M(bx, by); x.moveTo(sx, sy);
        for (let i = 1; i <= 9; i++) {
          bx += (hash(bolt.seed * 31 + i) - 0.5) * 0.9; by = lerp(cam.y + 5.5, ground(bx), i / 9);
          [sx, sy] = M(bx, by); x.lineTo(sx, sy);
        }
        x.stroke();
        if (fwd && a > 0.9) for (let i = 0; i < 18; i++) motes.add('spark', bx, ground(bx) + 0.05, (Math.random() - 0.5) * 3, 1 + Math.random() * 3, 0.5 + Math.random() * 0.5, 1);
      }
    }

    /* ambient motes */
    if (!still) {
      if (x1 > 36 && x0 < 48 && p > 0.3 && p < 0.42) {
        if (Math.random() < dt * 14) motes.add('ember', FIRE + (Math.random() - 0.5) * 0.3, ground(FIRE) + 0.3, (Math.random() - 0.5) * 0.3, 0.7 + Math.random() * 0.6, 1.6 + Math.random() * 1.4, 1);
      }
      const lake = p > 0.71 && p < 0.86;
      if (lake && !fliesOn) for (let i = 0; i < 16; i++) motes.add('fly', LAKE.x0 + Math.random() * (LAKE.x1 - LAKE.x0), LAKE.y + 0.3 + Math.random() * 1.4, 0, 0, 9 + Math.random() * 8, 1);
      fliesOn = lake;
      if (rain > 0.02) {
        const n = Math.round(rain * 480 * dt);
        for (let i = 0; i < n; i++) motes.add('rain', toW(Math.random() * (W + 200)), cam.y + 4.5 + Math.random(), -2.2 - wind * 2.5, -11 - Math.random() * 3, 0.55, 1);
      }
      motes.step(dt, wind, t);
      /* rain dies on the ground */
      for (const m of motes.pool) if (m.k === 'rain' && m.y < ground(m.x)) m.age = m.life;
    }
    lastP = p;

    /* motes → device-px points for the printer */
    let n = 0;
    for (const m of motes.pool) {
      if (n >= 2400) break;
      const [sx, sy] = M(m.x, m.y);
      if (sx < -10 || sx > W + 10 || sy < -10 || sy > H + 10) continue;
      const life = 1 - m.age / m.life;
      let c: RGB = f.ink, a = life, s = 2;
      switch (m.k) {
        case 'ember': c = EMBER; s = 2.2; a = life; break;
        case 'rain': a = 0.55; s = 1.9; break;
        case 'fly': c = EMBER; s = 2.6; a = (0.45 + 0.55 * Math.sin(t * 2.4 + m.seed * 30)) * Math.min(1, m.age, life * 3); break;
        case 'spark': c = CORE; s = 2; break;
        case 'shard': c = ECHO_C; s = 2.4; a = life * 0.95; break;
        case 'rise': { const e = Math.min(1, m.age / m.life * 1.6); c = [lerp(f.ink[0], EMBER[0], e), lerp(f.ink[1], EMBER[1], e), lerp(f.ink[2], EMBER[2], e)]; s = 2.3; a = life * 0.95; break; }
        case 'dust': a = life * 0.4; s = 1.8; break;
      }
      /* rain is a short streak along its fall */
      const reps = m.k === 'rain' ? 4 : 1;
      for (let r = 0; r < reps && n < 2400; r++) {
        const o = n * 7, tx = sx - m.vx * r * 0.012 * k, ty = sy + m.vy * r * 0.012 * k;
        out[o] = tx * f.dpr; out[o + 1] = ty * f.dpr; out[o + 2] = s * f.dpr;
        out[o + 3] = c[0]; out[o + 4] = c[1]; out[o + 5] = c[2]; out[o + 6] = Math.max(0, a * (1 - r * 0.2));
        n++;
      }
    }
    return { flash: flashT / 0.42, fog, wind, motes: out, moteCount: n };

    /* the same figure, upside down in the water */
    function reflect(wx: number, face: 1 | -1, P0: ReturnType<typeof pose>, fill: string) {
      const R = (qx: number, qy: number): V => { const [sx, sy] = M(qx, 2 * LAKE.y - qy); return [sx, sy]; };
      drawFigure(x, R, k, wx, ground(wx), face, P0, fill, { t, reflect: 1 });
    }
  }

  return { paint, motes, reset: () => { lastP = -1; motes.clear(); } };
}

/* a ridge plane: a noise skyline filled down to the bottom with a soft fade */
function ridge(x: Ctx, pl: (px: number, py: number) => V, h: (q: number) => number, rate: number, dTop: number, dLow: number, W: number, k: number, cx: number, depth: number) {
  const q0 = cx * rate - W / 2 / k - 2, q1 = cx * rate + W / 2 / k + 2;
  const [, y0] = pl(0, 0);
  for (const [dd, d] of [[depth, dLow], [depth * 0.35, dTop]] as [number, number][]) {
    x.fillStyle = WORLD(d);
    x.beginPath();
    let first = true;
    for (let q = q0; q <= q1; q += 0.18) { const [sx, sy] = pl(q, h(q)); if (first) { x.moveTo(sx, sy); first = false; } else x.lineTo(sx, sy); }
    for (let q = q1; q >= q0; q -= 0.18) { const [sx, sy] = pl(q, h(q) - dd); x.lineTo(sx, Math.min(sy, y0 + 400)); }
    x.closePath(); x.fill();
  }
}

/* small things on the hills, chosen by where in the story we are */
function hillProps(x: Ctx, pl: (px: number, py: number) => V, p: number, c: number, W: number, k: number, t: number, wind: number) {
  const q0 = Math.floor(c - W / 2 / k) - 2, q1 = Math.ceil(c + W / 2 / k) + 2;
  for (let q = q0; q <= q1; q += 1.6) {
    const r = hash(q * 3.7), r2 = hash(q * 9.1);
    if (r < 0.55) continue;
    const h = 2.3 + fbm(q * 0.19 + 41) * 1.25;
    const [sx, sy] = pl(q, h - 0.05);
    x.fillStyle = WORLD(0.3); x.strokeStyle = WORLD(0.3);
    if (p < 0.3) { /* pines */
      const s = (0.5 + r2 * 0.6) * k;
      x.beginPath(); x.moveTo(sx, sy - s * 1.5); x.lineTo(sx + s * 0.32, sy); x.lineTo(sx - s * 0.32, sy); x.fill();
    } else if (p < 0.6) { /* bare trees */
      x.lineWidth = 0.05 * k;
      const s = (0.6 + r2 * 0.5) * k, sw = Math.sin(t * 0.8 + q) * wind * 0.04 * k;
      x.beginPath(); x.moveTo(sx, sy); x.lineTo(sx + sw, sy - s);
      x.moveTo(sx + sw * 0.5, sy - s * 0.55); x.lineTo(sx + s * 0.3 + sw, sy - s * 0.85);
      x.moveTo(sx + sw * 0.7, sy - s * 0.7); x.lineTo(sx - s * 0.25 + sw, sy - s * 0.95);
      x.stroke();
    } else if (p < 0.88) { /* standing stones */
      const s = (0.35 + r2 * 0.4) * k;
      x.fillRect(sx - s * 0.18, sy - s, s * 0.36, s);
    }
  }
}

/* things on the loss surface itself */
function props(x: Ctx, M: (a: number, b: number) => V, p: number, k: number, t: number, wind: number, x0: number, x1: number, still: boolean) {
  const vis = (a: number, b = a) => b > x0 - 2 && a < x1 + 2;
  const w = still ? 0 : wind;
  /* grass: tufts along the softer ground, bent by the wind */
  x.strokeStyle = WORLD(0.7); x.lineWidth = 0.035 * k; x.lineCap = 'round';
  for (let q = Math.floor(x0); q < x1; q += 0.37) {
    const r = hash(q * 13.3);
    const grassy = (q > 27 && q < 54) || (q > 92 && q < 100) || (q > 122 && q < 150) || (q > -40 && q < -3);
    if (!grassy || r < 0.45) continue;
    const gy = ground(q);
    for (let b = 0; b < 3; b++) {
      const bx = q + b * 0.07, hh = (0.16 + hash(q + b) * 0.2) * k;
      const bend = (Math.sin(t * 2.1 + q * 1.7 + b) * 0.25 + 0.4) * w * hh * 0.9;
      const [sx, sy] = M(bx, gy - 0.02);
      x.beginPath(); x.moveTo(sx, sy); x.quadraticCurveTo(sx - bend * 0.3, sy - hh * 0.6, sx - bend, sy - hh); x.stroke();
    }
  }
  /* scree boulders */
  x.fillStyle = WORLD(0.8);
  for (let q = 3; q < 17; q += 1.3) if (vis(q) && hash(q * 5.1) > 0.35) {
    const [sx, sy] = M(q, ground(q) + 0.04);
    const s = (0.12 + hash(q) * 0.2) * k;
    x.beginPath(); x.ellipse(sx, sy, s * 1.3, s * 0.75, hash(q * 2) - 0.5, Math.PI, Math.PI * 2); x.fill();
  }
  /* the summit: a marker pole with a rag */
  if (vis(-1, 1)) {
    const [sx, sy] = M(-0.75, ground(-0.75) - 0.02);
    x.strokeStyle = WORLD(0.9); x.lineWidth = 0.045 * k;
    x.beginPath(); x.moveTo(sx, sy); x.lineTo(sx + 0.06 * k, sy - 1.5 * k); x.stroke();
    x.fillStyle = WORLD(0.85);
    const fl = Math.sin(t * 6) * 0.06 * k;
    x.beginPath(); x.moveTo(sx + 0.06 * k, sy - 1.5 * k); x.lineTo(sx - 0.5 * k, sy - 1.4 * k + fl); x.lineTo(sx + 0.05 * k, sy - 1.2 * k); x.fill();
  }
  /* the hollow: a lean-to, a fire, a post hung with dark lanterns */
  if (vis(36, 48)) {
    const [ax, ay] = M(37.2, ground(37.2));
    x.fillStyle = WORLD(0.72);
    x.beginPath(); x.moveTo(ax - 0.8 * k, ay); x.lineTo(ax + 0.2 * k, ay - 1.15 * k); x.lineTo(ax + 0.6 * k, ay); x.closePath(); x.fill();
    x.strokeStyle = WORLD(0.85); x.lineWidth = 0.04 * k;
    x.beginPath(); x.moveTo(ax - 0.95 * k, ay + 0.05 * k); x.lineTo(ax + 0.32 * k, ay - 1.3 * k); x.stroke();
    /* the fire */
    const [fx, fy] = M(FIRE, ground(FIRE));
    x.fillStyle = WORLD(0.9);
    x.fillRect(fx - 0.35 * k, fy - 0.05 * k, 0.7 * k, 0.07 * k);
    for (let i = 0; i < 3; i++) {
      const fh = (0.32 + 0.14 * Math.sin(t * (8 + i * 3) + i)) * k * (still ? 1 : 1), fw = (0.12 - i * 0.025) * k;
      x.fillStyle = FLAME(1 - i * 0.12);
      x.beginPath(); x.moveTo(fx - fw + (i - 1) * 0.08 * k, fy - 0.03 * k); x.quadraticCurveTo(fx + (i - 1) * 0.06 * k, fy - fh * 1.4, fx + fw + (i - 1) * 0.08 * k, fy - 0.03 * k); x.fill();
    }
    /* the post and its dark lanterns */
    const [px, py] = M(46.6, ground(46.6));
    x.strokeStyle = WORLD(0.85); x.lineWidth = 0.06 * k;
    x.beginPath(); x.moveTo(px, py); x.lineTo(px, py - 1.45 * k); x.lineTo(px + 0.7 * k, py - 1.4 * k); x.stroke();
    for (let i = 0; i < 3; i++) {
      const hx = px + (0.16 + i * 0.22) * k, sw = Math.sin(t * 1.3 + i) * wind * 0.05 * k;
      x.lineWidth = 0.015 * k;
      x.beginPath(); x.moveTo(hx, py - 1.4 * k); x.lineTo(hx + sw, py - 1.18 * k); x.stroke();
      x.fillStyle = ECHO(0.75); x.fillRect(hx + sw - 0.05 * k, py - 1.18 * k, 0.1 * k, 0.13 * k);
    }
  }
  /* the plateau: lanterns half-buried where others lost the light, a dead tree */
  for (const q of [59, 64.5, 70.2, 75.8]) if (vis(q)) {
    const [sx, sy] = M(q, ground(q));
    x.save(); x.translate(sx, sy); x.rotate((hash(q) - 0.5) * 1.2);
    x.fillStyle = ECHO(0.7); x.fillRect(-0.05 * k, -0.1 * k, 0.1 * k, 0.14 * k);
    x.restore();
  }
  if (vis(67)) {
    const [sx, sy] = M(67, ground(67));
    x.strokeStyle = WORLD(0.85); x.lineWidth = 0.07 * k; x.lineCap = 'round';
    x.beginPath(); x.moveTo(sx, sy); x.lineTo(sx + 0.1 * k, sy - 1.6 * k);
    x.moveTo(sx + 0.05 * k, sy - 0.9 * k); x.lineTo(sx + 0.55 * k, sy - 1.35 * k); x.lineTo(sx + 0.7 * k, sy - 1.2 * k);
    x.moveTo(sx + 0.08 * k, sy - 1.2 * k); x.lineTo(sx - 0.42 * k, sy - 1.65 * k);
    x.stroke();
  }
  /* reeds at the lake's ends */
  x.strokeStyle = WORLD(0.75); x.lineWidth = 0.03 * k;
  for (let q = 99.5; q < 124; q += 0.21) {
    if (!vis(q) || (q > 103.5 && q < 120)) continue;
    const [sx, sy] = M(q, LAKE.y + 0.02), hh = (0.4 + hash(q * 7) * 0.5) * k, sw = Math.sin(t * 1.6 + q * 3) * 0.05 * k * (0.4 + w);
    x.beginPath(); x.moveTo(sx, sy); x.lineTo(sx + sw, sy - hh); x.stroke();
  }
  /* the basin: a cairn of lanterns left by the ones before */
  if (vis(CAIRN - 3, CAIRN + 3)) {
    const [cx, cy] = M(CAIRN, ground(CAIRN));
    x.fillStyle = WORLD(0.88);
    const stones: [number, number, number][] = [[-0.34, 0.08, 0.2], [0.02, 0.09, 0.24], [0.36, 0.07, 0.18], [-0.16, 0.27, 0.17], [0.19, 0.27, 0.17], [0.01, 0.44, 0.14]];
    for (const [ox, oy, r] of stones) { x.beginPath(); x.ellipse(cx + ox * k, cy - oy * k, r * k * 1.15, r * k * 0.72, 0, 0, Math.PI * 2); x.fill(); }
    const L: [number, number][] = [[-0.62, 0.05], [-0.45, 0.33], [0.55, 0.05], [0.42, 0.3], [-0.22, 0.56], [0.22, 0.55], [0.75, 0.0], [-0.8, 0.0]];
    for (const [ox, oy] of L) {
      x.fillStyle = PERSON(0.85); x.fillRect(cx + (ox - 0.05) * k, cy - (oy + 0.13) * k, 0.1 * k, 0.13 * k);
      x.fillStyle = FLAME(0.85); x.fillRect(cx + (ox - 0.025) * k, cy - (oy + 0.1) * k, 0.05 * k, 0.07 * k);
    }
    x.globalCompositeOperation = 'lighter';
    for (const [ox, oy] of L) glow(x, cx + ox * k, cy - (oy + 0.07) * k, 0.45 * k, 0.45);
    x.globalCompositeOperation = 'source-over';
  }
}

/* light, written into G only (call with 'lighter') */
function glow(x: Ctx, sx: number, sy: number, r: number, a: number) {
  if (r < 1 || a <= 0) return;
  const g = x.createRadialGradient(sx, sy, 0, sx, sy, r);
  g.addColorStop(0, `rgba(0,255,0,${a})`); g.addColorStop(0.35, `rgba(0,255,0,${a * 0.45})`); g.addColorStop(1, 'rgba(0,255,0,0)');
  x.fillStyle = g; x.fillRect(sx - r, sy - r, r * 2, r * 2);
}
function cone(x: Ctx, sx: number, sy: number, dir: number, len: number, half: number, a: number) {
  const g = x.createRadialGradient(sx, sy, 0, sx, sy, len);
  g.addColorStop(0, `rgba(0,255,0,${a})`); g.addColorStop(0.5, `rgba(0,255,0,${a * 0.35})`); g.addColorStop(1, 'rgba(0,255,0,0)');
  x.fillStyle = g;
  x.beginPath(); x.moveTo(sx, sy);
  /* screen y is down: flip the angle */
  x.arc(sx, sy, len, -dir - half, -dir + half);
  x.closePath(); x.fill();
}
