<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0F172A,55:1E4E79,100:38BDF8&height=230&section=header&text=Hybrid%20Time-Series%20Framework&fontSize=46&fontColor=F0F9FF&fontAlignY=34&desc=FFT%20%2B%20ADMM%20feature%20engineering%20in%20front%20of%20an%20LSTM&descSize=18&descAlignY=57&animation=fadeIn" width="100%" alt="Hybrid Time-Series Framework"/>

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=21&duration=2800&pause=900&color=38BDF8&center=true&vCenter=true&width=740&lines=%E3%80%B0%EF%B8%8F+Cooley%E2%80%93Tukey+FFT%2C+written+from+scratch;%F0%9F%8E%AF+LASSO+via+ADMM%2C+written+from+scratch;%F0%9F%93%88+R%C2%B2+0.342+vs+0.076+baseline+%E2%80%94+4.5%C3%97;%F0%9F%A7%AA+Same+LSTM%2C+two+inputs%3A+a+real+ablation" alt="typing summary"/>

<br/>

<img src="https://img.shields.io/badge/R²-0.342_vs_0.076-2EA44F?style=for-the-badge" alt="R2"/>
<img src="https://img.shields.io/badge/FFT-hand--written-38BDF8?style=for-the-badge&labelColor=0F172A" alt="FFT"/>
<img src="https://img.shields.io/badge/ADMM-hand--written-8A2BE2?style=for-the-badge" alt="ADMM"/>
<img src="https://img.shields.io/badge/TensorFlow-Keras_LSTM-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white" alt="TensorFlow"/>

</div>

<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="100%" alt="divider"/>

<details>
<summary><b>📑 Table of contents</b></summary>

