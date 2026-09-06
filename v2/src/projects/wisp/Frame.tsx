/* ══════════════════════════════════════════════════════════════════════════
   wisp — one mount on the contact sheet.

   A mount is a 6 px board with a window cut in it. Two canvases sit in the
   window: the infrared frame, and its attribution heat map on top, masked down
   to whatever the lens is currently exposing. The window is also a button, so
   the attribution for a single frame can be pinned open by pointer, by tap, or
   by keyboard — which is the page's motion-free route to the same information.

   Nothing here animates itself. The page owns one rAF loop and writes to the
   handle this component registers.
   ══════════════════════════════════════════════════════════════════════════ */

import { useEffect, useRef, useState } from 'react';
import { enqueue, makeIR, makeHeat, type FrameSpec } from './ir';

export type Handle = {
  /** the window, measured every frame for the lens */
  win: HTMLElement;
  /** the masked heat canvas */
  heat: HTMLCanvasElement;
  /** the element that carries the exposure filter */
  exp: HTMLElement;
  ready: boolean;
  /** exposure clock in seconds; -1 = has not started */
  t: number;
  pinned: boolean;
};

export function paintInto(
  live: { ok: boolean },
  el: HTMLCanvasElement | null,
  w: number,
  h: number,
  make: () => HTMLCanvasElement,
  done?: () => void,
) {
  enqueue(live, () => {
    if (!el || !live.ok) return;
    const src = make();
    el.width = w;
    el.height = h;
    const g = el.getContext('2d');
    if (!g) return;
    g.clearRect(0, 0, w, h);
    g.drawImage(src, 0, 0);
    done?.();
  });
}

export default function Cell({
  spec,
  no,
  time,
  common,
  bino,
  alt,
  w,
  h,
  reg,
  variant = 'tile',
  note,
}: {
  spec: FrameSpec;
  no: string;
  time: string;
  common: string;
  bino: string;
  alt: string;
  w: number;
  h: number;
  reg: (h: Handle | null) => void;
  variant?: 'tile' | 'plate' | 'strip';
  note?: string;
}) {
  const winRef = useRef<HTMLButtonElement>(null);
  const irRef = useRef<HTMLCanvasElement>(null);
  const heatRef = useRef<HTMLCanvasElement>(null);
  const handleRef = useRef<Handle | null>(null);
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    const live = { ok: true };
    const win = winRef.current;
    const heat = heatRef.current;
    if (!win || !heat) return;

    const handle: Handle = { win, heat, exp: win, ready: false, t: -1, pinned: false };
    handleRef.current = handle;
    reg(handle);

    const key = `${spec.seed}-${w}`;
    paintInto(live, irRef.current, w, h, () => makeIR(`ir${key}`, spec, w, h), () => {
      handle.ready = true;
    });
    const hw = Math.max(48, w >> 1);
    const hh = Math.max(32, h >> 1);
    paintInto(live, heat, hw, hh, () => makeHeat(`hc${key}`, spec, -1, hw, hh));

    return () => {
      live.ok = false;
      reg(null);
      handleRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = () => {
    const next = !pinned;
    setPinned(next);
    const hd = handleRef.current;
    if (hd) {
      hd.pinned = next;
      hd.heat.classList.toggle('is-open', next);
    }
  };

  return (
    <figure className={`wp-cell wp-cell--${variant}`}>
      <div className="wp-mount">
        <button
          type="button"
          ref={winRef}
          className="wp-win"
          aria-pressed={pinned}
          onClick={toggle}
        >
          <canvas ref={irRef} className="wp-ir" role="img" aria-label={alt} />
          <canvas ref={heatRef} className="wp-heat" aria-hidden="true" />
          <span className="wp-win__sr">
            {pinned ? 'Hide' : 'Show'} the model attribution for frame {no}, {common}
          </span>
          <span className="wp-win__tag" aria-hidden="true">
            {pinned ? 'attribution' : 'IR'}
          </span>
        </button>
      </div>
      <figcaption className="wp-meta">
        <span className="wp-meta__no">{no}</span>
        <span className="wp-meta__name">
          {common}
          {bino ? <i className="wp-bino">{bino}</i> : null}
        </span>
        <span className="wp-meta__exif">
          {time} · IR 850 nm · 299 px in
        </span>
        {note ? <span className="wp-meta__note">{note}</span> : null}
      </figcaption>
    </figure>
  );
}

/** A mount with nothing pinned to it. The page needs these twice. */
export function EmptyMount({
  no,
  time,
  label,
  id,
}: {
  no: string;
  time: string;
  label: string;
  id?: string;
}) {
  return (
    <figure className="wp-cell wp-cell--empty" id={id}>
      <div className="wp-mount wp-mount--empty">
        <div className="wp-win wp-win--empty" aria-hidden="true">
          <span className="wp-empty__x" />
        </div>
      </div>
      <figcaption className="wp-meta">
        <span className="wp-meta__no">{no}</span>
        <span className="wp-meta__name wp-meta__name--none">{label}</span>
        <span className="wp-meta__exif">{time} · trigger logged · no frame</span>
      </figcaption>
    </figure>
  );
}
