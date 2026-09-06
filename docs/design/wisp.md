# wisp — *After Dark*

`/work/wisp` · WISP · wildlife species identification with explainability

---

## Narrative / story

A camera trap fires at 02:11. The frame is an infrared mess — flash falloff,
motion blur, grain, and an animal that is almost certainly not in the centre.
There are no bounding boxes anywhere in the data, so the model was never told
where to look, and neither are you. This page hands you the same problem: the
frames are dark, and the only way to see what the model saw is to carry a lens
over them.

## Visual metaphor

**An infrared contact sheet with a field notebook in the margins.** Grainy
monochrome night frames laid out as a proof sheet; species names in italic Latin
binomials; topographic contour lines drifting behind everything; annotations
written in the margin with leader lines pointing into the frames. The reader
holds a lens — a circular reveal that follows the pointer and exposes the
attribution heat underneath the image.

## Palette

Warm coffee-black — a *warm* dark, explicitly not the landing page's cool
olive-black.

| Role | Hex |
|---|---|
| ground | `#171210` |
| panel / frame mount | `#211914` |
| deepest (behind frames) | `#0E0A09` |
| ink (bone) | `#F0E7D8` |
| dim | `#9A8B79` |
| faint / contour line | `#4A3B31` |
| attribution heat (primary accent) | `#B4FF3B` |
| rust (hazard, annotation) | `#D2673A` |
| IR frame greyscale | `#1A1614` → `#CFC6BB` |

Attribution heat ramp: `transparent` → `#3B4A1E` → `#7FBF2E` → `#B4FF3B` →
`#F1FFC9`.

## Typography

- **Display — Cormorant Garamond 300**, `/fonts/p/cormorant-300.woff2`, set
  **very large and very light** (`clamp(46px, 9vw, 150px)`, `wght 300`,
  `line-height 1.0`, `letter-spacing +.005em`). Delicate, high-contrast, the
  opposite of a heavy grotesque.
- **Binomials — Cormorant Garamond 300 italic**,
  `/fonts/p/cormorant-300i.woff2`. Every species is named twice: common name in
  sans, *Leopardus pardalis* in italic serif. This is the page's most repeated
  gesture.
- **Emphasis — Cormorant Garamond 600**, `/fonts/p/cormorant-600.woff2`, only
  for figures.
- **Labels + body — Inter Tight** variable, `/fonts/p/inter-tight.woff2`,
  400/500 at 15–16.5px / 1.66, 54ch. Frame numbers, timestamps, EXIF-ish
  metadata under each frame.

## Layout system

- **A contact sheet.** The spine of the page is a proof grid of IR frames —
  `4 × n` on desktop, `2 × n` on tablet, `1 × n` on phone — with hairline
  *mounts* (not rules: a 6px `#211914` mount around each frame, like a
  photographic proof sheet).
- **Margins carry the text.** Body copy lives in a right-hand margin column
  (`clamp(240px, 22vw, 340px)`) with **leader lines** drawn in SVG from the
  annotation to a specific point in a specific frame. Nothing is centred.
- Interleaved with the sheet: **full-bleed species plates**, one frame at
  viewport scale with its binomial set across it.
- Behind everything: a **topographic contour layer** that drifts at a different
  depth ratio from every other layer.

**Section order:** `02:11 — the trigger` → `contact sheet i (12 frames)` →
`the lens` → `no bounding boxes` → `plate: Leopardus pardalis` → `six
attributions disagree` → `the long tail` → `plate: Sus scrofa` → `terrain and
hazard` → `the notebook (honest)` → `the trap resets`.

## Motion language

**Drifting and organic.** Long durations (1.4–2.6s), heavy damping, nothing
snaps. The page's dominant motion is not scroll-triggered at all — it is
**continuous parallax drift** across four depth planes, driven by scroll *and*
by pointer position, with a 0.06 lerp so the layers lag behind the hand.

- Primary: `cubic-bezier(.19,.66,.24,1)` — a long slow settle
- Depth ratios (scroll): contours `0.06`, mount grid `0.14`, frames `0.28`,
  margin annotations `0.46`, lens `1.0`
- Depth ratios (pointer): contours `4px`, mounts `9px`, frames `18px`,
  annotations `30px` of travel across the full viewport
- Lens damping: `lerp 0.075` per frame — the lens is always ~120ms behind
- Frames arrive by **exposure**, not translation: `filter: brightness(.15)
  contrast(2.4)` → normal over 1.9s, with the grain settling.

## Signature set pieces

