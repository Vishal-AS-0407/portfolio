<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:1A0B14,55:5C2340,100:E39A93&height=230&section=header&text=EEG%20Mental%20Health%20Monitoring&fontSize=44&fontColor=FDF2EE&fontAlignY=36&desc=Brain%20signals%20%E2%86%92%20emotions%20%E2%86%92%20a%20report%20a%20person%20can%20act%20on&descSize=17&descAlignY=57&animation=fadeIn" width="100%" alt="EEG Mental Health Monitoring"/>

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=21&duration=2800&pause=900&color=E39A93&center=true&vCenter=true&width=760&lines=%F0%9F%8F%86+Best+Paper+%E2%80%94+IEEE+ICBSII+2025;%F0%9F%A7%A0+V+98.6%25+%C2%B7+A+96.6%25+%C2%B7+D+95.7%25+accuracy;%E2%9A%A1+9.78+ms+inference+%E2%80%94+fast+enough+for+live+EEG;%F0%9F%A4%96+BioGPT+%2B+Gemini+write+the+clinical+report" alt="typing summary"/>

<br/>

<a href="https://doi.org/10.1109/ICBSII65145.2025.11013139"><img src="https://img.shields.io/badge/🏆_Best_Paper-IEEE_ICBSII_2025-B31B1B?style=for-the-badge" alt="Best Paper"/></a>
<img src="https://img.shields.io/badge/Latency-9.78_ms-E39A93?style=for-the-badge&labelColor=1A0B14" alt="latency"/>
<img src="https://img.shields.io/badge/PyTorch-CNN·BiLSTM·Attention-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white" alt="PyTorch"/>
<img src="https://img.shields.io/badge/CUDA-CuPy-76B900?style=for-the-badge&logo=nvidia&logoColor=white" alt="CuPy"/>
<a href="https://portfolio-sigma-blond-57.vercel.app/work/eeg-emotion"><img src="https://img.shields.io/badge/Case_study-Paper-1A0B14?style=for-the-badge&labelColor=E39A93" alt="case study"/></a>

</div>

<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="100%" alt="divider"/>

<details>
<summary><b>📑 Table of contents</b></summary>

