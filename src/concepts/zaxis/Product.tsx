/**
 * Product page — reusable for every product on the axis.
 *
 * Hero (the product's own window arrangement), a focus flight (one capture
 * slot per focus area, stepped by scroll or click), straight-on surfaces for
 * reading captures, a plain status table, and the next station.
 */
import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { productBySlug, products, type Product } from '../../data/products'
import { hasRealMedia } from '../../media/manifest'
import { ProductGlyph, ProductVideo } from '../../media/ProductMedia'
import { ZoomDialog } from '../../media/ZoomDialog'
import { FitName, useFitNames } from './Copy'
import { Badge, depthOf, DepthStack, Frame, hueStyle, PageShell, SectionHead, two, ZoomButton, ZX } from './kit'
import { Stage } from './Static'
import { stepHeadings } from './showcase'
import './pages.css'

function Hero({ product }: { product: Product }) {
  const n = products.indexOf(product) + 1
  return (
    <section className="zx-p-hero" aria-labelledby="zx-p-h">
      <p className="zx-p-crumb">
        <Link to={`${ZX}/work`} viewTransition>
          Work
        </Link>
        <span aria-hidden="true">/</span>
        <span>
          Station {two(n)} of {two(products.length)}
        </span>
        <b>{depthOf(product)}</b>
      </p>
      <h1 id="zx-p-h" className="zx-p-name" data-fit={0.92} data-max={0.3}>
        <FitName name={product.name} alias={product.alias} />
      </h1>
      <div className="zx-p-body">
        <div className="zx-p-copy">
          <p className="zx-meta">
            <span className="zx-meta-glyph">
              <ProductGlyph motif={product.motif} size={18} />
            </span>
            <span>{product.catalog}</span>
            <span className="zx-dim">{product.discipline}</span>
            <Badge product={product} />
          </p>
          <p className="zx-tagline">{product.tagline}</p>
          <p className="zx-summary">{product.summary}</p>
          <p className="zx-avail">
            <span className="zx-avail-key">Availability</span>
            {product.availability}
          </p>
          {product.caution && <p className="zx-caution">{product.caution}</p>}
        </div>
        <Stage product={product} />
      </div>
    </section>
  )
}

/** One capture slot per focus area. Scrolling (or the ticks) flies from one to the next. */
function FocusFlight({ product }: { product: Product }) {
  const [active, setActive] = useState(0)
  const [zoom, setZoom] = useState(false)
  const steps = useRef<(HTMLElement | null)[]>([])
  const headings = stepHeadings[product.slug]
  const surface = product.primarySurface
  const restricted = product.stage === 'internal'

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.i))
      },
      { rootMargin: '-46% 0px -46% 0px' },
    )
    steps.current.forEach((el) => el && io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <div className="zx-ff">
      <div className="zx-ff-media">
        <div style={{ position: 'relative' }}>
          <DepthStack items={product.focus} active={active} surface={surface} getKey={(f) => f.title}>
            {(f, i) => <Frame product={product} surface={surface} slot={i + 1} label={f.title} restricted={restricted} />}
          </DepthStack>
          {!restricted && <ZoomButton onClick={() => setZoom(true)} />}
        </div>
        <div className="zx-ff-ticks">
          {product.focus.map((f, i) => (
            <button
              type="button"
              key={f.title}
              aria-label={`Go to ${two(i + 1)}: ${f.title}`}
              aria-current={i === active ? 'step' : undefined}
              onClick={() => steps.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
            >
              <span />
            </button>
          ))}
        </div>
        <p className="zx-ds-caption">
          <span>
            <b>{surface}-{two(active + 1)}</b> · {product.focus[active].title}
          </span>
          <span>
            {two(active + 1)} / {two(product.focus.length)}
          </span>
        </p>
      </div>
      <ol>
        {product.focus.map((f, i) => (
          <li key={f.title} ref={(el) => void (steps.current[i] = el)} data-i={i} className={`zx-ff-step ${i === active ? 'is-active' : ''}`}>
            <p className="zx-p-key">
              {two(i + 1)} — {f.title}
            </p>
            <h3>{headings?.[i] ?? f.title}</h3>
            <p>{f.note}</p>
          </li>
        ))}
      </ol>
      {zoom && <ZoomDialog product={product} surface={surface} slot={active + 1} label={product.focus[active].title} onClose={() => setZoom(false)} />}
    </div>
  )
}

