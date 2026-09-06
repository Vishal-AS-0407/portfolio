/* ══════════════════════════════════════════════════════════════════════════
   fraud-detection — "Sealed"              concept: docs/design/fraud-detection.md

   A sealed document on a cipher desk. Two banks need one model and may not show
   each other a single row, so the page withholds: nothing is legible until it
   has been unsealed, the two institutions occupy two halves that never open at
   once, and the one figure printed in plain text from the first frame is the
   number of raw records shared.

   Everything here is a flat fill with a hard edge. No gradient, no curve, no
   scale, no blur, no fade. Things open by clip-path along a straight line and
   stop dead. The page owns one rAF loop and no per-frame React state.
   ══════════════════════════════════════════════════════════════════════════ */
import { useEffect, useRef, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import BackLink from '@/projects/_shared/BackLink';
import { usePageShell, raf, clamp01, lerp } from '@/projects/_shared/page';
import { isCoarse } from '@/projects/_shared/reduced';
import { projects } from '@/data/content';
import { caseStudies } from '@/data/casestudies';
import Seal from './Seal';
import { Vault, reducedOnce, cipherLines, cipherText, weights, type Side } from './cipher';
import './sealed.css';

const P = projects.find((x) => x.slug === 'fraud-detection')!;
const CS = caseStudies['fraud-detection'];

/* the real schema, from the case study's preprocessing stage */
const NUMERIC = [
  'step',
  'amount',
  'oldbalanceOrg',
  'newbalanceOrig',
  'oldbalanceDest',
  'newbalanceDest',
];

const MANIFEST: [string, string][] = [
  ['01', 'the constraint'],
  ['02', 'what each side holds'],
  ['03', 'imbalance, locally'],
  ['04', 'the local models'],
  ['05', 'the gate — ckks aggregation'],
  ['06', 'the vote'],
  ['07', 'three milliseconds'],
  ['08', 'masking, live'],
  ['09', 'the note'],
];

/* the gate matrix. Illustrative values — the trained weights are not published,
   and the page says so on the black. */
const GC = 6;
const GR = 6;
const WA = weights(0x51e4, GC * GR);
const WB = weights(0x9a37, GC * GR);
const COMBINED = weights(0x2f11, 8);

const ACCOUNT = '41562280094417';

/* stagger a panel's opening without a JS timeline */
const d = (n: number) => ({ '--sd-d': `${n * 60}ms` }) as CSSProperties;

/* ── small building blocks ───────────────────────────────────────────────── */

/** A block of prose that is a wall of ciphertext until its seal is broken. The
    plaintext defines the box, so the filler can never change the page's height. */
function Panel({
  seed,
  lines,
  width = 44,
  stagger = 0,
  className = '',
  children,
}: {
  seed: number;
  lines: number;
  width?: number;
  stagger?: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`sd-panel ${className}`.trim()} data-reveal="1" data-open="0" style={d(stagger)}>
      <div className="sd-panel__fill" aria-hidden="true">
        {cipherLines(lines, width, seed).map((l, i) => (
          <i key={i}>{l}</i>
        ))}
      </div>
      <div className="sd-panel__body">{children}</div>
    </div>
  );
}

/** A half of the institution split. Attention lives here: the half you are not
    reading re-seals itself. */
function Half({
  side,
  label,
  children,
}: {
  side: Exclude<Side, null>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="sd-half"
      data-side={side}
      data-attn={side === 'a' ? '1' : '0'}
      role="group"
      aria-label={label}
      tabIndex={0}
    >
      {children}
    </div>
  );
}

/** A figure that never leaves its institution. It has no plaintext state and
    never resolves — the shimmer is the point. */
function Withheld({ n, seed }: { n: number; seed: number }) {
  return <Seal className="sd-wh" perm text={cipherText(n, seed)} />;
}

/* ── the page ────────────────────────────────────────────────────────────── */

