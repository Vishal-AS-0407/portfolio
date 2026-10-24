/* Inheritance — a nine-shot shadow-puppet story in a panoramic strip along the
   bottom edge, scrubbed by the whole page's scroll. Its sky dissolves upward
   into the page; the shot's line sits under the figures' feet like a subtitle.
   One draw per frame from the site's spine, nothing while collapsed.
   docs/design/inheritance-film.md */
import { useEffect, useRef, useState } from 'react';
import { onFrame, prefersReduced, ss } from '@/lib/scroll';
import { createFilm } from './engine';
import { SHOTS, shotAt, localU } from './script';

const KEY = 'story-collapsed';
const ls = {
  get: () => { try { return localStorage.getItem(KEY) === '1'; } catch { return false; } },
  set: (v: boolean) => { try { localStorage.setItem(KEY, v ? '1' : '0'); } catch { /* private mode */ } },
};

export default function Band() {
  const root = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const slug = useRef<HTMLSpanElement>(null);
  const line = useRef<HTMLSpanElement>(null);
  const sub = useRef<HTMLDivElement>(null);
  const [collapsed, setCollapsed] = useState(ls.get);
  const colRef = useRef(collapsed);
  colRef.current = collapsed;

  useEffect(() => {
    const c = cv.current, r = root.current;
    if (!c || !r) return;
    const x = c.getContext('2d')!;
    const film = createFilm();
    const still = prefersReduced();
    const qs = new URLSearchParams(location.search);
    const freeze = qs.has('story') ? Number(qs.get('story')) : null;
    const bones = qs.get('bones') === '1';

    let W = 0, H = 0, dpr = 1;
    const size = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = c.clientWidth; H = c.clientHeight;
      c.width = Math.round(W * dpr); c.height = Math.round(H * dpr);
      lastF = -1;
    };
    let lastF = -1, lastShot = -1, lastT = performance.now();
    size();
    const ro = new ResizeObserver(size);
    ro.observe(c);

    const off = onFrame(({ p }) => {
      const now = performance.now();
      const dt = Math.min(0.05, (now - lastT) / 1000);
      lastT = now;
      if (colRef.current || !W || document.hidden) return;
      const f = Math.min(0.9995, Math.max(0, freeze ?? p));
      if (still && f === lastF) return;
      lastF = f;

      x.setTransform(dpr, 0, 0, dpr, 0, 0);
      const out = film.draw(x, W, H, f, now / 1000, dt, still, bones, true);

      const i = shotAt(f), u = localU(i, f);
      if (i !== lastShot) {
        lastShot = i;
        if (slug.current) slug.current.textContent = `${SHOTS[i].title}`;
        if (line.current) line.current.textContent = SHOTS[i].cap;
      }
      r.dataset.tone = out.tone > 0.5 ? 'light' : 'dark';
      const a = ss(0.03, 0.14, u) * (i === SHOTS.length - 1 ? 1 : 1 - ss(0.86, 0.97, u));
      if (sub.current) {
        sub.current.style.opacity = a.toFixed(3);
        sub.current.style.transform = `translate3d(0,${((1 - a) * 6).toFixed(1)}px,0)`;
      }
    });

    return () => { off(); ro.disconnect(); };
  }, []);

  const toggle = () => { const v = !collapsed; setCollapsed(v); ls.set(v); };

  return (
    <div ref={root} className="story" data-collapsed={collapsed || undefined} data-tone="dark">
      <canvas ref={cv} className="story-cv" aria-hidden />
      <div ref={sub} className="story-sub" aria-hidden style={{ opacity: 0 }}>
        <span ref={slug} className="mono">{SHOTS[0].title}</span>
        <span ref={line} className="story-line">{SHOTS[0].cap}</span>
      </div>
      <button type="button" className="story-toggle mono" onClick={toggle} aria-pressed={!collapsed} data-cur>
        {collapsed ? '▸ story' : '▾ story'}
      </button>
    </div>
  );
}
