# README rebuild — task tracker

Three pieces of work, in the order they were asked for. `[x]` means done **and
verified**, not done and hoped for.

**All three parts done.** What is left is yours to do. See *Your move* at the bottom.

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

## Part 2 — A proper README for every GitHub repo ✅ DONE — 27 written

30 public repos on `Vishal-AS-0407`. One at a time: shallow clone, read the
code, understand what it actually does, then write it up — problem statement,
novelty, architecture, results, honest limitations.

Output lives in `gh-readmes/<repo-name>/README.md`. Nothing is pushed to your
repos — I have no write access. Publishing instructions: `gh-readmes/HOW-TO-PUBLISH.md`.

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

### Systems and fundamentals — all done
- [x] `Hack-Computer-Using-NAND-Gate`
- [x] `MIPS-to-Binary-converter`
- [x] `Dijkstra-Algorithm` — range checks validate `scanf`'s return value, not the input; double `fclose`
- [x] `Hostel-Magement-System` — **does not compile as committed** (public `Main` in the wrong file); search-by-name crashes (both verified on JDK 17)
- [x] `Telephone-Directory` — `strlwr` lowercases every stored name on modify; uninitialised flag can wipe the book
- [x] `Quiz-Website` — question 4's answer key is wrong; two cleanup commits broke the background and the contact redirect

### Needs a decision rather than a README
- [ ] `Vega-Agent` — a fork with no commits from you, currently **pinned first**
      on your profile. Unpin it, or label it plainly as a fork you contributed
      to. Leaving it pinned and unlabelled is the one option that costs you.
- [x] `temp` / `portfolio` — covered by `gh-readmes/portfolio/`, rewritten for the two-sites-one-deploy setup
- [x] `Vishal-AS-0407` — the profile repo, covered by Part 3

## Part 3 — The GitHub profile README ✅ DONE

- [x] Read what was already built in `gh-profile/`
- [x] Rendered in both colour schemes with `build/preview_readme.py`. Clean, no broken assets
- [x] Brought up to date: iQOO ReSkill win added, every selected-work row links its
      `/work/<slug>` case study, plain version linked, date stamp updated
- [x] Publishing instructions: `gh-profile/HOW-TO-PUBLISH.md` (the domain-swap step is gone,
      because the live domain now serves the new site)

## Part 4 — Portfolio follow-ups ✅ DONE

- [x] **One deployment.** The plain site builds into `v2/dist/plain` and is served at `/plain/`.
      A root `vercel.json` and `v2/vercel.json` both build the combined site, so it deploys
      whichever folder the Vercel project is rooted at
- [x] Cross-links are same-origin and open in the same tab; canonical URLs, sitemap and
      robots all point at the live domain
- [x] **Winner — iQOO ReSkill Hackathon, Chennai City Battle** added to both sites, the
      resume (`2p/main.tex`) and the profile README. Also fixed NCPI → NPCI
- [x] Removed the committed `vite.config.ts.timestamp-*.mjs` and ignored the pattern
- [x] Combined build verified: both sites render, cross-links work, zero console errors,
      zero failed requests

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

## Your move

1. **Rotate the credentials above.** This is the only urgent item.
2. **Push this repo.** If the Vercel project builds from this repo, the live URL switches to the
   new site, with the plain version at `/plain/`. If it builds from the separate `portfolio` repo,
   push there too, or point the Vercel project at this one.
3. Publish the READMEs (`gh-readmes/HOW-TO-PUBLISH.md`) and the profile
   (`gh-profile/HOW-TO-PUBLISH.md`).
4. Unpin `Vega-Agent`.
