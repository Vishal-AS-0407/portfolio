# README rebuild — task tracker

Three pieces of work, in the order they were asked for. `[x]` means done **and
verified**, not done and hoped for.

**Paused at your request (credits).** Resume point is at the bottom.

---

## Part 1 — Audit the eight project pages and the landing page ✅ DONE

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

## Part 2 — A proper README for every GitHub repo — **23 of 30**

30 public repos on `Vishal-AS-0407`. One at a time: shallow clone, read the
code, understand what it actually does, then write it up — problem statement,
novelty, architecture, results, honest limitations.

Output lives in `gh-readmes/<repo-name>/README.md`. Nothing is pushed to your
repos — I have no write access. Publishing instructions still to be written
(see resume point).

### The eight with case studies — all done
- [x] `Patient-Mental-Health-Monitoring-Using-EEG`
- [x] `NAACL_DravidianLangTech_2025`
- [x] `Why-is-my-Baby-Crying`
- [x] `Fraud-Detection-and-VQA-Based-Multilingual-Customer-Care-Chatbot-with-Speech-Support`
- [x] `WISP`
- [x] `Memora`
- [x] `sematic_model_unstructured_data`
- [x] `Qubit-GreenFinance`

### Products and applications — all done
- [x] `Nurture-Sync`
- [x] `Claire_Chatbot`
- [x] `Clothcut`
- [x] `Agrizon`
- [x] `Vatsal-AI`
- [x] `portfolio`

### Machine learning — all done
- [x] `Hybrid-Time-Series-FrameWork`
- [x] `Heart-Disease-Prediction-and-Symptom-Analysis`
- [x] `RAG-Based-Financial-Advisor-System-with-Pinecone-and-Gemini`
- [x] `Sentiment-Analysis-and-Mental-Health-Guidance-in-Azure`
- [x] `The-Efficient-AI-Challenge---Birds-Classification`
- [x] `Aerosol-Optical-Depth-Estimation`
- [x] `ml-algorithms-from-scratch`

### Systems and fundamentals — 2 of 6
- [x] `Hack-Computer-Using-NAND-Gate`
- [x] `MIPS-to-Binary-converter`
- [ ] `Dijkstra-Algorithm` — cloned, not written
- [ ] `Hostel-Magement-System` — cloned, not written
- [ ] `Telephone-Directory` — cloned, not written
- [ ] `Quiz-Website` — cloned, not written

### Needs a decision rather than a README
- [ ] `Vega-Agent` — a fork with no commits from you, currently **pinned first**
      on your profile. Unpin it, or label it plainly as a fork you contributed
      to. Leaving it pinned and unlabelled is the one option that costs you.
- [ ] `temp` — this portfolio's own remote
- [ ] `Vishal-AS-0407` — the profile repo, covered by Part 3

## Part 3 — The GitHub profile README — **not started**

- [ ] Read what was already built in `gh-profile/` (README.md, 8 SVG assets,
      a build script, REPO-METADATA.md, HOW-TO-PUBLISH.md — all written, none
      pushed)
- [ ] Check it renders, reads well, and matches the portfolio's content
- [ ] Bring it up to date with the rebuilt project pages
- [ ] Publishing instructions

---

## 🔴 Do this before anything else — exposed credentials

Found while reading the code. **Every one of these is live and in a public git
history.** Deleting the line does not help; the value stays in history, so
rotation is the step that actually protects the account.

| Repo | File | What | Priority |
|---|---|---|---|
| `Nurture-Sync` | `backend/.env` | **MongoDB URI with username + password** — read/write on a database of health records | 🔴 now |
| `Nurture-Sync` | `client_secret_683416806905-*.json` ×2 | Google OAuth client secrets | 🔴 now |
| `Agrizon` | `backend/.env` | Gemini API key + MongoDB URI | 🔴 now |
| `Fraud-Detection-...` | `test.py` | **Gmail App Password** + two personal addresses | 🔴 now |
| `WISP` | `cvai.py` | Serper key + Gemini key | 🟠 |
| `Claire_Chatbot` | `finalchatbot.py` | Gemini key + Sarvam key | 🟠 |
| `Why-is-my-Baby-Crying` | `ai.py` | Gemini key (same key as `Vatsal-AI`) | 🟠 |
| `Vatsal-AI` | `sample2.py` | Gemini key (same key as above — one revoke covers both) | 🟠 |
| `Qubit-GreenFinance` | `analytics_service.py` | Gemini key | 🟠 |
| `Nurture-Sync` | `voiceassistant.py` | Sarvam key + Gemini key | 🟠 |

Clean, for contrast: `RAG-Based-Financial-Advisor` and
`Sentiment-Analysis-...-Azure` both read keys from the environment, and
`sematic_model_unstructured_data` ships a `.env.example` with no real `.env`.

Revoke links — Gemini <https://aistudio.google.com/app/apikey> ·
Serper <https://serper.dev/api-key> · Gmail App Passwords: Google Account →
Security → 2-Step Verification → App passwords.

---

## Resume point

Pick up with the four small systems repos, then Part 3.

1. `Dijkstra-Algorithm` (C, plus a `sample result.html`), `Telephone-Directory`
   (C), `Hostel-Magement-System` (Java — note the repo name is misspelled
   "Magement"; renaming is free and GitHub redirects the old URL), `Quiz-Website`
   (HTML/CSS/JS). All four are already cloned in the scratchpad.
2. Write `gh-readmes/HOW-TO-PUBLISH.md` — the copy-into-each-repo instructions,
   same shape as `gh-profile/HOW-TO-PUBLISH.md`.
3. Part 3: review and finish the profile README in `gh-profile/`.

Commits so far, newest first:

```
a603b15  docs(readmes): Hack computer and MIPS converter
bf36b38  docs(readmes): birds distillation, AOD, from-scratch ML, Azure sentiment
99aa156  docs(readmes): the first three ML repos
7e1bd53  docs(readmes): Agrizon, Vatsal-AI and the portfolio repo
6cbcb47  docs(readmes): Nurture-Sync, Claire and Clothcut
e7d5d3c  docs(readmes): Memora, SemantiGraph and Qubit
b2f135f  docs(readmes): write the first five repo READMEs from the source
89e6849  perf(routes): take the landing page off every project route's critical path
```

Working tree clean, v2 build green.