function Surfaces({ product }: { product: Product }) {
  const [zoom, setZoom] = useState<'desktop' | 'mobile' | null>(null)
  const desktop = product.surfaces.includes('desktop')
  const mobile = product.surfaces.includes('mobile')
  const restricted = product.stage === 'internal'
  return (
    <>
      <div className="zx-surfaces" data-both={desktop && mobile ? '' : undefined}>
        {desktop && (
          <figure>
            <Frame product={product} surface="desktop" slot={1} restricted={restricted} />
            {!restricted && <ZoomButton onClick={() => setZoom('desktop')} />}
            <figcaption>Desktop</figcaption>
          </figure>
        )}
        {mobile && (
          <figure data-surface="mobile">
            <Frame product={product} surface="mobile" slot={1} />
            <figcaption>Mobile</figcaption>
          </figure>
        )}
      </div>
      <figure className="zx-video">
        <div>
          <ProductVideo product={product} label="interface walkthrough" />
        </div>
        <figcaption>Interface video</figcaption>
      </figure>
      {zoom && <ZoomDialog product={product} surface={zoom} slot={1} onClose={() => setZoom(null)} />}
    </>
  )
}

function Status({ product }: { product: Product }) {
  const rows: [string, string][] = [
    ['Stage', product.stageLabel],
    ['Availability', product.availability],
    ['Runs on', product.surfaces.join(' + ')],
    ['Images on this page', hasRealMedia(product.slug) ? 'Genuine application captures. Empty slots are marked placeholders.' : 'Placeholder schematics only — no real capture has been added yet.'],
    ['Data shown', 'No customer information, credentials or internal operational detail.'],
  ]
  if (product.caution) rows.push(['Note', product.caution])
  return (
    <dl className="zx-p-table">
      {rows.map(([k, v]) => (
        <div key={k}>
          <dt>{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  )
}

export default function ProductPage() {
  const { slug } = useParams()
  const product = productBySlug(slug)
  const root = useRef<HTMLDivElement>(null)
  useFitNames(root, slug)
  useEffect(() => {
    if (product) document.title = `${product.name} — ZayloLabs (prototype)`
  }, [product])

  if (!product) {
    return (
      <PageShell readout="Z  ——">
        <section className="zx-p-hero" style={{ minHeight: '60vh' }}>
          <h1 className="zx-h">No station at that coordinate.</h1>
          <p style={{ marginTop: '1.2rem' }}>
            <Link className="zx-open" to={`${ZX}/work`} viewTransition>
              Back to work <span aria-hidden="true">→</span>
            </Link>
          </p>
        </section>
      </PageShell>
    )
  }
  const next = products[(products.indexOf(product) + 1) % products.length]

  return (
    <PageShell readout={depthOf(product)} hue={product.hue.bright}>
      <article key={product.slug} ref={root}>
        <Hero product={product} />

        <section className="zx-p-section" aria-label="What it covers">
          <SectionHead k="01 — Focus" title="What it covers" />
          <FocusFlight product={product} />
        </section>

        <section className="zx-p-section" aria-label="Where it runs">
          <SectionHead k="02 — Surfaces" title="Where it runs" />
          <Surfaces product={product} />
        </section>

        <section className="zx-p-section" aria-label="Status">
          <SectionHead k="03 — Status" title="Where it stands" />
          <Status product={product} />
        </section>

        <Link className="zx-next" to={`${ZX}/work/${next.slug}`} style={hueStyle(next)}>
          <span className="zx-p-crumb" style={{ margin: 0 }}>
            <span>Next station</span>
            <b>{depthOf(next)}</b>
            <span>{next.stageLabel}</span>
          </span>
          <span className="zx-p-name" data-fit={0.8} data-max={0.2}>
            <FitName name={next.name} />
          </span>
        </Link>
      </article>
    </PageShell>
  )
}
