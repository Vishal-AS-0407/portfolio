<h1 align="center">Portfolio</h1>

<p align="center">
  <b>Personal site — research, projects, publications and patents.</b>
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

A single-page portfolio: hero, about, education, experience, research, projects, achievements,
leadership, certifications, skills, extracurricular, hobbies, contact. Built as a static React app
with one live backend dependency — a Supabase table behind the contact form.

## Stack

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

## Worth a look

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
npm install
npm run dev          # → http://localhost:5173
```

```bash
npm run build        # production build
npm run preview      # serve the build
npm run lint
```

For the contact form, set your Supabase URL and anon key and apply the migration in
`supabase/migrations/`.

---

## Notes

- **`vite.config.ts.timestamp-*.mjs` is committed by accident** — Vite writes those while resolving
  the config and they should not be in the repository. Safe to delete, and worth adding
  `vite.config.ts.timestamp-*` to `.gitignore`.
- **Both `bun.lockb` and `package-lock.json` are committed.** Pick one package manager; two
  lockfiles will drift and disagree.
- **`src/components/ui/` is the full shadcn/ui set**, most of which this site does not use. Harmless
  — Vite tree-shakes it out of the bundle — but it makes the component count look larger than the
  site is.
- **A ground-up v2 exists** in which every project gets its own standalone case-study page, each
  designed as a separate site rather than a reskin of the index — eight independent design systems,
  own fonts, own palette, own motion language, lazily code-split per route. Design docs and build
  log under `docs/design/`.
