import { Suspense, lazy, useEffect, type ComponentType } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useParams } from 'react-router-dom';
import Stage from '@/components/chrome/Stage';
import { Hud, Cursor, EscapeHatch, Preloader } from '@/components/chrome/Chrome';
import Home from '@/routes/Home';
import NotFound from '@/routes/NotFound';
import { initScroll } from '@/lib/scroll';
import { registerEggs } from '@/lib/eggs';

/* ── The landing page and its chrome ────────────────────────────────────────
   Everything the index needs to feel like itself — the particle stage, the HUD,
   the cursor, the preloader, the Lenis scroll spine — lives here and *only*
   here. A project route mounts none of it, which is the first reason those
   pages read as a different site rather than a reskin of this one. */
function HomeShell() {
  useEffect(() => {
    const stop = initScroll();
    registerEggs();
    return stop;
  }, []);
  return (
    <>
      <Preloader />
      <Stage />
      <Hud />
      <Cursor />
      <EscapeHatch />
      <main className="relative z-[5]">
        <Home />
      </main>
    </>
  );
}

/* ── Project routes ─────────────────────────────────────────────────────────
   One lazily-loaded module per project. Each owns its own stylesheet, its own
   fonts, its own scroll driver and its own namespace; nothing is imported
   across them and nothing is imported from the landing page. Lazy loading is
   what keeps eight independent design systems off the index's critical path —
   a page's CSS chunk and its @font-face files are fetched only when you open
   it. Concepts: docs/design/<slug>.md. */
const PAGES: Record<string, ComponentType> = {
  'baby-cry': lazy(() => import('@/projects/baby-cry')),
  'eeg-emotion': lazy(() => import('@/projects/eeg-emotion')),
  memora: lazy(() => import('@/projects/memora')),
  'semantic-modeling': lazy(() => import('@/projects/semantic-modeling')),
};

function ProjectRoute() {
  const { slug } = useParams();
  const Page = slug ? PAGES[slug] : undefined;
  if (!Page) return <NotFoundShell />;
  /* No spinner: every page opens on its own entry gesture, and a fallback of
     its own devising would be the ninth design in a set of eight. */
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh' }} aria-busy="true" />}>
      <Page />
    </Suspense>
  );
}

function NotFoundShell() {
  return (
    <>
      <Stage />
      <main className="relative z-[5]">
        <NotFound />
      </main>
    </>
  );
}

function ScrollReset() {
  const loc = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [loc.pathname]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollReset />
      <Routes>
        <Route path="/" element={<HomeShell />} />
        <Route path="/work/:slug" element={<ProjectRoute />} />
        <Route path="*" element={<NotFoundShell />} />
      </Routes>
    </BrowserRouter>
  );
}
