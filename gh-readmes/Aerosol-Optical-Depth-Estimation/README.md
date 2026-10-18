<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0C1A3A,55:2B4A8C,100:93C5FD&height=220&section=header&text=Aerosol%20Optical%20Depth&fontSize=50&fontColor=EFF6FF&fontAlignY=34&desc=13-band%20Sentinel-2%20%E2%86%92%20AOD%2C%20with%20a%20re-parameterisable%20VanillaNet&descSize=17&descAlignY=57&animation=fadeIn" width="100%" alt="Aerosol Optical Depth Estimation"/>

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=21&duration=2800&pause=900&color=93C5FD&center=true&vCenter=true&width=720&lines=%F0%9F%9B%B0%EF%B8%8F+All+13+Sentinel-2+bands%2C+not+RGB;%F0%9F%8C%AB%EF%B8%8F+Separate+the+haze+from+the+ground;%E2%9A%A1+BatchNorm+folded+away+at+inference;%F0%9F%8F%85+Solafune+%E2%80%94+45th+place" alt="typing summary"/>

<br/>

<img src="https://img.shields.io/badge/Solafune-45th_place-F97316?style=for-the-badge" alt="45th"/>
<img src="https://img.shields.io/badge/Sentinel--2-13_bands-93C5FD?style=for-the-badge&labelColor=0C1A3A" alt="13 bands"/>
<img src="https://img.shields.io/badge/VanillaNet--10-re--param-8A2BE2?style=for-the-badge" alt="VanillaNet"/>
<img src="https://img.shields.io/badge/PyTorch_+_timm-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white" alt="PyTorch"/>

</div>

<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="100%" alt="divider"/>

## 📌 Overview

**Aerosol Optical Depth** — how much sunlight airborne particles block — is a direct handle on air
quality and a major climate-model uncertainty. Ground truth comes from **AERONET**: a few hundred
sun-photometers for the whole planet. Everywhere else, it has to be inferred from orbit.

> 🌫️ **The physics problem:** the satellite sees surface and atmosphere **superimposed**. Hazy
> desert and clear forest can look alike. The aerosol signal lives in the **relationships between
> bands** — which is why all 13 matter.

## 🧠 Model

```mermaid
flowchart TD
    S2["🛰️ Sentinel-2 GeoTIFF<br/>13 bands · 2016 → 2024"] --> RIO["rasterio<br/>all bands, full bit depth"]
    RIO --> STEM["🧱 Custom stem<br/>Conv 13 → 512 · k4 s3 + BN"]
    STEM --> VN["⚡ VanillaNet-10 body<br/>series-informed 7×7 activations"]
    VN --> HEAD["1×1 conv 1000 → 100 → 1<br/>no flatten · any input size"]
    HEAD --> OUT["🌫️ scalar AOD"]
    GT["📡 AERONET ground truth"] -.->|"regression target"| OUT
    style STEM fill:#2B4A8C,stroke:#93C5FD,color:#EFF6FF
    style OUT fill:#93C5FD,stroke:#0C1A3A,color:#0C1A3A
```

## ✨ Highlights

<table>
<tr>
<td width="50%" valign="top">

### ⚡ Chosen for inference
VanillaNet's activation is a conv **plus** BatchNorm in training; `switch_to_deploy()` folds the
BN **into the weights** — identical output, one op instead of two.

</td>
<td width="50%" valign="top">

### 🛰️ A 13-band stem
B1 exists *for* aerosol retrieval, B10 for cirrus — an RGB-shaped adaptation throws away exactly
the two bands that matter most.

</td>
</tr>
<tr>
<td valign="top">

### 📐 Resolution-agnostic
A fully convolutional head (1×1 convs, no `Linear`) — tiles of any extent work.

</td>
<td valign="top">

### 🧪 Experiments, tracked
`config.json` with seed, `experiment_number`, test cadence — plus ResNet-LSTM and VGG-LSTM
branches kept as the record of a temporal hypothesis.

</td>
</tr>
</table>

