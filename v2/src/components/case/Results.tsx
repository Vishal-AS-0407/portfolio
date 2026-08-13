import { useEffect, useRef } from 'react';
import type { Metric } from '@/data/casestudies';
import { counter, once, scramble } from '@/lib/projectfx';

export type ResultStyle = 'meter' | 'gauge' | 'cipher' | 'bar' | 'reticle' | 'plain';

const num = (v: string) => {
  const m = v.match(/-?[\d.]+/);
  return m ? parseFloat(m[0]) : null;
};
/* 0..1 for anything that reads as a proportion, else null */
const frac = (v: string) => {
  const n = num(v);
  if (n === null) return null;
  if (v.includes('%')) return Math.min(1, n / 100);
  if (n <= 1) return n;
  return null;
};

function Value({ m, style, i }: { m: Metric; style: ResultStyle; i: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return once(el, () => {
      if (style === 'cipher') scramble(el, m.v, { hold: i * 0.35, speed: 0.05 });
      else counter(el, m.v, 1.5 + i * 0.15);
    });
  }, [m.v, style, i]);
  return (
    <div
      ref={ref}
      className="res-v text-[clamp(26px,3.6vw,58px)] font-semibold leading-[.86] tracking-[-.045em] tabular-nums"
      style={{ fontVariationSettings: "'wdth' 88", color: 'rgb(var(--accent))' }}
    >
      {m.v}
    </div>
  );
}

export default function Results({ metrics, style }: { metrics: Metric[]; style: ResultStyle }) {
  /* ── vertical level meters — the audio page ── */
  if (style === 'meter') {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-[clamp(14px,2vw,28px)]">
        {metrics.map((m, i) => {
          const f = frac(m.v) ?? 0.82;
          return (
            <div key={m.k} className="fade flex gap-4" style={{ transitionDelay: `${i * 0.09}s` }}>
              <div className="meter relative w-[10px] shrink-0 self-stretch min-h-[120px]"
                style={{ background: 'rgb(var(--hair))' }}>
                <i style={{ ['--f' as string]: f, background: 'rgb(var(--accent))' }} />
                <b style={{ background: 'rgb(var(--accent2))', bottom: `${f * 100}%` }} />
              </div>
              <div>
                <Value m={m} style={style} i={i} />
                <div className="mono mt-2 uppercase">{m.k}</div>
                {m.note && <div className="body-t !text-[13px] mt-2">{m.note}</div>}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  /* ── radial gauges — the EEG page ── */
  if (style === 'gauge') {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-[clamp(18px,2.4vw,34px)]">
        {metrics.map((m, i) => {
          const f = frac(m.v) ?? 0.86;
          const C = 2 * Math.PI * 52;
          return (
            <div key={m.k} className="fade flex flex-col items-start" style={{ transitionDelay: `${i * 0.1}s` }}>
              <div className="relative w-full max-w-[132px] aspect-square mb-3">
                <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="rgb(var(--hair))" strokeWidth="6" />
                  <circle
                    cx="60" cy="60" r="52" fill="none" stroke="rgb(var(--accent))" strokeWidth="6"
                    strokeLinecap="round" className="gauge"
                    style={{
                      strokeDasharray: C,
                      ['--to' as string]: `${C * (1 - f)}`,
                      strokeDashoffset: C,
                      animationDelay: `${0.15 + i * 0.12}s`,
                    }}
                  />
                </svg>
              </div>
              <Value m={m} style={style} i={i} />
              <div className="mono mt-2 uppercase">{m.k}</div>
              {m.note && <div className="body-t !text-[13px] mt-2">{m.note}</div>}
            </div>
          );
        })}
      </div>
    );
  }

  /* ── ciphertext that decrypts — the homomorphic-encryption page ── */
  if (style === 'cipher') {
    /* cells are outlined individually — a container background would leave a slab
       of hairline colour wherever the last row is short */
    return (
      <div className="grid md:grid-cols-2 gap-px">
        {metrics.map((m, i) => (
          <div key={m.k} className="fade relative p-6 md:p-8 overflow-hidden"
            style={{
              background: 'rgb(var(--bg))',
              boxShadow: '0 0 0 1px rgb(var(--hair))',
              transitionDelay: `${i * 0.08}s`,
            }}>
            <div className="mono uppercase mb-3 opacity-60">sealed · ckks</div>
            <Value m={m} style={style} i={i} />
            <div className="mono mt-2 uppercase">{m.k}</div>
            {m.note && <div className="body-t !text-[13px] mt-2">{m.note}</div>}
            <i className="decrypt absolute left-0 top-0 h-full w-[2px]"
              style={{ background: 'rgb(var(--accent2))', animationDelay: `${i * 0.35}s` }} />
          </div>
        ))}
      </div>
    );
  }

  /* ── growing bars — the matrix / strata pages ── */
  if (style === 'bar') {
    return (
      <div className="flex flex-col">
        {metrics.map((m, i) => {
          const f = frac(m.v) ?? 0.7;
          return (
            <div key={m.k} className="fade border-t py-6"
              style={{ borderColor: 'rgb(var(--hair))', transitionDelay: `${i * 0.08}s` }}>
              <div className="flex flex-wrap items-baseline justify-between gap-4">
                <Value m={m} style={style} i={i} />
                <div className="mono uppercase">{m.k}</div>
              </div>
              <div className="mt-4 h-[3px] w-full" style={{ background: 'rgb(var(--hair))' }}>
                <i className="growbar block h-full"
                  style={{
                    ['--f' as string]: f,
                    background: 'rgb(var(--accent))',
                    animationDelay: `${0.1 + i * 0.1}s`,
                  }} />
              </div>
              {m.note && <div className="body-t !text-[13px] mt-3">{m.note}</div>}
            </div>
          );
        })}
      </div>
    );
  }

  /* ── classifier reticles — the camera-trap page ── */
  if (style === 'reticle') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[clamp(16px,2.4vw,30px)]">
        {metrics.map((m, i) => (
          <div key={m.k} className="fade reticle relative p-6 md:p-8"
            style={{ transitionDelay: `${i * 0.09}s` }}>
            <Value m={m} style={style} i={i} />
            <div className="mono mt-2 uppercase">{m.k}</div>
            {m.note && <div className="body-t !text-[13px] mt-2">{m.note}</div>}
          </div>
        ))}
      </div>
    );
  }

  /* ── plain, but large — typeset and graph pages ── */
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-px">
      {metrics.map((m, i) => (
        <div key={m.k} className="fade p-5 md:p-7"
          style={{
            background: 'rgb(var(--bg))',
            boxShadow: '0 0 0 1px rgb(var(--hair))',
            transitionDelay: `${i * 0.07}s`,
          }}>
          <Value m={m} style={style} i={i} />
          <div className="mono mt-2 uppercase">{m.k}</div>
          {m.note && <div className="body-t !text-[13px] mt-2">{m.note}</div>}
        </div>
      ))}
    </div>
  );
}
