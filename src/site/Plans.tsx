/**
 * Plans page — one template for every Live product.
 *
 * It says how access works today and holds the place where plans and checkout
 * will go. No plan name or price is invented: until `plans` in products.ts has
 * tiers, the page shows marked empty slots.
 */
import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { plans, productBySlug } from '../data/products'
import { useImmerse } from './immerse'
import { BASE, ButtonLink, hueVars, SectionHead, StageBadge, Tag } from './ui'

const STEPS = [
  { title: 'Ask about access', note: 'Tell us who you are and what you would use it for.' },
  { title: 'We reply', note: 'Access is by invitation, and it is not open to everyone yet. We will say plainly whether it is possible today.' },
  { title: 'Plans follow', note: 'Plans and prices have not been published yet. They will appear on this page.' },
]

export default function Plans() {
  const { slug } = useParams()
  const product = productBySlug(slug)
  useEffect(() => {
    if (product) document.title = `${product.name} plans — ZayloLabs (prototype)`
    return () => void (document.title = 'ZayloLabs — design prototype')
  }, [product])
  const { ref } = useImmerse<HTMLElement>()

  if (!product || product.stage !== 'live') {
    return (
      <div className="sp-wrap" style={{ paddingBlock: '6rem', minHeight: '60vh' }}>
        <h1 className="sp-h2">There are no plans at that address.</h1>
        <p className="sp-body" style={{ marginTop: '1rem' }}>
          <Link className="sp-link" to={`${BASE}/work`}>
            Back to all products
          </Link>
        </p>
      </div>
    )
  }
  const tiers = plans[product.slug]?.tiers ?? []

  return (
    <article key={product.slug} ref={ref} className="sp-immersive sp-immersive-field sp-product" data-hue="" data-immersed="" style={hueVars(product)}>
      <header className="sp-wrap" style={{ paddingBlock: 'clamp(1.5rem, 4vw, 3.5rem) clamp(2rem, 4vw, 3.5rem)' }}>
        <nav aria-label="Breadcrumb" className="sp-mono" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginBottom: 'clamp(1.5rem, 4vw, 3rem)' }}>
          <Link className="sp-link" to={`${BASE}/work`} viewTransition>
            Products
          </Link>
          <span className="sp-mono-dim">/</span>
          <Link className="sp-link" to={`${BASE}/work/${product.slug}`} viewTransition>
            {product.name}
          </Link>
          <span className="sp-mono-dim">/</span>
          <span style={{ color: 'var(--hue-ink)' }}>Plans</span>
        </nav>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.2rem' }}>
          <Tag>{product.discipline}</Tag>
          <StageBadge product={product} />
        </div>
        <h1 className="sp-display" style={{ fontSize: 'clamp(2.6rem, 7vw, 6.5rem)' }}>
          {product.name} <em>plans.</em>
        </h1>
        <p className="sp-lede" style={{ marginTop: 'clamp(1rem, 2vw, 1.6rem)', maxWidth: '36em' }}>
          {product.name} is live and in use, but it is not open for sign-up. Access is by invitation while plans are being set.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginTop: '1.6rem' }}>
          <ButtonLink to="/#contact" viewTransition={false}>
            Request access
          </ButtonLink>
          <ButtonLink ghost to={`${BASE}/work/${product.slug}`}>
            Back to {product.name}
          </ButtonLink>
        </div>
      </header>

      <section className="sp-section" aria-labelledby="access-h">
        <div className="sp-wrap">
          <SectionHead
            label="Access"
            title={
              <span id="access-h">
                How access works <em>today.</em>
              </span>
            }
          />
          <ol className="pl-steps">
            {STEPS.map((s, i) => (
              <li key={s.title}>
                <span className="sp-mono sp-signal">{String(i + 1).padStart(2, '0')}</span>
                <h3>{s.title}</h3>
                <p>{s.note}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="sp-section" aria-labelledby="plans-h">
        <div className="sp-wrap">
          <SectionHead
            label="Plans"
            title={
              <span id="plans-h">
                Plans and <em>prices.</em>
              </span>
            }
          />
          {tiers.length ? (
            <ul className="pl-tiers">
              {tiers.map((t) => (
                <li key={t.name} className="pl-tier">
                  <h3>{t.name}</h3>
                  <p className="pl-price">
                    <b>{t.price}</b> <span>{t.period}</span>
                  </p>
                  <ul>
                    {t.includes.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          ) : (
            <>
              <p className="sp-body" style={{ maxWidth: '40em', marginBottom: '1.4rem' }}>
                No plan has been published yet. The spaces below are where each plan’s name, price and contents will go.
              </p>
              <ul className="pl-tiers" aria-label="Plans to be announced">
                {[1, 2, 3].map((n) => (
                  <li key={n} className="pl-tier" data-empty="">
                    <p className="sp-mono">Plan {n}</p>
                    <h3>To be announced</h3>
                    <p className="pl-price">
                      <b>—</b> <span>price to follow</span>
                    </p>
                    <p className="pl-empty-note">Name, price and what it includes will appear here.</p>
                  </li>
                ))}
              </ul>
            </>
          )}
          <p className="pl-pay">
            <b>Paying.</b> Online payment is not set up yet. When plans are published, checkout will open from this page.
          </p>
        </div>
      </section>
    </article>
  )
}
