/* ══════════════════════════════════════════════════════════════════════════
   dravidian-sentiment — "Muzhakkam" (முழக்கம், "the roar")
   Concept: docs/design/dravidian-sentiment.md
   Blocklist: docs/design/00-do-not-reuse.md

   A Tamil political poster wall. Sheets are pasted over one another at
   rotations, torn along the top and bottom, halftoned, and printed in two spot
   inks that swap from sheet to sheet — the page never has one background. Tamil
   leads every headline; the English sits under it at a third of the size, so a
   reader of either language loses nothing.

   Nothing here glides. Sheets slam (140ms + a 90ms settle shake, fired from the
   page's single rAF loop as a Web Animation, never as an IntersectionObserver
   class toggle). Colour and type changes are `steps(1)` cuts. The shredder, the
   agentic rewrite, the overprint and the emoji swaps are scroll-scrubbed pure
   functions of progress, so all four run backwards when you scroll up.
   ══════════════════════════════════════════════════════════════════════════ */
import { useEffect, useRef, useState, type CSSProperties, type MouseEvent as ReactMouseEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BackLink from '@/projects/_shared/BackLink';
import { usePageShell, raf, clamp01 } from '@/projects/_shared/page';
import { prefersReduced, isCoarse } from '@/projects/_shared/reduced';
import { projects } from '@/data/content';
import { caseStudies } from '@/data/casestudies';
import { tornPolygon, scatter, denseRows, sparseRows } from './tears';
import Mechanism from '@/projects/_shared/Mechanism';
import { dravScene } from './mechanism';
import './wall.css';

const P = projects.find((x) => x.slug === 'dravidian-sentiment')!;
const CS = caseStudies['dravidian-sentiment'];

/* ── the seven, in both languages ───────────────────────────────────────── */
const SEVEN: { ta: string; en: string }[] = [
  { ta: 'உறுதிப்படுத்தப்பட்டது', en: 'substantiated' },
  { ta: 'நக்கல்', en: 'sarcastic' },
  { ta: 'கருத்து', en: 'opinionated' },
  { ta: 'நேர்மறை', en: 'positive' },
  { ta: 'எதிர்மறை', en: 'negative' },
  { ta: 'நடுநிலை', en: 'neutral' },
  { ta: 'எதுவுமில்லை', en: 'none of the above' },
];

/* ── #தமிழ்நாடுஅரசியல், as a subword tokenizer leaves it ─────────────────── */
const FRAGS: { t: string; h: boolean }[] = [
  { t: '#', h: false },
  { t: 'தமிழ்', h: false },
  { t: 'நாடு', h: true },
  { t: 'அர', h: true },
  { t: 'சியல்', h: true },
];
/* what comes back from the shredder, in the wrong order */
const WRONG = [FRAGS[4], FRAGS[1], FRAGS[3], FRAGS[2]];

const EMOJI: { g: string; ta: string; en: string }[] = [
  { g: '😡', ta: 'கோபம்', en: 'anger' },
  { g: '😂', ta: 'நகைப்பு', en: 'laughter' },
  { g: '🙏', ta: 'வேண்டுகோள்', en: 'plea' },
  { g: '🔥', ta: 'ஆவேசம்', en: 'fury' },
  { g: '💔', ta: 'ஏமாற்றம்', en: 'disappointment' },
  { g: '👏', ta: 'பாராட்டு', en: 'applause' },
  { g: '🤔', ta: 'ஐயம்', en: 'doubt' },
];

/* torn edges, seeded so the wall tears the same way on every reload */
const TEAR = {
  p1: tornPolygon(1201, { top: true, bottom: true, amp: 3.4 }),
  p2: tornPolygon(1202, { top: true, bottom: true, amp: 4.2 }),
  p3: tornPolygon(1203, { top: true, bottom: true, amp: 3.8 }),
  p4: tornPolygon(1204, { top: true, bottom: true, amp: 4.6 }),
  p5: tornPolygon(1205, { top: true, bottom: true, amp: 4.0 }),
  p6: tornPolygon(1206, { top: true, bottom: true, amp: 2.2 }),
  seven: tornPolygon(2101, { top: true, bottom: true, amp: 1.6 }),
  shred: tornPolygon(2102, { top: true, bottom: true, amp: 1.4 }),
  rw: tornPolygon(2103, { top: true, bottom: true, amp: 1.5 }),
  dx: tornPolygon(2104, { top: true, bottom: true, amp: 1.3 }),
  rank: tornPolygon(2105, { top: true, bottom: true, amp: 1.7 }),
  corr: tornPolygon(2106, { top: true, bottom: true, amp: 3.1 }),
  em: tornPolygon(2107, { top: true, bottom: true, amp: 1.5 }),
  strip: tornPolygon(2108, { top: true, bottom: true, amp: 5.5 }),
  colo: tornPolygon(2109, { top: true, amp: 2.4 }),
};

const SC_SHRED = scatter(FRAGS.length, 7717);
const SC_RW = scatter(WRONG.length, 4242);
const DENSE = denseRows(56);
const SPARSE = sparseRows(56);

/* the two leaderboard scores, drawn as bars against the winner's length */
const TOP = 0.3773;
const SECOND = 0.371;

/** sheet rotation, plus the flattened rotation a phone gets */
function sty(rot: number, extra?: Record<string, string>): CSSProperties {
  const m = Math.max(-1, Math.min(1, rot * 0.34));
  const o: Record<string, string> = {
    '--rot': `${rot}deg`,
    '--rotm': `${m.toFixed(2)}deg`,
    ...(extra ?? {}),
  };
  return o as unknown as CSSProperties;
}

/** display type with its 2px mis-registered duplicate in the opposing ink */
function Mis({ children, lang, className }: { children: string; lang?: string; className?: string }) {
  return (
    <span className={className ? `mz-mis ${className}` : 'mz-mis'}>
      <span className="mz-mis__g" aria-hidden="true">
        {children}
      </span>
      <span className="mz-mis__t" lang={lang}>
        {children}
      </span>
    </span>
  );
}

export default function Muzhakkam() {
  usePageShell({
    title: `${P.title} — Muzhakkam`,
    bg: '#120A08',
    ink: '#F4E7CE',
    accent: '#E9B23C',
    scope: 'pj-muzhakkam',
  });

  const [reduced] = useState(prefersReduced);
  const [coarse] = useState(isCoarse);
  /* the phone's shredder: a three-step tap-through instead of a scrub */
  const [step, setStep] = useState(0);

  const nav = useNavigate();
  const rootRef = useRef<HTMLDivElement>(null);
  const shakeRef = useRef<HTMLDivElement>(null);
  const bandRef = useRef<HTMLDivElement>(null);
  const trackRefs = useRef<(HTMLDivElement | null)[]>([]);
  const seqRef = useRef<HTMLSpanElement>(null);

  const shredRef = useRef<HTMLElement>(null);
  const shredFrag = useRef<(HTMLSpanElement | null)[]>([]);
  const rwRef = useRef<HTMLElement>(null);
  const rwFrag = useRef<(HTMLSpanElement | null)[]>([]);
  const rwWrong = useRef<HTMLDivElement>(null);
  const rwRight = useRef<HTMLDivElement>(null);
  const rwL1 = useRef<HTMLParagraphElement>(null);
  const dxRef = useRef<HTMLElement>(null);
  const dxDense = useRef<HTMLDivElement>(null);
  const dxSparse = useRef<HTMLDivElement>(null);
  const dxCap = useRef<HTMLDivElement>(null);
  const emRef = useRef<HTMLElement>(null);
  const emItem = useRef<(HTMLLIElement | null)[]>([]);

  const exitRef = useRef<null | (() => number)>(null);
  const leaving = useRef(false);
  /* The exit gesture runs for `wait` ms before the route actually changes. If
     the visitor hits browser Back inside that window the component unmounts and
     the timer would still fire, throwing them forward again to a page they had
     just left. Held here so the effect's clean-up can cancel it. */
  const exitTimer = useRef(0);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const SLAM = coarse ? 165 : 230;
    const timers: number[] = [];

    /* ── the slam ──────────────────────────────────────────────────────────
       140ms of travel on cubic-bezier(.2,.9,.1,1) past a 1.5% overshoot, then
       a 90ms three-frame shake cut with steps(1). Nothing else on this page
       is longer. `fill: none` so the element falls back to its CSS resting
       state and no transform is left behind on a sticky ancestor. */
    const slam = (el: HTMLElement) => {
      const d = Math.min(128, window.innerHeight * 0.055);
      el.style.opacity = '1';
      el.animate(
        [
          {
            offset: 0,
            opacity: 0,
            transform: `translate3d(0,${d.toFixed(0)}px,0) scale(1.045) rotate(1.3deg)`,
            easing: 'steps(1,end)',
          },
          {
            offset: 0.035,
            opacity: 1,
            transform: `translate3d(0,${(d * 0.93).toFixed(0)}px,0) scale(1.04) rotate(1.2deg)`,
            easing: 'cubic-bezier(.2,.9,.1,1)',
          },
          {
            offset: 0.61,
            opacity: 1,
            transform: `translate3d(0,${(-d * 0.032).toFixed(1)}px,0) scale(0.9955) rotate(-.24deg)`,
            easing: 'steps(1,end)',
          },
          { offset: 0.74, opacity: 1, transform: 'translate3d(-4px,2px,0) rotate(.6deg)', easing: 'steps(1,end)' },
          { offset: 0.87, opacity: 1, transform: 'translate3d(3px,-2px,0) rotate(-.6deg)', easing: 'steps(1,end)' },
          { offset: 1, opacity: 1, transform: 'none' },
        ],
        { duration: SLAM, fill: 'none' },
      );
    };

    /* every paste shakes the wall by 3px */
    const shakeWall = () => {
      const el = shakeRef.current;
      if (!el) return;
      el.animate(
        [
          { transform: 'translate3d(0,0,0)', easing: 'steps(1,end)' },
          { offset: 0.34, transform: 'translate3d(-3px,2px,0)', easing: 'steps(1,end)' },
          { offset: 0.67, transform: 'translate3d(3px,-1px,0)', easing: 'steps(1,end)' },
          { offset: 1, transform: 'none' },
        ],
        { duration: 90, fill: 'none' },
      );
    };

    const slamEls = Array.from(root.querySelectorAll<HTMLElement>('.mz-slam'));
    const pasteEls = Array.from(root.querySelectorAll<HTMLElement>('.mz-paste__p'));
    const hashEls = Array.from(root.querySelectorAll<HTMLElement>('.mz-shredzone .mz-frag__h'));

    /* ── the honest reduced-motion page ─────────────────────────────────────
       Not a `transition: none` patch: every scrubbed element is written to the
       state that carries the most information, and the loop is never started. */
    if (reduced) {
      root.classList.add('mz--still');
      for (const el of [...slamEls, ...pasteEls]) el.style.opacity = '1';
      for (const el of hashEls) el.style.opacity = '1';
      if (bandRef.current) {
        bandRef.current.style.opacity = '1';
        bandRef.current.dataset.rows = '1';
      }
      if (rwWrong.current) rwWrong.current.style.opacity = '1';
      if (rwRight.current) rwRight.current.style.opacity = '1';
      if (dxDense.current) dxDense.current.style.transform = 'translate3d(24%,0,0)';
      if (dxSparse.current) dxSparse.current.style.transform = 'translate3d(-24%,0,0)';
      if (dxCap.current) dxCap.current.style.opacity = '1';
      for (const el of emItem.current) if (el) el.dataset.on = '1';
      return () => {
        root.classList.remove('mz--still');
      };
    }

    /* ── entry: black wall, 180ms hold, then six sheets at 90ms intervals ── */
    pasteEls.forEach((el, i) => {
      timers.push(
        window.setTimeout(() => {
          slam(el);
          shakeWall();
        }, 180 + i * 90),
      );
    });

    /* ── the exit: every visible sheet leaves in its own direction ───────── */
    exitRef.current = () => {
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const vis = Array.from(root.querySelectorAll<HTMLElement>('.mz-exit')).filter((el) => {
        const r = el.getBoundingClientRect();
        return r.bottom > -24 && r.top < vh + 24;
      });
      vis.forEach((el, i) => {
        const dir = i % 2 ? 1 : -1;
        el.animate(
          [
            { transform: 'none' },
            {
              transform: `translate3d(${(dir * vw * 1.2).toFixed(0)}px,${((i % 3) - 1) * 40}px,0) rotate(${dir * 7}deg)`,
            },
          ],
          { duration: 260, delay: i * 40, easing: 'cubic-bezier(.2,.9,.1,1)', fill: 'forwards' },
        );
      });
      return 260 + Math.max(0, vis.length - 1) * 40 + 30;
    };

    /* ── one loop ──────────────────────────────────────────────────────────
       Reads layout, writes transform / opacity / clip-path. No React state. */
    const slams = slamEls.map((el) => ({ el, on: false }));
    const seqW = { v: 0 };
    const measure = () => {
      seqW.v = seqRef.current?.getBoundingClientRect().width ?? 0;
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (seqRef.current) ro.observe(seqRef.current);

    const MARQ_BASE = coarse ? 0.55 : 1.1; // px per 60fps frame
    const off = [0, 0, 0];
    let vel = 0;
    let dir = 1;
    let lastY = window.scrollY;

    let lastRows = '';
    let lastBand = '';
    let lastHash = '';
    let lastSwap: boolean | null = null;
    let lastEm = -1;
    let lastCap = '';

    const stop = raf((dt) => {
      const vh = window.innerHeight;
      const y = window.scrollY;
      const doc = Math.max(1, document.documentElement.scrollHeight - vh);
      const pp = clamp01(y / doc);

      /* ── the marquee, velocity-coupled ──────────────────────────────────
         The offset is integrated from dt, never derived from scrollY, so a
         stalled frame slows the band instead of teleporting it. Direction
         flips on a hysteresis band so noise around zero cannot make it stutter. */
      const dy = y - lastY;
      lastY = y;
      vel += (dy - vel) * 0.14;
      if (vel > 1.4) dir = 1;
      else if (vel < -1.4) dir = -1;
      const mult = Math.max(0.4, Math.min(4, 1 + Math.abs(vel) * 0.075));
      const w = seqW.v;
      if (w > 8) {
        for (let i = 0; i < 3; i++) {
          const t = trackRefs.current[i];
          if (!t) continue;
          off[i] += MARQ_BASE * mult * dt * dir * (i % 2 ? -1 : 1);
          const x = ((off[i] % w) + w) % w;
          t.style.transform = `translate3d(${(-x).toFixed(2)}px,0,0)`;
        }
      }

      const band = bandRef.current;
      if (band) {
        const vis = pp > 0.042 ? '1' : '0';
        if (vis !== lastBand) {
          lastBand = vis;
          band.style.opacity = vis;
        }
        const rows = pp < 0.16 ? '3' : '1';
        if (rows !== lastRows) {
          lastRows = rows;
          band.dataset.rows = rows;
        }
      }

      /* ── scroll-fired slams, released again above the fold ─────────────── */
      for (const s of slams) {
        const r = s.el.getBoundingClientRect();
        if (!s.on) {
          if (r.top < vh * 0.9 && r.bottom > vh * 0.04) {
            s.on = true;
            slam(s.el);
          }
        } else if (r.top > vh * 1.04) {
          s.on = false;
          s.el.style.opacity = '';
        }
      }

      /* ── the shredder (scrub, reversible) ──────────────────────────────── */
      const sh = shredRef.current;
      if (sh) {
        const r = sh.getBoundingClientRect();
        const p = clamp01(-r.top / Math.max(1, r.height - vh));
        const cut = clamp01((p - 0.15) / 0.2);
        const sc = clamp01((p - 0.42) / 0.5);
        const fall = sc * sc;
        for (let i = 0; i < shredFrag.current.length; i++) {
          const el = shredFrag.current[i];
          if (!el) continue;
          const v = SC_SHRED[i];
          const tx = (i - 2) * cut * 30 + v.tx * sc * v.rate;
          const ty = v.ty * fall * vh * v.rate;
          el.style.transform = `translate3d(${tx.toFixed(1)}px,${ty.toFixed(1)}px,0) rotate(${(v.rot * sc).toFixed(2)}deg)`;
        }
        const hv = cut > 0.5 ? '1' : '0';
        if (hv !== lastHash) {
          lastHash = hv;
          for (const el of hashEls) el.style.opacity = hv;
        }
      }

      /* ── the agentic rewrite (scrub, reversible) ───────────────────────── */
      const rw = rwRef.current;
      if (rw) {
        const r = rw.getBoundingClientRect();
        const p = clamp01(-r.top / Math.max(1, r.height - vh));
        const fly = clamp01(p / 0.3);
        const k = 1 - fly;
        for (let i = 0; i < rwFrag.current.length; i++) {
          const el = rwFrag.current[i];
          if (!el) continue;
          const v = SC_RW[i];
          const jit = Math.sin(p * 34 + i * 1.7) * 2.4 * k;
          el.style.transform = `translate3d(${(v.tx * k + jit).toFixed(1)}px,${(-v.ty * k * vh * 0.85).toFixed(1)}px,0) rotate(${(v.rot * k).toFixed(2)}deg)`;
        }
        const swapped = p >= 0.62;
        if (swapped !== lastSwap) {
          lastSwap = swapped;
          if (rwWrong.current) rwWrong.current.style.opacity = swapped ? '0' : '1';
          if (rwRight.current) rwRight.current.style.opacity = swapped ? '1' : '0';
        }
        /* 0.2 / 0.55 / 1.0 depth ratios */
        const base = (0.5 - p) * 150;
        if (rwL1.current) rwL1.current.style.transform = `translate3d(0,${(base * 0.2).toFixed(1)}px,0)`;
        if (rwWrong.current) rwWrong.current.style.transform = `translate3d(0,${(base * 0.55).toFixed(1)}px,0)`;
        if (rwRight.current) rwRight.current.style.transform = `translate3d(0,${base.toFixed(1)}px,0)`;
      }

      /* ── dense × sparse, overprinted ───────────────────────────────────── */
      const dx = dxRef.current;
      if (dx) {
        const r = dx.getBoundingClientRect();
        const p = clamp01(-r.top / Math.max(1, r.height - vh));
        const e = clamp01((p - 0.1) / 0.55);
        if (dxDense.current) dxDense.current.style.transform = `translate3d(${(e * 24).toFixed(2)}%,0,0)`;
        if (dxSparse.current) dxSparse.current.style.transform = `translate3d(${(-e * 24).toFixed(2)}%,0,0)`;
        const cv = e > 0.94 ? '1' : '0';
        if (cv !== lastCap) {
          lastCap = cv;
          if (dxCap.current) dxCap.current.style.opacity = cv;
        }
      }

      /* ── emoji, one hard cut each ──────────────────────────────────────── */
      const em = emRef.current;
      if (em) {
        const r = em.getBoundingClientRect();
        const p = clamp01(-r.top / Math.max(1, r.height - vh));
        const idx = Math.round(clamp01((p - 0.12) / 0.7) * EMOJI.length);
        if (idx !== lastEm) {
          lastEm = idx;
          for (let i = 0; i < emItem.current.length; i++) {
            const el = emItem.current[i];
            if (el) el.dataset.on = i < idx ? '1' : '0';
          }
        }
      }
    });

    return () => {
      stop();
      ro.disconnect();
      for (const t of timers) window.clearTimeout(t);
      if (exitTimer.current) window.clearTimeout(exitTimer.current);
      exitRef.current = null;
    };
  }, [reduced, coarse]);

  /* Internal links leave through the wall, not through a route wipe. */
  const onCapture = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = (e.target as HTMLElement | null)?.closest?.('a');
    if (!a) return;
    const href = a.getAttribute('href') ?? '';
    if (!href.startsWith('/') || a.getAttribute('target')) return;
    const go = exitRef.current;
    if (reduced || !go || leaving.current) return;
    e.preventDefault();
    leaving.current = true;
    const wait = go();
    exitTimer.current = window.setTimeout(() => nav(href), wait);
  };

  const marquee = (
    <>
      {SEVEN.map((s) => (
        <span key={s.en} className="mz-band__unit">
          <span lang="ta">{s.ta}</span>
          <i>{s.en}</i>
          <em aria-hidden="true">✦</em>
        </span>
      ))}
    </>
  );

  /* the shredder body — a scrub on a mouse, a three-step tap-through on glass */
  const shredBody = (
    <div className="mz-sheet__in mz-shredzone">
      <p className="mz-label">tokenisation</p>
      <h2 className="mz-h2">
        <Mis lang="ta">சொல் துண்டாகிறது</Mis>
        <span className="mz-h2__en">The tokenizer shreds the word</span>
      </h2>
      <div className={coarse ? 'mz-frags mz-frags--tap' : 'mz-frags'} data-step={step} aria-hidden="true">
        {FRAGS.map((f, i) => (
          <span
            key={i}
            className="mz-frag"
            style={sty(0, {
              '--tx': `${SC_SHRED[i].tx.toFixed(0)}px`,
              '--ty': `${(SC_SHRED[i].ty * 34).toFixed(0)}px`,
              '--fr': `${SC_SHRED[i].rot.toFixed(1)}deg`,
              '--gp': `${(i - 2) * 26}px`,
            })}
            ref={(el) => {
              shredFrag.current[i] = el;
            }}
          >
            {f.h && <i className="mz-frag__h">##</i>}
            <b lang="ta">{f.t}</b>
          </span>
        ))}
      </div>
      {coarse && (
        <div className="mz-steps" role="group" aria-label="Step through the subword split">
          {[
            { ta: 'முழு', en: 'whole' },
            { ta: 'துண்டு', en: 'cut' },
            { ta: 'சிதறல்', en: 'scattered' },
          ].map((s, i) => (
            <button key={s.en} type="button" aria-pressed={step === i} onClick={() => setStep(i)}>
              <span className="mz-steps__n">{i + 1}</span>
              <span lang="ta">{s.ta}</span>
              <i>{s.en}</i>
            </button>
          ))}
        </div>
      )}
      <p className="mz-p">
        <span lang="ta">#தமிழ்நாடுஅரசியல்</span> — one compound hashtag — reaches a multilingual encoder as
        five pieces: <span lang="ta">#</span>, <span lang="ta">தமிழ்</span>, <span lang="ta">##நாடு</span>,{' '}
        <span lang="ta">##அர</span>, <span lang="ta">##சியல்</span>. The last two are not words in any
        language. Hashtags carry a large share of the political signal, and this is what is left of them.
      </p>
      <p className="mz-p">{CS.pipeline[0].body}</p>
      <p className="mz-note">
        <b>What fought back</b>
        {CS.challenges![0]}
      </p>
    </div>
  );

  return (
    <div className={reduced ? 'mz' : 'mz mz--armed'} ref={rootRef} onClickCapture={onCapture}>
      <BackLink label="the index" />

      <p className="mz-margin mz-margin--l mz-exit" aria-hidden="true">
        DRAVIDIANLANGTECH · NAACL 2025 · TEAM SYNAPSE
      </p>
      <p className="mz-margin mz-margin--r mz-exit" aria-hidden="true">
        RANK 1 / 25 · MACRO-F1 0.3773 · 139 REGISTRANTS
      </p>

      {/* ── the marquee band, crossing the wall at 62vh ───────────────────── */}
      <div className="mz-band mz-exit" ref={bandRef} data-rows="3" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <div className="mz-band__row" key={i}>
            <div
              className="mz-band__track"
              ref={(el) => {
                trackRefs.current[i] = el;
              }}
            >
              <span className="mz-band__seq" ref={i === 0 ? seqRef : undefined}>
                {marquee}
              </span>
              <span className="mz-band__seq">{marquee}</span>
              <span className="mz-band__seq">{marquee}</span>
            </div>
          </div>
        ))}
      </div>

      <main className="mz-wall">
        {/* ── 1. the paste-up ─────────────────────────────────────────────── */}
        <section className="mz-paste mz-exit" aria-labelledby="mz-title">
          <div className="mz-shake" ref={shakeRef}>
            <article className="mz-poster mz-s--vb mz-paste__p mz-pp1" style={sty(-4.4)} aria-hidden="true">
              <span className="mz-poster__stock" style={{ clipPath: TEAR.p1 }} />
              <span className="mz-poster__in mz-poster__word" lang="ta">
                உணர்வு
              </span>
              <span className="mz-poster__in mz-poster__sub">sentiment</span>
            </article>

            <article className="mz-poster mz-s--bg mz-paste__p mz-pp2" style={sty(3.1)} aria-hidden="true">
              <span className="mz-poster__stock" style={{ clipPath: TEAR.p2 }} />
              <span className="mz-poster__in mz-poster__num">0.3773</span>
              <span className="mz-poster__in mz-poster__sub">macro-F1</span>
            </article>

            <article className="mz-poster mz-s--gm mz-paste__p mz-pp3" style={sty(-2.2)} aria-hidden="true">
              <span className="mz-poster__stock" style={{ clipPath: TEAR.p3 }} />
              <span className="mz-poster__in mz-poster__word" lang="ta">
                நக்கல்
              </span>
              <span className="mz-poster__in mz-poster__sub">sarcastic</span>
            </article>

            <article className="mz-poster mz-s--bv mz-paste__p mz-pp4" style={sty(2.4)} aria-hidden="true">
              <span className="mz-poster__stock" style={{ clipPath: TEAR.p4 }} />
              <span className="mz-poster__in mz-poster__frag">
                <i>##</i>
                <b lang="ta">சியல்</b>
              </span>
            </article>

            <article className="mz-poster mz-s--bg mz-paste__p mz-pp5" style={sty(-3.6)} aria-hidden="true">
              <span className="mz-poster__stock" style={{ clipPath: TEAR.p5 }} />
              <span className="mz-poster__in mz-poster__num">139</span>
              <span className="mz-poster__in mz-poster__sub">registrants</span>
            </article>

            <article className="mz-poster mz-s--vb mz-paste__p mz-pp6" style={sty(-1.4)}>
              <span className="mz-poster__stock" style={{ clipPath: TEAR.p6 }} aria-hidden="true" />
              <div className="mz-poster__in mz-title">
                <p className="mz-label">pasted up on a wall in Chennai, and scored in Albuquerque</p>
                <h1 className="mz-h1" id="mz-title">
                  <Mis lang="ta" className="mz-h1__ta">
                    தமிழ் அரசியல் உணர்வு பகுப்பாய்வு
                  </Mis>
                  <span className="mz-h1__en">Tamil political sentiment analysis</span>
                </h1>
                <p className="mz-h1__meta">
                  {P.tagline} · team Synapse · seven classes, one leaderboard
                </p>
              </div>
            </article>
          </div>
        </section>

        {/* ── 2. the seven ────────────────────────────────────────────────── */}
        <section className="mz-sheet mz-s--gm mz-slam mz-exit" style={sty(-2.4)} aria-labelledby="mz-seven-h">
          <span className="mz-sheet__stock" style={{ clipPath: TEAR.seven }} aria-hidden="true" />
          <div className="mz-sheet__in">
            <p className="mz-label">the label set</p>
            <h2 className="mz-h2" id="mz-seven-h">
              <Mis lang="ta">ஏழு வகைகள்</Mis>
              <span className="mz-h2__en">Seven categories, and they overlap</span>
            </h2>
            <ol className="mz-seven">
              {SEVEN.map((s, i) => (
                <li key={s.en}>
                  <span className="mz-seven__n">{String(i + 1).padStart(2, '0')}</span>
                  <span className="mz-seven__ta" lang="ta">
                    {s.ta}
                  </span>
                  <span className="mz-seven__en">{s.en}</span>
                </li>
              ))}
            </ol>
            <p className="mz-p">{CS.problem}</p>
          </div>
        </section>

        {/* ── 3. the shredder ─────────────────────────────────────────────── */}
        {coarse ? (
          <section className="mz-sheet mz-s--vb mz-slam mz-exit" style={sty(-1.6)}>
            <span className="mz-sheet__stock" style={{ clipPath: TEAR.shred }} aria-hidden="true" />
            {shredBody}
          </section>
        ) : (
          <section className="mz-scrub mz-s--vb mz-exit" ref={shredRef} style={sty(-1.6)}>
            <div className="mz-scrub__stick mz-slam">
              <span className="mz-sheet__stock" style={{ clipPath: TEAR.shred }} aria-hidden="true" />
              {shredBody}
            </div>
          </section>
        )}

        {/* ── 4. the agentic rewrite ──────────────────────────────────────── */}
        <section className="mz-scrub mz-scrub--tall mz-s--bg mz-exit" ref={rwRef} style={sty(1.4)}>
          <div className="mz-scrub__stick mz-slam">
            <span className="mz-sheet__stock" style={{ clipPath: TEAR.rw }} aria-hidden="true" />
            <div className="mz-sheet__in">
              <p className="mz-label" ref={rwL1}>
                agentic preprocessing · agent.py · LLaMA 3.1
              </p>
              <h2 className="mz-h2">
                <Mis lang="ta">மீண்டும் எழுதுதல்</Mis>
                <span className="mz-h2__en">The agent puts the hashtag back together</span>
              </h2>

              <div className="mz-rw__stage">
                <div className="mz-rw__wrong" ref={rwWrong} aria-hidden="true">
                  {WRONG.map((f, i) => (
                    <span
                      key={i}
                      className="mz-frag"
                      ref={(el) => {
                        rwFrag.current[i] = el;
                      }}
                    >
                      {f.h && <i className="mz-frag__h">##</i>}
                      <b lang="ta">{f.t}</b>
                    </span>
                  ))}
                </div>
                <div className="mz-rw__right" ref={rwRight}>
                  <span className="mz-rw__out" lang="ta">
                    தமிழ்நாட்டு அரசியல் குறித்த கருத்து
                  </span>
                  <span className="mz-rw__gloss">an opinion about Tamil Nadu politics</span>
                </div>
              </div>

              <p className="mz-p">{CS.pipeline[1].body}</p>
              <p className="mz-note">
                <b>What fought back</b>
                {CS.challenges![1]}
              </p>
            </div>
          </div>
        </section>

        {/* ── 5. dense × sparse ───────────────────────────────────────────── */}
        <section className="mz-scrub mz-s--vb mz-exit" ref={dxRef} style={sty(1.9)}>
          <div className="mz-scrub__stick mz-slam">
            <span className="mz-sheet__stock" style={{ clipPath: TEAR.dx }} aria-hidden="true" />
            <div className="mz-sheet__in">
              <p className="mz-label">feature fusion · concatenation, drawn as ink</p>
              <h2 className="mz-h2">
                <Mis lang="ta">அடர்த்தியும் அரிதும்</Mis>
                <span className="mz-h2__en">Dense and sparse, overprinted</span>
              </h2>

              <div className="mz-dx" aria-hidden="true">
                <div className="mz-dx__band mz-dx__dense" ref={dxDense}>
                  {DENSE.map((v, i) => (
                    <i key={i} style={{ opacity: v }} />
                  ))}
                  <span className="mz-dx__tag">IndicBERTv2</span>
                </div>
                <div className="mz-dx__band mz-dx__sparse" ref={dxSparse}>
                  {SPARSE.map((v, i) => (
                    <i key={i} style={{ opacity: v ? 1 : 0 }} />
                  ))}
                  <span className="mz-dx__tag">TF-IDF → PCA</span>
                </div>
                <div className="mz-dx__cap" ref={dxCap}>
                  <span lang="ta">இணைப்பு</span>
                  <i>concatenated</i>
                </div>
              </div>

              <p className="mz-p">{CS.approach}</p>
              <p className="mz-note">
                <b>What fought back</b>
                {CS.challenges![2]}
              </p>
            </div>
          </div>
        </section>

        {/* ── 6 + 7. 1 / 25, and the correction pasted over it ─────────────── */}
        <section className="mz-sheet mz-rank mz-s--bg mz-slam mz-exit" style={sty(-2.8)} aria-labelledby="mz-rank-h">
          <span className="mz-sheet__stock" style={{ clipPath: TEAR.rank }} aria-hidden="true" />
          <div className="mz-sheet__in">
            <p className="mz-label">the official leaderboard</p>
            <h2 className="mz-h2" id="mz-rank-h">
              <Mis lang="ta">இருபத்தைந்தில் ஒன்று</Mis>
              <span className="mz-h2__en">First of twenty-five submitting teams</span>
            </h2>

            <p className="mz-rank__fig" aria-hidden="true">
              <span className="mz-rank__ghost">1</span>
              <span className="mz-rank__one">1</span>
              <span className="mz-rank__of">/25</span>
            </p>

            <div className="mz-bars">
              <div className="mz-bars__row mz-bars__row--win">
                <span className="mz-bars__who">Synapse</span>
                <span className="mz-bars__track" aria-hidden="true">
                  <span className="mz-bars__bar" style={{ width: '100%' }} />
                </span>
                <span className="mz-bars__v">{TOP.toFixed(4)}</span>
              </div>
              <div className="mz-bars__row">
                <span className="mz-bars__who">KCRL</span>
                <span className="mz-bars__track" aria-hidden="true">
                  <span className="mz-bars__bar" style={{ width: `${((SECOND / TOP) * 100).toFixed(2)}%` }} />
                </span>
                <span className="mz-bars__v">{SECOND.toFixed(4)}</span>
              </div>
              <p className="mz-bars__cap">
                The margin is {(TOP - SECOND).toFixed(4)} macro-F1. Drawn to scale, the two bars are very
                nearly the same length.
              </p>
            </div>

            <ul className="mz-facts">
              {CS.results.slice(2).map((m) => (
                <li key={m.k}>
                  <b>{m.v}</b>
                  <span>
                    {m.k}
                    {m.note ? ` — ${m.note}` : ''}
                  </span>
                </li>
              ))}
            </ul>

            <p className="mz-note">
              <b>What fought back</b>
              {CS.challenges![3]}
            </p>
          </div>

          {/* the honest note, pasted over the 1 at −3.2° */}
          <aside className="mz-corr mz-slam" style={sty(-3.2)} aria-labelledby="mz-corr-h">
            <span className="mz-corr__stock" style={{ clipPath: TEAR.corr }} aria-hidden="true" />
            <span className="mz-tape mz-tape--a" aria-hidden="true" />
            <span className="mz-tape mz-tape--b" aria-hidden="true" />
            <div className="mz-corr__in">
              <p className="mz-label mz-label--corr" id="mz-corr-h">
                a correction, pasted over
              </p>
              <p className="mz-corr__lead">
                0.3773 is a low absolute number, and that is a property of the task.
              </p>
              <p className="mz-p mz-p--corr">{CS.honest}</p>
            </div>
          </aside>
        </section>

        {/* ── 8. emoji speak too ──────────────────────────────────────────── */}
        <section className="mz-scrub mz-s--gm mz-exit" ref={emRef} style={sty(2.2)} aria-labelledby="mz-em-h">
          <div className="mz-scrub__stick mz-slam">
            <span className="mz-sheet__stock" style={{ clipPath: TEAR.em }} aria-hidden="true" />
            <div className="mz-sheet__in">
              <p className="mz-label">normalisation · emoji-to-text</p>
              <h2 className="mz-h2" id="mz-em-h">
                <Mis lang="ta">எமோஜியும் பேசுகிறது</Mis>
                <span className="mz-h2__en">Emoji speak too</span>
              </h2>
              <ul className="mz-em">
                {EMOJI.map((e, i) => (
                  <li
                    key={e.en}
                    className="mz-em__i"
                    data-on="0"
                    ref={(el) => {
                      emItem.current[i] = el;
                    }}
                  >
                    <span className="mz-em__g" aria-hidden="true">
                      {e.g}
                    </span>
                    <span className="mz-em__w">
                      <b lang="ta">{e.ta}</b>
                      <i>{e.en}</i>
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mz-p">
                Emoji are converted to words before the tokenizer sees them, so their sentiment enters the
                token stream instead of being stripped out with the punctuation. Stopword removal follows.
              </p>
            </div>
          </div>
        </section>

        {/* ── the machine behind the wall, in 3D — then yours ─────────────── */}
        <Mechanism
          prefix="mz"
          id="mz-mech"
          eyebrow="இயந்திரம் · the machine behind the wall"
          title="How a roar gets sorted"
          beats={[
            { tag: '01 · the comment', h: 'One hashtag, all the politics', body: 'Hashtags carry a large share of the political signal on Tamil X — and they arrive as one unsegmented compound.' },
            { tag: '02 · the tokenizer', h: 'Shredded into ## pieces', body: 'A multilingual subword tokenizer cuts the compound into fragments that no longer mean what the tag meant.' },
            { tag: '03 · agent.py', h: 'LLaMA 3.1 puts it back', body: CS.pipeline[1].body },
            { tag: '04 · two channels', h: 'Dense and sparse', body: 'IndicBERTv2-MLM-Back-TLM gives the contextual meaning (round dots); TF-IDF reduced by PCA keeps rare political vocabulary (square type). Neither is chosen over the other.' },
            { tag: '05 · seven', h: 'Fused, then sorted', body: `${CS.pipeline[4].body} Rank 1 of 25 on the official leaderboard, macro-F1 0.3773 against 0.3710 for second place.` },
          ]}
          free={{ tag: 'உங்கள் முறை · your turn', h: 'Pull the channels apart', body: 'Switch between the dense channel, the sparse channel and the fusion to see why concatenating them separates the seven better. Hover a cluster to read its class.', hint: 'drag to turn · hover a cluster' }}
          controls={[{ kind: 'choice', key: 'mode', label: 'Channel', initial: 'fused', options: [{ v: 'dense', label: 'dense only' }, { v: 'sparse', label: 'sparse only' }, { v: 'fused', label: 'fused' }] }]}
          note="Illustrative geometry: the clusters show the idea of the fusion, not the model's actual embedding space. 0.3773 is low in absolute terms — seven overlapping classes are hard even for annotators; the result is the rank and the margin."
          build={dravScene}
        />

        {/* ── printed marginalia ──────────────────────────────────────────── */}
        <section className="mz-strip mz-s--bv mz-slam mz-exit" style={sty(1.1)} aria-labelledby="mz-marg-h">
          <span className="mz-sheet__stock" style={{ clipPath: TEAR.strip }} aria-hidden="true" />
          <div className="mz-sheet__in mz-marg">
            <h2 className="mz-marg__h" id="mz-marg-h">
              Printed from
            </h2>
            <div className="mz-marg__col">
              <h3>Set in</h3>
              <p>{CS.stack.join(' · ')}</p>
            </div>
            <div className="mz-marg__col">
              <h3>Copy</h3>
              <p>{CS.dataset}</p>
            </div>
            <div className="mz-marg__col">
              <h3>Fusion head</h3>
              <p>{CS.pipeline[4].body}</p>
            </div>
          </div>
        </section>

        {/* ── 9. the blank sheet ──────────────────────────────────────────── */}
        <section className="mz-sheet mz-colo mz-s--vb mz-slam mz-exit" style={sty(-0.8)} aria-labelledby="mz-colo-h">
          <span className="mz-sheet__stock" style={{ clipPath: TEAR.colo }} aria-hidden="true" />
          <div className="mz-sheet__in">
            <h2 className="mz-h2" id="mz-colo-h">
              <Mis lang="ta">சுவர் மூடப்பட்டது</Mis>
              <span className="mz-h2__en">The wall is covered</span>
            </h2>
            <p className="mz-p">
              A clean sheet goes over everything and the shouting stops. What is underneath is a seven-way
              classifier for Tamil political comments that fused a dense encoder with a sparse lexical
              channel, and asked an agent to repair the hashtags first.
            </p>
            <div className="mz-links">
              <a href={CS.repo} target="_blank" rel="noopener noreferrer">
                Source on GitHub
              </a>
              <a href={CS.paper!} target="_blank" rel="noopener noreferrer">
                Read the paper — ACL Anthology
              </a>
            </div>
            <div className="mz-else">
              <Link to="/work/eeg-emotion">Next sheet on the wall: EEG, and a machine that prints →</Link>
              <Link to="/">Back to the index →</Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
