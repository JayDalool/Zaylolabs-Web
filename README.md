# ZayloLabs — website

The ZayloLabs studio site. Direction: **Specimen** — a warm paper "software lab"
where every product is shown as it really is, and each app's section takes on
that app's own colours while the visitor is in it.

Four products: **EstateLab**, **My Expenses**, **Command Center** (a full
section each) and **GYST** (a shorter mention). All are Live, with access by
invitation and pricing on request. The studio also builds custom software.

**Launch-ready, not yet deployed.** Nothing here touches zaylolabs.com, DNS,
email or any production system.

## Run it

```bash
npm install
npm run dev          # http://localhost:5173
```

```bash
npm run build        # type-check + production build → dist/
npm run build:single # one self-contained HTML file → dist-single/index.html (for previews)
```

## Pages

| Address | What |
| --- | --- |
| `/` | Home: the landing, one one-screen section per product, custom software, contact form |
| `/work` | All products: index-card drawer and a plain list |
| `/work/<slug>` | A page per product, from one template — in that app's colours, with what it does, real screenshots, step-by-step demos and what to know |
| `/work/<slug>/plans` | Access and pricing for a Live product: how access works and the request-access form |
| `/privacy` | What the site does with what a visitor gives it |
| anything else | A not-found page |

Pages have normal addresses, so the host must answer every address with
`index.html`. `public/_redirects` does that on static hosts that read it
(Cloudflare Pages, Netlify).

## Structure

```
src/
  data/products.ts     single source of truth for products + studio copy
  media/               media kit: ProductMedia, frames, zoom dialog, placeholder schematics
  assets/products/<slug>/{desktop,mobile}/   real screenshots
  site/                pages, styles (specimen.css), immersion, screen viewer, forms
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
email for that app. Nothing is stored in the browser. Both post JSON to the endpoint
in `VITE_INQUIRY_ENDPOINT` (see `.env.example`); the receiving inbox is configured on
that endpoint, so its address never appears in the page.

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
  Pricing is "on request" until real plans exist.
- The studio's phone and address are the ones the owner gave for the site (`studio` in `products.ts`).
- Empty image slots show a stamped placeholder, never a fictional interface.
- Until `VITE_INQUIRY_ENDPOINT` is set, the contact and request-access forms say plainly
  that nothing was sent. They never pretend to have sent.

## Before launch

- Choose the host and deploy `dist/`. It must answer every address with `index.html`.
- Connect the forms: add a small endpoint on the host that forwards each inquiry to the
  studio's inquiries inbox (the owner has named the address; keep it in the endpoint's
  settings, not in this repository), then build with `VITE_INQUIRY_ENDPOINT` set to it.
  The payload is described in `src/site/inquiry.tsx`. Until then the forms say they are
  not switched on and ask the visitor to call.
- Owner to read `/privacy` before it goes public: it speaks for the studio.
- Run a proper trademark and domain check on the name EstateLab (a quick web search found no company using it).
- When plans and prices exist: add them to the access pages and attach hosted checkout
  (Stripe, PayPal). This needs the registered company and its accounts.
- Optional, for search engines: pre-render each page to static HTML.

## History

The four directions explored before choosing Specimen (Specimen, Z-Axis, Studio OS,
Plain View), with the comparison page and review results, are preserved at the
`concepts-archive` tag.
