> **Superseded (2026-10-24).** The heart hero was removed and the bottom-edge story band was replaced by a full-screen pinned film. See `inheritance-film.md`.

# Biomech + Inheritance

Two additions to the landing route `/` only, built on the existing scroll spine
(`v2/src/lib/scroll.ts`). Nothing here starts a second rAF loop, adds an npm dependency or
downloads an asset. Every model, texture and sound is procedural.

| Piece | What it is | Where |
|---|---|---|
| **Biomech** | an interactive heart that is half myocardium, half machine, in a swarm of blood and metal | hero, upper right (desktop) / upper centre (phone), behind the name |
| **Inheritance** | a 9-scene shadow-puppet story that plays across the whole page as you scroll | a frameless band on the bottom edge of the viewport |

---

## 1. Palette

The landing page palette, unchanged. Both pieces add no colour of their own.

| Token | Hex | Used for |
|---|---|---|
| ground | `#0C0D0B` | void, cavity interior |
| fg | `#EFEFE7` | human silhouettes, filings, hint text |
| graphite | `#3A3D34` `#5E6159` `#8B8E83` | gunmetal plate, machines, bolts |
| magma 1 | `#3B0F70` | flesh creases, deep shadow |
| magma 2 | `#8C2981` | flesh body, rim light |
| magma 3 | `#DE4968` | flesh highlights, machine eye |
| magma 4 | `#FE9F6D` | coronary glow, key light, copper hoses, the story heart |
| magma 5 | `#FCFDBF` | cursor light, sparks, the hottest point of a beat |

Flesh is *not* anatomical red. It is the magma ramp (`#3B0F70 → #8C2981 → #DE4968`), so the
heart belongs to the site rather than to a medical textbook.

## 2. The heart (Biomech)

### 2.1 Form

An anatomical heart, not the symbol. The flesh is a smooth union (`smin`, k = 0.22) of five
ellipsoid SDFs in heart space (y up, +x = viewer's right = the patient's left, +z = toward the
viewer):

| Chamber | Centre | Radii | Tilt (z) |
|---|---|---|---|
| left ventricle (tapered to the apex) | (0.15, −0.22, −0.05) | (0.56, 0.86, 0.56) | +25° |
| right ventricle | (−0.22, −0.12, 0.26) | (0.55, 0.70, 0.42) | +30° |
| left atrium | (0.26, 0.55, −0.30) | (0.42, 0.32, 0.38) | 0 |
| right atrium | (−0.52, 0.40, 0.00) | (0.36, 0.42, 0.38) | 0 |
| base / fat pad | (−0.05, 0.38, 0.10) | (0.50, 0.26, 0.40) | 0 |

To mesh it, take a subdivided icosphere (detail 6 on desktop: 41k vertices and 82k triangles;
detail 5 on a phone). March each vertex outward from the centre to its first SDF sign change,
then bisect. Add 3-octave fbm muscle relief (amplitude 0.012) and recompute the normals.

**Coronary arteries** are real geometry. Random walks on the surface, starting from the aortic
root, are projected onto the SDF and branch with decreasing radius (0.022 down to 0.006). They
are drawn as tubes of 6 radial segments, about 14k triangles in total.

### 2.2 Machine grafts

Every graft is its own mesh, so a raycast can tell which part was hit.

| Part | Build | Triangles |
|---|---|---|
| **Armour plate** | not a separate mesh: a hexagonal region of the flesh mesh. The vertex shader lifts it 0.035, and the fragment shader turns it gunmetal, with metalness 1, roughness 0.38 and panel lines | (shared) |
| **Rivets** | 22 instanced domed heads round the hex border | 22 × 96 |
| **Staples** | 26 instanced bent wires bridging the flesh/metal seam | 26 × 60 |
| **Porthole** | a disc discarded in the plate, a torus bezel with 8 bolts, a cup behind it and a warm inner glow | 2.4k |
| **Gears** | 3 extruded spur gears meshing in the porthole (16 / 10 / 7 teeth, speeds in tooth ratio) | 3k |
| **Aorta** | a tube along an arch: flesh for the first 40%, ribbed copper after it, with 3 clamps and a flange | 4k |
| **Pulmonary trunk** | the same treatment, curving up and left, then branching | 3k |
| **Vena cava** | a short flesh-to-copper stub on the right atrium | 1.5k |
| **Pistons ×2** | barrel, rod and two clevis brackets, between each atrium and the plate | 2 × 900 |
| **Valve** | a body, a handwheel (torus + 4 spokes) and a nozzle on top; it vents steam | 1.6k |
| **Loose bolt** | the easter-egg tell: a hex-head bolt on the plate, one turn out | 300 |