<details>
<summary><b>🔬 BatchNorm folding</b></summary>

```python
def _fuse_bn_tensor(self, weight, bn):
    std = (bn.running_var + bn.eps).sqrt()
    return weight * (bn.weight / std).reshape(-1, 1, 1, 1), bn.bias - bn.running_mean * bn.weight / std

def switch_to_deploy(self):
    kernel, bias = self._fuse_bn_tensor(self.weight, self.bn)
    self.weight.data = kernel
    self.__delattr__('bn')
```

BN at inference is an affine transform; an affine transform after a convolution is another
convolution. Train once, run over every tile forever — the right shape for this workload.

</details>

<details>
<summary><b>🛰️ The bands</b></summary>

| Band | Role |
|---|---|
| **B1** | coastal **aerosol** |
| B2–B4 | visible |
| B5–B7 | red edge |
| B8 / B8A | near infrared |
| B9 | water vapour |
| **B10** | **cirrus** |
| B11 / B12 | short-wave infrared |

Read with `rasterio` at native 12-bit depth — PIL would quantise to 8-bit RGB and destroy the subtle
inter-band differences the signal lives in.

</details>

## 🛠️ Tech stack

<p align="center">
  <img src="https://skillicons.dev/icons?i=python,pytorch&theme=dark" alt="Python, PyTorch"/>
  <img src="https://img.shields.io/badge/timm-VanillaNet-FFD21E?style=for-the-badge" alt="timm"/>
  <img src="https://img.shields.io/badge/rasterio-GeoTIFF-8A2BE2?style=for-the-badge" alt="rasterio"/>
  <img src="https://img.shields.io/badge/Sentinel--2-ESA-003399?style=for-the-badge" alt="Sentinel-2"/>
</p>

## 🚀 Getting started

```bash
git clone https://github.com/Vishal-AS-0407/Aerosol-Optical-Depth-Estimation.git
cd Aerosol-Optical-Depth-Estimation
pip install -r requirements.txt
python main.py         # reads config.json → checkpoint/ and prediction/
```

> 💡 **Tip:** download the competition data from [Solafune](https://solafune.com/) (the original
> competition page has since been taken down) into `Data/train_images/`, `Data/test_images/` and `Data/train_answer.csv`.

```
📦 Aerosol-Optical-Depth-Estimation
 ┣ 🐍 main.py              read config → build → train
 ┣ ⚙️ config.json          paths · hyperparameters · experiment number
 ┣ 🐍 dataLoader.py        rasterio Dataset
 ┣ 📂 trainer              AMP loop · checkpoints · periodic test
 ┗ 📂 model
   ┣ 🐍 model_van.py       13-band stem + VanillaNet-10 + head  ⭐
   ┣ 🐍 vanillanet.py      with switch_to_deploy()
   ┣ 🐍 Resnetlstm.py      temporal alternative
   ┗ 🐍 Vgglstm.py         temporal alternative
```

## 🧭 Notes & roadmap

<details>
<summary><b>Next steps</b></summary>

- 📏 Add RMSE / R² and a predicted-vs-true scatter coloured by land cover.
- ⚡ Call `switch_to_deploy()` before saving the inference checkpoint.
- 🎨 Per-band standardisation + flips/rotations (orientation is meaningless on satellite tiles).
- 🧩 Commit `utils/utility.py` (`sort_filenames_by_number`) so the loader imports as cloned.

</details>

<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="100%" alt="divider"/>

<div align="center">

<a href="https://portfolio-sigma-blond-57.vercel.app"><img src="https://img.shields.io/badge/Portfolio-0C1A3A?style=for-the-badge&logo=vercel&logoColor=white" alt="Portfolio"/></a>
<a href="https://www.linkedin.com/in/vishal-a-s04/"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn"/></a>
<a href="https://github.com/Vishal-AS-0407"><img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub"/></a>

⭐ **If this helped you, star the repo!**

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:93C5FD,45:2B4A8C,100:0C1A3A&height=110&section=footer" width="100%" alt="footer"/>

</div>
