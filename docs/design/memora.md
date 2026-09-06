# memora — *The Catalogue*

`/work/memora` · Memora · hierarchical memory for LLMs

---

## Narrative / story

A conversation ends and its context dies with it. The usual fix — replay the
whole transcript into the prompt — is expensive and makes hallucination worse,
because the one turn that mattered is buried in forty that didn't. Memora files
instead of replaying: every exchange becomes a card, the card gets a topic
stamped on it, and recall pulls the three cards that matter out of the drawer.
The page is that drawer.

## Visual metaphor

**A physical card catalogue.** A slate-grey room, an oak drawer, ruled index
cards with a red top line and blue rules, a brass label holder, a steel rod
through the punch holes, and a rubber stamp for topics. Everything on this page
is an object with a thickness and a shadow — the only page on the site with
depth, weight and cast shadows.

## Palette

A **mid-tone** ground: neither the landing page's near-black nor a paper white.

| Role | Hex |
|---|---|
| ground (the room) | `#2E3338` |
| drawer / oak | `#4A3B2A` |
| drawer shadow | `#1D2125` |
| card stock | `#F2EFE9` |
| card rule (blue) | `#9FB8D0` |
| card red line | `#C4483E` |
| card ink | `#20242A` |
| brass (label holders, rod) | `#D98E2B` |
| stamp ink | `#3B5BA5` |
| dim (on slate) | `#9AA3AB` |

## Typography

- **Card content — Courier Prime** 400 / 700 / 400 italic
  (`/fonts/p/courier-prime.woff2`, `-b`, `-i`). A **typewriter serif**, not a
  technical grotesque mono. Set at 15–19px, **lowercase, tracking 0**, on the
  card's blue rules. Cards are typed; that is the whole idea.
- **Room-side headings — Manrope** variable (`/fonts/p/manrope.woff2`), 500–700
  at 30–68px, sentence case, `letter-spacing -.008em`, `line-height 1.1`.
  Rounded and geometric — soft, quiet, architectural.
- **Brass labels** — Manrope 700 at 12px with `letter-spacing .06em`, engraved
  (a 1px dark inset + 1px light outset), *not* a tracked mono kicker.
- Figures on cards use Courier Prime 700 at 34–56px — typewriter numerals at
  display size, which no other page does.

## Layout system

- **A pinned card stack is the page's spine.** Sections are *drawers*; the
  content of a drawer is a stack of cards that you scroll through. Cards are
  absolutely positioned in a 3D context (`perspective: 1400px`,
  `transform-style: preserve-3d`) and move in Z as well as X/Y.
- Around the stack: a **left brass rail** carrying drawer labels
  (`a–f · threads`, `g–m · topics`, `n–s · vectors`, `t–z · recall`) that slides
  as drawers change.
- Room-side copy sits to the right of the stack on desktop, above it on mobile,
  in Manrope on the slate.
- No rules, no grids, no borders — separation on this page is done with
  **shadow and overlap**.

**Drawer order:** `the drawer opens` → `every turn becomes a card` →
`the stamp (topic assignment)` → `two indexes: the rod and the scatter` →
**`recall` (pinned, the centrepiece)** → `what it costs` (60% / 35%) →
`14.3% → 1.4%` → `the card at the back` (honest) → `close the drawer`.

## Motion language

**Weightless stacking.** Paper has almost no mass: cards accelerate instantly
and settle without bouncing. Motion is `translate3d` + small `rotate` +
`rotateX` in a perspective context, over 620–980ms with
`cubic-bezier(.4,.8,.2,1)` — a soft, slightly lazy settle. Shadows soften as a
card rises and tighten as it lands, which is what sells the weight.

- Primary: `cubic-bezier(.4,.8,.2,1)`, 620–980ms
- Stagger: 55ms per card, up to 12 cards
- Shadow: `0 2px 4px` (landed) ↔ `0 34px 60px` (lifted), interpolated with Z
- Typing on a card: 28ms per character, `steps(1)`, with a caret
- Stamp: `scale(1.9) rotate(-8deg) → scale(1) rotate(-3.4deg)` in 130ms, hard stop
- No parallax on the room. The **depth is real transforms**, not offset layers.

## Signature set pieces

1. **The drawer opens.** Entry: the slate room, a closed oak drawer front filling
   the viewport. It slides toward the viewer (`translateZ` + shadow bloom) over
   820ms and the first cards rise out of it, fanning by 55ms.
