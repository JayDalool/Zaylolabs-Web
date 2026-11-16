/**
 * Product page — one template for every product.
 *
 * Header and plain facts, the screen viewer (choose a topic, see its screen),
 * the step-by-step demo, where it runs, and a status block. The whole page is
 * in the app's colours. A new product needs one catalogue entry, a folder of
 * screenshots when they exist, and optionally a demo script.
 */
import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { productBySlug, products, type Product } from '../data/products'
import { hasRealMedia } from '../media/manifest'
import { PhoneFrame, ProductMedia, ProductVideo, WindowFrame } from '../media/ProductMedia'
import { BASE, Fig, hueVars, Reveal, SectionHead, StageBadge, Tag } from './ui'
import { useImmerse } from './immerse'
import { Viewer } from './Viewer'
import { DemoSection } from './demo/Demo'

function Surfaces({ product }: { product: Product }) {
  const desktop = product.surfaces.includes('desktop')
  const mobile = product.surfaces.includes('mobile')
  return (
    <div style={{ display: 'grid', gap: 'clamp(2rem, 4vw, 4rem)' }}>
      <div className="sp-surfaces" style={!desktop || !mobile ? { gridTemplateColumns: 'minmax(0, 1fr)' } : undefined}>
        {desktop && (
          <Reveal>
            <WindowFrame title={`${product.name} — desktop`}>
              <ProductMedia product={product} surface="desktop" slot={2} />
            </WindowFrame>
            <div style={{ marginTop: '0.8rem' }}>
              <Fig n="C">Desktop surface</Fig>
            </div>
          </Reveal>
        )}
        {mobile && (
          <Reveal delay={0.1} style={{ width: '100%', maxWidth: desktop ? undefined : '18rem', minWidth: 0, justifySelf: desktop ? undefined : 'start' }}>
            <div style={{ maxWidth: '16rem' }}>
              <PhoneFrame>
                <ProductMedia product={product} surface="mobile" slot={1} />
              </PhoneFrame>
            </div>
            <div style={{ marginTop: '0.8rem' }}>
              <Fig n="D">Mobile surface</Fig>
            </div>
          </Reveal>
        )}
      </div>
      <Reveal>
        <div style={{ border: '1px solid var(--ink)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
          <ProductVideo product={product} label="interface walkthrough" />
        </div>
        <div style={{ marginTop: '0.8rem' }}>
          <Fig n="E">Interface video</Fig>
        </div>
      </Reveal>
    </div>
  )
}

function Record({ product }: { product: Product }) {
  const real = hasRealMedia(product.slug)
  const rows: [string, string][] = [
    ['Stage', product.stageLabel],
    ['Availability', product.availability],
    ['Surfaces', product.surfaces.join(' + ')],
    ['Captures on this page', real ? 'Genuine application captures. Empty slots are marked placeholders.' : 'Placeholder schematics only — no real capture has been added yet.'],
    ['Data shown', 'No customer information, credentials or internal operational detail.'],
  ]
  if (product.caution) rows.push(['Note', product.caution])
  return (
    <dl style={{ margin: 0, borderTop: '1px solid var(--ink)' }}>
      {rows.map(([k, v]) => (
        <div key={k} className="sp-grid" style={{ padding: '1rem 0', borderBottom: '1px solid var(--rule)', rowGap: '0.3rem' }}>
          <dt className="sp-mono sp-mono-dim col-span-12 md:col-span-3">{k}</dt>
          <dd className="col-span-12 md:col-span-9" style={{ margin: 0, maxWidth: '44em' }}>
            {v}
          </dd>
        </div>
      ))}
    </dl>
  )
}

export default function ProductPage() {
  const { slug } = useParams()
  const product = productBySlug(slug)
  useEffect(() => {
    if (product) document.title = `${product.name} — ZayloLabs (prototype)`
    return () => void (document.title = 'ZayloLabs — design prototype')
  }, [product])
  // An app's own page is in that app's colours throughout; the hook only tracks the pointer for the light.
  const { ref } = useImmerse<HTMLElement>()

  if (!product) {
    return (
      <div className="sp-wrap" style={{ paddingBlock: '6rem', minHeight: '60vh' }}>
        <h1 className="sp-h2">There is no product at that address.</h1>
        <p className="sp-body" style={{ marginTop: '1rem' }}>
          <Link className="sp-link" to={`${BASE}/work`}>
            Back to all products
          </Link>
        </p>
      </div>
    )
  }

  const next = products[(products.indexOf(product) + 1) % products.length]

  return (
    <article key={product.slug} ref={ref} className="sp-immersive sp-immersive-field sp-product" data-hue="" data-immersed="" style={hueVars(product)}>
      <header className="sp-wrap" style={{ paddingBlock: 'clamp(1.5rem, 4vw, 3.5rem) clamp(2rem, 4vw, 3.5rem)' }}>
        <nav aria-label="Breadcrumb" className="sp-mono" style={{ display: 'flex', gap: '0.6rem', marginBottom: 'clamp(1.5rem, 4vw, 3rem)' }}>
          <Link className="sp-link" to={`${BASE}/work`} viewTransition>
            Products
          </Link>
          <span className="sp-mono-dim">/</span>
          <span style={{ color: 'var(--hue-ink)' }}>{product.name}</span>
        </nav>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.2rem' }}>
          <Tag>{product.discipline}</Tag>
          <StageBadge product={product} />
        </div>
        <h1 className="sp-name" style={{ fontSize: `min(12.5rem, 12.5vw, ${(150 / product.name.length).toFixed(2)}vw)`, overflowWrap: 'anywhere' }}>
          {product.name}
        </h1>
        <div className="sp-grid" style={{ marginTop: 'clamp(1.5rem, 3vw, 2.6rem)', rowGap: '1rem' }}>
          <p className="sp-h3 col-span-12 lg:col-span-5" style={{ fontSize: 'clamp(1.4rem, 2.4vw, 2.2rem)', fontWeight: 380 }}>
            {product.tagline}
          </p>
          <p className="sp-lede col-span-12 lg:col-span-6 lg:col-start-7">{product.summary}</p>
        </div>
      </header>

      <div className="sp-wrap">
        {/* The plain facts come before anything to look at. */}
        <dl className="sp-meta" style={{ marginBottom: 'clamp(1.6rem, 3vw, 2.6rem)' }}>
          {(
            [
              ['What it is', product.discipline],
              ['Stage', product.stageLabel],
              ['Availability', product.availability],
              ['Made for', product.surfaces.map((x) => (x === 'mobile' ? 'phone' : x)).map((x, i) => (i ? x : x[0].toUpperCase() + x.slice(1))).join(' and ')],
            ] as const
          ).map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        <Viewer product={product} />
      </div>

      <DemoSection product={product} />

      <section className="sp-section" aria-labelledby="surfaces-h">
        <div className="sp-wrap">
          <SectionHead
            label="Surfaces"
            title={
              <span id="surfaces-h">
                Where it <em>runs.</em>
              </span>
            }
          />
          <Surfaces product={product} />
        </div>
      </section>

      <section className="sp-section" aria-labelledby="record-h">
        <div className="sp-wrap">
          <SectionHead
            label="Record"
            title={
              <span id="record-h">
                Status, <em>stated plainly.</em>
              </span>
            }
          />
          <Record product={product} />
        </div>
      </section>

      <div className="sp-wrap">
        <Link className="sp-next sp-immerse-hover" to={`${BASE}/work/${next.slug}`} data-hue="" style={hueVars(next)}>
          <span className="sp-mono">
            <span style={{ color: 'var(--hue-ink)' }}>Next product</span> <span className="sp-mono-dim">— {next.discipline} · {next.stageLabel}</span>
          </span>
          <span className="sp-name">{next.name}</span>
        </Link>
      </div>
    </article>
  )
}
