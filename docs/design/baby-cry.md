# baby-cry — *Night Shift*

`/work/baby-cry` · "Why My Baby is Crying" · infant cry classification from raw audio

---

## Narrative / story

One night, told in timestamps. At 22:40 the house is quiet. At 03:47 a caregiver
is holding a screaming infant and cannot tell hunger from pain from tiredness,
and the answer is time-critical. The page is that night, scrolled hour by hour —
and running underneath the whole thing is the only thing the model can actually
see: a band of energy between 142.91 and 6620.12 Hz. The page ends when the
sound stops.

## Visual metaphor

**A darkened nursery with one machine awake in it.** The page's ground layer is a
live spectrogram — not an illustration of one, a real GPU-rendered heat field
that floods, narrows, and drains across the length of the page. Text floats over
it in a narrow, intimate reading column, the way a phone screen floats over a cot
at 3am. Nothing on this page is edge-to-edge except the sound.

## Palette

| Role | Hex |
|---|---|
| ground (night) | `#0E1524` |
| surface / raised | `#161F33` |
| deep (the quiet panels) | `#080D18` |
| ink | `#E9F0FF` |
| dim | `#8CA0C4` |
| faint | `#4F6183` |
| nightlight amber (primary accent) | `#FFC15E` |
| cool signal (secondary accent) | `#45D0C8` |