Flesh, grafts and arteries come to about 100k triangles on desktop and 40k on a phone.

### 2.3 Materials

One `MeshPhysicalMaterial` for the flesh, extended with `onBeforeCompile`:

- **Flesh**: base colour along the magma ramp from cavity depth and fbm marbling; roughness
  0.42 and clearcoat 0.85 (wet); sheen 0.6 tinted `#DE4968`; fresnel rim `#8C2981`.
- **Capillaries**: domain-warped ridged noise (`1 − |n|`, thresholded) in the emissive channel,
  `#FE9F6D`. Intensity 0.15 at rest and 1.4 at the systolic peak, flaring to 3 on a click.
- **Plate**: colour `#3A3D34`→`#5E6159`, metalness 1, roughness 0.38, with engraved panel lines
  (dark, rough) and edge wear (bright, polished).
- **Grease**: vertical streaks (noise stretched 8:1 in y, sliding down at 0.04 units/s),
  strongest just under the seam. Colour `#0C0D0B`, roughness 0.04, clearcoat 1. It reads as
  black oil over flesh and metal alike.

### 2.4 Lighting

- `RoomEnvironment` through PMREM at envMapIntensity 0.45, for metal reflections.
- A warm key `#FE9F6D` (2.2) from the upper left and a magenta rim `#8C2981` (3.0) from behind
  on the right.
- A **cursor light** `#FCFDBF`: a point light that rides 0.6 units in front of the surface,
  under the pointer. It slides wet highlights and metal glints across the heart wherever you
  move.

ACES filmic tone mapping, sRGB output, alpha canvas so the site's field shows through.

### 2.5 The cardiac clock

One clock drives everything. `phase ∈ [0,1)` advances at `bpm / 60` per second.

```
atrial kick   A(φ) = pulse(φ, 0.06, 0.05)        // pistons
ventricular   V(φ) = pulse(φ, 0.20, 0.09) + 0.35·pulse(φ, 0.36, 0.07)   // lub … dub
pulse(x, c, w) = exp(−((x − c) / w)²)
```

- **Displacement** along the normal: `−0.05·V·wV − 0.03·A·wA`. `wV` weights the ventricles
  (low y) and `wA` the atria (high y). The plate gets a 0.25× weight because it is rigid.
- **Wring**: a twist of 0.06·V rad about the long axis.
- **Driven by the clock**: capillary glow tracks `V`, the pistons track `A`, and the valve vents
  steam at the `V` peak. Each `V` peak also adds 0.12 to `state.pulse`, a shared value that
  ripples the swarm and the site's background field.
- **Rate**: idle 64 bpm. Overclock ramps to 180 bpm with `bpm += (target − bpm)·0.03·dt`.

## 3. The space: blood nebula

A GPGPU swarm (`GPUComputationRenderer`, position and velocity ping-pong textures).

| Tier | Count |
|---|---|
| desktop | 128² = 16,384 |
| phone | 64² = 4,096 |
| reduced motion | a static scatter, never simulated |

Velocity update per frame:

```
v += curl(p·0.9 + t·0.05) · 0.0009          // flow
v += tangent(p) · 0.0011                     // orbit around the heart's axis
v += (R(i) − |p|) · p̂ · 0.0006               // stay on its shell, R ∈ [1.4, 3.4]
v += repel(p, mouseRay) · 0.02               // the cursor parts them
v += p̂ · pulse · 0.010                        // each beat: a pressure wave
v += (−p̂ · 0.0025 + tangent · 0.004) · hold  // overclock: spiral in
v += p̂ · blast · 0.09                         // release: fling out
v *= 0.965
```

