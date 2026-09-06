/* ══════════════════════════════════════════════════════════════════════════
   wisp — the frame factory.

   Every image on this page is computed here. Nothing is photographed and
   nothing is fetched: an infrared camera-trap frame is
     seeded value-noise foliage
       × infrared falloff from a flash origin
       + a hand-authored silhouette (shapes.ts) composited into that falloff
       + eyeshine
       + per-pixel grain
   mapped onto the IR greyscale ramp #1A1614 → #CFC6BB.

   Each frame also gets a matching *attribution* field — the same seeded
   structure, gathered into gaussian blobs on and around the animal, with one
   character per Captum method, because the point of the project is that six
   methods do not agree.

   Everything is deterministic per seed and cached by key. A frame is generated
   exactly once for the life of the tab; the page never redraws a canvas in its
   rAF loop.
   ══════════════════════════════════════════════════════════════════════════ */

import { SHAPES, type SpeciesKey } from './shapes';

/* ── seeded noise ───────────────────────────────────────────────────────── */

export function rng(seed: number) {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const N = 64; // value-noise lattice, wrapped

function lattice(seed: number) {
  const r = rng(seed);
  const a = new Float32Array(N * N);
  for (let i = 0; i < a.length; i++) a[i] = r();
  return a;
}

function vnoise(a: Float32Array, x: number, y: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const fx = x - xi;
  const fy = y - yi;
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);
  const j0 = (((xi % N) + N) % N) | 0;
  const j1 = ((((xi + 1) % N) + N) % N) | 0;
  const i0 = (((yi % N) + N) % N) * N;
  const i1 = ((((yi + 1) % N) + N) % N) * N;
  const t = a[i0 + j0] + (a[i0 + j1] - a[i0 + j0]) * sx;
  const b = a[i1 + j0] + (a[i1 + j1] - a[i1 + j0]) * sx;
  return t + (b - t) * sy;
}

function fbm(a: Float32Array, x: number, y: number, oct: number) {
  let s = 0;
  let amp = 0.5;
  let f = 1;
  let norm = 0;
  for (let i = 0; i < oct; i++) {
    s += amp * vnoise(a, x * f, y * f);
    norm += amp;
    amp *= 0.5;
    f *= 2.03;
  }
  return s / norm;
}

const sstep = (e0: number, e1: number, x: number) => {
  const t = x <= e0 ? 0 : x >= e1 ? 1 : (x - e0) / (e1 - e0);
  return t * t * (3 - 2 * t);
};

/* ── frame specification ────────────────────────────────────────────────── */

export type FrameSpec = {
  seed: number;
  /** null = the trap fired and resolved no subject */
  sp: SpeciesKey | null;
  /** animal centre, as a fraction of the frame */
  x: number;
  y: number;
  /** animal height as a fraction of frame height */
  s: number;
  flip: boolean;
  /** infrared flash origin, fraction of the frame */
  fx: number;
  fy: number;
  /** falloff reach — small = the dark is close */
  reach: number;
  /** horizontal motion smear, in silhouette-box units */
  smear: number;
  /** canopy density */
  canopy: number;
};

/* ── the structure field, shared by the image and its attributions ──────── */

type Field = { w: number; h: number; d: Float32Array };
const fieldCache = new Map<string, Field>();

function structure(spec: FrameSpec, w: number, h: number): Field {
  const key = `${spec.seed}:${w}x${h}`;
  const hit = fieldCache.get(key);
  if (hit) return hit;
  const a = lattice(spec.seed);
  const d = new Float32Array(w * h);
  const sc = 5.2 + spec.canopy * 4.4;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const u = x / w;
      const v = y / h;
      /* the canopy is stretched vertically — leaves hang, they do not tile */
      d[y * w + x] = fbm(a, u * sc, v * sc * 1.75, 4);
    }
  }
  const f = { w, h, d };
  fieldCache.set(key, f);
  return f;
}

