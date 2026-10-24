/* Inheritance — a short film you scroll. A pinned, letterboxed stage right
   after the hero; scroll is the projector. Under reduced motion it becomes a
   storyboard of nine stills instead. docs/design/inheritance-film.md */
import { useEffect, useRef } from 'react';
import { onFrame, prefersReduced, state, scrollTo, clamp } from '@/lib/scroll';
import { createFilm } from './engine';
import { SHOTS, shotAt, localU, F } from './script';

const pad = (i: number) => String(i + 1).padStart(2, '0');
const ss = (a: number, b: number, x: number) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

/* one 96px noise tile, generated once, for the grain layer */
function grainTile() {
  try {
    const c = document.createElement('canvas');
    c.width = c.height = 96;
    const x = c.getContext('2d')!;
    const im = x.createImageData(96, 96);
    for (let i = 0; i < im.data.length; i += 4) {
      const v = Math.random() * 255;
      im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255;
    }
    x.putImageData(im, 0, 0);
    return `url(${c.toDataURL()})`;
  } catch { return 'none'; }
}

export default function Film() {
  return prefersReduced() ? <Storyboard /> : <Player />;
}

function Player() {
  const sec = useRef<HTMLElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const slug = useRef<HTMLSpanElement>(null);
  const cap = useRef<HTMLDivElement>(null);
  const capT = useRef<HTMLParagraphElement>(null);
  const capK = useRef<HTMLSpanElement>(null);
  const slate = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLDivElement>(null);
  const live = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const s = sec.current, c = cv.current, st = stage.current;
    if (!s || !c || !st) return;
    const x = c.getContext('2d')!;
    const film = createFilm();
    const qs = new URLSearchParams(location.search);
    const freeze = qs.has('film') ? Number(qs.get('film')) : null;
    const bones = qs.get('bones') === '1';
    st.style.setProperty('--grain', grainTile());

    let W = 0, H = 0, dpr = 1;
    const size = () => {
      const coarse = matchMedia('(pointer: coarse)').matches;
      dpr = Math.min(coarse ? 2 : 1.5, window.devicePixelRatio || 1);
      W = c.clientWidth; H = c.clientHeight;
      c.width = Math.round(W * dpr); c.height = Math.round(H * dpr);
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(c);

    let fs = freeze ?? 0, lastShot = -1, lastT = performance.now(), on = false;
    const off = onFrame(({ dt }) => {
      const r = s.getBoundingClientRect();
      const vh = window.innerHeight;
      const len = Math.max(1, s.offsetHeight - vh);
      state.gap = { top: r.top + window.scrollY, len };
      const cover = r.top <= 1 && r.bottom >= vh - 1;
      if (cover !== on) {
        on = cover;
        state.cover = cover;
        document.body.classList.toggle('film-on', cover);
        if (!cover) state.hud = '';
      }
      const visible = r.top < vh && r.bottom > 0;
      const raw = clamp(-r.top / len, 0, 1);
      fs = freeze ?? fs + (raw - fs) * Math.min(1, 0.16 * dt);
      if (!visible || !W) return;

      const now = performance.now();
      const sdt = Math.min(0.05, (now - lastT) / 1000);
      lastT = now;
      const f = fs;
      x.setTransform(dpr, 0, 0, dpr, 0, 0);
      const out = film.draw(x, W, H, f, now / 1000, sdt, false, bones);

      /* captions: in after the cut, out before the next */
      const i = shotAt(f), u = localU(i, f);
      if (i !== lastShot) {
        lastShot = i;
        const sh = SHOTS[i];
        if (slug.current) slug.current.textContent = `${pad(i)} / 09 — ${sh.title}`;
        if (capT.current) capT.current.textContent = sh.cap;
        if (capK.current) capK.current.textContent = `shot ${pad(i)}`;
        if (live.current) live.current.textContent = sh.cap ? `Shot ${i + 1} of 9, ${sh.title}: ${sh.cap}` : `Shot ${i + 1} of 9, ${sh.title}`;
      }
      if (on) state.hud = `state: film — shot ${pad(i)} / 09`;
      st.dataset.tone = out.tone > 0.5 ? 'dark' : 'light';
      const ca = ss(0.06, 0.2, u) * (1 - ss(0.8, 0.94, u));
      if (cap.current) {
        cap.current.style.opacity = ca.toFixed(3);
        cap.current.style.transform = `translate3d(0,${((1 - ca) * 14).toFixed(1)}px,0)`;
      }
      if (slate.current) slate.current.style.opacity = (1 - ss(0.004, 0.022, f)).toFixed(3);
      const ta = i === 8 ? ss(0.55, 0.7, u) : 0;
      if (title.current) {
        title.current.style.opacity = ta.toFixed(3);
        title.current.style.transform = `translate3d(0,${((1 - ta) * 18).toFixed(1)}px,0)`;
      }
    });

    return () => {
      off(); ro.disconnect();
      state.gap = null; state.cover = false; state.hud = '';
      document.body.classList.remove('film-on');
    };
  }, []);

  const skip = () => {
    const s = sec.current;
    if (!s) return;
    scrollTo(s.getBoundingClientRect().top + window.scrollY + s.offsetHeight);
  };

  return (
    <section ref={sec} id="film" className="film" aria-label="Inheritance, a short film in nine shots">
      <div ref={stage} className="film-stage" data-tone="light">
        <canvas ref={cv} className="film-cv" aria-hidden />
        <div className="film-vig" aria-hidden />
        <div className="film-grain" aria-hidden />
        <div className="film-bar film-bar--top mono">
          <span className="film-name">inheritance</span>
          <span ref={slug} className="film-slug">01 / 09 — Dawn</span>
          <button type="button" className="film-skip" onClick={skip} data-cur>skip film ↓</button>
        </div>
        <div className="film-bar film-bar--bot" aria-hidden />
        <div ref={cap} className="film-cap" style={{ opacity: 0 }}>
          <span ref={capK} className="mono">shot 01</span>
          <p ref={capT}>{SHOTS[0].cap}</p>
        </div>
        <div ref={slate} className="film-slate" aria-hidden>
          <span className="mono">a short film in nine shots</span>
          <span className="mono">scroll to play ↓</span>
        </div>
        <div ref={title} className="film-title" style={{ opacity: 0 }}>
          <h2>Inheritance</h2>
          <span className="mono">what we build inherits what we are</span>
        </div>
        <span ref={live} className="sr-only" aria-live="polite" />
      </div>
    </section>
  );
}

/* reduced motion: the same art, standing still */
function Storyboard() {
  const wrap = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const film = createFilm();
    const render = () => {
      el.querySelectorAll<HTMLCanvasElement>('canvas[data-f]').forEach((c) => {
        const w = c.clientWidth, h = c.clientHeight;
        if (!w) return;
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
        const x = c.getContext('2d')!;
        x.setTransform(dpr, 0, 0, dpr, 0, 0);
        film.draw(x, w, h, Number(c.dataset.f), 0, 0, true);
      });
    };
    render();
    const ro = new ResizeObserver(render);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <section id="film" className="film-board gutter band" aria-label="Inheritance, a short film in nine shots, as stills">
      <div className="tag mb-6">inheritance — a film in nine shots</div>
      <div ref={wrap} className="film-board-grid">
        {SHOTS.map((s, i) => (
          <figure key={s.id}>
            <canvas data-f={F(i, s.key)} aria-hidden />
            <figcaption>
              <span className="mono">{pad(i)} — {s.title}</span>
              {s.cap || 'What we build inherits what we are.'}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
