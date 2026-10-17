<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0B2A2A,55:146B66,100:2DD4BF&height=220&section=header&text=RAG%20Financial%20Advisor&fontSize=50&fontColor=F0FDFA&fontAlignY=34&desc=Indian%20tax%20and%20investment%20advice%2C%20grounded%20in%20crawled%20sources&descSize=18&descAlignY=57&animation=fadeIn" width="100%" alt="RAG Financial Advisor"/>

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=21&duration=2800&pause=900&color=2DD4BF&center=true&vCenter=true&width=720&lines=%F0%9F%95%B7%EF%B8%8F+Builds+its+own+corpus+from+gov+sites+%2B+PDFs;%F0%9F%93%8C+Pinecone+serverless+%C2%B7+MiniLM+384-d;%F0%9F%92%B0+Advice+for+%E2%82%B91+lakh%2Fmonth%2C+not+%22invest+wisely%22" alt="typing summary"/>

<br/>

<img src="https://img.shields.io/badge/Pinecone-serverless-000000?style=for-the-badge&logo=pinecone&logoColor=white" alt="Pinecone"/>
<img src="https://img.shields.io/badge/Gemini-Pro-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white" alt="Gemini"/>
<img src="https://img.shields.io/badge/🤗_all--MiniLM--L6--v2-384d-FFD21E?style=for-the-badge" alt="MiniLM"/>
<img src="https://img.shields.io/badge/LangChain-splitter-1C3C3C?style=for-the-badge&logo=langchain&logoColor=white" alt="LangChain"/>

</div>

<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="100%" alt="divider"/>

## 📌 Overview

Ask a general LLM how to save tax in India and you get fluent, confident advice — from whatever
year its training data was collected. Indian tax law moves every budget.

| Problem | Answer |
|---|---|
| 📚 **There's no dataset** — the rules live on government sites and PDF circulars | A **crawler + PDF scraper** builds the corpus |
| 🗓️ **Stale model knowledge** | Retrieval from **your crawled, current** documents |
| 🎯 **Generic advice is useless** | The query carries **income, persona and a 4-part structure** |

## ✨ Highlights

<table>
<tr>
<td width="50%" valign="top">

### 🕷️ The crawler is part of the system
Depth-limited BFS with a visited set (government sites loop), `urljoin` for relative links, and
**PDF download + extraction** — where the authoritative material actually lives.

</td>
<td width="50%" valign="top">

### ✂️ Chunks sized for atomic rules
750 chars / 100 overlap: one section, one limit, one condition per chunk — not three provisions
diluting one embedding.

</td>
</tr>
<tr>
<td valign="top">

### ⚙️ Production-minded vector layer
Idempotent index creation, cosine metric, batched upserts of 100, chunk text in metadata — one
round trip per query.

</td>
<td valign="top">

### 🔐 Keys from the environment
`PINECONE_API_KEY` and `GEMINI_API_KEY` via `os.getenv` — nothing committed.

</td>
</tr>
</table>

## 🧠 Architecture

```mermaid
flowchart TD
    C1["🕷️ webcrawler.py<br/>BFS depth 3"] --> F["📁 files/*.txt"]
    C2["📄 webscraper.py<br/>HTML + PDFs"] --> F
    F --> PRE["🧹 Preprocess<br/>tokenise · stopwords · lemmatise"]
    PRE --> SPLIT["✂️ 750 chars · 100 overlap"]
    SPLIT --> EMB["🤗 MiniLM-L6-v2 · CUDA → 384-d"]
    EMB --> PC[("📌 Pinecone serverless · cosine")]
    Q["💬 Situation + question"] --> QE["embed"]
    QE --> PC
    PC --> TOP["top-3 chunks"]
    TOP --> GEN["✨ Gemini Pro<br/>financial-advisor persona"]
    GEN --> A["💰 Personalised answer"]
    style PC fill:#146B66,stroke:#2DD4BF,color:#F0FDFA
    style A fill:#2DD4BF,stroke:#0B2A2A,color:#0B2A2A
```

