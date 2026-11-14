/** Living reference for the Z-Axis design system. Everything shown is the real component. */
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { products } from '../../data/products'
import { ProductGlyph, ProductVideo } from '../../media/ProductMedia'
import { useFitNames } from './Copy'
import { Badge, depthOf, DepthStack, Frame, hueStyle, PageShell, ZX } from './kit'
import './pages.css'

function Block({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <section className="zx-sys-block">
      <div>
        <h2>{title}</h2>
        {note && <p>{note}</p>}
      </div>
      <div className="zx-sys-body">{children}</div>
    </section>
  )
}

const CORE = [
  ['Void', '#050608', '--zx-void · ground'],
  ['Panel', '#0c0e11', '--frame-bg · windows'],
  ['Bone', '#eceee8', '--zx-bone · text'],
  ['Dim', 'rgba(236,238,232,.6)', '--zx-dim · secondary'],
  ['Volt', '#d8ff45', '--zx-volt · studio accent'],
] as const

const TYPE: [string, string, CSSProperties, string][] = [
  ['Display', 'Archivo 900 · width 125% · caps · −3.5%', { fontWeight: 900, fontStretch: '125%', fontSize: 'clamp(2.4rem, 7vw, 6rem)', lineHeight: 0.88, letterSpacing: '-0.035em', textTransform: 'uppercase' }, 'Station'],
  ['Heading', 'Archivo 800 · width 122% · caps', { fontWeight: 800, fontStretch: '122%', fontSize: 'clamp(1.6rem, 3.6vw, 3rem)', lineHeight: 0.95, letterSpacing: '-0.025em', textTransform: 'uppercase' }, 'What it covers'],
  ['Tagline', 'Archivo 700 · width 112%', { fontWeight: 700, fontStretch: '112%', fontSize: 'clamp(1.3rem, 2.2vw, 2rem)', lineHeight: 1.08 }, 'Property analysis that ends in a decision.'],
  ['Body', 'Archivo 400 · width 100% · 16/24', { fontSize: '1rem', color: 'rgba(236,238,232,.84)' }, 'Describe only what the product actually is.'],
  ['Readout', 'JetBrains Mono 500 · +10% · caps', { fontFamily: 'var(--font-jetbrains)', fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500 }, 'Z −030.00 · STN 01/06 · In development'],
]

const ADD = `// 1 — src/data/products.ts: add the product (see the comment at the top of that file)

// 2 — optional: give it its own arrangement of windows in the flight
//     src/concepts/zaxis/stations.ts → LAYOUTS
newproduct: {
  panes: [
    { surface: 'desktop', slot: 1, w: 5.4, pos: [0, 0.3, 0] },
    { surface: 'mobile',  slot: 1, w: 1.2, pos: [2.7, -0.7, 1.1], rot: [0, 0.22, 0], delay: 0.1 },
  ],
},
// Without an entry it gets one window (or handset) and still appears everywhere:
// flight station, work index, its own page, the station rail.

// 3 — drop captures in; placeholders render until you do
src/assets/products/newproduct/desktop/01-overview.png
src/assets/products/newproduct/mobile/01-home.png`

