/* ══════════════════════════════════════════════════════════════════════════
   memora — "The Catalogue"                      concept: docs/design/memora.md

   A card catalogue for an LLM. GSAP ScrollTrigger pins two stages; the card
   positions inside them are computed directly from the pin's progress rather
   than tweened, so forty cards cost forty transform writes a frame and the
   whole sequence scrubs exactly as well backwards as forwards.

   The only page on the site with perspective, Z motion and cast shadows.
   ══════════════════════════════════════════════════════════════════════════ */
import { useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import BackLink from '@/projects/_shared/BackLink';
import { usePageShell, clamp01, lerp } from '@/projects/_shared/page';
import { prefersReduced, isCoarse } from '@/projects/_shared/reduced';
import { projects } from '@/data/content';
import { caseStudies } from '@/data/casestudies';
import { buildDeck, topK, WRITES, QUERY, QUERY_TOPIC, type Card } from './cards';
import './catalogue.css';

gsap.registerPlugin(ScrollTrigger);

const P = projects.find((x) => x.slug === 'memora')!;
const CS = caseStudies.memora;

type Pose = { x: number; y: number; r: number; z: number; o: number; s: number };
const pose = (x: number, y: number, r: number, z: number, o = 1, s = 1): Pose => ({ x, y, r, z, o, s });
const mixPose = (a: Pose, b: Pose, t: number): Pose => ({
  x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), r: lerp(a.r, b.r, t),
  z: lerp(a.z, b.z, t), o: lerp(a.o, b.o, t), s: lerp(a.s, b.s, t),
});
/* paper settles; it does not bounce. This is the same shape as the CSS
   cubic-bezier(.4,.8,.2,1) the page uses everywhere else. */
const settle = (t: number) => {
  const u = clamp01(t);
  return 1 - Math.pow(1 - u, 2.6);
};
const seg = (p: number, a: number, b: number) => settle((p - a) / (b - a));

