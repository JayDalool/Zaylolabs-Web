# ZayloLabs — website

The ZayloLabs studio site, in its design stage. Direction: **Specimen** — a warm
paper "software lab" where every product is shown as it really is, and each
app's section takes on that app's own colours while the visitor is in it.

Four products: **EstateLab**, **My Expenses**, **Command Center** (a full
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
| `#/` | Home: the landing, one one-screen section per product, studio, contact form |
| `#/work` | All products: index-card drawer and a plain list |
| `#/work/<slug>` | A page per product, from one template — fully in that app's colours, with real screenshots and step-by-step demos |
| `#/work/<slug>/plans` | Plans and access for a Live product: a request-access form, and plans (no prices until they exist) |
| `#/system` | Design system reference |

## Structure

```
src/
  data/products.ts     single source of truth for products + studio copy
  media/               media kit: ProductMedia, frames, zoom dialog, placeholder schematics
  assets/products/<slug>/{desktop,mobile}/   real screenshots
  site/                pages, design system (specimen.css), immersion, screen viewer
  site/landing/        the landing, the one-screen app sections, scroll settle
  site/demo/           the demo player, its building blocks (kit.tsx), each app's design (skins.css)
  site/demo/apps/      the demo scripts, one file per app
  shared/              small environment hooks
```

## Immersion (an app's colours take over its section)

`src/site/immerse.ts` + the IMMERSION block in `src/site/specimen.css`.

- A section takes its app's colours as soon as it reaches the middle of the screen,
  on every device, so the colour arrives while the section is still scrolling in.
  Keyboard focus inside a section counts too.
- There is one header for every page. It keeps the site's own look on the home page
  and the general pages, and takes an app's colour only on that app's own pages
  (its product page and its plans page), where header, page and footer are one colour.
- Product pages are in their app's colours throughout.
- Colours come from each product's `hue` in `products.ts`, and those values are
  taken from the app's own code: `field` is the ground the section becomes,
  `bright` its accent on that ground, `ink` its accent on the site's paper.

## Forms

`src/site/inquiry.tsx` holds both forms. **Contact** (home page) asks what the
inquiry is about (an app, custom software, or a general question), then name,
email and a message. **Request access** (each Plans page) asks for a name and an
email for that app. Nothing is stored in the browser.

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
- The contact and request-access forms are not connected yet (`INQUIRY_ENDPOINT` in
  `src/site/inquiry.tsx` is `null`). They say so plainly and never pretend to have sent.

## Before launch

- Connect the forms: set `INQUIRY_ENDPOINT` in `src/site/inquiry.tsx` to an address that
  receives the inquiries and forwards them to the studio's inbox.
- Add plan names and prices to `plans` in `products.ts`, then attach hosted checkout
  (Stripe, PayPal) to the Plans pages. This needs the registered company and its accounts.
- Run a proper trademark and domain check on the name EstateLab (a quick web search found no company using it).
- Switch from hash routing to path routing with pre-rendered pages (search engines, sharing).
- Remove the `noindex` meta tag and the "design prototype" notes.

## History

The four directions explored before choosing Specimen (Specimen, Z-Axis, Studio OS,
Plain View), with the comparison page and review results, are preserved at the
`concepts-archive` tag.
