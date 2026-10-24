import { useEffect, useRef, useState } from 'react';
import { onFrame, lerp, deviceTier, state } from '@/lib/scroll';
import { profile } from '@/data/content';

/* ── HUD: the training readout. Bottom band + left rail only —
   the top band stays clear so headings never collide with it. ── */
export function Hud() {
  const ep = useRef<HTMLElement>(null);
  const lv = useRef<HTMLElement>(null);
  const st = useRef<HTMLElement>(null);
  const fill = useRef<HTMLDivElement>(null);
  const curve = useRef<HTMLCanvasElement>(null);
  const [params, setParams] = useState('—');

  useEffect(() => {
    const t = setTimeout(
      () => setParams(Number(document.documentElement.dataset.params || 0).toLocaleString()),
      1500
    );
    const STATES: [number, string][] = [
      [0, 'initialising'], [0.13, 'forward pass'], [0.3, 'back-prop'],
      [0.5, 'converging'], [0.72, 'validated'], [0.88, 'inference'],
    ];
    const off = onFrame(({ p }) => {
      if (ep.current) ep.current.textContent = String(Math.round(p * 100)).padStart(4, '0');
      if (lv.current) lv.current.textContent = (4.8271 * Math.pow(1 - p, 3.1) + 0.0041).toFixed(4);
      if (fill.current) fill.current.style.height = (p * 100).toFixed(1) + '%';
      let s = 'initialising';
      for (const [k, v] of STATES) if (p >= k) s = v;
      if (st.current) st.current.textContent = state.hud || 'state: ' + s;

      const c = curve.current;
      if (c && c.offsetParent !== null) {
        const x = c.getContext('2d')!;
        const W = c.width, H = c.height;
        x.clearRect(0, 0, W, H);
        x.strokeStyle = document.body.classList.contains('inv')
          ? 'rgba(20,21,15,.16)' : 'rgba(239,239,231,.13)';
        x.lineWidth = 2;
        x.beginPath(); x.moveTo(0, H - 1); x.lineTo(W, H - 1); x.stroke();
        const g = x.createLinearGradient(0, 0, W, 0);
        g.addColorStop(0, '#3B0F70'); g.addColorStop(.4, '#8C2981');
        g.addColorStop(.7, '#DE4968'); g.addColorStop(1, '#FE9F6D');
        x.strokeStyle = g; x.lineWidth = 2.6; x.lineJoin = 'round';
        x.beginPath();
        const n = 80;
        for (let i = 0; i <= n * p; i++) {
          const t2 = i / n;
          /* loss descends: high and noisy at the start, flat near convergence */
          const y = 5 + (H - 12) * (1 - Math.pow(1 - t2, .34))
            + Math.sin(t2 * 34) * 5 * (1 - t2) * (1 - t2) + Math.sin(t2 * 77) * 2 * (1 - t2);
          const yy = Math.max(3, Math.min(H - 2, y));
          i ? x.lineTo(t2 * W, yy) : x.moveTo(t2 * W, yy);
        }
        x.stroke();
      }
    });
    return () => { off(); clearTimeout(t); };
  }, []);

  return (
    <>
      <div className="hud-scrim" aria-hidden />
      <div className="fixed left-0 top-0 w-[2px] h-screen z-20" style={{ background: 'rgb(var(--hair))' }}>
        <div ref={fill} className="absolute top-0 left-0 w-full h-0"
          style={{ background: 'linear-gradient(180deg,#3B0F70,#8C2981,#DE4968,#FE9F6D)' }} />
      </div>
      {/* the readout is a desktop affordance — on a phone it collides with
          the hero and the escape hatch, so the left rail carries it alone */}
      <div className="mono fixed bottom-4 left-[clamp(20px,5vw,92px)] z-20 pointer-events-none uppercase hidden sm:block">
        <canvas ref={curve} width={240} height={72} className="block w-[120px] h-[36px] opacity-90" />
        <div className="mt-1">training loss <b ref={lv} className="font-medium" style={{ color: 'rgb(var(--dim))' }}>4.8271</b></div>
      </div>
      <div className="mono fixed bottom-[18px] right-[clamp(20px,5vw,92px)] z-20 text-right pointer-events-none uppercase leading-relaxed hidden sm:block">
        epoch <b ref={ep} className="font-medium" style={{ color: 'rgb(var(--dim))' }}>0000</b> / 0100
        {' · '}<span ref={st}>state: initialising</span>
        <br /><b className="font-medium" style={{ color: 'rgb(var(--dim))' }}>{params} params</b>
      </div>
    </>
  );
}

/* ── custom cursor with inertia ──
   Delegated, so elements mounted later still grow it, and an
   element can put a word inside the ring with data-cur-label. */
export function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  const txt = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (deviceTier() < 2) return;
    let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my;
    let over: Element | null = null;
    const move = (e: PointerEvent) => { mx = e.clientX; my = e.clientY; };
    const enter = (e: PointerEvent) => {
      over = (e.target as Element | null)?.closest?.('a,button,[data-cur]') ?? null;
    };
    addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerover', enter, { passive: true });
    let lastLabel = '';
    const off = onFrame(({ dt }) => {
      cx = lerp(cx, mx, Math.min(1, 0.16 * dt));
      cy = lerp(cy, my, Math.min(1, 0.16 * dt));
      const el = ref.current;
      if (!el) return;
      el.style.transform = `translate(${cx}px,${cy}px)`;
      const label = (over && over.isConnected && over.getAttribute('data-cur-label')) || '';
      el.classList.toggle('big', !!over && over.isConnected);
      if (label !== lastLabel && txt.current) {
        lastLabel = label;
        txt.current.textContent = label;
        el.classList.toggle('lab', !!label);
      }
    });
    return () => {
      removeEventListener('pointermove', move);
      document.removeEventListener('pointerover', enter);
      off();
    };
  }, []);
  return <div ref={ref} className="cursor" aria-hidden><span ref={txt} /></div>;
}

/* ── the escape hatch to the plain site ── */
export function EscapeHatch() {
  const [show, setShow] = useState(false);
  useEffect(() => onFrame(({ p }) => setShow(p > 0.06)), []);
  return (
    <a
      href={profile.oldSite}
      data-cur
      className="mono fixed bottom-[18px] left-1/2 z-40 flex items-center gap-2 rounded-full
                 px-4 py-2 uppercase backdrop-blur-md transition-all duration-700"
      style={{
        border: '1px solid rgb(var(--hair))',
        background: 'rgb(var(--bg) / .8)',
        color: 'rgb(var(--dim))',
        transform: `translateX(-50%) translateY(${show ? '0' : '150%'})`,
        transitionTimingFunction: 'cubic-bezier(.16,1,.3,1)',
      }}
    >
      <span className="hidden sm:inline">too much?&nbsp;</span>
      <em className="not-italic whitespace-nowrap" style={{ color: '#FE9F6D' }}>
        see the plain version →
      </em>
    </a>
  );
}
