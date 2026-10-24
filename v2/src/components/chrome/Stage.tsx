/* Stage owns everything that must survive route changes:
   the plate parallax stack, the particle field, the veil and the grain.
   Mounted once in App, above the router outlet. */
import { useEffect, useRef } from 'react';
import { createField, type FieldHandle } from '@/lib/field';
import { onFrame, deviceTier, lerp, clamp, ss, state } from '@/lib/scroll';

/* [id, fadeInStart, fadeInEnd, fadeOutStart, fadeOutEnd, parallaxRate, scale, maxOpacity] */
const SCHEDULE: [string, number, number, number, number, number, number, number][] = [
  ['loss-surface', -0.05, 0.02, 0.11, 0.17, 0.16, 1.06, 0.34],
  ['spectrogram',   0.11, 0.17, 0.27, 0.33, 0.30, 1.00, 0.26],
  ['eeg',           0.27, 0.33, 0.44, 0.50, 0.22, 1.04, 0.22],
  ['embedding',     0.44, 0.50, 0.60, 0.66, 0.26, 1.02, 0.30],
  ['attention',     0.60, 0.66, 0.74, 0.80, 0.18, 1.00, 0.24],
  ['loss-surface',  0.74, 0.80, 0.88, 0.94, 0.14, 1.08, 0.18],
];

export default function Stage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const plateRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const tier = deviceTier();
    let field: FieldHandle | null = null;
    let disposed = false;
    let morphS = 0, invS = 0, lastInv = -1, fieldAlpha = 1;

    const canvas = canvasRef.current;
    if (canvas) {
      createField(canvas, tier).then((f) => {
        if (disposed) { f?.dispose(); return; }
        field = f;
        document.documentElement.dataset.params = String(f?.count ?? 0);
      });
    }

    const onResize = () => field?.resize();
    window.addEventListener('resize', onResize);

    const off = onFrame(({ p, vel, dt }) => {
      /* six formations mapped across the whole document */
      const morph =
        ss(0.05, 0.16, p) + ss(0.18, 0.30, p) + ss(0.32, 0.45, p) +
        ss(0.47, 0.60, p) + ss(0.62, 0.76, p);
      morphS = lerp(morphS, morph, Math.min(1, 0.09 * dt));

      const turb = (1 - ss(0.04, 0.72, p)) * 0.105 + 0.005;
      const inv = ss(0.80, 0.90, p);
      invS = lerp(invS, inv, Math.min(1, 0.1 * dt));
      const reveal = ss(0, 0.03, p) * 0.32 + 0.68;

      if ((inv > 0.5 ? 1 : 0) !== lastInv) {
        lastInv = inv > 0.5 ? 1 : 0;
        document.body.classList.toggle('inv', inv > 0.5);
      }
      document.documentElement.style.setProperty(
        '--bg',
        `${Math.round(lerp(12, 232, invS))} ${Math.round(lerp(13, 231, invS))} ${Math.round(lerp(11, 221, invS))}`
      );

      /* plate parallax — a case-study route brings its own plate, so stand down */
      const onProject = document.body.classList.contains('project');
      /* each case study now carries its own full-strength signature, so the
         global field stands almost all the way down rather than competing */
      fieldAlpha = lerp(fieldAlpha, onProject ? 0.10 : 1, Math.min(1, 0.08 * dt));
      for (let i = 0; i < SCHEDULE.length; i++) {
        const el = plateRefs.current[i];
        if (!el) continue;
        if (onProject) { el.style.opacity = '0'; continue; }
        const [, a, b, c, d, rate, sc, maxOp] = SCHEDULE[i];
        const o = ss(a, b, p) * (1 - ss(c, d, p));
        el.style.opacity = (o * maxOp).toFixed(3);
        if (o > 0.002) {
          const mid = (b + c) / 2;
          const off = (p - mid) * rate * window.innerHeight * 2.2;
          el.style.transform = `translate3d(0,${off.toFixed(1)}px,0) scale(${(sc + o * 0.03).toFixed(3)})`;
        }
      }

      field?.update({
        morph: morphS,
        turb,
        inv: invS,
        vel: clamp(vel * 0.006, -1.4, 1.4),
        reveal,
        rotY: p * 1.15 + Math.sin(performance.now() * 0.00013) * 0.08,
        rotX: -0.14 + Math.sin(performance.now() * 0.00017) * 0.045 + p * 0.09,
        dist: lerp(3.6, 2.7, ss(0, 0.55, p)),
        alpha: fieldAlpha,
      });
    });

    return () => {
      disposed = true;
      off();
      window.removeEventListener('resize', onResize);
      field?.dispose();
    };
  }, []);

  return (
    <>
      <div className="fixed inset-0 z-0 overflow-hidden" aria-hidden>
        {SCHEDULE.map(([id], i) => (
          <div
            key={`${id}-${i}`}
            ref={(el) => { plateRefs.current[i] = el; }}
            className="absolute -left-[6%] -top-[12%] w-[112%] h-[124%] bg-cover bg-center opacity-0 will-change-transform"
            style={{ backgroundImage: `url(/plates/${id}.jpg)` }}
          />
        ))}
      </div>
      <canvas ref={canvasRef} className="fixed inset-0 z-[1] w-full h-full block" aria-hidden />
      <div className="veil fixed inset-0 z-[2] pointer-events-none" aria-hidden />
      <div className="grain fixed z-[3] pointer-events-none" aria-hidden />
    </>
  );
}
