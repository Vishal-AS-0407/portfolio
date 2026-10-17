import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Section from '@/components/Section';
import { onFrame, clamp } from '@/lib/scroll';
import {
  profile, socials, stats, education, experience, projects, publications,
  patents, achievements, certifications, leadership, chess, hobbies, skills,
} from '@/data/content';
import { caseStudies } from '@/data/casestudies';

/* ── 01 · HERO — the name is type, never particles ── */
function Hero() {
  const name = useRef<HTMLHeadingElement>(null);
  useEffect(() =>
    onFrame(() => {
      const hp = clamp(window.scrollY / window.innerHeight, 0, 1);
      const el = name.current;
      if (!el) return;
      el.style.fontVariationSettings = `'wdth' ${(125 - hp * 58).toFixed(1)}`;
      el.style.transform = `translateY(${(hp * -80).toFixed(1)}px)`;
      el.style.opacity = String(1 - hp * 1.08);
    }), []);

  return (
    <section className="relative w-full gutter h-screen flex flex-col justify-end pb-[clamp(44px,7vh,88px)] in">
      <div className="tag fade">initialisation — epoch 0</div>
      <h1
        ref={name}
        className="font-bold uppercase leading-[.82] tracking-[-.05em] text-[clamp(52px,14.5vw,244px)] will-change-transform"
      >
        Vishal<br />A S
      </h1>
      <div className="rule mt-[clamp(18px,2.6vh,34px)] pt-4 flex flex-wrap items-end justify-between gap-9">
        <div className="fade d1 text-[clamp(14px,1.4vw,20px)]">{profile.role}</div>
        <div className="fade d2 mono uppercase flex items-center gap-2">
          <i className="w-[5px] h-[5px] rounded-full bg-[#DE4968] animate-pulse" />
          {profile.status} — {profile.location}
        </div>
      </div>
    </section>
  );
}

