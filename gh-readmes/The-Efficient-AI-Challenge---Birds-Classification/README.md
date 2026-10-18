<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:1A2E05,55:4D6B12,100:FACC15&height=220&section=header&text=The%20Efficient%20AI%20Challenge&fontSize=46&fontColor=FEFCE8&fontAlignY=34&desc=200%20bird%20species%20%C2%B7%2066M%20teacher%20%E2%86%92%201.3M%20student&descSize=18&descAlignY=57&animation=fadeIn" width="100%" alt="The Efficient AI Challenge"/>

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=21&duration=2800&pause=900&color=FACC15&center=true&vCenter=true&width=720&lines=%F0%9F%A5%87+Kaggle+leaderboard+%231;%F0%9F%90%A6+CUB-200+%C2%B7+~59+images+per+species;%F0%9F%A7%AA+Knowledge+distillation%2C+done+right;%F0%9F%93%A6+51%C3%97+fewer+parameters+shipped" alt="typing summary"/>

<br/>

<img src="https://img.shields.io/badge/🥇_Kaggle-Leaderboard_%231-20BEFF?style=for-the-badge&logo=kaggle&logoColor=white" alt="Leaderboard #1"/>
<img src="https://img.shields.io/badge/Compression-51×-FACC15?style=for-the-badge&labelColor=1A2E05" alt="51x"/>
<img src="https://img.shields.io/badge/CUB--200--2011-200_species-4D6B12?style=for-the-badge" alt="CUB-200"/>
<img src="https://img.shields.io/badge/PyTorch_+_timm-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white" alt="PyTorch"/>

</div>

<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="100%" alt="divider"/>

## 📌 Overview

The word *Efficient* changes the objective: the model has to run where a bird actually is — a
phone, a camera trap, an edge box. But fine-grained classification over **200 species with ~59
images each** is exactly where big backbones win.

| Requirement | Wants |
|---|---|
| 🎯 Accuracy | a large model — **EfficientNet-B7, 66M params** |
| ⚡ Efficiency | a tiny one — **EdgeNeXt-XX-Small, 1.3M params** |

The answer: **train the big one, then teach the small one.** The teacher is frozen and used only as
a label generator; the student never sees its weights, only its opinions.

## 🧠 Distillation

```mermaid
flowchart TD
    D["🐦 CUB-200-2011<br/>11,788 images · 200 species"] --> T["👨‍🏫 Teacher · EfficientNet-B7<br/>66M · fine-tuned, then frozen"]
    D --> S["👶 Student · EdgeNeXt-XX-Small<br/>1.3M"]
    T -->|"soft logits"| L["⚖️ KL(soft)·T² + CE(hard)<br/>T = 3.0"]
    S -->|"student logits"| L
    D -->|"hard labels"| L
    L -->|"backprop"| S
    S --> SUB["📦 Ship the 1.3M model"]
    style L fill:#4D6B12,stroke:#FACC15,color:#FEFCE8
    style SUB fill:#FACC15,stroke:#1A2E05,color:#1A2E05
```

> 🌑 A one-hot label says *"Cerulean Warbler"*. The teacher says *"87% Cerulean, 9%
> Black-throated Blue, 3% Northern Parula"* — **which species this one resembles**. On a
> fine-grained task that similarity structure *is* the knowledge, and it's the only reason a 1.3M
> model can learn 200 classes from 59 images each.

## ✨ Highlights

<table>
<tr>
<td width="50%" valign="top">

### ✅ A textbook-correct loss
`log_softmax` on the student, `softmax` on the teacher, `batchmean` reduction, and the `T²`
correction from Hinton et al. — the one most often left out.

</td>
<td width="50%" valign="top">

### 💾 Two models, one GPU
Teacher in `eval()` + `no_grad` (no graph, frozen BN); student under AMP `autocast` +
`GradScaler`.

</td>
</tr>
<tr>
<td valign="top">

### 📉 A schedule that reacts
`ReduceLROnPlateau(0.1, patience 5)` — distillation curves chase a moving target, so react, don't
guess.

</td>
<td valign="top">

### 🧠 A student built for the edge
EdgeNeXt is a hybrid CNN–transformer — keeps some global attention for fine texture at mobile size.

