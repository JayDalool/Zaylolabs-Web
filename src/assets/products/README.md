# Product screenshots

Real screenshots of the working apps. Drop files here and they appear across
the site automatically — no code changes.

```
src/assets/products/<slug>/desktop/01-overview.webp    # 16:10 (1600×1000)
src/assets/products/<slug>/mobile/01-home.webp         # ~9:19.5 (640 wide is enough)
src/assets/products/<slug>/desktop-light/…             # the app's other theme, if it has one
src/assets/products/<slug>/mobile-light/…
src/assets/products/<slug>/video/01-tour.mp4           # optional
```

- Slugs: `realtorlab`, `myexpenses`, `commandcenter`, `gyst`.
- Files fill slots in name order, and slot N belongs to the product's Nth
  "what it covers" topic in `src/data/products.ts`. Prefix them `01-`, `02-`, …
- Formats: png, jpg, webp, avif · mp4, webm. WebP at the sizes above keeps the site light.
- Any slot without a file shows a stamped **PLACEHOLDER** schematic instead.

## How the current screenshots were made (17 Nov 2026)

Each app was run locally on made-up data; nothing came from a live site or a real database.

- **RealtorLab** — the app's own synthetic demo data (invented sales and neighbourhoods),
  a made-up agent and subject property. The product name was changed locally for the captures.
- **My Expenses** — a made-up household, with expenses added through the real wizard
  from the app's synthetic test receipts, so the receipt reading is genuine.
- **Command Center** — the app's own test harness with an entirely fictional data set
  (invented projects, tasks and people). Dark and light themes.
- **GYST** — the app's own Galaxy captures, made with its fictional-project seed.

Before adding a screenshot, check that it shows **no** real customer data, personal
or financial information, credentials, tokens, internal URLs or operational
details. Use sample data.
