# BUILD LOG

Eight project pages, rebuilt from zero. What each one is, what was built, what
was decided without asking, and what you should look at.

Concepts: `docs/design/<slug>.md`. Blocklist: `00-do-not-reuse.md`.
Conventions: `01-implementation-conventions.md`. Progress: `TASK-TRACKER.md`.

---

## What changed structurally

The old project pages were one template — `ProjectPage.tsx` with eight recipes
of `{enter, pipe, res, hero}` — plus `components/case/*`, `Signature.tsx`,
`Motif.tsx` and `lib/projectfx.ts`. All of it is **deleted**, not refactored.

`App.tsx` now mounts the landing page's entire world — the three.js particle
`Stage`, the `Hud`, the cursor, the escape hatch, the preloader and the Lenis
scroll spine — **only on `/`**. A project route mounts none of it and lazily
loads a self-contained module. That single change is the largest reason the
pages read as a different site rather than a reskin: there is no shared chrome
left to recognise.

Shared across the eight, and nothing else:
`_shared/BackLink.tsx` (ships no colour, size or face — each page styles
`.pj-back` itself), `_shared/page.ts` (`usePageShell`, `raf`, `clamp01`,
`lerp`, `track`), `_shared/reduced.ts`.

**`Home.tsx` was never modified by this work.** One caveat, stated plainly: a
Certifications `sm:` → `lg:` responsive fix was already uncommitted in the
working tree when the session started, and `git add -A v2/src` swept it into
commit `24c1096`. That edit is yours, not mine; the file is otherwise
byte-identical to `0cc6c80`.

---

## The eight

### 1 · baby-cry — *Night Shift*
**One night, told in timestamps, over a live spectrogram.**

- **Set pieces** — a held amber tone opening into the page; the cry flooding in
  from the bottom of the spectrum as the title blooms word by word; a **pinned
  bandpass gate** where two shutters close until only 142.91–6620.12 Hz is lit
  and the Hz numbers count to their exact values; 461 feature cells lighting in
  family waves; SMOTE interpolating a minority cloud into balance; the 03:47
  verdict full-bleed with LIME attribution bars; the honest note as a whisper on
  the page's darkest panel with the shader forced quiet; the sound draining out
  at 06:12, leaving one amber baseline.
- **Technique** — raw WebGL fragment shader (no three.js), rendered at 0.5× and
  upscaled. Its uniforms *are* the argument: `uEnergy`, `uGate`, `uDrain`.
- **Distinct** — the only shader page; the only single narrow reading column
  (620px); the only soft/wonky serif; the only page whose motion is slower than
  1s; structured as a **clock**, not as sections. No rule, grid, box or
  uppercase word anywhere on it.

### 2 · eeg-emotion — *Paper*
**A chart recorder: the page scrolls sideways because that is the direction paper comes out of a machine.**

- **Set pieces** — the millimetre grid printing itself in 24 steps; the pen
  dropping; fourteen DREAMER traces drawing at constant velocity; the strip
  splitting into two physically different sheets (14ch/128Hz and 56ch/200Hz)
  that **never merge**; three galvanometers overshooting and damping onto
  98.6 / 96.6 / 95.7; calipers measuring 9.78 ms across the grid; the report
  tearing off on a generated jagged edge; a Best Paper stamp in one 170ms hit;
  the honest note in red pencil in the margin at −2.5°.
- **Technique** — a pinned horizontal transport, plus SVG traces revealed by a
  single clip rect that follows the pen. Seventy polylines cost **one attribute
  write per frame** instead of seventy style writes.
- **Distinct** — the only horizontally-scrolling page; the only warm printed
  paper; the only page whose reveals are drawings; the only stepped and
  constant-velocity motion; large lowercase mono, the exact inverse of the
  landing page's 10.5px tracked uppercase kicker.

### 3 · dravidian-sentiment — *Muzhakkam* (முழக்கம்)
**A Tamil political poster wall, where the type is the content.**

- **Set pieces** — a six-sheet paste-up that slams on at 90ms intervals and
  shakes the wall; a bilingual seven-class ticker whose speed and direction are
  coupled to scroll velocity; a hashtag visibly shredded into subword fragments
  and reassembled by the LLaMA rewrite (scroll-scrubbed, reversible); dense
  IndicBERTv2 and sparse TF-IDF bands overprinting into a third colour; the
  1/25 rank slam with the 0.3710 margin drawn as a bar that is very nearly the
  same length; the honest note as a correction sheet pasted at −3.2° over the
  rank poster; emoji cutting to their word forms.