export default function Catalogue() {
  usePageShell({
    title: `${P.title} — The Catalogue`,
    bg: '#2e3338',
    ink: '#e6e9ec',
    accent: '#d98e2b',
    scope: 'pj-catalogue',
  });

  const N = useMemo(() => (isCoarse() ? 16 : 40), []);
  const deck = useMemo(() => buildDeck(N), [N]);
  const lifted = useMemo(() => topK(deck, 3), [deck]);

  const root = useRef<HTMLDivElement>(null);
  const drawer = useRef<HTMLDivElement>(null);
  const writeStage = useRef<HTMLDivElement>(null);
  const writeSec = useRef<HTMLElement>(null);
  const wCards = useRef<(HTMLDivElement | null)[]>([]);
  const wQ = useRef<(HTMLElement | null)[]>([]);
  const wA = useRef<(HTMLElement | null)[]>([]);
  const wStamp = useRef<(HTMLElement | null)[]>([]);
  const bigSec = useRef<HTMLElement>(null);
  const bigStage = useRef<HTMLDivElement>(null);
  const bCards = useRef<(HTMLDivElement | null)[]>([]);
  const bCos = useRef<(HTMLElement | null)[]>([]);
  const rod = useRef<HTMLDivElement>(null);
  const queryCard = useRef<HTMLDivElement>(null);
  const countEl = useRef<HTMLDivElement>(null);
  const capEl = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = prefersReduced();
    const el = root.current;
    if (!el) return;

    const put = (node: HTMLElement | null, p: Pose) => {
      if (!node) return;
      node.style.transform =
        `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, ${p.z.toFixed(1)}px)` +
        ` rotate(${p.r.toFixed(2)}deg) scale(${p.s.toFixed(3)})`;
      node.style.opacity = p.o.toFixed(3);
      /* the shadow is what sells the weight: soft when lifted, tight when landed */
      const h = clamp01((p.z + 200) / 520);
      node.style.boxShadow = `0 ${(2 + h * 32).toFixed(0)}px ${(4 + h * 56).toFixed(0)}px rgba(0,0,0,${(0.42 + h * 0.2).toFixed(2)})`;
    };

    /* ── the five layouts every card moves between ── */
    const filed = (c: Card, i: number) => pose(0, i * 0.7 - 8, c.rod.r * 0.4, -i * 2.4, 1, 0.98);
    const onRod = (c: Card) => pose(c.rod.x, c.rod.y, c.rod.r, c.rod.z, 1, 0.62);
    const inVec = (c: Card) => pose(c.vec.x, c.vec.y, c.vec.r, c.vec.z, 1, 0.62);
    const dropped = (c: Card) => pose(c.vec.x * 1.25, 720, c.rod.r, -520, 0.06, 0.5);
    const keptGrid = (idx: number) => {
      const col = idx % 3;
      const rw = (idx / 3) | 0;
      return pose(-300 + col * 300, -100 + rw * 220, 0, -60, 1, 0.72);
    };
    const liftedPose = (rank: number) => pose(-330 + rank * 330, 20, 0, 300, 1, 0.9);

    const keptIds = deck.filter((c) => c.kept).map((c) => c.id);

    const layoutBig = (p: number) => {
      const toRod = seg(p, 0.0, 0.16);
      const toVec = seg(p, 0.18, 0.34);
      const dropping = seg(p, 0.46, 0.62);
      const gridding = seg(p, 0.62, 0.78);
      const lifting = seg(p, 0.82, 1.0);

      for (let i = 0; i < deck.length; i++) {
        const c = deck[i];
        let q = mixPose(filed(c, i), onRod(c), toRod);
        q = mixPose(q, inVec(c), toVec);
        if (!c.kept) {
          q = mixPose(q, dropped(c), dropping);
        } else {
          const ki = keptIds.indexOf(c.id);
          q = mixPose(q, keptGrid(ki), gridding);
          const rank = lifted.indexOf(c.id);
          if (rank >= 0) q = mixPose(q, liftedPose(rank), lifting);
          else q = mixPose(q, pose(q.x, q.y + 220, q.r, -420, 0.1, q.s), lifting);
        }
        put(bCards.current[i], q);
        const cosEl = bCos.current[i];
        if (cosEl) cosEl.style.opacity = (lifted.indexOf(c.id) >= 0 ? lifting : 0).toFixed(2);
      }

      if (rod.current) {
        rod.current.style.opacity = (Math.min(toRod, 1 - toVec)).toFixed(2);
      }
      if (queryCard.current) {
        const t = seg(p, 0.36, 0.46);
        put(queryCard.current, mixPose(pose(0, -680, -4, 160, 0, 0.9), pose(0, -118, -2, 170, 1, 0.7), t));
      }
      if (countEl.current) {
        const n = p < 0.5 ? deck.length : p < 0.8 ? keptIds.length : lifted.length;
        const txt = p < 0.16 ? `${deck.length} filed` : p < 0.5 ? `${n} in the drawer`
          : p < 0.8 ? `${n} on topic "${QUERY_TOPIC}"` : `${n} enter the prompt`;
        if (countEl.current.textContent !== txt) countEl.current.textContent = txt;
      }
      if (capEl.current) {
        const caps: [number, string, string][] = [
          [0.18, 'Redis · the rod', 'Conversation metadata, thread structure and topic indices. Exact lookup: which thread, which user, when. Ordered, punched, threaded.'],
          [0.36, 'FAISS · the scatter', 'The same forty cards, released from the rod into a per-thread IndexFlatIP. Distance is similarity. One store does not serve both access patterns well, so there are two.'],
          [0.62, 'A query arrives', QUERY],
          [0.82, 'Narrow first', 'The Redis topic index filters candidate windows before the vector index is touched. Thirty-four cards go back in the drawer without ever being embedded.'],
          [1.01, 'Then top-k', 'FAISS runs over what is left. Three cards enter the prompt. That is where the sixty percent token reduction comes from — not from a smaller model, from a smaller prompt.'],
        ];
        const hit = caps.find(([to]) => p < to) ?? caps[caps.length - 1];
        if (capEl.current.dataset.k !== hit[1]) {
          capEl.current.dataset.k = hit[1];
          capEl.current.innerHTML = '';
          const b = document.createElement('b');
          b.textContent = hit[1];
          capEl.current.append(b, document.createTextNode(hit[2]));
        }
      }
    };

    const layoutWrite = (p: number) => {
      for (let i = 0; i < WRITES.length; i++) {
        /* the first card is already half-dealt at progress 0: a pinned stage
           that opens on an empty screen wastes the first viewport of the pin */
        const a = i * 0.31 - 0.03;
        const deal = seg(p, a, a + 0.08);
        const type = clamp01((p - (a + 0.07)) / 0.13);
        const stamp = seg(p, a + 0.2, a + 0.235);
        const file = seg(p, a + 0.24, a + 0.3);

        let q = mixPose(pose(360, -420, 12, 260, 0, 0.86), pose(0, 0, -1.4, 120, 1, 1), deal);
        q = mixPose(q, pose(-30 - i * 8, 210 + i * 3, -6 - i * 2, -120 - i * 40, 1, 0.8), file);
        put(wCards.current[i], q);

        const full = WRITES[i];
        const qs = wQ.current[i];
        const as = wA.current[i];
        if (qs) qs.textContent = full.q.slice(0, Math.round(type * 2.1 * full.q.length));
        if (as) {
          const t2 = clamp01((type - 0.45) / 0.55);
          as.textContent = full.a.slice(0, Math.round(t2 * full.a.length));
        }
        const st = wStamp.current[i];
        if (st) {
          st.style.opacity = (stamp * 0.92).toFixed(2);
          st.style.transform = `rotate(-3.4deg) scale(${(1.9 - 0.9 * stamp).toFixed(3)})`;
        }
      }
    };

    if (reduced) {
      /* the drawer is simply open: everything at its resolved state, no pins */
      layoutWrite(1);
      for (let i = 0; i < deck.length; i++) {
        const c = deck[i];
        const rank = lifted.indexOf(c.id);
        put(bCards.current[i], rank >= 0
          ? liftedPose(rank)
          : c.kept ? keptGrid(keptIds.indexOf(c.id)) : pose(c.vec.x, c.vec.y, c.vec.r, c.vec.z, 0.22, 0.6));
        const cosEl = bCos.current[i];
        if (cosEl) cosEl.style.opacity = rank >= 0 ? '1' : '0';
      }
      if (rod.current) rod.current.style.opacity = '0.4';
      if (queryCard.current) put(queryCard.current, pose(0, -118, -2, 170, 1, 0.7));
      if (countEl.current) countEl.current.textContent = `${lifted.length} enter the prompt`;
      if (capEl.current) capEl.current.textContent =
        'Redis narrows by topic, FAISS runs top-k over what is left, and three cards enter the prompt instead of forty.';
      if (drawer.current) drawer.current.style.transform = 'translate3d(0,0,180px)';
      return;
    }

    const ctx = gsap.context(() => {
      /* the drawer slides toward the viewer and the cards rise out of it */
      gsap.to(drawer.current, {
        z: 260,
        y: 120,
        ease: 'none',
        scrollTrigger: { trigger: '.mm-open', start: 'top top', end: 'bottom top', scrub: 0.7 },
      });
      gsap.utils.toArray<HTMLElement>('.mm-fan i').forEach((c, i) => {
        const off = i - 3;
        gsap.fromTo(
          c,
          { y: 40, x: off * 26, rotate: off * 1.4, z: -i * 6, opacity: 0.35 },
          {
            y: -170 + Math.abs(off) * 14,
            x: off * 126,
            rotate: off * 7.5,
            z: 60 - Math.abs(off) * 30,
            opacity: 1,
            ease: 'none',
            scrollTrigger: { trigger: '.mm-open', start: 'top top', end: 'bottom top', scrub: 0.7 },
          }
        );
      });

      ScrollTrigger.create({
        trigger: writeSec.current,
        start: 'top top',
        end: '+=280%',
        pin: writeStage.current,
        pinSpacing: true,
        scrub: 0.6,
        onUpdate: (self) => layoutWrite(self.progress),
        onRefreshInit: () => layoutWrite(0),
      });

      ScrollTrigger.create({
        trigger: bigSec.current,
        start: 'top top',
        end: '+=620%',
        pin: bigStage.current,
        pinSpacing: true,
        scrub: 0.6,
        onUpdate: (self) => layoutBig(self.progress),
        onRefreshInit: () => layoutBig(0),
      });

      /* the two piles: one leans because its labels drift, one is square */
      gsap.utils.toArray<HTMLElement>('.mm-slip').forEach((s) => {
        const drift = s.dataset.drift === '1';
        const i = Number(s.dataset.i || 0);
        gsap.fromTo(
          s,
          { y: 210 + i * 30, x: 0, rotate: 0, opacity: 0 },
          {
            /* the drift pile leans: each slip lands a little further out of
               true, because nothing told it what the pile was already called */
            y: i * 30,
            rotate: drift ? (i - 2.5) * 2.4 : 0,
            x: drift ? (i - 2.5) * 11 : 0,
            opacity: 1,
            ease: 'none',
            scrollTrigger: { trigger: '.mm-piles', start: 'top 82%', end: 'center 52%', scrub: 0.8 },
          }
        );
      });

      /* stack thickness is token cost */
      gsap.utils.toArray<HTMLElement>('.mm-thick').forEach((t) => {
        const n = Number(t.dataset.n || 4);
        gsap.fromTo(
          t.querySelectorAll('i'),
          { scaleX: 0, transformOrigin: 'left' },
          {
            scaleX: 1,
            stagger: 0.9 / n,
            ease: 'none',
            scrollTrigger: { trigger: t, start: 'top 82%', end: 'bottom 62%', scrub: 0.7 },
          }
        );
      });

      /* six stamps, then one — same stamp, same speed */
      gsap.utils.toArray<HTMLElement>('.mm-hstamp').forEach((s, i) => {
        gsap.fromTo(
          s,
          { opacity: 0, scale: 1.9 },
          {
            opacity: 0.9,
            scale: 1,
            duration: 0.13,
            ease: 'power4.out',
            scrollTrigger: { trigger: '.mm-halluc', start: `top ${72 - i * 2}%`, toggleActions: 'play none none reverse' },
          }
        );
      });

      layoutWrite(0);
      layoutBig(0);
    }, el);

    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      ctx.revert();
    };
  }, [deck, lifted, N]);

  return (
    <div className="mm" ref={root}>
      <BackLink label="the index" />

      {/* ── the drawer opens ── */}
      <header className="mm-open">
        <div className="mm-drawer" ref={drawer} aria-hidden />
        <div className="mm-fan" aria-hidden>
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <i key={i} />
          ))}
        </div>
        <div className="mm-room" style={{ position: 'relative', zIndex: 3 }}>
          <span className="mm-brass">a–z · conversation memory</span>
          <h1>{P.title}</h1>
          <p>
            A conversation ends and its context dies with it. Replaying the whole
            transcript into the next prompt is expensive, and it makes
            hallucination <em>worse</em> — the one turn that mattered is buried
            in forty that did not.
          </p>
          <p className="mm-quiet">
            Memora files instead of replaying. Every exchange becomes a card, the
            card gets a topic stamped on it, and recall pulls the three that
            matter out of the drawer.
          </p>
        </div>
      </header>

      {/* ── every turn becomes a card ── */}
      <section className="mm-pin" ref={writeSec} aria-labelledby="mm-write-h">
        <div className="mm-stage" ref={writeStage}>
          <h2 className="mm-count" id="mm-write-h" style={{ fontSize: 'clamp(20px,2.4vw,30px)' }}>
            Every turn becomes a card
          </h2>
          <div className="mm-deck">
            {WRITES.map((w, i) => (
              <div
                className="mm-card mm-card--big"
                key={w.topic}
                ref={(n) => { wCards.current[i] = n; }}
                style={{ opacity: 0 }}
              >
                <span className="mm-card__t">window:{`{uuid}`} · {w.topic}</span>
                <div className="mm-card__q" ref={(n) => { wQ.current[i] = n; }} />
                <div className="mm-card__a" ref={(n) => { wA.current[i] = n; }} />
                <span className="mm-stamp" ref={(n) => { wStamp.current[i] = n; }}>
                  {w.topic}
                </span>
              </div>
            ))}
          </div>
          <div className="mm-cap">
            <b>Typed, stamped, filed</b>
            Each Q&amp;A pair becomes a window with its own UUID under a
            <code> window:&#123;uuid&#125; </code> key in Redis, with topics,
            timestamps and usernames attached. A LangChain structured-output call
            with a Pydantic schema asks for the topic name.
          </div>
        </div>
      </section>

      {/* ── the two piles ── */}
      <section className="mm-piles" aria-labelledby="mm-drift-h">
        <div className="mm-pile">
          <h3 id="mm-drift-h">Labelled in isolation</h3>
          <p>Four names for one topic. The pile leans.</p>
          {['retrieval', 'search', 'lookup', 'finding things', 'recall', 'fetch'].map((t, i) => (
            <div className="mm-slip" data-drift="1" data-i={i} key={t} style={{ zIndex: 10 - i }}>
              <i>{t}</i>
            </div>
          ))}
        </div>
        <div className="mm-pile">
          <h3>Diffed against the thread</h3>
          <p>
            The existing topic list is passed into the classification prompt, so
            labels cannot drift. The pile is square.
          </p>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div className="mm-slip" data-i={i} key={i} style={{ zIndex: 10 - i }}>
              <i>retrieval</i>
            </div>
          ))}
        </div>
      </section>

      {/* ── two indexes, then recall ── */}
      <section className="mm-pin" ref={bigSec} aria-labelledby="mm-recall-h">
        <div className="mm-stage" ref={bigStage}>
          <h2 className="mm-count" ref={countEl} id="mm-recall-h">
            {N} filed
          </h2>
          <div className="mm-rod" ref={rod} aria-hidden />
          <div className="mm-deck">
            {deck.map((c, i) => (
              <div
                className="mm-card"
                key={c.id}
                ref={(n) => { bCards.current[i] = n; }}
                aria-hidden
              >
                <span className="mm-card__t">{c.topic}</span>
                <div className="mm-card__q">{c.q}</div>
                <span className="mm-card__cos" ref={(n) => { bCos.current[i] = n; }}>
                  cos {c.cos.toFixed(3)}
                </span>
              </div>
            ))}
            <div className="mm-card mm-card--big mm-card--query" ref={queryCard} aria-hidden>
              <span className="mm-card__t">query</span>
              <div className="mm-card__q">{QUERY}</div>
            </div>
          </div>
          <div className="mm-cap" ref={capEl} />
        </div>
      </section>

      {/* ── what it costs ── */}
      <section className="mm-cost" aria-labelledby="mm-cost-h">
        <div>
          <h2 id="mm-cost-h">A stack has a thickness</h2>
          <p>
            Replaying the thread sends forty windows. Narrowing by topic and then
            running top-k sends three. The saving is not a smaller model — it is
            a smaller prompt.
          </p>
          <div className="mm-figs">
            {CS.results.map((m) => (
              <div key={m.k}>
                <b>{m.v}</b>
                <span>{m.k}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.4rem' }}>
          <div className="mm-thick" data-n="40" aria-hidden>
            {Array.from({ length: 40 }, (_, i) => (
              <i key={i} style={{ bottom: i * 6 + 'px' }} />
            ))}
            <b>40</b>
            <span>windows replayed</span>
          </div>
          <div className="mm-thick" data-n="3" aria-hidden>
            {[0, 1, 2].map((i) => (
              <i key={i} style={{ bottom: i * 6 + 'px' }} />
            ))}
            <b>3</b>
            <span>windows retrieved</span>
          </div>
        </div>
      </section>

      {/* ── the stamp, twice ── */}
      <section className="mm-piles mm-halluc" aria-labelledby="mm-h-h">
        <div className="mm-pile" style={{ height: 260 }}>
          <h3 id="mm-h-h">Replaying the thread</h3>
          <p>14.3% of answers carried something the transcript did not support.</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 18 }}>
            {Array.from({ length: 6 }, (_, i) => (
              <span className="mm-stamp mm-stamp--red mm-hstamp" key={i}
                style={{ position: 'relative', right: 'auto', top: 'auto', opacity: 0 }}>
                hallucinated
              </span>
            ))}
          </div>
        </div>
        <div className="mm-pile" style={{ height: 260 }}>
          <h3>Retrieving three</h3>
          <p>1.4%. Same stamp, same speed, one hit instead of six.</p>
          <div style={{ marginTop: 18 }}>
            <span className="mm-stamp mm-stamp--red mm-hstamp"
              style={{ position: 'relative', right: 'auto', top: 'auto', opacity: 0 }}>
              hallucinated
            </span>
          </div>
        </div>
      </section>

      {/* ── the card at the back ── */}
      <section className="mm-back" aria-labelledby="mm-honest-h">
        <div className="mm-back__card">
          <span className="mm-back__stamp" aria-hidden>NOT REPRODUCIBLE</span>
          <h2 id="mm-honest-h" style={{ fontSize: 19, marginBottom: '0.9rem' }}>
            Filed at the back of the drawer
          </h2>
          <p>{CS.honest}</p>
        </div>
      </section>

      {/* ── close the drawer ── */}
      <footer className="mm-room">
        <span className="mm-brass">closing</span>
        <h2>How it is built</h2>
        <p className="mm-stackline">{CS.stack.join(' · ')}</p>
        <p className="mm-quiet" style={{ marginTop: '1.6rem' }}>
          {CS.challenges![0]}
        </p>
        <div className="mm-links">
          <a href={CS.repo} target="_blank" rel="noopener noreferrer">
            Repository
          </a>
          <Link to="/work/semantic-modeling">Next: a graph, drafted on blueprint</Link>
          <Link to="/">Back to the index</Link>
        </div>
      </footer>
    </div>
  );
}