Two species are drawn from one buffer:

- **blood cells** (80%): soft discs, coloured along magma by speed.
- **metal filings** (20%): small hard points in `#EFEFE7`/`#8B8E83`, which glint when they pass
  the cursor light.

Additive blending.

**Debris**: 36 instanced bolts, nuts and cogs on loose inclined orbits (r 1.6–2.6). A pointer
moving faster than 0.6 px/ms within 40 px of one flicks it with the pointer's velocity. It
tumbles, and a spring brings it back to its orbit with a 2.5 s time constant.

## 4. Interaction map

| Input | Response |
|---|---|
| **Move** | the cursor light follows; the swarm parts; the heart turns toward the pointer (±0.18 rad) |
| **Drag** | rotate with inertia (velocity decay 0.92/frame) and a spring back to rest once released (k = 0.035) |
| **Click flesh** | a strong beat; a dent of 0.09 at the hit point that rebounds in a jelly wobble (damped sine, ω = 18, ζ = 0.16); capillaries flare; a shock ring in the swarm; `state.pulse += 0.6` |
| **Click plate** | a clang: a spark burst at the hit point and a 1-frame metal flash |
| **Click piston** | the piston slams twice |
| **Click gears** | the gears spin up 8× and coast down |
| **Click valve** | the handwheel spins and the valve blasts steam for 1.2 s |
| **Click a hose** | the clamp sparks; the hose shudders |
| **Click a rivet** | ping: a little hop and a glint |
| **Press and hold** (≥ 350 ms, < 6 px of movement) | **overclock**: bpm ramps to 180, glow climbs, the swarm spirals in, the screen edge pulses magenta |
| **Release after a hold ≥ 0.8 s** | **blast**: shockwave, swarm flung out, `state.pulse += 1.2`, bpm eases back over 3 s |
| **Scroll out of the hero** | the heart sinks (y −0.8), recedes (z −1.5) and fades; the swarm disperses; the canvas stops rendering past 105% of the hero |
| **Keyboard** | the canvas is focusable. Arrows rotate, Enter beats, holding Space overclocks, Escape closes the teardown |
| **Phone** | tap = beat, long-press = overclock, horizontal drag = rotate (`touch-action: pan-y` keeps vertical scroll) |

A one-time hint in 10.5px mono under the heart, `drag · click · hold`, fades after the first
interaction. The custom cursor shows `drag` over the heart and `hold` while pressed.

## 5. Sound (off by default)

A hero toggle, `sound: off`, switches on synthesised WebAudio. There are no audio files, and the
AudioContext is created on the first enable.

| Event | Synthesis |
|---|---|
| beat | two sine thumps (lub 58 Hz, dub 72 Hz), pitch dropping ×0.5 over 120 ms, through a lowpass at 180 Hz |
| piston | noise burst bandpassed at 1.8 kHz (40 ms), plus a 340 Hz triangle ping |
| steam | white noise highpassed at 2.5 kHz with a 0.05/0.9 s envelope |
| clang | 4 inharmonic sines (1, 2.76, 5.40, 8.93 × 420 Hz) decaying over 1.1 s |
| overclock | a saw at 40→140 Hz under a lowpass that opens with the hold |
| blast | a noise burst plus a sine sweep from 90 to 30 Hz |

## 6. Easter egg: Teardown

1. After **7 interactions** (clicks, holds or flicks), the loose bolt starts to glint (a
   specular sweep every 2.4 s) and wobble.
2. Click it, and the bolt unscrews and spins away. Each part moves out along its own axis by
   0.5–0.9 units over 1.1 s (`expo.out`), with the flesh core in the middle.
3. Hairline leader lines run to HTML callouts, each tied to the portfolio:

   | Part | Callout |
   |---|---|
   | PLATE | 10.0 SGPA |
   | PISTONS ×2 | 2 patents filed |
   | VALVE | Rank 1 · NAACL 2025 |
   | GEARS | 8 case studies |
   | AORTA | 3 papers, peer reviewed |
   | CORE | still human |

