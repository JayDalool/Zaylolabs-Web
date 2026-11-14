/**
 * Stage 1 comparison page — review chrome, not part of any concept.
 * Shows the directions side by side with rationale, identity, strengths
 * and a recommendation, and links into each live prototype.
 */
import { Link } from 'react-router-dom'
import './hub.css'

const shots = import.meta.glob('./previews/*.{jpg,png,webp}', { eager: true, query: '?url', import: 'default' }) as Record<string, string>
const shot = (name: string) => Object.entries(shots).find(([k]) => k.includes(`/${name}.`))?.[1]

interface Concept {
  no: string
  key: string
  name: string
  path: string
  idea: string
  rationale: string
  palette: { hex: string; name: string }[]
  type: string
  motion: string
  products: string
  threeD: string
  creative: string[]
  technical: string[]
  risks: string[]
  vars: React.CSSProperties
  fontClass: string
}

const CONCEPTS: Concept[] = [
  {
    no: '01',
    key: 'specimen',
    name: 'Specimen',
    path: '/specimen',
    idea: 'A software laboratory. Every product is a specimen on the bench — catalogued, labelled with its true stage, and taken apart layer by layer.',
    rationale:
      'It takes the “Labs” in the name literally and turns the brief’s hardest constraint — products at different, honest stages — into the identity itself. Warm paper instead of the dark-mode default makes ZayloLabs instantly distinguishable from the Linear/Vercel family, and real screenshots become the object of study rather than decoration.',
    palette: [
      { hex: '#f1ede3', name: 'Paper' },
      { hex: '#15140f', name: 'Ink' },
      { hex: '#e8431c', name: 'Signal' },
      { hex: '#8f5407', name: 'Product hue' },
    ],
    type: 'Fraunces (soft, wonky italics for names) · Instrument Sans · IBM Plex Mono labels',
    motion: 'Measured and mechanical: hairlines draw, plates settle flat, a receipt prints. Nothing bounces.',
    products: 'Five differently composed “plates”, an index-card drawer gallery, annotated captures with numbered pins, scroll-stepped tours, zoomable lightbox.',
    threeD: 'Exploded axonometric view of an application window — four SDF-shaded plates, orthographic camera, scan line; CSS-3D twin as fallback.',
    creative: [
      'Most ownable: nobody in the reference set looks like this',
      'Honest status labels read as rigour, not as apology',
      'Each product gets its own composition and hue without breaking the system',
    ],
    technical: [
      'Smallest WebGL budget of the three (≈10 draw calls)',
      'Works without WebGL at near-identical quality',
      'Mostly DOM: best accessibility, SEO and maintainability',
    ],
    risks: ['Quieter first impression than a full WebGL world', 'Relies on good real captures to reach full effect'],
    vars: { '--c-bg': '#f1ede3', '--c-ink': '#15140f', '--c-accent': '#ff7a55', '--c-rule': 'rgba(21,20,15,.18)' } as React.CSSProperties,
    fontClass: 'font-fraunces',
  },
  {
    no: '02',
    key: 'zaxis',
    name: 'Z-Axis',
    path: '/z-axis',
    idea: 'The Z in Zaylo is the depth axis. The homepage is one continuous flight through dark space; each product is a station at a depth coordinate, threaded by a single luminous line.',
    rationale:
      'It gives the brand a spatial signature — you don’t scroll down ZayloLabs, you travel into it. The zig-zag route between stations literally draws Z-strokes, and each product floods the scene with its own light, so a set of unrelated apps reads as one journey.',
    palette: [
      { hex: '#050608', name: 'Void' },
      { hex: '#eceee8', name: 'Bone' },
      { hex: '#d8ff45', name: 'Volt' },
      { hex: '#f5a93a', name: 'Station light' },
    ],
    type: 'Archivo at 125% width, heavy, uppercase · JetBrains Mono HUD',
    motion: 'Cinematic and continuous: scroll is velocity, windows materialise as the camera arrives, the HUD counts depth.',
    products: 'Dimensional application windows staged in 3D — a different arrangement at each station — passing in front of giant station names, with DOM copy and a station rail.',
    threeD: 'Full R3F scene: every window drawn in a fragment shader, floor grid, velocity-streaked dust, the drawn route line, pointer parallax. Static stacked layout as fallback.',
    creative: ['Highest immediate impact', 'A brand device (the Z route) that is unique to the name', 'Per-product light makes each station feel distinct'],
    technical: ['Custom GLSL throughout — the strongest engineering showpiece', 'Scene is lazy-loaded; text shell paints first', 'Reduced-motion and no-WebGL fallbacks'],
    risks: ['Heaviest on mobile GPUs and batteries', 'Dark immersive WebGL is the genre’s default — less differentiating', 'Hardest to extend to dense product pages'],
    vars: { '--c-bg': '#07080a', '--c-ink': '#eceee8', '--c-accent': '#d8ff45', '--c-rule': 'rgba(236,238,232,.2)' } as React.CSSProperties,
    fontClass: 'font-archivo',
  },
  {
    no: '03',
    key: 'studio-os',
    name: 'Studio OS',
    path: '/studio-os',
    idea: 'The website is the studio’s desktop. Visitors open, drag and focus application windows, launch from a dock and search with a command palette.',
    rationale:
      'Software is shown the way software is used. Real captures sit inside real window chrome, the non-linear layout invites exploration, and adding a product is as natural as adding an app to the dock.',
    palette: [
      { hex: '#2233e6', name: 'Cobalt' },
      { hex: '#f4f1e8', name: 'Cream' },
      { hex: '#0d0f1a', name: 'Ink' },
      { hex: '#ffd84a', name: 'Lemon' },
    ],
    type: 'Bricolage Grotesque display · DM Mono system labels',
    motion: 'Tactile and springy: windows open from the dock, drag with weight, settle into place.',
    products: 'Per-product windows with different shapes and inner layouts — wide desktop, phone, tabbed, terminal, widget.',
    threeD: 'Deliberately light: a raw-WebGL wallpaper field that bends around the pointer and ripples when windows land; depth comes from layered windows.',
    creative: ['Most playful and most “explorable”', 'Screenshots feel native in window chrome', 'Scales naturally as products are added'],
    technical: ['Rich interaction model: z-order, drag, palette, keyboard', 'Separate, purpose-built phone layout', 'Tiny GPU cost'],
    risks: ['Desktop metaphors are a known portfolio trope', 'No narrative order — visitors may miss the flagship story', 'Novelty can undercut “serious studio”'],
    vars: { '--c-bg': '#2233e6', '--c-ink': '#f4f1e8', '--c-accent': '#ffd84a', '--c-rule': 'rgba(244,241,232,.28)' } as React.CSSProperties,
    fontClass: 'font-bricolage',
  },
  {
    no: '04',
    key: 'plainview',
    name: 'Plain View',
    path: '/plain-view',
    idea: 'The middle ground. An ordinary page in plain words — what the studio is, every product, what each one covers and its real stage — with one lit display case beside the text that holds the product screens in depth.',
    rationale:
      'Made after the usefulness review. Specimen’s lab language (specimens, layers, catalogue numbers) makes visitors decode what the products are; Z-Axis makes them travel to find out. Plain View keeps what worked in each — Specimen’s calm, readable page and Z-Axis’s depth and per-product light — and drops the metaphor and the journey. Nothing has to be learned: the first screen names all five products, and the page reads top to bottom.',
    palette: [
      { hex: '#f3f4f0', name: 'Paper' },
      { hex: '#0f1216', name: 'Ink' },
      { hex: '#090c12', name: 'Case' },
      { hex: '#f5a93a', name: 'Product light' },
    ],
    type: 'Schibsted Grotesk throughout — heavy and tight for headings, regular for reading. No monospace, no codes.',
    motion: 'Quiet and purposeful: the case brings the product you are reading to the front, its floor slides forward, and it tilts a few degrees toward the pointer. The page itself just scrolls.',
    products: 'A five-row product list on the first screen; each product then gets the same plain facts — what it is, stage, availability, what it covers — and choosing a topic changes the screen shown in the case. A page per product from one template.',
    threeD: 'CSS 3D only: products stand one behind another in a perspective box, each in its own arrangement and light. No WebGL, so there is nothing to fall back from.',
    creative: ['Clearest of the four: no vocabulary to learn', 'The brand colour is the product being read, so each product owns its moment', 'One showpiece instead of a whole world — easy to live with'],
    technical: ['Lightest homepage of the four (213 kB on a phone)', 'No WebGL: identical on every device, nothing to degrade', 'Fewest moving parts — the simplest to maintain and extend'],
    risks: ['Least dramatic first impression of the four', 'Closest to a conventional product site, so least distinctive as a brand', 'Like the others, it needs real screenshots to reach full effect'],
    vars: { '--c-bg': '#f3f4f0', '--c-ink': '#0f1216', '--c-accent': '#f5a93a', '--c-rule': 'rgba(15,18,22,.2)' } as React.CSSProperties,
    fontClass: 'font-schibsted',
  },
]

