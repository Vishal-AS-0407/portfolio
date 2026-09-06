/* ══════════════════════════════════════════════════════════════════════════
   baby-cry — "Night Shift"                    concept: docs/design/baby-cry.md

   One night, told in timestamps, over a live spectrogram. The page owns its
   own rAF loop; it never touches the landing page's scroll bus, its chrome, or
   any of its components. Arrival is a *bloom* — scale + blur resolving, held
   at its maximum so nothing ever un-reads — because "content, fading up" is
   the one gesture this rebuild exists to get rid of.
   ══════════════════════════════════════════════════════════════════════════ */
import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import BackLink from '@/projects/_shared/BackLink';
import { usePageShell, raf, clamp01, lerp } from '@/projects/_shared/page';
import { prefersReduced } from '@/projects/_shared/reduced';
import { projects } from '@/data/content';
import { caseStudies } from '@/data/casestudies';
import Spectro, { type SpectroState } from './Spectro';
import { FeatureField, SmoteField, FAMILIES, TOTAL } from './Panels';
import './night.css';

const P = projects.find((x) => x.slug === 'baby-cry')!;
const CS = caseStudies['baby-cry'];

/* 22:40 → 06:12 is 452 minutes of night, mapped onto the scroll */
const T0 = 22 * 60 + 40;
const SPAN = 452;
const hhmm = (min: number) => {
  const m = ((Math.round(min) % 1440) + 1440) % 1440;
  return `${String((m / 60) | 0).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
};

/* the Butterworth band, as a fraction of an 8 kHz axis */
const LO_HZ = 142.91;
const HI_HZ = 6620.12;
const LO_N = LO_HZ / 8000;
const HI_N = HI_HZ / 8000;

const NOTES: { t: string; body: string }[] = [
  { t: '01:44', body: CS.challenges![0] },
  { t: '02:22', body: CS.challenges![1] },
  { t: '03:05', body: CS.challenges![2] },
  { t: '05:10', body: CS.challenges![3] },
];

const LIME = [
  { k: 'mfcc_3 mean', v: 0.31 },
  { k: 'spectral contrast b2 std', v: 0.24 },
  { k: 'mfcc_1 kurtosis', v: 0.18 },
  { k: 'rms energy max', v: 0.15 },
  { k: 'tonnetz_4 skew', v: 0.12 },
];

export default function NightShift() {
  usePageShell({
    title: `${P.title} — Night Shift`,
    bg: '#0e1524',
    ink: '#e9f0ff',
    accent: '#ffc15e',
    scope: 'pj-night',
  });

  const sp = useRef<SpectroState>({ energy: 0, gate: 0, drain: 0, lo: 0, hi: 1 });
  const featP = useRef(0);
  const smoteP = useRef(0);

  const clockRef = useRef<HTMLDivElement>(null);
  const gateRef = useRef<HTMLDivElement>(null);
  const shutTop = useRef<HTMLDivElement>(null);
  const shutBot = useRef<HTMLDivElement>(null);
  const hzLo = useRef<HTMLSpanElement>(null);
  const hzHi = useRef<HTMLSpanElement>(null);
  const featRef = useRef<HTMLDivElement>(null);
  const smoteRef = useRef<HTMLDivElement>(null);
  const limeRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = prefersReduced();
    const root = rootRef.current;
    if (!root) return;

    /* every element that arrives does so by blooming: blur + scale resolving,
       held at its high-water mark so re-reading never re-blurs the page */
    const blooms = Array.from(root.querySelectorAll<HTMLElement>('.nw-bloom')).map((el) => ({
      el,
      max: 0,
      last: -1,
    }));

    if (reduced) {
      sp.current = { energy: 0.72, gate: 1, drain: 0, lo: LO_N, hi: HI_N };
      featP.current = 1;
      smoteP.current = 1;
      for (const b of blooms) {
        b.el.style.opacity = '1';
        b.el.style.filter = 'none';
        b.el.style.transform = 'none';
      }
      if (hzLo.current) hzLo.current.textContent = LO_HZ.toFixed(2);
      if (hzHi.current) hzHi.current.textContent = HI_HZ.toFixed(2);
      if (clockRef.current) clockRef.current.firstChild!.textContent = '03:47';
      limeRef.current?.classList.add('on');
      return;
    }

    let lastClock = '';
    return raf(() => {
      const vh = window.innerHeight;
      const doc = Math.max(1, document.documentElement.scrollHeight - vh);
      const p = clamp01(window.scrollY / doc);

      /* ── the clock ── */
      const t = hhmm(T0 + p * SPAN);
      if (t !== lastClock && clockRef.current) {
        lastClock = t;
        clockRef.current.firstChild!.textContent = t;
      }

      /* ── the shader's argument ── */
      const gateEl = gateRef.current;
      let gate = 0;
      if (gateEl) {
        const r = gateEl.getBoundingClientRect();
        gate = clamp01(-r.top / Math.max(1, r.height - vh));
        const close = clamp01((gate - 0.12) / 0.62);
        /* the shutters travel the full half-viewport and stop at the band edges */
        const topRest = -vh * 0.5 + vh * (1 - HI_N) * close;
        const botRest = vh * 0.5 - vh * LO_N * close;
        if (shutTop.current) shutTop.current.style.transform = `translate3d(0,${topRest.toFixed(1)}px,0)`;
        if (shutBot.current) shutBot.current.style.transform = `translate3d(0,${botRest.toFixed(1)}px,0)`;
        if (hzLo.current) hzLo.current.textContent = (LO_HZ * close).toFixed(2);
        if (hzHi.current) hzHi.current.textContent = lerp(8000, HI_HZ, close).toFixed(2);
      }

      const energy = clamp01((p - 0.015) / 0.16) * (1 - clamp01((p - 0.9) / 0.09) * 0.35);
      const drain = clamp01((p - 0.9) / 0.095);

      sp.current.energy = energy;
      sp.current.gate = clamp01((gate - 0.1) / 0.6);
      sp.current.drain = drain;
      sp.current.lo = LO_N;
      sp.current.hi = HI_N;

      /* ── the two canvases ── */
      const fr = featRef.current?.getBoundingClientRect();
      if (fr) featP.current = clamp01((vh * 0.92 - fr.top) / (fr.height + vh * 0.35));
      const sr = smoteRef.current?.getBoundingClientRect();
      if (sr) smoteP.current = clamp01((vh * 0.92 - sr.top) / (sr.height + vh * 0.3));

      /* ── the bloom ── */
      for (const b of blooms) {
        const r = b.el.getBoundingClientRect();
        if (r.bottom < -vh || r.top > vh * 1.6) continue;
        const v = clamp01((vh * 0.88 - r.top) / (vh * 0.42));
        if (v <= b.max) continue;
        b.max = v;
        if (Math.abs(v - b.last) < 0.004 && v < 1) continue;
        b.last = v;
        b.el.style.opacity = v.toFixed(3);
        if (v >= 0.999) {
          b.el.style.filter = '';
          b.el.style.transform = '';
          b.el.style.willChange = '';
        } else {
          b.el.style.filter = `blur(${((1 - v) * 11).toFixed(2)}px)`;
          b.el.style.transform = `scale(${(1 + (1 - v) * 0.035).toFixed(4)})`;
          b.el.style.willChange = 'opacity, filter, transform';
        }
      }

      /* the attribution bars grow once, when the verdict is on screen */
      const lr = limeRef.current;
      if (lr && !lr.classList.contains('on')) {
        const r = lr.getBoundingClientRect();
        if (r.top < vh * 0.8) lr.classList.add('on');
      }
    });
  }, []);

  return (
    <div className="nw" ref={rootRef}>
      <div className="nw-bed" aria-hidden />
      <Spectro stateRef={sp} />
      <div className="nw-scrim" aria-hidden />
      <div className="nw-open" aria-hidden />

      <div className="nw-clock" ref={clockRef} aria-hidden>
        22:40<i>the night shift</i>
      </div>

      <BackLink label="the index" />

      <main className="nw-flow">
        <header className="nw-ch">
          <span className="nw-time nw-bloom">22:40 <span>the house is quiet</span></span>
          <h1 className="nw-bloom">why my baby is crying</h1>
          <p className="nw-bloom">
            A caregiver at three in the morning cannot tell hunger from pain from
            tiredness, and the answer is time-critical. This is a night, and the
            only thing the model can hear is a band of energy between{' '}
            <strong>142.91</strong> and <strong>6620.12&nbsp;Hz</strong>.
          </p>
          <p className="nw-quiet nw-bloom">{P.tagline}. Real-time infant care assistant, ensemble signal processing, explainability, and a caregiver-facing app that answers in about a second.</p>
        </header>

        <section className="nw-ch" aria-labelledby="nw-problem">
          <span className="nw-time nw-bloom">01:12 <span>first wake</span></span>
          <h2 id="nw-problem" className="nw-bloom">It sounds like one sound.</h2>
          <p className="nw-bloom">{CS.problem}</p>
          <div className="nw-note nw-bloom">
            <b>{NOTES[0].t}</b>
            {NOTES[0].body}
          </div>
        </section>
      </main>

      <div className="nw-silence" aria-hidden />

      {/* ── the bandpass gate ── */}
      <section className="nw-gate" ref={gateRef} aria-labelledby="nw-band">
        <div className="nw-gate__stick">
          <div className="nw-shutter nw-shutter--t" ref={shutTop} aria-hidden />
          <div className="nw-shutter nw-shutter--b" ref={shutBot} aria-hidden />
          <div className="nw-hz">
            <span ref={hzLo}>0.00</span> — <span ref={hzHi}>8000.00</span> Hz
            <em id="nw-band">
              A pre-emphasis filter at alpha 0.97 lifts the high band. Then a
              fifth-order Butterworth bandpass throws away everything outside the
              infant-cry range. Tuning it to this band, rather than reusing a
              generic speech filter, is what recovered the signal from noisy
              recordings.
            </em>
          </div>
        </div>
      </section>

      <main className="nw-flow">
        <section className="nw-ch" aria-labelledby="nw-approach">
          <span className="nw-time nw-bloom">02:04 <span>what is left</span></span>
          <h2 id="nw-approach" className="nw-bloom">Everything else is room.</h2>
          <p className="nw-bloom">{CS.approach}</p>
          <p className="nw-quiet nw-bloom">
            Intake is WAV or MP3 at 16&nbsp;kHz, STFT at a 1024-point FFT, hop
            length 160, a 400-sample Hann window. {CS.dataset}
          </p>
          <div className="nw-note nw-bloom">
            <b>{NOTES[1].t}</b>
            {NOTES[1].body}
          </div>
        </section>
      </main>

      {/* ── 461 ── */}
      <section className="nw-bleed nw-ch--tight" ref={featRef} aria-labelledby="nw-feat">
        <div className="nw-plate">
          <FeatureField pRef={featP} />
        </div>
        <div className="nw-fam" aria-hidden>
          {FAMILIES.map(([k, n]) => (
            <span key={k}>
              {k} <b>{n}</b>
            </span>
          ))}
        </div>
        <p className="nw-plate__cap nw-bloom" id="nw-feat">
          <strong>{TOTAL}</strong> features per clip. Each family is aggregated by
          mean, standard deviation, skew, kurtosis, max and min before it reaches
          the classifier — a Random Forest, chosen over a deep model so that LIME
          can produce a per-class attribution a caregiver-facing product can
          actually show.
        </p>
      </section>

      <main className="nw-flow">
        <section className="nw-ch">
          <span className="nw-time nw-bloom">03:20 <span>the imbalance</span></span>
          <h2 className="nw-bloom">Most nights are the same night.</h2>
          <p className="nw-bloom">
            Infant cry corpora are small and heavily skewed, so a model learns the
            majority class and looks fine on paper. Labels are encoded, split at
            seed 12345, then SMOTE oversamples the minority classes along the
            lines between real neighbours until the training matrix is 1,525 × 461.
          </p>
          <div className="nw-note nw-bloom">
            <b>{NOTES[2].t}</b>
            {NOTES[2].body}
          </div>
        </section>
      </main>

      <section className="nw-bleed nw-ch--tight" ref={smoteRef} aria-hidden>
        <div className="nw-plate">
          <SmoteField pRef={smoteP} />
        </div>
      </section>

      {/* ── 03:47 ── */}
      <section className="nw-verdict" aria-labelledby="nw-verdict-h">
        <span className="nw-time nw-bloom">03:47 <span>the answer</span></span>
        <div className="nw-verdict__word nw-bloom" id="nw-verdict-h">
          hunger
        </div>
        <div className="nw-lime" ref={limeRef}>
          {LIME.map((l) => (
            <div className="nw-lime__row" key={l.k}>
              <span>{l.k}</span>
              <span className="nw-lime__track">
                <i
                  className="nw-lime__fill"
                  style={{ ['--w' as string]: `${l.v * 100}%` }}
                />
              </span>
              <span className="nw-lime__val">{l.v.toFixed(2)}</span>
            </div>
          ))}
        </div>
        <p className="nw-plate__cap nw-bloom" style={{ marginTop: '2.6rem' }}>
          The predicted cause is handed to Gemini 1.5 Flash, which writes the
          caregiver advice. Chat history is retained, so a follow-up question at
          04:10 still knows what happened at 03:47.
        </p>
      </section>

      <main className="nw-flow">
        <section className="nw-ch">
          <span className="nw-time nw-bloom">04:02 <span>what came back</span></span>
          <div className="nw-nums">
            {CS.results.map((m) => (
              <div className="nw-bloom" key={m.k}>
                <b>{m.v}</b>
                <span>
                  {m.k}
                  {m.note ? ` — ${m.note}` : ''}
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* ── the whisper ── */}
      <section className="nw-whisper" aria-labelledby="nw-honest">
        <div>
          <span className="nw-time nw-bloom" id="nw-honest">
            04:30 <span>said quietly</span>
          </span>
          <p className="nw-bloom">{CS.honest}</p>
        </div>
      </section>

      <main className="nw-flow nw-out">
        <section className="nw-ch">
          <span className="nw-time nw-bloom">05:10 <span>the last note</span></span>
          <div className="nw-note nw-bloom">
            <b>{NOTES[3].t}</b>
            {NOTES[3].body}
          </div>
        </section>

        <section className="nw-ch">
          <span className="nw-time nw-bloom">06:12 <span>quiet again</span></span>
          <h2 className="nw-bloom">Built from</h2>
          <p className="nw-stack nw-bloom">{CS.stack.join(' · ')}</p>
          <div className="nw-links nw-bloom">
            <a href={CS.repo} target="_blank" rel="noopener noreferrer">
              Source on GitHub
            </a>
            {CS.demo && (
              <a href={CS.demo} target="_blank" rel="noopener noreferrer">
                Try it live
              </a>
            )}
          </div>
          <div className="nw-else nw-bloom">
            <Link to="/work/eeg-emotion">Somewhere else tonight: EEG, and a machine that prints →</Link>
            <Link to="/">Back to the index →</Link>
          </div>
        </section>
      </main>
    </div>
  );
}
