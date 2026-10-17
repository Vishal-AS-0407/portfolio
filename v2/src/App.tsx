import { Suspense, lazy, useEffect, type ComponentType } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useParams } from 'react-router-dom';

/* ── Routes ─────────────────────────────────────────────────────────────────
   Nothing here is imported statically. The entry chunk is React, the router
   and the base stylesheet — and then each route brings its own world.

   The landing page is lazy for the same reason the project pages are: it owns
   the particle stage, and the particle stage owns three.js. Held in the entry
   graph that put 462 kB of WebGL renderer plus the whole index bundle in front
   of every project page, none of which use a line of it. A project route now
   fetches its own module, its own stylesheet and its own @font-face files, and
   nothing else. Concepts: docs/design/<slug>.md. */
const HomeShell = lazy(() => import('@/routes/HomeShell'));
const NotFoundShell = lazy(() => import('@/routes/NotFoundShell'));

const PAGES: Record<string, ComponentType> = {
  'baby-cry': lazy(() => import('@/projects/baby-cry')),
  'eeg-emotion': lazy(() => import('@/projects/eeg-emotion')),
  memora: lazy(() => import('@/projects/memora')),
  'semantic-modeling': lazy(() => import('@/projects/semantic-modeling')),
  'dravidian-sentiment': lazy(() => import('@/projects/dravidian-sentiment')),
  'fraud-detection': lazy(() => import('@/projects/fraud-detection')),
  wisp: lazy(() => import('@/projects/wisp')),
  'qubit-green-finance': lazy(() => import('@/projects/qubit-green-finance')),
};

function ProjectRoute() {
  const { slug } = useParams();
  const Page = slug ? PAGES[slug] : undefined;
  if (!Page) return <NotFoundShell />;
  return <Page />;
}

function ScrollReset() {
  const loc = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [loc.pathname]);
  return null;
}

/* index.html ships one canonical — the homepage — so without this every case
   study told crawlers it was a duplicate of `/`. Point canonical and og:url at
   the route actually being served; unknown paths get noindex instead. The
   origin is read from the shipped tag, so preview deploys still canonicalise
   to production. */
function Canonical() {
  const { pathname } = useLocation();
  useEffect(() => {
    const link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    const og = document.querySelector('meta[property="og:url"]');
    const origin = link ? new URL(link.href).origin : location.origin;
    const known = pathname === '/' || (pathname.startsWith('/work/') && pathname.slice(6) in PAGES);
    const url = origin + (known ? pathname : '/');
    link?.setAttribute('href', url);
    og?.setAttribute('content', url);
    let robots = document.querySelector('meta[name="robots"]');
    if (!known) {
      if (!robots) {
        robots = document.createElement('meta');
        robots.setAttribute('name', 'robots');
        document.head.appendChild(robots);
      }
      robots.setAttribute('content', 'noindex');
    } else if (robots?.getAttribute('content') === 'noindex') robots.remove();
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollReset />
      <Canonical />
      {/* One boundary for the whole tree. No spinner: the body already carries
          the ground colour, and every page opens on its own entry gesture — a
          fallback of my own devising would be the ninth design in a set of
          eight. */}
      <Suspense fallback={<div style={{ minHeight: '100vh' }} aria-busy="true" />}>
        <Routes>
          <Route path="/" element={<HomeShell />} />
          <Route path="/work/:slug" element={<ProjectRoute />} />
          <Route path="*" element={<NotFoundShell />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
