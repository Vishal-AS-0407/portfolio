# eeg-emotion — *Paper*

`/work/eeg-emotion` · Mental Health Analysis · EEG emotion detection · IEEE ICBSII 2025 Best Paper

---

## Narrative / story

A headset produces fourteen channels at 128 Hz and a classifier turns them into
a valence/arousal/dominance triple, which means nothing to the person wearing
it. This project's real subject is the *translation* — from ink on paper to a
sentence a human can act on. So the page is the paper. It runs sideways, one
continuous strip, channel by channel, until the machine stops and a report is
torn off the end.

## Visual metaphor

**A chart recorder.** Warm cream paper with the classic pink millimetre grid;
pen traces in ink blue and pen green; annotations in red pencil in the margin.
The paper physically travels — the page scrolls *horizontally*, because that is
the direction paper comes out of a machine. Everything on this page is either
printed on the paper, drawn by a pen, or written in the margin by hand.

## Palette

| Role | Hex |
|---|---|
| paper | `#F6EDE6` |
| paper (shadow / second rig) | `#EFE2D8` |
| grid — fine (1mm) | `#F2C6BE` |
| grid — bold (5mm) | `#E39A93` |
| ink (pen 1, DREAMER / emotion) | `#22357A` |
| pen 2 (INRIA / ERP) | `#0F7C6B` |
| red pencil (annotation, correction) | `#C6362F` |
| type ink | `#151A2E` |
| muted | `#8A7E79` |

A light, warm, printed page. The landing page is a dark olive void; this is a
physical consumable with a colour temperature.

## Typography

- **Display / headings — Space Grotesk** (variable `wght 300…700`),
  `/fonts/p/space-grotesk.woff2`. Set at **modest sizes** (28–56px), sentence
  case, `letter-spacing: 0`, `line-height 1.15`. It never gets bigger than the
  paper's grid can justify — this page's drama is horizontal distance, not type
  size.
- **Readouts / labels — Spline Sans Mono** (variable `wght 300…700`),
  `/fonts/p/spline-mono.woff2`, used **large (15–22px) and lowercase, tracking 0**
  — the exact inverse of the landing page's 10.5px uppercase `.1em` mono kicker.
  Channel names, Hz, timestamps, metric values.
- Body copy: Space Grotesk 300 at 16px / 1.62, max 58ch, sitting *inside* the
  grid so lines land on 5mm rules.

Type is aligned to the paper grid: every baseline sits on a 5mm bold rule. That
constraint is the type system.

## Layout system

- **Horizontal.** A pinned viewport ~6.4 screens wide; vertical scroll drives
  `translateX` on the strip. Vertical position = **channel lane**; horizontal
  position = **time**.
- Six lanes, top to bottom, at fixed heights: `header rail (72px) · lane A
  (DREAMER, 14 traces) · lane B (INRIA, 56 sensors, denser grid) · type lane ·
  annotation margin · footer rail`.
- The grid is real: 1mm = 6px, 5mm = 30px, drawn as a repeating CSS gradient so
  it costs nothing.
- The only vertical move on the page is the last one, when the report tears off.

**Section order (lanes and stations along a strip, not stacked sections):**
`pen down` → `14 channels @ 128 Hz` → `two rigs, two papers` → `VAD: three pens`
→ `the ERP pen` → `9.78 ms` → `dual-agent margin note` → **tear-off → report
sheet (vertical)** → stamp → colophon.

## Motion language

**Mechanical.** The paper advances in perceptible increments — the transport is
a stepper motor, not a servo. Traces draw at **constant velocity** (linear
`stroke-dashoffset`), because a pen does not ease. Discrete events snap with
`cubic-bezier(.9,0,.1,1)` at 180–260ms. Pen nibs carry a 0.4px sub-pixel jitter.

- Transport: `steps(N)` micro-advance layered on the continuous scroll map
- Events: `cubic-bezier(.9,0,.1,1)`, 180–260ms
- Trace drawing: `linear`
- Nothing on this page eases out slowly. Nothing blooms. Nothing fades up.

