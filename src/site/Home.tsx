import { Link, useSearchParams } from 'react-router-dom'
import { studio } from '../data/products'
import LandingA from './landing/LandingA'
import LandingB from './landing/LandingB'
import { LandingSwitch, type LandingKey } from './landing/LandingSwitch'
import './landing/landing.css'
import { useSettle } from './landing/settle'
import { BASE, Reveal, SectionHead } from './ui'

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
    body: 'Every image here is either a genuine capture of working software or a placeholder marked as one. No invented mockups.',
  },
  {
    title: 'Status, stated plainly',
    body: 'In development, internal and prototype mean exactly that. Nothing is presented as more finished or more available than it is.',
  },
  {
    title: 'Private stays private',
    body: 'No customer information, credentials or internal operational detail appears in any capture.',
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

function Contact() {
  return (
    <section id="contact" className="sp-section" style={{ borderTop: 0, scrollMarginTop: '4rem' }} aria-labelledby="contact-h">
      <div className="sp-wrap sp-grid" style={{ rowGap: '2rem', alignItems: 'end' }}>
        <div className="col-span-12 lg:col-span-8">
          <p className="sp-mono sp-signal" style={{ margin: '0 0 1.5rem' }}>
            Contact
          </p>
          <h2 id="contact-h" className="sp-display" style={{ fontSize: 'clamp(2.8rem, 8vw, 8rem)' }}>
            Have a problem worth <em>building for?</em>
          </h2>
        </div>
        <div className="col-span-12 lg:col-span-4" style={{ display: 'grid', gap: '1.2rem' }}>
          <p className="sp-body">
            Alongside its own products, ZayloLabs is preparing to take on custom software development: applications, AI-powered tools and business automation.
          </p>
          {studio.contactEmail ? (
            <a className="sp-btn" href={`mailto:${studio.contactEmail}`} style={{ width: 'fit-content' }}>
              {studio.contactEmail}
            </a>
          ) : (
            <p className="sp-mono" style={{ margin: 0, padding: '0.9rem 1rem', border: '1px dashed var(--rule-2)', lineHeight: 1.7 }}>
              <span className="sp-signal">Prototype</span> — contact channel is wired in at launch.
              <br />
              <span className="sp-mono-dim">{studio.domain}</span>
            </p>
          )}
          <Link className="sp-link" to={`${BASE}/work`} viewTransition style={{ width: 'fit-content' }}>
            Or see all products first
          </Link>
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  // Two versions of the landing are kept side by side for review; `?landing=a` selects the showpiece.
  const [params, setParams] = useSearchParams()
  const landing: LandingKey = params.get('landing') === 'a' ? 'a' : 'b'
  useSettle()
  return (
    <>
      {landing === 'a' ? <LandingA /> : <LandingB />}
      <Practice />
      <Rules />
      <Contact />
      <LandingSwitch
        value={landing}
        onChange={(v) => {
          setParams(v === 'a' ? { landing: 'a' } : {}, { replace: true })
          window.scrollTo({ top: 0 })
        }}
      />
    </>
  )
}
