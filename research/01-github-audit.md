# GitHub Audit — Vishal A S (`Vishal-AS-0407`)

**Audit date:** 2026-08-08
**Source:** GitHub REST API (unauthenticated), `raw.githubusercontent.com`, blob-less bare clones, and the rendered HTML profile.
**Scope:** all 29 public repositories.

### How to read this document

Two labels are used throughout and never mixed:

- **[README]** — stated verbatim or near-verbatim in the repository's own README / docs.
- **[INFERRED]** — my conclusion from code, file structure, commit history, or dependency files. Not claimed by Vishal anywhere.

A third label appears where it matters:

- **[VERIFIED]** — a number I read directly out of a committed notebook output cell or dependency file, i.e. reproducible evidence rather than a README claim.

Where a README is empty or thin, this document **says so**. No description has been invented to fill a gap.

---

## 1. Profile summary

| Field | Value |
|---|---|
| Name | Vishal A S |
| Username | `Vishal-AS-0407` (user id 120391903) |
| Bio | "✨ Aspiring AI Developer \| 🎓 B.Tech in Computer Science with AI \| 🤖 Exploring the intersection of Deep Learning, and real-world application 🌍" |
| Company | Amrita Vishwa Vidyapeetham, Coimbatore |
| Location | Coimbatore, Tamil Nadu, India |
| Blog / site | https://portfolio-sigma-blond-57.vercel.app/ |
| Public repos | 29 (0 gists) |
| Followers / following | 4 / 2 |
| Account created | 2022-12-12 |
| Account age | ~3 years 8 months at audit date |
| Profile last updated | 2026-07-30 |
| Achievement badge | Pull Shark |
| Avatar | https://avatars.githubusercontent.com/u/120391903?v=4 |

### Contact identities found

- **Email (public, profile README):** `vishalpersonal04@gmail.com`
- **LinkedIn:** https://www.linkedin.com/in/vishal-a-s04/
- **Second git identity:** many commits are authored by **`vishalwebnew <cb.en.u4aie22159@cb.students.amrita.edu>`**. [INFERRED] This is the same person using a second account / university email. Worth knowing because contributor lists on his own repos show two names that are both him. **Note:** that address encodes his university roll number (`cb.en.u4aie22159`) — consider whether it should appear on a public portfolio.

### Pinned repositories (from HTML profile, in order)

1. `Vega-Agent` ⚠️ *(a fork with zero commits from Vishal — see §4.10)*
2. `Fraud-Detection-and-VQA-Based-Multilingual-Customer-Care-Chatbot-with-Speech-Support`
3. `Sentiment-Analysis-and-Mental-Health-Guidance-in-Azure`
4. `Why-is-my-Baby-Crying`
5. `WISP`
6. `sematic_model_unstructured_data`

### Languages by bytes (summed across all 29 repos)

Total: **7,083,173 bytes**

| Language | Bytes | Share |
|---|---:|---:|
| Jupyter Notebook | 3,760,719 | 53.09% |
| Python | 1,789,543 | 25.26% |
| TypeScript | 766,895 | 10.83% |
| HTML | 273,906 | 3.87% |
| Dart | 233,770 | 3.30% |
| Scilab | 79,131 | 1.12% |
| CSS | 62,928 | 0.89% |
| C | 29,030 | 0.41% |
| C++ | 25,691 | 0.36% |
| Java | 23,009 | 0.32% |
| CMake | 19,629 | 0.28% |
| JavaScript | 10,524 | 0.15% |
| Swift | 3,362 | 0.05% |
| Batchfile | 2,817 | 0.04% |
| PLpgSQL | 1,802 | 0.03% |
| Assembly | 205 | 0.00% |
| Kotlin | 121 | 0.00% |
| Procfile | 53 | 0.00% |
| Objective-C | 38 | 0.00% |

[INFERRED] The C++/CMake/Swift/Kotlin/Objective-C bytes are almost entirely Flutter scaffolding inside `Nurture-Sync`, not hand-written code. The honest headline is **Python + Jupyter for ML, TypeScript for web, Dart for mobile**.

### Profile README (`Vishal-AS-0407/Vishal-AS-0407`)

A heavily animated profile README (7,125 bytes, created 2025-07-16). Contents:

- A `class VishalAS` Python code block declaring: role "AI Developer & ML Engineer", education "B.Tech CSE (AI) @ Amrita Vishwa Vidyapeetham", interests `["Deep Learning", "LLMs", "Computer Vision", "NLP"]`, current focus "Building AI-powered healthcare solutions", languages `["Python", "Java", "MATLAB", "SQL"]`.
- **Tech arsenal badges** [README]: Python, TensorFlow, PyTorch, OpenCV, scikit-learn, Pandas, NumPy; LangChain, Hugging Face, OpenAI, Pinecone, Gemini; Azure, Docker, Kubernetes, Git, GitHub Actions; MongoDB, MySQL, PostgreSQL, Firebase, FastAPI, Flask; React, Flutter, Streamlit.
- "🔭 Currently Building: AI-powered healthcare solutions with NurtureSync"
- "🌱 Learning: Advanced LLM architectures and multimodal AI systems"
- **"⚡ Fun fact: International chess player with 50+ tournament wins!"** — a strong, memorable personal hook that appears nowhere else. Worth surfacing on the portfolio.
- ⚠️ **Broken link:** the Google Scholar badge points to `https://scholar.google.com/citations?user=YOUR_GOOGLE_SCHOLAR_ID` — an unedited placeholder.
- ⚠️ Several badges (Docker, Kubernetes, MySQL, PostgreSQL, Firebase, OpenCV, TensorFlow) are **not evidenced by any public repo**. See §6.

---

## 2. Tier A — Flagship projects

Ranked by impressiveness. **Ranking rationale:** I weighted (1) *external validation* — a peer-reviewed paper or competition rank beats a self-reported claim; (2) *verifiable hard numbers* in the repo; (3) *engineering depth* — real module structure, multiple stages, a deployable surface; (4) *whether it is actually his work* — commit share; (5) *demo-ability* — a live URL or screenshots. Novelty of the idea broke ties.

---

### A1. `NAACL_DravidianLangTech_2025` — Synapse @ DravidianLangTech 2025

**Rank 1 in a shared task at a NAACL 2025 workshop, with a published paper.** This is the single strongest credential in the account: it is externally validated, peer-reviewed, and independently checkable.

- **Repo:** https://github.com/Vishal-AS-0407/NAACL_DravidianLangTech_2025
- **Created / pushed:** 2025-01-30 / 2025-01-30
- **Fork of:** `SURIYA-KP/NAACL_DravidianLangTech_2025`. **Vishal authored 7 of 15 commits** (Suriya-KP: 8). This is genuine co-authorship, not a drive-by fork.
- **Paper:** *Synapse@DravidianLangTech2025: Multiclass Political Sentiment Analysis in Tamil X (Twitter) Comments: Leveraging Feature Fusion of IndicBERTv2 and Lexical Representations* — https://openreview.net/forum?id=3emk1VVVKQ (the README's own link is filtered by "the profile of Vishal A S", confirming he is a listed author).

**What it does** [README]: multiclass political sentiment classification of Tamil-language X/Twitter comments into seven sentiment categories.

**Story arc** [README]:
- *Problem:* political sentiment in Tamil social media is code-mixed, emoji-dense, and hashtag-compressed; standard multilingual encoders underperform, and the seven-way label set is highly imbalanced.
- *Constraint:* Tamil is low-resource; hashtags carry a large share of the political signal but are opaque token soup to a tokenizer.
- *Key insight:* two moves. First, **fuse** dense transformer embeddings (IndicBERTv2) with sparse lexical TF-IDF features rather than choosing one — the lexical channel keeps rare political terms that the subword encoder blurs. Second, an **agentic hashtag-expansion step using LLaMA 3.1** rewrites hashtags into natural-language context before encoding, recovering the meaning of `#…` compounds.
- *Result:* Macro-F1 0.3773, **first place** on the shared-task leaderboard.

**Architecture / pipeline (ordered stages)** [README]:
1. Raw Tamil X/Twitter comments
2. Emoji → text conversion (`emoji` library)
3. Agentic hashtag expansion via LLaMA 3.1 (`Agent.py`)
4. Stopword removal
5. Two parallel branches:
   - a. IndicBERTv2-MLM-Back-TLM embeddings
   - b. TF-IDF vectorisation → PCA dimensionality reduction
6. Feature fusion (concatenate dense + reduced-sparse)
7. Classifier head — AdamW, weighted cross-entropy, dropout 0.1, incremental batch sizing across epochs
8. Seven-class sentiment prediction

**Quantitative material** [README] — reproduced verbatim:

Model variant ablation:

| Model | Macro-F1 |
|---|---|
| IndicBERTv2-MLM-Back-TLM | **0.383** |
| IndicBERTv2-MLM-Sam-TLM | 0.376 |
| IndicBERTv2-SS | 0.338 |
| IndicBERTv2-MLM-only | 0.290 |

Shared-task leaderboard:

| Rank | Team | Macro-F1 |
|---|---|---|
| **1** | **Synapse** | **0.3773** |
| 2 | KCRL | 0.3710 |
| 3 | byteSizedLLM | 0.3497 |
| 4 | Eureka-CIOL | 0.3187 |
| 5 | Wictory | 0.3115 |

Other numbers: 7 sentiment classes; dropout 0.1; Python 3.8+.
*Note the small discrepancy: the README quotes 0.38 / 0.383 for the best variant and 0.3773 on the leaderboard. Use **0.3773** as the official result and 0.383 as the dev/ablation figure.*

**Tech stack** [README + requirements]: `transformers` (HuggingFace), PyTorch, IndicBERTv2, LLaMA 3.1, scikit-learn, pandas, `emoji`, TF-IDF, PCA.

**Data artifacts:**
- Workflow diagram — https://github.com/user-attachments/assets/6e04ef85-2bc4-49be-a9e2-44ead374a544
- Model architecture diagram — https://github.com/user-attachments/assets/dee737ab-4956-4de0-8ae7-6468fc2ed21a
- In-repo: 5 training notebooks (`Synapse_model_training_using_IndicBERTv2_*.ipynb`), `TF_IDF_vectorization_PCA.ipynb`, `pre_processing.ipynb`, prediction CSV `Synapse_Tamil_run1.csv`, and a `data/` folder with train/dev/test splits plus TF-IDF-reduced variants.

**Repo vitals:** 15 commits (Vishal 7, Suriya-KP 8) · 2 contributors · 28.3 MB · 6 notebooks · `Agent.py` + `requirements.txt` · no deployable app.

**Visual identity cues:** Domain world is **computational linguistics / political discourse in Tamil**. The natural palette is the Tamil political-media register — deep ink black, saffron and crimson party colours, with the cool institutional blue of academic publishing as a counterweight. The signature visual form is almost given to you: **Tamil script itself as texture** (அ ஆ இ ஈ set large and semi-transparent behind content), plus a **feature-fusion motif** — two streams, one a dense continuous ribbon (transformer embeddings), one a sparse dotted grid (TF-IDF), visibly braiding into a single channel. A seven-segment confusion matrix and a leaderboard bar chart where row 1 ("Synapse") animates into first place are the obvious hero moments. Twitter/X's thread geometry — indented reply chains, hashtag chips expanding into full sentences on hover — would literally illustrate the agentic hashtag-expansion step.

---

### A2. `sematic_model_unstructured_data` — SemantiGraph

The most *engineered* thing in the account: a real multi-module pipeline with a named novel contribution, a benchmark table against its own baseline, and generated showcase artifacts committed to the repo.

- **Repo:** https://github.com/Vishal-AS-0407/sematic_model_unstructured_data
- **Created / pushed:** 2026-01-28 / 2026-01-28
- ⚠️ **The repo name is misspelled** ("sematic" not "semantic"). The project's real name is **SemantiGraph**. Use the real name on the portfolio.

**What it does** [README]: "A Novel Ensemble Semantic Modeling Pipeline for Unstructured Documents" — turns a folder of unstructured PDFs into a structured, queryable knowledge graph with discovered topics.

**Story arc** [README]:
- *Problem:* unstructured PDF corpora resist querying. Standard approaches extract entities with rules/spaCy and cluster with one algorithm, producing noisy entities and mediocre topic separation.
- *Constraint:* single clustering algorithms each fail differently — Louvain finds communities but misses global structure, spectral captures global structure but not long-range semantics, embedding-based methods drift. Picking one means inheriting its blind spot.
- *Key insight:* **don't pick one — run three and vote.** Louvain, spectral clustering, and Node2Vec+HDBSCAN each cluster the graph independently; a co-assignment matrix turns their agreement into consensus clusters that are more robust than any single method. Separately, entity extraction is handed to GPT-4o-mini instead of rules, and entities are deduplicated by fuzzy + semantic matching.
- *Result:* modularity 0.787 (vs a ~0.5 typical baseline and 0.670 for the hierarchical variant), 97.7% retrieval similarity, 32% entity deduplication, for ~$0.45 and ~20 minutes of pipeline runtime.

**Architecture / pipeline (ordered stages)** [README]:
1. PDF corpus (input)
2. **Module 1** — PDF text extraction (PyPDF2 / pdfplumber / pypdf) → JSON
3. **Module 2** — LLM-powered entity extraction (OpenAI GPT-4o-mini), hybrid
4. **Module 3** — global knowledge graph construction
5. **Module 4** — graph enhancement (PageRank)
6. **Module 5** — ⭐ **ensemble semantic clustering** (the novel part), which itself fans out:
   - 6a. Louvain community detection (modularity optimisation)
   - 6b. Spectral clustering (Laplacian eigendecomposition)
   - 6c. Node2Vec embeddings → HDBSCAN
   - 6d. **Consensus voting** via co-assignment matrix
7. Final semantic model — 14 topics, 609 entities, 304 relations
8. Retrieval + interactive visualisation (pyvis HTML)

**Quantitative material** [README] — reproduced verbatim:

| Metric | Score | Assessment |
|---|---|---|
| Modularity | 0.787 | EXCELLENT (>0.7) |
| Retrieval Similarity | 0.977 | Near-perfect |
| Answer Rate | 75% | Good |
| Topic Coverage | 100% | Complete |
| Entity Deduplication | 32% | Significant noise reduction |

Benchmark comparison:

