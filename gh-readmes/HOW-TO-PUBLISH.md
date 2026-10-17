# Publishing the repo READMEs

27 READMEs live here, one per repo, each in a folder named exactly after the repo. The profile
README is in `../gh-profile/README.md`. Suggested **About** text (description, homepage, topics)
for every repo is in `repo-metadata.json`.

## One command

```bash
python gh-readmes/publish.py --dry-run           # what would change, touches nothing
python gh-readmes/publish.py                     # all 27 READMEs + profile + About/topics
python gh-readmes/publish.py --only WISP,Memora  # a subset
```

It uses the GitHub token git already stores (`git credential fill`) and commits each README
through the contents API (`docs: rebuild README`), so nothing is cloned. Repos whose README is
already identical are skipped. Re-running is safe.

Two exceptions:

- **`portfolio/`** is this codebase's README. It is also copied to the repo root and ships with a
  normal `git push` to `Vishal-AS-0407/portfolio`; the script only sets that repo's About text.
- **The profile** (`Vishal-AS-0407/Vishal-AS-0407`) gets `gh-profile/README.md`. It needs no
  asset files — every image is a hosted component (capsule-render, readme-typing-svg,
  github-readme-stats, streak-stats, skillicons, shields, Cool-GIFs).

## Components used (all checked live)

capsule-render waving header/footer · readme-typing-svg (demolab) · shields `for-the-badge` ·
skillicons.dev · github-readme-stats (stats, top-langs, pin cards; `tokyonight`) ·
streak-stats (demolab) · Cool-GIFs fading divider · native Mermaid and `<details>`.

> Never put `&` or `%26` in a capsule-render `text`/`desc`: it returns invalid SVG. Write "and".

## Checking before you push

```bash
python <scratchpad>/imgcheck.py      # every image URL resolves and every SVG parses
python <scratchpad>/ghpreview.py ... # renders through GitHub's markdown API, dark + light
```

Each README ends with **Notes and roadmap** — known issues are folded into a collapsed
`<details>`, not the headline. If you fix one in the code, delete its row before publishing.

Credential notes (keys in public history to rotate) stay in `TASK-TRACKER.md`, never in a
public README.
