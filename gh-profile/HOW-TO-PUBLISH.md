# Publishing the profile README

Everything in this folder is ready. It is **not** pushed — I have no write access to
your GitHub account.

## What goes where

Your profile README lives in the special repo `Vishal-AS-0407/Vishal-AS-0407`
(same name as your username). It already exists and currently holds only the old
`README.md`.

Copy **both** of these into that repo, at the root:

```
README.md
assets/          (8 files: banner/signal/stack/rule × dark/light)
```

Do **not** copy `build/` — it's the generator, not the published output. Copy it only
if you want to be able to rebuild the SVGs later (you'd also need the two fonts from
`v2/public/fonts/`).

```bash
git clone https://github.com/Vishal-AS-0407/Vishal-AS-0407.git
cd Vishal-AS-0407
# copy README.md and assets/ in, then:
git add -A
git commit -m "Rebuild profile README"
git push
```

## Links

Every portfolio link points at `https://portfolio-sigma-blond-57.vercel.app`. That domain now
serves both sites from one deployment: the main site with the `/work/<slug>` case studies, and
the plain version at `/plain/`. Nothing needs replacing unless you add a custom domain. In that
case, find-and-replace the domain in `README.md`.

## Two profile settings worth fixing while you're there

1. **Your bio still says "Aspiring AI Developer."** You are one, with published
   papers. Suggested replacement:

   > AI Developer @ CISAI (Innspark) · B.Tech CSE (AI) @ Amrita · 3 publications, 2 patents filed · Rank 1 @ DravidianLangTech, NAACL 2025

2. **Pinned repos.** A reviewer arriving from the README sees the pins immediately.
   Recommended pins, in order — they match the "Selected work" table:

   `Patient-Mental-Health-Monitoring-Using-EEG` · `NAACL_DravidianLangTech_2025` ·
   `Why-is-my-Baby-Crying` · `Fraud-Detection-and-VQA-...` ·
   `sematic_model_unstructured_data` · `Memora`

   `Vega-Agent` is currently pinned first and is a fork with no commits from you.

## Also worth 20 minutes

27 of your 29 repos have **no description and no topics**. Every link in the README
lands on one. Even one line each makes the whole profile read as maintained.

## Rebuilding the assets

```bash
cd build
python build_svgs.py       # writes ../assets/*.svg
python preview.py dark     # renders each asset the way GitHub does
python preview_readme.py   # renders the whole README, both colour schemes
```

Requires `fonttools`, `brotli`, `playwright`, `markdown` — all already installed on
this machine.
