import { lazy, Suspense, useEffect, useState } from 'react'
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { productBySlug, products, studio } from '../data/products'
import { useCurrentApp } from './immerse'
import Home from './Home'
import { BASE, ButtonLink, hueVars, Logo } from './ui'
import './specimen.css'

const Catalogue = lazy(() => import('./Catalogue'))
const ProductPage = lazy(() => import('./ProductPage'))
const Plans = lazy(() => import('./Plans'))
const System = lazy(() => import('./System'))

/** The app whose own page (or plans page) is open, if any. */
function useRouteApp() {
  const { pathname } = useLocation()
  return productBySlug(pathname.match(/^\/work\/([^/]+)/)?.[1])
}

function Header() {
  const [stuck, setStuck] = useState(false)
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  // On an app's own pages the header is that app's; elsewhere it follows the section on screen.
  const here = useCurrentApp()
  const app = useRouteApp() ?? productBySlug(here ?? undefined)

  useEffect(() => {
    const on = () => setStuck(window.scrollY > 8)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  useEffect(() => setOpen(false), [pathname])
  useEffect(() => {
    if (!open) return
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.documentElement.style.overflow = 'hidden'
    window.addEventListener('keydown', esc)
    return () => {
      document.documentElement.style.overflow = ''
      window.removeEventListener('keydown', esc)
    }
  }, [open])

  return (
    <header className={`sp-header sp-immersive ${stuck || open ? 'is-stuck' : ''}`} data-hue={app ? '' : undefined} data-immersed={app ? '' : undefined} style={app ? hueVars(app) : undefined}>
      <div className="sp-wrap sp-header-in">
        <Logo />
        <button className="sp-menu-btn" aria-expanded={open} aria-controls="sp-nav" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen((v) => !v)}>
          <span />
          <span />
        </button>
        {/* Close on any link, including ones that stay on the current page (e.g. Contact on the homepage). */}
        <nav id="sp-nav" className={`sp-nav ${open ? 'is-open' : ''}`} aria-label="Primary" onClick={(e) => (e.target as HTMLElement).closest('a') && setOpen(false)}>
          <NavLink to={`${BASE}/work`}>Products</NavLink>
          <Link to="/#studio">Studio</Link>
          <ButtonLink to="/#contact" viewTransition={false}>Contact</ButtonLink>
        </nav>
      </div>
    </header>
  )
}

function Footer() {
  const app = useRouteApp()
  return (
    <footer className="sp-footer sp-immersive" data-hue={app ? '' : undefined} data-immersed={app ? '' : undefined} style={app ? hueVars(app) : undefined}>
      <div className="sp-wrap">
        <p className="sp-footer-word" aria-hidden="true">
          Zaylo<em>Labs</em>
        </p>
        <div className="sp-grid" style={{ rowGap: '1.5rem', marginTop: 'clamp(2rem,4vw,3.5rem)' }}>
          <p className="sp-body" style={{ gridColumn: '1 / -1', maxWidth: '30em' }}>
            {studio.line} {studio.domain}
          </p>
          <nav aria-label="Footer" className="sp-mono" style={{ gridColumn: '1 / -1', display: 'flex', flexWrap: 'wrap', gap: '0.6rem 1.8rem' }}>
            <NavLink className="sp-link" to={`${BASE}/work`} viewTransition>
              Products
            </NavLink>
            {products.map((p) => (
              <NavLink key={p.slug} className="sp-link" to={`${BASE}/work/${p.slug}`} viewTransition>
                {p.name}
              </NavLink>
            ))}
            <NavLink className="sp-link" to={`${BASE}/system`} viewTransition>
              Design system
            </NavLink>
            <span className="sp-mono-dim">Design prototype — not deployed</span>
          </nav>
        </div>
      </div>
    </footer>
  )
}

/** Scrolls to #hash targets inside the hash router (e.g. /specimen#contact). */
function useAnchorScroll() {
  const { hash, pathname } = useLocation()
  useEffect(() => {
    if (!hash) return
    const el = document.getElementById(hash.slice(1))
    if (el) requestAnimationFrame(() => el.scrollIntoView({ block: 'start' }))
  }, [hash, pathname])
}

export default function Specimen() {
  useAnchorScroll()
  return (
    <div className="sp">
      <button
        className="sr-only-focusable sp-btn"
        style={{ position: 'fixed', top: 8, left: 8, zIndex: 100 }}
        onClick={() => document.getElementById('sp-main')?.focus()}
      >
        Skip to content
      </button>
      <Header />
      <main id="sp-main" tabIndex={-1} style={{ outline: 'none' }}>
        <Suspense fallback={<div style={{ minHeight: '100dvh' }} aria-busy="true" />}>
          <Routes>
            <Route index element={<Home />} />
            <Route path="work" element={<Catalogue />} />
            <Route path="work/:slug" element={<ProductPage />} />
            <Route path="work/:slug/plans" element={<Plans />} />
            <Route path="system" element={<System />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
