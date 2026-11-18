/**
 * Privacy — what this website does with what a visitor gives it.
 * Every statement here describes how the site is actually built: it sets no
 * cookies, loads nothing from other companies, and stores nothing in the browser.
 * TODO(owner): read this before launch; it speaks for the studio.
 */
import { Link } from 'react-router-dom'
import { studio } from '../data/products'
import { useTitle } from './ui'

const SECTIONS = [
  {
    title: 'This website',
    body: 'This site sets no cookies and runs no analytics or tracking. It loads nothing from other companies, and it stores nothing in your browser.',
  },
  {
    title: 'The forms',
    body: 'The contact form and the request-access forms send what you type — your name, your email address and your message — to ZayloLabs, so that we can reply. We use it for that and nothing else. We do not sell it or pass it on.',
  },
  {
    title: 'The apps',
    body: 'Each of our apps has its own sign-in and keeps its own data. This page covers this website only.',
  },
]

export default function Privacy() {
  useTitle('Privacy')
  return (
    <div className="sp-wrap" style={{ paddingBlock: 'clamp(2rem, 5vw, 4.5rem) clamp(4rem, 8vw, 7rem)' }}>
      <p className="sp-mono sp-signal" style={{ margin: '0 0 1.2rem' }}>
        Privacy
      </p>
      <h1 className="sp-display" style={{ fontSize: 'clamp(2.8rem, 8vw, 7rem)' }}>
        What we do with <em>what you give us.</em>
      </h1>
      <dl className="sp-plain">
        {SECTIONS.map((s) => (
          <div key={s.title}>
            <dt>{s.title}</dt>
            <dd>{s.body}</dd>
          </div>
        ))}
        <div>
          <dt>Questions, or removal</dt>
          <dd>
            To ask what we hold about you, or to have it removed, use the{' '}
            <Link className="sp-link" to="/#contact">
              contact form
            </Link>{' '}
            or call{' '}
            <a className="sp-link" href={studio.phone.href}>
              {studio.phone.label}
            </a>
            .
          </dd>
        </div>
      </dl>
      <p className="sp-mono sp-mono-dim" style={{ marginTop: '2rem' }}>
        Last updated 18 November 2026
      </p>
    </div>
  )
}