/* ── 02 · ABOUT — asymmetric, the lede carries it ── */
function About() {
  return (
    <Section id="about" label="loss surface — non-convex">
      <div className="grid md:grid-cols-2 gap-[clamp(26px,5vw,88px)] items-end">
        <h2 className="h-big">
          <span className="mask"><span>Every model</span></span>
          <span className="mask"><span>starts</span></span>
          <span className="mask"><span>lost</span></span>
        </h2>
        <div>
          <p className="lede fade d1">{profile.about1}</p>
          <p className="body-t fade d2 mt-6">{profile.about2}</p>
          <div className="fade d3 mt-8 grid grid-cols-3 gap-px" style={{ background: 'rgb(var(--hair))', border: '1px solid rgb(var(--hair))' }}>
            {stats.map((s) => (
              <div key={s.k} className="p-4 md:p-6" style={{ background: 'rgb(var(--bg))' }}>
                <div className="text-[clamp(30px,4vw,58px)] font-semibold leading-[.86] tracking-[-.045em]"
                  style={{ fontVariationSettings: "'wdth' 88" }}>{s.v}</div>
                <div className="mono mt-3 uppercase">{s.k}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ── 03 · WORK — an editorial index, not a card grid ── */
function Work() {
  return (
    <Section id="work" label="selected work — ranked by depth of evidence" min="auto">
      <h2 className="h-big mb-10">
        <span className="mask"><span>Signal</span></span>
        <span className="mask"><span>is just numbers</span></span>
      </h2>
      <div className="rule">
        {projects.map((p, i) => (
          /* each row carries its own project's accent, so hovering the index is
             a preview of the world that page opens into */
          <Link
            to={`/work/${p.slug}`}
            key={p.slug}
            data-cur
            className="work-row group relative block border-b py-6 md:py-8"
            style={{ borderColor: 'rgb(var(--hair))', ['--pa' as string]: p.theme.accent }}
          >
            <i className="work-wash" aria-hidden />
            <div className="relative flex flex-wrap items-baseline gap-x-6 gap-y-2">
              <span className="mono w-10 shrink-0">{String(i + 1).padStart(2, '0')}</span>
              <span className="h-mid flex-1 min-w-[240px] transition-transform duration-500 group-hover:translate-x-2">
                {p.title}
              </span>
              <span className="body-t !max-w-[34ch] hidden lg:block">{p.tagline}</span>
              <span className="mono shrink-0 transition-colors duration-300 group-hover:!text-[color:var(--pa)]"
                style={{ color: '#FE9F6D' }}>
                {p.metrics[0]?.v}
              </span>
            </div>
            <div className="relative mono mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
              <span>{p.tech.slice(0, 5).join(' · ')}</span>
              {caseStudies[p.slug] && (
                <span className="uppercase transition-colors duration-300 group-hover:!text-[color:var(--pa)]"
                  style={{ color: '#FE9F6D' }}>full case study →</span>
              )}
              <span className="work-name uppercase ml-auto" style={{ color: 'var(--pa)' }}>
                {p.theme.name}
              </span>
            </div>
          </Link>
        ))}
      </div>
      <a href={socials.github} target="_blank" rel="noopener noreferrer"
        className="mono mt-8 inline-block uppercase" style={{ color: '#FE9F6D' }}>
        all repositories on github →
      </a>
    </Section>
  );
}

/* ── 04 · RESEARCH — citation plates, with the links in context ── */
function Research() {
  return (
    <Section id="research" label="published — peer reviewed" min="auto">
      <div className="grid md:grid-cols-[1fr_auto] gap-8 items-end mb-10">
        <h2 className="h-big">
          <span className="mask"><span>Structure</span></span>
          <span className="mask"><span>is earned</span></span>
        </h2>
        <div className="fade d1 mono flex gap-5 uppercase">
          <a href={socials.scholar} target="_blank" rel="noopener noreferrer" style={{ color: '#FE9F6D' }}>google scholar →</a>
          <a href={socials.researchgate} target="_blank" rel="noopener noreferrer" style={{ color: '#FE9F6D' }}>researchgate →</a>
        </div>
      </div>
      <div className="flex flex-col gap-px" style={{ background: 'rgb(var(--hair))' }}>
        {publications.map((pub) => (
          <article key={pub.title} className="fade p-6 md:p-8" style={{ background: 'rgb(var(--bg))' }}>
            <div className="flex flex-wrap items-baseline justify-between gap-3 mb-3">
              <span className="mono uppercase">{pub.venue}</span>
              {pub.award && <span className="mono uppercase" style={{ color: '#DE4968' }}>{pub.award}</span>}
            </div>
            <h3 className="text-[clamp(17px,1.5vw,23px)] font-medium leading-snug max-w-[62ch]">{pub.title}</h3>
            <div className="mono mt-3 opacity-80">{pub.detail}</div>
            {pub.url && (
              <a href={pub.url} target="_blank" rel="noopener noreferrer"
                className="mono mt-3 inline-block uppercase" style={{ color: '#FE9F6D' }}>
                {pub.doi ? `doi ${pub.doi}` : 'read'} →
              </a>
            )}
          </article>
        ))}
      </div>

      <h3 className="h-mid mt-14 mb-6 fade">Patents filed</h3>
      <div className="grid md:grid-cols-2 gap-px" style={{ background: 'rgb(var(--hair))' }}>
        {patents.map((pt) => (
          <div key={pt.no} className="fade p-6 md:p-8" style={{ background: 'rgb(var(--bg))' }}>
            <div className="flex items-baseline justify-between gap-4">
              <span className="h-mid !text-[clamp(20px,2vw,30px)]">{pt.name}</span>
              <span className="mono">{pt.no}</span>
            </div>
            <p className="body-t mt-3">{pt.desc}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ── 05 · EXPERIENCE — a vertical rail, reverse-chronological ── */
function Experience() {
  return (
    <Section id="experience" label="trajectory" min="auto">
      <h2 className="h-big mb-12">
        <span className="mask"><span>From papers</span></span>
        <span className="mask"><span>to products</span></span>
      </h2>
      <div className="flex flex-col gap-12">
        {experience.map((e) => (
          <div key={e.org} className="fade grid md:grid-cols-[220px_1fr] gap-6 md:gap-12 rule pt-8">
            <div>
              <div className="mono uppercase mb-2">{e.period}</div>
              {e.current && (
                <div className="mono uppercase inline-flex items-center gap-2" style={{ color: '#DE4968' }}>
                  <i className="w-[5px] h-[5px] rounded-full bg-[#DE4968]" /> current
                </div>
              )}
            </div>
            <div>
              <h3 className="h-mid">{e.role}</h3>
              <div className="mono uppercase mt-2 mb-5">{e.org}</div>
              <ul className="flex flex-col gap-2.5">
                {e.points.map((pt) => (
                  <li key={pt} className="body-t !max-w-[68ch] flex gap-3">
                    <span className="mono shrink-0 pt-1.5">—</span>{pt}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
      <a href={socials.linkedin} target="_blank" rel="noopener noreferrer"
        className="mono mt-8 inline-block uppercase" style={{ color: '#FE9F6D' }}>
        full history on linkedin →
      </a>
    </Section>
  );
}

/* ── 06 · SKILLS — grouped, not a badge cloud ── */
function Skills() {
  return (
    <Section id="skills" label="stack" min="auto">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px" style={{ background: 'rgb(var(--hair))' }}>
        {skills.map((g) => (
          <div key={g.group} className="fade p-6 md:p-8" style={{ background: 'rgb(var(--bg))' }}>
            <div className="mono uppercase mb-4" style={{ color: '#FE9F6D' }}>{g.group}</div>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {g.items.map((s) => (
                <span key={s} className="text-[15px] font-light">{s}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ── 07 · EDUCATION ── */
function Education() {
  return (
    <Section id="education" label="training set" min="auto">
      <div className="grid md:grid-cols-2 gap-10 items-start">
        <div>
          <h3 className="h-mid fade">{education.school}</h3>
          <div className="mono uppercase mt-2 fade d1">{education.university}</div>
          <p className="body-t mt-6 fade d2">{education.degree}<br />{education.spec}</p>
          <div className="mono mt-4 fade d3">{education.years} · {education.cgpa}</div>
        </div>
        <div className="fade d2">
          <div className="mono uppercase mb-4">key coursework</div>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {education.coursework.map((c) => <span key={c} className="text-[15px] font-light">{c}</span>)}
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ── 08 · ACHIEVEMENTS — dense index, rank first ── */
function Achievements() {
  return (
    <Section id="achievements" label="results" min="auto">
      <h2 className="h-big mb-10">
        <span className="mask"><span>Placed</span></span>
      </h2>
      <div className="rule">
        {achievements.map((a) => (
          <div key={a.title} className="fade flex flex-wrap items-baseline gap-x-6 gap-y-1 border-b py-5"
            style={{ borderColor: 'rgb(var(--hair))' }}>
            <span className="mono w-[92px] shrink-0 uppercase" style={{ color: '#DE4968' }}>{a.rank}</span>
            <span className="h-mid !text-[clamp(18px,1.8vw,28px)] flex-1 min-w-[220px]">{a.title}</span>
            <span className="mono uppercase">{a.org}</span>
            <span className="body-t !max-w-[38ch] w-full lg:w-auto">{a.note}</span>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ── 09 · CERTIFICATIONS — compact strip ── */
function Certifications() {
  return (
    <Section id="certifications" label="certifications" min="auto">
      <div className="grid md:grid-cols-2 gap-x-12 gap-y-px">
        {certifications.map((c) => (
          /* stays stacked until lg: the grid is already two columns from md, and
             the issuer string alone is ~290px — side by side it overflowed */
          <div key={c.name}
            className="fade flex flex-col gap-1 border-b py-4 lg:flex-row lg:items-baseline
                       lg:justify-between lg:gap-6"
            style={{ borderColor: 'rgb(var(--hair))' }}>
            <span className="text-[15px] font-light min-w-0">{c.name}</span>
            <span className="mono uppercase min-w-0 lg:text-right">{c.issuer} · {c.date}</span>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ── 10 · LEADERSHIP ── */
function Leadership() {
  return (
    <Section id="leadership" label="leadership" min="auto">
      <div className="grid md:grid-cols-2 gap-px" style={{ background: 'rgb(var(--hair))' }}>
        {leadership.map((l) => (
          <div key={l.org} className="fade p-6 md:p-8" style={{ background: 'rgb(var(--bg))' }}>
            <h3 className="h-mid !text-[clamp(19px,1.9vw,28px)]">{l.role}</h3>
            <div className="mono uppercase mt-2 mb-4">{l.org} · {l.period}</div>
            <p className="body-t">{l.desc}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ── 11 · CHESS — a different register entirely ── */
function Chess() {
  return (
    <Section id="chess" label="off the clock" min="auto">
      <div className="grid md:grid-cols-2 gap-[clamp(26px,5vw,80px)] items-center">
        <div>
          <h2 className="h-big mb-6">
            <span className="mask"><span>Hundred</span></span>
            <span className="mask"><span>tournaments</span></span>
          </h2>
          <div className="mono uppercase mb-6" style={{ color: '#FE9F6D' }}>{chess.title}</div>
          <p className="lede fade d1">{chess.quote}</p>
          <div className="mono mt-6 fade d2 uppercase">also — {chess.other.join(' · ')}</div>
        </div>
        <div className="fade d1 grid grid-cols-3 gap-px" style={{ background: 'rgb(var(--hair))', border: '1px solid rgb(var(--hair))' }}>
          {chess.stats.map((s) => (
            <div key={s.k} className="p-5 md:p-7" style={{ background: 'rgb(var(--bg))' }}>
              <div className="text-[clamp(24px,3vw,46px)] font-semibold leading-[.9] tracking-[-.04em]"
                style={{ fontVariationSettings: "'wdth' 88" }}>{s.v}</div>
              <div className="mono mt-3 uppercase">{s.k}</div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ── 12 · HOBBIES ── */
function Hobbies() {
  return (
    <Section id="hobbies" label="the human" min="auto">
      <div className="grid md:grid-cols-2 gap-[clamp(26px,5vw,80px)]">
        {hobbies.map((h) => (
          <div key={h.name} className="fade">
            <h3 className="h-mid mb-3">{h.name}</h3>
            <p className="body-t">{h.desc}</p>
            {h.link && (
              <a href={h.link} target="_blank" rel="noopener noreferrer"
                className="mono mt-4 inline-block uppercase" style={{ color: '#FE9F6D' }}>
                {h.linkLabel} →
              </a>
            )}
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ── 13 · CONTACT — everything converges here ── */
function Contact() {
  return (
    <Section id="contact" label="inference" min="auto" className="pb-[220px]">
      <h2 className="h-big mb-8">
        <span className="mask"><span>Converged.</span></span>
        <span className="mask"><span>Let's talk.</span></span>
      </h2>
      <a href={socials.email} data-cur
        className="fade d1 inline-block text-[clamp(20px,3.4vw,52px)] font-light tracking-[-.03em] mb-10"
        style={{ color: '#FE9F6D' }}>
        {profile.email}
      </a>
      <div className="fade d2 mono flex flex-wrap gap-x-8 gap-y-3 uppercase rule pt-6">
        <a href={socials.github} target="_blank" rel="noopener noreferrer">github</a>
        <a href={socials.linkedin} target="_blank" rel="noopener noreferrer">linkedin</a>
        <a href={socials.scholar} target="_blank" rel="noopener noreferrer">google scholar</a>
        <a href={socials.researchgate} target="_blank" rel="noopener noreferrer">researchgate</a>
        <a href={socials.mal} target="_blank" rel="noopener noreferrer">myanimelist</a>
      </div>
    </Section>
  );
}

export default function Home() {
  useEffect(() => { document.title = 'Vishal A S — AI Developer & ML Engineer'; }, []);
  return (
    <>
      <Hero />
      <About />
      <Work />
      <Research />
      <Experience />
      <Skills />
      <Education />
      <Achievements />
      <Certifications />
      <Leadership />
      <Chess />
      <Hobbies />
      <Contact />
    </>
  );
}