- **Technique** — kinetic typography, poster slams and a velocity-coupled
  marquee, all fired from one rAF loop as Web Animations. No canvas.
- **Distinct** — the only page set in Tamil; the only page with no single
  background colour (two spot inks on newsprint, switching per sheet); the only
  page where nothing lasts longer than 400ms; the only halftone, tear,
  mis-registration and marquee.

### 4 · fraud-detection — *Sealed*
**A sealed document: nothing is legible until it has been unsealed, and what stays sealed stays sealed.**

- **Set pieces** — a twelve-slat shutter, then a full page of ciphertext with a
  decrypt sweep; a divider drawing down the centre after which the page is two
  institutions, and **the half you are not attending to re-seals**; local SMOTE
  typing synthetic rows into two ledgers with different counts; a pinned CKKS
  gate where weights from both sides become ciphertext blocks and one combined
  vector emerges; the vote; three milliseconds; an account number redacting
  itself as it passes a rule; `0` — the only element that never had a sealed
  state; the honest note with the scramble disabled and no panel styling at all.
- **Technique** — a character-scramble decryption system at a fixed 24fps with a
  per-character wave offset, and **no layout shift**: the plaintext glyph sits
  in the cell at `visibility: hidden` and is the only thing that sets its width.
- **Distinct** — the only page built on withholding; the only hard 50/50
  institutional split; the only cold institutional white; no gradient, curve or
  organic form anywhere.

### 5 · wisp — *After Dark*
**An infrared contact sheet: the frames are dark, and the only way to see what the model saw is to carry a lens over them.**

- **Set pieces** — an IR flash and a 1.6s exposure settle; the **pointer lens**,
  which is the only way to reach the attribution maps; a contact sheet moving on
  four depth planes; dashed bounding boxes that draw and then erase, because the
  labels never provided them; six attribution methods cross-fading and then
  composited so the *disagreement* is the image; the long tail, where the
  conservation priorities are literally the hardest to read; contours redrawing
  for a hazard radius; the honest note as a field-notebook page with items
  struck through and a leader line to an empty mount.
- **Technique** — procedurally generated imagery. **No photographic asset
  ships**: every frame is seeded value-noise foliage, a hand-authored silhouette
  path, IR falloff from a flash origin and grain, generated once and cached, with
  a matching attribution field. Four-ratio parallax on scroll *and* pointer.
- **Distinct** — the only pointer-driven reveal; the only procedural imagery;
  the only delicate light serif with italic Latin binomials; the only warm-dark
  ground.

### 6 · memora — *The Catalogue*
**A card catalogue for an LLM: it files instead of replaying.**

- **Set pieces** — a drawer sliding toward the viewer with seven cards rising
  out; a pinned sequence where each exchange is typed onto a card, stamped with
  its topic and filed, three times, accelerating; two piles — labels assigned in
  isolation, which drift and lean, against labels diffed against the thread,
  which are square; the same forty cards on a brass rod (Redis, exact, ordered)
  and released into a scatter (FAISS, distance is similarity); **recall**,
  40 → 6 → 3, with cosine scores on the card edges; stack thickness as token
  cost; six HALLUCINATED stamps, then one; the honest note on a card stamped
  NOT REPRODUCIBLE, filed at the back.
- **Technique** — GSAP ScrollTrigger pinning with real 3D transforms. Card poses
  are **computed from the pin's progress** rather than tweened, so forty cards
  cost forty transform writes a frame and scrub identically in both directions.
  Shadows interpolate with Z, which is what sells the weight.
- **Distinct** — the only page with perspective, Z-motion and cast shadows; the
  only typewriter face; the only mid-tone ground; separation is done with
  overlap and shadow, never a rule.

### 7 · semantic-modeling — *The Plate*
**A blueprint drawn over a live force simulation you can grab.**

- **Set pieces** — the blueprint grid drawing itself; 609 nodes falling as
  unlinked dust before 304 edges snap in and the graph pulls itself into shape
  over ~2.5s of real physics; PageRank re-scaling radii so the graph gains a
  centre; three algorithms disagreeing, with nodes physically migrating between
  partitions (scroll-scrubbed, reversible); the co-assignment matrix imposing
  itself on the nodes and releasing them into consensus; a camera tour of the
  five largest topics; pairwise dedup; the figures drawn as blueprint dimension
  lines with tick ends; the honest note as a REV. A revision cloud around the
  modularity figure.
