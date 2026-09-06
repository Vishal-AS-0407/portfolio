/* Deterministic trace generation.
   Every polyline on this page is a sum of sines with a seeded phase, so the
   paper prints identically on every reload and on every device — a chart
   recorder that produced different paper each time would not be a record. */

const mk = (seed: number) => {
  let s = seed || 1;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647);
};

/** One channel: `samples` points across `width` units, centred in `height`. */
export function trace(seed: number, width: number, height: number, samples: number, amp = 0.4) {
  const r = mk(seed);
  /* four components: a slow drift, an alpha-band oscillation, a beta ripple,
     and a sparse spike train */
  const c = [
    { f: 0.9 + r() * 0.7, a: 0.42 + r() * 0.25, p: r() * 6.283 },
    { f: 7 + r() * 5, a: 0.30 + r() * 0.22, p: r() * 6.283 },
    { f: 21 + r() * 14, a: 0.14 + r() * 0.12, p: r() * 6.283 },
    { f: 47 + r() * 30, a: 0.06 + r() * 0.06, p: r() * 6.283 },
  ];
  const spikeAt = 0.1 + r() * 0.8;
  const mid = height / 2;
  const A = (height / 2) * amp;
  let d = '';
  for (let i = 0; i < samples; i++) {
    const t = i / (samples - 1);
    let v = 0;
    for (const k of c) v += k.a * Math.sin(t * k.f * 6.283 * 4 + k.p);
    /* one error-related potential per channel, because that is the point of
       the second rig */
    const dt = t - spikeAt;
    v += 1.15 * Math.exp(-(dt * dt) / 0.00003) * (r() > 0.5 ? 1 : -1) * 0.6;
    const x = t * width;
    const y = mid - v * A;
    d += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
  }
  return d;
}

export const DREAMER_CH = [
  'AF3', 'F7', 'F3', 'FC5', 'T7', 'P7', 'O1',
  'O2', 'P8', 'T8', 'FC6', 'F4', 'F8', 'AF4',
];

/** A damped galvanometer settling on its target. Deterministic in `t` (0..1). */
export const needle = (t: number) => {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  return 1 - Math.exp(-5.2 * t) * Math.cos(8.6 * t);
};

/** A torn paper edge: a jagged polygon across `w`, biting up to `bite` px. */
export function tornEdge(seed: number, steps = 42, bite = 22) {
  const r = mk(seed);
  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * 100;
    const y = (r() * bite).toFixed(1);
    pts.push(`${x.toFixed(2)}% ${y}px`);
  }
  return `polygon(${pts.join(',')}, 100% 100%, 0 100%)`;
}