function sampleField(f: Field, u: number, v: number) {
  /* Callers sample this at scaled coordinates (u * 1.7, v * 1.7) to get a
     second, finer read of the same field. Past u or v of 1/1.7 that ran off
     the end of the array, and an undefined lookup poisoned the interpolation
     with NaN. Assigning NaN into a Uint8ClampedArray yields 0, so every pixel
     below v = 0.588 of an animal came out pure black with a hard horizontal
     edge across it. Clamp here rather than at each call site. */
  u = u < 0 ? 0 : u > 1 ? 1 : u;
  v = v < 0 ? 0 : v > 1 ? 1 : v;
  const x = u * (f.w - 1);
  const y = v * (f.h - 1);
  const xi = x | 0;
  const yi = y | 0;
  const xj = xi + 1 < f.w ? xi + 1 : xi;
  const yj = yi + 1 < f.h ? yi + 1 : yi;
  const fx = x - xi;
  const fy = y - yi;
  const t = f.d[yi * f.w + xi] + (f.d[yi * f.w + xj] - f.d[yi * f.w + xi]) * fx;
  const b = f.d[yj * f.w + xi] + (f.d[yj * f.w + xj] - f.d[yj * f.w + xi]) * fx;
  return t + (b - t) * fy;
}

/* ── the silhouette, as an alpha plate ─────────────────────────────────── */

function place(spec: FrameSpec, w: number, h: number) {
  const k = (spec.s * h) / 80;
  return { k, cx: spec.x * w, cy: spec.y * h };
}

function silhouette(spec: FrameSpec, w: number, h: number): Uint8ClampedArray | null {
  if (!spec.sp) return null;
  const sh = SHAPES[spec.sp];
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d');
  if (!g) return null;
  const { k, cx, cy } = place(spec, w, h);

  const steps = spec.smear > 0.01 ? 6 : 1;
  for (let i = 0; i < steps; i++) {
    const off = spec.smear * 60 * k * (i / Math.max(1, steps - 1) - 0.5) * 2;
    g.save();
    g.globalAlpha = steps === 1 ? 1 : 0.34;
    g.translate(cx + off, cy);
    g.scale(spec.flip ? -k : k, k);
    g.translate(-60, -46);
    for (const d of sh.fill) g.fill(new Path2D(d));
    if (sh.line) {
      g.strokeStyle = '#000';
      g.lineCap = 'round';
      g.lineJoin = 'round';
      for (const [d, lw] of sh.line) {
        g.lineWidth = lw;
        g.stroke(new Path2D(d));
      }
    }
    g.restore();
  }
  return g.getImageData(0, 0, w, h).data;
}

/* ── the infrared frame ─────────────────────────────────────────────────── */

const irCache = new Map<string, HTMLCanvasElement>();

