import { useEffect, useRef } from 'react';
import type { Phase } from '@/data/casestudies';
import { onScene } from '@/lib/projectfx';

export type PipeStyle = 'bands' | 'rail' | 'numeral' | 'hops' | 'layers' | 'cells';

/* Each phase parallaxes at its own rate so the sequence separates as it scrolls. */
function useStagger(rates: number[]) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const kids = Array.from(el.children) as HTMLElement[];
    return onScene(el, ({ p }) => {
      kids.forEach((k, i) => {
        const r = rates[i % rates.length];
        k.style.transform = `translate3d(0,${((p - 0.5) * r * -70).toFixed(1)}px,0)`;
      });
    });
  }, [rates]);
  return host;
}

export default function Pipeline({ phases, style }: { phases: Phase[]; style: PipeStyle }) {
  const host = useStagger(
    style === 'layers' ? [0.2, 0.55, 0.9, 0.35, 0.75, 0.15] :
    style === 'hops' ? [0.15, 0.5, 0.2, 0.6, 0.25, 0.45] : [0]
  );

  /* ── frequency bands — the audio page ── */
  if (style === 'bands') {
    return (
      <div className="flex flex-col">
        {phases.map((ph, i) => (
          <div key={ph.n}
            className="fade band-row relative grid md:grid-cols-[64px_1fr] gap-4 md:gap-8 py-7 overflow-hidden"
            style={{ transitionDelay: `${i * 0.07}s` }}>
            <i className="absolute left-0 bottom-0 h-px w-full" style={{ background: 'rgb(var(--hair))' }} />
            <i className="bandfill absolute left-0 top-0 h-full"
              style={{
                ['--w' as string]: `${34 + (i / phases.length) * 62}%`,
                background: 'rgb(var(--accent))',
                animationDelay: `${0.1 + i * 0.09}s`,
              }} />
            <span className="mono relative" style={{ color: 'rgb(var(--accent2))' }}>{ph.n}</span>
            <div className="relative">
              <div className="h-mid !text-[clamp(17px,1.8vw,27px)] mb-2">{ph.title}</div>
              <p className="body-t !max-w-[64ch]">{ph.body}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  /* ── a chart-recorder rail — the EEG page ── */
  if (style === 'rail') {
    return (
      <div className="relative pl-[clamp(34px,6vw,86px)]">
        <i className="absolute left-[6px] top-0 bottom-0 w-px" style={{ background: 'rgb(var(--hair))' }} />
        {phases.map((ph, i) => (
          <div key={ph.n} className="fade relative pb-11" style={{ transitionDelay: `${i * 0.08}s` }}>
            <i className="absolute -left-[clamp(34px,6vw,86px)] top-[9px] w-[13px] h-[13px] rounded-full"
              style={{ background: 'rgb(var(--bg))', border: '2px solid rgb(var(--accent))', marginLeft: 0 }} />
            <i className="absolute -left-[clamp(22px,4.6vw,70px)] top-[14px] h-px w-[clamp(14px,3vw,44px)]"
              style={{ background: 'rgb(var(--hair))' }} />
            <div className="mono uppercase mb-2" style={{ color: 'rgb(var(--accent2))' }}>
              t{ph.n} — {ph.title}
            </div>
            <p className="body-t !max-w-[62ch]">{ph.body}</p>
          </div>
        ))}
      </div>
    );
  }

  /* ── editorial numerals — the language page ── */
  if (style === 'numeral') {
    return (
      <div className="flex flex-col">
        {phases.map((ph, i) => (
          <div key={ph.n}
            className="fade grid md:grid-cols-[auto_1fr] gap-x-[clamp(18px,4vw,64px)] gap-y-2 border-t py-9"
            style={{ borderColor: 'rgb(var(--hair))', transitionDelay: `${i * 0.08}s` }}>
            <span className="font-semibold leading-[.78] tracking-[-.06em] text-[clamp(52px,8vw,124px)] opacity-[.22]"
              style={{ fontVariationSettings: "'wdth' 78", color: 'rgb(var(--accent))' }}>
              {ph.n}
            </span>
            <div className="self-center">
              <div className="h-mid !text-[clamp(20px,2.4vw,38px)] mb-3">{ph.title}</div>
              <p className="body-t !max-w-[58ch]">{ph.body}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  /* ── offset hops — federated clients, graph phases ── */
  if (style === 'hops') {
    return (
      <div ref={host} className="flex flex-col gap-8">
        {phases.map((ph, i) => (
          <div key={ph.n}
            className="fade will-change-transform"
            style={{
              marginLeft: `${(i % 3) * 7}%`,
              maxWidth: '78%',
              transitionDelay: `${i * 0.08}s`,
            }}>
            <div className="relative p-6 md:p-8" style={{ border: '1px solid rgb(var(--hair))' }}>
              <i className="absolute -top-[5px] -left-[5px] w-[10px] h-[10px]" style={{ background: 'rgb(var(--accent))' }} />
              <div className="mono uppercase mb-3" style={{ color: 'rgb(var(--accent2))' }}>node {ph.n}</div>
              <div className="h-mid !text-[clamp(17px,1.9vw,28px)] mb-3">{ph.title}</div>
              <p className="body-t !max-w-[58ch]">{ph.body}</p>
            </div>
            {i < phases.length - 1 && (
              <i className="block w-px h-9 ml-8" style={{ background: 'rgb(var(--hair))' }} />
            )}
          </div>
        ))}
      </div>
    );
  }

  /* ── stacked layers — camera trap, memory strata ── */
  if (style === 'layers') {
    return (
      <div ref={host} className="flex flex-col gap-5">
        {phases.map((ph, i) => (
          <div key={ph.n}
            className="fade will-change-transform p-6 md:p-8"
            style={{
              background: 'rgb(var(--bg) / .55)',
              border: '1px solid rgb(var(--hair))',
              marginRight: `${(phases.length - i - 1) * 4}%`,
              backdropFilter: 'blur(3px)',
              transitionDelay: `${i * 0.07}s`,
            }}>
            <div className="flex items-baseline gap-4 mb-3">
              <span className="mono" style={{ color: 'rgb(var(--accent2))' }}>{ph.n}</span>
              <span className="h-mid !text-[clamp(17px,1.9vw,28px)]">{ph.title}</span>
            </div>
            <p className="body-t !max-w-[62ch]">{ph.body}</p>
          </div>
        ))}
      </div>
    );
  }

  /* ── matrix cells — the SDG page ── */
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px">
      {phases.map((ph, i) => (
        <div key={ph.n} className="fade p-6 md:p-7"
          style={{
            background: 'rgb(var(--bg))',
            boxShadow: '0 0 0 1px rgb(var(--hair))',
            transitionDelay: `${i * 0.06}s`,
          }}>
          <div className="flex items-baseline justify-between mb-3">
            <span className="mono" style={{ color: 'rgb(var(--accent2))' }}>{ph.n}</span>
            <i className="h-[7px] w-[7px]" style={{ background: 'rgb(var(--accent))' }} />
          </div>
          <div className="h-mid !text-[clamp(16px,1.6vw,23px)] mb-3">{ph.title}</div>
          <p className="body-t !max-w-none !text-[14px]">{ph.body}</p>
        </div>
      ))}
    </div>
  );
}
