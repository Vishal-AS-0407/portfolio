/* ══════════════════════════════════════════════════════════════════════════
   qubit-green-finance — "Allocation"    concept: docs/design/qubit-green-finance.md

   The only page on the site that snaps, the only one with an interactive
   keyboard-navigable data grid, and — outside the one isometric mechanism
   section between 09 and 10 — no canvas and no continuous animation loop. Every move is a clip-path wipe along a
   grid line, 140–260ms, cubic-bezier(.7,0,.2,1).

   Panel state is read from the deck's own scrollTop rather than from an
   IntersectionObserver: the deck is its own scroll container, so the active
   index is just round(scrollTop / panelHeight), and it stays exact through a
   snap instead of firing on a threshold.
   ══════════════════════════════════════════════════════════════════════════ */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import BackLink from '@/projects/_shared/BackLink';
import { usePageShell } from '@/projects/_shared/page';
import { prefersReduced } from '@/projects/_shared/reduced';
import { projects } from '@/data/content';
import { caseStudies } from '@/data/casestudies';
import Mechanism from '@/projects/_shared/Mechanism';
import {
  GOALS, AXES, buildMatrix, buildCandidates, allocate, fmtEsg, TERMS, BUDGET, FLOOR, CAP,
} from './sdg';
import { allocScene } from './mechanism';
import './allocation.css';

const P = projects.find((x) => x.slug === 'qubit-green-finance')!;
const CS = caseStudies['qubit-green-finance'];

