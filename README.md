# Vishal A S — portfolio

One deployment, two sites:

| Path | What | Source |
|---|---|---|
| `/` | the main site — WebGL, scroll work, eight project pages under `/work/:slug` | `v2/` |
| `/plain/` | the plain version, linked from the main site's "see the plain version" pill | repo root (`src/`) |

## Run locally

```sh
cd v2 && npm install && npm run dev          # main site  → http://localhost:5173
npm install && npm run dev                   # plain site → http://localhost:8080 (from repo root)
```

## Build and deploy (one site)

```sh
npm install                  # repo root, once
cd v2 && npm install
npm run build:all            # v2 → v2/dist, plain site → v2/dist/plain
npm run preview              # serves both at http://localhost:4173 and /plain/
```

On Vercel it works whichever folder the project is rooted at:

- **Root Directory = repo root** (how the live site is set up today): the root
  `vercel.json` installs both apps, runs `npm run build:site` and serves `v2/dist`.
- **Root Directory = `v2`**: `v2/vercel.json` does the same from inside `v2`. Leave
  *Include source files outside of the Root Directory* on (the default), because
  the plain site lives one level up.

Both route `/plain/*` to the plain site and everything else to the main site,
so a single `git push` deploys both.

The plain site's contact form needs `VITE_SUPABASE_URL` and
`VITE_SUPABASE_ANON_KEY` in the Vercel project's environment variables. Without
them it falls back to a mailto link.

Live at **https://portfolio-sigma-blond-57.vercel.app/**, which is the URL Google Scholar
and the GitHub READMEs link to. If you add a custom domain later, search the repo for
`portfolio-sigma-blond-57` and replace it everywhere.
