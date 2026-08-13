# Content Inventory — extracted from existing repo

> Source of truth for the rebuild. Everything below is lifted verbatim from the current
> `src/components/*` files. Claims flagged `[VERIFY]` need checking against research files
> `02-profile-research.md` (academic/professional) and `01-github-audit.md` (projects).
>
> Extracted: 2026-08-08

---

## 1. Identity

| Field | Value |
|---|---|
| Name | Vishal A S |
| Title (current) | AI Developer & ML Engineer |
| Location | Coimbatore, Tamil Nadu, India |
| Email | vishal.as04@outlook.com |
| GitHub | https://github.com/Vishal-AS-0407 |
| LinkedIn | https://www.linkedin.com/in/vishal-a-s04/ |
| Google Scholar | https://scholar.google.com/citations?user=fPK6EDAAAAAJ&hl=en |
| ResearchGate | https://www.researchgate.net/profile/Vishal-A-S-3 |
| MyAnimeList | https://myanimelist.net/profile/Eren_D_Yeager |
| Live site (old) | https://portfolio-sigma-blond-57.vercel.app/ |
| Intended domain | vishalas.dev (referenced in `index.html` canonical — **not yet live**) |
| Avatar | https://avatars.githubusercontent.com/u/120391903?v=4 |
| GitHub bio | "✨ Aspiring AI Developer \| 🎓 B.Tech in Computer Science with AI \| 🤖 Exploring the intersection of Deep Learning, and real-world application 🌍" |
| GitHub stats | 29 public repos, 4 followers, account created 2022-12-12 |

**Positioning line (current, Hero):**
> "Transforming ideas into intelligent solutions. B.Tech in Computer Science (AI) at Amrita
> Vishwa Vidyapeetham. Passionate about Deep Learning, LLMs, Computer Vision, and building
> AI-powered applications that make a difference."

**Status badge:** "Available for opportunities"

---

## 2. About — long-form copy

> I build **AI systems** that solve real world problems — not just classroom ones. From
> healthcare automation to speech and language intelligence, I enjoy taking ideas from
> *research papers to working products*.

> My work spans machine learning, deep learning, NLP, and scalable backend systems. I focus
> heavily on data quality, model explainability, and deployment-ready solutions rather than
> just accuracy numbers.

**Headline stats (current):** 7+ Major Projects · 3 Publications · 2 Patents Filed

> ⚠️ "7+ Major Projects" undersells him — GitHub shows 29 repos. Recount after the audit.

---

## 3. Education

- **Amrita School of Engineering**, Amrita Vishwa Vidyapeetham, Coimbatore, India
- **B.Tech in Computer Science and Engineering**, Specialization: **Artificial Intelligence**
- 2022 — 2026 · **CGPA 8.29**
- Key coursework: Machine Learning · Deep Learning · Natural Language Processing ·
  Computer Vision · Data Structures · Algorithms · Database Systems · Cloud Computing

---

## 4. Experience

### AI Developer — NASSCOM Foundation
*July 2024 – February 2025*
- Co-led the team and collaborated with mentors and investors to refine app features
- Achieved **90%+ positive feedback** in 20-user closed beta on Play Store
- Built AI-powered medical app **NurtureSync** (**funded by Cisco**) achieving **95% health-insight
  accuracy** on tablet images & medical reports, with a drug compatibility analyser
- Optimized OCR+NLP pipeline to cut processing time by **35%**; built medical community platform
- Developed end-to-end real-time voice bot with **ASR–LLM–TTS** pipeline and speaker verification
  across **9 Indian languages**
- Fine-tuned models for chronic disease queries and speech emotion recognition

### Freelance Product Developer — Independent Consultant
*July 2025 – Present*
- Consulting for **3 textile manufacturers in Tiruppur**: SS Garments, Janshi Text, Barath Garments
- Multi-source trend analysis platform (Google Trends + e-commerce + social) for real-time market insight
- Agentic AI system with mathematical reasoning and a **GRPO RL fine-tuned VQA model**, Tamil support
- Cloth-cutting optimization to minimize fabric waste in mass production
- B2B wholesale marketplace with multilingual voice assistant
- CV models for Indian traditional dress classification + automated product cataloging