export default function Allocation() {
  usePageShell({
    title: `${P.title} — Allocation`,
    bg: '#efeae0',
    ink: '#111111',
    accent: '#134e37',
    scope: 'pj-allocation',
  });

  const matrix = useMemo(buildMatrix, []);
  const cands = useMemo(buildCandidates, []);
  const result = useMemo(() => allocate(cands), [cands]);

  const deck = useRef<HTMLDivElement>(null);
  const panels = useRef<(HTMLElement | null)[]>([]);
  const [sel, setSel] = useState(-1);
  const [term, setTerm] = useState(0);
  const [floorOn, setFloorOn] = useState(prefersReduced());

  /* ── panel activation, straight off the deck's scrollTop ── */
  useEffect(() => {
    const d = deck.current;
    if (!d) return;
    let last = -1;
    const sync = () => {
      /* a panel is active once its top passes mid-deck; read off offsetTop, not
         a multiple of the panel height, because the mechanism section between
         09 and 10 is several screens tall */
      const y = d.scrollTop + d.clientHeight * 0.5;
      let i = 0;
      panels.current.forEach((p, k) => { if (p && p.offsetTop <= y) i = k; });
      if (i === last) return;
      last = i;
      panels.current.forEach((p, k) => p?.classList.toggle('on', k <= i));
      /* the bars below the floor drop the moment that panel is reached */
      if (i >= 6) setFloorOn(true);
    };
    sync();
    d.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    return () => {
      d.removeEventListener('scroll', sync);
      window.removeEventListener('resize', sync);
    };
  }, []);

  /* ── the matrix is operable from the keyboard ── */
  const onKey = (e: React.KeyboardEvent, i: number) => {
    const map: Record<string, number> = {
      ArrowRight: i + 3, ArrowLeft: i - 3, ArrowDown: i + 1, ArrowUp: i - 1,
    };
    const n = map[e.key];
    if (n === undefined) return;
    e.preventDefault();
    if (n < 0 || n >= 45) return;
    setSel(n);
    (document.querySelector(`[data-cell="${n}"]`) as HTMLElement | null)?.focus();
  };

  const selGoal = sel >= 0 ? (sel / 3) | 0 : -1;
  const selAxis = sel >= 0 ? sel % 3 : -1;
  const alloc = [...result.out.entries()];
  const deployed = alloc.reduce((a, [, v]) => a + v, 0);

  const panel = (i: number, cls: string, children: React.ReactNode) => (
    <section
      className={`al-panel ${cls}`}
      ref={(n) => { panels.current[i] = n; }}
      key={i}
      aria-label={`Panel ${i + 1} of 11`}
    >
      <span className="al-no">{String(i + 1).padStart(2, '0')} / 11</span>
      {children}
    </section>
  );

  return (
    <div className="al">
      <div className="al-press" aria-hidden>
        {Array.from({ length: 15 }, (_, i) => (
          <i key={i} style={{ animationDelay: `${i * 12}ms` }} />
        ))}
      </div>
      <BackLink label="index" />

      <div className="al-deck" ref={deck} data-scroller>
        {/* 01 — the grid asserts itself */}
        {panel(0, 'on', (
          <>
            <div className="al-cells" aria-hidden>
              {Array.from({ length: 45 }, (_, i) => (
                <i
                  key={i}
                  className={i === 14 || i === 32 ? 'keep' : undefined}
                  style={{
                    background: i % 7 === 0 ? '#134e37' : i % 5 === 0 ? '#e8c547' : 'transparent',
                    animationDelay: `${((i / 3) | 0) * 40}ms`,
                  }}
                />
              ))}
            </div>
            <div className="al-hero__sub al-wipe">
              <p className="al-lead" style={{ maxWidth: '38ch' }}>
                Twenty projects, one budget, fifteen goals, three axes. The
                temptation is to score everything and sort the list.
              </p>
            </div>
            <h1 className="al-hero al-wipe" data-d="2">
              This is not a ranking.
            </h1>
          </>
        ))}

        {/* 02 — the problem */}
        {panel(1, 'al-panel--ink', (
          <div className="al-hero" style={{ gridRow: '1 / 4', alignSelf: 'center' }}>
            <h2 className="al-wipe">A constrained optimisation</h2>
            <p className="al-lead al-wipe" data-d="1" style={{ marginTop: '1.4rem' }}>
              {CS.problem}
            </p>
            <p className="al-note al-wipe" data-d="2">
              The evidence is unstructured — project PDFs, supply-chain records,
              climate data, economic reports. CrewAI runs three specialists over
              it: document&nbsp;processor, ESG&nbsp;analyser, risk&nbsp;assessor.
            </p>
          </div>
        ))}

        {/* 03 — the live matrix */}
        {panel(2, '', (
          <div className="al-matrix" role="grid" aria-label="SDG impact matrix, 15 goals by 3 axes">
            <span />
            {GOALS.map((g, i) => (
              <span className="al-matrix__gl" key={g} title={g}>
                {String(i + 1).padStart(2, '0')}
              </span>
            ))}
            {AXES.map((ax, a) => (
              <div style={{ display: 'contents' }} key={ax}>
                <span className="al-matrix__ax">{ax}</span>
                {GOALS.map((g, gi) => {
                  const idx = gi * 3 + a;
                  const v = matrix[idx];
                  const under = v < FLOOR;
                  const lit =
                    sel === idx ? 'on' : selGoal === gi ? 'col' : selAxis === a ? 'row' : '';
                  return (
                    <button
                      key={g + ax}
                      type="button"
                      className="al-cell"
                      data-cell={idx}
                      data-lit={lit}
                      data-under={under ? '1' : '0'}
                      tabIndex={sel === idx || (sel === -1 && idx === 0) ? 0 : -1}
                      onFocus={() => setSel(idx)}
                      onMouseEnter={() => setSel(idx)}
                      onKeyDown={(e) => onKey(e, idx)}
                      aria-label={`SDG ${gi + 1} ${g}, ${ax}, ${fmtEsg(v)}${under ? ', below floor' : ''}`}
                    >
                      {fmtEsg(v).slice(1)}
                    </button>
                  );
                })}
              </div>
            ))}
            <p className="al-readout" aria-live="polite">
              {sel < 0 ? (
                <em>15 goals × 3 impact axes = 45 scores per project. Hover or arrow-key a cell.</em>
              ) : (
                <>
                  SDG {String(selGoal + 1).padStart(2, '0')} {GOALS[selGoal]} ×{' '}
                  {AXES[selAxis]} · <b>{fmtEsg(matrix[sel])}</b>{' '}
                  {matrix[sel] < FLOOR && <em>— below floor</em>}
                </>
              )}
            </p>
          </div>
        ))}

        {/* 04 — fifteen goals, sideways */}
        {panel(3, '', (
          <div className="al-band" tabIndex={0} aria-label="The fifteen goals, scroll sideways">
            {GOALS.map((g, i) => (
              <div className="al-goal" key={g}>
                <b>{String(i + 1).padStart(2, '0')}</b>
                <span>{g}</span>
              </div>
            ))}
          </div>
        ))}

        {/* 05 — three agents */}
        {panel(4, 'al-panel--forest', (
          <>
            <h2 className="al-wipe" style={{ gridColumn: '1 / 12', gridRow: '1 / 2', alignSelf: 'center' }}>
              Three agents, then a solver
            </h2>
            <div style={{ gridColumn: '1 / 16', gridRow: '2 / 4', display: 'flex', gap: 3, alignItems: 'stretch' }}>
              {[
                ['document_processor', 'parses the PDFs, supply-chain, climate and economic sources'],
                ['esg_analyzer', 'scores viability and ESG impact into the 15 × 3 matrix'],
                ['risk_assessor', 'produces the risk scalar the objective function penalises'],
              ].map(([k, v], i) => (
                <div
                  key={k}
                  className="al-wipe"
                  data-d={i + 1}
                  style={{
                    flex: 1, background: i === 1 ? '#e8c547' : '#111111',
                    color: i === 1 ? '#111111' : '#efeae0', padding: 'clamp(14px,1.6vw,26px)',
                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                  }}
                >
                  <b style={{ fontSize: 15 }}>{k}</b>
                  <span style={{ fontSize: 14, opacity: 0.86 }}>{v}</span>
                </div>
              ))}
            </div>
          </>
        ))}

        {/* 06 — the objective function */}
        {panel(5, '', (
          <div className="al-obj">
            {TERMS.map((t, i) => (
              <div
                key={t.k}
                className={`al-term ${term === i ? 'hot' : ''}`}
                onMouseEnter={() => setTerm(i)}
                onFocus={() => setTerm(i)}
                tabIndex={0}
              >
                <span className="al-term__k">{t.k}</span>
                {t.t}
                {term === i && <p className="al-term__n">{t.note}</p>}
              </div>
            ))}
          </div>
        ))}

        {/* 07 — the ESG floor */}
        {panel(6, '', (
          <>
            <h2 className="al-wipe" style={{ gridColumn: '1 / 11', gridRow: '1 / 2', alignSelf: 'start' }}>
              A floor, not a penalty
            </h2>
            <p className="al-note al-wipe" data-d="1" style={{ gridColumn: '11 / 16', gridRow: '1 / 2', alignSelf: 'start' }}>
              Below an ESG of {FLOOR.toFixed(2)} the allocation is forced to
              zero. Not reduced — zero. A high-return low-ESG project cannot buy
              its way into the portfolio. {result.cutByFloor} of 20 disappear at once.
            </p>
            <div className="al-bars">
              <div className="al-floor" style={{ bottom: `${FLOOR * 100}%` }}>
                <b>esg floor {FLOOR.toFixed(2)}</b>
              </div>
              {cands.map((c) => {
                const dead = floorOn && c.esg < FLOOR;
                return (
                  <div
                    key={c.id}
                    className="al-bar"
                    data-dead={dead ? '1' : '0'}
                    style={{ height: dead ? '0%' : `${c.esg * 100}%` }}
                  >
                    <span className="al-bar__id">{c.id}</span>
                  </div>
                );
              })}
            </div>
          </>
        ))}

        {/* 08 — the 40% cap */}
        {panel(7, 'al-panel--ink', (
          <>
            <h2 className="al-wipe" style={{ gridColumn: '1 / 12', gridRow: '1 / 2', alignSelf: 'center' }}>
              No project above {CAP * 100}%
            </h2>
            <div className="al-stack" style={{ gridRow: '2 / 3' }}>
              <div className="al-seg" style={{ width: `${CAP * 100}%` }}>
                capped at ${(BUDGET * CAP).toFixed(0)}
              </div>
              <div className="al-seg al-seg--void" data-d="2" style={{ width: '22%' }}>
                clipped
              </div>
              <div className="al-seg" data-d="3" style={{ width: '18%' }}>redistributed</div>
              <div className="al-seg" data-d="4" style={{ width: '12%' }}>redistributed</div>
              <div className="al-seg" data-d="5" style={{ width: '8%' }}>redistributed</div>
            </div>
            <p className="al-note al-wipe" data-d="2" style={{ gridColumn: '1 / 12', gridRow: '3 / 4' }}>
              Diversification expressed as a real constraint inside the
              programme, rather than as a post-hoc adjustment to a ranked list.
              The remainder is not lost; it is re-solved across everything else
              still above the floor.
            </p>
          </>
        ))}

        {/* 09 — allocation */}
        {panel(8, '', (
          <>
            <h2 className="al-wipe" style={{ gridColumn: '1 / 12', gridRow: '1 / 2', alignSelf: 'center' }}>
              ${BUDGET.toLocaleString()}, divided
            </h2>
            <div className="al-stack">
              {alloc.map(([id, v]) => (
                <div className="al-seg" key={id} style={{ width: `${(v / BUDGET) * 100}%` }}>
                  {id}
                </div>
              ))}
              {result.left > 1 && (
                <div className="al-seg al-seg--void" style={{ width: `${(result.left / BUDGET) * 100}%` }}>
                  unallocated
                </div>
              )}
            </div>
            <div className="al-figs">
              {[
                ['15 × 3', 'SDG impact matrix, goals × axes'],
                [String(alloc.length), 'projects funded of 20'],
                [`$${deployed.toFixed(0)}`, 'capital deployed'],
                [FLOOR.toFixed(2), 'hard ESG floor'],
                [`${CAP * 100}%`, 'maximum single-project share'],
                ['3', 'specialist agents in the CrewAI workflow'],
              ].map(([v, k]) => (
                <div key={k}>
                  <b>{v}</b>
                  <span>{k}</span>
                </div>
              ))}
            </div>
          </>
        ))}

        {/* between 09 and 10 — the same programme, built, then the reader's */}
        <Mechanism
          prefix="al"
          id="al-mech"
          eyebrow="09 → 10 · isometric"
          title="The programme, built"
          snap
          stageOpts={{ ortho: 3.1, yawMax: 0.5, pitchMax: 0 }}
          beats={[
            { tag: '01 · candidates', h: 'Twenty asks', body: `Twenty generated candidates, each a block as tall as the capital it asks for — $90 to $470 — against a $${BUDGET.toLocaleString()} notional budget.` },
            { tag: '02 · the matrix', h: 'Forty-five scores', body: 'Every project is read into the 15 × 3 SDG Impact Matrix: fifteen goals against economic, environmental and social impact. Grey cells sit below the 0.70 line.' },
            { tag: '03 · the floor', h: 'Below 0.70, zero', body: `${result.cutByFloor} of 20 fall under the ESG floor and their allocation is forced to zero. Not reduced: zero, whatever they would have returned.` },
            { tag: '04 · the cap', h: `Nothing above ${CAP * 100}%`, body: `The concentration limit is a sheet at $${(BUDGET * CAP).toFixed(0)}. Any ask that reaches through it can only ever be funded up to the sheet.` },
            { tag: '05 · the allocation', h: `$${BUDGET.toLocaleString('en-US')}, divided`, body: `Ranked by marginal value (ESG less the 0.10 capital and 0.05 risk penalties), funded until the budget runs out: ${alloc.length} projects, $${deployed.toFixed(0)} deployed. The bar along the front is the budget.` },
          ]}
          free={{ tag: 'your turn', h: 'Move the constraints', body: 'Change the budget or raise the floor and the same programme solves again. A smaller budget makes the 40% cap bind; a higher floor empties the grid.', hint: 'hover a block for its numbers · drag to turn' }}
          controls={[
            { kind: 'range', key: 'budget', label: 'Budget', min: 400, max: 2400, step: 50, initial: BUDGET, format: (v) => `$${v.toLocaleString('en-US')}` },
            { kind: 'range', key: 'floor', label: 'ESG floor', min: 0.6, max: 0.9, step: 0.01, initial: FLOOR, format: (v) => `floor ${v.toFixed(2)}` },
          ]}
          note="The twenty candidates are generated from a fixed seed, as in the repo's committed run — a formulation, not a real portfolio."
          build={allocScene}
        />

        {/* 10 — prototype */}
        {panel(9, 'al-panel--null', (
          <div style={{ gridColumn: '1 / 13', gridRow: '1 / 4', alignSelf: 'center' }}>
            <h2>Read this as a formulation, not a portfolio.</h2>
            <p className="al-lead" style={{ marginTop: '1.4rem' }}>{CS.honest}</p>
          </div>
        ))}

        {/* 11 — the ledger */}
        {panel(10, '', (
          <div className="al-ledger">
            <table>
              <caption className="al-coord" style={{ textAlign: 'left', paddingBottom: 8 }}>
                allocation ledger · {alloc.length} funded · {result.cutByFloor} below floor ·
                {' '}{20 - alloc.length - result.cutByFloor} unfunded on value
              </caption>
              <thead>
                <tr>
                  <th>project</th>
                  <th>esg</th>
                  <th>risk</th>
                  <th>allocation</th>
                </tr>
              </thead>
              <tbody>
                {cands.map((c) => (
                  <tr key={c.id}>
                    <td>{c.id}</td>
                    <td>{fmtEsg(c.esg)}</td>
                    <td>{c.risk.toFixed(1)}</td>
                    <td>
                      {result.out.has(c.id)
                        ? `$${result.out.get(c.id)!.toFixed(0)}`
                        : c.esg < FLOOR ? 'below floor' : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="al-note" style={{ marginTop: '1.2rem' }}>{CS.stack.join(' · ')}</p>
            <div className="al-links">
              <a href={CS.repo} target="_blank" rel="noopener noreferrer">
                Repository
              </a>
              <Link to="/work/baby-cry">Next: one night, in timestamps</Link>
              <Link to="/">Back to the index</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
