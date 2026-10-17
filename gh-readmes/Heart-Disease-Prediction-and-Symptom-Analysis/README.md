<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:3F0D12,55:8E1B2C,100:F43F5E&height=220&section=header&text=Heart%20Disease%20Prediction&fontSize=48&fontColor=FFF1F2&fontAlignY=34&desc=Six%20classifiers%20%C2%B7%20a%20two-stage%20triage%20tool&descSize=18&descAlignY=57&animation=fadeIn" width="100%" alt="Heart Disease Prediction"/>

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=21&duration=2800&pause=900&color=F43F5E&center=true&vCenter=true&width=720&lines=%E2%9D%A4%EF%B8%8F+UCI+Cleveland+%C2%B7+303+patients+%C2%B7+13+features;%F0%9F%8C%B2+6+models+compared%2C+losers+included;%F0%9F%A9%BA+Clinical+first%2C+symptoms+only+if+unsure" alt="typing summary"/>

<br/>

<img src="https://img.shields.io/badge/scikit--learn-6_models-F7931E?style=for-the-badge&logo=scikitlearn&logoColor=white" alt="scikit-learn"/>
<img src="https://img.shields.io/badge/UCI_Cleveland-303_×_13-F43F5E?style=for-the-badge&labelColor=3F0D12" alt="dataset"/>
<img src="https://img.shields.io/badge/Jupyter-F37626?style=for-the-badge&logo=jupyter&logoColor=white" alt="Jupyter"/>

</div>

<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="100%" alt="divider"/>

## 📌 Overview

Most heart-disease features — cholesterol, ST depression, thalassemia, major vessels — need a
blood draw or an exercise ECG. So the interesting question isn't *can we classify* (yes, ~85–90%)
but **what do you do with a positive prediction?**

This notebook compares six classifiers, then wraps the best one in a **two-stage triage tool**:
clinical measurements first, and a self-reported symptom questionnaire **only when it matters**.

## 🧠 How it works

```mermaid
flowchart TD
    EDA["📊 EDA<br/>distributions · correlations · importance"] --> CMP["⚖️ Compare 6 models<br/>80/20 split"]
    CMP --> BEST["🌲 Random Forest"]
    BEST --> S1["🩺 Stage 1 · 13 clinical inputs"]
    S1 --> P{"Positive?"}
    P -->|no| END["✅ No further action"]
    P -->|yes| ASK{"Still unsure?"}
    ASK -->|yes| S2["📝 Stage 2 · symptom questionnaire"]
    S2 --> MAJ{"More than half present?"}
    MAJ -->|yes| REF["👩‍⚕️ Advise seeing a clinician"]
    style BEST fill:#8E1B2C,stroke:#F43F5E,color:#FFF1F2
    style REF fill:#F43F5E,stroke:#3F0D12,color:#3F0D12
```

> 🩺 Symptoms are **cheap and subjective**; measurements are **expensive and objective**. Asking
> for subjective evidence only when the objective model is uncertain is how a clinician works —
> and a blunt majority rule is auditable in a way a second model wouldn't be.

## 📊 Results

| Model | Accuracy |
|---|:---:|
| 🌲 **Random Forest** | **90.16%** |
| 📈 Logistic Regression | 85.25% |
| 🎲 Naive Bayes | 85.25% |
| ➖ Linear SVM | 81.97% |
| 🌿 Decision Tree | 81.97% |
| 📍 KNN (k = 7) | 67.21% |

> 🔎 **KNN's 67% is a finding, not a failure:** `chol` (200–400) dwarfs `oldpeak` (0–6) in
> unscaled Euclidean distance. The gap to the tree models shows exactly why distance-based
> methods need scaling.

<details>
<summary><b>🗂️ Dataset — UCI Cleveland, 303 × 13 (165 positive / 138 negative)</b></summary>

| | | | |
|---|---|---|---|
| `age` | `sex` | `cp` chest-pain type | `trestbps` resting BP |
| `chol` cholesterol | `fbs` fasting sugar | `restecg` resting ECG | `thalach` max heart rate |
| `exang` exercise angina | `oldpeak` ST depression | `slope` ST slope | `ca` major vessels |
| `thal` thalassemia | **`target`** | | |

Chest-pain codes are plotted with real labels (*Typical Angina … Asymptomatic*) — and
*Asymptomatic* is, counter-intuitively, the highest-risk bar.

</details>

## 🛠️ Tech stack

<p align="center">
  <img src="https://skillicons.dev/icons?i=python,sklearn&theme=dark" alt="Python, scikit-learn"/>
  <img src="https://img.shields.io/badge/pandas-150458?style=for-the-badge&logo=pandas&logoColor=white" alt="pandas"/>
  <img src="https://img.shields.io/badge/seaborn-4C72B0?style=for-the-badge" alt="seaborn"/>
  <img src="https://img.shields.io/badge/Matplotlib-11557C?style=for-the-badge" alt="Matplotlib"/>
</p>

## 🚀 Getting started

```bash
git clone https://github.com/Vishal-AS-0407/Heart-Disease-Prediction-and-Symptom-Analysis.git
cd Heart-Disease-Prediction-and-Symptom-Analysis
pip install -r requirements.txt matplotlib seaborn
jupyter notebook "Feature analysis and Prediction.ipynb"
```

> 💡 **Tip:** the last cell is the interactive tool — it prompts for the 13 values, predicts, and
> offers the questionnaire on a positive result.

```
📦 Heart-Disease-Prediction-and-Symptom-Analysis
 ┣ 📓 Feature analysis and Prediction.ipynb   EDA · 6 models · two-stage tool
 ┣ 📄 heart.csv                               303 × 14
 ┗ 📄 requirements.txt
```

## 🧭 Evaluation notes & next steps

<details>
<summary><b>How I'd make the comparison rigorous</b></summary>

- 🎲 The tree models' `random_state` was chosen by test accuracy, so 90.16% is a best-of-seeds
  figure; the other four were scored once.
- 📏 The test set is 61 rows — each prediction moves accuracy by 1.64 points.
- ❤️ For screening, **recall on the positive class** matters more than accuracy.

**Next steps**
- [ ] 5-fold CV with mean ± std for all six models
- [ ] `StandardScaler` in a pipeline (lets KNN / SVM compete fairly)
- [ ] Confusion matrix, recall, ROC-AUC
- [ ] Use the same split for the comparison and the tool

> 🩺 Not a diagnostic tool — its final state is "consult a healthcare professional".

</details>

<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="100%" alt="divider"/>

<div align="center">

<a href="https://portfolio-sigma-blond-57.vercel.app"><img src="https://img.shields.io/badge/Portfolio-3F0D12?style=for-the-badge&logo=vercel&logoColor=white" alt="Portfolio"/></a>
<a href="https://www.linkedin.com/in/vishal-a-s04/"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn"/></a>
<a href="https://github.com/Vishal-AS-0407"><img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub"/></a>

⭐ **If this helped you, star the repo!**

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:F43F5E,45:8E1B2C,100:3F0D12&height=110&section=footer" width="100%" alt="footer"/>

</div>
