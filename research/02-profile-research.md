# Profile Research — Vishal A S

Research date: 2026-08-08
Purpose: verified, citable source material for the portfolio rebuild.

**Legend**
- `VERIFIED` — confirmed against an independent, authoritative public source (URL given).
- `PARTIAL` — the surrounding event/entity is confirmed, but Vishal's specific claim within it is not.
- `UNVERIFIED` — no public source found. Not the same as false; most are simply not public.

---

## 1. Verified identity & bio facts

| Fact | Status | Source / note |
|---|---|---|
| Name: Vishal A S | `VERIFIED` | Google Scholar, ACL Anthology, GitHub |
| Affiliation: Amrita Vishwa Vidyapeetham, Coimbatore | `VERIFIED` | Google Scholar profile lists "Department of Computer Science and Artificial Intelligence, Amrita Vishwa Vidyapeetham" |
| Second affiliation string: "School of Artificial Intelligence, Coimbatore" | `VERIFIED` | IEEE/Crossref metadata on the ICBSII paper |
| B.Tech CSE (AI), 2022–2026, final year | `PARTIAL` | Self-stated on GitHub bio and portfolio; consistent with affiliation. Degree program exists at Amrita Coimbatore. Not independently verifiable. |
| CGPA 8.29 | `UNVERIFIED` | Private academic record. Not publicly checkable — fine to state, just not citable. |
| Location: Coimbatore, Tamil Nadu, India | `VERIFIED` | GitHub profile |
| Research interest: Artificial Intelligence | `VERIFIED` | Google Scholar profile |
| Google Scholar: **8 citations, h-index 2, i10-index 0** | `VERIFIED` | https://scholar.google.com/citations?user=fPK6EDAAAAAJ&hl=en (as of 2026-08-08) |
| Homepage listed on Scholar: portfolio-sigma-blond-57.vercel.app | `VERIFIED` | Google Scholar profile |

### Email addresses in circulation (inconsistency to resolve)
Three different addresses are publicly associated with him:
- `vishal.as04@outlook.com` — given in the brief
- `vishalpersonal04@gmail.com` — listed on his **GitHub profile** — `VERIFIED`
- `...@cb.students.amrita.edu` — institutional, shown on Google Scholar — `VERIFIED`

**Action:** pick one canonical contact address and make it consistent across portfolio, GitHub, and Scholar.

### GitHub profile — `VERIFIED`
https://github.com/Vishal-AS-0407
- Bio: "Aspiring AI Developer | B.Tech in Computer Science with AI | Exploring the intersection of Deep Learning, and real-world application"
- 29 repositories, 4 followers, 2 following, 10 starred, Pull Shark badge
- Pinned: `Vega-Agent`, `Fraud-Detection-and-VQA-Based-Multilingual-Customer-Care-Chatbot-with-Speech-Support` (3★), `Sentiment-Analysis-and-Mental-Health-Guidance-in-Azure` (3★), `Why-is-my-Baby-Crying`, `WISP`, `sematic_model_unstructured_data`
- Self-described current focus: "Building AI-powered healthcare solutions with NurtureSync"
- Self-described chess line: "International chess player with 50+ tournament wins"

**Note:** star counts are low (1–3) and follower count is 4. The GitHub presence is thin relative to the research record — worth improving before the portfolio drives traffic there.

---

## 2. Publications

### 2.1 DravidianLangTech 2025 — Tamil political sentiment — `VERIFIED` (fully, including Rank 1)

**Full official citation:**

> Suriya Kp, Durai Singh K, Vishal A S, Kishor S, and Sachin Kumar S. 2025. *Synapse@DravidianLangTech 2025: Multiclass Political Sentiment Analysis in Tamil X (Twitter) Comments: Leveraging Feature Fusion of IndicBERTv2 and Lexical Representations.* In Proceedings of the Fifth Workshop on Speech, Vision, and Language Technologies for Dravidian Languages, pages 716–720, Association for Computational Linguistics.

| Field | Value |
|---|---|
| Anthology ID | `2025.dravidianlangtech-1.122` |
| DOI | `10.18653/v1/2025.dravidianlangtech-1.122` |
| Landing page | https://aclanthology.org/2025.dravidianlangtech-1.122/ |
| PDF | https://aclanthology.org/2025.dravidianlangtech-1.122.pdf |
| Month/Year | May 2025 (workshop day: May 3, 2025) |
| Publisher | Association for Computational Linguistics |
| Pages | 716–720 |
| Vishal's author position | **3rd of 5** |
| Citations | 2 (Google Scholar) / 3 (Semantic Scholar) |
| Semantic Scholar | https://www.semanticscholar.org/paper/6059995a607a4f5470c88bf17d7df93c54400360 |

