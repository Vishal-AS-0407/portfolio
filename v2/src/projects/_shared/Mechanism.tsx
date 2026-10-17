/* The pinned "mechanism" section every case study carries: a scroll storyboard
   whose stage is a 3D scene of the project's actual pipeline, ending in a panel
   where the reader takes control. Structure only — every class is prefixed by
   the page and styled in the page's own stylesheet.
   docs/design/subpages-mechanism.md */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createStage, type Stage } from './stage3d';
import { prefersReduced, isCoarse } from './reduced';

export type Beat = { tag: string; h: string; body: string };
export type Control =
  | { kind: 'choice'; key: string; label: string; options: { v: string; label: string }[]; initial: string }
  | { kind: 'range'; key: string; label: string; min: number; max: number; step: number; initial: number; format: (v: number) => string };

export type SceneFrame = {
  /** 0..1 through the storyboard (1 = the reader's turn) */
  p: number;
  /** active panel, 0..beats.length (last = free) */
  beat: number;
  /** progress within the active panel */
  local: number;
  t: number;
  dt: number;
  free: boolean;
  reduced: boolean;
};
export type MechScene = {
  frame: (f: SceneFrame) => void;
  control?: (key: string, value: string | number) => void;
  dispose?: () => void;
};
export type Builder = (stage: Stage, env: { reduced: boolean; coarse: boolean; readout: (s: string) => void }) => MechScene;

export default function Mechanism({
  prefix, id, eyebrow, title, beats, free, note, controls = [], build, stageOpts, snap = false, after,
}: {
  prefix: string;
  id: string;
  eyebrow: string;
  title: string;
  beats: Beat[];
  free: Beat & { hint: string };
  note: string;
  controls?: Control[];
  build: Builder;
  stageOpts?: Parameters<typeof createStage>[1];
  /** emit scroll-snap markers (for pages whose own scroller snaps) */
  snap?: boolean;
  after?: ReactNode;
}) {
  const sec = useRef<HTMLElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const read = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<MechScene | null>(null);
  const [reduced] = useState(prefersReduced);
  const [beat, setBeat] = useState(reduced ? beats.length : 0);
  const [failed, setFailed] = useState(false);
  const [vals, setVals] = useState<Record<string, string | number>>(() =>
    Object.fromEntries(controls.map((c) => [c.key, c.initial])));
  const n = beats.length;

  useEffect(() => {
    const canvas = cv.current, el = sec.current;
    if (!canvas || !el) return;
    const stage = createStage(canvas, stageOpts);
    if (!stage) { setFailed(true); return; }
    const readout = (s: string) => { if (read.current && read.current.textContent !== s) read.current.textContent = s; };
    let scene: MechScene;
    try {
      scene = build(stage, { reduced, coarse: isCoarse(), readout });
    } catch (e) {
      console.warn('[mechanism] scene failed', e);
      stage.dispose(); setFailed(true); return;
    }
    sceneRef.current = scene;
    controls.forEach((c) => scene.control?.(c.key, c.initial));

    let visible = false, id = 0, last = performance.now(), ps = reduced ? 1 : 0, lastBeat = -1;
    const t0 = last;
    const loop = (now: number) => {
      id = requestAnimationFrame(loop);
      if (document.hidden || !visible) { last = now; return; }
      const dt = Math.min(3, (now - last) / 16.667);
      last = now;
      let p = 1;
      if (!reduced) {
        const r = el.getBoundingClientRect();
        p = Math.max(0, Math.min(1, -r.top / Math.max(1, r.height - window.innerHeight)));
      }
      ps += (p - ps) * Math.min(1, 0.14 * dt);
      if (Math.abs(p - ps) < 0.0005) ps = p;
      const span = ps * (n + 1);
      const b = Math.min(n, Math.floor(span));
      if (b !== lastBeat) { lastBeat = b; setBeat(b); }
      stage.step(dt);
      scene.frame({ p: ps, beat: b, local: Math.min(1, span - b), t: (now - t0) / 1000, dt, free: b === n, reduced });
      stage.render();
    };
    const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; }, { rootMargin: '100px 0px' });
    io.observe(el);
    id = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(id);
      io.disconnect();
      scene.dispose?.();
      stage.dispose();
      sceneRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = (k: string, v: string | number) => {
    setVals((o) => ({ ...o, [k]: v }));
    sceneRef.current?.control?.(k, v);
  };

  const P = (s: string) => `${prefix}-mx${s}`;
  const isFree = beat >= n;
  return (
    <section
      ref={sec}
      id={id}
      className={P('') + (reduced ? ` ${P('--still')}` : '')}
      style={{ position: 'relative', height: reduced ? 'auto' : `${(n + 1) * 100 + 60}vh` }}
      aria-labelledby={`${id}-h`}
    >
      <div className={P('-pin')} style={reduced ? { position: 'relative' } : { position: 'sticky', top: 0, height: '100vh' }}>
        {!failed && (
          <canvas
            ref={cv}
            className={P('-cv')}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block', touchAction: 'pan-y' }}
            aria-hidden
          />
        )}
        <header className={P('-head')}>
          <span className={P('-eyebrow')}>{eyebrow}</span>
          <h2 id={`${id}-h`} className={P('-title')}>{title}</h2>
        </header>

        <ol className={P('-beats')}>
          {beats.map((b, i) => (
            <li key={b.tag} className={P('-beat')} data-on={reduced || (i === beat && !isFree) ? '' : undefined}>
              <span className={P('-tag')}>{b.tag}</span>
              <h3 className={P('-h')}>{b.h}</h3>
              <p className={P('-body')}>{b.body}</p>
            </li>
          ))}
        </ol>

        <div className={P('-free')} data-on={isFree ? '' : undefined}>
          <span className={P('-tag')}>{free.tag}</span>
          <h3 className={P('-h')}>{free.h}</h3>
          <p className={P('-body')}>{free.body}</p>
          {controls.map((c) => (
            <div key={c.key} className={P('-ctl')} role="group" aria-label={c.label}>
              <span className={P('-ctl-label')}>{c.label}</span>
              {c.kind === 'choice' ? (
                <div className={P('-opts')}>
                  {c.options.map((o) => (
                    <button
                      key={o.v} type="button" className={P('-opt')} aria-pressed={vals[c.key] === o.v}
                      onClick={() => set(c.key, o.v)} tabIndex={isFree ? 0 : -1}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              ) : (
                <label className={P('-range')}>
                  <input
                    type="range" min={c.min} max={c.max} step={c.step} value={vals[c.key] as number}
                    onChange={(e) => set(c.key, Number(e.target.value))} tabIndex={isFree ? 0 : -1}
                  />
                  <output>{c.format(vals[c.key] as number)}</output>
                </label>
              )}
            </div>
          ))}
          <p className={P('-hint')}>{free.hint}</p>
        </div>

        <div className={P('-ticks')} aria-hidden>
          {[...beats, free].map((b, i) => (
            <i key={b.tag} data-on={i <= beat ? '' : undefined} data-now={i === beat ? '' : undefined} />
          ))}
        </div>
        <div ref={read} className={P('-read')} aria-live="off" />
        <p className={P('-note')}>{failed ? 'This scene needs WebGL, which this browser has turned off. ' : ''}{note}</p>
        {after}
      </div>
      {snap && !reduced && Array.from({ length: n + 1 }, (_, i) => (
        <div key={i} className={P('-snap')} aria-hidden
          style={{ position: 'absolute', left: 0, width: 1, height: 1, top: `${i * 100}vh`, pointerEvents: 'none' }} />
      ))}
    </section>
  );
}