- [📌 Overview](#-overview)
- [🧠 Pipeline](#-pipeline)
- [📊 Ablation](#-ablation)
- [🔬 The two algorithms](#-the-two-algorithms)
- [🗂️ Data](#️-data)
- [🚀 Getting started](#-getting-started)
- [🧭 Evaluation notes & next steps](#-evaluation-notes--next-steps)

</details>

## 📌 Overview

Financial series are the hard case for deep learning — low signal-to-noise, non-stationary, and an
LSTM fed raw OHLC columns happily learns the noise. Two things are missing from the raw view:

| Missing | Added |
|---|---|
| 〰️ **Periodic structure** — weekly, quarterly cycles are invisible in the time domain | **FFT features** (real + imaginary, so phase survives) |
| 🧹 **Feature discipline** — correlated OHLC columns add parameters, not information | **ADMM LASSO** selects a sparse feature set |

Both algorithms are **implemented from first principles** — no `np.fft`, no `sklearn.Lasso`.

## 🧠 Pipeline

```mermaid
flowchart TD
    D["📈 OHLC series · 2,873 days"] --> OUT["Z-score outlier removal · |z| < 3"]
    OUT --> SC["StandardScaler"]
    SC --> SPLIT["80 / 20 split"]
    SPLIT --> FFT["〰️ recursive_fft<br/>Cooley–Tukey → real + imag"]
    SPLIT --> ADMM["🎯 admm_feature_selection<br/>LASSO via ADMM → sparse mask"]
    FFT --> CAT["concat"]
    ADMM --> CAT
    CAT --> LSTM["🧠 LSTM(250) → Dense(1)<br/>Adam · MSE · 50 epochs"]
    SPLIT -.->|"ablation: raw features"| BASE["🧠 same LSTM"]
    LSTM --> EV["📊 MSE · MAE · R² · time · memory"]
    BASE --> EV
    style FFT fill:#1E4E79,stroke:#38BDF8,color:#F0F9FF
    style ADMM fill:#1E4E79,stroke:#38BDF8,color:#F0F9FF
    style EV fill:#38BDF8,stroke:#0F172A,color:#0F172A
```

## 📊 Ablation

The **same LSTM**, trained twice:

| Metric | 〰️ FFT + ADMM | Baseline |
|---|:---:|:---:|
| MSE | **347,210** | 487,391 |
| MAE | **441.86** | 590.68 |
| **R²** | **0.342** | 0.076 |
| Input shape | (2298, 1, 7) | (2298, 1, 5) |

> 📈 **R² improves 4.5×.** Wall-clock time and memory are measured and plotted too, so the cost of
> the preprocessing is visible alongside the gain.

## 🔬 The two algorithms

<details open>
<summary><b>〰️ Cooley–Tukey FFT</b></summary>

```python
def recursive_fft(x):
    n = len(x)
    if n <= 1:
        return x
    X_even = recursive_fft(x[::2])
    X_odd  = recursive_fft(x[1::2])
    factor = np.exp(-2j * np.pi * np.arange(n) / n)
    return np.concatenate([X_even + factor[:n // 2] * X_odd,
                           X_even + factor[n // 2:] * X_odd])
```

The butterfly uses `factor[n//2:]` instead of negating — identical, because
`e^{-2πi(k+n/2)/n} = −e^{-2πik/n}`. Input is padded with `1 << (n - 1).bit_length()`, and real and
imaginary parts are kept as separate columns: **phase carries when a cycle peaks**.

</details>

<details open>
<summary><b>🎯 LASSO via ADMM</b></summary>

```python
def admm_feature_selection(X, y, rho=1.0, max_iter=100):
    beta = z = u = np.zeros(n_features)
    for _ in range(max_iter):
        beta = np.linalg.inv(X.T @ X + rho * np.eye(n_features)) @ (X.T @ y + rho * (z - u))
        z    = soft_thresholding(beta + u, 1 / rho)
        u    = u + beta - z
    return np.abs(z) > 0
```

| Step | Does |
|---|---|
| **β-update** | ridge-regularised least squares — `+ρI` keeps collinear OHLC invertible |
| **z-update** | soft thresholding, the L1 proximal operator — produces the zeros |
| **u-update** | scaled dual ascent — drives β and z into agreement |

</details>

## 🗂️ Data

`Data Set.csv` — **2,873 trading days** of Bajaj Auto (NSE) from 26 May 2008:
`High · Prev Close · Open · Low · Close · Last · VWAP · Date`. Target is `High`, removed from the
features.

## 🛠️ Tech stack

<p align="center">
  <img src="https://skillicons.dev/icons?i=python,tensorflow,sklearn&theme=dark" alt="Python, TensorFlow, scikit-learn"/>
  <img src="https://img.shields.io/badge/NumPy-013243?style=for-the-badge&logo=numpy&logoColor=white" alt="NumPy"/>
  <img src="https://img.shields.io/badge/Jupyter-F37626?style=for-the-badge&logo=jupyter&logoColor=white" alt="Jupyter"/>
</p>

## 🚀 Getting started

```bash
git clone https://github.com/Vishal-AS-0407/Hybrid-Time-Series-FrameWork.git
cd Hybrid-Time-Series-FrameWork
pip install pandas numpy scipy scikit-learn tensorflow matplotlib
jupyter notebook Code.ipynb
```

> 💡 **Tip:** the first cell reads `BAJAJ-AUTO1.csv` — point it at `Data Set.csv`. The written
> `Report.docx` and `PPT.pptx` are in the repo too.

## 🧭 Evaluation notes & next steps

<details>
<summary><b>What I'd change to make the numbers forecast-grade</b></summary>

The two hand-written algorithms are correct; the evaluation around them needs tightening:

- 🔀 The split is random on a time series — use `shuffle=False` or a chronological cut.
- 📏 The scaler is fit before the split — fit on train only.
- 〰️ The FFT runs across shuffled rows — **window the series** (e.g. 30 days) and FFT within each
  window for a true spectral view of each sample's past.
- 📅 Same-day `Low/Close/VWAP` predict same-day `High` — predict `High[t+1]` instead.
- 📐 Scale the target too, and expose λ in ADMM to plot the sparsity/accuracy trade-off.

**Next steps**
- [ ] Sliding-window FFT features
- [ ] Chronological split + next-day target
- [ ] λ sweep for ADMM

</details>

<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="100%" alt="divider"/>

<div align="center">

<a href="https://portfolio-sigma-blond-57.vercel.app"><img src="https://img.shields.io/badge/Portfolio-0F172A?style=for-the-badge&logo=vercel&logoColor=white" alt="Portfolio"/></a>
<a href="https://www.linkedin.com/in/vishal-a-s04/"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn"/></a>
<a href="https://github.com/Vishal-AS-0407"><img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub"/></a>
<a href="mailto:vishalpersonal04@gmail.com"><img src="https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white" alt="Email"/></a>

⭐ **If this helped you, star the repo!**

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:38BDF8,45:1E4E79,100:0F172A&height=120&section=footer" width="100%" alt="footer"/>

</div>
