# GitHub Profile README — audit + design plan

Target: `github.com/Vishal-AS-0407` → repo `Vishal-AS-0407/Vishal-AS-0407`
Written 2026-08-13. Status: **plan only, nothing built yet.**

---

## 1. What exists today

**Scale.** One file. `README.md`, 7,125 bytes, ~150 lines. No `assets/`, no
`.github/workflows/`, no images committed. Everything is hotlinked from third-party
services. Last pushed 2025-07-16 — thirteen months stale.

**Profile metadata.** Bio: *"✨ Aspiring AI Developer | 🎓 B.Tech in Computer Science
with AI | 🤖 Exploring the intersection of Deep Learning, and real-world application
🌍"*. 29 public repos, 4 followers, blog → the old portfolio.

**Current structure, in order:**

| # | Section | Built from |
|---|---------|-----------|
| 1 | 900px animated banner | `user-images.githubusercontent.com/74038190/…` |
| 2 | Typing headline | `readme-typing-svg.herokuapp.com`, colour `#00D4FF` |
| 3 | Two more decorative GIFs | same GIF dump |
| 4 | About Me — a `class VishalAS:` Python block | markdown code fence |
| 5 | Tech Arsenal — 5 sub-sections | `skillicons.dev` + `img.shields.io` `for-the-badge` |
| 6 | GitHub Analytics | `github-readme-stats`, `theme=tokyonight` |
| 7 | What I'm Working On | emoji bullets + GIF |
| 8 | Connect with Me | 4 shields.io badges |
| 9 | Two closing GIFs | same GIF dump |

Roughly **40 network requests**, eight of them multi-megabyte GIFs.

### What's actually wrong with it

1. **It is the most-cloned template on GitHub.** The `74038190` GIF set +
   `readme-typing-svg` + `skillicons.dev` + `for-the-badge` shields +
   `github-readme-stats theme=tokyonight` is one recognisable stack. Hundreds of
   thousands of profiles use exactly it. To anyone who reviews AI/ML candidates it
   reads as *copied a template*, which is the precise opposite of the intent.

2. **A placeholder link is live right now.**
   `scholar.google.com/citations?user=YOUR_GOOGLE_SCHOLAR_ID` — literally
   unedited. On a profile belonging to someone with three publications this is the
   single most damaging line on the page. Real ID: `fPK6EDAAAAAJ`.

3. **The differentiators are entirely absent.** Nowhere on the README:
   Rank 1 of 25 at DravidianLangTech (NAACL 2025) · Best Paper at ICBSII 2025
   (IEEE, first author) · two patents filed · Top 500 HackMIT 2025 · CISAI. These
   are the *only* things on the page a reviewer could not also say about a thousand
   other candidates — and they aren't on it.

4. **It lists tools, not outcomes.** "PyTorch, TensorFlow, OpenCV" is a claim
   anyone can make. "Best Paper, ICBSII 2025" is not.

5. **Stale content presented as current.** "Currently Building: AI-powered
   healthcare solutions with NurtureSync" — that role ended February 2025. No
   mention of CISAI, which started February 2026.

6. **"Aspiring AI Developer"** in the bio, while employed as an AI Developer with
   peer-reviewed publications. Undersells by a wide margin.

7. **`MATLAB`** is claimed in the code block; it appears in no repo and on no
   version of the resume.

8. **The stats cards work against him.** 4 followers, and commits split across two
   git identities (`Vishal-AS-0407`, `vishalwebnew`) so the contribution graph
   under-reports real activity. A weak stats card is worse than no stats card.

9. **Fragile and slow.** Every visual is a hotlink to a service that can rate-limit,
   change, or disappear. `readme-typing-svg.herokuapp.com` is on Heroku's retired
   free tier.

### One more thing found while auditing

Three of the 29 repos are **forks**, and GitHub labels them as such on the repo page:
`Vega-Agent`, `Qubit-GreenFinance`, `NAACL_DravidianLangTech_2025`. Also, **27 of 29
repos have a blank description** and no topics. Whatever the README does, a visitor
who clicks through lands on unlabelled repos. Fixing descriptions is cheap and
compounds with everything below.