| Model | Modularity | Coherence | F1-Score | Speed |
|---|---|---|---|---|
| **Flat (Ours)** | **0.787** | 0.208 | **0.274** | 82ms |
| Hierarchical | 0.670 | **0.894** | 0.000 | **36ms** |

Also: 609 unique entities · 14 semantic topics · 304 relations · 10+ typed relationship kinds (`uses`, `trained_on`, `evaluated_on`, …) · 98% entity-extraction accuracy claimed · `MIN_CLUSTER_SIZE = 3` · ~20 min runtime · ~$0.45 API cost · top topics table (ViT 28 entities, GPT-3 36, Transformer 30, CLIP 23, Neural Networks 21).

*Honesty note:* the benchmark table is **self-generated** (`comparison/benchmark_results.json` is committed, so it is at least reproducible), and it is a comparison against his own hierarchical variant, not against published baselines. The "Modularity ~0.5" figure for "traditional approach" is asserted without a citation. The coherence column actually **favours** the hierarchical variant (0.894 vs 0.208) — an honest case study should mention that trade-off rather than only the modularity win.

**Tech stack** [requirements.txt]: PyPDF2, pdfplumber, pypdf, `kg-gen`, `litellm`, `dspy-ai`, OpenAI (GPT-4o-mini), pandas, NumPy, scikit-learn, **networkx**, **hdbscan**, **pyvis**, matplotlib, seaborn, tqdm, python-dotenv.

**Data artifacts (in-repo, relative paths):**
- `showcase/knowledge_graph.png` (hero image, used at top of README)
- `showcase/top_entities.png`
- `showcase/metrics_comparison.png`
- `showcase/relationship_distribution.png`
- `comparison/comparison_chart.png`
- `comparison/enhanced_comparison.png`
- Interactive HTML: `showcase/visualizations/topic_network.html`, `hierarchy_interactive.html`, `knowledge_graph_interactive.html`, `sunburst_chart.html` — **these are pre-built interactive visualisations and could be embedded directly in the case-study page.**
- Structured data: `data/best_kg/global_knowledge_graph.{json,gml,graphml,edgelist}`, `data/best_semantic_models/semantic_model_best.json`, `showcase/qa_examples.json`
- Long-form docs: `PROJECT_STRUCTURE.md`, `DETAILED_PIPELINE_DOCUMENTATION.md` (README claims 12,000+ words), `PIPELINE_RESULTS_SUMMARY.md`

**Repo vitals:** 8 commits (Vishal 7 + vishalwebnew 1) · 1 person · 1.97 MB · no notebook · CLI pipeline, no web app · 7 `modules/*.py` + 6 `run_*.py` orchestrators.

**Visual identity cues:** Domain world is **knowledge representation / graph theory** — the most abstract project in the set, which is a licence to go fully generative. Palette: near-black canvas with electric cyan and magenta nodes, the standard "graph on dark" register, but the differentiator is **modularity as colour** — let discovered communities each own a hue and show them separating. The signature visual form is unmistakable: **a force-directed node graph that self-organises on scroll**, starting as an undifferentiated hairball and resolving into 14 coloured clusters as the ensemble-voting stage plays. The three-algorithm consensus is a gift for animation: three ghosted clusterings of the same node set overlaid, each tinted differently, converging into one crisp assignment — a literal picture of voting. Secondary motifs: a co-assignment matrix as a heatmap grid, a sunburst chart for topic hierarchy, and PDF pages dissolving into entity chips at the intake stage.

---

### A3. `Fraud-Detection-and-VQA-Based-Multilingual-Customer-Care-Chatbot-with-Speech-Support`

His most-starred original repo (3 stars) and pinned #2. Two genuinely distinct systems in one project.

- **Repo:** https://github.com/Vishal-AS-0407/Fraud-Detection-and-VQA-Based-Multilingual-Customer-Care-Chatbot-with-Speech-Support
- **Created / pushed:** 2024-12-24 / 2024-12-25
- ⚠️ The repo name is 93 characters long and breaks some tooling (it failed a normal `git clone` path-length check on Windows). Display a short name: **"FraudGuard + VQA Care"** or similar.

**What it does** [README]: two components — (1) a **federated-learning-based payment fraud detection** system, and (2) a **multilingual, speech-enabled VQA customer-care chatbot** that helps customers with payment issues, form filling, and error resolution.

**Story arc** [README]:
- *Problem:* payment fraud detection needs data from multiple institutions, but banks cannot pool raw transaction data; and when fraud *is* flagged, the customer facing the problem is often a non-English speaker who cannot navigate a support form.
- *Constraint:* two constraints, one per half. Fraud data cannot be centralised (privacy), and it is severely class-imbalanced (fraud is rare). Support must work across major Indian languages, by voice, for users who may photograph a form rather than type.
- *Key insight:* a federated setup that trains locally and combines models via **ensembling** rather than sharing data, with **SMOTE** to fix the fraud-class imbalance; and on the support side, treat the customer's problem as a **visual question-answering** task — let them upload an image of the error/form and ask about it out loud in their own language, with Sarvam API doing speech-to-text.
- *Result:* a three-script working system — trained models, a Streamlit fraud-check app that emails the bank manager on detection, and a Streamlit multilingual voice chatbot.

**Architecture / pipeline (ordered stages)** [README]:

*Fraud branch (`train.py` → `test.py`):*
1. Transaction dataset (`dataset.csv`, committed)
2. Preprocessing pipeline
3. SMOTE oversampling for fraud-class imbalance
4. Parallel training: Neural Network + Ensemble Random Forest
5. Federated combination of models from different datasets via ensembling
6. Model + preprocessing pipeline serialised
7. Streamlit app: transaction input → real-time fraud prediction
8. If fraud → user confirmation prompt → email alert to bank manager

*Support branch (`final.py`):*
1. User speaks a query (any of several major Indian languages)
2. Sarvam API speech-to-text
3. Optional image upload (the "V" in VQA)
4. VQA model answers the payment query / assists form filling
5. Response returned, user details kept confidential

**Quantitative material:** ⚠️ **None.** The README shows a "Fraud Detection Model Summary" *screenshot* described as "showing the performance metrics" but **quotes no accuracy, precision, recall, or F1 in text**. The numbers exist only as pixels in that image. **Gap to fill:** the client should read the metrics off the screenshot (or re-run `train.py`) and state them.

**Tech stack** [README]: Python, Streamlit, scikit-learn (Random Forest), a neural network framework, `imbalanced-learn` (SMOTE), **Sarvam API** (speech-to-text, Indian languages), email/SMTP alerting, a VQA model. ⚠️ `requirements.txt` exists in the repo but is UTF-16/BOM-encoded and did not decode cleanly — exact pinned versions unread.

**Data artifacts:**
- Workflow / system-overview diagram — https://github.com/user-attachments/assets/8b855bf0-ad81-4d90-82e3-7c78fe6ea48b
- Fraud model summary (metrics screenshot) — https://github.com/user-attachments/assets/b4faa1a3-55f0-4297-aa09-d8786dd91b82
- Chatbot interface screenshot — https://github.com/user-attachments/assets/2db3fc55-9a99-48f3-a90a-a10622fcecd3

**Repo vitals:** 6 commits (Vishal 5 + vishalwebnew 1) · 1 person · 32 KB · files: `README.md`, `dataset.csv`, `train.py`, `test.py`, `final.py`, `requirements.txt` · no notebook · **two Streamlit apps**.

**Visual identity cues:** Domain world is **fintech / payments security**, and it splits cleanly into two moods the page can toggle between. The fraud half wants the visual language of the ledger and the anomaly: monospaced transaction rows scrolling in a dark terminal green-on-black, most rows calm, one row igniting red — a fraud-detection page practically demands a **live-scrolling transaction feed** where anomalies flare. Federated learning has its own strong form: **several institution nodes arranged in a ring, each keeping a locked data vault, with only model-weight glyphs travelling to a central aggregator** — the whole point of the architecture is visible in one diagram. The chatbot half swings warm and human: Indian-language script cycling through Hindi/Tamil/Telugu/Bengali in the headline, a voice waveform pulsing as a mic listens, and a chat bubble containing an uploaded photo of a form. Palette: bank-security navy and alert-red for the fraud side, warm saffron and teal for the multilingual care side.

---

### A4. `Agrizon` — satellite field analysis for agriculture

**The only project with a live, publicly reachable deployment.** That alone makes it the best "click here and use it" item on the portfolio.

- **Repo:** https://github.com/Vishal-AS-0407/Agrizon
- **Live demo:** https://agri-zon.vercel.app
- **Created / pushed:** 2025-12-11 / 2025-12-12
- Largest non-asset codebase in the account (6.9 MB, 766 KB of TypeScript).

**What it does** [README]: "a complete field analysis system with satellite imagery, AI-powered crop recommendations, and NDVI clustering" — a farmer draws a field boundary on a map and gets back a 6-class productivity map plus Gemini-generated crop advice.

**Story arc** [README]:
- *Problem:* a farmer knows their field is uneven but has no way to see *where* or *how much*, and no affordable agronomist to translate that into what to plant.
- *Constraint:* the signal is a 5-year satellite time series that has to be fetched, cloud-masked, and reduced to something a non-technical user can act on — and the analysis takes 2-5 minutes, so the UX must absorb a long-running job.
- *Key insight:* compute NDVI per year over five years of Landsat imagery and cluster the pixels with **Affinity Propagation** — a clustering choice that doesn't require pre-specifying k — to derive productivity zones from the field's own history rather than absolute thresholds. Then hand the resulting statistics to Gemini for context-aware crop recommendations, so the ML output arrives as advice, not a chart.
- *Result:* a deployed two-tier product with auth, field management, and a health-checked API.

**Architecture / pipeline (ordered stages)** [README + file structure]:
1. User signs in (Supabase auth)
2. User adds a field, or draws its boundary as a polygon on a map (`FieldMap.tsx`, polygon drawing tool)
3. Coordinates saved
4. "Run Analysis" → FastAPI backend
5. **Google Earth Engine** fetches 5 years of Landsat imagery, cloud-masked (`ndvi_service.py`)
6. NDVI computed per year
7. **Affinity Propagation clustering** (`clustering_service.py`)
8. 6-class productivity map generated
9. NDVI statistics (5-year vegetation health) compiled
10. **Gemini** generates crop recommendations from the stats (`gemini_service.py`)
11. Results persisted (`mongodb_service.py`) and rendered as map + distribution + stats + advice

**Quantitative material** [README]: 5 years of Landsat imagery · 6 productivity classes · 2-5 minute analysis runtime · frontend on port 8080, backend on 8000. Health endpoint returns `{"status":"healthy","services":{"ndvi":"operational","clustering":"operational","gemini_ai":"operational"}}`. ⚠️ **No accuracy/validation metric** — this is a systems project, not a benchmarked model, and should be presented as such.

**Tech stack** [README + requirements.txt + tree]: **Frontend** React + TypeScript + Vite + Tailwind + shadcn/ui (~50 `components/ui/*` primitives) + Supabase (auth, Postgres migrations, an edge function `get-climate-alerts`). **Backend** FastAPI 0.115, uvicorn, pydantic 2.9, `earthengine-api` 1.1.5, `google-generativeai` 0.8.3, scikit-learn 1.5.2, NumPy, Pillow, matplotlib, **pymongo** 4.6.1. Deploys via `render.yaml` (backend) and Vercel (frontend).

**Data artifacts:**
- README screenshots (2, full-width app captures):
  - https://github.com/user-attachments/assets/64f33b44-ce2e-4848-8e12-7bec29baeda8 (1828×881)
  - https://github.com/user-attachments/assets/70fcf087-e8e9-4f1a-8a37-15356e6d919a (1794×887)
- **In-repo architecture diagrams — not referenced by the README, so easy to miss:** `Data Flow arch.png`, `Deployment arch.png`, `security arch.png`, `Flow diag.jpeg`
- In-repo imagery: `src/assets/ndvi.png`, `src/assets/hero-farmland.jpg`, `src/assets/crop-showcase.jpg`, `src/assets/satellite-analysis.jpg`, `src/assets/Screenshot 2025-11-28 144025.png`
- `Agrizon.pdf` (likely a pitch deck — not inspected)
- Extra docs: `DEPLOYMENT_GUIDE.md`, `EARTH_ENGINE_SETUP.md`, `MONGODB_IMPLEMENTATION.md`, `SETUP_GUIDE.md`, `CHANGES_SUMMARY.md`

**Repo vitals:** 2 commits · 2 identities (both Vishal) · 6.9 MB · 12 pages (`Landing`, `Dashboard`, `AddField`, `FieldManagement`, `Analysis`, `AnalysisNew`, `Consultation`, `Pricing`, `About`, `Auth`, `Index`, `NotFound`) · no notebook · **deployable: Vercel + Render, live now**. ⚠️ Only 2 commits means there is no meaningful development history to show. ⚠️ `backend/.env` is committed — **check it for live secrets and rotate if so.**

**Visual identity cues:** Domain world is **agriculture seen from orbit**, and the palette is dictated by the data itself: the **NDVI colour ramp** — deep red/brown for bare soil through yellow to saturated green for dense canopy — is a real scientific colormap that will read as authentic rather than decorative. Build the whole theme on it. The signature visual form is the **6-class productivity map**: an irregular field polygon filled with clustered colour patches, which can animate by drawing the boundary first, then washing in the classification. Supporting motifs: a **5-year NDVI time series as small multiples** (five thumbnails of the same field changing season to season), Landsat's scan-line/tile grid as a background texture, contour and parcel-boundary linework, and the map-polygon-drawing interaction itself re-created as a hero animation — a cursor tracing a field outline, vertices snapping into place. Warm earth tones and satellite-imagery grain keep it from looking like a generic SaaS dashboard.

---

### A5. `Patient-Mental-Health-Monitoring-Using-EEG`

The most technically ambitious healthcare project: real biomedical signals, two public datasets, and an LLM report layer on top of deep models.

- **Repo:** https://github.com/Vishal-AS-0407/Patient-Mental-Health-Monitoring-Using-EEG
- **Created / pushed:** 2024-12-24 / 2024-12-24 · 3 stars

**What it does** [README]: processes EEG signals to assess mental state, cognitive load, and emotion, then uses an LLM to turn model outputs into a personalised health report with activity, dietary, and medical recommendations.

