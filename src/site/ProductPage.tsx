/**
 * Product page — one template for every product.
 *
 * Header and plain facts, the screen viewer (choose a topic, see its screen)
 * and the step-by-step demo. Each fact is stated once. The whole page is in
 * the app's colours. A new product needs one catalogue entry, a folder of
 * screenshots, and a demo script.
 */
import { useEffect, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { productBySlug, products, type Product } from '../data/products'
import { hasRealMedia } from '../media/manifest'
import { PhoneFrame, ProductMedia, WindowFrame } from '../media/ProductMedia'
import { BASE, ButtonLink, Fig, hueVars, StageBadge } from './ui'
import { useImmerse } from './immerse'
import { Viewer } from './Viewer'
import { DemoSection } from './demo/Demo'

/** A compact product shows one real screenshot, on both devices, instead of the full viewer. */
function OneFigure({ product }: { product: Product }) {
  if (!hasRealMedia(product.slug)) return null
  return (
    <figure style={{ margin: 0 }}>
      <div className="sp-surfaces">
        <WindowFrame title={product.name}>
          <ProductMedia product={product} surface="desktop" slot={1} label={product.focus[0]?.title} priority />
        </WindowFrame>
        <div style={{ maxWidth: '16rem', width: '100%' }}>
          <PhoneFrame>
            <ProductMedia product={product} surface="mobile" slot={1} label={product.focus[0]?.title} />
          </PhoneFrame>
        </div>
      </div>
      {product.figure && (
        <div style={{ marginTop: '0.9rem' }}>
          <Fig n="A">{product.figure}</Fig>
        </div>
      )}
    </figure>
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
  const facts: [string, ReactNode][] = [
    ['What it is', product.discipline],
    ['Stage', <StageBadge key="stage" product={product} />],
    ['Availability', product.availability],
    ['Made for', product.surfaces.map((x) => (x === 'mobile' ? 'phone' : x)).map((x, i) => (i ? x : x[0].toUpperCase() + x.slice(1))).join(' and ')],
  ]

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
        <h1 className="sp-name" style={{ fontSize: `min(12.5rem, 12.5vw, ${(150 / product.name.length).toFixed(2)}vw)`, overflowWrap: 'anywhere' }}>
          {product.name}
        </h1>
        <div className="sp-grid" style={{ marginTop: 'clamp(1.5rem, 3vw, 2.6rem)', rowGap: '1rem' }}>
          <p className="sp-h3 col-span-12 lg:col-span-5" style={{ fontSize: 'clamp(1.4rem, 2.4vw, 2.2rem)', fontWeight: 380 }}>
            {product.tagline}
          </p>
          <p className="sp-lede col-span-12 lg:col-span-6 lg:col-start-7">{product.summary}</p>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginTop: 'clamp(1.2rem, 2.4vw, 2rem)' }}>
          <ButtonLink to="#demo" viewTransition={false}>
            Watch the demo
          </ButtonLink>
          {product.stage === 'live' && (
            <ButtonLink ghost to={`${BASE}/work/${product.slug}/plans`}>
              Plans and access
            </ButtonLink>
          )}
        </div>
      </header>

      <div className="sp-wrap">
        {/* The plain facts come before anything to look at. */}
        <dl className="sp-meta" style={{ marginBottom: 'clamp(1.2rem, 2.4vw, 2rem)' }}>
          {facts.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        {product.note && <p className="sp-product-note">{product.note}</p>}
        {product.compact ? <OneFigure product={product} /> : <Viewer product={product} />}
      </div>

      <DemoSection product={product} />

      <div className="sp-wrap">
        <Link className="sp-next sp-immerse-hover" to={`${BASE}/work/${next.slug}`} data-hue="" style={hueVars(next)}>
          <span className="sp-mono">
            <span style={{ color: 'var(--hue-ink)' }}>Next product</span> <span className="sp-mono-dim">— {next.discipline}</span>
          </span>
          <span className="sp-name">{next.name}</span>
        </Link>
      </div>
    </article>
  )
}
