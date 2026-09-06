/* Two canvases that answer to a scroll ref rather than to React state.
   Both are drawn with fillRect only — no gradients, no shadows, no per-frame
   allocation — so they stay cheap while the shader owns the GPU. */
import { useEffect, useRef } from 'react';
import { prefersReduced } from '@/projects/_shared/reduced';

/* 461 features, grouped the way the pipeline groups them. The counts sum to
   exactly 461, which is the number the notebook reports per clip. */
export const FAMILIES: [string, number][] = [
  ['mfcc + Δ + ΔΔ', 216],
  ['mel spectrogram', 96],
  ['chroma stft', 72],
  ['spectral contrast', 42],
  ['tonnetz', 18],
  ['centroid · bandwidth · rolloff', 9],
  ['zero-crossing rate · rms', 6],
  ['tempogram', 2],
];
export const TOTAL = FAMILIES.reduce((a, b) => a + b[1], 0);

/* ── 461 cells, lighting family by family ── */
export function FeatureField({ pRef }: { pRef: React.MutableRefObject<number> }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    const reduced = prefersReduced();

    let W = 0, H = 0, cols = 0, rows = 0, cw = 0, ch = 0, dpr = 1;
    const size = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = cv.clientWidth;
      H = cv.clientHeight;
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.max(12, Math.round(Math.sqrt(TOTAL * (W / Math.max(1, H)))));
      rows = Math.ceil(TOTAL / cols);
      cw = W / cols;
      ch = H / rows;
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(cv);

    /* deterministic per-cell phase, so the wave has texture but never jitters */
    const phase = new Float32Array(TOTAL);
    let seed = 12345;
    for (let i = 0; i < TOTAL; i++) {
      seed = (seed * 16807) % 2147483647;
      phase[i] = seed / 2147483647;
    }

    let id = 0;
    let last = -1;
    const draw = () => {
      id = requestAnimationFrame(draw);
      if (document.hidden) return;
      const p = reduced ? 1 : pRef.current;
      if (Math.abs(p - last) < 0.0015) return;
      last = p;

      ctx.clearRect(0, 0, W, H);
      const lit = p * TOTAL * 1.06;
      for (let i = 0; i < TOTAL; i++) {
        const c = i % cols;
        const r = (i / cols) | 0;
        /* each cell needs the wave to have passed it, plus its own dither */
        const a = Math.max(0, Math.min(1, (lit - i) / (26 + phase[i] * 40)));
        if (a <= 0.004) continue;
        const x = c * cw;
        const y = r * ch;
        const w = Math.max(1, cw - 2);
        const h = Math.max(1, ch - 2);
        /* amber for the cells the bandpass kept, teal for the rest */
        const warm = phase[i] > 0.34;
        ctx.fillStyle = warm
          ? `rgba(255,193,94,${(0.16 + a * 0.74).toFixed(3)})`
          : `rgba(69,208,200,${(0.14 + a * 0.52).toFixed(3)})`;
        ctx.fillRect(x + 1, y + 1, w, h);
      }
    };
    id = requestAnimationFrame(draw);

    return () => { cancelAnimationFrame(id); ro.disconnect(); };
  }, [pRef]);

  return <canvas ref={ref} className="nw-canvas" aria-hidden="true" />;
}

/* ── SMOTE: the minority class interpolating itself into balance ── */
export function SmoteField({ pRef }: { pRef: React.MutableRefObject<number> }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    const reduced = prefersReduced();

    let W = 0, H = 0, dpr = 1;
    const size = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = cv.clientWidth;
      H = cv.clientHeight;
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(cv);

    let seed = 4242;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

    const MAJ = 150;
    const MIN = 34;
    const SYN = 116; // 34 + 116 = 150, balanced
    const maj = Array.from({ length: MAJ }, () => ({ x: 0.62 + (rnd() - 0.5) * 0.42, y: 0.5 + (rnd() - 0.5) * 0.74 }));
    const min = Array.from({ length: MIN }, () => ({ x: 0.26 + (rnd() - 0.5) * 0.22, y: 0.5 + (rnd() - 0.5) * 0.40 }));
    /* every synthetic point sits on a line between two real minority points --
       which is exactly what SMOTE does, and exactly why it leaks across a split */
    const syn = Array.from({ length: SYN }, () => {
      const a = min[(rnd() * MIN) | 0];
      const b = min[(rnd() * MIN) | 0];
      const t = rnd();
      return { ax: a.x, ay: a.y, bx: b.x, by: b.y, t, d: rnd() };
    });

    let id = 0;
    let last = -1;
    const draw = () => {
      id = requestAnimationFrame(draw);
      if (document.hidden) return;
      const p = reduced ? 1 : pRef.current;
      if (Math.abs(p - last) < 0.0015) return;
      last = p;

      ctx.clearRect(0, 0, W, H);
      const R = Math.max(1.6, Math.min(W, H) * 0.006);

      ctx.fillStyle = 'rgba(140,160,196,0.34)';
      for (const m of maj) {
        ctx.beginPath();
        ctx.arc(m.x * W, m.y * H, R, 0, 6.2832);
        ctx.fill();
      }
      ctx.fillStyle = 'rgba(255,193,94,0.92)';
      for (const m of min) {
        ctx.beginPath();
        ctx.arc(m.x * W, m.y * H, R * 1.25, 0, 6.2832);
        ctx.fill();
      }
      for (const s of syn) {
        const g = Math.max(0, Math.min(1, (p - s.d * 0.62) / 0.34));
        if (g <= 0.01) continue;
        const x = (s.ax + (s.bx - s.ax) * s.t * g) * W;
        const y = (s.ay + (s.by - s.ay) * s.t * g) * H;
        ctx.fillStyle = `rgba(69,208,200,${(g * 0.62).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(x, y, R * 0.9, 0, 6.2832);
        ctx.fill();
      }
    };
    id = requestAnimationFrame(draw);

    return () => { cancelAnimationFrame(id); ro.disconnect(); };
  }, [pRef]);

  return <canvas ref={ref} className="nw-canvas" aria-hidden="true" />;
}
