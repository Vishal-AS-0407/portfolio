# Descent — the story strip, from a blank board

Replaces Inheritance (the film and its cramped strip), which is deleted. This is a new story, a new
world and a new renderer, built for the strip it lives in. It also covers the second job in this
pass: making the page's particle field respond to the pointer.

Method: Anthropic's `algorithmic-art` and `canvas-design` skills (github.com/anthropics/skills). The
movement gets a philosophy first, the concept stays inside the algorithm rather than being
announced, randomness is seeded and every parameter is tuned by looking at it.

---

## 1. Philosophy — "Lit by the Slope"

The page already tells one story with numbers. The HUD trains a model as you read: epoch, state,
a loss that falls from 4.83 to 0.0042, and a heading that says *every model starts lost*. Descent
tells the same story with a body. The landscape is the loss surface. The traveller is the model.
Its lantern is the gradient, and the light falls the way the ground falls, so steep ground blazes
and flat ground goes dark. No rule in the code says "be sad on the plateau". The light dims there
because the slope is zero.

Everything is made of the page's own material. The strip has no sky, box or background. Its world is
drawn into an invisible buffer and then *printed* as points: a jittered stipple grid that samples the
buffer and sizes each dot by what it finds. Those points use the page's foreground colour, so they
are cream on the dark page and ink on the light plate, and the magma accent appears only where light
falls. The point field behind the page and the people in the strip are the same substance at two
scales.

Motion follows the same rules. Walking is phased by distance, so feet never skate. Light comes from
slope, momentum from the last segment's speed, and noise is seeded and scrubbable. Only weather,
flame and breath run on clock time, and they are small enough to read as life, not as a video.

## 2. The story — ten beats across the page

The journey is mapped to page progress `p` and lined up with the sections and the HUD's own states
(section starts at 1440: about .075, work .16, research .32, experience .44, skills .61,
achievements .72, certifications .81, leadership .86, chess .90, contact ≈1).

| # | p | HUD state | Beat | What you see | Line |
|---|---|---|---|---|---|
| 1 | .00–.07 | initialising | **Init** | On load, random points coalesce into a needle summit. A cloaked figure stands at its tip, and the lantern lights. | *A point, somewhere high, with no idea where it was.* |
| 2 | .07–.16 | initialising | **The lean** | The lantern's light leans downhill. The figure turns and follows it down the scree. | *Its light leaned one way. It followed the lean.* |
| 3 | .16–.30 | forward pass | **Overshoot** | The slope steepens into a slide. It shoots past the bottom of a ravine, up the far wall, back down, past it again, and settles: an oscillation. | *Too fast. It missed the bottom, twice.* |
| 4 | .30–.38 | back-prop | **The hollow** | A warm bowl with a fire. Three of the Settled sit by it, their lanterns hung dark on a post. The traveller sits, and its light gutters. | *Others had stopped here. It was warm. It was almost enough.* |
| 5 | .38–.44 | back-prop | **Momentum** | It stands and the Settled watch. The smallest one walks a few steps after it and stops. It climbs the rim, which is higher than the hollow. | *It kept what speed it had, and climbed out.* |
| 6 | .44–.60 | converging | **Plateau** | A flat salt plain in fog, with half-buried lanterns where others lost the light. Its lantern is nearly out and its steps slow. | *Then the ground went flat, and the light went quiet.* |
| 7 | .60–.72 | converging | **Noise** | Wind, then rain. Lightning shows the edge. A gust knocks it down and it slides off the plateau onto falling ground, so the light flares back. | *The storm didn't stop it. It shook it loose.* |
| 8 | .72–.81 | validated | **Echoes** | A still lake. Violet copies of the traveller walk the shore *the other way*, repeating its exact steps: memorised, not learned. | *It met copies of itself that only knew the way they'd come.* |
| 9 | .81–.90 | validated → inference | **Validation** | The page turns to its light plate. In the light the echoes break into points and blow away; only the traveller's path holds. | *In the light, only what was true held.* |
| 10 | .90–1 | inference | **Converged** | The lowest basin holds a cairn of lanterns left by earlier walkers. It sets its own among them, sits, and comes apart into points that rise out of the strip into the page's field. Far up on the distant summit, a new light wakes. | *At the lowest point, it set its light down with the others.* → *Far up, a new light woke. Every model starts lost.* |

The last line returns to the About heading. The ending is also a beginning, which is how training
runs work: the next run starts lost.

## 3. Design tokens