</td>
</tr>
</table>

<details>
<summary><b>🔬 The loss, line by line</b></summary>

```python
soft_targets = torch.softmax(teacher_logits / self.temperature, dim=1)
soft_preds   = torch.log_softmax(student_logits / self.temperature, dim=1)
distillation_loss = self.kl_div(soft_preds, soft_targets) * (self.temperature ** 2)
classification_loss = nn.CrossEntropyLoss()(student_logits, targets)
return distillation_loss + classification_loss
```

- Swapping `softmax`/`log_softmax` is the classic silent bug — loss still falls, student learns the
  wrong thing.
- `'mean'` instead of `'batchmean'` would shrink the gradient 200× here.
- `T²` keeps the soft term's gradient comparable to CE when you change `T`.

</details>

## 📊 Configuration

| | 👨‍🏫 Teacher | 👶 Student |
|---|---|---|
| Model | `efficientnet_b7` | `edgenext_xx_small` |
| Parameters | **66M** | **1.3M** |
| Input | 224 × 224 | 224 × 224 |
| Optimiser | AdamW 1e-3 | Adam 1e-3 |
| Loss | CE | KL·T² + CE, T = 3 |
| Precision | FP32 | AMP |
| Epochs | — | 100 (each checkpointed) |

## 🛠️ Tech stack

<p align="center">
  <img src="https://skillicons.dev/icons?i=python,pytorch&theme=dark" alt="Python, PyTorch"/>
  <img src="https://img.shields.io/badge/timm-models-FFD21E?style=for-the-badge" alt="timm"/>
  <img src="https://img.shields.io/badge/Kaggle-20BEFF?style=for-the-badge&logo=kaggle&logoColor=white" alt="Kaggle"/>
</p>

## 🚀 Getting started

```bash
git clone https://github.com/Vishal-AS-0407/The-Efficient-AI-Challenge---Birds-Classification.git
cd The-Efficient-AI-Challenge---Birds-Classification
pip install -r requirements.txt

python effb7.py      # 1️⃣ train the teacher
python distill.py    # 2️⃣ distil into the student → student_model{epoch}.pth
python test.py       # 3️⃣ predictions + submission
```

> 💡 **Tip:** put the [CUB-200-2011](http://www.vision.caltech.edu/datasets/cub_200_2011/) images
> in `images/` with `annotation2.csv` at the root. Remove the hard-coded `E:/...` save line in
> `distill.py` first. · The Kaggle competition
> page (`bird-classification-anokha`) is no longer public.

```
📦 The-Efficient-AI-Challenge---Birds-Classification
 ┣ 🐍 effb7.py               teacher fine-tuning
 ┣ 🐍 distill.py             student distillation
 ┣ 🐍 test.py                inference + submission
 ┗ 📓 FINALSUBMISSION.ipynb  the submitted notebook
```

## 🧭 Notes & roadmap

<details>
<summary><b>What would make the result complete</b></summary>

- 📏 Teacher and student top-1 — and **the gap between them** — aren't recorded yet; that gap is
  the whole argument.
- 🧪 Add a validation loop (the 80/20 split isn't used in `distill.py`) to pick the best epoch.
- 🎨 Fine-grained augmentation (random resized crop, flip, jitter, Mixup) would likely help both.
- 🔍 224 px is well below B7's native 600 px — a deliberate efficiency trade.

**Roadmap**
- [ ] Report teacher vs student accuracy
- [ ] Validation-based checkpoint selection
- [ ] Augmentation ablation

</details>

<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="100%" alt="divider"/>

<div align="center">

<a href="https://portfolio-sigma-blond-57.vercel.app"><img src="https://img.shields.io/badge/Portfolio-1A2E05?style=for-the-badge&logo=vercel&logoColor=white" alt="Portfolio"/></a>
<a href="https://www.linkedin.com/in/vishal-a-s04/"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn"/></a>
<a href="https://github.com/Vishal-AS-0407"><img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub"/></a>

⭐ **If this helped you, star the repo!**

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:FACC15,45:4D6B12,100:1A2E05&height=110&section=footer" width="100%" alt="footer"/>

</div>