**Story arc** [README]:
- *Problem:* EEG can reveal cognitive load and emotional state, but the raw output of an EEG classifier — a valence/arousal/dominance triple, an error-potential flag — is meaningless to the person wearing the headset.
- *Constraint:* no single public EEG dataset covers both emotion and cognitive/error-related states, and the two use completely different rigs (DREAMER: 14 channels @ 128 Hz; INRIA BCI: 56 sensors @ 200 Hz). Anything unified has to bridge two incompatible preprocessing regimes.
- *Key insight:* train **separate specialist models per dataset/state**, then **correlate their outputs at the report layer** rather than trying to fuse the signals. An LLM (BioGPT for domain grounding, Gemini for generation) consumes the combined psychological parameters and produces a single cumulative wellbeing narrative — so cross-signal reasoning happens in language, where it can be explained.
- *Result:* an end-to-end chain from raw EEG to a rendered HTML health report with rest/focus/consultation recommendations.

**Architecture / pipeline (ordered stages)** [README + file tree]:
1. Two raw EEG sources: **DREAMER** (emotion) and **INRIA BCI Challenge** (error-related potentials)
2. Biomedical signal preprocessing — `Dreamer/dreamerpre.py`, `BCI/bcipre.py`
3. Parallel deep model training — `Dreamer/drtrain.py`, `BCI/bcitrain.py`
4. Testing / evaluation — `Dreamer/testdr.py`, `BCI/bcitest.py` (each outputs test accuracy + confusion matrix)
5. Inference → psychological parameters: **valence, arousal, dominance** + ERP state — `LLM/Biogpt.py`
6. LLM report generation — `LLM/gemini.py`
7. HTML rendering — `LLM/htmlgen.py` → `LLM/generated_report.html`
8. Output: personalised recommendations (rest/sleep, cognitive-load management, diet, clinician consultation)

**Quantitative material** [README]: DREAMER — **14 EEG channels @ 128 Hz**, valence/arousal/dominance ratings from audiovisual stimuli. INRIA BCI Challenge — **56 passive EEG sensors @ 200 Hz**. ⚠️ **No accuracy, F1, or loss figures are stated anywhere**, despite the README's own table promising that the test scripts output "Test accuracy, confusion matrix, and predictions." **Gap:** the numbers were produced but never written down. `Report.pdf` is committed and may contain them.

**Dataset links** [README]: DREAMER https://zenodo.org/record/546113 · INRIA BCI https://www.kaggle.com/c/inria-bci-challenge

**Tech stack** [README]: Python, EEG/biomedical signal preprocessing, deep learning models (framework unnamed in README), **BioGPT**, **Gemini**, HTML generation. ⚠️ `requirements.txt` is UTF-16/BOM-encoded and did not decode — exact libraries unconfirmed.

**Data artifacts:**
- Overall pipeline diagram — https://github.com/user-attachments/assets/fd777c6b-6584-439e-9034-fce58b694226
- Sample report 1 — https://github.com/user-attachments/assets/1ade8f7d-4fb6-42ce-9566-9264c391ec64
- Sample report 2 — https://github.com/user-attachments/assets/8984b89a-6eda-484d-a180-f0ae60f6bd90
- Sample report 3 — https://github.com/user-attachments/assets/7dc6f1d3-354a-470e-9b2c-28726a657c84
- In-repo: `Report.pdf`, `LLM/generated_report.html` (a real rendered output — **could be embedded live in the case study**), `LLM/geminioutput.txt`, `LLM/biogpt.txt`, `LLM/biogpt_ref.txt`

**Repo vitals:** 13 commits (all Vishal) · 1 person · 569 KB · clean three-folder structure (`BCI/`, `Dreamer/`, `LLM/`) · no notebook · no web app (script pipeline → HTML artifact).

**Visual identity cues:** Domain world is **neuroscience / biosignals**, and it has the most distinctive signature form of any project here: **the EEG trace**. Multi-channel oscilloscope lines — 14 of them, stacked, scrolling right to left in phosphor cyan on near-black — are instantly readable as "brain data" and animate beautifully with pure SVG path work. Palette: clinical dark background, phosphor cyan/green traces, with valence-arousal mapped to a warm/cool axis (calm blue → agitated amber) so emotional state literally tints the page. The second signature form is the **valence-arousal-dominance circumplex**: a 2D emotion plane with a dot that drifts, which doubles as an interactive toy. Supporting motifs: an electrode montage — the standard 10-20 head map with labelled positions lighting up per channel — frequency-band decomposition into delta/theta/alpha/beta/gamma strips, and a spectrogram heatmap. The report layer justifies a deliberate tonal shift at the end of the page: from cold instrumentation to a warm, legible clinical document.

---

### A6. `WISP` — Wildlife Species Identification and Safety Protocol

- **Repo:** https://github.com/Vishal-AS-0407/WISP
- **Repo description** (the only repo with one set): "Wildlife Species Identification and Safety Protocol Automation in Camera Trap Environments"
- **Created / pushed:** 2025-05-04 / 2025-05-04

**What it does** [README]: "combines deep learning-based wildlife classification with explainable AI visualizations and comprehensive reporting… designed for wildlife monitoring via camera traps and creates detailed reports for forest officers."

**Story arc** [README]:
- *Problem:* camera traps generate far more images than forest officers can review, and a bare species label is not actionable for someone who may have to physically approach the animal.
- *Constraint:* the end user is a field officer, not an ML engineer. A black-box classifier is not trustworthy enough to act on, and the output has to arrive as a document, not a tensor.
- *Key insight:* pair the classifier with **GradCAM attribution** so the officer can see *what* the model looked at, then wrap both in an **agentic reporting layer (CrewAI)** that generates species-specific hazard assessments and handling protocols. The deliverable is a safety document, not a prediction.
- *Result:* three report modes — standard HTML, markdown-enhanced, and a dedicated safety/hazard protocol report, with optional PDF export and per-species templates.

**Architecture / pipeline (ordered stages)** [README]:
1. Camera-trap image input
2. **EfficientNet-B3** species classification (`xai_inference_example.py`, weights `wildlife_classifier_best.pth`)
3. Class mapping (`class_mapping.json`)
4. **GradCAM** explainability visualisation (`explainable_ai.py`)
5. Report integration (`inference_to_cvai.py`)
6. **CrewAI** agent performs in-depth wildlife analysis (`wildlife_safety_protocol.py`)
7. Species-specific template selection (`report_templates/`)
8. Output: HTML report → optional PDF, including hazard assessment, safe handling protocol, risk factors, step-by-step guidance

**Quantitative material:** ⚠️ **None whatsoever.** No accuracy, no class count, no dataset size in the README. The dataset is named — **Missouri Camera Traps (LILA)**, https://lila.science/datasets/missouricameratraps — and the README's own link text fragment mentions "approximately… and white-tailed deer", but no figures are given. `class_mapping.json` would yield the class count. **Significant gap for a flagship.**

**Tech stack** [README]: Python 3.8+, PyTorch, torchvision, **EfficientNet-B3**, **GradCAM**, **CrewAI**, HTML/PDF report generation. MIT licensed.

**Data artifacts:** ⚠️ **The README contains no images at all** — no GradCAM heatmap, no sample report, no screenshot. For a project whose entire selling point is *visual* explainability, this is the single biggest asset gap in the account. The model checkpoint `wildlife_classifier_best.pth` is committed (~39 MB, the bulk of repo size), so **attribution maps can be regenerated**.

**Repo vitals:** **1 commit** · 1 identity (vishalwebnew) · 39.3 MB · no notebook · CLI scripts only.

⚠️ **Documentation/reality mismatch — important.** The README documents these entry points, **none of which exist in the repo**: `install.py`, `analyze_wildlife.py`, `integrate_markdown_report.py`, `requirements.txt`, and the `report_templates/` directory. The repo actually contains only: `README.md`, `class_mapping.json`, `cvai.py`, `explainable_ai.py`, `inference_to_cvai.py`, `wildlife_classifier_best.pth`, `wildlife_safety_protocol.py`, `xai_inference_example.py`. The README instructs `pip install -r requirements.txt` against a file that isn't there. **The project as described is not runnable from this repo as committed.** [INFERRED] a partial upload. This does not mean the work wasn't done — the trained checkpoint is real — but the case study should be written from the code that exists, and the client should push the missing files.

**Visual identity cues:** Domain world is **wildlife conservation / field ecology**, and the source material is unusually rich. The signature form is the **camera-trap photograph itself**: high-ISO monochrome-tinted night frames with IR flash falloff, a timestamp burned into the corner, motion blur, grain. Lean into that aesthetic hard — it is immediately evocative and nothing else in the portfolio looks like it. Palette: forest greens and bark browns under a cold IR-night blue-grey, with hazard amber reserved exclusively for the safety-protocol layer so risk reads as a colour. The second signature form is the **GradCAM heatmap overlay** — a jet/inferno colormap blooming over the animal, which begs for a scrub-to-reveal interaction where dragging a slider wipes between raw frame and attribution map, letting the visitor *see the model see*. Supporting motifs: topographic contour lines and range maps as background texture, species-silhouette iconography, a taxonomy tree, and the safety report styled as an official field document with stamps and clearance banding.

---

### A7. `Vatsal-AI` — intelligent baby-care assistant

- **Repo:** https://github.com/Vishal-AS-0407/Vatsal-AI
- **Created / pushed:** 2025-12-12 / 2025-12-12

**What it does** [README]: "a comprehensive, AI-powered parenting companion designed to assist Indian parents. It combines advanced audio analysis, knowledge retrieval, and community features."

**Story arc** [README]:
- *Problem:* new parents in India face a wall of unreliable advice, and the most urgent question — *why is the baby crying?* — has no good answer at 3am.
- *Constraint:* medical answers must be traceable (you cannot hand a parent a hallucinated drug interaction), and the primary input is a distressed audio recording, not text.
- *Key insight:* three different retrieval strategies for three different needs. Cry classification is a **trained audio model** on extracted features; medical questions go through a **knowledge graph with hybrid retrieval — vector search *plus* graph traversal** — and the UI **shows the thought process and the sources used**, making the answer auditable; general chat is a plain LLM.
- *Result:* a full-stack mobile-first app — FastAPI backend, React/Vite frontend, nine screens.

**Architecture / pipeline (ordered stages)** [README + tree]:
1. Parent records/uploads baby cry audio (`CryAnalyzer.tsx`)
2. Audio feature extraction (librosa)
3. Cry classification via `baby_cry_model2.pkl` → cause (Hungry / Tired / Belly Pain / …) + **confidence score**
4. Tailored soothing tips returned
5. *Separately:* medical question → `medical_kg/chunking.py` → `entity_extraction.py` → `knowledge_graph.py`
6. Hybrid retrieval: vector search + graph traversal (`retrieval.py`, `hierarchical.py`)
7. LLM synthesis with visible reasoning trace and cited sources
8. Plus: general AI assistant, medical-history reports, community feed

**Quantitative material:** ⚠️ **Almost none.** The README promises a "confidence score" per prediction but quotes no model accuracy, no class list, no dataset size. Countable from the tree: 10 synthetic medical reports (`RPT-001`…`RPT-010`, prenatal → delivery → newborn → paediatric), 7 route modules, 9 frontend pages. *Note:* `baby_cry_model2.pkl` here is **the same filename as in `Why-is-my-Baby-Crying`** — [INFERRED] the cry model is reused from that project, which does have verified metrics (98.76% accuracy — see A8). Worth cross-linking the two case studies.

**Tech stack** [requirements.txt]: FastAPI 0.104, uvicorn, SQLAlchemy 2.0 + aiosqlite, pydantic 2.5, **openai** 1.3.7, **crewai**, **langchain_openai**, **librosa** 0.10.1, scipy, scikit-learn 1.3.2, `google-search-results`, pypdf, python-jose + passlib (JWT auth), Pillow, httpx. Frontend: React + Vite + TypeScript.

**Data artifacts:** **12 committed screenshots** in `docs/output/` (`Screenshot 2025-12-11 *.png`) — the richest screenshot set in the account and not referenced from the main README. Plus five detailed docs: `docs/features.md`, `docs/tech_stack.md`, `docs/user_flow.md` (visual diagrams of app structure), `docs/backend_architecture.md`, `docs/frontend_architecture.md`. **These docs are the best raw material for a case study anywhere in this account** — I did not read them in full, and the client should mine them.

**Repo vitals:** **1 commit** · 1 identity (vishalwebnew) · 7.5 MB · no notebook · **deployable: FastAPI + React/Vite** · 9 pages, 7 route modules, 6 services, a `medical_kg/` subpackage of 7 modules.

**Visual identity cues:** Domain world is **infant care**, which sets the palette almost by itself: nursery pastels — powder blue, soft blush, warm cream, muted mint — a register nothing else in the portfolio occupies, so it provides maximum contrast against the clinical and technical themes. The trick is to keep it tender without becoming saccharine: pair the pastels with genuinely rigorous data forms. The signature visual form is the **cry waveform / mel-spectrogram** rendered in soft pastel gradients rather than the usual harsh viridis — a baby's cry as a gentle oscillating ribbon that pulses at the reader. The second is the **knowledge-graph reasoning trace**: since the app's differentiator is showing its work, animate a query lighting a path through medical entity nodes, hop by hop, with source cards surfacing at each step. Supporting motifs: rounded, oversized, thumb-reachable mobile UI framed in a phone bezel (it is mobile-first, so show it that way), soft-shadow cards, a gentle breathing/heartbeat rhythm as the page's animation tempo, and the ten synthetic report documents fanned as a timeline from prenatal to paediatric.

---

### A8. `Why-is-my-Baby-Crying` — baby cry analysis with LIME explainability

Promoted to Tier A on the strength of **verified metrics and committed visual artifacts** — it is the best-evidenced ML result in the account after the NAACL paper.

- **Repo:** https://github.com/Vishal-AS-0407/Why-is-my-Baby-Crying
- **Created / pushed:** 2025-05-15 / 2026-07-30 (**his most recently updated ML repo**) · pinned #4
- Subtitle [README]: "A Speech Processing Project" — [INFERRED] an end-semester course project (`endsem.ipynb`).

**What it does** [README]: analyses baby cry audio to classify the underlying need/emotion (hunger, pain, sleepiness, discomfort) and provides a Streamlit chatbot that gives caregivers contextual advice about the result.

