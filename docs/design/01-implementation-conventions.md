# 01 — Implementation conventions

The only things the eight project pages have in common. Everything not listed
here, each page invents for itself.

## Where a page lives

```
v2/src/projects/<slug>/
  index.tsx        default-exports the page component
  <name>.css       the page's entire design system, scoped
  *.tsx / *.ts     whatever else that page needs, and nothing else imports it
```

Register it in `v2/src/App.tsx`:

```tsx
const PAGES: Record<string, ComponentType> = {
  '<slug>': lazy(() => import('@/projects/<slug>')),
};
```

Lazy loading is load-bearing: it is what keeps eight design systems, eight
stylesheets and sixteen font files off the landing page's critical path. A
page's CSS chunk and its `@font-face` files are fetched only when that route is
opened.

## What may be imported

| From | What |
|---|---|
| `@/projects/_shared/BackLink` | `<BackLink label="…" />` — renders `.pj-back` with `.pj-back__arrow` and `.pj-back__label`. It ships no colour, size or face; style it inside your scope. |
| `@/projects/_shared/page` | `usePageShell`, `raf`, `clamp01`, `lerp`, `track` |
| `@/projects/_shared/reduced` | `prefersReduced`, `useReducedMotion`, `isCoarse` |
| `@/projects/_shared/Mechanism` | `<Mechanism prefix="…" … build={scene} />` — the pinned 3D "mechanism" section (see `subpages-mechanism.md`). Structure only; every class is `<prefix>-mx…` and styled in the page's CSS. |
| `@/projects/_shared/stage3d` | `createStage`, `textTexture`, `ease`, `band` — renderer plumbing for a page's own `mechanism.ts`; no colour, light or material |
| `@/data/content` | `projects` — words and numbers only, never the `theme` object |
| `@/data/casestudies` | `caseStudies[slug]` |
| `react-router-dom` | `Link` |
| `gsap`, `three`, `lenis` | as libraries, never in the landing page's configuration |

**Nothing else.** No landing-page component, no `@/lib/scroll`, no
`@/components/*`, and nothing from a sibling project folder.

## Scoping

```tsx
usePageShell({ title, bg, ink, accent, scope: 'pj-<name>' });
```

It sets the document title, paints `body`/`html`/`theme-color` to the page's own
ground so no rubber-band scroll ever exposes the landing page's colour, adds
`body.pj-<name>`, and reverts all of it on unmount.

Wrap the page in a single root element with your own class (`.nw`, `.pp`, …) and
prefix every selector in your stylesheet with it. Set the page's font-family on
`body.pj-<name>` too, so `body`'s inherited Archivo is never resolved.

**No Tailwind utility classes on a project page.** Plain CSS in your own file.

## Two mistakes already made, do not repeat

1. **Never put `overflow` on the scope root.** Any value other than `visible` on
   an ancestor makes that element the scroll container for `position: sticky`
   inside it, and every pinned section silently stops working a third of the way
   down the page. Clip on the sticky element itself.
2. **A fixed overlay with a `z-index` outranks everything with `z-index: auto`.**
   If the page has a fixed scrim or canvas at `z-index: 1`, every content
   section needs `position: relative` and an explicit higher `z-index`, not just
   the ones you happened to test.

## Motion

- One `raf()` per page, cancelled on unmount. *Amendment (2026-10, subpage overhaul):* the
  shared `Mechanism` section runs its own `requestAnimationFrame`, but it is idle unless the
  section intersects the viewport and the tab is visible, so a page never has two loops
  doing work at once. Read layout with
  `getBoundingClientRect()` inside it and write `transform` / `opacity` /
  `clip-path` directly to the DOM. No React state per frame.
- Never subscribe to a global scroll bus; there isn't one on these routes.
- Every listener, observer, timeline, `ResizeObserver` and WebGL context is
  disposed in the effect's cleanup.
- `prefersReduced()` gets a real branch that sets every animated element to its
  final state and returns before starting a loop — not a `transition: none`
  patch over a page that still depends on animation to become readable.
- Coarse pointer / narrow viewport gets a *designed* reduction — fewer elements,
  a different interaction — never a broken desktop layout.

## Content

Use the real strings. `caseStudies[slug]` carries `problem`, `approach`,
`pipeline[]`, `results[]`, `stack[]`, `dataset`, `challenges[]`, `honest`,
`repo`, `demo`, `paper`. The `honest` note is not optional and is not a footnote
— every page has to find a real place for it.

The eight section names of the deleted template (`the problem`, `the approach`,
`pipeline`, `results`, `what was hard`, `an honest note`, `stack`, `links`) may
not appear as section headings, in that order or any other.

## Accessibility

Semantic landmarks, one `<h1>`, headings in order, real link text, `aria-hidden`
on every decorative canvas/SVG, visible `:focus-visible` in the page's own
palette, and no layout shift on load — reserve space for anything that animates
in.

## Verifying

```
cd v2 && npm run build        # tsc --noEmit && vite build, must stay green
```
