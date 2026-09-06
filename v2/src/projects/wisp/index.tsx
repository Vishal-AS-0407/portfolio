/* ══════════════════════════════════════════════════════════════════════════
   wisp — "After Dark"                              concept: docs/design/wisp.md

   An infrared contact sheet with a field notebook in the margins. Every image
   is computed (ir.ts, shapes.ts); no photograph ships with this page. The
   reader carries a lens: a damped circular mask that exposes each frame's
   Captum attribution heat where it passes, and only where it passes, because
   that is the project's actual claim — the labels never said where to look.

   The page owns one rAF loop. It drives four parallax planes at four distinct
   ratios from scroll *and* pointer, the lens, the exposure clocks of every
   frame that has just come into view, one cross-fade, one rail and one drain.
   Nothing else moves, and nothing here fades up.
   ══════════════════════════════════════════════════════════════════════════ */

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import BackLink from '@/projects/_shared/BackLink';
import { usePageShell, raf, clamp01, lerp } from '@/projects/_shared/page';
import { prefersReduced, isCoarse } from '@/projects/_shared/reduced';
import { projects } from '@/data/content';
import { caseStudies } from '@/data/casestudies';
import { contours, makeIR, makeHeat, METHODS, type FrameSpec } from './ir';
import Cell, { EmptyMount, paintInto, type Handle } from './Frame';
import { SHEET, SPECIES, PLATE_OCELOT, PLATE_BOAR, STUDY, NOBOX, NOTE_STRIP } from './species';
import './wisp.css';

const P = projects.find((x) => x.slug === 'wisp')!;
const CS = caseStudies.wisp;
const R = CS.results;

/* pointer travel per plane: ratio × 65 ≈ 4 / 9 / 18 / 24 / 30 px */
const PP = 65;
/* scroll travel per plane: ratio × 130 px across a viewport of movement */
const AMP = 130;
const LENS = 300;
const EXPOSE = 1.9;

const TILE_W = 336;
const TILE_H = 224;
const PLATE_W = 760;
const PLATE_H = 428;
const STUDY_W = 560;
const STUDY_H = 373;

/* the four dashed rectangles that never existed, over frame NOBOX */
const BOXES = [
  { x: 46, y: 40, w: 30, h: 34 },
  { x: 44, y: 36, w: 36, h: 42 },
  { x: 52, y: 46, w: 22, h: 26 },
  { x: 38, y: 30, w: 46, h: 52 },
];

const ease = (k: number) => 1 - Math.pow(1 - k, 3.2);

