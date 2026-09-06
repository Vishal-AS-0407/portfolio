# 00 — DO NOT REUSE

The design DNA of the landing page (`v2/src/routes/Home.tsx`, `v2/src/index.css`,
`v2/src/components/Section.tsx`, `v2/src/components/chrome/*`, `v2/src/lib/scroll.ts`,
`v2/src/lib/field.ts`).

**This file is a blocklist.** Nothing catalogued here may appear on any project
sub-page — not the values, not the components, not the techniques, not the
*shape* of the idea. If a project page needs something that lives here, it must
invent its own version from a different premise, not re-parameterise this one.

---

## 1. Palette — banned hex values

| Token | Hex | Where it lives |
|---|---|---|
| `g0` ground | `#0C0D0B` | body background, preloader |
| `g1` / `g2` | `#14150F` / `#1D1F18` | surfaces |
| `n1 … n5` | `#3A3D34` `#5E6159` `#8B8E83` `#B9BCB0` `#EFEFE7` | the neutral ramp |
| `plate` | `#E8E7DD` / ink `#14150F` | the inverted "converged" plate |
| magma `m1…m5` | `#3B0F70` `#8C2981` `#DE4968` `#FE9F6D` `#FCFDBF` | HUD gradient, all accents |

Also banned as *systems*:

- **The desaturated olive-black ground.** Anything in the neighbourhood of
  `#0C0D0B`–`#1D1F18` — a near-black with a green/olive bias. A project page may
  be dark, but not that dark and not that hue.
- **The magma ramp.** Purple → magenta → coral → cream, in any order, as a
  gradient or as an accent pair. `#DE4968` (rose) and `#FE9F6D` (coral) are the
  landing page's signature accents and are off limits everywhere.
- **Single-accent-on-neutral.** The whole site is one neutral ramp plus one hot
  accent. Project pages must not repeat that structure even in other hues.
- **The scroll-driven light/dark inversion** (`body.inv`, `--bg` lerped from
  `12 13 11` to `232 231 221` between scroll 0.80 and 0.90).

## 2. Typography — banned faces and treatments

- **Archivo** (variable, self-hosted `/fonts/archivo.woff2`) — banned outright.
- **Martian Mono** (variable, self-hosted `/fonts/martian-mono.woff2`) — banned
  outright.
- **`font-variation-settings: 'wdth' …`** as an expressive device — the landing
  page animates `wdth` 125→67 on the hero and pins `wdth` 87–94 on almost every
  other class. No project page may use a width axis this way.
- The type scale, verbatim and in spirit:
  - `.h-big` — `clamp(36px, 6.6vw, 104px)` / `line-height: .9` / weight 600 /
    `letter-spacing: -.035em` / **uppercase**
  - `.h-mid` — `clamp(26px, 3.4vw, 54px)` / `1.0` / 600 / `-.03em`
  - `.lede` — `clamp(18px, 2.1vw, 29px)` / `1.36` / **weight 300** / `-.016em` /
    `max-width: 20ch`
  - `.body-t` — `clamp(14px, 1.05vw, 16.5px)` / `1.64` / weight 300 / `46ch`
  - `.mono` — `10.5px` / `letter-spacing: .1em` / uppercase
  - `.tag` — `9.5px` / `letter-spacing: .24em` / uppercase / a `24px × 1px`
    dash drawn by `::before`
- **The signature gesture: oversized uppercase grotesque with heavy negative
  tracking.** This is the single most recognisable thing about the landing page.
  No project page gets a big uppercase tight-tracked sans headline.
- **The micro-label.** A 9.5–10.5px uppercase mono kicker with wide tracking,
  sitting above a section, optionally with a rule before it. Banned as a
  pattern, at any size, in any mono.
- **Sentence-case one-liners as section titles split across `<span>` lines**
  ("Every model / starts / lost").

## 3. Spacing, grid, rules

- `.gutter` — `padding-inline: clamp(20px, 5vw, 92px)`
- `.band` — `padding-block: clamp(148px, 18vh, 208px)`
- `min-height: 100vh` sections stacked vertically, `flex-col justify-center`
- **The hairline rule.** `border-top: 1px solid rgb(239 239 231 / .13)` as the
  universal separator, above every section and between every list row.
- **The `gap-px` divider grid.** A grid whose `background` is the hairline
  colour and whose children carry the page background, so the 1px gaps read as
  rules. Used for stats, publications, patents, skills, leadership, chess. Banned.
- **`grid md:grid-cols-2` asymmetric heading-left / copy-right.** The landing
  page's default two-column block. Banned as a section shape.
- Two-column `[220px_1fr]` label/content rails (Experience).

## 4. Page architecture

- **Hero shape:** full-viewport, content bottom-aligned (`justify-end`), a small
  kicker above a giant name, a hairline rule underneath carrying two lines of
  meta at the outer edges.
- **The editorial index.** Numbered rows (`01`, `02`, …), title on the left
  translating +8px on hover, tagline in the middle, a metric on the right,
  a hairline under each row, a coloured wash bleeding in from the left.
- **Section order as a scroll of equals:** 13 sections of roughly equal weight,
  each `100vh`, each introduced by a kicker. Banned as a rhythm.
