<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:2B0B2E,55:7A1E6E,100:F472B6&height=230&section=header&text=CLAIRE&fontSize=72&fontColor=FDF2F8&fontAlignY=34&desc=Cognitive%20Learning%20AI%20for%20Reasoning%20and%20Evaluation&descSize=19&descAlignY=58&animation=fadeIn" width="100%" alt="CLAIRE"/>

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=21&duration=2800&pause=900&color=F472B6&center=true&vCenter=true&width=740&lines=%F0%9F%A7%B5+What+should+Tirupur+cut+next%3F;%F0%9F%93%9C+Patent+filed+%E2%80%94+202541092811;%F0%9F%97%A3%EF%B8%8F+Ask+in+Tamil+or+English%2C+by+voice;%F0%9F%A7%AE+5+reasoning+steps%2C+every+number+cited" alt="typing summary"/>

<br/>

<img src="https://img.shields.io/badge/📜_Patent_filed-202541092811-B31B1B?style=for-the-badge" alt="Patent"/>
<img src="https://img.shields.io/badge/Flask-3.1-000000?style=for-the-badge&logo=flask&logoColor=white" alt="Flask"/>
<img src="https://img.shields.io/badge/Gemini-vision_+_text-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white" alt="Gemini"/>
<img src="https://img.shields.io/badge/Sarvam-STT_+_TTS-FF7A00?style=for-the-badge" alt="Sarvam"/>
<img src="https://img.shields.io/badge/தமிழ்-first_class-F472B6?style=for-the-badge&labelColor=2B0B2E" alt="Tamil"/>

</div>

<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="100%" alt="divider"/>

<details>
<summary><b>📑 Table of contents</b></summary>

