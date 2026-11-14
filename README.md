# ZayloLabs — website design prototype

Standalone design prototype. Four concepts, a comparison page with an
independent usefulness review, and full builds of two of them.
**Chosen direction so far: Concept 02 — Z-Axis.** Concept 04 — Plain View was
added afterwards as the middle ground between Specimen and Z-Axis. **Not deployed anywhere** — nothing
here touches zaylolabs.com, DNS, email, or any production system.

## Run it

```bash
npm install
npm run dev          # http://localhost:5173
```

```bash
npm run build        # type-check + production build → dist/
npm run build:single # one self-contained HTML file → dist-single/index.html
```

## What is where

| Route (hash) | What |
| --- | --- |
| `#/` | Comparison page: rationale, identity, strengths, recommendation, quality review |
| `#/specimen` | **Concept 01 — Specimen** (also built out): full homepage |
| `#/specimen/work` | Catalogue — index-card drawer gallery + table view |
| `#/specimen/work/samvisionai` | Flagship product showcase |
| `#/specimen/work/<slug>` | Every other product, from the same template |
| `#/specimen/system` | Design system reference |
| `#/z-axis` | **Concept 02 — Z-Axis** (chosen): WebGL depth-flight homepage |
| `#/z-axis/work` | Work index — every product as a row on the axis, with a depth-stack preview |
| `#/z-axis/work/samvisionai` | Flagship product page |
| `#/z-axis/work/<slug>` | Every other product, from the same template |
| `#/z-axis/system` | Z-Axis design system reference |
| `#/studio-os` | **Concept 03 — Studio OS**: desktop-metaphor homepage |
| `#/plain-view` | **Concept 04 — Plain View** (the middle ground): plain-language homepage with one display case; no WebGL |
| `#/plain-view/products/<slug>` | A page per product, from one template |

Append `?nowebgl` before the hash (e.g. `/?nowebgl#/specimen`) to force the
no-WebGL fallbacks.

```
src/
  data/products.ts        single source of truth for products + studio copy
  media/                  reusable media kit
    manifest.ts           discovers real captures in src/assets/products/**
    schematic.ts          stamped PLACEHOLDER schematics for empty slots
    ProductMedia.tsx      ProductMedia · ProductVideo · WindowFrame · PhoneFrame · ProductGlyph
  assets/products/<slug>/{desktop,mobile,video}/   drop real captures here
  concepts/specimen/      Concept 01 (design system, pages, exploded-view WebGL)
  concepts/zaxis/         Concept 02 (flight scene + shaders, site kit, work, product, system pages)
  concepts/studio-os/     Concept 03
  concepts/plainview/     Concept 04 (Home, Product, Case = the CSS-3D display case, ui, pv.css)
  hub/                    comparison page (review chrome)
  shared/                 env hooks (WebGL / reduced motion / viewport), concept switcher
```

## Adding real screenshots

See `src/assets/products/README.md`. Drop files into the product's folder,
prefixed `01-`, `02-`, …; they replace the placeholders everywhere, in every
concept, including WebGL textures. No code changes.

## Content rules baked into the code

- Product copy comes only from `src/data/products.ts`, which restates the
  company brief. Nothing invents customers, statistics, awards or availability.
- Stage labels for SamVisionAI, MyFamilyExpenses and GYST are set to a
  conservative "In development / not publicly available yet" and are marked
  `TODO(owner)` — **confirm or correct them**.
- `studio.contactEmail` is `null`; the contact block says so rather than
  inventing an address.
- An empty capture slot always renders a stamped schematic, never a fake UI.

## Before production

- Remove `src/shared/ConceptSwitcher`, the `hub/` route and the concepts you
  are not shipping; mount `concepts/zaxis` at `/`.
- Measure the flight on real phones and GPUs (only software rendering was
  available while building) and tune particle counts / DPR from that.
- Pre-render the routes (e.g. React Router framework mode or vite-ssg) so the
  content is in the HTML without JavaScript; the `<noscript>` block is a stopgap.
- Replace hash routing with path routing.
