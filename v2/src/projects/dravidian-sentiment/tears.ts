/* ══════════════════════════════════════════════════════════════════════════
   dravidian-sentiment — "Muzhakkam" (முழக்கம்)

   Paper geometry. Deterministic, pure, DOM-free: torn sheet edges as
   `clip-path` polygons, and the scatter vectors the shredder throws its
   subword fragments along. Seeded so a sheet tears the same way on every
   reload — a poster wall that re-tears itself on refresh would read as noise,
   not as paper.
   ══════════════════════════════════════════════════════════════════════════ */

/** xorshift32 — small, fast, and identical across runs for a given seed. */
export function rng(seed: number): () => number {
  let s = seed >>> 0 || 0x9e3779b9;
  return () => {
    s ^= s << 13;
    s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    return s / 4294967296;
  };
}

export type TearOpts = {
  /** tear the top edge */
  top?: boolean;
  /** tear the bottom edge */
  bottom?: boolean;
  /** number of segments along each torn edge */
  steps?: number;
  /** tear depth, in % of the element's height */
  amp?: number;
};

/**
 * A `clip-path: polygon(…)` for one pasted sheet. Left and right edges stay
 * straight (the sheet is trimmed at the sides and torn along the grain), the
 * chosen horizontal edges get a fibrous, uneven rip: a coarse sawtooth with a
 * fine tooth riding on top of it, so the edge reads as paper rather than as a
 * zig-zag border.
 */
export function tornPolygon(seed: number, o: TearOpts = {}): string {
  const { top = true, bottom = false, steps = 30, amp = 1.4 } = o;
  const r = rng(seed);
  const pts: string[] = [];

  const edge = (i: number, on: boolean): number => {
    if (!on) return 0;
    const coarse = Math.pow(r(), 1.6);
    const fine = i % 2 === 0 ? 0.22 : 0.06;
    return (coarse * 0.86 + fine) * amp;
  };

  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * 100;
    pts.push(`${x.toFixed(2)}% ${edge(i, top).toFixed(2)}%`);
  }
  for (let i = steps; i >= 0; i--) {
    const x = (i / steps) * 100;
    pts.push(`${x.toFixed(2)}% ${(100 - edge(i, bottom)).toFixed(2)}%`);
  }
  return `polygon(${pts.join(',')})`;
}

export type Vec = {
  /** horizontal throw, px */
  tx: number;
  /** vertical throw, as a multiple of viewport height (always downward) */
  ty: number;
  /** rotation at full scatter, deg */
  rot: number;
  /** per-fragment speed so the pieces do not fall as a block */
  rate: number;
};

/** Where the n shredded fragments are thrown. Deterministic per seed. */
export function scatter(n: number, seed: number): Vec[] {
  const r = rng(seed);
  const out: Vec[] = [];
  for (let i = 0; i < n; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    out.push({
      tx: side * (90 + r() * 320),
      ty: 1.05 + r() * 0.9,
      rot: side * (14 + r() * 46),
      rate: 0.74 + r() * 0.5,
    });
  }
  return out;
}

/**
 * The dense channel, drawn as ink: 64 contiguous values with a smooth
 * low-frequency structure — IndicBERTv2, where every dimension carries a
 * little of the meaning.
 */
export function denseRows(n = 64, seed = 2205): number[] {
  const r = rng(seed);
  const phase = [r() * 6.28, r() * 6.28, r() * 6.28];
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const v =
      0.5 +
      0.26 * Math.sin(t * 7.2 + phase[0]) +
      0.14 * Math.sin(t * 17.4 + phase[1]) +
      0.08 * Math.sin(t * 31.1 + phase[2]);
    out.push(Math.max(0.06, Math.min(1, v)));
  }
  return out;
}

/**
 * The sparse channel: mostly nothing, with a handful of hard, full-strength
 * hits — TF-IDF, where a rare political term is the whole signal.
 */
export function sparseRows(n = 64, seed = 3773): number[] {
  const r = rng(seed);
  const out: number[] = [];
  for (let i = 0; i < n; i++) out.push(r() < 0.17 ? 0.55 + r() * 0.45 : 0);
  return out;
}