export default function System() {
  const root = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const sam = products[0]
  useFitNames(root)
  useEffect(() => {
    document.title = 'Design system — ZayloLabs (prototype)'
  }, [])

  return (
    <PageShell readout="Z  SYSTEM">
      <div ref={root} style={{ paddingBottom: 'clamp(4rem, 9vw, 8rem)' }}>
        <section className="zx-g-hero" aria-labelledby="zx-sys-h">
          <p className="zx-p-key">Design system</p>
          <h1 id="zx-sys-h" className="zx-p-name" data-fit={0.72} data-max={0.3}>
            <span className="zx-fit">
              Sys<em>tem</em>
            </span>
          </h1>
          <p className="zx-lede" style={{ marginTop: 'clamp(1.5rem, 3vw, 2.5rem)' }}>
            One axis, one dark ground, one studio accent. Each product brings its own light. Type is either very wide and heavy, or a small mono readout — nothing in between
            competes with the captures.
          </p>
        </section>

        <Block title="Principles" note="What every page holds to.">
          <ul className="zx-practice" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(13rem, 1fr))' }}>
            {[
              ['Depth is the brand', 'Things arrive from far away and pass the viewer. Nothing slides in sideways.'],
              ['Easy first', 'A plain menu on every page, real links, arrow keys between stations, and a list view of everything.'],
              ['Light belongs to products', 'Volt is the studio. Inside a product, its hue takes over glow, rules and badges.'],
              ['Never fake it', 'An empty capture slot shows a stamped schematic, never an invented interface.'],
            ].map(([t, n], i) => (
              <li key={t}>
                <span className="zx-practice-n">0{i + 1}</span>
                <strong>{t}</strong>
                <span>{n}</span>
              </li>
            ))}
          </ul>
        </Block>

        <Block title="Colour" note="Text colours pass WCAG AA on the void. Product hues are used as light: glows, rules, badges and schematic accents.">
          <div className="zx-swatches">
            {CORE.map(([n, v, t]) => (
              <div key={n} className="zx-swatch">
                <i style={{ background: v }} />
                <div>
                  {n}
                  <span>{t}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="zx-sys-label">Product light</p>
          <div className="zx-swatches">
            {products.map((p) => (
              <div key={p.slug} className="zx-swatch">
                <i style={{ background: p.hue.bright, boxShadow: `0 0 40px -6px ${p.hue.bright}` }} />
                <div>
                  {p.name}
                  <span>{p.hue.bright}</span>
                </div>
              </div>
            ))}
          </div>
        </Block>

        <Block title="Type" note="Archivo with its width axis for everything read; JetBrains Mono for readouts and labels. Self-hosted, latin subset.">
          <div>
            {TYPE.map(([name, spec, style, sample]) => (
              <div key={name} className="zx-typerow">
                <span className="zx-sys-label">
                  {name}
                  <br />
                  {spec}
                </span>
                <span style={style}>{sample}</span>
              </div>
            ))}
          </div>
        </Block>

        <Block title="Labels & actions" note="Stage is always a word in a box, never colour alone.">
          <div className="zx-row">
            {products
              .filter((p, i, a) => a.findIndex((q) => q.stage === p.stage) === i)
              .map((p) => (
                <span key={p.stage} style={hueStyle(p)}>
                  <Badge product={p} />
                </span>
              ))}
            <span className="zx-readout">
              <span className="zx-readout-depth">{depthOf(sam)}</span>
              <span className="zx-readout-stn">STN 01/06</span>
            </span>
          </div>
          <div className="zx-row">
            <Link className="zx-open" to={`${ZX}/work`} viewTransition>
              Product action <span aria-hidden="true">→</span>
            </Link>
            <button type="button" className="zx-btn">
              Studio action <span aria-hidden="true">↑</span>
            </button>
            <button type="button" className="zx-chip" aria-pressed="true">
              Chip on
            </button>
            <button type="button" className="zx-chip" aria-pressed="false">
              Chip off
            </button>
          </div>
          <ul className="zx-focus" style={{ marginTop: 0 }}>
            {sam.focus.map((f) => (
              <li key={f.title}>{f.title}</li>
            ))}
          </ul>
          <div className="zx-row" style={{ gap: '1.6rem' }}>
            {products.map((p) => (
              <span key={p.slug} className="zx-sys-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: p.hue.bright }}>
                <ProductGlyph motif={p.motif} size={24} /> {p.motif}
              </span>
            ))}
          </div>
        </Block>

        <Block title="Depth stack" note="The flight’s motion as a component: items sit behind one another on Z; the chosen one comes forward and earlier ones fly past. Used on the work index and every product page.">
          <div className="zx-chips" role="group" aria-label="Choose a product">
            {products.map((p, i) => (
              <button type="button" key={p.slug} className="zx-chip" aria-pressed={i === active} onClick={() => setActive(i)}>
                {p.name}
              </button>
            ))}
          </div>
          <div style={{ maxWidth: '44rem', ...hueStyle(products[active]) }}>
            <DepthStack items={products} active={active} getKey={(p) => p.slug}>
              {(p) => (
                <div className={p.primarySurface === 'mobile' ? 'zx-ds-phone' : undefined} style={hueStyle(p)}>
                  <Frame product={p} restricted={p.stage === 'internal'} />
                </div>
              )}
            </DepthStack>
          </div>
        </Block>

        <Block title="Media kit" note="Frame, ProductMedia and ProductVideo. Slots fill from src/assets/products/<slug>/ in filename order; the same files texture the 3D windows in the flight.">
          <div className="zx-surfaces" data-both="" style={hueStyle(sam)}>
            <figure>
              <Frame product={sam} surface="desktop" />
              <figcaption>Window · desktop slot</figcaption>
            </figure>
            <figure>
              <Frame product={sam} surface="mobile" />
              <figcaption>Handset · mobile slot</figcaption>
            </figure>
          </div>
          <figure className="zx-video" style={{ marginTop: 0, maxWidth: '36rem' }}>
            <div>
              <ProductVideo product={sam} />
            </div>
            <figcaption>Empty video slot — says so</figcaption>
          </figure>
        </Block>

        <Block title="Motion" note="Removed entirely under prefers-reduced-motion, where the flight becomes a still, stacked page.">
          <div className="zx-swatches">
            {[
              ['Travel', 'scroll = position on Z · dwell at stations'],
              ['Arrive', '850 ms · cubic-bezier(.2,.7,.2,1)'],
              ['Respond', '200–350 ms · hover, press'],
              ['Keys', '← → step stations · Tab reaches all'],
            ].map(([n, v]) => (
              <div key={n} className="zx-swatch">
                <div>
                  {n}
                  <span>{v}</span>
                </div>
              </div>
            ))}
          </div>
        </Block>

        <Block title="Adding a product" note="One catalogue entry puts it on the axis. A layout and captures are optional extras.">
          <pre className="zx-code" tabIndex={0}>
            {ADD}
          </pre>
        </Block>
      </div>
    </PageShell>
  )
}
