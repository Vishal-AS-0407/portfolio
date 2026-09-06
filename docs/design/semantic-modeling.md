# semantic-modeling — *The Plate*

`/work/semantic-modeling` · knowledge graphs from unstructured documents

---

## Narrative / story

609 entities, 304 relations and 14 topics, pulled out of a folder of PDFs that
could not be queried. The hard part was never the extraction — it was that three
clustering algorithms look at the same graph and disagree about where the
communities are, and each one's blind spot is different. The page is the drawing
they eventually agreed on: an engineering plate of a graph, drawn live, with the
disagreement shown rather than hidden.

## Visual metaphor

**A blueprint.** White line-work on saturated blueprint blue, dimension lines
with arrowheads, callout plates with leader lines, a title block in the corner,
revision stamps. Underneath it, the graph is *real*: a live force simulation
that the whole page is drawn on top of, and that the reader can drag.

## Palette

| Role | Hex |
|---|---|
| blueprint ground | `#0D2B4E` |
| deeper (vignette / plates) | `#092038` |
| line-work | `#BBD6F2` |
| ink (type) | `#EAF3FF` |
| dim | `#7BA0C7` |
| faint (grid) | `#164171` |
| accent — consensus / highlight | `#FF8A3D` |
| accent — measurement / dimension | `#FFE066` |

Two warm accents on a single saturated cool ground. No neutral ramp exists on
this page — every "grey" is a blue.

## Typography

- **Display — Syne** variable (`wght 400…800`), `/fonts/p/syne.woff2`. A
  genuinely odd geometric display face with flared, wide-set caps and unusual
  joins. Set at `clamp(34px, 5.4vw, 84px)`, `wght 700–800`, sentence case,
  `letter-spacing 0`, `line-height 1.04`. Nothing else on this site looks
  remotely like it.
- **Body / annotations — Newsreader** variable (`opsz 6…72`, `wght 300…700`),
  `/fonts/p/newsreader.woff2`, at 16–18px / 1.66, `wght 380`, `opsz 16`. A
  serif body under a wild display face reads like a technical monograph.
- **Dimensions and figures** — Newsreader 600 with `font-variant-numeric:
  tabular-nums oldstyle-nums`, in `#FFE066`, always sitting on a dimension line
  with tick ends.
- **Node labels** — Newsreader 500 at 12–13px, drawn into the canvas.
- **Title block** — bottom-right corner of every full-bleed plate: project,
  sheet number, scale, revision. Set in Newsreader small caps.

## Layout system

- **One persistent canvas; content orbits it.** The force-directed graph fills
  the viewport for the entire page. There are no stacked sections — the page is
  a **camera traversal** across the graph, and content arrives as **callout
  plates** anchored to specific nodes by leader lines.
- Callout plates are `#092038` panels with a 1px `#BBD6F2` border, a title-block
  strip, and a leader line with a dot terminator on the node they describe.
  They sit at hand-placed positions per beat, never in a grid.
- A blueprint grid (`#164171`, 40px major / 8px minor) is drawn under the graph
  and translates with the camera, so panning is legible.
- A fixed **sheet index** at the top-right: `sheet 1 of 8 · extraction`, which
  increments as the camera moves.

**Camera stations (not sections):** `1 extraction` → `2 relations` →
`3 pagerank` → `4 louvain` → `5 spectral` → `6 node2vec + hdbscan` →
`7 co-assignment` → `8 consensus` → `9 the five largest topics (tour)` →
`10 dimensions: 0.787 / 97.7% / 32% / $0.45 / 20 min` → `11 revision note` →
`12 title block`.

## Motion language

**Physics, not easing.** There is essentially no CSS transition on the graph:
node motion comes from a real simulation — spring attraction along edges,
inverse-square repulsion between nodes, velocity damping `0.86`, and per-station
target forces. Nothing has a duration; things *settle*.

- Simulation: spring `k = 0.012`, repulsion `q = 2200`, damping `0.86`,
  fixed timestep 1/60 with accumulator, capped at 3 substeps
- Callout plates: `cubic-bezier(.34,1.4,.5,1)` — a 260ms overshoot, the only
  eased motion on the page
- Camera: critically-damped spring toward the station target (`lerp 0.055`)
- Leader lines draw at `linear` over 220ms
- The graph is **draggable** — grab a node and the simulation responds; release
  and it re-settles. The page is interactive, not a movie.

## Signature set pieces

