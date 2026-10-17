/* ══════════════════════════════════════════════════════════════════════════
   semantic-modeling — "The Plate"      concept: docs/design/semantic-modeling.md

   One canvas for the whole page. The graph is a real force simulation — edge
   springs, spatial-hash repulsion, a pull toward whichever partition is
   currently on display — so nothing here has a duration; things settle. Scroll
   moves a critically-damped camera from station to station, and the content
   arrives as callout plates on leader lines.

   You can grab a node and pull it. That is the point: the other seven pages
   are things to watch, and this one is a thing to touch.
   ══════════════════════════════════════════════════════════════════════════ */
import { useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import BackLink from '@/projects/_shared/BackLink';
import { usePageShell, raf, clamp01, lerp } from '@/projects/_shared/page';
import { useReducedMotion, isCoarse } from '@/projects/_shared/reduced';
import { projects } from '@/data/content';
import { caseStudies } from '@/data/casestudies';
import { buildGraph, Sim, BIG_TOPICS, N_TOPICS, TOPIC_NAMES, N_FULL, N_EDGES } from './sim';
import Mechanism from '@/projects/_shared/Mechanism';
import { plateScene, ALGOS } from './mechanism';
import './plate.css';

const P = projects.find((x) => x.slug === 'semantic-modeling')!;
const CS = caseStudies['semantic-modeling'];

type StationId =
  | 'title' | 'extract' | 'rank' | 'louvain' | 'spectral' | 'n2v'
  | 'matrix' | 'consensus' | 'tour' | 'dims';

/* [id, from, to] across the page's scroll */
const STATIONS: [StationId, number, number][] = [
  ['title', 0.0, 0.09],
  ['extract', 0.09, 0.19],
  ['rank', 0.19, 0.27],
  ['louvain', 0.27, 0.37],
  ['spectral', 0.37, 0.46],
  ['n2v', 0.46, 0.55],
  ['matrix', 0.55, 0.68],
  ['consensus', 0.68, 0.76],
  ['tour', 0.76, 0.88],
  ['dims', 0.88, 1.01],
];

const PLATES: Record<StationId, { head: [string, string]; title: string; body: string[]; pos: string }> = {
  title: {
    head: ['sheet 1 of 10', 'extraction'],
    title: 'A folder of PDFs cannot be queried',
    body: [
      'Six hundred and nine entities, three hundred and four relations and fourteen topics, pulled out of a corpus that had no structure at all.',
      'The hard part was never the extraction. It was that three clustering algorithms look at the same graph and disagree about where the communities are — and each one is blind in a different place.',
    ],
    pos: 'bp-plate--c bp-title',
  },
  extract: {
    head: ['sheet 2 of 10', 'entities + relations'],
    title: 'Extraction',
    body: [
      'PyPDF2, pdfplumber and pypdf parse the corpus into structured JSON, with layout-aware fallbacks when one parser fails on a document.',
      'GPT-4o-mini extracts entities and typed relations in place of rule-based NER — more than ten relationship kinds, including uses, trained_on and evaluated_on. Fuzzy string matching plus semantic similarity then collapse the near-duplicates.',
    ],
    pos: 'bp-plate--lb',
  },
  rank: {
    head: ['sheet 3 of 10', 'pagerank'],
    title: 'The graph gains a centre',
    body: [
      'PageRank scores node importance so the clustering that follows weights structurally central entities instead of treating every node alike.',
      'Radius is importance. The eight largest are labelled.',
    ],
    pos: 'bp-plate--rb',
  },
  louvain: {
    head: ['sheet 4 of 10', 'algorithm 1 of 3'],
    title: 'Louvain',
    body: [
      'Modularity optimisation. It finds local communities well and splits the large ones — watch the five biggest topics fracture as it takes over.',
      'What it misses is global structure: two communities on opposite sides of the graph that mean the same thing stay apart.',
    ],
    pos: 'bp-plate--lb',
  },
  spectral: {
    head: ['sheet 5 of 10', 'algorithm 2 of 3'],
    title: 'Spectral',
    body: [
      'Laplacian eigendecomposition. It recovers the global shape and merges neighbouring communities into broader ones.',
      'What it misses is long-range semantics: entities that are related in meaning but not in the adjacency matrix.',
    ],
    pos: 'bp-plate--rb',
  },
  n2v: {
    head: ['sheet 6 of 10', 'algorithm 3 of 3'],
    title: 'Node2Vec + HDBSCAN',
    body: [
      'Random-walk embeddings, then density clustering. It captures semantics the first two cannot see.',
      'And it drifts. About a fifth of the nodes land somewhere the other two would not put them, and there is no way to tell from inside the algorithm which fifth.',
    ],
    pos: 'bp-plate--lb',
  },
  matrix: {
    head: ['sheet 7 of 10', 'co-assignment'],
    title: 'Do not pick one',
    body: [
      'Three partitions with different cluster counts cannot be compared label to label. So agreement is expressed as a co-assignment matrix instead: for every pair of nodes, how many of the three algorithms put them together.',
      'The block diagonal is what all three agree on. Everything off it is where they do not.',
    ],
    pos: 'bp-plate--lt',
  },
  consensus: {
    head: ['sheet 8 of 10', 'consensus'],
    title: 'Consensus voting',
    body: [
      'The co-assignment matrix resolves into final clusters with a minimum cluster size of three. Fourteen semantic topics, and a modularity of 0.787.',
      'Then 32% of the extractions merge pairwise — near-duplicates that were never string-identical.',
    ],
    pos: 'bp-plate--rb',
  },
  tour: {
    head: ['sheet 9 of 10', 'the five largest'],
    title: 'What the corpus was about',
    body: [
      'GPT-3, 36 entities. Transformer, 30. ViT, 28. CLIP, 23. Neural Networks, 21.',
      'The finished model answers questions over the corpus and renders as interactive pyvis HTML: topic network, hierarchy, full knowledge graph, and a sunburst of topic composition.',
    ],
    pos: 'bp-plate--lb',
  },
  dims: { head: ['sheet 10 of 10', 'dimensions'], title: '', body: [], pos: 'bp-plate--lt' },
};

const DIMS: { v: string; k: string; rev?: boolean }[] = [
  { v: '0.787', k: 'modularity — against 0.670 for the hierarchical variant', rev: true },
  { v: '97.7%', k: 'retrieval similarity, semantic match in QA evaluation' },
  { v: '32%', k: 'entity deduplication rate' },
  { v: '609 / 14 / 304', k: 'entities / topics / relations discovered' },
  { v: '~20 min', k: 'full pipeline runtime' },
  { v: '~$0.45', k: 'LLM API cost per full run' },
];

export default function Plate() {
  usePageShell({
    title: `${P.title} — The Plate`,
    bg: '#0d2b4e',
    ink: '#eaf3ff',
    accent: '#ff8a3d',
    scope: 'pj-plate',
  });
  const reduced = useReducedMotion();

  const N = useMemo(() => (isCoarse() ? 210 : N_FULL), []);
  const graph = useMemo(() => buildGraph(N), [N]);

  const cv = useRef<HTMLCanvasElement>(null);
  const sheet = useRef<HTMLDivElement>(null);
  const plateRefs = useRef<Record<string, HTMLElement | null>>({});
  const idxRef = useRef<HTMLDivElement>(null);
  const cNodes = useRef<HTMLElement>(null);
  const cEdges = useRef<HTMLElement>(null);
  const cTopics = useRef<HTMLElement>(null);
  const dimsRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = cv.current;
    const host = sheet.current;
    if (!canvas || !host) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const sim = new Sim(graph, reduced ? 900 : 1400);
    let W = 0, H = 0, dpr = 1;
    const size = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = host.clientWidth;
      H = host.clientHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(host);

    /* camera, critically damped toward the station target */
    const cam = { x: 0, y: 0, z: 0.62 };
    const target = { x: 0, y: 0, z: 0.62 };
    let gridDraw = reduced ? 1 : 0;
    let edgeIn = reduced ? 1 : 0;
    let dust = reduced ? 0 : 1;
    let matrixT = 0;
    let dedup = reduced ? 1 : 0;
    let tourK = -1;
    let station: StationId = 'title';

    const hot = '255,138,61';
    const line = '187,214,242';
    const fig = '255,224,102';

    const toScreen = (x: number, y: number): [number, number] => [
      (x - cam.x) * cam.z + W / 2,
      (y - cam.y) * cam.z + H / 2,
    ];
    const toWorld = (sx: number, sy: number): [number, number] => [
      (sx - W / 2) / cam.z + cam.x,
      (sy - H / 2) / cam.z + cam.y,
    ];

    /* ── the blueprint grid, drawn in world space so panning reads ── */
    const drawGrid = () => {
      const step = 80 * cam.z;
      if (step < 6) return;
      const ox = ((-cam.x * cam.z + W / 2) % step + step) % step;
      const oy = ((-cam.y * cam.z + H / 2) % step + step) % step;
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(22,65,113,0.9)';
      ctx.beginPath();
      const gx = W * gridDraw;
      for (let x = ox; x < gx; x += step) { ctx.moveTo(x, 0); ctx.lineTo(x, H * gridDraw); }
      for (let y = oy; y < H * gridDraw; y += step) { ctx.moveTo(0, y); ctx.lineTo(gx, y); }
      ctx.stroke();
      /* corner marks of the sheet */
      ctx.strokeStyle = `rgba(${line},0.5)`;
      ctx.lineWidth = 1;
      const m = 18, L = 26;
      ctx.beginPath();
      ctx.moveTo(m, m + L); ctx.lineTo(m, m); ctx.lineTo(m + L, m);
      ctx.moveTo(W - m - L, m); ctx.lineTo(W - m, m); ctx.lineTo(W - m, m + L);
      ctx.moveTo(m, H - m - L); ctx.lineTo(m, H - m); ctx.lineTo(m + L, H - m);
      ctx.moveTo(W - m - L, H - m); ctx.lineTo(W - m, H - m); ctx.lineTo(W - m, H - m - L);
      ctx.stroke();
    };

    const drawMatrix = (t: number) => {
      const { agree, agreeN } = graph;
      const side = Math.min(W, H) * 0.62;
      const cell = side / agreeN;
      const x0 = W / 2 - side / 2;
      const y0 = H / 2 - side / 2;
      for (let y = 0; y < agreeN; y++) {
        for (let x = 0; x < agreeN; x++) {
          const v = agree[y * agreeN + x];
          if (!v) continue;
          const a = (v / 3) * t;
          ctx.fillStyle = v === 3 ? `rgba(${hot},${(a * 0.85).toFixed(3)})` : `rgba(${line},${(a * 0.24).toFixed(3)})`;
          ctx.fillRect(x0 + x * cell, y0 + y * cell, cell + 0.6, cell + 0.6);
        }
      }
      ctx.strokeStyle = `rgba(${line},${(0.7 * t).toFixed(2)})`;
      ctx.lineWidth = 1;
      ctx.strokeRect(x0, y0, side, side);
    };

    const draw = () => {
      ctx.fillStyle = '#0d2b4e';
      ctx.fillRect(0, 0, W, H);
      drawGrid();

      if (matrixT > 0.01) drawMatrix(matrixT);

      /* edges */
      if (edgeIn > 0.01 && matrixT < 0.5) {
        ctx.strokeStyle = `rgba(${line},${(0.2 * edgeIn * (1 - matrixT)).toFixed(3)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        const lim = Math.round(graph.edges.length * edgeIn);
        for (let e = 0; e < lim; e++) {
          const [a, b] = graph.edges[e];
          const na = graph.nodes[a];
          const nb = graph.nodes[b];
          const [ax, ay] = toScreen(na.x, na.y);
          const [bx, by] = toScreen(nb.x, nb.y);
          if ((ax < -50 && bx < -50) || (ax > W + 50 && bx > W + 50)) continue;
          ctx.moveTo(ax, ay);
          ctx.lineTo(bx, by);
        }
        ctx.stroke();
      }

      /* cluster hulls for whichever partition is on display */
      if (sim.cohesion > 0.05 && matrixT < 0.4) {
        const K = N_TOPICS * 2;
        const acc = new Float64Array(K * 3);
        for (const n of graph.nodes) {
          const k = sim.clusterOf(n) % K;
          acc[k * 3] += n.x; acc[k * 3 + 1] += n.y; acc[k * 3 + 2]++;
        }
        for (let k = 0; k < K; k++) {
          const c = acc[k * 3 + 2];
          if (c < 3) continue;
          const [sx, sy] = toScreen(acc[k * 3] / c, acc[k * 3 + 1] / c);
          const rad = (36 + Math.sqrt(c) * 15) * cam.z;
          const isTour = tourK >= 0 && k === tourK;
          ctx.strokeStyle = isTour ? `rgba(${hot},0.85)` : `rgba(${line},${(0.13 * sim.cohesion).toFixed(3)})`;
          ctx.lineWidth = isTour ? 1.6 : 1;
          ctx.beginPath();
          ctx.arc(sx, sy, rad, 0, 6.2832);
          ctx.stroke();
          if (isTour || (station === 'tour' && k < 5)) {
            ctx.fillStyle = isTour ? `rgba(${fig},0.95)` : `rgba(${line},0.4)`;
            ctx.font = `${isTour ? 600 : 400} ${isTour ? 17 : 13}px NewsreaderBP, Georgia, serif`;
            ctx.textAlign = 'center';
            ctx.fillText(TOPIC_NAMES[k] ?? '', sx, sy - rad - 10);
          }
        }
      }

      /* nodes */
      for (const n of graph.nodes) {
        const [sx, sy] = toScreen(n.x, n.y);
        if (sx < -30 || sx > W + 30 || sy < -30 || sy > H + 30) continue;
        const merged = n.dupOf >= 0 ? dedup : 0;
        const r = Math.max(0.9, (1.5 + n.rank * 5.6) * cam.z * (1 - merged * 0.85));
        const inTour = tourK >= 0;
        const isHot = inTour && sim.clusterOf(n) % (N_TOPICS * 2) === tourK;
        const a = inTour ? (isHot ? 0.95 : 0.2) : lerp(0.34, 0.9, n.rank) * (1 - matrixT * 0.55);
        ctx.fillStyle = isHot ? `rgba(${fig},${a})` : `rgba(${line},${a.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, 6.2832);
        ctx.fill();
      }

      /* labels on the eight most central entities, once PageRank has run */
      if (station === 'rank' || station === 'louvain') {
        const top = [...graph.nodes].sort((a, b) => b.rank - a.rank).slice(0, 8);
        ctx.font = '13px NewsreaderBP, Georgia, serif';
        ctx.textAlign = 'left';
        for (const n of top) {
          const [sx, sy] = toScreen(n.x, n.y);
          if (sx < 0 || sx > W || sy < 0 || sy > H) continue;
          ctx.strokeStyle = `rgba(${line},0.45)`;
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(sx + 26, sy - 18);
          ctx.lineTo(sx + 62, sy - 18);
          ctx.stroke();
          ctx.fillStyle = `rgba(${fig},0.9)`;
          ctx.fillText(n.label ?? `entity ${n.i}`, sx + 30, sy - 23);
        }
      }
    };

    /* ── drag: the plate is a thing you can touch ── */
    let held = -1;
    let hinted = false;
    const onDown = (e: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      const [wx, wy] = toWorld(e.clientX - rect.left, e.clientY - rect.top);
      held = sim.nearest(wx, wy, 40 / cam.z);
      if (held >= 0) {
        host.classList.add('grabbing');
        host.setPointerCapture(e.pointerId);
        if (!hinted) { hinted = true; hintRef.current?.classList.add('gone'); }
      }
    };
    const onMove = (e: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      const [wx, wy] = toWorld(e.clientX - rect.left, e.clientY - rect.top);
      if (held < 0) {
        host.classList.toggle('grab', sim.nearest(wx, wy, 34 / cam.z) >= 0);
        return;
      }
      const n = graph.nodes[held];
      n.vx = (wx - n.x) * 0.5;
      n.vy = (wy - n.y) * 0.5;
      n.x = wx;
      n.y = wy;
    };
    const onUp = () => { held = -1; host.classList.remove('grabbing'); };
    host.addEventListener('pointerdown', onDown);
    host.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);

    const setPlate = (id: StationId) => {
      if (station === id) return;
      plateRefs.current[station]?.classList.remove('on');
      station = id;
      plateRefs.current[id]?.classList.add('on');
      dimsRef.current?.classList.toggle('on', id === 'dims');
      const n = STATIONS.findIndex((s) => s[0] === id) + 1;
      if (idxRef.current) {
        idxRef.current.innerHTML = '';
        const b = document.createElement('b');
        b.textContent = String(n);
        idxRef.current.append('sheet ', b, ` of ${STATIONS.length} · ${PLATES[id].head[1]}`);
      }
    };

    if (reduced) {
      /* settle the graph once, draw one frame, and let the static document
         below carry the argument */
      sim.cohesion = 1;
      sim.partition = 0;
      for (let k = 0; k < 260; k++) sim.step(1);
      cam.z = 0.5;
      draw();
      return () => {
        ro.disconnect();
        host.removeEventListener('pointerdown', onDown);
        host.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      };
    }

    const stop = raf((dt) => {
      const doc = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const p = clamp01(window.scrollY / doc);
      const st = STATIONS.find(([, a, b]) => p >= a && p < b) ?? STATIONS[STATIONS.length - 1];
      const [id, a, b] = st;
      const local = clamp01((p - a) / (b - a));
      setPlate(id);

      gridDraw = Math.min(1, gridDraw + dt * 0.045);

      switch (id) {
        case 'title':
          dust = 1 - clamp01(local / 0.7);
          sim.cohesion = 0;
          target.z = 0.34; target.x = 0; target.y = 0;
          break;
        case 'extract':
          edgeIn = clamp01(local / 0.55);
          sim.cohesion = clamp01(local / 0.5) * 0.55;
          sim.partition = 0;
          target.z = 0.5;
          break;
        case 'rank':
          edgeIn = 1; sim.cohesion = 0.7; sim.partition = 0;
          target.z = 0.6;
          break;
        case 'louvain':
          sim.partition = 1; sim.cohesion = 1; target.z = 0.52;
          break;
        case 'spectral':
          sim.partition = 2; sim.cohesion = 1; target.z = 0.52;
          break;
        case 'n2v':
          sim.partition = 3; sim.cohesion = 1; target.z = 0.52;
          break;
        case 'matrix':
          matrixT = clamp01((local - 0.06) / 0.4);
          sim.cohesion = 0.2;
          target.z = 0.7; target.x = 0; target.y = 0;
          break;
        case 'consensus':
          matrixT = Math.max(0, 1 - local / 0.35);
          sim.partition = 0; sim.cohesion = 1;
          dedup = clamp01((local - 0.45) / 0.45);
          target.z = 0.54;
          break;
        case 'tour': {
          matrixT = 0; sim.partition = 0; sim.cohesion = 1; dedup = 1;
          const k = Math.min(BIG_TOPICS.length - 1, Math.floor(local * BIG_TOPICS.length));
          tourK = k;
          /* the camera settles on the cluster it is naming */
          let ax = 0, ay = 0, c = 0;
          for (const n of graph.nodes) if (n.con === k) { ax += n.x; ay += n.y; c++; }
          if (c) { target.x = ax / c; target.y = ay / c; }
          target.z = 1.05;
          break;
        }
        case 'dims':
          tourK = -1; sim.cohesion = 1; target.x = 0; target.y = 0; target.z = 0.4;
          break;
      }
      if (id !== 'tour') tourK = -1;
      if (id !== 'matrix' && id !== 'consensus') matrixT = 0;

      /* the matrix phase pulls every node onto its cell rather than letting the
         springs do it — the whole point is that the arrangement is imposed */
      if (matrixT > 0.02) {
        const side = Math.min(W, H) * 0.62 / cam.z;
        const per = Math.ceil(Math.sqrt(graph.nodes.length));
        sim.towards((n) => {
          const gi = graph.rankIn[n.i];
          return [
            cam.x + (-side / 2 + ((gi % per) / per) * side),
            cam.y + (-side / 2 + (((gi / per) | 0) / per) * side),
          ];
        }, 0.08 * matrixT * dt);
      }

      if (dust > 0.01) {
        for (const n of graph.nodes) { n.vx += (Math.random() - 0.5) * dust * 2.4; n.vy += (Math.random() - 0.5) * dust * 2.4; }
      }
      sim.step(dt);

      cam.x = lerp(cam.x, target.x, Math.min(1, 0.055 * dt));
      cam.y = lerp(cam.y, target.y, Math.min(1, 0.055 * dt));
      cam.z = lerp(cam.z, target.z, Math.min(1, 0.055 * dt));

      if (cNodes.current) cNodes.current.textContent = String(Math.round(graph.nodes.length * (1 - dedup * 0.32)));
      if (cEdges.current) cEdges.current.textContent = String(Math.round(graph.edges.length * edgeIn));
      if (cTopics.current) cTopics.current.textContent = String(sim.cohesion > 0.4 ? N_TOPICS : 0);

      draw();
    });

    return () => {
      stop();
      ro.disconnect();
      host.removeEventListener('pointerdown', onDown);
      host.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [graph, reduced]);

  const plate = (id: StationId) => {
    const d = PLATES[id];
    const Tag = id === 'title' ? 'h1' : 'h2';
    return (
      <div
        key={id}
        className={`bp-plate ${d.pos} ${reduced || id === 'title' ? 'on' : ''}`}
        ref={(n) => { plateRefs.current[id] = n; }}
      >
        <div className="bp-plate__head">
          <span>{d.head[0]}</span>
          <span>{d.head[1]}</span>
        </div>
        <Tag>{d.title}</Tag>
        {d.body.map((t) => (
          <p key={t.slice(0, 24)}>{t}</p>
        ))}
      </div>
    );
  };

  return (
    <div className={`bp ${reduced ? 'bp-reduced' : ''}`}>
      <div className="bp-sheet" ref={sheet}>
        <canvas ref={cv} aria-hidden="true" />
      </div>

      <BackLink label="index" />

      {!reduced && (
        <>
          <div className="bp-index" ref={idxRef}>
            sheet <b>1</b> of {STATIONS.length} · extraction
          </div>
          <div className="bp-grabhint" ref={hintRef}>
            the graph is live — grab a node
          </div>
          <div className="bp-counts">
            <span>
              <b ref={cNodes}>0</b>entities
            </span>
            <span>
              <b ref={cEdges}>0</b>relations
            </span>
            <span>
              <b ref={cTopics}>0</b>topics
            </span>
          </div>
        </>
      )}

      {(Object.keys(PLATES) as StationId[]).filter((k) => k !== 'dims').map(plate)}

      {/* dimension lines: figures drawn, never faded in */}
      <div className={`bp-dims ${reduced ? 'on' : ''}`} ref={dimsRef}>
        {DIMS.map((d) => (
          <div className={`bp-dim ${d.rev ? 'bp-dim--rev' : ''}`} key={d.k}>
            <span className="bp-dim__line" />
            <span>
              <span className="bp-dim__v">{d.v}</span>
              <span className="bp-dim__k">{d.k}</span>
              {d.rev && (
                <span className="bp-rev" aria-hidden>
                  <span>rev. a</span>
                  <svg viewBox="0 0 240 90" preserveAspectRatio="none">
                    <path d="M6 45q0-22 22-20 4-18 24-12 8-16 26-8 10-14 28-6 12-12 28-2 14-8 26 4 18 0 24 14 16 2 12 22-10 14-26 8-12 12-28 6-14 10-28 2-16 8-26-4-18 2-24-14-16-2-12-22Z" />
                  </svg>
                </span>
              )}
            </span>
          </div>
        ))}
      </div>

      {/* the scroll track the camera rides along */}
      <div className="bp-track" style={{ height: reduced ? 0 : '1000vh' }} aria-hidden />

      {/* ── sheet 11: the same pipeline, as a 3D drawing — then yours ── */}
      <Mechanism
        prefix="bp"
        id="bp-mech"
        eyebrow="sheet 11 · isometric"
        title="The plate, in depth"
        beats={[
          { tag: '01 · parsing', h: 'A folder of PDFs', body: CS.pipeline[0].body },
          { tag: '02 · extraction', h: 'Entities lift off the page', body: 'GPT-4o-mini reads each document and pulls out entities and typed relations in place of rule-based NER.' },
          { tag: '03 · deduplication', h: '32% collapse', body: 'Fuzzy string matching plus semantic similarity merges the near-duplicates — the same entity spelled three ways becomes one node.' },
          { tag: '04 · the graph', h: 'Relations, and a centre', body: `${CS.pipeline[2].body} ${CS.pipeline[3].body}` },
          { tag: '05 · ensemble', h: 'Three answers, one agreement', body: CS.pipeline[4].body },
        ]}
        free={{ tag: 'your turn', h: 'Take the plate apart', body: 'Switch partitions to see where the three algorithms disagree. Click an entity to trace its 2-hop neighbourhood — the context the retriever would pull.', hint: 'click an entity · drag to turn' }}
        controls={[{ kind: 'choice', key: 'algo', label: 'Partition', initial: 'consensus', options: ALGOS.map((a) => ({ v: a, label: a === 'node2vec' ? 'node2vec + hdbscan' : a })) }]}
        note="A downsample of the page's own graph (240 of 609 entities) with the same topic sizes, partitions and duplicates."
        build={plateScene}
      />

      {/* the revision note and the title block — the only flowed content */}
      <div className="bp-end">
        <div className="bp-revnote">
          <b>revision a — read with the figures</b>
          {CS.honest}
        </div>

        <div className="bp-block">
          <div>
            <h2>{P.title}</h2>
            <p>{CS.approach}</p>
            <p>{CS.dataset}</p>
            <div className="bp-links">
              <a href={CS.repo} target="_blank" rel="noopener noreferrer">
                Repository
              </a>
              <Link to="/work/qubit-green-finance">Next: fifteen goals, three axes</Link>
              <Link to="/">Back to the index</Link>
            </div>
          </div>
          <div>
            <dl>
              <dt>drawing</dt>
              <dd>semantic modelling</dd>
              <dt>entities</dt>
              <dd>{N_FULL}</dd>
              <dt>relations</dt>
              <dd>{N_EDGES}</dd>
              <dt>topics</dt>
              <dd>{N_TOPICS}</dd>
              <dt>modularity</dt>
              <dd>0.787</dd>
              <dt>sheets</dt>
              <dd>{STATIONS.length}</dd>
            </dl>
            <p style={{ marginTop: '1.2rem', fontSize: 14.5 }}>{CS.stack.join(' · ')}</p>
          </div>
        </div>
      </div>

      {/* what the canvas cannot say out loud */}
      <p className="bp-sr">
        A live force-directed diagram of {N_FULL} extracted entities and {N_EDGES}{' '}
        relations, clustered three ways and then by consensus into {N_TOPICS}{' '}
        topics. {CS.problem}
      </p>
    </div>
  );
}
