> **Format change (2026-10-24).** The art, shots and colour script below ship, but not as a pinned film: the user wanted the story back as a strip along the bottom edge, played by the whole page's scroll. Code is in `v2/src/story/` (`Band.tsx` mounts it; `engine.draw(…, bandMode)` frames for a short, wide strip). The preloader counter was removed in the same change.

# Inheritance — a short film you scroll

Supersedes the Biomech hero and the bottom-edge story band in
`biomech-and-inheritance.md` (both removed, Oct 2026). The feedback that drove this:

- the heart read as synthetic and odd,
- the story band was "so simple, no design, no theme": cream stick figures on a 104px strip, the
  same fight played three times, then the same fight three more times with machines.

The fix is a change of format. The band could never be designed properly, because it sat on top
of the page's text and had to stay transparent and tiny. The story now gets **its own full-screen
chapter**: a pinned, scroll-scrubbed film directly after the hero, letterboxed, colour-graded per
shot, with a real cast, a set that changes over time, and a script with motifs instead of
repetition.

## 1. Research → rules

| Source | What we take |
|---|---|
| *Primal* (Tartakovsky; art director Scott Wills): "no blue sky, no green grass, every colour had to have a meaning"; black shadow passes; strong, simple, recognisable silhouettes | Every shot has its own **grade**, and each grade means something. Characters are **ink silhouettes** with one rim light. No literal colours. |
| Atmospheric perspective in 2D (distant layers lighter, less saturated, drifting to the sky colour); *Alto's Adventure* (a palette pared to a few hues carrying mood, weather and landscape) | 5 parallax planes, each tinted toward the shot's haze by depth, plus mist bands lying in the valleys between planes. |
| Fight animation (Gnomon *Stylized Attacks*; Polycount): anticipation → active → **overshoot** → recovery; fewer in-betweens; arcs; smears and ghosting | Every blow has a wind-up, an overshoot pose (`back` ease) and a recovery. Weapon tips leave a **smear ribbon** sampled from the pose a few frames earlier. Hits get a 1-frame flash, shake and sparks. |
| NRK's scroll-animated illustrations (Chrome case study, 2025) | The scroll is the projector. The film is a pure function of scroll progress, so it scrubs backwards cleanly. |

