/* The 15×3 SDG Impact Matrix, and the twenty candidates the optimiser ran on.

   The README is explicit that the committed optimiser runs on 20 randomly
   generated candidate projects with ESG in 0.6–0.9 and risk in 4–7 against a
   $1,000 notional budget. So the numbers here are generated the same way, from
   a fixed seed, and the page says so out loud rather than dressing them up as
   a real portfolio. The constraints, though, are the real ones. */

const mk = (s: number) => () => ((s = (s * 48271) % 2147483647) / 2147483647);

export const GOALS = [
  'No poverty',
  'Zero hunger',
  'Good health and well-being',
  'Quality education',
  'Gender equality',
  'Clean water and sanitation',
  'Affordable and clean energy',
  'Decent work and economic growth',
  'Industry, innovation and infrastructure',
  'Reduced inequalities',
  'Sustainable cities and communities',
  'Responsible consumption and production',
  'Climate action',
  'Life below water',
  'Life on land',
];

export const AXES = ['economic', 'environmental', 'social'] as const;

/** 45 cells: goal × axis, each scored 0–1. Below 0.70 is below the floor. */
export function buildMatrix(): number[] {
  const r = mk(151515);
  const cells: number[] = [];
  for (let g = 0; g < 15; g++) {
    for (let a = 0; a < 3; a++) {
      /* environmental goals score high environmentally, and so on — the matrix
         has structure, it is not noise */
      const bias =
        (a === 1 && (g === 5 || g === 6 || g === 12 || g === 13 || g === 14) ? 0.2 : 0) +
        (a === 0 && (g === 7 || g === 8 || g === 11) ? 0.16 : 0) +
        (a === 2 && (g === 0 || g === 2 || g === 3 || g === 4 || g === 9) ? 0.18 : 0);
      cells.push(Math.min(0.98, 0.52 + r() * 0.36 + bias));
    }
  }
  return cells;
}

export type Candidate = { id: string; esg: number; risk: number; ask: number };

/** 20 candidates, a $1,000 budget, a 0.70 ESG floor, a 40% concentration cap. */
export const BUDGET = 1000;
export const FLOOR = 0.7;
export const CAP = 0.4;

export function buildCandidates(): Candidate[] {
  const r = mk(202511);
  return Array.from({ length: 20 }, (_, i) => ({
    id: `P${String(i + 1).padStart(2, '0')}`,
    esg: 0.6 + r() * 0.3,
    risk: 4 + r() * 3,
    ask: 90 + r() * 380,
  }));
}

/** The linear programme, solved the way the repo states it. The budget and the
    floor are parameters only so the mechanism section can let the reader move
    them; everywhere else the page runs it at the repo's $1,000 and 0.70. */
export function allocate(cs: Candidate[], budget = BUDGET, floor = FLOOR) {
  const cap = budget * CAP;
  /* objective: maximise sum(esg_i * x_i) - 0.10 * sum(x_i) - 0.05 * sum(risk_i * x_i).
     The marginal value of a dollar in project i is therefore: */
  const value = (c: Candidate) => c.esg - 0.1 - 0.05 * c.risk * 0.1;
  const live = cs
    .filter((c) => c.esg >= floor) // a hard zero, not a soft penalty
    .filter((c) => value(c) > 0)
    .sort((a, b) => value(b) - value(a));

  let left = budget;
  const out = new Map<string, number>();
  for (const c of live) {
    if (left <= 0) break;
    const take = Math.min(c.ask, cap, left); // no project above 40% of budget
    out.set(c.id, take);
    left -= take;
  }
  return { out, left, cutByFloor: cs.filter((c) => c.esg < floor).length };
}

/** ESG to two places, truncated rather than rounded, so a 0.699 never prints
    as "0.70" beside the words "below floor" */
export const fmtEsg = (v: number) => (Math.floor(v * 100 + 1e-9) / 100).toFixed(2);

export const TERMS: { t: string; k: string; note: string }[] = [
  {
    t: 'maximise  Σ esgᵢ · xᵢ',
    k: 'value',
    note: 'Every dollar allocated earns the ESG score of the project it goes to. This is the only term that wants to spend.',
  },
  {
    t: '−  0.10 · Σ xᵢ',
    k: 'cost of capital',
    note: 'A flat penalty on total capital deployed, so the programme does not spend the budget simply because it is there.',
  },
  {
    t: '−  0.05 · Σ riskᵢ · xᵢ',
    k: 'risk',
    note: 'A penalty weighted by each project’s own risk score, so a risky project has to be proportionally more impactful to earn the same dollar.',
  },
];