| Token | Value | Use |
|---|---|---|
| `ink` | page `--fg` (#EFEFE7 on the void, rgb(20 21 15) on the plate) | every point of the world and the traveller |
| `ground` | page `--bg`, through the extended `hud-scrim` | the strip's only "background", the page itself |
| `ember` | #FE9F6D | lantern light, fire, the cairn |
| `core` | #FCFDBF | lantern core, lightning |
| `echo` | #8C2981 → #DE4968 | the Settled's dark lanterns, the echoes |
| `deep` | #3B0F70 | far-plane tint and the fog's cold end |

Type: subtitles are set in Archivo 600 at wdth 86, a little larger than the old strip. The beat
label uses the HUD's own mono face (Martian Mono) in the ember colour, so it reads as part of
the training readout. Nothing new is introduced.

## 4. Layout

```
┊ page content ·································································┊
┊                  (hud-scrim deepens: content fades out behind the strip)       ┊
┊   . ·  ·:·.  far ridges (deep, sparse points)       ·  ·     ·:·.              ┊
┊ ·:::·..   mid: rocks, posts, the fire   .·:::::::·.                ·.          ┊
┊ ::::::::::::::·  ☗ ⟋ (traveller + lantern light cone) ::::::::::::::::::::    ┊
┊ PLATEAU   Then the ground went flat, and the light went quiet.         ▾ story ┊
┊ TRAINING LOSS 0.41          too much? see the plain version →    EPOCH 0055 …  ┊
```

The strip sits above the HUD row (bottom 56px), `clamp(132px, 19vh, 196px)` tall, with 72px of
transparent headroom above it for halos, lightning and the rising points of the ending.

## 5. Technique

- **The scene buffer** is a low-res 2D canvas, one texel per stipple cell. Each channel carries a
  meaning: R is density (how much matter is there), G is light (additive), and B is material:
  world 0, traveller .25, echo .5, flame .75, water 1. Planes are painted far to near with
  parallax rates .12, .3, .55, 1 and 1.5 (foreground grass).
- **The stipple printer** is a WebGL2 fragment shader. For each pixel it searches the 3×3
  neighbouring cells for the nearest seeded, jittered point, samples the buffer there, and draws a dot
  whose radius follows √density. The dot is coloured by material and lit toward magma by light. A
  mip-blurred sample of the light channel adds the halo. Points shimmer slightly in time, and fog
  and initialisation noise mix into density inside the shader.
- **Motes** are a GL `POINTS` pass from a CPU pool: embers, rain, fireflies, the echoes shattering,
  the closing dissolve and the coalescence at load.
- **Light comes from slope.** The lantern cone points down the terrain gradient, with
  intensity = |∂y/∂x| eased, plus beat overrides (flare in the storm, gutter in the hollow).
- **The rig** is a cloak silhouette (a hooded trapezoid that flutters with speed and wind), two-bone
  legs phased by distance walked, a staff arm and a hanging lantern on a damped pendulum. Poses:
  stand, walk, slide, climb, sit, rise, brace, fall, kneel and set-down. The Settled and the echoes
  use the same rig.
- **Camera:** x follows the traveller with a lead in its direction of motion, y follows the terrain
  with damping, and it stays fixed in scale. The terrain drops 16 world units over the journey,
  so the ground visibly sinks as you read.
- **Impacts** (the ravine landing, the lightning, the fall, the shatter) fire only on forward scroll.

## 6. Quality floor

- **Reduced motion:** the scene is still drawn from scroll, but clock time is frozen and motes
  are off.
- **No WebGL2:** the strip doesn't mount, and the page is unchanged.
- **Collapse:** "▾ story" collapses the strip and the choice is remembered. Drawing stops
  while it is hidden or the tab is in the background.
- **Phone:** the strip is 104px tall with a 2px cell. The beat label hides and the line shrinks.
- **Accessibility:** the canvas is decorative (`aria-hidden`), and the toggle is a real button with
  `aria-pressed`.
- **Budget:** one shader pass plus one points pass on a strip-sized canvas; the scene buffer is
  about 600×90 texels.

---

## 7. The field responds to the pointer

The hero's 100k-point field must stay a pure function of scroll, because scrubbing back has to
work. So the interaction is a **transient layer computed in the vertex shader from uniforms**,
never a simulation that writes positions. When the pointer leaves, the field is exactly what it
would have been.

| Input | Response | Why it fits |
|---|---|---|
| Move | A soft lens pushes points away from the cursor in screen space, and points inside warm toward the hot end of magma. | "Attention": what you look at lights up. |
| Fast moves | A wake. The last 8 pointer samples bend nearby points along the motion and leave a swirl that relaxes over ~0.6s. | Stirring the noise: the field has inertia without a simulation. |
| Press and hold (on empty page, not links or text controls) | A gravity well. Points within reach collapse toward the cursor and the HUD reads `state: overfitting…`. | It echoes the existing `overfit` egg: memorising one point. |
| Release | The well bursts outward as a ring, then everything springs home. | Regularisation, then back to the run. |
| Touch | A tap sends one ripple ring, with no hover lens. | No hover exists on touch, and drags are scrolls. |

Guards: strength is full in the hero and eases to 35% further down. It is off on `/work/*`, where
the field is at 10%, and off under reduced motion. Holding doesn't start on links, buttons,
inputs or `[data-cur]`. The uniforms ease every frame, so nothing pops.

## 8. Order of work

1. Delete `src/story` and the strip CSS. Write `src/descent/` (world, figure, painter, motes, GL
   printer, component).
2. Paint beat by beat with `?descent=p` freeze screenshots at 1440 and 390, tuning each beat
   before the next.
3. Do the field pointer layer and screenshot a hover, a wake and a hold.
4. Check reduced motion, phone, overflow, console and `npm run build:all`. Update the docs and
   READMEs, commit and push to `portfolio`.