**Story arc:**
- *Problem* [README]: caregivers — especially new parents — cannot reliably tell why an infant is crying, and the answer is time-critical.
- *Constraint* [INFERRED from code]: infant cry corpora are small and class-imbalanced, and the discriminative information sits in a narrow frequency band buried under recording noise.
- *Key insight* [INFERRED from code]: aggressive, domain-specific signal conditioning before any learning — pre-emphasis (α=0.97) then a **Butterworth bandpass tuned to 142.91–6620.12 Hz**, the infant-cry band specifically, not a generic filter. Then a very wide feature expansion (461 features: MFCCs, ZCR, RMS, chroma, mel, spectral contrast, tempogram, plus skew/kurtosis moments), **SMOTE** to rebalance, and a Random Forest — deliberately a classical model, which keeps it fast and makes it **LIME-explainable**.
- *Result* [VERIFIED]: 98.76% accuracy, F1 0.9876, at ~1 second runtime, with per-class LIME attributions committed as figures.

**Architecture / pipeline (ordered stages)** [VERIFIED from `endsem.ipynb`]:
1. Cry audio input (`.wav` / `.mp3`), 16 kHz
2. Pre-emphasis filter (α = 0.97)
3. Butterworth bandpass, order 5, **142.91 Hz – 6620.12 Hz**
4. Feature extraction (librosa): ZCR, RMS, STFT/spectral features, 40 MFCCs, 12 chroma, 13 mel, 7 spectral-contrast bands, tempogram (win 384), spectral rolloff (0.95), skew, kurtosis → **461 features**
5. Label encoding + train/test split (seed 12345)
6. **SMOTE** oversampling → training set (1525, 461)
7. **RandomForestClassifier**
8. Evaluation: accuracy / F1 / recall / confusion matrix
9. **LIME** tabular explanation per class
10. Streamlit chatbot (`ai.py`) surfaces prediction + advice

**Quantitative material** [VERIFIED — read directly from committed notebook output cells, **not claimed in the README**]:

| Run | Accuracy | F1 | Recall | Runtime |
|---|---|---|---|---|
| Variant 1 | 0.9793 | 0.9793 | 0.9793 | 1.53 s |
| Variant 2 | **0.9876** | **0.9876** | **0.9876** | 1.01 s |
| Post-SMOTE (1525×461) | **0.9876** | **0.9876** | **0.9876** | 1.86 s |
| Final | **0.9876** | **0.9876** | **0.9876** | 1.03 s |

Also: 461 features · 1,525 training samples after SMOTE · sample rate 16 kHz · seed 12345 · bandpass 142.91–6620.12 Hz · 40 MFCCs.

⚠️ **Caveat to state honestly:** 98.76% on a small, SMOTE-balanced infant-cry dataset with a random split is very likely optimistic — SMOTE applied before splitting leaks synthetic neighbours across the split. Present the number, but frame it as in-sample validation, not clinical performance.

**Tech stack** [README + notebook]: Python, **librosa**, scipy.signal, scikit-learn (RandomForest), **imbalanced-learn** (SMOTE), **LIME**, matplotlib, seaborn, pandas, **Streamlit**.

**Data artifacts — the best in-repo figure set in the account** (raw URLs, `master` branch):
- `confusion_matrix.png` — https://raw.githubusercontent.com/Vishal-AS-0407/Why-is-my-Baby-Crying/master/confusion_matrix.png
- `feature_importance.png` — https://raw.githubusercontent.com/Vishal-AS-0407/Why-is-my-Baby-Crying/master/feature_importance.png
- `class_wise_lime_plots.png` — https://raw.githubusercontent.com/Vishal-AS-0407/Why-is-my-Baby-Crying/master/class_wise_lime_plots.png
- `lime_explanation.png` — https://raw.githubusercontent.com/Vishal-AS-0407/Why-is-my-Baby-Crying/master/lime_explanation.png
- `infant_cry_lime_visualization.png` — https://raw.githubusercontent.com/Vishal-AS-0407/Why-is-my-Baby-Crying/master/infant_cry_lime_visualization.png
- Also: `extracted_features.xlsx`, `predictions.txt`, 4 pickled models (`baby_chill.pkl`, `baby_chill1.pkl`, `baby_chillsec.pkl`, `baby_cry_model2.pkl`), 3 notebooks (`endsem.ipynb`, `chill.ipynb`, `shl.ipynb`)
- ⚠️ The README references **none** of these images.

**Repo vitals:** 3 commits (Vishal 2 + vishalwebnew 1) · 26.9 MB · 3 notebooks · **Streamlit app** (`ai.py`).

**Visual identity cues:** Domain world is **acoustics / speech signal processing**, and the palette should be deliberately cooler and more instrumental than its sibling `Vatsal-AI` so the two baby projects don't collide — think analyser display rather than nursery: charcoal ground, with a spectral gradient (deep violet → magenta → amber) borrowed from spectrogram colormaps. The signature visual form is the **mel-spectrogram** — a time-frequency heatmap that is genuinely beautiful and unmistakably "audio" — paired with the raw **waveform envelope** of a cry. The bandpass filter is an unusually good animation opportunity: show the full spectrum, then let the 142.91–6620.12 Hz window slide in and dim everything outside it, which explains the core preprocessing insight in one motion. Second signature: **LIME attribution as horizontal diverging bars**, red pushing one way and green the other, animating out from a centre line — explainability rendered as a literal tug-of-war. Supporting motifs: a filter frequency-response curve, concentric sound-radiation rings, and a confusion matrix that fills cell by cell.

---

### A9. `Nurture-Sync` — AI-powered health companion (Flutter)

His self-declared current focus ("Currently Building: AI-powered healthcare solutions with NurtureSync") and **the only mobile app in the account**. Tier A for scope and demo assets, despite a thin README.

- **Repo:** https://github.com/Vishal-AS-0407/Nurture-Sync
- **Created / pushed:** 2025-03-25 / 2025-05-23 · largest repo at 64.4 MB
- [INFERRED] a hackathon project — the README is a hackathon submission template, complete with unchecked "Mandatory social media task" / "Bonus Task" checkboxes and a "Pitch Deck" field.

**What it does** [README]: "NurtureSync: Your AI-Powered Health Companion" — assists individuals "particularly those managing **thyroid** and **diabetes**" with personalised health management, combining AI insights, medical report analysis, and real-time updates.

**Story arc** — ⚠️ **the README is too thin to support a full 300-500 word case study.** What it gives: objective (thyroid/diabetes management), a feature list, a tech stack, and demo links. **What is missing and must come from the client:** the specific problem framing (why thyroid + diabetes?), what made it hard, what the key technical insight was, any result or outcome, hackathon name and placement. The file structure reveals far more than the README does — 9 backend domain models and a large Flutter feature tree — so the *system* is documentable even though the *narrative* is not. **The 4-minute demo video is the best available substitute source.**

**Architecture / pipeline (ordered stages)** [README + tree]:
1. Flutter mobile app (auth: splash → login/signup/forgot-password)
2. User profile + health data capture
3. Medical report scanning → **OCR** → auto-translation (**LibreTranslate**)
4. Real-time multilingual voice input → **ASR** transcription
5. **Groq APIs** for LLM inference, OCR, ASR
6. Agent-based task orchestration — data scraping (**Playwright**) + report generation
7. FastAPI backend persists across 9 domains: user, profile, health, reports, medicines, food logs, water logs, exercise logs, community
8. Personalised insights, diet/exercise tracking, community + doctor/appointment features returned to the app

**Quantitative material:** ⚠️ **None stated.** Countable from the tree: 9 backend model modules, 9 route modules, ~14 datasets committed under `Datasets/` (obesity prediction, sleep health & lifestyle, diabetes prediction India, drug side effects from drugs.com, fastfood, macros, food_coded, fitness tracker, weight change). [INFERRED] these datasets suggest ML work that the README never mentions.

**Tech stack** [README]: **Flutter** (frontend), **FastAPI**/Python (backend), local storage, OCR, ASR, **LibreTranslate**, **Playwright** (web scraping), **Groq APIs** (LLM inference, OCR, ASR), Uvicorn. Firebase present in the Android config (`google-services.json`).

**Data artifacts:**
- 🎥 **Demo video:** https://www.youtube.com/watch?v=rx3fVMRsWhA — **the only video demo in the entire account. High-value: pull thumbnails/stills from it.**
- 📊 **Pitch deck (Canva):** https://www.canva.com/design/DAGdmDG1jzk/Y0b2WRfXwRhKwlIj8OSAxg/view
- In-repo: a large `assets/animations/` tree of **Lottie JSON animations** (`Hello.json`, `agent.json`, `ai analysis.json`, `diet.json`, `congrats.json`, `a2/a3.json`, `ex1/e1.json`, …) — [INFERRED] these are reusable motion assets that could be dropped straight into the case-study page.
- ⚠️ README states "(Screenshots, GIFs can be added later if needed.)" — **there are no screenshots in the README.**

**Repo vitals:** 7 commits (Vishal 5 + vishalwebnew 1 + **Sarvesh Kannan** 1 — the only genuine third-party contributor on an original repo) · 64.4 MB · no notebook · **deployable: Flutter Android app + FastAPI backend** · Flutter feature modules: auth, chatbot (`syncbot.dart`), community (feed, discussion, doctor, appointment, events), plus core theme files (`colors.dart`, `text_styles.dart`) that may reveal the app's actual brand palette. ⚠️ `backend/.env` and `android/app/google-services.json` are committed — **check for live credentials.**

**Visual identity cues:** Domain world is **chronic-condition self-management** — thyroid and diabetes — which is a warmer, more sustained, more domestic register than acute clinical care. The palette should feel like a wellness product rather than a hospital: soft teal and mint with a warm coral accent, generous whitespace, rounded geometry. Critically, **the app already has a defined theme in `lib/core/theme/colors.dart`** — read it and derive the page palette from the real product so page and app agree. The signature visual form is the **continuous glucose-style time-series ribbon**: a smooth line drifting through a shaded target band, dipping below and rising above — the visual grammar of every diabetes app, and instantly legible. Second signature: the **medical report OCR moment** — a photographed lab report with text regions highlighting one by one and values lifting off the page into structured cards, which shows the OCR→translation→insight chain in a single animation. Supporting motifs: the thyroid butterfly silhouette as a subtle mark, multilingual text morphing between scripts to convey the translation layer, daily-log ring meters for water/food/exercise, and — since they already exist — the project's own Lottie animations. A phone-in-hand mockup carrying the real demo video is the natural hero.

---

## 3. Tier B — Solid projects

---

### B1. `Clothcut` — AdvanceCut 2D nesting optimiser

- **Repo:** https://github.com/Vishal-AS-0407/Clothcut · created/pushed 2025-10-26
- **What it does** [README]: "An interactive web application for optimizing cloth cutting layouts using advanced 2D nesting algorithms." Real title: **AdvanceCut**.
- **Story arc** [README]: *Problem* — cutting garment patterns from cloth wastes material; 2D irregular nesting is NP-hard. *Constraint* — pure quality-optimising placement "may not place all patterns", but a factory needs every piece placed; also patterns must match sheet colours and need blade-clearance gaps. *Insight* — offer **three explicit algorithm modes** rather than one compromise: Quality (pure AdvanceCut), **Guaranteed** (AdvanceCut then Bottom-Left-Fill fallback → 100% placement), and Aggressive (relaxed constraints, wider search). *Result* — a Streamlit app with interactive Plotly layouts, a metrics dashboard, and manufacturing-ready coordinate export for CNC.
- **Pipeline (ordered):** 1. define cloth sheets (w/h/colour) → 2. define patterns (shape type, params, colour, qty) → 3. configure rotation step (15-90°), beam width (1-5), pattern spacing (0-10) → 4. **No-Fit Polygon** geometric placement → 5. **beam search** over placement sequences → 6. **gravity simulation** settling pieces bottom-left → 7. quality scoring (corner/edge preference) + colour matching → 8. optional **BLF fallback** for unplaced pieces → 9. Plotly render + metrics → 10. export CSV / JSON / text report / vertex coordinates.
- **Metrics** [README]: no benchmark numbers, but the app *computes* utilisation %, success rate %, patterns placed, computation time, quality score. Guaranteed Mode claims **100% success rate**. Shape library: rectangles, squares, L-shapes, T-shapes, hexagons, stars, triangles. 5 demo scenarios.
- **Tech stack** [requirements.txt]: **Streamlit** ≥1.28, **Plotly** ≥5.17, **Shapely** ≥2.0, NumPy, pandas, kaleido.
- **Data artifacts:** ⚠️ **no images anywhere** — no screenshots in README, none in repo. For a visual optimisation tool this is a real gap; screenshots must be captured by running it.
- **Repo vitals:** 1 commit · 48 KB · no notebook · **Streamlit app** · modules: `core/advancecut_engine.py`, `core/bfl_fallback.py`, `shapes/shape_library.py`, `shapes/demo_scenarios.py`, `visualization/plotly_renderer.py`, `visualization/export_utils.py` · 7 extra markdown docs (`ALGORITHM_MODES.md`, `PROJECT_SUMMARY.md`, `SPACING_FEATURE.md`, `DEPLOYMENT_GUIDE.md`, …). ⚠️ README references `core/geometry_utils.py`, which is **not in the repo**; `ui/` contains only `__init__.py`.
- **Visual identity cues:** Domain world is **textiles and industrial cutting** — the most tactile, least screen-native domain in the portfolio, and the strongest opportunity for a genuinely distinctive theme. The palette comes from the cutting room: bolt-of-fabric colours (indigo, madder red, unbleached calico) against tailor's-pattern paper cream, with cyan cut-lines. The signature visual form is the **nesting layout itself** — irregular polygons tessellating into a bounded rectangle — which animates perfectly: pieces flying in, rotating through discrete angles, and settling under the gravity simulation, with the utilisation percentage counting up as the sheet fills. Supporting motifs: **woven-thread grid texture** (warp and weft as a background pattern), tailor's-chalk dashed cut lines and notch marks, seam-allowance offsets rendered as outlines, and No-Fit-Polygon geometry drawn as construction linework — the ghost outline that shows where a piece *cannot* go is an elegant, unusual thing to visualise. A before/after wastage comparison — the same pieces badly vs optimally nested — is the money shot.

---

### B2. `Claire_Chatbot` — CLAIRE fashion trend intelligence

