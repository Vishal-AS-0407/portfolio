import { useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import Chapter, { type Enter } from '@/components/case/Chapter';
import Pipeline, { type PipeStyle } from '@/components/case/Pipeline';
import Results, { type ResultStyle } from '@/components/case/Results';
import Rail from '@/components/case/Rail';
import Signature from '@/components/Signature';
import Motif, { type MotifKind } from '@/components/Motif';
import { projects } from '@/data/content';
import { caseStudies } from '@/data/casestudies';
import NotFound from '@/routes/NotFound';
import { onFrame } from '@/lib/scroll';
import { onScene } from '@/lib/projectfx';

const hex = (h: string) => {
  const n = parseInt(h.slice(1), 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
};

/* The archetype decides how the page is built, not just how it is coloured. */
type Recipe = { enter: Enter; pipe: PipeStyle; res: ResultStyle; hero: 'left' | 'huge' | 'centre' };
const RECIPE: Record<string, Recipe> = {
  waterfall: { enter: 'blur', pipe: 'bands', res: 'meter', hero: 'left' },
  recorder: { enter: 'jitter', pipe: 'rail', res: 'gauge', hero: 'left' },
  typeset: { enter: 'word', pipe: 'numeral', res: 'plain', hero: 'huge' },
  nodes: { enter: 'seal', pipe: 'hops', res: 'cipher', hero: 'left' },
  depth: { enter: 'depth', pipe: 'layers', res: 'reticle', hero: 'centre' },
  strata: { enter: 'slab', pipe: 'layers', res: 'bar', hero: 'left' },
  graph: { enter: 'node', pipe: 'hops', res: 'plain', hero: 'centre' },
  grid: { enter: 'cell', pipe: 'cells', res: 'bar', hero: 'left' },
};

export default function ProjectPage() {
  const { slug } = useParams();
  const p = projects.find((x) => x.slug === slug);
  const cs = slug ? caseStudies[slug] : undefined;
  const plateRef = useRef<HTMLDivElement>(null);
  const texRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const wipeRef = useRef<HTMLDivElement>(null);

  /* the project owns the page's colour world; the chrome stays constant */
  useEffect(() => {
    if (!p) return;
    const root = document.documentElement;
    root.style.setProperty('--bg', hex(p.theme.bg));
    root.style.setProperty('--fg', hex(p.theme.ink));
    root.style.setProperty('--accent', hex(p.theme.accent));
    root.style.setProperty('--accent2', hex(p.theme.accent2));
    document.body.classList.add('project');
    document.body.classList.remove('inv');
    document.body.dataset.arch = p.theme.arch;
    document.title = `${p.title} — Vishal A S`;
    return () => {
      root.style.removeProperty('--fg');
      root.style.removeProperty('--accent');
      root.style.removeProperty('--accent2');
      document.body.classList.remove('project');
      delete document.body.dataset.arch;
    };
  }, [p]);

  /* arrival wipe in the project's own accent */
  useEffect(() => {
    const w = wipeRef.current;
    if (!w) return;
    w.classList.remove('go');
    void w.offsetWidth;
    w.classList.add('go');
  }, [slug]);

  /* plate + texture + hero parallax */
  useEffect(() => {
    if (!p) return;
    const offA = onFrame(() => {
      const y = window.scrollY;
      if (plateRef.current)
        plateRef.current.style.transform = `translate3d(0,${(y * 0.16).toFixed(1)}px,0) scale(1.08)`;
      if (texRef.current)
        texRef.current.style.transform =
          `translate3d(${(-y * 0.05).toFixed(1)}px,${(y * 0.06).toFixed(1)}px,0)`;
    });
    /* The hero fades against the viewport, not against its own travel — driving
       it from onScene() put it at ~40% opacity before a single pixel of scroll,
       and the faded block then sat over the index link and swallowed clicks. */
    let offB = () => {};
    const h = heroRef.current;
    if (h) {
      offB = onFrame(() => {
        const hp = Math.min(1, window.scrollY / Math.max(1, window.innerHeight));
        h.style.transform = `translate3d(0,${(hp * -110).toFixed(1)}px,0)`;
        h.style.opacity = String(Math.max(0, 1 - hp * 1.25));
        h.style.pointerEvents = hp > 0.55 ? 'none' : '';
      });
    }
    return () => { offA(); offB(); };
  }, [p]);

  /* an unknown slug is a 404, not a blank project page */
  if (!p) return <NotFound />;

  const A = p.theme.accent;
  const A2 = p.theme.accent2;
  const T = p.theme;
  const R = RECIPE[T.arch] ?? RECIPE.waterfall;
  const others = projects.filter((x) => x.slug !== p.slug && caseStudies[x.slug]).slice(0, 4);

  const heroTitle = (
    <h1
      className="h-big"
      style={{
        fontSize: `clamp(${38 * T.scale}px, ${8.4 * T.scale}vw, ${118 * T.scale}px)`,
        letterSpacing: `${T.track}em`,
      }}
    >
      <span className="mask"><span>{p.title}</span></span>
    </h1>
  );

  return (
    <>
      {/* The project's own instrument, running the full length of the page.
          Sits above the veil (z-2) — the veil exists to protect body copy from the
          global particle field, and it was crushing the signature to nothing. */}
      <div className="fixed inset-0 z-[3] pointer-events-none" style={{ opacity: T.sigA }} aria-hidden>
        <Signature kind={T.sig} accent={A} accent2={A2} ink={T.ink} />
      </div>

      {/* plate, parallaxed behind everything on this route */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden>
        <div
          ref={plateRef}
          className="absolute -left-[6%] -top-[12%] w-[112%] h-[124%] bg-cover bg-center will-change-transform"
          style={{ backgroundImage: `url(/plates/${T.plate}.jpg)`, opacity: 0.07 }}
        />
        {/* the language itself, oversized and drifting — shaped by a browser at
            build time, so no Tamil font ships to the visitor */}
        {T.texture && (
          <div
            ref={texRef}
            className="absolute left-[-6%] top-[26%] w-[74%] bg-contain bg-no-repeat bg-left will-change-transform"
            style={{
              backgroundImage: `url(/plates/${T.texture}.png)`,
              aspectRatio: '1172 / 420',
              opacity: 0.055,
            }}
          />
        )}
      </div>

      <div ref={wipeRef} className="wipe" style={{ background: A }} aria-hidden />

      <Rail key={p.slug} accent={A} />

      {/* ── hero ── */}
      <section
        className={`relative w-full gutter min-h-screen flex flex-col pt-[120px] in ${
          R.hero === 'centre' ? 'justify-center items-center text-center' : 'justify-end'
        } pb-[clamp(44px,7vh,88px)]`}
        data-enter={R.enter}
      >
        {R.hero !== 'centre' && (
          <div className="absolute inset-0 -z-[1] opacity-[0.30] pointer-events-none">
            <Motif kind={T.motif as MotifKind} accent={A} />
          </div>
        )}
        <Link to="/" data-cur className="mono uppercase mb-8 inline-block w-fit" style={{ color: A }}>
          ← index
        </Link>
        <div ref={heroRef} className="will-change-transform w-full">
          <div className="tag fade mb-5 flex flex-wrap items-center gap-x-4 gap-y-1"
            style={{ justifyContent: R.hero === 'centre' ? 'center' : 'flex-start' }}>
            <span style={{ color: A2 }}>{T.name}</span>
            <span className="opacity-50">
              {p.tier === 'A' ? 'case study — full evidence' : 'case study'}
            </span>
          </div>
          {heroTitle}
          <p className={`lede fade d1 mt-6 !max-w-[32ch] ${R.hero === 'centre' ? 'mx-auto' : ''}`}>
            {p.tagline}
          </p>
        </div>
        <div className={`rule mt-10 pt-6 grid grid-cols-2 md:grid-cols-4 gap-6 w-full ${
          R.hero === 'centre' ? 'text-left' : ''}`}>
          {(cs?.results ?? p.metrics).slice(0, 4).map((m, i) => (
            <div key={m.k} className="fade d2" style={{ transitionDelay: `${0.3 + i * 0.07}s` }}>
              <div
                className="text-[clamp(24px,3.4vw,52px)] font-semibold leading-[.86] tracking-[-.045em]"
                style={{ fontVariationSettings: "'wdth' 88", color: A }}
              >
                {m.v}
              </div>
              <div className="mono mt-2 uppercase">{m.k}</div>
            </div>
          ))}
        </div>
      </section>

      {!cs ? (
        <Chapter label="what it is" enter={R.enter} className="pb-[220px]">
          <p className="lede fade !max-w-[28ch]">{p.blurb}</p>
          <div className="mono mt-10 flex flex-wrap gap-x-8 gap-y-3 uppercase">
            {p.repo && <a href={p.repo} target="_blank" rel="noopener noreferrer" style={{ color: A }}>source →</a>}
            {p.demo && <a href={p.demo} target="_blank" rel="noopener noreferrer" style={{ color: A }}>live →</a>}
          </div>
        </Chapter>
      ) : (
        <>
          <Chapter label="the problem" enter={R.enter} min="86vh">
            <div className="grid md:grid-cols-2 gap-[clamp(26px,5vw,88px)] items-start">
              <h2 className="h-big" style={{ letterSpacing: `${T.track}em` }}>
                <span className="mask"><span>The</span></span>
                <span className="mask"><span>problem</span></span>
              </h2>
              <p className="lede fade d1 !max-w-[34ch]">{cs.problem}</p>
            </div>
          </Chapter>

          <Chapter label="the approach" enter={R.enter}>
            <div className="grid md:grid-cols-2 gap-[clamp(26px,5vw,88px)] items-start">
              <p className="body-t fade !max-w-[52ch] text-[clamp(15px,1.2vw,19px)]">{cs.approach}</p>
              {cs.dataset && (
                <div className="fade d1 p-6" style={{ border: '1px solid rgb(var(--hair))' }}>
                  <div className="mono uppercase mb-2" style={{ color: A2 }}>dataset</div>
                  <p className="body-t">{cs.dataset}</p>
                </div>
              )}
            </div>
          </Chapter>

          <Chapter label="pipeline" enter={R.enter}>
            <Pipeline phases={cs.pipeline} style={R.pipe} />
          </Chapter>

          <Chapter label="results" enter={R.enter}>
            <div className="grid lg:grid-cols-[1.15fr_.85fr] gap-[clamp(26px,5vw,72px)] items-center">
              <Results metrics={cs.results} style={R.res} />
              <div className="fade d1 h-[260px] lg:h-[400px] opacity-80 hidden lg:block">
                <Motif kind={T.motif as MotifKind} accent={A} />
              </div>
            </div>
          </Chapter>

          {cs.challenges && cs.challenges.length > 0 && (
            <Chapter label="what was hard" enter={R.enter}>
              <div className="grid md:grid-cols-2 gap-x-[clamp(26px,5vw,72px)] gap-y-px">
                {cs.challenges.map((c, i) => (
                  <div key={c} className="fade flex gap-4 border-b py-5"
                    style={{ borderColor: 'rgb(var(--hair))', transitionDelay: `${i * 0.07}s` }}>
                    <span className="mono shrink-0 pt-1" style={{ color: A2 }}>—</span>
                    <p className="body-t !max-w-none">{c}</p>
                  </div>
                ))}
              </div>
            </Chapter>
          )}

          {cs.honest && (
            <Chapter label="an honest note" enter={R.enter} min="72vh">
              <p className="lede fade !max-w-[38ch] !text-[clamp(16px,1.7vw,24px)]"
                style={{ borderLeft: `2px solid ${A2}`, paddingLeft: '1.4em' }}>
                {cs.honest}
              </p>
            </Chapter>
          )}

          <Chapter label="stack" enter={R.enter}>
            <div className="flex flex-wrap gap-x-7 gap-y-3">
              {cs.stack.map((s, i) => (
                <span key={s} className="fade text-[clamp(16px,1.8vw,26px)] font-light tracking-[-.02em]"
                  style={{ transitionDelay: `${i * 0.035}s` }}>{s}</span>
              ))}
            </div>
          </Chapter>

          <Chapter label="links" enter={R.enter} className="pb-[230px]">
            <div className="mono flex flex-wrap gap-x-8 gap-y-3 uppercase mb-14">
              {cs.repo && <a href={cs.repo} target="_blank" rel="noopener noreferrer" style={{ color: A }}>source →</a>}
              {cs.demo && <a href={cs.demo} target="_blank" rel="noopener noreferrer" style={{ color: A }}>live demo →</a>}
              {cs.paper && <a href={cs.paper} target="_blank" rel="noopener noreferrer" style={{ color: A }}>paper →</a>}
            </div>
            <div className="rule pt-8">
              <div className="mono uppercase mb-5">next case study</div>
              <div className="flex flex-col">
                {others.map((x) => (
                  <Link
                    key={x.slug}
                    to={`/work/${x.slug}`}
                    data-cur
                    className="group flex items-baseline justify-between gap-6 border-b py-4 transition-transform
                               duration-500 hover:translate-x-2"
                    style={{ borderColor: 'rgb(var(--hair))' }}
                  >
                    <span className="h-mid !text-[clamp(18px,2vw,30px)]">{x.title}</span>
                    <span className="mono uppercase opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: x.theme.accent }}>{x.theme.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </Chapter>
        </>
      )}
    </>
  );
}
