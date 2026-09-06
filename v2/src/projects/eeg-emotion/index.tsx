/* ══════════════════════════════════════════════════════════════════════════
   eeg-emotion — "Paper"                    concept: docs/design/eeg-emotion.md

   A chart recorder. Vertical scroll drives the paper transport sideways; the
   pen stays where it is. The traces are pre-drawn and revealed by a single
   clip rect that follows the pen, so 70 polylines cost one attribute write per
   frame instead of 70 style writes.

   The two rigs never merge, because the project does not fuse them.
   ══════════════════════════════════════════════════════════════════════════ */
import { useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import BackLink from '@/projects/_shared/BackLink';
import { usePageShell, raf, clamp01 } from '@/projects/_shared/page';
import { prefersReduced } from '@/projects/_shared/reduced';
import { projects } from '@/data/content';
import { caseStudies } from '@/data/casestudies';
import { trace, needle, DREAMER_CH, tornEdge } from './traces';
import './paper.css';

const P = projects.find((x) => x.slug === 'eeg-emotion')!;
const CS = caseStudies['eeg-emotion'];

/* paper coordinates: the SVG viewBox is 7400 wide, matching 740vw of paper */
const PW = 7400;
const LANE_A_H = 300;
const LANE_B_H = 230;

const VAD = [
  { k: 'valence', v: 98.6 },
  { k: 'arousal', v: 96.6 },
  { k: 'dominance', v: 95.7 },
];

/* the pen sits at 58% of the viewport; everything left of it has been written */
const PEN = 0.58;

export default function Paper() {
  usePageShell({
    title: `${P.title} — Paper`,
    bg: '#f6ede6',
    ink: '#151a2e',
    accent: '#22357a',
    scope: 'pj-paper',
  });

  const stripRef = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  const clipA = useRef<SVGRectElement>(null);
  const clipB = useRef<SVGRectElement>(null);
  const needles = useRef<(SVGLineElement | null)[]>([]);
  const vals = useRef<(HTMLElement | null)[]>([]);
  const calL = useRef<HTMLElement>(null);
  const calR = useRef<HTMLElement>(null);
  const calV = useRef<HTMLElement>(null);
  const stampRef = useRef<HTMLDivElement>(null);
  const reportRef = useRef<HTMLElement>(null);

  const laneA = useMemo(
    () => DREAMER_CH.map((_, i) => trace(101 + i * 37, PW, LANE_A_H, 900, 0.34)),
    []
  );
  /* 56 passive sensors at 200 Hz — drawn thinner, denser, on the second sheet */
  const laneB = useMemo(
    () => Array.from({ length: 56 }, (_, i) => trace(9001 + i * 53, PW, LANE_B_H, 420, 0.26)),
    []
  );
  const torn = useMemo(() => tornEdge(77, 46, 24), []);

  useEffect(() => {
    const reduced = prefersReduced();
    const strip = stripRef.current;
    const paper = paperRef.current;
    if (!strip || !paper) return;

    const setStamp = () => {
      const r = reportRef.current?.getBoundingClientRect();
      if (r && r.top < window.innerHeight * 0.62) stampRef.current?.classList.add('hit');
    };

    if (reduced) {
      /* the whole roll is already printed; the reader drives it with the
         scrollbar and nothing animates */
      clipA.current?.setAttribute('width', String(PW));
      clipB.current?.setAttribute('width', String(PW));
      VAD.forEach((d, i) => {
        needles.current[i]?.setAttribute('transform', `rotate(${-60 + (d.v / 100) * 120})`);
        const el = vals.current[i];
        if (el) el.textContent = d.v.toFixed(1) + '%';
      });
      if (calR.current) calR.current.style.transform = 'translateX(300px)';
      if (calV.current) calV.current.textContent = '9.78 ms';
      stampRef.current?.classList.add('hit');
      return;
    }

    let lastDrawn = -1;
    return raf(() => {
      const vw = window.innerWidth;
      const r = strip.getBoundingClientRect();
      const travel = paper.offsetWidth - vw;
      const p = clamp01(-r.top / Math.max(1, r.height - window.innerHeight));

      /* a stepper motor, not a servo: the transport advances in 3 px notches */
      const x = -Math.round((p * travel) / 3) * 3;
      paper.style.transform = `translate3d(${x}px,0,0)`;

      /* everything to the left of the pen has been written */
      const drawn = ((-x + vw * PEN) / paper.offsetWidth) * PW;
      if (Math.abs(drawn - lastDrawn) > 2) {
        lastDrawn = drawn;
        clipA.current?.setAttribute('width', String(Math.max(0, drawn)));
        clipB.current?.setAttribute('width', String(Math.max(0, drawn - PW * 0.19)));
      }

      /* the three galvanometers, settling as their station crosses the pen */
      const gp = clamp01((p - 0.395) / 0.075);
      VAD.forEach((d, i) => {
        const t = needle(clamp01((gp - i * 0.1) / 0.7));
        const ang = -60 + (d.v / 100) * 120 * t;
        needles.current[i]?.setAttribute('transform', `rotate(${ang.toFixed(2)})`);
        const el = vals.current[i];
        if (el) el.textContent = (d.v * t).toFixed(1) + '%';
      });

      /* the calipers measure 9.78 ms across the grid */
      const cp = clamp01((p - 0.665) / 0.06);
      if (calR.current) calR.current.style.transform = `translateX(${(cp * 300).toFixed(1)}px)`;
      if (calV.current) calV.current.textContent = (cp * 9.78).toFixed(2) + ' ms';

      setStamp();
    });
  }, []);

  return (
    <div className="pp">
      <BackLink label="index" />

      {/* ── the transport ── */}
      <section className="pp-strip" ref={stripRef} aria-label="Chart recorder output">
        <div className="pp-stick">
          <div className="pp-paper" ref={paperRef}>
            <div className="pp-grid" aria-hidden />
            <div className="pp-sheetb" aria-hidden />

            <div className="pp-rail">
              <span>
                <b>{P.title.toLowerCase()}</b>
              </span>
              <span>eeg emotion + error-related potentials</span>
              <span>sheet 1 · continuous</span>
              <span>dreamer 14 ch @ 128 hz</span>
              <span>inria bci 56 ch @ 200 hz</span>
              <span>ieee icbsii 2025 · best paper · first author</span>
            </div>

            {/* lane a — DREAMER, 14 channels */}
            <div className="pp-lane pp-lane--a" aria-hidden>
              <svg viewBox={`0 0 ${PW} ${LANE_A_H}`} preserveAspectRatio="none">
                <defs>
                  <clipPath id="pp-clip-a">
                    <rect ref={clipA} x="0" y="0" width="0" height={LANE_A_H} />
                  </clipPath>
                </defs>
                <g clipPath="url(#pp-clip-a)">
                  {laneA.map((d, i) => (
                    <path key={i} d={d} transform={`translate(0 ${(i - 6.5) * 8})`} />
                  ))}
                </g>
              </svg>
            </div>

            {/* lane b — INRIA BCI, a physically different sheet */}
            <div className="pp-lane pp-lane--b" aria-hidden>
              <svg viewBox={`0 0 ${PW} ${LANE_B_H}`} preserveAspectRatio="none">
                <defs>
                  <clipPath id="pp-clip-b">
                    <rect ref={clipB} x="0" y="0" width="0" height={LANE_B_H} />
                  </clipPath>
                </defs>
                <g clipPath="url(#pp-clip-b)">
                  {laneB.map((d, i) => (
                    <path key={i} d={d} transform={`translate(0 ${(i - 27.5) * 3.4})`} />
                  ))}
                </g>
              </svg>
            </div>

            {/* ── stations along the roll ── */}
            <div className="pp-st" style={{ left: '4vw' }}>
              <h1>{P.title}</h1>
              <p className="pp-sub">{P.tagline}.</p>
              <p>
                A headset produces fourteen channels at 128&nbsp;Hz and a
                classifier turns them into a valence/arousal/dominance triple.
                To the person wearing it, that is not information. The work this
                page is about is the translation — from ink on paper to a
                sentence someone can act on.
              </p>
              <p className="pp-read">the roll runs left. the pen stays where it is.</p>
            </div>

            <div className="pp-st" style={{ left: '100vw' }}>
              <h2>Fourteen channels, and nothing legible</h2>
              <p>{CS.problem}</p>
            </div>

            <div className="pp-st" style={{ left: '200vw' }}>
              <h2>Two rigs, two papers</h2>
              <p>{CS.dataset}</p>
              <p className="pp-read pp-read--g">
                the sheets never merge. specialist models per dataset, correlated
                at the report layer — where cross-signal reasoning can be stated
                in language and inspected.
              </p>
            </div>

            <div className="pp-st" style={{ left: '304vw' }}>
              <h2>Three pens, one subject</h2>
              <p>
                Valence, arousal and dominance are predicted jointly as one
                multi-output problem rather than as three independent models, so
                the three dimensions stay internally consistent for one person.
              </p>
              <div className="pp-gauges">
                {VAD.map((d, i) => (
                  <div className="pp-gauge" key={d.k}>
                    <svg viewBox="0 0 120 70" aria-hidden>
                      <path className="pp-gauge__arc" d="M8 66 A 56 56 0 0 1 112 66" />
                      <g transform="translate(60 66)">
                        <line
                          className="pp-gauge__needle"
                          ref={(el) => { needles.current[i] = el; }}
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="-50"
                        />
                      </g>
                    </svg>
                    <b className="pp-gauge__v" ref={(el) => { vals.current[i] = el; }}>
                      0.0%
                    </b>
                    <span className="pp-gauge__k">{d.k}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pp-st" style={{ left: '408vw' }}>
              <h2>The second pen</h2>
              <p>{CS.pipeline[3].body}</p>
              <p className="pp-read pp-read--g">
                cnn-bilstm · 64 → 128 → 256 · 3-layer bidirectional lstm · 8 heads
                · adamw 1e-3 · cosine annealing · 80/20 at seed 42
              </p>
            </div>

            <div className="pp-st" style={{ left: '512vw' }}>
              <h2>Measured on the grid</h2>
              <p>
                The transport runs at true speed for a moment and the calipers
                drop. Under ten milliseconds is what lets this run continuously
                against a live headset instead of in batch.
              </p>
              <div className="pp-cal" aria-hidden>
                <i ref={calL} style={{ left: 0 }} />
                <i ref={calR} style={{ left: 0 }} />
                <b ref={calV}>0.00 ms</b>
              </div>
            </div>

            <div className="pp-st" style={{ left: '600vw' }}>
              <h2>What the machine says</h2>
              <p>{CS.pipeline[4].body}</p>
              <p className="pp-sub">{CS.pipeline[5].body}</p>
            </div>

            {/* margin annotations */}
            <div
              className="pp-margin"
              style={{ left: '212vw', top: 'calc(64px + 30vh + 23vh + 300px)' }}
            >
              <b>margin · why they stay apart</b>
              Different electrode counts, sampling rates and label semantics.
              Fusing the raw signals would pretend they are the same measurement.
              Separate conditioning paths — dreamerpre.py, bcipre.py — normalise
              each rig before any model sees it.
            </div>

            <div
              className="pp-margin pp-margin--pencil"
              style={{ left: '626vw', top: 'calc(64px + 30vh + 23vh + 286px)' }}
            >
              <b>red pencil · read this before the repo</b>
              The accuracy and latency figures come from the published paper. The
              scripts in the public repo are an earlier, simpler version: the
              DREAMER branch trains and predicts over the same CSV with no
              held-out split, and <s>testdr.py</s> prints a single sample
              prediction rather than an evaluation. The ERP branch does use a
              proper 80/20 split. Read the repo as an artefact of the work, not
              as the paper reproduction.
            </div>

            {/* the pen */}
            <div className="pp-pen" style={{ left: `${PEN * 100}vw` }} aria-hidden>
              <div className="pp-arm" />
            </div>
          </div>
        </div>
      </section>

      {/* ── the report tears off ── */}
      <section className="pp-report" ref={reportRef} style={{ clipPath: torn }}>
        <div className="pp-stamp" ref={stampRef} aria-hidden>
          BEST PAPER
          <small>IEEE ICBSII 2025 · SSN Chennai</small>
        </div>
        <div className="pp-report__in">
          <h2>Clinical report</h2>
          <p>
            The paper stops. What comes off the end of it is not a tensor — it is
            a document covering emotional state, cognitive load, rest and dietary
            guidance, and when to see a clinician. {CS.approach}
          </p>

          <h3>figures</h3>
          <div className="pp-figs">
            {CS.results.map((m) => (
              <div key={m.k}>
                <b>{m.v}</b>
                <span>{m.k}</span>
              </div>
            ))}
          </div>

          <h3>what was difficult</h3>
          <ul>
            {CS.challenges!.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>

          <h3>instrumentation</h3>
          <p className="pp-stackline">{CS.stack.join(' · ')}</p>

          <div className="pp-links">
            <a href={CS.repo} target="_blank" rel="noopener noreferrer">
              repository
            </a>
            {CS.paper && (
              <a href={CS.paper} target="_blank" rel="noopener noreferrer">
                doi 10.1109/ICBSII65145.2025.11013139
              </a>
            )}
            <Link to="/work/dravidian-sentiment">next: a wall of Tamil posters</Link>
            <Link to="/">back to the index</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
