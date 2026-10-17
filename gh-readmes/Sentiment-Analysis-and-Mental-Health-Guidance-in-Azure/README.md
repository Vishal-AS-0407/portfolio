<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0A2540,55:0B4F8A,100:0078D4&height=220&section=header&text=Sentiment%20and%20Mental%20Health%20on%20Azure&fontSize=42&fontColor=EFF6FF&fontAlignY=34&desc=Opinion%20mining%20%C2%B7%20EEG-driven%20reports%20%C2%B7%20CI%2FCD%20to%20Azure%20Web%20Apps&descSize=17&descAlignY=57&animation=fadeIn" width="100%" alt="Sentiment and Mental Health on Azure"/>

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=21&duration=2800&pause=900&color=0078D4&center=true&vCenter=true&width=720&lines=%F0%9F%8D%BD%EF%B8%8F+food+%E2%86%92+excellent+%C2%B7+service+%E2%86%92+slow;%F0%9F%A7%A0+VAD+%2B+ERP+%E2%86%92+a+readable+report;%E2%98%81%EF%B8%8F+Push+to+master+%E2%86%92+live+on+Azure" alt="typing summary"/>

<br/>

<img src="https://img.shields.io/badge/Azure-Language_+_OpenAI-0078D4?style=for-the-badge&logo=microsoftazure&logoColor=white" alt="Azure"/>
<img src="https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white" alt="Flask"/>
<img src="https://img.shields.io/badge/GitHub_Actions-CD-2088FF?style=for-the-badge&logo=githubactions&logoColor=white" alt="GitHub Actions"/>

</div>

<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="100%" alt="divider"/>

## 📌 Overview

Two tools behind one Flask app, both on **managed Azure AI** — nothing to train, nothing to serve:

| | Tool | What you get |
|:---:|---|---|
| 💬 | **Sentiment analysis** | document → sentence → **opinion mining** (which *target*, what's *said* about it) |
| 🧠 | **Mental health report** | VAD + ERP from EEG plus personal context → therapy and workload guidance |

The report tool is the report layer of the
[EEG project](https://github.com/Vishal-AS-0407/Patient-Mental-Health-Monitoring-Using-EEG),
rebuilt on Azure OpenAI with a web front end.

## 🧠 Architecture

<div align="center">
<img src="https://github.com/user-attachments/assets/85011672-e5a0-42bb-b8e6-6468a0e2e431" alt="Pipeline" width="85%"/>
</div>

```mermaid
flowchart TD
    UP["📄 Upload .txt"] --> AZ["Azure Language<br/>show_opinion_mining=True"]
    AZ --> D["Document sentiment"]
    AZ --> S["Per-sentence sentiment"]
    AZ --> O["🎯 target → assessments"]
    F["🧠 VAD + ERP<br/>+ age · workplace · life events"] --> GPT["Azure OpenAI · GPT-3.5<br/>800 tokens · T = 0.7"]
    GPT --> R["📝 Report → /download-report"]
    style O fill:#0B4F8A,stroke:#0078D4,color:#EFF6FF
    style R fill:#0078D4,stroke:#0A2540,color:#FFFFFF
```

## ✨ Highlights

<table>
<tr>
<td width="50%" valign="top">

### 🎯 Opinion mining, switched on
*"The food was excellent but the service was slow"* is **mixed** overall — true and useless.
Mined: **food → positive**, **service → negative**. Actionable.

</td>
<td width="50%" valign="top">

### 🧾 A four-question report prompt
Impact of VAD/ERP → emotional & cognitive state → therapy referral → practical actions — so
recommendations follow from analysis.

</td>
</tr>
<tr>
<td valign="top">

### ☁️ Managed services by design
Azure Language, Azure OpenAI, Azure Web App — the value is in the workflow, not a custom model.

</td>
<td valign="top">

### 🔁 CI/CD from day one
`master_clouddeploycd.yml` — push to `master`, Actions builds and deploys.

</td>
</tr>
</table>

## 🖼️ Outputs

<div align="center">
<table>
<tr>
<td align="center" width="50%"><b>💬 Sentiment & opinions</b><br/><img src="https://github.com/user-attachments/assets/96342d74-9deb-4d64-9285-0746716fdd47" alt="Sentiment output"/></td>
<td align="center" width="50%"><b>🧠 Mental health report</b><br/><img src="https://github.com/user-attachments/assets/62cb5218-510f-4022-ad83-384933a0efb1" alt="Mental health report"/></td>
</tr>
</table>
</div>

| Route | Method | Purpose |
|---|:---:|---|
| `/` | `GET` | landing |
| `/sentiment-analysis` | `GET` `POST` | upload → document / sentence / opinion results |
| `/mental-health` | `GET` `POST` | parameters + context → report |
| `/download-report/<filename>` | `GET` | download a report |

## 🛠️ Tech stack

<p align="center">
  <img src="https://skillicons.dev/icons?i=python,flask,azure,githubactions,html,css&theme=dark" alt="Stack"/>
</p>

## 🚀 Getting started

```bash
git clone https://github.com/Vishal-AS-0407/Sentiment-Analysis-and-Mental-Health-Guidance-in-Azure.git
cd Sentiment-Analysis-and-Mental-Health-Guidance-in-Azure
pip install -r requirements.txt
python app.py
```

> 💡 **Tip:** you need an Azure **Language** resource and an **Azure OpenAI** deployment. On
> Azure Web Apps, put their keys and endpoints in **Application settings** and read them as
> environment variables.

```
📦 Sentiment-Analysis-and-Mental-Health-Guidance-in-Azure
 ┣ 🐍 app.py                  Flask · Azure Language + Azure OpenAI
 ┣ 📂 templates               landing · sentiment · mental health · results
 ┣ 📂 static/styles.css
 ┣ 📂 reports                 generated reports (one sample)
 ┗ ⚙️ .github/workflows       CD to Azure Web App
```

## 🧭 Notes & roadmap

<details>
<summary><b>Before a public deployment</b></summary>

- 🔑 Read Azure keys and Flask `secret_key` from environment variables.
- 🧩 Define `deployment_name` and move to `chat.completions.create` (the completions API is legacy).
- 📁 `secure_filename` + `MAX_CONTENT_LENGTH` on upload; constrain `/download-report` to `reports/`.
- 🔤 Open uploads with `encoding="utf-8"`.

> 🩺 Guidance text from parameters — a prompt for a conversation with a professional, not an
> assessment.

</details>

<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="100%" alt="divider"/>

<div align="center">

<a href="https://portfolio-sigma-blond-57.vercel.app"><img src="https://img.shields.io/badge/Portfolio-0A2540?style=for-the-badge&logo=vercel&logoColor=white" alt="Portfolio"/></a>
<a href="https://www.linkedin.com/in/vishal-a-s04/"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn"/></a>
<a href="https://github.com/Vishal-AS-0407"><img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub"/></a>

⭐ **If this helped you, star the repo!**

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0078D4,45:0B4F8A,100:0A2540&height=110&section=footer" width="100%" alt="footer"/>

</div>
