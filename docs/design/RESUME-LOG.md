# RESUME LOG — paused 2026-09-06

Paused mid-run at the user's request (credits). This file is the handover: read
it first, then `00-do-not-reuse.md`, then `01-implementation-conventions.md`,
then the concept doc for whichever page you are picking up.

---

## ⚠️ Read before touching the repo

**Three project folders are on disk but NOT committed.** They were being written
by parallel agents when the session paused:

```
v2/src/projects/dravidian-sentiment/   index.tsx  wall.css  tears.ts  (+2 __preview.* scratch files to delete)
v2/src/projects/fraud-detection/       index.tsx  sealed.css  cipher.ts  Seal.tsx
v2/src/projects/wisp/                  index.tsx  wisp.css  ir.ts  shapes.ts  species.ts  Frame.tsx
```

They are substantial (25–41 KB each) and represent real work. **Do not run
`git clean`, and do not delete these folders.** They are unreviewed and at
least one (`wisp/ir.ts`) had an open TypeScript error when the session paused,
which is why they were not committed — `npm run build` is currently red because
of it.

`v2/src/App.tsx` does **not** route these three yet. That is deliberate: the
committed tree builds green without them.

---

## What is done

### Committed and verified

| Commit | Contents |
|---|---|
| `0352e98` | `docs/design/*` — the blocklist and eight concept docs; 16 self-hosted fonts in `v2/public/fonts/p/` |
| `24c1096` | Teardown of the old shared template + the new route shell + **baby-cry** |
| `54f2d91` | **eeg-emotion**, **memora**, **semantic-modeling** (+ two bug fixes on the first two pages) |

**Step 1 (analyse), Step 2 (concept docs), Step 3 (pairwise self-check) are
complete.** Step 4 (implement) is 4 of 8 pages done, 3 in progress, 1 not
started.

### The teardown

Deleted, not refactored: `src/routes/ProjectPage.tsx`, `src/components/case/*`,
`src/components/Signature.tsx`, `src/components/Motif.tsx`, `src/lib/projectfx.ts`.
Dead case-study CSS stripped from `src/index.css`. `content.ts`'s
`theme.sig` type no longer points at the deleted `Signature` module.

### The route shell

`src/App.tsx` now mounts the landing page's entire world — particle `Stage`,
`Hud`, `Cursor`, `EscapeHatch`, `Preloader`, and the Lenis scroll spine — only
on `/`. A project route mounts none of it and lazily loads a self-contained
module, so each page's CSS chunk and `@font-face` files are fetched only when
that route is opened. **`Home.tsx` was never touched.**

Shared, and nothing else: `src/projects/_shared/BackLink.tsx`,
`_shared/page.ts` (`usePageShell`, `raf`, `clamp01`, `lerp`, `track`),
`_shared/reduced.ts`.

### Pages finished

1. **baby-cry — "Night Shift"** · `projects/baby-cry/`
   One night in timestamps over a live WebGL spectrogram whose uniforms are the
   argument (energy floods in, the 142.91–6620.12 Hz Butterworth band closes in
   a pinned gate, the sound drains at 06:12). Fraunces lowercase in a 620px
   column, amber/teal on navy, 1.6–2.2 s blooms, no rule or grid anywhere.
2. **eeg-emotion — "Paper"** · `projects/eeg-emotion/`
   A chart recorder scrolling sideways. Two rigs on two physically different
   sheets, three galvanometers settling on the VAD figures, 9.78 ms calipers, a
   report that tears off. Warm paper, pink millimetre grid, stepped motion.
3. **memora — "The Catalogue"** · `projects/memora/`
   A card catalogue on a slate ground; the only page with perspective, Z motion
   and cast shadows. GSAP ScrollTrigger pins two stages; recall runs 40 → 6 → 3.
4. **semantic-modeling — "The Plate"** · `projects/semantic-modeling/`
   A blueprint over a live force simulation you can grab. Ten camera stations,
   three partitions that physically re-group, a co-assignment matrix that
   imposes itself on the nodes and then releases them into consensus.

---

## What is left

### A. Finish the three in-flight pages

For each: read `docs/design/<slug>.md`, fix the code already on disk (do not
restart from zero — it is close), then register the route in `App.tsx`:

