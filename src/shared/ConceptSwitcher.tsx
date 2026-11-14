import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './switcher.css'

export const concepts = [
  { id: '01', name: 'Specimen', path: '/specimen', swatch: '#f1ede3', ink: '#e8431c' },
  { id: '02', name: 'Z-Axis', path: '/z-axis', swatch: '#07080a', ink: '#d8ff45' },
  { id: '03', name: 'Studio OS', path: '/studio-os', swatch: '#2233e6', ink: '#ffd84a' },
  { id: '04', name: 'Plain View', path: '/plain-view', swatch: '#f3f4f0', ink: '#0a0d13' },
] as const

/**
 * Review-only chrome: lets you hop between the concepts and the
 * comparison page. Not part of any design — remove before production.
 */
export function ConceptSwitcher() {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(true)
  if (pathname === '/') return null
  return (
    <nav className={`cs ${open ? 'is-open' : ''}`} aria-label="Concept review switcher">
      <button className="cs-toggle" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-label={open ? 'Collapse concept switcher' : 'Expand concept switcher'}>
        <span aria-hidden="true">{open ? '×' : '◐'}</span>
      </button>
      {open && (
        <>
          <Link className="cs-link" to="/">
            Compare
          </Link>
          {concepts.map((c) => {
            const active = pathname.startsWith(c.path)
            return (
              <Link key={c.id} className={`cs-link ${active ? 'is-active' : ''}`} to={c.path} aria-current={active ? 'page' : undefined}>
                <i style={{ background: c.swatch, boxShadow: `inset 0 0 0 3px ${c.swatch}, inset 0 0 0 9px ${c.ink}` }} aria-hidden="true" />
                <span className="cs-id">{c.id}</span>
                <span className="cs-name">{c.name}</span>
              </Link>
            )
          })}
        </>
      )}
    </nav>
  )
}
