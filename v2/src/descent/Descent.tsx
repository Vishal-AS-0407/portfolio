/* Descent — gradient descent told as a journey, in a strip along the bottom
   edge, played by the whole page's scroll. The world is painted into a hidden
   buffer and printed as points of the page's own ink. docs/design/descent.md */
import { useEffect, useRef, useState } from 'react';
import { onFrame, prefersReduced, ss } from '@/lib/scroll';
import { createPainter } from './paint';
import { createPrinter } from './printer';
import { BEATS, beatAt } from './world';

const KEY = 'story-collapsed';
const ls = {
  get: () => { try { return localStorage.getItem(KEY) === '1'; } catch { return false; } },
  set: (v: boolean) => { try { localStorage.setItem(KEY, v ? '1' : '0'); } catch { /* private mode */ } },
};
const CREAM: [number, number, number] = [239 / 255, 239 / 255, 231 / 255];
const INK: [number, number, number] = [20 / 255, 21 / 255, 15 / 255];

export default function Descent() {
  const root = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const line = useRef<HTMLSpanElement>(null);
  const sub = useRef<HTMLDivElement>(null);
  const [collapsed, setCollapsed] = useState(ls.get);
  const [ok, setOk] = useState(true);
  const colRef = useRef(collapsed);
  colRef.current = collapsed;

  useEffect(() => {
    const c = cv.current, r = root.current;
    if (!c || !r) return;
    let printer: ReturnType<typeof createPrinter> = null;
    try { printer = createPrinter(c); } catch { printer = null; }
    if (!printer) { setOk(false); return; }
    const pr = printer;
    const painter = createPainter();
    const buf = document.createElement('canvas');
    const bx = buf.getContext('2d', { willReadFrequently: false })!;
    const still = prefersReduced();
    const qs = new URLSearchParams(location.search);
    const freeze = qs.has('descent') ? Number(qs.get('descent')) : null;

    let W = 0, H = 0, dpr = 1, cell = 2.4, top = 72, band = 150;
    const size = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = c.clientWidth; H = c.clientHeight;
      const cs = getComputedStyle(r);
      top = parseFloat(cs.getPropertyValue('--story-head')) || 72;
      band = H - top;
      cell = W < 760 ? 2.05 : 2.4;
      c.width = Math.round(W * dpr); c.height = Math.round(H * dpr);
      buf.width = Math.max(8, Math.round(W / cell)); buf.height = Math.max(8, Math.round(H / cell));
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(c);

    const t0 = performance.now();
    let lastT = t0, lastBeat = -1, lastF = -2;
    const off = onFrame(({ p }) => {
      const now = performance.now();
      const dt = Math.min(0.05, (now - lastT) / 1000);
      lastT = now;
      if (colRef.current || !W || document.hidden) return;
      const f = Math.min(0.9995, Math.max(0, freeze ?? p));
      const since = (now - t0) / 1000;
      const init = still ? 1 : ss(0.15, 2.0, since);
      if (still && f === lastF && init === 1) return;
      lastF = f;

      /* ink follows the page: cream on the void, ink on the plate */
      const bg = (document.documentElement.style.getPropertyValue('--bg') || '12 13 11').trim().split(/\s+/).map(Number);
      const inv = ss(0.3, 0.6, ((bg[0] ?? 12) - 12) / 220);
      const ink: [number, number, number] = [0, 1, 2].map((i) => CREAM[i] + (INK[i] - CREAM[i]) * inv) as [number, number, number];

      const t = still ? 0 : now / 1000;
      const out = painter.paint(bx, { W, H, top, band, p: f, t, dt, intro: still ? 1 : ss(1.3, 2.3, since), still, dpr, ink });
      pr.print(buf, {
        cell: cell * dpr, time: t, init, fog: out.fog, flash: out.flash, inv, top: top * dpr,
        ink, motes: out.motes, moteCount: still ? 0 : out.moteCount,
      });

      const i = beatAt(f), b = BEATS[i];
      if (i !== lastBeat) {
        lastBeat = i;
        if (label.current) label.current.textContent = b.label;
        if (line.current) line.current.textContent = b.line;
      }
      const u = (f - b.p0) / (b.p1 - b.p0);
      const a = ss(0.02, 0.12, u) * (i === BEATS.length - 1 ? 1 : 1 - ss(0.88, 0.98, u)) * (f < 0.07 ? ss(1.6, 2.6, since) : 1);
      if (sub.current) {
        sub.current.style.opacity = a.toFixed(3);
        sub.current.style.transform = `translate3d(0,${((1 - a) * 6).toFixed(1)}px,0)`;
      }
    });

    return () => { off(); ro.disconnect(); };
  }, []);

  if (!ok) return null;
  const toggle = () => { const v = !collapsed; setCollapsed(v); ls.set(v); };

  return (
    <div ref={root} className="descent" data-collapsed={collapsed || undefined}>
      <canvas ref={cv} className="descent-cv" aria-hidden />
      <div ref={sub} className="descent-sub" aria-hidden style={{ opacity: 0 }}>
        <span ref={label} className="mono">{BEATS[0].label}</span>
        <span ref={line} className="descent-line">{BEATS[0].line}</span>
      </div>
      <button type="button" className="descent-toggle mono" onClick={toggle} aria-pressed={!collapsed} data-cur>
        {collapsed ? '▸ story' : '▾ story'}
      </button>
    </div>
  );
}