2. **Every turn becomes a card.** Pinned, 200vh. A blank card is dealt to
   centre; a question is typed on it in Courier at 28ms/char; the answer follows
   in italic; a UUID and `window:{uuid}` key print in the corner; the card flies
   into the deck. Three cycles, each 30% faster than the last, until the fourth
   is a blur of cards filing themselves.
3. **The stamp.** A topic stamp lands on each card — one hard 130ms hit,
   uneven ink, `mix-blend-mode: multiply`, at a slightly different angle each
   time. Then the drift comparison: **left pile**, labelled in isolation, the
   stamps read `retrieval`, `search`, `lookup`, `finding things` — four names
   for one topic, and the pile leans. **Right pile**, labelled against the
   thread's existing topics, all four read `retrieval`, and the pile is square.
4. **Two indexes.** The same 40 cards, twice. **Redis**: punched and threaded
   onto a brass rod, perfectly ordered, rotating slowly on the rod's axis —
   exact lookup. **FAISS**: the same cards released from the rod into a
   normalised scatter where distance means similarity. A single card is
   highlighted in both at once, to make the point that it is one card in two
   indexes.
5. **Recall (pinned, the centrepiece, 260vh).** A query card drops in. All 40
   cards in the drawer desaturate to the slate. The Redis topic filter narrows
   the field to 6 (34 cards drop back into the drawer, 55ms staggered). FAISS
   top-k lifts **3** of the 6 out of the stack toward the viewer with their
   cosine scores printed on the edge. Only those three enter the prompt.
6. **What it costs.** The 40-card stack and the 3-card stack side by side, with
   token counts printed on the *edges* of the stacks — a stack's thickness is
   its token cost. 60% and 35% arrive as the thick stack physically compresses.
7. **14.3% → 1.4%.** A red `HALLUCINATED` stamp hits 6 cards in a 40-card
   fan; then the fan is re-dealt from the recall path and one card is stamped.
   Same stamp, same speed, one hit instead of six.
8. **The card at the back.** The honest note is a single card filed at the very
   back of the drawer, stamped `NOT REPRODUCIBLE` in red, with the caveats typed
   on it: numbers from a private harness, the README documents modules that are
   not committed, a hardcoded local path.
9. **Close the drawer.** The oak front slides back over the stack; the brass
   label reads the project name; the room dims.

## Scroll choreography

| Progress | Beat |
|---|---|
| 0 – 0.05 | drawer opens, cards rise, title on the slate |
| 0.05 – 0.22 | **pinned** — every turn becomes a card (×3, accelerating) |
| 0.22 – 0.34 | the stamp; the two piles (drift vs stable) |
| 0.34 – 0.48 | two indexes: the rod and the scatter |
| 0.48 – 0.70 | **pinned** — recall: 40 → 6 → 3 |
| 0.70 – 0.80 | what it costs: stack thickness as tokens |
| 0.80 – 0.88 | 14.3% → 1.4%, the stamp again |
| 0.88 – 0.95 | the card at the back |
| 0.95 – 1.00 | close the drawer, colophon on the brass label |

Mobile: perspective drops to `900px`, the stack shows 5 cards instead of 12,
pins become short (120vh) rather than long, and the recall set piece runs as
three discrete states rather than a continuous scrub. Cards stay full-width and
readable — the reduced experience is *fewer cards*, never smaller type.

## Entry + exit transition

**Entry:** a closed drawer front fills the viewport; it slides toward the viewer
and the cards rise out. Depth, not colour.
**Exit:** the cards drop back into the drawer (staggered 40ms) and the front
slides shut.

## Distinctiveness statement

- **vs the landing page** — mid-slate ground vs near-black; typewriter serif at
  display size vs variable grotesque; real 3D transforms with cast shadows vs a
  flat plane with hairlines; overlap and shadow as separation vs 1px rules;
  620–980ms paper settles vs 1s eased fades; a physical object metaphor, where
  the landing page is resolutely screen-native.
- **vs every sibling** — the only page with perspective, Z-motion and cast
  shadows; the only page using GSAP ScrollTrigger pinning as its primary
  mechanism; the only typewriter face; the only mid-tone ground; the only page
  whose sections are *drawers* rather than screens, strips, sheets, panels or
  clusters.
