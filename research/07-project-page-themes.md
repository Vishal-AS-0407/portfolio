# Per-project page themes — design plan

Written 2026-08-13, before any code. One section per case study.

---

## Where the pages stand today

All eight case studies render through a single `ProjectPage.tsx`. Each project owns a
`theme { bg, ink, accent, plate, motif }`, so the **colour** differs — but the
**layout, section order, motion and transitions are identical across all eight**.
Every page is: hero → problem → approach → pipeline → results → challenges → honest
note → stack → links. Same rhythm, same reveal, same everything.

So the complaint is right at the level that matters: colour alone is not an identity.

## What changes

Three layers, per project:

1. **Palette** — extended from 3 colours to 6 (ground, ink, accent, counter-accent,
   hair, glow) so each page can carry a second voice.
2. **Composition** — each project gets a *layout archetype* that reorders and
   restructures the page. Not a reskin: different scaffolding.
3. **Signature** — one bespoke scroll-driven canvas per project that *is* the project.
   This is where most of the identity lives, and it's the part that can't be
   reused between pages.

Plus a themed page transition, so moving between case studies feels like changing
instruments rather than reloading a template.

### Shared engine, unique composition

Eight fully bespoke pages would be unmaintainable and would drift. Instead: a library
of scene treatments (`Stack`, `Split`, `Pinned`, `Nodes`, `Strata`, `Grid`) composed
in a different order per project, plus a genuinely bespoke signature canvas each. The
chrome — cursor, HUD, escape hatch — stays constant so the site still reads as one
site.

### Motion budget

Same tiering as the home page: tier 2 desktop full, tier 1 mobile reduced (fewer
particles/layers, no pinning), tier 0 reduced-motion → static end-state, everything
still readable. Nothing below is allowed to break scrolling if animation is off.

---

## 01 · baby-cry — "Why My Baby is Crying"

**Theme: NIGHT WARD.** A nursery at 3am. The subject is audio in a narrow band, so
the page behaves like a spectrogram being played.

| | |
|---|---|
| ground | `#0E0A12` plum-black |
| ink | `#F2E9F5` |
| accent | `#DE4968` rose |
| counter | `#FFA45B` — the nightlight amber, used only on the passband |
| type | headline tight and heavy; metrics set as level-meter readouts |

**Archetype — WATERFALL.** A mel spectrogram runs the full height of one edge, pinned,
and fills downward as you scroll. Scrolling the page literally plays the clip.

**Signature — the bandpass gate.** At the *conditioning* phase the page's own content
dims and blurs everything outside **142.91–6620.12 Hz** — the band the model actually
keeps. The passband stays sharp and amber. It is the one number in the case study that
most people skim past, made into the page's centrepiece.

**Motion.** Content enters low-pass-blurred and sharpens. Results count up like a VU
meter with a settle overshoot. Pipeline phases slide as horizontal frequency bands.

---

## 02 · eeg-emotion — "Mental Health Analysis"

**Theme: TRACE.** A chart recorder that never stops.

| | |
|---|---|
| ground | `#07100F` near-black teal |
| ink | `#E4F2EF` |
| accent | `#4FD6C1` |
| counter | `#7B8CFF` — reserved for the ERP stimulus marker |
| type | clinical, monospace-forward labelling |

**Archetype — CHART RECORDER.** Fourteen channels run down a pinned left column for
the entire page. Scroll is time. Copy sits to the right, timestamped against the trace.

**Signature — the ERP.** At the point in the scroll where the case study describes
event-related potentials, a stimulus marker fires and **all fourteen channels spike in
sync**, then settle. The counter-accent appears exactly once, there.

**Motion.** Sections arrive with an electrode-settling jitter. The three VAD results
(98.6 / 96.6 / 95.7) render as radial gauges that sweep to value.

---

## 03 · dravidian-sentiment — "Tamil Political Sentiment"

**Theme: ATTENTION.** The project is about a language, so the page is made of
language.

| | |
|---|---|
| ground | `#12100A` warm black |
| ink | `#F5EFE0` |
| accent | `#D8A93F` gold |
| counter | `#C4553B` terracotta — the negative class |
| type | editorial, largest type on the site, real Tamil script as texture |

**Archetype — TYPESET.** Oversized Tamil glyphs as slow parallax layers behind the
copy. Requires subsetting Noto Sans Tamil — if that can't be made to work cleanly,
fall back to token-stream typography rather than shipping tofu.

**Signature — the attention matrix resolving.** Starts as noise and converges toward
structure as you scroll, token pairs lighting as weights sharpen. Ends on the
leaderboard: a rank row that climbs from 25 to **1**.

**Motion.** Word-by-word mask reveals rather than line-by-line — the only page that
does this. Token chips stream in and highlight.

---

## 04 · fraud-detection — Federated learning + CKKS