- **Technique** — a canvas force simulation: edge springs, spatial-hash
  repulsion (never O(n²)), and a pull toward whichever partition is on display,
  which is what makes the graph re-group when the algorithm changes. A
  critically-damped camera. Nothing has a duration; things settle.
- **Distinct** — the only physics page; the only page whose substrate is one
  continuous canvas rather than a document; the only page you can grab and pull;
  the only serif body; the only blueprint blue.

### 8 · qubit-green-finance — *Allocation*
**A Swiss allocation poster where the 15×3 matrix is the page's grid, not an illustration on it.**

- **Set pieces** — 45 cells wiping in column by column and then clearing, leaving
  the headline on clean stock; a live 15×3 matrix, hover- and arrow-key
  operable, with row/column highlighting and a live readout; fifteen goals as a
  sideways-swipeable band of full-height colour blocks; the objective function
  set as typography, one term at a time; the ESG floor, where five of twenty
  bars drop to zero in a single 180ms move; the 40% cap clipping a bar and
  redistributing the remainder; the $1,000 budget dividing into flat segments;
  a PROTOTYPE panel in grey with no colour and no motion; a ledger printing
  every candidate with its allocation or why it has none.
- **Technique** — CSS scroll-snap on its own scroll container, and `clip-path`
  wipes. Panel state is read from the deck's `scrollTop`, which is exact through
  a snap. The linear programme is real: value − 0.10·capital − 0.05·risk, under
  a budget, a hard 0.70 floor and a 40% cap.
- **Distinct** — the only page that snaps; the only interactive data grid; the
  only page with **no canvas and no continuous animation loop at all**; the only
  flat colour-block page; nothing fades, scales, rotates or parallaxes.

---

## Distinctness audit (mechanical, re-runnable)

| Page | Faces | Primary easing |
|---|---|---|
| baby-cry | Fraunces · Inter | `cubic-bezier(.62,.05,.2,1)` |
| eeg-emotion | Space Grotesk · Spline Sans Mono | `cubic-bezier(.9,0,.1,1)` |
| dravidian-sentiment | Noto Sans Tamil · Anton · Work Sans | `cubic-bezier(.2,.9,.1,1)` |
| fraud-detection | IBM Plex Sans Condensed · IBM Plex Mono | `cubic-bezier(.85,0,.15,1)` |
| wisp | Cormorant Garamond · Inter Tight | `cubic-bezier(.19,.66,.24,1)` |
| memora | Courier Prime · Manrope | `cubic-bezier(.4,.8,.2,1)` |
| semantic-modeling | Syne · Newsreader | springs + `cubic-bezier(.34,1.4,.5,1)` |
| qubit-green-finance | Bricolage Grotesque · Instrument Sans | `cubic-bezier(.7,0,.2,1)` |

**Zero families shared between any two pages or with the landing page. Eight
distinct primary curves, none of them the landing page's `cubic-bezier(.16,1,.3,1)`.**
A grep for Archivo, Martian Mono, the house easing, the magma hexes, the olive
ground and `/plates/*.jpg` across all eight returns nothing.

Grounds: navy night · warm chart paper · vermilion/bone newsprint · cold
institutional white · warm coffee-black · mid slate · blueprint blue · flat bone
with three inks. Architectures: reading column · horizontal strip · poster
stack · 50/50 split · contact sheet · pinned card stack · one canvas with
orbiting callouts · snapped panel deck.

---

## Verification

- `npm run build` (`tsc --noEmit && vite build`) green.
- All eight rendered at **1440px**, at **390px**, and under
  **`prefers-reduced-motion: reduce`**. No console errors, no page errors, no
  horizontal overflow on any page at any width.
- Reduced motion is a designed path, not a switch-off: semantic-modeling becomes
  a printed document with every callout in order, wisp holds the lens open so
  the attributions stay reachable, memora opens the drawer with no pins,
  qubit keeps snapping because snapping is navigation rather than decoration.

Bugs found by rendering, all of which had passed `tsc` and a blocklist sweep:

1. **wisp** — a hard black block across the lower half of every animal.
   `sampleField()` is called at `(u*1.7, v*1.7)` for a finer second read and ran
   off the end of the array past `1/1.7`; the undefined lookup poisoned the
   bilinear interpolation with `NaN`, and **assigning `NaN` into a
   `Uint8ClampedArray` yields 0** — pure black, with a hard edge at exactly
   `v = 0.588`. Clamped in `sampleField`.
