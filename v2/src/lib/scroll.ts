/* The scroll spine: Lenis drives gsap.ticker drives ScrollTrigger.
   One rAF loop for the whole site — no competing tickers, no ScrollSmoother
   (it fights Lenis). Everything scroll-driven subscribes here. */
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const prefersReduced = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const deviceTier = (): 0 | 1 | 2 => {
  if (prefersReduced()) return 0;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  return coarse || window.innerWidth < 760 ? 1 : 2;
};

type Frame = { p: number; vel: number; dt: number };
const subs = new Set<(f: Frame) => void>();
export const onFrame = (fn: (f: Frame) => void): (() => void) => {
  subs.add(fn);
  return () => { subs.delete(fn); };
};

export const state = {
  p: 0,
  vel: 0,
  lenis: null as Lenis | null,
  /** when set, the HUD shows this instead of its own state line */
  hud: '' as string,
};

let started = false;
export function initScroll() {
  if (started) return () => {};
  started = true;

  const reduced = prefersReduced();
  const lenis = reduced
    ? null
    : new Lenis({
        duration: 1.15,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        touchMultiplier: 1.6,
      });
  state.lenis = lenis;

  if (lenis) {
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  let last = performance.now();
  let smoothed = 0;
  const tick = () => {
    /* nothing here is worth a frame while the tab is in the background —
       the particle field, every signature canvas and the HUD all hang off this */
    if (document.hidden) { last = performance.now(); return; }
    const now = performance.now();
    const dt = Math.min(2.5, (now - last) / 16.667);
    last = now;
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const raw = (lenis ? lenis.scroll : window.scrollY) / max;
    const p = Math.min(1, Math.max(0, raw));
    const vel = lenis ? (lenis as unknown as { velocity: number }).velocity ?? 0 : 0;
    smoothed += (p - smoothed) * Math.min(1, 0.22 * dt);
    state.p = smoothed;
    state.vel = vel;
    const f: Frame = { p: smoothed, vel, dt };
    subs.forEach((s) => s(f));
  };
  gsap.ticker.add(tick);

  const onResize = () => ScrollTrigger.refresh();
  window.addEventListener('resize', onResize);

  return () => {
    gsap.ticker.remove(tick);
    window.removeEventListener('resize', onResize);
    lenis?.destroy();
    started = false;
  };
}

export const scrollTo = (target: string | number) => {
  if (state.lenis) state.lenis.scrollTo(target, { duration: 1.4 });
  else if (typeof target === 'string') document.querySelector(target)?.scrollIntoView();
  else window.scrollTo(0, target);
};

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
export const ss = (e0: number, e1: number, x: number) => {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
};
