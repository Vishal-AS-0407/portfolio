<h1 align="center">Portfolio</h1>

<p align="center">
  <b>Personal site — research, projects, publications and patents.<br>
  Two sites, one deployment: the main site at <code>/</code>, the plain version at <code>/plain/</code>.</b>
</p>

<p align="center">
  <a href="https://portfolio-sigma-blond-57.vercel.app/"><img alt="Live" src="https://img.shields.io/badge/live-portfolio--sigma--blond--57-000000?style=flat-square&logo=vercel"></a>
  <img alt="React" src="https://img.shields.io/badge/React_18-61DAFB?style=flat-square&logo=react&logoColor=black">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white">
  <img alt="Vite" src="https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white">
  <img alt="Tailwind" src="https://img.shields.io/badge/Tailwind_+_shadcn/ui-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white">
  <img alt="Supabase" src="https://img.shields.io/badge/Supabase-3FCF8E?style=flat-square&logo=supabase&logoColor=white">
</p>

---

## What it is

One repo, one build, two sites:

| Path | Site | Source |
|---|---|---|
| `/` | **The main site.** WebGL particle hero, scroll-driven sections, and **eight standalone case-study pages** under `/work/:slug`. Each page has its own fonts, palette, motion language and technique (a WebGL shader, a canvas force simulation, a pinned horizontal transport, kinetic type and more), lazily code-split per route | `v2/` (React, three.js, GSAP, Lenis) |
| `/plain/` | **The plain version.** One readable page for anyone who would rather skip the motion, linked from the main site's "see the plain version" pill | repo root (React, shadcn/ui, Framer Motion) |

`npm run build:site` builds the main site into `v2/dist`, then the plain site into
`v2/dist/plain` with `--base=/plain/`. `vercel.json` routes `/plain/*` to the plain site's
`index.html` and everything else to the main site's. The two sites link to each other on the
same origin, so a single push deploys both. Design docs and the build log for the case-study
pages are in `docs/design/`.

### The plain version

A single-page portfolio: hero, about, education, experience, research, projects, achievements,
leadership, certifications, skills, extracurricular, hobbies, contact. Built as a static React app
with one live backend dependency — a Supabase table behind the contact form.

### Stack (plain version)

| | |
|---|---|
| Framework | React 18 + TypeScript, Vite |
| Styling | Tailwind CSS + shadcn/ui (Radix primitives) |
| Motion | Framer Motion, GSAP, Lenis smooth scroll |
| Forms | react-hook-form + Zod |
| Data | TanStack Query |
| Backend | Supabase (contact messages) |
| Charts / misc | Recharts, Embla carousel, Lucide icons, Sonner toasts |
| Deploy | Vercel |

### Worth a look

**`NeuralField.tsx`** — a canvas particle field that responds to both the pointer *and* the scroll
position. Particle count scales with viewport area (`width × height / 18000 × density`) rather than
being fixed, so a phone does not render a desktop's worth of particles; hue is sampled from a
narrow teal band (`172 + random × 30`) so the field reads as one material rather than as confetti.
Mouse velocity is tracked, not just position, so fast movement pushes harder than slow.

**`NeuralCompanion.tsx`** — an ambient interactive element that follows the reader down the page.

**`components/motion/Reveal.tsx`** — one shared scroll-reveal primitive, so every section enters
the same way.

**`LoadingScreen.tsx`** — a deliberate first-paint state rather than a blank white flash.

**`supabase/migrations/`** — the contact form's table, with **row-level security written the right
way round**:

```sql
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_insert_contact_messages" ON contact_messages
  FOR INSERT TO anon, authenticated WITH CHECK (true);
```

Insert is public; there is **no** `SELECT`, `UPDATE` or `DELETE` policy for `anon`. Anyone can send
a message and nobody can read the messages — which is the correct posture for a public form, and a
step most portfolio contact forms skip entirely. Only the service role can read the inbox.

## Running it

```bash
git clone https://github.com/Vishal-AS-0407/portfolio.git
cd portfolio
npm install && npm --prefix v2 install

npm --prefix v2 run dev     # main site  → http://localhost:5173
npm run dev                 # plain site → http://localhost:8080

npm run build:site          # both, into v2/dist
npm --prefix v2 run preview # serve the combined build → http://localhost:4173
```

For the contact form, set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` and apply the
migration in `supabase/migrations/`. Without them, the form falls back to a `mailto:` link
instead of failing.

---

## Notes

- **Both `bun.lockb` and `package-lock.json` are committed** at the root. Pick one package
  manager, because two lockfiles will drift and disagree. The deploy uses npm.
- **`src/components/ui/` is the full shadcn/ui set**, most of which the plain site does not use.
  It is harmless, since Vite tree-shakes the unused components out of the bundle, but it makes
  the component count look larger than the site is.