**Spectrogram ramp** (the shader's colour map, cool→warm, deliberately *not* the
landing page's purple→magenta→coral magma):
`#0E1524` → `#1F5F8B` → `#45D0C8` → `#FFC15E` → `#FFF3D6`

## Typography

- **Display — Fraunces** (variable: `opsz 9…144`, `wght 300…900`, `SOFT 0…100`,
  `WONK 0…1`), self-hosted `/fonts/p/fraunces.woff2`.
  Used **lowercase, sentence case, never uppercase**, at `wght 300–400`,
  `SOFT 100`, `WONK 1` — soft, slightly wobbly, warm. Letter-spacing `0` to
  `+0.005em` (never negative). Line-height `1.02–1.12` (never `.9`).
- **Body — Inter** (variable `wght 300…800`), `/fonts/p/inter.woff2`, at
  17–19px / 1.7, `wght 380`.
- **Timestamps** — Fraunces *italic-feeling* via `WONK 1` at `opsz 144`,
  tabular-lining figures, set enormous (`clamp(72px, 18vw, 260px)`) as the fixed
  clock. This is the page's only oversized type and it is a **number**, not a word.

Structural use of type: the page has exactly one heading size and one body size.
Hierarchy comes from *the clock* and from vertical silence, not from a type scale.

## Layout system

- **A single centred reading column**, `min(620px, 88vw)`. The landing page is
  edge-to-edge with a `clamp(20px,5vw,92px)` gutter; this page is a column in the
  middle of a dark field, and the field is the point.
- **A fixed clock** at the left edge (desktop) / top (mobile) that scrubs
  `22:40 → 03:47 → 06:12` continuously with scroll.
- Between chapters: **full-bleed shader interludes** with zero text, 60–90vh
  tall. Silence is a section type here.
- Vertical rhythm is a 8px baseline with chapter gaps of `18vh`; there are no
  rules, no dividers, no grids, no boxes anywhere on this page.

**Section order (a night, not a case study):**
`22:40 quiet` → `01:12 first wake` → **bandpass gate (pinned)** → `461 things to
listen for` → `02:30 the imbalance` → **03:47 the verdict (full-bleed)** →
`what this number is not` → `06:12 quiet again` → colophon.

## Motion language

**Breathing.** Nothing on this page translates on Y to arrive. Elements *bloom*:
`scale(1.035) → 1` with `filter: blur(10px) → 0` and opacity, over **1.6–2.2s**,
easing `cubic-bezier(.62,.05,.2,1)` — slow in, very slow out, no snap. The
spectrogram itself has a 4.2s breath cycle independent of scroll, so the page is
never fully still even when parked.

- Primary curve: `cubic-bezier(.62,.05,.2,1)`
- Secondary (clock digits): `cubic-bezier(.4,0,.1,1)` at 380ms
- No stagger under 180ms. No bounce. No overshoot anywhere.

## Signature set pieces

1. **Held tone → open.** Entry: a black field with a single 2px amber horizontal
   line at 50vh. Over 900ms it opens vertically (a `clip-path: inset()` mask
   spreading from the centre line) to reveal the page. Layers: line (z2), page
   (z1), black shutter (z3).
2. **The cry floods in.** Over the first 130vh the shader's `uEnergy` uniform
   ramps 0 → 1 and the heat field fills from the bottom edge upward. The title
   *why my baby is crying* blooms in at 30vh, one word per 220ms, each word from
   `blur(14px) scale(1.06)`.
3. **The bandpass gate (pinned, 220vh).** The full-spectrum field is visible;
   two horizontal shutters close from top and bottom until only the
   142.91–6620.12 Hz band remains lit. The Hz numbers count toward their exact
   values as the shutters travel. Depth ratios: shutters 1.0 (locked to scroll),
   field 0.18, band labels 0.55.
4. **461.** A canvas grid of 461 cells lights up in family waves — 40 MFCC, +Δ,
   +ΔΔ, ZCR, RMS, chroma, mel, 7-band contrast, tonnetz, centroid, bandwidth,
   rolloff, tempogram — each family sweeping across in 400ms, its name fading
   through the centre of the grid. Ends with all 461 lit and a single count-up.
5. **SMOTE.** Two point clouds on canvas; the minority cloud interpolates new
   points along neighbour lines until the two are balanced. Scroll-scrubbed both
   directions.
6. **03:47 — the verdict.** Full-bleed, shader at maximum. One word,
   `hunger`, blooms to `clamp(64px,16vw,220px)`. Under it, five LIME attribution
   bars grow from zero, the top feature named. Then the whole thing dims by 70%
   and the honest caveat arrives *in the same place*, replacing it.
7. **The whisper.** The honest note (SMOTE-before-split leakage) is set in
   Fraunces at body size, `color: #8CA0C4`, on the page's darkest panel
   (`#080D18`), with the shader forced to near-zero energy behind it. The page
   goes quiet to say the uncomfortable thing.
8. **06:12 — drain.** Over the last 60vh the shader's energy drains to zero from
   the top down, leaving flat dark and one amber line at the baseline. The clock
   stops. Links appear in the column as plain text.

## Scroll choreography

| Progress | Beat |
|---|---|
| 0 – 0.04 | held tone, mask opens, clock reads 22:40 |
| 0.04 – 0.14 | title blooms, energy floods in, first chapter |
| 0.14 – 0.24 | *interlude* — shader only, no text |
| 0.24 – 0.40 | **pinned** bandpass gate |
| 0.40 – 0.52 | 461 feature grid |
| 0.52 – 0.62 | SMOTE clouds |
| 0.62 – 0.74 | **03:47 verdict**, full-bleed |
| 0.74 – 0.86 | the whisper (darkest panel, shader quiet) |
| 0.86 – 1.00 | drain, clock to 06:12, colophon |

## Entry + exit transition

**Entry:** no colour wipe. A 2px amber line on black, held for 260ms, then a
symmetrical `inset()` mask opening top and bottom over 900ms
(`cubic-bezier(.62,.05,.2,1)`). It reads as an eye opening in the dark, or a
monitor waking.
**Exit (back to index):** the mask closes back to the line, 520ms, and the line
fades. Implemented as a route-leave state on the back-link.

## Distinctiveness statement

- **vs the landing page** — narrow centred column instead of edge-to-edge gutter;
  soft lowercase serif instead of oversized uppercase grotesque; navy night
  instead of olive black; amber/teal instead of magma; blooming scale+blur
  instead of `translateY(22px)` fade; a real GLSL shader instead of a three.js
  point cloud; no rules, no grids, no mono micro-labels, no HUD, no cursor.
- **vs every sibling** — the only page with a WebGL fragment shader; the only
  page laid out as a single narrow column; the only page with a soft/wonky serif;
  the only page whose motion is slower than 1s; the only page structured as a
  **clock** rather than as sections.
