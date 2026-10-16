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

On Vercel, keep the project's **Root Directory** set to `v2`. `v2/vercel.json`
already installs both apps, runs `build:all` and routes `/plain/*` to the plain
site. The setting *Include source files outside of the Root Directory* must stay
on (it is by default), because the plain site lives one level up.

The plain site's contact form needs `VITE_SUPABASE_URL` and
`VITE_SUPABASE_ANON_KEY` in the Vercel project's environment variables. Without
them it falls back to a mailto link.

The old separate deployment (`portfolio-sigma-blond-57.vercel.app`) is no longer
needed. Delete it or point it at the new URL.
