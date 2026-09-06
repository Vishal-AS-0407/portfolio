/* The graph, and the physics that holds it together.

   609 entities, 304 relations, 14 topics — the figures from the committed run.
   Three partitions are generated because three algorithms genuinely disagree:
   Louvain finds local communities and misses global structure, spectral finds
   global structure and misses long-range semantics, Node2Vec + HDBSCAN drifts.
   The consensus partition is what a co-assignment matrix resolves them into.

   Forces: edge springs, local repulsion through a spatial hash (never O(n^2)),
   and a weak pull toward the *currently displayed* partition's centroid — which
   is what makes the graph physically re-group when the algorithm changes. */

export const N_FULL = 609;
export const N_EDGES = 304;
export const N_TOPICS = 14;

/* the five largest topics in the committed run, with their entity counts */
export const BIG_TOPICS: [string, number][] = [
  ['GPT-3', 36],
  ['Transformer', 30],
  ['ViT', 28],
  ['CLIP', 23],
  ['Neural Networks', 21],
];

const OTHER_TOPICS = [
  'Attention', 'Diffusion', 'Tokenisation', 'Benchmarks', 'Fine-tuning',
  'Retrieval', 'Distillation', 'Optimisers', 'Datasets',
];

export const TOPIC_NAMES = [...BIG_TOPICS.map((t) => t[0]), ...OTHER_TOPICS];

export type Node = {
  i: number;
  x: number; y: number; vx: number; vy: number;
  /** home cluster in the consensus partition */
  con: number;
  /** what each algorithm thinks, in order: louvain, spectral, node2vec+hdbscan */
  part: [number, number, number];
  /** pagerank-ish importance, 0..1 */
  rank: number;
  /** a duplicate that the 32% dedup pass merges into `into` */
  dupOf: number;
  label: string | null;
  seed: number;
};

const mk = (s: number) => () => ((s = (s * 48271) % 2147483647) / 2147483647);

export type Graph = {
  nodes: Node[];
  edges: [number, number][];
  /** cluster centroids per partition, filled by layout() */
  centroids: [number, number][][];
  /** co-assignment: how often i and j land together, 0..3, on a downsample */
  agree: Uint8Array;
  agreeN: number;
  order: number[];
  /** inverse of `order`: where node i sits once sorted by consensus cluster.
      Precomputed because the matrix phase needs it per node per frame, and an
      indexOf() in there would make the whole simulation quadratic. */
  rankIn: Uint16Array;
};

