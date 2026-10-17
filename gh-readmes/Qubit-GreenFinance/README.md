<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0F2A1C,55:2F5E33,100:E8C547&height=230&section=header&text=Qubit%20%C2%B7%20Green%20Finance&fontSize=52&fontColor=FBF6E0&fontAlignY=34&desc=Score%20every%20proposal%20on%2015%20SDGs%2C%20then%20let%20an%20optimiser%20fund%20them&descSize=16&descAlignY=57&animation=fadeIn" width="100%" alt="Qubit Green Finance"/>

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=21&duration=2800&pause=900&color=E8C547&center=true&vCenter=true&width=760&lines=%F0%9F%8C%8D+15+SDGs+%C3%97+3+dimensions+%3D+45+signed+scores;%F0%9F%94%8E+Follows+the+supply+chain+to+the+real+supplier;%F0%9F%A7%AE+A+linear+programme+decides+the+money;%F0%9F%9A%AB+ESG+below+0.7%3F+Not+fundable+at+any+price" alt="typing summary"/>

<br/>

<img src="https://img.shields.io/badge/SDG_matrix-15×3-E8C547?style=for-the-badge&labelColor=0F2A1C" alt="15x3"/>
<img src="https://img.shields.io/badge/PuLP-linear_programming-2F5E33?style=for-the-badge" alt="PuLP"/>
<img src="https://img.shields.io/badge/CrewAI-agentic_scoring-FF5A50?style=for-the-badge" alt="CrewAI"/>
<img src="https://img.shields.io/badge/Streamlit-FF4B4B?style=for-the-badge&logo=streamlit&logoColor=white" alt="Streamlit"/>
<a href="https://portfolio-sigma-blond-57.vercel.app/work/qubit-green-finance"><img src="https://img.shields.io/badge/Case_study-Allocation-0F2A1C?style=for-the-badge&labelColor=E8C547" alt="case study"/></a>

<br/><br/>

<img src="https://github.com/user-attachments/assets/01439845-7c6b-4e95-b56b-aa926fe88ba0" alt="Qubit banner" width="85%"/>

</div>

<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="100%" alt="divider"/>

<details>
<summary><b>📑 Table of contents</b></summary>

