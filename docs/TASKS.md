# Master task list

Asked for on 2026-10-17, in this order: fix the portfolio → redo the GitHub READMEs properly →
the hero 3D + story work → then, last, the project sub-page overhaul. `[x]` means done **and
verified**.

---

## Phase 1 — Portfolio health check and fixes

- [x] Live site (`portfolio-sigma-blond-57.vercel.app`) deployed from `Vishal-AS-0407/portfolio`
- [x] All 11 routes × desktop 1440 + phone 390 — 0 console errors, 0 failed requests,
      0 horizontal overflow (`/`, `/plain/`, 8 × `/work/*`, 404)
- [x] Deeper QA: Lighthouse (perf / a11y / SEO / best practices) on `/`, `/plain/`, one `/work/*`
- [x] Fix whatever that finds; re-verify — canonical per route, AA contrast, labelled icon
      links, lazy Supabase → a11y + SEO 100 on all three

## Phase 2 — GitHub READMEs, rebuilt in your style (researched)

What went wrong last time: I wrote dense prose and an editorial-minimal profile. Your originals
are scannable — emoji headers, bullet features, tables, Mermaid, ToC — and your profile is
animated (GIFs, typing SVG, skill icons, stats cards). The new ones keep my verified technical
content but present it that way, using open-source components that were each checked live:

| Component | Repo | Status |
|---|---|---|
| Animated wave header/footer | kyechan99/capsule-render | ✅ 200 |
| Typing headline | DenverCoder1/readme-typing-svg | ✅ 200 |
| Tech icons | tandpfun/skill-icons | ✅ 200 |
| Badges | shields.io (`for-the-badge`) | ✅ 200 |
| Stats / top-langs / pin cards | anuraghazra/github-readme-stats | ✅ real data |
| Streak card | DenverCoder1/github-readme-streak-stats | ✅ real data — dropped from the profile (current streak 0 reads badly) |
| Animated GIFs, dividers, emojis | Anmol-Baranwal/Cool-GIFs-For-GitHub | ✅ |
| Structure (ToC, Built With, Usage, Roadmap…) | othneildrew/Best-README-Template | ✅ |
| Activity graph · trophies | Ashutosh00710 · ryo-ma | ❌ 402 — **not used** |
| Native: Mermaid, `> [!NOTE]` alerts, `<details>` | GitHub | ✅ |

- [x] Shared kit: one set of header/footer/divider/badge conventions, a colour per project
- [x] Profile README (Vishal-AS-0407) — your animated style, upgraded: results with evidence,
      case-study links, stats + top languages, fixed Google Scholar link (was a placeholder)
- [x] 27 repo READMEs — keep your originals' screenshots, demo links and good parts; add
      architecture Mermaid, results tables, quick-start; known issues go in a collapsed
      `<details>` at the bottom instead of dominating
- [x] Preview every one through GitHub's own markdown API + GitHub CSS, dark and light
- [ ] Ask before pushing to your repos — `python gh-readmes/publish.py --dry-run` is ready
      (27 READMEs + profile + About/topics from `repo-metadata.json`)

## Phase 3 — Hero 3D "Biomech" + "Inheritance" scroll story

Approved plan: `C:\Users\visha\.claude\plans\compressed-tinkering-map.md`.

- [x] Design doc `docs/design/biomech-and-inheritance.md`
- [x] Heart: flesh + cardiac clock + lighting → mechanical grafts → grease/steam
- [x] Interactions → GPGPU swarm + debris → field kick → hold/blast → hero exit
- [x] Teardown egg → sound → preloader tie-in → tiers / fallbacks / adaptive quality
- [x] Story rig + poses → parallax scenery → scenes 1–9 → polish
- [x] Verify (desktop, phone, reduced motion, perf) → push

## Phase 4 (last) — Project sub-page overhaul

Your note: some pages feel like the base page lightly modified; make them far richer, with
scroll storyboards and a 3D interactive piece each.

- [x] Audit all 8 pages side by side; list what reads as reused or thin
      → `docs/design/subpages-mechanism.md`
- [x] Plan per page first (same doc: scene, panels, "your turn", honesty rules, order)
- [x] Shared plumbing: `_shared/stage3d.ts` + `_shared/Mechanism.tsx` (pinned storyboard,
      visibility-gated rAF, reduced-motion still, no-WebGL fallback, snap markers)
- [x] Per page: a scroll storyboard in that project's own visual language + one interactive
      3D piece about the project's actual mechanism, each built from the page's own data
  - [x] baby-cry · cry spectrogram terrain → bandpass → 461 features → forest vote; pick a cry type
  - [x] eeg-emotion · ink head, 14 electrodes, traces, VAD cube, report; click an electrode
  - [x] dravidian · Tamil tiles shredded and re-joined, dense / sparse / fused space; switch channel
  - [x] fraud · two glass vaults, SMOTE inside, MLP + forest, sealed packets, hard vote; send a transaction
  - [x] wisp · the IR frame as attribution relief, EfficientNet pyramid, six Captum methods; torch
  - [x] memora · the oak drawer with the page's 40 cards, stamped, filed, filtered, top 3; ask by topic
  - [x] semantic · the page's graph as a 3D blueprint, 32% dedupe, PageRank, partitions; 2-hop on click
  - [x] qubit · isometric blocks, 15×3 matrix, ESG floor, 40% cap, allocation; budget and
        floor sliders re-solve the page's own `allocate()`
- [x] Verify: every scene at desktop 1440 and phone 390; all 11 routes × desktop/phone ×
      normal/reduced motion — 0 errors, 0 failed requests, 0 horizontal overflow; wheel-snap
      through Qubit's deck checked in both motion modes; `npm run build:all` green
- [x] Fixes found on the way: Dravidian's ticker covering a phone's lower third, Qubit's ledger
      printing a 0.699 ESG as "0.70 · below floor", Semantic's "rev. a" tag overflowing a phone
- [x] Push to `portfolio` (live deploy)