export default function Sealed() {
  usePageShell({
    title: `${P.title} — Sealed`,
    bg: '#E8EAED',
    ink: '#0B0D10',
    accent: '#0075C4',
    scope: 'pj-sealed',
  });

  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduced = reducedOnce();
    const coarse = isCoarse();

    const qa = (s: string) => Array.from(root.querySelectorAll<HTMLElement>(s));
    const q1 = (s: string) => root.querySelector<HTMLElement>(s);

    const vault = new Vault();
    vault.scan(root);

    const halves = qa('.sd-half');
    let divs = qa('.sd-div');
    let reveals = qa('[data-reveal]');
    const sweepEl = q1('.sd-sweep');

    /* the gate */
    const band = q1('.sd-gate__band');
    const gate = q1('.sd-gate');
    const gridA = q1('.sd-gm--a');
    const gridB = q1('.sd-gm--b');
    const gout = q1('.sd-gate__out');
    const cellsA = gridA ? Array.from(gridA.querySelectorAll<HTMLElement>('.sd-gc')) : [];
    const cellsB = gridB ? Array.from(gridB.querySelectorAll<HTMLElement>('.sd-gc')) : [];
    const encA = new Uint8Array(cellsA.length);
    const encB = new Uint8Array(cellsB.length);
    const cipherA = cellsA.map((_, i) => cipherText(6, 0x1000 + i * 7));
    const cipherB = cellsB.map((_, i) => cipherText(6, 0x8000 + i * 7));

    /* local imbalance */
    const smotes = qa('.sd-smote').map((el) => ({
      el,
      fill: el.querySelector<HTMLElement>('.sd-bar__f'),
      rows: Array.from(el.querySelectorAll<HTMLElement>('.sd-synth i')),
      k: -1,
    }));

    /* the vote */
    const counters = qa('.sd-ctr').map((el) => ({
      mark: el.querySelector<HTMLElement>('.sd-ctr__mark'),
      val: el.querySelector<HTMLElement>('.sd-ctr__v'),
      n: -1,
    }));
    const voteRow = q1('.sd-vote');
    const verdict = q1('.sd-verdict');

    /* three milliseconds */
    const msSec = q1('.sd-ms');
    const msBar = q1('.sd-ms__f');
    const msVal = q1('.sd-ms__v');

    /* masking */
    const mask = q1('.sd-mask');
    const maskRow = q1('.sd-mask__row');
    const maskCells = qa('.sd-mask__c');
    const maskOut = q1('.sd-mask__out');
    const maskState = new Uint8Array(maskCells.length);

    /* ── attention: only one institution is readable at a time ───────────── */
    let attn: 'a' | 'b' = 'a';
    const setAttn = (s: 'a' | 'b') => {
      if (s === attn) return;
      attn = s;
      for (const h of halves) h.dataset.attn = h.dataset.side === s ? '1' : '0';
    };

    /* ── motion off: everything at its final, readable state, no loop ────── */
    if (reduced) {
      vault.settle();
      for (const el of reveals) el.dataset.open = '1';
      for (const el of divs) el.dataset.on = '1';
      for (const h of halves) h.dataset.attn = '1';
      if (sweepEl) sweepEl.style.display = 'none';

      if (band && gridA && gridB) {
        band.style.clipPath = 'inset(0)';
        const bw = band.clientWidth;
        const cx = bw / 2;
        const gw = gridA.offsetWidth;
        const xa = cx - gw * 0.55;
        const xb = cx - gw * 0.45;
        const zone = Math.min(96, bw * 0.06);
        gridA.style.transform = `translate3d(${xa}px,0,0)`;
        gridB.style.transform = `translate3d(${xb}px,0,0)`;
        cellsA.forEach((c, i) => {
          if (xa + c.offsetLeft + c.offsetWidth / 2 >= cx - zone) {
            c.textContent = cipherA[i];
            c.dataset.enc = '1';
          }
        });
        cellsB.forEach((c, i) => {
          if (xb + c.offsetLeft + c.offsetWidth / 2 <= cx + zone) {
            c.textContent = cipherB[i];
            c.dataset.enc = '1';
          }
        });
      }
      if (gout) gout.style.clipPath = 'inset(0)';

      for (const s of smotes) {
        if (s.fill) s.fill.style.clipPath = 'inset(0)';
        for (const r of s.rows) r.dataset.on = '1';
      }
      for (const c of counters) {
        if (c.mark) c.mark.style.left = '100%';
        if (c.val) c.val.textContent = '400';
      }
      if (verdict) verdict.dataset.v = 'fraud';
      if (msBar) msBar.style.clipPath = 'inset(0)';
      if (msVal) msVal.textContent = '3000';

      if (maskRow) {
        const stick = maskRow.parentElement as HTMLElement;
        const cw = maskCells.length ? maskCells[0].offsetWidth : 10;
        maskRow.style.transform = `translate3d(${stick.clientWidth * 0.5 - 10 * cw}px,0,0)`;
      }
      maskCells.forEach((c, i) => {
        if (i < 10) {
          c.textContent = 'X';
          c.dataset.x = '1';
        }
      });
      if (maskOut) maskOut.dataset.on = '1';
      return;
    }

    /* ── pointer + keyboard attention ────────────────────────────────────── */
    const onEnter = (e: Event) => {
      const s = (e.currentTarget as HTMLElement).dataset.side as 'a' | 'b';
      if (s) setAttn(s);
    };
    if (!coarse) for (const h of halves) h.addEventListener('pointerenter', onEnter);
    for (const h of halves) h.addEventListener('focusin', onEnter);

    /* ── the entry decrypt sweep ─────────────────────────────────────────── */
    const t0 = performance.now();
    const SWEEP_START = 640; // the slats are opening by now
    const SPEED = 1.4; // px per ms — 1400 px/s, as specified
    let sweepY = -180;
    let sweepDone = false;

    let fc = 0;
    let msT0 = 0;

    const stop = raf((_dt, t) => {
      fc++;
      const vh = window.innerHeight;

      /* ── the sweep ─────────────────────────────────────────────────────── */
      if (!sweepDone) {
        const e = t - t0 - SWEEP_START;
        sweepY = e < 0 ? -180 : -180 + e * SPEED;
        if (sweepEl) sweepEl.style.transform = `translate3d(0,${sweepY.toFixed(1)}px,0)`;
        if (sweepY > vh + 180) {
          sweepDone = true;
          if (sweepEl) sweepEl.style.visibility = 'hidden';
        }
      }

      /* ── coarse pointer: the halves hand off on scroll ─────────────────── */
      if (coarse && fc % 6 === 0) {
        let best = 1e9;
        let side: 'a' | 'b' | null = null;
        for (const h of halves) {
          const r = h.getBoundingClientRect();
          if (r.bottom < 0 || r.top > vh) continue;
          const dist = Math.abs(r.top + r.height / 2 - vh * 0.45);
          if (dist < best) {
            best = dist;
            side = (h.dataset.side as 'a' | 'b') ?? null;
          }
        }
        if (side) setAttn(side);
      }

      /* ── reach: rules draw, panels open, seals break ───────────────────── */
      if (fc % 3 === 0) {
        if (divs.length) {
          divs = divs.filter((el) => {
            if (el.getBoundingClientRect().top >= vh * 0.78) return true;
            el.dataset.on = '1';
            return false;
          });
        }
        if (reveals.length) {
          reveals = reveals.filter((el) => {
            if (el.getBoundingClientRect().top >= vh * 0.88) return true;
            el.dataset.open = '1';
            return false;
          });
        }
        for (const u of vault.units) {
          if (u.perm) continue;
          if (!u.reached) {
            if (u.last) u.reached = sweepDone;
            else if (u.sweep) u.reached = u.el.getBoundingClientRect().top < sweepY;
            else u.reached = u.el.getBoundingClientRect().top < vh * 0.86;
          }
          vault.set(u, u.reached && (u.side === null || u.side === attn), t);
        }
      }
      vault.frame(t);

      /* ── seal 03: SMOTE, locally and separately ────────────────────────── */
      for (const s of smotes) {
        const r = s.el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) continue;
        const p = clamp01((vh * 0.86 - r.top) / (vh * 0.5));
        if (s.fill) s.fill.style.clipPath = `inset(0 ${(92 - 92 * p).toFixed(1)}% 0 0)`;
        const k = Math.min(s.rows.length, Math.floor(p * (s.rows.length + 0.5)));
        if (k !== s.k) {
          for (let i = 0; i < s.rows.length; i++) s.rows[i].dataset.on = i < k ? '1' : '0';
          s.k = k;
        }
      }

      /* ── seal 05: the gate ─────────────────────────────────────────────── */
      if (gate && band) {
        const r = gate.getBoundingClientRect();
        if (r.bottom > -vh && r.top < vh) {
          const p = clamp01(-r.top / Math.max(1, r.height - vh));
          const bw = band.clientWidth;
          const cx = bw / 2;
          const zone = Math.min(96, bw * 0.06);

          band.style.clipPath = `inset(0 0 ${(100 - clamp01(p / 0.12) * 100).toFixed(1)}% 0)`;

          const q = clamp01((p - 0.12) / 0.52);
          if (gridA && gridB) {
            const gw = gridA.offsetWidth;
            const xa = lerp(-(gw + 60), cx - gw * 0.55, q);
            const xb = lerp(bw + 60, cx - gw * 0.45, q);
            gridA.style.transform = `translate3d(${xa.toFixed(1)}px,0,0)`;
            gridB.style.transform = `translate3d(${xb.toFixed(1)}px,0,0)`;

            /* at the gate edge every numeral becomes a ciphertext block, and
               stays one — nothing that has entered the gate comes back out */
            const edge = cx - zone;
            for (let i = 0; i < cellsA.length; i++) {
              const x = xa + cellsA[i].offsetLeft + cellsA[i].offsetWidth / 2;
              const on = x >= edge ? 1 : 0;
              if (on !== encA[i]) {
                encA[i] = on;
                cellsA[i].textContent = on ? cipherA[i] : WA[i];
                cellsA[i].dataset.enc = on ? '1' : '0';
              }
            }
            const edgeB = cx + zone;
            for (let i = 0; i < cellsB.length; i++) {
              const x = xb + cellsB[i].offsetLeft + cellsB[i].offsetWidth / 2;
              const on = x <= edgeB ? 1 : 0;
              if (on !== encB[i]) {
                encB[i] = on;
                cellsB[i].textContent = on ? cipherB[i] : WB[i];
                cellsB[i].dataset.enc = on ? '1' : '0';
              }
            }
          }
          if (gout) {
            const o = clamp01((p - 0.74) / 0.13);
            gout.style.clipPath = `inset(0 ${(100 - o * 100).toFixed(1)}% 0 0)`;
          }
        }
      }

      /* ── seal 06: the vote ─────────────────────────────────────────────── */
      if (voteRow) {
        const r = voteRow.getBoundingClientRect();
        if (r.bottom > 0 && r.top < vh) {
          const vp = clamp01((vh * 0.9 - r.top) / (r.height * 0.62));
          /* 40 notches of 10 estimators; the last three land as three clicks,
             not as an overshoot */
          const n =
            vp < 0.8
              ? Math.round((vp / 0.8) * 37)
              : 37 + Math.min(3, Math.floor((vp - 0.8) / 0.062));
          for (const c of counters) {
            if (n === c.n) continue;
            c.n = n;
            if (c.mark) c.mark.style.left = `${((n / 40) * 100).toFixed(2)}%`;
            if (c.val) c.val.textContent = String(n * 10).padStart(3, '0');
          }
          if (verdict) {
            /* the ensemble deliberates, then cuts hard and stays */
            const v = vp >= 0.62 ? 'fraud' : Math.floor(vp * 22) % 2 ? 'fraud' : 'legit';
            if (verdict.dataset.v !== v) verdict.dataset.v = v;
          }
        }
      }

      /* ── seal 07: three milliseconds, the one continuous thing ─────────── */
      if (msSec && msBar && msVal) {
        const r = msSec.getBoundingClientRect();
        if (r.bottom > 0 && r.top < vh) {
          if (!msT0) msT0 = t;
          const e = (t - msT0) % 3000;
          msBar.style.clipPath = `inset(0 ${((e / 3000) * 100).toFixed(2)}% 0 0)`;
          msVal.textContent = String(Math.round(3000 - e)).padStart(4, '0');
        } else {
          msT0 = 0;
        }
      }

      /* ── seal 08: masking, live and scrubbable ─────────────────────────── */
      if (mask && maskRow) {
        const r = mask.getBoundingClientRect();
        if (r.bottom > 0 && r.top < vh) {
          const p = clamp01(-r.top / Math.max(1, r.height - vh));
          const stick = maskRow.parentElement as HTMLElement;
          const sw = stick.clientWidth;
          const cw = maskCells.length ? maskCells[0].offsetWidth : 10;
          const rule = sw * 0.5;
          const x = lerp(sw * 0.96, rule - 10 * cw, p);
          maskRow.style.transform = `translate3d(${x.toFixed(1)}px,0,0)`;
          for (let i = 0; i < maskCells.length; i++) {
            /* the last four digits are never redacted — they are what the
               customer is asked to confirm */
            const on = i < 10 && x + maskCells[i].offsetLeft + cw * 0.5 < rule ? 1 : 0;
            if (on !== maskState[i]) {
              maskState[i] = on;
              maskCells[i].textContent = on ? 'X' : ACCOUNT[i];
              maskCells[i].dataset.x = on ? '1' : '0';
            }
          }
          if (maskOut) maskOut.dataset.on = p > 0.86 ? '1' : '0';
        }
      }
    });

    return () => {
      stop();
      if (!coarse) for (const h of halves) h.removeEventListener('pointerenter', onEnter);
      for (const h of halves) h.removeEventListener('focusin', onEnter);
    };
  }, []);

  const still = reducedOnce();

  return (
    <div className={`sd${still ? ' sd--still' : ''}`} ref={rootRef}>
      {/* ── entry: twelve slats close from alternating directions ────────── */}
      {!still && (
        <div className="sd-shutter" aria-hidden="true">
          {Array.from({ length: 12 }, (_, i) => (
            <i key={i} style={{ left: `${(i * 100) / 12}%`, animationDelay: `${i * 24}ms` }} />
          ))}
        </div>
      )}

      {/* ── masthead ─────────────────────────────────────────────────────── */}
      <header className="sd-head">
        <div className="sd-head__bar">
          <BackLink label="index" />
          <span className="sd-mono sd-dim">
            <Seal sweep text="npci digipay pro · iit bombay · techfest 2024 · runner up" />
          </span>
        </div>

        <h1 className="sd-h1">
          <Seal sweep last text="Nothing crosses the boundary" />
        </h1>

        <p className="sd-lede">
          <Seal sweep text="Two banks need one model and cannot show each other a single row." />{' '}
          <Seal
            sweep
            text="This document is sealed by default. It opens where you are looking, and closes again behind you."
          />
        </p>

        <div className="sd-head__foot">
          <p className="sd-mono sd-dim sd-head__note">
            <Seal sweep text="federated learning · ckks homomorphic encryption · hard-voting ensemble" />
          </p>
          <ol className="sd-manifest">
            {MANIFEST.map(([n, t]) => (
              <li key={n}>
                <span className="sd-manifest__n">{n}</span>
                <Seal sweep className="sd-manifest__t" text={t} />
              </li>
            ))}
          </ol>
        </div>

        <div className="sd-sweep" aria-hidden="true" />
      </header>

      {/* ══ institution split, first half of the document ═════════════════ */}
      <div className="sd-body">
        <div className="sd-div" data-on="0" aria-hidden="true" />

        {/* ── seal 01 — the constraint ─────────────────────────────────── */}
        <section className="sd-row sd-row--left" aria-labelledby="sd-s1">
          <div className="sd-col">
            <p className="sd-tag">
              <Seal text="seal 01" />
            </p>
            <Seal as="h2" id="sd-s1" className="sd-h2" text="The constraint" />
            <Panel seed={0x101} lines={9}>
              <p className="sd-body-t">{CS.problem}</p>
            </Panel>
            <Panel seed={0x102} lines={6} width={38} stagger={1} className="sd-panel--mono">
              <dl className="sd-defs">
                <dt>
                  <Seal text="crosses the boundary" />
                </dt>
                <dd>encrypted model parameters, and nothing else</dd>
                <dt>
                  <Seal text="does not cross" />
                </dt>
                <dd>
                  transaction rows · origin and destination identifiers · local scaler statistics ·
                  local class counts
                </dd>
              </dl>
            </Panel>
          </div>
          <aside className="sd-aside" aria-hidden="true">
            <p className="sd-mono sd-dim">institution b · not readable from here</p>
            <div className="sd-wall">
              {cipherLines(14, 30, 0x777).map((l, i) => (
                <i key={i}>{l}</i>
              ))}
            </div>
          </aside>
        </section>

        {/* ── seal 02 — what each side holds ───────────────────────────── */}
        <section className="sd-row" aria-labelledby="sd-s2">
          <div className="sd-row__head">
            <p className="sd-tag">
              <Seal text="seal 02" />
            </p>
            <Seal as="h2" id="sd-s2" className="sd-h2" text="What each side holds" />
            <Panel seed={0x201} lines={7}>
              <p className="sd-body-t">{CS.pipeline[0].body}</p>
              <p className="sd-mono sd-dim sd-hint">
                the two institutions cannot be read at once. point at a half, or tab into it, and
                the other one re-seals.
              </p>
            </Panel>
          </div>
          <div className="sd-halves">
            {(['a', 'b'] as const).map((s, si) => (
              <Half key={s} side={s} label={`Institution ${s.toUpperCase()}`}>
                <h3 className="sd-h3">
                  <Seal text={`institution ${s}`} />
                </h3>
                <ul className="sd-list">
                  {NUMERIC.map((c) => (
                    <li key={c}>
                      <Seal text={c} />
                      <span className="sd-rulefill" aria-hidden="true" />
                      <span className="sd-dim">numeric</span>
                    </li>
                  ))}
                  <li>
                    <Seal text="type" />
                    <span className="sd-rulefill" aria-hidden="true" />
                    <span className="sd-dim">onehot · drop-first</span>
                  </li>
                  <li>
                    <Seal text="nameOrig · nameDest" />
                    <span className="sd-rulefill" aria-hidden="true" />
                    <span className="sd-dim">dropped</span>
                  </li>
                </ul>
                <table className="sd-tbl">
                  <caption>
                    <Seal text="local statistics · never transmitted" />
                  </caption>
                  <tbody>
                    <tr>
                      <th scope="row">standardscaler μ</th>
                      <td>
                        <Withheld n={14} seed={0x3001 + si * 91} />
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">standardscaler σ</th>
                      <td>
                        <Withheld n={14} seed={0x3002 + si * 91} />
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">rows held</th>
                      <td>
                        <Withheld n={9} seed={0x3003 + si * 91} />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </Half>
            ))}
          </div>
          <p className="sd-mono sd-dim sd-foot">
            <Seal text="the settings are shared. the statistics are not — and this page has no way to show you what it was never given." />
          </p>
        </section>

        {/* ── seal 03 — imbalance, locally ─────────────────────────────── */}
        <section className="sd-row" aria-labelledby="sd-s3">
          <div className="sd-row__head">
            <p className="sd-tag">
              <Seal text="seal 03" />
            </p>
            <Seal as="h2" id="sd-s3" className="sd-h2" text="Imbalance, locally" />
            <Panel seed={0x301} lines={6}>
              <p className="sd-body-t">{CS.pipeline[1].body}</p>
              <p className="sd-body-t sd-body-t--sm">{CS.challenges![1]}</p>
            </Panel>
          </div>
          <div className="sd-halves">
            {(['a', 'b'] as const).map((s, si) => (
              <Half key={s} side={s} label={`Institution ${s.toUpperCase()}, class balance`}>
                <h3 className="sd-h3">
                  <Seal text={`institution ${s} · class counts`} />
                </h3>
                <div className="sd-smote">
                  <div className="sd-bar">
                    <span className="sd-bar__k">
                      <Seal text="legitimate" />
                    </span>
                    <span className="sd-bar__t">
                      <i className="sd-bar__base" />
                    </span>
                    <Withheld n={8} seed={0x4001 + si * 31} />
                  </div>
                  <div className="sd-bar">
                    <span className="sd-bar__k">
                      <Seal text="fraud" />
                    </span>
                    <span className="sd-bar__t">
                      <i className="sd-bar__f" />
                    </span>
                    <Withheld n={8} seed={0x4002 + si * 31} />
                  </div>
                  <div className="sd-synth" aria-hidden="true">
                    {cipherLines(si === 0 ? 7 : 5, 26, 0x5000 + si * 17).map((l, i) => (
                      <i key={i} data-on="0">
                        + {l}
                      </i>
                    ))}
                  </div>
                </div>
                <p className="sd-mono sd-dim">
                  <Seal text="smote · random_state 42 · fitted inside this site only" />
                </p>
              </Half>
            ))}
          </div>
          <p className="sd-mono sd-dim sd-foot">
            <Seal text="proportions withheld. this is the shape of the imbalance, not its size — and the two sites do not synthesise the same number of rows." />
          </p>
        </section>

        {/* ── seal 04 — the local models ───────────────────────────────── */}
        <section className="sd-row" aria-labelledby="sd-s4">
          <div className="sd-row__head">
            <p className="sd-tag">
              <Seal text="seal 04" />
            </p>
            <Seal as="h2" id="sd-s4" className="sd-h2" text="The local models" />
            <Panel seed={0x401} lines={8}>
              <p className="sd-body-t">{CS.pipeline[2].body}</p>
              <p className="sd-mono sd-dim sd-hint">
                both families are fitted at every site. they are separated across the divider here
                because you can only read one half at a time.
              </p>
            </Panel>
          </div>
          <div className="sd-halves">
            <Half side="a" label="Institution A, the network">
              <h3 className="sd-h3">
                <Seal text="institution a · the network" />
              </h3>
              <ol className="sd-arch">
                {['64', '32', '16', '1'].map((n, i) => (
                  <li key={n}>
                    <span className="sd-arch__n">{n}</span>
                    <Seal
                      className="sd-arch__k"
                      text={i === 3 ? 'sigmoid · verdict' : 'dense · batchnorm · dropout 0.3'}
                    />
                  </li>
                ))}
              </ol>
              <ul className="sd-list">
                <li>
                  <Seal text="adam" />
                  <span className="sd-rulefill" aria-hidden="true" />
                  <span className="sd-dim">lr 1e-3</span>
                </li>
                <li>
                  <Seal text="epochs" />
                  <span className="sd-rulefill" aria-hidden="true" />
                  <span className="sd-dim">100 · batch 32</span>
                </li>
                <li>
                  <Seal text="early stopping" />
                  <span className="sd-rulefill" aria-hidden="true" />
                  <span className="sd-dim">patience 10</span>
                </li>
              </ul>
            </Half>
            <Half side="b" label="Institution B, the forest">
              <h3 className="sd-h3">
                <Seal text="institution b · the forest" />
              </h3>
              <div className="sd-forest" aria-hidden="true">
                {Array.from({ length: 40 }, (_, i) => (
                  <i key={i} />
                ))}
              </div>
              <ul className="sd-list">
                <li>
                  <Seal text="randomforest" />
                  <span className="sd-rulefill" aria-hidden="true" />
                  <span className="sd-dim">400 estimators</span>
                </li>
                <li>
                  <Seal text="in the ensemble" />
                  <span className="sd-rulefill" aria-hidden="true" />
                  <span className="sd-dim">×2, hard voting</span>
                </li>
                <li>
                  <Seal text="cross-validation" />
                  <span className="sd-rulefill" aria-hidden="true" />
                  <span className="sd-dim">per site, never pooled</span>
                </li>
              </ul>
            </Half>
          </div>
        </section>
      </div>

      {/* ══ seal 05 — the gate. The divider breaks here. ══════════════════ */}
      <section className="sd-gate" aria-labelledby="sd-s5">
        <div className="sd-gate__stick">
          <div className="sd-gate__band">
            <div className="sd-gate__hd">
              <p className="sd-tag sd-tag--inv">
                <Seal text="seal 05" />
              </p>
              <Seal as="h2" id="sd-s5" className="sd-h2 sd-h2--inv" text="The gate" />
              <p className="sd-gate__line">
                <Seal text="The aggregator never sees a plaintext weight — and neither do you." />
              </p>
            </div>

            <div className="sd-gate__mx" aria-hidden="true">
              <div className="sd-gate__edge" />
              <div className="sd-gm sd-gm--a" style={{ '--ch': '#0075C4' } as CSSProperties}>
                <span className="sd-gm__k">institution a · local weights</span>
                {WA.map((w, i) => (
                  <span className="sd-gc" key={i}>
                    {w}
                  </span>
                ))}
              </div>
              <div className="sd-gm sd-gm--b" style={{ '--ch': '#5B3DF5' } as CSSProperties}>
                <span className="sd-gm__k">institution b · local weights</span>
                {WB.map((w, i) => (
                  <span className="sd-gc" key={i}>
                    {w}
                  </span>
                ))}
              </div>
              <div className="sd-gate__out">
                <span className="sd-gate__outk">combined decision vector · plaintext</span>
                <span className="sd-gate__outv">{COMBINED.join('  ')}</span>
              </div>
              <p className="sd-gate__ill">
                illustrative · the trained weights are not published
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="sd-after">
        <Panel seed={0x501} lines={8} className="sd-after__p">
          <p className="sd-body-t">{CS.pipeline[3].body}</p>
          <p className="sd-body-t sd-body-t--sm">{CS.challenges![0]}</p>
        </Panel>
      </section>

      {/* ══ institution split, second half ════════════════════════════════ */}
      <div className="sd-body">
        <div className="sd-div" data-on="0" aria-hidden="true" />

        {/* ── seal 06 — the vote ───────────────────────────────────────── */}
        <section className="sd-row sd-vote" aria-labelledby="sd-s6">
          <div className="sd-row__head">
            <p className="sd-tag">
              <Seal text="seal 06" />
            </p>
            <Seal as="h2" id="sd-s6" className="sd-h2" text="The vote" />
            <Panel seed={0x601} lines={5}>
              <p className="sd-body-t">{CS.approach}</p>
            </Panel>
          </div>
          <div className="sd-halves">
            {(['a', 'b'] as const).map((s) => (
              <Half key={s} side={s} label={`Institution ${s.toUpperCase()}, estimators`}>
                <h3 className="sd-h3">
                  <Seal text={`institution ${s} · estimators`} />
                </h3>
                <div className="sd-ctr">
                  <div className="sd-ctr__track">
                    {Array.from({ length: 41 }, (_, i) => (
                      <i key={i} style={{ left: `${(i / 40) * 100}%` }} data-t={i % 10 === 0 ? '1' : '0'} />
                    ))}
                    <b className="sd-ctr__mark" />
                  </div>
                  <p className="sd-ctr__r">
                    <span className="sd-ctr__v">000</span>
                    <span className="sd-dim"> / 400 estimators</span>
                  </p>
                </div>
              </Half>
            ))}
          </div>
          <div className="sd-verdictwrap">
            <div className="sd-verdict" data-v="legit" aria-hidden="true">
              <span className="sd-verdict__l">legitimate</span>
              <span className="sd-verdict__f">fraud</span>
            </div>
            <p className="sd-vh">Final ensemble verdict: fraud.</p>
            <p className="sd-fig">
              <b>{CS.results[0].v}</b>
              <span>
                <Seal text={CS.results[0].k} />
              </span>
            </p>
          </div>
        </section>

        {/* ── seal 07 — three milliseconds ─────────────────────────────── */}
        <section className="sd-row sd-row--right sd-ms" aria-labelledby="sd-s7">
          <div className="sd-col">
            <p className="sd-tag">
              <Seal text="seal 07" />
            </p>
            <Seal as="h2" id="sd-s7" className="sd-h2" text="Three milliseconds" />
            <div className="sd-ms__rig">
              <div className="sd-ms__bar">
                <i className="sd-ms__f" />
              </div>
              <p className="sd-ms__read">
                <span className="sd-ms__v">3000</span>
                <span className="sd-dim"> µs remaining · shown at ×1000</span>
              </p>
            </div>
            <Panel seed={0x701} lines={7}>
              <p className="sd-body-t">{CS.pipeline[4].body}</p>
              <p className="sd-body-t sd-body-t--sm">{CS.challenges![2]}</p>
            </Panel>
          </div>
        </section>

        {/* ── seal 08 — masking, live ──────────────────────────────────── */}
        <section className="sd-row sd-row--left" aria-labelledby="sd-s8">
          <div className="sd-col">
            <p className="sd-tag">
              <Seal text="seal 08" />
            </p>
            <Seal as="h2" id="sd-s8" className="sd-h2" text="Masking, live" />
            <Panel seed={0x801} lines={8}>
              <p className="sd-body-t">{CS.pipeline[5].body}</p>
              <p className="sd-body-t sd-body-t--sm">{CS.challenges![3]}</p>
            </Panel>
          </div>
          <div className="sd-mask">
            <div className="sd-mask__stick">
              <div className="sd-mask__rule" aria-hidden="true">
                <span>redaction</span>
              </div>
              <div className="sd-mask__row" aria-hidden="true">
                {Array.from(ACCOUNT).map((c, i) => (
                  <span className="sd-mask__c" key={i} data-x="0">
                    {c}
                  </span>
                ))}
              </div>
              <p className="sd-vh">
                Account number {ACCOUNT} is masked to XXXXXXXXXX4417 before any part of it leaves
                the process.
              </p>
              <p className="sd-mask__out" data-on="0" aria-hidden="true">
                XXXXXXXXXX4417
              </p>
              <p className="sd-mask__cap sd-mono sd-dim">
                scroll back and it un-redacts. the last four digits never cross.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* ══ zero — never sealed, legible from the first frame ═════════════ */}
      <section className="sd-zero" aria-labelledby="sd-s9">
        <p className="sd-zero__n" aria-hidden="true">
          0
        </p>
        <div className="sd-zero__t">
          <h2 className="sd-h2" id="sd-s9">
            {CS.results[2].v} {CS.results[2].k}
          </h2>
          <p className="sd-body-t">{CS.results[2].note}. Everything else on this page had to be unsealed before you could read it. This did not.</p>
        </div>
      </section>

      {/* ══ seal 09 — the note. No panel, no scramble, no performance. ════ */}
      <section className="sd-note" aria-labelledby="sd-s10">
        <h2 id="sd-s10">note · read this before the repository</h2>
        <p>{CS.honest}</p>
      </section>

      {/* ══ colophon ══════════════════════════════════════════════════════ */}
      <footer className="sd-colophon">
        <div className="sd-colophon__g">
          <div>
            <h2 className="sd-h3">
              <Seal text="the data" />
            </h2>
            <p className="sd-body-t sd-body-t--sm">{CS.dataset}</p>
          </div>
          <div>
            <h2 className="sd-h3">
              <Seal text="instrumentation" />
            </h2>
            <ul className="sd-stack">
              {CS.stack.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="sd-h3">
              <Seal text="figures" />
            </h2>
            <ul className="sd-stack">
              {CS.results.map((m) => (
                <li key={m.k}>
                  <b>{m.v}</b> {m.k}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <nav className="sd-links" aria-label="Project links">
          <a href={CS.repo} target="_blank" rel="noopener noreferrer">
            the repository
          </a>
          <Link to="/work/eeg-emotion">next · a chart recorder</Link>
          <Link to="/">back to the index</Link>
        </nav>
      </footer>
    </div>
  );
}