```tsx
'dravidian-sentiment': lazy(() => import('@/projects/dravidian-sentiment')),
'fraud-detection':     lazy(() => import('@/projects/fraud-detection')),
wisp:                  lazy(() => import('@/projects/wisp')),
```

Known outstanding:
- `wisp/ir.ts:327` — `Float32Array<ArrayBufferLike>` is not assignable to
  `Float32Array<ArrayBuffer>`. Annotate the array's buffer type or construct it
  as `new Float32Array(n)` rather than from a `.buffer`.
- Delete `dravidian-sentiment/__preview.html` and `__preview.tsx` (agent scratch).
- None of the three has been screenshot-reviewed yet. **No page ships on an
  agent's word alone** — every one needs the review pass in section C.

### B. Build the eighth page

**qubit-green-finance — "Allocation"** has a full concept doc
(`docs/design/qubit-green-finance.md`) and **no code at all**. It is the
simplest of the eight: a `scroll-snap` panel deck on a flat Swiss 15×3 grid,
Bricolage Grotesque + Instrument Sans, `clip-path` column wipes only, no canvas
and no continuous animation loop. Fonts are already downloaded
(`/fonts/p/bricolage.woff2`, `/fonts/p/instrument-sans.woff2`).

### C. Review pass (Step 5), per page

```
cd v2 && npm run build          # tsc --noEmit && vite build — must be green
npx vite preview --port 4173    # then screenshot at several scroll depths
```

A screenshot harness is at
`<scratchpad>/shot.mjs` (Playwright + Chromium already installed in
`<scratchpad>/node_modules`). Usage:
`node shot.mjs "wisp|0,0.2,0.5,0.8" "fraud-detection|0,0.3,0.6|420"`
(the third field is viewport width; it also reports console errors and
horizontal overflow).

Check each page against: *does it share a font, an accent colour, a hero
structure, a section pattern or a scroll behaviour with the landing page or with
any sibling?* Also verify the `prefers-reduced-motion` path and a real mobile
layout.

### D. Step 6

Write `docs/design/BUILD-LOG.md`: per page, the concept in one line, the set
pieces built, the techniques used, what makes it distinct, decisions made on the
user's behalf, and anything to flag. Points already worth recording:

- **Fonts.** 16 families downloaded from Google Fonts and self-hosted under
  `v2/public/fonts/p/`. No page shares a family with another or with the
  landing page.
- **The landing page's chrome was moved, not deleted.** It now renders only on
  `/`. This changes nothing about how `/` looks or behaves, but it is a
  structural change to `App.tsx` worth a look.
- **`content.ts` `theme` objects are now legacy.** The landing page's work index
  still reads `theme.accent` and `theme.name` for its hover preview, so they
  were left exactly as they were; the rebuilt pages ignore them entirely. That
  means a project page's palette no longer matches the accent its row previews
  on the index. Worth deciding whether to reconcile.
- **memora deviates from its concept doc**: "two indexes" and "recall" were
  merged into one continuous 620vh pinned traversal rather than two separate
  set pieces. It reads better as one movement and still delivers both.
- **eeg-emotion deviates from its concept doc**: mobile keeps the pinned
  horizontal transport (at 430vw with fewer lanes) instead of being re-cut into
  five separate stacked strips. The metaphor survives and the code stays one
  implementation.

---

## Two bugs already paid for — do not rediscover them

1. **Never put `overflow` on a page's scope root.** Any value other than
   `visible` makes that element the scroll container for `position: sticky`
   inside it, and every pinned section silently stops working partway down.
   Clip on the sticky element itself.
2. **A fixed overlay with a `z-index` outranks everything at `z-index: auto`.**
   If a page has a fixed scrim or canvas at `z-index: 1`, *every* content
   section needs `position: relative` and an explicit higher `z-index` — not
   just the ones that happened to be tested.

Both are recorded in `01-implementation-conventions.md`.

## Housekeeping

- Shell heredocs containing certain quote patterns failed in this environment;
  file edits were done by writing a Python patch script to the scratchpad and
  running it. If a `python - <<'PY'` heredoc dies with "unexpected EOF", that is
  why — write the script to a file instead.
- `npx vite build` alone skips the `tsc` gate, which is useful for previewing
  while an unrelated file is mid-edit. `npm run build` is the real gate.