- **The stat triad** — three big numbers with mono captions beneath, in a
  divider grid.
- **Terminal contact section** — huge email as a light-weight link over a
  hairline row of social links.

## 5. Motion — banned techniques and curves

- **`cubic-bezier(.16, 1, .3, 1)`** — the site's house easing. Banned as the
  primary curve on any project page. (`.16,1,.3,1` and its close relatives
  `.22,1,.36,1`, `.76,0,.24,1` all appear in `index.css`.)
- **`.fade`** — `opacity 0 → 1` with `translateY(22px)`, 1s, staggered by
  `.d1/.d2/.d3/.d4` at 120ms intervals. *If a section can be described as
  "content, fading up", it has failed.*
- **`.mask`** — `overflow: hidden` on a line, inner `<span>` at
  `translateY(106%)` sliding to 0 over 1.2s, staggered 80ms per line.
- **`IntersectionObserver` → add `.in` → let CSS transitions run.** The entire
  reveal system of the landing page. Banned as a mechanism.
- **The `data-enter` archetypes** (`blur`, `jitter`, `word`, `seal`, `depth`,
  `slab`, `node`, `cell`) — the previous attempt at "different" pages. All eight
  are variations of *fade-up with one extra property*. Banned, and banned as an
  idea.
- **Lenis smooth scroll at `duration: 1.15`** with the exponential easing in
  `lib/scroll.ts`, driving `gsap.ticker` globally. Project pages must not
  inherit this feel. (The *library* is neutral; this *configuration* is not.)
- **The `onFrame` global subscriber bus** and `onScene()/parallax()` in
  `lib/projectfx.ts` — banned; each page owns its own loop.
- Hover: `translate-x-2` on a row, `opacity 0 → 1` on a trailing label.

## 6. Chrome — banned furniture

Everything in `components/chrome/*` and `components/chrome/Stage.tsx`:

- **The three.js particle field** (`lib/field.ts`) — 6 morphing point-cloud
  formations, a GPU point cloud as page background. Banned in any form: no
  full-page particle systems on project pages.
- **The photographic plate stack** — `/plates/*.jpg` cross-faded and parallaxed
  behind everything at 18–34% opacity. The plate images themselves
  (`attention`, `eeg`, `embedding`, `loss-surface`, `spectrogram`, `tamil`) are
  banned as page backgrounds.
- **The radial `.veil`** — `radial-gradient(ellipse 122% 82% at 50% 48%, …)`
  darkening the edges over the field.
- **`.grain`** — the SVG `feTurbulence` noise tile animated on `steps(5)` at
  1.1s. Banned. No animated film grain on project pages.
- **The custom cursor** — 28px circle, `mix-blend-mode: difference`, inertial
  lerp, growing to 66px over links. Banned. (A project page may have a cursor
  idea, but not a blend-mode ring that scales on hover.)
- **The HUD** — fixed bottom-left loss curve canvas, "training loss / epoch
  0000 / 0100 / state: converging / N params", the 2px left-edge scroll
  progress bar with the magma gradient, and the `.hud-scrim` bottom fade.
- **The preloader** — full-screen `#0C0D0B` with a giant percentage
  bottom-left, three lines of mono status bottom-right, a coral progress hairline.
- **The escape hatch pill** — bottom-centre rounded blurred pill.
- **The route wipe** — `.wipe`, a full-screen colour panel scaling on Y from
  bottom then off the top over 0.95s. Banned as a transition.

## 7. Deleted implementations (read once, never reuse)

These files were the previous "different" project pages. They are gone.

| File | What it was |
|---|---|
| `src/routes/ProjectPage.tsx` | one template, 8 recipes: `{enter, pipe, res, hero}` |
| `src/components/case/Chapter.tsx` | `Section` again, with a `data-enter` attribute |
| `src/components/case/Pipeline.tsx` | 5 renderings of the same numbered stage list |
| `src/components/case/Results.tsx` | 5 renderings of the same metric row |
| `src/components/case/Rail.tsx` | a progress rail |
| `src/components/Signature.tsx` | 8 canvas "instruments", all fixed full-screen, all driven by the same global scroll bus |
| `src/components/Motif.tsx` | 10 more of the same, boxed in the hero |
| `src/lib/projectfx.ts` | `onScene` / `parallax` helpers |

**The failure mode they all share:** identical page architecture (hero → problem
→ approach → pipeline → results → challenges → honest note → stack → links),
identical reveal mechanism, identical type scale, identical spacing, with a
different accent colour and a different canvas doodle bolted on. *Recoloring is
not redesigning.* None of these eight section names may appear as a section on a
rebuilt page, in that order or any order.

---

## 8. What *may* be shared

- `react-router-dom` routing and the `/work/:slug` path shape.
- The back-link component (`src/projects/_shared/BackLink.tsx`).
- `prefers-reduced-motion` detection (`src/projects/_shared/reduced.ts`).
- The content in `src/data/content.ts` and `src/data/casestudies.ts` — the
  *words and numbers*, never the `theme` presentation fields.
- Libraries as libraries: `gsap`, `three`, `lenis`. Not their configuration
  above.

Everything else, every page invents.
