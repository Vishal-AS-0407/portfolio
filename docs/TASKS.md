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
| Streak card | DenverCoder1/github-readme-streak-stats | ✅ real data |
| Animated GIFs, dividers, emojis | Anmol-Baranwal/Cool-GIFs-For-GitHub | ✅ |
| Structure (ToC, Built With, Usage, Roadmap…) | othneildrew/Best-README-Template | ✅ |
| Activity graph · trophies | Ashutosh00710 · ryo-ma | ❌ 402 — **not used** |
| Native: Mermaid, `> [!NOTE]` alerts, `<details>` | GitHub | ✅ |

- [x] Shared kit: one set of header/footer/divider/badge conventions, a colour per project
- [x] Profile README (Vishal-AS-0407) — your animated style, upgraded: results with evidence,
      case-study links, stats + streak, fixed Google Scholar link (was a placeholder)
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
- [ ] Story rig + poses → parallax scenery → scenes 1–9 → polish
- [ ] Verify (desktop, phone, reduced motion, perf) → push

## Phase 4 (last) — Project sub-page overhaul

Your note: some pages feel like the base page lightly modified; make them far richer, with
scroll storyboards and a 3D interactive piece each.

- [ ] Audit all 8 pages side by side; list what reads as reused or thin
- [ ] Per page: a scroll storyboard told in that project's own visual language + one
      interactive 3D/WebGL piece that is about the project's actual mechanism
- [ ] Plan per page first, then build one page at a time, verify, commit
