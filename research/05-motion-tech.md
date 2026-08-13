# 05 — Motion Tech Research

Target: Awwwards SOTY-grade execution.
Stack (fixed): **Vite + React 18 + TS + Tailwind + GSAP (all plugins) + Lenis**.
Research date: 2026-08-09. Everything below was verified by fetching the URL / GitHub API unless explicitly flagged `[UNVERIFIED]`.

---

## §0 — VERDICT: which WebGL layer

**Use raw `three.js` (imperative, mounted once outside React's render tree). Do NOT use `@react-three/fiber` for the persistent particle field.**

Reasoning, concretely:

| Option | Bundle (min+gzip) | Verdict |
|---|---|---|
| Raw WebGL2 | 0 KB | Rejected. You'd rewrite FBO ping-pong, program linking, attribute binding, resize handling. Weeks of cost, zero visual payoff. |
| **OGL** (`oframe/ogl`, ★4.6k, **no license file** — verified via GitHub API) | ~29 KB total (8 KB core + 6 KB math + 15 KB extras) | Strong runner-up. This is what Thibault Guignand shipped on his Codrops-featured Vite+React18+TS+GSAP+Lenis portfolio. Downside: **no `GPUComputationRenderer`**, no loaders, no postprocessing. You'd hand-roll the ping-pong FBO. Also: **no LICENSE file on the repo** — legally ambiguous for a commercial portfolio. |
| **three.js** (`mrdoob/three.js`, MIT) | ~170 KB gzip with tree-shaking on a particles-only import graph | ✅ **Pick this.** You get `GPUComputationRenderer` (in `examples/jsm/misc/`), `EffectComposer`, `UnrealBloomPass`, `ShaderPass`, `KTX2Loader`, and `InstancedBufferGeometry` for free. Three.js performs at 95–99% of raw WebGL for this class of scene. |
| `@react-three/fiber` (MIT, ★31.7k) | +~30 KB on top of three | Rejected **for the particle layer**. R3F's reconciler adds per-frame overhead you don't want at 120 Hz, and its declarative model fights a WebGL context that must survive route changes. |

**Architecture consequence — "mount once, swap uniforms":**
Guignand's stated pattern (Codrops, 2026-05-06) is the one to copy: *one WebGL context instantiated at the app root, outside the router*. Route changes swap **textures and uniforms via imperative setters**, never remount the canvas. He explicitly credits this with eliminating "an entire memory-leak class."

Also from that article, and this is important for a 120 Hz portfolio:
> Writing `element.style.*` instead of React state saves full reconciliation at 120 Hz; critical for per-frame effects.

So: React owns layout and routing. GSAP + a `useRef`-held three.js instance own every per-frame value. Zero `setState` inside any `onUpdate`.

Optional: use `@react-three/fiber` **only** if you later want a discrete 3D hero object with orbit controls. Keep it in a separate, lazily-imported canvas.

---

## §1 — Open-source repos to clone parts from

All rows below verified live against `api.github.com` on 2026-08-09 (license = SPDX id from the API; `None` = **no LICENSE file present**, treat as all-rights-reserved and use as *reference only*, do not copy verbatim into a shipped bundle).

### 1.1 Core infrastructure

| Repo | ★ | License | Lift what | React-compatible |
|---|---|---|---|---|
| https://github.com/darkroomengineering/lenis | 15,332 | **MIT** | The whole library. Also `lenis/react` (`<ReactLenis>`), `lenis/snap` (scroll snapping that respects smooth scroll). Actively maintained (pushed 2026-08-05). | ✅ First-class React entry point |
| https://github.com/darkroomengineering/tempus | 326 | **MIT** | Single-rAF scheduler. Use it to make Lenis, three.js, and GSAP share **one** `requestAnimationFrame` with explicit priority ordering. | ✅ |
| https://github.com/darkroomengineering/hamo | 311 | **MIT** | React hooks: `useRect`, `useWindowSize`, `useIntersectionObserver` — all `ResizeObserver`-batched so you don't thrash layout. | ✅ React-only |
| https://github.com/darkroomengineering/satus | 979 | **MIT** | darkroom.engineering's own production starter. Even though it's Next.js App Router, **steal the `webgl/` folder structure, the Lenis↔GSAP↔Tempus wiring, and the `orchestra` debug panel.** This is the closest thing to "how a top studio actually lays out the files." | Partially (Next-specific bits) |
| https://github.com/mrdoob/three.js | — | **MIT** | `examples/jsm/misc/GPUComputationRenderer.js` — copy this file directly into `src/lib/`. Also `examples/webgl_gpgpu_birds.html` as the canonical ping-pong reference. | ✅ |
| https://github.com/pmndrs/drei | — | **MIT** | Reference only (if not using R3F). `<PerformanceMonitor>` logic is worth reading. | ✅ |
| https://github.com/pmndrs/postprocessing | — | **Zlib** | Better than three's built-in `EffectComposer`: merges effects into a single fragment pass instead of N full-screen passes. Zlib = permissive. Use for bloom + grain + chromatic aberration in **one** pass. | ✅ |
| https://github.com/ashima/webgl-noise | — | **MIT** | `src/noise3D.glsl` — the canonical `snoise(vec3)`. Full source reproduced in §2.5. | ✅ (it's a .glsl file) |

**Note on `studio-freight/*`:** the org was renamed. `studio-freight/lenis` now **404s on the API**; the npm packages `@studio-freight/lenis` and `@studio-freight/react-lenis` are deprecated aliases. Install `lenis`, not `@studio-freight/lenis`.

### 1.2 Codrops / Tympanus demos — enumerated by relevance to our brief

Repos live at `github.com/codrops/<Name>`, demos at `tympanus.net/Tutorials/<Name>/`. Licenses verified individually.

**→ Scroll-driven shader transitions & WebGL**

| Repo | License | Lift |
|---|---|---|
| [`codrops/LiquidDistortion`](https://github.com/codrops/LiquidDistortion) | ⚠️ **None** | PixiJS displacement-map slideshow. Reference only — the *technique* (displacement texture drives UV offset) is what you want; reimplement in three. |
| [`codrops/MotionTrailAnimations`](https://github.com/codrops/MotionTrailAnimations) | **MIT** | Mouse/touch-responsive image trails. Directly liftable. |
| [`codrops/OnScrollSVGFilterText`](https://github.com/codrops/OnScrollSVGFilterText) | **MIT** | Scroll-driven SVG `feTurbulence`/`feDisplacementMap` on live HTML text. **This is the cheap non-WebGL path to text distortion** — no canvas needed, works on real selectable text. |

**→ Text distortion / typographic reveals**

| Repo | License | Lift |
|---|---|---|
| [`codrops/OnScrollTypographyAnimations`](https://github.com/codrops/OnScrollTypographyAnimations) (★343) | **MIT** | The single best grab-bag. ~12 distinct scroll-typography effects, GSAP + ScrollTrigger, vanilla JS, trivially portable to a React `useGSAP` hook. |
| [`codrops/ScrollBlurTypography`](https://github.com/codrops/ScrollBlurTypography) (★146) | **MIT** | Blur-in-on-scroll per line. Note: `filter: blur()` is expensive — see §6. |
| [`codrops/TextClipScroll`](https://github.com/codrops/TextClipScroll) | **MIT** | SVG `clipPath` scroll typography. |
| [`codrops/SlicedTextEffect`](https://github.com/codrops/SlicedTextEffect) | **MIT** | Scroll-based sliced text. |
| [`codrops/ScrollTextMotion`](https://github.com/codrops/ScrollTextMotion) | **MIT** | GSAP on-scroll typographic motion. |
| [`codrops/OnScrollTextHighlight`](https://github.com/codrops/OnScrollTextHighlight) | **MIT** | Scroll-scrubbed highlight sweeps. |

**→ Page transitions & FLIP**

| Repo | License | Lift |
|---|---|---|
| [`codrops/OneElementScroll`](https://github.com/codrops/OneElementScroll) (★72) | **MIT** | **GSAP Flip + ScrollTrigger** moving ONE element across scroll waypoints. This is the primitive under the "click a project, it expands" move. |
| [`surya-aditya/codrops-infinite-scroll-and-content-transition`](https://github.com/surya-aditya/codrops-infinite-scroll-and-content-transition) | ⚠️ None | Companion repo to the July 2026 Codrops article. **Reference for the exact Flip-to-detail-view code** (see §3.5). Demo: https://tympanus.net/Tutorials/InfiniteScrollGSAPGallery/ |

**→ Infinite / pinned galleries**

| Repo | License | Lift |
|---|---|---|
| [`codrops/ElasticGridScroll`](https://github.com/codrops/ElasticGridScroll) | **MIT** | Per-column differential scroll speed. The "elastic" feel. |
| [`codrops/3DCarousel`](https://github.com/codrops/3DCarousel) | **MIT** | On-scroll 3D carousel. |
| [`codrops/RotatingOnScrollAnimations`](https://github.com/codrops/RotatingOnScrollAnimations) | **MIT** | 3D image rotation on scroll. |
| [`codrops/Staggered3DGridAnimations`](https://github.com/codrops/Staggered3DGridAnimations) | **MIT** | Scroll-based 3D grid formations. |
| [`codrops/OnScrollLayoutFormations`](https://github.com/codrops/OnScrollLayoutFormations) | **MIT** | Layout *formations* on scroll — conceptually the DOM twin of our particle morph. |
| [`codrops/3DStackMotion`](https://github.com/codrops/3DStackMotion) | **MIT** | 3D card stack on scroll → sticky-stacked cards (§3.6). |

**→ GPU particles**

| Repo | License | Lift |
|---|---|---|
| [`brunoimbrizi/interactive-particles`](https://github.com/brunoimbrizi/interactive-particles) (★1,167) | ⚠️ **None** | The famous Codrops "Interactive Particles" demo. **The single most useful reference for image→point-cloud sampling.** Full code reproduced in §2.4. Reference-only license-wise, but the technique is public-domain knowledge. |
| [`DGFX/codrops-dreamy-particles`](https://github.com/DGFX/codrops-dreamy-particles) (★32) | ⚠️ None | Companion to the Dec 2024 Codrops GPGPU article. Clean, minimal `GPUComputationRenderer` position+velocity ping-pong. Shaders reproduced in §2.3. |
| [`cabbibo/glsl-curl-noise`](https://github.com/cabbibo/glsl-curl-noise) | ⚠️ None | The canonical `curlNoise(vec3)`. It's 25 lines of textbook math — reimplement from the formula (§2.5), don't worry about the license. |
| [`drcmda/glsl-curl-noise2`](https://github.com/drcmda/glsl-curl-noise2) | ⚠️ None | Identical file, maintained by the pmndrs lead. |
| [`epranka/gpucomputationrender-three`](https://github.com/epranka/gpucomputationrender-three) | **MIT** | ES6-module-ified `GPUComputationRenderer`. **Use this instead of copy-pasting from three's examples folder** — it's MIT and import-clean for Vite. |

### 1.3 akella (Yuri Artiukh) — shader tutorial repos

All verified. He's the best free source of "one effect, one repo" WebGL code.

| Repo | ★ | License | Lift |
|---|---|---|---|
| https://github.com/akella/webgl-mouseover-effects | 398 | **MIT** | Hover displacement on images. The standard "image hover ripple." |
| https://github.com/akella/DistortedPixels | 287 | **MIT** | Pixel/block distortion reveal. |
| https://github.com/akella/CodropsEmergingImages | 78 | **MIT** | Noise-threshold image emergence — **directly reusable as a scroll-scrubbed reveal** (drive the threshold with ScrollTrigger progress). |
| https://github.com/akella/ParticleRainEffect | 71 | **MIT** | Particle system reference. |
| https://github.com/akella/PolygonTransitions | 35 | **MIT** | GLSL polygon transitions — good for the curtain wipe. |
| https://github.com/akella/UnrollingImages | 133 | ⚠️ None | Reference only. |

### 1.4 Other verified references

| Repo / URL | ★ | License | Note |
|---|---|---|---|
| https://github.com/ykob/sketch-threejs | 2,544 | **MIT** | ~40 self-contained three.js sketches (fire, ripples, particle bursts, glitch). Still maintained (pushed 2025-04). MIT = actually copyable. |
| https://github.com/adrianhajdin/award-winning-website | — | ⚠️ **None** | The JS Mastery "Zentry clone." Useful as a *structure* reference for a GSAP-heavy React site. Code quality is tutorial-grade; do not treat as SOTY reference. |
| https://github.com/Kshitij978/Three.js-Point-cloud-morphing-effect | — | NOASSERTION | Point-cloud morph between shapes, three + GSAP. Small but exactly on-brief. |
| https://github.com/jsulpis/webgl-libs-comparison | — | None | Side-by-side of raw WebGL / three / OGL / four for the same output. Read once to calibrate. |
| https://gsap.com/docs/v3/HelperFunctions/helpers/imageSequenceScrub/ | — | GSAP (free) | Official `imageSequence()` helper. Verbatim in §3.2. |
| https://tympanus.net/codrops/2026/05/06/from-shader-uniforms-to-clip-path-wipes-how-gsap-drives-my-portfolio/ | — | — | **Read this first.** Thibault Guignand's teardown of a portfolio built on *exactly our stack* (Vite + React 18 + TS + GSAP + Lenis + OGL). Live site: https://www.thibaultguignand.com/ |

---

## §2 — GPU particle morphing, in depth

### 2.1 Technique selection

Three viable approaches. **We want #2 as the base, with #1 layered on for the drift.**

| # | Technique | How it works | Max count | Good for | Bad for |
|---|---|---|---|---|---|
| 1 | **FBO / GPGPU ping-pong** | Positions live in a float texture. Each frame a fullscreen quad reads texture A, writes texture B; swap. Particle mesh's vertex shader samples the texture. | 1M+ (1024×1024 FBO = 1,048,576) | Stateful physics: velocity, attraction, collision-ish, trails. State persists across frames. | Morphing to a *known* target — you're simulating what you could just `mix()`. Costs an extra full render pass per variable per frame. |
| 2 | **Attribute-lerp in vertex shader** | Ship N position buffers as attributes (`position`, `aPosTarget`, `aPosTarget2`…). Vertex shader does `mix(a, b, uProgress)`. | 500k+ trivially; the cost is VRAM for attributes, not ALU | **Scroll-driven morphing between authored formations.** GSAP/ScrollTrigger tweens one float uniform. Deterministic, scrubbable, reversible. | Emergent physics. No state. |
| 3 | **InstancedBufferGeometry (quads)** | Each particle is a 2-triangle instanced quad with its own UV. | ~150k before fill-rate bites | Textured/rotating sprites, per-particle geometry. This is what `brunoimbrizi/interactive-particles` does. | Raw count. 6 verts + 2 tris per particle vs 1 vert for `gl.POINTS`. |

**Decision: `THREE.Points` + attribute-lerp (#2) + curl-noise drift computed live in the vertex shader.**

Why not GPGPU as the base: our morph is **scroll-scrubbed**, which means it must be **bidirectional and instantaneous** (user flicks the scrollbar up). A physics simulation has hysteresis — you can't scrub a simulation backwards. An attribute `mix()` driven by `uProgress` is a pure function of scroll position. That is non-negotiable for scrub feel.

The curl-noise drift is *additive and stateless* — `pos += curlNoise(pos * f + t) * amp` — so it also survives scrubbing.

Use GPGPU **only** if you later want a mouse-repulsion field with spring-return (the Dreamy Particles behaviour). That can be a second, smaller (~30k) system composited on top.

### 2.2 The attribute-lerp system — full implementation

**Buffer layout.** For 4 formations at 262,144 particles (512²):

```
position       vec3  → formation 0 (noise cloud)      3 MB
aPos1          vec3  → formation 1 (lattice)          3 MB
aPos2          vec3  → formation 2 (letterforms)      3 MB
aPos3          vec3  → formation 3 (clusters)         3 MB
aColor         vec3  → per-particle tint              3 MB
aRandom        vec3  → (seed, sizeJitter, delayBias)  3 MB
                                              total ≈ 18 MB VRAM
```

18 MB of static VRAM is nothing. Upload once at init with `gl.STATIC_DRAW` (three's default) and never touch it again — **zero per-frame CPU→GPU traffic.**

**JS setup:**

```ts
// src/webgl/ParticleField.ts
import * as THREE from 'three'
import vert from './particles.vert?raw'   // vite ?raw import; or use vite-plugin-glsl
import frag from './particles.frag?raw'

const COUNT = 512 * 512 // 262,144

const geo = new THREE.BufferGeometry()
geo.setAttribute('position', new THREE.BufferAttribute(formations[0], 3))
geo.setAttribute('aPos1',    new THREE.BufferAttribute(formations[1], 3))
geo.setAttribute('aPos2',    new THREE.BufferAttribute(formations[2], 3))
geo.setAttribute('aPos3',    new THREE.BufferAttribute(formations[3], 3))
geo.setAttribute('aColor',   new THREE.BufferAttribute(colors, 3))
geo.setAttribute('aRandom',  new THREE.BufferAttribute(randoms, 3))
// Points don't need a bounding sphere computed from a huge buffer every frustum test:
geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 50)

const uniforms = {
  uProgress:   { value: 0 },      // 0..3, continuous — GSAP scrubs this
  uTime:       { value: 0 },
  uSize:       { value: 2.2 },
  uPixelRatio: { value: Math.min(devicePixelRatio, 2) },
  uNoiseAmp:   { value: 0.35 },
  uNoiseFreq:  { value: 0.28 },
  uNoiseSpeed: { value: 0.08 },
  uScrollVel:  { value: 0 },      // fed from Lenis, see §3.7
  uColorA:     { value: new THREE.Color('#EBEEE0') },
  uColorB:     { value: new THREE.Color('#D2FF00') },
}

const mat = new THREE.ShaderMaterial({
  vertexShader: vert,
  fragmentShader: frag,
  uniforms,
  transparent: true,
  depthWrite: false,                        // critical: additive points must not z-fight
  blending: THREE.AdditiveBlending,         // switch to NormalBlending for the light theme
})

const points = new THREE.Points(geo, mat)
points.frustumCulled = false                // it's fullscreen; culling is pure overhead
```

**`particles.vert` — the real thing:**

```glsl
precision highp float;

attribute vec3 aPos1;
attribute vec3 aPos2;
attribute vec3 aPos3;
attribute vec3 aColor;
attribute vec3 aRandom;   // x: seed 0..1, y: size jitter 0..1, z: stagger bias 0..1

uniform float uProgress;    // 0..3 continuous, scrubbed by ScrollTrigger
uniform float uTime;
uniform float uSize;
uniform float uPixelRatio;
uniform float uNoiseAmp;
uniform float uNoiseFreq;
uniform float uNoiseSpeed;
uniform float uScrollVel;   // signed, roughly -3..3

varying vec3  vColor;
varying float vAlpha;
varying float vTransit;     // 1.0 mid-morph, 0.0 at rest — drive brightness with it

// ---- snoise + curlNoise injected here (see §2.5) ----
#include <curl_noise>

void main() {
  // 1) STAGGERED PROGRESS -----------------------------------------------
  // Every particle gets its own slightly offset progress so the formation
  // "breathes" into place instead of snapping as one rigid body.
  // 0.28 = spread of the stagger window; tune 0.15 (tight) .. 0.5 (loose).
  float stagger = aRandom.z * 0.28;
  float p = clamp((uProgress - stagger) / (1.0 - 0.28), 0.0, 3.0);

  // 2) MULTI-TARGET MORPH ------------------------------------------------
  // Chain of mixes. Each segment's local t is smoothstepped so the particle
  // eases in/out of every formation, not just the first and last.
  float seg = floor(p);
  float t   = smoothstep(0.0, 1.0, fract(p));

  vec3 a = position;
  vec3 b = aPos1;
  if (seg >= 1.0) { a = aPos1; b = aPos2; }
  if (seg >= 2.0) { a = aPos2; b = aPos3; }
  if (seg >= 3.0) { a = aPos3; b = aPos3; t = 0.0; }

  vec3 pos = mix(a, b, t);

  // vTransit peaks at t=0.5 — use it to flare size/brightness mid-flight.
  vTransit = sin(t * 3.14159265);

  // 3) CURL-NOISE DRIFT ---------------------------------------------------
  // Stateless: pure function of (pos, time). Survives scroll scrubbing.
  // Amplitude swells during transit so the morph looks turbulent, then calms.
  vec3 np = pos * uNoiseFreq + vec3(0.0, 0.0, uTime * uNoiseSpeed);
  vec3 drift = curlNoise(np);
  float amp = uNoiseAmp * (0.25 + 1.75 * vTransit) * (0.6 + 0.4 * aRandom.x);
  pos += drift * amp;

  // 4) SCROLL-VELOCITY SHEAR ---------------------------------------------
  // The "how did they do that" tell. Fast scroll smears the field along Y
  // and pushes it away from camera. Signed, so direction reads.
  pos.y += uScrollVel * 0.35 * (0.4 + aRandom.y);
  pos.z -= abs(uScrollVel) * 0.12;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

  // 5) SIZE --------------------------------------------------------------
  // Perspective-correct: divide by -z. Multiply by DPR so points are the same
  // *physical* size on retina; if you skip this they halve on 2x displays.
  float size = uSize * (0.55 + 0.9 * aRandom.y);
  size *= (1.0 + 0.9 * vTransit);                 // flare mid-morph
  gl_PointSize = size * uPixelRatio * (300.0 / -mvPosition.z);
  // Hard clamp: a single 200px point can cost more fill than 10k small ones.
  gl_PointSize = clamp(gl_PointSize, 0.0, 24.0);

  // 6) COLOUR ------------------------------------------------------------
  vColor = aColor;
  // Fade the far tail so the field has depth instead of reading as a flat wall
  vAlpha = smoothstep(-90.0, -8.0, mvPosition.z);

  gl_Position = projectionMatrix * mvPosition;
}
```

**`particles.frag`:**

```glsl
precision highp float;

varying vec3  vColor;
varying float vAlpha;
varying float vTransit;

uniform vec3  uColorA;
uniform vec3  uColorB;

void main() {
  // Soft round sprite from gl_PointCoord — no texture bind, no atlas.
  vec2 uv = gl_PointCoord - 0.5;
  float d  = dot(uv, uv);            // squared distance; avoids a sqrt
  if (d > 0.25) discard;             // early-out the corners of the quad

  // smoothstep on squared distance gives a tighter, less "cotton wool" falloff
  float mask = 1.0 - smoothstep(0.04, 0.25, d);
  mask = pow(mask, 1.6);

  vec3 col = mix(uColorA, uColorB, vColor.r);
  col += vTransit * 0.35;            // heat-up mid-morph

  gl_FragColor = vec4(col, mask * vAlpha);

  #include <colorspace_fragment>     // three r15x+: correct sRGB output
}
```

**GSAP wiring — this is the whole scroll integration:**

```ts
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

gsap.to(uniforms.uProgress, {
  value: 3,                    // walk through all four formations
  ease: 'none',                // MANDATORY for scrub — see §3.3
  scrollTrigger: {
    trigger: '#particle-scroll-track',
    start: 'top top',
    end: '+=4000',             // 4000px of scroll for 4 formations = 1000px each
    scrub: 0.8,                // 0.8s catch-up lag. 0.5–1.2 is the tasteful band.
                               // `scrub: true` = 1:1, feels mechanical.
    invalidateOnRefresh: true,
  },
})
```

`scrub` accepts a number = seconds of smoothing. **Use a number, not `true`.** `true` locks the value to scroll position with zero inertia and looks cheap next to Lenis's own easing.

### 2.3 The FBO / GPGPU alternative (for the optional mouse-repulsion layer)

Verified verbatim from `DGFX/codrops-dreamy-particles` (Codrops, 2024-12-19), using three's `GPUComputationRenderer`. Two variables ping-ponged: position and velocity.

`simFragment.glsl` — integrate position:
```glsl
void main() {
    vec2 vUv = gl_FragCoord.xy / resolution.xy;
    vec3 position = texture2D( uCurrentPosition, vUv ).xyz;
    vec3 velocity = texture2D( uCurrentVelocity, vUv ).xyz;
    position += velocity;
    gl_FragColor = vec4( position, 1.);
}
```

`simFragmentVelocity.glsl` — damped spring back to rest pose + mouse push:
```glsl
uniform sampler2D uOriginalPosition;
uniform vec3 uMouse;
uniform float uMouseSpeed;

void main() {
    vec2 vUv = gl_FragCoord.xy / resolution.xy;
    vec3 position = texture2D( uCurrentPosition, vUv ).xyz;
    vec3 original = texture2D( uOriginalPosition, vUv ).xyz;
    vec3 velocity = texture2D( uCurrentVelocity, vUv ).xyz;

    velocity *= 0.7;                                  // damping — 0.7 is snappy, 0.94 is floaty
    vec3 direction = normalize( original - position );
    float dist = length( original - position );
    if( dist > 0.001 ) velocity += direction * 0.0003;  // spring constant

    float mouseDistance = distance( position, uMouse );
    float maxDistance = 0.1;
    if( mouseDistance < maxDistance ) {
        vec3 pushDirection = normalize( position - uMouse );
        velocity += pushDirection * ( 1.0 - mouseDistance / maxDistance ) * 0.0023 * uMouseSpeed;
    }
    gl_FragColor = vec4(velocity, 1.);
}
```

Render-pass vertex shader — note the mesh's own `uv` attribute is used purely as the *lookup coordinate into the position texture*. This is the whole trick of FBO particles:
```glsl
varying vec2 vUv;
varying vec3 vPosition;
uniform float uParticleSize;
uniform sampler2D uPositionTexture;

void main() {
    vUv = uv;
    vec3 newpos = position;
    vec4 color = texture2D( uPositionTexture, vUv );
    newpos.xyz = color.xyz;                 // position comes entirely from the FBO
    vPosition = newpos;
    vec4 mvPosition = modelViewMatrix * vec4( newpos, 1.0 );
    gl_PointSize = ( uParticleSize / -mvPosition.z );
    gl_Position = projectionMatrix * mvPosition;
}
```

Fragment — velocity-driven alpha, so fast particles glow:
```glsl
varying vec2 vUv;
uniform sampler2D uVelocityTexture;

void main() {
    float center = length(gl_PointCoord - 0.5);
    vec3 velocity = texture2D( uVelocityTexture, vUv ).xyz * 100.0;
    float velocityAlpha = clamp(length(velocity.r), 0.04, 0.8);
    if (center > 0.5) { discard; }
    gl_FragColor = vec4(0.808, 0.647, 0.239, velocityAlpha);
}
```

**Setup boilerplate:**
```ts
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer.js'

const SIZE = 512                                  // 512² = 262,144 particles
const gpgpu = new GPUComputationRenderer(SIZE, SIZE, renderer)

const dtPosition = gpgpu.createTexture()
const dtVelocity = gpgpu.createTexture()
fillPositionTexture(dtPosition)                    // write xyz into .data as Float32
fillVelocityTexture(dtVelocity)

const posVar = gpgpu.addVariable('uCurrentPosition', simFragment, dtPosition)
const velVar = gpgpu.addVariable('uCurrentVelocity', simFragmentVelocity, dtVelocity)
gpgpu.setVariableDependencies(posVar, [posVar, velVar])
gpgpu.setVariableDependencies(velVar, [posVar, velVar])
velVar.material.uniforms.uOriginalPosition = { value: dtPosition }
velVar.material.uniforms.uMouse = { value: new THREE.Vector3() }
velVar.material.uniforms.uMouseSpeed = { value: 0 }

// IMPORTANT: NearestFilter or your simulation smears across neighbouring particles
posVar.wrapS = posVar.wrapT = THREE.ClampToEdgeWrapping
velVar.wrapS = velVar.wrapT = THREE.ClampToEdgeWrapping

const err = gpgpu.init()
if (err !== null) console.error(err)

// per frame:
gpgpu.compute()
renderMat.uniforms.uPositionTexture.value = gpgpu.getCurrentRenderTarget(posVar).texture
renderMat.uniforms.uVelocityTexture.value = gpgpu.getCurrentRenderTarget(velVar).texture
```

**Cost accounting:** each `gpgpu.compute()` with 2 variables = 2 fullscreen fragment passes at 512×512 = 524,288 fragment invocations/frame. That's cheap in isolation but it is *in addition to* your main render. On mobile this is the first thing to cut.

Use `epranka/gpucomputationrender-three` (MIT) rather than importing from `three/examples` if you want a clean, versioned dependency.

### 2.4 Sampling text and images into a point cloud

**Path A — text/image via canvas `getImageData`** (verified from `brunoimbrizi/interactive-particles`):

```ts
/**
 * Rasterise a string to an offscreen canvas, then convert every pixel above
 * a luminance threshold into a particle position.
 * Returns a Float32Array of length n*3, and the count actually produced.
 */
function sampleTextToPoints(opts: {
  text: string
  fontCss: string        // e.g. '900 340px "Neue Haas Grotesk", sans-serif'
  width: number          // sampling resolution — NOT display resolution
  height: number
  threshold?: number     // 0..255, default 34
  targetCount: number    // desired particle count
}) {
  const { text, fontCss, width, height, threshold = 34, targetCount } = opts

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!

  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, width, height)
  ctx.fillStyle = '#fff'
  ctx.font = fontCss
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, width / 2, height / 2)

  const data = ctx.getImageData(0, 0, width, height).data

  // Pass 1: collect all candidate pixels
  const candidates: number[] = []
  for (let i = 0; i < width * height; i++) {
    if (data[i * 4] > threshold) candidates.push(i)
  }

  // Pass 2: resample to exactly targetCount.
  // If we have fewer candidates than particles, we reuse pixels but jitter
  // sub-pixel so they don't stack on top of each other.
  const positions = new Float32Array(targetCount * 3)
  const aspect = width / height
  const SCALE = 14 // world units across

  for (let j = 0; j < targetCount; j++) {
    const idx = candidates[(Math.random() * candidates.length) | 0]
    const px = idx % width
    const py = Math.floor(idx / width)

    // jitter within the pixel cell, then normalise to [-0.5, 0.5]
    const nx = (px + Math.random()) / width  - 0.5
    const ny = 0.5 - (py + Math.random()) / height   // flip Y: canvas is top-down

    positions[j * 3 + 0] = nx * SCALE * aspect
    positions[j * 3 + 1] = ny * SCALE
    positions[j * 3 + 2] = (Math.random() - 0.5) * 0.25 // thin slab, not a plane
  }
  return { positions, candidateCount: candidates.length }
}
```

**Critical practical notes, learned the hard way:**

1. **`willReadFrequently: true`** on `getContext('2d')` or Chrome will keep the canvas GPU-backed and every `getImageData` becomes a synchronous GPU→CPU readback stall (~15–40 ms).
2. **Wait for the font.** `await document.fonts.load('900 340px "Your Font"')` then `await document.fonts.ready` *before* rasterising, or you'll silently sample the fallback face.
3. **Sampling resolution ≠ display resolution.** 1024×512 is plenty for 250k particles — you only need enough candidate pixels that random sampling doesn't visibly repeat. Rule of thumb: `candidateCount >= targetCount / 4`.
4. **Do it in a Web Worker with `OffscreenCanvas`** so the main thread never stalls:
   ```ts
   const off = new OffscreenCanvas(1024, 512)
   // ...same code... then postMessage(positions, [positions.buffer])  // transferable
   ```
5. **Precompute at build time for production.** Rasterising 4 formations × 262k particles is ~120 ms of main-thread work. Better: run the sampler once locally, dump the `Float32Array` to a binary file, and `fetch` + `new Float32Array(await res.arrayBuffer())` at runtime. 262,144 × 3 × 4 bytes = **3.1 MB per formation**, which compresses to roughly 1.1–1.6 MB with brotli (float noise compresses badly). Consider quantising to `Int16` (`+/-32767` mapped to world bounds) → **1.57 MB raw**, and expand in the vertex shader. `THREE.BufferAttribute` supports `normalized: true` on `Int16Array` natively:
   ```ts
   geo.setAttribute('aPos1', new THREE.Int16BufferAttribute(int16data, 3, true))
   // shader receives values in [-1, 1]; multiply by uBounds
   ```

**Path B — sample a 3D mesh** (for a logo/object formation). Use `MeshSurfaceSampler` from three's examples:
```ts
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js'
const sampler = new MeshSurfaceSampler(mesh).build()
const p = new THREE.Vector3()
for (let i = 0; i < COUNT; i++) { sampler.sample(p); positions.set([p.x,p.y,p.z], i*3) }
```

**Path C — the lattice formation.** Pure math, no sampling:
```ts
// Structured lattice with controlled jitter — reads as "engineered" vs the noise cloud
const n = Math.cbrt(COUNT) | 0
let k = 0
for (let x = 0; x < n; x++)
  for (let y = 0; y < n; y++)
    for (let z = 0; z < n && k < COUNT; z++, k++) {
      positions[k*3+0] = (x/(n-1) - 0.5) * 16 + (Math.random()-0.5) * 0.06
      positions[k*3+1] = (y/(n-1) - 0.5) * 16 + (Math.random()-0.5) * 0.06
      positions[k*3+2] = (z/(n-1) - 0.5) * 16 + (Math.random()-0.5) * 0.06
    }
```

**IMPORTANT — index correspondence.** All formation buffers must be indexed *consistently*: particle `i` in formation 0 must be the same particle as `i` in formation 1. If you sample each formation independently with `Math.random()`, particles will cross the screen chaotically during morph. To get coherent, beautiful morphs, **sort each formation by a shared key** — e.g. sort every formation's points by `atan2(y, x)` (angular) or by Hilbert-curve index. Then particle `i` travels the shortest, most legible path. This one detail is the difference between "nice" and "how did they do that."

### 2.5 Curl noise — the actual GLSL

Curl noise gives divergence-free flow (`div(∇ × A) = 0`), which is why it looks like fluid rather than like random drift: particles never bunch up or thin out.

**`snoise(vec3)` — Ashima Arts / Ian McEwan, MIT, verified verbatim from `ashima/webgl-noise/src/noise3D.glsl`:**

```glsl
// Description : Array and textureless GLSL 2D/3D/4D simplex noise functions.
//      Author : Ian McEwan, Ashima Arts.
//  Maintainer : stegu
//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
//               Distributed under the MIT License.

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+10.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2  C = vec2(1.0/6.0, 1.0/3.0);
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i);
  vec4 p = permute( permute( permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 0.142857142857;
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;

  vec4 m = max(0.5 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 105.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
```

**`curlNoise(vec3)` — verified verbatim from `cabbibo/glsl-curl-noise/curl.glsl`:**

```glsl
vec3 snoiseVec3( vec3 x ){
  float s  = snoise(vec3( x ));
  float s1 = snoise(vec3( x.y - 19.1 , x.z + 33.4 , x.x + 47.2 ));
  float s2 = snoise(vec3( x.z + 74.2 , x.x - 124.5 , x.y + 99.4 ));
  return vec3( s , s1 , s2 );
}

vec3 curlNoise( vec3 p ){
  const float e = .1;
  vec3 dx = vec3( e   , 0.0 , 0.0 );
  vec3 dy = vec3( 0.0 , e   , 0.0 );
  vec3 dz = vec3( 0.0 , 0.0 , e   );

  vec3 p_x0 = snoiseVec3( p - dx );
  vec3 p_x1 = snoiseVec3( p + dx );
  vec3 p_y0 = snoiseVec3( p - dy );
  vec3 p_y1 = snoiseVec3( p + dy );
  vec3 p_z0 = snoiseVec3( p - dz );
  vec3 p_z1 = snoiseVec3( p + dz );

  float x = p_y1.z - p_y0.z - p_z1.y + p_z0.y;
  float y = p_z1.x - p_z0.x - p_x1.z + p_x0.z;
  float z = p_x1.y - p_x0.y - p_y1.x + p_y0.x;

  const float divisor = 1.0 / ( 2.0 * e );
  return normalize( vec3( x , y , z ) * divisor );
}
```

⚠️ **COST WARNING — read this before shipping.**
`curlNoise` calls `snoiseVec3` **6 times**, and `snoiseVec3` calls `snoise` **3 times**. That is **18 simplex-noise evaluations per particle per frame.** At 262,144 particles × 60 fps that's **283 million snoise evaluations per second.** This *will* melt an integrated GPU.

Three mitigations, in order of preference:

1. **Run curl noise on a coarse 3D grid / low-res texture and sample it.** Bake a 64×64×64 (or 128×128 tiled 2D atlas) RGB curl field once at init, upload as a texture, and in the vertex shader do a single `texture2D`/`texture` fetch. **18 snoise → 1 texture fetch.** ~40× cheaper. Loses fine detail, which nobody perceives on a 2px point.
2. **Use a cheaper `snoiseVec3`.** Replace the 3-call version with a single `snoise` + two cheap rotations, or use a 4-D simplex with analytic derivatives (3 evaluations total instead of 18 — see `stegu/webgl-noise` `psrdnoise`).
3. **Cheapest of all — a "fake curl"** that costs 3 snoise calls and is visually indistinguishable in a drifting particle field:
   ```glsl
   vec3 cheapCurl(vec3 p) {
     float a = snoise(p);
     float b = snoise(p + vec3(31.416, 0.0, 0.0));
     float c = snoise(p + vec3(0.0, 47.853, 0.0));
     // Not truly divergence-free, but the field is smooth and rotational-looking.
     return normalize(vec3(a - c, b - a, c - b));
   }
   ```

**Recommendation: bake the curl field to a texture (option 1).** Do the honest 18-call version offline in a one-time `GPUComputationRenderer` pass at init, write it to an RGBA16F render target, and sample it forever after.

### 2.6 Particle count budget by device

⚠️ These figures are **engineering estimates from the cost model below, not measured benchmarks** — validate on real hardware early. What *is* verified: a 1,048,576-particle (1024²) GPGPU three.js demo is publicly demonstrated and runs (three.js forum showcase, "1M animated GPGPU Particles").

The binding constraint is almost never vertex count — it's **fill rate**. `N particles × avg gl_PointSize² × DPR² fragments per frame`, and with `AdditiveBlending` every one of those fragments is a read-modify-write on the framebuffer.

| Device class | Recommended count | Max `gl_PointSize` | DPR cap | Notes |
|---|---|---|---|---|
| M1/M2/M3 MacBook (integrated) | **250,000–400,000** | 20 px | 2.0 | Apple Silicon has huge memory bandwidth and TBDR. This is the easy target. 500k is reachable if point size ≤ 8px. |
| Desktop with discrete GPU (RTX 3060+) | 500,000–1,000,000 | 32 px | 2.0 | Not the constraint. |
| Mid-range Windows laptop (Intel Iris Xe / UHD) | **80,000–120,000** | 12 px | **1.25** | This is your real ceiling for "most visitors on Windows." Iris Xe has roughly 1/4 the fill rate of an M1. Additive blending on a fullscreen field is brutal here. |
| Mid Android (Snapdragon 7-series, Mali-G) | **25,000–50,000** | 8 px | **1.0** | Also: many mid Android GPUs are slow at `discard` — it breaks early-Z. Consider dropping the `discard` and relying on alpha blending on mobile. |
| iPhone 12–15 | 60,000–100,000 | 10 px | **1.5** | Safari throttles hard on thermals after ~90 s. Plan for degradation, not just a static target. |
| iPhone SE / low-end Android | **Static fallback** — no WebGL | — | — | See §6.5. |

**Implement it as a tier, chosen once at boot:**
```ts
type Tier = 'high' | 'mid' | 'low' | 'off'

function detectTier(): Tier {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return 'off'
  const canvas = document.createElement('canvas')
  const gl = canvas.getContext('webgl2') as WebGL2RenderingContext | null
  if (!gl) return 'off'

  const dbg = gl.getExtension('WEBGL_debug_renderer_info')
  const renderer = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : ''
  const mem = (navigator as any).deviceMemory ?? 8      // Chrome only
  const cores = navigator.hardwareConcurrency ?? 4
  const coarse = matchMedia('(pointer: coarse)').matches

  if (/SwiftShader|llvmpipe|Software/i.test(renderer)) return 'off'  // software GL — always bail
  if (coarse) return mem >= 6 && cores >= 6 ? 'mid' : 'low'
  if (/Apple (M\d|GPU)/.test(renderer)) return 'high'
  if (/RTX|Radeon RX|Arc A/i.test(renderer)) return 'high'
  if (/Iris|UHD Graphics|Vega \d/i.test(renderer)) return 'low'
  return cores >= 8 && mem >= 8 ? 'mid' : 'low'
}

const TIER_CONFIG = {
  high: { count: 262144, dpr: 2.0,  maxPointSize: 20, bloom: true,  gpgpu: true  },
  mid:  { count: 120000, dpr: 1.5,  maxPointSize: 14, bloom: true,  gpgpu: false },
  low:  { count:  45000, dpr: 1.25, maxPointSize: 10, bloom: false, gpgpu: false },
  off:  { count:      0, dpr: 1.0,  maxPointSize:  0, bloom: false, gpgpu: false },
} as const
```

`WEBGL_debug_renderer_info` is being progressively restricted for privacy (Firefox already masks it behind `privacy.resistFingerprinting`). **Always** pair the static tier with the runtime FPS watchdog in §6.3.

### 2.7 Real-world examples to study

| Site | What it does | Verified how |
|---|---|---|
| **igloo.inc** — Awwwards SOTY 2024, by abeto | "Built entirely in WebGL, from procedurally grown ice crystals to shader-driven UI text, with the **particle footer powered by custom VDB-to-browser volume data**." Sampling a volumetric VDB into a point cloud is exactly our §2.4 problem, one tier up. | three.js community writeups |
| **landonorris.com** — Awwwards SOTY 2025, by OFF+BRAND | Webflow + heavy custom WebGL. Palette extracted in §4. | curl'd the CSS bundle |
| **lusion.co** — Awwwards SOTY 2023 | The benchmark for WebGL craft. Now served from Astro (`/_astro/*.css`). | curl'd |
| https://tympanus.net/Tutorials/DreamyParticles | GPGPU position+velocity, mouse repulsion | fetched |
| https://tympanus.net/Tutorials/InteractiveParticles (brunoimbrizi) | Image→point cloud, instanced quads | fetched |
| https://threejs.org/examples/webgl_gpgpu_birds.html | Canonical `GPUComputationRenderer` reference | official |
| **thibaultguignand.com** | Vite + React 18 + TS + GSAP + Lenis + OGL. Literally our stack. | Codrops teardown |

---

## §3 — The signature scroll moves

### 3.0 Foundation: Lenis ↔ GSAP, wired correctly

Verified verbatim from the Lenis README. **This exact 5-line block is the whole integration** — anything more elaborate is wrong:

```js
const lenis = new Lenis()
lenis.on('scroll', ScrollTrigger.update)
gsap.ticker.add((time) => {
  lenis.raf(time * 1000)     // GSAP ticker is in seconds, Lenis wants ms
})
gsap.ticker.lagSmoothing(0)
```

`lagSmoothing(0)` is **mandatory**. Without it, GSAP's default lag smoothing (it "catches up" after a >500 ms frame gap) will fight Lenis's own interpolation and produce a visible jump after any GC pause or tab refocus.

React version, typed, with the three.js render slotted into the same rAF:

```tsx
// src/components/SmoothScrollProvider.tsx
import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.1,                  // default. 0.075 = heavier/filmic, 0.14 = snappier
      duration: 1.2,              // only used for programmatic scrollTo
      smoothWheel: true,
      wheelMultiplier: 1,
      // Lenis auto-disables itself under prefers-reduced-motion. Keep it true.
      respectReducedMotion: true,
      autoRaf: false,             // WE drive the rAF, via gsap.ticker
    })
    lenisRef.current = lenis
    ;(window as any).__lenis = lenis   // handy for the WebGL layer

    lenis.on('scroll', ScrollTrigger.update)
    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  return <>{children}</>
}
```

**Render ordering.** Everything must run in one rAF, in this order, or you get a one-frame lag between DOM and WebGL:
```
gsap.ticker  →  [priority 0] lenis.raf()         (updates scroll position)
             →  [priority 1] ScrollTrigger.update()  (fires all onUpdate → sets uniforms)
             →  [priority 2] renderer.render()   (draws with this frame's uniforms)
```
Add the three.js render as the **last** ticker callback:
```ts
gsap.ticker.add(() => webgl.render(), false, false)   // appended = runs last
```

`lenis.on('scroll', e)` gives you `e.scroll`, `e.limit`, `e.velocity`, `e.direction`, `e.progress`. `velocity` is the one you want for §3.7.

---

### 3.1 Full-page colour INVERSION on scroll (dark → light), jank-free

There are four ways to do this. **Three of them are wrong.** Here is the honest breakdown:

| Approach | Verdict |
|---|---|
| Tween `backgroundColor` on `<body>` + every text element | ❌ N separate style writes per frame, and each one that changes `color` triggers paint on that element's layer. Jank scales with DOM size. |
| `mix-blend-mode: difference` on a white overlay | ⚠️ Genuinely inverts everything for free — but it **inverts your imagery too** (photos go to negative), forces a new stacking context, and `mix-blend-mode` on a large area is a known compositor cost on Windows/Chrome. Use it for a *small* element (a cursor, a fixed logo that must stay legible over both themes), never the whole page. |
| Two full copies of the page, one dark one light, `clip-path` reveal | ⚠️ Perfect visual result, doubles your DOM, kills accessibility (duplicate text for screen readers) and doubles paint. Only viable if the "page" is a single hero. |
| **Tween ONE CSS custom property on `:root`, let CSS do the rest** | ✅ **This is how it's actually done.** |

**The right implementation.** Every colour in the design system is derived from a small set of custom properties. GSAP tweens *those* — 3 style writes per frame total, regardless of how many elements are on screen. Because the properties are on `:root` (a single element), the browser does one style recalculation and one paint of the affected layers; there is no per-element JS work at all.

```css
/* src/styles/theme.css */
:root {
  /* The only animated values. GSAP writes these three. */
  --theme: 0;                                   /* 0 = dark, 1 = light */
  --bg:   #0B0B0C;
  --fg:   #EBEEE0;

  /* Everything else is derived and never touched by JS */
  --bg-elevated: color-mix(in oklab, var(--bg) 92%, var(--fg));
  --fg-muted:    color-mix(in oklab, var(--fg) 55%, var(--bg));
  --hairline:    color-mix(in oklab, var(--fg) 14%, var(--bg));
  --accent:      #D2FF00;

  background-color: var(--bg);
  color: var(--fg);
}

/* Register the property so the browser interpolates it as a COLOR, not a string.
   Without @property, GSAP has to parse and write hex strings itself, which works
   but loses the browser's native, GPU-side colour interpolation. */
@property --bg { syntax: '<color>'; inherits: true; initial-value: #0B0B0C; }
@property --fg { syntax: '<color>'; inherits: true; initial-value: #EBEEE0; }
@property --theme { syntax: '<number>'; inherits: true; initial-value: 0; }

body { background: var(--bg); color: var(--fg); }
.hairline { border-color: var(--hairline); }
```

```ts
// GSAP 3 can tween CSS custom properties directly (supported since 3.x).
// This is 3 property writes per frame for the ENTIRE page inversion.
const root = document.documentElement

gsap.to(root, {
  '--bg': '#F4F4ED',
  '--fg': '#111112',
  '--theme': 1,
  ease: 'none',
  scrollTrigger: {
    trigger: '#inversion-section',
    start: 'top 60%',
    end: 'bottom 40%',
    scrub: 1,
  },
})
```

**Why this doesn't jank:** the mutation is to one element's inline style. Style recalc is O(elements-using-the-var) but *paint* is what costs, and paint only touches the composited layers whose painted pixels changed. Crucially there is **no layout** — colour changes never invalidate geometry. Contrast with tweening 200 elements' `color`: that's 200 style writes + 200 invalidations per frame, all on the main thread.

**Gotchas that will bite you:**

1. **`color-mix()` + `@property` + Safari.** Safari 16.4+ supports both, but `color-mix()` inside a `@property`-registered custom property has had bugs. Test early. Fallback: define `--bg-elevated` etc. as their own registered `<color>` properties and tween them too (still only 6 writes/frame).
2. **`will-change` is a trap here.** Do NOT put `will-change: background-color` on large sections — you'll promote them to their own compositor layers and *increase* memory + paint cost.
3. **The WebGL layer must follow.** Read the same value and push it into a uniform, in the same ScrollTrigger `onUpdate`:
   ```ts
   scrollTrigger: {
     // ...
     onUpdate: (self) => {
       // don't getComputedStyle() every frame — that forces style recalc (layout thrash).
       // Instead derive from progress, which you already have:
       webgl.uniforms.uTheme.value = self.progress
     }
   }
   ```
   Then in the fragment shader: `vec3 col = mix(uColorDark, uColorLight, uTheme);` and, importantly, **flip the blend mode** — additive blending on a light background produces washed-out white mush. Cross-fade between two draw calls, or switch to `THREE.NormalBlending` with a subtractive tint when `uTheme > 0.5`.
4. **`<meta name="theme-color">`** should be updated at the crossover point (not every frame — that's a main-thread commit):
   ```ts
   onToggle: (self) => {
     document.querySelector('meta[name=theme-color]')!
       .setAttribute('content', self.isActive ? '#F4F4ED' : '#0B0B0C')
   }
   ```
5. **Selection colour, scrollbar, and form controls** need `::selection { background: var(--fg); color: var(--bg) }` and `color-scheme: light dark` or they'll flash the wrong theme.

**Where `mix-blend-mode: difference` IS correct:** a fixed logo/nav/cursor that must stay legible as it passes over both themes.
```css
.fixed-nav { mix-blend-mode: difference; color: #fff; isolation: auto; }
```
That element now auto-inverts against whatever's behind it and costs one small composited layer. This is a very common trick on Awwwards sites and it's genuinely the right tool at that scale.

---

### 3.2 Scroll-scrubbed image-sequence playback

The official GSAP helper, verbatim from https://gsap.com/docs/v3/HelperFunctions/helpers/imageSequenceScrub/ :

```javascript
function imageSequence(config) {
  let playhead = {frame: 0},
      ctx = gsap.utils.toArray(config.canvas)[0].getContext("2d"),
      onUpdate = config.onUpdate,
      images,
      updateImage = function() {
        ctx.drawImage(images[Math.round(playhead.frame)], 0, 0);
        onUpdate && onUpdate.call(this);
      };

    images = config.urls.map((url, i) => {
      let img = new Image();
      img.src = url;
      i || (img.onload = updateImage);
      return img;
    });

    return gsap.to(playhead, {
      frame: images.length - 1,
      ease: "none",
      onUpdate: updateImage,
      scrollTrigger: config.scrollTrigger
    });
}

imageSequence({
  urls,
  canvas: "#image-sequence",
  scrollTrigger: { start: 0, end: "max", scrub: true }
});
```

**Production hardening — the helper is a starting point, not shippable:**

```ts
type SeqConfig = {
  canvas: HTMLCanvasElement
  urls: string[]
  scrollTrigger: ScrollTrigger.Vars
  width: number; height: number
}

function imageSequenceHardened(cfg: SeqConfig) {
  const ctx = cfg.canvas.getContext('2d', { alpha: false })!  // alpha:false = faster compositing
  const dpr = Math.min(devicePixelRatio, 2)
  cfg.canvas.width  = cfg.width  * dpr
  cfg.canvas.height = cfg.height * dpr
  ctx.scale(dpr, dpr)

  const images: (ImageBitmap | HTMLImageElement)[] = new Array(cfg.urls.length)
  const playhead = { frame: 0 }
  let last = -1

  const draw = () => {
    const f = Math.round(playhead.frame)
    if (f === last) return                    // <-- skip redundant draws. The helper doesn't.
    const img = images[f]
    if (!img) return                          // frame not loaded yet: keep the previous one
    last = f
    ctx.drawImage(img as CanvasImageSource, 0, 0, cfg.width, cfg.height)
  }

  // Decode off the main thread. createImageBitmap avoids the sync decode stall
  // that `new Image()` + drawImage causes on first paint of each frame.
  const loadFrame = async (i: number) => {
    const res = await fetch(cfg.urls[i])
    const blob = await res.blob()
    images[i] = await createImageBitmap(blob)
    if (i === 0) draw()
  }

  // Priority load: first frame, last frame, then every 8th, then fill in.
  const order = [0, cfg.urls.length - 1,
    ...cfg.urls.map((_, i) => i).filter(i => i % 8 === 0),
    ...cfg.urls.map((_, i) => i)]
  const seen = new Set<number>()
  const queue = order.filter(i => !seen.has(i) && seen.add(i))
  // 6 concurrent — matches the browser's per-origin HTTP/1.1 limit
  let inflight = 0
  const pump = () => {
    while (inflight < 6 && queue.length) {
      inflight++
      loadFrame(queue.shift()!).finally(() => { inflight--; pump() })
    }
  }
  pump()

  return gsap.to(playhead, {
    frame: cfg.urls.length - 1,
    ease: 'none',
    snap: 'frame',                            // land on whole frames, never half
    onUpdate: draw,
    scrollTrigger: cfg.scrollTrigger,
  })
}
```

**Asset budget.** This is the part people get wrong.

| Frames | Resolution | Format | Total weight |
|---|---|---|---|
| 120 | 1440×810 | WebP q=72 | ~5–8 MB |
| 240 | 1920×1080 | WebP q=68 | ~18–26 MB |
| 240 | 1920×1080 | AVIF q=50 | ~9–14 MB (but AVIF decode is ~3× slower — risky for scrub) |

**Rule: 24–30 frames per second of "footage", 1440px wide max, WebP.** 120 frames over `end: "+=3000"` gives 25px of scroll per frame, which reads as smooth. Below ~10px/frame it feels like a slideshow.

**When to use a `<video>` instead:** if the sequence is longer than ~200 frames, ship an MP4/WebM and scrub `video.currentTime`. It's dramatically lighter (a 240-frame 1080p sequence is ~20 MB as WebP, ~2 MB as h.264). The catch is that `currentTime` seeking is only frame-accurate on keyframes, so **encode with `-g 1`** (every frame a keyframe), which inflates the file ~4×, or use `requestVideoFrameCallback`. Apple uses image sequences precisely because video scrubbing is unreliable across browsers. **For SOTY quality: use the image sequence.**

---

### 3.3 Pinned horizontal → clean vertical handoff

The critical, non-obvious API is **`containerAnimation`**. It lets you create ScrollTriggers on elements that move *horizontally* inside a pinned section — "a ScrollTrigger inside a ScrollTrigger."

```ts
const track = document.querySelector<HTMLElement>('.h-track')!
const panels = gsap.utils.toArray<HTMLElement>('.h-panel')

// 1) The horizontal "scroll" itself.
const horizontal = gsap.to(panels, {
  xPercent: -100 * (panels.length - 1),
  ease: 'none',                       // MANDATORY. With any other ease, scroll
                                      // position and x position desynchronise
                                      // and containerAnimation math breaks.
  scrollTrigger: {
    trigger: '.h-section',
    pin: true,
    scrub: 1,
    // Scroll distance == the horizontal distance. 1:1 feels right; multiply
    // by 0.8 for faster, 1.4 for a slower, more cinematic pan.
    end: () => '+=' + (track.scrollWidth - window.innerWidth),
    invalidateOnRefresh: true,        // recompute end on resize
    anticipatePin: 1,                 // eliminates the 1-frame flash on fast scroll
  },
})

// 2) Animations driven by HORIZONTAL position, via containerAnimation.
panels.forEach((panel) => {
  gsap.from(panel.querySelectorAll('.panel-line'), {
    yPercent: 110,
    stagger: 0.06,
    ease: 'power3.out',
    duration: 0.9,
    scrollTrigger: {
      trigger: panel,
      containerAnimation: horizontal,   // <-- the whole trick
      start: 'left 78%',                // note: LEFT/RIGHT, not top/bottom
      toggleActions: 'play none none reverse',
    },
  })
})
```

**The handoff.** Three rules to make it not feel like two glued-together sections:

1. **Overshoot the pin end.** Add `+= window.innerHeight * 0.5` to `end` so the last horizontal panel finishes and *holds* for half a viewport before unpinning. Without this the vertical section yanks up the instant the last panel lands.
2. **Cross-fade the boundary.** Run the incoming vertical section's entrance on a ScrollTrigger that *starts before the pin releases*:
   ```ts
   gsap.from('.next-vertical-section', {
     yPercent: 8, opacity: 0, ease: 'none',
     scrollTrigger: {
       trigger: '.h-section',
       start: 'bottom bottom+=40%',   // begins while still pinned
       end: 'bottom top',
       scrub: 1,
     },
   })
   ```
3. **Rotate the particle field's camera** across the boundary so the persistent WebGL layer acknowledges the axis change:
   ```ts
   .to(webgl.camera.rotation, { z: -0.06, ease: 'none' }, 0)   // during horizontal
   .to(webgl.camera.rotation, { z: 0,     ease: 'none' })      // as it hands back
   ```

**Lenis + horizontal:** you do NOT need `orientation: 'horizontal'`. This is fake horizontal — the page still scrolls vertically. Lenis needs no special config.

**Known trap:** `pin: true` wraps your element in a `.pin-spacer` div. Tailwind classes on a parent that assume a direct-child relationship (`.parent > *`) will break. Use `pinSpacing: true` (default) and target children explicitly.

---

### 3.4 Text mask reveals — per line, and per character scrub

**Note:** SplitText is now free in GSAP 3.13+ (all plugins went free/no-charge under Webflow). Use `SplitText`, not a hand-rolled splitter — it handles line re-splitting on resize, which is where hand-rolled versions die.

**Pattern A — per-line mask reveal. `overflow: hidden` + `yPercent`, NOT clip-path.**

Why: `yPercent` on a child inside an `overflow:hidden` parent is a **pure compositor transform** — it runs off the main thread, GPU-only, and never triggers paint. `clip-path: inset()` animates on the main thread and forces a repaint of the clipped element each frame. On a hero with 6 lines of 120px type, the difference is measurable.

```ts
import SplitText from 'gsap/SplitText'
gsap.registerPlugin(SplitText, ScrollTrigger)

const split = new SplitText('.hero-heading', {
  type: 'lines',
  linesClass: 'line',
  // GSAP 3.13+ can auto-wrap each line in a masking div — no manual CSS needed:
  mask: 'lines',
  autoSplit: true,        // re-splits automatically on font load + resize
})

gsap.from(split.lines, {
  yPercent: 110,
  duration: 1.1,
  ease: 'expo.out',       // expo.out is the SOTY house ease for type reveals
  stagger: 0.075,         // 60-90ms is the sweet spot; >120ms reads as slow
  scrollTrigger: { trigger: '.hero-heading', start: 'top 82%', once: true },
})
```

If you're on an older GSAP or want manual control:
```css
.line-wrap { overflow: hidden; display: block; }
.line      { display: block; will-change: transform; }
```
Remove `will-change` in `onComplete` — leaving it on permanently costs a compositor layer per line forever.

**Font-loading race — this WILL break your reveal if you skip it:**
```ts
await document.fonts.ready
ScrollTrigger.refresh()     // line breaks changed → all start/end values are stale
```

**Pattern B — scroll-scrubbed character-by-character opacity** (the "text illuminates as you scroll through it" move).

Two implementations. **Prefer B2.**

*B1 — GSAP stagger with scrub:*
```ts
const split = new SplitText('.manifesto', { type: 'chars,words' })

gsap.from(split.chars, {
  opacity: 0.12,
  ease: 'none',
  stagger: 0.6,                    // spread across the scrub window
  scrollTrigger: {
    trigger: '.manifesto',
    start: 'top 75%',
    end: 'bottom 45%',
    scrub: 0.5,
  },
})
```
Cost: N DOM elements each getting an `opacity` write per frame. At 400 chars that's 400 style writes/frame. Works, but it's the reason some of these sites drop to 45fps on that section.

*B2 — ONE element, a CSS gradient mask, ONE property write per frame. Ship this.*
```css
.manifesto {
  --reveal: 0;                        /* 0 → 1 */
  background: linear-gradient(
    90deg,
    var(--fg) 0%,
    var(--fg) calc(var(--reveal) * 100%),
    color-mix(in oklab, var(--fg) 14%, transparent) calc(var(--reveal) * 100% + 12%),
    color-mix(in oklab, var(--fg) 14%, transparent) 100%
  );
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
@property --reveal { syntax: '<number>'; inherits: false; initial-value: 0; }
```
```ts
gsap.to('.manifesto', {
  '--reveal': 1, ease: 'none',
  scrollTrigger: { trigger: '.manifesto', start: 'top 75%', end: 'bottom 50%', scrub: 0.4 },
})
```
One custom property write per frame, GPU-composited gradient, works on real selectable text, screen-reader clean. For multi-line, do it per line (split by lines, one gradient each) and stagger the `--reveal` targets — still only N-lines writes, not N-chars.

**Pattern C — scramble reveal**, verified from Guignand's portfolio (ScrambleTextPlugin, also free now):
```javascript
gsap.to(lineEl, {
  duration,
  ease: "none",
  scrambleText: { text: lineText, chars: SCRAMBLE_CHARS, revealDelay, speed },
  onStart: () => {
    gsap.to(lineEl, { clipPath: "inset(0 0% 0 0)", duration: 0.6, ease: "power2.out" });
  },
});
```

---

### 3.5 Element-to-element FLIP: list item → full case study

The `Flip` plugin (free) is the correct tool. Verified patterns from `codrops/OneElementScroll` (MIT) and the July 2026 Codrops infinite-gallery article.

**Core moves, verbatim from the Codrops gallery article:**
```javascript
// open
Flip.from(state, { targets: this.preview, duration: 1.2, ease: 'power4.inOut', absolute: true })
// close
Flip.fit(this.preview, wrapper, { duration: 1, ease: 'power3.inOut', absolute: true })
```

`absolute: true` is the load-bearing flag: it temporarily takes the element out of document flow so growing it doesn't shove its siblings around mid-flight.

**Full React 18 + React Router implementation:**

```tsx
// src/transitions/useSharedElement.ts
import { useLayoutEffect, useRef } from 'react'
import { flushSync } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import { Flip } from 'gsap/Flip'
gsap.registerPlugin(Flip)

// Module-scope handoff: survives the unmount/mount boundary between routes.
let pendingState: Flip.FlipState | null = null
let pendingId: string | null = null

export function useOpenProject() {
  const navigate = useNavigate()

  return async (projectId: string, path: string) => {
    const el = document.querySelector<HTMLElement>(`[data-flip-id="${projectId}"]`)
    if (!el || !document.startViewTransition) { /* still fine, Flip handles it */ }

    // 1) CAPTURE the source geometry BEFORE anything changes.
    //    nested:true captures descendants so the inner <img> also interpolates.
    pendingState = Flip.getState(
      [el!, ...el!.querySelectorAll('[data-flip-child]')],
      { props: 'borderRadius,filter,opacity', nested: true, simple: false }
    )
    pendingId = projectId

    // 2) Fade out everything that is NOT the shared element, in parallel with
    //    the route chunk + hero image network fetch. (Guignand's pattern.)
    const others = gsap.utils.toArray<HTMLElement>('[data-transition-fade]')
      .filter(n => !n.contains(el!))

    const fade = gsap.to(others, { opacity: 0, duration: 0.3, ease: 'power2.inOut' })
    const chunk = import(`../routes/Project.tsx`)          // vite dynamic import = prefetch
    const img = preloadImage(PROJECTS[projectId].hero)

    await Promise.all([fade.then(), chunk, img])

    // 3) Navigate SYNCHRONOUSLY so the DOM is in its final state before Flip.from.
    flushSync(() => navigate(path))
  }
}

// On the destination route:
export function useLandSharedElement(projectId: string) {
  useLayoutEffect(() => {
    if (!pendingState || pendingId !== projectId) return
    const target = document.querySelector<HTMLElement>(`[data-flip-id="${projectId}"]`)
    if (!target) { pendingState = null; return }

    const tl = Flip.from(pendingState, {
      targets: [target, ...target.querySelectorAll('[data-flip-child]')],
      duration: 1.05,
      ease: 'power4.inOut',
      absolute: true,
      scale: true,                 // scale instead of width/height: transform-only, no layout
      nested: true,
      prune: true,                 // skip elements that didn't actually move
      onEnter: (els) => gsap.fromTo(els, { opacity: 0 }, { opacity: 1, duration: 0.45 }),
      onLeave: (els) => gsap.to(els, { opacity: 0, duration: 0.3 }),
    })

    // Bring the rest of the destination page in behind the flying element
    gsap.from('[data-transition-fade]', {
      opacity: 0, duration: 0.5, delay: 0.25, ease: 'power2.out',
    })

    pendingState = null; pendingId = null
    return () => { tl.kill() }
  }, [projectId])
}
```

**Non-obvious rules:**
- `scale: true` makes Flip animate with `scaleX/scaleY` instead of `width/height`. Transform-only = compositor-only = no layout per frame. **Always use it** unless you have text inside that must not squash (then use `absolute: true` + a counter-scaled inner wrapper).
- **Pause Lenis during the flight**, or the user can scroll the destination out from under the animating element:
  ```ts
  lenis.stop(); tl.eventCallback('onComplete', () => lenis.start())
  ```
- **`ScrollTrigger.refresh()` after landing** — the destination page's triggers were measured against a mid-flight layout.
- The scroll position must be reset to 0 *before* `Flip.getState` on the destination, or the captured geometry is off by `scrollY`. Use `lenis.scrollTo(0, { immediate: true })` inside the `flushSync`.

**Simpler alternative:** the native View Transition API (`document.startViewTransition` + `view-transition-name`) does shared-element transitions with zero JS geometry math. Guignand's portfolio uses it *in combination* with GSAP. Chrome/Edge/Safari 18+ have it; Firefox landed it recently. Use it as the fast path and Flip as the universal fallback:
```ts
const run = () => flushSync(() => navigate(path))
document.startViewTransition ? document.startViewTransition(run) : run()
```

---

### 3.6 Sticky-stacked cards

**Do it in CSS. Not GSAP.** `position: sticky` is compositor-driven and free; a pinned ScrollTrigger per card is N pin-spacers and N main-thread updates.

```html
<section class="stack">
  <article class="stack-card" style="--i:0"> … </article>
  <article class="stack-card" style="--i:1"> … </article>
  <article class="stack-card" style="--i:2"> … </article>
  <article class="stack-card" style="--i:3"> … </article>
</section>
```
```css
.stack { --card-h: 78vh; --peek: 22px; }

.stack-card {
  position: sticky;
  /* Each card sticks 22px lower than the previous → visible stacked edges */
  top: calc(12vh + var(--i) * var(--peek));
  height: var(--card-h);
  border-radius: 20px;
  transform-origin: 50% 0%;
  background: var(--bg-elevated);
  border: 1px solid var(--hairline);
  /* Give the stack room to actually scroll through */
  margin-bottom: 8vh;
}
```

Then add **one** GSAP layer on top for the scale-down-as-it-goes-under effect. One ScrollTrigger per card, but each only writes `scale` and `filter` — transform + filter are compositor properties:

```ts
gsap.utils.toArray<HTMLElement>('.stack-card').forEach((card, i, arr) => {
  if (i === arr.length - 1) return       // last card never gets covered
  gsap.to(card, {
    scale: 0.92,
    filter: 'brightness(0.62)',
    ease: 'none',
    scrollTrigger: {
      trigger: arr[i + 1],               // driven by the NEXT card's arrival
      start: 'top bottom',
      end: 'top top',
      scrub: true,
    },
  })
})
```

`brightness()` is cheap (per-pixel, GPU). Do **not** use `blur()` here — a blurred 78vh card is a genuine framerate killer on Windows/Chrome, costing 5–12 ms/frame at 1440p.

---

### 3.7 Scroll-velocity → skew / shader distortion

**DOM version.** The canonical GreenSock pattern (from https://codepen.io/GreenSock/pen/eYpGLYL), adapted for Lenis:

```ts
const skewSetter = gsap.quickSetter('.skewable', 'skewY', 'deg')
const clamp = gsap.utils.clamp(-14, 14)

let velocity = 0
lenis.on('scroll', ({ velocity: v }: { velocity: number }) => { velocity = v })

// Decay in the ticker, NOT in the scroll handler — scroll events stop firing
// the instant the user lifts their finger, so the skew would freeze mid-shear.
gsap.ticker.add(() => {
  const target = clamp(velocity * 0.35)
  // exponential smoothing toward target, then toward 0
  skewSetter(target)
  velocity *= 0.9              // ~0.9 gives a ~180ms settle at 60fps
})
```

`quickSetter` bypasses GSAP's whole tween pipeline — it's a direct, pre-resolved style write. At 60 Hz over many elements this matters.

**Shader version — the real move.** Push Lenis velocity into a uniform, smoothed, and let the GPU do everything:

```ts
// src/webgl/scrollVelocity.ts
const state = { raw: 0, smooth: 0, normalized: 0 }

lenis.on('scroll', (e: { velocity: number }) => { state.raw = e.velocity })

gsap.ticker.add(() => {
  // critically-damped-ish smoothing. 0.12 = responsive, 0.05 = syrupy
  state.smooth += (state.raw - state.smooth) * 0.12
  state.raw *= 0.92                       // decay so it returns to 0 on scroll stop

  // Normalise: Lenis velocity is roughly px/frame. Divide by ~40 to land in -3..3
  state.normalized = gsap.utils.clamp(-3, 3, state.smooth / 40)

  webgl.uniforms.uScrollVel.value = state.normalized
  webgl.uniforms.uScrollAbs.value = Math.abs(state.normalized)
})
```

**Fragment shader — velocity-driven RGB split + vertical smear.** This is the effect people screenshot:

```glsl
uniform sampler2D tScene;
uniform float uScrollVel;   // signed, -3..3
uniform vec2  uResolution;
varying vec2  vUv;

void main() {
  float v = uScrollVel;
  float a = abs(v);

  // 1) Barrel/pinch: pull UVs toward centre proportional to speed
  vec2 c = vUv - 0.5;
  float r2 = dot(c, c);
  vec2 uv = vUv + c * r2 * a * 0.045;

  // 2) Directional smear: 6 taps along the scroll axis, weighted
  vec3 col = vec3(0.0);
  float total = 0.0;
  for (int i = 0; i < 6; i++) {
    float fi = float(i) / 5.0;
    float w  = 1.0 - fi;
    vec2 off = vec2(0.0, -v * 0.012 * fi);
    col   += texture2D(tScene, uv + off).rgb * w;
    total += w;
  }
  col /= total;

  // 3) Chromatic aberration, scaled by speed AND by distance from centre
  //    (real lenses aberrate at the edges, not the middle — this is what makes
  //     it read as "lens" instead of "cheap glitch")
  float ca = a * 0.004 * (0.25 + r2 * 3.0);
  col.r = texture2D(tScene, uv + vec2(ca, 0.0)).r;
  col.b = texture2D(tScene, uv - vec2(ca, 0.0)).b;

  gl_FragColor = vec4(col, 1.0);
}
```

**Guignand's flowmap variant** (verbatim from the Codrops article) — for *cursor* velocity rather than scroll, driving directional aberration on text:
```glsl
vec2 toMouse = vUv - uMouse;
float influence = smoothstep(uRadius, 0.0, length(toMouse)) * uVelo;
vec2 offset = normalize(toMouse) * influence * uChromaticIntensity;

float r = texture2D(tWater, baseUV - offset * 1.5).r;
float g = texture2D(tWater, baseUV + offset * 0.5).g;
float b = texture2D(tWater, baseUV + offset * 1.8).b;

if (uVelo > 0.01) {
    float hueShift = uTime * 0.01 + length(toMouse) * 2.0;
    r = mix(r, sin(hueShift) * 0.5 + 0.5, uVelo * uColorShift);
    g = mix(g, sin(hueShift + 2.094) * 0.5 + 0.5, uVelo * uColorShift);  // +120°
    b = mix(b, sin(hueShift + 4.188) * 0.5 + 0.5, uVelo * uColorShift);  // +240°
}
```
The `2.094` / `4.188` are 2π/3 and 4π/3 — 120° phase offsets producing a rainbow from three sines. Cheap, effective, no HSV conversion.

**Taste note:** velocity distortion should be *barely perceptible* at normal scroll speed and only obvious on a flick. If it's visible while reading, it's too strong. Target: `abs(uScrollVel) < 0.4` during comfortable reading, and clamp hard at 3.

---

## §4 — Colour and art direction: what the real winners use

All hex values below were **extracted by curl'ing the live sites and their CSS bundles on 2026-08-09** and counting occurrences. These are the actual shipped values, not eyedropper guesses.

### 4.1 Verified palettes

**① Lando Norris — Awwwards Site of the Year 2025, by OFF+BRAND**
Source: `cdn.prod.website-files.com/.../lando-offbrand.shared.*.css`
```
#111112  near-black ground (NOT #000 — note the +1 on blue: a whisper of cool)
#282C20  warm-dark olive — the secondary ground
#EBEEE0  bone / paper white (the dominant surface)
#F4F4ED  lighter paper
#DDE1D2  · #C8CBBD  · #B9BBAD  · #B4B8A5   olive-grey ramp (4 stops!)
#535450  · #3B3C38   mid/dark neutrals, all green-biased
#D2FF00  ACID LIME — the single loud accent
#B2C73A  muted lime (the accent, desaturated, for large areas)
#FF6B00  · #FF4C24   orange secondary accents
```
**The lesson.** Nine of the thirteen colours are *desaturated olive-greys*. There is exactly ONE saturated colour (`#D2FF00`), and it's used on maybe 3% of pixels. The neutrals are **not grey** — every single one is biased toward yellow-green. `#EBEEE0` vs `#EEEEEE`: that 14-point drop in blue is what makes it read as *paper* instead of *UI*.

**② Exo Ape**
```
#0D0E13  blue-black ground
#070707  true near-black (used for the deepest layer only)
#E4E0DB  warm off-white
#E0CCBB  MILK/SAND — a genuinely warm, low-sat tan
#F8F8F8  cool white
#E0030A  a single red
```
Two-temperature system: a cool ground (`#0D0E13`) against warm content (`#E0CCBB`). That temperature *tension* is 80% of why it looks expensive.

**③ Noomo Agency — Awwwards SOTY 2023 nominee**
```
#181520  aubergine-black ground (violet-biased, but at 8% saturation)
#231B35  elevated surface
#DEE7F1  · #DBE0EF  · #DAE2F2   cool blue-whites
#C9D2E7  · #C3C4D2   blue-grey ramp
#A5A5AE  · #7E7F8F  · #6D6D76   neutral ramp
```
This is the "violet dark" done *right*: `#181520` has a violet cast at **very low saturation**, and it's paired with cool blue-whites rather than neon. Compare to the AI-startup failure mode (§4.3).

**④ Lusion — Awwwards SOTY 2023**
```
#121416  · #000000     ground
#2B2E3A  · #34393F     elevated
#F0F1FA  · #E4E6EF     off-whites
#0016EC  · #071BDF  · #1A2FFB    ELECTRIC BLUE ramp (3 stops of near-pure blue)
#C1FF00  acid lime
#FF4C41  · #E90000     red
#8832F7  violet
```
Lusion uses **saturated primaries at full strength** — but only as *objects in a 3D scene*, never as UI chrome. The page furniture is `#121416` and `#F0F1FA`.

**⑤ Don't Board Me — Awwwards SOTY 2024 (runner-up)**
```
#A7A238  olive-gold  (most-used colour on the site — 120 occurrences)
#E33529  vermillion
#FFF500  chrome yellow
#854720  burnt sienna
#F3F3E9  · #FCFCF7  · #EDE2E2   warm papers
#2B6786  slate blue (the only cool colour)
```
A **fully saturated, mid-value** palette with no blacks and no pure whites. Zero "tech" signifiers. This is the anti-dark-mode direction and it won.

**⑥ The Other Side of Truth — Awwwards SOTY 2022**
```
#202020  · #131313    ground
#DA1111  blood red
#F6E54E  acid yellow
#77AFD8  pale sky blue
```
Four colours. That's the whole site. **Constraint is the art direction.**

**⑦ Uncommon Studio**
```
#121212  — and essentially nothing else in the HTML
```
Single-colour dark ground; all differentiation comes from typography, imagery, and motion. Note it's `#121212` (Material's dark surface) not `#000` — see §4.2.

**⑧ Minh Pham**
```
#0D0D0D  ground
#B7AB98  warm taupe (the only accent — a *neutral* used as an accent)
```
Two colours.

**⑨ KPRVERSE — Awwwards SOTY 2022, by Resn**
```
#8CA6FF  periwinkle
#C0FB50  acid lime-green
#E1E1E1 / #4F4F4F  neutrals
```

**⑩ Iventions**
```
#101417 · #141414 · #1E1E1E   dark grounds
#DDD9FF  pale lavender      #D1F3F5  pale aqua
#FFDDC4  pale peach         #F7FFDC  pale citron
#9C93E8  periwinkle         #608FF3  cornflower
#546162  slate              #F3EFEB  warm white
```
A **pastel-on-dark** system. All the accents are ~15–25% saturation *tints*, not neon. This is a very underused direction.

**⑪ Antinomy Studio**
```
#3D065F  deep purple ground   #D90909  red   #E9C1FF  pale lilac
```

### 4.2 How the good ones avoid the "AI startup" look

The generic look is: `#0A0A0F` ground + `#00D9FF` cyan + `#7C3AED` violet + a linear-gradient headline + glassmorphic cards. Here's specifically what the winners do differently, derived from the data above:

1. **Never `#000000`, and never a pure-neutral dark either.**
   Not one SOTY winner uses `#0A0A0F`. They use `#111112`, `#121212`, `#121416`, `#0D0E13`, `#181520`, `#202020`, `#0D0D0D`. Every ground is **11–20 in value** and carries a **1–8 point hue bias**. `#0A0A0F` fails because it's too dark (crushes shadow detail, shows banding on OLED) *and* its bias is toward blue-violet, which is the exact tell.
   → Our ground: **`#0B0B0C`** or **`#111112`**. Bias warm or green, never blue-violet.

2. **One accent. Not a gradient of two.**
   Lando: one lime. Minh Pham: one taupe. Uncommon: none. The AI look uses cyan *and* violet *and* a gradient between them, which reads as "we couldn't decide."

3. **The accent is used on <5% of pixels.**
   `#D2FF00` on landonorris.com appears 5 times in the CSS. `#EBEEE0` appears 10 times. The accent is a *punctuation mark*.

4. **Neutrals are tinted, and there are 4–6 of them.**
   Lando ships a 4-stop olive-grey ramp (`#DDE1D2 → #C8CBBD → #B9BBAD → #B4B8A5`). The AI look uses `gray-50…gray-950` straight out of Tailwind, which are all blue-biased (`#0A0A0A`, `#171717`, `#262626`… actually Tailwind's `neutral` is truly neutral and `slate`/`gray`/`zinc` are blue-biased). **Define your own ramp in `tailwind.config.ts`. Do not ship default Tailwind greys.**
   ```ts
   // tailwind.config.ts — a warm/olive-biased ramp in the Lando spirit
   colors: {
     ink: {
       950: '#0B0B0C', 900: '#111112', 800: '#1A1B18',
       700: '#282C20', 600: '#3B3C38', 500: '#535450',
       400: '#7A7B74', 300: '#B4B8A5', 200: '#C8CBBD',
       100: '#DDE1D2',  50: '#EBEEE0',
     },
     acid: '#D2FF00',
   }
   ```

5. **Saturation lives in the imagery/WebGL, not the chrome.**
   Lusion's `#0016EC` is a 3D object. The page furniture is grey. The AI look puts the saturation in the *background gradient*, which is exactly backwards.

6. **Temperature contrast beats value contrast.**
   Exo Ape: cool ground `#0D0E13` + warm content `#E0CCBB`. This is a cinematography trick (teal-and-orange, but at 10% of the usual intensity). Two neutrals at different temperatures look richer than two neutrals at different values.

7. **Off-whites, never `#FFFFFF`.**
   `#EBEEE0`, `#F0F1FA`, `#E4E0DB`, `#FCFCF7`, `#F3F3E9`. Pure white on a dark site is the single loudest "unfinished" signal.

### 4.3 Grain, bloom, chromatic aberration, film grading — implementation

These four are what turn a correct palette into a *cinematic* one. All belong in **one** post-process fragment shader, not four passes.

**Grain.** The most important one and the cheapest. It kills gradient banding on dark grounds (which is why every dark SOTY site has it) and adds an analog texture that reads as "shot" rather than "rendered."

```glsl
// Animated film grain. Must be ANIMATED — static grain reads as a dirty screen.
float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

vec3 applyGrain(vec3 col, vec2 uv, float time, float amount) {
  // Quantise time to ~24fps so grain doesn't shimmer at 120Hz — this is the
  // difference between "film" and "video noise".
  float t = floor(time * 24.0);
  float n = hash12(uv * uResolution + t * 137.0) - 0.5;

  // Grain is stronger in the MIDTONES and shadows, near-absent in highlights.
  // Real film does this. Uniform grain looks like a CSS overlay.
  float lum = dot(col, vec3(0.2126, 0.7152, 0.0722));
  float weight = 1.0 - smoothstep(0.0, 0.85, lum);
  weight = mix(0.35, 1.0, weight);

  return col + n * amount * weight;
}
// amount: 0.035–0.055 for dark cinematic. Above 0.08 it's a gimmick.
```

**Why the shader beats a PNG overlay:** the classic `background-image: url(noise.png); mix-blend-mode: overlay; opacity: .04` costs a full-viewport composited layer with blending on every frame, and it's static. The shader version costs ~4 ALU ops per pixel inside a pass you're already running.

**If you're not running post-processing**, the SVG version is the next best and is resolution-independent:
```html
<svg class="grain" aria-hidden="true">
  <filter id="grain">
    <feTurbulence type="fractalNoise" baseFrequency="0.82" numOctaves="3" stitchTiles="stitch"/>
    <feColorMatrix type="saturate" values="0"/>
  </filter>
  <rect width="100%" height="100%" filter="url(#grain)"/>
</svg>
```
```css
.grain { position: fixed; inset: 0; pointer-events: none; z-index: 9999;
         opacity: .045; mix-blend-mode: overlay; }
```
⚠️ `feTurbulence` over a full viewport is **expensive to rasterise** (~8–20 ms once). It's fine because it rasterises once and then composites, but never animate `baseFrequency`.

**Bloom.** Use `UnrealBloomPass` or (better) `pmndrs/postprocessing`'s `BloomEffect` with `mipmapBlur`.
```ts
import { EffectComposer, RenderPass, EffectPass, BloomEffect,
         ChromaticAberrationEffect, NoiseEffect, VignetteEffect,
         BlendFunction, KernelSize } from 'postprocessing'

const bloom = new BloomEffect({
  intensity: 0.62,             // 0.4–0.8. Above 1.0 = "video game menu"
  luminanceThreshold: 0.72,    // only genuinely bright pixels bloom
  luminanceSmoothing: 0.32,
  mipmapBlur: true,            // ~3× cheaper than KernelSize.HUGE, better falloff
  radius: 0.72,
})
const ca = new ChromaticAberrationEffect({
  offset: new THREE.Vector2(0.0006, 0.0006),   // 0.0004–0.0012. Subtle.
  radialModulation: true,      // aberration increases toward frame edges — LENS-LIKE
  modulationOffset: 0.18,
})
const vignette = new VignetteEffect({ offset: 0.32, darkness: 0.55 })
const grain = new NoiseEffect({ blendFunction: BlendFunction.OVERLAY, premultiply: true })
grain.blendMode.opacity.value = 0.16

composer.addPass(new RenderPass(scene, camera))
composer.addPass(new EffectPass(camera, bloom, ca, vignette, grain))
// ^ ONE EffectPass = one fullscreen fragment shader for all four. This is the
//   whole reason to use pmndrs/postprocessing over three's EffectComposer.
```

`radialModulation: true` on the chromatic aberration is the single highest-value flag here. Uniform CA across the frame looks like a broken TV; radial CA looks like a lens.

**Film-like colour grading.** Three ops, in this order, in the final fragment shader:

```glsl
// 1) FILMIC TONEMAP — compresses highlights so bloom rolls off instead of clipping.
//    ACES approximation (Krzysztof Narkowicz). This is what makes renders look
//    "graded" instead of "computer-generated".
vec3 acesFilm(vec3 x) {
  const float a = 2.51, b = 0.03, c = 2.43, d = 0.59, e = 0.14;
  return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
}

// 2) LIFT-GAMMA-GAIN — the actual colourist controls.
//    lift  = shadows (add).   gamma = midtones (pow).   gain = highlights (mul).
vec3 lgg(vec3 c, vec3 lift, vec3 gamma, vec3 gain) {
  c = c * gain + lift;
  return pow(max(c, 0.0), 1.0 / max(gamma, 0.001));
}

// 3) SATURATION / film "S-curve" contrast
vec3 satContrast(vec3 c, float sat, float contrast) {
  float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
  c = mix(vec3(l), c, sat);
  return mix(vec3(0.5), c, contrast);
}

void main() {
  vec3 col = texture2D(tScene, vUv).rgb;
  col = acesFilm(col * uExposure);                 // uExposure ~1.05

  // A "cool shadows, warm highlights" grade — the teal/orange split, tastefully.
  col = lgg(col,
            vec3(0.004, 0.008, 0.016),   // lift: lift blues in the shadows
            vec3(1.00,  0.99,  0.97),    // gamma: pull warmth into the mids
            vec3(1.02,  1.00,  0.975));  // gain: warm the highlights

  col = satContrast(col, 0.94, 1.06);    // slightly desaturated, slightly punchy
  col = applyGrain(col, vUv, uTime, 0.042);

  gl_FragColor = vec4(col, 1.0);
}
```

**Also set, in three:**
```ts
renderer.toneMapping = THREE.ACESFilmicToneMapping   // if not doing it manually
renderer.toneMappingExposure = 1.05
renderer.outputColorSpace = THREE.SRGBColorSpace
```

**The `#D2FF00`-on-dark specific note:** an acid lime at full chroma on a near-black ground will **clip and bloom into pure white** under ACES. Either drop the accent's luminance for WebGL use (`#B2C73A` — which is exactly why Lando ships both), or raise `luminanceThreshold` above the accent's luminance so it doesn't bloom at all.

---

## §5 — Preloader and page transitions

### 5.1 The core problem: never show a dead progress bar

The failure mode is: black screen, `0%…100%`, 8 seconds, nothing happens. The fix is **tiered loading** — the preloader only ever waits on the *critical* tier.

```
TIER 0 — blocks first paint (target: < 400ms)
  · fonts (2 faces max, woff2, subset, preload)
  · the CSS
  · the WebGL context + compiled shaders   ← see 5.3

TIER 1 — blocks the preloader exit (target: < 1.8s on 4G)
  · formation buffer #0 and #1 only (not 2 and 3)
  · the hero image / first video poster

TIER 2 — streams in behind the revealed page, invisibly
  · formations #2, #3
  · every other image (below the fold)
  · the image sequence frames
  · route chunks (prefetched on hover/idle)
```

If Tier 1 resolves in under ~600 ms (repeat visit, warm cache), **skip the counter entirely** and play a 500 ms curtain — a preloader that flashes `0 → 100` in 300 ms looks broken. Enforce a minimum *and* maximum display time:

```ts
const MIN_SHOWN = 900   // ms — below this the counter is a distraction
const MAX_WAIT  = 6000  // ms — above this we reveal regardless and stream the rest
```

### 5.2 The counter preloader — full implementation

```tsx
// src/components/Preloader.tsx
import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export function Preloader({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  const num  = useRef<HTMLSpanElement>(null)
  const bar  = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const state = { p: 0 }
      const t0 = performance.now()

      // 1) REAL progress from the asset loader, but we never write it to the DOM
      //    directly — we tween TOWARD it. This is what removes the ugly jumps
      //    from "12% ... 12% ... 89%".
      let realTarget = 0
      loader.onProgress = (loaded, total) => { realTarget = loaded / total }

      // 2) A slow "fake" creep so the number NEVER sits still. Caps at 0.92 so
      //    it can't outrun reality.
      const tick = () => {
        const elapsed = (performance.now() - t0) / 1000
        const fake = Math.min(0.92, 1 - Math.exp(-elapsed * 0.55))  // ease-out asymptote
        const target = Math.max(realTarget, fake)
        state.p += (target - state.p) * 0.06
        const pct = Math.round(state.p * 100)
        num.current!.textContent = String(pct).padStart(3, '0')
        bar.current!.style.transform = `scaleX(${state.p})`
      }
      gsap.ticker.add(tick)

      // 3) Exit
      Promise.all([
        loader.tier1,                                   // real readiness
        new Promise(r => setTimeout(r, MIN_SHOWN)),     // minimum dwell
      ]).then(() => {
        gsap.ticker.remove(tick)
        const tl = gsap.timeline({ onComplete: onDone })
        // snap to 100 with a short, fast tween — never jump instantly
        tl.to(state, {
          p: 1, duration: 0.45, ease: 'power2.inOut',
          onUpdate: () => {
            num.current!.textContent = String(Math.round(state.p * 100)).padStart(3, '0')
            bar.current!.style.transform = `scaleX(${state.p})`
          },
        })
        tl.to([num.current, bar.current], { opacity: 0, duration: 0.25 }, '+=0.1')
        // 4) CURTAIN WIPE — clip-path on the overlay. GPU, no layout.
        tl.to(root.current, {
          clipPath: 'inset(0% 0% 100% 0%)',
          duration: 1.0,
          ease: 'expo.inOut',
        }, '-=0.1')
        tl.set(root.current, { display: 'none' })
      })
    }, root)
    return () => ctx.revert()
  }, [onDone])

  return (
    <div ref={root} className="preloader"
         style={{ clipPath: 'inset(0% 0% 0% 0%)' }}>
      <span ref={num} className="preloader__num">000</span>
      <div ref={bar} className="preloader__bar" />
    </div>
  )
}
```
```css
.preloader {
  position: fixed; inset: 0; z-index: 100;
  background: var(--bg); color: var(--fg);
  display: grid; place-items: end start; padding: 6vmin;
  /* clip-path animation needs no will-change; it's already composited */
}
.preloader__num { font-variant-numeric: tabular-nums; font-size: clamp(4rem, 18vw, 16rem); }
.preloader__bar { position: absolute; left: 0; bottom: 0; height: 2px; width: 100%;
                  background: var(--fg); transform-origin: 0 50%; transform: scaleX(0); }
```

**`font-variant-numeric: tabular-nums` is not optional.** Without it the counter's width jitters on every digit change and it looks amateur. Also `padStart(3,'0')` so `007` and `100` occupy the same space.

**Curtain wipe variants** (all `clip-path` on a fixed overlay — pure compositor):
```
bottom-up:   inset(0% 0% 0% 0%)  →  inset(0% 0% 100% 0%)
top-down:    inset(0% 0% 0% 0%)  →  inset(100% 0% 0% 0%)
centre-open: inset(0% 0% 0% 0%)  →  inset(50% 0% 50% 0%)
circle:      circle(150% at 50% 50%) → circle(0% at 50% 50%)
diagonal:    polygon(0 0,100% 0,100% 100%,0 100%) → polygon(0 0,0 0,0 100%,0 100%)
```
Stagger 3–5 vertical panels with `inset(0 0 100% 0)` and 60 ms offsets for the classic "slat" wipe. `ease: 'expo.inOut'` with `duration: 1.0–1.2` is the SOTY default.

### 5.3 Preloading WebGL specifically — avoiding the shader-compile stall

This is the part almost everyone misses. **Shader compilation and program linking is synchronous and can take 200–900 ms**, and it happens on the *first frame you draw the material*. That's a hitch right after your beautiful curtain wipe.

```ts
// Force compilation DURING the preloader, not after.
// three r152+ has an async version that uses KHR_parallel_shader_compile.
await renderer.compileAsync(scene, camera)      // ← preferred
// fallback: renderer.compile(scene, camera)     // sync, but at least it's early

// Also force the first draw into an offscreen target so any driver-side
// lazy work (texture upload, VAO setup) happens now:
const warm = new THREE.WebGLRenderTarget(4, 4)
renderer.setRenderTarget(warm)
renderer.render(scene, camera)
renderer.setRenderTarget(null)
warm.dispose()
```

**Texture uploads** are the other stall. `renderer.initTexture(tex)` forces the GPU upload immediately rather than on first use. For large textures, use **KTX2/Basis** (`KTX2Loader`) — GPU-native compressed formats upload ~5× faster than a decoded JPEG and use 4–6× less VRAM.

**Loading progress that includes WebGL work.** `THREE.DefaultLoadingManager` only counts files. Build a weighted composite:
```ts
const weights = { fonts: 0.10, buffers: 0.35, textures: 0.30, shaders: 0.25 }
const done    = { fonts: 0, buffers: 0, textures: 0, shaders: 0 }
const progress = () => Object.keys(weights)
  .reduce((s, k) => s + weights[k] * done[k], 0)

THREE.DefaultLoadingManager.onProgress = (_url, loaded, total) => {
  done.textures = loaded / total
}
// shaders: you can't get real progress, so tick it in steps as each material compiles
```

**Parallelise the network with the animation.** Guignand's exact pattern, verbatim:
```javascript
const chunkReady = chunkPreloaders[routeChunk]().catch(() => {});
const imageReady = project?.heroImage ? preloadImage(project.heroImage) : Promise.resolve();

const tl = gsap.timeline();
tl.to([webglBg, gridOverlay, sideTexts, customCursor],
      { opacity: 0, duration: 0.3, ease: "power2.inOut" }, 0)
  .to(contentEl, { opacity: 0, duration: 0.35, ease: "power2.inOut" }, 0.25);

await tl.then();
await Promise.all([chunkReady, imageReady]);

await startPageTransition(() => { flushSync(() => { navigate(path); }); });
```
The fetch starts *before* the exit animation, so the ~550 ms of animation is free network time. Do this everywhere.

**Prefetch on intent:**
```ts
<Link
  to={`/work/${slug}`}
  onPointerEnter={() => { import(`../routes/Project.tsx`); preloadImage(hero) }}
  onFocus={() => import(`../routes/Project.tsx`)}
/>
```
Median hover-to-click is ~250–400 ms. That's usually the entire chunk fetch.

### 5.4 The WebGL layer must survive route changes

Because the canvas is mounted at root and never unmounts, page transitions become **uniform tweens**, not teardowns:

```ts
// On route exit: push the particle field back and desaturate it
gsap.timeline()
  .to(webgl.uniforms.uDepthPush,  { value: 1, duration: 0.5, ease: 'power2.in' }, 0)
  .to(webgl.uniforms.uSaturation, { value: 0.3, duration: 0.5 }, 0)
// On route enter: pull it back and morph to the new page's formation
  .to(webgl.uniforms.uDepthPush,  { value: 0, duration: 0.9, ease: 'power3.out' })
  .to(webgl.uniforms.uProgress,   { value: nextFormation, duration: 1.2, ease: 'power2.inOut' }, '<')
```
The continuity of that one persistent element across every navigation is a large fraction of the "this feels like an app, not a website" impression.

---

## §6 — Performance envelope

### 6.1 The budget

| Metric | Target | Hard fail |
|---|---|---|
| Frame time, desktop | **≤ 8.3 ms** (120 Hz-capable) | > 16.6 ms sustained |
| Frame time, mobile | ≤ 16.6 ms (60 fps) | > 22 ms sustained |
| Main-thread JS per frame | **≤ 2 ms** | > 5 ms |
| GPU per frame (desktop) | ≤ 6 ms | > 13 ms |
| Draw calls | **< 30** (we're a particle site — should be ~6) | > 150 |
| Long tasks after load | **0** | any > 100 ms |
| INP | < 200 ms | > 500 ms |
| LCP | < 2.5 s | > 4 s |
| Total JS (gzip) | < 350 KB | > 600 KB |

**What the real sites actually hit** (honest assessment, not a claim of measurement): SOTY-tier WebGL sites typically run **55–60 fps on M-series Macs and discrete-GPU desktops**, and **35–50 fps on mid-range Windows integrated graphics**. Many of them are genuinely *not* 60 fps on a base Intel laptop — they win on art direction and are given a pass. **Do not aim for that.** Aim to be the site that *is* 60 fps everywhere, because that's the differentiator that's actually hard.

### 6.2 The specific things that keep 300k particles + Lenis + ScrollTrigger at 60

**a) One rAF. Non-negotiable.**
Lenis, GSAP, ScrollTrigger, and three must all be driven from `gsap.ticker`. Three separate `requestAnimationFrame` loops = three separate layout/style flushes per frame and guaranteed one-frame desync between DOM and WebGL.

**b) DPR clamp — the single biggest lever.**
```ts
renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
```
A 3× display renders **2.25× more pixels** than 2× with essentially no perceptible difference. On a fill-rate-bound particle field this is a straight 2.25× GPU saving. For the `low` tier go to **1.25**, and on mobile **1.0**.
Corollary: `gl_PointSize` must be multiplied by the DPR (see §2.2 step 5), otherwise your points physically halve when you clamp.

**c) Never allocate in the frame loop.**
Every `new THREE.Vector3()` inside `onUpdate` is garbage. One GC pause = one dropped frame = visible. Hoist all temporaries to module scope.

**d) `depthWrite: false` + `frustumCulled = false` + a manual `boundingSphere`.**
Computing a bounding sphere over a 262k-vertex buffer takes ~40 ms. three does it lazily on first render. Set it manually.

**e) Batch reads and writes.**
Never call `getBoundingClientRect()` or `getComputedStyle()` inside a scroll handler or ticker — each one forces a synchronous layout. ScrollTrigger already caches all its measurements; if you need element geometry, read it in `ScrollTrigger.refresh()` / `onRefresh`, not `onUpdate`.

**f) `gsap.quickSetter` / `quickTo` for anything written every frame.**
```ts
const setX = gsap.quickTo('.cursor', 'x', { duration: 0.4, ease: 'power3' })
```
`quickTo` reuses one tween instance instead of creating a new one per event.

**g) `will-change` discipline.**
Add it in `onStart`, remove it in `onComplete`. A permanent `will-change: transform` on 40 elements = 40 compositor layers = hundreds of MB of GPU memory on a 4K display, and Chrome will start *evicting* them, which causes the exact stutter you were trying to prevent.

**h) `content-visibility: auto` on off-screen sections.**
```css
.section { content-visibility: auto; contain-intrinsic-size: auto 100vh; }
```
Skips layout and paint for off-screen content entirely. ⚠️ It changes when ScrollTrigger can measure things — call `ScrollTrigger.refresh()` after any section becomes visible, or set `contain-intrinsic-size` accurately so layout doesn't shift.

**i) Cut the post-processing chain to one pass.**
`pmndrs/postprocessing` merges N effects into one fragment shader. three's native `EffectComposer` runs N fullscreen passes = N × (viewport pixels) fragment invocations. At 1440p with DPR 2 that's 14.7M fragments per pass.

**j) Render the particles at reduced resolution and upscale.**
For the `low`/`mid` tiers, render the particle layer into a half-resolution `WebGLRenderTarget` and composite it up. Points are soft and glowing — nobody can tell. **4× fill-rate saving.**

**k) `powerPreference: 'high-performance'`**
```ts
new THREE.WebGLRenderer({
  antialias: false,              // MSAA on a points-only scene is pure waste;
                                 // the points are already soft-edged
  powerPreference: 'high-performance',
  alpha: false,                  // opaque canvas composites faster
  stencil: false,
  depth: true,
})
```
`antialias: false` alone is often a 15–25% GPU win here.

**l) Pause when not visible.**
```ts
document.addEventListener('visibilitychange', () => {
  document.hidden ? gsap.ticker.sleep() : gsap.ticker.wake()
})
new IntersectionObserver(([e]) => { webgl.running = e.isIntersecting })
  .observe(canvas)
```

### 6.3 Runtime watchdog — degrade automatically

Static device detection is unreliable (§2.6). Always back it with a live FPS monitor.

```ts
class PerfGovernor {
  private samples: number[] = []
  private last = performance.now()
  private tier: 0 | 1 | 2 | 3 = 0        // 0 = full, 3 = minimum
  private cooldown = 0

  update(onDowngrade: (t: number) => void, onUpgrade: (t: number) => void) {
    const now = performance.now()
    const dt = now - this.last
    this.last = now
    if (dt > 200) return                  // tab was backgrounded — ignore

    this.samples.push(dt)
    if (this.samples.length < 90) return  // ~1.5s window
    this.samples.shift()
    if (this.cooldown-- > 0) return

    // Use the 90th-percentile frame time, NOT the mean. The mean hides
    // the stutter that users actually perceive.
    const sorted = [...this.samples].sort((a, b) => a - b)
    const p90 = sorted[Math.floor(sorted.length * 0.9)]

    if (p90 > 20 && this.tier < 3) {      // < 50fps at the 90th percentile
      this.tier++
      this.cooldown = 180                 // 3s before reassessing — avoid oscillation
      onDowngrade(this.tier)
    } else if (p90 < 11 && this.tier > 0) {
      this.tier--
      this.cooldown = 300                 // slower to upgrade than to downgrade
      onUpgrade(this.tier)
    }
  }
}
```

**Degradation ladder — apply in this order.** Each step is roughly 1.5–2× cheaper and each is *less visually costly* than the next:
```
tier 0  full:        262k particles, DPR 2.0, bloom + CA + grain, full-res
tier 1  ↓ DPR:       262k, DPR 1.5, bloom + grain (drop CA)
tier 2  ↓ count:     100k, DPR 1.25, grain only, half-res particle target
tier 3  ↓ minimum:   40k,  DPR 1.0,  no post-processing at all
tier 4  static:      dispose the context, swap in a pre-rendered still
```
**Never reduce the particle count by rebuilding buffers at runtime** — that's a 40 ms hitch. Instead, allocate the max once and use `geometry.setDrawRange(0, activeCount)`. Instant, free, and reversible.
```ts
geo.setDrawRange(0, TIER_CONFIG[tier].count)
```
Randomise the buffer order at build time so drawing the first 40k gives a uniformly-distributed subset, not the first corner of the lattice.

`renderer.info` is your live instrument:
```ts
renderer.info.render.calls      // draw calls
renderer.info.render.points     // points submitted
renderer.info.memory.geometries // leaks show up here
renderer.info.programs.length   // shader programs — should be stable, not growing
```

### 6.4 When to drop to a static fallback

Hard bail — do not even create the context:
- `prefers-reduced-motion: reduce` (see 6.5)
- No WebGL2 (`canvas.getContext('webgl2')` returns null)
- Software renderer detected (`SwiftShader`, `llvmpipe`) — this is a VM/CI/locked-down enterprise machine and WebGL will run at 3 fps
- `navigator.deviceMemory < 4` (Chrome only, but a strong signal)
- `webglcontextlost` fires — listen for it and swap to the fallback permanently:
  ```ts
  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault()          // required, or the context never restores
    swapToStaticFallback()
  })
  ```
- The governor reaches tier 4
- Save-Data header: `navigator.connection?.saveData === true`

**The fallback must not be a blank div.** Pre-render each of the 4 formations at 2560×1440 from the actual shader, export as AVIF/WebP (~120–200 KB each), and cross-fade between them on scroll with `opacity`. Visitors on the fallback should get a *legible version of the same idea*, and most will never know.

### 6.5 The reduced-motion contract

**The principle**, articulated well by Cassie Evans and echoed in Guignand's Codrops piece:
> Reduced motion is a **parallel version, not a fallback.**

`prefers-reduced-motion: reduce` is not "no animation." It's "no *vestibular trigger*." The vestibular triggers are: large-area movement, parallax, scaling, spinning, and anything that moves faster than the user's scroll. Opacity, colour, and small (<10px) transforms are **fine** and should be kept — a site with zero transitions feels broken, which is its own accessibility problem.

**The contract, concretely:**

| Feature | Normal | `prefers-reduced-motion: reduce` |
|---|---|---|
| Lenis smooth scroll | on | **off** (Lenis does this itself: `respectReducedMotion: true` is the default) |
| Particle field | 262k, morphing, drifting | **static render of formation 0**, or 20k with zero drift. No scroll coupling. |
| Scroll-scrubbed anything | scrub | **fire at 0.4 opacity→1 on enter, `duration: 0.3`.** No scrubbing — scrub *is* parallax. |
| Colour inversion | scrubbed over 800px | **instant swap at the section boundary** (`toggleActions`, no scrub) |
| Image sequence | scrubbed | **show a single representative frame** |
| Horizontal pin | pinned pan | **unpin; stack the panels vertically** |
| Page transitions | 1.05s Flip | **0.2s cross-fade** |
| Preloader counter | animated count | **static "Loading", fade out** |
| Velocity skew/distortion | on | **off entirely** |
| Sticky cards | sticky + scale | **sticky, no scale** (sticky itself is not a vestibular trigger) |
| Hover effects | on | on (pointer-driven, user-initiated) |

**Implementation — one `gsap.matchMedia()` block, verified pattern from the GSAP docs:**

```ts
const mm = gsap.matchMedia()

mm.add({
  isDesktop: '(min-width: 1024px)',
  isMobile:  '(max-width: 1023px)',
  reduceMotion: '(prefers-reduced-motion: reduce)',
}, (ctx) => {
  const { isDesktop, reduceMotion } = ctx.conditions!

  if (reduceMotion) {
    // Parallel version: everything still reveals, nothing moves far or fast.
    gsap.set('[data-reveal]', { clearProps: 'all' })
    gsap.from('[data-reveal]', {
      opacity: 0, y: 8, duration: 0.3, ease: 'power1.out', stagger: 0.03,
      scrollTrigger: { trigger: '[data-reveal]', start: 'top 90%', once: true },
    })
    webgl.setMode('static')
    return
  }

  // Full version
  gsap.to(uniforms.uProgress, {
    value: 3, ease: 'none',
    scrollTrigger: { trigger: '#track', start: 'top top', end: '+=4000',
                     scrub: 0.8, pin: isDesktop },
  })
  // matchMedia auto-reverts everything created in here when the query stops matching
})
```

`gsap.matchMedia()` automatically reverts every animation and ScrollTrigger created inside the callback when the media query stops matching — including when the user toggles reduced motion mid-session. This is why you use it instead of an `if` statement.

**Also:**
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  .grain { display: none; }   /* animated grain is a flicker trigger */
}
```
And give users a manual toggle — a meaningful share of people who need reduced motion have never found the OS setting. Persist it to `localStorage` and OR it with the media query.

---

## Appendix — Immediate next actions

1. `npm i three lenis gsap` and copy `GPUComputationRenderer` from `epranka/gpucomputationrender-three` (MIT).
2. Read https://tympanus.net/codrops/2026/05/06/from-shader-uniforms-to-clip-path-wipes-how-gsap-drives-my-portfolio/ end to end. It is our stack, shipped.
3. Clone `codrops/OnScrollTypographyAnimations` (MIT) and `codrops/OneElementScroll` (MIT) locally as a reference bench.
4. Build the §3.0 `SmoothScrollProvider` first. Everything hangs off correct Lenis↔GSAP↔three rAF ordering; retrofitting it later is painful.
5. Build the particle system with **50k particles and no post-processing**, prove 120 fps, then scale up. Never start at 300k.
6. Write the §2.4 text sampler as a build-time Node script that emits `Int16Array` binaries. Do not rasterise at runtime in production.
7. Bake the curl-noise field to a texture before you ship — the honest 18-snoise version will not survive contact with an Intel laptop.
8. Set the Tailwind colour ramp from §4.2 rule 4 on day one. Do not ship default Tailwind greys.
