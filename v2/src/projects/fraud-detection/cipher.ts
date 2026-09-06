/* ══════════════════════════════════════════════════════════════════════════
   fraud-detection — the decryption system.

   Every readable thing on this page starts as ciphertext. This module owns the
   alphabet, the deterministic filler used for sealed panels, and the `Vault`:
   a single registry that resolves and re-seals character cells on a fixed
   24 fps clock, driven from the page's one rAF loop.

   The layout contract — the reason this is a registry over DOM nodes and not a
   string in React state — is that a cell's WIDTH is owned by a hidden copy of
   its plaintext glyph. The animating glyph is absolutely positioned inside that
   cell and can never change the box. Nothing reflows while the page decrypts.
   ══════════════════════════════════════════════════════════════════════════ */
import { prefersReduced } from '@/projects/_shared/reduced';

/* punctuation first — a sealed block should read as noise, not as a password */
export const ALPHA =
  '#$%&*+/<>?@[]^{|}~' +
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const AN = ALPHA.length;

export const rc = (): string => ALPHA.charAt((Math.random() * AN) | 0);

/* a small LCG, so sealed filler is identical on every render and never churns */
export function seeded(seed: number): () => number {
  let s = (seed >>> 0) || 1;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export function cipherText(n: number, seed: number): string {
  const r = seeded(seed);
  let out = '';
  for (let i = 0; i < n; i++) out += ALPHA.charAt((r() * AN) | 0);
  return out;
}

/** ragged block filler for a panel that has not been opened yet */
export function cipherLines(count: number, width: number, seed: number): string[] {
  const r = seeded(seed);
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    const w = Math.max(6, Math.round(width * (0.48 + r() * 0.52)));
    let s = '';
    for (let j = 0; j < w; j++) s += ALPHA.charAt((r() * AN) | 0);
    out.push(s);
  }
  return out;
}

/** six characters wide, so a plaintext weight and a ciphertext block are the
    same size in a monospaced cell and the gate matrix never moves */
export function weights(seed: number, n: number): string[] {
  const r = seeded(seed);
  return Array.from({ length: n }, () => {
    const v = r() * 2 - 1;
    return (v < 0 ? '-' : '+') + Math.abs(v).toFixed(4).slice(1);
  });
}

/* read once: every Seal asks, and the answer cannot change mid-page without a
   remount anyway */
let _reduced: boolean | null = null;
export const reducedOnce = (): boolean =>
  _reduced === null ? (_reduced = prefersReduced()) : _reduced;

/* ── the clock ───────────────────────────────────────────────────────────── */
const FRAME = 1000 / 24; // the scramble runs at 24 fps, not at display rate
const FRAMES = 14; // frames a single character spends unresolved
const RESOLVE = FRAMES * FRAME; // 583 ms
const SEAL_MS = 180; // re-sealing is faster than opening, deliberately

export type Side = 'a' | 'b' | null;

export type Unit = {
  el: HTMLElement;
  g: HTMLElement[];
  ch: string[];
  side: Side;
  /** never opens: a statistic that genuinely never leaves its institution */
  perm: boolean;
  /** resolved by the entry decrypt sweep rather than by scroll */
  sweep: boolean;
  /** the title: the last thing on the first screen to resolve */
  last: boolean;
  reached: boolean;
  open: boolean;
  t0: number;
  wave: number;
  busy: boolean;
};

export class Vault {
  units: Unit[] = [];
  private lastTick = 0;
  private tick = 0;

  scan(root: HTMLElement): void {
    this.units = Array.from(root.querySelectorAll<HTMLElement>('.sd-seal')).map((el) => {
      const g = Array.from(el.querySelectorAll<HTMLElement>('.sd-c > b'));
      const n = Math.max(1, g.length);
      const half = el.closest<HTMLElement>('.sd-half');
      return {
        el,
        g,
        ch: g.map((b) => b.dataset.ch ?? ''),
        side: ((half?.dataset.side as Side) ?? null) as Side,
        perm: el.dataset.perm === '1',
        sweep: el.dataset.sweep === '1',
        last: el.dataset.last === '1',
        reached: false,
        open: false,
        t0: -1e9,
        /* a long line would take 18 ms × n to even start its last character, so
           the wave compresses once a string is long enough to notice */
        wave: Math.min(18, 760 / n),
        busy: false,
      };
    });
  }

  set(u: Unit, open: boolean, now: number): void {
    if (u.open === open || u.perm) return;
    u.open = open;
    u.t0 = now;
    u.busy = true;
    u.el.dataset.open = open ? '1' : '0';
  }

  /** every character to its final glyph, no animation. The reduced-motion and
      unmount path. */
  settle(): void {
    for (const u of this.units) {
      if (u.perm) continue;
      for (let i = 0; i < u.g.length; i++) {
        u.g[i].textContent = u.ch[i];
        u.g[i].dataset.p = '1';
      }
      u.open = true;
      u.busy = false;
      u.el.dataset.open = '1';
    }
  }

  /** call from the page's rAF; gates itself to 24 fps and returns whether it ran */
  frame(now: number): boolean {
    if (now - this.lastTick < FRAME) return false;
    this.lastTick = now;
    this.tick++;
    const shimmer = this.tick % 6 === 0;

    for (const u of this.units) {
      if (u.perm) {
        /* withheld figures are not static: one glyph turns over every 250 ms,
           so a sealed cell reads as live, not as a dead placeholder */
        if (shimmer && u.g.length) u.g[(Math.random() * u.g.length) | 0].textContent = rc();
        continue;
      }
      if (!u.busy) continue;
      const n = u.g.length;
      let done = true;

      if (u.open) {
        for (let i = 0; i < n; i++) {
          if (now >= u.t0 + i * u.wave + RESOLVE) {
            if (u.g[i].dataset.p !== '1') {
              u.g[i].textContent = u.ch[i];
              /* only a resolved character takes the ink of the text it sits in;
                 unresolved cipher stays the lighter noise colour */
              u.g[i].dataset.p = '1';
            }
          } else {
            done = false;
            u.g[i].textContent = rc();
          }
        }
      } else {
        const step = SEAL_MS / Math.max(1, n);
        for (let i = 0; i < n; i++) {
          if (now >= u.t0 + i * step) {
            u.g[i].textContent = rc();
            if (u.g[i].dataset.p) delete u.g[i].dataset.p;
          } else done = false;
        }
      }
      if (done) u.busy = false;
    }
    return true;
  }
}
