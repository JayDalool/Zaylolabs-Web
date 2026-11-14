/**
 * Concept 04 — Plain View.
 *
 * The middle ground between Specimen and Z-Axis: an ordinary page in plain
 * words, with one lit display case that holds the product screens in depth.
 * Everything a visitor needs is named on the first screen; nothing has to be
 * decoded or travelled to.
 */
import { lazy, Suspense, useEffect, useState } from 'react'
import { Link, Route, Routes, useLocation } from 'react-router-dom'
import { studio } from '../../data/products'
import Home from './Home'
import { PV, ZMark } from './ui'
import './pv.css'

const ProductPage = lazy(() => import('./Product'))

/** Which part of the site the visitor is in, so the menu can show it. */
function useCurrentSection() {
  const { pathname } = useLocation()
  const [current, setCurrent] = useState<string | null>(null)
  useEffect(() => {
    if (pathname.includes('/products/')) return setCurrent('products')
    const read = () => {
      let found: string | null = null
      for (const id of ['products', 'studio', 'contact']) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= 150) found = id
      }
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) found = 'contact'
      setCurrent(found)
    }
    read()
    window.addEventListener('scroll', read, { passive: true })
    return () => window.removeEventListener('scroll', read)
  }, [pathname])
  return current
}

function Header() {
  const current = useCurrentSection()
  const mark = (id: string) => (current === id ? ('location' as const) : undefined)
  return (
    <header className="pv-header">
      <div className="pv-wrap pv-header-in">
        <Link className="pv-brand" to={PV} aria-label="ZayloLabs — home">
          <ZMark />
          <span>ZayloLabs</span>
        </Link>
        <nav className="pv-nav" aria-label="Primary">
          <Link to={`${PV}#products`} aria-current={mark('products')}>
            Products
          </Link>
          <Link to={`${PV}#studio`} aria-current={mark('studio')}>
            Studio
          </Link>
          <Link className="pv-nav-cta" to={`${PV}#contact`} aria-current={mark('contact')}>
            Contact
          </Link>
        </nav>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="pv-footer">
      <div className="pv-wrap pv-footer-in">
        <p>
          <b>{studio.name}</b> · {studio.domain}
        </p>
        <nav aria-label="Footer">
          <Link to={`${PV}#products`}>Products</Link>
          <Link to={`${PV}#studio`}>Studio</Link>
          <Link to={`${PV}#contact`}>Contact</Link>
        </nav>
        <p className="pv-footer-note">Design prototype — not deployed</p>
      </div>
    </footer>
  )
}

export default function PlainView() {
  return (
    <div className="pv">
      <button type="button" className="pv-skip sr-only-focusable" onClick={() => document.getElementById('pv-main')?.focus()}>
        Skip to content
      </button>
      <Header />
      <main id="pv-main" tabIndex={-1}>
        <Suspense fallback={<div style={{ minHeight: '70vh' }} aria-busy="true" />}>
          <Routes>
            <Route index element={<Home />} />
            <Route path="products/:slug" element={<ProductPage />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
