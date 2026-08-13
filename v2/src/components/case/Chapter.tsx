import { useEffect, useRef, type ReactNode } from 'react';
import { onScene } from '@/lib/projectfx';

export type Enter =
  | 'blur' | 'jitter' | 'word' | 'seal' | 'depth' | 'slab' | 'node' | 'cell';

/* A case-study chapter. `enter` picks the project's own arrival gesture — it is
   set once per page, so every block on a page moves the same way and no two
   pages move the same way. `rail` parallaxes the label against the copy. */
export default function Chapter({
  label, enter, children, min = 'auto', className = '', rail = true, id,
}: {
  label?: string;
  enter: Enter;
  children: ReactNode;
  min?: string;
  className?: string;
  rail?: boolean;
  id?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) el.classList.add('in'); }),
      { rootMargin: '0px 0px -14% 0px', threshold: 0.08 }
    );
    io.observe(el);

    let offRail = () => {};
    if (rail && labelRef.current) {
      const lb = labelRef.current;
      offRail = onScene(el, ({ p }) => {
        lb.style.transform = `translate3d(0,${((p - 0.5) * -46).toFixed(1)}px,0)`;
      });
    }
    return () => { io.disconnect(); offRail(); };
  }, [rail]);

  return (
    <section
      ref={ref}
      id={id}
      data-enter={enter}
      className={`case-ch relative w-full gutter band flex flex-col justify-center ${className}`}
      style={{ minHeight: min }}
    >
      {label && (
        <div ref={labelRef} className="tag fade mb-6 will-change-transform">{label}</div>
      )}
      {children}
    </section>
  );
}