> **Note on ordering:** the current site lists NASSCOM first, then Freelance — but Freelance is
> the *current* role. Reverse to reverse-chronological in the rebuild.

---

## 5. Projects (as listed on current site — 7 of 29 repos)

Ordered as they appear now. `featured: true` on the first three.

### ⭐ VEGA — *featured*
Personalized career guidance system using Firecrawl + Serper for job aggregation, and
Multi-Agentic RAG pipelines with Groq for bias-free, context-aware guidance. Resume builder
with 96% ATS pass rate.
- **Tech:** LangChain, CrewAI, Groq, Firecrawl, MCP, Selenium
- **Metrics:** 96% ATS pass rate · Multi-agent memory architecture · Personalized roadmaps
- **Links:** both `#` (broken) — repo is `Vega-Agent` (a fork) `[VERIFY]`

### ⭐ Decentralized Fraud Detection — *featured*
Privacy-preserving fraud detection for NCPI `[VERIFY: likely NPCI]` using Federated Learning
and Homomorphic Encryption. Includes VQA-based customer care chatbot with multilingual voice.
- **Tech:** PyTorch, Scikit-learn, CKKS, Federated Learning
- **Metrics:** 99% accuracy · 3ms inference · privacy-preserving
- **Repo:** `Fraud-Detection-and-VQA-Based-Multilingual-Customer-Care-Chatbot-with-Speech-Support`

### ⭐ Qubit — Green Finance System — *featured*
Multi-agent system analyzing project PDFs, supply chain, climate and economic data for ESG
metrics. Novel **15×3 SDG Impact Matrix** covering 15 UN SDGs.
- **Tech:** Serper, Agentic AI, Constraint Optimization
- **Repo:** `Qubit-GreenFinance` (fork) `[VERIFY]`

### Memora
Domain-wise hierarchical memory for LLMs — tags conversations by topic, retrieves relevant slices.
- **Tech:** LlamaIndex, Pinecone, Redis, Semantic Caching
- **Metrics:** hallucination 14.3% → 1.4% (**91% reduction**) · 60% token reduction · 35% latency cut
- **Repo:** `Memora`

### Why My Baby is Crying
Real-time infant care assistant detecting cry reasons via an ensemble signal-processing model.
Tracks cry patterns, feeding times, sleep cycles.
- **Tech:** Keras, Librosa, Scipy, Streamlit, Gemini, MLOps
- **Metrics:** 98% accuracy · 0.5ms inference · LIME/SHAP explainability
- **Repo:** `Why-is-my-Baby-Crying`

### Mental Health Analysis
Multimodal EEG analysis combining VAD and ERP for real-time brain wave interpretation with
explainable cognitive state tracking.
- **Tech:** Signal Processing, EEG, Transformers, RAG, GPT
- **Metrics:** 97% accuracy · 9.7ms inference · dual-agent LLM pipeline
- **Repo:** `Patient-Mental-Health-Monitoring-Using-EEG`

### WISP
GenAI-driven Wildlife Species Identification + Explainability for rare species detection from
camera-trap images. Multi-agent system produces threat maps.
- **Tech:** OpenCV, Captum, Timm, Docker, CrewAI
- **Metrics:** 95% test accuracy · 30% inference optimization · auto PDF reports
- **Repo:** `WISP`

