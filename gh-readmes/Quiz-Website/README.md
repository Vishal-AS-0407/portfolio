<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0B2447,55:19376D,100:2277B0&height=220&section=header&text=Quizo&fontSize=72&fontColor=EAF4FF&fontAlignY=34&desc=A%20web-fundamentals%20quiz%20in%20plain%20HTML%2C%20CSS%20and%20JavaScript&descSize=18&descAlignY=57&animation=fadeIn" width="100%" alt="Quizo"/>

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=21&duration=2600&pause=900&color=5AB0F0&center=true&vCenter=true&width=720&lines=%E2%9C%85+Instant+right%2Fwrong+feedback;%F0%9F%9F%A2+Wrong%3F+The+right+answer+lights+up+too;%F0%9F%8E%AF+A+conic-gradient+result+ring" alt="typing summary"/>

<br/>

<img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML"/>
<img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS"/>
<img src="https://img.shields.io/badge/JavaScript-vanilla-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript"/>
<img src="https://img.shields.io/badge/Dependencies-none-2EA44F?style=for-the-badge" alt="no deps"/>

</div>

<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="100%" alt="divider"/>

## 📌 What it is

A single-page quiz built together with Deepan — four states on one page, switched by toggling an
`active` class — plus a validated contact page.

<div align="center">
<table>
<tr>
<td align="center" width="33%"><b>🏠 Home</b><br/><img src="https://github.com/user-attachments/assets/de5a9363-6ad3-4ce0-8db3-424c8fff500a" alt="Home"/></td>
<td align="center" width="33%"><b>❓ Quiz</b><br/><img src="https://github.com/user-attachments/assets/035d02d4-bc79-4844-bb06-ca1b957ed011" alt="Quiz"/></td>
<td align="center" width="33%"><b>✉️ Contact</b><br/><img src="https://github.com/user-attachments/assets/74de74bd-705d-4b9e-8eee-f09713cf9ced" alt="Contact"/></td>
</tr>
</table>
</div>

## 🧠 Flow

```mermaid
flowchart LR
    H["🏠 Home<br/>Start"] --> G["📜 Guidelines popup<br/>over a blurred home"]
    G -->|Exit| H
    G -->|Continue| Q["❓ Question n of 5<br/>Score: n / 5"]
    Q -->|Next| Q
    Q -->|last| R["🎯 Result ring<br/>counts up to %"]
    R -->|Try again| Q
    R -->|Go home| H
    style Q fill:#19376D,stroke:#2277B0,color:#EAF4FF
    style R fill:#2277B0,stroke:#0B2447,color:#FFFFFF
```

## ✨ How it works

<table>
<tr>
<td width="33%" valign="top">

### 📦 Questions are data
`{ numb, question, options[4], answer }` — adding a question is adding an object.

</td>
<td width="33%" valign="top">

### 🟢 Feedback that teaches
A wrong pick turns red **and** the right one turns green; all options lock so the score can't be
farmed.

</td>
<td width="33%" valign="top">

### 🎯 A pure-CSS ring
`conic-gradient` stop = `percentage × 3.6deg`, stepped by `setInterval` — no SVG, no canvas.

</td>
</tr>
</table>

## 🚀 Getting started

No build step — open `Code Files/main.html` in a browser.

> 💡 **Tip:** it's static, so **GitHub Pages** (Settings → Pages → deploy from branch) gives it a
> live link in one step.

## 🧭 Known issues & roadmap

<details>
<summary><b>Fixes</b></summary>

- 📝 **Q4's key is wrong** — external stylesheets go in the **head**:
  ```js
  answer: "3. In the head section ",   // trailing space matches the option text
  ```
  Q5 (`var`) is contestable — "which keyword declares a variable that can't be reassigned?" →
  `const` has one right answer.
- 🖼️ Background image moved to `Images/` — point the CSS at `../Images/Back-Ground image.jpg`.
- 📄 `thankyou.html` was deleted — restore it (commit `714d6f9`) or confirm in place.
- 🔁 The ring can loop forever on non-multiples of 20 — round the target and compare with `>=`.
- 🏠 Go Home doesn't reset the header score.

**Roadmap**
- [ ] Answer-key fixes
- [ ] GitHub Pages deploy
- [ ] Question bank + shuffling

</details>

<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="100%" alt="divider"/>

<div align="center">

<a href="https://portfolio-sigma-blond-57.vercel.app"><img src="https://img.shields.io/badge/Portfolio-0B2447?style=for-the-badge&logo=vercel&logoColor=white" alt="Portfolio"/></a>
<a href="https://www.linkedin.com/in/vishal-a-s04/"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn"/></a>
<a href="https://github.com/Vishal-AS-0407"><img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub"/></a>

⭐ **If this helped you, star the repo!**

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:2277B0,45:19376D,100:0B2447&height=110&section=footer" width="100%" alt="footer"/>

</div>
