/* One bespoke scroll-driven instrument per case study.
   Mounted fixed behind the page and driven by document scroll progress, so the
   whole page reads as a single continuous run of the thing the project does.
   2D canvas — the particle field already owns the GPU. */
import { useEffect, useRef } from 'react';
import { onFrame, deviceTier, clamp, lerp, ss } from '@/lib/scroll';

export type SignatureKind =
  | 'waterfall' | 'recorder' | 'attention' | 'federation'
  | 'depth' | 'strata' | 'graph' | 'matrix';

/* deterministic PRNG so nothing jitters between frames or reloads */
const mk = (seed: number) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

const hexRGB = (h: string) => {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255] as const;
};
const rgba = (h: string, a: number) => {
  const [r, g, b] = hexRGB(h);
  return `rgba(${r},${g},${b},${a})`;
};
/* must return hex — the result is fed back through rgba(), which parses hex */
const mixHex = (a: string, b: string, t: number) => {
  const A = hexRGB(a), B = hexRGB(b);
  const c = (i: 0 | 1 | 2) =>
    Math.round(lerp(A[i], B[i], clamp(t, 0, 1))).toString(16).padStart(2, '0');
  return `#${c(0)}${c(1)}${c(2)}`;
};

export default function Signature({
  kind, accent, accent2, ink,
}: { kind: SignatureKind; accent: string; accent2: string; ink: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext('2d', { alpha: true });
    if (!ctx) return;

    const tier = deviceTier();
    const reduced = tier === 0;
    const light = tier < 2;               // fewer elements on phones

    let W = 0, H = 0;
    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, light ? 1.25 : 1.5);
      W = window.innerWidth; H = window.innerHeight;
      cv.width = Math.max(1, Math.round(W * dpr));
      cv.height = Math.max(1, Math.round(H * dpr));
      cv.style.width = W + 'px'; cv.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    };

    /* ── per-kind precomputed geometry, rebuilt only on resize ── */
    let foliage: { path: Path2D; rate: number; a: number }[] = [];
    let nodes: { x: number; y: number; r: number; c: number; ph: number }[] = [];
    let edges: { a: number; b: number; w: number; same: boolean }[] = [];

    function build() {
      const r = mk(20250407);

      if (kind === 'depth') {
        foliage = [];
        const layers = light ? 3 : 5;
        for (let L = 0; L < layers; L++) {
          const p = new Path2D();
          const baseY = H * (0.52 + L * 0.11);
          const amp = 26 + L * 20;
          p.moveTo(-40, H + 60);
          p.lineTo(-40, baseY);
          for (let x = -40; x <= W + 40; x += 22) {
            const y = baseY
              - Math.abs(Math.sin(x * 0.006 + L * 2.1)) * amp
              - r() * amp * 0.7;
            p.lineTo(x, y);
            p.lineTo(x + 11, y + 8 + r() * 14);
          }
          p.lineTo(W + 40, H + 60);
          p.closePath();
          // low alpha on purpose: at full strength the canopy swallowed the copy
          foliage.push({ path: p, rate: 0.05 + L * 0.085, a: 0.115 - L * 0.019 });
        }
      }

      if (kind === 'graph') {
        const N = light ? 36 : 66;
        const K = 5;                                   // communities
        nodes = [];
        const S = Math.min(W, H);
        for (let i = 0; i < N; i++) {
          const c = i % K;
          // each community gets its own centre, and members stay near it —
          // otherwise the edges read as scribble instead of structure
          const ca = (c / K) * Math.PI * 2 - Math.PI / 2;
          const cxp = W * 0.5 + Math.cos(ca) * S * 0.42;
          const cyp = H * 0.5 + Math.sin(ca) * S * 0.30;
          const a = r() * Math.PI * 2;
          const rad = S * 0.055 * Math.sqrt(r());
          nodes.push({
            x: cxp + Math.cos(a) * rad,
            y: cyp + Math.sin(a) * rad,
            r: 2 + r() * 3, c, ph: r() * 6.28,
          });
        }
        edges = [];
        const byC: number[][] = Array.from({ length: K }, () => []);
        nodes.forEach((n, i) => byC[n.c].push(i));
        for (let c = 0; c < K; c++) {
          const g = byC[c];
          for (let a = 0; a < g.length; a++) {
            for (let k = 0; k < 2; k++) {
              const b = g[(a + 1 + ((r() * (g.length - 1)) | 0)) % g.length];
              if (b === g[a]) continue;
              edges.push({ a: g[a], b, w: 0.55 + r() * 0.45, same: true });
            }
          }
        }
        // a sparse handful of bridges — the links the partition has to cut
        for (let k = 0; k < K * 2; k++) {
          const i = (r() * N) | 0, j = (r() * N) | 0;
          if (nodes[i].c !== nodes[j].c) edges.push({ a: i, b: j, w: 0.14 + r() * 0.16, same: false });
        }
      }
    }

    size();
    window.addEventListener('resize', size);

    /* ── draw ── */
    const draw = (p: number, t: number) => {
      ctx.clearRect(0, 0, W, H);
      /* On a phone the copy occupies the full width, so the instrument has to
         step back — there is no empty column for it to live in. */
      ctx.globalAlpha = light ? 0.45 : 1;
      const P = reduced ? 0.72 : p;      // reduced motion: show a settled state

      switch (kind) {
        /* ── 01 · baby-cry — a spectrogram waterfall with the passband gated ── */
        case 'waterfall': {
          const x0 = W * 0.52, x1 = W * 0.97;
          const bins = light ? 40 : 74;
          const rows = light ? 44 : 78;
          const bw = (x1 - x0) / bins;
          const rh = H / rows;
          // the real filter band, mapped onto a 0-8kHz axis
          const lo = (142.91 / 8000) * bins, hi = (6620.12 / 8000) * bins;
          const gate = ss(0.16, 0.40, P);           // how closed the bandpass is

          // the display panel, so the trace reads against something
          ctx.fillStyle = rgba(accent, 0.035);
          ctx.fillRect(x0, 0, x1 - x0, H * Math.min(1, P * 1.12));

          for (let y = 0; y < rows; y++) {
            const ty = y / rows;
            if (ty > P * 1.12) break;
            const fade = clamp((P * 1.12 - ty) * 5, 0, 1);
            for (let b = 0; b < bins; b++) {
              const fb = b / bins;
              let e =
                Math.exp(-Math.pow((fb - 0.16 - 0.06 * Math.sin(ty * 9 + t * 0.5)) / 0.10, 2)) * 0.9 +
                Math.exp(-Math.pow((fb - 0.42) / 0.16, 2)) * 0.45 * (0.5 + 0.5 * Math.sin(ty * 21 + t)) +
                Math.exp(-Math.pow((fb - 0.72) / 0.22, 2)) * 0.22;
              e *= 0.62 + 0.38 * Math.sin(ty * 31 + fb * 12 + t * 0.8);
              // gamma lift: raw mel energy is mostly low, and left linear the whole
              // panel renders as near-black
              e = Math.pow(clamp(e, 0, 1), 0.55) * 1.05;
              const inBand = b >= lo && b <= hi;
              if (!inBand) e *= 1 - gate * 0.94;      // everything outside is discarded
              if (e < 0.035) continue;
              ctx.fillStyle = inBand && gate > 0.15
                ? rgba(mixHex(accent, accent2, clamp(e * 0.95, 0, 1)), Math.min(0.95, e) * fade)
                : rgba(accent, Math.min(0.72, e * 0.85) * fade);
              ctx.fillRect(x0 + b * bw, y * rh, bw + 0.6, rh + 0.6);
            }
          }
          // the two cutoffs, drawn only once the filter has engaged
          if (gate > 0.04) {
            ctx.strokeStyle = rgba(accent2, gate * 0.75);
            ctx.lineWidth = 1.4;
            ctx.setLineDash([5, 6]);
            for (const b of [lo, hi]) {
              ctx.beginPath();
              ctx.moveTo(x0 + b * bw, 0);
              ctx.lineTo(x0 + b * bw, H * Math.min(1, P * 1.12));
              ctx.stroke();
            }
            ctx.setLineDash([]);
          }
          break;
        }

        /* ── 02 · eeg — a 14-channel chart recorder, time running down ── */
        case 'recorder': {
          const chans = light ? 8 : 14;
          // kept to a narrow band at the very edge — at a third of the viewport it
          // ran straight through the left column of copy
          const x0 = W * 0.012, x1 = W * 0.20;
          const cw = (x1 - x0) / chans;
          const erp = ss(0.50, 0.58, P) * (1 - ss(0.66, 0.80, P));   // the stimulus
          const yMax = H * Math.min(1, P * 1.15);

          for (let c = 0; c < chans; c++) {
            const cx = x0 + cw * (c + 0.5);
            ctx.strokeStyle = rgba(c % 4 === 3 ? accent2 : accent, 0.16 + 0.34 * (c / chans));
            ctx.lineWidth = 1.15;
            ctx.beginPath();
            for (let y = 0; y <= yMax; y += 3) {
              const u = y / H;
              const spike = Math.exp(-Math.pow((u - 0.54) / 0.018, 2)) * erp * 34;
              const v =
                Math.sin(u * 74 + c * 1.3 + t * 1.4) * 0.85 +
                Math.sin(u * 151 + c * 2.1 - t * 0.9) * 0.30 +
                Math.sin(u * 29 + c * 0.7 + t * 0.4) * 0.55;
              const x = cx + v * cw * 0.34 + spike * (c % 2 ? 1 : -1);
              y ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
            }
            ctx.stroke();
          }
          if (erp > 0.02) {
            ctx.strokeStyle = rgba(accent2, erp * 0.85);
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            ctx.moveTo(x0 - 14, H * 0.54);
            ctx.lineTo(x1 + 14, H * 0.54);
            ctx.stroke();
            ctx.fillStyle = rgba(accent2, erp);
            ctx.fillRect(x0 - 22, H * 0.54 - 3, 6, 6);
          }
          break;
        }

        /* ── 03 · dravidian — an attention matrix resolving out of noise ── */
        case 'attention': {
          const n = light ? 16 : 26;
          const S = Math.min(W * 0.42, H * 0.72);
          const cell = S / n;
          const ox = W * 0.56, oy = (H - S) / 2;
          const sharp = ss(0.10, 0.72, P);
          const rnd = mk(4242);

          for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
              const noise = rnd() * 0.55;
              // the structure it converges to: a diagonal plus a couple of heads
              const d = Math.exp(-Math.pow((i - j) / 1.7, 2));
              const head = Math.exp(-Math.pow((i - j * 0.42 - 5) / 2.4, 2)) * 0.65
                + Math.exp(-Math.pow((j - n * 0.72) / 1.6, 2)) * 0.42;
              const target = clamp(d + head * 0.8, 0, 1);
              const v = lerp(noise, target, sharp);
              if (v < 0.045) continue;
              ctx.fillStyle = rgba(v > 0.62 ? accent2 : accent, v * 0.8);
              ctx.fillRect(ox + j * cell, oy + i * cell, cell - 0.8, cell - 0.8);
            }
          }
          ctx.strokeStyle = rgba(ink, 0.12);
          ctx.lineWidth = 1;
          ctx.strokeRect(ox, oy, S, S);
          // axis ticks — tokens
          ctx.fillStyle = rgba(ink, 0.22);
          for (let i = 0; i < n; i += 2) {
            ctx.fillRect(ox - 9, oy + i * cell + cell * 0.2, 5, 1.4);
            ctx.fillRect(ox + i * cell + cell * 0.2, oy + S + 4, 1.4, 5);
          }
          break;
        }

        /* ── 04 · fraud — federated clients sending encrypted gradients ── */
        case 'federation': {
          const cx = W * 0.74, cy = H * 0.5;
          const clients = light ? 4 : 6;
          const R = Math.min(W * 0.17, H * 0.32);
          const round = P * 4;                       // four training rounds
          const phase = round % 1;

          for (let i = 0; i < clients; i++) {
            const a = (i / clients) * Math.PI * 2 - Math.PI / 2;
            const nx = cx + Math.cos(a) * R * 1.35, ny = cy + Math.sin(a) * R;
            ctx.strokeStyle = rgba(accent, 0.20);
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(nx, ny); ctx.lineTo(cx, cy); ctx.stroke();

            // the client
            ctx.strokeStyle = rgba(accent, 0.75);
            ctx.lineWidth = 1.5;
            ctx.strokeRect(nx - 11, ny - 11, 22, 22);
            ctx.fillStyle = rgba(accent, 0.10);
            ctx.fillRect(nx - 11, ny - 11, 22, 22);

            // a sealed payload travelling in, then weights travelling back out
            const up = phase < 0.5;
            const k = up ? phase * 2 : 1 - (phase - 0.5) * 2;
            const px = lerp(nx, cx, k), py = lerp(ny, cy, k);
            const jitter = up ? Math.sin(t * 22 + i) * 1.6 : 0;
            ctx.fillStyle = rgba(up ? accent : accent2, 0.9);
            ctx.fillRect(px - 3 + jitter, py - 3, 6, 6);
          }

          // the aggregator
          const agg = Math.exp(-Math.pow((phase - 0.52) / 0.06, 2));
          ctx.strokeStyle = rgba(accent2, 0.35 + agg * 0.5);
          ctx.lineWidth = 1.6;
          ctx.beginPath(); ctx.arc(cx, cy, 26 + agg * 12, 0, 6.2832); ctx.stroke();
          ctx.beginPath(); ctx.arc(cx, cy, 15, 0, 6.2832); ctx.stroke();
          ctx.fillStyle = rgba(accent2, 0.1 + agg * 0.25);
          ctx.beginPath(); ctx.arc(cx, cy, 15, 0, 6.2832); ctx.fill();
          break;
        }

        /* ── 05 · wisp — layered undergrowth, the deepest parallax of the eight ── */
        case 'depth': {
          for (const f of foliage) {
            ctx.save();
            ctx.translate(0, -P * f.rate * H * 1.5);
            ctx.fillStyle = rgba(accent, f.a);
            ctx.fill(f.path);
            ctx.restore();
          }
          // terrain contours surface for the threat-map section
          const cont = ss(0.58, 0.86, P);
          if (cont > 0.01) {
            ctx.strokeStyle = rgba(accent2, cont * 0.30);
            ctx.lineWidth = 1;
            for (let k = 0; k < (light ? 5 : 9); k++) {
              ctx.beginPath();
              for (let x = 0; x <= W; x += 12) {
                const y = H * 0.34 + k * 22
                  + Math.sin(x * 0.0055 + k * 0.6) * 26
                  + Math.sin(x * 0.013 + k * 1.7) * 11;
                x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
              }
              ctx.stroke();
            }
          }
          break;
        }

        /* ── 06 · memora — memory strata, with a retrieval sweep ── */
        case 'strata': {
          const bands = 7;
          const bh = H / bands;
          const active = clamp(Math.floor(P * bands * 0.999), 0, bands - 1);
          const sweep = (P * bands) % 1;

          for (let b = 0; b < bands; b++) {
            const on = b === active;
            const y = b * bh;
            ctx.fillStyle = rgba(on ? accent2 : accent, on ? 0.07 : 0.010);
            ctx.fillRect(0, y, W, bh - 2);
            ctx.strokeStyle = rgba(ink, on ? 0.16 : 0.04);
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();

            // slabs of stored context
            const rnd = mk(900 + b * 31);
            const cells = light ? 22 : 46;
            for (let i = 0; i < cells; i++) {
              const cx = (i / cells) * W + rnd() * 12;
              const cw2 = 8 + rnd() * 34;
              const ch2 = 3 + rnd() * 5;
              const cy2 = y + bh * (0.24 + rnd() * 0.5);
              const lit = on && Math.abs(i / cells - sweep) < 0.10;
              // only the retrieved slice is bright; the rest of memory stays quiet
              ctx.fillStyle = rgba(lit ? accent2 : accent, lit ? 0.95 : on ? 0.34 : 0.045);
              ctx.fillRect(cx, cy2, cw2, ch2);
            }
          }
          // the query beam
          ctx.strokeStyle = rgba(accent2, 0.5);
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(sweep * W, active * bh);
          ctx.lineTo(sweep * W, (active + 1) * bh);
          ctx.stroke();
          break;
        }

        /* ── 07 · semantic — the graph builds through the five phases ── */
        case 'graph': {
          const appear = ss(0.02, 0.26, P);      // 1 parse: nodes
          const link = ss(0.30, 0.55, P);        // 3 construct: edges
          const prune = ss(0.55, 0.72, P);       // 4 enhance: weak links fade
          const commun = ss(0.72, 0.94, P);      // 5 cluster: communities separate

          const pos = nodes.map((n, i) => {
            const drift = Math.sin(t * 0.5 + n.ph) * 5;
            // communities pull apart in the final phase
            const a = (n.c / 5) * Math.PI * 2;
            const sep = commun * 62;
            return {
              x: n.x + Math.cos(a) * sep + drift,
              y: n.y + Math.sin(a) * sep + Math.cos(t * 0.42 + n.ph) * 4,
              n, i,
            };
          });

          for (const e of edges) {
            const A = pos[e.a], B = pos[e.b];
            if (!A || !B) continue;
            const strength = e.same
              ? e.w * (1 + prune * 0.5)
              : e.w * (1 - prune * 0.82);
            const a = link * strength * 0.85;
            if (a < 0.015) continue;
            ctx.strokeStyle = e.same && commun > 0.2
              ? rgba(mixHex(accent, accent2, commun * 0.8), a)
              : rgba(accent, a);
            ctx.lineWidth = 0.5 + strength * 1.5;
            ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.stroke();
          }
          for (const q of pos) {
            const g = appear * (0.4 + 0.6 * Math.min(1, q.n.r / 4));
            if (g < 0.02) continue;
            ctx.fillStyle = commun > 0.15
              ? rgba(mixHex(accent, accent2, (q.n.c / 4) * commun), g * 0.95)
              : rgba(accent, g * 0.8);
            ctx.beginPath();
            ctx.arc(q.x, q.y, q.n.r * (0.6 + 0.4 * appear), 0, 6.2832);
            ctx.fill();
          }
          break;
        }

        /* ── 08 · qubit — the 15x3 SDG matrix fills, then allocates ── */
        case 'matrix': {
          const rows = 15, cols = 3;
          const cw = Math.min(W * 0.055, 34), ch = Math.min(H / 19, 26);
          const ox = W * 0.60, oy = (H - rows * ch) / 2;
          const fill = ss(0.06, 0.62, P);
          const alloc = ss(0.64, 0.94, P);
          const rnd = mk(15315);

          const scores: number[] = [];
          for (let r = 0; r < rows; r++) {
            let s = 0;
            for (let c = 0; c < cols; c++) {
              const v = 0.12 + rnd() * 0.88;
              s += v;
              const at = (r * cols + c) / (rows * cols);
              const on = clamp((fill - at) * 7, 0, 1);
              if (on < 0.02) continue;
              ctx.fillStyle = rgba(accent, v * on * 0.62);
              ctx.fillRect(ox + c * cw, oy + r * ch, cw - 2.5, ch - 2.5);
              ctx.strokeStyle = rgba(ink, 0.07 * on);
              ctx.lineWidth = 1;
              ctx.strokeRect(ox + c * cw, oy + r * ch, cw - 2.5, ch - 2.5);
            }
            scores.push(s / cols);
          }
          // the allocation the optimiser lands on
          if (alloc > 0.01) {
            const bx = ox + cols * cw + 14;
            const maxW = Math.min(W * 0.16, 150);
            for (let r = 0; r < rows; r++) {
              const w = scores[r] * maxW * alloc;
              ctx.fillStyle = rgba(accent2, 0.20 + scores[r] * 0.5 * alloc);
              ctx.fillRect(bx, oy + r * ch + 2, w, ch - 5.5);
            }
            ctx.strokeStyle = rgba(accent2, 0.30 * alloc);
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(bx - 6, oy); ctx.lineTo(bx - 6, oy + rows * ch); ctx.stroke();
          }
          break;
        }
      }
    };

    let t0 = performance.now();
    const off = onFrame(({ p }) => {
      draw(p, reduced ? 0 : (performance.now() - t0) / 1000);
    });
    if (reduced) draw(0.72, 0);

    return () => { off(); window.removeEventListener('resize', size); };
  }, [kind, accent, accent2, ink]);

  return <canvas ref={ref} className="fixed inset-0 w-full h-full block pointer-events-none" aria-hidden />;
}