---

## 2. Theme

### What we are deliberately not doing

No robots. No neural-network node-and-edge graphics. No brain icons. No Matrix rain.
No circuit traces. No neon cyan-on-black, no synthwave, no `tokyonight`/`dracula`.
No typing-SVG. No badge wall. No contribution snake. No trophy card. No third-party
GIF dump. These are the second-order cliché — the look of *"AI"* as decoration rather
than as work.

### The idea: **READOUT**

> A GitHub profile is normally a personality page. This one is an instrument.

Every section is a readout from a real system — a metrics table, a signal trace, a
results leaderboard, a changelog. Nothing on the page is decorative unless it is also
carrying data. The flex is not "look at my animation," it's **"look how much of this
is a real number with a citation next to it."** Vishal is one of very few people at
this level who can actually fill that page in, which is exactly why it can't be
copied off him.

This also reads as *research engineer* rather than *bootcamp grad*, which matches
where he's applying.

### Palette — `cividis`

Not the portfolio's magma (deliberately different; the two properties should feel
related but not identical), and not any neon.

`cividis` is a real perceptually-uniform scientific colormap, designed for
colour-vision-deficient readers and published in PLOS ONE. Deep navy → slate → warm
grey → gold. Almost nobody uses it on a profile, and the gold end reads as *award*
rather than *gamer*.

| Role | Hex | Use |
|------|-----|-----|
| ground | `#0A1128` | banner background, deep navy-black — not `#000` |
| deep | `#00204C` | cividis 0.00 |
| mid | `#31446B` | cividis 0.25 — rules, hairlines |
| neutral | `#666970` | cividis 0.50 — secondary text |
| warm | `#958F78` | cividis 0.75 |
| gold | `#FFEA46` | cividis 1.00 — **accent, used sparingly**: rank, award, current |
| ink | `#E8EAF0` | primary text on ground |

Rule: gold appears **only** on things that are genuinely rare — Rank 1, Best Paper,
patent number, "current". If everything is gold, nothing is.

### Type

Set inside SVG, so we get real typographic control that markdown can't give:
a grotesque for headline (wide, tight tracking) + a true monospace for data
(JetBrains Mono or IBM Plex Mono). Markdown body text stays in GitHub's own font —
fighting that is a losing battle and looks broken in the other theme.

### Motion

Animated **SVG**, self-hosted, not GIF. Sharper at any size, ~30KB instead of ~4MB,
and it survives light/dark. Motion is restrained: a convergence curve that draws on,
a signal trace that scrolls, a counter that settles. It should look like an
instrument warming up, not like a title sequence.

---

## 3. Structure

Nine blocks, top to bottom. Anything a reviewer needs is above the second scroll.

**01 · BANNER** — self-hosted animated SVG. Name set wide, a real convergence curve
drawn behind it, a status strip: `CISAI (INNSPARK) · COIMBATORE · 3 PAPERS · 2 PATENTS`.
No typing effect. Light and dark variants via `<picture>`.

**02 · THESIS** — two lines of prose, maximum. Replaces the `class VishalAS:` block,
which is itself a template cliché. States what he builds and what he's published,
nothing else.

**03 · RESULTS** — *the centrepiece, and the thing nobody can copy.* A real table:

| result | venue | evidence |
|---|---|---|
| Rank 1 of 25 | DravidianLangTech, NAACL 2025 | ACL Anthology link |
| Best Paper, first author | ICBSII 2025 · IEEE | DOI |
| Patent filed — Nalam AI | 202541065699 | — |
| Patent filed — Claire | 202541092811 | — |
| Top 500 globally | HackMIT 2025 | — |
| Runner Up | DigiPay Pro · NPCI × IIT Bombay | — |
| 10.0 / 10.0 SGPA | Amrita | — |

Every row carries a link or a number. This is the four-second read.

**04 · SELECTED WORK** — 5–6 repos as rows, not cards. Each: name · one line ·
headline metric · `repo` + `case study →` (deep-links into the new portfolio, which
is how the two properties connect). Ordered by strength of evidence, same ranking
logic as the portfolio.

