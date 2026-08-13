import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, X } from 'lucide-react';
import { NEW_SITE_URL } from '@/lib/site';

/* The mirror of the escape hatch on the new site: that one offers the
   plain version, this one offers the over-engineered version. Slides up
   once the visitor is past the hero, and can be dismissed for the session. */
export default function NewSiteBanner() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.55);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <AnimatePresence>
      {show && !dismissed && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 max-w-[calc(100vw-2rem)]"
        >
          <div className="flex items-center gap-1 rounded-full glass-strong border border-primary/25 pl-1 pr-1 py-1 shadow-lg shadow-primary/5">
            <a
              href={NEW_SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 rounded-full px-4 py-2 text-sm hover:bg-primary/10 transition-colors"
            >
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              <span className="text-foreground/70 hidden sm:inline">Too plain?</span>
              <span className="font-medium gradient-text">
                There&apos;s an over-engineered version
              </span>
              <ArrowUpRight
                size={15}
                className="text-primary shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </a>
            <button
              onClick={() => setDismissed(true)}
              aria-label="Dismiss"
              className="p-2 rounded-full text-muted-foreground/60 hover:text-foreground hover:bg-foreground/5 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