export default function AfterDark() {
  usePageShell({
    title: `${P.title} — After Dark`,
    bg: '#171210',
    ink: '#f0e7d8',
    accent: '#b4ff3b',
    scope: 'pj-wisp',
  });

  const root = useRef<HTMLDivElement>(null);
  const cells = useRef<Handle[]>([]);
  const reg = (h: Handle | null) => {
    /* StrictMode mounts every effect twice; key the registry on the DOM node so
       a remount replaces its own handle instead of doubling it. */
    cells.current = cells.current.filter((x) => x.win.isConnected && (!h || x.win !== h.win));
    if (h) cells.current.push(h);
  };

  const [open, setOpen] = useState(false); // every attribution held open

  const bgRef = useRef<HTMLDivElement>(null);
  const bgGroup = useRef<SVGGElement>(null);
  const lensRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const leadRef = useRef<SVGSVGElement>(null);
  const noteLeadRef = useRef<SVGSVGElement>(null);
  const noteWrapRef = useRef<HTMLDivElement>(null);
  const sixRef = useRef<HTMLDivElement>(null);
  const sixLayers = useRef<(HTMLCanvasElement | null)[]>([]);
  const sixLabels = useRef<(HTMLLIElement | null)[]>([]);
  const railRef = useRef<HTMLDivElement>(null);
  const railWrap = useRef<HTMLDivElement>(null);
  const terrRef = useRef<HTMLDivElement>(null);
  const terrB = useRef<SVGGElement>(null);
  const hazRef = useRef<SVGGElement>(null);
  const resetRef = useRef<HTMLElement>(null);

  const studyIR = useRef<HTMLCanvasElement>(null);
  const noboxIR = useRef<HTMLCanvasElement>(null);
  const cmpIR = useRef<(HTMLCanvasElement | null)[]>([]);
  const cmpHeat = useRef<(HTMLCanvasElement | null)[]>([]);

  const backdrop = useMemo(() => contours(7301, 16, 700, 450, 74, 640), []);
  const terrainA = useMemo(() => contours(9101, 11, 480, 300, 46, 300), []);
  const terrainB = useMemo(() => contours(9241, 11, 480, 300, 46, 300), []);

  /* ── the frames that are not inside a <Cell> ─────────────────────────── */
  useEffect(() => {
    const live = { ok: true };
    paintInto(live, studyIR.current, STUDY_W, STUDY_H, () =>
      makeIR('study', STUDY, STUDY_W, STUDY_H),
    );
    paintInto(live, noboxIR.current, STUDY_W, STUDY_H, () =>
      makeIR('nobox', NOBOX, STUDY_W, STUDY_H),
    );
    const hw = STUDY_W >> 1;
    const hh = STUDY_H >> 1;
    for (let i = 0; i < 6; i++) {
      const el = sixLayers.current[i];
      paintInto(live, el, hw, hh, () => makeHeat(`sx${i}`, STUDY, i, hw, hh));
    }
    paintInto(live, sixLayers.current[6], hw, hh, () => makeHeat('sxc', STUDY, -1, hw, hh));
    /* the static six-up comparison: one small frame, six small answers */
    for (let i = 0; i < 6; i++) {
      paintInto(live, cmpIR.current[i], 224, 149, () => makeIR('cmp', STUDY, 224, 149));
      paintInto(live, cmpHeat.current[i], 112, 75, () => makeHeat(`cm${i}`, STUDY, i, 112, 75));
    }
    return () => {
      live.ok = false;
    };
  }, []);

  /* ── one loop ────────────────────────────────────────────────────────── */
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduced = prefersReduced();
    const coarse = isCoarse();

    const planes = Array.from(el.querySelectorAll<HTMLElement>('[data-plane]')).map((p) => ({
      el: p,
      r: parseFloat(p.dataset.plane || '0'),
      diff: p.hasAttribute('data-diff'),
      dy: 0,
    }));

    /* ── leader lines, measured with every plane transform cleared ────── */
    const drawLeaders = () => {
      for (const p of planes) {
        p.el.style.transform = '';
        p.dy = 0;
      }
      for (const [svg, host] of [
        [leadRef.current, sheetRef.current] as const,
        [noteLeadRef.current, noteWrapRef.current] as const,
      ]) {
        if (!svg || !host) continue;
        const hb = host.getBoundingClientRect();
        svg.setAttribute('viewBox', `0 0 ${Math.round(hb.width)} ${Math.round(hb.height)}`);
        const parts: string[] = [];
        host.querySelectorAll<HTMLElement>('[data-lead]').forEach((note) => {
          const tgt = host.querySelector<HTMLElement>(`[data-anchor="${note.dataset.lead}"]`);
          if (!tgt) return;
          const nb = note.getBoundingClientRect();
          const tb = tgt.getBoundingClientRect();
          const fromRight = nb.left > tb.left;
          const nx = (fromRight ? nb.left : nb.right) - hb.left;
          const ny = nb.top + nb.height / 2 - hb.top;
          const ax = parseFloat(note.dataset.ax || '0.5');
          const ay = parseFloat(note.dataset.ay || '0.5');
          const fx = tb.left + tb.width * ax - hb.left;
          const fy = tb.top + tb.height * ay - hb.top;
          const stub = fromRight ? -15 : 15;
          parts.push(
            `<path pathLength="100" d="M${nx.toFixed(1)} ${ny.toFixed(1)} H${(nx + stub).toFixed(1)} L${(fx - stub * 0.6).toFixed(1)} ${fy.toFixed(1)} H${fx.toFixed(1)}"/>`,
          );
          parts.push(`<circle cx="${fx.toFixed(1)}" cy="${fy.toFixed(1)}" r="3"/>`);
        });
        svg.innerHTML = `<g class="wp-lead__g">${parts.join('')}</g>`;
      }
    };

    drawLeaders();
    const ro = new ResizeObserver(() => drawLeaders());
    if (sheetRef.current) ro.observe(sheetRef.current);
    if (noteWrapRef.current) ro.observe(noteWrapRef.current);

    /* ── the still page ───────────────────────────────────────────────── */
    if (reduced) {
      setOpen(true);
      for (const c of cells.current) {
        c.exp.style.filter = 'none';
        c.t = 999;
      }
      el.classList.add('is-still');
      sixLayers.current.forEach((c, i) => {
        if (c) c.style.opacity = i === 6 ? '1' : '0';
      });
      sixLabels.current[6]?.classList.add('is-on');
      if (lensRef.current) {
        lensRef.current.style.opacity = '0';
      }
      if (terrB.current) terrB.current.style.opacity = '0.55';
      return () => ro.disconnect();
    }

    /* ── pointer ──────────────────────────────────────────────────────── */
    let tx = window.innerWidth / 2;
    let ty = window.innerHeight * 0.42;
    let lx = tx;
    let ly = ty;
    let pnx = 0;
    let pny = 0;
    let dnx = 0;
    let dny = 0;
    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      pnx = (e.clientX / window.innerWidth - 0.5) * 2;
      pny = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    if (!coarse) window.addEventListener('pointermove', onMove, { passive: true });

    const lastMask = new WeakMap<HTMLElement, string>();
    let lastLens = -1;
    let lastLabel = -1;
    let clock = 0;

    const stop = raf((dt) => {
      const vh = window.innerHeight;
      const sy = window.scrollY;
      clock += dt / 60;

      /* coarse pointers get an autonomous Lissajous drift across the sheet */
      if (coarse) {
        tx = window.innerWidth * (0.5 + 0.33 * Math.sin(clock * 0.31));
        ty = vh * (0.48 + 0.3 * Math.sin(clock * 0.223 + 1.1));
      }

      const k = 1 - Math.pow(0.925, dt); // the lens is ~120 ms behind the hand
      lx = lerp(lx, tx, k);
      ly = lerp(ly, ty, k);
      const kp = 1 - Math.pow(0.94, dt);
      dnx = lerp(dnx, coarse ? 0 : pnx, kp);
      dny = lerp(dny, coarse ? 0 : pny, kp);

      /* ── the drain, first, because it scales the lens ───────────────── */
      let drain = 0;
      if (resetRef.current) {
        const r = resetRef.current.getBoundingClientRect();
        drain = clamp01((vh - r.top) / Math.max(1, vh * 0.9));
        el.style.setProperty('--drain', drain.toFixed(3));
      }

      /* ── plane 0 · the contours ─────────────────────────────────────── */
      if (bgRef.current) {
        const sc = coarse ? 0.5 : 1;
        bgRef.current.style.transform = `translate3d(${(dnx * 0.06 * PP).toFixed(2)}px,${(-sy * 0.06 * sc + dny * 0.06 * PP).toFixed(2)}px,0)`;
      }
      if (bgGroup.current) {
        bgGroup.current.style.transform = `scaleY(${(1 - drain * 0.84).toFixed(3)})`;
      }

      /* ── planes 1–3 · mounts 0.14, leaders 0.37, annotations 0.46 ───── */
      const half = coarse ? 0.5 : 1;
      for (const p of planes) {
        const b = p.el.getBoundingClientRect();
        const c = b.top + b.height / 2 - p.dy - vh / 2;
        const u = Math.max(-1.6, Math.min(1.6, c / vh));
        const dy = u * p.r * AMP * half;
        p.dy = dy;
        p.el.style.transform = `translate3d(${(dnx * p.r * PP).toFixed(2)}px,${dy.toFixed(2)}px,0)`;
        if (p.diff) {
          /* the frame inside each mount rides at 0.28 while the mount rides
             at 0.14 — the image floats a few px inside its own window */
          p.el.style.setProperty('--fdx', `${(dnx * (0.28 - p.r) * PP).toFixed(2)}px`);
          p.el.style.setProperty('--fdy', `${(u * (0.28 - p.r) * AMP * half).toFixed(2)}px`);
        }
      }

      /* ── the lens ────────────────────────────────────────────────────── */
      const lensPx = LENS * (1 - drain);
      if (Math.abs(lensPx - lastLens) > 0.8) {
        el.style.setProperty('--lens', `${lensPx.toFixed(1)}px`);
        lastLens = lensPx;
      }
      if (lensRef.current) {
        lensRef.current.style.transform = `translate3d(${(lx - LENS / 2).toFixed(1)}px,${(ly - LENS / 2).toFixed(1)}px,0) scale(${(1 - drain).toFixed(3)})`;
      }

      const rad = lensPx / 2;
      for (const c of cells.current) {
        const b = c.win.getBoundingClientRect();
        const near = b.bottom > -240 && b.top < vh + 240;

        /* exposure: it begins when the frame exists and the reader arrives */
        if (near && c.ready && c.t < 0) c.t = 0;
        if (c.t >= 0 && c.t < EXPOSE) {
          c.t += dt / 60;
          const e = ease(clamp01(c.t / EXPOSE));
          if (c.t >= EXPOSE) {
            c.exp.style.filter = 'none';
            c.t = 999;
          } else {
            c.exp.style.filter = `brightness(${(0.15 + 0.85 * e).toFixed(3)}) contrast(${(2.4 - 1.4 * e).toFixed(3)})`;
          }
        }

        if (!near || c.pinned) continue;
        const mx = lx - b.left - rad;
        const my = ly - b.top - rad;
        if (mx < -rad - b.width || mx > b.width + rad || my < -rad - b.height || my > b.height + rad) {
          if (lastMask.get(c.heat) !== 'off') {
            c.heat.style.setProperty('-webkit-mask-position', '-9999px -9999px');
            c.heat.style.setProperty('mask-position', '-9999px -9999px');
            lastMask.set(c.heat, 'off');
          }
          continue;
        }
        const v = `${mx.toFixed(1)}px ${my.toFixed(1)}px`;
        if (lastMask.get(c.heat) !== v) {
          c.heat.style.setProperty('-webkit-mask-position', v);
          c.heat.style.setProperty('mask-position', v);
          lastMask.set(c.heat, v);
        }
      }

      /* ── six attributions disagree ───────────────────────────────────── */
      if (sixRef.current) {
        const r = sixRef.current.getBoundingClientRect();
        if (r.bottom > -200 && r.top < vh + 200) {
          const p = clamp01(-r.top / Math.max(1, r.height - vh));
          const slot = p * 6.999;
          for (let i = 0; i < 7; i++) {
            const o = clamp01(1 - Math.abs(slot - i) / 1.05);
            const c = sixLayers.current[i];
            if (c) c.style.opacity = (i === 6 ? Math.max(o, clamp01((p - 0.88) / 0.1)) : o).toFixed(3);
          }
          const cur = Math.min(6, Math.round(slot));
          if (cur !== lastLabel) {
            sixLabels.current[lastLabel]?.classList.remove('is-on');
            sixLabels.current[cur]?.classList.add('is-on');
            lastLabel = cur;
          }
        }
      }

      /* ── the long tail rail ──────────────────────────────────────────── */
      if (railRef.current && railWrap.current) {
        const r = railWrap.current.getBoundingClientRect();
        if (r.bottom > -300 && r.top < vh + 300) {
          const p = clamp01((vh * 0.9 - r.top) / Math.max(1, r.height + vh * 0.7));
          const travel = Math.max(0, railRef.current.scrollWidth - railWrap.current.clientWidth);
          railRef.current.style.transform = `translate3d(${(-p * travel).toFixed(1)}px,0,0)`;
        }
      }

      /* ── terrain redraws, hazard expands ─────────────────────────────── */
      if (terrRef.current) {
        const r = terrRef.current.getBoundingClientRect();
        if (r.bottom > -200 && r.top < vh + 200) {
          const p = clamp01((vh * 0.85 - r.top) / Math.max(1, r.height * 0.72));
          if (terrB.current) {
            terrB.current.style.opacity = p.toFixed(3);
            terrB.current.style.setProperty('--redraw', (100 - p * 100).toFixed(1));
          }
          if (hazRef.current) {
            hazRef.current.style.transform = `scale(${(0.08 + p * 1.02).toFixed(3)})`;
            hazRef.current.style.opacity = clamp01(p * 2.4).toFixed(3);
          }
        }
      }

    });

    return () => {
      stop();
      ro.disconnect();
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  return (
    <div className={`wp${open ? ' is-open' : ''}`} ref={root}>
      <div className="wp-flash" aria-hidden="true" />

      {/* plane 0 — the topographic ground, deepest and slowest */}
      <div className="wp-bg" ref={bgRef} aria-hidden="true">
        <svg viewBox="0 0 1400 900" preserveAspectRatio="xMidYMid slice">
          <g ref={bgGroup} className="wp-bg__g">
            {backdrop.map((d, i) => (
              <path key={i} d={d} style={{ opacity: 0.16 + i * 0.03 }} />
            ))}
          </g>
        </svg>
      </div>

      {/* the lens itself — an optical ring, not a cursor */}
      <div className="wp-lens" ref={lensRef} aria-hidden="true">
        <span className="wp-lens__ring" />
        <span className="wp-lens__cross" />
      </div>

      <BackLink label="Index" />

      <button
        type="button"
        className="wp-hold"
        aria-pressed={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="wp-hold__box" aria-hidden="true" />
        {open ? 'Lens held open — every attribution showing' : 'Hold the lens open'}
      </button>

      <main className="wp-main">
        {/* ── 02:11 — the trigger ─────────────────────────────────────── */}
        <header className="wp-trigger">
          <p className="wp-stamp">
            <span className="wp-stamp__t">02:11:44</span>
            <span className="wp-stamp__m">IR · 850 nm · passive infrared trigger</span>
          </p>
          <h1 className="wp-h1">WISP</h1>
          <p className="wp-lede">{P.tagline}</p>
          <div className="wp-trigger__grid">
            <figure className="wp-first" data-plane="0.28">
              <div className="wp-mount">
                <div className="wp-win wp-win--static">
                  <FirstFrame />
                </div>
              </div>
              <figcaption className="wp-meta">
                <span className="wp-meta__no">00</span>
                <span className="wp-meta__name">
                  Red deer<i className="wp-bino">Cervus elaphus</i>
                </span>
                <span className="wp-meta__exif">02:11:44 · IR 850 nm · first exposure</span>
              </figcaption>
            </figure>
            <div className="wp-trigger__note" data-plane="0.46">
              <p className="wp-body">{CS.problem}</p>
              <p className="wp-body wp-body--dim">{CS.dataset}</p>
            </div>
          </div>
        </header>

        {/* ── the lens ─────────────────────────────────────────────────── */}
        <section className="wp-sec wp-intro" aria-labelledby="wp-lens-h">
          <h2 className="wp-h2" id="wp-lens-h">
            Carry the lens
          </h2>
          <div className="wp-intro__grid">
            <p className="wp-body wp-body--lead">
              There are no bounding boxes anywhere in the data, so the model was never told
              where to look, and neither are you. Move the pointer across a frame: inside the
              lens the frame shows the Captum attribution the classifier produced, outside it
              the raw infrared. Click any frame to pin its attribution open.
            </p>
            <p className="wp-body wp-body--dim">
              {CS.approach}
            </p>
          </div>
          <div className="wp-hint" aria-hidden="true">
            <span />
          </div>
        </section>

        {/* ── contact sheet i ──────────────────────────────────────────── */}
        <section className="wp-sec wp-sheetsec" aria-labelledby="wp-sheet-h">
          <h2 className="wp-h2" id="wp-sheet-h">
            Contact sheet i — 02:11 to 03:19
          </h2>
          <div className="wp-sheet" ref={sheetRef}>
            <svg className="wp-leaders" ref={leadRef} data-plane="0.37" aria-hidden="true" />
            <div className="wp-grid" data-plane="0.14" data-diff>
              {SHEET.map((c, i) =>
                c.spec.sp === null ? (
                  <div key={c.no} data-anchor="empty">
                    <EmptyMount no={c.no} time={c.time} label="no subject resolved" />
                  </div>
                ) : (
                  <div key={c.no} data-anchor={`f${i}`}>
                    <Cell
                      spec={c.spec}
                      no={c.no}
                      time={c.time}
                      common={c.common}
                      bino={c.bino}
                      alt={c.alt}
                      w={TILE_W}
                      h={TILE_H}
                      reg={reg}
                    />
                  </div>
                ),
              )}
            </div>
            <div className="wp-notes" data-plane="0.46">
              <p className="wp-note" data-lead="f0" data-ax="0.66" data-ay="0.5">
                <span className="wp-note__n">01</span>
                Frame intake. Camera-trap images resized to{' '}
                <b className="wp-fig">{R[4].v}</b> and normalised with ImageNet statistics
                (mean 0.485/0.456/0.406, std 0.229/0.224/0.225).
              </p>
              <p className="wp-note" data-lead="f3" data-ax="0.34" data-ay="0.62">
                <span className="wp-note__n">02</span>
                EfficientNet-B3 is the primary backbone, with ViT-B/16 via timm and
                Inception-V3 as alternates, plus an EnsembleModel concatenating the
                EfficientNet and ViT feature outputs. Predictions map through
                class_mapping.json to <b className="wp-fig">{R[2].v}</b> species.
              </p>
              <p className="wp-note" data-lead="empty" data-ax="0.5" data-ay="0.5">
                <span className="wp-note__n">03</span>
                A trigger with nothing on the other side of it. The sheet keeps the mount
                anyway — the log records the fire, not the animal.
              </p>
              <p className="wp-note" data-lead="f9" data-ax="0.44" data-ay="0.44">
                <span className="wp-note__n">04</span>
                {CS.challenges![2]}
              </p>
            </div>
          </div>
        </section>

        {/* ── no bounding boxes ───────────────────────────────────────── */}
        <section className="wp-sec wp-nobox" aria-labelledby="wp-nobox-h">
          <h2 className="wp-h2" id="wp-nobox-h">
            Nothing was ever drawn around them
          </h2>
          <div className="wp-nobox__grid">
            <div className="wp-mount wp-mount--wide">
              <div className="wp-win wp-win--static">
                <canvas
                  ref={noboxIR}
                  className="wp-ir"
                  role="img"
                  aria-label="Infrared camera-trap frame: a red deer centre-right in dense foliage. No bounding box is drawn around it, because the dataset carries none."
                />
                <svg className="wp-bb" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                  {BOXES.map((b, i) => (
                    <rect
                      key={i}
                      x={b.x}
                      y={b.y}
                      width={b.w}
                      height={b.h}
                      style={
                        {
                          '--l': `${2 * (b.w + b.h)}`,
                          animationDelay: `${i * 0.42}s`,
                        } as CSSProperties
                      }
                    />
                  ))}
                </svg>
              </div>
            </div>
            <div className="wp-nobox__note" data-plane="0.46">
              <p className="wp-body">{CS.challenges![0]}</p>
              <p className="wp-body wp-body--dim">
                A rectangle can be drawn, and it can be un-drawn, and the label file is the
                same either way. What stands in for the box is the attribution map — which
                is why six of them are computed, and why the disagreement between them is
                treated as a signal rather than noise.
              </p>
            </div>
          </div>
        </section>

        {/* ── plate: Leopardus pardalis ───────────────────────────────── */}
        <Plate
          spec={PLATE_OCELOT}
          reg={reg}
          common="Ocelot"
          bino="Leopardus pardalis"
          alt="Full-width infrared camera-trap frame: an ocelot in the right half of the frame, low, half-lit by the flash, canopy behind."
          side="left"
          caption="A conservation priority and, in a long-tailed set, one of the classes with the fewest frames to learn from."
        />

        {/* ── six attributions disagree ───────────────────────────────── */}
        <section className="wp-six" ref={sixRef} aria-labelledby="wp-six-h">
          <div className="wp-six__stick">
            <div className="wp-six__frame">
              <div className="wp-mount wp-mount--wide">
                <div className="wp-win wp-win--static">
                  <canvas
                    ref={studyIR}
                    className="wp-ir"
                    role="img"
                    aria-label="Infrared camera-trap frame used as the attribution study: an ocelot right of centre in heavy foliage."
                  />
                  {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                    <canvas
                      key={i}
                      ref={(n) => {
                        sixLayers.current[i] = n;
                      }}
                      className="wp-six__layer"
                      aria-hidden="true"
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="wp-six__side">
              <h2 className="wp-h2" id="wp-six-h">
                Six methods, six answers
              </h2>
              <ol className="wp-six__list">
                {METHODS.map((m, i) => (
                  <li
                    key={m}
                    ref={(n) => {
                      sixLabels.current[i] = n;
                    }}
                  >
                    <span className="wp-six__i">{String(i + 1).padStart(2, '0')}</span>
                    {m}
                  </li>
                ))}
                <li
                  ref={(n) => {
                    sixLabels.current[6] = n;
                  }}
                  className="wp-six__all"
                >
                  <span className="wp-six__i">Σ</span>
                  all six at once — solid where they agree, a ghost where they do not
                </li>
              </ol>
              <p className="wp-body wp-body--dim">
                <b className="wp-fig">{R[3].v}</b> {R[3].k}. {CS.pipeline[2].body}
              </p>
            </div>
          </div>
        </section>

        <section className="wp-sec wp-cmp" aria-labelledby="wp-cmp-h">
          <h2 className="wp-h2 wp-h2--small" id="wp-cmp-h">
            The multi-technique comparison view, standing still
          </h2>
          <ul className="wp-cmp__grid">
            {METHODS.map((m, i) => (
              <li key={m}>
                <div className="wp-mount wp-mount--tight">
                  <div className="wp-win wp-win--static">
                    <canvas
                      ref={(n) => {
                        cmpIR.current[i] = n;
                      }}
                      className="wp-ir"
                      role="img"
                      aria-label={`The attribution study frame with the ${m} heat map composited over it.`}
                    />
                    <canvas
                      ref={(n) => {
                        cmpHeat.current[i] = n;
                      }}
                      className="wp-cmp__heat"
                      aria-hidden="true"
                    />
                  </div>
                </div>
                <p className="wp-cmp__label">{m}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* ── the long tail ───────────────────────────────────────────── */}
        <section className="wp-sec wp-tail" aria-labelledby="wp-tail-h" ref={railWrap}>
          <h2 className="wp-h2" id="wp-tail-h">
            The tail is the point
          </h2>
          <div className="wp-tail__head">
            <p className="wp-body">{CS.challenges![1]}</p>
            <p className="wp-body wp-body--dim">
              <b className="wp-fig">{R[2].v}</b> classes in class_mapping.json. Nineteen are
              named in the dataset note; the twentieth is not, so it is not named here. The
              axis below is illustrative — no per-class counts ship with the mapping.
            </p>
          </div>
          <div className="wp-rail" ref={railRef}>
            {SPECIES.map((s, i) => {
              const t = i / (SPECIES.length - 1);
              return (
                <div className="wp-rail__col" key={s.bino} style={{ opacity: 1 - t * 0.7 }}>
                  <span
                    className="wp-rail__bar"
                    style={{ height: `${Math.round(122 * Math.pow(1 - t, 1.9) + 6)}px` }}
                    aria-hidden="true"
                  />
                  <span className="wp-rail__common">{s.common}</span>
                  <i className="wp-bino wp-rail__bino">{s.bino}</i>
                </div>
              );
            })}
          </div>
          <p className="wp-tail__axis" aria-hidden="true">
            <span>dense</span>
            <span>sparse — and the conservation priority</span>
          </p>
        </section>

        {/* ── plate: Sus scrofa ───────────────────────────────────────── */}
        <Plate
          spec={PLATE_BOAR}
          reg={reg}
          common="Wild boar"
          bino="Sus scrofa"
          alt="Full-width infrared camera-trap frame: a wild boar in the left half of the frame, head low, shoulder caught by the flash."
          side="right"
          caption="Not rare. Dangerous at close range — which is the reason the deliverable is a handling protocol and not a class index."
        />

        {/* ── terrain and hazard ──────────────────────────────────────── */}
        <section className="wp-sec wp-terr" ref={terrRef} aria-labelledby="wp-terr-h">
          <h2 className="wp-h2" id="wp-terr-h">
            Terrain, and what to do about it
          </h2>
          <div className="wp-terr__grid">
            <div className="wp-terr__map">
              <svg viewBox="0 0 960 600" aria-hidden="true">
                <g className="wp-terr__a">
                  {terrainA.map((d, i) => (
                    <path key={i} d={d} style={{ opacity: 0.2 + i * 0.045 }} />
                  ))}
                </g>
                <g className="wp-terr__b" ref={terrB}>
                  {terrainB.map((d, i) => (
                    <path key={i} d={d} pathLength={100} style={{ opacity: 0.24 + i * 0.05 }} />
                  ))}
                </g>
                <g className="wp-haz" ref={hazRef}>
                  <circle cx="0" cy="0" r="70" />
                  <circle cx="0" cy="0" r="140" />
                  <circle cx="0" cy="0" r="215" />
                  <circle cx="0" cy="0" r="290" />
                </g>
                <g className="wp-terr__pin">
                  <circle cx="560" cy="330" r="4" />
                  <path d="M560 330 L700 214" />
                  <text x="706" y="211">
                    detection · 02:12:09
                  </text>
                </g>
              </svg>
            </div>
            <div className="wp-terr__note" data-plane="0.46">
              <p className="wp-note wp-note--free">
                <span className="wp-note__n">04</span>
                {CS.pipeline[3].body}
              </p>
              <p className="wp-note wp-note--free">
                <span className="wp-note__n">05</span>
                {CS.pipeline[4].body}
              </p>
              <p className="wp-body wp-body--dim">{CS.challenges![3]}</p>
            </div>
          </div>
        </section>

        {/* ── the notebook ────────────────────────────────────────────── */}
        <section className="wp-sec wp-nb" aria-labelledby="wp-nb-h">
          <div className="wp-nb__page" ref={noteWrapRef}>
            <svg className="wp-leaders wp-leaders--nb" ref={noteLeadRef} aria-hidden="true" />
            <h2 className="wp-h2 wp-h2--nb" id="wp-nb-h">
              Field notebook — what is not in the repository
            </h2>
            <p className="wp-nb__body">{CS.honest}</p>
            <ul className="wp-nb__list">
              <li>
                <s>install.py</s> documented in the README, not committed
              </li>
              <li>
                <s>analyze_wildlife.py</s> documented, not committed
              </li>
              <li>
                <s>integrate_markdown_report.py</s> documented, not committed
              </li>
              <li>
                <s>requirements.txt</s> documented, not committed
              </li>
              <li>
                <s>report_templates/</s> documented, not committed
              </li>
              <li
                className="wp-nb__lead"
                data-lead="nbempty"
                data-ax="0.5"
                data-ay="0.5"
              >
                <s>sample attribution images</s> none committed — a real gap for a project
                whose selling point is visual explainability
              </li>
              <li className="wp-nb__ok">
                wildlife_classifier_best.pth <em>present</em> — the maps can be regenerated
              </li>
            </ul>
            <div className="wp-nb__strip">
              {NOTE_STRIP.map((s, i) => (
                <Cell
                  key={i}
                  spec={s}
                  no={i === 0 ? 'a' : 'b'}
                  time={i === 0 ? '02:11:46' : '02:18:20'}
                  common={i === 0 ? 'Red fox' : 'European hare'}
                  bino={i === 0 ? 'Vulpes vulpes' : 'Lepus europaeus'}
                  alt={
                    i === 0
                      ? 'Infrared camera-trap frame: a red fox centred, close to the lens.'
                      : 'Infrared camera-trap frame: a European hare left of centre, smeared by motion.'
                  }
                  w={TILE_W}
                  h={TILE_H}
                  reg={reg}
                  variant="strip"
                />
              ))}
              <div data-anchor="nbempty">
                <EmptyMount no="c" time="—" label="attribution sample" id="wp-nb-empty" />
              </div>
            </div>
          </div>
        </section>

        {/* ── the trap resets ─────────────────────────────────────────── */}
        <footer className="wp-reset" ref={resetRef}>
          <h2 className="wp-h2" id="wp-reset-h">
            The trap resets
          </h2>
          <dl className="wp-figs">
            {R.map((m) => (
              <div key={m.k}>
                <dt className="wp-fig wp-fig--big">{m.v}</dt>
                <dd>
                  {m.k}
                  {m.note ? <em> · {m.note}</em> : null}
                </dd>
              </div>
            ))}
          </dl>
          <div className="wp-reset__grid">
            <div>
              <h3 className="wp-h3">Carried in the box</h3>
              <ul className="wp-stack">
                {CS.stack.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="wp-h3">Where it lives</h3>
              <p className="wp-links">
                <a href={CS.repo} target="_blank" rel="noreferrer">
                  {CS.repo.replace('https://github.com/', 'github.com/')}
                </a>
              </p>
              <p className="wp-body wp-body--dim">
                Every frame on this page was computed in the browser from a seed — seeded
                value-noise foliage, a hand-authored silhouette, infrared falloff from a
                flash origin and per-pixel grain, with a matching attribution field. No
                photograph is used, and none of the frames are from the dataset.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

/* ── the very first frame, which arrives overexposed and settles ────────── */
function FirstFrame() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const live = { ok: true };
    paintInto(live, ref.current, 760, 428, () =>
      makeIR('first', SHEET[0].spec, 760, 428),
    );
    return () => {
      live.ok = false;
    };
  }, []);
  return (
    <canvas
      ref={ref}
      className="wp-ir wp-ir--first"
      role="img"
      aria-label="The first infrared camera-trap frame of the night: a red deer standing side-on right of centre, antlers clear of the canopy, the left of the frame lost to flash falloff."
    />
  );
}

/* ── a full-bleed species plate ─────────────────────────────────────────── */
function Plate({
  spec,
  reg,
  common,
  bino,
  alt,
  side,
  caption,
}: {
  spec: FrameSpec;
  reg: (h: Handle | null) => void;
  common: string;
  bino: string;
  alt: string;
  side: 'left' | 'right';
  caption: string;
}) {
  const winRef = useRef<HTMLButtonElement>(null);
  const irRef = useRef<HTMLCanvasElement>(null);
  const heatRef = useRef<HTMLCanvasElement>(null);
  const hRef = useRef<Handle | null>(null);
  const [pin, setPin] = useState(false);

  useEffect(() => {
    const live = { ok: true };
    const win = winRef.current;
    const heat = heatRef.current;
    if (!win || !heat) return;
    const h: Handle = { win, heat, exp: win, ready: false, t: -1, pinned: false };
    hRef.current = h;
    reg(h);
    const key = `pl${spec.seed}`;
    paintInto(live, irRef.current, PLATE_W, PLATE_H, () => makeIR(key, spec, PLATE_W, PLATE_H), () => {
      h.ready = true;
    });
    paintInto(live, heat, PLATE_W >> 1, PLATE_H >> 1, () =>
      makeHeat(`${key}h`, spec, -1, PLATE_W >> 1, PLATE_H >> 1),
    );
    return () => {
      live.ok = false;
      reg(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className={`wp-plate wp-plate--${side}`}>
      <div className="wp-plate__win">
        <button
          type="button"
          ref={winRef}
          className="wp-win wp-win--plate"
          aria-pressed={pin}
          onClick={() => {
            const n = !pin;
            setPin(n);
            if (hRef.current) {
              hRef.current.pinned = n;
              hRef.current.heat.classList.toggle('is-open', n);
            }
          }}
        >
          <canvas ref={irRef} className="wp-ir" role="img" aria-label={alt} />
          <canvas ref={heatRef} className="wp-heat" aria-hidden="true" />
          <span className="wp-win__sr">
            {pin ? 'Hide' : 'Show'} the model attribution for the {common} plate
          </span>
        </button>
      </div>
      <h2 className="wp-plate__bino">
        <i>{bino}</i>
      </h2>
      <p className="wp-plate__cap" data-plane="0.46">
        <span className="wp-plate__common">{common}</span>
        {caption}
      </p>
    </section>
  );
}
