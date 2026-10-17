# Phase 4: a storyboard and a 3D piece for every case study

## Audit (2026-10-18)

All eight pages have a strong 2D concept: night nursery, chart recorder, poster wall, cipher desk,
infrared contact sheet, card catalogue, blueprint and Swiss ledger. What they lack is the same on
every page:

- **No depth.** None of them uses WebGL or any 3D, and only Memora has cast shadows.
- **The mechanism is told, not shown.** The pipeline is paragraphs. You read *that* the
  bandpass discards everything outside 142.91–6620.12 Hz, but you never see it happen.
- **Little to do.** Apart from WISP's lens and the blueprint drag, there is nothing to operate.

## One answer, built per page: a "mechanism" section

Every page gets one new pinned section that does three jobs at once, so the page gains
one strong set-piece instead of three bolted-on widgets:

1. **Scroll storyboard.** The section pins for N+1 screens. Scroll moves the 3D scene through the
   project's real pipeline, panel by panel. Each panel shows a number, a title, and a caption
   drawn from `caseStudies` (no new claims).
2. **3D.** A three.js scene that is the mechanism itself, rendered in that page's own palette,
   type and materials. It is not a generic widget.
3. **Interactive.** The last panel hands control to the reader: orbit the scene, operate the
   real variable (cry type, method, query, budget, …), and click or hover for readouts. You can
   also drag at any point.

### Shared plumbing, no shared look

| File | Does | Does not |
|---|---|---|
| `_shared/stage3d.ts` | renderer lifecycle, DPR cap, resize, pointer orbit with inertia, raycast helper, dispose | pick any colour, light or material |
| `_shared/Mechanism.tsx` | the pinned section, progress, panel index, its own visibility-gated rAF, reduced-motion fallback, snap markers for Qubit's scroller (one per panel plus one where the pin lets go, so no gap exceeds a screen) | style anything: every class is prefixed by the page (`nw-mx…`) and styled in the page's CSS |

**Conventions amendment.** A mechanism section may run its own rAF, but only while it
intersects the viewport. Everything else in `01-implementation-conventions.md` still holds.

**Reduced motion.** There is no pin. The panels render as a plain list, and the scene renders once
in its final, interactive state.

**No WebGL.** The panels still render as text, with a one-line note in place of the canvas.

## Per page

| Page | 3D scene: the mechanism | Panels (scrubbed) | Your turn |
|---|---|---|---|
| **baby-cry · Night Shift** | A spectrogram terrain: time × frequency × energy, in the page's viridis-on-navy | waveform → STFT unfurls into terrain → the 142.91–6620.12 Hz bandpass slices it → 461 features → the forest votes over 5 classes | pick hungry / tired / discomfort / belly_pain / burping and the terrain morphs to that signature; hover reads Hz and time |
| **eeg-emotion · Paper** | An ink line-art head with the 14 DREAMER (Emotiv) electrode sites, over millimetre paper | the 14 sites light → 128 Hz traces pour onto the paper → valence / arousal / dominance cube → the report sheet | click an electrode to isolate its trace; drag to turn the head |
| **dravidian · Muzhakkam** | Poster-flat 3D: Tamil letters as paper tiles, then a 7-class point space in spot inks | a comment → the tokenizer shreds it → LLaMA re-joins the hashtag → dense and sparse channels fuse → seven clusters | toggle dense / sparse / fused separation; hover a cluster for its Tamil and English class |
| **fraud · Sealed** | Two glass vaults (institutions A and B), cold white with black edges, and a gate between them | rows stay inside → SMOTE inside each vault → local MLP stack and 400-tree forest → sealed packets cross the gate → hard vote | send a transaction through both models and watch the vote; "raw records shared: 0" never moves |
| **wisp · After Dark** | The infrared frame as a height field: attribution as relief | the frame → EfficientNet-B3 feature pyramid → attribution rises where it looked → six methods morph → the field report | a torch follows the pointer; buttons switch between the six methods |
| **memora · The Catalogue** | The oak drawer in real 3D: index cards on a steel rod, with topic tabs | a turn becomes a card → topic stamped → filed (Redis rod) → topic filter lifts a subset → top-3 rise to the prompt | choose a question: its topic's cards lift and the top 3 rise; hover to read a card |
| **semantic · The Plate** | A blueprint wireframe 3D graph | sheets → entities rise → 32% merge (dedupe) → edges and PageRank → three clusterings, then consensus | switch Louvain / spectral / Node2Vec+HDBSCAN / consensus; click a node for its 2-hop neighbourhood |
| **qubit · Allocation** | Isometric extruded blocks in flat Swiss colour (orthographic) | 20 projects → 15×3 SDG scores rise → the ESG 0.7 floor zeroes some → the 40% cap clips → allocation | budget and ESG-floor sliders re-solve the same linear programme live |

## Honesty rules for the scenes

- Spectrograms, EEG traces, embeddings, frames and graphs are **illustrative and generated in the
  browser**, and each scene says so in one line. Numbers in captions come only from `caseStudies`.
- Qubit's solver is the committed formulation: maximise Σ(ESG − 0.1 − 0.05·risk)·x subject to the
  budget, per-project bounds, the 40% cap and ESG ≥ 0.7. With one budget constraint and box
  bounds, a greedy fill by coefficient is the exact LP optimum. The projects are seeded randoms in
  the committed ranges (ESG 0.6–0.9, risk 4–7, $1,000), as in the repo.
- Fraud's caption states that the public repo combines the models by hard voting and that the
  CKKS code is not in it.

## Order

1. Shared plumbing.
2. Build the pages one at a time: baby-cry, eeg, dravidian, fraud, wisp, memora, semantic,
   qubit. After each: a typecheck plus desktop, phone and reduced-motion screenshots, then a
   commit.
3. Sweep all routes, build, and push.