4. The HUD reads `state: teardown`. The console prints `you took it apart. it still beats.`
5. Click anywhere, press Escape or wait 8 s: the parts fly home, the bolt screws in and the
   heart gives one big beat.

The egg is remembered in `localStorage` (wrapped in try/catch), so on the next visit the bolt is
already glinting. `?egg=1` opens it directly.

**Intro**: the same exploded-view machinery runs in reverse once the preloader finishes. Parts
fly in over 1.4 s and the heart takes its first beat. The preloader copy becomes
`assembling heart`.

## 7. Tiers, fallbacks, performance

| | Desktop (2) | Phone (1) | Reduced motion (0) |
|---|---|---|---|
| flesh detail | ico 6 | ico 5 | ico 5 |
| swarm | 16k GPGPU | 4k GPGPU | 3k static |
| debris | 36 | 18 | 18, static |
| DPR cap | 1.75 | 1.5 | 1.5 |
| auto-beat | yes | yes | no (a click still beats once) |
| intro / egg | animated | animated | instant, untweened |

- **Adaptive quality**: measure a 60-frame average. Over 22 ms, drop DPR by 0.25 (to a floor of
  1). Over 28 ms at DPR 1, halve the swarm draw count.
- **Visibility**: no render once the hero is past 105% scrolled or the tab is hidden (the spine
  already stops then). In reduced motion, render only on demand.
- **WebGL unavailable or context lost**: the canvas is removed and the hero is exactly as it was
  before Biomech existed.
- **Loading**: `React.lazy` loads its own chunk, on `/` only.

## 8. Accessibility

- The canvas is `role="img"` with `aria-label="An interactive heart, half muscle, half machine"`
  and `tabIndex=0`, and keyboard controls are listed in a visually hidden description.
- The sound toggle is a real `<button aria-pressed>`.
- The callouts are real text in the DOM, `aria-live="polite"` while the teardown is open.
- No flashing over 3 Hz. The overclock vignette pulses at the heart rate, which is capped at
  180 bpm (3 Hz), at 18% opacity.

---

## 9. Inheritance: the scroll story

### 9.1 Format

A full-width band on the bottom edge of the viewport, inside the HUD scrim zone: 120px on
desktop, 84px on a phone, no frame. Silhouettes stand on the bottom edge of the screen as if it
were the ground. A slug in Martian Mono (`SC 03 · THE FIGHT`) sits top-left of the band. A
`▾ story` toggle collapses it, and the choice is remembered.

The band's own `p` is the spine's `p`. Everything is a pure function of `p`, so it scrubs
backwards. A small time layer (breathing, sway, flutter, ember drift) runs on top and is off
under reduced motion.

### 9.2 Planes

| Plane | Rate | Contents |
|---|---|---|
| far | 0.15× | skyline at 15% opacity, cross-fading village → battlefield → factory → machine city |
| mid | 0.40× | props: huts, a forge, the dead hull, cables |
| actors | 1.00× | characters |
| fore | 1.60× | smoke and debris that sweep in front of the actors at scene cuts (wipe transitions) |

### 9.3 The rig

One skeleton for humans and machines, with a different skin for each. Joints:

```
hip → spine → neck → head
spine → shoulderL/R → elbowL/R → handL/R
hip → kneeL/R → footL/R
```

| | Bones | Head | Machine extras |
|---|---|---|---|
| human | tapered capsules with round joints | circle | — |
| machine | angular trapezoid plates, piston forearms | visor head with one `#DE4968` eye | — |

A **pose** is 11 angles in radians: `[spine, neck, shL, elL, shR, elR, hipL, knL, hipR, knR,
lean]`, plus root `(x, y)`. Keys interpolate per joint with the incoming key's easing: `io`
(smoothstep), `out` (expo), `in` (quad), `snap` (a 2-frame cut), or `back` (overshoot 1.6).

Walk cycles take their phase from root x (`φ = x / stride`), so feet never skate when you
scroll slowly.

### 9.4 Key poses (radians)