1. **The plate draws itself.** Entry: `#0D2B4E`, empty. The blueprint grid draws
   in — verticals left→right over 420ms, horizontals top→bottom over 420ms — then
   the title block corner-marks snap in. Only then does anything else exist.
2. **Extraction.** 609 nodes fall in as unlinked dust from random positions with
   randomised velocity, no edges. The counter climbs to `609`. Then 304 edges
   snap in over 900ms and the simulation *pulls the whole thing into shape* over
   ~2.5s of real physics. The single most satisfying moment on the page.
3. **PageRank.** Node radii re-scale to importance with a spring, and the top 8
   nodes get labels drawn with leader lines. The graph visibly gains a centre.
4. **Three algorithms disagree (scroll-scrubbed).** The same graph, coloured
   three ways in sequence — Louvain (modularity), spectral (Laplacian
   eigendecomposition), Node2Vec + HDBSCAN. Between each, nodes physically
   migrate to the new partition's centroids under spring force. Scrubbing back
   runs it backwards. The partitions genuinely differ; the callout names what
   each one misses.
5. **The co-assignment matrix.** The graph *collapses* into an N×N heat grid —
   every node flies to a matrix cell — and the consensus block-diagonal emerges
   as cells brighten in `#FF8A3D`. Then it explodes back into a graph with the
   final consensus clusters. Pinned, 240vh.
6. **Dimension lines.** `0.787` modularity against `0.670`, `97.7%` retrieval
   similarity, `32%` dedup, `~$0.45`, `~20 min` — each drawn as a blueprint
   dimension: a line with tick ends, an arrowhead pair, and the figure in
   `#FFE066` sitting in a break in the line. Drawn, never faded in.
7. **The tour.** The camera visits the five largest topics — GPT-3 (36),
   Transformer (30), ViT (28), CLIP (23), Neural Networks (21) — settling on
   each cluster, which brightens while the rest dims to 22%. Callouts arrive with
   the overshoot.
8. **Dedup, pairwise.** 32% of nodes merge in pairs: two nodes spring together,
   collide, and become one with a combined radius. Runs across the whole graph
   in a 1.4s wave.
9. **Revision note.** The honest note (self-generated benchmark, uncited
   baseline, coherence 0.894 vs 0.208 the other way) is a `REV. A` stamp on the
   plate with a red-orange revision cloud drawn around the modularity dimension —
   the blueprint convention for "this figure changed and here is why".
10. **Title block.** The colophon *is* the title block: project, links, stack,
    sheet 12 of 12, drawn as a real bordered block bottom-right.

## Scroll choreography

| Progress | Beat |
|---|---|
| 0 – 0.03 | grid draws, title block marks |
| 0.03 – 0.12 | 609 nodes fall; 304 edges snap; the graph settles |
| 0.12 – 0.20 | PageRank re-scales; the graph gains a centre |
| 0.20 – 0.44 | three algorithms disagree (scrub, reversible) |
| 0.44 – 0.62 | **pinned** — co-assignment matrix → consensus |
| 0.62 – 0.74 | the tour of the five largest topics |
| 0.74 – 0.82 | dedup, pairwise |
| 0.82 – 0.92 | dimension lines: 0.787 / 97.7% / 32% / $0.45 / 20 min |
| 0.92 – 0.97 | revision cloud, REV. A |
| 0.97 – 1.00 | title block |

Mobile: node count drops 609 → 210 (a stated, visible `subset` note on the
plate, not a silent degradation), the drag interaction stays, the camera tour
becomes four stations instead of five, and callout plates go full-width at the
bottom with the leader line pointing up.

## Entry + exit transition

**Entry:** the blueprint grid draws itself, then the dust falls. There is no
colour wipe and no fade — the page is *drafted*.
**Exit:** the simulation's damping drops to 0.4 and the graph relaxes apart,
edges erase, the grid un-draws.

## Distinctiveness statement

- **vs the landing page** — saturated blueprint blue vs olive black; Syne +
  Newsreader vs Archivo + Martian Mono; a serif body, which the landing page
  never uses; physics with no durations vs 1s eased fades; a camera traversal of
  one canvas vs 13 stacked `100vh` sections; drawn dimension lines vs hairline
  rules; **interactive** (draggable) vs strictly passive.
- **vs every sibling** — the only page running a physics simulation; the only
  page where the substrate is one continuous canvas rather than a document; the
  only page you can grab and pull; the only blueprint-blue ground; the only page
  with a serif body face and drawn dimension annotations.
