/**
 * Access and pricing — one template for every Live product.
 *
 * It says how access works today and takes the request. No plan or price is
 * invented: pricing is given on request until plans are published here.
 * TODO(launch): attach hosted checkout (Stripe, PayPal) once plans exist.
 */
import { Link, useParams } from 'react-router-dom'
import { productBySlug } from '../data/products'
import { useImmerse } from './immerse'
import { InquiryForm } from './inquiry'
import { NotFound } from './NotFound'
import { BASE, ButtonLink, hueVars, SectionHead, useTitle } from './ui'

export default function Plans() {
  const { slug } = useParams()
  const product = productBySlug(slug)
  useTitle(product ? `${product.name} — access and pricing` : 'Not found')
  const { ref } = useImmerse<HTMLElement>()

  if (!product || product.stage !== 'live') return <NotFound />
  // a personal build is honest about not being open; the rest are by invitation
  const open = !product.compact
  const steps = [
    { title: 'Request access', note: 'Leave your name and email below.' },
    {
      title: 'We contact you',
      note: open ? 'Access is by invitation. We reply by email and say plainly whether it is possible today.' : `${product.name} is not open to others yet. We reply by email and tell you if that changes.`,
    },
    { title: 'Pricing on request', note: 'We tell you the price when we reply. Plans will be published on this page.' },
  ]

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
          <span style={{ color: 'var(--hue-ink)' }}>Access and pricing</span>
        </nav>
        <h1 className="sp-display" style={{ fontSize: 'clamp(2.6rem, 7vw, 6.5rem)' }}>
          {product.name}: <em>access and pricing.</em>
        </h1>
        <p className="sp-lede" style={{ marginTop: 'clamp(1rem, 2vw, 1.6rem)', maxWidth: '36em' }}>
          {open
            ? `${product.name} is live and in use. It is not open for sign-up: access is by invitation, and pricing is given when we talk.`
            : `${product.name} is live as a personal build. It is not open to others yet. Leave your details and we will tell you if that changes.`}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginTop: '1.6rem' }}>
          <ButtonLink to="#access" viewTransition={false}>
            Request access
          </ButtonLink>
          <ButtonLink ghost to={`${BASE}/work/${product.slug}`}>
            Back to {product.name}
          </ButtonLink>
        </div>
      </header>

      <section className="sp-section" aria-labelledby="how-h">
        <div className="sp-wrap">
          <SectionHead
            label="How it works"
            title={
              <span id="how-h">
                Three steps, <em>by invitation.</em>
              </span>
            }
          />
          <ol className="pl-steps">
            {steps.map((s, i) => (
              <li key={s.title}>
                <span className="sp-mono sp-signal">{String(i + 1).padStart(2, '0')}</span>
                <h3>{s.title}</h3>
                <p>{s.note}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="access" className="sp-section" style={{ scrollMarginTop: '4rem' }} aria-labelledby="request-h">
        <div className="sp-wrap">
          <SectionHead
            label="Request access"
            title={
              <span id="request-h">
                Leave your name <em>and email.</em>
              </span>
            }
          />
          <InquiryForm kind="access" product={product} />
          {product.signIn && (
            <p className="sp-body" style={{ marginTop: '1.6rem' }}>
              Already have an account?{' '}
              <a className="sp-link" href={product.signIn} rel="noopener">
                Sign in to {product.name}
              </a>
            </p>
          )}
        </div>
      </section>
    </article>
  )
}
