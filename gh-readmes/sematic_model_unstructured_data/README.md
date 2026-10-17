<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0E1B2C,55:2E4A6E,100:BBD6F2&height=230&section=header&text=SemantiGraph&fontSize=66&fontColor=F2F8FF&fontAlignY=34&desc=PDFs%20%E2%86%92%20a%20typed%2C%20traversable%20knowledge%20graph&descSize=19&descAlignY=58&animation=fadeIn" width="100%" alt="SemantiGraph"/>

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=21&duration=2800&pause=900&color=BBD6F2&center=true&vCenter=true&width=740&lines=%F0%9F%93%9A+A+folder+of+PDFs+nobody+can+query;%F0%9F%95%B8%EF%B8%8F+609+entities+%C2%B7+822+edges+%C2%B7+10+relation+types;%F0%9F%A7%A9+Modularity+0.787+%E2%80%94+14+topics;%F0%9F%94%97+ViT+%E2%86%92+Transformer+%E2%86%92+GPT-3%2C+in+2+hops" alt="typing summary"/>

<br/>

<img src="https://img.shields.io/badge/Modularity-0.787-2EA44F?style=for-the-badge" alt="modularity"/>
<img src="https://img.shields.io/badge/Entities-609-BBD6F2?style=for-the-badge&labelColor=0E1B2C" alt="entities"/>
<img src="https://img.shields.io/badge/Typed_relations-10-8A2BE2?style=for-the-badge" alt="relations"/>
<img src="https://img.shields.io/badge/GPT--4o--mini-412991?style=for-the-badge&logo=openai&logoColor=white" alt="OpenAI"/>
<a href="https://portfolio-sigma-blond-57.vercel.app/work/semantic-modeling"><img src="https://img.shields.io/badge/Case_study-The_Plate-0E1B2C?style=for-the-badge&labelColor=BBD6F2" alt="case study"/></a>

</div>

<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="100%" alt="divider"/>

<details>
<summary><b>📑 Table of contents</b></summary>