export function makeIR(key: string, spec: FrameSpec, w: number, h: number): HTMLCanvasElement {
  const hit = irCache.get(key);
  if (hit) return hit;

  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d')!;
  const img = g.createImageData(w, h);
  const px = img.data;

  const fw = Math.max(24, w >> 1);
  const fh = Math.max(16, h >> 1);
  const fld = structure(spec, fw, fh);
  const fine = lattice(spec.seed ^ 0x9e37);
  const alpha = silhouette(spec, w, h);
  const r = rng(spec.seed ^ 0x51ed);
  const reach2 = spec.reach * spec.reach;

  for (let y = 0; y < h; y++) {
    const v = y / h;
    for (let x = 0; x < w; x++) {
      const u = x / w;
      const i = y * w + x;

      const f = sampleField(fld, u, v);
      /* leaves catch the flash; the gaps behind them do not come back at all */
      let base = 0.055 + 0.66 * sstep(0.40 - spec.canopy * 0.06, 0.79, f);
      base += 0.13 * sstep(0.58, 0.99, v) * (0.5 + 0.5 * f); // leaf litter
      base += 0.055 * fbm(fine, u * 26, v * 20, 2); // bark and twig detail

      /* inverse-square-ish infrared falloff from the flash */
      const dx = u - spec.fx;
      const dy = (v - spec.fy) * 0.74;
      const fall = 1 / (1 + 2.9 * ((dx * dx + dy * dy) / reach2));

      let l = base * (0.11 + 1.34 * fall);

      if (alpha) {
        const m = alpha[i * 4 + 3] / 255;
        if (m > 0.004) {
          /* fur returns 850 nm hard on the flash side and vanishes off it */
          const al = 0.075 + 1.22 * fall * (0.62 + 0.38 * sampleField(fld, u * 1.7, v * 1.7));
          l = l * (1 - m) + m * al;
        }
      }

      /* sensor grain — heavier where there is no light to work with */
      l += (r() - 0.5) * (0.185 - 0.095 * fall);
      /* lens vignette */
      const vx = u - 0.5;
      const vy = v - 0.5;
      l *= 1 - 0.62 * sstep(0.16, 0.52, vx * vx + vy * vy);

      const t = l < 0 ? 0 : l > 1 ? 1 : l;
      const j = i * 4;
      px[j] = 26 + (207 - 26) * t;
      px[j + 1] = 22 + (198 - 22) * t;
      px[j + 2] = 20 + (187 - 20) * t;
      px[j + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);

  /* eyeshine: the one thing in a night frame that is never subtle */
  if (spec.sp) {
    const sh = SHAPES[spec.sp];
    const { k, cx, cy } = place(spec, w, h);
    const ex = cx + (spec.flip ? -1 : 1) * (sh.eye[0] - 60) * k;
    const ey = cy + (sh.eye[1] - 46) * k;
    const dx = ex / w - spec.fx;
    const dy = (ey / h - spec.fy) * 0.74;
    const fall = 1 / (1 + 2.9 * ((dx * dx + dy * dy) / reach2));
    const rad = Math.max(1.5, k * 2.1);
    g.globalCompositeOperation = 'lighter';
    for (const s of [-1, 1]) {
      const gx = ex + s * sh.gap * k * 0.42;
      const gy = ey - s * sh.gap * k * 0.1;
      const grad = g.createRadialGradient(gx, gy, 0, gx, gy, rad * 3.2);
      const a0 = 0.42 + 0.5 * fall;
      grad.addColorStop(0, `rgba(238,232,220,${a0.toFixed(3)})`);
      grad.addColorStop(0.34, `rgba(210,200,186,${(a0 * 0.32).toFixed(3)})`);
      grad.addColorStop(1, 'rgba(210,200,186,0)');
      g.fillStyle = grad;
      g.beginPath();
      g.arc(gx, gy, rad * 3.2, 0, 6.2832);
      g.fill();
    }
    g.globalCompositeOperation = 'source-over';
  }

  irCache.set(key, c);
  return c;
}

/* ── attribution ────────────────────────────────────────────────────────── */

export const METHODS = [
  'Integrated Gradients',
  'GradientSHAP',
  'DeepLIFT',
  'Occlusion',
  'LRP',
  'NoiseTunnel',
] as const;

/* each method fails differently — that is the whole reason six are run */
const CHAR = [
  { tight: 1.0, noise: 0.34, decoy: 2, cell: 0, blur: 1 },
  { tight: 1.18, noise: 0.56, decoy: 3, cell: 0, blur: 1 },
  { tight: 0.82, noise: 0.26, decoy: 1, cell: 0, blur: 1 },
  { tight: 1.4, noise: 0.1, decoy: 1, cell: 9, blur: 2 },
  { tight: 0.9, noise: 0.5, decoy: 2, cell: 0, blur: 0 },
  { tight: 1.3, noise: 0.18, decoy: 2, cell: 0, blur: 3 },
];

function blurBox(d: Float32Array, w: number, h: number, times: number) {
  if (times <= 0) return d;
  let a: Float32Array = d;
  let b: Float32Array = new Float32Array(a.length);
  for (let n = 0; n < times; n++) {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let s = 0;
        let c = 0;
        for (let j = -1; j <= 1; j++) {
          const yy = y + j;
          if (yy < 0 || yy >= h) continue;
          for (let i = -1; i <= 1; i++) {
            const xx = x + i;
            if (xx < 0 || xx >= w) continue;
            s += a[yy * w + xx];
            c++;
          }
        }
        b[y * w + x] = s / c;
      }
    }
    const t = a;
    a = b;
    b = t;
  }
  return a;
}