const MATRIX: [string, number, number, number, number][] = [
  ['Brand originality', 5, 3, 4, 3],
  ['Professional credibility', 5, 4, 3, 5],
  ['First-impression impact', 4, 5, 4, 3],
  ['Product presentation', 5, 4, 4, 4],
  ['Creative use of 3D', 4, 5, 2, 3],
  ['Mobile experience', 5, 3, 4, 5],
  ['Accessibility', 5, 3, 3, 5],
  ['Performance budget', 5, 3, 5, 5],
  ['Maintainability & growth', 5, 3, 4, 5],
]

const RESEARCH = [
  ['Linear · Raycast', 'Real product UI does the heavy lifting; chrome is restrained and precise. Dark is their signature, so it cannot be ours.'],
  ['Vercel · Framer', 'A visible grid and one strong typographic voice carry the brand more than any illustration does.'],
  ['Metalab', 'Editorial pacing: each case study has its own composition and colour inside one system.'],
  ['Active Theory · Awwwards', 'WebGL lands when it is the idea, not a backdrop. Scrollytelling with restraint beats spectacle.'],
]

function Dots({ n }: { n: number }) {
  return (
    <span className="hub-dots" role="img" aria-label={`${n} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <i key={i} data-on={i <= n} />
      ))}
    </span>
  )
}

export default function CompareHub() {
  return (
    <div className="hub">
      <header className="hub-wrap hub-head">
        <p className="hub-mono">ZayloLabs · Creative direction · Stage 1 → 3</p>
        <h1>Four directions for one studio.</h1>
        <p className="hub-lede">
          Four working prototypes — different identities, layouts, motion and ways of presenting the products. Z-Axis was chosen and built out into a full site; after the
          usefulness review a fourth, Plain View, was added as the middle ground between Specimen and Z-Axis. All four have been reviewed and checked.
        </p>
        <nav className="hub-jump" aria-label="On this page">
          <a href="#concepts" onClick={jump('concepts')}>
            Concepts
          </a>
          <a href="#compare" onClick={jump('compare')}>
            Comparison
          </a>
          <a href="#check" onClick={jump('check')}>
            Usefulness check
          </a>
          <a href="#recommend" onClick={jump('recommend')}>
            Chosen direction
          </a>
          <a href="#review" onClick={jump('review')}>
            Quality review
          </a>
        </nav>
      </header>

      <main>
      <section className="hub-wrap" aria-labelledby="research-h">
        <h2 id="research-h" className="hub-mono">
          What the reference set taught us
        </h2>
        <div className="hub-research">
          {RESEARCH.map(([who, what]) => (
            <div key={who}>
              <b>{who}</b>
              <p>{what}</p>
            </div>
          ))}
        </div>
        <p className="hub-note">
          Deliberately avoided: purple gradients, floating spheres, glassmorphism, decorative charts, identical feature cards — and any invented screenshot, statistic, customer or
          availability claim.
        </p>
      </section>

      <section id="concepts" className="hub-wrap hub-concepts">
        {CONCEPTS.map((c) => (
          <article key={c.key} className="hub-concept" style={c.vars}>
            <Link to={c.path} className="hub-preview" aria-label={`Open the ${c.name} prototype`}>
              <span className="hub-shot">
                {shot(`${c.key}-desktop`) ? <img className="hub-preview-d" src={shot(`${c.key}-desktop`)} alt={`${c.name} — desktop homepage`} loading="lazy" /> : <span className="hub-preview-d" />}
                {shot(`${c.key}-mobile`) && <img className="hub-preview-m" src={shot(`${c.key}-mobile`)} alt={`${c.name} — mobile homepage`} loading="lazy" />}
              </span>
              <span className="hub-open">Open live prototype →</span>
            </Link>
            <div className="hub-body">
              <p className="hub-mono hub-accent">
                Concept {c.no}
                {c.key === 'zaxis' && ' · chosen'}
                {c.key === 'plainview' && ' · new — the middle ground'}
              </p>
              <h2 className={c.fontClass}>{c.name}</h2>
              <p className="hub-idea">{c.idea}</p>
              <p className="hub-rationale">{c.rationale}</p>
              <div className="hub-swatches" aria-label="Palette">
                {c.palette.map((s) => (
                  <span key={s.hex} title={`${s.name} ${s.hex}`}>
                    <i style={{ background: s.hex }} />
                    {s.name}
                  </span>
                ))}
              </div>
              <dl className="hub-specs">
                <div>
                  <dt>Typography</dt>
                  <dd>{c.type}</dd>
                </div>
                <div>
                  <dt>Motion</dt>
                  <dd>{c.motion}</dd>
                </div>
                <div>
                  <dt>Products</dt>
                  <dd>{c.products}</dd>
                </div>
                <div>
                  <dt>3D</dt>
                  <dd>{c.threeD}</dd>
                </div>
              </dl>
              <div className="hub-lists">
                <div>
                  <h3>Creative strengths</h3>
                  <ul>
                    {c.creative.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3>Technical strengths</h3>
                  <ul>
                    {c.technical.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3>Trade-offs</h3>
                  <ul>
                    {c.risks.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <Link className="hub-btn" to={c.path}>
                Open {c.name} →
              </Link>
            </div>
          </article>
        ))}
      </section>

      <section id="compare" className="hub-wrap" aria-labelledby="compare-h">
        <h2 id="compare-h">Side by side</h2>
        <div className="hub-table-wrap" tabIndex={0} role="region" aria-label="Reviewer scores table — scrolls sideways on small screens">
          <table className="hub-table">
            <thead>
              <tr>
                <th scope="col">Criterion</th>
                {CONCEPTS.map((c) => (
                  <th key={c.key} scope="col">
                    {c.no} {c.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MATRIX.map(([label, ...vals]) => (
                <tr key={label}>
                  <th scope="row">{label}</th>
                  {vals.map((v, i) => (
                    <td key={i}>
                      <Dots n={v} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="hub-note">Ratings are the designer’s own assessment of the homepage prototypes as first built, not user-test results. The independent results are in the next section.</p>
      </section>

      <section id="check" className="hub-wrap" aria-labelledby="check-h">
        <h2 id="check-h">Which one is the most useful?</h2>
        <div className="hub-cols">
          <p>
            Two checks were run on all four. An <b>independent reviewer</b> — a separate agent that was not told which direction anyone preferred — used each concept as a
            first-time visitor on desktop and phone. An <b>automated checker</b> performed the same visitor tasks by script and measured them.
          </p>
          <p>
            <b>Result: Plain View is the most useful, then Specimen, Z-Axis and Studio OS. Z-Axis is the most memorable; Plain View is the least.</b> Plain View and Specimen
            score the same, and Plain View ranks first because every task takes fewer steps. The reviewer’s summary of it: a visitor leaves knowing what ZayloLabs makes, and
            remembers little about the site itself.
          </p>
        </div>

        <h3 className="hub-mono hub-sub">Independent reviewer — scores out of 5, latest pass</h3>
        <div className="hub-table-wrap" tabIndex={0} role="region" aria-label="Checker measurements table — scrolls sideways on small screens">
          <table className="hub-table">
            <thead>
              <tr>
                <th scope="col">Criterion</th>
                {CONCEPTS.map((c) => (
                  <th key={c.key} scope="col">
                    {c.no} {c.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {REVIEWER.map(([label, ...vals]) => (
                <tr key={label}>
                  <th scope="row">{label}</th>
                  {vals.map((v, i) => (
                    <td key={i}>{v}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="hub-note">
          Z-Axis came last as first built and moved up after its homepage was fixed. Plain View was reviewed twice. The last fixes to each concept were confirmed by the
          checker but not reviewed independently again, and the first three were not re-reviewed after Plain View was added.
        </p>

        <h3 className="hub-mono hub-sub">Automated checker — measured on the current build (desktop / phone)</h3>
        <div className="hub-table-wrap" tabIndex={0} role="region" aria-label="Designer ratings table — scrolls sideways on small screens">
          <table className="hub-table">
            <thead>
              <tr>
                <th scope="col">Measure</th>
                {CONCEPTS.map((c) => (
                  <th key={c.key} scope="col">
                    {c.no} {c.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CHECKER.map(([label, ...vals]) => (
                <tr key={label}>
                  <th scope="row">{label}</th>
                  {vals.map((v, i) => (
                    <td key={i}>{v}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="hub-note">
          Not covered by either check: real phones and graphics hardware (everything ran in a software-rendered browser, so animation smoothness was not judged), screen
          readers, and real visitors. Studio OS was built as a single screen only; its missing addresses are partly a matter of scope.
        </p>
      </section>

      <section id="recommend" className="hub-wrap hub-recommend" aria-labelledby="rec-h">
        <p className="hub-mono hub-accent" style={{ '--c-accent': '#d8ff45' } as React.CSSProperties}>
          Chosen direction
        </p>
        <h2 id="rec-h">02 — Z-Axis, built into a full site.</h2>
        <div className="hub-cols">
          <p>
            Z-Axis was picked for its impact. The concern raised with the more experimental directions was ease of use, so the build keeps the fly-through as the homepage and
            makes everything around it ordinary to operate: the same plain menu on every page, a list of all work, a button from every station to its product page, arrow keys
            between stations, and a still, stacked version for anyone without WebGL or who prefers less motion.
          </p>
          <p>
            The flight’s motion carries into the other pages as the <b>depth stack</b>: captures sit one behind another and fly forward as you choose them. My original
            recommendation was <b>Specimen</b>; its full build is still here below for comparison.
          </p>
        </div>
        <h3 className="hub-mono">Z-Axis — the site</h3>
        <div className="hub-stage2 is-zx">
          {[
            ['/z-axis', 'Flight (home)', 'Scroll-driven flight through seven stations, with menu, station rail and links into every product'],
            ['/z-axis/work', 'Work', 'All products as rows on the axis with a live depth-stack preview and stage filters'],
            ['/z-axis/work/samvisionai', 'SamVisionAI', 'Flagship page: staged hero, focus flight through four capture slots, zoom, surfaces, status'],
            ['/z-axis/system', 'Design system', 'Tokens, type, components, depth stack, media kit, and how to add a product'],
          ].map(([to, title, note]) => (
            <Link key={to} to={to}>
              <b>{title} →</b>
              <span>{note}</span>
            </Link>
          ))}
        </div>
        <p className="hub-note">Every product has its own page from the same template — MyFamilyExpenses, GYST, CommandCenter and GauzeMate under /z-axis/work/….</p>
        <h3 className="hub-mono">New — 04 Plain View, the middle ground</h3>
        <div className="hub-stage2">
          {[
            ['/plain-view', 'Homepage', 'What the studio is, the five-product list, each product in plain words, and the display case that follows what you read'],
            ['/plain-view/products/samvisionai', 'SamVisionAI', 'Status at the top, topics that change the screen in the case, straight-on screens with enlarge, previous and next'],
            ['/plain-view/products/commandcenter', 'CommandCenter', 'The same template for an internal tool: screens withheld and said so'],
          ].map(([to, title, note]) => (
            <Link key={to} to={to}>
              <b>{title} →</b>
              <span>{note}</span>
            </Link>
          ))}
        </div>
        <h3 className="hub-mono">Also built out — 01 Specimen</h3>
        <div className="hub-stage2">
          {[
            ['/specimen', 'Homepage', 'Hero with exploded specimen, five product plates, practice, house rules, contact'],
            ['/specimen/work', 'Catalogue', 'Index-card drawer gallery, stage filters, table view with cursor preview'],
            ['/specimen/work/samvisionai', 'SamVisionAI', 'Interactive bench, annotated capture, workflow tour, surfaces, record'],
            ['/specimen/system', 'Design system', 'Tokens, type, components, media kit'],
          ].map(([to, title, note]) => (
            <Link key={to} to={to}>
              <b>{title} →</b>
              <span>{note}</span>
            </Link>
          ))}
        </div>
      </section>

      <section id="review" className="hub-wrap" aria-labelledby="review-h">
        <h2 id="review-h">Stage 3 — quality review of the Z-Axis build</h2>
        <div className="hub-review">
          {REVIEW.map(([k, score, note]) => (
            <div key={k}>
              <div className="hub-review-head">
                <b>{k}</b>
                <Dots n={score} />
              </div>
              <p>{note}</p>
            </div>
          ))}
        </div>
      </section>

      </main>
      <footer className="hub-wrap hub-foot hub-mono">Standalone design prototype · not deployed · placeholders are marked as placeholders</footer>
    </div>
  )
}

/** Independent reviewer, latest pass for each concept. Columns follow CONCEPTS. */
const REVIEWER: [string, string, string, string, string][] = [
  ['Clear at first glance', '5', '5', '4', '5'],
  ['Finding things', '5', '4', '4', '5'],
  ['Phone usability', '5', '4', '4', '5'],
  ['Keyboard usability', '5', '4', '4', '5'],
  ['Low risk of getting lost', '5', '4', '3', '5'],
  ['Rank — most useful', '2nd', '3rd', '4th', '1st'],
  ['Rank — most memorable', '3rd', '1st', '2nd', '4th'],
]

/** Scripted checker, current build. Values are desktop / phone unless noted. */
const CHECKER: [string, string, string, string, string][] = [
  ['Products named on the first screen', '1 / 1', '5 / 5 (was 1 / 0)', '1 / 3', '5 / 5'],
  ['Clicks to see all five named', '1 / 2', '0 / 0 (was 1 / 2)', '1 / 0', '0 / 0'],
  ['Clicks to SamVisionAI’s availability', '1 + a short scroll / 2 + a short scroll', '1 / 1 (was 1 / 2)', '0 / 1', '1 / 1'],
  ['Clicks to the contact panel', '1 / 2', '1 / 2', '1 / 1', '1 / 1'],
  ['Each product has its own address; Back works', 'Yes', 'Yes', 'No — on a phone, Back leaves the site', 'Yes'],
  ['Tab presses to reach SamVisionAI', '4', '5', '14', '6'],
  ['Accessibility failures (axe), homepage', 'None / none', 'None / none (was none / 1)', '3 kinds / 2 kinds', 'None / none'],
  ['Phone controls at least 44px', '41%', '54% (was 5%)', '74%', '83%'],
  ['Homepage download on a phone', '242 kB', '544 kB', '337 kB', '213 kB'],
  ['First content on slow 4G (simulated)', '2.2 s', '1.9 s', '1.8 s', '1.9 s'],
  ['Homepage length', '10 screens', '10 screens', '1 screen', '7 screens'],
]

const REVIEW: [string, number, string][] = [
  ['Brand originality', 4, 'The Z route, depth readouts and per-product light are specific to the name. Dark WebGL itself is a familiar genre.'],
  ['Professional credibility', 4, 'Confident and engineered; honest stage labels throughout. Real captures and a contact channel are still needed.'],
  ['Visual impact', 5, 'Giant wide type you fly through, shader-drawn windows, a scene that changes colour at every station.'],
  ['Typography & composition', 4, 'Two voices only — very wide caps and a mono readout. Long product names limit how large the type can go on phones.'],
  ['Creative use of 3D', 5, 'Custom GLSL for windows, floor, dust and route line; the same motion reused as a CSS depth stack on other pages.'],
  ['Animation smoothness', 3, 'Not yet measured on a real GPU or phone — only in slow software rendering. This is the main open risk.'],
  ['Product presentation', 4, 'A different window arrangement per product, stepped capture slots, zoom. Capped by placeholder imagery for now.'],
  ['Ease of use', 4, 'Plain menu on every page, list view of all work, a button from each station, arrow keys, no dead ends. Untested with real visitors.'],
  ['Mobile usability', 4, 'Stacked layout, full-screen menu, no sideways scrolling on any page. Small phones are tight at the busiest stations.'],
  ['Accessibility', 4, 'Automated checks pass on all pages; keyboard reachable; reduced-motion visitors get a still page. The flight itself is a visual experience by nature.'],
  ['Loading performance', 3, 'The homepage needs the 3D library (about 243 KB compressed) after its text appears; other pages load none of it.'],
  ['Code maintainability', 4, 'One product catalogue and one media folder feed every page. A custom station layout is optional, not required.'],
]

function jump(id: string) {
  return (e: React.MouseEvent) => {
    e.preventDefault()
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
