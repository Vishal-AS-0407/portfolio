/* The landing page and everything that makes it itself — the particle stage,
   the HUD, the cursor, the story strip, the Lenis scroll spine.

   This lives in its own module for one reason: it is the only thing in the app
   that needs three.js. Kept in App.tsx it sat in the entry graph, so opening
   /work/wisp downloaded 462 kB of WebGL renderer and the whole landing bundle
   before it could paint a page that uses neither. Lazily imported by the "/"
   route it is fetched by exactly the visitors who see it. */
import { useEffect } from 'react';
import Stage from '@/components/chrome/Stage';
import { Hud, Cursor, EscapeHatch } from '@/components/chrome/Chrome';
import Descent from '@/descent/Descent';
import Home from '@/routes/Home';
import { initScroll } from '@/lib/scroll';
import { registerEggs } from '@/lib/eggs';

export default function HomeShell() {
  useEffect(() => {
    const stop = initScroll();
    registerEggs();
    return stop;
  }, []);
  return (
    <>
      <Stage />
      <Hud />
      <Cursor />
      <EscapeHatch />
      <Descent />
      <main className="relative z-[5]">
        <Home />
      </main>
    </>
  );
}