**05 · SIGNAL** — one small self-hosted animated SVG: an actual EEG trace or
spectrogram slice. Decorative, but decorative *in his own domain* — signal
processing is what he publishes on. This is the only purely aesthetic element and it
earns its place by being true.

**06 · STACK** — a compact grouped monospace list or a single custom SVG capability
matrix. **No logo badges.** Grouped: Languages / ML & DL / LLM & Agents /
Signal & Vision / Data & Infra. Roughly a third the vertical space of the current
badge wall.

**07 · NOW** — current role, what's being built, dated (`updated 2026-08`). Short.
The date is the point: it proves the page is maintained, which is exactly what the
current README fails at.

**08 · ELSEWHERE** — socials, contextual, custom SVG icons.

**09 · FOOTER** — a thin cividis gradient rule and the email. No closing GIF.

### Optional: keep it from going stale

A small GitHub Action on a monthly cron that re-stamps the `NOW` date and regenerates
one live figure. The current README rotted for thirteen months; this is the fix.
Low priority, but cheap.

---

## 4. How the socials connect

Placed **in context** rather than dumped in one bar at the bottom — same principle
already used on the portfolio.

| Link | Where it goes | Why there |
|---|---|---|
| Google Scholar `fPK6EDAAAAAJ` | RESULTS block | next to the publications it indexes — **and it fixes the live placeholder** |
| ResearchGate `Vishal-A-S-3` | RESULTS block | same |
| ACL Anthology + IEEE DOI | inline, per publication row | evidence sits with the claim |
| GitHub repo links | inline, per project row | — |
| Portfolio (new) | BANNER + each project row | `case study →` deep links |
| Portfolio (plain) | ELSEWHERE | the escape-hatch version, same pairing as the sites |
| LinkedIn | BANNER + ELSEWHERE | primary recruiter channel |
| Email `vishalpersonal04@gmail.com` | FOOTER | — |

Icons: hand-drawn SVG in the cividis palette, committed to the repo. Not shields.io,
not simpleicons hotlinks.

### Open — needed before ELSEWHERE can be finished

- **Chess.** International FIDE-rated, 100+ tournaments, 50+ wins, State bronze. This
  is the most memorable non-technical fact he has and it's currently a throwaway
  "fun fact" line. Worth a proper row — but a FIDE ID / Chess.com / Lichess handle
  would make it verifiable rather than a claim.
- **Kaggle / Hugging Face** — any profile? Strong signal for ML roles if so.
- **X / Twitter, blog or Medium** — any?
- The **`vishalwebnew`** second git identity — worth consolidating so the
  contribution graph reflects real activity.

---

## 5. Technical constraints (checked, not assumed)

These decide what is buildable, so they're recorded here rather than discovered later.

- GitHub sanitises README HTML. **Allowed:** `<img>`, `<picture>`, `<a>`, `<table>`,
  `<details>`, `<div align>`, `width`/`height`/`align` attributes. **Stripped:**
  `<script>`, `<style>`, and inline `style=` attributes. So all styling must live
  *inside* the SVG files.
- **`<picture>` + `prefers-color-scheme` works** in GitHub markdown. Most templates
  ignore this and look broken in light mode; we ship both variants.
- **Animated SVG works** when referenced as `<img src>` — CSS animation and SMIL both
  run. That's how the typing-SVG service works; we just self-host instead.
- **But an `<img>`-embedded SVG cannot load external resources** — no `@font-face`
  from a CDN, no scripts. Therefore **all SVG text must be converted to outline
  paths** at build time. This is the detail most people get wrong; ignoring it means
  the banner silently falls back to whatever font the viewer happens to have.
- Images are proxied and cached by GitHub's **Camo**. Self-hosted assets are served
  from `raw.githubusercontent.com` and cached hard — a reason to version filenames
  when updating.
- Keep total payload **under ~500KB**. Current README is several megabytes of GIF.

---

## 6. Next step

Scan GitHub for existing profile templates, SVG generators and component libraries
worth borrowing from or forking — then decide, per component, build-vs-adapt. That's
the following pass; nothing is written to the profile repo until the theme above is
signed off.