## Signature set pieces

1. **Pen down.** Entry: blank paper, no grid. The grid prints itself (a wipe
   left→right, 700ms, `steps(24)`). The pen arm swings in from the right and
   touches down with a 3px overshoot; the title is written as a single SVG path
   draw at constant speed.
2. **Fourteen channels.** Fourteen `<path>` traces draw simultaneously as the
   strip advances, labelled `Fp1 AF3 F3 F7 FC5 FC1 …` at the leading edge. Each
   trace is generated from a seeded sum-of-sines so it is deterministic and
   redraws identically.
3. **Two rigs, two papers.** The strip splits: lane A stays at 14ch/128 Hz on
   `#F6EDE6`; lane B is a *physically different sheet* — `#EFE2D8`, narrower
   grid pitch (200 Hz), 56 traces compressed. A 3px gap runs between them for the
   rest of the page. **They never merge.** A red-pencil margin note says why.
4. **Three pens (VAD).** Three needles deflect and settle onto `98.6 / 96.6 /
   95.7`. Each needle overshoots once and damps in 2 oscillations — a real
   galvanometer, computed, not eased.
5. **9.78 ms.** The transport briefly runs at true speed; a pair of blue calipers
   drops onto the grid and measures 9.78 ms across it, the dimension printed
   between the caliper arms.
6. **The dual-agent margin.** BioGPT's reading and the plain-language rewrite are
   two margin annotations connected to the same point on the trace by leader
   lines, in ink and in red pencil respectively.
7. **Tear-off.** At ~88% the strip stops (hard, 120ms). A jagged `clip-path`
   tears the paper along a generated zigzag and the finished **clinical report**
   slides *up* from the bottom on plain white — the only vertical motion, and the
   only white, on the page.
8. **Best Paper stamp.** A single rubber-stamp impression on the report:
   `rotate(-7deg) scale(1.6) → scale(1)` in 160ms with a hard stop, ink density
   uneven, `mix-blend-mode: multiply`.
9. **Red-pencil correction.** The honest note (public repo ≠ paper reproduction)
   is written in the margin in red pencil at −2.5°, with a leader line to the
   DREAMER lane and a strike-through on `testdr.py`.

## Scroll choreography

| Progress | Beat |
|---|---|
| 0 – 0.03 | grid prints, pen arm swings in, pen down |
| 0.03 – 0.16 | title written; strip starts; 14 traces begin |
| 0.16 – 0.30 | the two rigs separate; the split annotation |
| 0.30 – 0.46 | VAD needles deflect and settle |
| 0.46 – 0.58 | ERP branch: the CNN-BiLSTM lane, architecture printed inline |
| 0.58 – 0.68 | 9.78 ms calipers |
| 0.68 – 0.80 | dual-agent margin notes; red-pencil correction |
| 0.80 – 0.88 | transport stops |
| 0.88 – 1.00 | **tear-off**, report sheet rises, stamp, colophon |

Mobile: the strip is re-cut into **five stacked short strips**, each scrolling
horizontally on its own (scroll-snap x), so the metaphor survives without a
sideways page. Pen and grid unchanged.

## Entry + exit transition

**Entry:** the viewport is blank warm paper. The grid prints left→right in 24
steps, then the pen arm drops. No colour, no wipe, no fade — a machine starting.
**Exit:** the transport reverses for 400ms and the pen lifts off the page.

## Distinctiveness statement

- **vs the landing page** — light warm paper vs olive black; horizontal vs
  vertical; Space Grotesk / Spline Mono vs Archivo / Martian Mono; large
  lowercase mono vs 10.5px tracked uppercase mono; constant-velocity and stepped
  motion vs 1s eased fades; SVG path drawing vs canvas point clouds; a printed
  millimetre grid vs hairline rules.
- **vs every sibling** — the only horizontally-scrolling page; the only page on
  warm printed paper with a pink grid; the only page whose reveals are
  *drawings*; the only page with stepped/linear motion; the only page where the
  layout is a machine's output format rather than a document.
