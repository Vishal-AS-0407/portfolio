/* Per-project signature animation. Each case study gets a different instrument,
   drawn on its own 2D canvas and driven by the shared scroll ticker.
   2D canvas (not WebGL) because the particle field already owns the GPU. */
import { useEffect, useRef } from 'react';
import { onFrame, deviceTier } from '@/lib/scroll';

export type MotifKind =
  | 'spectrogram' | 'oscilloscope' | 'attention' | 'ledger'
  | 'topography' | 'graph' | 'matrix' | 'series' | 'memory' | 'field';

export default function Motif({ kind, accent }: { kind: MotifKind; accent: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    const reduced = deviceTier() === 0;

    let W = 0, H = 0, dpr = 1;
    const size = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = cv.clientWidth; H = cv.clientHeight;
      cv.width = Math.max(1, W * dpr); cv.height = Math.max(1, H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();
    window.addEventListener('resize', size);

    /* stable per-instance randomness so the drawing doesn't jitter each frame */
    const R: number[] = [];
    for (let i = 0; i < 600; i++) R.push(Math.random());

    const draw = (t: number, local: number) => {
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = accent;
      ctx.fillStyle = accent;
      const rev = reduced ? 1 : local; // how much of the drawing has "arrived"

      switch (kind) {
        /* stacked frequency bands scrolling left — a mel spectrogram */
        case 'spectrogram': {
          const cols = 90, rows = 22;
          const cw = W / cols, ch = H / rows;
          for (let x = 0; x < cols; x++) {
            if (x / cols > rev) break;
            for (let y = 0; y < rows; y++) {
              const e =
                Math.exp(-Math.pow((y - 4 - 5 * Math.sin(x * 0.13 + t * 0.4)) / 4.2, 2)) *
                (0.55 + 0.45 * Math.sin(x * 0.31 + t * 1.1));
              const a = Math.max(0, e) * 0.85;
              if (a < 0.02) continue;
              ctx.globalAlpha = a;
              ctx.fillRect(x * cw, H - (y + 1) * ch, cw - 0.6, ch - 0.6);
            }
          }
          ctx.globalAlpha = 1;
          break;
        }
        /* 8 EEG channels with a stimulus marker */
        case 'oscilloscope': {
          const ch = 8;
          for (let c = 0; c < ch; c++) {
            ctx.globalAlpha = 0.28 + 0.62 * (c / ch);
            ctx.lineWidth = 1.15;
            ctx.beginPath();
            const y0 = (H / (ch + 1)) * (c + 1);
            for (let x = 0; x <= W * rev; x += 2) {
              const u = x / W;
              const burst = 1 + 1.9 * Math.exp(-Math.pow((u - 0.62) / 0.06, 2));
              const v =
                Math.sin(u * 42 + c + t * 1.6) * 0.9 +
                Math.sin(u * 91 + c * 1.7 - t) * 0.32 +
                Math.sin(u * 17 + c * 0.6 + t * 0.5) * 0.55;
              const y = y0 + v * burst * (H / (ch + 1)) * 0.3;
              x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
            }
            ctx.stroke();
          }
          ctx.globalAlpha = 0.4; ctx.lineWidth = 1;
          ctx.setLineDash([5, 4]);
          ctx.beginPath(); ctx.moveTo(W * 0.62, 0); ctx.lineTo(W * 0.62, H); ctx.stroke();
          ctx.setLineDash([]); ctx.globalAlpha = 1;
          break;
        }
        /* self-attention: diagonal-dominant heat grid */
        case 'attention': {
          const n = 26, s = Math.min(W, H) / n;
          const ox = (W - s * n) / 2, oy = (H - s * n) / 2;
          for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
              if ((i * n + j) / (n * n) > rev) continue;
              const d = Math.abs(i - j);
              const v =
                Math.exp(-d / 2.6) * 0.85 +
                R[(i * n + j) % R.length] * 0.3 * Math.exp(-d / 9) +
                0.06 * Math.sin(t + i * 0.4);
              ctx.globalAlpha = Math.max(0, Math.min(1, v)) * 0.9;
              ctx.fillRect(ox + j * s, oy + i * s, s - 0.8, s - 0.8);
            }
          }
          ctx.globalAlpha = 1;
          break;
        }
        /* encrypted blocks committing to a chain */
        case 'ledger': {
          const cols = 15, rows = 9;
          const cw = W / cols, chh = H / rows;
          for (let i = 0; i < cols * rows; i++) {
            if (i / (cols * rows) > rev) break;
            const x = (i % cols) * cw, y = ((i / cols) | 0) * chh;
            const sealed = R[i % R.length] > 0.42;
            ctx.globalAlpha = sealed ? 0.16 + 0.5 * Math.abs(Math.sin(t * 0.6 + i)) : 0.1;
            ctx.lineWidth = 1;
            ctx.strokeRect(x + 3, y + 3, cw - 8, chh - 8);
            if (sealed) {
              ctx.globalAlpha = 0.5;
              ctx.fillRect(x + cw / 2 - 1.6, y + chh / 2 - 1.6, 3.2, 3.2);
            }
          }
          ctx.globalAlpha = 1;
          break;
        }
        /* contour map — terrain-aware threat surface */
        case 'topography': {
          ctx.lineWidth = 1;
          for (let L = 0; L < 16; L++) {
            if (L / 16 > rev) break;
            ctx.globalAlpha = 0.09 + 0.35 * (L / 16);
            ctx.beginPath();
            for (let a = 0; a <= 6.3; a += 0.045) {
              const rr =
                (0.13 + L * 0.052) *
                Math.min(W, H) *
                (1 + 0.26 * Math.sin(a * 3 + L * 0.5 + t * 0.25) + 0.14 * Math.sin(a * 6 - L));
              const x = W / 2 + Math.cos(a) * rr * 1.5;
              const y = H / 2 + Math.sin(a) * rr;
              a ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
            }
            ctx.closePath(); ctx.stroke();
          }
          ctx.globalAlpha = 1;
          break;
        }
        /* knowledge graph: communities and their edges */
        case 'graph': {
          const N = 46;
          const node = (i: number) => {
            const cl = i % 5;
            const ca = (cl / 5) * 6.283;
            const cx = W / 2 + Math.cos(ca) * W * 0.26;
            const cy = H / 2 + Math.sin(ca) * H * 0.28;
            return [
              cx + (R[i * 2] - 0.5) * W * 0.16 + Math.sin(t * 0.4 + i) * 4,
              cy + (R[i * 2 + 1] - 0.5) * H * 0.18 + Math.cos(t * 0.35 + i) * 4,
            ];
          };
          ctx.lineWidth = 0.8;
          for (let i = 0; i < N; i++) {
            if (i / N > rev) break;
            for (let j = i + 1; j < N; j++) {
              if (i % 5 !== j % 5 && R[(i + j) % R.length] > 0.06) continue;
              if (R[(i * j) % R.length] > 0.32) continue;
              const [x1, y1] = node(i), [x2, y2] = node(j);
              ctx.globalAlpha = i % 5 === j % 5 ? 0.22 : 0.07;
              ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
            }
          }
          for (let i = 0; i < N * rev; i++) {
            const [x, y] = node(i);
            ctx.globalAlpha = 0.85;
            ctx.beginPath(); ctx.arc(x, y, 2.4 + R[i] * 2.2, 0, 6.283); ctx.fill();
          }
          ctx.globalAlpha = 1;
          break;
        }
        /* 15 x 3 SDG impact matrix */
        case 'matrix': {
          const cols = 15, rows = 3;
          const cw = W / cols, chh = Math.min(H / rows, H / 3);
          const oy = (H - chh * rows) / 2;
          for (let i = 0; i < cols * rows; i++) {
            if (i / (cols * rows) > rev) break;
            const c = i % cols, r = (i / cols) | 0;
            const v = R[i % R.length] * 0.8 + 0.2 * Math.abs(Math.sin(t * 0.5 + i * 0.3));
            ctx.globalAlpha = v * 0.85;
            ctx.fillRect(c * cw + 2, oy + r * chh + 2, cw - 5, chh - 5);
          }
          ctx.globalAlpha = 1;
          break;
        }
        /* hierarchical memory: domain slabs, with cache hits firing */
        case 'memory': {
          const lanes = 6, pad = 10;
          const lh = (H - pad * (lanes + 1)) / lanes;
          for (let L = 0; L < lanes; L++) {
            if (L / lanes > rev) break;
            const y = pad + L * (lh + pad);
            const depth = 1 - L / lanes;
            ctx.globalAlpha = 0.10 + 0.16 * depth;
            ctx.lineWidth = 1;
            ctx.strokeRect(2, y, W - 4, lh);
            const cells = 10 + L * 3;
            const cw = (W - 8) / cells;
            for (let i = 0; i < cells; i++) {
              const hit = Math.sin(t * 1.3 + i * 0.9 + L * 2.1);
              if (hit < 0.72) continue;
              ctx.globalAlpha = (hit - 0.72) / 0.28 * 0.8;
              ctx.fillRect(4 + i * cw + 1, y + 2, cw - 3, lh - 4);
            }
          }
          ctx.globalAlpha = 1;
          break;
        }
        /* crop rows in perspective — an agricultural field */
        case 'field': {
          const rows = 26;
          ctx.lineWidth = 1;
          for (let r = 0; r < rows; r++) {
            if (r / rows > rev) break;
            const u = r / rows;
            const y = H * (0.34 + 0.66 * u * u);
            ctx.globalAlpha = 0.08 + 0.34 * u;
            ctx.beginPath();
            for (let x = 0; x <= W; x += 6) {
              const wob = Math.sin(x * 0.012 + t * 0.5 + r * 0.4) * (2 + 7 * u);
              x ? ctx.lineTo(x, y + wob) : ctx.moveTo(x, y + wob);
            }
            ctx.stroke();
          }
          /* furrow verticals converging to a horizon */
          for (let c = -6; c <= 6; c++) {
            ctx.globalAlpha = 0.10;
            ctx.beginPath();
            ctx.moveTo(W / 2 + c * 14, H * 0.34);
            ctx.lineTo(W / 2 + c * (W / 9), H);
            ctx.stroke();
          }
          ctx.globalAlpha = 1;
          break;
        }
        /* forecast vs baseline */
        case 'series': {
          for (const [amp, alpha, ph] of [[0.32, 0.28, 0], [0.5, 0.9, 1.4]] as const) {
            ctx.globalAlpha = alpha; ctx.lineWidth = 1.6;
            ctx.beginPath();
            for (let x = 0; x <= W * rev; x += 2) {
              const u = x / W;
              const y =
                H / 2 +
                (Math.sin(u * 9 + ph + t * 0.4) * 0.6 + Math.sin(u * 23 + ph) * 0.25) * H * amp;
              x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
            }
            ctx.stroke();
          }
          ctx.globalAlpha = 1;
          break;
        }
      }
    };

    let local = 0;
    const off = onFrame(({ dt }) => {
      const r = cv.getBoundingClientRect();
      const vis = 1 - Math.min(1, Math.max(0, (r.top - window.innerHeight * 0.15) / (window.innerHeight * 0.7)));
      local += (vis - local) * Math.min(1, 0.07 * dt);
      if (r.bottom < -200 || r.top > window.innerHeight + 200) return; // offscreen: skip
      draw(performance.now() * 0.001, Math.max(0, Math.min(1, local)));
    });

    return () => { off(); window.removeEventListener('resize', size); };
  }, [kind, accent]);

  return <canvas ref={ref} className="block w-full h-full" aria-hidden />;
}