- **Repo:** https://github.com/Vishal-AS-0407/Claire_Chatbot · created/pushed 2025-10-20
- ⚠️ **No README.** The repo has **no README file at all.** Everything below comes from `report.md` (a sample output document) and the source files. GitHub shows no project description either.
- **What it does** [INFERRED from `report.md` + `finalchatbot.py`]: **CLAIRE** is a fashion trend-intelligence system — "Fashion Intelligence for Manufacturing Excellence" — that takes a garment query (e.g. "T-shirt") and produces a manufacturing-oriented trend report: recursive keyword expansion, statistical trend metrics, and multi-source market synthesis for a target region.
- **Story arc** — ⚠️ **cannot be written from the repo alone.** There is no problem statement, no design rationale, no result claim anywhere in the repo. `report.md` is an *output artifact*, not documentation. **What the client must supply:** who it was built for, what the actual data sources are (live APIs vs mocked), and whether the numbers in `report.md` are real measurements or an illustrative sample.
- **Pipeline (ordered)** [INFERRED from `report.md` section headings]: 1. garment query input → 2. **recursive keyword expansion** into a 3-level trend tree (20 keywords) → 3. colour clustering of search variants → 4. statistical metrics per trend (std dev, coefficient of variation, spike index, peak-to-average, 7d-vs-30d momentum, CAGR slope) → 5. multi-agent intelligence gathering: **Trends Agent** (Google Trends), **Reddit Agent** (consumer sentiment), **E-commerce Agent** (pricing/sales across platforms) → 6. LLM synthesis (Gemini) → 7. report with confidence score + production recommendation.
- **Quantitative material** — ⚠️ **treat with caution.** `report.md` is dense with figures (confidence 87.3%; "456% spike"; 20 keywords; 1,247 Reddit discussions; 15 e-commerce platforms; sentiment 78/12/10; regional splits Chennai 34% / Coimbatore 23% / Madurai 18% / Trichy 12%; price tables in ₹). **These are numbers inside a sample report dated "December 20, 2024" — I could not verify they come from live data rather than a hand-authored demo.** Do not present them as system performance metrics.
- **Tech stack** [requirements.txt — verified]: **Flask** 3.1.2, flask-cors 6.0.1, **google-generativeai** 0.8.5 (Gemini), Pillow, python-dotenv, requests, **gunicorn** 21.2.0. `runtime.txt`: Python 3.13.0. `Procfile`: `web: gunicorn finalchatbot:app --bind 0.0.0.0:$PORT`.
- **Repo vitals:** 2 commits (both Vishal) · 29 KB · files: `Procfile`, `finalchatbot.py` (18.5 KB), `index.html` (34.6 KB — a single-file frontend), `report.md`, `requirements.txt`, `runtime.txt` · no notebook · **deployable: Flask + gunicorn, Procfile-configured for Heroku/Render — but no live URL is recorded.**
- **Data artifacts:** none (no images). `report.md` itself is a strong artifact — a formatted intelligence report that would render beautifully as a case-study centrepiece.
- **Visual identity cues:** Domain world is **fashion retail analytics** — commercial, trend-driven, and visually the most "editorial" project in the set. Palette: fashion-magazine monochrome (stark black, paper white, generous margins) with a single hot seasonal accent — the kind of hot-pink or acid-green that reads as *this season's colour* — plus the report's own colour-cluster data (black 34% / white 28% / pastel 23% / neon 15%) as a literal palette strip. The signature visual form is the **trend tree**: a 3-level branching diagram expanding from "t-shirt" through "oversized t-shirt" to "retro gaming graphic tee", with growth percentages ticking up on each branch — recursive keyword expansion drawn as an actual growing tree. Second signature: the **spike chart** — a search-volume line that climbs gently then erupts, with the spike moment annotated — since spike detection is the product's core claim. Supporting motifs: lookbook-style garment silhouettes, a swatch grid for colour clustering, an editorial serif display face against a technical monospace for the metrics, and a Tamil Nadu regional map with cities weighted by search share.

---

### B3. `Memora` — LLM conversation memory system