**Abstract (paraphrased from the anthology page):** Addresses political sentiment categorization of Tamil social media comments under challenges including informal expressions, code-switching, and limited annotated data. The system fuses an IndicBERTv2-MLM-Back-Translation encoder with TF-IDF lexical vectors, and preprocesses by converting emojis to text and expanding the top 160 most-repeated hashtags to their full forms. Classifies into seven classes: substantiated, sarcastic, opinionated, positive, negative, neutral, and none-of-the-above.

**Co-authors — likely useful for the portfolio's "collaborators" framing:**
- Suriya Kp, Durai Singh K, Kishor S — student co-authors
- **Sachin Kumar S, Ph.D.** — Amrita faculty; appears as a listed co-author on Google Scholar

#### Rank 1 — `VERIFIED` INDEPENDENTLY (this is the strongest single credential)

Confirmed **not** just by self-report but by the organisers' own overview paper:

> Bharathi Raja Chakravarthi, Saranya Rajiakodi, Thenmozhi Durairaj, Sathiyaraj Thangasamy, Ratnasingam Sakuntharaj, Prasanna Kumar Kumaresan, Kishore Kumar Ponnusamy, Arunaggiri Pandian Karunanidhi, and Rohan R. 2025. *Overview on Political Multiclass Sentiment Analysis of Tamil X (Twitter) Comments: DravidianLangTech@NAACL 2025.* Pages 104–111. DOI `10.18653/v1/2025.dravidianlangtech-1.126`
> https://aclanthology.org/2025.dravidianlangtech-1.126/

Direct quote from that overview paper's Results section:

> "The Synapse team secured first place with an F1-score of 0.377 by fine-tuning the IndicBERTv2-MLM-Back-TLM encoder-based LLM, leveraging IndicCorp v2 and Samanantar datasets."

**Official leaderboard (Table 2, "Task: Tamil Rank list") — top 5 of 25:**

| Rank | Team | Macro F1 |
|---|---|---|
| **1** | **Synapse (KP et al., 2025)** | **0.3773** |
| 2 | KCRL | 0.3710 |
| 3 | byteSizedLLM | 0.3497 |
| 4 | Eureka-CIOL | 0.3187 |
| 5 | Wictory | 0.3115 |

Competition scale (from the overview paper): **139 participants registered; 25 teams submitted final results.** Evaluation on CodaLab: https://codalab.lisn.upsaclay.fr/competitions/20702

**Precise, defensible phrasing for the portfolio:**
> "Rank 1 of 25 teams (139 registrants) — Political Multiclass Sentiment Analysis of Tamil X Comments shared task, DravidianLangTech@NAACL 2025. Macro-F1 0.3773, ahead of 2nd place at 0.3710."

**Venue correction:** the workshop was **co-located with NAACL 2025**, not ACL. See §7.

---

### 2.2 ICBSII 2025 — EEG emotion detection — `VERIFIED` (paper) / `UNVERIFIED` (Best Paper Award)

**Full official citation:**

> A S Vishal, S Deepan, and V Amrutha. 2025. *Single-Modality Emotion Detection: EEG-Based Feature Engineering and Interpretability.* In 2025 Eleventh International Conference on Bio Signals, Images, and Instrumentation (ICBSII), pages 1–9. IEEE.

| Field | Value |
|---|---|
| DOI | `10.1109/ICBSII65145.2025.11013139` |
| IEEE Xplore | https://ieeexplore.ieee.org/document/11013139 |
| Conference | 11th International Conference on Bio Signals, Images, and Instrumentation |
| Host / location | Dept. of Biomedical Engineering, SSN College of Engineering, Chennai, India |
| Dates | March 26–28, 2025 (paper dated March 26, 2025) |
| Pages | 1–9 |
| Publisher | IEEE |
| Vishal's author position | **1st of 3 (first author)** |
| Citations | 6 (Google Scholar and Semantic Scholar) — **his most-cited work** |
| Semantic Scholar | https://www.semanticscholar.org/paper/aea7a1c7e3093a252db7da18923a413492bff0a4 |

