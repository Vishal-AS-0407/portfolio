# TASK TRACKER

Every requirement of the original brief, tracked to completion. `[x]` means done
**and verified**, not done and hoped for.

---

## Step 1 — Analyse the repo

- [x] Walk the codebase: framework, routing, build, styling, components, assets
- [x] Understand how the main page is composed
- [x] List every project that has (or should have) a sub-page — **8**
- [x] `docs/design/00-do-not-reuse.md` — the main page's DNA as a blocklist:
      fonts, type scale, palette + hex, spacing, grid, hero, section pattern,
      component names, animation library, easings, scroll behaviours, nav

## Step 2 — Understand each project, then design it

Each doc carries: narrative, visual metaphor, palette with hex, typography,
layout system, motion language with curves, 4–8 set pieces, scroll choreography,
entry + exit transition, distinctiveness statement.

- [x] `baby-cry.md`
- [x] `eeg-emotion.md`
- [x] `dravidian-sentiment.md`
- [x] `fraud-detection.md`
- [x] `wisp.md`
- [x] `memora.md`
- [x] `semantic-modeling.md`
- [x] `qubit-green-finance.md`

## Step 3 — Self-check the plan

- [x] Pairwise across metaphor family, layout architecture, palette temperature,
      motion personality
- [x] Each checked against the blocklist
- [x] Proceeded straight to implementation without waiting for approval

## Step 4 — Implement

### Teardown
- [x] `ProjectPage.tsx`, `components/case/*`, `Signature.tsx`, `Motif.tsx`,
      `lib/projectfx.ts` deleted, not refactored
- [x] Dead case-study CSS stripped from `index.css`
- [x] Landing chrome (Stage/Hud/Cursor/EscapeHatch/Preloader/Lenis) mounts only on `/`
- [x] `Home.tsx` never modified

### Pages — own components, own tokens, own namespace, no shared primitives
| Page | Written | Routed | Rendered & fixed |
|---|---|---|---|
| baby-cry — *Night Shift* | [x] | [x] | [x] |
| eeg-emotion — *Paper* | [x] | [x] | [x] |
| memora — *The Catalogue* | [x] | [x] | [x] |
| semantic-modeling — *The Plate* | [x] | [x] | [x] |
| dravidian-sentiment — *Muzhakkam* | [x] | [x] | [x] |
| fraud-detection — *Sealed* | [x] | [x] | [x] |
| wisp — *After Dark* | [x] | [x] | [x] |
| qubit-green-finance — *Allocation* | [x] | [x] | [x] |

### Technique varied per project, never reused twice
- [x] baby-cry — WebGL fragment shader
- [x] eeg-emotion — pinned horizontal transport + SVG clip-rect drawing
- [x] memora — GSAP ScrollTrigger pinning, 3D perspective transforms
- [x] semantic-modeling — canvas force simulation, draggable
- [x] dravidian-sentiment — kinetic type, poster slams, velocity-coupled marquee
- [x] fraud-detection — character-scramble decryption, split-column masking
- [x] wisp — pointer-driven mask lens, procedural imagery, 4-plane parallax
- [x] qubit-green-finance — CSS scroll-snap deck, clip-path wipes, interactive grid

### Animation requirements
- [x] Real multi-layer parallax with distinct depth ratios — wisp, four planes
      (0.06 / 0.14 / 0.28 / 0.46) on scroll **and** pointer
- [x] Scroll-driven timelines, pinned/sticky sequences — baby-cry's bandpass
      gate, eeg's transport, memora's two ScrollTrigger pins, fraud's CKKS gate,
      dravidian's scrubbed shredder, semantic-modeling's matrix
- [x] Masked and clipped reveals — eeg's pen clip rect, fraud's seal opens,
      qubit's clip-path wipes, wisp's pointer lens, baby-cry's shutters
- [x] Kinetic typography — dravidian's shredder, rewrite and emoji cuts
- [x] Staged entrance choreography — every page has one, all eight different
- [x] Meaningful page transitions — held tone / grid print / paste-up slam /
      slat shutter / IR flash / drawer / plate draw / press run
- [x] No section that is merely "content, fading up" — the landing page's
      `.fade` is not used and not reimplemented on any page

### Technical constraints
- [x] transform/opacity/clip-path only; no layout thrash in any rAF loop
- [x] rAF-throttled scroll work, one loop per page
- [x] Every listener, observer, timeline, RO and WebGL context cleaned up
- [x] Full `prefers-reduced-motion` path on every page — rendered and checked
- [x] Designed mobile reduction on every page — rendered at 390px and checked
- [x] Semantic HTML, keyboard navigable, focus states, alt text
- [x] No CLS — no page reflows on load; fraud's scramble reserves each cell's
      finished width, wisp's frames reserve with `aspect-ratio`
- [x] Lazy-loaded routes; per-route CSS and font chunks

## Step 5 — Verify each page

- [x] `npm run build` green at the end
- [x] Screenshot review, desktop — all 8
- [x] Screenshot review, mobile at 390px — all 8, zero horizontal overflow
- [x] `prefers-reduced-motion` render check — all 8, zero console errors
- [x] Self-review: mechanical audit in BUILD-LOG.md — **zero font families
      shared** between any two pages or with the landing page, **eight distinct
      primary easing curves**, none of them the house `cubic-bezier(.16,1,.3,1)`,
      and a grep for Archivo / Martian Mono / the magma hexes / the olive ground
      / `/plates/*.jpg` across all eight returns nothing. Eight different
      grounds and eight different page architectures.
- [x] Six real bugs found by rendering and fixed — all six had passed `tsc`

## Step 6 — Wrap up

- [x] `docs/design/BUILD-LOG.md` — per page: concept, set pieces, techniques,
      distinctiveness, plus 8 decisions made on the user's behalf and 5 items
      flagged for review

## Working rules

- [x] Never modified the main/landing page. One caveat, stated plainly: a
      Certifications `sm:` → `lg:` responsive fix was **already uncommitted in
      the working tree** when this session began, and `git add -A v2/src` swept
      it into commit `24c1096`. It is your edit, not mine — I authored no change
      to `Home.tsx`, and the file is otherwise byte-identical to `0cc6c80`.
- [x] One commit per project page, clear message
- [x] Build green at every step
- [x] Never adapted an existing page — every page started from zero

---

## Done

All eight pages built, routed, rendered and verified. Nothing from the original
brief is outstanding. The open items are judgement calls, not gaps, and they are
listed under **Flagged for you** in `BUILD-LOG.md`.
