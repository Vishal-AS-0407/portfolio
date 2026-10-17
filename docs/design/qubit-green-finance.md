# qubit-green-finance — *Allocation*

`/work/qubit-green-finance` · Qubit — green finance system · a 15×3 SDG impact matrix

---

## Narrative / story

Twenty candidate projects, one budget, fifteen goals, three impact axes. The
temptation is to score everything and sort the list. This project refuses to:
the decision is a constrained optimisation, and the constraints bind — a budget
cap, per-project floors and ceilings, a 40% concentration limit and a hard ESG
floor of 0.7 below which allocation is *zero*, not small. The page is the
constraint set. The 15×3 matrix is not an illustration on the page; it is the
page's grid.

## Visual metaphor

**A Swiss allocation poster / an accounting ledger, printed flat.** Hard-edged
blocks of flat colour on a bone stock, tabular numerals, no shadows, no
gradients, no texture, no curves. Every element is a rectangle whose area means
an allocation. The page reads like a printed annual-report spread that someone
has made interactive.

## Palette

Four flat inks. Nothing is ever blended, tinted or faded between them.

| Role | Hex |
|---|---|
| stock (bone) | `#EFEAE0` |
| ink | `#111111` |
| forest (allocated / environmental) | `#134E37` |
| gold (economic axis, measurement) | `#E8C547` |
| null grey (below the ESG floor) | `#7A7A72` |
| social axis | `#111111` on gold, or bone on forest — no fifth colour |

Colour switches are **cuts**, done with `clip-path` along grid lines, never
opacity fades.

## Typography

- **Display — Bricolage Grotesque** variable, `/fonts/p/bricolage.woff2`, used
  at `wght 700–800`, `opsz` matched to size, **width axis left at its default and
  never animated**. Set sentence case at `clamp(38px, 7vw, 116px)`,
  `line-height .98`, `letter-spacing -.012em`. Bricolage's slightly wonky,
  ink-trapped Swiss forms keep this from being a Helvetica pastiche.
- **Body / labels — Instrument Sans** variable, `/fonts/p/instrument-sans.woff2`,
  400/500/600 at 15–17px / 1.55, max 50ch.
- **Figures — Instrument Sans 600 with `font-variant-numeric: tabular-nums`**,
  set large (28–72px) inside cells. Every number in the matrix occupies exactly
  the same advance width, because a matrix that jitters is not a matrix.
- **Cell coordinates** — Instrument Sans 500 at 10.5px, sentence case,
  `letter-spacing 0` (explicitly *not* a tracked uppercase micro-label).

## Layout system

- **A scroll-snap panel deck.** `scroll-snap-type: y mandatory` on the page
  container; every panel is exactly `100dvh` and snaps. This is the only page on
  the site that snaps, and the only one where you cannot stop between two ideas.
- **The 15×3 matrix is the master grid.** The page grid is 15 columns × 3 rows
  at the panel level too: headlines occupy named cell ranges, blocks of colour
  occupy exact column spans. Nothing is centred, nothing is `max-width`-ed —
  everything is `grid-column: 4 / 11`.
- Inside the matrix panel: a real 15×3 interactive grid, keyboard navigable with
  arrow keys, each cell showing SDG × axis with a score; hovering or focusing a
  cell highlights its full row and column as flat blocks.
- A horizontal SDG band that scrubs sideways under vertical scroll on its own
  panel.

**Panel order:** `01 the grid asserts itself` → `02 the problem, in one
sentence` → `03 the matrix (interactive)` → `04 fifteen goals (horizontal
scrub)` → `05 three agents` → `06 the objective function` → `07 the ESG floor`
→ `08 the 40% cap` → `09 allocation` → `10 prototype` (honest) →
`11 the ledger` (stack, links).

## Motion language

**Grid-locked and instant.** Nothing on this page takes longer than 260ms and
nothing moves off a grid multiple. Colour arrives by wipe along a grid line;
numbers tick in integer steps; blocks translate by whole columns. There is no
easing tail, no blur, no scale, no rotation, no parallax — the page's motion
personality is *precision*, and its only rhythm is the snap.

- Primary: `cubic-bezier(.7,0,.2,1)`, 140–260ms
- Column wipes: `clip-path: inset(0 100% 0 0) → inset(0)`, 180ms, staggered
  **40ms per column**
- Counters: `steps()`-quantised, integer or 2dp, never a smooth lerp
- Snap: native CSS scroll-snap; JS never fights it
- The only continuous motion on the entire page is the horizontal SDG band.

## Signature set pieces

1. **The grid asserts itself.** Entry: bone. 45 cells (15×3) wipe in column by
   column at 40ms — 600ms end to end — in forest, gold and ink. Then 43 of them
   wipe out and the surviving two carry the title. The grid was there before the
   content and it stays for the rest of the page.
