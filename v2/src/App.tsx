import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Stage from '@/components/chrome/Stage';
import { Hud, Cursor, EscapeHatch, Preloader } from '@/components/chrome/Chrome';
import Home from '@/routes/Home';
import ProjectPage from '@/routes/ProjectPage';
import NotFound from '@/routes/NotFound';
import { initScroll } from '@/lib/scroll';
import { registerEggs } from '@/lib/eggs';

function Outlet() {
  const loc = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [loc.pathname]);
  return (
    <main className="relative z-[5]">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/work/:slug" element={<ProjectPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </main>
  );
}

export default function App() {
  useEffect(() => {
    const stop = initScroll();
    registerEggs();
    return stop;
  }, []);
  return (
    <BrowserRouter>
      <Preloader />
      <Stage />
      <Hud />
      <Cursor />
      <EscapeHatch />
      <Outlet />
    </BrowserRouter>
  );
}
