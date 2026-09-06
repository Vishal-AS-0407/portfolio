/* Page plumbing shared by every project route — and nothing else.
   Sets the document title, paints the browser chrome and the overscroll area to
   the page's own ground so no scroll rubber-band ever exposes the landing
   page's colour, and hands back a clean-up. No layout, no type, no motion. */
import { useEffect } from 'react';

export function usePageShell(opts: {
  title: string;
  bg: string;
  ink: string;
  /** used only for :focus-visible outlines inside the page */
  accent: string;
  /** body class that scopes the page's own stylesheet */
  scope: string;
}) {
  const { title, bg, ink, accent, scope } = opts;
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;

    const b = document.body;
    const h = document.documentElement;
    const prev = {
      bg: b.style.background,
      color: b.style.color,
      hbg: h.style.background,
    };
    b.style.background = bg;
    b.style.color = ink;
    h.style.background = bg;
    b.style.setProperty('--pj-accent', accent);
    b.classList.add(scope);

    const meta = document.querySelector('meta[name="theme-color"]');
    const prevTheme = meta?.getAttribute('content') ?? null;
    meta?.setAttribute('content', bg);

    window.scrollTo(0, 0);

    return () => {
      document.title = prevTitle;
      b.style.background = prev.bg;
      b.style.color = prev.color;
      h.style.background = prev.hbg;
      b.style.removeProperty('--pj-accent');
      b.classList.remove(scope);
      if (prevTheme !== null) meta?.setAttribute('content', prevTheme);
    };
  }, [title, bg, ink, accent, scope]);
}

/** One rAF loop per page. Returns an unsubscribe. */
export function raf(fn: (dt: number, t: number) => void): () => void {
  let id = 0;
  let last = performance.now();
  const loop = (t: number) => {
    id = requestAnimationFrame(loop);
    if (document.hidden) { last = t; return; }
    const dt = Math.min(3, (t - last) / 16.6667);
    last = t;
    fn(dt, t);
  };
  id = requestAnimationFrame(loop);
  return () => cancelAnimationFrame(id);
}

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** progress of an element through the viewport, 0 before → 1 after */
export const track = (r: DOMRect, pad = 0) =>
  clamp01((window.innerHeight - pad - r.top) / Math.max(1, r.height + window.innerHeight - pad * 2));
