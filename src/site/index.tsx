import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { productBySlug, products, signIns, studio } from '../data/products'
import Home from './Home'
import { NotFound } from './NotFound'
import { BASE, ButtonLink, hueVars, Logo, ZMark } from './ui'
import './specimen.css'

const Catalogue = lazy(() => import('./Catalogue'))
const ProductPage = lazy(() => import('./ProductPage'))
const Plans = lazy(() => import('./Plans'))
const Privacy = lazy(() => import('./Privacy'))

/** The app whose own page (or plans page) is open, if any. */
function useRouteApp() {
  const { pathname } = useLocation()
  return productBySlug(pathname.match(/^\/work\/([^/]+)/)?.[1])
}

/** "Sign in" lists the apps people have accounts in; each link goes to that app's own sign-in page. */
function SignInMenu() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const away = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false)
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('pointerdown', away)
    window.addEventListener('keydown', esc)
    return () => {
      window.removeEventListener('pointerdown', away)
      window.removeEventListener('keydown', esc)
    }
  }, [open])
  if (!signIns.length) return null
  return (
    <div className="sp-signin" ref={ref}>
      <button type="button" className="sp-signin-btn" aria-expanded={open} aria-controls="sp-signin-list" onClick={() => setOpen((v) => !v)}>
        Sign in
        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true" focusable="false">
          <path d="M1.5 3.5 5 7l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      </button>
      <ul id="sp-signin-list" className="sp-signin-list" data-open={open || undefined} aria-label="Sign in to an app">
        {signIns.map((p) => (
          <li key={p.slug}>
            <a href={p.signIn} rel="noopener">
              <b>{p.name}</b>
              <span>{new URL(p.signIn!).host}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Header() {
  const [stuck, setStuck] = useState(false)
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  // One header for every page. It keeps the site's own look, except on an app's own pages, where it is that app's colour.
  const app = useRouteApp()

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
          <Link to="/#custom">Custom software</Link>
          <SignInMenu />
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
        {/* The same mark as the header, a little larger: the Z in a tile, then the name. */}
        <p className="sp-footer-brand">
          <span className="sp-footer-tile">
            <ZMark size={34} />
          </span>
          <span className="sp-footer-name">
            Zaylo<small>Labs</small>
          </span>
        </p>
        <div className="sp-footer-grid">
          <div>
            <p className="sp-body">{studio.line}</p>
            <address className="sp-contact">
              <a className="sp-link" href={studio.phone.href}>
                {studio.phone.label}
              </a>
              <span>
                {studio.address.map((l) => (
                  <span key={l}>{l}</span>
                ))}
              </span>
            </address>
          </div>
          <nav aria-label="Products" className="sp-footer-nav">
            <p className="sp-mono">Products</p>
            {products.map((p) => (
              <NavLink key={p.slug} className="sp-link" to={`${BASE}/work/${p.slug}`} viewTransition>
                {p.name}
              </NavLink>
            ))}
          </nav>
          <nav aria-label="Studio" className="sp-footer-nav">
            <p className="sp-mono">Studio</p>
            <Link className="sp-link" to="/#custom">
              Custom software
            </Link>
            <Link className="sp-link" to="/#contact">
              Contact
            </Link>
            <NavLink className="sp-link" to={`${BASE}/privacy`} viewTransition>
              Privacy
            </NavLink>
          </nav>
        </div>
        <p className="sp-mono sp-mono-dim sp-footer-end">
          © {new Date().getFullYear()} {studio.name} · {studio.domain}
        </p>
      </div>
    </footer>
  )
}

/** Scrolls to the #target of a link such as /#contact, also when it leads to another page. */
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
            <Route path="privacy" element={<Privacy />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
