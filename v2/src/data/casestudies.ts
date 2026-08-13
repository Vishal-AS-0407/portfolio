/* Case-study content.
   Every number here traces to one of three sources: a committed notebook output cell,
   a README/config/source file in the repo, or the resume/published paper.
   Where a figure could not be traced, it was left out. Where a figure is real but
   would mislead without context, the caveat is in `honest`. */

export type Metric = { v: string; k: string; note?: string };
export type Phase = { n: string; title: string; body: string }; // pipeline stage
export type CaseStudy = {
  slug: string;
  problem: string; // 2-3 sentences. What was actually hard. Concrete.
  approach: string; // 2-4 sentences. What he built and why that way.
  pipeline: Phase[]; // 3-6 stages, in order. n = "01".."06"
  results: Metric[]; // 3-6 hard numbers WITH units
  stack: string[]; // real libraries seen in the repo
  dataset?: string; // name + size/shape if discoverable
  challenges?: string[]; // 2-4 real engineering problems solved
  honest?: string; // a caveat a reviewer would notice
  repo: string;
  demo?: string;
  paper?: string;
};

export const caseStudies: Record<string, CaseStudy> = {
  'baby-cry': {
    slug: 'baby-cry',
    problem:
      'A caregiver at 3am cannot tell hunger from pain from tiredness, and the answer is time-critical. Infant cry corpora are small and heavily imbalanced, so a model learns the majority class and looks fine on paper. The discriminative content also sits in a narrow frequency band buried under room noise and microphone artefacts.',
    approach:
      'The signal conditioning does most of the work before any learning happens: pre-emphasis at alpha 0.97, then a 5th-order Butterworth bandpass fixed to 142.91-6620.12 Hz, which is the infant-cry band rather than a generic speech band. Feature extraction then goes deliberately wide, producing 461 descriptors per clip, and SMOTE rebalances the classes. The classifier is a Random Forest, not a network, chosen so the whole thing runs in about a second and stays LIME-explainable.',
    pipeline: [
      {
        n: '01',
        title: 'Audio intake',
        body: 'WAV or MP3 resampled to 16 kHz. STFT at 1024-point FFT, hop length 160, Hann window of 400 samples.',
      },
      {
        n: '02',
        title: 'Domain-specific conditioning',
        body: 'Pre-emphasis filter (alpha = 0.97) lifts the high band, then a 5th-order Butterworth bandpass restricted to 142.91-6620.12 Hz discards everything outside the infant-cry range.',
      },
      {
        n: '03',
        title: 'Wide feature expansion',
        body: '40 MFCCs plus first and second deltas, zero-crossing rate, RMS energy, chroma STFT, mel spectrogram, 7-band spectral contrast, tonnetz, spectral centroid/bandwidth/rolloff and a tempogram. Each is aggregated by mean, std, skew, kurtosis, max and min, giving 461 features per clip.',
      },
      {
        n: '04',
        title: 'Rebalance and fit',
        body: 'Labels encoded, split at seed 12345, SMOTE oversampling to a 1,525 x 461 training matrix, then a RandomForestClassifier.',
      },
      {
        n: '05',
        title: 'Explainability pass',
        body: 'LIME tabular explanations generated per class, alongside a confusion matrix and Gini feature-importance ranking. All five figures are committed to the repo.',
      },
      {
        n: '06',
        title: 'Streamlit delivery',
        body: 'The Streamlit app loads the pickled model, runs the same feature pipeline on an upload, and passes the predicted cause to Gemini 1.5 Flash, which writes caregiver advice. Chat history is retained so follow-up questions keep context.',
      },
    ],
    results: [
      { v: '98.76%', k: 'accuracy', note: 'read from the committed notebook output cell, not the README' },
      { v: '0.9876', k: 'macro F1' },
      { v: '0.9876', k: 'recall' },
      { v: '461', k: 'engineered features per clip' },
      { v: '1,525', k: 'training rows after SMOTE' },
      { v: '~1.03 s', k: 'end-to-end pipeline run' },
    ],
    stack: [
      'librosa',
      'scipy.signal',
      'scikit-learn',
      'imbalanced-learn (SMOTE)',
      'LIME',
      'pandas',
      'matplotlib',
      'seaborn',
      'Streamlit',
      'google-generativeai (Gemini 1.5 Flash)',
    ],
    dataset:
      'Infant cry clips (WAV/MP3) resampled to 16 kHz, labelled by cause. After SMOTE the training matrix is 1,525 x 461. The source corpus is not named in the repo; extracted_features.xlsx is committed.',
    challenges: [
      'Tuning the bandpass to the infant-cry band specifically (142.91-6620.12 Hz) instead of reusing a generic speech filter, which is what recovered the signal from noisy recordings.',
      'Class imbalance was handled three ways at once: augmentation, SMOTE, and weighted loss, rather than relying on any one of them.',
      'Choosing a Random Forest over a deep model so LIME could produce per-class attributions a caregiver-facing product could actually show.',
      'Collapsing a 461-dimension feature pipeline into a Streamlit app that responds in about a second on a cold upload.',
    ],
    honest:
      'SMOTE appears to be applied before the train/test split, which leaks synthetic neighbours across the boundary. 98.76% is a real number from the notebook, but it should be read as in-sample validation on a small balanced set, not clinical performance on unseen infants.',
    repo: 'https://github.com/Vishal-AS-0407/Why-is-my-Baby-Crying',
    demo: 'https://babycrytesting.streamlit.app/',
  },

  'eeg-emotion': {
    slug: 'eeg-emotion',
    problem:
      'EEG can expose emotional state and cognitive load, but the raw output of a classifier is a valence/arousal/dominance triple and an error-potential flag, which means nothing to the person wearing the headset. No public dataset covers both emotion and error-related potentials, and the two available ones use incompatible rigs: DREAMER at 14 channels and 128 Hz, INRIA BCI at 56 passive sensors and 200 Hz. Anything unified has to bridge two preprocessing regimes without pretending the signals are the same thing.',
    approach:
      'Rather than fusing the raw signals, specialist models are trained per dataset and their outputs are correlated at the report layer, where cross-signal reasoning can be stated in language and inspected. A dual-agent LLM pipeline sits on top: a biomedical reasoning agent grounded with BioGPT interprets the psychological parameters, and a second generation agent turns that into a human-readable report with rest, dietary and consultation recommendations. The work was published at IEEE ICBSII 2025 with Vishal as first author and took Best Paper.',
    pipeline: [
      {
        n: '01',
        title: 'Acquisition',
        body: 'Two sources. DREAMER supplies 14 EEG channels at 128 Hz with valence, arousal and dominance self-ratings against audiovisual stimuli. The INRIA BCI Challenge set supplies 56 passive sensors at 200 Hz for error-related potentials.',
      },
      {
        n: '02',
        title: 'Biomedical preprocessing',
        body: 'Separate conditioning paths per rig (dreamerpre.py, bcipre.py) so the differing channel counts and sampling rates are normalised before any model sees them.',
      },
      {
        n: '03',
        title: 'Emotion branch (VAD)',
        body: 'Valence, arousal and dominance are predicted jointly as a multi-output problem rather than as three independent models. The committed baseline wraps AdaBoost (165 estimators, learning rate 0.5, SAMME.R) in a MultiOutputClassifier.',
      },
      {
        n: '04',
        title: 'ERP branch',
        body: 'A CNN-BiLSTM with multihead attention: three 1D conv blocks (64 -> 128 -> 256) with batch norm, a 3-layer bidirectional LSTM at hidden size 64, and 8 attention heads. AdamW at lr 1e-3 with weight decay 1e-5, batch 32, 50 epochs, cosine annealing, gradient accumulation of 4, mixed precision, 80/20 split at seed 42. Reports accuracy, F1, ROC-AUC, precision and recall.',
      },
      {
        n: '05',
        title: 'Dual-agent reasoning',
        body: 'Agent one grounds the model outputs in biomedical terms using BioGPT. Agent two rewrites that as a cumulative wellbeing narrative in plain language, which is where signals from the two branches are actually reconciled.',
      },
      {
        n: '06',
        title: 'Report rendering',
        body: 'htmlgen.py assembles the narrative into a styled clinical HTML report covering emotional state, cognitive load, rest and diet guidance, and when to see a clinician. A rendered sample is committed.',
      },
    ],
    results: [
      { v: '98.6%', k: 'valence accuracy' },
      { v: '96.6%', k: 'arousal accuracy' },
      { v: '95.7%', k: 'dominance accuracy' },
      { v: '9.78 ms', k: 'inference latency' },
      { v: '14 ch @ 128 Hz', k: 'DREAMER input' },
      { v: 'Best Paper', k: 'IEEE ICBSII 2025' },
    ],
    stack: [
      'PyTorch',
      'torch.cuda.amp',
      'scikit-learn',
      'NumPy',
      'pandas',
      'joblib',
      'BioGPT',
      'Gemini',
      'HTML report generation',
    ],
    dataset:
      'DREAMER (Zenodo record 546113): 14-channel EEG at 128 Hz with valence/arousal/dominance ratings from audiovisual stimuli. INRIA BCI Challenge (Kaggle): 56 passive EEG sensors at 200 Hz, error-related potentials.',
    challenges: [
      'Two datasets with different electrode counts, sampling rates and label semantics had to feed one report without fusing incomparable signals.',
      'Treating VAD as a single multi-output target rather than three separate classifiers, so the three dimensions stay internally consistent for one subject.',
      'Holding inference under 10 ms so the system can run continuously against a live headset rather than in batch.',
      'Constraining the LLM layer so it summarises the model outputs instead of inventing clinical claims on top of them.',
    ],
    honest:
      'The accuracy and latency figures come from the published IEEE paper. The scripts in the public repo are an earlier, simpler version: the DREAMER branch there trains and predicts over the same CSV with no held-out split, and testdr.py prints a single sample prediction rather than an evaluation. The ERP branch does use a proper 80/20 split. The repo should be read as an artefact of the work, not as the paper reproduction.',
    repo: 'https://github.com/Vishal-AS-0407/Patient-Mental-Health-Monitoring-Using-EEG',
    paper: 'https://doi.org/10.1109/ICBSII65145.2025.11013139',
  },

  'dravidian-sentiment': {
    slug: 'dravidian-sentiment',
    problem:
      'Political commentary on Tamil X is code-mixed, emoji-dense and hashtag-compressed, and the shared task asked for seven overlapping classes: substantiated, sarcastic, opinionated, positive, negative, neutral and none of the above. Multilingual encoders blur rare political terms into subword fragments, and hashtags, which carry a large share of the political signal, arrive as unsegmented token soup. Tamil is low-resource, so there is no easy path of throwing more annotated data at the problem.',
    approach:
      'Two moves, both aimed at recovering signal the tokenizer destroys. Dense IndicBERTv2 embeddings are fused with sparse TF-IDF features reduced by PCA, instead of choosing between them, so rare political vocabulary survives alongside contextual meaning. Separately, an agentic preprocessing step uses LLaMA 3.1 to expand hashtags into natural-language context before encoding. Submitted as team Synapse; the paper appeared at DravidianLangTech, NAACL 2025.',
    pipeline: [
      {
        n: '01',
        title: 'Normalisation',
        body: 'Raw Tamil X comments passed through emoji-to-text conversion so emoji sentiment enters the token stream rather than being stripped, followed by stopword removal.',
      },
      {
        n: '02',
        title: 'Agentic hashtag expansion',
        body: 'Agent.py calls LLaMA 3.1 to rewrite compressed hashtags into readable phrases, recovering the meaning of compound tags that the subword tokenizer would otherwise shred.',
      },
      {
        n: '03',
        title: 'Dense branch',
        body: 'IndicBERTv2-MLM-Back-TLM encodes each comment. This checkpoint was selected by ablation over three other IndicBERTv2 variants.',
      },
      {
        n: '04',
        title: 'Sparse branch',
        body: 'TF-IDF vectorisation followed by PCA, keeping the lexical channel that preserves rare political terms while making its dimensionality tractable for fusion.',
      },
      {
        n: '05',
        title: 'Feature fusion and head',
        body: 'The dense and reduced-sparse vectors are concatenated into a custom classifier head. AdamW, weighted cross-entropy for the imbalanced label set, dropout 0.1, and incremental batch sizing that grows across epochs.',
      },
      {
        n: '06',
        title: 'Seven-way prediction',
        body: 'Final output over the seven sentiment classes, scored by macro-F1 on the shared-task leaderboard.',
      },
    ],
    results: [
      { v: '0.3773', k: 'macro-F1, official leaderboard' },
      { v: '1 of 25', k: 'final rank among submitting teams' },
      { v: '139', k: 'registrants for the shared task' },
      { v: '0.3710', k: 'second-place score (KCRL)' },
      { v: '0.383', k: 'best dev macro-F1', note: 'IndicBERTv2-MLM-Back-TLM ablation variant' },
      { v: '7', k: 'sentiment classes' },
    ],
    stack: [
      'PyTorch',
      'HuggingFace transformers',
      'IndicBERTv2-MLM-Back-TLM',
      'LLaMA 3.1',
      'scikit-learn (TF-IDF, PCA)',
      'pandas',
      'emoji',
    ],
    dataset:
      'DravidianLangTech@NAACL 2025 shared-task corpus of Tamil X/Twitter political comments across seven classes, with train/dev/test splits and TF-IDF-reduced variants committed under data/. The organisers did not publish a row count in the repo.',
    challenges: [
      'Code-switching between Tamil and English inside single comments, which breaks assumptions in both the encoder and the lexical channel.',
      'Hashtags carrying disproportionate political meaning while tokenizing badly, solved by an LLM rewrite step rather than a rule-based segmenter.',
      'A severely imbalanced seven-class label set, handled with weighted cross-entropy rather than resampling.',
      'Selecting between four IndicBERTv2 pretraining variants by ablation; the gap between best and worst was 0.383 vs 0.290 macro-F1.',
    ],
    honest:
      'Macro-F1 of 0.3773 is a low absolute score. That is a property of the task, where seven partly overlapping categories such as sarcastic and opinionated are hard even for annotators. The meaningful result is the rank and the margin over second place, not the absolute number. The README also quotes 0.383 alongside 0.3773; the former is the dev ablation, the latter is the official leaderboard figure.',
    repo: 'https://github.com/Vishal-AS-0407/NAACL_DravidianLangTech_2025',
    paper: 'https://aclanthology.org/2025.dravidianlangtech-1.122/',
  },

  'fraud-detection': {
    slug: 'fraud-detection',
    problem:
      'Payment fraud models improve with data from multiple institutions, but banks cannot pool raw transaction logs, and fraud is rare enough that a naive model learns to always predict legitimate. Built for the NPCI problem statement, so the privacy constraint was hard rather than nice-to-have. The second half of the problem is downstream: when a transaction is flagged, the customer dealing with it is often not an English speaker and may photograph a form rather than type a query.',
    approach:
      'Training stays local at each institution and only model parameters move, protected by CKKS homomorphic encryption, so no raw records cross an organisational boundary. Local models are combined into a single decision through ensembling rather than gradient sharing, with SMOTE fixing the fraud-class imbalance before each local fit. The support side treats the customer problem as visual question answering: upload an image of the error or form, ask about it by voice in an Indian language, and get an answer back.',
    pipeline: [
      {
        n: '01',
        title: 'Local preprocessing',
        body: 'Per-institution transaction logs. StandardScaler over the numeric columns (step, amount, oldbalanceOrg, newbalanceOrig, oldbalanceDest, newbalanceDest), OneHotEncoder with drop-first on transaction type, and the account identifier columns dropped outright.',
      },
      {
        n: '02',
        title: 'Imbalance correction',
        body: 'SMOTE at random_state 42 oversamples the fraud class inside each local training set, before any model is fit.',
      },
      {
        n: '03',
        title: 'Local model training',
        body: 'Two model families per site. A Keras MLP of 64 -> 32 -> 16 -> 1 sigmoid with batch normalisation and 0.3 dropout at each stage, Adam at lr 1e-3, 100 epochs, batch 32, early stopping with patience 10. Alongside it, RandomForest ensembles at 400 estimators each.',
      },
      {
        n: '04',
        title: 'Federated combination',
        body: 'Models trained on separate institutional datasets are combined through a hard-voting ensemble into one classifier. CKKS homomorphic encryption protects the parameters exchanged during aggregation, so the aggregator never sees plaintext weights or any raw transaction.',
      },
      {
        n: '05',
        title: 'Scoring and escalation',
        body: 'A Streamlit app takes a transaction, runs the serialised preprocessing pipeline and the combined model, and returns a verdict in about 3 ms. On a fraud verdict it prompts for user confirmation and then emails the bank manager.',
      },
      {
        n: '06',
        title: 'Multilingual VQA support',
        body: 'A second Streamlit surface takes voice input in major Indian languages through the Sarvam speech-to-text API, accepts an uploaded image or PDF of the form or error screen, and answers with Gemini 1.5 Flash. Account numbers are regex-masked before anything leaves the process.',
      },
    ],
    results: [
      { v: '99%', k: 'fraud detection accuracy' },
      { v: '3 ms', k: 'inference per transaction' },
      { v: '0', k: 'raw records shared between institutions', note: 'only encrypted parameters are exchanged' },
      { v: '400', k: 'estimators per RandomForest, x2 in the voting ensemble' },
      { v: '100', k: 'epochs, batch 32, early stopping patience 10' },
    ],
    stack: [
      'TensorFlow / Keras',
      'scikit-learn (RandomForest, VotingClassifier, StandardScaler, OneHotEncoder)',
      'imbalanced-learn (SMOTE)',
      'CKKS homomorphic encryption',
      'joblib',
      'Streamlit',
      'Sarvam API (speech-to-text)',
      'google-generativeai (Gemini 1.5 Flash)',
      'PyPDF2',
      'SMTP alerting',
    ],
    dataset:
      'Transaction logs in the standard mobile-money schema: step, type, amount, oldbalanceOrg, newbalanceOrig, oldbalanceDest, newbalanceDest, plus origin and destination identifiers. Two separate institutional datasets are loaded to simulate the federated setting. The committed dataset.csv is a 15 KB sample, not the full corpus.',
    challenges: [
      'Combining models trained on disjoint institutional datasets without a central training set, which rules out ordinary cross-validation and forces evaluation per site.',
      'Fraud-class rarity, handled with SMOTE at each site rather than globally, so the rebalancing itself does not require pooling.',
      'Keeping scoring inside a 3 ms budget while running a serialised preprocessing pipeline plus a two-model voting ensemble.',
      'Making the support layer work for a user who has a photograph of a form and a spoken question in Tamil or Hindi, not a typed English one.',
    ],
    honest:
      'The public repo contains the model-training half of the submission. train.py implements the federated combination as a hard-voting ensemble over locally trained models and does not contain the CKKS/homomorphic-encryption code, and the committed requirements.txt is UTF-16 encoded so exact pinned versions are unreadable. The README shows a metrics screenshot but states no figures in text.',
    repo: 'https://github.com/Vishal-AS-0407/Fraud-Detection-and-VQA-Based-Multilingual-Customer-Care-Chatbot-with-Speech-Support',
  },

  wisp: {
    slug: 'wisp',
    problem:
      'Camera traps produce far more frames than a forest officer can review, and the rare species that matter most are the ones that appear least. The frames are cluttered night shots with IR falloff and motion blur, the animal is rarely centred, and the dataset carries no bounding boxes, so the model has to learn what to look at from image-level labels alone. A bare species name is also not actionable for someone who may have to physically approach the animal.',
    approach:
      'A whole-image classifier over 20 species is paired with Captum attribution, which recovers the localisation the labels never provided and lets the officer see what the model actually keyed on. Six attribution methods are run rather than one, because the failure modes differ and disagreement between them is itself a signal. The prediction and its attribution then feed CrewAI role-specialised agents that produce a hazard assessment, a handling protocol and terrain-aware threat maps, so the deliverable is a safety document rather than a tensor.',
    pipeline: [
      {
        n: '01',
        title: 'Frame intake',
        body: 'Camera-trap images resized to 299 px and normalised with ImageNet statistics (mean 0.485/0.456/0.406, std 0.229/0.224/0.225).',
      },
      {
        n: '02',
        title: 'Species classification',
        body: 'EfficientNet-B3 as the primary backbone, with ViT-B/16 via timm and Inception-V3 as alternates, plus an EnsembleModel that concatenates the EfficientNet and ViT feature outputs. Predictions map through class_mapping.json to 20 species. The trained checkpoint (wildlife_classifier_best.pth) is committed.',
      },
      {
        n: '03',
        title: 'Attribution',
        body: 'Captum runs Integrated Gradients, GradientSHAP, DeepLIFT, Occlusion, LRP and NoiseTunnel, plus class activation maps, over each prediction. A multi-technique comparison view and a dedicated misclassification analysis expose where the model looked when it was wrong.',
      },
      {
        n: '04',
        title: 'Agentic safety analysis',
        body: 'CrewAI role-specialised agents take the species and attribution output and produce hazard assessment, safe handling protocol, risk factors and terrain-aware threat maps for the surrounding area.',
      },
      {
        n: '05',
        title: 'Field report',
        body: 'A species-specific template renders the whole thing as a standalone HTML report for forest officers, with optional PDF export.',
      },
    ],
    results: [
      { v: '95%', k: 'test accuracy' },
      { v: '30%', k: 'inference cost reduction after optimisation' },
      { v: '20', k: 'species classes', note: 'verified from class_mapping.json' },
      { v: '6', k: 'Captum attribution methods run per prediction' },
      { v: '299 px', k: 'model input resolution' },
    ],
    stack: [
      'PyTorch',
      'torchvision (EfficientNet-B3, Inception-V3)',
      'timm (ViT-B/16)',
      'Captum',
      'OpenCV',
      'scikit-learn',
      'Pillow',
      'matplotlib',
      'seaborn',
      'CrewAI',
      'Docker',
    ],
    dataset:
      'Missouri Camera Traps (LILA BC) plus a 20-class mapping spanning neotropical species (agouti, coiban agouti, paca, ocelot, collared peccary, red brocket deer, white-nosed coati, spiny rat, common opossum, great tinamou) and temperate ones (red deer, roe deer, wild boar, red fox, European hare, wood mouse, mouflon, white-tailed deer, red squirrel). No bounding-box annotations.',
    challenges: [
      'No bounding boxes anywhere in the data, so attribution maps had to stand in for localisation supervision when verifying the model was tracking the animal and not the background.',
      'A long-tailed class distribution where the rare species are precisely the conservation priority.',
      'Cluttered infrared night frames with flash falloff, motion blur and heavy grain as the normal case rather than the edge case.',
      'Turning a classifier output into a document a field officer can act on, which is what the CrewAI reporting layer exists to do.',
    ],
    honest:
      'The public repo is a partial upload. The README documents install.py, analyze_wildlife.py, integrate_markdown_report.py, requirements.txt and a report_templates/ directory, none of which are committed, so the project is not runnable as published. No sample attribution images are committed either, which is a real gap for a project whose selling point is visual explainability. The trained checkpoint is present, so the maps can be regenerated.',
    repo: 'https://github.com/Vishal-AS-0407/WISP',
  },

  memora: {
    slug: 'memora',
    problem:
      'Chatbot context dies with the session, and the usual fix, replaying the whole transcript into the prompt, is expensive and actively makes hallucination worse by burying the relevant turn in noise. Recall needs two different access patterns at once: fast exact lookup of which thread, which user and when, and fuzzy semantic search over what was discussed. One store does not serve both well.',
    approach:
      'Storage is split by access pattern. Redis holds conversation metadata, thread structure and topic indices for structured lookup; FAISS holds the embeddings for similarity search. An LLM assigns generic topic names to each new exchange, comparing against the topics already on the thread so labels do not drift, which means retrieval can narrow by topic before it ever touches the vector index. Only the relevant slice enters the prompt, which is where the token and latency savings come from.',
    pipeline: [
      {
        n: '01',
        title: 'Thread initialisation',
        body: 'createThread() allocates a thread and records the embedding model name on it, so a thread can never be queried with a model whose vectors are not comparable to the ones stored.',
      },
      {
        n: '02',
        title: 'Conversation window write',
        body: 'Each Q&A pair becomes a window with its own UUID, stored under a window:{uuid} key in Redis with topics, timestamps and usernames attached as metadata.',
      },
      {
        n: '03',
        title: 'Automatic topic assignment',
        body: 'A LangChain structured-output call with a Pydantic schema asks the LLM for generic topic names, explicitly diffed against the thread topics that already exist. Threads self-organise without the user tagging anything.',
      },
      {
        n: '04',
        title: 'Vector write',
        body: 'Query and answer are concatenated, embedded, cast to float32 and L2-normalised into a per-thread FAISS IndexFlatIP, so inner product gives cosine similarity directly.',
      },
      {
        n: '05',
        title: 'Retrieval',
        body: 'search_by_question() filters candidate windows through the Redis topic index first, then runs FAISS top-k over just that subset. search_by_text() provides a keyword fallback when the semantic path returns nothing useful.',
      },
    ],
    results: [
      { v: '14.3% -> 1.4%', k: 'hallucination rate' },
      { v: '60%', k: 'token reduction per turn' },
      { v: '35%', k: 'latency reduction' },
      { v: 'IndexFlatIP', k: 'FAISS index, one per thread' },
    ],
    stack: [
      'Redis',
      'faiss-cpu',
      'LangChain',
      'langchain-google-genai',
      'google-generativeai',
      'sentence-transformers',
      'Pydantic',
      'NumPy',
      'LangSmith',
      'semantic caching',
    ],
    challenges: [
      'Keeping topic labels stable across a long thread, solved by passing the existing topic list into the classification prompt instead of labelling each turn in isolation.',
      'Guarding against embedding-model mismatch by storing the model name on the thread, since a swapped model silently produces garbage neighbours.',
      'Narrowing by topic before the vector search rather than after, which is what keeps retrieval cheap as a thread grows.',
    ],
    honest:
      'The hallucination, token and latency figures come from his own evaluation harness; the public repo is the library only and contains no benchmark script, so those numbers are not reproducible from what is committed. The README also documents helper modules, a vecdb_storage tree and setup steps that are not in the repository, and embeds a hardcoded local path, so the install instructions do not work as written.',
    repo: 'https://github.com/Vishal-AS-0407/Memora',
  },

  'semantic-modeling': {
    slug: 'semantic-modeling',
    problem:
      'A folder of unstructured PDFs cannot be queried. The standard route extracts entities with rules or spaCy and clusters with one algorithm, which produces noisy near-duplicate entities and mediocre topic separation. The deeper issue is the clustering choice: Louvain finds local communities but misses global structure, spectral captures global structure but not long-range semantics, and embedding-based methods drift. Picking one means inheriting its specific blind spot.',
    approach:
      'Do not pick one. Louvain, spectral clustering and Node2Vec with HDBSCAN each cluster the graph independently, and a co-assignment matrix turns their agreement into consensus clusters. Entity extraction is handed to GPT-4o-mini instead of rules, with fuzzy plus semantic matching to collapse duplicates. The whole thing runs as a five-module pipeline over a PDF corpus and emits a queryable graph plus interactive visualisations.',
    pipeline: [
      {
        n: '01',
        title: 'PDF parsing',
        body: 'PyPDF2, pdfplumber and pypdf extract text from the corpus into structured JSON, with layout-aware fallbacks when one parser fails on a document.',
      },
      {
        n: '02',
        title: 'LLM entity extraction',
        body: 'GPT-4o-mini extracts entities and typed relations in place of rule-based NER. Fuzzy string matching plus semantic similarity then deduplicate the results, collapsing 32% of the raw extractions.',
      },
      {
        n: '03',
        title: 'Global knowledge graph',
        body: 'Entities and relations are assembled into a single NetworkX graph spanning the whole corpus, with more than 10 typed relationship kinds such as uses, trained_on and evaluated_on.',
      },
      {
        n: '04',
        title: 'Graph enhancement',
        body: 'PageRank scores node importance so downstream clustering weights structurally central entities rather than treating every node alike.',
      },
      {
        n: '05',
        title: 'Ensemble semantic clustering',
        body: 'The novel stage. Louvain modularity optimisation, spectral clustering via Laplacian eigendecomposition, and Node2Vec embeddings into HDBSCAN each partition the graph. A co-assignment matrix records how often any two nodes land together, and consensus voting resolves that into final clusters with MIN_CLUSTER_SIZE of 3.',
      },
      {
        n: '06',
        title: 'Retrieval and visualisation',
        body: 'The finished semantic model supports semantic QA over the corpus and renders as interactive pyvis HTML: topic network, hierarchy, full knowledge graph and a sunburst of topic composition, all committed.',
      },
    ],
    results: [
      { v: '0.787', k: 'modularity', note: 'against 0.670 for his own hierarchical variant' },
      { v: '97.7%', k: 'retrieval similarity', note: 'semantic match between retrieved context and query in QA evaluation' },
      { v: '32%', k: 'entity deduplication rate' },
      { v: '609 / 14 / 304', k: 'entities / topics / relations discovered' },
      { v: '~20 min', k: 'full pipeline runtime' },
      { v: '~$0.45', k: 'LLM API cost per full run' },
    ],
    stack: [
      'NetworkX',
      'HDBSCAN',
      'Node2Vec',
      'scikit-learn (spectral clustering)',
      'OpenAI GPT-4o-mini',
      'kg-gen',
      'litellm',
      'dspy-ai',
      'sentence-transformers',
      'PyPDF2',
      'pdfplumber',
      'pypdf',
      'pyvis',
      'pandas',
      'NumPy',
      'matplotlib',
    ],
    dataset:
      'A corpus of unstructured research PDFs. The committed run produced 609 unique entities, 14 semantic topics and 304 relations; the largest topics are GPT-3 (36 entities), Transformer (30), ViT (28), CLIP (23) and Neural Networks (21).',
    challenges: [
      'Three clustering algorithms return incompatible partitions with different cluster counts, so agreement had to be expressed as a co-assignment matrix rather than a direct label comparison.',
      'LLM entity extraction produces near-duplicates that are not string-identical, requiring fuzzy and semantic matching in combination.',
      'Keeping a full-corpus run inside roughly $0.45 of API spend, which constrains how much text can be sent to the extraction model per document.',
    ],
    honest:
      'The benchmark table is self-generated and compares the flagship flat pipeline against his own hierarchical variant, not against a published baseline, and the "typical modularity around 0.5" reference point is uncited. The comparison also cuts both ways: the hierarchical variant scores far better on topic coherence (0.894 vs 0.208) while losing on modularity, so the win is on one axis rather than across the board.',
    repo: 'https://github.com/Vishal-AS-0407/sematic_model_unstructured_data',
  },

  'qubit-green-finance': {
    slug: 'qubit-green-finance',
    problem:
      'Deciding how to allocate capital across sustainable projects requires two different kinds of work. The evidence lives in unstructured documents: project PDFs, supply-chain records, climate data and economic reports, none of which are tabular. The decision itself is a constrained optimisation, not a ranking, because a budget cap, per-project floors and ceilings, and a concentration limit all bind at once.',
    approach:
      'The two halves are split. LLM agents handle the unstructured side, with separate roles for document processing, ESG analysis and risk assessment, orchestrated through CrewAI. A 15x3 SDG Impact Matrix scores each project against all 15 UN Sustainable Development Goals on economic, environmental and social axes, which is what turns document evidence into numbers the optimiser can use. A linear programme then allocates capital under explicit constraints rather than sorting projects by score.',
    pipeline: [
      {
        n: '01',
        title: 'Multi-source intake',
        body: 'Project PDFs parsed with PyPDF2, alongside supply-chain, climate and economic data. The Streamlit front end also accepts spoken input via the Sarvam API and free text, and regex-masks bank account numbers before anything reaches the model.',
      },
      {
        n: '02',
        title: 'Agent analysis',
        body: 'CrewAI orchestrates three specialists: document_processor, esg_analyzer for viability and ESG impact, and risk_assessor. analysis_workflow sequences them and collects their outputs.',
      },
      {
        n: '03',
        title: 'SDG impact scoring',
        body: 'Each project is scored into a 15x3 matrix, 15 UN SDGs against economic, environmental and social dimensions, producing the ESG and risk scalars the optimiser consumes.',
      },
      {
        n: '04',
        title: 'Constrained optimisation',
        body: 'A PuLP linear programme maximises the sum of ESG score times allocation, minus a 0.1 penalty on total capital deployed and a 0.05 penalty weighted by project risk. Constraints: a total budget cap, per-project minimum and maximum allocations, no single project above 40% of the budget, and a hard ESG floor of 0.7 below which allocation is forced to zero.',
      },
      {
        n: '05',
        title: 'Report and dashboard',
        body: 'A Streamlit dashboard with analytics_service.py renders the allocation, the per-project viability and ESG reports, and the automated financial analysis.',
      },
    ],
    results: [
      { v: '15 x 3', k: 'SDG Impact Matrix, goals x impact axes' },
      { v: '15', k: 'UN SDGs scored per project' },
      { v: '0.7', k: 'hard ESG floor for any allocation' },
      { v: '40%', k: 'maximum share of budget to any single project' },
      { v: '3', k: 'specialist agents in the CrewAI workflow' },
      { v: '20', k: 'candidate projects in the committed optimiser run' },
    ],
    stack: [
      'PuLP',
      'CrewAI',
      'google-generativeai (Gemini 1.5 Flash)',
      'Sarvam API',
      'PyPDF2',
      'Streamlit',
      'NumPy',
      'Tkinter',
      'PyAudio',
    ],
    challenges: [
      'Converting narrative ESG claims in project PDFs into scalars an optimiser can accept, which is what the 15x3 matrix exists to do.',
      'Expressing diversification as a real constraint (no project above 40% of budget) rather than a post-hoc adjustment to a ranked list.',
      'Enforcing an ESG floor as a hard zero rather than a soft penalty, so a high-return low-ESG project cannot buy its way into the portfolio.',
    ],
    honest:
      'The README states plainly that this is a first-round prototype of part of the system, and it should be read that way. The committed optimiser runs on 20 randomly generated candidate projects with ESG scores in 0.6-0.9 and risk 4-7 against a $1,000 notional budget, so it demonstrates the formulation rather than a real portfolio. The README badges Neo4j, Pinecone, TensorFlow, PyTorch and Firebase, which the six committed Python files do not use, and no performance figures are reported anywhere. The repo is a team fork (Shaastra, IIT Madras) in which Vishal authored 15 of 26 commits.',
    repo: 'https://github.com/Vishal-AS-0407/Qubit-GreenFinance',
  },
};