- **Repo:** https://github.com/Vishal-AS-0407/Memora · created/pushed 2026-02-07 · **his most recent original project**
- **What it does** [README]: "A sophisticated conversation memory system for Large Language Models using Redis, FAISS, and Google Generative AI" — persistent, searchable, thread-based memory for chatbots.
- **Story arc** [README]: *Problem* — LLM chatbots forget; conversation context dies with the session. *Constraint* — you need both fast exact metadata lookup (which thread, which user, when) and fuzzy semantic recall (what did we discuss that's relevant now); one store does not serve both well. *Insight* — **split the storage by access pattern**: Redis holds conversation metadata, thread info, and topic indices for fast structured access; FAISS holds vector embeddings for semantic similarity search; topics are auto-classified by an LLM so threads self-organise without user tagging. *Result* — a `MemoraBrain` class exposing thread management, Q&A-pair windows with metadata, semantic search, and referral tracking between related contexts.
- **Pipeline (ordered)** [README mermaid diagram]: 1. user query → 2. `MemoraBrain` → 3. fans to LangChain LLM (topic generation) + LangChain embeddings (vector generation) → 4. topics + metadata → **Redis**; vectors → **FAISS** (per-thread indices under `vecdb_storage/Thread_*/`) → 5. search query → semantic search results.
- **Metrics:** ⚠️ **none** — no latency, recall, or benchmark figures. It is a library, not an evaluated model.
- **Tech stack** [requirements.txt — verified]: **redis** ≥4.5, **faiss-cpu** ≥1.7, NumPy, python-dotenv, **google-generativeai** ≥0.3, **sentence-transformers** ≥2.2.2, pydantic, **langchain-google-genai**. Requires Redis on `localhost:6379`, Python 3.10+.
- **Data artifacts:** no images. The README contains a **mermaid architecture diagram** (reusable directly) and a documented API reference.
- **Repo vitals:** 4 commits · 17 KB · no notebook · library/CLI, no web app · actual files: `README.md`, `memory_system.py`, `chatbot_with_memory.py`, `demo.py`, `requirements.txt`.
- ⚠️ **Documentation/reality mismatch:** the README documents `kavya_test.py`, `latest_check.py`, `me_check.py`, a `helper/` package (`embedding_helper.py`, `langchain_block.py`), `vecdb_storage/`, `.env`, `dump.rdb`, and `s.txt` — **none of these are in the repo.** The README also contains a hardcoded local path, `c:\Users\visha\Desktop\Memora\Memora`, and instructs activating a pre-existing venv named `memo` that isn't committed. The install instructions do not work as written.
- **Visual identity cues:** Domain world is **memory and retrieval infrastructure** — abstract, systems-y, developer-facing. Palette: terminal-native — deep slate ground, Redis crimson and FAISS/Meta blue as the two functional accents (letting the two stores be colour-coded throughout is both handsome and explanatory), with a soft amber for "recalled" items. The signature visual form is the **dual-store split**: a single incoming message visibly bifurcating, its structured metadata dropping into a crisp Redis key-value grid while its embedding drifts into a soft vector cloud — one animation that carries the entire architectural insight. Second signature: **semantic search as proximity** — a scatter of embedding points where a query lands and its nearest neighbours illuminate by distance, memory retrieval shown as spatial nearness. Supporting motifs: conversation threads as vertically stacked, branching timelines with topic chips auto-attaching; a co-occurrence/recall matrix; and a subtle fading-and-resurfacing treatment on text to evoke forgetting and recall.

---

### B4. `Sentiment-Analysis-and-Mental-Health-Guidance-in-Azure`

- **Repo:** https://github.com/Vishal-AS-0407/Sentiment-Analysis-and-Mental-Health-Guidance-in-Azure · created 2024-11-17, pushed 2024-12-24 · **3 stars**, pinned #3
- **What it does** [README]: an Azure-hosted platform that (1) analyses text sentiment with multilingual support and (2) predicts mental-health state from psychological parameters, producing a detailed report with therapy and stress-management recommendations.
- **Story arc** [README]: *Problem* — sentiment signals and mental-health assessment are usually separate tools, and neither reaches people in a usable form. *Constraint* — the system had to be scalable, multilingual, and deployable as a real hosted service, not a notebook. *Insight* — compose **managed Azure AI services** rather than training models: Azure Language Service for document- and sentence-level sentiment plus entity/key-phrase extraction, and GPT-3.5 Turbo in Azure AI Studio for the mental-health report, all behind a lightweight Flask app with **CI/CD to Azure Web Service**. *Result* — a deployed, continuously-integrated web app with two working report flows. **This is his clearest cloud/MLOps story** — the only repo with a committed GitHub Actions workflow.
- **Pipeline (ordered)** [README]: *Sentiment:* 1. upload text → 2. Azure Language Service → 3. document + sentence sentiment, entity recognition, key-phrase extraction → 4. sentiment report. *Mental health:* 1. input psychological parameters + personal details → 2. **GPT-3.5 Turbo** via Azure AI Studio → 3. report covering emotional state, cognitive load, decision-making ability → 4. personalised therapy / stress-management recommendations, downloadable.
- **Metrics:** ⚠️ **none stated** — no accuracy, latency, or throughput figures. It is an integration project.
- **Tech stack** [README + tree]: **Azure Language Service**, **Azure AI Studio (GPT-3.5 Turbo)**, **Azure Web Service**, **Flask**, Python 3.8+, HTML/CSS templates. Env vars: `AZURE_LANGUAGE_API_KEY`, `AZURE_LANGUAGE_ENDPOINT`, `GPT3_API_KEY`, `GPT3_ENDPOINT`. **CI/CD:** `.github/workflows/master_clouddeploycd.yml`.
- **Data artifacts:** pipeline diagram — https://github.com/user-attachments/assets/85011672-e5a0-42bb-b8e6-6468a0e2e431 · sentiment output — https://github.com/user-attachments/assets/96342d74-9deb-4d64-9285-0746716fdd47 · mental-health report — https://github.com/user-attachments/assets/62cb5218-510f-4022-ad83-384933a0efb1 · in-repo sample output `reports/report_Vishal A.S_12.txt`.
- **Repo vitals:** **18 commits** (highest of any original repo; Vishal 13 + vishalwebnew 5) · 40 KB · no notebook · **deployable: Flask on Azure Web Service with GitHub Actions CD** · 6 Jinja templates.
- **Visual identity cues:** Domain world sits at **cloud infrastructure ∩ mental wellbeing** — a genuine tension, and the theme should use it rather than pick a side. Take the structural language from Azure: the crisp Azure blue (#0078D4), service-tile grids, pipeline-stage chevrons, deployment-status pills — a page that looks like a well-designed cloud console. Then let the *content* soften it, so warm empathetic tones bleed into the cold infrastructure blue as the reader moves from the deployment story to the human one. The signature visual form is the **sentiment gradient bar**: a continuous negative→neutral→positive ramp (rust → grey → sage) with text fragments positioned along it, and sentences highlighting individually to convey sentence-level granularity. Second: the **CI/CD pipeline** drawn as an animated commit → build → test → deploy chain with stages going green in sequence — this is the only project that earns that diagram, so it should be prominent. Supporting motifs: multilingual text switching scripts inside the analyser, entity/key-phrase chips lifting out of a paragraph, and the mental-health report as a calm, well-typeset document.

---

### B5. `RAG-Based-Financial-Advisor-System-with-Pinecone-and-Gemini`

- **Repo:** https://github.com/Vishal-AS-0407/RAG-Based-Financial-Advisor-System-with-Pinecone-and-Gemini · created/pushed 2024-12-24
- **What it does** [README]: a Retrieval-Augmented Generation system that "provides actionable financial advice by combining document embeddings stored in a Pinecone index and the Gemini Generative AI model", acting as a financial advisor specialising in tax planning and investment strategies.
- **Story arc** [README]: *Problem* — general LLMs give generic, ungrounded financial advice and cannot cite current tax/investment specifics. *Constraint* — the source corpus had to be built from scratch (hence the bundled web crawler and scraper) and cleaned hard, because embedding quality drives retrieval quality. *Insight* — an aggressive **linguistic preprocessing stage before embedding** — punctuation and number stripping, tokenisation, lemmatisation, stopword removal — to raise embedding quality, then chunk with `RecursiveCharacterTextSplitter`, embed with SentenceTransformer, and store in Pinecone; at query time, retrieve context and condition Gemini with a financial-advisor persona. *Result* — a working query→advice loop over a self-collected document corpus.
- **Pipeline (ordered)** [README]: 1. **web crawler** (`webcrawler.py`) collects sources → 2. **web scraper** (`webscraper.py`) extracts text into `files/` → 3. `TextPreprocessor`: strip punctuation/numbers, tokenise, lemmatise, remove stopwords → 4. `RecursiveCharacterTextSplitter` chunking → 5. **SentenceTransformer** embeddings → 6. **Pinecone** index upsert → 7. user query → retrieve relevant contexts → 8. query + context → **Gemini** → 9. tailored financial recommendation.
- **Metrics:** ⚠️ **none** — no retrieval precision, latency, or corpus size stated.
- **Tech stack** [README]: Python, **Pinecone**, **Gemini** (google-generativeai), **SentenceTransformer**, LangChain `RecursiveCharacterTextSplitter`, NLTK-style preprocessing. ⚠️ `requirements.txt` is UTF-16/BOM-encoded and did not decode.
- **Data artifacts:** one output screenshot — https://github.com/user-attachments/assets/56436a3b-a265-4868-88ca-45e8f27e8f0c (a WhatsApp-exported image, dated 2024-12-14 — low production quality; consider re-capturing).
- **Repo vitals:** 3 commits · 13 KB · no notebook · CLI (`python main.py`), no web UI · files: `main.py`, `webcrawler.py`, `webscraper.py`, `README.md`, `requirements.txt`.
- **Visual identity cues:** Domain world is **personal finance and tax advisory** — conservative, trust-signalling, and best served by restraint rather than flash. Palette: deep forest green and gold on ivory, the register of ledgers and bank statements; a serif face for figures lends the authority the domain expects. The signature visual form is the **RAG retrieval flow made legible**: a query entering, documents in a shelf fanning out, three chunks illuminating as retrieved, and their text visibly flowing into the composed answer — most RAG diagrams are boxes and arrows, and showing actual text migrating from source to answer is both more honest and more interesting. Second signature: **embedding space as a scatter** with the query point and its retrieved neighbours circled. Supporting motifs: ruled ledger lines and column rules as layout structure, ₹ currency glyphs, compound-growth curves, a document stack for the crawled corpus, and citation chips anchoring each claim to its source — visually reinforcing that the whole point is *grounded* advice.

---

### B6. `Aerosol-Optical-Depth-Estimation` — VanillaNet

- **Repo:** https://github.com/Vishal-AS-0407/Aerosol-Optical-Depth-Estimation · created/pushed 2024-12-24 · **4 stars — his most-starred repo**
- **What it does** [README]: a hackathon entry improving **Aerosol Optical Depth** estimation from Sentinel-2 satellite imagery validated against the AERONET ground-truth network, using a custom architecture called **VanillaNet**.
- **Story arc** [README]: *Problem* — AOD drives climate and public-health modelling, but ground stations (AERONET) are sparse; estimating AOD from satellite imagery would give global coverage. *Constraint* — a competition setting with 13-band multispectral input, cloud contamination across an 8-year archive, and varying image resolutions. *Insight* — a purpose-built architecture: **series-informed learnable convolution-based activation functions** for expressiveness, **batch-normalisation fusion** for efficient deployable inference, **adaptive pooling** to absorb resolution variation, and Leaky ReLU for training stability. *Result* — **45th place** in the competition.
- **Pipeline (ordered)** [README + tree]: 1. Sentinel-2 imagery, 13 bands (`B1`–`B12`, `B8A`), cloud-masked, 2016-01-01 → 2024-05-01 → 2. `dataLoader.py` (rasterio) → 3. VanillaNet: custom learnable activations → staged conv feature extraction with progressive downsampling → adaptive pooling → 4. `trainer/trainer.py` (+ a mixed-precision trainer variant) → 5. AOD regression output → 6. validation against AERONET ground truth.
- **Quantitative material** [README]: **45th place** final ranking; 13 spectral bands; date range 2016-01-01 to 2024-05-01. ⚠️ **No RMSE, R², or MAE reported** — the "Results" section contains only the placement. Honest framing: a competition entry, mid-field.
- **Tech stack** [requirements.txt — verified]: **torch** 2.3.1, **rasterio** 1.3.10, NumPy 2.0.1, pandas 2.2.2, **wandb** 0.17.5 (experiment tracking), nvidia_smi. Competition: **Solafune**.
- **Data artifacts:** ⚠️ **no images in the README.** In-repo: three architecture families — `model/vanillanet.py`, `model/model_van.py`, `model/Resnetlstm.py`, `model/Vgglstm.py`, plus a full `model/resnet/` package — [INFERRED] evidence of real architecture-search work the README doesn't mention.
- **Repo vitals:** 5 commits · 33 KB · no notebook · training CLI, no app · clean `model/` + `trainer/` + `utils/` separation with `config.json`.
- **Visual identity cues:** Domain world is **atmospheric remote sensing** — the most scientifically austere project here, and it should look like an instrument readout rather than a product. Palette: the aerosol colour ramp itself, deep blue (clear air) through green and yellow to thick orange-brown (heavy aerosol loading), on a dark ground — a real scientific colormap that carries meaning. The signature visual form is the **13-band spectral stack**: the same scene rendered thirteen times, one per Sentinel-2 band, offset in perspective like a deck of cards, with bands lighting up in sequence — it makes multispectral input tangible in a way a single RGB thumbnail never does. Second signature: a **spectral response curve**, wavelength on x, reflectance on y, tracing across the bands. Supporting motifs: a world map with sparse AERONET station pins (illustrating exactly why satellite estimation matters), atmospheric haze gradients as literal page-depth layering, satellite swath/orbit tracks, and a scatter of predicted-vs-actual AOD against a 45° reference line. A leaderboard element can honestly show 45th place as a competition context rather than a headline.

---

### B7. `The-Efficient-AI-Challenge---Birds-Classification`

- **Repo:** https://github.com/Vishal-AS-0407/The-Efficient-AI-Challenge---Birds-Classification · created/pushed 2024-12-24
- **What it does** [README]: bird species classification for a Kaggle competition, training an EfficientNet-B7 teacher and **distilling it into an EdgeNeXt xx-small student** for lightweight inference. README claims **"Leaderboard #1"**.
- **Story arc** [README]: *Problem* — fine-grained classification across 200 visually similar bird species. *Constraint* — the competition was an *efficiency* challenge: raw accuracy from a huge model is not enough, the deployed model must be small and fast. *Insight* — decouple the two goals via **knowledge distillation with temperature scaling**: let a 66M-parameter EfficientNet-B7 teacher learn the hard fine-grained task, then transfer its soft predictions into a 1.3M-parameter EdgeNeXt xx-small student — a **~51× parameter reduction**. *Result* — leaderboard #1 (as claimed).
- **Pipeline (ordered)** [README]: 1. CUB-200-2011 dataset + `annotation2.csv`, 80-20 split → 2. `effb7.py` — fine-tune pretrained **EfficientNet-B7** teacher → 3. `distill.py` — knowledge distillation with temperature scaling into **EdgeNeXt xx-small** → 4. `test.py` — inference + Kaggle submission file.
- **Quantitative material** [README] — reproduced verbatim:

| Model | Parameters | Inference Time |
|---|---|---|
| EfficientNet-B7 | 66M | High |
| EdgeNeXt xx-small | 1.3M | Low |

Dataset: **CUB-200-2011**, **200 species**, **11,788 images**, 80-20 split. ⚠️ **No accuracy figure is given for either model**, and "Inference Time" is qualitative ("High"/"Low") rather than measured. The **"Leaderboard #1" claim is unverifiable** from the repo — no score, no leaderboard screenshot. Competition link: https://www.kaggle.com/competitions/bird-classification-anokha/data ([INFERRED] "Anokha" is Amrita's tech festival, so this is likely an intra-institution competition — worth stating accurately rather than implying an open Kaggle win).
- **Tech stack** [README]: Python 3.8+, PyTorch 1.12+, EfficientNet-B7, EdgeNeXt, knowledge distillation, temperature scaling. ⚠️ `requirements.txt` is UTF-16/BOM-encoded, undecoded.
- **Data artifacts:** ⚠️ no images. `FINALSUBMISSION.ipynb` is committed.
- **Repo vitals:** 3 commits · 14 KB · 1 notebook · no app.
- **Visual identity cues:** Domain world is **ornithology meets model efficiency** — a charming pairing, and the theme should hold both. Palette: plumage-derived and unapologetically saturated — the field-guide palette of cardinal red, jay blue, warbler yellow against soft naturalist paper cream. The signature visual form is the **teacher-student distillation diagram**: a large, dense network beside a tiny one, with soft-label knowledge flowing from big to small, and the two parameter counts (66M → 1.3M) counting down against each other. That 51× compression is the story, and a **proportional area comparison** — one huge square, one almost invisible dot — will land it instantly. Second signature: a **fine-grained species grid**, dozens of similar-looking birds tiled to convey why 200-way classification is hard. Supporting motifs: Audubon-style engraved bird illustrations and feather-barb line texture for the naturalist register, a temperature-scaling curve showing softmax softening as T rises, and an accuracy-vs-parameters scatter with the efficient frontier drawn in.

---

### B8. `Hybrid-Time-Series-FrameWork` — FFT + ADMM + LSTM

- **Repo:** https://github.com/Vishal-AS-0407/Hybrid-Time-Series-FrameWork · created/pushed 2025-03-25
- ⚠️ **No README.** The repo contains only four files: `Code.ipynb`, `Data Set.csv`, `PPT.pptx`, `Report.docx`. **Everything below is [VERIFIED] from the committed notebook's code and output cells** — nothing is claimed by Vishal in any README.
- **What it does** [VERIFIED from notebook]: a hybrid time-series forecasting framework that augments an LSTM with **recursively-computed FFT features** and **ADMM-based feature selection**, benchmarked against a plain LSTM baseline on the same data.
- **Story arc** — ⚠️ **cannot be sourced from the repo's documentation, because there is none.** The *technical* arc is reconstructable from code: a plain LSTM on 5 raw features achieves near-zero explanatory power (R² = 0.076); adding two FFT-derived frequency features and ADMM-selected features lifts R² to 0.342 and cuts MAE by ~25%. **What the client must supply:** what the dataset actually is (`Data Set.csv` is unlabelled here), why FFT+ADMM was the chosen combination, and the course/context. **`Report.docx` and `PPT.pptx` are committed and almost certainly contain the full write-up — the client should open them; they are the missing case study.**
- **Pipeline (ordered)** [VERIFIED from notebook]: 1. load CSV → 2. `StandardScaler` → 3. train/test split → 4. **`recursive_fft`** (hand-implemented Cooley-Tukey radix-2 FFT, not `numpy.fft`) on feature 0 → real + imaginary components → 5. **`admm_feature_selection`** (ADMM with soft-thresholding, ρ=1.0, max_iter=100) selects a feature subset → 6. concatenate `[fft_real, fft_imag, admm_selected]` → 7. reshape to LSTM 3-D input → 8. **Keras Sequential: LSTM(250, relu) → Dense(1)**, Adam, MSE loss, 50 epochs, batch 32, validation_split 0.2 → 9. evaluate MSE / MAE / R² + wall-clock time and memory footprint vs the baseline.
- **Quantitative material** [VERIFIED — read from notebook output cells]:

| Variant | Features | Test MSE | Test MAE | R² |
|---|---|---|---|---|
| **With FFT + ADMM** | 7 | **347,209.79** | **441.86** | **0.3418** |
| Baseline (no FFT/ADMM) | 5 | 487,390.76 | 590.68 | 0.0760 |

Improvement: **R² 0.076 → 0.342 (4.5×)**, **MAE −25.2%**, **MSE −28.8%**. Training set 2,298 samples; 50 epochs; batch 32; LSTM 250 units; test set 18 batches. The notebook also instruments time and space complexity for both variants.
⚠️ Honest caveat: R² = 0.34 is a weak absolute fit. The result is a genuine *relative* improvement over the baseline, not a strong forecaster — present it as an ablation study, which is what it is.
- **Tech stack** [VERIFIED from imports]: pandas, NumPy, scikit-learn (`StandardScaler`, `train_test_split`, metrics), **TensorFlow/Keras** (`Sequential`, `LSTM`, `Dense`), matplotlib.
- **Data artifacts:** the notebook contains plot cells; `PPT.pptx` (4.9 MB — likely full of diagrams) and `Report.docx` (1.1 MB) are uninspected goldmines.
- **Repo vitals:** 1 commit (vishalwebnew) · 5.7 MB · **1 notebook, no app**.
- **Visual identity cues:** Domain world is **signal processing applied to forecasting** — mathematical, and the theme should be unapologetically so. Palette: oscilloscope phosphor — near-black ground with amber and cyan traces, a deliberate instrument aesthetic. The signature visual form is the **time domain ↔ frequency domain transform**: a waveform on the left morphing into its frequency spectrum on the right, the single most beautiful animation in signal processing and exactly what this project's core idea is. The hand-rolled recursive FFT deserves its own moment — a **butterfly diagram** showing the radix-2 divide-and-conquer recursion splitting even and odd indices, which is both visually striking and genuinely explanatory of what the code does. Second signature: **ADMM sparsification** — a row of feature bars where soft-thresholding visibly collapses the small ones to zero, leaving a sparse selected subset. Supporting motifs: forecast-vs-actual line pairs with a shaded error band, an R² improvement gauge sweeping 0.076 → 0.342, and LSTM gate diagrams as circuit-like schematics.

---

### B9. `Qubit-GreenFinance` — Green Finance Optimization Platform

- **Repo:** https://github.com/Vishal-AS-0407/Qubit-GreenFinance · created 2025-01-30, pushed 2025-05-04
- **Fork of:** `S-iddhaarth/shaastra`. **Vishal is the single largest contributor: 15 of 26 commits** (Manasha-1204: 6, S-iddhaarth: 3, vishalwebnew: 2). Genuine team-project ownership. [INFERRED] built for **Shaastra** (IIT Madras's technical festival).
- **What it does** [README]: a multi-agent platform addressing "how to optimally allocate capital to sustainable projects for maximum impact" — evaluating and prioritising green investments by balancing ESG impact against financial returns.
- ⚠️ **README self-declares scope:** "This is an initial prototype version of a part of the code developed for the first round of implementation." Present it as a prototype/competition round, not a finished platform.
- **Story arc** [README]: *Problem* — financial institutions need data-driven ways to allocate capital across sustainable projects. *Constraint* — evaluation requires reading complex, unstructured financial and ESG documents, and the allocation itself is a constrained optimisation, not a ranking. *Insight* — split the work between **specialised LLM agents** (document processing, ESG analysis, risk assessment) for the unstructured half and **a custom constrained-optimisation algorithm using linear algebra** for the allocation half — "Used our own constrain optimization algo for getting the optimized resource allocation". *Result* — a Streamlit prototype with automated project reports and an optimised allocation, plus documented formulas.
- **Pipeline (ordered)** [README + tree]: 1. project documents ingested → 2. `crew/agents/document_processor.py` → 3. `esg_analyzer.py` (viability + ESG impact) → 4. `risk_assessor.py` → 5. `crew/workflows/analysis_workflow.py` orchestration → 6. `optimization.py` — custom linear-algebra constrained optimisation → 7. optimal capital allocation + automated report → 8. Streamlit dashboard (`app.py`, `analytics_service.py`).
- **Metrics:** ⚠️ **none stated numerically.** The README shows a formulas screenshot and output screenshots but quotes no figures.
- **Tech stack** [README badges]: Python, **Streamlit**, **FastAPI**, **OpenAI**, **Google Gemini**, **CrewAI**, **Sarvam API**, **Firebase**, **Neo4j**, **TensorFlow**, **PyTorch**, **Pinecone**, **Tavily**. ⚠️ The badge list is far broader than the 6 committed Python files support — [INFERRED] it describes the *team's full ambition*, not this prototype. Verify before repeating the stack.
- **Data artifacts:** 8 images — banner https://github.com/user-attachments/assets/01439845-7c6b-4e95-b56b-aa926fe88ba0 · outputs https://github.com/user-attachments/assets/e025a6ef-6ff3-470d-96ff-22251374042a, .../b1adb13e-d075-4e3d-933d-7ed26111d943, .../8c8e8974-53d1-4c34-b488-2318cf3ceea5, .../88f55fc1-fe14-4989-953f-ec2f372e16b3 · optimisation https://github.com/user-attachments/assets/43a1fed3-77b7-46f7-b2e3-0b3b736dbd0d · **formulas** https://github.com/user-attachments/assets/c62ef9b2-1c03-41a5-8894-e6487391e3a0 · architecture https://github.com/user-attachments/assets/9eee03b3-4b78-4513-9cb0-77b72a53602c · in-repo `PROPOSAL.pdf`, `logo.png`, `outputs.ipynb`.
- **Repo vitals:** 26 commits · **4 contributors** (most collaborative repo) · 5.1 MB · 1 notebook · **Streamlit app**.
- **Visual identity cues:** Domain world is **sustainable finance / ESG** — where environmental and financial visual languages collide, and the theme should stage that collision rather than resolve it. Palette: sustainability green and leaf-vein textures set against the cold greys and ruled grids of financial reporting, with an SDG-derived accent set (the UN Sustainable Development Goal colours are a ready-made, recognisable multi-hue system). The signature visual form is the **efficient frontier / Pareto curve** — ESG impact on one axis, financial return on the other, candidate projects scattered beneath and the optimal allocation traced along the frontier — which is exactly what constrained optimisation produces and reads as serious quantitative finance. Second signature: an **allocation flow diagram**, a Sankey of capital dividing among ranked projects, weights animating as constraints tighten. Supporting motifs: the SDG icon matrix as a background grid, CO₂-reduction contour plots, and the committed formulas screenshot re-set as clean typeset LaTeX — showing real mathematics is a credibility asset worth spending layout on.

---

### B10. `Vega-Agent` / "Asha AI" — ⚠️ **fork with zero commits from Vishal**

**This repo is pinned first on his profile and it is not his work.** Flagging prominently because it is the highest-risk item on the portfolio.

- **Repo:** https://github.com/Vishal-AS-0407/Vega-Agent · forked 2025-05-07
- **Fork of:** `nandini-kuppala/Vega-Agent` (created 2025-04-26).
- **Commit analysis:** **all 74 commits are authored by `nandini-kuppala`. Vishal has 0 commits.** The README's own credits line reads "👥 Contributor: Nandini Kuppala".
- **What it is** [README]: **Asha AI**, a multi-agent career-guidance chatbot for women (starters, restarters, raisers), with agentic RAG over HerKey.com plus Naukri/Indeed/Monster, resume building, skill assessment, interview prep, and voice support in 9-10 Indian languages via Sarvam AI. Live at https://ashacareerguide.streamlit.app/. Tech: Streamlit, FastAPI, MongoDB, Pinecone, CrewAI, LangChain, Gemini, Groq, Firecrawl, Sarvam AI. Seven named agents (Profile Analyzer, Events & Sessions, Groups, Jobs, Career Guide, Resume Builder, Bias Detection).
- **Recommendation:** **Do not present this as Vishal's project.** Either (a) drop it entirely, (b) unpin it and leave it as a plain fork, or (c) if he genuinely contributed outside git — ideation, design, demo, competition teammate — say exactly that in one honest line. Pinning an unmodified fork of someone else's repo above his own work is the kind of thing a technical reviewer checks, and it currently undercuts genuinely strong projects like the NAACL paper. It also has 15 README images, which may be why it looks attractive — but they are Nandini's screenshots.
- **Asset note:** its 15 image URLs are catalogued in §5 and marked NOT-VISHAL. **Do not reuse them.**

---

## 4. Tier C — Coursework / toy repos

One line each. All are small, self-contained, and appropriate as a "foundations" strip rather than case studies.

| Repo | Lang | What it is | Created / Pushed |
|---|---|---|---|
| `Hack-Computer-Using-NAND-Gate` | Scilab/HDL | Nand2Tetris course build — a full Hack computer from NAND gates up through ALU, control unit, memory, running Hack assembly; component-wise `.hdl`/`.tst`/`.cmp` test scripts. Substantial *as coursework*; 685 KB. | 2024-12-25 / 2024-12-25 |
| `MIPS-to-Binary-converter` | Python | CLI that converts MIPS assembly instructions to binary machine code with syntax validation and corrective feedback; educational tool. 4 KB. | 2024-12-25 / 2024-12-25 |
| `Dijkstra-Algorithm` | C | Dijkstra shortest path over an adjacency matrix, with an HTML visualisation export (`dijkstra_result.html`); uses `6969` as its infinity sentinel. | 2024-12-25 / 2024-12-25 |
| `Telephone-Directory` | C | Menu-driven contact manager with binary-file persistence (`PhoneBook`), tag filtering, and input validation (10-digit unique numbers, alpha-only names). | 2024-12-25 / 2024-12-25 |
| `ml-algorithms-from-scratch` | Python | Six classical ML algorithms (Random Forest, Decision Tree, KNN, Logistic Regression, SVM, Naive Bayes) implemented in pure NumPy, compared on accuracy / time / space on a heart-disease dataset. Good "fundamentals" signal. | 2024-12-25 / 2024-12-25 |
| `Heart-Disease-Prediction-and-Symptom-Analysis` | Jupyter | Six-model comparison on `heart.csv`; **Random Forest best at 90.16% accuracy** [README]; adds interactive symptom follow-up questioning to refine a positive prediction. | 2024-12-25 / 2024-12-25 |
| `Hostel-Magement-System` | Java | Menu-driven hostel admin app (registration, room allocation, attendance, department reports) with flat-file storage. ⚠️ Repo name is **misspelled** ("Magement"). Has a UML diagram + interface screenshot. | 2024-12-25 / 2024-12-25 |
| `Quiz-Website` | HTML/CSS/JS | Static multiple-choice quiz site with real-time scoring and a contact page; 3 screenshots. | 2024-12-25 / 2024-12-25 |
| `portfolio` | TypeScript | The current portfolio site being rebuilt. ⚠️ **README is one line:** "My portfolio 😁" + the URL. Live: https://portfolio-sigma-blond-57.vercel.app/ | 2025-12-10 / 2026-08-03 |
| `Vishal-AS-0407` | Markdown | The profile README repo. See §1. | 2025-07-16 / 2025-07-16 |

[INFERRED] Note the clustering: **nine repos were all created on 24-25 December 2024**, mostly first-semester coursework uploaded in one batch. This is worth knowing because their identical dates make "recent activity" look misleading; date them by *coursework term*, not upload date, if dates are shown at all.

---

## 5. Asset inventory

All README-referenced images. GitHub `user-attachments` URLs are permanent and hotlinkable but **should be downloaded and self-hosted** for a production portfolio (they can be slow and are outside your control).

### Tier A/B — usable assets

| # | Repo | Type | URL |
|---|---|---|---|
| 1 | Agrizon | App screenshot (1828×881) | https://github.com/user-attachments/assets/64f33b44-ce2e-4848-8e12-7bec29baeda8 |
| 2 | Agrizon | App screenshot (1794×887) | https://github.com/user-attachments/assets/70fcf087-e8e9-4f1a-8a37-15356e6d919a |
| 3 | Fraud-Detection | Workflow diagram | https://github.com/user-attachments/assets/8b855bf0-ad81-4d90-82e3-7c78fe6ea48b |
| 4 | Fraud-Detection | Model summary / metrics | https://github.com/user-attachments/assets/b4faa1a3-55f0-4297-aa09-d8786dd91b82 |
| 5 | Fraud-Detection | Chatbot interface | https://github.com/user-attachments/assets/2db3fc55-9a99-48f3-a90a-a10622fcecd3 |
| 6 | NAACL | Workflow diagram | https://github.com/user-attachments/assets/6e04ef85-2bc4-49be-a9e2-44ead374a544 |
| 7 | NAACL | Model architecture | https://github.com/user-attachments/assets/dee737ab-4956-4de0-8ae7-6468fc2ed21a |
| 8 | EEG | Pipeline diagram | https://github.com/user-attachments/assets/fd777c6b-6584-439e-9034-fce58b694226 |
| 9 | EEG | Sample report 1 | https://github.com/user-attachments/assets/1ade8f7d-4fb6-42ce-9566-9264c391ec64 |
| 10 | EEG | Sample report 2 | https://github.com/user-attachments/assets/8984b89a-6eda-484d-a180-f0ae60f6bd90 |
| 11 | EEG | Sample report 3 | https://github.com/user-attachments/assets/7dc6f1d3-354a-470e-9b2c-28726a657c84 |
| 12 | Sentiment-Azure | Pipeline diagram | https://github.com/user-attachments/assets/85011672-e5a0-42bb-b8e6-6468a0e2e431 |
| 13 | Sentiment-Azure | Sentiment output | https://github.com/user-attachments/assets/96342d74-9deb-4d64-9285-0746716fdd47 |
| 14 | Sentiment-Azure | Mental health report | https://github.com/user-attachments/assets/62cb5218-510f-4022-ad83-384933a0efb1 |
| 15 | RAG-Financial | Output screenshot (WhatsApp-quality) | https://github.com/user-attachments/assets/56436a3b-a265-4868-88ca-45e8f27e8f0c |
| 16 | Qubit-GreenFinance | Banner | https://github.com/user-attachments/assets/01439845-7c6b-4e95-b56b-aa926fe88ba0 |
| 17-20 | Qubit-GreenFinance | Outputs ×4 | .../e025a6ef-6ff3-470d-96ff-22251374042a · .../b1adb13e-d075-4e3d-933d-7ed26111d943 · .../8c8e8974-53d1-4c34-b488-2318cf3ceea5 · .../88f55fc1-fe14-4989-953f-ec2f372e16b3 |
| 21 | Qubit-GreenFinance | Optimisation result | https://github.com/user-attachments/assets/43a1fed3-77b7-46f7-b2e3-0b3b736dbd0d |
| 22 | Qubit-GreenFinance | Formulas | https://github.com/user-attachments/assets/c62ef9b2-1c03-41a5-8894-e6487391e3a0 |
| 23 | Qubit-GreenFinance | System architecture | https://github.com/user-attachments/assets/9eee03b3-4b78-4513-9cb0-77b72a53602c |

### In-repo files (raw URLs / paths) — often better than README images

| Repo | Asset | Path or URL |
|---|---|---|
| Why-is-my-Baby-Crying | Confusion matrix | https://raw.githubusercontent.com/Vishal-AS-0407/Why-is-my-Baby-Crying/master/confusion_matrix.png |
| Why-is-my-Baby-Crying | Feature importance | https://raw.githubusercontent.com/Vishal-AS-0407/Why-is-my-Baby-Crying/master/feature_importance.png |
| Why-is-my-Baby-Crying | Class-wise LIME plots | https://raw.githubusercontent.com/Vishal-AS-0407/Why-is-my-Baby-Crying/master/class_wise_lime_plots.png |
| Why-is-my-Baby-Crying | LIME explanation | https://raw.githubusercontent.com/Vishal-AS-0407/Why-is-my-Baby-Crying/master/lime_explanation.png |
| Why-is-my-Baby-Crying | Infant cry LIME visualisation | https://raw.githubusercontent.com/Vishal-AS-0407/Why-is-my-Baby-Crying/master/infant_cry_lime_visualization.png |
| SemantiGraph | Knowledge graph (hero) | `showcase/knowledge_graph.png` |
| SemantiGraph | Top entities | `showcase/top_entities.png` |
| SemantiGraph | Metrics comparison | `showcase/metrics_comparison.png` |
| SemantiGraph | Relationship distribution | `showcase/relationship_distribution.png` |
| SemantiGraph | Benchmark charts | `comparison/comparison_chart.png`, `comparison/enhanced_comparison.png` |
| SemantiGraph | **4 interactive HTML visualisations** | `showcase/visualizations/{topic_network,hierarchy_interactive,knowledge_graph_interactive,sunburst_chart}.html` |
| Agrizon | **4 architecture diagrams (unreferenced by README)** | `Data Flow arch.png`, `Deployment arch.png`, `security arch.png`, `Flow diag.jpeg` |
| Agrizon | Product imagery | `src/assets/{ndvi.png,hero-farmland.jpg,crop-showcase.jpg,satellite-analysis.jpg}` |
| Agrizon | Pitch PDF | `Agrizon.pdf` |
| Vatsal-AI | **12 app screenshots** | `docs/output/Screenshot 2025-12-11 *.png` |
| Vatsal-AI | 5 architecture/feature docs | `docs/{features,tech_stack,user_flow,backend_architecture,frontend_architecture}.md` |
| EEG | Rendered HTML report + PDF | `LLM/generated_report.html`, `Report.pdf` |
| Nurture-Sync | **Lottie animation library** | `assets/animations/*.json` |
| Nurture-Sync | Real app palette | `lib/core/theme/colors.dart` |
| Hybrid-Time-Series | Full write-up + slides | `Report.docx`, `PPT.pptx` |
| Qubit-GreenFinance | Proposal, logo, outputs | `PROPOSAL.pdf`, `logo.png`, `outputs.ipynb` |
| Claire_Chatbot | Sample intelligence report | `report.md` |

### Non-image demo links

| Type | Repo | URL |
|---|---|---|
| 🌐 Live app | Agrizon | https://agri-zon.vercel.app |
| 🌐 Live site | portfolio | https://portfolio-sigma-blond-57.vercel.app/ |
| 🎥 **Demo video** | Nurture-Sync | https://www.youtube.com/watch?v=rx3fVMRsWhA |
| 📊 Pitch deck | Nurture-Sync | https://www.canva.com/design/DAGdmDG1jzk/Y0b2WRfXwRhKwlIj8OSAxg/view |
| 📄 **Published paper** | NAACL | https://openreview.net/forum?id=3emk1VVVKQ |
| 🔗 Dataset | WISP | https://lila.science/datasets/missouricameratraps |
| 🔗 Dataset | EEG | https://zenodo.org/record/546113 · https://www.kaggle.com/c/inria-bci-challenge |
| 🔗 Dataset | Birds | http://www.vision.caltech.edu/datasets/cub_200_2011/ |
| 🔗 Competition | Birds | https://www.kaggle.com/competitions/bird-classification-anokha/data |

### Tier C assets

Dijkstra `.../abfc5361-f894-41d5-a2c4-285926f7d15f` · Hostel UML `.../bbc68042-85d0-479f-a5cd-cf1e768ae82b` + interface `.../da4f0c9c-8bf5-4a5a-9a7b-3a18ad1c3ef3` · MIPS output `.../f1a07530-a1ef-4a2e-a678-9e5bbc9d6e7e` · Telephone menu `.../08bd9a31-1ff9-454e-b9ad-ce72480b389b` · Quiz ×3 `.../de5a9363-...`, `.../035d02d4-...`, `.../74de74bd-...` (all prefixed `https://github.com/user-attachments/assets/`).

### ⛔ DO NOT USE — `Vega-Agent` (not Vishal's work)

15 images: `7cf19f85-2998-42f3-9396-b0484fdaf66e`, `51645ab1-85bf-4767-9753-dfe994d2a4f6`, `8418b9e1-b5be-4c82-9728-49d6ae420a02`, `57bc08fa-7b42-419f-976b-3410f52ab0f7`, `a969df4a-3362-47f8-9e15-baa48b2c82f2`, `dcb112de-c462-46c5-816e-f755a58dc163`, `1fb55873-cd7a-439e-91f3-e85696cbcde4`, `5ce3aba9-2841-4c5c-a6e1-4ed342d8f18f`, `8afc24f7-496e-428f-bab6-e461e471a203`, `aee15e12-1ab1-43fc-91fb-3428e7b3c5df`, `0a01d830-8470-49b0-afa9-00b268718290`, `04617a91-72f9-4605-875b-b47a7df9f620`, `3f8636a7-19f5-4b29-a870-c4c1f59aae3d`, `9b484354-3f82-4de4-a3e5-69f14ac56b9f`, `4368565f-5e49-49af-aac6-569139248d3b`.

---

## 6. Gaps & inconsistencies

### 🔴 Critical — fix before launch

1. **`Vega-Agent` is pinned first and has 0 commits from Vishal.** An unmodified fork of `nandini-kuppala/Vega-Agent`. See §3 B10. Highest-priority item.
2. **Committed secrets.** `Agrizon/backend/.env`, `Nurture-Sync/backend/.env`, and `Nurture-Sync/android/app/google-services.json` are in git history. Audit and **rotate any live keys** (Gemini, Earth Engine, MongoDB, Groq, Firebase).
3. **Broken Google Scholar link** in the profile README: `?user=YOUR_GOOGLE_SCHOLAR_ID` — an unedited placeholder shipped publicly.
4. **`WISP` is not runnable as committed.** README documents `install.py`, `analyze_wildlife.py`, `integrate_markdown_report.py`, `requirements.txt`, and `report_templates/` — **none exist in the repo.**

### 🟠 Metrics claimed but unverifiable

5. **Birds Classification "Leaderboard #1"** — no score, no screenshot, no leaderboard link. The competition ("bird-classification-anokha") is [INFERRED] an Amrita-festival Kaggle competition, not an open one. State it precisely.
6. **`Fraud-Detection`** — README shows a metrics *screenshot* but states **no numbers in text**. Read them off the image or re-run `train.py`.
7. **`EEG`** — README's own table promises "Test accuracy, confusion matrix" outputs, but **no figures appear anywhere.** `Report.pdf` may hold them.
8. **`WISP`** — zero metrics and zero images, for a project whose selling point is *visual* explainability.
9. **`SemantiGraph`** — benchmarks are self-generated and compare only against his own hierarchical variant. The "traditional ~0.5 modularity" baseline is uncited. Also, the hierarchical variant **beats** the flagship on coherence (0.894 vs 0.208) — disclose the trade-off.
10. **`Claire_Chatbot`** — `report.md` is full of precise-looking figures (87.3% confidence, 456% spike, 1,247 discussions) that **may be an illustrative sample rather than live output.** Verify before quoting any of them.
11. **NAACL minor discrepancy** — README quotes both 0.383 and 0.3773 Macro-F1. Use 0.3773 (official leaderboard) and label 0.383 as the dev/ablation figure.
12. **`Why-is-my-Baby-Crying` 98.76%** [VERIFIED from notebook, but] SMOTE appears to be applied before the split, which leaks synthetic samples across it. The number is real; the generalisation claim would not be.

### 🟡 Empty or thin documentation

13. **`Claire_Chatbot` — no README at all.** Only `report.md` (an output artifact) documents it.
14. **`Hybrid-Time-Series-FrameWork` — no README at all.** Only a notebook, a CSV, a PPTX, and a DOCX. (I recovered real metrics from notebook outputs — see B8.)
15. **`portfolio` README is one line:** "My portfolio 😁".
16. **`Nurture-Sync` README is an unfilled hackathon template** — unchecked task boxes, "(Screenshots, GIFs can be added later if needed.)", and a clone URL pointing at a *different* repo (`github.com/Nurture-Sync/Nurture-Sync-Combined`). Too thin for a case-study narrative.
17. **`Memora` README documents 8+ files that don't exist**, embeds a hardcoded local path (`c:\Users\visha\Desktop\Memora\Memora`), and tells users to activate a venv that isn't committed.
18. **`Clothcut`** README references `core/geometry_utils.py`, absent from the repo.
19. **Not one repo has a GitHub description or topics set.** All 29 show blank descriptions in the API. Easy, high-leverage fix for anyone browsing the profile.
20. **Placeholder clone URLs** — many READMEs still say `git clone https://github.com/your-username/...` (EEG, Sentiment-Azure, RAG, Aerosol, Birds, ml-algorithms, Heart-Disease, Dijkstra, Hostel, MIPS, SemantiGraph). Cosmetic but reads as unfinished.

### 🟡 Naming and presentation

21. **Misspelled repo names:** `sematic_model_unstructured_data` (→ *semantic*; real name **SemantiGraph**), `Hostel-Magement-System` (→ *Management*).
22. **The 93-character repo name** for the fraud project breaks Windows path limits on clone. Needs a short display name.
23. **Project name vs repo name mismatches** to resolve for the site: `Vega-Agent`→"Asha AI", `sematic_model_unstructured_data`→"SemantiGraph", `Clothcut`→"AdvanceCut", `Claire_Chatbot`→"CLAIRE", `Aerosol-Optical-Depth-Estimation`→"VanillaNet", `Why-is-my-Baby-Crying`→"Baby Cry Analysis", `WISP`→full expansion, `Qubit-GreenFinance`→"Green Finance Optimization Platform".

### 🟡 Profile-level

24. **Skill badges without repo evidence.** The profile README badges **Docker, Kubernetes, MySQL, PostgreSQL, Firebase, OpenCV, TensorFlow, React** among others. Of these I found evidence only for TensorFlow (Hybrid notebook), Firebase (Nurture-Sync Android config), React (Agrizon, Vatsal-AI), and PostgreSQL (Supabase migrations in Agrizon). **No Docker, Kubernetes, MySQL, or OpenCV usage appears in any public repo.** Trim or substantiate.
25. **Two git identities** (`Vishal-AS-0407` and `vishalwebnew`) split his contribution graph and make his own repos look multi-author. Consider adding the university email to the primary GitHub account so commits consolidate.
26. **Student roll-number email** (`cb.en.u4aie22159@cb.students.amrita.edu`) is exposed in commit metadata across most repos. Not fixable retroactively without history rewriting, but worth knowing.
27. **Low commit counts on the newest, most impressive work.** WISP, Vatsal-AI, Clothcut, and Hybrid have **1 commit each**; Agrizon and Claire have 2. [INFERRED] these were developed locally and uploaded in one push. It means there is no development narrative to show, and to a reviewer checking history it can read as bulk-uploaded. Nothing to fix now — just don't build page features around commit activity.
28. **The chess fact is buried.** "International chess player with 50+ tournament wins" appears only in the profile README. It is the most distinctive personal detail available and belongs on the portfolio's About section.
29. **Nine repos share a 24-25 Dec 2024 creation date** — a bulk coursework upload. Don't sort the portfolio by repo date.

---

## 7. Case-study readiness matrix

Covers all Tier A and Tier B projects. "Viable from repo alone?" means: could a writer produce a truthful 300-500 word case study using only what is committed, without asking Vishal anything?

| Project | README depth | Has metrics? | Has diagrams? | Has demo? | Case-study viable from repo alone? | What's missing |
|---|---|---|---|---|---|---|
| **A1** NAACL / Synapse | Rich | ✅ Strong (2 verbatim tables, Rank 1, Macro-F1 0.3773) | ✅ 2 (workflow, architecture) | ✅ Published paper | ✅ **Yes — fully** | Nothing material. Optionally reconcile 0.383 vs 0.3773. |
| **A2** SemantiGraph | Rich (best in account) | ✅ Strong (modularity 0.787, 97.7% retrieval, benchmark table) | ✅ 6 charts + 4 interactive HTML | ⚠️ No live URL | ✅ **Yes — fully** | A hosted demo; honest framing of the coherence trade-off. |
| **A3** Fraud + VQA | Rich | ❌ **Screenshot only, no numbers in text** | ✅ 3 (workflow, metrics img, UI) | ⚠️ Local Streamlit only | ⚠️ **Partly** | Actual fraud metrics (accuracy/precision/recall/F1); decodable requirements.txt. |
| **A4** Agrizon | Rich (setup-guide style) | ⚠️ Systems figures only (5 yrs, 6 classes, 2-5 min) | ✅ 4 in-repo arch diagrams + 2 screenshots | ✅ **Live: agri-zon.vercel.app** | ✅ **Yes** | Narrative framing (README is a setup guide, not a story); any validation of the clustering. |
| **A5** EEG Monitoring | Rich | ❌ **None** (only dataset specs: 14ch/128Hz, 56ch/200Hz) | ✅ Pipeline + 3 report samples | ⚠️ No app | ⚠️ **Partly** | Model accuracy/F1/confusion matrices — promised by README, never stated. Check `Report.pdf`. |
| **A6** WISP | Rich prose | ❌ **None** | ❌ **Zero images** | ⚠️ No app | ⚠️ **Partly** | Everything quantitative; GradCAM sample outputs; **5 documented files missing from repo**; class count. |
| **A7** Vatsal-AI | Medium (+5 detailed docs) | ❌ None stated | ✅ 12 screenshots + doc diagrams | ⚠️ Local FastAPI+React | ✅ **Yes** (via `docs/`) | Cry-model accuracy + class list; the `docs/` files need mining (I did not read them fully). |
| **A8** Why-is-my-Baby-Crying | Medium | ✅ **Verified** (98.76% acc/F1/recall, 461 feats, 1525 samples) — *from notebook, not README* | ✅ 5 in-repo figures (confusion, LIME ×3, importance) | ⚠️ Local Streamlit | ✅ **Yes** | README never cites its own metrics or figures; class list; SMOTE-leakage caveat. |
| **A9** Nurture-Sync | **Thin** (hackathon template) | ❌ None | ❌ No screenshots in README | ✅ **Video + pitch deck** | ❌ **No** | Problem framing, technical insight, outcome, hackathon name/placement. **Use the demo video + Canva deck.** |
| **B1** Clothcut / AdvanceCut | Rich | ⚠️ App computes them; none published | ❌ **Zero images** | ⚠️ Local Streamlit | ⚠️ **Partly** | Screenshots (must run it); benchmark utilisation numbers; `geometry_utils.py` missing. |
| **B2** Claire_Chatbot | ⛔ **EMPTY — no README** | ⚠️ `report.md` figures, **provenance unverified** | ❌ None | ⚠️ Procfile-ready, no live URL | ❌ **No** | Problem statement, real data sources, whether report figures are live or sample, deploy URL. |
| **B3** Memora | Rich | ❌ None (library) | ✅ Mermaid architecture diagram | ⚠️ Library only | ✅ **Yes** | Any latency/recall benchmark; **README documents 8+ nonexistent files**; hardcoded local path. |
| **B4** Sentiment-Azure | Rich | ❌ None | ✅ Pipeline + 2 outputs | ⚠️ Was on Azure; status unknown | ✅ **Yes** | Whether the Azure deployment is still live; any latency/accuracy figures. |
| **B5** RAG-Financial | Rich | ❌ None | ⚠️ 1 low-quality screenshot | ⚠️ CLI only | ✅ **Yes** | Corpus size, retrieval quality; better screenshot; decodable requirements.txt. |
| **B6** Aerosol / VanillaNet | Medium | ⚠️ **Rank only (45th)** — no RMSE/R² | ❌ No images | ⚠️ Training CLI | ⚠️ **Partly** | Error metrics; why VanillaNet over the committed ResNet/VGG-LSTM alternatives. |
| **B7** Birds Classification | Medium | ⚠️ Params table (66M→1.3M) + dataset; **no accuracy**; **#1 claim unverified** | ❌ No images | ❌ None | ⚠️ **Partly** | Accuracy for teacher and student; measured inference times; leaderboard proof. |
| **B8** Hybrid Time-Series | ⛔ **EMPTY — no README** | ✅ **Verified from notebook** (R² 0.342 vs 0.076; MAE −25.2%) | ⚠️ Notebook plots only | ❌ None | ⚠️ **Partly** (technically yes, narratively no) | What the dataset is; why FFT+ADMM; course context. **`Report.docx` + `PPT.pptx` contain it — open them.** |
| **B9** Qubit-GreenFinance | Medium (self-declared prototype) | ❌ None numeric | ✅ 8 images incl. architecture + formulas | ⚠️ Local Streamlit | ⚠️ **Partly** | Which badged technologies were actually used; competition name/result; scope honesty ("first round prototype"). |
| **B10** Vega-Agent / Asha AI | Rich | ⚠️ Perf screenshots, no text figures | ✅ 15 images | ✅ Live Streamlit | ⛔ **N/A — not his work** | **0 commits from Vishal.** Do not write a case study. See §3 B10. |

### Summary of readiness

- **Ready now (7):** NAACL, SemantiGraph, Agrizon, Vatsal-AI, Why-is-my-Baby-Crying, Memora, Sentiment-Azure, RAG-Financial *(8 counting RAG)*
- **Needs one input from Vishal (7):** Fraud+VQA, EEG, WISP, Clothcut, Aerosol, Birds, Qubit-GreenFinance — mostly a single missing metric or a screenshot
- **Blocked on client (3):** Nurture-Sync (use video + deck), Claire_Chatbot (no README), Hybrid Time-Series (open the DOCX/PPTX)
- **Exclude (1):** Vega-Agent

**Highest-leverage actions, in order:** (1) resolve the Vega-Agent pin; (2) rotate committed secrets; (3) open `Report.docx`/`PPT.pptx` (Hybrid), `Report.pdf` (EEG), and `Agrizon.pdf` — three write-ups already exist and would upgrade three projects at once; (4) run Clothcut and WISP once to capture screenshots; (5) set descriptions and topics on all 29 repos.
