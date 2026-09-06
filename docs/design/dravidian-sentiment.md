# dravidian-sentiment — *Muzhakkam* (முழக்கம் — "the roar")

`/work/dravidian-sentiment` · Tamil political sentiment · Rank 1 of 25, DravidianLangTech @ NAACL 2025

---

## Narrative / story

Tamil political speech online is loud, compressed and sarcastic, and the shared
task asked a model to sort it into seven categories that overlap even for human
annotators. A multilingual tokenizer walks into that and shreds it. This page
does not explain the problem quietly — it shouts in the same register the data
does. It is a Tamil political poster wall, pasted up, torn, over-printed, and the
type is the content.

## Visual metaphor

**A pasted-up poster wall / hand-painted cinema banner.** Sheets slam onto the
wall on top of each other at slight angles, torn at the edges, halftoned, printed
in two spot colours. Corrections are pasted over. A marquee band of the seven
class names runs across the wall like a ticker on a campaign van.

## Palette

Two spot inks and a stock, switching per sheet — the page never has one
background.

| Role | Hex |
|---|---|
| vermilion (spot 1) | `#C0261C` |
| bone / newsprint stock | `#F4E7CE` |
| ink black | `#120A08` |
| gold (spot 2) | `#E9B23C` |
| deep maroon (shadow / gutter) | `#3A0C08` |
| halftone dot | `#120A08` at 12–22% |

Sheet combinations, cycled: `vermilion on bone` · `bone on vermilion` ·
`black on gold` · `gold on maroon`. There is no neutral ramp anywhere.

## Typography

- **Display (primary) — Noto Sans Tamil**, variable `wght 300…700`,
  `/fonts/p/noto-tamil.woff2`. **Tamil leads.** Headlines are Tamil first, with
  the English underneath at a third of the size. Set at `wght 700`,
  `clamp(40px, 11vw, 150px)`, `line-height 1.24` (Tamil needs the leading),
  `letter-spacing 0`.
- **Display (secondary) — Anton**, `/fonts/p/anton.woff2`. Ultra-condensed,
  400 only. Used **only** for the numerals and for stacked vertical words in the
  margins, with **positive** tracking (`+.02em`) — never as a wide uppercase
  headline, never negatively tracked.
- **Body — Work Sans** variable, `/fonts/p/work-sans.woff2`, 400/500 at 16px /
  1.58, max 52ch, in short bursts. Copy on this page is never more than two
  paragraphs at a time.
- Halftone and mis-registration: display type gets a 2px offset duplicate in the
  opposing spot colour, like a badly registered two-colour print.

## Layout system

- **A stack of full-viewport sheets**, not a scroll of sections. Each sheet is
  a poster: one statement, one image idea, one colourway, rotated between −3°
  and +2.5°, with a torn top or bottom edge (generated SVG path).
- Sheets are pasted *over* one another: scrolling brings the next sheet up from
  below with a hard slam, partially covering the last one. Old sheets stay
  visible at the edges.
- A persistent **marquee band** crosses the wall at ~62vh, above the sheets,
  carrying the seven class names bilingually.
- Margins carry vertical Anton stacks (rank, score, venue).

**Sheet order:** `paste-up` → `the seven` (marquee) → `the shredder` →
`agentic rewrite` → `dense × sparse` → `1 / 25` → `0.3773 is a low number`
(pasted correction) → `emoji speak too` → `blank sheet / colophon`.

## Motion language

**Snap-cut. Aggressive. Loud.** Nothing on this page glides. Sheets *slam*
(140ms, `cubic-bezier(.2,.9,.1,1)` with a 1.5% overshoot and a 60ms settle
shake). Colour changes are hard cuts (`steps(1)`). Type swaps on scroll-scrub
with no cross-fade — one word replaces another between frames.

- Slam: `cubic-bezier(.2,.9,.1,1)`, 140ms, +overshoot
- Cut: `steps(1)`, 0ms
- Shake: 3 keyframes at ±4px / ±0.6°, 90ms total
- Marquee: `linear`, constant, velocity-coupled to scroll (speeds up and
  reverses direction with scroll direction)
