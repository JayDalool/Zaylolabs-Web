# ZayloLabs — website

The ZayloLabs studio site, in its design stage. Direction: **Specimen** — a warm
paper "software lab" where every product is shown at its real stage, and each
app's section takes on that app's own colours while the visitor is in it.

**Not deployed.** Nothing here touches zaylolabs.com, DNS, email or any
production system. Product images are marked placeholders until real
screenshots are added.

## Run it

```bash
npm install
npm run dev          # http://localhost:5173
```

```bash
npm run build        # type-check + production build → dist/
npm run build:single # one self-contained HTML file → dist-single/index.html
```

## Pages

| Route (hash) | What |
| --- | --- |
| `#/` | Home: the landing, one one-screen section per product, studio, contact |
| `#/?landing=a` | The alternative, scroll-driven landing (kept for review until one is chosen) |
| `#/work` | All products: index-card drawer and a plain list |
| `#/work/<slug>` | A page per product, from one template — fully in that app's colours, with the screen viewer and step-by-step demos |
| `#/system` | Design system reference |

## Structure

```
src/
  data/products.ts     single source of truth for products + studio copy
  media/               media kit: ProductMedia, frames, zoom dialog, placeholder schematics
  assets/products/<slug>/{desktop,mobile,video}/   drop real screenshots here
  site/                pages, design system (specimen.css), immersion, screen viewer
  site/landing/        the two landings, the one-screen app sections, scroll settle
  site/demo/           the demo player, its building blocks, and the demo scripts (demos.tsx)
  shared/              small environment hooks
```

## Immersion (an app's colours take over its section)

`src/site/immerse.ts` + the IMMERSION block in `src/site/specimen.css`.

- Mouse: while the pointer is over an app's section. Keyboard: while focus is in it.
  Touch: while it is the section on screen.
- Product pages are in their app's colours throughout.
- Colours come from each product's `hue` in `products.ts`. Set `brandField` on a
  product to use the app's real brand colour instead.

## Demos (step-by-step walkthroughs)

`src/site/demo/demos.tsx` holds one main demo per product and short demos for its
other tools. They are illustrations with made-up data, labelled as such on the page.
They are marked `TODO(owner)`: check each step against the real app, and remove
anything the app does not actually do.

## Adding real screenshots

See `src/assets/products/README.md`. Drop files into the product's folder,
prefixed `01-`, `02-`, …; they replace the placeholders everywhere. No code changes.
Check every capture for customer data, credentials and internal detail first.

## Content rules baked into the code

- Stages and availability come from `products.ts` and are never embellished.
  Three are marked `TODO(owner)` to confirm.
- No invented customers, statistics, history, awards or capabilities.
- Empty image slots show a stamped placeholder, never a fictional interface.
- There is no public contact address yet (`studio.contactEmail` is `null`).

## Before launch

- Confirm stages, availability and the contact address.
- Add real screenshots and each app's real colours; correct the demo scripts against the real apps.
- Choose a landing and delete the other with the review switch (`src/site/landing/LandingSwitch.tsx`).
- Switch from hash routing to path routing with pre-rendered pages (search engines, sharing).
- Remove the `noindex` meta tag and the "design prototype" notes.

## History

The four directions explored before choosing Specimen (Specimen, Z-Axis, Studio OS,
Plain View), with the comparison page and review results, are preserved at the
`concepts-archive` tag.
