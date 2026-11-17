# ZayloLabs — website

The ZayloLabs studio site, in its design stage. Direction: **Specimen** — a warm
paper "software lab" where every product is shown as it really is, and each
app's section takes on that app's own colours while the visitor is in it.

Four products: **RealtorLab**, **My Expenses**, **Command Center** (a full
section each) and **GYST** (a shorter mention). All are shown as Live, with
access by invitation and a Plans page each.

**Not deployed.** Nothing here touches zaylolabs.com, DNS, email or any
production system.

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
| `#/work/<slug>` | A page per product, from one template — fully in that app's colours, with real screenshots and step-by-step demos |
| `#/work/<slug>/plans` | Plans and access for a Live product (no prices until they exist) |
| `#/system` | Design system reference |

## Structure

```
src/
  data/products.ts     single source of truth for products + studio copy
  media/               media kit: ProductMedia, frames, zoom dialog, placeholder schematics
  assets/products/<slug>/{desktop,mobile}/   real screenshots
  site/                pages, design system (specimen.css), immersion, screen viewer
  site/landing/        the two landings, the one-screen app sections, scroll settle
  site/demo/           the demo player, its building blocks (kit.tsx), each app's design (skins.css)
  site/demo/apps/      the demo scripts, one file per app
  shared/              small environment hooks
```

## Immersion (an app's colours take over its section)

`src/site/immerse.ts` + the IMMERSION block in `src/site/specimen.css`.

- A section takes its app's colours as soon as it reaches the middle of the screen,
  on every device, so the colour arrives while the section is still scrolling in.
  Keyboard focus inside a section counts too.
- There is one header for every page. It takes the colours of the app the visitor
  is in: the section on screen on the home page, or the app whose page it is.
- Product pages are in their app's colours throughout.
- Colours come from each product's `hue` in `products.ts`, and those values are
  taken from the app's own code: `field` is the ground the section becomes,
  `bright` its accent on that ground, `ink` its accent on the site's paper.

## Demos (step-by-step walkthroughs)

`src/site/demo/apps/<slug>.tsx` holds one main demo per product and short demos for
its other tools. The screens are redrawn from the real apps: headings, labels,
buttons and step order follow each app's code, and `skins.css` gives each one its
real colours, type and shapes (both themes where the app has two). The data is
made up, and every demo is labelled as a demo on the page. If an app changes,
change its script: a demo must never show something the app does not do.

## Adding real screenshots

See `src/assets/products/README.md` — it also records how the current ones were
made (each app run locally on made-up data). Drop files into the product's
folder, prefixed `01-`, `02-`, …. No code changes.
Check every screenshot for customer data, credentials and internal detail first.

## Content rules baked into the code

- Product wording comes from `products.ts` and was checked against each app's code.
- No invented customers, statistics, history, awards, prices or capabilities.
  Plans pages show marked empty slots until real plans exist.
- Empty image slots show a stamped placeholder, never a fictional interface.
- There is no public contact address yet (`studio.contactEmail` is `null`).

## Before launch

- Set the contact address (`studio.contactEmail`) — "Request access" and "Contact" lead there.
- Add plan names and prices to `plans` in `products.ts`, then attach hosted checkout
  (Stripe, PayPal) to the Plans pages. This needs the registered company and its accounts.
- Check the name RealtorLab: REALTOR is a controlled trademark in Canada.
- Choose a landing and delete the other with the review switch (`src/site/landing/LandingSwitch.tsx`).
- Switch from hash routing to path routing with pre-rendered pages (search engines, sharing).
- Remove the `noindex` meta tag and the "design prototype" notes.

## History

The four directions explored before choosing Specimen (Specimen, Z-Axis, Studio OS,
Plain View), with the comparison page and review results, are preserved at the
`concepts-archive` tag.