- [📌 Overview](#-overview)
- [✨ Highlights](#-highlights)
- [🧠 Architecture](#-architecture)
- [📊 Results](#-results)
- [🖼️ Outputs](#️-outputs)
- [🔬 Under the hood](#-under-the-hood)
- [🗂️ Datasets](#️-datasets)
- [🚀 Getting started](#-getting-started)
- [📂 Project structure](#-project-structure)
- [📄 Citation](#-citation)
- [🧭 Limitations & roadmap](#-limitations--roadmap)

</details>

## 📌 Overview

An EEG headset can say a lot about how someone is doing — but a classifier's output is a
**valence / arousal / dominance** triple and an **error-potential** flag. To the person wearing the
headset, `(0.82, 0.91, 0.31, ERP = 1)` means nothing.

This system closes that gap. Two specialist models read the brain signals, and a **dual-agent LLM
layer** reconciles them **in language** — producing a clinical-style report on emotional state,
cognitive load, rest, diet, and when to see a professional.

> 🏆 Published as *Single-Modality Emotion Detection: EEG-Based Feature Engineering and
> Interpretability* — **IEEE ICBSII 2025, Best Paper Award** (first author).

## ✨ Highlights

<table>
<tr>
<td width="50%" valign="top">

### 📐 Baseline-ratio features
Every feature is divided by the **same subject's resting baseline** — cancelling skull, electrode
and resting-rhythm differences so one model generalises across 23 people.

</td>
<td width="50%" valign="top">

### 🔢 Entropy, not just band power
Shannon and Rényi entropy beside θ / α / β power separate a *busy* signal from a *structured*
one — two states band power reports identically. **196 features per trial.**

</td>
</tr>
<tr>
<td valign="top">

### ⚡ Feature extraction on the GPU
Filtering, FFT, histograms and entropy written in **CuPy** — 5,796 filter-and-featurise passes
become a coffee break, and the same path serves live acquisition.

</td>
<td valign="top">

### 🤝 Two LLM agents, two jobs
**BioGPT** grounds the numbers in biomedical literature; **Gemini** writes the report — told that
its grounding is *evidence, not scripture*.

</td>
</tr>
</table>

## 🧠 Architecture

```mermaid
flowchart TD
    subgraph ACQ["📡 Acquisition"]
        A1["DREAMER · 14 ch @ 128 Hz"]
        A2["INRIA BCI · 56 sensors @ 200 Hz"]
    end
    subgraph PRE["🧹 Preprocessing"]
        P1["FIR bandpass on GPU<br/>+ baseline normalisation"]
        P2["Butterworth 4–30 Hz<br/>1.3 s feedback epochs"]
    end
    subgraph MOD["🧠 Specialist models"]
        M1["Multi-output AdaBoost<br/>valence · arousal · dominance"]
        M2["CNN → BiLSTM → Multi-head attention<br/>error-related potential"]
    end
    subgraph LLM["🤖 Dual-agent reasoning"]
        L1["Agent 1 · BioGPT<br/>biomedical grounding"]
        L2["Agent 2 · Gemini 1.5<br/>report writing"]
    end
    R["📄 Clinical HTML report"]
    A1 --> P1 --> M1 --> L1
    A2 --> P2 --> M2 --> L1
    L1 --> L2 --> R
    style R fill:#E39A93,stroke:#1A0B14,color:#1A0B14
    style L1 fill:#5C2340,stroke:#E39A93,color:#FDF2EE
    style L2 fill:#5C2340,stroke:#E39A93,color:#FDF2EE
```

> 🧩 **The two branches are never fused at the tensor level.** A 14-channel emotion recording and a
> 56-sensor error-potential recording are not commensurable — so each model stays expert at its own
> job, and their outputs meet at the report layer, where the reasoning is written in sentences you
> can read and check.

## 📊 Results

| Metric | Value |
|---|:---:|
| 😊 Valence accuracy | **98.6%** |
| 🔥 Arousal accuracy | **96.6%** |
| 🦁 Dominance accuracy | **95.7%** |
| ⚡ Inference latency | **9.78 ms** |
| 📡 Input | 14 channels @ 128 Hz |

Sub-10 ms is the difference between a system that runs **continuously against a live headset** and
one that only works in batch after the fact.

## 🖼️ Outputs

<div align="center">

**Overall pipeline**

<img src="https://github.com/user-attachments/assets/fd777c6b-6584-439e-9034-fce58b694226" alt="Pipeline" width="90%"/>

**Generated reports**

<img src="https://github.com/user-attachments/assets/1ade8f7d-4fb6-42ce-9566-9264c391ec64" alt="Report 1" width="32%"/>
<img src="https://github.com/user-attachments/assets/8984b89a-6eda-484d-a180-f0ae60f6bd90" alt="Report 2" width="32%"/>
<img src="https://github.com/user-attachments/assets/7dc6f1d3-354a-470e-9b2c-28726a657c84" alt="Report 3" width="32%"/>

</div>

## 🔬 Under the hood

<details>
<summary><b>📐 Baseline-ratio feature extraction</b></summary>

```python
B = preprocessing_gpu(baseline, [])     # 14 features from the resting segment
S = preprocessing_gpu(stimulus, [])     # the same 14 from the stimulus
Extrod = safe_divide_cuda(np.array(S), np.array(B))
```

`safe_divide_cuda` falls back to the raw value where the baseline is zero, so a dead channel
degrades gracefully instead of producing infinities.

| Group | Features (per channel) |
|---|---|
| Spectral | peak PSD in θ (4–8 Hz), α (8–13 Hz), β (13–30 Hz) |
| Statistical | mean, variance, std, RMS, max / min amplitude, kurtosis, skewness |
| Ratio | β power as a fraction of θ + α + β |
| Information-theoretic | **Shannon entropy, Rényi entropy (α = 2)** |

</details>

<details>
<summary><b>🎯 VAD as one multi-output problem</b></summary>

```python
MultiOutputClassifier(
    AdaBoostClassifier(n_estimators=165, learning_rate=0.5, algorithm='SAMME.R'))
```

Valence, arousal and dominance are predicted **jointly**, so they stay psychologically consistent
instead of drifting into a combination no human has ever been in.

</details>

<details>
<summary><b>🧬 The error-potential network</b></summary>

```
Conv1d 14→64 → Conv1d 64→128 → Conv1d 128→256     learn the waveform's shape
        ↓
BiLSTM 256→64 · 3 layers · dropout 0.7            both directions of the time course
        ↓
MultiheadAttention · 128 dim · 8 heads            which moment in 1.3 s mattered
        ↓
Linear 128→1
```

AdamW (1e-3, wd 1e-5) · `BCEWithLogitsLoss` · cosine annealing to 1e-6 over 50 epochs ·
gradient accumulation ×4 · mixed precision — an effective batch of 128 on a consumer GPU.
14 of the 56 BCI sensors are kept (fronto-central sites, where error negativity appears), matching
DREAMER's input width.

</details>

<details>
<summary><b>🤖 The safety line in the agent prompt</b></summary>

BioGPT runs with 5-beam search, `no_repeat_ngram_size=3` and repetition penalty 1.3. Its output is
handed to Gemini with an explicit warning:

> *"there may be some noise and unwanted data in this and also some of the context may be missing
> so use this as reference"*

That line stops a literature model's hallucination from being laundered into something that reads
like a clinical finding.

</details>

## 🗂️ Datasets

| Dataset | What it gives | Link |
|---|---|---|
| 🎬 **DREAMER** | 23 subjects × 18 clips, 14-ch EEG @ 128 Hz, self-rated VAD + baseline | [Zenodo](https://zenodo.org/record/546113) |
| 🧪 **INRIA BCI Challenge** | 56 sensors @ 200 Hz, feedback events labelled correct / error | [Kaggle](https://www.kaggle.com/c/inria-bci-challenge) |

## 🛠️ Tech stack

<p align="center">
  <img src="https://skillicons.dev/icons?i=python,pytorch,sklearn&theme=dark" alt="Python, PyTorch, scikit-learn"/>
  <img src="https://img.shields.io/badge/CuPy-GPU_DSP-76B900?style=for-the-badge&logo=nvidia&logoColor=white" alt="CuPy"/>
  <img src="https://img.shields.io/badge/SciPy-signal-8CAAE6?style=for-the-badge&logo=scipy&logoColor=white" alt="SciPy"/>
  <img src="https://img.shields.io/badge/🤗_BioGPT-transformers-FFD21E?style=for-the-badge" alt="BioGPT"/>
  <img src="https://img.shields.io/badge/Gemini-1.5-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white" alt="Gemini"/>
</p>

## 🚀 Getting started

```bash
git clone https://github.com/Vishal-AS-0407/Patient-Mental-Health-Monitoring-Using-EEG.git
cd Patient-Mental-Health-Monitoring-Using-EEG
pip install numpy pandas scipy scikit-learn joblib torch cupy-cuda12x transformers google-generativeai
```

| Step | Command | Produces |
|:---:|---|---|
| 1️⃣ Preprocess | `python Dreamer/dreamerpre.py` · `python BCI/bcipre.py` | `Dreamer1.csv`, `epochs.npy` |
| 2️⃣ Train | `python Dreamer/drtrain.py` · `python BCI/bcitrain.py` | `.pkl`, `model.pth` |
| 3️⃣ Report | `python LLM/Biogpt.py` → `LLM/gemini.py` → `LLM/htmlgen.py` | `generated_report.html` |

> 💡 **Tip:** no GPU? Swap `cupy` for `numpy` in the DREAMER preprocessing. Put your own Gemini key
> in `LLM/gemini.py` (it ships as `"Your Key"`). The committed `requirements.txt` is a full machine
> freeze — the line above is all this project needs.

## 📂 Project structure

```
📦 Patient-Mental-Health-Monitoring-Using-EEG
 ┣ 📂 Dreamer
 ┃ ┣ 🐍 dreamerpre.py      GPU feature extraction → 196 features / trial
 ┃ ┣ 🐍 drtrain.py         multi-output AdaBoost over VAD
 ┃ ┗ 🐍 testdr.py          single-sample prediction
 ┣ 📂 BCI
 ┃ ┣ 🐍 bcipre.py          channel selection, 4–30 Hz filter, 1.3 s epochs
 ┃ ┣ 🐍 bcitrain.py        CNN–BiLSTM–attention: train + evaluate
 ┃ ┗ 🐍 bcitest.py         inference
 ┣ 📂 LLM
 ┃ ┣ 🐍 Biogpt.py          agent 1 — biomedical grounding
 ┃ ┣ 🐍 gemini.py          agent 2 — report generation
 ┃ ┗ 🐍 htmlgen.py         report → styled HTML
 ┗ 📄 Report.pdf           a full worked example
```

## 📄 Citation

```bibtex
@inproceedings{vishal2025eeg,
  title     = {Single-Modality Emotion Detection: EEG-Based Feature Engineering and Interpretability},
  author    = {Vishal A S and others},
  booktitle = {2025 International Conference on Bio Signals, Images and Instrumentation (ICBSII)},
  pages     = {1--9},
  year      = {2025},
  publisher = {IEEE},
  doi       = {10.1109/ICBSII65145.2025.11013139},
  note      = {Best Paper Award}
}
```

## 🧭 Limitations & roadmap

<details>
<summary><b>Honest notes, and what comes next</b></summary>

- **The paper's numbers come from the published pipeline.** The committed DREAMER script is an
  earlier baseline that fits and scores on the same CSV — its printed accuracy is a training
  accuracy. The ERP branch uses a proper held-out 80/20 split.
- [ ] Add a held-out evaluation to `drtrain.py`.
- [ ] Wire both model outputs straight into `gemini.py` (it currently asks for them interactively).
- [ ] Trim `requirements.txt` to the packages above.
- [ ] Live headset streaming demo.

> 🩺 Research code that generates guidance text — not a medical device.

</details>

<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="100%" alt="divider"/>

<div align="center">

**📖 Read the full design story →** [portfolio · Paper](https://portfolio-sigma-blond-57.vercel.app/work/eeg-emotion)

<a href="https://www.linkedin.com/in/vishal-a-s04/"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn"/></a>
<a href="https://scholar.google.com/citations?user=fPK6EDAAAAAJ&hl=en"><img src="https://img.shields.io/badge/Google_Scholar-4285F4?style=for-the-badge&logo=googlescholar&logoColor=white" alt="Google Scholar"/></a>
<a href="mailto:vishalpersonal04@gmail.com"><img src="https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white" alt="Email"/></a>

⭐ **If this helped you, star the repo!**

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:E39A93,45:5C2340,100:1A0B14&height=120&section=footer" width="100%" alt="footer"/>

</div>