## 🖼️ Output

<div align="center">
<img src="https://github.com/user-attachments/assets/56436a3b-a265-4868-88ca-45e8f27e8f0c" alt="Sample advice output" width="70%"/>
</div>

<details>
<summary><b>💬 The sample query</b></summary>

```
I am a middle-class man in India earning ₹1 lakh per month after tax.
Please act as a chartered accountant and provide the following:
1. Tips to improve my tax filing methods.
2. Suggestions on how to optimize the Indian tax system legally to save more.
3. Investment ideas for tax-saving and wealth growth, including mutual funds, real estate, or insurance.
4. Any other financial advice relevant to my income and tax situation.
```

Note *"legally"* — steering toward avoidance, not evasion.

</details>

## 🛠️ Tech stack

<p align="center">
  <img src="https://skillicons.dev/icons?i=python,pytorch&theme=dark" alt="Python, PyTorch"/>
  <img src="https://img.shields.io/badge/Pinecone-000000?style=for-the-badge&logo=pinecone&logoColor=white" alt="Pinecone"/>
  <img src="https://img.shields.io/badge/NLTK-154F5B?style=for-the-badge" alt="NLTK"/>
  <img src="https://img.shields.io/badge/BeautifulSoup-crawler-2DD4BF?style=for-the-badge&labelColor=0B2A2A" alt="BeautifulSoup"/>
</p>

## 🚀 Getting started

```bash
git clone https://github.com/Vishal-AS-0407/RAG-Based-Financial-Advisor-System-with-Pinecone-and-Gemini.git
cd RAG-Based-Financial-Advisor-System-with-Pinecone-and-Gemini
pip install -r requirements.txt
export PINECONE_API_KEY=...  GEMINI_API_KEY=...

python webcrawler.py     # 1️⃣ set start_url inside → files/*.txt
python webscraper.py     #    individual pages and PDFs
python main.py           # 2️⃣ chunk · embed · upsert · run the sample query
```

> 💡 **Tip:** no GPU? Change `device='cuda'` to `'cpu'`. Edit `query` at the bottom of `main.py` to
> ask your own question.

```
📦 RAG-Based-Financial-Advisor-System-with-Pinecone-and-Gemini
 ┣ 🐍 main.py           TextPreprocessor + RAGSystem
 ┣ 🕷️ webcrawler.py     depth-limited BFS crawl
 ┣ 📄 webscraper.py     page + PDF scraping
 ┗ 📄 requirements.txt
```

## 🧭 Notes & roadmap

<details>
<summary><b>What I'd change first</b></summary>

- 🔢 **Keep digits and brackets** — stripping them turns `80C` into `C`; in tax text the numbers
  *are* the content.
- 🔁 Preprocessing runs twice on documents and not at all on the query — pick one (likely none:
  sentence-transformers prefer natural text).
- 📏 `top_k=3` is tight for a four-part question; 5–8 is cheap.
- 🔗 Surface the chunk IDs as **citations** — they already flow through retrieval.
- 🤖 Update `gemini-pro` to a current model; add rate limiting and `robots.txt` checks to the crawler.

**Roadmap**
- [ ] Number-preserving preprocessing
- [ ] Source citations in answers
- [ ] Reranker
- [ ] Sample corpus for a one-command demo

> 💼 Not financial advice — only as current as the corpus you crawl.

</details>

<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="100%" alt="divider"/>

<div align="center">

<a href="https://portfolio-sigma-blond-57.vercel.app"><img src="https://img.shields.io/badge/Portfolio-0B2A2A?style=for-the-badge&logo=vercel&logoColor=white" alt="Portfolio"/></a>
<a href="https://www.linkedin.com/in/vishal-a-s04/"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn"/></a>
<a href="https://github.com/Vishal-AS-0407"><img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub"/></a>

⭐ **If this helped you, star the repo!**

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:2DD4BF,45:146B66,100:0B2A2A&height=110&section=footer" width="100%" alt="footer"/>

</div>
