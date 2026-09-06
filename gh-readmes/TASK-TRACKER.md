# README rebuild — task tracker

Three pieces of work, in the order they were asked for. `[x]` means done **and
verified**, not done and hoped for.

---

## Part 1 — Audit the eight project pages and the landing page

- [x] Cleanup balance swept across all eight pages: every `addEventListener`,
      `requestAnimationFrame`, `ResizeObserver`, `IntersectionObserver`,
      `setTimeout` and GSAP context accounted for and released on unmount
- [x] Accessibility swept: no `<img>` without `alt`, every decorative canvas
      `aria-hidden`, every meaningful canvas `role="img"` with a real label,
      every page overriding `:focus-visible` and `::selection` in its own colour
- [x] Dead-module check — nothing unreferenced
- [x] `prefers-reduced-motion` blocks checked against the global reset; no page
      depends on a transition the global rule would kill
- [x] Infinite animations checked — the one that exists (`wisp`'s bounding-box
      draw) is explicitly stopped under reduced motion
- [x] **Fixed:** landing page was in every project route's critical path
      (three.js 462 kB + gsap + Stage + landing bundle). Entry chunk
      309 kB → 167 kB
- [x] **Fixed:** `index.html` preloaded the landing's two fonts (128 kB) on
      every route, competing with each project page's own faces
- [x] **Fixed:** `content.ts` carried 11 stale presentation fields per project;
      `theme.accent` and `theme.name` still described the *old* sub-pages, so
      the index previewed a world it no longer opened into
- [x] **Fixed:** `dravidian-sentiment` left its exit-transition timer running
      after unmount — browser Back inside the window threw you forward again
- [x] Build green, all eight pages + index re-rendered, no console errors, no
      horizontal overflow
- [x] Committed — `89e6849`

## Part 2 — A proper README for every GitHub repo

30 public repos on `Vishal-AS-0407`. One at a time: clone, read the code,
understand what it actually does, then write it up — problem statement,
novelty, architecture, results, honest limitations.

### The eight with case studies
- [x] `Patient-Mental-Health-Monitoring-Using-EEG`
- [ ] `NAACL_DravidianLangTech_2025`
- [ ] `Why-is-my-Baby-Crying`
- [ ] `Fraud-Detection-and-VQA-Based-Multilingual-Customer-Care-Chatbot-with-Speech-Support`
- [ ] `WISP`
- [ ] `Memora`
- [ ] `sematic_model_unstructured_data`
- [ ] `Qubit-GreenFinance`

### Products and applications
- [ ] `Nurture-Sync`
- [ ] `Claire_Chatbot`
- [ ] `Clothcut`
- [ ] `Agrizon`
- [ ] `Vatsal-AI`
- [ ] `portfolio`

### Machine learning
- [ ] `Hybrid-Time-Series-FrameWork`
- [ ] `Heart-Disease-Prediction-and-Symptom-Analysis`
- [ ] `RAG-Based-Financial-Advisor-System-with-Pinecone-and-Gemini`
- [ ] `Sentiment-Analysis-and-Mental-Health-Guidance-in-Azure`
- [ ] `The-Efficient-AI-Challenge---Birds-Classification`
- [ ] `Aerosol-Optical-Depth-Estimation`
- [ ] `ml-algorithms-from-scratch`

### Systems and fundamentals
- [ ] `Hack-Computer-Using-NAND-Gate`
- [ ] `MIPS-to-Binary-converter`
- [ ] `Dijkstra-Algorithm`
- [ ] `Hostel-Magement-System`
- [ ] `Telephone-Directory`
- [ ] `Quiz-Website`

### Needs a decision rather than a README
- [ ] `Vega-Agent` — a fork with no commits from you
- [ ] `temp` — this portfolio's own remote
- [ ] `Vishal-AS-0407` — the profile repo, covered by Part 3

## Part 3 — The GitHub profile README

- [ ] Read what was already built in `gh-profile/`
- [ ] Check it renders, reads well, and matches the portfolio's content
- [ ] Bring it up to date with the rebuilt project pages
- [ ] Publishing instructions