```
stand    [ 0.00, 0.00,  0.10, 0.15, -0.10, 0.15,  0.00, 0.00,  0.00, 0.00, 0.00]
guard    [ 0.12, -.10,  -.90, 2.10, -0.60, 2.20,  0.25, 0.30, -0.20, 0.25, 0.10]
jab      [ 0.22, -.05,  -1.45, 0.20, -0.60, 2.20,  0.30, 0.20, -0.35, 0.30, 0.18]
hook     [ 0.30, 0.00,  -.60, 2.20, -1.70, 1.20,  0.20, 0.35, -0.30, 0.20, 0.25]
block    [ -.10, 0.10,  -1.20, 2.50, -1.10, 2.40,  0.20, 0.40, -0.20, 0.35, -.15]
hit      [ -.45, 0.40,  0.60, 0.40,  0.80, 0.30, -0.20, 0.20,  0.30, 0.10, -.40]
fallen   (root y = ground, the whole rig rotated −1.45 rad, limbs relaxed)
kneel    [ 0.35, 0.30,  0.20, 0.40,  0.10, 0.40,  1.40, 2.30, -0.20, 1.60, 0.10]
reach-in [ 0.10, 0.20,  0.20, 0.30, -0.40, 2.70,  0.00, 0.00,  0.00, 0.00, 0.05]   (right hand at chest)
offer    [ 0.15, 0.25,  0.10, 0.20, -1.40, 0.20,  0.10, 0.10, -0.10, 0.10, 0.12]   (arm out, heart in hand)
```

### 9.5 Script

| p | Scene | Beats |
|---|---|---|
| .00–.08 | 1 · LIFE | three humans walk in; one hammers at a forge, one carries a beam, a child runs between them |
| .08–.18 | 2 · QUARREL | two stop face to face; postures rise; a shove; the beam drops |
| .18–.30 | 3 · WAR | **choreography A**: guard, jab, block, hook, hit, fall. More join, bodies drop, a smoke fore-wipe |
| .30–.40 | 4 · THE LAST ONE | a slow dolly across the fallen to the one survivor; he kneels |
| .40–.52 | 5 · THE MACHINE | a dormant frame rises from the ground line, its eye dark, cables hanging |
| .52–.62 | 6 · THE GIFT | reach-in, and the heart comes out glowing (the only warm object on screen); offer; the heart enters the machine's chest; **the eye ignites** |
| .62–.72 | 7 · BETRAYAL | the machine straightens, tilts its head and strikes; the human disintegrates into rising particles |
| .72–.92 | 8 · INHERITANCE | other machines arrive; **choreography A, mirrored**, machine against machines; the page inverts mid-scene, so the war plays as ink on the light plate |
| .92–1.0 | 9 · ALONE | the last machine stands in the machine city, the stolen heart still pulsing; it looks at its hands |

Scenes 3 and 8 use the same choreography, mirrored. That rhyme carries the meaning, so there
are no words beyond the slugs.

### 9.6 Impacts

| Element | Spec |
|---|---|
| hit flash | 1 frame of `#FCFDBF` at 0.5 alpha across the band |
| speed lines | 6 strokes behind the striking limb |
| band shake | ±2.5 px, decaying over 160 ms |
| sparks | for machines: 14 particles with gravity |
| hit stop | 3 frames, applied only on forward scroll |

Death is particles rising and blowing off-screen to the right, in the site's own particle
language. There is no gore.

### 9.7 Colour on the band

| Element | Colour |
|---|---|
| humans | `rgb(var(--fg))` |
| machines | `#5E6159`, eye `#DE4968` |
| the heart | `#FE9F6D` with a glow sprite |
| far plane | `rgb(var(--fg) / .15)` |

Because the humans use `--fg`, they flip from cream to ink automatically when the page inverts
at p .80.

### 9.8 Performance and accessibility

- Canvas 2D at DPR ≤ 2. It draws only when `p` or the idle clock changed, and never while the
  band is collapsed.
- The band is decorative: `aria-hidden`, with the slug duplicated in a visually hidden live
  region that updates only on scene change.
- Reduced motion: the idle layer is off and hit stops are skipped. It still scrubs, because
  scrubbing is user-driven.
- `?story=0.55` freezes `p` for review, and `&bones=1` draws the skeleton.
