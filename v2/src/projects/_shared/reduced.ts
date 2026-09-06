/* prefers-reduced-motion, as a value and as a hook.
   Neutral infrastructure: every project page reads it, none of them share a
   single line of design because of it. */
import { useEffect, useState } from 'react';

const Q = '(prefers-reduced-motion: reduce)';

export const prefersReduced = () =>
  typeof window !== 'undefined' && window.matchMedia(Q).matches;

export function useReducedMotion(): boolean {
  const [v, setV] = useState(prefersReduced);
  useEffect(() => {
    const mq = window.matchMedia(Q);
    const on = () => setV(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return v;
}

/* Coarse pointer / small viewport. Pages use this to choose their *designed*
   reduced experience, never to ship a broken desktop one. */
export const isCoarse = () =>
  typeof window !== 'undefined' &&
  (window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 760);
