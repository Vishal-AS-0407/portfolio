# Publishing the profile README

`README.md` here goes to the special repo `Vishal-AS-0407/Vishal-AS-0407`. It is
self-contained: no `assets/` folder — every image is a hosted, open-source component
(typing SVG, GIFs, skill icons, stats/top-langs cards, pin cards, badges, view counter via hits.sh — komarev 404s through GitHub's image proxy).

```bash
python gh-readmes/publish.py --only Vishal-AS-0407
```

(or copy `README.md` into a clone of that repo and push).

## Links

Every portfolio link points at `https://portfolio-sigma-blond-57.vercel.app` — main site,
`/work/<slug>` case studies and `/plain/`, all one deployment. With a custom domain, find and
replace it in `README.md`.

## Profile settings worth fixing (GitHub UI, not scriptable)

1. **Bio** still says "Aspiring AI Developer". Suggested:

   > AI Developer @ CISAI (Innspark) · B.Tech CSE (AI) @ Amrita · 3 publications, 2 patents filed · Rank 1 @ DravidianLangTech, NAACL 2025

2. **Pinned repos**, matching the README's Featured Work:
   `Patient-Mental-Health-Monitoring-Using-EEG` · `NAACL_DravidianLangTech_2025` ·
   `Why-is-my-Baby-Crying` · `Fraud-Detection-and-VQA-...` ·
   `sematic_model_unstructured_data` · `Memora`

3. **Repo descriptions.** The pin cards show "No description provided" until About text is
   set — `publish.py` sets it from `gh-readmes/repo-metadata.json`.