**Theme: SEALED.** Banks that will not show each other their data.

| | |
|---|---|
| ground | `#0A0C14` |
| ink | `#E6EAF5` |
| accent | `#6E8BFF` |
| counter | `#9BFFD9` — a value that has just been decrypted |
| type | institutional, ledger-ruled, tabular figures |

**Archetype — NODES.** Sections sit offset from each other like clients in a
federation, joined by animated links that carry payloads toward a central server band.

**Signature — the cipher reveal.** **Every number on the page renders as ciphertext
and decrypts when it enters view** — a character-scramble that resolves into the real
figure. It is the most striking effect of the eight and it is exactly what the project
does. The counter-accent flashes at the moment of decryption, then fades to accent.

**Motion.** The pipeline animates as federated rounds: clients compute, gradients
travel encrypted, the server aggregates, weights travel back.

---

## 05 · wisp — Wildlife species identification

**Theme: CAMERA TRAP.** Night in cluttered undergrowth.

| | |
|---|---|
| ground | `#0B100A` |
| ink | `#E9F2E4` |
| accent | `#8FBF5A` |
| counter | `#E8C86A` — the confidence readout |
| type | field-notebook labelling, small caps |

**Archetype — DEPTH FIELD.** The heaviest parallax of the eight: five layers of
foliage silhouette at different rates, with copy living *between* the layers rather
than on top of them.

**Signature — the classifier running over the page.** Reticles snap onto elements as
they enter, with a class name and a confidence figure. Deliberately **not** bounding
boxes — the case study's honest note says the dataset had none, so these are
classification reticles, which is what the model actually produces. Accuracy of the
metaphor matters more than the effect.

**Motion.** Terrain contour lines draw on for the threat-map section. A shutter wipe
between sections.

---

## 06 · memora — Hierarchical LLM memory

**Theme: RECALL.** Layered strata, indexed and retrievable.

| | |
|---|---|
| ground | `#0D0B10` |
| ink | `#EDE8F2` |
| accent | `#A97FE0` violet |
| counter | `#5FD3C4` — the retrieved slice |
| type | indexed, every block carries a domain tag |

**Archetype — STRATA.** Horizontal memory bands stacked through the full page depth;
scrolling moves *through* them. Each section is tagged to a domain, and the tag is
visible on the strata.

**Signature — the retrieval sweep.** As a section enters, a query beam sweeps the
bands and **only the relevant slice lights up** while the rest dim. That is precisely
the claim of the project — domain-wise retrieval without cross-talk — shown rather
than stated. The hallucination figure animates 14.3% → 1.4% as the sweep completes.

---

## 07 · semantic-modeling — Knowledge graphs

**Theme: COMMUNITIES.** The best scroll-story of the eight, because the project
*is* a sequence of transformations on a graph.

| | |
|---|---|
| ground | `#0A0D12` |
| ink | `#E4ECF5` |
| accent | `#5FA8D3` |
| counter | `#F2A65A` — community boundaries |
| type | structural, node-labelled |

**Archetype — GRAPH.** A live force-directed graph behind the entire page.

**Signature — the graph builds through the five phases.** Scroll drives it:
parse → **nodes appear** · extract → **labels attach** · construct → **edges connect**
· enhance → **edges thicken and weak ones prune** · cluster → **the graph partitions
into coloured communities** and the modularity number settles at 0.787. One continuous
simulation from top to bottom, with scroll as the only control.

---

## 08 · qubit-green-finance — ESG / SDG impact

**Theme: MATRIX 15×3.** The project's own artefact is a matrix, so the matrix is the
page's structural grid.

| | |
|---|---|
| ground | `#0A100E` |
| ink | `#E4F2EE` |
| accent | `#3FB58F` |
| counter | `#E4B363` — capital allocated |
| type | tabular, spreadsheet-as-art, precise |

**Archetype — GRID.** Sections snap to cells of a 15×3 lattice that is visible
throughout.

**Signature — the matrix fills, then optimises.** Cells populate with SDG scores in a
staggered sweep, then **re-sort under the constraint optimiser** into a capital
allocation, bars redistributing to their final weights. Two beats: measurement, then
decision.

---

## Cross-cutting

**Page transition.** Leaving a case study wipes in that project's accent; arriving
wipes out in the destination's. Route changes stop feeling like reloads.

**The global particle field** already fades to 0.22 on project routes. It drops
further, to ~0.10, now that each page carries its own full-strength signature — the
signature should never fight the field.

**Type scale per project.** Each project gets its own headline scale and tracking, so
even a screenshot with the colour removed would be identifiable.

**Order of build.** Engine primitives → signatures (highest value, most identity) →
archetypes → transition → polish. If budget runs short, the signatures are what ship
first; they carry the most identity per unit of work.
