import { useEffect, useRef, useState } from 'react';
import { onFrame, deviceTier, clamp } from '@/lib/scroll';

/* A chapter rail down the right edge of a case study: one tick per chapter,
   filling with the project's accent as you move through the page. Desktop only —
   on a phone there is no margin to put it in. */
export default function Rail({ accent }: { accent: string }) {
  const [labels, setLabels] = useState<string[]>([]);
  const host = useRef<HTMLDivElement>(null);
  const fill = useRef<HTMLDivElement>(null);
  const ticks = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (deviceTier() < 2) return;
    /* the chapters render after this mounts, so read them on the next tick */
    const id = setTimeout(() => {
      const els = Array.from(document.querySelectorAll<HTMLElement>('.case-ch'));
      setLabels(els.map((e) => e.querySelector('.tag')?.textContent?.trim() || ''));
    }, 60);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!labels.length) return;
    const els = Array.from(document.querySelectorAll<HTMLElement>('.case-ch'));
    return onFrame(() => {
      const vh = window.innerHeight;
      const doc = Math.max(1, document.documentElement.scrollHeight - vh);
      const p = clamp(window.scrollY / doc, 0, 1);
      if (fill.current) fill.current.style.transform = `scaleY(${p.toFixed(4)})`;

      let active = -1;
      let best = Infinity;
      els.forEach((e, i) => {
        const r = e.getBoundingClientRect();
        const d = Math.abs(r.top + r.height / 2 - vh / 2);
        if (d < best) { best = d; active = i; }
      });
      ticks.current.forEach((t, i) => {
        if (!t) return;
        const on = i === active;
        t.style.opacity = on ? '1' : '.32';
        t.style.transform = `scaleX(${on ? 1 : 0.42})`;
        /* the rail is pointer-events:none, so the active chapter names itself
           rather than waiting for a hover that can never arrive */
        const lb = t.previousElementSibling as HTMLElement | null;
        if (lb) lb.style.opacity = on ? '.7' : '0';
      });
      if (host.current) host.current.style.opacity = p > 0.03 && p < 0.985 ? '1' : '0';
    });
  }, [labels]);

  if (!labels.length) return null;

  return (
    <div
      ref={host}
      className="fixed right-[clamp(14px,2.2vw,34px)] top-1/2 -translate-y-1/2 z-30 hidden lg:flex
                 flex-col items-end gap-[10px] pointer-events-none opacity-0
                 transition-opacity duration-700"
      aria-hidden
    >
      <div className="absolute right-[3px] top-0 bottom-0 w-px" style={{ background: 'rgb(var(--hair))' }}>
        <div ref={fill} className="w-full h-full origin-top" style={{ background: accent, transform: 'scaleY(0)' }} />
      </div>
      {labels.map((l, i) => (
        <div key={`${l}-${i}`} className="flex items-center gap-2 justify-end">
          <span className="mono uppercase whitespace-nowrap opacity-0 transition-opacity duration-300"
            style={{ fontSize: 9 }}>{l}</span>
          <div
            ref={(el) => { ticks.current[i] = el; }}
            className="h-px w-[18px] origin-right transition-[transform,opacity] duration-500"
            style={{ background: accent, opacity: 0.32, transform: 'scaleX(.42)' }}
          />
        </div>
      ))}
    </div>
  );
}
