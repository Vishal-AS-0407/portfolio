/* Scroll primitives for the case-study pages.
   Everything here writes to the DOM directly from the shared ticker — no React
   state per frame, so a page can run five scroll-driven effects at once. */
import { onFrame, clamp, lerp, deviceTier } from '@/lib/scroll';

export type Scene = {
  /** 0 before the element reaches the viewport, 1 once it has fully left the top */
  p: number;
  /** 0 outside, 1 when the element is centred */
  vis: number;
  top: number;
  h: number;
};

/** Subscribe to an element's own travel through the viewport. */
export function onScene(el: HTMLElement, fn: (s: Scene) => void, pad = 0) {
  return onFrame(() => {
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight;
    const span = r.height + vh - pad * 2;
    const p = clamp((vh - pad - r.top) / Math.max(1, span), 0, 1);
    const centre = r.top + r.height / 2;
    const vis = 1 - clamp(Math.abs(centre - vh / 2) / (vh * 0.85), 0, 1);
    fn({ p, vis, top: r.top, h: r.height });
  });
}

/** Parallax an element by `rate` of the distance it has travelled. */
export function parallax(el: HTMLElement, rate: number, extra = '') {
  return onScene(el, ({ p }) => {
    el.style.transform = `translate3d(0,${((p - 0.5) * rate * 100).toFixed(1)}px,0)${extra}`;
  });
}

const GLYPHS = '0123456789ABCDEF+/=';

/**
 * Ciphertext that resolves into the real value — used on the federated-learning
 * page, where every figure is meant to arrive encrypted.
 */
export function scramble(el: HTMLElement, text: string, opts: { hold?: number; speed?: number } = {}) {
  if (deviceTier() === 0) { el.textContent = text; return () => {}; }
  const { hold = 0, speed = 0.055 } = opts;
  const chars = [...text];
  let t = -hold;
  let done = false;
  const off = onFrame(({ dt }) => {
    if (done) return;
    t += speed * dt;
    if (t < 0) return;
    let out = '';
    let settled = 0;
    for (let i = 0; i < chars.length; i++) {
      const at = i / chars.length;
      if (t > at + 0.35) { out += chars[i]; settled++; }
      else if (t > at - 0.1) {
        out += chars[i] === ' ' ? ' ' : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      } else out += chars[i] === ' ' ? ' ' : GLYPHS[(Math.random() * GLYPHS.length) | 0];
    }
    el.textContent = out;
    if (settled === chars.length) { el.textContent = text; done = true; }
  });
  return off;
}

/** Count a numeric readout up to its final value once it is in view. */
export function counter(el: HTMLElement, text: string, dur = 1.6) {
  const m = text.match(/-?[\d.]+/);
  if (!m || deviceTier() === 0) { el.textContent = text; return () => {}; }
  const target = parseFloat(m[0]);
  const dec = (m[0].split('.')[1] || '').length;
  let v = 0, t = 0;
  const off = onFrame(({ dt }) => {
    t = Math.min(1, t + dt / (dur * 60));
    const e = 1 - Math.pow(1 - t, 3);
    v = lerp(0, target, e);
    el.textContent = text.replace(m[0], v.toFixed(dec));
    if (t >= 1) { el.textContent = text; off(); }
  });
  return off;
}

/** Fire once when the element first crosses into view. */
export function once(el: Element, fn: () => void, threshold = 0.25) {
  const io = new IntersectionObserver((es) => {
    es.forEach((e) => { if (e.isIntersecting) { fn(); io.disconnect(); } });
  }, { threshold });
  io.observe(el);
  return () => io.disconnect();
}

export { clamp, lerp };
