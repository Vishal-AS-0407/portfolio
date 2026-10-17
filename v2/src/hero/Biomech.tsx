/* The hero's interactive heart. Lazily imported by Home's hero, so its code is
   its own chunk and only the landing page ever fetches it. If WebGL is missing
   or the context is lost, it removes itself and the hero is exactly as it was. */
import { useEffect, useRef, useState } from 'react';
import { deviceTier } from '@/lib/scroll';
import { createBiomech, type BiomechHandle } from './biomech/engine';

export default function Biomech() {
  const host = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const handle = useRef<BiomechHandle | null>(null);
  const [hint, setHint] = useState(true);
  const [sound, setSound] = useState(false);
  const [failed, setFailed] = useState(false);
  const [tear, setTear] = useState(false);

  useEffect(() => {
    if (!host.current || !canvas.current || !overlay.current) return;
    const h = createBiomech(canvas.current, host.current, overlay.current, deviceTier(), {
      onFirstInteraction: () => setHint(false),
      onTeardown: setTear,
      onFail: () => setFailed(true),
    });
    if (!h) setFailed(true);
    handle.current = h;
    return () => { h?.dispose(); handle.current = null; };
  }, []);

  useEffect(() => {
    if (failed) { handle.current?.dispose(); handle.current = null; }
  }, [failed]);

  if (failed) return null;
  return (
    <div ref={host} className={`bm${tear ? ' bm--tear' : ''}`}>
      <canvas
        ref={canvas}
        className="bm-canvas"
        tabIndex={0}
        role="img"
        aria-label="An interactive heart, half muscle, half machine"
        aria-describedby="bm-keys"
        data-cur
      />
      <p id="bm-keys" className="sr-only">
        Drag to rotate it, click to make it beat, press and hold to overclock it. With the keyboard:
        arrow keys rotate, Enter beats, hold Space to overclock.
      </p>
      <div className="bm-vig" aria-hidden />
      <div ref={overlay} className="bm-overlay" aria-live="polite" aria-hidden="true" />
      <div className={`bm-hint mono${hint ? '' : ' gone'}`} aria-hidden>
        {typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches ? 'drag · tap · hold' : 'drag · click · hold'}
      </div>
      <button
        type="button"
        className="bm-sound mono"
        aria-pressed={sound}
        onClick={() => setSound(handle.current?.toggleSound() ?? false)}
      >
        sound <b>{sound ? 'on' : 'off'}</b>
      </button>
    </div>
  );
}