/** an attribution field for one Captum method, normalised to 0..1 */
export function heatField(spec: FrameSpec, method: number, w: number, h: number): Float32Array {
  const ch = CHAR[method % 6];
  const r = rng((spec.seed ^ 0x2f1b) + method * 7919);
  const fld = structure(spec, Math.max(24, w), Math.max(16, h));
  const grit = lattice((spec.seed ^ 0x77c1) + method * 131);

  type Blob = { x: number; y: number; sx: number; sy: number; w: number };
  const blobs: Blob[] = [];

  if (spec.sp) {
    /* the model mostly, but not always, looks at the animal */
    const jitter = (1 - 0.55 / ch.tight) * 0.09;
    blobs.push({
      x: spec.x + (r() - 0.5) * jitter,
      y: spec.y + (r() - 0.5) * jitter * 0.8,
      sx: (spec.s * 0.62) / ch.tight,
      sy: (spec.s * 0.44) / ch.tight,
      w: 1,
    });
    /* a second lobe on the head, where the eyeshine is */
    blobs.push({
      x: spec.x + (spec.flip ? -1 : 1) * spec.s * 0.34 + (r() - 0.5) * 0.05,
      y: spec.y - spec.s * 0.22 + (r() - 0.5) * 0.05,
      sx: spec.s * 0.3,
      sy: spec.s * 0.26,
      w: 0.74 + r() * 0.3,
    });
  } else {
    blobs.push({ x: 0.3 + r() * 0.4, y: 0.4 + r() * 0.3, sx: 0.2, sy: 0.16, w: 0.7 });
  }

  /* decoys: flash hot-spots and bright leaf clusters the model also keyed on */
  for (let i = 0; i < ch.decoy; i++) {
    blobs.push({
      x: 0.1 + r() * 0.8,
      y: 0.12 + r() * 0.76,
      sx: 0.09 + r() * 0.11,
      sy: 0.07 + r() * 0.09,
      w: 0.2 + r() * 0.34,
    });
  }

  const d = new Float32Array(w * h);
  let max = 1e-6;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let u = (x + 0.5) / w;
      let v = (y + 0.5) / h;
      if (ch.cell) {
        /* Occlusion slides a patch — it can only ever answer per patch */
        u = (Math.floor((x / w) * ch.cell) + 0.5) / ch.cell;
        v = (Math.floor((y / h) * ch.cell) + 0.5) / ch.cell;
      }
      let s = 0;
      for (const b of blobs) {
        const dx = (u - b.x) / b.sx;
        const dy = (v - b.y) / b.sy;
        s += b.w * Math.exp(-(dx * dx + dy * dy) * 0.85);
      }
      /* gradients cling to edges, so heat clings to structure */
      const st = sampleField(fld, u, v);
      s *= 0.52 + 0.68 * st;
      s += ch.noise * 0.42 * (fbm(grit, u * 15, v * 15, 3) - 0.42);
      const val = s < 0 ? 0 : s;
      d[y * w + x] = val;
      if (val > max) max = val;
    }
  }
  for (let i = 0; i < d.length; i++) d[i] /= max;
  return blurBox(d, w, h, ch.blur);
}

/* transparent → #3B4A1E → #7FBF2E → #B4FF3B → #F1FFC9 */
const RAMP: [number, number, number, number][] = [
  [0.0, 0x3b, 0x4a, 0x1e],
  [0.34, 0x3b, 0x4a, 0x1e],
  [0.58, 0x7f, 0xbf, 0x2e],
  [0.82, 0xb4, 0xff, 0x3b],
  [1.0, 0xf1, 0xff, 0xc9],
];

function ramp(t: number, out: [number, number, number]) {
  let i = 1;
  while (i < RAMP.length - 1 && t > RAMP[i][0]) i++;
  const a = RAMP[i - 1];
  const b = RAMP[i];
  const k = (t - a[0]) / Math.max(1e-6, b[0] - a[0]);
  out[0] = a[1] + (b[1] - a[1]) * k;
  out[1] = a[2] + (b[2] - a[2]) * k;
  out[2] = a[3] + (b[3] - a[3]) * k;
}

