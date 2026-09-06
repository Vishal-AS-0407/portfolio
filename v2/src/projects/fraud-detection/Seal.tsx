/* ══════════════════════════════════════════════════════════════════════════
   <Seal> — one run of text that arrives encrypted.

   Two layers, and only one of them is real:

   • `.sd-vh`  the plaintext, visually hidden but present in the accessibility
               tree and in the clipboard. A screen reader reads the sentence,
               not the ciphertext. It never animates.
   • `.sd-glyphs`  aria-hidden, user-select:none. One `.sd-c` cell per visible
               character. Inside each cell an `<i>` holds the *plaintext* glyph
               at `visibility:hidden` — it is what gives the cell its width —
               and a `<b>` carries the animating glyph, absolutely positioned
               and centred inside that reserved box.

   So the width of every cell, of every word, of every line and of the whole
   page is the width of the finished text from the very first frame. The page
   decrypts without moving.

   Words are wrapped in `.sd-w` so line breaks land between words once the text
   resolves, rather than mid-word where the cipher happened to run out of room.
   ══════════════════════════════════════════════════════════════════════════ */
import { Fragment, type ElementType } from 'react';
import { rc, reducedOnce } from './cipher';

export default function Seal({
  text,
  as: Tag = 'span' as ElementType,
  className = '',
  perm = false,
  sweep = false,
  last = false,
  id,
}: {
  text: string;
  as?: ElementType;
  className?: string;
  /** a figure that never leaves its institution — it has no plaintext state */
  perm?: boolean;
  /** resolved by the entry decrypt sweep instead of by scroll position */
  sweep?: boolean;
  /** the headline: the last thing on the first screen to resolve */
  last?: boolean;
  id?: string;
}) {
  const cls = `sd-seal ${className}`.trim();

  /* motion off: the text is simply the text. No cells, no registry, no loop. */
  if (reducedOnce() && !perm) {
    return (
      <Tag className={cls} id={id} data-open="1">
        {text}
      </Tag>
    );
  }

  const words = text.split(' ');

  return (
    <Tag
      className={cls}
      id={id}
      data-open="0"
      data-perm={perm ? '1' : undefined}
      data-sweep={sweep ? '1' : undefined}
      data-last={last ? '1' : undefined}
    >
      <span className="sd-vh">{perm ? 'withheld' : text}</span>
      <span className="sd-glyphs" aria-hidden="true">
        {words.map((w, wi) => (
          <Fragment key={wi}>
            <span className="sd-w">
              {Array.from(w).map((c, ci) => (
                <span className="sd-c" key={ci}>
                  <i>{c}</i>
                  <b data-ch={c}>{rc()}</b>
                </span>
              ))}
            </span>
            {/* the break opportunity lives between words, never inside one */}
            {wi < words.length - 1 ? ' ' : null}
          </Fragment>
        ))}
      </span>
    </Tag>
  );
}