Sources:
[Primal art direction](https://scienceandfilm.org/articles/3346/genndy-tartakovskys-primal-art-director-scott-wills) ·
[Tartakovsky and silhouettes](https://editorial.rottentomatoes.com/article/primal-creator-genndy-tartakovsky-revolutionized-animated-action) ·
[atmospheric perspective](https://cone3d.gamedev.net/tutorials/visual-arts/easy-atmospheric-perspective-in-photoshop-r2521) ·
[Alto's Adventure](https://design-milk.com/altos-adventure-keeps-simple/) ·
[stylized attacks](https://bmc.thegnomonworkshop.com/workshops/animating-stylized-attacks-in-maya) ·
[NRK](https://developer.chrome.com/blog/nrk-casestudy)

## 2. The story

One place, seen across one long day and one night. A village becomes a battlefield, then ruins,
then a machine city.

**Motifs, which replace the old repetition:**
- **The blade.** The smith forges it (2). It starts the war (3). He builds it into the machine's
  arm (5). The machine kills him with it (7).
- **The thrust.** The rival's lunge in the duel (3) is the exact move the machine uses on the smith
  (7), and the move it wins its own war with (8).
- **The kite.** A child loses it in the quarrel (2). It drifts down out of the sky into the last
  machine's hand at the end (9).
- **The heart.** It is the only gold in the film.

### Storyboard (film progress f ∈ 0–1)

| # | f | Shot | Grade | What happens | Caption |
|---|---|---|---|---|---|
| 0 | .000–.025 | Slate | black | "a film in nine shots · scroll"; the frame fades up from black | — |
| 1 | .000–.110 | **DAWN** · wide, slow pan right | violet → gold dawn, sun on the horizon | Village: huts, a turning windmill, chimney smoke, birds. The **smith** hammers at his anvil, with sparks on every stroke. The **rival** walks in with a bundle. A **child** runs through with a kite on a string. | *They built.* |
| 2 | .110–.210 | **WANT** · medium, push in | late-morning amber | The smith lifts a finished blade; it glows. The rival reaches for it, the smith refuses, the rival shoves him down and takes it. The child flinches, the **kite string snaps**, and the kite drifts up out of frame. | *Then they wanted more.* |
| 3 | .210–.370 | **WAR** · (a) wide ridge, (b) medium duel | blood sky, enormous red sun | (a) Two armies charge across the ridge, a volley of arrows arcs over the red sun, and the village burns behind. (b) Duel: the rival's overhead **slash** (wind-up, smear, overshoot), the smith **blocks** with his hammer (clang and sparks), shoves him off. The rival's **thrust**: the smith sidesteps, the rival stumbles past, a stray arrow takes him, and he falls. Behind them the fighters drop one by one. | *Then they fought.* |
| 4 | .370–.470 | **ASH** · wide, still | grey ash, a pale dim sun | Ruins. Burnt hut frames, the broken windmill, spears stuck in the ground, torn banners fluttering, crows that lift off as he passes, ash falling. The smith limps through, **picks up the blade**, and kneels at his cold forge. | *Until one remained.* |
| 5 | .470–.590 | **THE MAKING** · medium | violet night, moon, stars, a dull red hearth | He builds through the night from the weapons of the dead. Legs, pelvis, a chest of **shields**, pauldrons, spear-shaft spines, a **helmet** for a head, and **the blade as its forearm**. Every part lands with a weld burst. It sits slumped against the chimney, huge and dark. | *From their weapons, he built one that could not die.* |
| 6 | .590–.700 | **THE GIFT** · close-up | night, lit by the heart | He clutches his chest; light seeps between his fingers. He draws out his **heart**, beating and gold, and it lights the whole frame warm. He sets it into the machine's open chest. Light runs along its seams, its **eye ignites**, and the smith sinks to his knees, greyed. | *He gave it the only thing he had left.* |
| 7 | .700–.790 | **INHERITANCE** · low angle | cold steel dawn | The machine rises and towers over him. It looks down. He reaches up to it like a father. It raises the blade-arm, in **the rival's wind-up**, and thrusts. White flash. He comes apart into embers that lift and blow away. It regards its blade. | *It remembered what it was made of.* |
| 8 | .790–.910 | **AGAIN** · (a) wide ridge (mirrors 3a), (b) duel (mirrors 3b) | bone-white plate, a **black eclipse sun** with a red corona | Towers of a machine city stand where the village was. Machine armies charge across the same ridge, and red bolts cross the sky where arrows did. The first machine fights a soldier with the **same choreography, mirrored**, and wins with the thrust. | *And it began again.* |
| 9 | .910–1.00 | **CODA** · medium, hold, then title | bone dusk, a faint magma horizon | Alone among the wrecks, its stolen heart pulsing. **The kite** drifts down from the top of the frame. It raises a hand and catches the string, and looks at the kite. Title: **INHERITANCE**, with "what we build inherits what we are." | — |

The grade journey (warm → red → grey → violet → gold → steel → bone) follows the site's own
magma ramp into its neutrals, and ends on the site's light "plate". The machine world is drawn
the way the page itself looks when it inverts.

## 3. Colour script (hex)

| Grade | sky top | sky mid | horizon | sun | haze | ink | rim |
|---|---|---|---|---|---|---|---|
| dawn | `#1E1238` | `#6B2A6E` | `#F59E6B` | `#FFF2C4` | `#B8607A` | `#1A0F1F` | `#FFC98F` |
| want | `#3B1F4F` | `#B5577A` | `#FBC88B` | `#FFF6D8` | `#C98080` | `#21131D` | `#FFE0A8` |
| war | `#1F050F` | `#6E0F2A` | `#E84A4A` | `#FFB08A` | `#A82A45` | `#120408` | `#FF7A5C` |
| ash | `#2E302A` | `#55584F` | `#9C9E92` | `#D9D8CC` | `#7D7F75` | `#1B1C18` | `#B9BAAF` |
| night | `#05040C` | `#140C30` | `#3B0F70` | `#E8E4F5` (moon) | `#2A1856` | `#050409` | `#7E6BC4` |
| gift | `#07060E` | `#1A1030` | `#4A1F55` | — | `#3A2050` | `#050408` | `#FFB060` |
| steel | `#1A1E22` | `#4A535A` | `#C9CFC9` | `#F5F6F0` | `#8E9893` | `#0D0F10` | `#E6EBE6` |
| plate | `#D9D7CB` | `#E6E4DA` | `#F1EFE6` | `#0C0D0B` (eclipse) | `#BDBBAE` | `#0C0D0B` | `#DE4968` |
| dusk | `#CFCBBE` | `#E2C9B5` | `#F6C6A0` | `#FCFDBF` | `#C7B3A6` | `#0C0D0B` | `#FE9F6D` |

**Accents:**
- heart: `#FE9F6D`, core `#FCFDBF`
- machine eye: `#DE4968`
- kite: `#8C2981` with `#FCFDBF` tail bows
- hot metal: `#FF6A3D`

## 4. Cast and props

**Cast.** All are drawn from one 11-angle rig, each with its own skin. Back limbs are drawn in a
second, lighter ink so that limbs crossing in a fight stay readable.

- **The smith** (protagonist): broad build, leather apron, short beard, a long **scarf** that
  flutters, and a forge hammer.
- **The rival**: lean, with a ponytail ribbon and a belted tunic. He carries the blade from shot 2,
  and a crested helmet in the war.
- **The child**: about 0.6 scale, with a larger head, an oversized tunic and the kite.
- **Soldiers**: about 40 small extras on the ridge plane, hazed, with spears, banners and
  helmets.
- **The first machine**: about 2× human height. It has a chest of round shields with a heart
  cavity, shield pauldrons, three spear-shaft spines, the rival's crested helmet with an eye
  slit, piston limbs, slack cables, and **the blade as its right forearm**. Its seams light up
  once it has the heart.
- **Machine soldiers**: 1.6–1.9× scale, with box or spike heads and blade arms.

**Props:**
- forge (hearth, chimney, anvil)
- huts in four states: intact, burning, burnt frame, and gone under towers
- windmill (turning, then broken)
- well, trees, fence
- banners, arrows, spears in the ground, shields, crows, birds
- machine-city towers with lights
- the kite, the blade, the heart

## 5. Motion

- **Pose-to-pose** keyframes over f, each with an ease: `io`, `out`, `in`, `back` (overshoot),
  `snap`.
- Every strike follows wind-up → active → overshoot → recovery.
- **Walk cycles** take their phase from x, so feet never skate.
- **Secondary motion**, driven by time so the scene stays alive when you stop scrolling (and off
  under reduced motion): breathing, the scarf, the ponytail, banners, smoke, birds, ash, embers,
  stars, the forge flicker, the windmill and the heartbeat.
- **Camera:** each key sets x, the ground line's screen height `g`, the world height above the
  ground `h` (which acts as zoom), the minimum visible width `w` (which keeps phone portrait
  framed on the action) and the eye height `eh` (which places the horizon: low eye means a low
  angle). Within a shot the camera eases between keys; between shots it **cuts**. Holds get a
  slow push-in.
- **Impacts:** a one-frame flash, a camera shake decaying over about 0.3 s, and sparks with
  gravity. They fire only when scrolling forward through them.
- **Smears:** a weapon-tip ribbon sampled at f−δ·i, i = 1…6, alpha-faded.
- **Cuts:** a 2-frame dip to ink at each shot boundary. 8a and 8b are mirrored match cuts of 3a
  and 3b.

## 6. Technique

- Canvas 2D, full-viewport inside a sticky stage. No new dependencies and no image assets.
  Letterbox, vignette and film grain are CSS layers over the canvas (the grain is a 96px noise
  tile generated once).
- **Perspective-correct parallax.** A plane at depth d scales by k·d and pans by (x−cx)·k·d. Its
  ground line sits at `horizon + (ground − horizon)·d`. Ridges are procedural noise sampled in
  world x, so the set is endless.
- **Rim light:** draw the silhouette in the rim colour, offset toward the light, then the ink
  silhouette on top.
- **The scroll gap.** `lib/scroll.ts` learns the film's pinned range and leaves it out of the
  page's p. The particle field, the plates, the HUD and the inversion therefore keep their
  original timing, as if the film weren't there. The film computes its own f from its section,
  smoothed for a little cinematic inertia. While the film covers the screen, the field skips
  rendering.
- **Skip:** a "skip film ↓" control in the letterbox scrolls past the section.
- **Dev:** `?film=0.42` freezes f, and `&bones=1` draws the joints.

## 7. Tiers, reduced motion, accessibility

- **Desktop:** DPR ≤ 1.5. **Phone:** DPR ≤ 2, and the camera's `w` keeps each key's action in a
  portrait frame.
- **Reduced motion:** no pin and no scrubbing. The film becomes a **storyboard**: nine still
  panels, each rendered once at its key frame, with its caption. It is the same art, standing
  still.
- The canvas is `aria-hidden`. Captions are real text, and a live region announces each shot
  title. The skip control is a real button and is keyboard reachable.

## 8. Verification

- `build:all` green.
- Playwright at 1440×900 and 390×844, frozen at each shot's key frames via `?film=`, giving a
  contact sheet per breakpoint.
- A scrolled run checks that the field, HUD and inversion timing match the page without the film,
  and that the skip button lands on About.
- A reduced-motion run shows the storyboard.
- Zero console errors and zero horizontal overflow.
- No `/work/*` route loads the film chunk.
