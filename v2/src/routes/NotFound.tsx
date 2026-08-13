import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { projects } from '@/data/content';
import { caseStudies } from '@/data/casestudies';

/* A 404 in the same vocabulary as the rest of the site: the route is a
   checkpoint that was never written. Offers the real ones instead. */
export default function NotFound() {
  const loc = useLocation();

  useEffect(() => {
    /* the home scroll may have left the plate inverted; start clean */
    document.body.classList.remove('inv', 'project');
    const root = document.documentElement;
    root.style.setProperty('--bg', '12 13 11');
    document.title = '404 — Vishal A S';
    return () => { root.style.removeProperty('--bg'); };
  }, []);

  const known = projects.filter((p) => caseStudies[p.slug]);

  return (
    <section className="relative w-full gutter min-h-screen flex flex-col justify-center py-[140px] in">
      <div className="tag fade mb-6">no checkpoint at this path</div>

      <h1
        className="font-semibold leading-[.78] tracking-[-.05em] text-[clamp(96px,26vw,340px)]"
        style={{ fontVariationSettings: "'wdth' 92", color: '#FE9F6D' }}
      >
        <span className="mask"><span>404</span></span>
      </h1>

      <p className="lede fade d1 mt-8 !max-w-[34ch]">
        Nothing was ever trained here.
      </p>
      <p className="mono fade d2 mt-4 uppercase opacity-70 break-all">
        requested&nbsp;·&nbsp;{loc.pathname}
      </p>

      <div className="rule mt-12 pt-8">
        <div className="mono uppercase mb-5">weights that do exist</div>
        <div className="flex flex-col">
          <Link
            to="/"
            data-cur
            className="fade h-mid !text-[clamp(18px,2vw,30px)] border-b py-4 transition-transform
                       duration-500 hover:translate-x-2"
            style={{ borderColor: 'rgb(var(--hair))' }}
          >
            ← back to the index
          </Link>
          {known.map((p, i) => (
            <Link
              key={p.slug}
              to={`/work/${p.slug}`}
              data-cur
              className="fade h-mid !text-[clamp(18px,2vw,30px)] border-b py-4 transition-transform
                         duration-500 hover:translate-x-2"
              style={{ borderColor: 'rgb(var(--hair))', transitionDelay: `${i * 0.04}s` }}
            >
              {p.title}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
