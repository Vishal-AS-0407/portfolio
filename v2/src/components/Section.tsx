import { useEffect, useRef, type ReactNode } from 'react';

/* A section reveals once when it enters. Adding `.in` lets the CSS
   mask/fade transitions run — compositor only, no JS animation. */
export default function Section({
  id, label, children, className = '', min = '100vh',
}: {
  id?: string; label?: string; children: ReactNode; className?: string; min?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) el.classList.add('in'); }),
      { rootMargin: '0px 0px -12% 0px', threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <section
      ref={ref}
      id={id}
      className={`relative w-full gutter band flex flex-col justify-center ${className}`}
      style={{ minHeight: min }}
    >
      {label && <div className="tag fade mb-6">{label}</div>}
      {children}
    </section>
  );
}
