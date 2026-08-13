# 03 — Design Research: Awwwards-Caliber Portfolio for an AI Developer/Researcher

**Date:** 2026-08-08
**Stack (fixed):** Vite + React 18 + TypeScript + Tailwind CSS
**Already installed:** `framer-motion@12`, `gsap@3.15`, `lenis@1.3`
**Not installed (can add):** `three`, `@react-three/fiber`, `@react-three/drei`, `ogl`, `matter-js`, `postprocessing`

> **Method note.** Section 1 is not vibes. For most reference sites I downloaded the live HTML *and its JS bundles* and grep'd for library fingerprints (`THREE.WebGLRenderer`, `gsap.registerPlugin`, `ScrollTrigger`, `SplitText`, `ScrollSmoother`, `CustomEase`, `new Lenis`, `@react-three`, `EffectComposer`, `precision highp float`, `new AudioContext`, …). Findings marked **[verified]** came out of the actual shipped bundle. Findings marked *[observed]* are from the site/award listing description only.

---

## Table of Contents

1. [Reference sites + technique breakdown](#1-reference-sites--technique-breakdown)
2. [Technique vocabulary catalogue](#2-technique-vocabulary-catalogue)
3. [The AI-cliché anti-pattern list (+ audit of the current site)](#3-the-ai-cliché-anti-pattern-list--audit-of-the-current-site)
4. [Seven distinctive direction proposals](#4-seven-distinctive-direction-proposals)
5. [Library & implementation guide with perf notes](#5-library--implementation-guide-with-perf-notes)
6. [Easter egg idea bank](#6-easter-egg-idea-bank)
7. [Top recommendation](#7-top-recommendation)

---

## 1. Reference sites + technique breakdown

Sources for discovery: [Awwwards Sites of the Day](https://www.awwwards.com/websites/sites_of_the_day/), [Awwwards Sites of the Year](https://www.awwwards.com/websites/sites_of_the_year/), [Awwwards Portfolio winners](https://www.awwwards.com/websites/winner_category_portfolio/), [siteinspire](https://www.siteinspire.com/websites), [godly.website](https://godly.website/) (now redirecting to [recent.design](https://recent.design/)), [minimal.gallery](https://minimal.gallery/), [httpster](https://httpster.net/), [The FWA](https://thefwa.com/), [Codrops](https://tympanus.net/codrops/).

### 1.1 The evidence table

| # | Site | Studio | What makes it exceptional | Libraries / techniques detected |
|---|------|--------|---------------------------|----------------------------------|
| 1 | [2xa.studio](https://2xa.studio) | 2xA Studio | Studio portfolio; every transition is scrubbed, nothing "plays" on a timer. The bar for a self-branded site. | **[verified]** GSAP + `ScrollTrigger` + `ScrollSmoother` + `Flip` + `Observer`, **Lenis**, `THREE.WebGLRenderer`, `ShaderMaterial`, raw GLSL (`precision highp float`), Splitting-style char splitting. Single Vite bundle (`main-*.js`) — same build shape as ours. |
| 2 | [artemartemartem.com](https://artemartemartem.com) | SALT AND PEPPER | Designer portfolio, Dev Award. WebGL image transitions that feel like film cuts. | **[verified]** `@react-three/fiber` + three, `EffectComposer` (postprocessing), **ogl** alongside it, GSAP + `ScrollTrigger` + `ScrollSmoother` + `CustomEase` + `Flip`, Lenis. Next.js, but the R3F layer is directly portable to Vite. |
| 3 | [hirotos.com](https://hirotos.com) | Hiroto Sato | Personal portfolio, Dev Award. Restrained palette, extremely expensive-feeling type motion. | **[verified]** `@react-three/fiber`, `postprocessing` / `EffectComposer`, `ShaderMaterial`, GSAP + `ScrollTrigger` + `Flip` + `Observer` + `CustomEase`, char-splitting. **Closest single reference for "solo person, R3F, award-winning".** |
| 4 | [trionn.com](https://trionn.com) | Trionn | Agency site; the cleanest example of "GSAP does everything, WebGL is the seasoning". | **[verified]** GSAP + `ScrollTrigger` + `ScrollSmoother` + **`SplitText`** + **`DrawSVG`** + `Flip` + `Observer`, **Lenis**, **ogl** (not three — tiny WebGL). |
| 5 | [showcase.noomoagency.com](https://showcase.noomoagency.com) | Noomo Agency | Showcase reel with genuine **sound design** and draggable canvas. | **[verified]** GSAP + `ScrollTrigger` + `ScrollSmoother`, `WebGLRenderer`, hand-written shaders (`createProgram`, `precision highp float`), GSAP `Draggable` (`dragMinimum`, `dragResistance`), **`new AudioContext`** — real Web Audio, not an `<audio>` tag. |
| 6 | [noartmusic.com](https://noartmusic.com) | BORING | Music label site. Type is the interface; WebGL is a distortion layer over it. | **[verified]** GSAP + `ScrollTrigger` + `ScrollSmoother` + **`SplitText`** + `CustomEase`, `THREE.WebGLRenderer`, Lenis, `Draggable` (`dragClickables`, `dragResistance`). |
| 7 | [izanami-official.com](https://izanami-official.com) | baqemono.inc. | Japanese studio work — proof that a *non-Western* editorial rhythm reads as premium. Directly relevant to the anime/JP direction below. | **[verified]** GSAP + `ScrollTrigger` + **`SplitText`** + `CustomEase`, `THREE.WebGLRenderer`, raw GLSL, Lenis. |
| 8 | [experiment.obys.agency](https://experiment.obys.agency) | Obys | Obys' experiment space — a "lab" section on a studio site. A great structural model for a researcher's "experiments" page. | **[verified]** GSAP 3.12.5 from cdnjs, Webflow + jQuery. Notable: *no WebGL at all* — proof that pure GSAP + CSS can win SOTD. |
| 9 | [serotoninn.com](https://serotoninn.com) | BL/S® | Dev Award. Heavy draggable/inertia interaction model. | **[verified]** Lenis, draggable interaction layer. |
| 10 | [dragonfly.xyz](https://dragonfly.xyz) | **Studio Freight** | The studio that *wrote* Lenis. Their own client work is the canonical "smooth scroll + editorial grid + restraint" reference. | *[observed]* Nuxt. Studio Freight are the authors of [Lenis](https://github.com/darkroomengineering/lenis) and [Hamo](https://github.com/darkroomengineering/hamo); see [darkroom.engineering](https://darkroom.engineering/). |
| 11 | [Lando Norris](https://www.awwwards.com/annual-awards/site/5f6a4834-ae80-4206-976f-79792baa0f87) | OFF+BRAND | **Awwwards Site of the Year 2025** + Users' Choice. Sets the current ceiling for scroll-driven 3D storytelling. | *[observed]* Scroll-linked 3D camera, cinematic pinned sequences, heavy asset streaming. |
| 12 | Messenger (WebGL planet) | — | **Awwwards Developer Site of the Year 2025.** A tiny WebGL planet you make deliveries on. Proof the dev award goes to *a small, complete, weird idea*, not the biggest scene. | *[observed]* three.js, game loop, spatial audio. |
| 13 | [Bruno Simon portfolio](https://bruno-simon.com/) | Bruno Simon | Awwwards Site of the Month, Jan 2026. Drive a car around a 3D world that *is* the portfolio. The most-cited dev portfolio ever made. | *[observed]* three.js, cannon/physics, spatial audio (birds, crickets, campfire, horn). Also the author of [Three.js Journey](https://threejs-journey.com/). |
| 14 | [wrapped-party.activetheory.dev](https://wrapped-party.activetheory.dev) | Active Theory | Multiplayer/real-time WebGL. Active Theory are the perennial FWA benchmark. | *[observed]* Custom WebGL engine, WebSockets, particle systems. |
| 15 | [members-play.lacoste.com/ace-breaker-rg](https://members-play.lacoste.com/ace-breaker-rg) | Merci Michel | Playable brand experience. Game mechanics inside a marketing site. | *[observed]* three.js, physics, gamepad-style input. |
| 16 | [madewithgsap.com](https://madewithgsap.com) | Florent Roux-Durraffourt | A *directory of GSAP techniques* that itself won SOTD. Use as a technique index. | *[observed]* GSAP showcase. |

### 1.2 The single most important finding

**Every single verified site runs the same core stack:**

```
Lenis (smooth scroll)
  + GSAP core
  + ScrollTrigger (scrub / pin)
  + SplitText (char & line stagger)
  + CustomEase (bespoke easing curves)
  + Flip (layout morphing)
  + Observer (unified wheel/touch/pointer)
  + one WebGL layer: three.js OR ogl, usually just a fullscreen quad with a hand-written fragment shader
```

Two of the sixteen use `@react-three/fiber`. One (Obys) uses **no WebGL whatsoever** and still won SOTD. **The award is for choreography, not polygon count.** That is the most actionable takeaway in this document.

Secondary finding: `Draggable` / drag-inertia appears on 4 of the verified sites, and `new AudioContext` on one. Drag is currently more fashionable than 3D.

---

## 2. Technique vocabulary catalogue

Concrete notes on each technique, with how it maps to our stack.

### 2.1 Scroll-driven storytelling / pinned sections
The spine of every site above. A `ScrollTrigger` with `pin: true` + `scrub: 1` converts vertical scroll distance into timeline progress. The section stays fixed while its internal timeline scrubs.

```ts
gsap.timeline({
  scrollTrigger: { trigger: sectionRef.current, start: "top top",
    end: "+=300%", pin: true, scrub: 1, anticipatePin: 1 }
})
```
- `end: "+=300%"` = three viewport heights of scroll to play the section. That ratio is the whole feel of the site — tune it, don't default it.
- `scrub: 1` (a *number*, not `true`) adds 1s of catch-up lag. This single change is what separates "smooth" from "twitchy".
- **Rule:** at most 2–3 pinned sections on a page. More and the page feels like it's fighting the user.

### 2.2 Horizontal scroll segments
Pin a container, translate an inner track on X by `-(trackWidth - innerWidth)`. Perfect for a project index or a chronological timeline. Must have a mobile fallback (usually: become a vertical stack or a native `overflow-x` swipe track). Add `invalidateOnRefresh: true` so it recomputes on resize.

### 2.3 Multi-layer parallax
Depth from differential scroll speed. Three or more layers at e.g. `y: -20%`, `-45%`, `-80%`. Cheap and effective.
- Use `yPercent` (transform-based), never `top`/`background-position`.
- With Lenis + ScrollTrigger, drive it from ScrollTrigger, not from a `scroll` listener.
- Framer Motion equivalent: `useScroll` + `useTransform` + `useSpring`. Fine for small counts; GSAP wins past ~10 elements because it batches into one ticker.

### 2.4 Scroll-velocity-driven distortion / skew / RGB split
The signature "expensive" micro-detail. Read scroll velocity, map it to a visual property, ease it back to 0.

```ts
// Lenis gives you velocity for free
lenis.on("scroll", ({ velocity }) => {
  const skew = gsap.utils.clamp(-12, 12, velocity * 0.35);
  gsap.to(el, { skewY: skew, duration: 0.6, ease: "power3.out" });
});
```
Variants: `scaleY` stretch on images; horizontal RGB channel offset in a shader (`uVelocity` uniform); letter-spacing breathing on a headline; blur radius. **Use exactly one of these**, sitewide. Two reads as a filter stack.

### 2.5 WebGL shader backgrounds / noise fields / point clouds
A single fullscreen triangle or plane with a fragment shader. The cost is essentially fill-rate only. This is how you get "WebGL-grade polish" for ~30KB.
- Good: flow fields, curl noise, domain-warped fBm, reaction-diffusion, dithered gradients, distance-field line work.
- **Bad (see §3):** node-and-edge "neural network" particles. That is *the* cliché.
- Point clouds read as "data" honestly when the points are *actually your data* (e.g. a real UMAP projection of embeddings) — see Direction C.

### 2.6 Image reveal masks / clip-path wipes / curtain transitions
- CSS-only: animate `clip-path: inset(...)` or `polygon(...)`. GPU-composited in all modern browsers, near-free.
- The classic: a solid-color "curtain" panel wipes across, the image is swapped underneath mid-wipe, curtain wipes off.
- WebGL version: a `uProgress` uniform lerping between two textures through a noise/gradient displacement map. This is what `three`/`ogl` is *actually* worth adding for.
- SVG version: animate a `<mask>` or use GSAP `DrawSVG` on a stroked path.

### 2.7 Kinetic / variable-font typography, scramble, char stagger
- **SplitText** (now free, see §5) splits into chars/words/lines with `{ type: "lines,words,chars", mask: "lines" }`. The `mask` option in the 3.13 rewrite gives you free per-line overflow clipping — that's the "text rises out of a slot" effect.
- **Variable fonts + scroll:** animate `font-variation-settings` (`wght`, `wdth`, `slnt`, or a custom axis) from scroll progress or velocity. Extremely distinctive, almost free, and very few people do it. Strong recommendation.
- **ScrambleTextPlugin** (also now free) for a text-scramble on hover/reveal. Use *sparingly* — scramble is adjacent to the "matrix" cliché (§3).
- Always `will-change: transform` on split chars only while animating, then remove.

### 2.8 Custom cursor states
Not a library — a pattern.
- **Base:** a `position: fixed` div, driven by a lerped `requestAnimationFrame` loop, `transform: translate3d()`. Never animate `left`/`top`.
- **Magnetic buttons:** on `pointermove` within a radius, `gsap.quickTo(el, "x")` toward `(pointer - center) * 0.3`; on leave, `elastic.out(1, 0.4)` back to 0. `quickTo` is the key API — it's a pre-allocated tween, ~10x cheaper than `gsap.to` in a move handler.
- **Blend mode:** `mix-blend-mode: difference` on a white circle gives the inverted-cursor look for free.
- **Morphing states:** scale + label swap on `data-cursor="view" | "drag" | "play"` attributes read from the hovered element. Keep to 3–4 states max.
- **Always** keep the native cursor available at some breakpoint / respect `pointer: coarse`.

### 2.9 Sticky/pinned scrollytelling with scrubbed timelines
Combination of 2.1 + a stepped narrative: a pinned visual on one side, text blocks that `ScrollTrigger.create({ onEnter })` swap the visual's state. The New York Times model. This is how you present *research* well — one pinned diagram, prose stepping through it.

### 2.10 Page transitions
- **Barba.js** is legacy (it assumes MPA). Don't.
- **React Router + Framer Motion `AnimatePresence`** with `mode="wait"` is the standard, but it stalls navigation. Prefer `mode="popLayout"` or an overlay.
- **Overlay pattern (best):** a full-bleed panel wipes in, route changes behind it, panel wipes out. Decouples animation from React's render timing entirely. Do the scroll reset while the overlay covers.
- **View Transitions API** is now broadly available in Chromium and Safari; Firefox lagging. `document.startViewTransition()` + `view-transition-name` gives you shared-element morphs with almost no JS. Feature-detect and treat as progressive enhancement. Under React Router 6.4+, use `<Link viewTransition>`.
- **GSAP `Flip`** does shared-element transitions with full cross-browser support — 4 of our verified sites ship it. That's the safer bet.

### 2.11 Preloaders that earn their keep
A preloader is only justified if it (a) hides real asset loading, and (b) tells you something. Bad: a spinner and a fake percentage. Good:
- Counts *actual* decoded assets (`Promise.all` over `img.decode()` / `THREE.LoadingManager`).
- Displays something meaningful while it waits (a stat, a line of the manifesto, the site's thesis).
- Hands off *into* the hero with a continuous motion — the preloader's final element becomes the hero's first element (this is a `Flip` job).
- Hard rule: skippable, and never shown twice in a session (`sessionStorage`).

### 2.12 Physics, draggable canvases, infinite marquees
- **matter.js** — 2D rigid bodies. The "pile of tags/skills that you can throw around" interaction. MIT.
- **Draggable + InertiaPlugin (GSAP, now free)** — drag with real throw physics and snapping. Appears on 4 verified sites. Cheaper and more appropriate than matter.js for most portfolio uses.
- **Infinite marquee:** duplicate the track twice, `gsap.to(track, {xPercent: -50, repeat: -1, ease: "none"})`, then modulate `timeScale` from scroll velocity (including *direction reversal* on upward scroll). That direction-flip is a five-line detail that reads as very high craft.

### 2.13 Grain / noise / chromatic aberration
- **Static SVG `feTurbulence` grain** as a fixed overlay (what the current site already does) is fine but static grain is visibly "dead". Real film grain *moves*.
- Better: animate a tiny tiled PNG's `background-position` in 8 discrete steps at ~12fps (`steps(8)`), which reads as actual film.
- Best: do it in the shader — `fract(sin(dot(uv, vec2(12.9898,78.233)) + uTime) * 43758.5453)`, applied at low amplitude *after* the color grade.
- **Chromatic aberration:** sample the texture 3x with slightly offset UVs scaled by distance from center. Amplitude driven by scroll velocity. `postprocessing`'s `ChromaticAberrationEffect` if using R3F.

### 2.14 Sound design
Only one of the verified sites uses `AudioContext`. That makes it a *differentiator*, not a cliché.
- **Rules:** default OFF, persistent visible toggle, remember the choice, never autoplay (browsers block it anyway).
- **Good uses:** a soft tick on section change, a filtered click on nav, a low ambient bed that ducks on interaction.
- Use `howler` (MIT, ~11KB gz) or raw Web Audio. Raw Web Audio + a single `AudioBuffer` of short samples is lighter.

### 2.15 Scroll-linked 3D camera movement
Bind `camera.position` / `lookAt` to `ScrollTrigger` progress along a `CatmullRomCurve3`. This is the Lando Norris / Bruno Simon register. **High cost, high risk.** Only do it if the 3D scene *is* the content. For a research portfolio it usually isn't — a pinned 2D diagram communicates better.

---

## 3. The AI-cliché anti-pattern list (+ audit of the current site)

### 3.1 Why this happened

The mechanism is documented and worth understanding, because it tells you the cliché will keep getting *worse*:

- Tailwind's creator [publicly joked he'd like to apologize](https://www.925studios.co/blog/ai-slop-design-tells) for making every Tailwind UI button `bg-indigo-500` five years ago — which seeded indigo as the statistical mode of "modern web UI" in every training corpus.
- Generators trained on that corpus emit purple gradients; those sites get shipped; they re-enter the corpus. [prg.sh describes the feedback loop](https://prg.sh/ramblings/Why-Your-AI-Keeps-Building-the-Same-Purple-Gradient-Website): *"A pattern that looked original in early 2025 was a cliché by mid-2026, not because taste moved, but because the feedback loop digested it."*
- The deeper cause, well put by [Game Changer Labs](https://gamechangerlabs.io/blog/how-to-avoid-generic-ai-design): **machine learning is invisible.** It has no inherent visual form, so designers reach for sci-fi metaphors to fill the vacuum. The fix they propose is exactly our thesis: *"Grounded AI design looks to industrial design, architecture, and editorial print, not to science fiction movies."*

**Strategic implication for an AI *researcher's* portfolio:** the clichés are a *credibility* problem, not just an aesthetic one. A neural-net particle field says "I googled what AI looks like." Nothing says "I don't do real work" faster to the exact audience (researchers, hiring managers at labs) this site is for.

### 3.2 The banned list

**Color & surface**
1. **Purple/violet → blue gradients.** Named "the single loudest AI tell in 2026." Includes `#6366F1`→`#A855F7`, indigo-500, "electric violet".
2. **Dark navy / near-black `#0A0A0F`–`#0F172A` backgrounds** as the default canvas. Dark mode is not a decision; it's the absence of one.
3. **Glassmorphism cards** — `backdrop-filter: blur()` + 1px translucent border + rounded-2xl — tiled everywhere. Trend writing now specifically calls for "restrained translucency on overlays, modals, and sticky nav" only.
4. **Glow.** `box-shadow: 0 0 40px <accent>/0.4`, pulsing. Neon rim-light on everything.
5. **Gradient text** (`bg-clip-text` on a headline). Instantly dates a page to 2023–2025.
6. **Aurora/mesh gradient blobs** drifting behind the hero.

**Imagery & motif**
7. **Node-and-edge "neural network" particle canvas.** Dots connected by lines when within radius. The #1 offender.
8. **Glowing orb / sphere hero.** Especially with a soft inner light and rotating rings.
9. **3D robot, android, or humanoid renders.** The "robot finger touching a human finger" is a documented dead signal.
10. **Floating holographic brain.** Same family.
11. **Matrix rain / terminal typing** as decoration. (A *real* terminal that does something is fine. Fake `> Initializing neural core...` is not.)
12. **Circuit-board / PCB trace patterns.**
13. **Starfield / warp-speed particles.**
14. **Isometric abstract "data" illustrations** with floating cubes and dashed connector lines.
15. **Chatbot bubble mockups** as the hero product shot.

**Type & iconography**
16. **Inter as an unexamined default.** Also unexamined: Space Grotesk, Satoshi, Geist, Manrope. All fine fonts, all now signals.
17. **✨ Sparkles icons** on anything AI-flavored. Also 🧠, 🤖, ⚡, and thin-line "generic tech" icon sets where every glyph is interchangeable.
18. **All-lowercase minimal wordmark + tiny tracking-widest label above every section.**

**Layout & copy**
19. **Three rounded feature cards in a row**, each with a thin-line icon, soft shadow, and a two-line description.
20. **Bento grids** — was fresh in 2024, is now the AI-startup default layout.
21. **Weightless headline copy:** "Build faster. Ship smarter." "Intelligence, reimagined." "The future of X, today."
22. **Animated stat counters** (`0 → 1,247,382 requests processed`) that mean nothing.
23. **Logo cloud of "trusted by"** on a personal portfolio.

### 3.3 Audit: the current site commits these

I read `src/index.css`, `tailwind.config.ts`, and grep'd the components. Findings:

| Offense | Evidence in repo |
|---|---|
| **Dark navy/teal default canvas** | `src/index.css:12` — `--background: 200 25% 4%` (near-black, blue-cyan hue). File header literally reads *"Neural Canvas Theme — Dark Cinematic AI Aesthetic"* (`index.css:8`). |
| **Glassmorphism everywhere** | Three separate glass utilities — `.glass`, `.glass-strong`, `.glass-card` (`index.css:81–101`), all `backdrop-filter: blur() saturate()`. |
| **Glow** | `--glow-primary` / `--glow-accent` (`index.css:46–47`), `.glow-border` (`103`), `.text-shadow-glow` (`198`), `@keyframes pulseGlow` (`219`), `.animate-pulse-glow`. |
| **Gradient text** | `.gradient-text` and `.gradient-text-accent` (`index.css:120–132`), both `-webkit-background-clip: text`. |
| **Neural particle field** | `src/components/NeuralField.tsx`, plus `src/components/NeuralCompanion.tsx` and `AmbientBackground.tsx`. |
| **Circuit/grid background** | `.grid-bg` (`index.css:138`) — 60px cyan grid. |
| **Default AI type stack** | `Space Grotesk` + `Syne` + `JetBrains Mono` (`index.css:1–3`, `tailwind.config.ts:104–126`). Space Grotesk is on the tell list; Syne is the "creative tech" default. |
| **Sparkles/Brain/Zap icons + gradient utils** | 76 occurrences of `Sparkles|backdrop-blur|bg-gradient|bg-clip-text|Brain|Zap|glass` across 19 non-`ui/` components. `Projects.tsx` alone has 10. |
| **Tracking-widest mono section labels** | `.section-label` (`index.css:134`) — `font-mono text-xs uppercase tracking-[0.3em] text-primary/70`. |
| **Static dead grain** | `.noise-overlay` (`index.css:145`) — a fixed, non-animated `feTurbulence` SVG. |

**Verdict:** the current site is a near-complete checklist of §3.2. It is competently built, but it is the exact page the industry has learned to skim past. Every one of these is worth deleting rather than tuning. Note `use-smooth-scroll.ts` and `use-scroll-progress.ts` already exist and are worth keeping — the *plumbing* is fine, the *skin* is the problem.

### 3.4 What the counter-movement actually looks like

Trend research is unusually unanimous for 2026: as generative output floods the space with sameness, designers are responding with **friction, texture, grain, and evidence of a human hand**. Specific named movements: *tactile brutalism* (raw geometry, aggressive contrast, simulated physical textures "to prove human authorship"), **text-as-primary-interface** (type at hero scale, driven both by editorial fashion and by page-weight pressure), and **editorial 80s/print revival** (grainy film overlays, soft vignettes, bordered photography with dated color grading).

Every direction below is built on that counter-movement.

---

## 4. Seven distinctive direction proposals

Each reads as *intelligence / computation / data* without a robot or a particle graph. All fonts listed are free for commercial use (Google Fonts OFL, [Fontshare](https://www.fontshare.com/) free license, [Velvetyne](https://velvetyne.fr/) OFL, [Collletttivo](https://www.collletttivo.it/) OFL, or [UNCUT.wtf](https://uncut.wtf/)).

---

### Direction A — "Plotter Archive" (scientific instrumentation, pen on paper)

**Core visual idea.** The site is the output of a **pen plotter**. Warm paper stock, a single ink, everything drawn in *strokes* — contour hatching, registration crosses, tick-marked axes, hand-annotated margins. Charts are real. Diagrams are drawn, not rendered. It looks like the working notebook of someone who measures things.

**Why it fits an AI researcher.** Research *is* instrumentation: loss curves, ablations, attention maps, error bars. A plotter aesthetic lets you show the actual artifacts of the work as the decoration — the content and the ornament are the same object. It signals rigor and craft simultaneously, and there is no sci-fi metaphor anywhere in it. It is also the maximum-distance move from the current dark-glass-glow site: **light paper is the single strongest anti-AI signal available**, because essentially every AI site is dark.

**Palette**
| Role | Hex | Note |
|---|---|---|
| Paper | `#F4F1EA` | warm off-white, the ground |
| Paper (recessed) | `#EAE6DC` | panel / table fill |
| Ink | `#14110F` | near-black, warm |
| Ink (secondary) | `#5B564E` | annotations, captions |
| Plotter blue | `#2C4A7C` | the "second pen" — links, active state |
| Plotter red | `#C2452D` | the "third pen" — errors, highlights, one accent per screen |
| Graph green | `#4A6B3D` | optional fourth pen, data series only |
| Rule | `#D6D1C4` | hairlines, grid |

Dark mode: invert to ink `#12100E` ground with paper `#EDE8DC` strokes — reads as a *blueprint negative*, not as generic dark mode.

**Typography**
- Display: **Instrument Serif** (Google, OFL) — high-contrast, editorial, unmistakably not a tech font. Or **Zodiak** (Fontshare) for more weight.
- Body: **Newsreader** (Google, OFL) — designed for screen reading at length, has real optical sizes.
- Mono / data: **Martian Mono** (Google, OFL) or **Sometype Mono**. For a more instrument-panel feel: **Departure Mono** ([departuremono.com](https://departuremono.com/), OFL) — a pixel/terminal mono that reads *lab equipment*, not *matrix*.
- Annotation accent: **Basteleur** (Velvetyne) or a light italic of the serif.

**Signature animation.** **Everything draws itself.** Every rule, chart axis, diagram, and underline enters via `stroke-dashoffset` (GSAP `DrawSVG`) scrubbed to scroll — at plotter speed, with a tiny pen-down overshoot at each start. Section transitions are a *paper advance*: content translates up with a 1–2px lateral jitter, like a sheet feeding through a carriage. Hover on a project = the plotter draws its bounding box and a leader line to a margin annotation. Cursor is a crosshair with live `x, y` readout in mono.

**The one WebGL moment.** A fullscreen shader that renders the paper: animated fibre grain + a very slow, very subtle ink-bleed/diffusion around the largest strokes. Cheap (one quad), and it makes the paper feel physically present rather than like a beige `div`.

**Risk.** Can read as precious/twee if the type is too small or the whitespace too polite. Counter it with at least one screen of genuinely huge type.

---

### Direction B — "Latent Cartography" (embedding space as terrain)

**Core visual idea.** The site is a **map of a latent space**. Contour lines, isobands, coordinate gutters, a legend, a scale bar. Projects are *places* — plotted at real 2D coordinates. Scrolling is traversal; the contour field beneath continuously reprojects. The nav is a minimap.

**Why it fits an AI researcher.** This is the *only* direction here that is a literally true metaphor: embeddings really are points in a space, and t-SNE/UMAP projections really do look like terrain. If the coordinates are computed from actual embeddings of his project descriptions, the map is not decoration — it's a result. That's a story worth telling in a caption, and it's the kind of detail that makes a reviewer stop.

**Palette**
| Role | Hex |
|---|---|
| Ground | `#0E1412` (deep field green-black) |
| Contour (minor) | `#1F3A32` |
| Contour (major) | `#3D6B58` |
| Peak / high-density | `#E8C46A` (warm sand) |
| Route / active | `#E4572E` (survey orange) |
| Text | `#DCE4DF` |
| Muted | `#7A8A82` |

Light variant: ground `#F0EDE4`, contours `#8FA396`, peaks `#B8862F`. (A topographic map on paper. Also excellent.)

**Typography**
- Display: **Archivo Expanded** (Google, OFL) — wide, cartographic, authoritative.
- Body: **Public Sans** or **Literata** (both Google, OFL).
- Labels/coords: **Space Mono** (Google, OFL) — genuinely appropriate here (map labels), not a tech-signal.

**Signature animation.** A **continuous contour field** in a fragment shader: domain-warped fBm thresholded into isolines. It doesn't loop; it *drifts and reprojects* as you scroll, so the terrain morphs from one region to the next. Project cards drop a survey pin with a leader line to their coordinate. Hovering a project reveals its k-nearest neighbours as thin geodesic arcs. The scroll indicator is an altimeter.

**Risk.** Adjacent to the particle-graph cliché if you let the points connect into a network. **Rule: no straight lines between nodes, ever.** Contours only.

---

### Direction C — "Notation" (chess as an interface language)

**Core visual idea.** Borrow the *grammar* of chess notation and analysis — algebraic coordinates, move lists, annotation glyphs (`!`, `?`, `!?`, `∞`, `⩲`), evaluation bars, arrows and highlighted squares from analysis software. **Not a chessboard render.** The board is an 8-column grid that everything snaps to; the notation is the typographic system.

**Why it fits.** He's a FIDE-rated player, so it's autobiographical rather than borrowed. More importantly it's the best available metaphor for how research actually feels: search, evaluation, pruning, a position you can be *slightly better* in. Labelling a project `!?` (interesting, unclear, sacrificial) says more with two characters than a paragraph. And chess engines are the origin story of the whole field — it's an AI reference with a century of depth rather than a stock render.

**Palette**
| Role | Hex |
|---|---|
| Light square / ground | `#EDE8DE` |
| Dark square / panel | `#B58863` → desaturated to `#A8A093` (avoid literal wood) |
| Ink | `#1A1917` |
| Highlight square | `#F2D06B` at 45% (analysis yellow) |
| Best move / arrow | `#4C8C4A` (engine green) |
| Blunder / warning | `#B33A32` |
| Eval bar | pure `#FFFFFF` / `#151515` split |

**Typography**
- Display: **Bricolage Grotesque** (Google, OFL, variable — has `wdth` and `opsz` axes to animate).
- Body: **Source Serif 4** (Google, OFL).
- Notation: **IBM Plex Mono** (OFL) — has the figure-space alignment notation needs. Chess glyphs from **Chess Merida / Chess Alpha** (free) if literal pieces are ever needed.

**Signature animation.** The **evaluation bar** as the scroll progress indicator — a vertical white/black split down the page edge that shifts as you descend. Section transitions are *moves*: the incoming block slides along a rank or file, snapping with a hard `steps()`-flavored ease and a soft wooden click (audio, opt-in). Hovering a project draws analysis arrows to related work. The 8×8 grid is visible as a faint underlay and elements always land on it — an unusually rigorous, very visible layout discipline.

**Risk.** Could get gimmicky. Keep the metaphor at the level of *system* (grid, notation, eval) and never render a 3D knight.

---

### Direction D — "Cultivar" (growth systems, botanical plate)

**Core visual idea.** A **19th-century botanical plate** crossed with generative growth. L-systems, phyllotaxis spirals, reaction-diffusion (Gray-Scott) patterns, root networks, seed catalogue typography, Latin binomials as project taxonomy. Everything on the page *grows into place* rather than fading in.

**Why it fits.** He's a gardener, so it's honest. And it's the most intellectually accurate metaphor available for what training a model is: you don't build a model, you *cultivate* one — you set conditions, feed it, prune it, and it develops in ways you didn't specify. Emergence is the actual subject. L-systems and reaction-diffusion are legitimately computational (Lindenmayer, Turing's morphogenesis paper) — this is CS history, not a mood board.

**Palette**
| Role | Hex |
|---|---|
| Plate paper | `#F6F2E7` |
| Sepia line | `#3E3423` |
| Leaf | `#5C7A47` |
| Deep foliage | `#2F4029` |
| Bloom accent | `#C05A54` (botanical red) |
| Soil | `#6B4F35` |
| Annotation | `#8A8069` |

**Typography**
- Display: **Fraunces** (Google, OFL, variable — the `SOFT` and `WONK` axes are perfect here and almost nobody uses them).
- Body: **EB Garamond** (Google, OFL).
- Latin/taxonomy: EB Garamond Italic.
- Data: **DM Mono** (Google, OFL).

**Signature animation.** An **L-system that grows down the left gutter as you scroll**, branching at each section — a live table of contents that is also a plant. Reaching a section blooms a node. Text reveals as growth: words unfurl with a slight rotational settle rather than translating. Background: an extremely slow Gray-Scott reaction-diffusion shader, near-invisible at 4% opacity, that never repeats.

**Risk.** Could read as a wellness brand. Prevent that with hard editorial typography and dense, technical caption text — the plate must look *scientific*, not decorative.

---

### Direction E — "Risograph Archive" (analog print, misregistration)

**Core visual idea.** The site is printed on a **Risograph** — 2–3 spot inks, visible halftone dots, deliberate misregistration, ink saturation blotches, paper show-through. Overprint where inks cross. It looks handmade, cheap in the good way, and completely un-generatable.

**Why it fits.** The counter-movement in one image: *proof of human authorship through simulated physical texture*. It's also a sneaky-good AI metaphor — Riso is a **quantization** process. Continuous images get reduced to a few channels and dithered. That's exactly what happens inside a model, and it gives you an honest hook for the copy. Riso is defined by its *constraints and its errors*, which is a more truthful picture of ML than any glowing orb.

**Palette** (real Riso ink colors)
| Role | Hex | Riso name |
|---|---|---|
| Paper | `#F2EFE4` | Cream |
| Ink 1 | `#0078BF` | Federal Blue |
| Ink 2 | `#FF665E` | Fluorescent Pink/Red |
| Ink 3 (sparing) | `#00A95C` | Green |
| Overprint (1+2) | `#4C3A6E` | where blue crosses red |
| Text | `#1B1B1B` | Black ink |

**Typography**
- Display: **Le Murmure** (Velvetyne, OFL) — eccentric, poster-scale, instantly recognizable and free.
- Alt display: **Gulax** or **Pilowlava** (Velvetyne) for something louder.
- Body: **Apfel Grotezk** (Collletttivo, OFL) or **Karrik** (Velvetyne, OFL).
- Mono: **Steps Mono** (Velvetyne) or **Sligoil** (Velvetyne).

**Signature animation.** **Misregistration driven by scroll velocity** — the color channels physically separate as you scroll fast and settle back into register when you stop. This is the RGB-split technique (§2.4) but justified by a real-world printing process instead of being a glitch effect. Halftone dot size responds to hover. Page transitions are a *print pass*: the sheet moves through, one ink at a time. Everything is halftoned in a fragment shader, so the dot grid stays crisp at any DPR.

**Risk.** Legibility. Keep body text as flat black ink with no halftone; halftone imagery and large display type only.

---

### Direction F — "Ma / 間" (sumi-e ink, manga panel structure)

**Core visual idea.** Japanese editorial discipline: extreme negative space (*ma*), asymmetric panel layouts borrowed from **manga page grammar** (irregular gutters, panels that break the frame, one splash panel per chapter), and sumi-e ink — wet-edge brushstrokes, bleed, dry-brush texture. Vertical typographic elements. No anime characters, no neon Tokyo, no cherry blossoms.

**Why it fits.** He's an anime fan, and this is how to honor that *tastefully* — take the compositional language, not the iconography. Manga panel layout is an unusually sophisticated system for controlling reading pace, which maps beautifully onto scroll storytelling: panel size literally encodes time. And *ma* — the meaningful interval — is the exact antidote to the crowded glass-card grid the current site has. [izanami-official.com](https://izanami-official.com) in the reference table is live proof this register wins awards.

**Palette**
| Role | Hex |
|---|---|
| Washi ground | `#F5F2EC` |
| Sumi ink | `#1C1A19` |
| Ink wash (light) | `#6E6A66` |
| Ink wash (mid) | `#3A3735` |
| Shu (vermilion seal) | `#C1443A` — used *once* per page, like a hanko |
| Gutter/rule | `#DEDAD2` |

Night mode: sumi ground `#141312`, washi strokes, same vermilion.

**Typography**
- Display: **Shippori Mincho** (Google, OFL) — a real Japanese-designed Mincho with excellent Latin. Reads editorial and serious.
- Alt display: **Zen Old Mincho** or **Zen Antique** (Google, OFL).
- Body: **Zen Kaku Gothic New** (Google, OFL) or **Public Sans**.
- Mono: **Zen Kurenaido** for handwritten annotation, **JetBrains Mono** for code.
- If bilingual JP/EN labels are used, that alone gives enormous typographic texture.

**Signature animation.** **Brush reveals** — text and rules enter via a mask animated along a brush-stroke path, with a wet-edge darkening at the stroke start and dry-brush fraying at the end (SVG mask + a noise-textured stroke). Panels enter individually, staggered by reading order, at manga pacing — small panels snap fast, the splash panel takes four times as long. One vermilion seal stamps into place at the end of each section with a hard, satisfying impact. Ink-diffusion shader for the transitions.

**Risk.** Very easy to slide into weeb-kitsch. Hard constraint: zero character art, zero kanji used purely as texture, zero neon.

---

### Direction G — "Instrument Panel" (oscilloscope, spectrogram, telemetry)

**Core visual idea.** A **measurement instrument**, not a website. Phosphor traces on a CRT, spectrograms, waterfall plots, EEG-style multi-channel strips, calibration grids, needle gauges, seven-segment readouts. Everything is a live signal being observed.

**Why it fits.** Training runs *are* telemetry. Attention maps, activations over time, and loss curves are literally waterfall plots. This direction lets his actual charts be the hero imagery. It's also the direction with the highest kinetic energy — traces are always moving — without a single particle.

**Palette**
| Role | Hex |
|---|---|
| Scope ground | `#0B0F0D` |
| Phosphor green | `#5BF08F` (primary trace) |
| Phosphor decay | `#1E4F32` (afterglow) |
| Amber channel | `#FFB000` (second trace, warning) |
| Cyan channel | `#4FD0E7` (third trace) |
| Graticule | `#1A2420` |
| Panel metal | `#2A2E2C` |
| Label | `#B8C4BE` |

> Caution: this is the one dark-background direction, so it needs discipline to avoid drifting back toward §3. The saving grace is that it is **green-amber phosphor, not blue-purple**, and the surfaces are *matte instrument panel*, not glass. No blur, no glow-on-everything — phosphor afterglow only on the traces themselves.

**Typography**
- Display: **Archivo** or **Anton** (Google, OFL) — stencilled, panel-silkscreen feel.
- Readouts: **Departure Mono** ([departuremono.com](https://departuremono.com/), OFL) or **VG5000** (Velvetyne) for pixel-CRT authenticity.
- Body: **IBM Plex Sans** (OFL) — literally designed for technical documentation.

**Signature animation.** A **persistent scope trace** across the top of the viewport whose waveform is driven by real scroll velocity — you can see your own scrolling as a signal. Section changes trigger a trigger-sweep and a channel relabel. Project thumbnails resolve as a **spectrogram waterfall painting itself** left-to-right rather than fading in. CRT shader: barrel distortion, scanlines, phosphor persistence (feedback buffer), and horizontal jitter on fast scroll.

**Risk.** Closest of the seven to "hacker aesthetic," which is a cousin of the matrix cliché. Stay on the *scientific instrument* side (calibration, units, error bars), never the *hacking* side (no green text on black terminals typing by itself).

---

### 4.1 Direction comparison

| | Distinctiveness | Fits "AI researcher" | Build cost | Personal-story fit | Cliché risk |
|---|---|---|---|---|---|
| **A. Plotter Archive** | ★★★★★ | ★★★★★ | ★★☆ (low-med) | ★★★★ | Very low |
| **B. Latent Cartography** | ★★★★★ | ★★★★★ | ★★★★ (high) | ★★★ | Medium (node-graph drift) |
| **C. Notation** | ★★★★★ | ★★★★ | ★★★ (med) | ★★★★★ (chess) | Low (gimmick risk) |
| **D. Cultivar** | ★★★★ | ★★★★ | ★★★★ (high) | ★★★★★ (gardening) | Low (wellness drift) |
| **E. Risograph** | ★★★★★ | ★★★ | ★★★ (med) | ★★ | Very low |
| **F. Ma / 間** | ★★★★ | ★★★ | ★★☆ (low-med) | ★★★★ (anime) | Low (kitsch risk) |
| **G. Instrument Panel** | ★★★★ | ★★★★★ | ★★★ (med) | ★★ | **Medium-high** |

---

## 5. Library & implementation guide with perf notes

### 5.1 Scroll

| Library | Size (gz) | License | Verdict |
|---|---|---|---|
| **lenis** `1.3.x` | ~5 KB | MIT | **Use.** Already installed. Authored by Studio Freight / [darkroom.engineering](https://github.com/darkroomengineering/lenis). Ships on the majority of verified sites. |
| **GSAP ScrollTrigger** | ~12 KB | Free (see below) | **Use.** Non-negotiable for pin + scrub. |
| **GSAP ScrollSmoother** | ~8 KB | Free | **Skip if using Lenis.** They do the same job and will fight. Pick one — Lenis is lighter and more React-friendly. |
| Framer Motion `useScroll` | (installed) | MIT | Use for simple component-local reveals only. Don't build the scroll spine on it. |

**Lenis ↔ ScrollTrigger wiring** (get this exactly right or everything desyncs):
```ts
const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
```
Do **not** run a separate `requestAnimationFrame` loop for Lenis — one ticker, always.

### 5.2 GSAP licensing — verified current facts

**Confirmed against [gsap.com/pricing](https://gsap.com/pricing/) and [webflow.com/blog/gsap-becomes-free](https://webflow.com/blog/gsap-becomes-free):**

- Webflow acquired GreenSock in **October 2024**. Since **April 2025, GSAP is 100% free for everyone, including commercial use**, on all platforms and project types.
- **Club GreenSock no longer exists as a paid tier.** The pricing page now states plainly: *"GSAP is now 100% free for all users, thanks to Webflow's support."* There are no remaining paid tiers.
- **All formerly-premium plugins are free:** `ScrollTrigger`, `ScrollSmoother`, `SplitText`, `ScrambleText`, `MorphSVG`, `DrawSVG`, `MotionPath`, `Draggable`, `Inertia`, `Observer`, `Flip`, `CustomEase`, `Physics2D`, `PhysicsProps`.
- **SplitText was rewritten in 3.13** — ~50% smaller, better performance, and a new `mask` option that handles per-line overflow clipping for you.
- ⚠️ **One caveat worth flagging:** "free" is not the same as "MIT." GSAP ships under GreenSock's own **"no charge" standard license**, not a permissive OSS license. For a portfolio site this is completely irrelevant, but confirm the `LICENSE.md` in [github.com/greensock/GSAP](https://github.com/greensock/GSAP) before reusing GSAP inside a redistributed open-source library.
- ⚠️ Ignore repos like `gsap-plugins-unlocked` that surface in search results — they are obsolete cracks of plugins that are now legitimately free.

**Practical consequence:** there is no longer any reason to reach for `splitting.js`, `ScrollMagic`, or `locomotive-scroll`. The best-in-class tools are free.

### 5.3 3D / WebGL

| Library | Size (gz) | License | Use when |
|---|---|---|---|
| **ogl** | ~24 KB full, tree-shakes to **~8–12 KB** for a fullscreen quad | MIT | **Default choice for a shader background.** Zero deps, three-like API, tightly coupled to WebGL. Shipping on TRIONN and Artem Shcherbakov. |
| **three** | ~155 KB gz full; ~80–110 KB realistically tree-shaken | MIT | Only if you need loaders, GLTF, real lighting, or a scene graph. |
| **@react-three/fiber** | ~35 KB gz (+ three) | MIT | Worth it *only* if the 3D is stateful and interacts with React state. For a static background quad it's pure overhead. |
| **@react-three/drei** | huge; import per-symbol only | MIT | `shaderMaterial`, `useTexture`, `Html`, `PerformanceMonitor`. Never `import { } from "@react-three/drei"` barrel-style without verifying tree-shaking. |
| **postprocessing** / **@react-three/postprocessing** | ~45 KB gz | MIT | Bloom, chromatic aberration, noise, DOF. Each pass is a fullscreen redraw — budget 1–2 passes max. |

**Recommendation for this project: `ogl`, not three.** The reference sites' WebGL is overwhelmingly *one fullscreen fragment shader*. Paying 155 KB and an R3F reconciler for that is a bad trade. Add three/R3F later only if a direction demands real geometry.

### 5.4 How to do a fullscreen fragment shader cheaply

**Cheapest possible (ogl, ~12 KB, no React reconciliation):**
```ts
import { Renderer, Program, Mesh, Triangle } from "ogl";

const renderer = new Renderer({ dpr: Math.min(devicePixelRatio, 2), alpha: true });
const gl = renderer.gl;
canvasEl.appendChild(gl.canvas);

const geometry = new Triangle(gl);           // 1 triangle, not 2 — avoids the diagonal seam
const program = new Program(gl, {
  vertex, fragment,
  uniforms: { uTime: { value: 0 }, uScroll: { value: 0 }, uRes: { value: [0, 0] } },
});
const mesh = new Mesh(gl, { geometry, program });
// then drive program.uniforms.* from the same gsap.ticker as Lenis
```

**If already in R3F,** use drei's `shaderMaterial` + `<ScreenQuad />`:
```tsx
const NoiseMaterial = shaderMaterial({ uTime: 0, uScroll: 0 }, vertex, fragment);
extend({ NoiseMaterial });
// <ScreenQuad><noiseMaterial ref={ref} /></ScreenQuad>
// useFrame((s, dt) => { ref.current.uTime += dt })
```

**Non-negotiable perf rules for a fullscreen shader:**
1. **`Triangle`, not a `Plane`.** One tri covering the viewport; no seam, one less primitive.
2. **Clamp DPR to 2** (`Math.min(devicePixelRatio, 2)`), and to **1.5 on mobile**. A fullscreen shader at DPR 3 on a phone is 6× the fragments of DPR 1.25 and is the #1 cause of thermal throttling on these sites.
3. **`frameloop="demand"`** (R3F) or manual render calls when nothing is animating.
4. **`powerPreference: "high-performance"`, `antialias: false`** — you don't need MSAA on a fullscreen quad.
5. **Render at half resolution and upscale** if the shader is soft/blurry anyway (noise fields, gradients). Nobody can tell. This is a free 4× win.
6. **No branching in the fragment shader** where avoidable; `mix()`/`step()` over `if`.
7. Keep the noise to **fBm with ≤4 octaves**. Each octave is a full noise evaluation per pixel per frame.

### 5.5 Text

| Approach | Verdict |
|---|---|
| **GSAP SplitText** | **Use this.** Free as of 2025, rewritten in 3.13 (50% smaller), handles lines/words/chars, the new `mask` option, correct resize re-splitting via `SplitText.create(el, { autoSplit: true })`, and — critically — proper handling of nested markup and non-Latin scripts. |
| splitting.js | Obsolete now that SplitText is free. |
| Manual `text.split("")` | Only for tiny one-off labels. Breaks accessibility, breaks on resize, breaks emoji/grapheme clusters. |
| `Intl.Segmenter` | The correct primitive if you ever hand-roll grapheme-safe splitting. Baseline available. |

**Accessibility rule for split text:** always put `aria-label="<original text>"` on the wrapper and `aria-hidden="true"` on the split spans. Screen readers otherwise read character-by-character. SplitText does not do this for you.

**Variable-font motion** — the underused technique from §2.7:
```ts
gsap.to(el, { "--wght": 700, ease: "none",
  scrollTrigger: { trigger: el, scrub: true } });
// css: font-variation-settings: "wght" var(--wght);
```
Register the custom property with `@property --wght { syntax: "<number>"; inherits: false; initial-value: 400 }` so it interpolates on the compositor.

### 5.6 Physics

| Library | Size (gz) | License | Verdict |
|---|---|---|---|
| **GSAP Draggable + InertiaPlugin** | ~15 KB | Free | **Start here.** Throw-with-inertia, bounds, snapping. Covers 90% of "physical" portfolio interactions and appears on 4 of the verified sites. |
| **matter-js** | ~35 KB | MIT | Real 2D rigid bodies. Use for a "throw the skill tags around" pile. Unmaintained-ish but stable and battle-tested. |
| **@dimforge/rapier2d-compat** | ~400 KB WASM | Apache-2.0 | Vastly better simulation, but the WASM payload is indefensible for a decorative portfolio effect. Skip. |
| `react-three-rapier` | + WASM | MIT | Only for genuine 3D physics scenes. |

### 5.7 Cursor / magnetic — patterns, not libraries

Do not install a cursor library. The whole thing is ~60 lines.

```ts
// magnetic — quickTo is the key: a pre-allocated tween, ~10x cheaper in a move handler
const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3" });
const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3" });

el.addEventListener("pointermove", (e) => {
  const r = el.getBoundingClientRect();          // cache this on resize, not per-move
  xTo((e.clientX - (r.left + r.width / 2)) * 0.35);
  yTo((e.clientY - (r.top + r.height / 2)) * 0.35);
});
el.addEventListener("pointerleave", () => { xTo(0); yTo(0); });
```
- **Cache `getBoundingClientRect()`** — calling it inside `pointermove` forces layout on every mouse event. This is the most common perf bug in magnetic buttons.
- Gate the whole custom cursor behind `matchMedia("(pointer: fine)")`.
- Use `mix-blend-mode: difference` for the inverted look; note it forces a stacking context and can be expensive over a WebGL canvas — test it.

### 5.8 What actually kills performance on these sites

Ranked by how often it's the real culprit:

1. **Un-clamped `devicePixelRatio` on a WebGL canvas.** Covered above. Single biggest offender.
2. **`backdrop-filter: blur()` on many elements** (the current site has three glass classes). Each one is a separate offscreen render + blur pass, and they don't batch. On mid-range Android this alone can cost 20+ms/frame. Deleting glassmorphism is a *performance* win as well as an aesthetic one.
3. **Layout thrash in scroll/pointer handlers** — reading `getBoundingClientRect()`, `offsetTop`, or `scrollHeight` during a handler that also writes styles. Batch reads then writes, or let ScrollTrigger own the measurements.
4. **Animating non-composited properties.** Only `transform`, `opacity`, and `filter` are cheap. `width`, `height`, `top`, `margin`, `box-shadow` all trigger layout or paint every frame. `box-shadow` animation in particular (the current site's `pulseGlow`) repaints a large area continuously.
5. **`will-change` abuse.** Every `will-change` promotes an element to its own GPU layer, consuming VRAM. Fifty promoted layers will make a page *slower*. Apply it in JS immediately before an animation and remove it in `onComplete`. Never put it in a stylesheet on a shared class.
6. **Everything animating at once.** Gate offscreen work with `IntersectionObserver` and pause offscreen canvases entirely. Also use CSS `content-visibility: auto` + `contain-intrinsic-size` on long below-fold sections.
7. **Unoptimized media.** Serve AVIF with WebP fallback, `loading="lazy"`, explicit `width`/`height` to prevent CLS, and *never* an autoplaying MP4 above the fold on mobile.
8. **Fonts.** Self-host (don't `@import` from Google's CDN as the current `index.css` does — that's a render-blocking extra connection). Use `woff2`, subset with `pyftsubset`/`glyphhanger`, `font-display: swap`, and `<link rel="preload" as="font" crossorigin>` for the display face only.
9. **Too many GSAP instances.** One `gsap.context()` per component, always cleaned up in the effect return (`ctx.revert()`), or use `useGSAP()` from `@gsap/react`.
10. **Main-thread contention during page transitions** — React reconciliation and a CSS animation competing. The overlay pattern (§2.10) exists specifically to dodge this.

**The reduced-motion contract** (do this properly; it's also an Awwwards jury criterion):
```ts
const mm = gsap.matchMedia();
mm.add("(prefers-reduced-motion: no-preference)", () => { /* full timelines */ });
mm.add("(prefers-reduced-motion: reduce)", () => { /* instant states, no scrub */ });
```
- Reduced motion should mean **no parallax, no scrub, no autoplaying canvas** — not just faster durations. The current `index.css:253` blanket `animation-duration: 0.01ms` is a start but doesn't stop the requestAnimationFrame canvases, which is where the actual motion sickness comes from.
- Also kill WebGL under reduced-motion and render a static poster frame instead.

**Mobile fallback policy:** decide once, apply everywhere. Recommended tiers —
- **Tier 1** (desktop, `pointer: fine`, no reduced-motion): everything.
- **Tier 2** (tablet / low-power): WebGL at half-res, no postprocessing, no custom cursor.
- **Tier 3** (mobile or `deviceMemory < 4` or reduced-motion): no WebGL at all, static gradient/texture poster, CSS-only reveals, no pinning, no horizontal scroll sections.

Detect with `navigator.hardwareConcurrency`, `navigator.deviceMemory`, and drei's `<PerformanceMonitor>` for runtime downgrade.

### 5.9 Free assets with permissive licenses

**Fonts**
- [Google Fonts](https://fonts.google.com/) — OFL. Self-host via [google-webfonts-helper](https://gwfh.mranftl.com/fonts) or `@fontsource/*` npm packages.
- [Velvetyne](https://velvetyne.fr/) — OFL. Verified catalogue includes Le Murmure, Basteleur, Karrik, Gulax, Pilowlava, Sligoil, Steps Mono, Terminal Grotesque, Compagnon, VG5000, Trickster, Avara, Fungal, Lithops, Jgs Font, BianZhiDai. **The best source of genuinely distinctive free display type.**
- [Collletttivo](https://www.collletttivo.it/) — OFL, Milan. Apfel Grotezk, Mazius Display, Rethink Sans, Traulha.
- [Fontshare](https://www.fontshare.com/) (Indian Type Foundry) — free for commercial. Satoshi, Switzer, Zodiak, Erode, Gambetta, Boska, Ranade. *(Note: Satoshi and Switzer are now on the overused list — Zodiak, Erode, and Gambetta are not.)*
- [UNCUT.wtf](https://uncut.wtf/) — 140+ free contemporary typefaces, aggregated with license info.
- [Departure Mono](https://departuremono.com/) — OFL, pixel/CRT mono.
- [Redaction](https://www.redaction.us/) — OFL, by Forest Young & Jeremy Mickel, with degradation grades (10/20/35/50/70/100) — a built-in "print degradation" system, perfect for Direction E.
- [The League of Moveable Type](https://www.theleagueofmoveabletype.com/) — OFL classics.
- [Use & Modify](https://usemodify.com/) — OFL aggregator.

**Textures, grain, HDRIs**
- [Poly Haven](https://polyhaven.com/) — **CC0**, no attribution required, commercial OK. 8K+ PBR textures, 16K unclipped HDRIs, models. [License page](https://polyhaven.com/license).
- [ambientCG](https://ambientcg.com/) — CC0 PBR textures and HDRIs.
- [Texture Ninja](https://texture.ninja/) — CC0 photographic textures (paper, concrete, print).
- [Lost and Taken](https://lostandtaken.com/) — free paper/grunge/paper-stock textures (check per-set terms).
- [The Grainient](https://grainient.supply/) — free grain gradients.
- [Noisepng](https://noisepng.com/) / generate your own with a `<canvas>` `ImageData` loop or SVG `feTurbulence` — always prefer generated over downloaded for grain (smaller, tileable, animatable).
- [Public Domain Review](https://publicdomainreview.org/) and [Biodiversity Heritage Library Flickr](https://www.flickr.com/photos/biodivlibrary/) — **public domain botanical plates and scientific illustration**. Directly relevant to Directions A and D.
- [NASA Image and Video Library](https://images.nasa.gov/) — public domain.
- [Rijksmuseum Studio](https://www.rijksmuseum.nl/en/rijksstudio) — public domain high-res scans.

**Icons** (avoid generic thin-line sets — see §3.2 #17)
- [Lucide](https://lucide.dev/) (ISC) — already installed, but *use fewer and pick deliberately*. Consider replacing icons with typographic marks or hand-drawn SVG entirely; that's a strong anti-cliché move.
- [Phosphor](https://phosphoricons.com/) (MIT) — has a `duotone`/`bold` range with more character.

**Shader references**
- [Book of Shaders](https://thebookofshaders.com/) — noise, fBm, patterns.
- [Inigo Quilez articles](https://iquilezles.org/articles/) — the canonical SDF/noise/domain-warping reference. Read *Domain Warping* and *fBm* specifically.
- [Shadertoy](https://www.shadertoy.com/) — check each shader's license individually; many are CC BY-NC-SA and **not** safe for a commercial-adjacent site. Learn from them, write your own.
- [glsl-noise](https://github.com/hughsk/glsl-noise) / Ashima simplex noise — MIT, safe to paste.

---

## 6. Easter egg idea bank

The Konami Code (`↑↑↓↓←→←→BA`) originated as a debug cheat in Konami's *Gradius* (1985) and is the canonical web easter egg; Wired UK, BuzzFeed, and Bank of Canada have all shipped versions. It's a fine *baseline* — but it's also the most expected one, so it should be the least interesting egg on the site, not the headline.

Ranked roughly by payoff-per-effort. Aim to ship **4–6**, not all 18.

1. **Console art + a real recruiting message.** A plotter-drawn ASCII signature via `console.log("%c...", "font-family:monospace")`, then a genuine note: what he's looking for, an email, and a `window.hire()` function that logs a short pitch. Reviewers of a *research* portfolio genuinely open DevTools. Highest ROI egg on the list.
2. **`?debug=1` — the making-of overlay.** Reveals the layout grid, ScrollTrigger start/end markers (`ScrollTrigger.defaults({markers: true})`), an FPS/draw-call readout, and labels on every animation. Turns the craft itself into content. This is the single best egg for a *developer* portfolio because it proves the work rather than hiding it.
3. **Chess-specific: type a move in algebraic notation.** A key-capture buffer listening for `e4`, `Nf3`, `O-O`. Playing `1. e4` triggers a themed response; `O-O` (castling) literally swaps two page sections' positions with a GSAP `Flip`. Playing a famous blunder shows `??` in the margin. Deeply personal, nobody else has it.
4. **Hidden `/lab` or `/experiments` route,** unlinked from nav, discoverable only from a console hint or a margin annotation. Shelve half-finished shaders and notebooks there. Obys does exactly this with [experiment.obys.agency](https://experiment.obys.agency).
5. **Idle state.** After ~45s of no input, the page starts doing something on its own — the plotter draws an unprompted sketch, the L-system keeps growing, the scope trace goes to a screensaver waveform. Rewards leaving a tab open. Very rarely done, very memorable.
6. **Konami code → a mode, not a joke.** Rather than confetti, switch the entire site into an alternate colorway (e.g. Direction A's blueprint negative, or full Riso misregistration). A palette flip is far more impressive than a gag and reuses your existing token system.
7. **Hold-to-reveal margin annotations.** Press and hold anywhere for 800ms and the researcher's handwritten marginalia fade in across the whole page — real commentary on the projects ("this ablation was a dead end, kept it in for honesty"). Turns the egg into *content*, which is the mark of a good one.
8. **A 404 that is the best page on the site.** Not a joke graphic — make it functional and characterful: a plotter drawing the coordinates of where you tried to go, an "out of distribution" annotation, and a search field. Preload it so it's instant.
9. **Konami-adjacent: type `sudo`.** Reveals a fake-but-honest "permissions" panel listing what the site actually stores (nothing) and what it loads. A privacy joke that doubles as genuine transparency.
10. **Cursor-trail mode toggle** via a keyboard shortcut (e.g. `Shift+P` for "pen down"). The cursor starts leaving a permanent ink trail on the page — you can draw on the portfolio. `Shift+P` again lifts the pen; `Shift+C` clears. Fits Direction A perfectly and is genuinely fun.
11. **Click-count trigger on the avatar/logo.** 7 clicks reveals something small. Keep it *small* — this is a well-worn pattern and shouldn't carry weight.
12. **Hidden text in the page source.** An HTML comment with an ASCII drawing and a URL, plus a `<meta name="note">` addressed to whoever's reading the source. Costs nothing, delights the exact right person.
13. **Seeded generative signature.** The hero's generative element (contour field / L-system / noise) is seeded from the current date, so it's provably different every day, with the seed printed small in the corner (`seed: 2026-08-08`). A `?seed=` param lets people share a specific one. Makes the site feel alive and turns the shader into a *system* rather than a loop.
14. **Anime reference, done with restraint.** A single frame-composition homage (e.g. the vermilion seal, a specific cut/pan) that only lands if you know it, plus one line in the console. **No character art.** If it's obvious to non-fans, it's too much.
15. **Gardening egg: a real plant.** A tiny `localStorage`-backed seedling in the footer that grows a stage every time you visit. After N visits it flowers and unlocks something. Return-visit mechanics are almost never done on portfolios.
16. **Audio: the "instrument" toggle.** Enabling sound doesn't just add ambience — scrolling *plays* the page. Scroll velocity maps to a filter cutoff on a drone. Fits Direction G exactly, and only one of the 16 reference sites uses Web Audio at all.
17. **`Cmd/Ctrl+K` command palette.** Fuzzy-jump to any section, toggle themes, `theme riso`, `motion off`, `grid on`, `resume`. Reads as an *AI-researcher's* interface (keyboard-first, composable) and is a genuine UX improvement that happens to be a discovery reward. `cmdk` is already a dependency in this repo.
18. **DevTools-only art.** Use CSS to render a message that's only visible when the viewport is narrower than ~380px *and* the device is not mobile — i.e. only when someone has the inspector docked. Extremely niche, extremely appreciated.

**Rules for eggs:** never gate real content behind one; never trigger audio or heavy motion without consent; make each one discoverable by at least two routes (console hint + margin annotation) so they actually get found; and keep them all off the critical rendering path (lazy-load the egg bundle).

---

## 7. Top recommendation

### 7.1 The pick: **Direction A — "Plotter Archive"**, with Direction C ("Notation") as its structural system

Build the site as a **pen-plotter-drawn research notebook on warm paper**, and use **chess notation as the layout and labelling grammar** underneath it. Reserve Directions D (Cultivar) and F (Ma) as the visual language for the personal/hobby sections, so the site develops a second register as you scroll rather than repeating one idea.

### 7.2 Why

**1. It solves the credibility problem, not just the aesthetic one.** The audience for an AI researcher's portfolio is other researchers and lab hiring managers. A plotter/notebook aesthetic says *"I measure things and I show my work."* Every cliché in §3 says the opposite. The strongest signal here is the ground: **essentially every AI site in existence is dark navy.** Shipping warm paper `#F4F1EA` is an instant, pre-verbal "this is not that."

**2. The content and the ornament are the same object.** This is the rare direction where the decoration can be *real output* — actual loss curves, actual attention maps, actual ablation tables, drawn in the plotter's line language. You never have to invent abstract "AI imagery," which is precisely the vacuum that produced every cliché in the first place (per [Game Changer Labs](https://gamechangerlabs.io/blog/how-to-avoid-generic-ai-design): the clichés exist *because* ML is invisible). Plotter aesthetics fill that vacuum with evidence instead of sci-fi.

**3. It is the cheapest of the ambitious directions to build well.** Its signature animation — **everything draws itself via `stroke-dashoffset`** — is GSAP `DrawSVG` + `ScrollTrigger`, which are free, already installed, and cost almost nothing at runtime. It needs exactly **one** WebGL element (a ~12 KB `ogl` paper-grain + ink-bleed quad), so the Tier-3 mobile fallback is trivially a static paper texture and loses almost nothing. Compare Direction B, which is worthless without a working contour shader. **This direction degrades gracefully, which is exactly what an Awwwards jury and a Lighthouse score both reward.** And Obys proved a near-zero-WebGL site can take SOTD.

**4. Chess notation gives it rigor for free.** The 8-column grid is a genuinely strict layout discipline — and *visible* discipline is what separates award sites from busy ones. The annotation glyphs (`!`, `?`, `!?`, `∞`) are a compressed, personal, and slightly witty vocabulary for talking about his own work, and the evaluation bar is a scroll indicator nobody else has. It's autobiographical (FIDE-rated), it's the origin story of AI as a field, and it costs a font and a grid rather than an engine.

**5. The two risks are known and cheap to mitigate.** *Precious/twee* → mandate at least one screen of genuinely enormous Instrument Serif and one full-bleed image. *Static/quiet* → the scroll-velocity ink-bleed and paper-advance jitter (§2.4) supply the kinetic energy without adding a single glowing thing.

### 7.3 Concrete first moves

1. **Delete, don't tune.** Remove `.glass*`, `.gradient-text*`, `.glow-*`, `.text-shadow-glow`, `pulseGlow`, `.grid-bg`, `NeuralField.tsx`, `NeuralCompanion.tsx`, `AmbientBackground.tsx`, and every `Sparkles`/`Brain`/`Zap` icon. Keep `use-smooth-scroll.ts`, `use-scroll-progress.ts`, and `motion/Reveal.tsx` — the plumbing is sound.
2. **Invert the palette first, before anything else.** Change `--background` to `#F4F1EA` and `--foreground` to `#14110F` and look at it. That single commit will tell you more than another week of research.
3. **Swap the type stack.** Instrument Serif (display) + Newsreader (body) + Martian Mono or Departure Mono (data). **Self-host** via `@fontsource` — drop the three render-blocking `@import`s at the top of `index.css`.
4. **Wire the spine:** Lenis → `gsap.ticker` → `ScrollTrigger.update` (§5.1), register `ScrollTrigger`, `SplitText`, `DrawSVG`, `Flip`, `CustomEase`, `Draggable`, `InertiaPlugin` — all now free. Drop `ScrollSmoother` (conflicts with Lenis).
5. **Build one section to completion** — a single project case study with a pinned diagram that draws itself on scrub. If that one section feels expensive, the direction is proven and the rest is repetition. If it doesn't, you've spent two days, not two weeks.
6. **Set the tiering policy on day one** (§5.8), not at the end. Retrofitting reduced-motion and mobile fallbacks into a finished scroll-driven site is the single most painful task in this entire genre.

---

## Sources

**Galleries & awards:** [Awwwards SOTD](https://www.awwwards.com/websites/sites_of_the_day/) · [Awwwards Sites of the Year](https://www.awwwards.com/websites/sites_of_the_year/) · [Awwwards Portfolio winners](https://www.awwwards.com/websites/winner_category_portfolio/) · [Lando Norris — Site of the Year 2025](https://www.awwwards.com/annual-awards/site/5f6a4834-ae80-4206-976f-79792baa0f87) · [OFF+BRAND](https://www.awwwards.com/offbrand/) · [The FWA](https://thefwa.com/) · [siteinspire](https://www.siteinspire.com/websites) · [godly.website](https://godly.website/) → [recent.design](https://recent.design/) · [minimal.gallery](https://minimal.gallery/) · [httpster](https://httpster.net/) · [Codrops](https://tympanus.net/codrops/)

**AI-cliché critique:** [925 Studios — AI Slop Fonts and Gradients: The Tells That Give Away AI Design](https://www.925studios.co/blog/ai-slop-design-tells) · [Game Changer Labs — How to Avoid Generic, Cliché AI Design](https://gamechangerlabs.io/blog/how-to-avoid-generic-ai-design) · [prg.sh — Why Your AI Keeps Building the Same Purple Gradient Website](https://prg.sh/ramblings/Why-Your-AI-Keeps-Building-the-Same-Purple-Gradient-Website) · [Indie Hackers — The AI Purple Problem](https://www.indiehackers.com/post/the-ai-purple-problem-why-every-ai-brand-looks-the-same-6cb0aa2a02) · [Medium — The Purple Problem](https://medium.com/@ai.in.motion.blog/the-purple-problem-why-ai-cant-stop-generating-purple-websites-4381fb066883) · [Ioana Teleanu — Aesthetics in the AI era: trends for 2026](https://medium.com/design-bootcamp/aesthetics-in-the-ai-era-visual-web-design-trends-for-2026-5a0f75a10e98) · [Fireart — Web Design Trends 2026: Brutalist UX](https://fireart.studio/blog/the-best-web-design-trends/) · [Brainy Papers — Brutalist Web Design 2026](https://brainy.ink/paper/brutalist-web-design-2026)

**Libraries & implementation:** [GSAP pricing (free confirmation)](https://gsap.com/pricing/) · [Webflow — GSAP becomes free](https://webflow.com/blog/gsap-becomes-free) · [GSAP 3.13 release notes (SplitText rewrite)](https://gsap.com/blog/3-13/) · [github.com/greensock/GSAP](https://github.com/greensock/GSAP) · [Lenis](https://github.com/darkroomengineering/lenis) · [ogl](https://github.com/oframe/ogl) · [R3F — Scaling performance](https://r3f.docs.pmnd.rs/advanced/scaling-performance) · [Maxime Heckel — The Study of Shaders with React Three Fiber](https://blog.maximeheckel.com/posts/the-study-of-shaders-with-react-three-fiber/) · [Utsubo — 100 Three.js performance tips (2026)](https://www.utsubo.com/blog/threejs-best-practices-100-tips) · [Krapton — Boosting R3F Mobile Performance in 2026](https://www.krapton.com/blog/boosting-react-three-fiber-mobile-performance-in-2026-a-deep-dive-d6105c) · [react-three-offscreen](https://github.com/pmndrs/react-three-offscreen)

**Assets & type:** [Poly Haven](https://polyhaven.com/) ([license](https://polyhaven.com/license)) · [ambientCG](https://ambientcg.com/) · [Velvetyne](https://velvetyne.fr/) · [Collletttivo](https://www.collletttivo.it/) · [Fontshare](https://www.fontshare.com/) · [UNCUT.wtf](https://uncut.wtf/) · [Departure Mono](https://departuremono.com/) · [Redaction](https://www.redaction.us/) · [Google Fonts](https://fonts.google.com/) · [google-webfonts-helper](https://gwfh.mranftl.com/fonts) · [Book of Shaders](https://thebookofshaders.com/) · [Inigo Quilez](https://iquilezles.org/articles/) · [Public Domain Review](https://publicdomainreview.org/)

**Easter eggs:** [Viget — Breaking the Konami Code](https://www.viget.com/articles/breaking-the-konami-code-adding-an-easter-egg-to-your-site) · [GoSkills — 17 Best Easter Eggs Hidden on the Web](https://www.goskills.com/Development/Resources/Best-easter-eggs) · [Intechnic — Best Website Easter Eggs](https://www.intechnic.com/blog/best-website-easter-eggs-hidden-on-the-internet/) · [IndieWeb — easter egg](https://indieweb.org/easter_egg)