- [📌 Overview](#-overview)
- [✨ Highlights](#-highlights)
- [🧠 The pipeline](#-the-pipeline)
- [🕸️ The graph](#️-the-graph)
- [📊 Results](#-results)
- [🔬 Under the hood](#-under-the-hood)
- [🚀 Getting started](#-getting-started)
- [📂 Project structure](#-project-structure)
- [🧭 Honest notes & roadmap](#-honest-notes--roadmap)

</details>

## 📌 Overview

Knowledge lives in PDFs. Chunk-and-embed RAG finds passages that **mention** ViT — but can't tell
you that ViT `trained_on` ImageNet-21k, or that another paper `compared_to` it. **Chunks have no
relationships.**

SemantiGraph builds the graph instead, and solves the four problems RAG never has to face:

| Problem | Fix |
|---|---|
| 🪞 `ViT`, `Vision Transformer`, `ViT/DeiT`… one concept, a dozen nodes | Two-pass entity resolution → **32% dedup** |
| 🔗 Almost every extracted edge is `related_to` | Retyping pass → **473 edges, 10 types** |
| 🌵 Average degree ≈ 1 — nowhere to hop | Densification → **+518 edges, degree 2.70** |
| 🧮 No obvious `k`, heavy-tailed degrees | Louvain · Spectral · Node2Vec+HDBSCAN |

## ✨ Highlights

<table>
<tr>
<td width="50%" valign="top">

### 🪞 Lexical *and* semantic resolution
Fuzzy match ≥ 85 catches plurals and typos; embeddings ≥ 0.85 catch `ViT` ≈ `Vision Transformer`.
Each covers the other's blind spot.

</td>
<td width="50%" valign="top">

### 🏷️ Typing as a graph-level judgement
A 2,000-char chunk can't tell training from evaluation. The finished graph's **neighbourhood**
can — so edges are retyped afterwards.

</td>
</tr>
<tr>
<td valign="top">

### ⚖️ Trade-offs reported, not hidden
Densifying dropped modularity **0.787 → 0.670** — the price of a graph you can walk. Both numbers
are committed.

</td>
<td valign="top">

### 🔗 Multi-hop retrieval
Seed on matching entities, expand two hops, keep the hop distance. GPT-3 arrives at hop 2 — no
embedding of the question would find it.

</td>
</tr>
</table>

## 🧠 The pipeline

```mermaid
flowchart TD
    P["📄 PDFs"] --> M1["1 · Extraction<br/>PyPDF2 + pdfplumber · 2,000 / 200 overlap"]
    M1 --> M2["2 · Entities & relations<br/>GPT-4o-mini · JSON schema"]
    M2 --> M3["3 · Global graph<br/>fuzzy ≥ 85 + embedding ≥ 0.85"]
    M3 --> M4["4 · Enhancement<br/>PageRank α = 0.85 + centralities"]
    M4 --> M5["5 · Clustering<br/>Louvain · Spectral · Node2Vec+HDBSCAN"]
    M5 --> BASE["📦 Baseline<br/>14 topics · Q = 0.787"]
    BASE --> PH5["✨ Improvement<br/>densify · rescue · summarise · retype"]
    PH5 --> FINAL["🕸️ Final graph<br/>609 nodes · 822 edges"]
    FINAL --> R1["🔗 Graph-aware retrieval<br/>2-hop expansion"]
    FINAL --> R2["🌳 Hierarchy<br/>14 → 7 → 3 → 2 → 1"]
    R1 --> BENCH["📊 Benchmark: flat vs hierarchical"]
    R2 --> BENCH
    style PH5 fill:#2E4A6E,stroke:#BBD6F2,color:#F2F8FF
    style FINAL fill:#BBD6F2,stroke:#0E1B2C,color:#0E1B2C
```

## 🕸️ The graph

<div align="center">

<img src="https://raw.githubusercontent.com/Vishal-AS-0407/sematic_model_unstructured_data/main/showcase/knowledge_graph.png" alt="Knowledge graph" width="90%"/>

<table>
<tr>
<td align="center" width="50%"><b>🏷️ Relation types</b><br/><img src="https://raw.githubusercontent.com/Vishal-AS-0407/sematic_model_unstructured_data/main/showcase/relationship_distribution.png" alt="Relation distribution"/></td>
<td align="center" width="50%"><b>⭐ Top entities</b><br/><img src="https://raw.githubusercontent.com/Vishal-AS-0407/sematic_model_unstructured_data/main/showcase/top_entities.png" alt="Top entities"/></td>
</tr>
</table>

</div>

**A real 2-hop retrieval:**

```
❓ How does Vision Transformer (ViT) work?

🌱 Seeds (hop 0):  ViT-Base · Vision Transformer (ViT) · ViT-Large · ViT · ViT/DeiT
🔗 Expanded:       ImageNet-21k (hop 1) · Transformer architecture (hop 1) · GPT-3 (hop 2)

Vision Transformer (ViT) → uses       → Transformer
Vision Transformer (ViT) → trained_on → ImageNet-21k
Vision Transformer (ViT) → trained_on → JFT-300M

20 entities · 27 relationships · max hop 2
```

## 📊 Results

Full run: **95.9 s**, five phases. Every number below is read from committed JSON
(`showcase/results.json`, `comparison/*.json`, `data/phase5_results.json`).

| Metric | Value |
|---|:---:|
| 🧬 Unique entities | **609** (32% dedup) |
| 🧩 Semantic topics | **14** |
| 📐 Baseline modularity | **0.787** |
| 🕸️ Edges | 304 → **822** |
| 🏷️ Edges retyped from generic | **473** (10 types) |
| 🛟 Noise entities rescued | 26 |
| ⚡ Retrieval latency | 82 ms flat · 36 ms hierarchical |

**Flat vs hierarchical — a genuinely two-sided result**

| | Flat | Hierarchical |
|---|:---:|:---:|
| Topic coherence | 0.208 | **0.894** |
| Retrieval F1 | **0.274** | 0.000 |
| Precision / recall | 0.167 / **0.783** | — |
| Latency | 82 ms | **36 ms** |

> 🔎 The hierarchy reads far better and is twice as fast — and **retrieves nothing**, because the
> levels above the leaves are summaries with no entities of their own. Reported, not buried.

<details>
<summary><b>📈 Benchmark and hierarchy charts</b></summary>

<p align="center">
  <img src="https://raw.githubusercontent.com/Vishal-AS-0407/sematic_model_unstructured_data/main/comparison/enhanced_comparison.png" alt="Enhanced comparison" width="90%"/>
  <br/><br/>
  <img src="https://raw.githubusercontent.com/Vishal-AS-0407/sematic_model_unstructured_data/main/showcase/visualizations/hierarchy_tree.png" alt="Hierarchy tree" width="90%"/>
  <br/><br/>
  <img src="https://raw.githubusercontent.com/Vishal-AS-0407/sematic_model_unstructured_data/main/showcase/visualizations/clustering_flow.png" alt="Clustering flow" width="90%"/>
</p>

</details>

## 🔬 Under the hood

<details>
<summary><b>🏷️ The ten relation types after retyping</b></summary>

| Relation | Count | Relation | Count |
|---|:---:|---|:---:|
| `semantically_related` | 237 | `authored_by` | 68 |
| `uses` | 222 | `trained_on` | 55 |
| `related_to` | 112 | `part_of` | 13 |
| `evaluated_on` | 100 | `compared_to` | 7 |
| `applied_to` | 7 | `based_on` | 1 |

`trained_on` and `evaluated_on` support completely different traversals; `related_to` supports none.

</details>

<details>
<summary><b>🌵 Densification: what it bought, what it cost</b></summary>

| | Baseline | After |
|---|:---:|:---:|
| Edges | 304 | 822 |
| Average degree | 1.00 | 2.70 |
| Modularity | **0.787** | 0.670 |
| Coverage | 0.384 | 0.427 |

Cross-community links are exactly what modularity penalises — the 0.117 drop is the deliberate
price of traversability.

</details>

<details>
<summary><b>🧮 Three clustering algorithms, for what each one sees</b></summary>

| Method | Sees | Blind to |
|---|---|---|
| **Louvain** | modularity-optimal communities, no `k` | long-range structure |
| **Spectral** | global structure via the Laplacian | needs `k` (8) |
| **Node2Vec + HDBSCAN** | long-range walks (128-d, length 30, 200 walks) | expensive — gated below 500 nodes |

</details>

<details>
<summary><b>⚙️ Key knobs in <code>config.py</code></b></summary>

```python
OPENAI_MODEL                   = "gpt-4o-mini"
EMBEDDING_MODEL                = "text-embedding-3-small"
CHUNK_SIZE, OVERLAP            = 2000, 200
FUZZY_MATCHING_THRESHOLD       = 85
EMBEDDING_SIMILARITY_THRESHOLD = 0.85
PAGERANK_ALPHA                 = 0.85
CLUSTERING_METHOD              = "community"    # 'community' | 'spectral' | 'node2vec' | 'ensemble'
```

</details>

## 🛠️ Tech stack

<p align="center">
  <img src="https://skillicons.dev/icons?i=python,sklearn&theme=dark" alt="Python, scikit-learn"/>
  <img src="https://img.shields.io/badge/OpenAI-GPT--4o--mini-412991?style=for-the-badge&logo=openai&logoColor=white" alt="OpenAI"/>
  <img src="https://img.shields.io/badge/NetworkX-graphs-2C5BB4?style=for-the-badge" alt="NetworkX"/>
  <img src="https://img.shields.io/badge/HDBSCAN-Node2Vec-0E1B2C?style=for-the-badge" alt="HDBSCAN"/>
  <img src="https://img.shields.io/badge/Plotly-interactive-3F4F75?style=for-the-badge&logo=plotly&logoColor=white" alt="Plotly"/>
</p>

## 🚀 Getting started

```bash
git clone https://github.com/Vishal-AS-0407/sematic_model_unstructured_data.git
cd sematic_model_unstructured_data
pip install -r requirements.txt
cp .env.example .env          # add OPENAI_API_KEY
```

| Step | Command | What it does |
|:---:|---|---|
| 1️⃣ | `python run_complete_pipeline.py` | modules 1–5 → baseline graph |
| 2️⃣ | `python run_phase5.py` | densify · rescue · summarise · retype |
| 3️⃣ | `python run_phase6_evaluation.py` | flat vs hierarchical |
| 4️⃣ | `python generate_showcase.py` | figures + Q&A showcase |
| 5️⃣ | `python visualize_hierarchy.py` | interactive HTML |

> 💡 **Tip:** drop PDFs into `data/pdfs/` first. A full run is ~20 min and ~$0.45 of GPT-4o-mini —
> but every output is already committed, so you can read all results for free. The graph ships
> in **JSON, GML, GraphML and edgelist** for Gephi, Cytoscape or NetworkX.

## 📂 Project structure

```
📦 sematic_model_unstructured_data
 ┣ ⚙️ config.py                      every threshold and path
 ┣ 📂 modules
 ┃ ┣ 🐍 module1_pdf_extraction.py
 ┃ ┣ 🐍 hybrid_module2_entity_extraction.py
 ┃ ┣ 🐍 enhanced_module3_global_graph.py
 ┃ ┣ 🐍 enhanced_module4_graph_enhancement.py
 ┃ ┣ 🐍 enhanced_module5_semantic_clustering.py
 ┃ ┣ 🐍 graph_improvements.py        densify · rescue · summarise · retype
 ┃ ┣ 🐍 graph_retrieval.py           seed → multi-hop expansion
 ┃ ┗ 🐍 hierarchical_*.py            the 14 → 1 tree + its retrieval
 ┣ 🐍 run_*.py                       pipeline, phase 5, benchmarks, evaluation
 ┣ 📂 data/best_kg                   the graph in 4 formats
 ┣ 📂 showcase                       figures, qa_showcase.md, interactive HTML
 ┗ 📂 comparison                     benchmark JSON + charts
```

## 🧭 Honest notes & roadmap

<details>
<summary><b>Read before quoting numbers</b></summary>

- 🗳️ **`ensemble` is a priority cascade, not a vote** — Louvain wins, Spectral fills Louvain's
  noise, Node2Vec is computed and discarded. The default config is plain Louvain anyway.
- 📐 **0.787 is the baseline**; the final traversable graph is 0.670. Both are reported.
- 🧩 **Coverage is 38–43%** — 375 of 609 entities are single-mention noise; only the 26 with real
  neighbourhood evidence are rescued.
- 📂 `data/pdfs/` ships empty — the AI/ML paper corpus isn't redistributed; all downstream
  artefacts are committed.
- 🧪 The "hybrid" extractor runs GPT-4o-mini only; spaCy is configured but not wired in.

**Roadmap**
- [ ] Real consensus clustering over a co-association matrix
- [ ] Hierarchical retrieval that descends to leaf entities
- [ ] spaCy + LLM hybrid extraction
- [ ] Query UI over the graph

</details>

<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="100%" alt="divider"/>

<div align="center">

**📖 Read the full design story →** [portfolio · The Plate](https://portfolio-sigma-blond-57.vercel.app/work/semantic-modeling)

<a href="https://www.linkedin.com/in/vishal-a-s04/"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn"/></a>
<a href="https://github.com/Vishal-AS-0407"><img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub"/></a>
<a href="mailto:vishalpersonal04@gmail.com"><img src="https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white" alt="Email"/></a>

⭐ **If this helped you, star the repo!**

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:BBD6F2,45:2E4A6E,100:0E1B2C&height=120&section=footer" width="100%" alt="footer"/>

</div>