- Nothing on this page is longer than 400ms.

## Signature set pieces

1. **The paste-up.** Entry: black wall. Six sheets slam on at 90ms intervals,
   each at a different rotation and colourway, the last carrying the title
   **தமிழ் அரசியல் உணர்வு பகுப்பாய்வு** with the English under it. Each slam
   shakes the whole wall by 3px.
2. **The seven, marching.** Three marquee rows at 62vh, alternating direction,
   carrying `உறுதிப்படுத்தப்பட்ட · sarcastic · கருத்து · positive · negative ·
   நடுநிலை · none of the above` — bilingual, `wght 700`, in gold on maroon.
   Scroll velocity multiplies the marquee speed (clamped ×0.4…×4) and flips it.
3. **The shredder.** A hashtag is set at display size, then a scroll-scrubbed
   subword split literally cuts it into `##` fragments that scatter with rotation
   and fall out of frame. Runs backwards if you scroll up.
4. **The rewrite.** The fragments fly back in, reassemble in the wrong order,
   then LLaMA 3.1's expansion snaps into place as a readable Tamil phrase with
   its English gloss. Layers move at 0.2 / 0.55 / 1.0 depth ratios.
5. **Dense × sparse.** Two vertical ink bands — IndicBERTv2 (vermilion, smooth
   gradient of dense values) and TF-IDF (gold, sparse hard blocks) — slide toward
   each other and **overprint** with `mix-blend-mode: multiply` into a third
   colour at the centre. Concatenation, drawn as ink.
6. **1 / 25.** The rank slams in at `clamp(120px, 34vw, 460px)` in Anton with a
   mis-registered vermilion ghost. Under it, `0.3773` against second place
   `0.3710 (KCRL)` — the margin drawn as a thin gold bar that is very nearly the
   same length.
7. **The pasted correction.** The honest note is a smaller bone sheet pasted at
   −3.2° over the rank poster, with a torn edge, tape marks, and the text
   hand-set in Work Sans: *0.3773 is a low absolute number, and that is a
   property of the task.* It partially covers the `1`.
8. **Emoji speak too.** A row of emoji glyphs cuts, one frame each, into their
   word forms (`😡 → கோபம் / anger`) at 120ms per swap, driven by scroll position.
9. **Blank sheet.** A clean bone sheet slams over everything for the colophon —
   the wall is covered, the shouting stops.

## Scroll choreography

| Progress | Beat |
|---|---|
| 0 – 0.05 | six-sheet paste-up, wall shake, title |
| 0.05 – 0.16 | seven-class marquee takes over; velocity coupling |
| 0.16 – 0.30 | the shredder (scrub) |
| 0.30 – 0.42 | the agentic rewrite (scrub, reversible) |
| 0.42 – 0.56 | dense × sparse overprint |
| 0.56 – 0.70 | 1 / 25 slam, the margin bar |
| 0.70 – 0.80 | pasted correction lands over it |
| 0.80 – 0.90 | emoji cuts; stack and dataset as printed marginalia |
| 0.90 – 1.00 | blank sheet, colophon |

Mobile: sheets stop rotating (0° ± 1°), slams shorten to 100ms, marquee runs at
half speed, the shredder becomes a 3-step tap-through rather than a scrub.

## Entry + exit transition

**Entry:** black wall, 180ms hold, then the six-sheet paste-up. No wipe, no fade
— the transition *is* the first set piece.
**Exit:** every sheet slides off in its own direction over 260ms, staggered
40ms, leaving the black wall.

## Distinctiveness statement

- **vs the landing page** — two spot inks on newsprint vs neutral ramp on olive
  black; Tamil script leading vs Latin uppercase grotesque; poster stack vs
  stacked `100vh` sections; 140ms slams and `steps(1)` cuts vs 1s eased fades;
  overprint/halftone/tear vs hairline rules; a marquee — a thing the landing page
  does not contain at all.
- **vs every sibling** — the only page set in Tamil; the only page with no
  single background colour; the only page whose motion is under 400ms
  throughout; the only page with a marquee, halftone, tears or mis-registration;
  the only page built from *sheets* rather than sections.