- [📌 Overview](#-overview)
- [✨ Highlights](#-highlights)
- [🧠 How it works](#-how-it-works)
- [🧮 The 5-step reasoning](#-the-5-step-reasoning)
- [📈 The trend report](#-the-trend-report)
- [🔌 API](#-api)
- [🚀 Getting started](#-getting-started)
- [📂 Project structure](#-project-structure)
- [🧭 Notes & roadmap](#-notes--roadmap)

</details>

## 📌 Overview

Tirupur makes a very large share of India's knitwear. Every week, someone running a mid-sized
unit has to answer: **what do we cut next?** Right, and you're two months ahead of a trend. Wrong,
and you're holding 50,000 units nobody wants.

| Barrier | CLAIRE's answer |
|---|---|
| 📰 Trend reports are written for brands | Growth, volatility, momentum and supply gaps — framed for a **production** decision |
| ⌨️ Interfaces assume English and typing | **Speak in Tamil or English**, hear the reply in the same language |
| 🤷 Nobody bets a production run on an unexplained answer | A **mandatory 5-step reasoning trace** with every number cited |

> 📜 The conversational front end of the CLAIRE trend-analysis system — **patent filed,
> application 202541092811**.

## ✨ Highlights

<table>
<tr>
<td width="50%" valign="top">

### 🧮 Reasoning you can argue with
Five numbered steps with fixed opening sentences — *"From the report, I found: …"* — so citation
is structural, and a factory owner can reject a conclusion for a real reason.

</td>
<td width="50%" valign="top">

### 🪔 Tamil is a whole prompt
A complete system prompt **written in Tamil** — reasoning happens in Tamil, so register and
business vocabulary come out right, not translated.

</td>
</tr>
<tr>
<td valign="top">

### 📸 Ask with a photo
Upload a garment sample — CLAIRE describes colour, fit, fabric and design, then judges it
**against the trend data** with pricing advice.

</td>
<td valign="top">

### 🚀 Built to hand over
Gunicorn `Procfile`, pinned runtime, `/health` endpoint, CORS, and a self-contained `index.html`.

</td>
</tr>
</table>

## 🧠 How it works

```mermaid
flowchart TD
    V["🎤 Voice · Tamil or English"] --> STT["Sarvam STT"]
    T["⌨️ Text"] --> BRAIN
    I["📸 Garment photo"] --> BRAIN
    STT --> BRAIN["✨ Gemini<br/>5-step forced reasoning"]
    REP["📈 CLAIRE trend report"] --> BRAIN
    BRAIN --> OUT["🧾 Reasoning trace<br/>+ recommendation + expected outcome"]
    OUT --> TTS["Sarvam TTS"]
    TTS --> SPK["🔊 Spoken reply, same language"]
    style BRAIN fill:#7A1E6E,stroke:#F472B6,color:#FDF2F8
    style OUT fill:#F472B6,stroke:#2B0B2E,color:#2B0B2E
```

## 🧮 The 5-step reasoning

| Step | Required output |
|:---:|---|
| 🔍 **1 · Understanding** | *"The core question is: [X]"* |
| 📊 **2 · Data extraction** | *"From the report, I found: [data points with sections]"* |
| 🧮 **3 · Analysis** | *"Analyzing this data: [step 1], [step 2]…"* — calculations shown |
| 💡 **4 · Business context** | *"The business implication is: [practical impact]"* |
| ✅ **5 · Recommendation** | *"My recommendation: [clear action plan]"* — short- and long-term |

> 🧾 *ALWAYS cite specific numbers from the report · ALWAYS show your reasoning steps ·
> **NEVER give advice without data support** · Think like a business consultant, not just an AI.*

## 📈 The trend report

The assistant reasons over a **keyword tree** — growth at every node, three levels deep:

```
👕 t-shirt
├── oversized t-shirt                +234%
│   ├── oversized graphic tee        +456%
│   │   └── retro gaming graphic tee +612%   ← the node you can actually cut
│   └── oversized vintage t-shirt    +178%
└── cotton t-shirt                    +67%
    └── organic cotton tee           +145%
```

| Metric | The production question it answers |
|---|---|
| 📉 **Coefficient of variation** | Stable line or fad? (`CV > 0.75` = volatile) |
| ⚡ **Spike index** | Is something happening *right now*? |
| 🏔️ **Peak-to-average** | One moment, or a real base? |
| 🚀 **7-day vs 30-day momentum** | Still accelerating — or already rolling over? |
| 📐 **Slope (monthly CAGR)** | How steep is the climb? |

> 🧵 Short-term momentum **+156%** above long-term = time to cut it. Short-term below long-term =
> you'd be shipping into a decline.

## 🔌 API

| Endpoint | Method | Purpose |
|---|:---:|---|
| `/health` | `GET` | liveness check |
| `/chat` | `POST` | question (+ optional image) → reasoning + recommendation |
| `/analyze-image` | `POST` | garment photo → description, viability, pricing |
| `/report-summary` | `GET` | executive summary of the trend report |
| `/voice-to-text` | `POST` | Sarvam STT |
| `/text-to-voice` | `POST` | Sarvam TTS |

## 🛠️ Tech stack

<p align="center">
  <img src="https://skillicons.dev/icons?i=python,flask,html,js&theme=dark" alt="Python, Flask, HTML, JS"/>
  <img src="https://img.shields.io/badge/Gemini-vision-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white" alt="Gemini"/>
  <img src="https://img.shields.io/badge/Sarvam-voice-FF7A00?style=for-the-badge" alt="Sarvam"/>
  <img src="https://img.shields.io/badge/Gunicorn-499848?style=for-the-badge&logo=gunicorn&logoColor=white" alt="Gunicorn"/>
</p>

## 🚀 Getting started

```bash
git clone https://github.com/Vishal-AS-0407/Claire_Chatbot.git
cd Claire_Chatbot
pip install -r requirements.txt
printf "GEMINI_API_KEY=...\nSARVAM_API_KEY=...\n" > .env

python finalchatbot.py                           # dev
gunicorn finalchatbot:app --bind 0.0.0.0:8000    # prod
```

> 💡 **Tip:** open `index.html` and point it at your server URL — it's a complete front end in
> one file.

## 📂 Project structure

```
📦 Claire_Chatbot
 ┣ 🐍 finalchatbot.py    Flask API — 6 endpoints, both system prompts, Sarvam + Gemini
 ┣ 🌐 index.html         self-contained front end
 ┣ 📈 report.md          the CLAIRE trend report the assistant reasons over
 ┣ 📄 requirements.txt
 ┣ ⚙️ Procfile           gunicorn entry point
 ┗ 📄 runtime.txt        python-3.13.0
```

## 🧭 Notes & roadmap

<details>
<summary><b>What's in this repo, and what isn't</b></summary>

- 📈 **`report.md` is a fixed sample report** (dated Dec 2024) — the reasoning over it is real; the
  live collection layer (Google Trends, Reddit, marketplaces) and statistical engine live in the
  wider CLAIRE system.
- 📚 The whole report goes into every prompt — fine now, will need retrieval as it grows.
- 🌐 CORS is open for the demo front end.

**Roadmap**
- [ ] Retrieval over report sections
- [ ] Live report refresh from the trend engine
- [ ] Tests + CI

</details>

<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="100%" alt="divider"/>

<div align="center">

<a href="https://portfolio-sigma-blond-57.vercel.app"><img src="https://img.shields.io/badge/Portfolio-2B0B2E?style=for-the-badge&logo=vercel&logoColor=white" alt="Portfolio"/></a>
<a href="https://www.linkedin.com/in/vishal-a-s04/"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn"/></a>
<a href="https://github.com/Vishal-AS-0407"><img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub"/></a>
<a href="mailto:vishalpersonal04@gmail.com"><img src="https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white" alt="Email"/></a>

⭐ **If this helped you, star the repo!**

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:F472B6,45:7A1E6E,100:2B0B2E&height=120&section=footer" width="100%" alt="footer"/>

</div>