Author affiliations in the IEEE metadata: all three at "Amrita Viswa Vidyapheetam, School Of Artificial Intelligence, Coimbatore, India". *(Note: "Viswa Vidyapheetam" is IEEE's typo in the record — do not reproduce it; use "Amrita Vishwa Vidyapeetham".)*

**Full abstract (verbatim from Semantic Scholar):**

> "Emotion recognition plays a vital role in human-computer interaction, offering applications in healthcare, education, and entertainment. This research proposes a single modality paradigm for emotion detection leveraging EEG signals from the DREAMER dataset to predict the valence, arousal, and dominance. Unlike the other approaches that rely on using computationally expensive neural networks, we have utilized lightweight machine learning models and advanced feature engineering methods to achieve accuracies of 98.6%, 96.6%, and 95.7% respectively which are pretty close to the state of art model accuracies while having a relatively much lower inference time of just 9.78 milli seconds. Another highlight of our research is that we were able to determine which EEG channels and characteristics had the greatest influence on each emotional dimension, which further improves the interpretability of our research. Our approach highlights the possibility for scalable and explicable emotion identification systems utilizing EEG data alone by combining high accuracy, efficiency, and interpretability."

**Concrete numbers now available for the portfolio (all from the published abstract):**
- Dataset: **DREAMER**
- Accuracies: **98.6% valence / 96.6% arousal / 95.7% dominance**
- Inference time: **9.78 ms**
- Differentiator: lightweight ML + feature engineering instead of heavy neural nets, plus per-channel interpretability

**Co-author note:** "V Amrutha" is **Dr. Amrutha Veluppal**, Amrita faculty (biomedical signal processing; she has a ResearchGate lab page and other ICBSII papers, including ADHD-detection-from-EEG work). She is almost certainly the supervising author. "S Deepan" is a student co-author, also on Google Scholar.

**Best Paper Award — `UNVERIFIED`.** ICBSII 2025 itself is confirmed real (SSN College, March 26–28 2025, IEEE-published, https://icbsii.in/). However:
- No public ICBSII 2025 best-paper announcement was found.
- The conference schedule PDF (https://icbsii.in/_static/ICBSII%202025%20Schedule.pdf) was retrieved and text-searched; it contains no match for "Vishal", "Deepan", "Amrutha", or "emotion".
- **Recommendation:** if he holds a certificate, scan it and link the image. Otherwise soften to "presented at" or keep the claim but be ready to produce the certificate on request.

---

### 2.3 ICICC — Vision-language mathematical reasoning — `UNVERIFIED`

> "From Vision to Reasoning: A Bilingual Fine-Tuning Approach for Vision-Language Models on Mathematical Reasoning Tasks" — claimed status: Under Review at ICICC.

- **No trace found** in Google Scholar, Semantic Scholar, Crossref, ACL Anthology, or general web search. This is expected and unremarkable for a paper genuinely under review — unpublished submissions are not indexed.
- **Venue ambiguity:** "ICICC" is heavily overloaded. The most likely match is the **9th International Conference on Innovative Computing and Communication (ICICC 2026)**, Shaheed Sukhdev College of Business Studies, University of Delhi, 6–7 February 2026, published in Springer LNNS and Scopus-indexed (https://link.springer.com/book/9783032300041). But there are at least four other conferences using "ICICC". **Ask Vishal which one**, and spell out the full conference name on the portfolio — "ICICC" alone is not informative.
- Note the topic overlaps with his freelance work (§4): "agentic AI system powered by mathematical reasoning and GRPO RL fine-tuned VQA model with Tamil language support". Bilingual = English + Tamil, presumably. That's a nice thread to draw.

---

### 2.4 Publications NOT in his list

Search of Google Scholar, Semantic Scholar, Crossref, and DBLP turned up **no additional genuine publications**. Two negative findings worth recording:

- **False positive to avoid:** Semantic Scholar's author record `2365675949` also lists *"AI-Driven Gesture and Emotion-Responsive 3D Avatar System for Multilingual Deaf-Mute Communication"* (WcCST 2026, DOI `10.1109/WcCST67302.2026.11496151`). **This is a different person.** Crossref shows all three authors affiliated with **K.S. Rangasamy College of Technology, Tiruchengode** — not Amrita. Semantic Scholar has incorrectly merged two authors named "Vishal S". **Do not list this paper.**
- **DBLP has no record** of him or of the DravidianLangTech workshop paper. Not a red flag — DBLP's coverage of ACL workshop proceedings is patchy.

**Publication count framing:** the honest statement is **"2 published (1 IEEE, 1 ACL Anthology), 1 under review"** rather than a flat "3 Publications" as the current About section shows.

---

## 3. Patents — both `UNVERIFIED`

| Claim | Application No. | Status |
|---|---|---|
| **Nalam AI** — personalized medicine compatibility checker analyzing medical reports | 202541065699 | `UNVERIFIED` |
| **Claire** — AI trend analysis integrating Google Trends, Reddit, e-commerce data for fashion insights | 202541092811 | `UNVERIFIED` |

**What was attempted:**
- Google Patents direct URL (`patents.google.com/patent/IN202541065699A/en`) → **HTTP 404**
- Google Patents search query for the number → no results
- Web search on both numbers → no results
- Amrita's public patents page (https://www.amrita.edu/patents/) → neither appears

**Honest assessment — this is expected, not suspicious.** The number format is consistent with genuine post-2016 Indian applications: `2025` (year) + `41` (Chennai patent office) + serial. Under §11A of the Indian Patents Act, applications are **published only after 18 months** from filing (or earlier if early publication under Form 9 is requested). A 2025 Chennai filing would therefore typically not appear in InPASS or Google Patents until **late 2026 / 2027**. Serial 065699 and 092811 both being 2025 Chennai filings is internally consistent.

**Also note:** the Indian Patent Office InPASS portal (https://iprsearch.ipindia.gov.in/publicsearch) is session/CAPTCHA-gated and cannot be scraped; a manual check there is the only way to confirm before publication.

**Recommendation for the portfolio:** keep them, but label them precisely as **"Indian patent application filed (published status pending)"** rather than "Patents" or "Patents Filed" ambiguously. Include the application numbers as he already does — that is the right transparency move, since it lets anyone verify once publication happens. Do **not** imply they are granted.

---

## 4. Experience & affiliations

### NASSCOM Foundation — AI Developer, July 2024 – February 2025 — `PARTIAL`

The **programme** is thoroughly verified; **his individual role is not publicly documented.**

Verified about thingQbator / NASSCOM Foundation / Cisco:
- thingQbator is a **Cisco CSR initiative delivered with NASSCOM Foundation** — an IoT/innovation makerspace programme for universities. `VERIFIED`
- **Amrita University, Coimbatore is one of the original host campuses**, alongside IIITMK Trivandrum, IIT-BHU Varanasi, IGDTUW Delhi, and Trident Academy Bhubaneswar. `VERIFIED` (https://indiacsr.in/nasscom-foundation-nurturing-entrepreneurship-through-cisco-thingqbator/)
- **Cohort 7 scale:** 3,734 students participated; 1,367 ideas entered ideation; **125 teams (343 students) advanced to the prototyping stage**; **top 10 teams** were felicitated at **Neovation 2025** with **INR 5 lakh each** in seed funding. `VERIFIED` (https://www.business-standard.com/content/press-releases-ani/cisco-and-nasscom-foundation-honour-top-10-thingqbator-start-ups-at-neovation-2025-125042500006_1.html, https://theprint.in/ani-press-releases/cisco-and-nasscom-foundation-honour-top-10-thingqbator-start-ups-at-neovation-2025/2602232/)
- The Amrita Coimbatore team in the Cohort 7 **top 10** was **"Riverant"** (IoT robotics for river cleaning) — **not** NurtureSync. `VERIFIED`

Not verified:
- **NurtureSync** — no press coverage, no Play Store listing, no NASSCOM/Cisco writeup found. A Play Store search returns only unrelated apps (Nurture Connect, Nurture). `UNVERIFIED`
- "Funded by Cisco" — plausible via the thingQbator seed mechanism, but unconfirmed for this specific project. `UNVERIFIED`
- The specific metrics (90%+ positive feedback in a 20-user closed beta; 95% health-insight accuracy; 35% OCR+NLP processing-time cut; ASR-LLM-TTS bot across 9 Indian languages) are all self-reported. `UNVERIFIED`

**The "Top 25 of 1,200+ teams" claim — `PARTIAL`, and the numbers need rewording.** The public record for Cohort 7 documents **1,367 ideas** and a **125-team prototyping cohort**, then a **top 10**. There is no published "top 25" tier and no published "1,200+ teams" figure (1,367 was *ideas*, not teams). The claim may well be accurate from an internal communication he received, but as written it doesn't line up with any published figure. **Recommend rewording to something defensible** — e.g. "Selected into the prototyping cohort of Cisco thingQbator Cohort 7 (1,367 ideas submitted nationally)" — or produce the internal email/certificate that states "Top 25".

**Action:** if NurtureSync was ever live on the Play Store, get the listing URL or a screenshot. If it's still buildable, a demo video would carry far more weight than the unverifiable percentages.

### Freelance Product Developer, July 2025 – Present — `PARTIAL`

- **SS Garments, Tiruppur** exists and is a real T-shirt/menswear manufacturer. `VERIFIED` (https://ssgarmentsinc.in/, https://www.indiamart.com/ssgarmentstiruppur/) — note there are several similarly-named Tiruppur firms (SS Tex Garments, SS Clothing Mills, S.S. Textile), so confirm exactly which one.
- **Janshi Text** and **Barath Garments** — no public web presence found. `UNVERIFIED` (unremarkable; many Tiruppur SMEs have no website)
- The consulting engagements themselves are private commercial relationships and are inherently not publicly verifiable. `UNVERIFIED` — this is normal and fine.

**Action:** a one-line testimonial or logo permission from any one of the three would convert this whole section from unverifiable to credible instantly. This is the single highest-leverage evidence gap in the profile.

### Leadership roles (from current portfolio) — `UNVERIFIED`
- Research and Development, **TENSOR Amrita**, Oct 2024 – Jun 2025
- Public Relations, **ICEP 2024**, Dec 2023 – Feb 2024

Neither was independently confirmed; both are ordinary campus-club roles that typically leave no public trace.

---

## 5. Awards & competitions — verification status per item

| Claim | Status | Evidence |
|---|---|---|
| **Rank 1, DravidianLangTech shared task (NAACL 2025)** | ✅ `VERIFIED` | Organisers' overview paper, Table 2. 0.3773 macro-F1, 1st of 25 teams. **The strongest credential he has — lead with it.** |
| **Runner Up, DigiPay Pro Hackathon (NPCI × IIT Bombay)** | `PARTIAL` | Event confirmed: **NPCI was an associate title sponsor of IIT Bombay Techfest 2024** and ran the **"DigiPay Pro"** competition. Note **DigiPay Pro is the name of NPCI's competition, not a separate hackathon**. One source names **SafePayAI as 1st place**, which is consistent with someone else being runner-up, but no runner-up list was found. |
| **Finalist, Health Hack (VIT Bhopal × Johns Hopkins)** | `PARTIAL` | Event confirmed real: **Health Hack 2025** ran in **February 2025**, VIT Bhopal University in partnership with **Johns Hopkins University**, with partners Intelehealth and the Gupta-Klinsky India Institute. Health Hack 2026 followed (Feb 10–12, 2026). No finalist list found. |
| **Top 50, IndustriAI (IIT Madras)** | `PARTIAL` | Event confirmed: **"IndustriAI 24-Hours Hackathon"**, part of **Shaastra 2025, IIT Madras**, listed on Unstop (https://unstop.com/hackathons/industriai-24-hours-hackathon-shaastra-2025-iit-madras-1288651). No results/rankings published. |
| **Non-Academic Achievement Award 2025, Amrita** | `UNVERIFIED` | No public announcement found on amrita.edu. Internal university award; unlikely to be published. |
| **Top 25, thingQbator Cohort 7** | `PARTIAL` | See §4 — programme verified, tier and "1,200+" figure don't match published numbers. |

**General note on the hackathon claims:** in every case the *event* is real, well-known, and correctly attributed. Only the *placement* is unverifiable — which is completely normal, since hackathon organisers rarely publish full result tables. These are fine to keep. The recommendation is to link the event pages (which do exist) so a reader can at least verify the competition is real and prestigious.

---

## 6. Chess / extracurricular

### Chess — `UNVERIFIED`, with one unconfirmed lead

Claims: International FIDE-rated player · 100+ tournaments · 50+ wins · state-level bronze.

**None of these could be confirmed.** Details of the attempt:

- **ratings.fide.com was unreachable** during this research (repeated `ECONNREFUSED` to 62.171.184.225:443). The primary source could not be consulted at all.
- **One candidate lead, NOT confirmed as him:** Chess.com hosts a player page "Vishal A S" — https://www.chess.com/players/vishal-a-s — listing **federation India, birth year 2004, FIDE ID 46669817**, marked as retired/inactive, with **no ratings displayed**.
  - Birth year 2004 is consistent with a 2022–2026 B.Tech cohort.
  - **But the name "Vishal A S" is extremely common in Tamil Nadu chess**, and several distinct FIDE profiles for players named Vishal from India exist (IDs 25619187, 25682148, 35078720, 48743810, 547008296). Chess.com's page shows no rating, no tournament history, and nothing tying it to Amrita or Coimbatore.
  - **I am not confident this is him and am explicitly not asserting it.** Per instructions, no rating is being reported.

**Action required:** ask Vishal directly for his **FIDE ID**. With it, the profile URL `https://ratings.fide.com/profile/<ID>` becomes a hard, linkable credential — and "FIDE-rated" goes from an unverifiable line to a one-click proof. This is a cheap, high-value fix.

**Wording caution:** "International FIDE-Rated Player" is slightly redundant/inflated phrasing — FIDE ratings are by definition international. **"FIDE-rated player"** is cleaner and less likely to read as padding. Also, the portfolio and GitHub disagree in framing ("International FIDE-Rated Player" vs. "International chess player with 50+ tournament wins") — align them.

**"State-level bronze":** stated as "Bronze / State Selection / Championship Medalist" in the current site, which is vague. Name the actual tournament and year.

### Other extracurricular (all `UNVERIFIED`, all low-stakes and fine as-is)
- Sports: skating, badminton, football
- **Anime** — MyAnimeList profile `Eren_D_Yeager`: https://myanimelist.net/profile/Eren_D_Yeager (linked from the current site)
- **Gardening** — maintains a rooftop garden growing flowers, vegetables, and fruit

---

## 7. Corrections needed

Ordered by severity.

### 7.1 `NCPI` → **NPCI** — factual error, appears twice
The body is the **National Payments Corporation of India (NPCI)**. "NCPI" is a transposition typo. `VERIFIED` — NPCI was an associate title sponsor of IIT Bombay Techfest 2024.

Occurrences in the repo:
- `src/components/Achievements.tsx` — `organization: 'NCPI & IIT Bombay'`
- `src/components/Projects.tsx` — `"Privacy-preserving fraud detection system for NCPI..."`

Also: **"DigiPay Pro" is the name of NPCI's competition at Techfest**, so "DigiPay Pro Hackathon (NPCI & IIT Bombay)" is slightly redundant. Cleaner: *"Runner Up — DigiPay Pro, NPCI × IIT Bombay Techfest 2024"*.

### 7.2 "The Complete Python Developer" issuer is wrong — factual error
`src/components/Certifications.tsx` lists the issuer as **"DeepLearning.AI & Stanford"**. This is incorrect.

**"The Complete Python Developer"** is a **Udemy** course by **Andrei Neagoie / Zero To Mastery (ZTM)**. `VERIFIED` — https://www.udemy.com/course/complete-python-developer-zero-to-mastery/

Correct issuer: **Udemy (Zero To Mastery)**. This is the kind of error a technical reviewer will spot immediately and it undermines the credibility of the whole certifications list — fix it first.

### 7.3 "ACL (A* Conference)" is misleading — venue mislabel
`src/components/Research.tsx` tags the DravidianLangTech paper as **`conference: 'ACL (A* Conference)'`**, while `Achievements.tsx` tags the same work as **`organization: 'NAACL'`**. They contradict each other, and the first one overstates.

The accurate description: it is a paper in the **Fifth Workshop on Speech, Vision, and Language Technologies for Dravidian Languages (DravidianLangTech), co-located with NAACL 2025**, published in the ACL Anthology by the Association for Computational Linguistics.

- It is a **workshop paper**, not a main-conference paper. Labelling it "A*" invites a correction from any reviewer who knows the venue tiers.
- **Recommended label:** `DravidianLangTech @ NAACL 2025 (ACL Anthology)`. This is both accurate and still impressive — and the Rank 1 result is the real headline anyway.

### 7.4 Publication links are dead
All three entries in `Research.tsx` use `link: '#'`. Two now have real, permanent URLs:
- DravidianLangTech → https://aclanthology.org/2025.dravidianlangtech-1.122/
- ICBSII → https://doi.org/10.1109/ICBSII65145.2025.11013139

Shipping a "Paper" button that goes nowhere is worse than having no button. Also consider surfacing the DOIs as text — DOIs read as credible.

### 7.5 "3 Publications" overstates slightly
`About.tsx` stat block says `3 / Publications`. One of the three is under review. Suggest **"2 Published · 1 Under Review"**, or a `2` with the third listed separately. Also `2 / Patents Filed` should read as *applications filed, publication pending* (see §3).

### 7.6 Missing author-position and citation context
Currently the publications are listed without author lists. Worth adding, because the positions are genuinely favourable:
- ICBSII: **first author**, and it's his **most-cited work (6 citations)**
- DravidianLangTech: 3rd of 5, but the **Rank 1** result carries it

### 7.7 Minor: Memora metric framing
`Projects.tsx` describes "14.3% → 1.4% hallucination reduction" in the body but "91% hallucination reduction" in the highlights. Both describe the same thing (a ~90% *relative* reduction), but presented side by side they look like two different numbers. Pick one framing — the absolute "14.3% → 1.4%" is more honest and more impressive-sounding to a technical reader.

### 7.8 Minor: contact email inconsistency
Three different addresses across portfolio / GitHub / Scholar (see §1). Consolidate.

---

## 8. Narrative angles

Five hooks, ordered by strength. All are grounded in verified material.

### 8.1 "Rank 1, and the leaderboard is public"
Most student portfolios claim competition wins that evaporate under scrutiny. His doesn't. The organisers of DravidianLangTech@NAACL 2025 **published a ranked table** with Synapse at the top: 0.3773 vs. 0.3710 for second place, out of 25 submitting teams and 139 registrants. **This is a verifiable-in-one-click win, and almost nothing else in a student portfolio ever is.** Lead the whole site with it and link the overview paper, not just his own paper — being able to point at *someone else's* document that says you won is the rarest asset here.

Sub-hook: the margin was **0.0063 macro-F1**. He won a low-resource NLP task by six thousandths. That's a good story about the last mile of feature engineering.

### 8.2 "Low-resource languages, not leaderboard English"
Both his real research threads run through **Tamil**: the NAACL workshop paper on Tamil political sentiment (code-switching, sarcasm, transliteration, seven-way classification), and the under-review bilingual VLM work on mathematical reasoning. His freelance work adds **Tamil-language voice interfaces for factory floors**. There's a coherent identity here — *AI for a language 80 million people speak and the frontier labs mostly ignore* — and it's much more distinctive than "AI Developer & ML Engineer", which is what the site currently says.

### 8.3 "Efficiency and interpretability over parameter count"
This is a real, defensible technical position visible in the published abstract, not a slogan. The ICBSII paper explicitly rejects "computationally expensive neural networks" in favour of **lightweight ML plus feature engineering**, and gets 98.6% / 96.6% / 95.7% at **9.78 ms inference** — then goes further and identifies *which EEG channels drove each emotional dimension*. The same instinct recurs across his projects: 0.5 ms inference on the infant-cry model, LIME/SHAP explainability, 30% inference optimisation on WISP. The current About text gestures at this ("model explainability... rather than just accuracy numbers") but doesn't back it with the numbers that are now available. **Make the ICBSII abstract's numbers the proof.**

### 8.4 "Ships to Tiruppur factory floors, not to notebooks"
Since July 2025 he's been building for **three real textile manufacturers in Tiruppur** — India's knitwear capital — on problems that are unglamorous and genuinely operational: **cloth-cutting optimisation to reduce fabric waste**, trend forecasting from Google Trends and e-commerce data, a B2B wholesale marketplace with a **multilingual voice assistant**, and CV models for Indian traditional dress classification. This is the strongest differentiator against the typical AI-student portfolio, because it's the part nobody else has. The catch: it's also the **least verifiable** section (§4). One client testimonial would make it the centrepiece.

### 8.5 "Chess player turned AI researcher"
Useful, but **currently the weakest-evidenced claim on the site** and it sits in a section of round numbers (100+, 50+) with no links. Either strengthen it with a FIDE ID and a named tournament — at which point "competitive chess since childhood, now optimising macro-F1 by six thousandths of a point" becomes a genuinely good throughline about patience and marginal advantage — or demote it to a single line under Interests. As written, it reads like padding and slightly discounts the verified material around it.

**Bonus framing:** the healthcare thread is coherent enough to name — EEG emotion detection (published), NurtureSync medical app, Nalam AI drug-compatibility patent application, the infant-cry monitor, and mental-health EEG analysis. That's five distinct healthcare-AI artefacts. "Healthcare AI" is arguably a truer label for him than "AI Developer".

---

## 9. Unverifiable claims

Explicit list of everything that could **not** be confirmed. None of these are contradicted by evidence — they are simply not public. The distinction matters: keep them, but don't let them carry weight that the verified items should carry.

**Academic**
1. CGPA 8.29 — private record
2. B.Tech 2022–2026 enrolment dates — self-stated only
3. ICICC paper existence and "Under Review" status — expected for an unpublished submission; **venue name needs disambiguation**
4. **ICBSII Best Paper Award** — conference verified, award not announced publicly; not in the conference schedule PDF

**Patents**
5. Nalam AI, application 202541065699 — not yet published (18-month rule)
6. Claire, application 202541092811 — not yet published (18-month rule)

**Professional**
7. NASSCOM Foundation employment July 2024 – Feb 2025
8. **NurtureSync** — no Play Store listing, no press, no NASSCOM/Cisco writeup found anywhere
9. Cisco funding of NurtureSync specifically
10. All NurtureSync metrics (90%+ beta feedback, 20-user beta, 95% health-insight accuracy, 35% OCR+NLP speedup, 9-language voice bot)
11. "Top 25 of 1,200+ teams" in thingQbator Cohort 7 — **conflicts with published figures** (1,367 *ideas*; 125 prototyping teams; top 10 tier)
12. Freelance engagements with Janshi Text and Barath Garments (no web presence); SS Garments exists but the engagement isn't public
13. TENSOR Amrita R&D role; ICEP 2024 PR role

**Competitions** (event verified in each case, placement not)
14. Runner Up at DigiPay Pro / NPCI
15. Finalist at Health Hack 2025
16. Top 50 at IndustriAI, Shaastra 2025
17. Amrita Non-Academic Achievement Award 2025

**Chess** — the weakest-evidenced cluster
18. FIDE-rated status — **ratings.fide.com was unreachable throughout this research**
19. FIDE ID and current rating — **not reported; the Chess.com lead (ID 46669817, b. 2004) is NOT confirmed to be him and should not be used**
20. 100+ tournaments; 50+ wins; state-level bronze — no named tournament, no year, no link

**Project metrics** — every number in the Projects section (96% ATS pass rate, 99% fraud-detection accuracy, 3 ms inference, 98% cry-detection accuracy, 97% EEG accuracy, 95% WISP accuracy, 91%/60%/35% Memora figures) is self-reported and unaudited. **This is normal for a portfolio.** But note the contrast: the ICBSII numbers are now peer-reviewed and citable, so **the published figures should be visually distinguished from the self-reported ones** — a "published result" badge on the former would let the verified work lift the rest rather than being flattened into the same soup of percentages.

---

## Appendix — source URLs

**Publications**
- ACL Anthology, Synapse paper: https://aclanthology.org/2025.dravidianlangtech-1.122/
- PDF: https://aclanthology.org/2025.dravidianlangtech-1.122.pdf
- ACL Anthology, shared-task overview (contains the Rank 1 table): https://aclanthology.org/2025.dravidianlangtech-1.126/
- DravidianLangTech 2025 front matter: https://aclanthology.org/2025.dravidianlangtech-1.0.pdf
- IEEE Xplore, ICBSII paper: https://ieeexplore.ieee.org/document/11013139
- DOI: https://doi.org/10.1109/ICBSII65145.2025.11013139
- ICBSII 2025 proceedings on IEEE Xplore: https://ieeexplore.ieee.org/xpl/conhome/11012669/proceeding
- ICBSII conference site: https://icbsii.in/
- CodaLab competition: https://codalab.lisn.upsaclay.fr/competitions/20702

**Profiles**
- Google Scholar: https://scholar.google.com/citations?user=fPK6EDAAAAAJ&hl=en
- Semantic Scholar (Synapse paper): https://www.semanticscholar.org/paper/6059995a607a4f5470c88bf17d7df93c54400360
- Semantic Scholar (ICBSII paper): https://www.semanticscholar.org/paper/aea7a1c7e3093a252db7da18923a413492bff0a4
- GitHub: https://github.com/Vishal-AS-0407
- ResearchGate: https://www.researchgate.net/profile/Vishal-A-S-3 (HTTP 403 — blocked)
- MyAnimeList: https://myanimelist.net/profile/Eren_D_Yeager

**Programmes & competitions**
- thingQbator Neovation 2025 (Cohort 7 results): https://www.business-standard.com/content/press-releases-ani/cisco-and-nasscom-foundation-honour-top-10-thingqbator-start-ups-at-neovation-2025-125042500006_1.html
- thingQbator background / Amrita as host campus: https://indiacsr.in/nasscom-foundation-nurturing-entrepreneurship-through-cisco-thingqbator/
- IndustriAI, Shaastra 2025 IIT Madras: https://unstop.com/hackathons/industriai-24-hours-hackathon-shaastra-2025-iit-madras-1288651
- Health Hack, VIT Bhopal × Johns Hopkins: https://www.tribuneindia.com/news/business/health-hack-2026-to-drive-equitable-healthcare-innovations-at-vit-bhopal-university-in-partnership-with-johns-hopkins-university
- IIT Bombay Techfest: https://techfest.org/competitions

**Corrections**
- "The Complete Python Developer" (Udemy / Zero To Mastery): https://www.udemy.com/course/complete-python-developer-zero-to-mastery/
- SS Garments Tiruppur: https://ssgarmentsinc.in/

**Could not be reached**
- ratings.fide.com — `ECONNREFUSED` (all attempts)
- researchgate.net — HTTP 403
- ieeexplore.ieee.org direct HTML — empty body (metadata obtained via Crossref + Semantic Scholar instead)
- iprsearch.ipindia.gov.in — session/CAPTCHA-gated, not scrapable

**Notes on portfolio page fetch:** https://portfolio-sigma-blond-57.vercel.app/ is a client-rendered Vite SPA and returns only `<title>Vishal A S | AI Developer & ML Engineer Portfolio</title>` to a non-JS fetch. Its content was therefore read from the local repo source at `C:\Users\visha\Desktop\portfolio\src\components\` instead. **This is itself an SEO finding: the live site is invisible to any crawler that doesn't execute JavaScript** — including many search, social-preview, and recruiter-tooling crawlers. Worth fixing with SSR/prerendering in the rebuild.
