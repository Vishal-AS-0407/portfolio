/* The drawer's contents, generated once and deterministically.
   Forty cards is the whole conceit: the same forty are threaded on the rod,
   scattered into the vector index, filtered by topic and lifted by top-k, so
   their identity has to be stable across every set piece on the page. */

const mk = (seed: number) => {
  let s = seed || 1;
  return () => ((s = (s * 48271) % 2147483647) / 2147483647);
};

export type Card = {
  id: number;
  topic: string;
  q: string;
  /** angle in the opening fan */
  fan: { x: number; y: number; r: number; z: number };
  /** position on the brass rod: ordered, tight, exact */
  rod: { x: number; y: number; r: number; z: number };
  /** position in the normalised vector scatter: similarity as distance */
  vec: { x: number; y: number; r: number; z: number };
  /** true if the topic filter keeps it */
  kept: boolean;
  /** cosine score, only meaningful for kept cards */
  cos: number;
  hallucinated: boolean;
};

/* TOPICS[0] is the query topic; every other card draws from index 1 up, so a
   card is on topic only if the deck builder put it there. */
const TOPICS = [
  'retrieval', 'threads', 'vectors', 'topics', 'caching',
  'evaluation', 'prompting', 'storage',
];

const QS = [
  'what embedding model is this thread on?',
  'summarise what we decided about retrieval',
  'why IndexFlatIP and not IndexFlatL2?',
  'how are topics assigned to a window?',
  'what happens if the embedding model changes?',
  'how much of the transcript reaches the prompt?',
  'where does the metadata live?',
  'what does search_by_text fall back to?',
];

/** The topic the recall demo narrows to. */
export const QUERY_TOPIC = 'retrieval';
export const QUERY = 'what did we decide about narrowing before the vector search?';

export function buildDeck(n: number): Card[] {
  const r = mk(20250906);
  const cards: Card[] = [];
  /* The recall set piece is 40 -> 6 -> 3, so the size of the kept set is a
     design decision, not a dice roll. Pick the indices up front and give those
     cards the query topic. */
  const keptCount = n >= 30 ? 6 : 5;
  const keptSet = new Set<number>();
  while (keptSet.size < keptCount) keptSet.add(1 + ((r() * (n - 2)) | 0));

  for (let i = 0; i < n; i++) {
    const kept = keptSet.has(i);
    const topic = kept ? QUERY_TOPIC : TOPICS[1 + ((r() * (TOPICS.length - 1)) | 0)];
    cards.push({
      id: i,
      topic,
      q: QS[(r() * QS.length) | 0],
      fan: {
        x: (r() - 0.5) * 340,
        y: (r() - 0.5) * 120 + 40,
        r: (r() - 0.5) * 26,
        z: -i * 3.2,
      },
      /* the rod: punched, threaded, in order, barely any freedom */
      rod: {
        x: -260 + i * 11,
        y: (r() - 0.5) * 6,
        r: (r() - 0.5) * 2.2,
        z: -i * 1.1,
      },
      /* the scatter: similarity is distance, so the kept topic clusters */
      vec: kept
        ? { x: -70 + (r() - 0.5) * 150, y: (r() - 0.5) * 150, r: (r() - 0.5) * 30, z: (r() - 0.5) * 120 }
        : { x: (r() - 0.5) * 900, y: (r() - 0.5) * 460, r: (r() - 0.5) * 44, z: (r() - 0.5) * 260 },
      kept,
      cos: 0.52 + r() * 0.46,
      hallucinated: false,
    });
  }
  /* 14.3% of the deck, rounded */
  for (let k = 0; k < Math.round(n * 0.143); k++) {
    const i = Math.min(n - 1, 1 + Math.round((k * (n - 2)) / Math.max(1, Math.round(n * 0.143))));
    cards[i].hallucinated = true;
  }
  return cards;
}

/** The three the top-k actually lifts: the highest-scoring kept cards. */
export function topK(cards: Card[], k = 3) {
  return cards
    .filter((c) => c.kept)
    .sort((a, b) => b.cos - a.cos)
    .slice(0, k)
    .map((c) => c.id);
}

/* the three exchanges typed onto blank cards in the pinned write sequence */
export const WRITES = [
  {
    topic: 'threads',
    q: 'what embedding model is this thread on?',
    a: 'all-MiniLM-L6-v2. createThread() records the model name on the thread, so a thread can never be queried with vectors that are not comparable to the ones stored.',
  },
  {
    topic: 'retrieval',
    q: 'what did we decide about narrowing?',
    a: 'Topic first, vectors second. search_by_question() filters candidate windows through the Redis topic index, then runs FAISS top-k over just that subset.',
  },
  {
    topic: 'vectors',
    q: 'why IndexFlatIP?',
    a: 'Query and answer are concatenated, embedded, cast to float32 and L2-normalised — so inner product gives cosine similarity directly.',
  },
];