1. **02:11 — the trigger.** Entry: black. One hard white frame for 60ms (the IR
   flash). The first camera-trap frame appears blown out and settles to normal
   exposure over 1.6s. The timestamp `02:11:44` and `IR · 850nm` type in below it.
2. **The lens.** *The interaction of the page.* A circular `radial-gradient`
   mask follows the pointer with heavy damping. Inside it, every frame shows its
   **Captum attribution heat map** instead of the IR image. Outside it, the IR
   image. On touch devices the lens becomes an autonomous drifting orbit that
   crosses the sheet on a slow Lissajous path. There is no other way to see the
   attributions — the page makes you look for them, exactly as the project does.
3. **Contact sheet, four planes.** 12 frames on the mount grid, each frame's
   content drifting at `0.28` while its mount drifts at `0.14`, over contours at
   `0.06`, under annotations at `0.46`. Real multi-layer parallax with four
   distinct ratios, plus pointer offset on all four.
4. **No bounding boxes.** Dashed rectangles begin to draw themselves around the
   animals — and erase, one stroke at a time, leaving nothing. The margin note
   explains that the labels never provided them. Drawn with
   `stroke-dashoffset` running *backwards*.
5. **Six attributions disagree.** One frame, six overlays — Integrated
   Gradients, GradientSHAP, DeepLIFT, Occlusion, LRP, NoiseTunnel — cross-fading
   at 900ms each as you scroll, then all six composited at once so the
   *disagreement* is the image. Where they agree the heat is solid; where they
   disagree it is a ghost.
6. **The long tail.** The 20 species names drift past on a horizontal rail as a
   frequency curve, common species dense and bright at the left, the
   conservation priorities sparse and dim at the right, at 30% opacity — the
   rare ones are literally the hardest to read.
7. **Terrain and hazard.** SVG contour lines redraw for a new terrain as scroll
   advances; a hazard radius expands from the detection point in rust, with the
   CrewAI handling protocol set in the margin.
8. **The notebook.** The honest note (partial repo, missing scripts, no sample
   attributions committed) is set on a field-notebook page — bone stock, rust
   rules, items struck through, a leader line to an *empty* mount on the contact
   sheet.
9. **The trap resets.** IR drains out over the last 40vh, frames dim to a low
   warm glow, contours flatten, the lens closes to a point.

**Frames are procedurally drawn, not photographed.** Each IR frame is generated
on a small offscreen canvas: seeded value-noise for foliage, a hand-authored
animal silhouette path, IR falloff from a flash origin, grain, and a matching
attribution heat field. No photographic assets ship, and none of the landing
page's `/plates/*.jpg` are used.

## Scroll choreography

| Progress | Beat |
|---|---|
| 0 – 0.04 | black, IR flash, first frame settles |
| 0.04 – 0.12 | title + the lens is introduced (a hint circle pulses once) |
| 0.12 – 0.28 | contact sheet i, four-plane parallax, margin annotations |
| 0.28 – 0.38 | no bounding boxes |
| 0.38 – 0.48 | plate: *Leopardus pardalis*, full bleed |
| 0.48 – 0.62 | six attributions disagree |
| 0.62 – 0.72 | the long tail |
| 0.72 – 0.80 | plate: *Sus scrofa* |
| 0.80 – 0.88 | terrain and hazard, contours redraw |
| 0.88 – 0.95 | the notebook |
| 0.95 – 1.00 | the trap resets, colophon |

Mobile: single-column frames at full width, lens replaced by an autonomous
drifting reveal plus a tap-to-toggle attribution overlay per frame; pointer
parallax disabled, scroll parallax retained at halved ratios.

## Entry + exit transition

**Entry:** an IR flash — one 60ms white frame from black — then a 1.6s exposure
settle. Nothing slides, nothing wipes.
**Exit:** the lens contracts to a point, the frame overexposes for 80ms, black.

## Distinctiveness statement

- **vs the landing page** — warm coffee-black vs cool olive-black; delicate
  light serif with italic binomials vs heavy uppercase grotesque; a photographic
  contact sheet with mounts vs hairline-ruled sections; margin annotations with
  leader lines vs centred kickers; 1.4–2.6s exposure settles vs 1s fade-ups;
  four-plane scroll **and** pointer parallax vs one nudged background; a
  pointer-driven mask, which the landing page has no equivalent of.
- **vs every sibling** — the only page with a pointer-driven reveal lens; the
  only page built on procedurally generated imagery; the only page with a
  light serif and italic Latin; the only page with four-ratio dual-axis
  parallax; the only warm-dark ground.
