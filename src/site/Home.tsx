import type { CSSProperties } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { compact, productBySlug, studio, type Product } from '../data/products'
import { useImmerse } from './immerse'
import { InquiryForm } from './inquiry'
import Landing from './landing/Landing'
import './landing/landing.css'
import { useSettle } from './landing/settle'
import { BASE, ButtonLink, hueVars, Reveal, SectionHead, StageBadge, useTitle } from './ui'

/** A product with a smaller presence: a short mention with the way in, not a full screen. */
function Also({ product }: { product: Product }) {
  const { ref, on } = useImmerse<HTMLElement>()
  return (
    <section
      ref={ref}
      id={product.slug}
      className="also sp-immersive sp-immersive-field"
      data-hue=""
      data-immersed={on || undefined}
      style={{ ...hueVars(product), scrollMarginTop: '4rem' } as CSSProperties}
      aria-labelledby={`${product.slug}-name`}
    >
      <div className="sp-wrap also-grid">
        <div className="also-copy">
          <p className="sp-mono app-kicker">
            <span className="app-kicker-n">Also from the studio</span>
            <span className="sp-mono-dim">{product.discipline}</span>
          </p>
          <h2 id={`${product.slug}-name`} className="sp-name also-name">
            {product.name}
          </h2>
          <p className="app-tagline">{product.tagline}</p>
          <p className="app-summary">{product.summary}</p>
          <p className="app-status">
            <StageBadge product={product} />
            <span>{product.availability}</span>
            {product.stage === 'live' && (
              <Link className="sp-link app-plans" to={`${BASE}/work/${product.slug}/plans`} viewTransition>
                Access and pricing
              </Link>
            )}
          </p>
          <div className="app-go">
            <ButtonLink to={`${BASE}/work/${product.slug}`}>Open {product.name}</ButtonLink>
            <ButtonLink ghost to={`${BASE}/work/${product.slug}#demo`}>
              Watch the demo
            </ButtonLink>
          </div>
        </div>
        <ul className="also-covers" aria-label="What it covers">
          {product.focus.map((f, i) => (
            <li key={f.title}>
              <span className="sp-mono">{String(i + 1).padStart(2, '0')}</span>
              <b>{f.title}</b>
              <span>{f.note}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/** What the studio builds for clients. Each line points at one of our own apps as the proof. */
function Custom() {
  return (
    <section id="custom" className="sp-section" style={{ scrollMarginTop: '4rem' }} aria-labelledby="custom-h">
      <div className="sp-wrap">
        <SectionHead
          label="Custom software"
          title={
            <span id="custom-h">
              Need software of your own? <em>We build it.</em>
            </span>
          }
        >
          <p className="sp-lede" style={{ maxWidth: '38em' }}>
            The studio that builds and runs these apps also builds software for clients. Tell us the problem, and we design and build the software for it.
          </p>
        </SectionHead>
        <Reveal>
          <ol className="sp-practice">
            {studio.builds.map((s, i) => (
              <li key={s.title}>
                <span className="sp-mono sp-signal">{String(i + 1).padStart(2, '0')}</span>
                <h3>{s.title}</h3>
                <p>
                  {s.note}{' '}
                  <Link className="sp-link" to={`${BASE}/work/${s.proof}`} viewTransition>
                    {s.proofLine}
                  </Link>
                </p>
              </li>
            ))}
          </ol>
        </Reveal>
        <div className="sp-custom-foot">
          <p className="sp-body">
            We build with our own {productBySlug('commandcenter')?.name}: AI agents do the engineering, and a person reviews and approves what ships.
          </p>
          <ButtonLink to="/?about=custom#contact" viewTransition={false}>
            Start a project
          </ButtonLink>
        </div>
      </div>
    </section>
  )
}

const REAL = [
  { title: 'Real screenshots', body: 'Every screenshot is the working app, captured with made-up sample data.' },
  { title: 'Demos say they are demos', body: 'The step-by-step demos are redrawn from the real screens so you can follow along. Each one is labelled.' },
  { title: 'No private data', body: 'No customer information appears anywhere on this site.' },
]

function Real() {
  return (
    <section className="sp-section sp-dark" style={{ borderTop: 0 }} aria-labelledby="real-h">
      <div className="sp-wrap">
        <SectionHead
          label="Shown as it is"
          title={
            <span id="real-h">
              What you see here <em>is real.</em>
            </span>
          }
        />
        <div className="sp-rules">
          {REAL.map((r, i) => (
            <Reveal key={r.title} delay={i * 0.08}>
              <article>
                <h3 className="sp-h3" style={{ marginBottom: '0.7rem' }}>
                  {r.title}
                </h3>
                <p className="sp-body">{r.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function Contact() {
  // a link such as /?about=custom#contact opens the form on that topic
  const about = useSearchParams()[0].get('about') ?? undefined
  return (
    <section id="contact" className="sp-section" style={{ borderTop: 0, scrollMarginTop: '4rem' }} aria-labelledby="contact-h">
      <div className="sp-wrap sp-grid" style={{ rowGap: '2rem', alignItems: 'start' }}>
        <div className="col-span-12 lg:col-span-6">
          <p className="sp-mono sp-signal" style={{ margin: '0 0 1.5rem' }}>
            Contact
          </p>
          <h2 id="contact-h" className="sp-display" style={{ fontSize: 'clamp(2.6rem, 6.4vw, 6.4rem)' }}>
            Have a problem worth <em>building for?</em>
          </h2>
          <p className="sp-body" style={{ marginTop: '1.4rem', maxWidth: '30em' }}>
            Ask about one of our apps, or tell us what you need built. We reply by email.
          </p>
          <address className="sp-contact">
            <a className="sp-link" href={studio.phone.href}>
              {studio.phone.label}
            </a>
            <span>
              {studio.name}
              {studio.address.map((l) => (
                <span key={l}>{l}</span>
              ))}
            </span>
          </address>
        </div>
        <div className="col-span-12 lg:col-span-5 lg:col-start-8">
          <InquiryForm key={about} kind="contact" about={about} />
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  useSettle()
  useTitle()
  return (
    <>
      <Landing />
      {compact.map((p) => (
        <Also key={p.slug} product={p} />
      ))}
      <Custom />
      <Real />
      <Contact />
    </>
  )
}