### 🔴 Projects on GitHub but NOT on the site
`Agrizon` (live at https://agri-zon.vercel.app) · `Nurture-Sync` (the Cisco-funded flagship!) ·
`Claire_Chatbot` (a patented system!) · `Clothcut` · `Vatsal-AI` ·
`RAG-Based-Financial-Advisor-System-with-Pinecone-and-Gemini` ·
`Sentiment-Analysis-and-Mental-Health-Guidance-in-Azure` · `Aerosol-Optical-Depth-Estimation` ·
`Hybrid-Time-Series-FrameWork` · `The-Efficient-AI-Challenge---Birds-Classification` ·
`ml-algorithms-from-scratch` · `sematic_model_unstructured_data` ·
`NAACL_DravidianLangTech_2025` (the Rank-1 paper's code!)

> **Biggest content gap:** NurtureSync, Claire and the DravidianLangTech code are among his
> strongest credentials and none are in the Projects section.

---

## 6. Research & Publications

### Publications
1. **Multiclass Political Sentiment Analysis in Tamil X (Twitter) Comments: Leveraging Feature
   Fusion of IndicBERTv2 and Lexical Representations**
   Synapse@DravidianLangTech 2025 — listed as "ACL (A* Conference)" `[VERIFY: likely NAACL 2025]`
   🏆 **Rank 1 Winner** · link is `#` (broken) `[NEEDS ACL Anthology URL]`
2. **Single-Modality Emotion Detection: EEG-Based Feature Engineering and Interpretability**
   ICBSII · 🏆 **Best Paper Award** · link is `#` (broken) `[NEEDS DOI]`
3. **From Vision to Reasoning: A Bilingual Fine-Tuning Approach for Vision-Language Models on
   Mathematical Reasoning Tasks** — ICICC · *Under Review*

### Patents (filed)
1. **Nalam AI** — App. No. **202541065699** — personalized medicine compatibility checker that
   analyzes medical reports for tailored insights and recommendations.
2. **Claire** — App. No. **202541092811** — AI trend analysis integrating Google Trends, Reddit,
   e-commerce data and statistical modeling for actionable fashion insight for manufacturers.

---

## 7. Achievements

| Award | Organization | Note |
|---|---|---|
| 🏆 Rank 1 — DravidianLangTech | NAACL | Tamil political sentiment analysis |
| 🥈 Runner Up — DigiPay Pro Hackathon | NCPI & IIT Bombay `[VERIFY: NPCI]` | privacy-preserving fraud detection |
| ⭐ Top 25 — ThingQbator Cohort 7 | out of 1,200+ teams | AI healthcare |
| ⚡ Finalist — Health Hack | VIT Bhopal & Johns Hopkins | healthcare AI |
| 🏆 Top 50 — IndustriAI | IIT Madras | industrial AI |
| 🥉 Non-Academic Achievement Award 2025 | Amrita Vishwa Vidyapeetham | extracurricular |

---

## 8. Certifications

| Certification | Issuer | Date |
|---|---|---|
| AI Engineer Agentic Track: The Complete Agent & MCP Course | Udemy | Dec 2025 |
| The Complete Python Developer | DeepLearning.AI & Stanford `[VERIFY — issuer looks wrong]` | Oct 2023 |
| Ethical Hacking Essentials (EHE) | EC-Council | Mar 2024 |
| Python for Data Science, AI & Development | IBM | Dec 2025 |
| The Complete Prompt Engineering for AI Bootcamp | Udemy | Nov 2025 |
| Business Communication Skills: Business Writing & Grammar | Udemy | Dec 2025 |

Overflow link → https://www.linkedin.com/in/vishal-a-s04/details/certifications/

---

## 9. Leadership

- **Research and Development** — TENSOR Amrita — Oct 2024 – Jun 2025
  Contributing to AI research initiatives and development projects within the university's
  premier technical club.
- **Public Relations** — ICEP 2024 — Dec 2023 – Feb 2024
  Managed communications and outreach for the International Conference on Engineering Practices.

---

## 10. Extracurricular — Chess

- **International FIDE-Rated Player** `[VERIFY: FIDE ID / rating]`
- 100+ tournaments competed (international, national, state, domestic)
- 50+ tournament wins
- **Bronze** — State Selection Championship medalist
- Other sports: Skating · Badminton · Football

> Copy: "Chess has been instrumental in developing my strategic thinking and problem-solving
> abilities."

---

## 11. Hobbies

- **Anime enthusiast** — "From action-packed shonen to thought-provoking seinen." MAL profile
  handle is `Eren_D_Yeager` (Attack on Titan × One Piece mashup — good easter-egg material).
- **Gardening** — maintains a **rooftop garden** growing flowers, vegetables and fruit.
  "A great way to disconnect from screens and connect with nature."

---

## 11b. Social links — contextual placement

> **Client decision:** don't dump all socials in one generic footer row. Surface each link
> *inside the section it belongs to*, so it reads as evidence rather than decoration. Keep a
> full set in the contact/footer area as well, for completeness.

| Context | Links surfaced there |
|---|---|
| Research / Publications | Google Scholar · ResearchGate · (per-paper: ACL Anthology, IEEE DOI) |
| Projects / Work | GitHub (profile + per-project repo) · live demo URLs |
| Experience | LinkedIn |
| Hobbies / The Human | MyAnimeList (`Eren_D_Yeager`) · chess profile `[handle needed]` |
| Contact / Footer | Everything + email |

**Known handles**

| Platform | URL |
|---|---|
| GitHub | https://github.com/Vishal-AS-0407 |
| LinkedIn | https://www.linkedin.com/in/vishal-a-s04/ |
| Google Scholar | https://scholar.google.com/citations?user=fPK6EDAAAAAJ&hl=en |
| ResearchGate | https://www.researchgate.net/profile/Vishal-A-S-3 |
| MyAnimeList | https://myanimelist.net/profile/Eren_D_Yeager |
| Email | vishal.as04@outlook.com |

**Still needed from Vishal:** FIDE ID / chess.com / Lichess handle · X/Twitter · Kaggle ·
Hugging Face · Medium/blog · Instagram — any that exist and he wants shown.

---

## 12. Contact

Form posts to **Supabase** table `contact_messages` (columns: name, email, subject, message).
Migration at `supabase/migrations/20260803092840_create_contact_messages.sql`.
Name and email optional; subject and message required. **Keep this backend in the rebuild.**

---

## 13. Existing assets

| Path | Note |
|---|---|
| `src/assets/profile-photo.jpg` | Portrait — reuse, may need a higher-res version |
| `src/assets/sakura-hero-bg.png` | Cherry-blossom background — currently unused in code |
| `public/favicon.ico` | Default Vite favicon — replace |
| `public/placeholder.svg` | Unused |

> No project screenshots exist locally. See `01-github-audit.md` § Asset inventory for
> images found in repo READMEs.

---

## 14. Current tech stack (what we keep)

**Keep:** Vite 5 · React 18 · TypeScript 5.8 · Tailwind 3.4 · framer-motion 12 · gsap 3.15 ·
lenis 1.3 · @supabase/supabase-js · react-router-dom 6 · lucide-react

**Likely drop:** most of the ~30 Radix/shadcn `ui/*` components (only a handful are used) ·
recharts · embla-carousel · react-day-picker · input-otp · vaul · cmdk · react-resizable-panels ·
react-hook-form + zod (the contact form is hand-rolled) · `lovable-tagger`

**Likely add:** three.js + @react-three/fiber + drei (or `ogl`) · GSAP ScrollTrigger/SplitText ·
a self-hosted font pipeline (replace the 3 render-blocking Google Fonts `@import`s)

**Cruft to delete:** `vite.config.ts.timestamp-*.mjs` · duplicate lockfiles
(`bun.lockb` + `package-lock.json` — pick one)

---

## 15. Design sins in the current build (to consciously avoid)

Cross-check with the anti-pattern list in `03-design-research.md`:

- Dark navy/teal (`--background: 200 25% 4%`) + cyan-teal primary (`172 80% 55%`) — the
  default "AI startup" palette
- `glass` / `glass-strong` / `glass-card` used on **every single card** — glassmorphism overload
- `NeuralField` — a literal neural-network node-and-edge particle canvas
- `.gradient-text` teal→cyan→orange on every heading
- `Sparkles` icon used as a decorative motif in Hero and Projects
- Every one of the 13 sections is the same shape: `SectionHeader` + a grid of glass cards
- `text-shadow-glow`, `pulse-glow`, `animate-float` — generic glow vocabulary
- Space Grotesk + Syne + JetBrains Mono — the standard 2023-25 "tech portfolio" trio
- Broken `#` links on VEGA, both publications, and "Why My Baby is Crying"

---

## 16. Decisions already locked with the client

| Decision | Choice |
|---|---|
| Primary audience | **AI/ML recruiters & hiring managers** |
| Section count | **Keep all 13** — differentiate by *treatment*, not by cutting |
| Architecture | **Hybrid** — cinematic single scroll + full case-study pages |
| Project coverage | **Add every missing project** (NurtureSync, Claire, Agrizon, Clothcut, Vatsal-AI, DravidianLangTech, RAG Financial Advisor, Azure Sentiment, Aerosol, Hybrid Time-Series) |
| Case-study pages | **Every substantial project gets its own page with its OWN distinct theme** — not a shared template. Deep content: problem → approach → architecture → results, with animated stats and pipeline diagrams. |
| Motion budget | **Maximum** — WebGL/shaders, pinned ScrollTrigger, custom cursor, page transitions, with reduced-motion + mobile fallbacks |
| Easter eggs | Wanted — see `03-design-research.md` § idea bank |
| Content trust | **All of Vishal's claims are taken as true.** Do not re-verify or hedge. Research output is for *enrichment* (citations, DOIs, extra metrics, links) — never for challenging a claim. Present awards, patents, rankings and chess record exactly as he states them. |
| Socials | **Contextual placement** — see §11b |

### Enrichment gained from research (use these, they strengthen existing claims)

- **DravidianLangTech paper** — team **Synapse**, macro-F1 **0.3773**, **1st of 25 teams**
  (139 registrants). ACL Anthology: https://aclanthology.org/2025.dravidianlangtech-1.122/ ·
  DOI `10.18653/v1/2025.dravidianlangtech-1.122` · pp. 716–720 · NAACL 2025 workshop.
- **ICBSII / EEG paper** — **Vishal is first author**. DOI
  `10.1109/ICBSII65145.2025.11013139` · IEEE · pp. 1–9 · ICBSII 2025, SSN Chennai, Mar 26–28 2025.
  Co-author: Dr. Amrutha Veluppal. **Unused metrics worth showing:** DREAMER dataset,
  **98.6% / 96.6% / 95.7%** on valence / arousal / dominance, **9.78 ms** inference.
  Most-cited work (6 citations).
- **Google Scholar** — 8 citations, h-index 2.
- **DigiPay Pro** is NPCI's own competition, run at **Techfest 2024 (IIT Bombay)**.
- Spelling only: the organisation is **NPCI** (National Payments Corporation of India) —
  currently written "NCPI" in `Achievements.tsx` and `Projects.tsx`.
- Do **not** list the WcCST 2026 gesture/3D-avatar paper — Semantic Scholar has wrongly merged
  a different Vishal (K.S. Rangasamy College) into the author record.

### SEO note

The current site is a client-rendered SPA that serves non-JS crawlers nothing but a `<title>`.
Recruiters and Google both lose. Fix with pre-rendering (`vite-plugin-prerender` /
`react-snap`) or static meta injection per route in the rebuild.

### Implication of per-project theming

The design system must be built as a **themeable shell**, not a fixed skin:

- A global `ProjectTheme` token contract (bg, ink, accent, grain/texture, type pairing,
  signature motion) that each case-study route supplies its own values for.
- The site chrome (cursor, nav, transitions, footer) stays constant so the site still reads as
  one authored object; only the *world inside* each case study changes.
- Page transitions should feel like crossing into that project's world — the theme swap is the
  payoff of the transition, not an accident of it.
- Each project's theme derives from its **domain**, not from a random palette: EEG →
  oscilloscope, wildlife → camera-trap + topography, infant cry → spectrogram, fraud →
  encrypted ledger, textiles → woven grid + cutting layout, green finance → SDG matrix.
  See `01-github-audit.md` § visual-identity cues.