2. **fraud-detection** — the page had no left gutter at all. `.sd h1 {padding:0}`
   (0‑1‑1) was outranking `.sd-h1 {padding: … var(--gut)}` (0‑1‑0). The element
   normalise is now wrapped in `:where()`.
3. **eeg-emotion** — `overflow` on the scope root made it the scroll container
   for `position: sticky`, blanking the page a third of the way down.
4. **baby-cry** — a fixed scrim at `z-index: 1` outranked sections left at
   `z-index: auto`, crushing the one section built to be looked at.
5. **dravidian-sentiment** — the ticker sat fixed across the middle of the page
   on top of every paragraph; rotated sheets made the document 150px wider than
   the viewport.
6. **qubit** — an explicit `grid-row` on the matrix readout collided with the
   axis rows and displaced every auto-placed cell.

---

## Decisions made on your behalf

1. **The landing page's chrome now renders only on `/`.** `Home.tsx` is
   byte-identical, and `/` looks and behaves exactly as before, but this is a
   structural change to `App.tsx` and the most important one in the rebuild.
2. **Sixteen font families were downloaded from Google Fonts and self-hosted**
   under `v2/public/fonts/p/` (~800KB total, loaded per route, never on `/`).
3. **`content.ts`'s `theme` objects are now legacy.** The landing page's work
   index still reads `theme.accent` and `theme.name` for its hover preview, so
   they were left untouched — which means a project page's palette no longer
   matches the accent its row previews on the index. **Worth a decision.**
4. **memora** merges "two indexes" and "recall" into one continuous pinned
   traversal rather than two set pieces. It reads better as one movement.
5. **eeg-emotion** keeps the pinned horizontal transport on mobile (at 430vw
   with fewer lanes) instead of being re-cut into five stacked strips.
6. **qubit** drives panel state from `scrollTop` rather than the
   `IntersectionObserver` its concept doc specified, because that mechanism is
   on the blocklist. Its SDG band is a native horizontal swipe rather than a
   vertical-scroll-driven scrub, which is what scroll-snap allows.
7. **qubit's twenty candidates are generated from a fixed seed**, because the
   repo's own README says the committed optimiser runs on twenty randomly
   generated candidates. The page says so on its PROTOTYPE panel rather than
   presenting them as a real portfolio. The constraints are the real ones.
8. **dravidian-sentiment ships a Tamil webfont** (Noto Sans Tamil, Tamil subset,
   49KB) on that route only. The old site avoided this by baking Tamil into a
   PNG; real text is selectable, searchable and accessible.

## Flagged for you

- **Three pages were written by parallel agents** (dravidian-sentiment,
  fraud-detection, wisp) and then reviewed, fixed and verified here. They are
  good, but they are the ones I would read first.
- **The `theme.accent` mismatch in point 3** is the one open design question.
- **Long pages.** wisp is ~13,700px and memora ~14,000px at 1440. That is
  deliberate for scrubbed set pieces, but it is a lot of scrolling; worth
  feeling on a real trackpad.
- **fraud-detection's CKKS gate** was mid-edit when its agent was stopped. It
  builds, renders and reads correctly, but it is the section with the least
  history behind it.
- The **`/work/:slug` entry transitions** are per-page; there is no shared route
  transition, by design. Arriving from the index is a hard cut into each page's
  own opening gesture.

## 2026-10-24 — Inheritance, the film

- Removed the Biomech heart hero (it read as synthetic) and the bottom-edge story band (too small to
  carry a story). `field.ts` is back to its `pre-3d` state.
- New `v2/src/film/`: a 760vh pinned, letterboxed Canvas 2D film straight after the hero. Nine shots,
  a nine-grade colour script, four parallax planes, a rim-lit ink cast, an 11-angle FK rig with smears,
  and impacts that fire only when scrolling forward. Plan: `inheritance-film.md`.
- `scroll.ts` gains `state.gap` (the film's pin is cut out of page progress, so field, HUD and inversion
  timing are unchanged) and `state.cover` (the field skips rendering while the film fills the screen).
- Reduced motion renders the nine shots as stills. A skip button jumps past the film. Dev: `?film=0.42`, `&bones=1`.

## 2026-10-24 — the story goes back to the bottom edge

- The pinned film read as a video; the story is a strip along the bottom edge again, played by the
  whole page's scroll. Same art, shots and colour script, framed for a short, wide band: the sky
  dissolves upward into the page and the shot's line sits on the ground like a subtitle. `src/film`
  became `src/story`; `state.gap` and `state.cover` are gone.
- The 0→100 preloader is removed. Nothing waited on it; the page paints straight away and the strip
  rises in.