export function buildGraph(n: number): Graph {
  const r = mk(978);
  const scale = n / N_FULL;
  const sizes: number[] = [];
  for (const [, c] of BIG_TOPICS) sizes.push(Math.max(4, Math.round(c * scale)));
  let used = sizes.reduce((a, b) => a + b, 0);
  for (let t = BIG_TOPICS.length; t < N_TOPICS; t++) {
    const rest = N_TOPICS - t;
    const take = t === N_TOPICS - 1 ? n - used : Math.round((n - used) / rest);
    sizes.push(Math.max(3, take));
    used += sizes[t];
  }

  const nodes: Node[] = [];
  let id = 0;
  for (let t = 0; t < N_TOPICS && id < n; t++) {
    for (let k = 0; k < sizes[t] && id < n; k++) {
      /* Louvain splits big communities and keeps small ones; spectral merges
         neighbouring ones; node2vec+hdbscan reassigns a fifth at random. */
      const louvain = t < 5 && k % 3 === 0 ? N_TOPICS + t : t;
      const spectral = t >> 1;
      const n2v = r() < 0.2 ? (r() * N_TOPICS) | 0 : t;
      nodes.push({
        i: id,
        x: 0, y: 0, vx: 0, vy: 0,
        con: t,
        part: [louvain, spectral, n2v],
        rank: 0,
        dupOf: -1,
        label: k === 0 && t < TOPIC_NAMES.length ? TOPIC_NAMES[t] : null,
        seed: r(),
      });
      id++;
    }
  }
  while (nodes.length < n) {
    nodes.push({
      i: nodes.length, x: 0, y: 0, vx: 0, vy: 0,
      con: N_TOPICS - 1, part: [N_TOPICS - 1, (N_TOPICS - 1) >> 1, N_TOPICS - 1],
      rank: 0, dupOf: -1, label: null, seed: r(),
    });
  }

  /* 304 relations, weighted toward within-topic pairs — a knowledge graph is
     not a random graph */
  const edges: [number, number][] = [];
  const m = Math.round(N_EDGES * scale);
  const byTopic: number[][] = Array.from({ length: N_TOPICS }, () => []);
  for (const nd of nodes) byTopic[nd.con].push(nd.i);
  for (let e = 0; e < m; e++) {
    const t = (r() * N_TOPICS) | 0;
    const g = byTopic[t];
    if (g.length < 2) { e--; continue; }
    const a = g[(r() * g.length) | 0];
    const b = r() < 0.14
      ? nodes[(r() * nodes.length) | 0].i        // a cross-topic relation
      : g[(r() * g.length) | 0];
    if (a !== b) edges.push([a, b]);
  }

  /* pagerank stand-in: degree, smoothed, normalised */
  const deg = new Float64Array(nodes.length);
  for (const [a, b] of edges) { deg[a]++; deg[b]++; }
  let max = 1;
  for (let i = 0; i < nodes.length; i++) max = Math.max(max, deg[i]);
  for (const nd of nodes) nd.rank = Math.pow(deg[nd.i] / max, 0.7);

  /* 32% of extractions were near-duplicates that fuzzy + semantic matching
     collapsed pairwise */
  const dupCount = Math.round(nodes.length * 0.32 * 0.5);
  for (let k = 0; k < dupCount; k++) {
    const a = 1 + ((r() * (nodes.length - 2)) | 0);
    const b = 1 + ((r() * (nodes.length - 2)) | 0);
    if (a !== b && nodes[a].dupOf < 0 && nodes[b].dupOf < 0 && nodes[a].con === nodes[b].con) {
      nodes[a].dupOf = b;
    }
  }

  /* the co-assignment matrix, on a fixed 84x84 downsample ordered by consensus
     cluster: cell = how many of the three partitions put the two together */
  const agreeN = 84;
  const order = nodes.map((nd) => nd.i).sort((a, b) => nodes[a].con - nodes[b].con);
  const agree = new Uint8Array(agreeN * agreeN);
  for (let yi = 0; yi < agreeN; yi++) {
    for (let xi = 0; xi < agreeN; xi++) {
      const a = nodes[order[((yi / agreeN) * nodes.length) | 0]];
      const b = nodes[order[((xi / agreeN) * nodes.length) | 0]];
      let v = 0;
      for (let p = 0; p < 3; p++) if (a.part[p] === b.part[p]) v++;
      agree[yi * agreeN + xi] = v;
    }
  }

  const rankIn = new Uint16Array(nodes.length);
  for (let k = 0; k < order.length; k++) rankIn[order[k]] = k;

  return { nodes, edges, centroids: [], agree, agreeN, order, rankIn };
}

/* ── the simulation ─────────────────────────────────────────────────────── */

const CELL = 46;

export class Sim {
  g: Graph;
  /** which partition the cluster pull is currently using: 0 consensus, 1..3 algos */
  partition = 0;
  /** 0 = no cluster pull (dust), 1 = full */
  cohesion = 0;
  damping = 0.86;
  private grid = new Map<number, number[]>();
  private cx: Float64Array;
  private cy: Float64Array;