const heatCache = new Map<string, HTMLCanvasElement>();

/**
 * `method` 0–5 renders that Captum method alone.
 * `method` = -1 renders the consensus: colour from the mean of all six,
 * opacity from their agreement — where they disagree the heat is a ghost.
 */
export function makeHeat(
  key: string,
  spec: FrameSpec,
  method: number,
  w: number,
  h: number,
): HTMLCanvasElement {
  const hit = heatCache.get(key);
  if (hit) return hit;

  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d')!;
  const img = g.createImageData(w, h);
  const px = img.data;
  const rgb: [number, number, number] = [0, 0, 0];

  if (method >= 0) {
    const d = heatField(spec, method, w, h);
    for (let i = 0; i < d.length; i++) {
      const v = d[i];
      ramp(v, rgb);
      const j = i * 4;
      px[j] = rgb[0];
      px[j + 1] = rgb[1];
      px[j + 2] = rgb[2];
      px[j + 3] = 255 * sstep(0.17, 0.56, v) * 0.94;
    }
  } else {
    const all: Float32Array[] = [];
    for (let m = 0; m < 6; m++) all.push(heatField(spec, m, w, h));
    for (let i = 0; i < all[0].length; i++) {
      let mean = 0;
      for (let m = 0; m < 6; m++) mean += all[m][i];
      mean /= 6;
      let vr = 0;
      for (let m = 0; m < 6; m++) {
        const dd = all[m][i] - mean;
        vr += dd * dd;
      }
      const sd = Math.sqrt(vr / 6);
      const agree = 1 - Math.min(1, sd * 3.1);
      ramp(mean, rgb);
      const j = i * 4;
      px[j] = rgb[0];
      px[j + 1] = rgb[1];
      px[j + 2] = rgb[2];
      px[j + 3] = 255 * sstep(0.15, 0.5, mean) * (0.16 + 0.8 * agree);
    }
  }
  g.putImageData(img, 0, 0);
  heatCache.set(key, c);
  return c;
}

/* ── contour lines ──────────────────────────────────────────────────────── */

/** closed polar contours around (cx, cy) — the topographic layer and terrain */
export function contours(seed: number, n: number, cx: number, cy: number, r0: number, r1: number) {
  const a = lattice(seed);
  const out: string[] = [];
  const STEPS = 108;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const base = r0 + (r1 - r0) * t * t;
    let d = '';
    for (let s = 0; s <= STEPS; s++) {
      const th = (s / STEPS) * Math.PI * 2;
      const wob = fbm(a, Math.cos(th) * 2.2 + i * 0.44, Math.sin(th) * 2.2 + i * 0.44, 3);
      const rr = base * (0.72 + 0.56 * wob) * (1 + 0.1 * Math.sin(th * 3 + i));
      const x = cx + Math.cos(th) * rr * 1.42;
      const y = cy + Math.sin(th) * rr;
      d += (s === 0 ? 'M' : 'L') + x.toFixed(1) + ' ' + y.toFixed(1);
    }
    out.push(d + 'Z');
  }
  return out;
}

/* ── generation queue ───────────────────────────────────────────────────── */

/* Frames are expensive once and free forever. They are generated in document
   order on a time-budgeted queue so the main thread is never blocked for more
   than a few milliseconds, and the page's exposure animation waits on the
   canvas it is going to expose. */

type Job = { run: () => void; live: { ok: boolean } };
const queue: Job[] = [];
let pumping = false;

function pump() {
  pumping = true;
  requestAnimationFrame(() => {
    const t0 = performance.now();
    while (queue.length && performance.now() - t0 < 7) {
      const j = queue.shift()!;
      if (j.live.ok) j.run();
    }
    if (queue.length) pump();
    else pumping = false;
  });
}

export function enqueue(live: { ok: boolean }, run: () => void) {
  queue.push({ run, live });
  if (!pumping) pump();
}
