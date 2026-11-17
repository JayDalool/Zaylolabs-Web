import { Link } from 'react-router-dom'
import type { CSSProperties } from 'react'
import { compact, studio, type Product } from '../data/products'
import { useImmerse } from './immerse'
import { InquiryForm } from './inquiry'
import Landing from './landing/Landing'
import './landing/landing.css'
import { useSettle } from './landing/settle'
import { BASE, ButtonLink, hueVars, Reveal, SectionHead, StageBadge } from './ui'

/* ——————————————————————————— studio ——————————————————————————— */

function Practice() {
  return (
    <section id="studio" className="sp-section" style={{ scrollMarginTop: '4rem' }} aria-labelledby="practice-h">
      <div className="sp-wrap">
        <SectionHead
          label="Practice"
          title={
            <span id="practice-h">
              What the lab <em>builds.</em>
            </span>
          }
        />
        <Reveal>
          <ol className="sp-practice">
            {studio.practice.map((s, i) => (
              <li key={s.title}>
                <span className="sp-mono sp-signal">{String(i + 1).padStart(2, '0')}</span>
                <h3>{s.title}</h3>
                <p>{s.note}</p>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  )
}

const RULES = [
  {
    title: 'Real interfaces only',
    body: 'Screenshots are genuine captures of the working apps, taken with made-up sample data. Step-by-step demos are redrawn illustrations, and say so.',
  },
  {
    title: 'Status, stated plainly',
    body: 'Live means running and in use today, with access by invitation until plans are published. Nothing is presented as more available than it is.',
  },
  {
    title: 'Private stays private',
    body: 'No customer information, credentials or internal operational detail appears in any screenshot or demo.',
  },
]

function Rules() {
  return (
    <section className="sp-section sp-dark" style={{ borderTop: 0 }} aria-labelledby="rules-h">
      <div className="sp-wrap">
        <SectionHead
          label="House rules"
          title={
            <span id="rules-h">
              Three rules for everything <em>shown here.</em>
            </span>
          }
        />
        <div className="sp-rules">
          {RULES.map((r, i) => (
            <Reveal key={r.title} delay={i * 0.08}>
              <article>
                <p className="sp-mono sp-signal" style={{ margin: '0 0 1.4rem' }}>
                  Rule {String(i + 1).padStart(2, '0')}
                </p>
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

/** A product with a smaller presence: a short mention with the way in, not a full screen. */
function Also({ product }: { product: Product }) {
  const { ref, on } = useImmerse<HTMLElement>(product.slug)
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
                Plans
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

function Contact() {
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
            Ask about one of our apps, or tell us what you need built. Alongside its own products, ZayloLabs is preparing to take on custom software development.
          </p>
        </div>
        <div className="col-span-12 lg:col-span-5 lg:col-start-8">
          <InquiryForm kind="contact" />
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  useSettle()
  return (
    <>
      <Landing />
      {compact.map((p) => (
        <Also key={p.slug} product={p} />
      ))}
      <Practice />
      <Rules />
      <Contact />
    </>
  )
}
