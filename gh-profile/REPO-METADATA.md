# Repo descriptions and topics — ready to paste

All 29 public repos. **27 of them currently have no description and no topics**, so
every link from the README lands on an unlabelled page. This is the cheapest
credibility fix available.

**Confidence key**
`✓` verified — I read this repo's code while building the case studies.
`~` inferred from the repo name only. Read the one-liner before you paste it.

---

## The eight with case studies — do these first

| Repo | Description | Topics |
|---|---|---|
| ✓ `Patient-Mental-Health-Monitoring-Using-EEG` | EEG emotion detection across valence, arousal and dominance, with a dual-agent LLM pipeline that turns model output into a readable clinical report. Best Paper, ICBSII 2025 (IEEE). | `eeg` `emotion-recognition` `signal-processing` `biomedical` `explainable-ai` `llm` |
| ✓ `NAACL_DravidianLangTech_2025` | Rank 1 of 25 teams at DravidianLangTech, NAACL 2025. Tamil political sentiment via feature fusion of IndicBERTv2 and lexical representations. macro-F1 0.3773. | `nlp` `tamil` `sentiment-analysis` `indicbert` `naacl` `shared-task` |
| ✓ `Why-is-my-Baby-Crying` | Infant cry classification from raw audio. 461 engineered features, a Butterworth bandpass fixed to the infant-cry band, SMOTE rebalancing and LIME explanations. Live Streamlit demo. | `audio-classification` `librosa` `signal-processing` `explainable-ai` `streamlit` `healthcare` |
| ✓ `Fraud-Detection-and-VQA-Based-Multilingual-Customer-Care-Chatbot-with-Speech-Support` | Privacy-preserving fraud detection using federated learning and CKKS homomorphic encryption, so no institution exposes raw transactions. Runner Up, DigiPay Pro (NPCI × IIT Bombay). | `federated-learning` `homomorphic-encryption` `fraud-detection` `privacy` `ckks` `vqa` |
| ✓ `sematic_model_unstructured_data` | Five-phase knowledge-graph pipeline over unstructured documents, with scale-aware adaptive community detection. 0.787 modularity, 97.7% retrieval similarity. | `knowledge-graph` `networkx` `community-detection` `louvain` `node2vec` `hdbscan` |
| ✓ `Memora` | Domain-wise hierarchical memory for LLMs — conversations are tagged by topic and only the relevant slice is retrieved, so multi-domain chats do not cross-talk. | `llm` `memory` `rag` `faiss` `redis` `semantic-caching` |
| ✓ `WISP` | Wildlife species identification from cluttered camera-trap images without bounding boxes, plus a CrewAI multi-agent layer that synthesizes terrain-aware threat maps. | `computer-vision` `wildlife` `efficientnet` `vision-transformer` `captum` `multi-agent` |
| ✓ `Qubit-GreenFinance` | Multi-agent green-finance system scoring projects on a 15×3 SDG impact matrix and feeding a constraint-optimised capital allocation. | `esg` `sdg` `multi-agent` `optimization` `green-finance` |

## Products and applications

| Repo | Description | Topics |
|---|---|---|
| ✓ `Nurture-Sync` | AI-powered maternal and infant health app built at NASSCOM Foundation, funded by Cisco. Top 25 of 1,200+ teams in ThingQbator Cohort 7. | `flutter` `healthcare` `ocr` `nlp` `mobile` |
| ~ `Claire_Chatbot` | Conversational front end for Claire, the multi-source fashion trend analysis system for textile manufacturers. Patent filed, 202541092811. | `chatbot` `trend-analysis` `nlp` |
| ~ `Clothcut` | Cloth-cutting optimisation that minimises fabric waste in mass garment production. | `optimization` `manufacturing` `operations-research` |
| ~ `Agrizon` | Agricultural technology platform. | `agritech` `react` `typescript` |
| ~ `Vatsal-AI` | *(name alone is not enough — write this one yourself)* | — |
| ✓ `portfolio` | Personal portfolio site. React, TypeScript, Tailwind, Framer Motion. | `portfolio` `react` `typescript` `tailwindcss` |

## Machine learning and coursework

| Repo | Description | Topics |
|---|---|---|
| ~ `Hybrid-Time-Series-FrameWork` | Hybrid forecasting framework combining statistical and learned components. | `time-series` `forecasting` `ensemble` |
| ~ `Heart-Disease-Prediction-and-Symptom-Analysis` | Heart disease risk prediction with symptom-level analysis. | `machine-learning` `healthcare` `classification` |
| ~ `RAG-Based-Financial-Advisor-System-with-Pinecone-and-Gemini` | Retrieval-augmented financial advisory system built on Pinecone and Gemini. | `rag` `pinecone` `gemini` `fintech` |
| ~ `Sentiment-Analysis-and-Mental-Health-Guidance-in-Azure` | Sentiment analysis with mental-health guidance, deployed on Azure. | `nlp` `sentiment-analysis` `azure` `mental-health` |
| ~ `The-Efficient-AI-Challenge---Birds-Classification` | Bird species classification under an efficiency constraint. | `computer-vision` `image-classification` `efficient-ml` |
| ~ `Aerosol-Optical-Depth-Estimation` | Aerosol optical depth estimation from remote-sensing data. | `remote-sensing` `regression` `atmospheric-science` |
| ~ `ml-algorithms-from-scratch` | Core ML algorithms implemented from first principles, without a framework. | `machine-learning` `from-scratch` `numpy` `educational` |

## Systems and fundamentals

| Repo | Description | Topics |
|---|---|---|
| ~ `Hack-Computer-Using-NAND-Gate` | The Hack computer built up from NAND gates (Nand2Tetris). | `computer-architecture` `nand2tetris` `hdl` |
| ~ `MIPS-to-Binary-converter` | MIPS assembly to machine-code converter. | `mips` `assembly` `computer-architecture` |
| ~ `Dijkstra-Algorithm` | Dijkstra's shortest-path algorithm in C. | `algorithms` `graph` `c` |
| ~ `Hostel-Magement-System` | Hostel management system in Java. *(note: repo name is misspelled — "Magement". Renaming it is free; GitHub redirects the old URL.)* | `java` `dbms` `crud` |
| ~ `Telephone-Directory` | Telephone directory in C. | `c` `data-structures` |
| ~ `Quiz-Website` | Quiz web application. | `html` `css` `javascript` |

## Needs a decision, not a description

| Repo | |
|---|---|
| `Vega-Agent` | A fork with **no commits from you** — all 74 are the upstream author's. It is currently **pinned first** on your profile, which is the first thing a reviewer sees. Unpin it, or keep it and say plainly in the description that it is a fork you contributed to. Leaving it pinned and unlabelled is the one option that can actively cost you. |
| `Vishal-AS-0407` | The profile repo. Description: `My GitHub profile README.` |

---

## Doing it quickly

Descriptions and topics are both editable from the repo page — the ⚙️ button beside
**About** on the right. Roughly 30 seconds each.

If you'd rather script it, install the GitHub CLI (not currently on this machine) and:

```bash
gh repo edit Vishal-AS-0407/Memora \
  --description "Domain-wise hierarchical memory for LLMs — conversations are tagged by topic and only the relevant slice is retrieved, so multi-domain chats do not cross-talk." \
  --add-topic llm --add-topic memory --add-topic rag --add-topic faiss --add-topic redis
```

Start with the eight case-study repos. Those are the ones the README, the portfolio
and your resume all point at.