- [📌 Overview](#-overview)
- [✨ Highlights](#-highlights)
- [🧠 Architecture](#-architecture)
- [🌍 The 15 × 3 matrix](#-the-15--3-matrix)
- [🧮 The optimiser](#-the-optimiser)
- [🖼️ Outputs](#️-outputs)
- [🚀 Getting started](#-getting-started)
- [📂 Project structure](#-project-structure)
- [🧭 Honest notes & roadmap](#-honest-notes--roadmap)

</details>

## 📌 Overview

A bank has a green-finance mandate, a fixed pot of money, and twenty proposals. **Which get
funded, and how much?**

| Obvious approach | Why it fails |
|---|---|
| 🏅 Rank by ESG score, fund top-down | Concentrates everything in 2–3 projects; hides that goals pull against each other |
| ➗ Split evenly | Funds what shouldn't be funded, underfunds what should |
| 📄 Trust the proposal PDF | Green money goes to whoever writes the most persuasive PDF |

**Qubit** reads the proposal, follows its supply chain to the **real supplier**, scores the
result on all 15 SDGs × 3 dimensions, and hands the matrix to a **constrained linear programme**
that decides the allocation.

> 🧪 **Prototype** — the first-round implementation from team **QuBit**, committed as an artefact.

## ✨ Highlights

<table>
<tr>
<td width="50%" valign="top">

### ➖ Harm is negative, not low
Scores run **−1 to +1**. A −1 on clean water can't be averaged away by a +1 on climate — the
trade-off stays visible until a human decides.

</td>
<td width="50%" valign="top">

### 🔎 Anti-greenwashing by design
The agent scores **how the named supplier actually extracts the material**, found by web search —
a fact the proposal author doesn't control.

</td>
</tr>
<tr>
<td valign="top">

### 📏 Risk on fixed ordinal scales
Growth, disaster and legal exposure, each one of five labels — so the LLM's answer becomes a
number the optimiser can use.

</td>
<td valign="top">

### 🚧 Policy as constraints
ESG floor 0.7 and a 40% diversification cap are **hard constraints**, not weights — weights can be
traded away, constraints can't.

</td>
</tr>
</table>

## 🧠 Architecture

```mermaid
flowchart TD
    PDF["📄 Project proposal PDF"] --> CONV["ConvertAPI → text"]
    CONV --> AG["🤖 Raw Material Analysis Agent<br/>CrewAI + Serper + Gemini 1.5"]
    AG --> R1["⚠️ Risk<br/>growth · disaster · legal"]
    AG --> R2["⛏️ Resources<br/>material → real supplier"]
    AG --> R3["🌍 15 SDGs × 3 dimensions<br/>−1 … +1, each with a reason"]
    CONV --> ANA["📈 Analytics · Gemini<br/>KPI · SROI · CBA · ROI"]
    R1 --> OPT["🧮 Linear programme · PuLP/CBC"]
    R3 --> OPT
    OPT --> ALLOC["💰 Allocation per project"]
    ANA --> UI["📊 Streamlit dashboard"]
    ALLOC --> UI
    style AG fill:#2F5E33,stroke:#E8C547,color:#FBF6E0
    style OPT fill:#2F5E33,stroke:#E8C547,color:#FBF6E0
    style ALLOC fill:#E8C547,stroke:#0F2A1C,color:#0F2A1C
```

## 🌍 The 15 × 3 matrix

Each proposal gets **45 cells** — 15 SDGs × ecological · economic · social — each with a written
note tying the score to a specific supplier.

| Score | Meaning |
|:---:|---|
| 🟢 **+1** | good |
| 🟩 **+0.5** | partially good |
| ⚪ **0** | neutral |
| 🟧 **−0.5** | partially bad |
| 🔴 **−1** | bad |

<details>
<summary><b>⛏️ How the agent reasons backwards through the supply chain</b></summary>

1. Extract the raw materials named in the PDF — **or infer them** from the business type.
2. Extract the suppliers — **or search for the best real company** (*"make sure that you always
   give a company name"*).
3. Search how **that company** extracts the material, and how eco-friendly the method is.
4. Score the matrix on that real practice. No info on the company? Score the generic process for
   that material — never default to neutral.

Risk uses fixed scales:

```
growth           → negative | no | low | high | very high growth
natural disaster → not prone | very rarely | rarely | frequently | very frequently
legal trouble    → not likely | very slight chances | slight chance | high chances | very high chances
```

The whole output is one nested JSON — `risk`, `resources`, `matrix`.

</details>

## 🧮 The optimiser

```
maximise  Σ ESGᵢ·xᵢ  −  0.10·Σ xᵢ  −  0.05·Σ riskᵢ·xᵢ
```

| Term | Job |
|---|---|
| `Σ ESGᵢ·xᵢ` | 🌱 impact — what's being bought |
| `−0.10·Σ xᵢ` | 💤 a flat cost per rupee — lets the optimiser **leave money unspent** |
| `−0.05·Σ riskᵢ·xᵢ` | ⚠️ risk priced per rupee — scales with exposure |

| Constraint | Rule |
|---|---|
| 💰 Budget | `Σ xᵢ ≤ 1000` |
| 📏 Bounds | `min_budgetᵢ ≤ xᵢ ≤ max_budgetᵢ` |
| 🧺 Diversification | `xᵢ ≤ 0.4 · total` |
| 🚫 **ESG floor** | `ESGᵢ < 0.7 ⟹ xᵢ = 0` |

Four separate Gemini passes add **KPI, SROI, CBA and ROI** analyses — one prompt each, because one
prompt asked for four analyses returns four shallow ones.

## 🖼️ Outputs

<div align="center">

<table>
<tr>
<td width="50%"><img src="https://github.com/user-attachments/assets/e025a6ef-6ff3-470d-96ff-22251374042a" alt="Output 1"/></td>
<td width="50%"><img src="https://github.com/user-attachments/assets/b1adb13e-d075-4e3d-933d-7ed26111d943" alt="Output 2"/></td>
</tr>
<tr>
<td><img src="https://github.com/user-attachments/assets/8c8e8974-53d1-4c34-b488-2318cf3ceea5" alt="Output 3"/></td>
<td><img src="https://github.com/user-attachments/assets/88f55fc1-fe14-4989-953f-ec2f372e16b3" alt="Output 4"/></td>
</tr>
</table>

<details>
<summary><b>🧮 Optimiser screens, formulas and system architecture</b></summary>
<br/>
<img src="https://github.com/user-attachments/assets/43a1fed3-77b7-46f7-b2e3-0b3b736dbd0d" alt="Optimisation" width="85%"/>
<br/><br/>
<img src="https://github.com/user-attachments/assets/c62ef9b2-1c03-41a5-8894-e6487391e3a0" alt="Formulas" width="85%"/>
<br/><br/>
<img src="https://github.com/user-attachments/assets/9eee03b3-4b78-4513-9cb0-77b72a53602c" alt="System architecture" width="85%"/>
</details>

</div>

## 🛠️ Tech stack

<p align="center">
  <img src="https://skillicons.dev/icons?i=python&theme=dark" alt="Python"/>
  <img src="https://img.shields.io/badge/Streamlit-FF4B4B?style=for-the-badge&logo=streamlit&logoColor=white" alt="Streamlit"/>
  <img src="https://img.shields.io/badge/PuLP-CBC-2F5E33?style=for-the-badge" alt="PuLP"/>
  <img src="https://img.shields.io/badge/CrewAI-FF5A50?style=for-the-badge" alt="CrewAI"/>
  <img src="https://img.shields.io/badge/Gemini-1.5-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white" alt="Gemini"/>
  <img src="https://img.shields.io/badge/Plotly-3F4F75?style=for-the-badge&logo=plotly&logoColor=white" alt="Plotly"/>
</p>

## 🚀 Getting started

```bash
git clone https://github.com/Vishal-AS-0407/Qubit-GreenFinance.git
cd Qubit-GreenFinance
pip install streamlit pandas plotly pillow numpy pulp crewai crewai-tools \
            google-generativeai python-dotenv PyPDF2 easyocr pyaudio requests
```

| Run | Command |
|---|---|
| 📊 Dashboard | `streamlit run app.py` |
| 🤖 Score a proposal | `python crew/check.py` |
| 🧮 Allocate across 20 projects | `python optimization.py` |
| 💬 Multilingual support chat | `streamlit run final.py` |

> 💡 **Tip:** set `GEMINI_API_KEY`, `SERPER_API_KEY`, ConvertAPI and Sarvam keys in your
> environment. A sample `PROPOSAL.pdf` is included to feed the pipeline.

## 📂 Project structure

```
📦 Qubit-GreenFinance
 ┣ 🐍 app.py                  Streamlit dashboard — KPI / SROI / CBA / ROI
 ┣ 📂 crew
 ┃ ┗ 🐍 check.py              the Raw Material Analysis Agent
 ┣ 🐍 optimization.py         the linear programme (Tkinter front end)
 ┣ 🐍 analytics_service.py    four Gemini analysis passes
 ┣ 🐍 conv.py                 PDF → text
 ┣ 🐍 final.py                multilingual support chat
 ┣ 📓 outputs.ipynb           captured runs
 ┗ 📄 PROPOSAL.pdf            sample input
```

## 🧭 Honest notes & roadmap

<details>
<summary><b>The LP needs one fix — and it's small</b></summary>

As committed, `optimization.py` reports **Infeasible**: every one of 20 random projects gets a
100–200 minimum, which sums past the 1,000 budget, and clashes with the ESG floor's `== 0`.
"Fund it at least `min_budget` **if** we fund it" needs a binary selector (a MILP):

```python
sel = {i: LpVariable(f"sel_{i}", cat="Binary") for i in range(n)}
for i in range(n):
    cap = min(max_budgets[i], diversification_factor * total_budget)
    problem += investment[i] >= max(min_budgets[i], min_investment_threshold) * sel[i]
    problem += investment[i] <= cap * sel[i]
    if ESG_scores[i] < min_esg_threshold:
        problem += sel[i] == 0
```

With it the same instance solves **Optimal**: 3 of 20 projects funded for the full 1,000 (two at
the 400 cap), 3 excluded by the ESG floor.

- 🎲 Project data is randomly generated each run (no seed) — it demonstrates the formulation.
- 🔌 The optimiser isn't yet wired to the agent's matrix output.
- 🖥️ `optimization.py` is Tkinter; everything else is Streamlit.

**Roadmap**
- [ ] MILP selector fix
- [ ] Feed the 15 × 3 matrix into the optimiser (multi-objective)
- [ ] `requirements.txt` + env-based keys
- [ ] Move the optimiser into the Streamlit app

</details>

<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="100%" alt="divider"/>

<div align="center">

**📖 Read the full design story →** [portfolio · Allocation](https://portfolio-sigma-blond-57.vercel.app/work/qubit-green-finance)

<a href="https://www.linkedin.com/in/vishal-a-s04/"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn"/></a>
<a href="https://github.com/Vishal-AS-0407"><img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub"/></a>
<a href="mailto:vishalpersonal04@gmail.com"><img src="https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white" alt="Email"/></a>

⭐ **If this helped you, star the repo!**

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:E8C547,45:2F5E33,100:0F2A1C&height=120&section=footer" width="100%" alt="footer"/>

</div>