2. **The matrix, live.** A real 15 × 3 interactive grid at panel scale. Hover or
   arrow-key a cell: the cell fills forest, its row and column fill at 18%, and
   a readout in the margin names `SDG 07 Affordable and clean energy ×
   environmental · 0.81`. Fully keyboard operable with a visible focus block.
   Below 0.7 the cell is `#7A7A72` and reads `below floor`.
3. **Fifteen goals, sideways.** A sticky panel where vertical scroll drives a
   horizontal band of the 15 SDGs, each a full-height colour block with its
   number set at `clamp(90px, 22vw, 260px)`. The band moves at exactly 1:1 with
   scroll — no smoothing, no lag, no parallax.
4. **The objective function.** Set as typography, one term per line at display
   size:
   `maximise Σ esg_i · x_i` / `− 0.10 · Σ x_i` / `− 0.05 · Σ risk_i · x_i`.
   As the panel is entered, each term's coefficient block wipes in and the term
   being explained is the only one in ink; the others are `#7A7A72`.
5. **The ESG floor.** Twenty bars, one per project. A hard 4px ink rule at 0.7
   draws across. Then, in one 180ms move, **every bar below the rule drops to
   zero simultaneously** — not eased, not staggered. Seven of twenty vanish. It
   is the most violent moment on the page and it takes less than a fifth of a
   second.
6. **The 40% cap.** One project's bar grows past 40% of the budget and is
   **clipped mid-motion** by a rule that was already there. The clipped remainder
   is redistributed as three smaller blocks that wipe in elsewhere.
7. **Allocation.** A single horizontal bar representing the $1,000 notional
   budget divides itself into flat segments by column wipe, each labelled with a
   tabular figure. The three specialist agents (`document_processor`,
   `esg_analyzer`, `risk_assessor`) are credited as three ink blocks above it.
8. **Prototype.** The honest note gets a whole panel in `#7A7A72` on bone — the
   only panel with no colour and no motion at all. It states plainly: 20
   randomly generated candidates, ESG 0.6–0.9, risk 4–7, a $1,000 notional
   budget, a README that badges five technologies the committed code does not
   use, a team fork in which 15 of 26 commits are his.
9. **The ledger.** The colophon is a ledger table: stack, links, sheet totals,
   ruled with 1px ink lines and tabular figures, right-aligned.

## Scroll choreography

Eleven snapped panels. There is no in-between state — the choreography is
per-panel, and each panel plays its move on entry (via a snap-aware
IntersectionObserver at `threshold: 0.6`).

| Panel | Beat |
|---|---|
| 01 | 45-cell column wipe; 43 clear; title |
| 02 | the problem, one sentence, cells 4–11 |
| 03 | the interactive 15×3 matrix |
| 04 | the horizontal SDG band (sticky, 1:1 scrub) |
| 05 | three agents as three ink blocks |
| 06 | the objective function, term by term |
| 07 | the ESG floor; seven bars drop |
| 08 | the 40% cap; clip and redistribute |
| 09 | allocation of the $1,000 budget |
| 10 | prototype — grey, still, honest |
| 11 | the ledger; back to index |

Mobile: the matrix becomes 5 columns × 3 rows, paged in three swipes with the
SDG number always visible; the horizontal band becomes a native
`scroll-snap-type: x` strip the reader drives directly; panels stay snapped at
`100dvh` and every figure keeps its size.

## Entry + exit transition

**Entry:** a hard three-stage column wipe across the full viewport — bone →
forest → gold → bone, each stage 40ms per column, 15 columns. It reads as a
press run. Total 480ms.
**Exit:** the same wipe in reverse, ending on bone.

## Distinctiveness statement

- **vs the landing page** — flat bone and three inks vs a neutral ramp with one
  hot accent; Bricolage + Instrument Sans vs Archivo + Martian Mono; hard
  `clip-path` cuts vs opacity fades; 140–260ms vs 1s; a snapped panel deck vs a
  continuous scroll; a grid that is *the data* vs a grid that is a layout
  convenience; zero canvas, zero WebGL, zero parallax — the landing page is
  nothing but parallax.
- **vs every sibling** — the only page with CSS scroll-snap; the only page with
  a genuinely interactive, keyboard-navigable data grid; the only page with no
  canvas and no continuous animation loop at all; the only flat-colour-block
  page; the only page whose motion is exclusively `clip-path`.
- **Amendment (2026-10, subpage overhaul)** — one exception, by request: the
  isometric mechanism section between panels 09 and 10 is a WebGL canvas. It
  keeps the poster's terms (flat tints of the four inks, no light, no shading,
  ink hairline edges, an orthographic camera, captions cut in by `clip-path`)
  and its loop runs only while it is on screen. Everything else above still
  holds for the deck's eleven panels.
