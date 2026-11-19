/**
 * Product page — one template for every product.
 *
 * Header and plain facts, the screen viewer (choose a topic, see its screen)
 * and the step-by-step demo. Each fact is stated once. The whole page is in
 * the app's colours. A new product needs one catalogue entry, a folder of
 * screenshots, and a demo script.
 */
import type { ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { productBySlug, products, type Product } from '../data/products'
import { hasRealMedia } from '../media/manifest'
import { PhoneFrame, ProductMedia, WindowFrame } from '../media/ProductMedia'
import { NotFound } from './NotFound'
import { Arrow, BASE, ButtonLink, Fig, hueVars, SectionHead, StageBadge, useTitle } from './ui'
import { useImmerse } from './immerse'
import { AppMark } from './AppMark'
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
  useTitle(product ? `${product.name} — ${product.discipline.toLowerCase()}` : 'Not found')
  // An app's own page is in that app's colours throughout; the hook only tracks the pointer for the light.
  const { ref } = useImmerse<HTMLElement>()

  if (!product) return <NotFound />

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
              Access and pricing
            </ButtonLink>
          )}
          {product.signIn && (
            <a className="sp-btn sp-btn-ghost" href={product.signIn} rel="noopener">
              Sign in
              <Arrow />
            </a>
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
        <section className="pp-does" aria-labelledby="does-h">
          <h2 id="does-h" className="sp-h2">
            What it <em>does.</em>
          </h2>
          <ul className="pp-highlights">
            {product.highlights.map((h) => (
              <li key={h.title}>
                <h3>{h.title}</h3>
                <p>{h.body}</p>
              </li>
            ))}
          </ul>
        </section>
        {product.compact ? <OneFigure product={product} /> : <Viewer product={product} />}
      </div>

      <DemoSection product={product} />

      <section className="sp-section" aria-labelledby="know-h">
        <div className="sp-wrap pp-know">
          <div>
            <SectionHead
              label="Good to know"
              title={
                <span id="know-h">
                  Before you <em>ask for it.</em>
                </span>
              }
            />
            <ul className="pp-know-list">
              {product.goodToKnow.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>
          {product.stage === 'live' && (
            <aside className="pp-access" aria-label={`Access to ${product.name}`}>
              <StageBadge product={product} />
              <p className="sp-h3">{product.availability}</p>
              <p className="sp-body">Pricing is given on request.</p>
              <ButtonLink to={`${BASE}/work/${product.slug}/plans#access`}>Request access</ButtonLink>
              {product.signIn && (
                <p className="sp-body">
                  Already have an account?{' '}
                  <a className="sp-link" href={product.signIn} rel="noopener">
                    Sign in to {product.name}
                  </a>
                </p>
              )}
            </aside>
          )}
        </div>
      </section>

      {/* The way on to the next app: a quiet strip in this page's own colours, with that app's mark and lettering. */}
      <div className="sp-wrap sp-next-wrap">
        <Link className="sp-next" to={`${BASE}/work/${next.slug}`} viewTransition>
          <span className="sp-mono sp-next-label">Next app</span>
          <AppMark product={next} className="sp-next-mark" />
          <span className="sp-next-what">{next.discipline}</span>
          <Arrow size={20} />
        </Link>
      </div>
    </article>
  )
}