  constructor(g: Graph, spread = 1400) {
    this.g = g;
    const r = mk(4242);
    for (const n of g.nodes) {
      n.x = (r() - 0.5) * spread * 2.4;
      n.y = (r() - 0.5) * spread * 1.5;
      n.vx = (r() - 0.5) * 14;
      n.vy = (r() - 0.5) * 14;
    }
    /* stable centroids on a ring, per cluster index */
    const K = N_TOPICS * 2;
    this.cx = new Float64Array(K);
    this.cy = new Float64Array(K);
    for (let k = 0; k < K; k++) {
      const a = (k / K) * Math.PI * 2 + 0.4;
      const rad = 340 + (k % 3) * 150 + (k >= N_TOPICS ? 260 : 0);
      this.cx[k] = Math.cos(a) * rad;
      this.cy[k] = Math.sin(a) * rad * 0.7;
    }
  }

  clusterOf(n: Node) {
    return this.partition === 0 ? n.con : n.part[this.partition - 1];
  }

  step(dt: number) {
    const { nodes, edges } = this.g;
    const d = Math.min(2, dt);

    /* edge springs */
    for (const [a, b] of edges) {
      const na = nodes[a];
      const nb = nodes[b];
      const dx = nb.x - na.x;
      const dy = nb.y - na.y;
      const dist = Math.hypot(dx, dy) || 1;
      const f = (dist - 90) * 0.0032 * d;
      const ux = (dx / dist) * f;
      const uy = (dy / dist) * f;
      na.vx += ux; na.vy += uy;
      nb.vx -= ux; nb.vy -= uy;
    }

    /* local repulsion through a spatial hash — never all pairs */
    this.grid.clear();
    for (const n of nodes) {
      const key = ((n.x / CELL) | 0) * 73856093 ^ ((n.y / CELL) | 0) * 19349663;
      let b = this.grid.get(key);
      if (!b) { b = []; this.grid.set(key, b); }
      b.push(n.i);
    }
    for (const bucket of this.grid.values()) {
      for (let i = 0; i < bucket.length; i++) {
        for (let j = i + 1; j < bucket.length; j++) {
          const a = nodes[bucket[i]];
          const b = nodes[bucket[j]];
          let dx = b.x - a.x;
          let dy = b.y - a.y;
          let d2 = dx * dx + dy * dy;
          if (d2 < 0.01) { dx = (a.seed - 0.5) * 2; dy = (b.seed - 0.5) * 2; d2 = 4; }
          if (d2 > CELL * CELL) continue;
          const f = (620 / d2) * d;
          const inv = 1 / Math.sqrt(d2);
          const ux = dx * inv * f;
          const uy = dy * inv * f;
          a.vx -= ux; a.vy -= uy;
          b.vx += ux; b.vy += uy;
        }
      }
    }

    /* the pull toward whatever partition is currently on display */
    if (this.cohesion > 0) {
      for (const n of nodes) {
        const k = this.clusterOf(n);
        const tx = this.cx[k % this.cx.length];
        const ty = this.cy[k % this.cy.length];
        const f = 0.0075 * this.cohesion * d;
        n.vx += (tx - n.x) * f;
        n.vy += (ty - n.y) * f;
      }
    }

    const damp = Math.pow(this.damping, d);
    for (const n of nodes) {
      n.vx *= damp;
      n.vy *= damp;
      n.x += n.vx * d;
      n.y += n.vy * d;
    }
  }

  /** Push every node straight onto a target layout, used by the matrix phase. */
  towards(target: (n: Node) => [number, number], t: number) {
    for (const n of this.g.nodes) {
      const [tx, ty] = target(n);
      n.x += (tx - n.x) * t;
      n.y += (ty - n.y) * t;
      n.vx *= 1 - t;
      n.vy *= 1 - t;
    }
  }

  nearest(wx: number, wy: number, max: number) {
    let best = -1;
    let bd = max * max;
    for (const n of this.g.nodes) {
      const d2 = (n.x - wx) ** 2 + (n.y - wy) ** 2;
      if (d2 < bd) { bd = d2; best = n.i; }
    }
    return best;
  }
}
